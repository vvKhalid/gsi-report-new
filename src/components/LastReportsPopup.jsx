"use client";

import LastReportsByEmployee from "./LastReportsByEmployee";
import { employeesMap } from "../data/employees";

// هنا ضفّ الثوابت نفسها اللي في GSIReport.jsx:
const statsPopupStyle = {
  position: "fixed",
  zIndex: 100,
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.13)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};
const statsContentStyle = {
  background: "#fff",
  borderRadius: 14,
  boxShadow: "0 3px 16px #60a5fa22",
  maxWidth: 1000,
  width: "94vw",
  margin: "0 auto",
  padding: 32,
  border: "1px solid #dbeafe",
};
const mainBtnStyle = {
  background: "linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)",
  color: "#fff",
  fontWeight: 600,
  border: "none",
  borderRadius: 10,
  fontSize: 16,
  padding: "10px 19px",
  boxShadow: "0 2px 8px #2563eb40",
  cursor: "pointer",
  transition: "background 0.2s",
};

export default function LastReportsPopup({ onClose }) {
  return (
    <div style={statsPopupStyle}>
      <div style={statsContentStyle}>
        <h2 style={{ color: "#2563eb", textAlign: "center", marginBottom: 8 }}>
          Last Reports
        </h2>
        <div style={{ maxHeight: "70vh", overflow: "auto" }}>
          
          {Object.entries(employeesMap).map(([id, name]) => (
            <div key={id} style={{ marginBottom: 24 }}>
              <h3 style={{ margin: "8px 0", color: "#2563eb" }}>
                {name} (Badge {id})
              </h3>
              <LastReportsByEmployee
                employeeIds={[id]}
                employeesMap={employeesMap}
                limit={10}
              />
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button
            style={{ ...mainBtnStyle, background: "#e11d48" }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
