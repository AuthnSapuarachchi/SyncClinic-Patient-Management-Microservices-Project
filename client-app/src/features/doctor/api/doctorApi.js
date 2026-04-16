import { request } from "../../../shared/api/httpClient.js";
import { CONFIG } from "../../../shared/config/appConfig.js";

export function getDoctors() {
  return request(CONFIG.routes.doctor);
}

export function getDoctorAvailability(doctorId) {
  return request(CONFIG.routes.doctorAvailability(doctorId));
}
