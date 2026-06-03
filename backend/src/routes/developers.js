const express = require('express');
const router = express.Router();
const { getDevelopers, getDeveloperByUsername, updateProfile, getHallOfFame } = require('../controllers/developerController');
const { protect } = require('../middleware/auth');

router.get('/', getDevelopers);
router.get('/hall-of-fame', getHallOfFame);
router.put('/profile', protect, updateProfile);
router.get('/:username', getDeveloperByUsername);

module.exports = router;