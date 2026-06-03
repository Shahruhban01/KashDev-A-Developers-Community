const express = require('express')
const router = express.Router()
const { apply, getMyApplications, getOpportunityApplicants, updateApplicationStage, shortlistApplicant } = require('../controllers/applicationController')
const { protect } = require('../middleware/auth')

router.use(protect)
router.post('/',                                    apply)
router.get('/mine',                                 getMyApplications)
router.get('/opportunity/:opportunityId',            getOpportunityApplicants)
router.put('/:id/stage',                            updateApplicationStage)
router.put('/:id/shortlist',                        shortlistApplicant)

module.exports = router