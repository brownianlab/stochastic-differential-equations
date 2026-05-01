import React, {useMemo, useState} from 'react';

function normalish(seed: number, k: number) {
  const u = Math.abs(Math.sin((seed + 3) * (k + 7) * 43.91));
  const v = Math.abs(Math.sin((seed + 8) * (k + 2) * 67.29));
  return Math.sqrt(-2 * Math.log(Math.max(u, 1e-9))) * Math.cos(2 * Math.PI * v);
}

function makeDriftedBM(seed: number, n: number, theta: number) {
  // Under P: W_t is BM
  // Under Q: W~_t = W_t + theta*t is BM, so W_t = W~_t - theta*t is drifted
  const pts: number[] = [0];
  for (let k = 0; k < n; k++) {
    const z = normalish(seed, k);
    pts.push(pts[k] + z / Math.sqrt(n));
  }
  // The drifted path under P: X_t = theta*t + W_t
  return pts.map((w, t) => ({ w, x: theta * t / n + w }));
}

const COLORS_BM = ['#3b82f6','#6366f1','#8b5cf6','#06b6d4','#64748b'];
const COLORS_DRIFT = ['#ef4444','#f97316','#eab308','#ec4899','#dc2626'];

export default function GirsanovDemo() {
  const [theta, setTheta] = useState(1.0);
  const n = 200;
  const numPaths = 5;

  const pairs = useMemo(() =>
    Array.from({length: numPaths}, (_, i) => makeDriftedBM(i * 11 + 2, n, theta)),
    [theta]
  );

  const width = 700, height = 260, padL = 40, padR = 16, padT = 16, padB = 36;

  const allW = pairs.flatMap(p => p.map(q => q.w));
  const allX = pairs.flatMap(p => p.map(q => q.x));
  const ymin = Math.min(-3, ...allW, ...allX);
  const ymax = Math.max(3, ...allW, ...allX);

  const xS = (t: number) => padL + (t / n) * (width - padL - padR);
  const yS = (v: number) => padT + (ymax - v) / (ymax - ymin) * (height - padT - padB);

  // Terminal histogram bins
  const termW = pairs.map(p => p[n].w);
  const termX = pairs.map(p => p[n].x);

  return (
    <div className="visual-card">
      <div className="visual-title">Girsanov: drift θ removed by change of measure</div>
      <div className="control-row">
        <label>θ = {theta.toFixed(2)}</label>
        <input type="range" min="-2" max="2" step="0.05" value={theta} onChange={e => setTheta(Number(e.target.value))} />
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Girsanov measure change">
        <line x1={padL} x2={width - padR} y1={yS(0)} y2={yS(0)} stroke="#e2e8f0" strokeWidth={1} />
        <line x1={padL} x2={padL} y1={padT} y2={height - padB} stroke="#94a3b8" strokeWidth={1} />
        {/* Drifted paths under P (X = θt + W) */}
        {pairs.map((p, idx) => {
          const d = p.map((q, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(q.x)}`).join(' ');
          return <path key={`x${idx}`} d={d} fill="none" strokeWidth={1.5} stroke={COLORS_DRIFT[idx]} opacity={0.7} />;
        })}
        {/* BM under Q (just W, no drift) */}
        {pairs.map((p, idx) => {
          const d = p.map((q, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(q.w)}`).join(' ');
          return <path key={`w${idx}`} d={d} fill="none" strokeWidth={1.5} stroke={COLORS_BM[idx]} opacity={0.7} />;
        })}
        {/* Drift line */}
        <line x1={padL} x2={width - padR} y1={yS(0)} y2={yS(theta)} stroke="#dc2626" strokeWidth={2} strokeDasharray="8 4" />
        <text x={width - padR - 4} y={yS(theta) - 5} fontSize={11} fill="#dc2626" textAnchor="end">drift θt</text>
        {/* legend */}
        <line x1={padL+10} y1={padT+8} x2={padL+26} y2={padT+8} stroke={COLORS_BM[0]} strokeWidth={2} />
        <text x={padL+30} y={padT+12} fontSize={11} fill="#64748b">BM under Q (no drift)</text>
        <line x1={padL+10} y1={padT+22} x2={padL+26} y2={padT+22} stroke={COLORS_DRIFT[0]} strokeWidth={2} />
        <text x={padL+30} y={padT+26} fontSize={11} fill="#64748b">X_t = θt + W_t under P</text>
        <text x={padL} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">0</text>
        <text x={width - padR} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">T=1</text>
      </svg>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginTop:'0.5rem'}}>
        <div className="stat-chip">
          <span className="stat-label">Radon–Nikodym density dQ/dP</span>
          <span className="stat-value">exp(−θW_T − ½θ²T)</span>
        </div>
        <div className="stat-chip">
          <span className="stat-label">W̃_t = W_t + θt is Q-BM</span>
          <span className="stat-value">dW̃ = dW + θdt</span>
        </div>
      </div>
      <div className="visual-caption">
        Red/orange paths (drifted under P) and blue paths (pure BM under Q) use IDENTICAL Brownian
        increments — only the measure labels differ. Girsanov shows how multiplying probabilities by
        exp(−θW_T − ½θ²T) exactly cancels the drift, transforming P into Q.
      </div>
    </div>
  );
}
