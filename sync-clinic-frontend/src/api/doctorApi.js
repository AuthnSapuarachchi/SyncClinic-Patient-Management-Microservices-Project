import api from './axiosConfig'

export const getDoctors = async () => {
  const response = await api.get('/api/doctors')
  return response.data
}

export const createDoctor = async (doctorPayload) => {
  const response = await api.post('/api/doctors', doctorPayload)
  return response.data
}

export const updateDoctor = async (doctorId, doctorPayload) => {
  const response = await api.put(`/api/doctors/${doctorId}`, doctorPayload)
  return response.data
}

export const deleteDoctor = async (doctorId) => {
  const response = await api.delete(`/api/doctors/${doctorId}`)
  return response.data
}

export const updateDoctorStatus = async (doctorId, status, currentDoctor = null) => {
  const doctor = currentDoctor || (await api.get(`/api/doctors/${doctorId}`)).data
  const response = await api.put(`/api/doctors/${doctorId}`, { ...doctor, status })
  return response.data
}

export const getDoctorAvailability = async (doctorId) => {
  const response = await api.get(`/api/doctors/${doctorId}/availability`)
  return response.data
}

export const addDoctorAvailability = async (doctorId, availabilityPayload) => {
  const response = await api.post(`/api/doctors/${doctorId}/availability`, availabilityPayload)
  return response.data
}

export const createPrescription = async (doctorId, prescriptionPayload) => {
  const response = await api.post(`/api/prescriptions/doctor/${doctorId}`, prescriptionPayload)
  return response.data
}

export const getPrescriptionsByDoctor = async (doctorId) => {
  const response = await api.get(`/api/prescriptions/doctor/${doctorId}`)
  return response.data
}
