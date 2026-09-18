export function GameLogo() {
  const lime = '#84cc16';
  const light = '#a3e635';

  return (
    <svg viewBox="0 0 48 48" width="26" height="26" aria-hidden="true" style={{ flexShrink: 0 }}>
      {/* Left tile */}
      <rect x="4" y="13" width="17" height="22" rx="4" fill={lime} />
      {/* Right tile — sits second, lighter, reads as "where the pair lands" */}
      <rect x="27" y="13" width="17" height="22" rx="4" fill={light} />
      {/* Connecting arrow: order matters, left resolves into right */}
      <path d="M 21 24 L 27 24" stroke="#0f1410" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M 24.5 20.5 L 28.5 24 L 24.5 27.5" fill="none" stroke="#0f1410" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
