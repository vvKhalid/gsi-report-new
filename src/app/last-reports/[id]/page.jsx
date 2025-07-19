// src/app/last-reports/[id]/page.jsx
"use client";
import { useParams } from "next/navigation";
import LastReportsByEmployee from "@/components/LastReportsByEmployee";
import { employeesMap } from "@/data/employees";

export default function EmployeeReportsPage() {
  const params = useParams();
  const id = params.id;
  const name = employeesMap[id] || id;

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1>
        Last 10 Reports for {name} <small style={{ color: "#555" }}>(Badge {id})</small>
      </h1>
      <LastReportsByEmployee
        employeeIds={[id]}
        employeesMap={employeesMap}
        limit={10}
      />
    </main>
  );
}
