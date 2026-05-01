import React, {useMemo, useState} from 'react';

function normalish(seed: number, k: number) {
  const u = Math.abs(Math.sin((seed + 2) * (k + 9) * 71.13));
  const v = Math.abs(Math.sin((seed + 7) * (k + 3) * 53.91));
  return Math.sqrt(-2 * Math.log(Math.max(u, 1e-9))) * Math.cos(2 * Math.PI * v);
}

function makeVasicek(seed: number, n: number, kappa: number, theta: number, sigma: number, r0: number) {
  const pts: number[] = [r0];
  const dt = 10 / n; // 10-year horizon
  for (let k = 0; k < n; k++) {
    const z = normalish(seed, k);
    pts.push(pts[k] + kappa * (theta - pts[k]) * dt + sigma * Math.sqrt(dt) * z);
  }
  return pts;
}

// Vasicek zero-coupon bond price P(t, T) = A(T-t) * exp(-B(T-t) * r_t)
// B(τ) = (1 - e^{-κτ}) / κ
// ln A(τ) = (B(τ) - τ)(κ²θ - σ²/2) / κ² - σ²B(τ)² / (4κ)
function vasicekBondPrice(r: number, kappa: number, theta: number, sigma: number, tau: number) {
  if (tau <= 0) return 1;
  const B = (1 - Math.exp(-kappa * tau)) / kappa;
  const lnA = (B - tau) * (kappa * kappa * theta - 0.5 * sigma * sigma) / (kappa * kappa)
    - sigma * sigma * B * B / (4 * kappa);
  return Math.exp(lnA - B * r);
}

const COLORS = ['#3b82f6','#6366f1','#8b5cf6','#ec4899','#06b6d4'];

export default function VasicekDemo() {
  const [kappa, setKappa] = useState(0.5);
  const [theta, setTheta] = useState(0.05);
  const [sigma, setSigma] = useState(0.02);
  const [r0, setR0] = useState(0.03);
  const [view, setView] = useState<'rates' | 'yield'>('rates');
  const n = 400;
  const numPaths = 5;

  const paths = useMemo(() =>
    Array.from({length: numPaths}, (_, i) => makeVasicek(i * 13 + 3, n, kappa, theta, sigma, r0)),
    [kappa, theta, sigma, r0]
  );

  // Yield curve: y(τ) = -log P(0,τ) / τ for τ in [0.25, 20]
  const taus = Array.from({length: 80}, (_, i) => 0.25 + i * 0.25);
  const yieldCurve = taus.map(tau => {
    const p = vasicekBondPrice(r0, kappa, theta, sigma, tau);
    return -Math.log(p) / tau;
  });

  const width = 700, height = 260, padL = 44, padR = 16, padT = 16, padB = 32;

  if (view === 'rates') {
    const allVals = [...paths.flat()];
    const ymin = Math.min(...allVals, -0.01), ymax = Math.max(...allVals, theta + 3 * sigma);
    const xS = (t: number) => padL + (t / n) * (width - padL - padR);
    const yS = (v: number) => padT + (ymax - v) / (ymax - ymin) * (height - padT - padB);
    const meanPath = Array.from({length: n + 1}, (_, t) => theta + (r0 - theta) * Math.exp(-kappa * t * 10 / n));

    return (
      <div className="visual-card">
        <div className="visual-title">Vasicek interest rate model</div>
        <div className="control-row" style={{flexWrap:'wrap',gap:'0.75rem'}}>
          <label>κ={kappa.toFixed(2)}<input type="range" min="0.1" max="3" step="0.05" value={kappa} onChange={e => setKappa(Number(e.target.value))} /></label>
          <label>θ={theta.toFixed(3)}<input type="range" min="0.01" max="0.12" step="0.001" value={theta} onChange={e => setTheta(Number(e.target.value))} /></label>
          <label>σ={sigma.toFixed(3)}<input type="range" min="0.005" max="0.08" step="0.001" value={sigma} onChange={e => setSigma(Number(e.target.value))} /></label>
          <label>r₀={r0.toFixed(3)}<input type="range" min="0" max="0.12" step="0.001" value={r0} onChange={e => setR0(Number(e.target.value))} /></label>
        </div>
        <div className="control-row">
          <button className="btn-active" style={{marginRight:'0.5rem'}}>Rate paths</button>
          <button className="btn-inactive" onClick={() => setView('yield')}>Yield curve</button>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Vasicek rates">
          <line x1={padL} x2={width - padR} y1={yS(0)} y2={yS(0)} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={padL} x2={padL} y1={padT} y2={height - padB} stroke="#94a3b8" strokeWidth={1} />
          <line x1={padL} x2={width - padR} y1={yS(theta)} y2={yS(theta)} stroke="#16a34a" strokeWidth={1.5} strokeDasharray="6 4" />
          {paths.map((path, idx) => {
            const d = path.map((v, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(v)}`).join(' ');
            return <path key={idx} d={d} fill="none" strokeWidth={1.5} stroke={COLORS[idx]} opacity={0.65} />;
          })}
          {(() => {
            const d = meanPath.map((v, t) => `${t === 0 ? 'M' : 'L'} ${xS(t)} ${yS(v)}`).join(' ');
            return <path d={d} fill="none" strokeWidth={2.5} stroke="#1d4ed8" strokeDasharray="7 3" />;
          })()}
          <text x={width - padR - 4} y={yS(theta) - 4} fontSize={11} fill="#16a34a" textAnchor="end">θ={theta.toFixed(3)}</text>
          <text x={padL} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">0</text>
          <text x={width - padR} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">10yr</text>
        </svg>
        <div className="visual-caption">
          Vasicek: dr = κ(θ−r)dt + σdW. Rates can go negative (a model defect).
          Stationary distribution: N(θ, σ²/2κ). The blue dashed line shows E[r_t | r_0].
        </div>
      </div>
    );
  }

  // Yield curve view
  const ymin2 = Math.min(...yieldCurve) * 0.95, ymax2 = Math.max(...yieldCurve) * 1.05;
  const xS2 = (i: number) => padL + (i / (taus.length - 1)) * (width - padL - padR);
  const yS2 = (v: number) => padT + (ymax2 - v) / (ymax2 - ymin2) * (height - padT - padB);
  const yD = yieldCurve.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xS2(i)} ${yS2(v)}`).join(' ');
  const rLine = `M ${padL} ${yS2(r0)} L ${width - padR} ${yS2(r0)}`;

  return (
    <div className="visual-card">
      <div className="visual-title">Vasicek yield curve y(τ) = −log P(0,τ)/τ</div>
      <div className="control-row" style={{flexWrap:'wrap',gap:'0.75rem'}}>
        <label>κ={kappa.toFixed(2)}<input type="range" min="0.1" max="3" step="0.05" value={kappa} onChange={e => setKappa(Number(e.target.value))} /></label>
        <label>θ={theta.toFixed(3)}<input type="range" min="0.01" max="0.12" step="0.001" value={theta} onChange={e => setTheta(Number(e.target.value))} /></label>
        <label>r₀={r0.toFixed(3)}<input type="range" min="0" max="0.12" step="0.001" value={r0} onChange={e => setR0(Number(e.target.value))} /></label>
      </div>
      <div className="control-row">
        <button className="btn-inactive" onClick={() => setView('rates')} style={{marginRight:'0.5rem'}}>Rate paths</button>
        <button className="btn-active">Yield curve</button>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Vasicek yield curve">
        <line x1={padL} x2={padL} y1={padT} y2={height - padB} stroke="#94a3b8" strokeWidth={1} />
        <line x1={padL} x2={width - padR} y1={yS2(theta)} y2={yS2(theta)} stroke="#16a34a" strokeWidth={1.5} strokeDasharray="6 4" />
        <path d={rLine} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" />
        <path d={yD} fill="none" strokeWidth={2.5} stroke="#2563eb" />
        <text x={width - padR - 4} y={yS2(theta) - 4} fontSize={11} fill="#16a34a" textAnchor="end">θ={theta.toFixed(3)}</text>
        <text x={padL - 4} y={yS2(r0) + 4} fontSize={11} fill="#94a3b8" textAnchor="end">r₀</text>
        <text x={padL} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">0</text>
        <text x={width - padR} y={height - 4} fontSize={11} fill="#64748b" textAnchor="middle">20yr</text>
      </svg>
      <div className="visual-caption">
        When r₀ &lt; θ the yield curve is upward sloping (normal). When r₀ &gt; θ it is inverted.
        All Vasicek yield curves converge to θ at long maturities — mean reversion drives the long end.
      </div>
    </div>
  );
}
