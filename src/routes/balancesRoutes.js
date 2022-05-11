const balancesService = require('../controllers/balances')
const express = require('express')
const router = express.Router()

router.post('/balances/deposit/:user_id', balancesService.deposit)

module.exports = router