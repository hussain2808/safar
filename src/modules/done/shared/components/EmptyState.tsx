interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-icon-bg flex items-center justify-center mb-5 text-2xl">
        🌿
      </div>
      <h3 className="text-body text-text-primary mb-2">{title}</h3>
      {description && <p className="text-caption text-text-secondary mb-6">{description}</p>}
      {action}
    </div>
  );
}
