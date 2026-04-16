import { request } from "../../../shared/api/httpClient.js";

export function checkGateway() {
  return request("/actuator");
}
