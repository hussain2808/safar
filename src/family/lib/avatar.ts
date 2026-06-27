const COLORS = [
  { bg: 'bg-accent-blue-bg', fg: 'text-accent-blue-fg' },
  { bg: 'bg-accent-green-bg', fg: 'text-accent-green-fg' },
  { bg: 'bg-accent-purple-bg', fg: 'text-accent-purple-fg' },
  { bg: 'bg-accent-pink-bg', fg: 'text-accent-pink-fg' },
  { bg: 'bg-accent-orange-bg', fg: 'text-accent-orange-fg' },
];

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

export function avatarColors(id: string): { bg: string; fg: string } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length];
}
