import React, {useMemo, useState} from 'react';

function seededStep(i: number) {
  const x = Math.sin(i * 999.137) * 10000;
  return x - Math.floor(x) > 0.5 ? 1 : -1;
}

function pathFor(n: number) {
  const pts = [{t: 0, y: 0}];
  let s = 0;
  for (let k = 1; k <= n; k++) {
    s += seededStep(k);
    pts.push({t: k / n, y: s / Math.sqrt(n)});
  }
  return pts;
}

export default function RandomWalkScaling() {
  const [n, setN] = useState(200);
  const pts = useMemo(() => pathFor(n), [n]);
  const width = 760, height = 300, pad = 36;
  const ys = pts.map(p => p.y);
  const ymin = Math.min(-3, ...ys), ymax = Math.max(3, ...ys);
  const x = (t: number) => pad + t * (width - 2 * pad);
  const y = (v: number) => height - pad - (v - ymin) / (ymax - ymin) * (height - 2 * pad);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'} ${x(p.t)} ${y(p.y)}`).join(' ');

  return (
    <div className="visual-card">
      <div className="visual-title">Random walk scaling: discrete paths becoming diffusion-like</div>
      <div className="control-row">
        <label>Number of steps: {n}</label>
        <input type="range" min="20" max="2000" step="20" value={n} onChange={e => setN(Number(e.target.value))} />
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Scaled random walk path">
        <line x1={pad} x2={width - pad} y1={y(0)} y2={y(0)} stroke="#94a3b8" strokeDasharray="4 4" />
        <line x1={pad} x2={pad} y1={pad} y2={height - pad} stroke="#cbd5e1" />
        <line x1={pad} x2={width - pad} y1={height - pad} y2={height - pad} stroke="#cbd5e1" />
        <path d={d} fill="none" stroke="#2563eb" strokeWidth="2.2" />
        <text x={width - pad - 8} y={height - 8} textAnchor="end" fontSize="13" fill="#475569">time t</text>
        <text x={8} y={pad} fontSize="13" fill="#475569">scaled position</text>
      </svg>
      <div className="visual-caption">The normalization S_floor(nt)/sqrt(n) keeps variance at time t of order t. Without this scaling, paths either collapse or explode.</div>
    </div>
  );
}
