// src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';

// Scrolling ticker tape data (simulated market tickers)
const TICKER_TAPE_DATA = [
  { name: 'NIFTY 50', value: '22,147.90', change: '+0.85%', up: true },
  { name: 'SENSEX', value: '72,831.44', change: '+0.72%', up: true },
  { name: 'BANKNIFTY', value: '47,123.60', change: '-0.31%', up: false },
  { name: 'RELIANCE', value: '₹2,894.50', change: '+1.22%', up: true },
  { name: 'TCS', value: '₹3,812.35', change: '-0.45%', up: false },
  { name: 'INFY', value: '₹1,478.20', change: '+0.68%', up: true },
  { name: 'HDFCBANK', value: '₹1,642.75', change: '+0.33%', up: true },
  { name: 'ITC', value: '₹436.90', change: '-0.18%', up: false },
  { name: 'WIPRO', value: '₹452.15', change: '+1.05%', up: true },
  { name: 'SBIN', value: '₹768.40', change: '+0.91%', up: true },
  { name: 'BHARTIARTL', value: '₹1,245.80', change: '+0.47%', up: true },
  { name: 'HINDUNILVR', value: '₹2,567.30', change: '-0.62%', up: false },
];

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
      const urlParams = new URLSearchParams(window.location.search);
      const urlTicker = urlParams.get('ticker');
      const finalTicker = symbol || urlTicker || ticker;
      
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

  // Calculate where forecast starts for split-line coloring
  const historyLength = data?.history?.length || 0;

  return (
    <>
      {/* ─── Animated Background ─── */}
      <div className="animated-bg">
        <div className="grid-overlay"></div>
        {/* Floating particles */}
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        {/* Glow orbs */}
        <div className="glow-orb"></div>
        <div className="glow-orb"></div>
        <div className="glow-orb"></div>
      </div>

      {/* ─── Scrolling Ticker Tape ─── */}
      <div className="ticker-tape">
        <div className="ticker-tape-content">
          {[...TICKER_TAPE_DATA, ...TICKER_TAPE_DATA].map((t, i) => (
            <span key={i}>
              {t.name}{' '}
              <span className={t.up ? 'ticker-up' : 'ticker-down'}>
                {t.value} {t.change}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── Main App ─── */}
      <div className="dashboard-container">
        <header>
          <div>
            <h1><span>Sensex</span>AI</h1>
            <div className="header-subtitle">Intraday & Swing Analysis Engine</div>
          </div>
          <div className="header-live-badge">
            <div className="live-dot"></div>
            Market Live
          </div>
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
              <h3 className="section-title">// How It Works</h3>
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
          <div style={{width: '100%', maxWidth: '640px'}}>
            <form onSubmit={handleSearch} className="search-bar">
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="Search NSE/BSE stock (e.g. RELIANCE, TCS)"
                disabled={loading}
              />
              <button type="submit" disabled={loading || !ticker.trim()}>
                {loading ? '⏳ Analyzing...' : '🚀 Analyze'}
              </button>
            </form>
            <div className="popular-tickers">
              <span className="popular-label">Popular →</span>
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

        {error && <div className="error">⚠ {error}</div>}

        {loading && !data && (
          <div className="loading">
            Initializing LSTM parameters and parsing order book...
          </div>
        )}

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
                  <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '1.5px', textTransform: 'uppercase'}}>Last Updated</div>
                  <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{new Date(data.last_updated).toLocaleString()}</div>
              </div>
            </div>

            {/* Forecast Chart Panel */}
            <div className="card forecast-card">
              <div className="card-header">60-Day Price Action & 5-Day ML Forecast</div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2979ff" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#2979ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 100, 0.25)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#475569" 
                      tickFormatter={(tick) => tick.substring(5)} 
                      minTickGap={30}
                      tick={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
                      axisLine={{ stroke: 'rgba(51, 65, 100, 0.3)' }}
                    />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      stroke="#475569" 
                      tickFormatter={(tick) => `₹${tick}`}
                      tick={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
                      axisLine={{ stroke: 'rgba(51, 65, 100, 0.3)' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(10, 14, 23, 0.95)', 
                        borderColor: 'rgba(41, 121, 255, 0.3)', 
                        borderRadius: '10px',
                        color: '#e2e8f0',
                        backdropFilter: 'blur(10px)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.85rem',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                      }}
                      itemStyle={{ color: '#00e5ff' }}
                      formatter={(value) => [`₹${value}`, 'Price']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#2979ff" 
                      strokeWidth={2}
                      fill="url(#priceGradient)"
                      dot={false}
                      activeDot={{ r: 5, fill: '#00e5ff', stroke: '#0a0e17', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trading Signal Card */}
            <div className="card signal-card">
              <div className="card-header">Algorithmic Signal</div>
              <div className={`signal-badge ${data.signal.toLowerCase()}`}>
                {data.signal}
              </div>
              <div style={{color: 'var(--text-secondary)', marginTop: '0.5rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', letterSpacing: '1px'}}>
                Bias: {data.direction}
              </div>
              
              <div style={{width: '100%', marginTop: '1.5rem', textAlign: 'left'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontFamily: "'JetBrains Mono', monospace"}}>
                  <span style={{color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', fontSize: '0.65rem'}}>Confidence Score</span>
                  <span style={{color: 'var(--accent-cyan)', fontWeight: 'bold'}}>{data.confidence}%</span>
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
              <div className="bollinger-section">
                Bollinger Band Range: <br />
                <span style={{color: 'var(--accent-red)'}}>₹{data.bollinger_upper.toLocaleString()}</span> (Upper) ↔ <span style={{color: 'var(--accent-green)'}}>₹{data.bollinger_lower.toLocaleString()}</span> (Lower)
              </div>
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="footer-badge">
          Powered by <span>LSTM Neural Network</span> · Built with React + Spring Boot + FastAPI
        </div>
      </div>
    </>
  );
}

export default App;
