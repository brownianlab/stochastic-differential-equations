import React, {useMemo, useState} from 'react';

function normalish(seed: number, k: number) {
  const u = Math.abs(Math.sin((seed + 4) * (k + 6) * 53.17));
  const v = Math.abs(Math.sin((seed + 11) * (k + 9) * 71.43));
  return Math.sqrt(-2 * Math.log(Math.max(u, 1e-9))) * Math.cos(2 * Math.PI * v);
}

function makeOU(seed: number, n: number, kappa: number, theta: number, sigma: number, x0: number) {
  const pts: number[] = [x0];
  const dt = 1 / n;
  for (let k = 0; k < n; k++) {
    const z = normalish(seed, k);
    // Euler-Maruyama for OU: dX = κ(θ - X)dt + σ dW
    pts.push(pts[k] + kappa * (theta - pts[k]) * dt + sigma * Math.sqrt(dt) * z);
  }
  return pts;
}

const COLORS = ['#3b82f6','#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981'];

export default function OUSimulator() {
  const [kappa, setKappa] = useState(2.0);
  const [theta, setTheta] = useState(1.0);
  const [sigma, setSigma] = useState(0.5);
  const n = 300;
  const numPaths = 6;
  const x0 = 2.5;

  const paths = useMemo(() =>
    Array.from({length: numPaths}, (_, i) => makeOU(i * 17 + 5, n, kappa, theta, sigma, x0)),
    [kappa, theta, sigma]
  );

  // Theoretical mean: E[X_t] = theta + (x0 - theta) * exp(-kappa * t)
  const meanPath = Array.from({length: n + 1}, (_, t) =>
    theta + (x0 - theta) * Math.exp(-kappa * t / n)
  );
  // Stationary variance: sigma^2 / (2 kappa)
  const statVar = (sigma * sigma) / (2 * kappa);
  const statStd = Math.sqrt(statVar);

  const width = 700, height = 280, padL = 44, padR = 16, padT = 16, padB = 32;
  const allVals = [...paths.flat(), theta + 3 * statStd, theta - 3 * statStd];
  const ymin = Math.min(...allVals), ymax = Math.max(...allVals);

  const xS = (t: number) => padL + (t / n) * (width - padL - padR);
  const yS = (v: number) => padT + (ymax - v) / (ymax - ymin) * (height - padT - padB);

  return (
    <div className="visual-card">
      <div className="visual-title">Ornstein–Uhlenbeck: dX = κ(θ − X)dt + σ dW</div>
      <div className="control-row" style={{flexWrap: 'wrap', gap: '1rem'}}>
        <label>κ = {kappa.toFixed(1)}<input type="range" min="0.2" max="8" step="0.1" value={kappa} onChange={e => setKappa(Number(e.target.value))} /></label>
        <label>θ = {theta.toFixed(1)}<input type="range" min="-1" max="3" step="0.1" value={theta} onChange={e => setTheta(Number(e.target.value))} /></label>
        <label>σ = {sigma.toFixed(2)}<input type="range" min="0.05" max="1.5" step="0.05" value={sigma} onChange={e => setSigma(Number(e.target.value))} /></label>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="OU paths">
        {/* stationary ±1σ band (horizontal) */}
        <rect
          x={padL} y={yS(theta + statStd)} width={width - padL - padR}
          height={Math.abs(yS(theta + statStd) - yS(theta - statStd))}
          fill="rgba(16,185,129,0.08)"
        />
        {/* theta line */}
        <line x1={padL} x2={width - padR} y1={yS(theta)} y2={yS(theta)} stroke="#16a34a" strokeWidth={1.5} strokeDasharray="6 4" />
        {/* x0 marker */}
        <line x1={padL} x2={padL} y1={padT} y2={height - padB} stroke="#94a3b8" strokeWidth={1} />
        {paths.map((path, idx) => {
          const d = path.map((v, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(v)}`).join(' ');
          return <path key={idx} d={d} fill="none" strokeWidth={1.5} stroke={COLORS[idx]} opacity={0.7} />;
        })}
        {/* Mean path */}
        {(() => {
          const d = meanPath.map((v, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(v)}`).join(' ');
          return <path d={d} fill="none" strokeWidth={2.5} stroke="#1d4ed8" strokeDasharray="7 3" />;
        })()}
        <text x={padL} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">0</text>
        <text x={width - padR} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">T</text>
        <text x={width - padR - 4} y={yS(theta) - 4} fontSize={11} fill="#16a34a" textAnchor="end">θ={theta.toFixed(1)}</text>
        <text x={padL + 10} y={padT + 12} fontSize={11} fill="#1d4ed8">E[X_t] = θ + (x₀−θ)e^(−κt)</text>
        <text x={padL + 10} y={padT + 26} fontSize={11} fill="#64748b">Stationary σ_∞ = σ/√(2κ) = {statStd.toFixed(3)}</text>
      </svg>
      <div className="visual-caption">
        All paths are pulled toward θ at rate κ. Increasing κ tightens the band and speeds mean-reversion.
        The stationary distribution is N(θ, σ²/2κ). In finance, κ models interest-rate mean reversion speed.
      </div>
    </div>
  );
}
