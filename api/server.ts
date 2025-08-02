import express from 'express'
import cors from 'cors'
import { getCustomerInfo } from './database-api'
import { messageAI } from './ai-api'

const port = 3333

const app = express()

app.use(cors())

app.use(express.json())


// 1 - usuário + mensagem
// 2 - consultar banco de dados para pegar a info do usuário
// 3 - montar prompt de sistema
// 4 - retornar resposta da AI

app.get('/support', async (req, res) => {
    const email = req.query.email as string
    const message = req.query.message as string

    const customerInfo = await getCustomerInfo(email)
    const response = await messageAI(customerInfo, message)

    res.send(JSON.stringify({ response }))
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

