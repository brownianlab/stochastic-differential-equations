import React, {useMemo, useState} from 'react';

function normalish(seed: number, k: number) {
  const u = Math.abs(Math.sin((seed + 1) * (k + 4) * 59.17));
  const v = Math.abs(Math.sin((seed + 6) * (k + 8) * 73.31));
  return Math.sqrt(-2 * Math.log(Math.max(u, 1e-9))) * Math.cos(2 * Math.PI * v);
}

function normalish2(seed: number, k: number) {
  const u = Math.abs(Math.sin((seed + 14) * (k + 3) * 41.57));
  const v = Math.abs(Math.sin((seed + 5) * (k + 12) * 97.43));
  return Math.sqrt(-2 * Math.log(Math.max(u, 1e-9))) * Math.cos(2 * Math.PI * v);
}

function makeCorrelatedBM(seed: number, n: number, rho: number) {
  const w1: number[] = [0], w2: number[] = [0];
  for (let k = 0; k < n; k++) {
    const z1 = normalish(seed, k);
    const z2 = normalish2(seed, k);
    // W1, W2 correlated with correlation rho
    // W2 = rho*W1 + sqrt(1-rho^2)*W2_perp
    const dw1 = z1 / Math.sqrt(n);
    const dw2 = (rho * z1 + Math.sqrt(1 - rho * rho) * z2) / Math.sqrt(n);
    w1.push(w1[k] + dw1);
    w2.push(w2[k] + dw2);
  }
  return {w1, w2};
}

export default function CorrelatedBMDemo() {
  const [rho, setRho] = useState(0.7);
  const n = 200;

  const {w1, w2} = useMemo(() => makeCorrelatedBM(42, n, rho), [rho]);

  const width = 700, height = 280, padL = 40, padR = 16, padT = 16, padB = 32;

  // Left panel: time series
  const tWidth = (width - padL - padR) * 0.6;
  const sWidth = (width - padL - padR) * 0.35;
  const sLeft = padL + tWidth + 20;

  const allW = [...w1, ...w2];
  const ymin = Math.min(...allW, -2.5), ymax = Math.max(...allW, 2.5);

  const xS = (t: number) => padL + (t / n) * tWidth;
  const yS = (v: number) => padT + (ymax - v) / (ymax - ymin) * (height - padT - padB);

  const d1 = w1.map((v, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(v)}`).join(' ');
  const d2 = w2.map((v, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(v)}`).join(' ');

  // Right panel: scatter of (W1_t, W2_t) — sample every 4 steps
  const scatter = w1.filter((_, i) => i % 4 === 0).map((v, i) => ({x: v, y: w2[i * 4]}));
  const scatterPadding = 24;
  const svmin = -2.8, svmax = 2.8;
  const scX = (v: number) => sLeft + scatterPadding + (v - svmin) / (svmax - svmin) * (sWidth - scatterPadding);
  const scY = (v: number) => padT + (svmax - v) / (svmax - svmin) * (height - padT - padB);

  // correlation of QV: dW1*dW2 = rho*dt
  const empiricalQV = w1.slice(1).reduce((acc, v, i) => {
    return acc + (v - w1[i]) * (w2[i + 1] - w2[i]);
  }, 0);

  return (
    <div className="visual-card">
      <div className="visual-title">Correlated Brownian motions: dW₁dW₂ = ρ dt</div>
      <div className="control-row">
        <label>Correlation ρ = {rho.toFixed(2)}</label>
        <input type="range" min="-0.99" max="0.99" step="0.01" value={rho} onChange={e => setRho(Number(e.target.value))} />
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Correlated Brownian motions">
        {/* Time series panel */}
        <line x1={padL} x2={padL + tWidth} y1={yS(0)} y2={yS(0)} stroke="#e2e8f0" strokeWidth={1} />
        <line x1={padL} x2={padL} y1={padT} y2={height - padB} stroke="#94a3b8" strokeWidth={1} />
        <path d={d1} fill="none" strokeWidth={1.8} stroke="#2563eb" opacity={0.85} />
        <path d={d2} fill="none" strokeWidth={1.8} stroke="#dc2626" opacity={0.85} />
        <line x1={padL+8} y1={padT+8} x2={padL+20} y2={padT+8} stroke="#2563eb" strokeWidth={2} />
        <text x={padL+24} y={padT+12} fontSize={11} fill="#64748b">W¹_t</text>
        <line x1={padL+8} y1={padT+20} x2={padL+20} y2={padT+20} stroke="#dc2626" strokeWidth={2} />
        <text x={padL+24} y={padT+24} fontSize={11} fill="#64748b">W²_t</text>
        <text x={padL} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">0</text>
        <text x={padL + tWidth} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">T</text>

        {/* Scatter panel */}
        <line x1={sLeft + scatterPadding} x2={sLeft + sWidth} y1={scY(0)} y2={scY(0)} stroke="#e2e8f0" strokeWidth={1} />
        <line x1={scX(0)} x2={scX(0)} y1={padT} y2={height - padB} stroke="#e2e8f0" strokeWidth={1} />
        {scatter.map((pt, i) => (
          <circle key={i} cx={scX(pt.x)} cy={scY(pt.y)} r={2.5} fill="#6366f1" opacity={0.45} />
        ))}
        <text x={sLeft + sWidth / 2 + scatterPadding / 2} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">W¹</text>
        <text x={sLeft + scatterPadding - 4} y={(padT + height - padB) / 2} fontSize={11} fill="#64748b" textAnchor="end">W²</text>
        <text x={sLeft + scatterPadding + 4} y={padT + 12} fontSize={11} fill="#6366f1">Scatter (W¹,W²)</text>
      </svg>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginTop:'0.5rem'}}>
        <div className="stat-chip">
          <span className="stat-label">Cross-variation ⟨W¹,W²⟩_T ≈</span>
          <span className="stat-value">{empiricalQV.toFixed(4)} (theory: {rho.toFixed(2)})</span>
        </div>
        <div className="stat-chip">
          <span className="stat-label">Covariation rule</span>
          <span className="stat-value">dW¹dW² = ρ dt</span>
        </div>
      </div>
      <div className="visual-caption">
        When ρ = 1 the two paths are identical; ρ = 0 gives independent paths; ρ = −1 gives mirror paths.
        The scatter ellipse tilts with ρ, geometrically encoding the covariance. This bivariate structure
        underpins basket options, spreads, and correlated rate models.
      </div>
    </div>
  );
}
