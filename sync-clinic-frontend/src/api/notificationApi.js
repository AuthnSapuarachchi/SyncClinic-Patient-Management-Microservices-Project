import api from './axiosConfig'

export const getNotificationsByUser = async (userId, type) => {
  const params = {}
  if (type && type !== 'ALL') {
    params.type = type
  }

  const response = await api.get(`/notification-service/api/notifications/${userId}`, { params })
  return response.data
}

export const getRecentNotifications = async (limit = 10) => {
  const response = await api.get('/notification-service/api/notifications/recent', {
    params: { limit },
  })
  return response.data
}
