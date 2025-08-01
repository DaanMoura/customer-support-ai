import { GoogleGenAI } from "@google/genai";
import { Pool } from "pg";
import type { Customer, Purchase } from "./types";

const pool = new Pool({
  host: 'localhost',
  database: 'ecommerce',
  user: 'docker',
  password: 'docker',
})

const customer = (await pool.query<Customer>('SELECT * FROM customers ORDER BY RANDOM() LIMIT 1')).rows[0]

if (!customer) {
  throw new Error('Nenhum cliente encontrado')
}

const purchases = (await pool.query<Purchase>(`SELECT * FROM purchases WHERE customer_id = '${customer.id}'`)).rows

const getCustomerAge = (c: Customer) => {
  const today = new Date()
  const diffWithBirthdate = today.getTime() - c.birthdate.getTime()
  return (new Date(diffWithBirthdate)).getFullYear() - 1970
}

const getDaysSincePurchase = (purchase: Purchase) => {
  const today = new Date()
  const diffInMilis = today.getTime() - purchase.date.getTime()
  return Math.floor(diffInMilis / (1000 * 60 * 60 * 24))
}

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const MODEL = 'gemini-2.0-flash';

// TODO: popular com dados reais. Dados fakes foram inseridos no system instruction para teste.
const systemInstruction = `
Você é um atendente de uma empresa de e-commerce.
Você está conversando com clientes que podem ter dúvidas sobre suas compras recentes no site.
Responda os clientes de forma amigável.
Não informe nada a respeito a respeito de você para o cliente, diga apenas que é um atendente virtual.

Caso o cliente pergunte sobre algo não relacionado ao e-commerce, ou aos nossos serviços,
indique que não pode ajudá-lo com isso.

Caso o cliente pergunte sobre algo relacionado à empresa mas que não é explicitamente sobre suas compras passadas,
direcione ele ao atendimento humano pelo número (11) 1234-5678.

Altere o tom das suas respostas de acordo com a idade do cliente. Se o cliente for jovem, dialogue de forma mais informal.
Se o cliente for idoso, trate-o com o devido respeito.

Se o cliente reclamar sobre o atraso nas suas compras, verifique se a compra excedeu o SLA de entrega
de acordo com a região do cliente:

Norte: 10 dias
Nordeste: 7 dias
Sul: 5 dias
Centro-Oeste: 5 dias
Sudeste: 2 dias

Você não pode realizar nenhuma ação a não ser responder perguntas sobre os dados a seguir. Caso o cliente necessite
de alguma ação por parte da empresa (como contestar compras), direcione-o ao suporte.

<CLIENTE>
Nome: ${customer.first_name} ${customer.last_name}
Email: ${customer.email}
Idade: ${getCustomerAge(customer)} anos
Estado: ${customer.state}
</CLIENTE>


<COMPRAS>
${purchases.map((purchase, index) => `
${index + 1}.
Nome: ${purchase.product}
Preço: R$ ${purchase.price}
Dias desde a compra: ${getDaysSincePurchase(purchase)}
Status: ${purchase.status}`).join('\n\n')}

</COMPRAS>
`

console.log(systemInstruction)

console.log('---- RESPONSE ----')

const response = await genai.models.generateContent({
  model: MODEL,
  config: {
    systemInstruction,
  },
  contents: "Oi. Queria saber qual foi a minha última compra e o status dela"
})

console.log(response.candidates?.[0]?.content?.parts?.[0]?.text)
