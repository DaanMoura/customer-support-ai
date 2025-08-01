import type { Status } from "./status";

export type WeightedValue = { value: number, weight: number }

export type Purchase = {
  id: string;
  customerId: string;
  product: string
  price: string
  date: Date
  status: Status
}

export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  state: string;
  email: string;
};


