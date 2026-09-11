/** The mashrabiya motif — an eight-point star lattice, used as a quiet background mark on
 *  hero and category banners. Decorative only, so it is hidden from assistive tech. */
export default function Lattice({ className }: { className?: string }) {
  // Faded at the edges so the pattern dissolves instead of ending on a hard rectangle.
  const fade = "radial-gradient(circle at 50% 45%, black 25%, transparent 72%)";

  return (
    <svg
      className={className}
      style={{ maskImage: fade, WebkitMaskImage: fade }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id="mashrabiya" width="56" height="56" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1.1">
            <path d="M28 0 L56 28 L28 56 L0 28 Z" />
            <rect x="13" y="13" width="30" height="30" />
            <path d="M0 0 L13 13 M56 0 L43 13 M0 56 L13 43 M56 56 L43 43" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mashrabiya)" />
    </svg>
  );
}
