const jobsService = require('../services/jobsService')
const express = require('express')
const router = express.Router()

router.post('/:job_id/pay', jobsService.payJobById)
router.get('/unpaid', jobsService.getAllUserUnpaidJobs)


module.exports = router