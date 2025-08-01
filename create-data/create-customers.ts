import { fakerPT_BR as faker } from "@faker-js/faker";
import type { Customer, Purchase, WeightedValue } from "./types";
import { statusOptions } from "./status";

import { Pool } from "pg";

const CUSTOMER_COUNT = 100;

const purchaseProbabilty: WeightedValue[] = [
  { value: 0, weight: 10 },
  { value: 1, weight: 50 },
  { value: 2, weight: 20 },
  { value: 3, weight: 10 },
  { value: 4, weight:  7 },
  { value: 5, weight:  3 }
];

const generatePurchase = (customerId: string): Purchase => {
  return {
    id: faker.string.uuid(),
    customerId,
    product: faker.commerce.productName(),
    price: faker.commerce.price({ min: 10, max: 1000 }),
    date: faker.date.recent({ days: 10}),
    status: faker.helpers.arrayElement(statusOptions),
  };
}

const generatePurchaseList = (customerId: string): Purchase[] => {
  const nPurchases = faker.helpers.weightedArrayElement(purchaseProbabilty);

  const purchases = [];
  for (let i = 0; i < nPurchases; i++) {
    purchases.push(generatePurchase(customerId));
  }

  return purchases;
}

const generateCustomer = (): Customer => {
  const customerId = faker.string.uuid();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  const nPurchases = faker.helpers.weightedArrayElement(purchaseProbabilty);

  const purchases = [];
  for (let i = 0; i < nPurchases; i++) {
    purchases.push(generatePurchase(customerId));
  }

  return {
    id: customerId,
    firstName,
    lastName,
    birthDate: faker.date.birthdate({ mode: "age", min: 18, max: 80 }),
    state: faker.location.state(),
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
  };
};

const customers: Customer[] = [];
for (let i = 0; i < CUSTOMER_COUNT; i++) {
  customers.push(generateCustomer());
}

const purchases = customers.flatMap(customer => generatePurchaseList(customer.id));

const pool = new Pool({
  host: 'localhost',
  database: 'ecommerce',
  user: 'docker',
  password: 'docker',
})

await pool.query("DROP TABLE IF EXISTS purchases");
await pool.query("DROP TABLE IF EXISTS customers");
await pool.query("DROP TYPE IF EXISTS purchase_status");

await pool.query(`
  CREATE TABLE customers (
    id UUID PRIMARY KEY,
    first_name VARCHAR (100) NOT NULL,
    last_name VARCHAR (100) NOT NULL,
    birthdate DATE NOT NULL,
    state VARCHAR (100) ,
    email VARCHAR(255) UNIQUE NOT NULL
  )
`)

await pool.query(`
  CREATE TYPE purchase_status AS ENUM (
    ${statusOptions.map(status => `'${status}'`).join(", ")}
  );
`);

await pool.query(`
  CREATE TABLE purchases (
      id UUID PRIMARY KEY,
      customer_id UUID NOT NULL,
      product VARCHAR(255) NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      date DATE NOT NULL,
      status purchase_status NOT NULL,
      CONSTRAINT fk_customer
          FOREIGN KEY (customer_id)
          REFERENCES customers(id)
          ON DELETE CASCADE
  );
`);

for (const customer of customers) {
  await pool.query(
      `INSERT INTO CUSTOMERS (id, first_name, last_name, birthdate, state, email) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
          customer.id,
          customer.firstName,
          customer.lastName,
          customer.birthDate,
          customer.state,
          customer.email
      ]
  );
}

for (const purchase of purchases) {
  await pool.query(
      `INSERT INTO purchases (id, customer_id, product, price, date, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
          purchase.id,
          purchase.customerId,
          purchase.product,
          purchase.price,
          purchase.date,
          purchase.status
      ]
  );
}

await pool.end();

