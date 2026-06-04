const WaitlistMember = require('../models/WaitlistMember')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildFilter(query) {
  const filter = {}

  if (query.search) {
    filter.$text = { $search: query.search }
  }
  if (query.role)      filter.role      = query.role
  if (query.status)    filter.status    = query.status
  if (query.location)  filter.location  = new RegExp(query.location, 'i')

  if (query.contacted !== undefined && query.contacted !== '') {
    filter.contacted = query.contacted === 'true'
  }

  // Date range filter
  if (query.date_from || query.date_to) {
    filter.createdAt = {}
    if (query.date_from) filter.createdAt.$gte = new Date(query.date_from)
    if (query.date_to)   filter.createdAt.$lte = new Date(new Date(query.date_to).setHours(23, 59, 59, 999))
  }

  return filter
}

function escapeCsvField(val) {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function buildCsvRow(m) {
  const fields = [
    m.full_name, m.email, m.phone, m.location, m.role,
    m.github_url, m.linkedin_url, m.portfolio_url,
    m.company_or_college, m.skills, m.message,
    m.status, m.contacted, m.contacted_at, m.source,
    m.createdAt,
    m.notes?.map(n => n.text).join(' | ') || '',
  ]
  return fields.map(escapeCsvField).join(',')
}

const CSV_HEADER = [
  'Full Name', 'Email', 'Phone', 'Location', 'Role',
  'GitHub', 'LinkedIn', 'Portfolio', 'Company/College',
  'Skills', 'Message', 'Status', 'Contacted', 'Contacted At',
  'Source', 'Created At', 'Notes',
].join(',')


// ─── Public ───────────────────────────────────────────────────────────────────

// @desc    Join waitlist
// @route   POST /api/waitlist
// @access  Public
const joinWaitlist = async (req, res, next) => {
  try {
    const {
      full_name, email, location, role,
      phone, github_url, linkedin_url, portfolio_url,
      company_or_college, skills, message,
    } = req.body

    // Required field validation
    if (!full_name?.trim()) {
      res.status(400); throw new Error('Full name is required')
    }
    if (!email?.trim()) {
      res.status(400); throw new Error('Email is required')
    }
    if (!location?.trim()) {
      res.status(400); throw new Error('Location is required')
    }
    if (!role) {
      res.status(400); throw new Error('Role is required')
    }

    // Email format
    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(email.trim())) {
      res.status(400); throw new Error('Invalid email address')
    }

    // Duplicate check
    const existing = await WaitlistMember.findOne({ email: email.trim().toLowerCase() })
    if (existing) {
      res.status(409); throw new Error('This email is already on the waitlist!')
    }

    const member = await WaitlistMember.create({
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      location: location.trim(),
      role,
      phone: phone?.trim() || '',
      github_url: github_url?.trim() || '',
      linkedin_url: linkedin_url?.trim() || '',
      portfolio_url: portfolio_url?.trim() || '',
      company_or_college: company_or_college?.trim() || '',
      skills: skills?.trim() || '',
      message: message?.trim() || '',
      source: 'website',
    })

    res.status(201).json({
      success: true,
      message: "🎉 You're on the waitlist! We'll be in touch soon.",
      data: { id: member._id, email: member.email, full_name: member.full_name },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get public waitlist count
// @route   GET /api/waitlist/count
// @access  Public
const getWaitlistCount = async (req, res, next) => {
  try {
    const count = await WaitlistMember.countDocuments()
    res.json({ success: true, data: { count } })
  } catch (error) {
    next(error)
  }
}


// ─── Admin ────────────────────────────────────────────────────────────────────

// @desc    Get paginated waitlist with search, filter, sort
// @route   GET /api/waitlist
// @access  Admin
const getWaitlist = async (req, res, next) => {
  try {
    const page    = Math.max(1, parseInt(req.query.page)  || 1)
    const limit   = Math.min(100, parseInt(req.query.limit) || 20)
    const skip    = (page - 1) * limit
    const sortField = req.query.sort_by || 'createdAt'
    const sortDir   = req.query.sort_dir === 'asc' ? 1 : -1
    const filter    = buildFilter(req.query)

    const [members, total] = await Promise.all([
      WaitlistMember.find(filter)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limit)
        .lean(),
      WaitlistMember.countDocuments(filter),
    ])

    res.json({
      success: true,
      data: members,
      pagination: {
        page, limit, total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get dashboard stats cards
// @route   GET /api/waitlist/stats
// @access  Admin
const getWaitlistStats = async (req, res, next) => {
  try {
    const now  = new Date()
    const tod  = new Date(now); tod.setHours(0, 0, 0, 0)
    const w7   = new Date(now - 7  * 24 * 60 * 60 * 1000)
    const w30  = new Date(now - 30 * 24 * 60 * 60 * 1000)

    const [total, today, last7, last30, contacted, notContacted, byStatus] = await Promise.all([
      WaitlistMember.countDocuments(),
      WaitlistMember.countDocuments({ createdAt: { $gte: tod } }),
      WaitlistMember.countDocuments({ createdAt: { $gte: w7 } }),
      WaitlistMember.countDocuments({ createdAt: { $gte: w30 } }),
      WaitlistMember.countDocuments({ contacted: true }),
      WaitlistMember.countDocuments({ contacted: false }),
      WaitlistMember.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ])

    res.json({
      success: true,
      data: { total, today, last7, last30, contacted, notContacted, byStatus },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get analytics time-series + breakdowns
// @route   GET /api/waitlist/analytics
// @access  Admin
const getWaitlistAnalytics = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30

    const since = new Date()
    since.setDate(since.getDate() - days)
    since.setHours(0, 0, 0, 0)

    const [dailyGrowth, byRole, byLocation, byStatus] = await Promise.all([
      // Signups per day
      WaitlistMember.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              year:  { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day:   { $dayOfMonth: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]),
      // By role
      WaitlistMember.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      // By location (top 15)
      WaitlistMember.aggregate([
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      // By status
      WaitlistMember.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ])

    res.json({
      success: true,
      data: { dailyGrowth, byRole, byLocation, byStatus, days },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single member by id
// @route   GET /api/waitlist/:id
// @access  Admin
const getWaitlistMember = async (req, res, next) => {
  try {
    const member = await WaitlistMember.findById(req.params.id)
    if (!member) {
      res.status(404); throw new Error('Member not found')
    }
    res.json({ success: true, data: member })
  } catch (error) {
    next(error)
  }
}

// @desc    Update member (status, contacted, notes, any field)
// @route   PUT /api/waitlist/:id
// @access  Admin
const updateWaitlistMember = async (req, res, next) => {
  try {
    const allowed = [
      'status', 'contacted', 'contacted_at', 'source',
      'full_name', 'email', 'phone', 'location', 'role',
      'github_url', 'linkedin_url', 'portfolio_url',
      'company_or_college', 'skills', 'message',
    ]
    const updates = {}
    allowed.forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f]
    })

    // Auto-set contacted_at when marking contacted
    if (updates.contacted === true) {
      updates.contacted_at = updates.contacted_at || new Date()
    }
    if (updates.contacted === false) {
      updates.contacted_at = null
    }

    const member = await WaitlistMember.findByIdAndUpdate(
      req.params.id, updates, { new: true, runValidators: true }
    )
    if (!member) {
      res.status(404); throw new Error('Member not found')
    }
    res.json({ success: true, data: member })
  } catch (error) {
    next(error)
  }
}

// @desc    Append a note to a member
// @route   POST /api/waitlist/:id/notes
// @access  Admin
const addNote = async (req, res, next) => {
  try {
    const { text } = req.body
    if (!text?.trim()) {
      res.status(400); throw new Error('Note text is required')
    }
    const member = await WaitlistMember.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: { text: text.trim() } } },
      { new: true }
    )
    if (!member) {
      res.status(404); throw new Error('Member not found')
    }
    res.json({ success: true, data: member })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete member
// @route   DELETE /api/waitlist/:id
// @access  Admin
const deleteWaitlistMember = async (req, res, next) => {
  try {
    const member = await WaitlistMember.findByIdAndDelete(req.params.id)
    if (!member) {
      res.status(404); throw new Error('Member not found')
    }
    res.json({ success: true, message: 'Member deleted successfully' })
  } catch (error) {
    next(error)
  }
}

// @desc    Bulk actions (mark contacted, update status, delete)
// @route   POST /api/waitlist/bulk
// @access  Admin
const bulkAction = async (req, res, next) => {
  try {
    const { ids, action, value } = req.body
    if (!ids?.length) {
      res.status(400); throw new Error('No IDs provided')
    }

    let result
    if (action === 'delete') {
      result = await WaitlistMember.deleteMany({ _id: { $in: ids } })
      return res.json({ success: true, message: `${result.deletedCount} members deleted` })
    }
    if (action === 'mark_contacted') {
      result = await WaitlistMember.updateMany(
        { _id: { $in: ids } },
        { contacted: true, contacted_at: new Date() }
      )
    }
    if (action === 'mark_not_contacted') {
      result = await WaitlistMember.updateMany(
        { _id: { $in: ids } },
        { contacted: false, contacted_at: null }
      )
    }
    if (action === 'update_status' && value) {
      result = await WaitlistMember.updateMany(
        { _id: { $in: ids } },
        { status: value }
      )
    }

    res.json({ success: true, message: `${result?.modifiedCount || 0} members updated` })
  } catch (error) {
    next(error)
  }
}

// @desc    Export CSV
// @route   GET /api/waitlist/export/csv
// @access  Admin
const exportCsv = async (req, res, next) => {
  try {
    const filter = buildFilter(req.query)

    // If specific IDs requested
    if (req.query.ids) {
      const ids = req.query.ids.split(',')
      filter._id = { $in: ids }
    }

    const members = await WaitlistMember.find(filter).sort({ createdAt: -1 }).lean()

    const rows = [CSV_HEADER, ...members.map(buildCsvRow)].join('\n')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="kashdev-waitlist-${Date.now()}.csv"`)
    res.send('\uFEFF' + rows) // BOM for Excel UTF-8
  } catch (error) {
    next(error)
  }
}

module.exports = {
  joinWaitlist,
  getWaitlistCount,
  getWaitlist,
  getWaitlistStats,
  getWaitlistAnalytics,
  getWaitlistMember,
  updateWaitlistMember,
  addNote,
  deleteWaitlistMember,
  bulkAction,
  exportCsv,
}
