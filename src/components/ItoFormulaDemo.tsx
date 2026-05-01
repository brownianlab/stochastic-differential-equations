import React, {useMemo, useState} from 'react';

function normalish(seed: number, k: number) {
  const u = Math.abs(Math.sin((seed + 1) * (k + 3) * 61.73));
  const v = Math.abs(Math.sin((seed + 7) * (k + 11) * 37.19));
  return Math.sqrt(-2 * Math.log(Math.max(u, 1e-9))) * Math.cos(2 * Math.PI * v);
}

function makeWPath(seed: number, n: number) {
  const pts: number[] = [0];
  for (let k = 1; k <= n; k++) {
    pts.push(pts[k - 1] + normalish(seed, k) / Math.sqrt(n));
  }
  return pts;
}

// f(x) = x^2
// By Ito: d(W^2) = 2W dW + dt, so W_t^2 = 2∫W dW + t
// Decompose W_t^2 into Ito-integral part (martingale) and drift part (t)
export default function ItoFormulaDemo() {
  const [funcType, setFuncType] = useState<'square' | 'exp'>('square');
  const n = 300;
  const numPaths = 6;

  const paths = useMemo(() =>
    Array.from({length: numPaths}, (_, i) => makeWPath(i * 17 + 3, n)),
    []
  );

  const width = 700, height = 280, padL = 44, padR = 16, padT = 16, padB = 32;

  // For each path, compute f(W_t)
  const fPaths = paths.map(w => {
    if (funcType === 'square') return w.map(v => v * v);
    return w.map(v => Math.exp(v - 0.5 * Array.from({length: n}, (_, k) => k / n).reduce((a, _, i) => a, 0)));
  });

  // Mean of f(W_t) at each time step
  const meanF = Array.from({length: n + 1}, (_, t) => {
    const vals = fPaths.map(fp => fp[t]);
    return vals.reduce((a, b) => a + b, 0) / numPaths;
  });

  // Ito formula prediction for E[f(W_t)]
  // For f=x^2: E[W_t^2] = t (the drift term)
  // For f=exp(x): E[e^{W_t}] = e^{t/2} (GBM with μ=0, σ=1)
  const itoMean = Array.from({length: n + 1}, (_, t) => {
    const tval = t / n;
    if (funcType === 'square') return tval;
    return Math.exp(0.5 * tval);
  });

  const allFVals = fPaths.flat();
  const ymin = Math.min(0, ...allFVals.slice(0, (n + 1) * numPaths).filter(isFinite));
  const ymax = Math.max(...allFVals.slice(0, (n + 1) * numPaths).filter(isFinite), funcType === 'square' ? 4 : 2);

  const xS = (t: number) => padL + (t / n) * (width - padL - padR);
  const yS = (v: number) => padT + (ymax - Math.min(Math.max(v, ymin), ymax)) / (ymax - ymin) * (height - padT - padB);

  const colors = ['#3b82f6','#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b'];

  return (
    <div className="visual-card">
      <div className="visual-title">
        Itô formula: f(W_t) decomposes into martingale + drift correction
      </div>
      <div className="control-row">
        <label>Function:</label>
        <button
          className={funcType === 'square' ? 'btn-active' : 'btn-inactive'}
          onClick={() => setFuncType('square')}
          style={{marginRight: '0.5rem'}}
        >
          f(x) = x²
        </button>
        <button
          className={funcType === 'exp' ? 'btn-active' : 'btn-inactive'}
          onClick={() => setFuncType('exp')}
        >
          f(x) = eˣ
        </button>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Itô formula decomposition">
        <line x1={padL} x2={width - padR} y1={yS(0)} y2={yS(0)} stroke="#e2e8f0" strokeWidth={1} />
        <line x1={padL} x2={padL} y1={padT} y2={height - padB} stroke="#94a3b8" strokeWidth={1} />
        {/* Individual sample paths */}
        {fPaths.map((fp, idx) => {
          const d = fp.map((v, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(v)}`).join(' ');
          return <path key={idx} d={d} fill="none" strokeWidth={1.2} stroke={colors[idx]} opacity={0.4} />;
        })}
        {/* MC mean */}
        {(() => {
          const d = meanF.map((v, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(v)}`).join(' ');
          return <path d={d} fill="none" strokeWidth={2.5} stroke="#dc2626" strokeDasharray="6 3" />;
        })()}
        {/* Ito formula prediction */}
        {(() => {
          const d = itoMean.map((v, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(v)}`).join(' ');
          return <path d={d} fill="none" strokeWidth={2.5} stroke="#16a34a" />;
        })()}
        {/* axis labels */}
        <text x={padL} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">0</text>
        <text x={width - padR} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">1</text>
        <text x={padL - 6} y={yS(1) + 4} fontSize={11} fill="#64748b" textAnchor="end">1</text>
        {/* legend */}
        <rect x={padL + 10} y={padT + 4} width={12} height={3} fill="#dc2626" opacity={0.7} />
        <text x={padL + 26} y={padT + 9} fontSize={11} fill="#64748b">Monte Carlo mean</text>
        <rect x={padL + 10} y={padT + 16} width={12} height={3} fill="#16a34a" />
        <text x={padL + 26} y={padT + 21} fontSize={11} fill="#64748b">
          {funcType === 'square' ? 'Itô formula: E[W_t²] = t' : 'Itô formula: E[e^{W_t}] = e^{t/2}'}
        </text>
      </svg>
      <div className="visual-caption">
        {funcType === 'square'
          ? 'Itô: d(W²) = 2W dW + dt. Taking expectations: E[W_t²] = t. Without the correction term dt, classical calculus would predict E[W_t²] = 0 (wrong).'
          : 'Itô: d(e^W) = e^W dW + ½e^W dt. So E[e^{W_t}] = e^{t/2}. The ½t exponent is the Itô correction from (dW)² = dt.'}
      </div>
    </div>
  );
}
