const balancesService = require('../services/balancesService')
const express = require('express')
const router = express.Router()

router.post('/balances/deposit/:user_id', balancesService.depositBalance)

module.exports = router