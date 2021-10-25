const express = require('express')
const router = express.Router()
const postgres = require('../postgres.js')

/*
game entry model
id serial,
name varchar(64),
image-url varchar(254),
min-players int,
max-players int,
min-time int,
max-time int,
notes text,
userId int
*/

//get games by userId, no reason to get all of the
router.get('/:userid', (req,res) => {
    postgres.query(
        `SELECT * FROM game-entries WHERE userId = ${req.params.userId}`, (err, results) => {
            if (err) {
                res.json({error: err})
            }
            res.json(results.rows)
        })
})

router.post('/newGame', (req,res) => {
    postgres.query(
        `INSERT INTO game-entries (name, image-url, min-players, max-players, min-time, max-time, notes, userId) values (
            '${req.body.name}',
            '${req.body.imageUrl}',
            ${req.body.minPlayers},
            ${req.body.maxPlayers},
            ${req.body.minTime},
            ${req.body.maxTime},
            ${req.body.notes},
            ${req.body.userId}
        );`, (err, response) => {
            postgres.query(`SELECT * FROM game-entries WHERE userId = ${req.body.userId}`, (err, results) => {
                res.json(results.rows)
            })
        }
    )
})

module.exports = router
