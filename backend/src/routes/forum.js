const express = require('express')
const router = express.Router()
const {
  getQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion,
  voteQuestion, bookmarkQuestion,
  createAnswer, voteAnswer, acceptAnswer, addComment,
  getTags, getTagQuestions,
  reportContent, getReports,
} = require('../controllers/forumController')
const { protect, optionalAuth } = require('../middleware/auth')

// Questions
router.get('/',                        optionalAuth, getQuestions)
router.post('/',                       protect,      createQuestion)
router.get('/tags',                                  getTags)
router.get('/tags/:slug',                            getTagQuestions)
router.get('/reports',                 protect,      getReports)
router.post('/report',                 protect,      reportContent)
router.get('/:id',                     optionalAuth, getQuestion)
router.put('/:id',                     protect,      updateQuestion)
router.delete('/:id',                  protect,      deleteQuestion)
router.post('/:id/vote',               protect,      voteQuestion)
router.post('/:id/bookmark',           protect,      bookmarkQuestion)

// Answers (nested under question)
router.post('/:questionId/answers',    protect,      createAnswer)
router.post('/answers/:answerId/vote', protect,      voteAnswer)
router.post('/:questionId/answers/:answerId/accept', protect, acceptAnswer)
router.post('/answers/:answerId/comments', protect,  addComment)

module.exports = router