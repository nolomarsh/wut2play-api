const express = require('express')
const router = express.Router()
const postgres = require('../postgres.js')
const bcrypt = require('bcrypt')

//get all usernames
router.get('/', (req,res) => {
    postgres.query('SELECT username FROM users ORDER BY id ASC;', (err, results) => {
        res.json(results.rows)
    })
})

//get all data on a user by id
router.get('/:id', (req,res) => {
    postgres.query(`SELECT * FROM users WHERE id = ${req.params.id};`, (err, result) => {
        res.json(result.rows)
    })
})

router.post('/newuser', (req,res) => {
    const hashPass = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
    postgres.query(`INSERT INTO users (username, password, email) VALUES (${req.body.username}, ${hashPass}, ${req.body.email})`, (err, newUser) => {
        res.json(newUser)
    })
})

router.post('/login', (req,res) => {
    postgres.query(`SELECT * FROM users WHERE username = ${req.body.username}`, (err, results) => {
        if (err) {
            res.json({error: 'Database error'})
        } else if (results.rowCount === 0) {
            res.json({error: 'Invalid username/password'})
        } else {
            const foundUser = results.rows[0]
            if (bcrypt.compareSync(req.body.password, foundUser.password)){
                res.json(foundUser)
            } else {
                res.json({error: 'Invalid username/password'})
            }
        }
    })
})

module.exports = router
