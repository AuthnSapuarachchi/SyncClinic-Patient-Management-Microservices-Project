import api from './axiosConfig'

export const createAppointment = async (appointmentPayload) => {
  const response = await api.post('/api/appointments', appointmentPayload)
  return response.data
}

export const getAppointmentsByPatient = async (patientId) => {
  const response = await api.get(`/api/appointments/patient/${patientId}`)
  return response.data
}

export const getAppointmentsByDoctor = async (doctorId) => {
  const response = await api.get(`/api/appointments/doctor/${doctorId}`)
  return response.data
}

export const getAppointmentsByPatientAndStatus = async (patientId, status) => {
  const response = await api.get(`/api/appointments/patient/${patientId}/status`, { params: { status } })
  return response.data
}

export const cancelAppointment = async (appointmentId) => {
  const response = await api.put(`/api/appointments/${appointmentId}/cancel`)
  return response.data
}

export const rescheduleAppointment = async (appointmentId, payload) => {
  const response = await api.put(`/api/appointments/${appointmentId}/reschedule`, payload)
  return response.data
}
