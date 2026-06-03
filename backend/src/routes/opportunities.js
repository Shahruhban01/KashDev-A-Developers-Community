const express = require('express');
const router = express.Router();
const { getOpportunities, createOpportunity, deleteOpportunity, toggleSave } = require('../controllers/opportunityController');
const { protect } = require('../middleware/auth');

router.route('/').get(getOpportunities).post(protect, createOpportunity);
router.route('/:id').delete(protect, deleteOpportunity);
router.post('/:id/save', protect, toggleSave);

module.exports = router;