const express = require('express')
const router = express.Router()
const postgres = require('../postgres.js')
const bcrypt = require('bcrypt')
const createError = require('http-errors')

/*
User Table
id: serial
username: text UNIQUE
password: text
email: text UNIQUE
request_ids: integer[]
friend_ids: integer[]
*/

const giveErrorMessage = message => {
  return {
    id: -1,
    username: '',
    password: '',
    email: '',
    request_ids: [],
    friend_ids: [],
    message: message
  }
}

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
router.post('/newuser', (req,res,next) => {
  const hashPass = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
  postgres.query(`SELECT * FROM users WHERE username = '${req.body.username}' OR email = '${req.body.email}';`, (err, foundUsers) => {
    if (foundUsers.rows.length > 0) {
      res.status(202).json(giveErrorMessage('Username/email already in use'))
    } else {
      postgres.query(`INSERT INTO users (username, password, email) VALUES (
        '${req.body.username}', 
        '${hashPass}', 
        '${req.body.email}');`, (err, response) => {
          if (err) {
            next(err)
          } else {
            postgres.query(
              `SELECT * FROM users WHERE username = ${req.body.username};`, (err, results) => {
                res.status(201).json(results.rows[0])
              }
            )
          }   
        }
      )
    }
  })   
})

//If receiver already has a pending request from sender, removes id from request_ids, otherwise adds id to request_ids
router.put('/friends/toggleRequest', (req,res) => {
  const { senderId, receiverId } = req.body
  postgres.query(`SELECT * FROM users WHERE id = ${receiverId};`, (err, response) => {
    const receiverRequests = response.rows[0].request_ids
    if(!receiverRequests.includes(senderId)){
      postgres.query(
        `UPDATE users 
        SET request_ids = array_append(request_ids, ${senderId}) 
        WHERE id = ${receiverId};`, (err,response) => {
          postgres.query(
            `SELECT * FROM users
            WHERE id = ${receiverId}`, (err, response) => {
              res.json(response.rows[0])
            }
          )
        }
      )
    } else {
      postgres.query(
        `SELECT array_remove(request_ids, ${senderId}) 
        AS processed_array 
        FROM users 
        WHERE id = ${receiverId}`, (err, response) => {
          const newArray = response.rows[0].processed_array
          postgres.query(
            `UPDATE users
            SET request_ids = '{"${newArray.join('","')}"}'
            WHERE id = ${receiverId};`, (err, response) => {
              postgres.query(
                `SELECT * FROM users
                WHERE id = ${receiverId};`, (err, response) => {
                  res.json(response.rows[0])
                }
              )
            } 
          )
        }
      )
    }
  })
})

router.put('/friends/response', (req,res) => {
  const { responderId, requesterId, action } = req.body
  postgres.query(
    `SELECT * FROM users
    WHERE id = ${responderId}`, (err, response) => {
      const { request_ids, friend_ids } = response.rows[0]
      //TODO finish this function, currently just grabs the responder
      res.json(response.rows[0])
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
    }
  )
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
  //A properly shaped response to deliver an error message without actually throwing an error
    const badLoginResponse = giveErrorMessage('Invalid username/password combination')
    if (err) {
      next(err)
    } else if (results.rowCount === 0) {
      res.json(badLoginResponse)
    } else {
      const foundUser = results.rows[0]
      if (bcrypt.compareSync(req.body.password, foundUser.password)){
      res.json({...foundUser, message: ''})
      } else {
      res.json(badLoginResponse)
      }
    }
  })
})

router.use((error, req, res, next) => {
  console.log(error.message)
  if (error) res.json(giveErrorMessage(error.message))
})

module.exports = router
