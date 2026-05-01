import React, {useMemo, useState} from 'react';

// Visualize the generator of Brownian motion: Lf = (1/2) f''
// Show how E[f(W_t) | W_0 = x] evolves as a heat equation solution
// f(x) = x^2: Lf = 1, so E[W_t^2 | W_0=x] = x^2 + t (Dynkin formula)
// f(x) = x^4: Lf = 6x^2, so E[W_t^4 | W_0=x] = x^4 + 6x^2*t + 3t^2

// For GBM generator: Lf = μx f' + (1/2)σ^2 x^2 f''

function normalish(seed: number, k: number) {
  const u = Math.abs(Math.sin((seed + 3) * (k + 8) * 57.91));
  const v = Math.abs(Math.sin((seed + 11) * (k + 2) * 43.17));
  return Math.sqrt(-2 * Math.log(Math.max(u, 1e-9))) * Math.cos(2 * Math.PI * v);
}

type FuncKey = 'square' | 'quartic' | 'exp';

const funcs: Record<FuncKey, {
  label: string; f: (x: number) => number;
  Ef: (x: number, t: number) => number; // E[f(W_t) | W_0 = x]
  Lf: (x: number) => number;
  dynkinLabel: string;
}> = {
  square: {
    label: 'f(x) = x²',
    f: x => x * x,
    Ef: (x, t) => x * x + t,          // E[W_t^2 | W_0=x] = x^2 + t
    Lf: _ => 1,
    dynkinLabel: 'E[W_t² | W₀=x] = x² + t  (Lf = 1)',
  },
  quartic: {
    label: 'f(x) = x⁴',
    f: x => x * x * x * x,
    Ef: (x, t) => x**4 + 6*x*x*t + 3*t*t, // E[W_t^4 | W_0=x]
    Lf: x => 6 * x * x,
    dynkinLabel: 'E[W_t⁴ | W₀=x] = x⁴ + 6x²t + 3t²  (Lf = 6x²)',
  },
  exp: {
    label: 'f(x) = eˣ',
    f: x => Math.exp(x),
    Ef: (x, t) => Math.exp(x + 0.5 * t), // E[e^{W_t} | W_0=x] = e^{x+t/2}
    Lf: x => 0.5 * Math.exp(x),
    dynkinLabel: 'E[e^{W_t} | W₀=x] = eˣ⁺ᵗ/²  (Lf = ½eˣ)',
  },
};

export default function GeneratorDemo() {
  const [funcKey, setFuncKey] = useState<FuncKey>('square');
  const [t, setT] = useState(0.5);
  const fn = funcs[funcKey];

  const xVals = useMemo(() => Array.from({length: 61}, (_, i) => -3 + i * 0.1), []);
  const fVals = xVals.map(x => fn.f(x));
  const efVals = xVals.map(x => fn.Ef(x, t));
  const lfVals = xVals.map(x => fn.Lf(x));

  const width = 700, height = 270, padL = 48, padR = 16, padT = 16, padB = 36;

  const allY = [...fVals, ...efVals].filter(isFinite).filter(v => Math.abs(v) < 200);
  const ymin = Math.min(...allY), ymax = Math.max(...allY);
  const xS = (i: number) => padL + (i / (xVals.length - 1)) * (width - padL - padR);
  const yS = (v: number) => padT + (ymax - Math.min(Math.max(v, ymin), ymax)) / (ymax - ymin) * (height - padT - padB);
  const zeroY = yS(0);

  const dF = fVals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xS(i)} ${yS(v)}`).join(' ');
  const dEf = efVals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xS(i)} ${yS(v)}`).join(' ');

  // x=0 mark
  const x0Idx = xVals.findIndex(x => x >= 0);

  return (
    <div className="visual-card">
      <div className="visual-title">Generator L = ½∂²/∂x² for Brownian motion: Dynkin's formula</div>
      <div className="control-row" style={{flexWrap:'wrap',gap:'0.75rem'}}>
        {(Object.keys(funcs) as FuncKey[]).map(k => (
          <button key={k} className={funcKey === k ? 'btn-active' : 'btn-inactive'}
            onClick={() => setFuncKey(k)} style={{marginRight:'0.5rem'}}>
            {funcs[k].label}
          </button>
        ))}
        <label>t = {t.toFixed(2)}<input type="range" min="0" max="2" step="0.05" value={t} onChange={e => setT(Number(e.target.value))} /></label>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Generator Dynkin formula">
        <line x1={padL} x2={width - padR} y1={zeroY} y2={zeroY} stroke="#e2e8f0" strokeWidth={1} />
        {x0Idx >= 0 && <line x1={xS(x0Idx)} x2={xS(x0Idx)} y1={padT} y2={height - padB} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 3" />}
        <line x1={padL} x2={padL} y1={padT} y2={height - padB} stroke="#94a3b8" strokeWidth={1} />
        <path d={dF} fill="none" strokeWidth={2} stroke="#94a3b8" strokeDasharray="6 3" />
        <path d={dEf} fill="none" strokeWidth={2.5} stroke="#2563eb" />
        <line x1={padL+8} y1={padT+8} x2={padL+22} y2={padT+8} stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 3" />
        <text x={padL+26} y={padT+12} fontSize={11} fill="#64748b">f(x) at t=0</text>
        <line x1={padL+8} y1={padT+20} x2={padL+22} y2={padT+20} stroke="#2563eb" strokeWidth={2.5} />
        <text x={padL+26} y={padT+24} fontSize={11} fill="#64748b">E[f(W_t)|W₀=x]</text>
        <text x={padL} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">−3</text>
        <text x={width - padR} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">3</text>
        {x0Idx >= 0 && <text x={xS(x0Idx)} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">0</text>}
      </svg>
      <div className="stat-chip" style={{marginTop:'0.5rem'}}>
        <span className="stat-label">Dynkin's formula</span>
        <span className="stat-value">{fn.dynkinLabel}</span>
      </div>
      <div className="visual-caption">
        Dynkin's formula: E[f(W_t)|W₀=x] = f(x) + t·Lf(x) + O(t²). The generator L = ½∂² measures
        the instantaneous rate of change of E[f(W_t)] at t=0. This connects martingale theory to PDEs:
        if M_t = f(W_t) − ∫₀ᵗ Lf(W_s)ds is a martingale, then Lf = 0 characterizes harmonic functions.
      </div>
    </div>
  );
}
