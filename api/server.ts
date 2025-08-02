import express from 'express'
import cors from 'cors'
import { getCustomerInfo } from './database-api'
import { messageAI } from './ai-api'
import type { ChatHistory } from './types'

const port = 3333

const app = express()

app.use(cors())

app.use(express.json())

const chatHistory: ChatHistory = {}


app.post('/support', async (req, res) => {
    const email = req.body.email as string
    const message = req.body.message as string

    if (!(email in chatHistory)) {
        chatHistory[email] = []
    }

    chatHistory[email]?.push({ role: 'user', parts: [{ text: message }] })

    const customerInfo = await getCustomerInfo(email)
    const response = await messageAI(customerInfo, chatHistory[email] ?? [])

    if (!response) {
        return res.send(JSON.stringify({ response: 'Não foi possível gerar uma resposta' })).status(500)
    }

    chatHistory[email]?.push({ role: 'model', parts: [{ text: response }] })

    res.send(JSON.stringify({ response }))
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

