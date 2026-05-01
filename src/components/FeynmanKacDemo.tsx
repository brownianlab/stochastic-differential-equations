import React, {useMemo, useState} from 'react';

// Feynman-Kac: u(t,x) = E[g(X_T) | X_t = x]
// where dX = 0*dt + dW (pure BM)
// and g(x) = max(x, 0) (call payoff with K=0), or g(x) = x^2
// u(0,x) = E[g(W_T)] = E[max(W_T, 0)] or E[W_T^2]
//
// For g(x) = max(x,0): u(0,x) = E[max(x+W_T, 0)]
//   = x * N(x/sqrt(T)) + sqrt(T) * phi(x/sqrt(T))  [Black-Scholes at r=0, K=0]
//
// For g(x) = x^2: u(0,x) = x^2 + T (Ito formula)
//
// PDE: du/dt + (1/2) d^2u/dx^2 = 0, u(T,x) = g(x)

function normCDF(z: number) {
  const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;
  const s = z < 0 ? -1 : 1;
  const t = 1 / (1 + p * Math.abs(z));
  const y = 1 - (((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-z*z/2);
  return 0.5 * (1 + s * y);
}
function normPDF(z: number) { return Math.exp(-z*z/2) / Math.sqrt(2*Math.PI); }

type GType = 'call' | 'square' | 'abs';

function analyticalU(x: number, tau: number, g: GType): number {
  // tau = T - t: time to maturity
  if (tau <= 1e-10) {
    if (g === 'call') return Math.max(x, 0);
    if (g === 'square') return x * x;
    return Math.abs(x);
  }
  const sqrtTau = Math.sqrt(tau);
  if (g === 'call') {
    // E[max(x+W_tau,0)] = x*N(x/sqrt(tau)) + sqrt(tau)*phi(x/sqrt(tau))
    const d = x / sqrtTau;
    return x * normCDF(d) + sqrtTau * normPDF(d);
  }
  if (g === 'square') {
    // E[(x+W_tau)^2] = x^2 + tau
    return x * x + tau;
  }
  // abs: E[|x+W_tau|]
  const d = x / sqrtTau;
  return x * (2 * normCDF(d) - 1) + 2 * sqrtTau * normPDF(d);
}

// Monte Carlo estimate of u(0, x0)
function normalish(seed: number, k: number) {
  const u = Math.abs(Math.sin((seed + 4) * (k + 7) * 61.43));
  const v = Math.abs(Math.sin((seed + 9) * (k + 3) * 47.19));
  return Math.sqrt(-2 * Math.log(Math.max(u, 1e-9))) * Math.cos(2 * Math.PI * v);
}

function mcEstimate(x0: number, T: number, g: GType, nPaths = 1000) {
  let sum = 0;
  for (let i = 0; i < nPaths; i++) {
    let w = 0;
    const steps = 50;
    for (let k = 0; k < steps; k++) {
      w += normalish(i, k) * Math.sqrt(T / steps);
    }
    const xT = x0 + w;
    if (g === 'call') sum += Math.max(xT, 0);
    else if (g === 'square') sum += xT * xT;
    else sum += Math.abs(xT);
  }
  return sum / nPaths;
}

export default function FeynmanKacDemo() {
  const [g, setG] = useState<GType>('call');
  const [T, setT] = useState(1.0);

  const xVals = useMemo(() => Array.from({length: 81}, (_, i) => -4 + i * 0.1), []);
  const gVals = xVals.map(x => g === 'call' ? Math.max(x, 0) : g === 'square' ? x*x : Math.abs(x));
  const uVals = xVals.map(x => analyticalU(x, T, g));
  const mcVal = useMemo(() => mcEstimate(0, T, g), [T, g]);
  const trueVal = analyticalU(0, T, g);

  const width = 700, height = 260, padL = 44, padR = 16, padT = 16, padB = 36;
  const allY = [...gVals, ...uVals].filter(isFinite).filter(v => Math.abs(v) < 30);
  const ymin = Math.min(0, ...allY), ymax = Math.max(...allY) * 1.05;
  const xS = (i: number) => padL + (i / (xVals.length - 1)) * (width - padL - padR);
  const yS = (v: number) => padT + (ymax - Math.min(Math.max(v, ymin), ymax)) / (ymax - ymin) * (height - padT - padB);

  const dG = gVals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xS(i)} ${yS(v)}`).join(' ');
  const dU = uVals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xS(i)} ${yS(v)}`).join(' ');
  const zeroY = yS(0);
  const x0Idx = xVals.findIndex(x => x >= 0);

  return (
    <div className="visual-card">
      <div className="visual-title">Feynman–Kac: u(0,x) = E[g(x + W_T)] solves the heat PDE</div>
      <div className="control-row" style={{flexWrap:'wrap',gap:'0.75rem'}}>
        {(['call','square','abs'] as GType[]).map(k => (
          <button key={k} className={g === k ? 'btn-active' : 'btn-inactive'}
            onClick={() => setG(k)} style={{marginRight:'0.5rem'}}>
            {k === 'call' ? 'g(x) = max(x,0)' : k === 'square' ? 'g(x) = x²' : 'g(x) = |x|'}
          </button>
        ))}
        <label>T = {T.toFixed(2)}<input type="range" min="0.1" max="3" step="0.05" value={T} onChange={e => setT(Number(e.target.value))} /></label>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Feynman-Kac solution">
        <line x1={padL} x2={width - padR} y1={zeroY} y2={zeroY} stroke="#e2e8f0" strokeWidth={1} />
        {x0Idx >= 0 && <line x1={xS(x0Idx)} x2={xS(x0Idx)} y1={padT} y2={height - padB} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 3" />}
        <line x1={padL} x2={padL} y1={padT} y2={height - padB} stroke="#94a3b8" strokeWidth={1} />
        <path d={dG} fill="none" strokeWidth={2} stroke="#94a3b8" strokeDasharray="6 3" />
        <path d={dU} fill="none" strokeWidth={2.5} stroke="#2563eb" />
        {/* Monte Carlo dot at x=0 */}
        <circle cx={xS(x0Idx)} cy={yS(mcVal)} r={5} fill="#dc2626" opacity={0.8} />
        <line x1={padL+8} y1={padT+8} x2={padL+22} y2={padT+8} stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 3" />
        <text x={padL+26} y={padT+12} fontSize={11} fill="#64748b">Terminal payoff g(x)</text>
        <line x1={padL+8} y1={padT+20} x2={padL+22} y2={padT+20} stroke="#2563eb" strokeWidth={2.5} />
        <text x={padL+26} y={padT+24} fontSize={11} fill="#64748b">u(0,x) = E[g(x+W_T)] (PDE sol.)</text>
        <circle cx={padL+14} cy={padT+33} r={4} fill="#dc2626" opacity={0.8} />
        <text x={padL+26} y={padT+37} fontSize={11} fill="#64748b">Monte Carlo at x=0</text>
        <text x={padL} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">−4</text>
        <text x={width - padR} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">4</text>
      </svg>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginTop:'0.5rem'}}>
        <div className="stat-chip">
          <span className="stat-label">PDE solution at x=0</span>
          <span className="stat-value">{trueVal.toFixed(5)}</span>
        </div>
        <div className="stat-chip">
          <span className="stat-label">Monte Carlo E[g(W_T)]</span>
          <span className="stat-value">{mcVal.toFixed(5)}</span>
        </div>
      </div>
      <div className="visual-caption">
        Feynman–Kac says the PDE solution equals a conditional expectation. The blue curve is the exact
        PDE solution u(0,x); the grey dashed curve is the terminal payoff g(x). The red dot is the
        Monte Carlo estimate at x=0 — it matches the PDE solution by design. In finance, u = option price.
      </div>
    </div>
  );
}
