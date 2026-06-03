const ForumQuestion = require('../models/ForumQuestion')
const ForumAnswer = require('../models/ForumAnswer')
const Bookmark = require('../models/Bookmark')
const UserActivity = require('../models/UserActivity')
const { sendNotification } = require('../socket')

const tagToView = (tag) => ({
  _id: tag,
  name: tag,
  slug: tag,
  color: '#22c55e',
})

const normalizeQuestion = (question) => {
  const obj = typeof question.toObject === 'function' ? question.toObject() : question
  return {
    ...obj,
    tags: (obj.tags || []).map(tagToView),
    voteScore: obj.voteCount || 0,
    viewCount: obj.views || 0,
    acceptedAnswer: obj.isSolved,
  }
}

const normalizeAnswer = (answer) => {
  const obj = typeof answer.toObject === 'function' ? answer.toObject() : answer
  return {
    ...obj,
    voteScore: obj.voteCount || 0,
  }
}

// ─── Questions ────────────────────────────────────────────────────────────────
const getQuestions = async (req, res, next) => {
  try {
    const { search, tag, sort = 'newest', page = 1, limit = 15 } = req.query
    const query = { isDeleted: false }
    if (tag) query.tags = tag
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { body: { $regex: search, $options: 'i' } },
    ]

    const sortMap = {
      newest:  { createdAt: -1 },
      votes:   { voteCount: -1 },
      answers: { answerCount: -1 },
      active:  { lastActivity: -1 },
      hot:     { voteCount: -1, views: -1, createdAt: -1 },
      unanswered: { answerCount: 1, createdAt: -1 },
    }

    const questions = await ForumQuestion.find(query)
      .populate('author', 'name username avatar reputation')
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const total = await ForumQuestion.countDocuments(query)
    res.json({ success: true, data: questions.map(normalizeQuestion), pagination: { page: Number(page), total } })
  } catch (err) { next(err) }
}

const getQuestion = async (req, res, next) => {
  try {
    const q = await ForumQuestion.findOne({ _id: req.params.id, isDeleted: false })
      .populate('author', 'name username avatar reputation')
    if (!q) { res.status(404); throw new Error('Question not found') }

    q.views = (q.views || 0) + 1
    await q.save()

    const answers = await ForumAnswer.find({ question: q._id, isDeleted: false })
      .populate('author', 'name username avatar reputation')
      .sort({ isAccepted: -1, voteCount: -1, createdAt: 1 })

    res.json({
      success: true,
      data: {
        question: normalizeQuestion(q),
        answers: answers.map(normalizeAnswer),
      },
    })
  } catch (err) { next(err) }
}

const createQuestion = async (req, res, next) => {
  try {
    const { title, body, tags } = req.body
    const q = await ForumQuestion.create({
      title, body,
      tags: tags || [],
      author: req.user._id,
    })
    await q.populate('author', 'name username avatar reputation')

    // Track activity
    await UserActivity.create({
      user: req.user._id,
      type: 'ask_question',
      targetType: 'question',
      targetId: q._id,
      metadata: { title, tags }
    })

    res.status(201).json({ success: true, data: normalizeQuestion(q) })
  } catch (err) { next(err) }
}

const updateQuestion = async (req, res, next) => {
  try {
    const q = await ForumQuestion.findOne({ _id: req.params.id, author: req.user._id })
    if (!q) { res.status(404); throw new Error('Not found or not authorized') }
    Object.assign(q, req.body)
    await q.save()
    res.json({ success: true, data: normalizeQuestion(q) })
  } catch (err) { next(err) }
}

const softDeleteQuestion = async (req, res, next) => {
  try {
    const q = await ForumQuestion.findOne({ _id: req.params.id, author: req.user._id })
    if (!q) { res.status(404); throw new Error('Not found') }
    q.isDeleted = true
    q.deletedAt = new Date()
    q.deletedBy = req.user._id
    await q.save()
    res.json({ success: true, message: 'Question moved to deleted (kept 30 days)' })
  } catch (err) { next(err) }
}

const getDeletedQuestions = async (req, res, next) => {
  try {
    const questions = await ForumQuestion.find({ author: req.user._id, isDeleted: true })
      .sort({ deletedAt: -1 })
    res.json({ success: true, data: questions })
  } catch (err) { next(err) }
}

// ─── Answers ──────────────────────────────────────────────────────────────────
const createAnswer = async (req, res, next) => {
  try {
    const q = await ForumQuestion.findOne({ _id: req.params.questionId, isDeleted: false })
    if (!q) { res.status(404); throw new Error('Question not found') }

    const answer = await ForumAnswer.create({
      question: q._id,
      body: req.body.body,
      author: req.user._id,
    })

    q.answerCount = (q.answerCount || 0) + 1
    q.lastActivity = new Date()
    await q.save()

    await answer.populate('author', 'name username avatar reputation')

    if (q.author.toString() !== req.user._id.toString()) {
      await sendNotification({
        recipient: q.author,
        actor: req.user._id,
        type: 'forum_answer',
        title: `${req.user.name} answered your question`,
        link: `/forum/${q._id}`,
        data: { questionId: q._id, answerId: answer._id },
      })
    }

    // Track activity
    await UserActivity.create({
      user: req.user._id,
      type: 'answer_question',
      targetType: 'answer',
      targetId: answer._id,
      metadata: { questionId: q._id, questionTitle: q.title }
    })

    res.status(201).json({ success: true, data: normalizeAnswer(answer) })
  } catch (err) { next(err) }
}

const acceptAnswer = async (req, res, next) => {
  try {
    const q = await ForumQuestion.findOne({ _id: req.params.questionId, author: req.user._id })
    if (!q) { res.status(403); throw new Error('Not authorized') }

    await ForumAnswer.updateMany({ question: q._id }, { isAccepted: false })
    const answer = await ForumAnswer.findOneAndUpdate(
      { _id: req.params.answerId, question: q._id, isDeleted: false },
      { isAccepted: true },
      { new: true }
    )
    if (!answer) { res.status(404); throw new Error('Answer not found') }

    q.isSolved = true
    await q.save()

    await sendNotification({
      recipient: answer.author,
      actor: req.user._id,
      type: 'answer_accepted',
      title: `Your answer was accepted!`,
      link: `/forum/${q._id}`,
    })

    res.json({ success: true, data: normalizeAnswer(answer) })
  } catch (err) { next(err) }
}

// ─── Voting ───────────────────────────────────────────────────────────────────
const voteQuestion = async (req, res, next) => {
  try {
    const { direction } = req.body // 'up' or 'down'
    const vote = direction === 'up' ? 1 : direction === 'down' ? -1 : 0
    if (!vote) {
      res.status(400)
      throw new Error('Vote direction must be up or down')
    }
    const q = await ForumQuestion.findById(req.params.id)
    if (!q) { res.status(404); throw new Error('Not found') }

    const existingVote = q.votes.find(v => v.user.toString() === req.user._id.toString())
    if (existingVote) {
      if (existingVote.value === vote) {
        q.votes = q.votes.filter(v => v.user.toString() !== req.user._id.toString())
      } else {
        existingVote.value = vote
      }
    } else {
      q.votes.push({ user: req.user._id, value: vote })
    }

    q.voteCount = q.votes.reduce((sum, v) => sum + v.value, 0)
    await q.save()

    await UserActivity.create({
      user: req.user._id,
      type: 'upvote',
      targetType: 'question',
      targetId: q._id,
      metadata: { direction, voteScore: q.voteCount },
    })

    res.json({ success: true, voteScore: q.voteCount })
  } catch (err) { next(err) }
}

const voteAnswer = async (req, res, next) => {
  try {
    const { direction } = req.body // 'up' or 'down'
    const vote = direction === 'up' ? 1 : direction === 'down' ? -1 : 0
    if (!vote) {
      res.status(400)
      throw new Error('Vote direction must be up or down')
    }
    const a = await ForumAnswer.findOne({
      _id: req.params.answerId,
      ...(req.params.questionId ? { question: req.params.questionId } : {}),
    })
    if (!a) { res.status(404); throw new Error('Not found') }

    const existingVote = a.votes.find(v => v.user.toString() === req.user._id.toString())
    if (existingVote) {
      if (existingVote.value === vote) {
        a.votes = a.votes.filter(v => v.user.toString() !== req.user._id.toString())
      } else {
        existingVote.value = vote
      }
    } else {
      a.votes.push({ user: req.user._id, value: vote })
    }

    a.voteCount = a.votes.reduce((sum, v) => sum + v.value, 0)
    await a.save()

    await UserActivity.create({
      user: req.user._id,
      type: 'upvote',
      targetType: 'answer',
      targetId: a._id,
      metadata: { direction, voteScore: a.voteCount, questionId: a.question },
    })

    res.json({ success: true, voteScore: a.voteCount })
  } catch (err) { next(err) }
}

const bookmarkQuestion = async (req, res, next) => {
  try {
    const q = await ForumQuestion.findOne({ _id: req.params.id, isDeleted: false })
    if (!q) { res.status(404); throw new Error('Question not found') }

    const existing = await Bookmark.findOne({
      user: req.user._id,
      targetType: 'question',
      target: q._id,
    })

    if (existing) {
      await existing.deleteOne()
      return res.json({ success: true, bookmarked: false })
    }

    await Bookmark.create({
      user: req.user._id,
      targetType: 'question',
      target: q._id,
      targetModel: 'ForumQuestion',
    })

    await UserActivity.create({
      user: req.user._id,
      type: 'bookmark',
      targetType: 'question',
      targetId: q._id,
      metadata: { title: q.title },
    })

    res.json({ success: true, bookmarked: true })
  } catch (err) { next(err) }
}

const getTags = async (req, res, next) => {
  try {
    const tags = await ForumQuestion.aggregate([
      { $match: { isDeleted: false } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', questionCount: { $sum: 1 } } },
      { $sort: { questionCount: -1, _id: 1 } },
      { $limit: 50 },
    ])

    res.json({
      success: true,
      data: tags.map(t => ({ ...tagToView(t._id), questionCount: t.questionCount })),
    })
  } catch (err) { next(err) }
}

module.exports = {
  getQuestions, getQuestion, createQuestion, updateQuestion,
  softDeleteQuestion, getDeletedQuestions,
  createAnswer, acceptAnswer,
  voteQuestion, voteAnswer,
  bookmarkQuestion, getTags,
}
