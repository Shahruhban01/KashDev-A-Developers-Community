const express = require('express')
const router = express.Router()
const { getCompanies, getCompanyBySlug } = require('../controllers/companyController')

router.get('/',            getCompanies)
router.get('/:companySlug', getCompanyBySlug)

module.exports = router