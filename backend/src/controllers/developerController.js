const User = require('../models/User');
const DeveloperProfile = require('../models/DeveloperProfile');
const Project = require('../models/Project');

// @desc    Get all developers
// @route   GET /api/developers
// @access  Public
const getDevelopers = async (req, res, next) => {
  try {
    const { search, skill, company, experience, page = 1, limit = 12 } = req.query

    // Build profile-level query
    const profileQuery = {}
    if (experience) profileQuery.experience = experience

    // Fuzzy skill matching — match partial skill names too
    if (skill) {
      profileQuery.skills = { $regex: skill, $options: 'i' }
    }

    // Fuzzy company matching on profile
    if (company) {
      profileQuery.company = { $regex: company, $options: 'i' }
    }

    // Build user-level match for population
    let userMatch = {}
    if (search && search.trim()) {
      const q = search.trim()
      userMatch = {
        $or: [
          { name:     { $regex: q, $options: 'i' } },
          { username: { $regex: q, $options: 'i' } },
          { bio:      { $regex: q, $options: 'i' } },
          { locationString: { $regex: q, $options: 'i' } },
          { 'location.city':     { $regex: q, $options: 'i' } },
          { 'location.district': { $regex: q, $options: 'i' } },
        ]
      }
    }

    // If search term looks like a skill, also search profiles by skill
    // This handles "react developer" → finds React skill
    let skillFromSearch = null
    if (search && !skill) {
      skillFromSearch = search.trim()
      profileQuery.skills = {
        ...profileQuery.skills,
        $regex: skillFromSearch,
        $options: 'i',
      }
    }

    // Attempt 1: strict query
    let profiles = await DeveloperProfile.find(profileQuery)
      .populate({
        path: 'user',
        select: 'name username bio avatar locationString location isFeatured isVerified',
        match: Object.keys(userMatch).length ? userMatch : undefined,
      })
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 3) // fetch extra to account for null user filters

    let validProfiles = profiles.filter(p => p.user !== null)

    // Attempt 2: if no results and search exists, relax — search only by user fields,
    // drop profile filters
    if (validProfiles.length === 0 && search) {
      const q = search.trim()
      const relaxedUserMatch = {
        $or: [
          { name:           { $regex: q, $options: 'i' } },
          { username:       { $regex: q, $options: 'i' } },
          { bio:            { $regex: q, $options: 'i' } },
          { locationString: { $regex: q, $options: 'i' } },
        ]
      }
      profiles = await DeveloperProfile.find({}) // no profile filter
        .populate({
          path: 'user',
          select: 'name username bio avatar locationString location isFeatured isVerified',
          match: relaxedUserMatch,
        })
        .sort({ createdAt: -1 })
        .limit(Number(limit) * 3)

      validProfiles = profiles.filter(p => p.user !== null)
    }

    // Attempt 3: if still nothing, do a broad "similar" suggestion
    // Split search into words and try matching any single word
    if (validProfiles.length === 0 && search && search.includes(' ')) {
      const words = search.trim().split(/\s+/).filter(w => w.length > 2)
      const wordRegexes = words.map(w => ({
        $or: [
          { name: { $regex: w, $options: 'i' } },
          { bio:  { $regex: w, $options: 'i' } },
          { username: { $regex: w, $options: 'i' } },
        ]
      }))

      profiles = await DeveloperProfile.find({})
        .populate({
          path: 'user',
          select: 'name username bio avatar locationString location isFeatured isVerified',
          match: { $or: wordRegexes.flatMap(r => r.$or) },
        })
        .sort({ createdAt: -1 })
        .limit(Number(limit) * 3)

      validProfiles = profiles.filter(p => p.user !== null)
    }

    // Paginate after filtering
    const total = validProfiles.length
    const paginated = validProfiles.slice((page - 1) * limit, page * limit)

    res.json({
      success: true,
      data: paginated,
      fallback: total === 0 ? false : validProfiles.length !== profiles.filter(p=>p.user!==null).length,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    next(error)
  }
}
// @desc    Get developer by username
// @route   GET /api/developers/:username
// @access  Public
const getDeveloperByUsername = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('Developer not found');
    }

    const profile = await DeveloperProfile.findOne({ user: user._id });
    const projects = await Project.find({ owner: user._id, status: 'active' }).sort({ createdAt: -1 });

    // Increment profile views
    if (profile) {
      profile.profileViews += 1;
      await profile.save();
    }

    res.json({ success: true, data: { user, profile, projects } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update developer profile
// @route   PUT /api/developers/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const {
      name, bio, avatar,
      locationString,           // plain text from frontend input
      locationCity,             // optional structured fields
      locationDistrict,
      locationState,
      skills, company, jobTitle, experience,
      github, linkedin, portfolio, twitter,
      openToWork, openToFreelance, achievements
    } = req.body

    // Build the location object from whatever the frontend sends
    const locationUpdate = {}
    if (locationCity)    locationUpdate['location.city']     = locationCity
    if (locationDistrict)locationUpdate['location.district'] = locationDistrict
    if (locationState)   locationUpdate['location.state']    = locationState

    // Always update the display string
    const displayStr = locationString ||
      [locationCity, locationDistrict, locationState, 'India'].filter(Boolean).join(', ')

    await User.findByIdAndUpdate(req.user._id, {
      name,
      bio,
      avatar,
      locationString: displayStr,
      ...locationUpdate,
    })

    const profile = await DeveloperProfile.findOneAndUpdate(
      { user: req.user._id },
      { skills, company, jobTitle, experience, github, linkedin,
        portfolio, twitter, openToWork, openToFreelance, achievements },
      { new: true, upsert: true }
    )

    res.json({ success: true, data: profile })
  } catch (error) {
    next(error)
  }
}

// @desc    Get Hall of Fame developers
// @route   GET /api/developers/hall-of-fame
// @access  Public
const getHallOfFame = async (req, res, next) => {
  try {
    const profiles = await DeveloperProfile.find({
      hallOfFameCategory: { $ne: '' }
    }).populate('user', 'name username bio avatar location isFeatured isVerified');

    res.json({ success: true, data: profiles });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDevelopers, getDeveloperByUsername, updateProfile, getHallOfFame };