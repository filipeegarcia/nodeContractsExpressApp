const jobsService = require('../controllers/jobs')
const express = require('express')
const router = express.Router()

router.post('/:job_id/pay', jobsService.pay)
router.get('/unpaid', jobsService.getUserUnpaidJobs)


module.exports = router