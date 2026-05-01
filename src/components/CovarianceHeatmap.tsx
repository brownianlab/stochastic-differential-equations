import React from 'react';

export default function CovarianceHeatmap() {
  const cells = 24;
  return (
    <div className="visual-card">
      <div className="visual-title">Covariance geometry: K(s,t) = min(s,t)</div>
      <div className="heatmap" style={{gridTemplateColumns: `repeat(${cells}, 1fr)`}}>
        {Array.from({length: cells * cells}).map((_, idx) => {
          const i = Math.floor(idx / cells), j = idx % cells;
          const s = i / (cells - 1), t = j / (cells - 1);
          const v = Math.min(s, t);
          return <div key={idx} title={`s=${s.toFixed(2)}, t=${t.toFixed(2)}, min=${v.toFixed(2)}`} style={{background: `rgba(37,99,235,${0.08 + 0.82 * v})`}} />;
        })}
      </div>
      <div className="visual-caption">Darker means larger covariance. Early time is embedded in later time: W_t = W_s + independent future increment.</div>
    </div>
  );
}
