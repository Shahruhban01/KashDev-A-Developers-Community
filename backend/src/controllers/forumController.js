const ForumQuestion = require('../models/ForumQuestion')
const ForumAnswer = require('../models/ForumAnswer')
const ForumTag = require('../models/ForumTag')
const User = require('../models/User')
const Report = require('../models/Report')

const REPUTATION_POINTS = {
  askQuestion:    2,
  answerQuestion: 5,
  getUpvote:      10,
  getDownvote:    -2,
  acceptedAnswer: 15,
}

const awardReputation = async (userId, type) => {
  const points = REPUTATION_POINTS[type] || 0
  if (points !== 0) await User.findByIdAndUpdate(userId, { $inc: { reputation: points } })
}

// ── Questions ───────────────────────────────────────────────────────────────

const getQuestions = async (req, res, next) => {
  try {
    const { tag, sort = 'hot', page = 1, limit = 15, search } = req.query
    const query = { isClosed: false }

    if (tag) query.tagNames = tag.toLowerCase()
    if (search) query.$text = { $search: search }

    const sortMap = {
      hot:     { hotScore: -1 },
      newest:  { createdAt: -1 },
      votes:   { voteScore: -1 },
      unanswered: { answerCount: 1, createdAt: -1 },
    }

    const questions = await ForumQuestion.find(query)
      .populate('author', 'name username avatar reputation')
      .populate('tags', 'name slug color')
      .sort(sortMap[sort] || sortMap.hot)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-body -upvotes -downvotes -bookmarks -followers -reports')

    const total = await ForumQuestion.countDocuments(query)

    res.json({
      success: true,
      data: questions,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    next(error)
  }
}

const getQuestion = async (req, res, next) => {
  try {
    const question = await ForumQuestion.findById(req.params.id)
      .populate('author', 'name username avatar reputation badges')
      .populate('tags', 'name slug color')
      .populate('acceptedAnswer')

    if (!question) { res.status(404); throw new Error('Question not found') }

    // Increment view
    question.viewCount += 1
    question.computeHotScore()
    await question.save()

    const answers = await ForumAnswer.find({ question: question._id, isDeleted: false })
      .populate('author', 'name username avatar reputation')
      .populate('comments.author', 'name username avatar')
      .sort({ isAccepted: -1, voteScore: -1 })

    res.json({ success: true, data: { question, answers } })
  } catch (error) {
    next(error)
  }
}

const createQuestion = async (req, res, next) => {
  try {
    const { title, body, tags = [] } = req.body

    // Resolve or create tags
    const tagDocs = []
    for (const tagName of tags.slice(0, 5)) {
      const slug = tagName.toLowerCase().replace(/\s+/g, '-')
      const tag = await ForumTag.findOneAndUpdate(
        { slug },
        { $setOnInsert: { name: tagName.toLowerCase(), slug, description: '' }, $inc: { questionCount: 1 } },
        { upsert: true, new: true }
      )
      tagDocs.push(tag)
    }

    const question = await ForumQuestion.create({
      title, body,
      author: req.user._id,
      tags: tagDocs.map(t => t._id),
      tagNames: tagDocs.map(t => t.name),
    })

    await question.populate('author', 'name username avatar')
    await question.populate('tags', 'name slug color')

    // Award reputation
    await awardReputation(req.user._id, 'askQuestion')

    res.status(201).json({ success: true, data: question })
  } catch (error) {
    next(error)
  }
}

const updateQuestion = async (req, res, next) => {
  try {
    const question = await ForumQuestion.findById(req.params.id)
    if (!question) { res.status(404); throw new Error('Not found') }
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403); throw new Error('Not authorized')
    }

    const { title, body } = req.body
    if (title) question.title = title
    if (body)  question.body  = body
    question.lastActivityAt = new Date()
    await question.save()

    res.json({ success: true, data: question })
  } catch (error) {
    next(error)
  }
}

const deleteQuestion = async (req, res, next) => {
  try {
    const question = await ForumQuestion.findById(req.params.id)
    if (!question) { res.status(404); throw new Error('Not found') }
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403); throw new Error('Not authorized')
    }
    await question.deleteOne()
    await ForumAnswer.deleteMany({ question: req.params.id })
    res.json({ success: true, message: 'Question deleted' })
  } catch (error) {
    next(error)
  }
}

const voteQuestion = async (req, res, next) => {
  try {
    const { direction } = req.body // 'up' | 'down'
    const question = await ForumQuestion.findById(req.params.id)
    if (!question) { res.status(404); throw new Error('Not found') }
    if (question.author.toString() === req.user._id.toString()) {
      res.status(400); throw new Error('Cannot vote on your own question')
    }

    const uid = req.user._id
    const hasUp   = question.upvotes.includes(uid)
    const hasDown = question.downvotes.includes(uid)

    if (direction === 'up') {
      if (hasUp) { question.upvotes.pull(uid); question.voteScore -= 1 }
      else {
        if (hasDown) { question.downvotes.pull(uid); question.voteScore += 1 }
        question.upvotes.push(uid); question.voteScore += 1
        await awardReputation(question.author, 'getUpvote')
      }
    } else {
      if (hasDown) { question.downvotes.pull(uid); question.voteScore += 1 }
      else {
        if (hasUp) { question.upvotes.pull(uid); question.voteScore -= 1 }
        question.downvotes.push(uid); question.voteScore -= 1
        await awardReputation(question.author, 'getDownvote')
      }
    }

    question.computeHotScore()
    await question.save()
    res.json({ success: true, voteScore: question.voteScore })
  } catch (error) {
    next(error)
  }
}

const bookmarkQuestion = async (req, res, next) => {
  try {
    const question = await ForumQuestion.findById(req.params.id)
    if (!question) { res.status(404); throw new Error('Not found') }

    const has = question.bookmarks.includes(req.user._id)
    if (has) question.bookmarks.pull(req.user._id)
    else     question.bookmarks.push(req.user._id)
    await question.save()

    res.json({ success: true, bookmarked: !has })
  } catch (error) {
    next(error)
  }
}

// ── Answers ──────────────────────────────────────────────────────────────────

const createAnswer = async (req, res, next) => {
  try {
    const question = await ForumQuestion.findById(req.params.questionId)
    if (!question) { res.status(404); throw new Error('Question not found') }
    if (question.isLocked) { res.status(400); throw new Error('Question is locked') }

    const answer = await ForumAnswer.create({
      question: question._id,
      author: req.user._id,
      body: req.body.body,
    })

    question.answerCount += 1
    question.lastActivityAt = new Date()
    question.computeHotScore()
    await question.save()

    await answer.populate('author', 'name username avatar reputation')
    await awardReputation(req.user._id, 'answerQuestion')

    res.status(201).json({ success: true, data: answer })
  } catch (error) {
    next(error)
  }
}

const voteAnswer = async (req, res, next) => {
  try {
    const { direction } = req.body
    const answer = await ForumAnswer.findById(req.params.answerId)
    if (!answer) { res.status(404); throw new Error('Not found') }

    const uid = req.user._id
    const hasUp   = answer.upvotes.includes(uid)
    const hasDown = answer.downvotes.includes(uid)

    if (direction === 'up') {
      if (hasUp) { answer.upvotes.pull(uid); answer.voteScore -= 1 }
      else {
        if (hasDown) { answer.downvotes.pull(uid); answer.voteScore += 1 }
        answer.upvotes.push(uid); answer.voteScore += 1
        await awardReputation(answer.author, 'getUpvote')
      }
    } else {
      if (hasDown) { answer.downvotes.pull(uid); answer.voteScore += 1 }
      else {
        if (hasUp) { answer.upvotes.pull(uid); answer.voteScore -= 1 }
        answer.downvotes.push(uid); answer.voteScore -= 1
        await awardReputation(answer.author, 'getDownvote')
      }
    }
    await answer.save()
    res.json({ success: true, voteScore: answer.voteScore })
  } catch (error) {
    next(error)
  }
}

const acceptAnswer = async (req, res, next) => {
  try {
    const question = await ForumQuestion.findById(req.params.questionId)
    if (!question) { res.status(404); throw new Error('Not found') }
    if (question.author.toString() !== req.user._id.toString()) {
      res.status(403); throw new Error('Only question author can accept an answer')
    }

    const answer = await ForumAnswer.findById(req.params.answerId)
    if (!answer) { res.status(404); throw new Error('Answer not found') }

    // Unaccept previous
    if (question.acceptedAnswer) {
      await ForumAnswer.findByIdAndUpdate(question.acceptedAnswer, { isAccepted: false })
    }

    answer.isAccepted = true
    await answer.save()

    question.acceptedAnswer = answer._id
    await question.save()

    await awardReputation(answer.author, 'acceptedAnswer')

    res.json({ success: true, data: answer })
  } catch (error) {
    next(error)
  }
}

const addComment = async (req, res, next) => {
  try {
    const answer = await ForumAnswer.findById(req.params.answerId)
    if (!answer) { res.status(404); throw new Error('Not found') }

    answer.comments.push({ author: req.user._id, body: req.body.body })
    await answer.save()
    await answer.populate('comments.author', 'name username avatar')

    res.json({ success: true, data: answer.comments[answer.comments.length - 1] })
  } catch (error) {
    next(error)
  }
}

// ── Tags ──────────────────────────────────────────────────────────────────

const getTags = async (req, res, next) => {
  try {
    const { search, sort = 'popular' } = req.query
    const query = search ? { name: new RegExp(search, 'i') } : {}
    const sortMap = { popular: { questionCount: -1 }, name: { name: 1 } }

    const tags = await ForumTag.find(query).sort(sortMap[sort] || sortMap.popular).limit(50)
    res.json({ success: true, data: tags })
  } catch (error) {
    next(error)
  }
}

const getTagQuestions = async (req, res, next) => {
  try {
    const { page = 1, limit = 15 } = req.query
    const tag = await ForumTag.findOne({ slug: req.params.slug })
    if (!tag) { res.status(404); throw new Error('Tag not found') }

    const questions = await ForumQuestion.find({ tagNames: tag.name, isClosed: false })
      .populate('author', 'name username avatar')
      .populate('tags', 'name slug color')
      .sort({ hotScore: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-body -upvotes -downvotes')

    const total = await ForumQuestion.countDocuments({ tagNames: tag.name })

    res.json({ success: true, data: { tag, questions }, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    next(error)
  }
}

// ── Reports ──────────────────────────────────────────────────────────────────

const reportContent = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, details } = req.body
    const report = await Report.create({
      reporter: req.user._id, targetType, targetId, reason, details,
    })

    // Increment report count on target
    if (targetType === 'question') await ForumQuestion.findByIdAndUpdate(targetId, { $inc: { reportCount: 1 }, $push: { reports: report._id } })
    if (targetType === 'answer')   await ForumAnswer.findByIdAndUpdate(targetId,   { $inc: { reportCount: 1 }, $push: { reports: report._id } })

    res.status(201).json({ success: true, message: 'Report submitted' })
  } catch (error) {
    next(error)
  }
}

const getReports = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') { res.status(403); throw new Error('Admin only') }
    const reports = await Report.find({ status: 'pending' })
      .populate('reporter', 'name username')
      .sort({ createdAt: -1 })
      .limit(50)
    res.json({ success: true, data: reports })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion,
  voteQuestion, bookmarkQuestion,
  createAnswer, voteAnswer, acceptAnswer, addComment,
  getTags, getTagQuestions,
  reportContent, getReports,
}