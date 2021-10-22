//******************
//** Dependencies **
//******************
const express = require('express')
const app = express()
const postgres = require('./postgres.js')
const path = require('path');


// const cors = require('cors')

//*****************
//** Controllers **
//*****************
// const peopleController = require('./controllers/people.js')

//****************
//** Middleware **
//****************
// app.use(cors())

app.use(express.json())
// app.use(express.static('public'))
app.get('/api', (req,res) => {
    res.send('api')
})
app.use(express.static(path.join(__dirname, '../client/build')));
// app.use('/people', peopleController)



app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});
//****************
//*** Listener ***
//****************
postgres.connect()

app.listen(process.env.PORT || 3000, () => {
    console.log('listening at', process.env.PORT || 3000)
})
