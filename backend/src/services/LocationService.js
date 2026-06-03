'use strict'

const User = require('../models/User')
const DeveloperProfile = require('../models/DeveloperProfile')

const KASHMIR_DISTRICTS = [
  'Srinagar', 'Baramulla', 'Anantnag', 'Pulwama', 'Kupwara', 'Shopian',
  'Kulgam', 'Bandipora', 'Ganderbal', 'Budgam', 'Jammu', 'Udhampur',
  'Kathua', 'Rajouri', 'Poonch', 'Doda', 'Kishtwar', 'Ramban', 'Reasi', 'Samba',
]

const DISTRICT_CITIES = {
  Srinagar:   ['Srinagar', 'Rajbagh', 'Jawahar Nagar', 'Lal Chowk', 'Hyderpora', 'Zakura'],
  Baramulla:  ['Baramulla', 'Sopore', 'Pattan', 'Uri', 'Tangmarg', 'Handwara'],
  Anantnag:   ['Anantnag', 'Pahalgam', 'Dooru', 'Kokernag', 'Bijbehara'],
  Pulwama:    ['Pulwama', 'Awantipora', 'Pampore', 'Tral'],
  Ganderbal:  ['Ganderbal', 'Kangan', 'Sonamarg'],
  Budgam:     ['Budgam', 'Charar-i-Sharief', 'Beerwah', 'Magam'],
  Kupwara:    ['Kupwara', 'Handwara', 'Lolab', 'Trehgam'],
  Shopian:    ['Shopian', 'Kellar'],
  Kulgam:     ['Kulgam', 'Devsar'],
  Bandipora:  ['Bandipora', 'Gurez', 'Hajin'],
}

class LocationService {
  getDistricts() {
    return KASHMIR_DISTRICTS
  }

  getCitiesForDistrict(district) {
    return DISTRICT_CITIES[district] || []
  }

  getAllCities() {
    return Object.values(DISTRICT_CITIES).flat()
  }

  /**
   * Find developers near a given district
   */
  async getNearbyDevelopers(district, city, limit = 12, page = 1) {
    const locationMatch = {}

    if (city) {
      locationMatch['location.city'] = new RegExp(city, 'i')
    } else if (district) {
      locationMatch['location.district'] = new RegExp(district, 'i')
    }

    if (!Object.keys(locationMatch).length) return { data: [], total: 0 }

    const users = await User.find(locationMatch)
      .select('_id name username bio avatar location isFeatured isVerified reputation')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ reputation: -1 })

    const userIds = users.map(u => u._id)
    const profiles = await DeveloperProfile.find({ user: { $in: userIds } })
      .select('skills company openToWork openToMentor experience')

    const profileMap = profiles.reduce((acc, p) => { acc[p.user.toString()] = p; return acc }, {})

    const total = await User.countDocuments(locationMatch)

    return {
      data: users.map(u => ({ user: u, profile: profileMap[u._id.toString()] || null })),
      total,
      district,
      city,
    }
  }

  /**
   * Location-based analytics for a district
   */
  async getDistrictSnapshot(district) {
    const users = await User.find({ 'location.district': new RegExp(district, 'i') }).select('_id isStudent')
    const userIds = users.map(u => u._id)

    const [skills, total] = await Promise.all([
      DeveloperProfile.aggregate([
        { $match: { user: { $in: userIds } } },
        { $unwind: '$skills' },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      User.countDocuments({ 'location.district': new RegExp(district, 'i') }),
    ])

    return {
      district,
      total,
      students: users.filter(u => u.isStudent).length,
      topSkills: skills.map(s => ({ skill: s._id, count: s.count })),
    }
  }
}

module.exports = new LocationService()