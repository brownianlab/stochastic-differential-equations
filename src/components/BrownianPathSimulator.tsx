import React from 'react';

function normalish(i: number, j: number) {
  const u = Math.abs(Math.sin((i + 1) * (j + 3) * 91.17));
  const v = Math.abs(Math.sin((i + 5) * (j + 11) * 43.91));
  return Math.sqrt(-2 * Math.log(Math.max(u, 1e-6))) * Math.cos(2 * Math.PI * v);
}

function makePath(seed: number, n = 260) {
  let y = 0;
  const pts = [{t: 0, y: 0}];
  for (let k = 1; k <= n; k++) {
    y += normalish(seed, k) / Math.sqrt(n);
    pts.push({t: k / n, y});
  }
  return pts;
}

export default function BrownianPathSimulator() {
  const width = 760, height = 320, pad = 36;
  const paths = [0, 1, 2, 3, 4].map(seed => makePath(seed));
  const allY = paths.flat().map(p => p.y);
  const ymin = Math.min(-3, ...allY), ymax = Math.max(3, ...allY);
  const x = (t: number) => pad + t * (width - 2 * pad);
  const y = (v: number) => height - pad - (v - ymin) / (ymax - ymin) * (height - 2 * pad);
  return (
    <div className="visual-card">
      <div className="visual-title">Brownian motion as a distribution over paths</div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Multiple Brownian sample paths">
        <line x1={pad} x2={width - pad} y1={y(0)} y2={y(0)} stroke="#94a3b8" strokeDasharray="4 4" />
        {paths.map((pts, idx) => {
          const d = pts.map((p, i) => `${i ? 'L' : 'M'} ${x(p.t)} ${y(p.y)}`).join(' ');
          return <path key={idx} d={d} fill="none" strokeWidth="2" stroke={`hsl(${210 + idx * 24}, 80%, 45%)`} opacity="0.85" />;
        })}
      </svg>
      <div className="visual-caption">One outcome omega gives one continuous curve t → W_t(omega). Brownian motion is the full distribution on such curves, not a single curve.</div>
    </div>
  );
}
