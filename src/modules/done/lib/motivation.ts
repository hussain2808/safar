const MESSAGES = [
  'Keep going.',
  'One habit at a time.',
  'Small actions matter.',
  'Consistency beats perfection.',
  'Every day counts.',
  'You showed up. That matters.',
];

export function pickMotivation(): string {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}
