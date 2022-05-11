const contractsService = require('../services/contractsService')
const express = require('express')
const router = express.Router()

router.get('/', contractsService.getUserContracts)
router.get('/:id', contractsService.getUserContractById)

module.exports = router