const express = require('express')
const router = express.Router()
const postgres = require('../postgres.js')
const bcrypt = require('bcrypt')

/*
User Model
id: serial
username: varchar(32) UNIQUE
password: varchar(108)
email: varchar(32) UNIQUE
*/

//get all users
router.get('/', (req,res) => {
    postgres.query('SELECT * FROM users ORDER BY id ASC;', (err, results) => {
        res.json(results.rows)
    })
})

//get all data on a user by id
router.get('/:id', (req,res) => {
    postgres.query(`SELECT * FROM users WHERE id = ${req.params.id};`, (err, result) => {
        res.json(result.rows)
    })
})

//Create new user route
//Returns the newly created user
router.post('/newuser', (req,res) => {
    console.log(req.body)
    const hashPass = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
    console.log(hashPass.length)

    postgres.query(`INSERT INTO users (username, password, email) VALUES (
        '${req.body.username}', 
        '${hashPass}', 
        '${req.body.email}');`,
        (err, newUser) => {
            if (err) {
                res.json({error: err})
            }
            postgres.query(
                'SELECT * FROM users ORDER BY id DESC LIMIT 1;', 
                (err, results) => {
                    res.json(results.rows[0])
                }
            )
        }
    )
})

//UPDATE - returns updated user
router.put('/:id', (req,res) => {
    if (req.body.password) {
        req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
    }
    postgres.query(
        `UPDATE users SET
        username = '${req.body.username}',
        password = '${req.body.password}',
        email = '${req.body.email}'
        WHERE id = ${req.params.id};`, (err, results) => {
            postgres.query(`SELECT * FROM users WHERE id = ${req.params.id};`, (error, updatedUser) => {
                res.json(updatedUser.rows[0])
            })
        })
})

//DELETE - deletes the user and all of their game entries
//returns all remaining users
router.delete('/delete/:id', (req,res) => {
    postgres.query(`DELETE FROM users WHERE id = ${req.params.id}`, (err, response) => {
        postgres.query(`DELETE FROM game-entries WHERE userId = ${req.params.id}`, (err, response) => {
            postgres.query(`SELECT * FROM users;`, (error, remainingUsers) => {
                res.json(remainingUsers.rows)
            })
        })
    })
})

//verifies a username/password combination
//returns an error message if there is no user or the password is incorrect
//returns the user if the combination is correct
router.post('/login', (req,res) => {
    postgres.query(`SELECT * FROM users WHERE username = '${req.body.username}';`, (err, results) => {
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
