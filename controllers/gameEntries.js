const express = require('express')
const router = express.Router()
const postgres = require('../postgres.js')

/*
game_entry model
id serial,
name varchar(64),
image_url varchar(254),
min_players int,
max_players int,
min_playtime int,
max_playtime int,
notes text,
user_id int
*/

router.get('/', (req,res) => {
    postgres.query(`SELECT * FROM game_entries;`, (err, results) => {
        res.json(results.rows)
    })
})

//get games by userId, no reason to get all of the
router.get('/:user_id', (req,res) => {
    postgres.query(
        `SELECT * FROM game_entries WHERE user_id = ${req.params.user_id};`, (err, results) => {
            if (err) {
                res.json({error: err})
            }
            res.json(results.rows)
        })
})

router.post('/get_game_pool', (req,res) => {
    let queryString = `SELECT * FROM game_entries WHERE user_id IN (${req.body.user_ids.join(',')})`
    if(req.body.num_players > 0){
        queryString += ` AND
        min_players <= ${req.body.num_players} AND
        max_players >= ${req.body.num_players}`
    }
    if (req.body.playtime > 0) {
        queryString += ` AND
        min_playtime <= ${req.body.playtime} AND
        max_playtime >= ${req.body.playtime}`
    }
    queryString += ';'
    postgres.query(queryString, (err, results) => {
        if (err) {
            res.json({error: err})
        }
        res.json(results.rows)
    })
})

//new game route
router.post('/newgame', (req,res) => {
    postgres.query(
        `INSERT INTO game_entries (name, image_url, min_players, max_players, min_playtime, max_playtime, notes, user_id) values (
            '${req.body.name}',
            '${req.body.image_url}',
            ${req.body.min_players},
            ${req.body.max_players},
            ${req.body.min_playtime},
            ${req.body.max_playtime},
            '${req.body.notes}',
            ${req.body.user_id}
        );`, (err, response) => {
            if (err) {
                res.json({error: err})
            }
            postgres.query(`SELECT * FROM game_entries WHERE user_id = ${req.body.user_id};`, (err, results) => {
                res.json(results.rows)
            })
        }
    )
})

router.put('/:game_id', (req,res) => {
    postgres.query(
        `UPDATE game_entries SET
        name= '${req.body.name}',
        image_url = '${req.body.image_url}',
        min_players = ${req.body.min_players},
        max_players = ${req.body.max_players},
        min_playtime = ${req.body.min_playtime},
        max_playtime = ${req.body.max_playtime},
        notes = '${req.body.notes}';`, (err, response) => {
            postgres.query(`SELECT * FROM game_entries WHERE id = ${req.params.game_id}`, (err, updatedGame) => {
                res.json(updatedGame.rows[0])
            })
        }
    )
})

router.delete('/:game_id', (req,res) => {
    postgres.query(`DELETE FROM game_entries WHERE id = ${req.params.game_id};`, (err, results) => {
        if (err) {
            res.json({error: err})
        } else {
            postgres.query(`SELECT * FROM game_entries WHERE user_id = ${req.body.user_id}`, (err, remainingGames) => {
                console.log(remainingGames)
                res.json(remainingGames.rows)
            })
        }
    })
})

module.exports = router
