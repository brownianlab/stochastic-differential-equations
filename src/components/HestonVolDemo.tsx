import React, {useMemo, useState} from 'react';

function normalish(seed: number, k: number) {
  const u = Math.abs(Math.sin((seed + 1) * (k + 5) * 67.13));
  const v = Math.abs(Math.sin((seed + 8) * (k + 2) * 43.71));
  return Math.sqrt(-2 * Math.log(Math.max(u, 1e-9))) * Math.cos(2 * Math.PI * v);
}

function normalish2(seed: number, k: number) {
  const u = Math.abs(Math.sin((seed + 12) * (k + 7) * 89.53));
  const v = Math.abs(Math.sin((seed + 3) * (k + 14) * 31.97));
  return Math.sqrt(-2 * Math.log(Math.max(u, 1e-9))) * Math.cos(2 * Math.PI * v);
}

// Heston model:
// dS = μS dt + sqrt(V)*S dW1
// dV = κ(θ-V)dt + ξ sqrt(V) dW2
// corr(dW1,dW2) = ρ
function makeHeston(seed: number, n: number, kappa: number, theta: number, xi: number, rho: number, V0: number) {
  const dt = 1 / n;
  const S: number[] = [100];
  const V: number[] = [V0];
  for (let k = 0; k < n; k++) {
    const z1 = normalish(seed, k);
    const z2 = normalish2(seed, k);
    const w1 = z1;
    const w2 = rho * z1 + Math.sqrt(1 - rho * rho) * z2;
    const Vk = Math.max(V[k], 0);
    const sqrtV = Math.sqrt(Vk);
    const newV = Math.max(Vk + kappa * (theta - Vk) * dt + xi * sqrtV * Math.sqrt(dt) * w2, 0);
    const newS = S[k] * Math.exp(-0.5 * Vk * dt + sqrtV * Math.sqrt(dt) * w1);
    S.push(newS);
    V.push(newV);
  }
  return {S, V};
}

export default function HestonVolDemo() {
  const [kappa, setKappa] = useState(2.0);
  const [theta, setTheta] = useState(0.04);
  const [xi, setXi] = useState(0.5);
  const [rho, setRho] = useState(-0.7);
  const [view, setView] = useState<'price' | 'vol'>('price');
  const n = 252;
  const numPaths = 4;
  const V0 = 0.04;

  const allPaths = useMemo(() =>
    Array.from({length: numPaths}, (_, i) => makeHeston(i * 19 + 2, n, kappa, theta, xi, rho, V0)),
    [kappa, theta, xi, rho]
  );

  const width = 700, height = 260, padL = 44, padR = 16, padT = 16, padB = 32;
  const COLORS = ['#2563eb','#7c3aed','#dc2626','#059669'];

  const data = view === 'price' ? allPaths.map(p => p.S) : allPaths.map(p => p.V.map(v => Math.sqrt(v) * 100));

  const allVals = data.flat().filter(isFinite);
  const ymin = Math.min(...allVals) * 0.95, ymax = Math.max(...allVals) * 1.05;
  const xS = (t: number) => padL + (t / n) * (width - padL - padR);
  const yS = (v: number) => padT + (ymax - Math.min(Math.max(v, ymin), ymax)) / (ymax - ymin) * (height - padT - padB);

  const label = view === 'price' ? 'Asset price S_t (S₀=100)' : 'Instantaneous vol √V_t × 100 (%)';
  const baseline = view === 'price' ? 100 : Math.sqrt(theta) * 100;

  return (
    <div className="visual-card">
      <div className="visual-title">Heston stochastic volatility model</div>
      <div className="control-row" style={{flexWrap:'wrap', gap:'0.75rem'}}>
        <label>κ={kappa.toFixed(1)}<input type="range" min="0.2" max="6" step="0.1" value={kappa} onChange={e => setKappa(Number(e.target.value))} /></label>
        <label>θ={theta.toFixed(3)}<input type="range" min="0.01" max="0.16" step="0.002" value={theta} onChange={e => setTheta(Number(e.target.value))} /></label>
        <label>ξ={xi.toFixed(2)}<input type="range" min="0.1" max="1.5" step="0.05" value={xi} onChange={e => setXi(Number(e.target.value))} /></label>
        <label>ρ={rho.toFixed(2)}<input type="range" min="-0.99" max="0.99" step="0.01" value={rho} onChange={e => setRho(Number(e.target.value))} /></label>
      </div>
      <div className="control-row">
        <button className={view === 'price' ? 'btn-active' : 'btn-inactive'} onClick={() => setView('price')} style={{marginRight:'0.5rem'}}>Asset price</button>
        <button className={view === 'vol' ? 'btn-active' : 'btn-inactive'} onClick={() => setView('vol')}>Volatility</button>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Heston model">
        <line x1={padL} x2={width - padR} y1={yS(baseline)} y2={yS(baseline)} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 3" />
        <line x1={padL} x2={padL} y1={padT} y2={height - padB} stroke="#94a3b8" strokeWidth={1} />
        {data.map((path, idx) => {
          const d = path.map((v, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(v)}`).join(' ');
          return <path key={idx} d={d} fill="none" strokeWidth={1.8} stroke={COLORS[idx]} opacity={0.8} />;
        })}
        <text x={padL} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">0</text>
        <text x={width - padR} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">1yr</text>
        <text x={padL + 10} y={padT + 14} fontSize={12} fill="#475569">{label}</text>
        {view === 'vol' && (
          <text x={width - padR - 4} y={yS(baseline) - 4} fontSize={11} fill="#16a34a" textAnchor="end">θ (long-run vol = {(Math.sqrt(theta)*100).toFixed(1)}%)</text>
        )}
      </svg>
      <div className="visual-caption">
        Heston: vol is stochastic, mean-reverting. ρ &lt; 0 (leverage effect) creates the implied volatility
        skew: OTM puts are expensive, OTM calls are cheap. Increasing ξ (vol-of-vol) steepens the smile.
        Feller condition 2κθ &gt; ξ² keeps vol strictly positive.
      </div>
    </div>
  );
}
