import api from './api'

// ── Public ────────────────────────────────────────────────────────────────────

export const joinWaitlist = (data) =>
  api.post('/waitlist', data)

export const getWaitlistCount = () =>
  api.get('/waitlist/count')

// ── Admin ─────────────────────────────────────────────────────────────────────

export const getWaitlist = (params = {}) =>
  api.get('/waitlist', { params })

export const getWaitlistStats = () =>
  api.get('/waitlist/stats')

export const getWaitlistAnalytics = (params = {}) =>
  api.get('/waitlist/analytics', { params })

export const getWaitlistMember = (id) =>
  api.get(`/waitlist/${id}`)

export const updateWaitlistMember = (id, data) =>
  api.put(`/waitlist/${id}`, data)

export const addNote = (id, text) =>
  api.post(`/waitlist/${id}/notes`, { text })

export const deleteWaitlistMember = (id) =>
  api.delete(`/waitlist/${id}`)

export const bulkAction = (ids, action, value) =>
  api.post('/waitlist/bulk', { ids, action, value })

export const getExportCsvUrl = (params = {}) => {
  const token = localStorage.getItem('kashdev_token')
  const qs = new URLSearchParams({ ...params, _token: token }).toString()
  return `/api/waitlist/export/csv?${qs}`
}

export const downloadCsv = async (params = {}) => {
  const res = await api.get('/waitlist/export/csv', {
    params,
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const a   = document.createElement('a')
  a.href    = url
  a.download = `kashdev-waitlist-${Date.now()}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}
