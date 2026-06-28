interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-icon-bg flex items-center justify-center mb-5">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
          <path d="M12 21V7a3 3 0 0 0-3-3H3v15a1 1 0 0 0 1 1h8z" />
          <path d="M12 21V7a3 3 0 0 1 3-3h6v15a1 1 0 0 1-1 1h-8z" />
        </svg>
      </div>
      <h3 className="text-body text-text-primary mb-2">{title}</h3>
      {description && <p className="text-caption text-text-secondary mb-6">{description}</p>}
      {action}
    </div>
  );
}
