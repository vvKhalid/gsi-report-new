// src/app/last-reports/page.jsx
import Link from "next/link";
import LastReportsByEmployee from "@/components/LastReportsByEmployee";
import { employeesMap } from "@/data/employees";

export default function LastReportsListPage() {
  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <h1>Last Reports</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {Object.entries(employeesMap).map(([id, name]) => (
          <li key={id} style={{ margin: "8px 0" }}>
            <Link
              href={`/last-reports/${id}`}
              style={{ textDecoration: "none", color: "#2563eb", fontSize: 18 }}
            >
              {name} (Badge {id})
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
