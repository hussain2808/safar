import { Fragment } from 'react';
import type { FuseResultMatch } from 'fuse.js';

interface HighlightedTextProps {
  text: string;
  matchKey: string;
  matches: readonly FuseResultMatch[];
}

export function HighlightedText({ text, matchKey, matches }: HighlightedTextProps) {
  const indices = matches.find((m) => m.key === matchKey)?.indices;
  if (!indices || indices.length === 0) return <>{text}</>;

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  indices.forEach(([start, end], i) => {
    if (start > cursor) parts.push(<Fragment key={`${i}-pre`}>{text.slice(cursor, start)}</Fragment>);
    parts.push(
      <mark key={i} className="bg-hisaabAccent-button text-hisaabAccent-buttonText rounded-sm px-0.5">
        {text.slice(start, end + 1)}
      </mark>,
    );
    cursor = end + 1;
  });
  if (cursor < text.length) parts.push(<Fragment key="post">{text.slice(cursor)}</Fragment>);

  return <>{parts}</>;
}
