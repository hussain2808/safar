// fg = accent color stored on the habit (used for icon tint / text elsewhere).
// bg = the same accent's soft pastel tint, matching the app's accent.*.bg tokens.
const COLORS = [
  { fg: '#2F5233', bg: '#E4EDE5' }, // green
  { fg: '#4F6FBD', bg: '#E3EAF7' }, // blue
  { fg: '#7B6FB0', bg: '#EAE6F5' }, // purple
  { fg: '#C9A042', bg: '#F7EFD9' }, // gold
  { fg: '#C2703D', bg: '#FBE7D8' }, // orange
  { fg: '#C26B86', bg: '#FBE3E8' }, // pink
  { fg: '#3E9C93', bg: '#DCF0EE' }, // teal
  { fg: '#8C7B6B', bg: '#EFE9E3' }, // taupe
];

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const selected = value ?? COLORS[0].fg;
  return (
    <div className="flex flex-wrap gap-2.5">
      {COLORS.map(({ fg, bg }) => (
        <button
          key={fg}
          type="button"
          onClick={() => onChange(fg)}
          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
            selected === fg ? 'border-text-primary' : 'border-transparent'
          }`}
          style={{ backgroundColor: bg }}
          aria-label={fg}
        >
          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: fg }} />
        </button>
      ))}
    </div>
  );
}
