export type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  birthdate: Date;
  state: string;
  email: string;
};

export type Purchase = {
  id: string;
  customer_id: string;
  product: string;
  price: string;
  date: Date;
  status: string;
};

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

export type CustomerInfo = {
  customer: Customer;
  purchases: Purchase[];
};
  
