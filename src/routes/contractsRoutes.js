const contractsService = require('../controllers/contracts')
const express = require('express')
const router = express.Router()

router.get('/', contractsService.getUserContracts)
router.get('/:id', contractsService.getUserContract)

module.exports = router