const express = require('express')
const mongoose = require('mongoose')
const config = require('config')

const app = express()

const PORT = config.get('port') || 3000

app.use(express.json({ extended: true }))

app.use('/api/auth', require('./routes/auth-routes'))

async function start() {
    try {
        await mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        })

        app.listen(PORT, () => {
            console.log(`App has been started on port ${PORT}...`)
        })
    } catch(e) {
        console.log('Server error: ', e.messsage)
        process.exit(1)
    }
}

start()