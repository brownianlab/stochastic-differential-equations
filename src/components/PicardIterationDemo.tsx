import React, { useMemo, useState } from 'react';

// Picard iteration for dX = b(X)dt + σ dW, X_0 = x_0
// Illustration: linear SDE dX = -X dt + dW (OU with θ=0)
// True solution: X_t = x_0 * e^{-t} + ∫_0^t e^{-(t-s)} dW_s
// Picard: X^{(0)}_t = x_0, X^{(n+1)}_t = x_0 + ∫_0^t b(X^{(n)}_s) ds + W_t

// For b(x) = -x:
// X^{(0)}_t = x_0
// X^{(1)}_t = x_0 - x_0*t + W_t
// X^{(2)}_t = x_0 - x_0*t + x_0*t^2/2 - ∫_0^t W_s ds + W_t
// Converges to x_0*e^{-t} + ∫_0^t e^{-(t-s)} dW_s

function normalish(seed: number, k: number) {
  const u = Math.abs(Math.sin((seed + 5) * (k + 7) * 61.97));
  const v = Math.abs(Math.sin((seed + 3) * (k + 9) * 43.57));
  return Math.sqrt(-2 * Math.log(Math.max(u, 1e-9))) * Math.cos(2 * Math.PI * v);
}

function makeBMPath(n: number, seed: number) {
  const w = [0];
  for (let k = 0; k < n; k++) {
    w.push(w[k] + normalish(seed, k) / Math.sqrt(n));
  }
  return w;
}

// True OU solution via Euler with many steps
function trueOU(x0: number, w: number[], n: number) {
  const result = [x0];
  const dt = 1 / n;
  for (let k = 0; k < n; k++) {
    result.push(result[k] * (1 - dt) + (w[k + 1] - w[k]));
  }
  return result;
}

// Picard iterate 0: constant x_0
// Picard iterate 1: x_0 - x_0*t + W_t
// Picard iterate 2: x_0*(1 - t + t^2/2) - ∫W_s ds + W_t
// Approximate higher iterates numerically
function picardIterates(x0: number, w: number[], n: number, numIter: number) {
  const dt = 1 / n;
  const iterates: number[][] = [];

  // Iterate 0
  iterates.push(Array(n + 1).fill(x0));

  for (let iter = 0; iter < numIter; iter++) {
    const prev = iterates[iter];
    const next = [x0];
    for (let k = 0; k < n; k++) {
      // X^{n+1}_{k+1} = x_0 + ∫_0^{t_{k+1}} b(X^{n}_s) ds + W_{k+1}
      // Approximated by Euler: X^{n+1}_{k+1} = X^{n+1}_k + b(X^{n}_k)*dt + dW_k
      // But since X^{n+1}_0 = x_0, we use:
      next.push(next[k] + -prev[k] * dt + (w[k + 1] - w[k]));
    }
    iterates.push(next);
  }
  return iterates;
}

const ITER_COLORS = ['#94a3b8', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#7c3aed'];

export default function PicardIterationDemo() {
  const [numIter, setNumIter] = useState(3);
  const [seed, setSeed] = useState(0);
  const n = 200;
  const x0 = 1.5;

  const w = useMemo(() => makeBMPath(n, seed), [seed]);
  const truth = useMemo(() => trueOU(x0, w, n), [w]);
  const iterates = useMemo(() => picardIterates(x0, w, n, numIter), [w, numIter]);

  const width = 700,
    height = 260,
    padL = 40,
    padR = 16,
    padT = 16,
    padB = 36;
  const allVals = [...iterates.flat(), ...truth].filter(isFinite).filter((v) => Math.abs(v) < 15);
  const ymin = Math.min(...allVals, -3),
    ymax = Math.max(...allVals, 3);
  const xS = (t: number) => padL + (t / n) * (width - padL - padR);
  const yS = (v: number) =>
    padT + ((ymax - Math.min(Math.max(v, ymin), ymax)) / (ymax - ymin)) * (height - padT - padB);

  return (
    <div className="visual-card">
      <div className="visual-title">Picard iteration converging to OU solution dX = −X dt + dW</div>
      <div className="control-row" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <label>
          Iterations: {numIter}
          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={numIter}
            onChange={(e) => setNumIter(Number(e.target.value))}
          />
        </label>
        <label>
          Path seed: {seed}
          <input
            type="range"
            min="0"
            max="9"
            step="1"
            value={seed}
            onChange={(e) => setSeed(Number(e.target.value))}
          />
        </label>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Picard iteration">
        <line x1={padL} x2={width - padR} y1={yS(0)} y2={yS(0)} stroke="#e2e8f0" strokeWidth={1} />
        <line x1={padL} x2={padL} y1={padT} y2={height - padB} stroke="#94a3b8" strokeWidth={1} />
        {iterates.map((iter, i) => {
          const d = iter.map((v, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(v)}`).join(' ');
          const isLast = i === iterates.length - 1;
          return (
            <path
              key={i}
              d={d}
              fill="none"
              strokeWidth={isLast ? 2 : 1.5}
              stroke={ITER_COLORS[Math.min(i, ITER_COLORS.length - 1)]}
              opacity={i === 0 ? 0.5 : 0.85}
              strokeDasharray={i === 0 ? '4 3' : 'none'}
            />
          );
        })}
        {/* True solution */}
        {(() => {
          const d = truth.map((v, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(v)}`).join(' ');
          return <path d={d} fill="none" strokeWidth={3} stroke="#1d4ed8" opacity={0.9} />;
        })()}
        {/* Legend */}
        {iterates.map((_, i) => (
          <g key={i}>
            <line
              x1={padL + 8}
              y1={padT + 8 + i * 12}
              x2={padL + 22}
              y2={padT + 8 + i * 12}
              stroke={ITER_COLORS[Math.min(i, ITER_COLORS.length - 1)]}
              strokeWidth={1.8}
              strokeDasharray={i === 0 ? '4 3' : 'none'}
            />
            <text x={padL + 26} y={padT + 12 + i * 12} fontSize={10} fill="#64748b">
              {i === 0 ? 'X⁽⁰⁾ = x₀' : `X⁽${i}⁾`}
            </text>
          </g>
        ))}
        <line
          x1={padL + 8}
          y1={padT + 8 + iterates.length * 12}
          x2={padL + 22}
          y2={padT + 8 + iterates.length * 12}
          stroke="#1d4ed8"
          strokeWidth={3}
        />
        <text x={padL + 26} y={padT + 12 + iterates.length * 12} fontSize={10} fill="#1d4ed8">
          True solution
        </text>
        <text x={padL} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">
          0
        </text>
        <text x={width - padR} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">
          T=1
        </text>
      </svg>
      <div className="visual-caption">
        Picard iteration builds X⁽ⁿ⁺¹⁾ by plugging X⁽ⁿ⁾ into the drift integral. Starting from the
        constant x₀, each iterate adds one more term of the exponential expansion of e^−t. Under
        Lipschitz conditions the iterates converge in L² — this is the constructive proof of
        existence.
      </div>
    </div>
  );
}
