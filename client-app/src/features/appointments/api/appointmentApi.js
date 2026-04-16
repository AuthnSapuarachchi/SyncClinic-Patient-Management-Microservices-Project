import { request } from "../../../shared/api/httpClient.js";
import { CONFIG } from "../../../shared/config/appConfig.js";

export function getAppointments() {
  return request(CONFIG.routes.appointment);
}
