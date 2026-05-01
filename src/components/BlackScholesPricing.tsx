import React, {useMemo, useState} from 'react';

// Standard normal CDF via rational approximation
function normCDF(x: number): number {
  const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;
  const sign = x < 0 ? -1 : 1;
  const t = 1 / (1 + p * Math.abs(x));
  const y = 1 - (((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x/2);
  return 0.5 * (1 + sign * y);
}

function bsCall(S: number, K: number, T: number, r: number, sigma: number) {
  if (T <= 0) return Math.max(S - K, 0);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  return S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2);
}

function bsDelta(S: number, K: number, T: number, r: number, sigma: number) {
  if (T <= 0) return S > K ? 1 : 0;
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  return normCDF(d1);
}

function bsGamma(S: number, K: number, T: number, r: number, sigma: number) {
  if (T <= 0) return 0;
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const pdf = Math.exp(-d1 * d1 / 2) / Math.sqrt(2 * Math.PI);
  return pdf / (S * sigma * Math.sqrt(T));
}

export default function BlackScholesPricing() {
  const [K, setK] = useState(100);
  const [T, setT] = useState(0.5);
  const [r, setR] = useState(0.05);
  const [sigma, setSigma] = useState(0.2);
  const [activeChart, setActiveChart] = useState<'price' | 'delta' | 'gamma'>('price');

  const Svals = useMemo(() => Array.from({length: 101}, (_, i) => 60 + i * 0.8), []);

  const prices = useMemo(() => Svals.map(S => bsCall(S, K, T, r, sigma)), [Svals, K, T, r, sigma]);
  const deltas = useMemo(() => Svals.map(S => bsDelta(S, K, T, r, sigma)), [Svals, K, T, r, sigma]);
  const gammas = useMemo(() => Svals.map(S => bsGamma(S, K, T, r, sigma)), [Svals, K, T, r, sigma]);

  const chartData = activeChart === 'price' ? prices : activeChart === 'delta' ? deltas : gammas;
  const chartLabel = activeChart === 'price' ? 'Call Price C(S)' : activeChart === 'delta' ? 'Delta Δ(S)' : 'Gamma Γ(S)';

  const currentS = 100;
  const currentPrice = bsCall(currentS, K, T, r, sigma);
  const currentDelta = bsDelta(currentS, K, T, r, sigma);
  const currentGamma = bsGamma(currentS, K, T, r, sigma);

  const width = 700, height = 260, padL = 48, padR = 16, padT = 16, padB = 32;
  const ymin = Math.min(0, ...chartData), ymax = Math.max(...chartData) * 1.05;
  const xS = (i: number) => padL + (i / (Svals.length - 1)) * (width - padL - padR);
  const yS = (v: number) => padT + (ymax - v) / (ymax - ymin) * (height - padT - padB);

  const d = chartData.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xS(i)} ${yS(v)}`).join(' ');
  // Intrinsic value line for price chart
  const intD = Svals.map((S, i) => `${i === 0 ? 'M' : 'L'} ${xS(i)} ${yS(Math.max(S - K, 0))}`).join(' ');
  const kIdx = Svals.findIndex(S => S >= K);

  return (
    <div className="visual-card">
      <div className="visual-title">Black–Scholes call option: C = S·N(d₁) − Ke^(−rT)·N(d₂)</div>
      <div className="control-row" style={{flexWrap: 'wrap', gap: '0.75rem'}}>
        <label>K = {K}<input type="range" min="60" max="140" step="1" value={K} onChange={e => setK(Number(e.target.value))} /></label>
        <label>T = {T.toFixed(2)}<input type="range" min="0.05" max="2" step="0.05" value={T} onChange={e => setT(Number(e.target.value))} /></label>
        <label>σ = {sigma.toFixed(2)}<input type="range" min="0.05" max="0.8" step="0.01" value={sigma} onChange={e => setSigma(Number(e.target.value))} /></label>
        <label>r = {r.toFixed(2)}<input type="range" min="0" max="0.15" step="0.005" value={r} onChange={e => setR(Number(e.target.value))} /></label>
      </div>
      <div className="control-row">
        {(['price','delta','gamma'] as const).map(c => (
          <button key={c} className={activeChart === c ? 'btn-active' : 'btn-inactive'}
            onClick={() => setActiveChart(c)} style={{marginRight:'0.5rem'}}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Black-Scholes pricing">
        <line x1={padL} x2={width - padR} y1={yS(0)} y2={yS(0)} stroke="#e2e8f0" strokeWidth={1} />
        <line x1={padL} x2={padL} y1={padT} y2={height - padB} stroke="#94a3b8" strokeWidth={1} />
        {/* K vertical line */}
        {kIdx >= 0 && (
          <line x1={xS(kIdx)} x2={xS(kIdx)} y1={padT} y2={height - padB} stroke="#94a3b8" strokeDasharray="4 3" strokeWidth={1} />
        )}
        {activeChart === 'price' && (
          <path d={intD} fill="none" stroke="#e2e8f0" strokeWidth={2} />
        )}
        <path d={d} fill="none" strokeWidth={2.5} stroke="#2563eb" />
        {/* S=100 dot */}
        {(() => {
          const iS = Svals.findIndex(S => S >= 100);
          return iS >= 0 ? (
            <circle cx={xS(iS)} cy={yS(chartData[iS])} r={4} fill="#dc2626" />
          ) : null;
        })()}
        <text x={padL} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">60</text>
        <text x={width - padR} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">140</text>
        {kIdx >= 0 && <text x={xS(kIdx)} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">K</text>}
        <text x={padL + 10} y={padT + 12} fontSize={11} fill="#64748b">{chartLabel}</text>
      </svg>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.75rem',marginTop:'0.5rem'}}>
        <div className="stat-chip">
          <span className="stat-label">C(100) — Call price</span>
          <span className="stat-value">${currentPrice.toFixed(3)}</span>
        </div>
        <div className="stat-chip">
          <span className="stat-label">Δ(100) — Shares to hold</span>
          <span className="stat-value">{currentDelta.toFixed(4)}</span>
        </div>
        <div className="stat-chip">
          <span className="stat-label">Γ(100) — Convexity</span>
          <span className="stat-value">{currentGamma.toFixed(5)}</span>
        </div>
      </div>
      <div className="visual-caption">
        Delta = ∂C/∂S = N(d₁) is the hedge ratio: hold Δ shares to replicate the option. Gamma = ∂²C/∂S²
        measures convexity — its interaction with (dS)² = σ²S²dt in Itô's formula is what creates the
        ½σ²S²Γ term in the Black–Scholes PDE.
      </div>
    </div>
  );
}
