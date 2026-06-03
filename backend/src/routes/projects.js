const express = require('express')
const router = express.Router()
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  toggleLike,
} = require('../controllers/projectController')
const { protect } = require('../middleware/auth')

router.route('/')
  .get(getProjects)
  .post(protect, createProject)

router.route('/:id')
  .get(getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject)

router.post('/:id/like', protect, toggleLike)

module.exports = router