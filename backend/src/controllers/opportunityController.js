const Opportunity = require('../models/Opportunity');
const User = require('../models/User');

// @desc    Get all opportunities
// @route   GET /api/opportunities
// @access  Public
const getOpportunities = async (req, res, next) => {
  try {
    const { type, search, page = 1, limit = 10 } = req.query
    const baseQuery = { isActive: true }
    if (type) baseQuery.type = type

    let query = { ...baseQuery }
    if (search) {
      const q = search.trim()
      query.$or = [
        { title:       { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { company:     { $regex: q, $options: 'i' } },
        { location:    { $regex: q, $options: 'i' } },
        { skills:      { $regex: q, $options: 'i' } },
      ]
    }

    let opportunities = await Opportunity.find(query)
      .populate('postedBy', 'name username avatar')
      .sort({ createdAt: -1 })

    // Relaxed fallback: word split
    if (opportunities.length === 0 && search && search.includes(' ')) {
      const words = search.trim().split(/\s+/).filter(w => w.length > 2)
      const relaxed = {
        ...baseQuery,
        $or: words.flatMap(w => [
          { title:   { $regex: w, $options: 'i' } },
          { company: { $regex: w, $options: 'i' } },
          { skills:  { $regex: w, $options: 'i' } },
        ])
      }
      opportunities = await Opportunity.find(relaxed)
        .populate('postedBy', 'name username avatar')
        .sort({ createdAt: -1 })
    }

    const total = opportunities.length
    const paginated = opportunities.slice((page - 1) * limit, page * limit)

    res.json({
      success: true,
      data: paginated,
      pagination: {
        page: Number(page), limit: Number(limit),
        total, pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create opportunity
// @route   POST /api/opportunities
// @access  Private
const createOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.create({ ...req.body, postedBy: req.user._id });
    await opportunity.populate('postedBy', 'name username avatar');
    res.status(201).json({ success: true, data: opportunity });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete opportunity
// @route   DELETE /api/opportunities/:id
// @access  Private
const deleteOpportunity = async (req, res, next) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) { res.status(404); throw new Error('Opportunity not found'); }
    if (opp.postedBy.toString() !== req.user._id.toString()) {
      res.status(403); throw new Error('Not authorized');
    }
    await opp.deleteOne();
    res.json({ success: true, message: 'Opportunity removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Save / Unsave opportunity
// @route   POST /api/opportunities/:id/save
// @access  Private
const toggleSave = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const saved = user.savedOpportunities.includes(req.params.id);

    if (saved) {
      user.savedOpportunities.pull(req.params.id);
    } else {
      user.savedOpportunities.push(req.params.id);
    }
    await user.save();

    res.json({ success: true, saved: !saved });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOpportunities, createOpportunity, deleteOpportunity, toggleSave };