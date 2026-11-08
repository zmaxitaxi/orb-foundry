export function FighterAvatar({
  src,
  alt = "",
  className = "",
}: {
  src?: string;
  alt?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex size-16 shrink-0 overflow-hidden rounded-full border border-border bg-[#f4f1ea] ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          width={64}
          height={64}
          className="size-full object-cover"
        />
      ) : null}
    </span>
  );
}
