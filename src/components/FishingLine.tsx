export function FishingLine() {
  return (
    <svg width="160" height="180" viewBox="0 0 160 180" fill="none" style={{ margin: "24px auto 0", overflow: "visible" }}>
      <style>{`
        @keyframes cast {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(-25deg); }
          30% { transform: rotate(5deg); }
          45% { transform: rotate(-2deg); }
          55% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes lineSwing {
          0% { d: path("M95 12 Q90 50, 80 85 Q72 110, 75 140"); }
          15% { d: path("M95 12 Q60 30, 40 70 Q30 100, 45 135"); }
          30% { d: path("M95 12 Q100 55, 85 90 Q78 115, 80 145"); }
          45% { d: path("M95 12 Q92 52, 82 88 Q75 112, 78 142"); }
          55% { d: path("M95 12 Q90 50, 80 85 Q72 110, 75 140"); }
          100% { d: path("M95 12 Q90 50, 80 85 Q72 110, 75 140"); }
        }
        @keyframes bobberSwing {
          0% { cx: 80; cy: 85; }
          15% { cx: 40; cy: 70; }
          30% { cx: 85; cy: 90; }
          45% { cx: 82; cy: 88; }
          55% { cx: 80; cy: 85; }
          100% { cx: 80; cy: 85; }
        }
        @keyframes hookDrift {
          0% { transform: translate(0px, 0px); }
          15% { transform: translate(-30px, -5px); }
          30% { transform: translate(5px, 5px); }
          45% { transform: translate(3px, 2px); }
          55% { transform: translate(0px, 0px); }
          70% { transform: translate(1px, 2px); }
          85% { transform: translate(-1px, 1px); }
          100% { transform: translate(0px, 0px); }
        }
        .fishing-rod { transform-origin: 60px 8px; animation: cast 4s ease-in-out infinite; }
        .fishing-line { animation: lineSwing 4s ease-in-out infinite; }
        .fishing-bobber { animation: bobberSwing 4s ease-in-out infinite; }
        .fishing-hook { animation: hookDrift 4s ease-in-out infinite; }
      `}</style>
      <g className="fishing-rod">
        {/* Rod */}
        <line x1="40" y1="15" x2="95" y2="12" stroke="var(--text-ransom)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="40" cy="15" r="2" fill="var(--text-ransom)" />
      </g>
      {/* Line */}
      <path className="fishing-line" d="M95 12 Q90 50, 80 85 Q72 110, 75 140" stroke="var(--text-ransom)" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
      {/* Bobber */}
      <circle className="fishing-bobber" cx="80" cy="85" r="5" fill="rgba(240, 140, 50, 0.7)" stroke="rgba(200, 100, 30, 0.8)" strokeWidth="1.5" />
      {/* Hook */}
      <g className="fishing-hook" style={{ transformOrigin: "75px 140px" }}>
        <path d="M75 140 Q70 152, 75 158 Q83 162, 80 150" stroke="rgba(240, 140, 50, 0.8)" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
