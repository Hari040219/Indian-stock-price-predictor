"""
SensexAI — LSTM-powered ML Service
Provides technical analysis, trading signals, and 5-day price forecasts.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
import yfinance as yf
import ta
import json
import os
import pickle
import hashlib
from functools import lru_cache

# TensorFlow — suppress info logs
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
import tensorflow as tf
from tensorflow import keras
from sklearn.preprocessing import MinMaxScaler

app = FastAPI(title="SensexAI ML Service", version="2.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── In-memory cache (30-minute TTL) ──────────────────────────────────────────
_cache: dict = {}
CACHE_TTL_SECONDS = 1800  # 30 minutes


def _cache_key(ticker: str) -> str:
    return ticker.upper().strip()


def _get_cached(ticker: str):
    key = _cache_key(ticker)
    if key in _cache:
        entry = _cache[key]
        if (datetime.utcnow() - entry["time"]).total_seconds() < CACHE_TTL_SECONDS:
            return entry["data"]
        del _cache[key]
    return None


def _set_cache(ticker: str, data: dict):
    _cache[_cache_key(ticker)] = {"data": data, "time": datetime.utcnow()}


# ─── Response models ──────────────────────────────────────────────────────────

class ForecastDay(BaseModel):
    day: int
    date: str
    price: float


class HistoryPoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class PredictionResponse(BaseModel):
    ticker: str
    company_name: str
    current_price: float
    predicted_price: float
    predicted_change_pct: float
    direction: str          # BULLISH / BEARISH / NEUTRAL
    signal: str             # BUY / SELL / HOLD
    confidence: float       # 0-100
    rsi: float
    macd: float
    macd_signal: float
    ema9: float
    ema21: float
    ema50: float
    bollinger_upper: float
    bollinger_lower: float
    atr: float
    support: float
    resistance: float
    stop_loss: float
    target: float
    volatility: str         # LOW / MEDIUM / HIGH
    forecast: List[ForecastDay]
    history: List[HistoryPoint]
    last_updated: str


# ─── Helper functions ──────────────────────────────────────────────────────────

def compute_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Add technical indicators to OHLCV DataFrame."""
    close = df["Close"]
    high = df["High"]
    low = df["Low"]
    vol = df["Volume"]

    # RSI
    df["RSI"] = ta.momentum.RSIIndicator(close, window=14).rsi()

    # MACD
    macd_ind = ta.trend.MACD(close, window_slow=26, window_fast=12, window_sign=9)
    df["MACD"] = macd_ind.macd()
    df["MACD_signal"] = macd_ind.macd_signal()
    df["MACD_hist"] = macd_ind.macd_diff()

    # EMAs
    df["EMA9"] = ta.trend.EMAIndicator(close, window=9).ema_indicator()
    df["EMA21"] = ta.trend.EMAIndicator(close, window=21).ema_indicator()
    df["EMA50"] = ta.trend.EMAIndicator(close, window=50).ema_indicator()

    # Bollinger Bands
    bb = ta.volatility.BollingerBands(close, window=20, window_dev=2)
    df["BB_upper"] = bb.bollinger_hband()
    df["BB_lower"] = bb.bollinger_lband()

    # ATR
    df["ATR"] = ta.volatility.AverageTrueRange(high, low, close, window=14).average_true_range()

    # Volume SMA
    df["Vol_SMA"] = vol.rolling(window=20).mean()

    return df


def find_support_resistance(df: pd.DataFrame, lookback: int = 30) -> tuple:
    """Find support and resistance from recent swing highs/lows."""
    recent = df.tail(lookback)
    highs = recent["High"].values
    lows = recent["Low"].values

    # Simple approach: use rolling min/max
    resistance = float(np.max(highs))
    support = float(np.min(lows))

    # Refine: find the most recent local high/low
    if len(highs) >= 5:
        for i in range(len(highs) - 3, 0, -1):
            if highs[i] > highs[i - 1] and highs[i] > highs[i + 1]:
                resistance = float(highs[i])
                break
        for i in range(len(lows) - 3, 0, -1):
            if lows[i] < lows[i - 1] and lows[i] < lows[i + 1]:
                support = float(lows[i])
                break

    return support, resistance


def generate_signal(rsi: float, macd: float, macd_sig: float,
                    price: float, ema9: float, ema21: float,
                    predicted_change: float) -> tuple:
    """Generate BUY/SELL/HOLD signal with confidence score."""
    score = 0  # Range: -5 to +5

    # RSI signal
    if rsi < 30:
        score += 2  # Oversold → bullish
    elif rsi < 40:
        score += 1
    elif rsi > 70:
        score -= 2  # Overbought → bearish
    elif rsi > 60:
        score -= 1

    # MACD crossover
    if macd > macd_sig:
        score += 1
    else:
        score -= 1

    # MACD momentum
    if macd > 0:
        score += 0.5
    else:
        score -= 0.5

    # Price vs EMA
    if price > ema9 > ema21:
        score += 1  # Bullish trend
    elif price < ema9 < ema21:
        score -= 1  # Bearish trend

    # LSTM prediction direction
    if predicted_change > 1.0:
        score += 1.5
    elif predicted_change > 0:
        score += 0.5
    elif predicted_change < -1.0:
        score -= 1.5
    else:
        score -= 0.5

    # Determine signal
    if score >= 2:
        signal = "BUY"
        direction = "BULLISH"
    elif score <= -2:
        signal = "SELL"
        direction = "BEARISH"
    else:
        signal = "HOLD"
        direction = "NEUTRAL"

    # Confidence: normalize score to 0–100
    confidence = min(100, max(0, (abs(score) / 6.0) * 100))

    return signal, direction, round(confidence, 1)


def classify_volatility(atr: float, price: float) -> str:
    """Classify volatility based on ATR as percentage of price."""
    atr_pct = (atr / price) * 100
    if atr_pct < 1.5:
        return "LOW"
    elif atr_pct < 3.0:
        return "MEDIUM"
    else:
        return "HIGH"


# ─── LSTM Training & Prediction ───────────────────────────────────────────────

def build_lstm_model(input_shape: tuple) -> keras.Model:
    """Build a simple 2-layer LSTM model."""
    model = keras.Sequential([
        keras.layers.LSTM(64, return_sequences=True, input_shape=input_shape),
        keras.layers.Dropout(0.2),
        keras.layers.LSTM(32, return_sequences=False),
        keras.layers.Dropout(0.2),
        keras.layers.Dense(16, activation="relu"),
        keras.layers.Dense(1)
    ])
    model.compile(optimizer="adam", loss="mse")
    return model


def train_and_predict(df: pd.DataFrame, forecast_days: int = 5) -> tuple:
    """
    Train LSTM on OHLCV + indicators and predict next N days.
    Returns (predicted_prices: list[float], model_confidence: float)
    """
    # Features to use
    feature_cols = ["Close", "RSI", "MACD", "EMA9", "EMA21", "ATR"]
    available = [c for c in feature_cols if c in df.columns]
    data = df[available].dropna().values

    if len(data) < 80:
        # Not enough data for LSTM — fallback to simple prediction
        last_price = data[-1, 0]
        preds = []
        for i in range(forecast_days):
            change = np.random.uniform(-0.01, 0.01)
            last_price = last_price * (1 + change)
            preds.append(round(float(last_price), 2))
        return preds, 35.0

    # Scale features
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled = scaler.fit_transform(data)

    # Create sequences of 60 days
    look_back = 60
    X, y = [], []
    for i in range(look_back, len(scaled)):
        X.append(scaled[i - look_back:i])
        y.append(scaled[i, 0])  # Predict close price (first column)

    X, y = np.array(X), np.array(y)

    if len(X) < 10:
        last_price = data[-1, 0]
        preds = []
        for i in range(forecast_days):
            change = np.random.uniform(-0.01, 0.01)
            last_price = last_price * (1 + change)
            preds.append(round(float(last_price), 2))
        return preds, 35.0

    # Split: use all for training (we're predicting future, not evaluating)
    X_train, y_train = X, y

    # Build and train model
    model = build_lstm_model((X_train.shape[1], X_train.shape[2]))
    model.fit(X_train, y_train, epochs=25, batch_size=16, verbose=0)

    # Predict next N days iteratively
    last_sequence = scaled[-look_back:].copy()
    predictions_scaled = []

    for _ in range(forecast_days):
        input_seq = last_sequence.reshape(1, look_back, len(available))
        pred_scaled = model.predict(input_seq, verbose=0)[0, 0]
        predictions_scaled.append(pred_scaled)

        # Shift the window: append prediction, remove oldest
        new_row = last_sequence[-1].copy()
        new_row[0] = pred_scaled  # Update close price
        last_sequence = np.vstack([last_sequence[1:], new_row])

    # Inverse transform predictions (only the close price column)
    dummy = np.zeros((len(predictions_scaled), len(available)))
    dummy[:, 0] = predictions_scaled
    inversed = scaler.inverse_transform(dummy)
    predicted_prices = [round(float(p), 2) for p in inversed[:, 0]]

    # Compute model confidence from training loss
    train_loss = model.evaluate(X_train, y_train, verbose=0)
    # Lower loss = higher confidence, map MSE to a 0-100 score
    confidence = max(30, min(90, 100 - (train_loss * 500)))

    return predicted_prices, round(float(confidence), 1)


# ─── API Endpoints ─────────────────────────────────────────────────────────────

@app.get("/predict/{ticker}", response_model=PredictionResponse)
async def predict(ticker: str):
    """Main prediction endpoint — returns full analysis for a stock ticker."""
    # Auto-append .NS for Indian stocks if no exchange suffix provided
    original_ticker = ticker.upper().strip()
    if "." not in original_ticker:
        # Try NSE first, then BSE
        for suffix in [".NS", ".BO"]:
            test_ticker = original_ticker + suffix
            test_stock = yf.Ticker(test_ticker)
            test_df = test_stock.history(period="5d", interval="1d")
            if not test_df.empty:
                ticker = test_ticker
                break
        else:
            raise HTTPException(status_code=400, detail=f"Could not find '{original_ticker}' on NSE or BSE. Try adding .NS or .BO suffix.")

    # Check cache first
    cached = _get_cached(ticker)
    if cached:
        return PredictionResponse(**cached)

    try:
        # Fetch 1 year of daily data
        stock = yf.Ticker(ticker)
        df = stock.history(period="1y", interval="1d")

        if df.empty or len(df) < 30:
            raise ValueError(f"Not enough data for ticker '{ticker}'. Make sure it's a valid NSE/BSE ticker (e.g. RELIANCE.NS)")

        # Get company name
        try:
            info = stock.info
            company_name = info.get("shortName", info.get("longName", ticker))
        except Exception:
            company_name = ticker

        # Flatten multi-level columns if needed (yfinance sometimes returns multi-index)
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)

        # Ensure numeric
        for col in ["Open", "High", "Low", "Close", "Volume"]:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        df = df.dropna(subset=["Close"])

        # Compute technical indicators
        df = compute_indicators(df)

        # Get latest values
        latest = df.iloc[-1]
        current_price = round(float(latest["Close"]), 2)
        rsi = round(float(latest["RSI"]), 2) if not pd.isna(latest["RSI"]) else 50.0
        macd = round(float(latest["MACD"]), 2) if not pd.isna(latest["MACD"]) else 0.0
        macd_signal_val = round(float(latest["MACD_signal"]), 2) if not pd.isna(latest["MACD_signal"]) else 0.0
        ema9 = round(float(latest["EMA9"]), 2) if not pd.isna(latest["EMA9"]) else current_price
        ema21 = round(float(latest["EMA21"]), 2) if not pd.isna(latest["EMA21"]) else current_price
        ema50 = round(float(latest["EMA50"]), 2) if not pd.isna(latest["EMA50"]) else current_price
        bb_upper = round(float(latest["BB_upper"]), 2) if not pd.isna(latest["BB_upper"]) else current_price * 1.02
        bb_lower = round(float(latest["BB_lower"]), 2) if not pd.isna(latest["BB_lower"]) else current_price * 0.98
        atr = round(float(latest["ATR"]), 2) if not pd.isna(latest["ATR"]) else current_price * 0.015

        # Train LSTM and get predictions
        predicted_prices, model_confidence = train_and_predict(df, forecast_days=5)
        predicted_price = predicted_prices[0] if predicted_prices else current_price
        predicted_change_pct = round(((predicted_price - current_price) / current_price) * 100, 2)

        # Generate trading signal
        signal, direction, signal_confidence = generate_signal(
            rsi, macd, macd_signal_val, current_price, ema9, ema21, predicted_change_pct
        )

        # Combined confidence (avg of model + signal confidence)
        confidence = round((model_confidence + signal_confidence) / 2, 1)

        # Support / Resistance
        support, resistance = find_support_resistance(df)

        # Stop-loss and target
        stop_loss = round(current_price - (1.5 * atr), 2)
        target = round(current_price + (2.0 * atr), 2)

        # Volatility classification
        volatility = classify_volatility(atr, current_price)

        # Build 5-day forecast
        forecast = []
        today = datetime.utcnow()
        day_count = 0
        for i, price in enumerate(predicted_prices):
            day_count += 1
            # Skip weekends
            forecast_date = today + timedelta(days=day_count)
            while forecast_date.weekday() >= 5:  # 5=Saturday, 6=Sunday
                day_count += 1
                forecast_date = today + timedelta(days=day_count)
            forecast.append(ForecastDay(
                day=i + 1,
                date=forecast_date.strftime("%Y-%m-%d"),
                price=price
            ))

        # Build 60-day price history for chart
        hist_df = df.tail(60)
        history = []
        for idx, row in hist_df.iterrows():
            history.append(HistoryPoint(
                date=idx.strftime("%Y-%m-%d"),
                open=round(float(row["Open"]), 2),
                high=round(float(row["High"]), 2),
                low=round(float(row["Low"]), 2),
                close=round(float(row["Close"]), 2),
                volume=int(row["Volume"])
            ))

        result = {
            "ticker": ticker.upper(),
            "company_name": company_name,
            "current_price": current_price,
            "predicted_price": predicted_price,
            "predicted_change_pct": predicted_change_pct,
            "direction": direction,
            "signal": signal,
            "confidence": confidence,
            "rsi": rsi,
            "macd": macd,
            "macd_signal": macd_signal_val,
            "ema9": ema9,
            "ema21": ema21,
            "ema50": ema50,
            "bollinger_upper": bb_upper,
            "bollinger_lower": bb_lower,
            "atr": atr,
            "support": round(support, 2),
            "resistance": round(resistance, 2),
            "stop_loss": stop_loss,
            "target": target,
            "volatility": volatility,
            "forecast": [f.dict() for f in forecast],
            "history": [h.dict() for h in history],
            "last_updated": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        }

        # Cache the result
        _set_cache(ticker, result)

        return PredictionResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "SensexAI ML", "version": "2.0.0"}
