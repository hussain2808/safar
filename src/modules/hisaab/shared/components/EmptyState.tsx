interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-bg-icon flex items-center justify-center mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-hisaabText-secondary">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="9" y1="12" x2="13" y2="12" />
        </svg>
      </div>
      <h3 className="text-body text-hisaabText-primary mb-2">{title}</h3>
      {description && <p className="text-caption text-hisaabText-secondary mb-6">{description}</p>}
      {action}
    </div>
  );
}
