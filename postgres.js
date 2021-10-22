const Client = require('pg').Client

const dbConfig = {
    connectionString: 'postgresql://localhost:5432/wut2playtest'
}

if(process.env.DATABASE_URL){
    dbConfig.ssl = { rejectUnauthorized: false }
    dbConfig.connectionString = process.env.DATABASE_URL
}

const client = new Client(dbConfig)

module.exports = client
