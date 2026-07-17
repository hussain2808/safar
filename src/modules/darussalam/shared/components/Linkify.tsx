export function Linkify({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a key={i} href={part} target="_blank" rel="noreferrer" className="text-darussalam-green underline underline-offset-2 break-all">
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}
