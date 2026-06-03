const SearchService = require('../services/SearchService')

// @desc    Full natural language search
// @route   GET /api/search?q=nodejs+developers+in+srinagar
// @access  Public
const search = async (req, res, next) => {
  try {
    const { q = '', page = 1, limit = 20 } = req.query
    if (!q.trim()) return res.json({ success: true, data: [], intent: {}, pagination: { total: 0 } })

    const results = await SearchService.search(q, Number(page), Number(limit), req.user?._id)
    res.json({ success: true, ...results })
  } catch (error) {
    next(error)
  }
}

// @desc    Auto-complete suggestions
// @route   GET /api/search/suggest?q=react
// @access  Public
const suggest = async (req, res, next) => {
  try {
    const { q = '' } = req.query
    const suggestions = await SearchService.suggest(q)
    res.json({ success: true, data: suggestions })
  } catch (error) {
    next(error)
  }
}

// @desc    Trending searches
// @route   GET /api/search/trending
// @access  Public
const trending = async (req, res, next) => {
  try {
    const data = await SearchService.getTrending()
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

// @desc    Related searches for a query
// @route   GET /api/search/related?q=react
// @access  Public
const related = async (req, res, next) => {
  try {
    const { q = '' } = req.query
    const data = await SearchService.getRelated(q)
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

module.exports = { search, suggest, trending, related }