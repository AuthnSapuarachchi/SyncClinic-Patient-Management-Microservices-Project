import { useEffect, useMemo, useState } from "react";
import { HomeView } from "./features/home/HomeView.jsx";
import { DoctorDashboardView } from "./features/doctor/DoctorDashboardView.jsx";
import { AvailabilityCalendarView } from "./features/availability/AvailabilityCalendarView.jsx";
import { AppointmentBookingView } from "./features/appointments/AppointmentBookingView.jsx";
import { TokenPanel } from "./features/auth/TokenPanel.jsx";
import { CONFIG } from "./shared/config/appConfig.js";
import { checkGateway } from "./features/system/api/systemApi.js";

export default function App() {
  const [view, setView] = useState("home");
  const [gatewayStatus, setGatewayStatus] = useState("Gateway: checking...");
  const selectedView = useMemo(() => {
    const views = {
      home: { title: "Home", component: <HomeView /> },
      doctor: { title: "Doctor Dashboard", component: <DoctorDashboardView /> },
      availability: { title: "Availability Calendar", component: <AvailabilityCalendarView /> },
      booking: { title: "Appointment Booking", component: <AppointmentBookingView /> }
    };
    return views[view] || views.home;
  }, [view]);

  useEffect(() => {
    let active = true;
    checkGateway()
      .then(() => active && setGatewayStatus("Gateway: reachable"))
      .catch((err) => active && setGatewayStatus(`Gateway: unreachable (${err.message})`));
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div className="bg-shape bg-shape-a" />
      <div className="bg-shape bg-shape-b" />

      <header className="topbar">
        <div className="brand">
          <h1>SyncClinic</h1>
          <p>Clinical & Scheduling Console</p>
        </div>
        <div className="gateway-status">{gatewayStatus}</div>
      </header>

      <main className="layout">
        <aside className="panel nav-panel">
          <h2>Workspace</h2>
          <button className={`nav-btn ${view === "home" ? "active" : ""}`} onClick={() => setView("home")}>
            Home
          </button>
          <button className={`nav-btn ${view === "doctor" ? "active" : ""}`} onClick={() => setView("doctor")}>
            Doctor Dashboard
          </button>
          <button
            className={`nav-btn ${view === "availability" ? "active" : ""}`}
            onClick={() => setView("availability")}
          >
            Availability Calendar
          </button>
          <button className={`nav-btn ${view === "booking" ? "active" : ""}`} onClick={() => setView("booking")}>
            Appointment Booking
          </button>
        </aside>

        <section className="panel content-panel">
          <TokenPanel />

          <div className="card api-card">
            <h2>API Configuration</h2>
            <div className="kv-grid">
              <div className="k">Gateway Base URL</div>
              <div className="v">{CONFIG.gatewayBaseUrl}</div>
              <div className="k">Doctor Endpoint Base</div>
              <div className="v">{CONFIG.routes.doctor}</div>
              <div className="k">Appointment Endpoint Base</div>
              <div className="v">{CONFIG.routes.appointment}</div>
            </div>
          </div>

          <div className="card view-card">
            <h2>{selectedView.title}</h2>
            {selectedView.component}
          </div>
        </section>
      </main>
    </>
  );
}
