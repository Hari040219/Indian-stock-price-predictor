# 🚀 SensexAI — Indian Stock Price Predictor

<div align="center">

**AI-powered stock analysis platform for the Indian market (NSE/BSE)**

An end-to-end full-stack application that uses **LSTM Deep Learning** to predict 5-day stock price movements, generate trading signals, and provide technical analysis — all in real time.

[![React](https://img.shields.io/badge/Frontend-React_+_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/ML_Service-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TensorFlow](https://img.shields.io/badge/Model-TensorFlow_LSTM-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [How the AI Model Works](#-how-the-ai-model-works)
- [Deployment](#-deployment)
- [Disclaimer](#-disclaimer)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔮 **5-Day Price Forecast** | LSTM neural network predicts stock price trajectory for the next 5 trading days |
| 📊 **Interactive Charts** | 60-day price history + forecast visualized with smooth area charts |
| 🎯 **Trading Signals** | Algorithmic BUY / SELL / HOLD signals with confidence scores |
| 📈 **Technical Indicators** | RSI, MACD, EMA (9/21/50), Bollinger Bands, ATR — all computed in real-time |
| 🛡️ **Risk Management** | Auto-calculated stop-loss, profit targets, and volatility classification |
| 🏗️ **Support & Resistance** | Identifies key price levels from 30-day swing highs/lows |
| 🇮🇳 **Indian Market Focus** | Auto-resolves tickers to NSE (.NS) or BSE (.BO) — just type the stock name |
| ⚡ **Smart Caching** | 30-minute in-memory cache prevents redundant model training |
| 🎨 **Premium UI** | Dark trading terminal design with animated particles, glassmorphism, and ticker tape |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — Component-based UI
- **Vite** — Lightning-fast build tool
- **Recharts** — Charting library for financial data visualization
- **Axios** — HTTP client for API communication

### Backend (API Gateway)
- **Java 17+** — Core language
- **Spring Boot 3** — REST API framework
- **Spring WebFlux** — Reactive, non-blocking HTTP proxy
- **Maven** — Build & dependency management

### ML Service
- **Python 3.10+** — Core language
- **FastAPI** — High-performance async API framework
- **TensorFlow / Keras** — LSTM deep learning model
- **yfinance** — Real-time stock data from Yahoo Finance
- **ta (Technical Analysis)** — RSI, MACD, Bollinger Bands, ATR, EMAs
- **scikit-learn** — MinMaxScaler for data normalization
- **pandas / numpy** — Data manipulation

---

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌──────────────────────┐
│                 │      │                  │      │                      │
│  React Frontend │─────▶│  Spring Boot     │─────▶│  FastAPI ML Service  │
│  (Port 3000)    │ HTTP │  API Gateway     │ HTTP │  (Port 8000)         │
│                 │◀─────│  (Port 8080)     │◀─────│                      │
│  • UI/UX        │      │  • CORS handling │      │  • yfinance data     │
│  • Charts       │      │  • Request proxy │      │  • LSTM training     │
│  • User input   │      │  • Health check  │      │  • Technical analysis│
│                 │      │                  │      │  • Signal generation │
└─────────────────┘      └──────────────────┘      └──────────────────────┘
```

---

## 📦 Prerequisites

Make sure you have the following installed on your system:

| Tool | Version | Check Command |
|------|---------|---------------|
| **Node.js** | 18+ | `node --version` |
| **npm** | 9+ | `npm --version` |
| **Java JDK** | 17+ | `java --version` |
| **Maven** | 3.8+ | `mvn --version` |
| **Python** | 3.10+ | `python --version` |
| **pip** | 21+ | `pip --version` |

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Hari040219/Indian-stock-price-predictor.git
cd Indian-stock-price-predictor
```

### 2. Start the ML Service (Python)

```bash
cd ml_service

# (Optional but recommended) Create a virtual environment
python -m venv venv

# Activate it
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Windows (CMD):
venv\Scripts\activate.bat
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the ML server
uvicorn main:app --reload --port 8000
```

✅ You should see: `INFO: Application startup complete.`  
🔗 ML Service will be running at: **http://localhost:8000**

### 3. Start the Backend (Java Spring Boot)

Open a **new terminal window**:

```bash
cd backend

# Using Maven wrapper (recommended):
./mvnw spring-boot:run

# Or if Maven is installed globally:
mvn spring-boot:run
```

✅ You should see: `Started BackendApplication`  
🔗 Backend will be running at: **http://localhost:8080**

### 4. Start the Frontend (React)

Open **another new terminal window**:

```bash
cd frontend

# Install Node.js dependencies (first time only)
npm install

# Start the development server
npm run dev
```

✅ You should see: `Local: http://localhost:3000/`  
🔗 Frontend will be running at: **http://localhost:3000**

### 5. Open the App 🎉

Navigate to **http://localhost:3000** in your browser. You're all set!

---

## 💡 Usage

### Searching for a Stock

1. **Type a stock name** in the search bar (e.g., `RELIANCE`, `TCS`, `INFOSYS`)
2. Click **🚀 Analyze** or press Enter
3. Wait 15-60 seconds while the LSTM model trains on the stock's data
4. View your complete analysis dashboard!

### Supported Tickers

You can search using just the company name — SensexAI will automatically find it on NSE/BSE:

| What You Type | What Gets Resolved |
|---------------|--------------------|
| `RELIANCE` | `RELIANCE.NS` (NSE) |
| `TCS` | `TCS.NS` (NSE) |
| `INFY` | `INFY.NS` (NSE) |
| `HDFCBANK` | `HDFCBANK.NS` (NSE) |
| `SBIN` | `SBIN.NS` (NSE) |
| `RELIANCE.BO` | `RELIANCE.BO` (BSE — explicit) |

> **Tip:** You can also use the "Popular" ticker chips below the search bar for quick access.

### Understanding the Dashboard

| Panel | What It Shows |
|-------|---------------|
| **Price Card** | Current price, 5-day predicted target, and percentage change |
| **Forecast Chart** | 60-day historical price action + 5-day AI forecast (area chart) |
| **Algorithmic Signal** | BUY/SELL/HOLD recommendation with a confidence score (0-100%) |
| **Momentum & Trend** | RSI (14), MACD, EMA (9), EMA (50) |
| **Risk Management** | Volatility level, ATR (14), auto stop-loss, and profit target |
| **Key Levels** | Support, resistance, current close, and Bollinger Band range |

---

## 🔌 API Endpoints

### ML Service (Port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/predict/{ticker}` | Returns full analysis + 5-day forecast for a stock |
| `GET` | `/health` | Health check |

### Backend Gateway (Port 8080)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/predict/{ticker}` | Proxies request to ML service |
| `GET` | `/api/health` | Backend health check |

### Example API Response

```json
{
  "ticker": "RELIANCE.NS",
  "company_name": "Reliance Industries Limited",
  "current_price": 2894.50,
  "predicted_price": 2932.18,
  "predicted_change_pct": 1.30,
  "direction": "BULLISH",
  "signal": "BUY",
  "confidence": 67.5,
  "rsi": 55.32,
  "macd": 12.45,
  "macd_signal": 10.21,
  "ema9": 2878.40,
  "ema21": 2855.10,
  "ema50": 2820.75,
  "bollinger_upper": 2945.00,
  "bollinger_lower": 2810.00,
  "atr": 42.30,
  "support": 2815.00,
  "resistance": 2950.00,
  "stop_loss": 2831.05,
  "target": 2979.10,
  "volatility": "MEDIUM",
  "forecast": [...],
  "history": [...],
  "last_updated": "2026-04-10 18:30:00 UTC"
}
```

---

## 📁 Project Structure

```
Indian-stock-price-predictor/
│
├── frontend/                    # React + Vite frontend
│   ├── index.html               # Entry HTML with Google Fonts
│   ├── package.json             # Node.js dependencies
│   ├── vite.config.js           # Vite configuration (port 3000)
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # Main application component
│       └── index.css            # Complete design system
│
├── backend/                     # Spring Boot API gateway
│   ├── pom.xml                  # Maven dependencies
│   └── src/main/
│       ├── java/com/stockpred/backend/
│       │   ├── BackendApplication.java    # Spring Boot entry point
│       │   ├── CorsConfig.java            # CORS configuration
│       │   └── PredictionController.java  # API controller (WebClient proxy)
│       └── resources/
│           └── application.properties     # Server config (port 8080, ML_URL)
│
├── ml_service/                  # Python FastAPI ML engine
│   ├── main.py                  # LSTM model, technical analysis, API endpoints
│   └── requirements.txt         # Python dependencies
│
└── README.md                    # You are here!
```

---

## 🧠 How the AI Model Works

### 1. Data Collection
- Fetches **1 year of daily OHLCV data** (Open, High, Low, Close, Volume) from Yahoo Finance using `yfinance`

### 2. Feature Engineering
The following **technical indicators** are computed using the `ta` library:
- **RSI (14)** — Relative Strength Index
- **MACD** — Moving Average Convergence/Divergence (12, 26, 9)
- **EMA 9, 21, 50** — Exponential Moving Averages
- **Bollinger Bands** (20-period, 2σ)
- **ATR (14)** — Average True Range
- **Volume SMA (20)** — Volume moving average

### 3. LSTM Model Architecture
```
Input (60-day sequences) → LSTM (64 units) → Dropout (0.2)
                         → LSTM (32 units) → Dropout (0.2)
                         → Dense (16, ReLU) → Dense (1)
```
- **Optimizer:** Adam
- **Loss:** Mean Squared Error (MSE)
- **Epochs:** 25
- **Batch Size:** 16
- **Lookback Window:** 60 days

### 4. Prediction
- The model iteratively predicts 5 future days
- Each prediction feeds back into the sequence for the next day
- Predictions are inverse-scaled back to actual price values

### 5. Signal Generation
A scoring system combines:
- RSI (oversold/overbought zones)
- MACD crossover direction
- Price vs EMA alignment
- LSTM prediction direction

The combined score maps to **BUY** (≥ +2), **SELL** (≤ -2), or **HOLD** (in between), with a normalized confidence percentage.

---

## 🌐 Deployment

### Recommended Setup

| Service | Platform | Why |
|---------|----------|-----|
| **ML Service** (Python) | [Render](https://render.com/) or [Railway](https://railway.app/) | Needs ≥ 1GB RAM for TensorFlow |
| **Backend** (Java) | [Render](https://render.com/) or [Railway](https://railway.app/) | Spring Boot needs ~512MB RAM |
| **Frontend** (React) | [Vercel](https://vercel.com/) | Free, fast, perfect for static sites |

### Environment Variables

**Backend** (set on Render/Railway):
```
ML_URL=https://your-ml-service-url.onrender.com
```

**Frontend** (set on Vercel):
```
VITE_API_URL=https://your-backend-url.onrender.com
```

### ML Service Procfile

Create a `Procfile` in the `ml_service/` directory:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## ⚠️ Disclaimer

> **SensexAI is an educational project — not financial advice.**
>
> Stock markets are inherently unpredictable. The LSTM model provides predictions based on historical patterns, but past performance does not guarantee future results. Always do your own research (DYOR) and consult a qualified financial advisor before making any investment decisions.
>
> The developers of this project are not responsible for any financial losses incurred from using this tool.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by [Hari](https://github.com/Hari040219)**

⭐ Star this repo if you found it useful!

</div>
