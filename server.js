//******************
//** Dependencies **
//******************
const express = require('express')
const app = express()
const postgres = require('./postgres.js')
const path = require('path');
const PORT = process.env.PORT || 3001


// const cors = require('cors')

//*****************
//** Controllers **
//*****************
// const peopleController = require('./controllers/people.js')
const usersController = require('./controllers/users.js')

//****************
//** Middleware **
//****************
// app.use(cors())

app.use(express.json())
app.use(express.static('public'))
app.use('/users', usersController)

//****************
//*** Listener ***
//****************
postgres.connect()

app.listen(PORT, () => {
    console.log('listening at', PORT)
})
