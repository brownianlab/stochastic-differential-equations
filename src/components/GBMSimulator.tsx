import React, {useMemo, useState} from 'react';

function normalish(seed: number, k: number) {
  const u = Math.abs(Math.sin((seed + 2) * (k + 5) * 47.39));
  const v = Math.abs(Math.sin((seed + 13) * (k + 2) * 89.17));
  return Math.sqrt(-2 * Math.log(Math.max(u, 1e-9))) * Math.cos(2 * Math.PI * v);
}

function makeGBM(seed: number, n: number, mu: number, sigma: number, S0: number) {
  const pts: number[] = [S0];
  const dt = 1 / n;
  for (let k = 0; k < n; k++) {
    const z = normalish(seed, k);
    // Exact GBM: S_{k+1} = S_k * exp((mu - sigma^2/2)*dt + sigma*sqrt(dt)*z)
    pts.push(pts[k] * Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * z));
  }
  return pts;
}

const COLORS = ['#3b82f6','#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#06b6d4'];

export default function GBMSimulator() {
  const [mu, setMu] = useState(0.08);
  const [sigma, setSigma] = useState(0.25);
  const [logScale, setLogScale] = useState(false);
  const n = 252;
  const numPaths = 7;

  const paths = useMemo(() =>
    Array.from({length: numPaths}, (_, i) => makeGBM(i * 13 + 1, n, mu, sigma, 100)),
    [mu, sigma]
  );

  // Mean and ±1σ band (theoretical)
  const meanPath = Array.from({length: n + 1}, (_, t) => 100 * Math.exp(mu * t / n));
  const upBand = Array.from({length: n + 1}, (_, t) => 100 * Math.exp(mu * t / n + sigma * Math.sqrt(t / n)));
  const downBand = Array.from({length: n + 1}, (_, t) => 100 * Math.exp(mu * t / n - sigma * Math.sqrt(t / n)));

  const width = 700, height = 290, padL = 48, padR = 16, padT = 16, padB = 32;

  const transform = (v: number) => logScale ? Math.log(v) : v;
  const allVals = [...paths.flat(), ...meanPath, ...upBand, ...downBand].map(transform).filter(isFinite);
  const ymin = Math.min(...allVals), ymax = Math.max(...allVals);

  const xS = (t: number) => padL + (t / n) * (width - padL - padR);
  const yS = (v: number) => padT + (ymax - transform(v)) / (ymax - ymin) * (height - padT - padB);

  const bandD = [
    ...upBand.map((v, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(v)}`),
    ...downBand.map((v, t) => `${t === n ? 'M' : 'L'} ${xS(n - t)} ${yS(downBand[n - t])}`),
    'Z'
  ].join(' ');

  return (
    <div className="visual-card">
      <div className="visual-title">Geometric Brownian Motion: S_t = S₀ exp((μ − σ²/2)t + σW_t)</div>
      <div className="control-row" style={{flexWrap: 'wrap', gap: '1rem'}}>
        <label>μ = {mu.toFixed(2)}<input type="range" min="-0.3" max="0.5" step="0.01" value={mu} onChange={e => setMu(Number(e.target.value))} /></label>
        <label>σ = {sigma.toFixed(2)}<input type="range" min="0.05" max="0.8" step="0.01" value={sigma} onChange={e => setSigma(Number(e.target.value))} /></label>
        <label style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
          <input type="checkbox" checked={logScale} onChange={e => setLogScale(e.target.checked)} />
          Log scale
        </label>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="GBM paths">
        <line x1={padL} x2={width - padR} y1={yS(100)} y2={yS(100)} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 4" />
        <line x1={padL} x2={padL} y1={padT} y2={height - padB} stroke="#94a3b8" strokeWidth={1} />
        <path d={bandD} fill="rgba(59,130,246,0.08)" />
        {paths.map((path, idx) => {
          const d = path.map((v, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(v)}`).join(' ');
          return <path key={idx} d={d} fill="none" strokeWidth={1.5} stroke={COLORS[idx]} opacity={0.75} />;
        })}
        {/* Mean path */}
        {(() => {
          const d = meanPath.map((v, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(v)}`).join(' ');
          return <path d={d} fill="none" strokeWidth={2.5} stroke="#1d4ed8" strokeDasharray="7 3" />;
        })()}
        <text x={padL} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">0</text>
        <text x={width - padR} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">T=1yr</text>
        <text x={padL - 6} y={yS(100) + 4} fontSize={11} fill="#64748b" textAnchor="end">100</text>
        <rect x={padL+8} y={padT+4} width={14} height={3} fill="#1d4ed8" />
        <text x={padL+26} y={padT+9} fontSize={11} fill="#64748b">E[S_t] = 100 e^(μt)</text>
        <rect x={padL+8} y={padT+16} width={14} height={8} fill="rgba(59,130,246,0.2)" />
        <text x={padL+26} y={padT+22} fontSize={11} fill="#64748b">±1σ band: e^(±σ√t)</text>
      </svg>
      <div className="visual-caption">
        GBM log-returns are normal: log(S_t/S_0) ~ N((μ−σ²/2)t, σ²t). Notice that higher σ widens the band
        but also drags the median below the mean — Jensen's inequality in action.
      </div>
    </div>
  );
}
