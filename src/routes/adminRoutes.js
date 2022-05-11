const adminService = require('../services/adminService')
const express = require('express')
const router = express.Router()

router.get('/best-clients', adminService.getBestClients)
router.get('/best-profession', adminService.getBestProfession)

module.exports = router