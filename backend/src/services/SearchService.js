'use strict'

const User = require('../models/User')
const DeveloperProfile = require('../models/DeveloperProfile')
const SearchHistory = require('../models/SearchHistory')

// ─── Intent Dictionary ──────────────────────────────────────────────────────

const SKILL_KEYWORDS = [
  'react','nodejs','node','javascript','python','flutter','nextjs','vuejs','vue',
  'typescript','mongodb','postgresql','mysql','docker','aws','firebase','graphql',
  'php','laravel','django','swift','kotlin','golang','go','rust','java','spring',
  'angular','express','redis','kubernetes','terraform','mern','mean','lamp',
  'machine learning','ml','ai','artificial intelligence','deep learning',
  'cyber security','cybersecurity','blockchain','solidity','devops',
  'android','ios','react native','tailwind','bootstrap',
]

const KASHMIRI_DISTRICTS = [
  'srinagar','baramulla','anantnag','pulwama','kupwara','shopian','kulgam',
  'bandipora','ganderbal','budgam','jammu','udhampur','kathua','rajouri',
  'poonch','doda','kishtwar','ramban','reasi','samba',
]

const KASHMIRI_CITIES = [
  'srinagar','baramulla','sopore','anantnag','pulwama','kupwara','shopian',
  'kulgam','bandipora','ganderbal','budgam','pattan','handwara','uri',
  'awantipora','pahalgam','gulmarg','jammu',
]

const WELL_KNOWN_COMPANIES = [
  'google','microsoft','amazon','meta','apple','adobe','ibm',
  'infosys','tcs','wipro','hcl','zoho','oracle','netflix',
  'uber','airbnb','twitter','linkedin','salesforce','atlassian',
]

const INTENT_PATTERNS = [
  { pattern: /open\s*to\s*work|available\s*for\s*work|looking\s*for\s*job/i, key: 'openToWork',    value: true  },
  { pattern: /student|studying|college|university/i,                           key: 'isStudent',    value: true  },
  { pattern: /mentor|mentoring|available\s*for\s*mentorship/i,                 key: 'openToMentor', value: true  },
  { pattern: /founder|startup\s*founder/i,                                     key: 'isFounder',    value: true  },
  { pattern: /freelance|freelancer/i,                                          key: 'isFreelancer', value: true  },
  { pattern: /open\s*source|oss\s*contributor/i,                               key: 'openSource',   value: true  },
]

const EXPERIENCE_PATTERNS = [
  { pattern: /(\d+)\+?\s*year/i,   extract: (m) => `${m[1]}+ years` },
  { pattern: /junior|0-1|fresher/i, value: '0-1 years'   },
  { pattern: /mid[- ]?level|2-3/i,  value: '1-3 years'   },
  { pattern: /senior|5\+/i,         value: '5-10 years'  },
]

// ─── Parser ────────────────────────────────────────────────────────────────

class SearchService {
  /**
   * Parse a natural language query into structured intent
   */
  parseQuery(rawQuery) {
    const q = rawQuery.toLowerCase().trim()
    const tokens = q.split(/[\s,]+/)

    const intent = {
      skills:       [],
      companies:    [],
      cities:       [],
      districts:    [],
      experience:   '',
      openToWork:   false,
      isStudent:    false,
      openToMentor: false,
      isFounder:    false,
      isFreelancer: false,
      openSource:   false,
      rawQuery,
    }

    // Match skills (single and compound tokens)
    for (const skill of SKILL_KEYWORDS) {
      const words = skill.split(' ')
      if (words.length === 1) {
        if (tokens.includes(skill)) intent.skills.push(skill)
      } else {
        if (q.includes(skill)) intent.skills.push(skill)
      }
    }

    // Match companies
    for (const co of WELL_KNOWN_COMPANIES) {
      if (q.includes(co)) intent.companies.push(co)
    }

    // Match districts
    for (const d of KASHMIRI_DISTRICTS) {
      if (q.includes(d)) intent.districts.push(d)
    }

    // Match cities
    for (const c of KASHMIRI_CITIES) {
      if (q.includes(c) && !intent.districts.includes(c)) intent.cities.push(c)
    }

    // Match boolean intents
    for (const { pattern, key, value } of INTENT_PATTERNS) {
      if (pattern.test(rawQuery)) intent[key] = value
    }

    // Match experience
    for (const ep of EXPERIENCE_PATTERNS) {
      const m = rawQuery.match(ep.pattern)
      if (m) {
        intent.experience = ep.extract ? ep.extract(m) : ep.value
        break
      }
    }

    return intent
  }

  /**
   * Convert parsed intent into a MongoDB aggregation pipeline
   */
  buildPipeline(intent, page = 1, limit = 20) {
    const userMatch = {}
    const profileMatch = {}

    // Location filters
    if (intent.districts.length) userMatch['location.district'] = { $in: intent.districts.map(d => new RegExp(d, 'i')) }
    if (intent.cities.length)    userMatch['location.city']     = { $in: intent.cities.map(c => new RegExp(c, 'i'))    }

    // Boolean filters on User
    if (intent.isStudent)   userMatch.isStudent = true

    // Profile filters
    if (intent.skills.length) {
      profileMatch.skills = {
        $in: intent.skills.map(s => new RegExp(s.replace(/[-+.]/g, '\\$&'), 'i'))
      }
    }
    if (intent.companies.length) {
      profileMatch.company = { $in: intent.companies.map(c => new RegExp(c, 'i')) }
    }
    if (intent.openToWork)   profileMatch.openToWork   = true
    if (intent.openToMentor) profileMatch.openToMentor = true
    if (intent.isFounder)    profileMatch.founderStatus = true
    if (intent.isFreelancer) profileMatch.openToFreelance = true
    if (intent.openSource)   profileMatch.openSourceContributor = true
    if (intent.experience)   profileMatch.experience = intent.experience

    // Relevance scoring fields
    const addFields = {
      relevanceScore: {
        $add: [
          // Base reputation
          { $ifNull: ['$user.reputation', 0] },
          // Boost featured
          { $cond: ['$user.isFeatured', 20, 0] },
          // Boost open to work (more useful in search)
          { $cond: ['$openToWork', 5, 0] },
          // Profile completeness proxy
          { $cond: [{ $gt: [{ $size: { $ifNull: ['$skills', []] } }, 3] }, 10, 0] },
        ],
      },
    }

    return {
      userMatch,
      profileMatch,
      addFields,
      skip: (page - 1) * limit,
      limit,
    }
  }

  /**
   * Execute search: returns paginated, scored developer results
   */
  async search(rawQuery, page = 1, limit = 20, currentUserId = null) {
    const intent = this.parseQuery(rawQuery)
    const { userMatch, profileMatch, addFields, skip } = this.buildPipeline(intent, page, limit)

    // Aggregation on DeveloperProfile, joining User
    const pipeline = [
      // 1. Match profile-level filters first (indexed)
      ...(Object.keys(profileMatch).length ? [{ $match: profileMatch }] : []),

      // 2. Join user
      {
        $lookup: {
          from:         'users',
          localField:   'user',
          foreignField: '_id',
          as:           'user',
        },
      },
      { $unwind: '$user' },

      // 3. Match user-level filters
      ...(Object.keys(userMatch).length ? [{ $match: { $and: Object.entries(userMatch).map(([k, v]) => ({ [`user.${k}`]: v })) } }] : []),

      // 4. Exclude current user from results
      ...(currentUserId ? [{ $match: { 'user._id': { $ne: currentUserId } } }] : []),

      // 5. Add relevance score
      { $addFields: addFields },

      // 6. Sort by relevance
      { $sort: { relevanceScore: -1, 'user.reputation': -1 } },

      // 7. Facet for pagination + results in one query
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                skills: 1, company: 1, experience: 1, openToWork: 1,
                openToMentor: 1, founderStatus: 1, openSourceContributor: 1,
                github: 1, linkedin: 1, relevanceScore: 1,
                user: {
                  _id: 1, name: 1, username: 1, bio: 1, avatar: 1,
                  'location.district': 1, 'location.city': 1,
                  locationString: 1, isFeatured: 1, isVerified: 1, reputation: 1,
                },
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ]

    const [result] = await require('../models/DeveloperProfile').aggregate(pipeline)
    const total = result.total[0]?.count || 0

    // Log to search history (non-blocking)
    this._logSearch(rawQuery, intent, total, currentUserId).catch(() => {})

    return {
      data: result.data,
      intent,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }
  }

  /**
   * Auto-complete suggestions based on query prefix
   */
  async suggest(prefix) {
    if (!prefix || prefix.length < 2) return []

    const re = new RegExp(`^${prefix}`, 'i')

    // Match skills
    const skillSuggestions = SKILL_KEYWORDS
      .filter(s => re.test(s))
      .slice(0, 4)
      .map(s => ({ type: 'skill', value: s, label: `${s} developers` }))

    // Match locations
    const locationSuggestions = [...KASHMIRI_DISTRICTS, ...KASHMIRI_CITIES]
      .filter(l => re.test(l))
      .slice(0, 3)
      .map(l => ({ type: 'location', value: l, label: `developers in ${l}` }))

    // Match companies
    const companySuggestions = WELL_KNOWN_COMPANIES
      .filter(c => re.test(c))
      .slice(0, 2)
      .map(c => ({ type: 'company', value: c, label: `Kashmiris at ${c}` }))

    // Recent trending
    const trending = await SearchHistory.getTrending(5)
    const trendingSuggestions = trending
      .filter(t => re.test(t.query))
      .slice(0, 3)
      .map(t => ({ type: 'trending', value: t.query, label: t.query, count: t.count }))

    return [...trendingSuggestions, ...skillSuggestions, ...locationSuggestions, ...companySuggestions].slice(0, 8)
  }

  async getTrending() {
    return SearchHistory.getTrending(10)
  }

  async getRelated(query) {
    const intent = this.parseQuery(query)
    const related = []

    if (intent.skills.length) {
      related.push(...intent.skills.map(s => `${s} developers open to work`))
      related.push(...intent.skills.map(s => `${s} developers in srinagar`))
    }
    if (intent.cities.length) {
      related.push(...intent.cities.map(c => `developers in ${c}`))
    }

    // Remove duplicates and limit
    return [...new Set(related)].slice(0, 6)
  }

  async _logSearch(query, intent, resultCount, userId) {
    await SearchHistory.create({
      query,
      user: userId || null,
      parsedIntent: intent,
      resultCount,
    })
  }
}

module.exports = new SearchService()