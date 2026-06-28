import type { ButtonHTMLAttributes, ReactNode, CSSProperties } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined';
  children: ReactNode;
  icon?: ReactNode;
}

export default function Button({ variant = 'filled', children, icon, style, ...props }: Props) {
  const base: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 24px',
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity 0.2s',
  };

  const variantStyles: Record<string, CSSProperties> = {
    filled: {
      backgroundColor: '#A67C52',
      color: '#fff',
    },
    outlined: {
      backgroundColor: 'transparent',
      color: '#A67C52',
      border: '1.5px solid #A67C52',
    },
  };

  return (
    <button
      style={{ ...base, ...variantStyles[variant], ...style }}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
