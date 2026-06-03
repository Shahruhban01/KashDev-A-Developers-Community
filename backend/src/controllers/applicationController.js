const Application = require('../models/Application')
const Opportunity = require('../models/Opportunity')
const { sendNotification } = require('../socket')

const apply = async (req, res, next) => {
  try {
    const { opportunityId, coverLetter, resumeUrl, resumeName } = req.body

    const opp = await Opportunity.findById(opportunityId)
    if (!opp) { res.status(404); throw new Error('Opportunity not found') }

    const existing = await Application.findOne({ opportunity: opportunityId, applicant: req.user._id })
    if (existing) { res.status(400); throw new Error('Already applied') }

    const app = await Application.create({
      opportunity: opportunityId,
      applicant: req.user._id,
      coverLetter,
      resumeUrl: resumeUrl || '',
      resumeName: resumeName || '',
      stageHistory: [{ stage: 'applied' }],
    })

    await app.populate('applicant', 'name username avatar')

    await sendNotification({
      recipient: opp.postedBy,
      actor: req.user._id,
      type: 'opportunity_application',
      title: `${req.user.name} applied to "${opp.title}"`,
      link: `/account/opportunities`,
      data: { applicationId: app._id, opportunityId },
    })

    res.status(201).json({ success: true, data: app })
  } catch (err) { next(err) }
}

const getMyApplications = async (req, res, next) => {
  try {
    const apps = await Application.find({ applicant: req.user._id })
      .populate('opportunity', 'title type company location')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: apps })
  } catch (err) { next(err) }
}

const getOpportunityApplicants = async (req, res, next) => {
  try {
    const opp = await Opportunity.findById(req.params.opportunityId)
    if (!opp || opp.postedBy.toString() !== req.user._id.toString()) {
      res.status(403); throw new Error('Not authorized')
    }
    const apps = await Application.find({ opportunity: req.params.opportunityId })
      .populate('applicant', 'name username avatar bio')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: apps })
  } catch (err) { next(err) }
}

const updateApplicationStage = async (req, res, next) => {
  try {
    const { stage, note } = req.body
    const app = await Application.findById(req.params.id)
      .populate('opportunity')
    if (!app) { res.status(404); throw new Error('Application not found') }

    const opp = await Opportunity.findById(app.opportunity)
    if (opp.postedBy.toString() !== req.user._id.toString()) {
      res.status(403); throw new Error('Not authorized')
    }

    app.stage = stage
    app.stageHistory.push({ stage, note: note || '' })
    await app.save()

    await sendNotification({
      recipient: app.applicant,
      actor: req.user._id,
      type: 'application_status',
      title: `Your application status changed to "${stage}"`,
      body: note || '',
      link: `/account`,
      data: { applicationId: app._id, stage },
    })

    res.json({ success: true, data: app })
  } catch (err) { next(err) }
}

const shortlistApplicant = async (req, res, next) => {
  try {
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { isShortlisted: !((await Application.findById(req.params.id)).isShortlisted) },
      { new: true }
    )
    res.json({ success: true, data: app })
  } catch (err) { next(err) }
}

module.exports = { apply, getMyApplications, getOpportunityApplicants, updateApplicationStage, shortlistApplicant }