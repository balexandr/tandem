// Small line-art icon set replacing emoji in Tandem's UI. Matches the
// 24x24 viewBox / stroke / currentColor style the rest of the suite
// uses. Share text is NOT touched by this: generateShareText() in
// useGameState.js builds the actual shared result string (🤝 header +
// ⭐ stars), plain text sent via SMS/clipboard, a custom icon can't
// survive that trip, so it stays real Unicode there. The "→" between
// PENCIL and CASE in HowToPlay's example is a plain typographic
// connector between two text tiles, not an emoji, also left alone.
function base(props) {
  return { viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': true, ...props };
}

export function IconTap({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M11 3v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M11 12v6a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-4.5c0-1-.8-1.8-1.8-1.8-.5 0-1 .2-1.3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 12l-1.3-1.3a1.6 1.6 0 0 0-2.4 2.1L11 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 3.5l1 1.3M15.5 3.5l-1 1.3M4 7.5l1.5.6M18 7.5l-1.5.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconClose({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconCheckCircle({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 12.3l2.6 2.6L16.2 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconXCircle({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconCheckmark({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconShare({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M12 15V4M12 4l-3.5 3.5M12 4l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconStar({ size = 14, filled = true, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path
        d="M12 3.2l2.6 5.4 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4.1 5.8-.8L12 3.2Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconTimer({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 9v4l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 2h4M12 2v2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function IconTrophy({ size = 40, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M7 5H4.5A2.5 2.5 0 0 0 5 10h2M17 5h2.5A2.5 2.5 0 0 1 19 10h-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 14v3.5M9 21h6M10 17.5h4l.6 3.5H9.4l.6-3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function IconFlame({ size = 40, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M12 3c1 2.5-.5 3.8-1.6 5.1C9.3 9.3 8.5 10.6 8.5 12.5a3.5 3.5 0 0 0 7 0c0-1.2-.5-1.9-1-2.5.9.4 1.5 1.5 1.5 2.9A4.5 4.5 0 0 1 12 21a5.5 5.5 0 0 1-5.5-5.5C6.5 9.5 9 7.5 12 3Z"
        stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function IconThumbsUp({ size = 40, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M8 11v9H5.5A1.5 1.5 0 0 1 4 18.5v-6A1.5 1.5 0 0 1 5.5 11H8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M8 11l3.2-6.4a1.8 1.8 0 0 1 3.3 1.1L13.8 9H18a2 2 0 0 1 1.9 2.7l-2 6A2 2 0 0 1 16 19H8" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSmile({ size = 40, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 14c1 1.3 2.2 2 3.5 2s2.5-.7 3.5-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="9" cy="9.5" r="1" fill="currentColor" />
      <circle cx="15" cy="9.5" r="1" fill="currentColor" />
    </svg>
  );
}

// "Board cleared" special case, distinct from the tier trophy.
export function IconMedal({ size = 40, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M8 3h8l-3 7h-2L8 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="15" r="6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 11.5l1.1 2.3 2.5.3-1.8 1.7.4 2.5-2.2-1.2-2.2 1.2.4-2.5-1.8-1.7 2.5-.3L12 11.5Z" fill="currentColor" />
    </svg>
  );
}
