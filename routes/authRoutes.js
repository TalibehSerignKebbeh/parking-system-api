const express = require('express')
const { Login, Logout } = require('../controllers/authController')


const router = express.Router()

router.route('/')
    .post(Login)
    .patch(Logout)

module.exports = router