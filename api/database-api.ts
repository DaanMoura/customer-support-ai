import type { Customer, Purchase } from "./types"
import { Pool } from "pg"

const pool = new Pool({
  host: 'localhost',
  database: 'ecommerce',
  user: 'docker',
  password: 'docker',
})

export const getCustomerInfo =  async (email: string) => {
  const customer = await getCustomerByEmail(email)
  const purchases = await getCustomerPurchases(customer.id)

  return {
    customer,
    purchases,
  }
}

const getCustomerByEmail = async (email: string): Promise<Customer> => {
  const query = 'SELECT * FROM customers WHERE email = $1'
  const result = await pool.query<Customer>(query, [email])

  if (!result.rows[0]) {
    throw new Error('Customer not found')
  }

  return result.rows[0]
 
}

const getCustomerPurchases = async (customerId: string): Promise<Purchase[]> => {
  const query = 'SELECT * FROM purchases WHERE customer_id = $1'
  const result = await pool.query<Purchase>(query, [customerId])

  return result.rows
}
