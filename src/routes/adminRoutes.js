const adminService = require('../services/adminService')
const express = require('express')
const router = express.Router()

router.get('/best-clients', adminService.getBestClients)
router.get('/best-profession', adminService.getBestContractors)

module.exports = router