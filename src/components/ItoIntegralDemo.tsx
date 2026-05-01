import React, {useMemo, useState} from 'react';

function normalish(i: number, j: number) {
  const u = Math.abs(Math.sin((i + 2) * (j + 7) * 57.29));
  const v = Math.abs(Math.sin((i + 9) * (j + 3) * 83.11));
  return Math.sqrt(-2 * Math.log(Math.max(u, 1e-9))) * Math.cos(2 * Math.PI * v);
}

function makeBMPath(n: number) {
  const pts: number[] = [0];
  for (let k = 1; k <= n; k++) {
    pts.push(pts[k - 1] + normalish(0, k) / Math.sqrt(n));
  }
  return pts;
}

// H_t = W_t (the integrand is Brownian motion itself)
// Ito sum = sum H_{t_k} * (W_{t_{k+1}} - W_{t_k})
function itoSum(bm: number[]) {
  let sum = 0;
  const n = bm.length - 1;
  for (let k = 0; k < n; k++) {
    sum += bm[k] * (bm[k + 1] - bm[k]); // LEFT endpoint (Ito)
  }
  return sum;
}

function stratoSum(bm: number[]) {
  let sum = 0;
  const n = bm.length - 1;
  for (let k = 0; k < n; k++) {
    const mid = (bm[k] + bm[k + 1]) / 2; // MIDPOINT (Stratonovich)
    sum += mid * (bm[k + 1] - bm[k]);
  }
  return sum;
}

export default function ItoIntegralDemo() {
  const [n, setN] = useState(40);
  const width = 700, height = 260, padL = 40, padR = 16, padT = 16, padB = 32;

  const bm = useMemo(() => makeBMPath(n), [n]);
  const itoVal = useMemo(() => itoSum(bm), [bm]);
  const stratoVal = useMemo(() => stratoSum(bm), [bm]);

  // Ito formula says: ∫₀¹ W_t dW_t = ½(W_1² - 1), i.e. itoVal ≈ ½(bm[n]² - 1)
  const itoFormula = 0.5 * (bm[n] * bm[n] - 1);

  const allY = bm;
  const ymin = Math.min(-2.5, ...allY), ymax = Math.max(2.5, ...allY);
  const xScale = (k: number) => padL + (k / n) * (width - padL - padR);
  const yScale = (v: number) => padT + (ymax - v) / (ymax - ymin) * (height - padT - padB);

  const pathD = bm.map((v, k) => `${k === 0 ? 'M' : 'L'} ${xScale(k)} ${yScale(v)}`).join(' ');
  const y0 = yScale(0);

  return (
    <div className="visual-card">
      <div className="visual-title">Itô integral as a left-endpoint Riemann sum over Brownian motion</div>
      <div className="control-row">
        <label>Partition size n = {n}</label>
        <input
          type="range" min="4" max="200" step="4" value={n}
          onChange={e => setN(Number(e.target.value))}
        />
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Itô integral approximation">
        {/* axis */}
        <line x1={padL} x2={width - padR} y1={y0} y2={y0} stroke="#94a3b8" strokeWidth={1} />
        <line x1={padL} x2={padL} y1={padT} y2={height - padB} stroke="#94a3b8" strokeWidth={1} />
        {/* shaded Ito rectangles */}
        {bm.slice(0, -1).map((v, k) => {
          const x0 = xScale(k), x1 = xScale(k + 1);
          const rh = yScale(0) - yScale(Math.abs(v)); // height magnitude
          const isPos = v >= 0;
          return (
            <rect
              key={k}
              x={x0} y={isPos ? yScale(v) : y0}
              width={x1 - x0 - 1} height={Math.abs(yScale(0) - yScale(v))}
              fill={isPos ? 'rgba(59,130,246,0.22)' : 'rgba(239,68,68,0.18)'}
            />
          );
        })}
        {/* BM path */}
        <path d={pathD} fill="none" strokeWidth={2} stroke="#1d4ed8" />
        {/* tick labels */}
        <text x={padL} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">0</text>
        <text x={width - padR} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">1</text>
        <text x={padL - 8} y={yScale(0) + 4} fontSize={11} fill="#64748b" textAnchor="end">0</text>
      </svg>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.75rem'}}>
        <div className="stat-chip">
          <span className="stat-label">Itô sum (left endpoint)</span>
          <span className="stat-value">{itoVal.toFixed(4)}</span>
        </div>
        <div className="stat-chip">
          <span className="stat-label">Stratonovich sum (midpoint)</span>
          <span className="stat-value">{stratoVal.toFixed(4)}</span>
        </div>
        <div className="stat-chip">
          <span className="stat-label">Itô formula: ½(W₁² − 1)</span>
          <span className="stat-value">{itoFormula.toFixed(4)}</span>
        </div>
      </div>
      <div className="visual-caption">
        Blue rectangles use H(t_k) — left endpoint, Itô convention. The Itô sum converges to ½(W₁² − 1),
        not ½W₁², because (dW)² = dt contributes an extra −½ correction — the Itô correction term.
        The Stratonovich midpoint sum converges to ½W₁².
      </div>
    </div>
  );
}
