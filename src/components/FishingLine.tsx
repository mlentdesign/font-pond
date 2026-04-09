export function FishingLine() {
  return (
    <svg width="140" height="180" viewBox="0 0 140 180" fill="none" style={{ margin: "24px auto 0", overflow: "visible" }}>
      <style>{`
        @keyframes castRod {
          0%, 55%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(-30deg); }
          20% { transform: rotate(8deg); }
          35% { transform: rotate(-3deg); }
          45% { transform: rotate(0deg); }
        }
        .fishing-group {
          transform-origin: 35px 20px;
          animation: castRod 5s ease-in-out infinite;
        }
      `}</style>
      <g className="fishing-group">
        {/* Rod — handle to tip */}
        <line x1="35" y1="20" x2="95" y2="10" stroke="var(--text-ransom)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Handle grip */}
        <circle cx="35" cy="20" r="2.5" fill="var(--text-ransom)" />

        {/* Line — attached to rod tip, curves down to hook */}
        <path
          d="M95 10 Q92 45, 85 75 Q80 100, 78 120 Q76 135, 75 145"
          stroke="var(--text-ransom)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Bobber — sitting on the line */}
        <ellipse cx="84" cy="78" rx="4.5" ry="5.5" fill="rgba(240, 140, 50, 0.7)" stroke="rgba(200, 100, 30, 0.8)" strokeWidth="1.5" />
        {/* Bobber white stripe */}
        <ellipse cx="84" cy="75" rx="4" ry="2.5" fill="rgba(255, 255, 255, 0.4)" />

        {/* Hook — at the end of the line */}
        <path
          d="M75 145 Q70 155, 74 162 Q80 166, 79 155"
          stroke="rgba(240, 140, 50, 0.8)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Hook barb */}
        <line x1="79" y1="155" x2="76" y2="152" stroke="rgba(240, 140, 50, 0.8)" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
