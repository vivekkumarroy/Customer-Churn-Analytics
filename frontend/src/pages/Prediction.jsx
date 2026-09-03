import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Brain, AlertCircle, Sparkles } from 'lucide-react';
import api from '../api';

const CircularGauge = ({ percentage }) => {
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let color = '#22C55E'; // LOW
  let riskText = 'LOW RISK';
  if (percentage >= 70) {
    color = '#EF4444'; // HIGH
    riskText = 'HIGH RISK';
  } else if (percentage >= 40) {
    color = '#F59E0B'; // MEDIUM
    riskText = 'MEDIUM RISK';
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-theme-bg2 rounded-3xl border border-theme-border shadow-lg relative overflow-hidden w-full">
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-2xl pointer-events-none" style={{ backgroundColor: color }}></div>
      <div className="relative w-64 h-64">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="128" cy="128" r={radius} stroke="#1E293B" strokeWidth="16" fill="transparent" />
          <circle
            cx="128" cy="128" r={radius}
            stroke={color}
            strokeWidth="16"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out drop-shadow-xl"
            style={{ filter: `drop-shadow(0 0 12px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-black text-theme-text1 tracking-tighter">{percentage.toFixed(0)}<span className="text-3xl text-theme-text2">%</span></span>
          <span className="text-sm font-black mt-2 tracking-widest" style={{ color }}>{riskText}</span>
        </div>
      </div>
    </div>
  );
};

const Prediction = () => {
  const [searchParams] = useSearchParams();
  const prefillId = searchParams.get('id');

  const [features, setFeatures] = useState([]);
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);

  const [loadingForm, setLoadingForm] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch Model Features
  useEffect(() => {
    const fetchSetup = async () => {
      try {
        const featRes = await api.get('/model_features');
        const feats = featRes.data.features;
        setFeatures(feats);

        let initialData = {};
        feats.forEach(f => initialData[f] = '');

        // 2. Prefill if ID is present
        if (prefillId) {
          try {
            const custRes = await api.get(`/customers/${prefillId}`);
            const cust = custRes.data;
            feats.forEach(f => {
              if (cust[f] !== undefined) {
                initialData[f] = cust[f];
              }
            });
          } catch (e) {
            console.error("Could not prefill customer:", e);
          }
        }

        setFormData(initialData);
      } catch (err) {
        setError('Failed to load model features.');
      } finally {
        setLoadingForm(false);
      }
    };
    fetchSetup();
  }, [prefillId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredicting(true);
    setError('');
    setResult(null);

    // Convert all to numbers
    const payload = {};
    for (const f of features) {
      if (formData[f] === '') {
        setError(`Please fill out all fields. Missing: ${f}`);
        setPredicting(false);
        return;
      }
      payload[f] = Number(formData[f]);
    }

    try {
      const res = await api.post('/predict', payload);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction failed.');
    } finally {
      setPredicting(false);
    }
  };

  if (loadingForm) return (
    <div className="flex h-full items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-theme-accent1 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-6xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-black text-theme-text1 tracking-tight">Churn Prediction Engine</h1>
        <p className="text-theme-text2 mt-2 text-lg">Estimate churn probability for a customer using the trained ML model.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left Col: The Form */}
        <div className="dashboard-card p-6 md:p-8">
          <form onSubmit={handlePredict}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {features.map(f => (
                <div key={f}>
                  <label className="block text-sm font-semibold text-theme-text2 mb-2">{f}</label>
                  <input
                    type="number"
                    step="any"
                    name={f}
                    value={formData[f]}
                    onChange={handleChange}
                    className="input-form"
                    placeholder={`Enter ${f}`}
                  />
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-theme-high/10 border border-theme-high rounded-lg flex items-start gap-3">
                <AlertCircle className="text-theme-high shrink-0" size={20} />
                <p className="text-sm text-theme-high font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={predicting}
              className="w-full btn-primary text-lg py-3 shadow-lg shadow-theme-accent1/20"
            >
              {predicting ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <Sparkles size={20} />
                  PREDICT CHURN
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Col: Prediction Result */}
        <div>
          {result ? (
            <div className="dashboard-card p-8 h-full flex flex-col items-center animate-fade-in relative overflow-hidden shadow-lg border-2 border-theme-primary/20">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-theme-primary to-theme-accent1"></div>

              <h2 className="text-2xl font-black text-theme-text1 mb-6 tracking-tight w-full text-left">Prediction Result</h2>

              <CircularGauge percentage={result.churn_probability * 100} />

              <div className="w-full grid grid-cols-2 gap-4 mt-6">
                <div className="bg-theme-bg/50 border border-theme-border rounded-xl p-4 text-center">
                  <p className="text-xs font-bold text-theme-muted uppercase tracking-widest mb-1">Prediction</p>
                  <p className="text-xl font-black text-theme-text1">
                    {result.churn_prediction === 1 ? 'CHURN' : 'RETAIN'}
                  </p>
                </div>
                <div className="bg-theme-bg/50 border border-theme-border rounded-xl p-4 text-center">
                  <p className="text-xs font-bold text-theme-muted uppercase tracking-widest mb-1">Threshold</p>
                  <p className="text-xl font-black text-theme-text1">{result.threshold}</p>
                </div>
              </div>
              
              <div className="mt-6 w-full bg-purple-900/20 border-2 border-purple-500/60 rounded-3xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.2)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Brain size={14}/> Recommended Action</h3>
                <p className="text-xl font-black text-theme-text1 leading-tight">
                  {result.churn_prediction === 1 ? 'Deploy immediate retention campaign' : 'Continue normal marketing'}
                </p>
              </div>

              <div className="mt-8 w-full text-center">
                <p className="text-xs font-bold text-theme-muted uppercase tracking-widest">Model Used</p>
                <p className="text-sm font-medium text-theme-text2 mt-1">{result.model_used}</p>
              </div>

            </div>
          ) : (
            <div className="dashboard-card p-8 h-full flex flex-col items-center justify-center text-center opacity-50 border-dashed border-2">
              <Brain size={64} className="text-theme-muted mb-4" />
              <h3 className="text-xl font-bold text-theme-text1 mb-2">Awaiting Input</h3>
              <p className="text-theme-text2 max-w-sm">Enter the customer's behavioral features and click Predict to generate a churn probability estimation.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Prediction;
