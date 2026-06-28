interface Props {
  text: string;
}

export default function Badge({ text }: Props) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 16px',
        backgroundColor: '#EFEBE5',
        color: '#8C7B6B',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        borderRadius: 999,
      }}
    >
      {text}
    </span>
  );
}
