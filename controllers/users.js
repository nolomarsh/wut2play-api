const express = require('express')
const router = express()
postgres = require('../postgres.js')

router.get('/', (req,res) => {
    postgres.query('SELECT * FROM users ORDER BY id ASC;')
})

module.export = router
