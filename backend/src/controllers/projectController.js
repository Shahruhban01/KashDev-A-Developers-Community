const Project = require('../models/Project')

const getProjects = async (req, res, next) => {
  try {
    const { search, tech, page = 1, limit = 12 } = req.query
    const baseSort = { isFeatured: -1, likesCount: -1, createdAt: -1 }

    // Attempt 1: full search across title + description + tech
    let query = { status: 'active' }
    if (tech) query.technologies = { $regex: tech, $options: 'i' }
    if (search) {
      const q = search.trim()
      query.$or = [
        { title:        { $regex: q, $options: 'i' } },
        { description:  { $regex: q, $options: 'i' } },
        { technologies: { $regex: q, $options: 'i' } },
      ]
    }

    let projects = await Project.find(query)
      .populate('owner', 'name username avatar')
      .sort(baseSort)

    // Attempt 2: word-by-word if no results
    if (projects.length === 0 && search && search.includes(' ')) {
      const words = search.trim().split(/\s+/).filter(w => w.length > 2)
      const relaxedQuery = {
        status: 'active',
        $or: words.flatMap(w => [
          { title:       { $regex: w, $options: 'i' } },
          { description: { $regex: w, $options: 'i' } },
          { technologies:{ $regex: w, $options: 'i' } },
        ])
      }
      projects = await Project.find(relaxedQuery)
        .populate('owner', 'name username avatar')
        .sort(baseSort)
    }

    // Paginate
    const total = projects.length
    const paginated = projects.slice((page - 1) * limit, page * limit)

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

const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner', 'name username avatar')
    if (!project) { res.status(404); throw new Error('Project not found') }
    res.json({ success: true, data: project })
  } catch (error) {
    next(error)
  }
}

const createProject = async (req, res, next) => {
  try {
    const { title, description, githubUrl, demoUrl, technologies, status } = req.body

    const techs = Array.isArray(technologies)
      ? technologies
      : String(technologies).split(',').map(t => t.trim()).filter(Boolean)

    const project = await Project.create({
      title, description, githubUrl, demoUrl,
      technologies: techs,
      status: status || 'active',
      owner: req.user._id,
    })

    await project.populate('owner', 'name username avatar')
    res.status(201).json({ success: true, data: project })
  } catch (error) {
    next(error)
  }
}

const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) { res.status(404); throw new Error('Project not found') }
    if (project.owner.toString() !== req.user._id.toString()) {
      res.status(403); throw new Error('Not authorized to update this project')
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    ).populate('owner', 'name username avatar')

    res.json({ success: true, data: updated })
  } catch (error) {
    next(error)
  }
}

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) { res.status(404); throw new Error('Project not found') }
    if (project.owner.toString() !== req.user._id.toString()) {
      res.status(403); throw new Error('Not authorized')
    }
    await project.deleteOne()
    res.json({ success: true, message: 'Project deleted' })
  } catch (error) {
    next(error)
  }
}

const toggleLike = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) { res.status(404); throw new Error('Project not found') }

    const alreadyLiked = project.likes.includes(req.user._id)
    if (alreadyLiked) {
      project.likes.pull(req.user._id)
      project.likesCount = Math.max(0, project.likesCount - 1)
    } else {
      project.likes.push(req.user._id)
      project.likesCount += 1
    }
    await project.save()

    res.json({ success: true, liked: !alreadyLiked, likesCount: project.likesCount })
  } catch (error) {
    next(error)
  }
}

// ✅ All 6 functions explicitly exported
module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  toggleLike,
}