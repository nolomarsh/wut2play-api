const express = require('express')
const router = express.Router()
const postgres = require('../postgres.js')

/*
gameentry model
id serial,
name varchar(64),
imageurl varchar(254),
minplayers int,
maxplayers int,
mintime int,
maxtime int,
notes text,
userid int
*/

router.get('/', (req,res) => {
    postgres.query(`SELECT * FROM gameentries;`, (err, results) => {
        res.json(results.rows)
    })
})

//get games by userId, no reason to get all of the
router.get('/:userid', (req,res) => {
    postgres.query(
        `SELECT * FROM gameentries WHERE userid = ${req.params.userid};`, (err, results) => {
            if (err) {
                res.json({error: err})
            }
            res.json(results.rows)
        })
})

router.post('/:userid/filter', (req,res) => {
    postgres.query(
        `SELECT * FROM gameentries WHERE
        userid = ${req.params.userid} AND
        minplayers <= ${req.body.numplayers} AND
        maxplayers >= ${req.body.numplayers} AND
        mintime <= ${req.body.playtime} AND
        maxtime >= ${req.body.playtime};`, (err, results) => {
            if (err) {
                res.json({error: err})
            }
            res.json(results.rows)
        }
    )
})

//new game route
router.post('/newgame', (req,res) => {
    postgres.query(
        `INSERT INTO gameentries (name, imageurl, minplayers, maxplayers, mintime, maxtime, notes, userId) values (
            '${req.body.name}',
            '${req.body.image_url}',
            ${req.body.min_players},
            ${req.body.max_players},
            ${req.body.min_playtime},
            ${req.body.max_playtime},
            '${req.body.notes}',
            ${req.body.userid}
        );`, (err, response) => {
            if (err) {
                res.json({error: err})
            }
            postgres.query(`SELECT * FROM gameentries WHERE userId = ${req.body.userId};`, (err, results) => {
                res.json(results.rows)
            })
        }
    )
})

router.put('/:gameid', (req,res) => {
    postgres.query(
        `UPDATE gameentries SET
        name= '${req.body.name}',
        image_url = '${req.body.image_url}',
        min_players = ${req.body.min_players},
        max_players = ${req.body.max_players},
        min_playtime = ${req.body.min_playtime},
        max_playtime = ${req.body.max_playtime},
        notes = '${req.body.notes}';`, (err, response) => {
            postgres.query(`SELECT * FROM gameentries WHERE id = ${req.params.gameid}`, (err, updatedGame) => {
                res.json(updatedGame.rows[0])
            })
        }
    )
})

router.post('/delete/:gameid', (req,res) => {
    postgres.query(`DELETE FROM gameentries WHERE id = ${req.params.gameid};`, (err, results) => {
        if (err) {
            res.json({error: err})
        }
        res.json({status: 'deleted'})
    })
})

module.exports = router
