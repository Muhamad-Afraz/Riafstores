import type { ReactNode } from "react";

type MarqueeProps = {
  items: ReactNode[];
  className?: string;
  duration?: number;
};

function MarqueeGroup({
  items,
  hidden = false,
}: {
  items: ReactNode[];
  hidden?: boolean;
}) {
  return (
    <div
      aria-hidden={hidden || undefined}
      className="marquee-group"
    >
      {items.map((item, index) => (
        <span key={index} className="marquee-item">
          {item}
        </span>
      ))}
    </div>
  );
}

export function Marquee({
  items,
  className = "",
  duration = 36,
}: MarqueeProps) {
  return (
    <div className={`marquee ${className}`}>
      <div className="marquee-track" style={{ animationDuration: `${duration}s` }}>
        <MarqueeGroup items={items} />
        <MarqueeGroup items={items} hidden />
      </div>
    </div>
  );
}
