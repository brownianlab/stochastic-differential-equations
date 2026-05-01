import React, {useMemo, useState} from 'react';

function brownianQV(n: number) {
  let sum = 0;
  for (let k = 1; k <= n; k++) {
    const u = Math.abs(Math.sin(k * 71.13));
    const v = Math.abs(Math.sin(k * 31.73));
    const z = Math.sqrt(-2 * Math.log(Math.max(u, 1e-6))) * Math.cos(2 * Math.PI * v);
    const dw = z / Math.sqrt(n);
    sum += dw * dw;
  }
  return sum;
}

function smoothQV(n: number) {
  let sum = 0;
  for (let k = 0; k < n; k++) {
    const t0 = k / n, t1 = (k + 1) / n;
    const dx = Math.sin(2 * Math.PI * t1) - Math.sin(2 * Math.PI * t0);
    sum += dx * dx;
  }
  return sum;
}

export default function QuadraticVariationDemo() {
  const [n, setN] = useState(50);
  const qv = useMemo(() => brownianQV(n), [n]);
  const sqv = useMemo(() => smoothQV(n), [n]);
  return (
    <div className="visual-card">
      <div className="visual-title">Quadratic variation: smooth paths versus Brownian paths</div>
      <div className="control-row">
        <label>Partition size: {n}</label>
        <input type="range" min="10" max="2000" step="10" value={n} onChange={e => setN(Number(e.target.value))} />
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
        <div><b>Smooth path</b><p>sum (Delta x)^2 ≈ {sqv.toFixed(4)}</p></div>
        <div><b>Brownian path</b><p>sum (Delta W)^2 ≈ {qv.toFixed(4)}</p></div>
      </div>
      <div className="visual-caption">As the partition refines, smooth quadratic variation tends to 0, while Brownian quadratic variation stabilizes near the horizon length T=1. This is the geometric reason (dW_t)^2 = dt.</div>
    </div>
  );
}
