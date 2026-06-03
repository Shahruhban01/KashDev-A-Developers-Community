// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const { protect } = require('../middleware/auth');

// // Get community stats
// router.get('/stats', async (req, res, next) => {
//   try {
//     const { Project, Opportunity, DeveloperProfile } = {
//       Project: require('../models/Project'),
//       Opportunity: require('../models/Opportunity'),
//       DeveloperProfile: require('../models/DeveloperProfile'),
//     };
//     const [users, projects, opportunities] = await Promise.all([
//       User.countDocuments(),
//       Project.countDocuments({ status: 'active' }),
//       Opportunity.countDocuments({ isActive: true }),
//     ]);
//     res.json({ success: true, data: { users, projects, opportunities } });
//   } catch (error) {
//     next(error);
//   }
// });

// // Update current user basic info
// router.put('/me', protect, async (req, res, next) => {
//   try {
//     const { name, bio, avatar, location } = req.body;
//     const user = await User.findByIdAndUpdate(req.user._id, { name, bio, avatar, location }, { new: true });
//     res.json({ success: true, data: user });
//   } catch (error) {
//     next(error);
//   }
// });

// module.exports = router;

const express = require('express')
const router = express.Router()
const {
  getCommunityStats,
  getMyProfile,
  updateMyProfile,
  getSavedOpportunities,
  getUserByUsername,
} = require('../controllers/userController')
const { protect } = require('../middleware/auth')

router.get('/stats',              getCommunityStats)
router.get('/me',        protect, getMyProfile)
router.put('/me',        protect, updateMyProfile)
router.get('/saved',     protect, getSavedOpportunities)
router.get('/:username',          getUserByUsername)

module.exports = router