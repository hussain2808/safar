const COLORS = ['#2F5233', '#4F6FBD', '#7B6FB0', '#C9A042', '#C2703D', '#C26B86', '#3E9C93', '#8C7B6B'];

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const selected = value ?? COLORS[0];
  return (
    <div className="flex flex-wrap gap-2.5">
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
            selected === color ? 'border-text-primary' : 'border-transparent'
          }`}
          aria-label={color}
        >
          <span className="w-7 h-7 rounded-full" style={{ backgroundColor: color }} />
        </button>
      ))}
    </div>
  );
}
