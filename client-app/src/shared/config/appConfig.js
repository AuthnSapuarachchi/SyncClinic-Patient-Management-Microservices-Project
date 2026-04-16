export const CONFIG = {
  gatewayBaseUrl: import.meta.env.VITE_GATEWAY_URL || "http://localhost:8080",
  routes: {
    doctor: "/api/doctors",
    doctorAvailability: (doctorId) => `/api/doctors/${doctorId}/availability`,
    prescription: "/api/prescriptions",
    appointment: "/api/appointments"
  }
};
