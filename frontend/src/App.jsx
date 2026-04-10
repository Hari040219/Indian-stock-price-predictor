// src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function App() {
  const [ticker, setTicker] = useState('RELIANCE.NS');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPrediction = async (symbol) => {
    setLoading(true);
    setError('');
    setData(null);
    try {
      // Allow passing ?ticker= in URL for easy sharing
      const urlParams = new URLSearchParams(window.location.search);
      const urlTicker = urlParams.get('ticker');
      const finalTicker = symbol || urlTicker || ticker;
      
      // Use environment variable for API URL in production, fallback to localhost for development
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await axios.get(`${API_BASE_URL}/api/predict/${finalTicker}`);
      setData(response.data);
      setTicker(finalTicker);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.detail || 'Failed to fetch prediction. Ensure backend and ML service are running.');
    }
    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    fetchPrediction('RELIANCE.NS');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (ticker.trim()) {
      fetchPrediction(ticker);
    }
  };

  // Combine history and forecast for main chart
  let chartData = [];
  if (data?.history && data?.forecast) {
     chartData = [
       ...data.history.map(item => ({ date: item.date, price: item.close, type: 'history' })),
       ...data.forecast.map(item => ({ date: item.date, price: item.price, type: 'forecast' }))
     ];
  }

  return (
    <div className="dashboard-container">
      <header>
        <h1><span style={{color: '#fff'}}>Sensex</span>AI</h1>
        <div style={{color: 'var(--text-secondary)'}}>Intraday & Swing Analysis</div>
      </header>

      {/* ─── Hero / About Section ─── */}
      {!data && !loading && (
        <section className="hero-section">
          <div className="hero-content">
            <h2 className="hero-title">
              Predict Indian Stock Prices<br />
              <span className="hero-highlight">Using Artificial Intelligence</span>
            </h2>
            <p className="hero-subtitle">
              SensexAI uses a deep learning model called <strong>LSTM</strong> (Long Short-Term Memory) 
              to analyze stock price patterns and predict where a stock might go in the next 5 trading days. 
              Just type any Indian stock name and get instant insights — no finance degree needed!
            </p>
          </div>

          {/* How It Works */}
          <div className="how-it-works">
            <h3 className="section-title">How It Works</h3>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <div className="step-icon">🔍</div>
                <h4>Search a Stock</h4>
                <p>Type any Indian stock name like <strong>RELIANCE</strong>, <strong>TCS</strong>, or <strong>INFOSYS</strong>. We automatically find it on NSE/BSE for you.</p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <div className="step-icon">🧠</div>
                <h4>AI Analyzes Data</h4>
                <p>Our LSTM neural network studies <strong>1 year of real price data</strong>, calculates <strong>10+ technical indicators</strong> (RSI, MACD, EMAs, Bollinger Bands), and identifies trends.</p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <div className="step-icon">📊</div>
                <h4>Get Predictions</h4>
                <p>Receive a <strong>5-day price forecast</strong>, a clear <strong>BUY / SELL / HOLD</strong> signal, confidence score, support & resistance levels, and a suggested stop-loss.</p>
              </div>
            </div>
          </div>

          {/* Accuracy & Disclaimer */}
          <div className="accuracy-section">
            <div className="accuracy-cards">
              <div className="accuracy-card">
                <div className="accuracy-icon">🎯</div>
                <h4>Model Accuracy</h4>
                <p>Our LSTM model is trained on <strong>real daily stock data</strong> and achieves a confidence score between <strong>30% to 90%</strong> depending on market volatility. The model works best for <strong>large-cap, liquid stocks</strong> with stable trading patterns.</p>
              </div>
              <div className="accuracy-card">
                <div className="accuracy-icon">⚠️</div>
                <h4>Important Disclaimer</h4>
                <p>SensexAI is an <strong>educational tool</strong> — not financial advice. Stock markets are unpredictable. Always do your own research and consult a financial advisor before making investment decisions. <strong>Past patterns don't guarantee future results.</strong></p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Search Section ─── */}
      <div className="search-section">
        <div style={{width: '100%', maxWidth: '600px'}}>
          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="Enter stock name (e.g., RELIANCE, TCS, INFOSYS)"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !ticker.trim()}>
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>
          {/* Popular Tickers */}
          <div className="popular-tickers">
            <span className="popular-label">Popular:</span>
            {['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'SBIN', 'ITC', 'WIPRO'].map((t) => (
              <button
                key={t}
                className="ticker-chip"
                onClick={() => { setTicker(t); fetchPrediction(t); }}
                disabled={loading}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {loading && !data && <div className="loading">Initializing LSTM parameters and parsing order book...</div>}

      {data && (
        <div className="dashboard-grid">
          
          {/* Main Price & Direction Panel */}
          <div className="card price-card">
            <div className="card-header">{data.company_name} ({data.ticker})</div>
            <div className="current-price">₹{data.current_price.toLocaleString()}</div>
            <div className="predicted-price">
              Target (5D): ₹{data.predicted_price.toLocaleString()}
              <span className={`change-indicator ${data.predicted_change_pct >= 0 ? 'positive' : 'negative'}`}>
                {data.predicted_change_pct >= 0 ? '▲' : '▼'} {Math.abs(data.predicted_change_pct)}%
              </span>
            </div>
            
            <div style={{marginTop: '2rem'}}>
                <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>LAST UPDATED</div>
                <div>{new Date(data.last_updated).toLocaleString()}</div>
            </div>
          </div>

          {/* Forecast Chart Panel */}
          <div className="card forecast-card">
            <div className="card-header">60-Day Price Action & 5-Day ML Forecast</div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                  <XAxis dataKey="date" stroke="#8b949e" tickFormatter={(tick) => tick.substring(5)} minTickGap={30} />
                  <YAxis domain={['auto', 'auto']} stroke="#8b949e" tickFormatter={(tick) => `₹${tick}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#c9d1d9' }}
                    itemStyle={{ color: '#58a6ff' }}
                    formatter={(value) => [`₹${value}`, 'Price']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#58a6ff" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: '#58a6ff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trading Signal Card */}
          <div className="card signal-card">
            <div className="card-header">Algorithmic Signal</div>
            <div className={`signal-badge ${data.signal.toLowerCase()}`}>
              {data.signal}
            </div>
            <div style={{color: 'var(--text-secondary)', marginTop: '0.5rem'}}>
              Bias: {data.direction}
            </div>
            
            <div style={{width: '100%', marginTop: '1.5rem', textAlign: 'left'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem'}}>
                <span>Confidence Score</span>
                <span style={{color: 'var(--accent-blue)', fontWeight: 'bold'}}>{data.confidence}%</span>
              </div>
              <div className="confidence-bar">
                <div className="confidence-fill" style={{width: `${data.confidence}%`}}></div>
              </div>
            </div>
          </div>

          {/* Technical Indicators */}
          <div className="card">
            <div className="card-header">Momentum & Trend</div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-label">RSI (14)</div>
                <div className={`stat-value ${data.rsi > 70 ? 'down' : data.rsi < 30 ? 'up' : ''}`}>
                  {data.rsi.toFixed(1)} {data.rsi > 70 ? '(OB)' : data.rsi < 30 ? '(OS)' : ''}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-label">MACD</div>
                <div className={`stat-value ${data.macd > data.macd_signal ? 'up' : 'down'}`}>
                  {data.macd.toFixed(2)}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-label">EMA (9)</div>
                <div className="stat-value">₹{data.ema9.toLocaleString()}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">EMA (50)</div>
                <div className="stat-value">₹{data.ema50.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Risk Management */}
          <div className="card">
            <div className="card-header">Risk Management</div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-label">Volatility</div>
                <div className="stat-value">{data.volatility}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">ATR (14)</div>
                <div className="stat-value">₹{data.atr.toFixed(2)}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Stop-Loss (Auto)</div>
                <div className="stat-value down">₹{data.stop_loss.toLocaleString()}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Profit Target</div>
                <div className="stat-value up">₹{data.target.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Price Action Levels */}
          <div className="card">
            <div className="card-header">Key Levels (30D)</div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-label">Strong Resistance</div>
                <div className="stat-value down">₹{data.resistance.toLocaleString()}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Current Close</div>
                <div className="stat-value">₹{data.current_price.toLocaleString()}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Strong Support</div>
                <div className="stat-value up">₹{data.support.toLocaleString()}</div>
              </div>
            </div>
             <div style={{marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-accent)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5'}}>
               Bollinger Band Range: <br />
               <span style={{color: 'var(--accent-red)'}}>₹{data.bollinger_upper.toLocaleString()}</span> (Upper) ↔ <span style={{color: 'var(--accent-green)'}}>₹{data.bollinger_lower.toLocaleString()}</span> (Lower)
             </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default App;
