const express = require('express')
const router = express.Router()
postgres = require('../postgres.js')

router.get('/', (req,res) => {
    postgres.query('SELECT * FROM users ORDER BY id ASC;', (err, results) => {
        res.json(results.rows)
    })
})

module.exports = router
