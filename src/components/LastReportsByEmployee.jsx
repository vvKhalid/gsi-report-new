"use client";
import useSWR from "swr";
import Link from "next/link";

const fetcher = url => fetch(url).then(res => res.json());

export default function LastReportsByEmployee({
  employeeIds = [],
  employeesMap = {},
  limit = 10,
}) {
  return (
    <>
      {employeeIds.map((id) => {
        const name = employeesMap[id] || id;
       const { data, error } = useSWR(
  `/api?employee=${encodeURIComponent(id)}&limit=${limit}`,
  fetcher
);


        return (
          <section key={id} style={{ marginBottom: 32 }}>
            

            {error && <p>البيانات جلبت في خطأ.</p>}
            {!data && !error && <p>جارٍ التحميل…</p>}

            {data && (
          <table style={{
  width: "100%",
  borderCollapse: "collapse",
  color: "#222",           // ← لون نص داكن وواضح
  background: "#fff"       // ← خلفية بيضاء
}}>
  <thead>
    <tr>
      <th style={{
        border: "1px solid #ddd",
        padding: 8,
        color: "#2563eb",
        background: "#f3f7ff"
      }}>الملف</th>
      <th style={{
        border: "1px solid #ddd",
        padding: 8,
        color: "#2563eb",
        background: "#f3f7ff"
      }}>تاريخ</th>
      <th style={{
        border: "1px solid #ddd",
        padding: 8,
        color: "#2563eb",
        background: "#f3f7ff"
      }}>تحميل</th>
    </tr>
  </thead>
  <tbody>
    {data.map((file) => (
      <tr key={file.name}>
        <td style={{
          border: "1px solid #ddd",
          padding: 8,
          color: "#222",
          background: "#fff"
        }}>{file.name}</td>
<td
  style={{
    border: "1px solid #ddd",
    padding: 8,
    background: "#fff",
  }}
>
  {new Date(file.uploadDate).toLocaleString("en-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })}
</td>
        <td style={{
          border: "1px solid #ddd",
          padding: 8,
          background: "#fff"
        }}>
          <Link href={file.url} target="_blank" style={{
            color: "#2563eb",
            fontWeight: "bold"
          }}>
            تحميل
          </Link>
        </td>
      </tr>
    ))}
  </tbody>
</table>

            )}
          </section>
        );
      })}
    </>
  );
}
