export const statusOptions = [
  'confimada',
  'pagamento confirmado',
  'em separação',
  'em transito',
  'entregue',
  'atrasada',
  'cancelada pelo cliente',
  'cancelada pelo vendedor',
] as const;

export type Status = typeof statusOptions[number];

