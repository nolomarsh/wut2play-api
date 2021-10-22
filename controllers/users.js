const express = require('express')
const router = express.Router()
postgres = require('../postgres.js')

router.get('/', (req,res) => {
    postgres.query('SELECT username FROM users ORDER BY id ASC;', (err, results) => {
        res.json(results.rows)
    })
})

router.get('/:id', (req,res) => {
    postgres.query(`SELECT * FROM users WHERE id = ${req.params.id}`, (err, result) => {
        res.json(result)
    })
})

module.exports = router
