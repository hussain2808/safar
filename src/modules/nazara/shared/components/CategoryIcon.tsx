import type { CategoryType } from '@/modules/nazara/types';

const ICONS: Record<CategoryType, string> = {
  graduation: '🎓',
  plant: '🌱',
  car: '🚗',
  home: '🏠',
  travel: '✈️',
  birthday: '🎂',
  wedding: '💍',
  baby: '👶',
  work: '💼',
  camping: '⛺',
  family: '👨‍👩‍👧',
  other: '⭐',
};

interface Props {
  category: CategoryType;
  size?: 'sm' | 'md' | 'lg';
  showHeart?: boolean;
}

const SIZES: Record<string, { wh: number; font: number }> = {
  sm: { wh: 40, font: 18 },
  md: { wh: 56, font: 24 },
  lg: { wh: 96, font: 48 },
};

export default function CategoryIcon({ category, size = 'md', showHeart }: Props) {
  const s = SIZES[size];
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <div
        style={{
          width: s.wh,
          height: s.wh,
          borderRadius: '50%',
          backgroundColor: '#F3EBE0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: s.font,
        }}
      >
        {ICONS[category]}
      </div>
      {showHeart && (
        <span
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            color: '#A67C52',
            fontSize: 14,
          }}
        >
          ♥
        </span>
      )}
    </div>
  );
}
