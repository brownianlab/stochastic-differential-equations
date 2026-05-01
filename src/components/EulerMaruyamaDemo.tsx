import React, {useMemo, useState} from 'react';

function normalish(seed: number, k: number) {
  const u = Math.abs(Math.sin((seed + 5) * (k + 4) * 63.97));
  const v = Math.abs(Math.sin((seed + 9) * (k + 6) * 41.73));
  return Math.sqrt(-2 * Math.log(Math.max(u, 1e-9))) * Math.cos(2 * Math.PI * v);
}

// Exact GBM increments
function makeExactGBM(seed: number, n: number, mu: number, sigma: number) {
  // Exact: S_t = S_0 * exp((mu - sigma^2/2)*t + sigma*W_t)
  // Generate the BM path first, then apply exact formula
  const dt = 1 / n;
  const bm: number[] = [0];
  for (let k = 0; k < n; k++) {
    bm.push(bm[k] + normalish(seed, k) * Math.sqrt(dt));
  }
  return bm.map((w, i) => 100 * Math.exp((mu - 0.5 * sigma * sigma) * (i / n) + sigma * w));
}

function makeEulerGBM(seed: number, n: number, mu: number, sigma: number, steps: number) {
  // Euler-Maruyama on sub-steps then sampled at original grid
  const dt = 1 / n;
  const subdt = 1 / steps;
  const pts: number[] = [100];
  for (let i = 0; i < steps; i++) {
    const z = normalish(seed, i + 1000);
    pts.push(pts[i] * (1 + mu * subdt + sigma * Math.sqrt(subdt) * z));
  }
  // Sample at n points
  const result: number[] = [];
  for (let t = 0; t <= n; t++) {
    const idx = Math.round(t * steps / n);
    result.push(pts[Math.min(idx, pts.length - 1)]);
  }
  return result;
}

export default function EulerMaruyamaDemo() {
  const [eulerSteps, setEulerSteps] = useState(20);
  const [sigma, setSigma] = useState(0.3);
  const mu = 0.1;
  const n = 100;

  const exact = useMemo(() => makeExactGBM(7, n, mu, sigma), [sigma]);
  const euler = useMemo(() => makeEulerGBM(7, n, mu, sigma, eulerSteps), [sigma, eulerSteps]);

  // Pointwise error
  const maxErr = Math.max(...exact.map((v, i) => Math.abs(v - euler[i])));
  const rmsErr = Math.sqrt(exact.reduce((acc, v, i) => acc + (v - euler[i]) ** 2, 0) / (n + 1));

  const width = 700, height = 270, padL = 44, padR = 16, padT = 16, padB = 32;
  const allVals = [...exact, ...euler].filter(isFinite);
  const ymin = Math.min(...allVals) * 0.95, ymax = Math.max(...allVals) * 1.05;

  const xS = (t: number) => padL + (t / n) * (width - padL - padR);
  const yS = (v: number) => padT + (ymax - Math.min(Math.max(v, ymin), ymax)) / (ymax - ymin) * (height - padT - padB);

  const dExact = exact.map((v, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(v)}`).join(' ');
  const dEuler = euler.map((v, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(v)}`).join(' ');

  return (
    <div className="visual-card">
      <div className="visual-title">Euler–Maruyama vs exact GBM solution</div>
      <div className="control-row" style={{flexWrap:'wrap', gap:'1rem'}}>
        <label>Euler steps: {eulerSteps}<input type="range" min="5" max="500" step="5" value={eulerSteps} onChange={e => setEulerSteps(Number(e.target.value))} /></label>
        <label>σ = {sigma.toFixed(2)}<input type="range" min="0.05" max="0.8" step="0.01" value={sigma} onChange={e => setSigma(Number(e.target.value))} /></label>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Euler-Maruyama vs exact">
        <line x1={padL} x2={width - padR} y1={yS(100)} y2={yS(100)} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 3" />
        <line x1={padL} x2={padL} y1={padT} y2={height - padB} stroke="#94a3b8" strokeWidth={1} />
        {/* Error band */}
        {(() => {
          const upperD = exact.map((v, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(v)}`).join(' ');
          const lowerD = euler.map((v, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(v)}`).join(' ');
          const fillD = [
            ...exact.map((v, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(v)}`),
            ...euler.map((v, t) => `L ${xS(n - t)} ${yS(euler[n - t])}`).reverse(),
            'Z'
          ].join(' ');
          return <path d={fillD} fill="rgba(239,68,68,0.12)" />;
        })()}
        <path d={dExact} fill="none" strokeWidth={2.5} stroke="#2563eb" />
        <path d={dEuler} fill="none" strokeWidth={2} stroke="#dc2626" strokeDasharray="6 3" />
        {/* Step markers for small n */}
        {eulerSteps <= 30 && euler.filter((_, t) => t % Math.ceil(n / eulerSteps) === 0).map((v, i) => {
          const t = i * Math.ceil(n / eulerSteps);
          return <circle key={i} cx={xS(Math.min(t, n))} cy={yS(v)} r={3} fill="#dc2626" />;
        })}
        <line x1={padL+8} y1={padT+8} x2={padL+22} y2={padT+8} stroke="#2563eb" strokeWidth={2.5} />
        <text x={padL+26} y={padT+12} fontSize={11} fill="#64748b">Exact solution</text>
        <line x1={padL+8} y1={padT+20} x2={padL+22} y2={padT+20} stroke="#dc2626" strokeWidth={2} strokeDasharray="5 3" />
        <text x={padL+26} y={padT+24} fontSize={11} fill="#64748b">Euler–Maruyama</text>
        <text x={padL} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">0</text>
        <text x={width - padR} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">T=1</text>
      </svg>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginTop:'0.5rem'}}>
        <div className="stat-chip">
          <span className="stat-label">Max pointwise error</span>
          <span className="stat-value">{maxErr.toFixed(4)}</span>
        </div>
        <div className="stat-chip">
          <span className="stat-label">RMS error</span>
          <span className="stat-value">{rmsErr.toFixed(4)}</span>
        </div>
      </div>
      <div className="visual-caption">
        Euler–Maruyama replaces dS = μS dt + σS dW by ΔS ≈ μS·Δt + σS·√Δt·Z. Strong order 0.5:
        the path error is O(√Δt). Milstein adds the first-order Itô correction to reach strong order 1.
        Increase the step count to watch the error shrink.
      </div>
    </div>
  );
}
