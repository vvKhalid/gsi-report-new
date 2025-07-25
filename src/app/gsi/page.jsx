"use client";
import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun,ImageRun,BorderStyle } from "docx";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { uploadReportBlob, uploadImageBlob } from "./lib/storage";
import { employeesMap } from "@/data/employees";
import LastReportsPopup from "@/components/LastReportsPopup";
import { Analytics } from "@vercel/analytics/next"
import { useRouter } from "next/navigation";
import React from "react";
import '../globals.css';




const containerStyle = {
  background: "#fff",
  borderRadius: 16,
  padding: 20,
  maxWidth: 900,
  margin: "auto",
  boxShadow: "0 3px 10px rgba(147, 197, 253, 0.27)",
  borderLeft: "6px solid #2563eb",
  marginBottom: 24,
  position: "relative",
};
const flexRow = {
  display: "flex",
  gap: 16,
  flexWrap: "wrap",
  marginBottom: 16,
};
const flexItem = {
  flexGrow: 1,
  minWidth: 150,
  maxWidth: 300,
};

// ====== التنسيقات ======
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
const inputStyle = {
  border: "1.3px solid #60a5fa",
  borderRadius: 10,
  fontSize: 14,
  padding: "9px 10px",
  minWidth: 90,
  background: "#f1f5f9",
  outline: "none",
  color: "#000",
  fontWeight: "bold",
};
const removeBtnStyle = {
  position: "absolute",
  top: 0,
  right: 0,
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "0 0 0 9px",
  width: 20,
  height: 20,
  fontWeight: "bold",
  cursor: "pointer"
};
const cellStyle = { padding: 10, border: "1px solid #93c5fd" };
const statsPopupStyle = {
  position: "fixed", zIndex: 100, top: 0, left: 0, width: "100vw", height: "100vh",
  background: "rgba(0,0,0,0.13)", display: "flex", justifyContent: "center", alignItems: "center"
};
const statsContentStyle = {
  background: "#fff",
  borderRadius: 14,
  boxShadow: "0 3px 16px #60a5fa22",
  maxWidth: 1000,
  width: "94vw",
  margin: "0 auto",
  padding: 32,
  border: "1px solid #dbeafe"
};
const excelBtnStyle = {
  background: "linear-gradient(90deg, #21c65e 0%, #34d399 100%)",
  color: "#fff",
  fontWeight: 600,
  border: "none",
  borderRadius: 10,
  fontSize: 16,
  padding: "10px 19px",
  boxShadow: "0 2px 8px #21c65e40",
  cursor: "pointer",
  transition: "background 0.2s",
};
const searchreportstyle = {
  background: "linear-gradient(90deg, #000000ff 0%, #60a5fa 100%)",
 color: "#fff",
  fontWeight: 600,
  border: "none",
  borderRadius: 10,
  fontSize: 12,
  padding: "6px 6px",
  boxShadow: "0 2px 8px #6366f140",
  cursor: "pointer",
  transition: "background 0.2s",
};
const lastReportsBtnStyle = {
  background: "linear-gradient(90deg, #000000ff 0%, #60a5fa 100%)",
  color: "#fff",
  fontWeight: 600,
  border: "none",
  borderRadius: 10,
  fontSize: 12,
  padding: "6px 6px",
  boxShadow: "0 2px 8px #6366f140",
  cursor: "pointer",
  transition: "background 0.2s",
};
function getNowDatetimeLocalRiyadh() {
  const now = new Date();
  // ما تضيف ولا تنقص! فقط خذ الوقت من جهاز المستخدم
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${min}`;
}
function formatDateTime(val) {
  if (!val) return "—";
  const d = new Date(val);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  hours = hours.toString().padStart(2, "0");
  // لا تحط فاصلة
  return `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString("en-US", { month: "long" })} ${d.getFullYear()} - ${hours}:${minutes} ${ampm}`;
}



function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}
function getNowDatetimeLocal() {
  const now = new Date();
  now.setSeconds(0, 0); // الدقائق فقط (بدون ثواني)
  return now.toISOString().slice(0,16); // yyyy-MM-ddTHH:mm
}
// ====== دالة إنشاء منطقة فارغة للإحصائية ======
function makeEmptyArea(name) {
  return {
    name,
    stats: [
      { key: "rooms", label: "Rooms", total: "", withFindings: "", withoutFindings: "" },
      { key: "fireExtinguishers", label: "Fire Extinguishers", total: "", withFindings: "", withoutFindings: "" },
      { key: "washrooms", label: "Washrooms", total: "", withFindings: "", withoutFindings: "" },
      { key: "corridors", label: "Corridors", total: "", withFindings: "", withoutFindings: "" },
      { key: "emergencyExits", label: "Emergency Exits", total: "", withFindings: "", withoutFindings: "" },
      { key: "publicAreas", label: "Public Areas", total: "", withFindings: "", withoutFindings: "" },
      { key: "outsideSurroundingArea", label: "Outside Surrounding Area", total: "", withFindings: "", withoutFindings: "" },
      { key: "warehousesStorage", label: "Warehouses/Storage", total: "", withFindings: "", withoutFindings: "" },
    ],
  };
}
  const labelStyle = {
    fontWeight: "bold",
    color: "#2563eb",
    fontSize: 16,
    marginBottom: 6,
    display: "block",
  };
// ====== البادجات ======
const badgeUsers = {
  "53075": "HANAN AL SHUWAIER",
  "51888": "BANDER AL ZAKARI",
  "55723": "HAITHAM AL MUGHAMIS",
  "56392": "NASSER ABU HAIMED",
  "62111": "BADER AL ENEZI",
  "74770": "SUMER ALKHUDEIRI",
  "69444": "KHULOOD AL OTAIBI",
  "18000": "SALMA AL SAQABY",
  "78879": "KHALID AL MUTAIRI",
  "100696": "ABDULLAH AL ENEZI",
  "100729": "GHOZLAN ALKHARAAN"
};
const LOCATIONS = {
  "Hospitals": [
    "Main Hospital",
    "KASCH",
    "WHH",
    "Cardiac Center",
    "Dental Building",
    "Surgical Tower",
    "ACC"
  ],
  "Primary Health Care Inside Riyadh": [
    "AL Yarmouk PHC",
    "HCSC PHC",
    "NGCSC PHC",
    "Dirab PHC",
    "Prince Bader PHC",
    "King Khalid PHC",
    "AL Qadessiah PHC"
  ],
    "Primary Health Care Outside Riyadh": [
    "Al Qassim PHC",
    "Rafha PHC",
    "Arar PHC",
    "Hail PHC",
    "Hail Hemodialysis Center",
    "Najran PHC"
  ],
  "External Buildings/Areas": [
    
    
    "Central Lab",
    "ISD Building",
    "Laundry Building",
    "New Warehouses",
    "Old Warehouses",
    "Old Admin Building",
    "New Admin Building",
    "MC",
    "MCX",
    "K1",
    "Transportation",
    "Printing Press"
  ],
  "Hemodialysis Centers": [
    "Main hospital - Hemodialysis",
    "North of Riyadh Hemodialysis Center",
    "South of Riyadh Hemodialysis Center"
  ],
};
const excelUrl = 'https://ptsassoc-my.sharepoint.com/:x:/g/personal/v5jl_ptsassoc_onmicrosoft_com/EQazCzrL6GhLhhjA8rLhaC4BbPeBZUEeflofyGUdQTHVdA?e=XWRy0s';

const flowUrl = 'https://prod-126.westus.logic.azure.com:443/workflows/6a07d00a56254857935813e0ccf388f6/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=JS5gzSv5TFeO7yiUYZcvRNaek7RQKeXjkIz8JDKuJw8';

async function sendToExcel(entries) {
  const allDates = entries
    .map(e => e.date)
    .filter(Boolean)
    .map(d => new Date(d))
    .sort((a, b) => a - b);

  if (allDates.length === 0) return;

  // 2️⃣ دالة تنسيق التاريخ مثل m/d/yyyy
  const fmt = d => `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;

  // أول وآخر تاريخ
  const first = allDates[0];
  const last  = allDates[allDates.length - 1];

  // 3️⃣ أنشئ نطاق التاريخ: إذا واحد فقط، طبع التاريخ، وإلا "first to last"
  const dateRange =
    first.getTime() === last.getTime()
      ? fmt(first)
      : `${fmt(first)} to ${fmt(last)}`;

  // 4️⃣ أرسل كل entry للـ Power Automate بدون الصور
  for (const e of entries) {
    const payload = {
      Badge: e.badge,
      Date: dateRange,                                  // التاريخ المجمّع
      "Main Location": e.mainLocation,
      // إذا جدول الـ Excel لديك يكتب Inpection (بدون s)،
      // غيّر المفتاح بالضبط لهناك:
      "Assigned Inspection Location": e.sideLocation,   
      "Exact Location": e.exactLocation,
      Findings: e.findings,
      Classification: e.classification,
      Status: e.status,
      "Risk / Priority": e.risk
    };

    const res = await fetch(flowUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Excel send failed: ${res.status}`);
    }
  }
}


function SearchReportPopup({ onClose }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ⬅️ هنا ضيف متغيرات الصفحات
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const paginatedResults = results.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // ⬅️ عشان يرجع لأول صفحة إذا تغيرت النتائج
  useEffect(() => {
    setPage(1);
  }, [results]);
  

  const handleSearch = async () => {
    setLoading(true);
    try {
      // عدّل هذا حسب اسم حاويتك أو API لديك
      const res = await fetch(`/api/searchReports?query=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error("Failed to search.");
      const data = await res.json();
      setResults(data.reports); // [{name, url}]
    } catch (err) {
      alert("Error searching reports.");
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", zIndex: 200, left: 0, top: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff", borderRadius: 15, padding: 24, minWidth: 320, maxWidth: 400, boxShadow: "0 6px 24px #2563eb33"
      }}>
        <h3 style={{ color: "#2563eb", marginBottom: 12 }}>Search Reports</h3>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Type report name or part of it"
          style={{
            width: "100%", fontSize: 16, padding: "10px", marginBottom: 10, borderRadius: 7, border: "1.3px solid #2563eb"
          }}
        />
        <button
          onClick={handleSearch}
          style={{ ...mainBtnStyle, fontSize: 14, padding: "8px 16px", marginBottom: 10, width: "100%" }}>
          {loading ? "Searching..." : "Search"}
        </button>
        <button
          onClick={onClose}
          style={{ ...mainBtnStyle, background: "#e11d48", fontSize: 14, padding: "8px 16px", marginBottom: 8, width: "100%" }}>
          Close
        </button>
        <div>
        <div>
  <div>
  {results.length === 0 && !loading ? (
    <div style={{ color: "#888", textAlign: "center" }}>No results</div>
  ) : null}

  {paginatedResults.map((r, i) => (
    <div
      key={i}
      style={{
        margin: "10px 0",
        padding: "10px",
        border: "1px solid #e5e7eb",
        borderRadius: 7,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <span
        style={{
          wordBreak: "break-all",
          color: "#111",
          fontWeight: "bold",
          fontSize: 16
        }}
      >
        {r.name}
      </span>
      <a
        href={r.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: "#2563eb",
          color: "#fff",
          borderRadius: 7,
          padding: "4px 12px",
          fontSize: 13,
          marginLeft: 10,
          textDecoration: "none"
        }}
      >
        Download
      </a>
   
    </div>
  ))}

  {/* أزرار الصفحات */}
  <div style={{ display: "flex", justifyContent: "center", gap: 12, margin: "12px 0" }}>
    <button
      style={{
        background: "#f1f5f9",
        color: "#2563eb",
        border: "1.2px solid #2563eb",
        borderRadius: 7,
        padding: "4px 15px",
        fontSize: 14,
        fontWeight: 600,
        cursor: page > 1 ? "pointer" : "not-allowed",
        opacity: page > 1 ? 1 : 0.55,
      }}
      onClick={() => setPage((p) => Math.max(1, p - 1))}
      disabled={page === 1}
    >
      Previous
    </button>
    <span style={{ color: "#2563eb", fontWeight: 700, fontSize: 15, alignSelf: "center" }}>
      {page} / {totalPages || 1}
    </span>
    <button
      style={{
        background: "#f1f5f9",
        color: "#2563eb",
        border: "1.2px solid #2563eb",
        borderRadius: 7,
        padding: "4px 15px",
        fontSize: 14,
        fontWeight: 600,
        cursor: page < totalPages ? "pointer" : "not-allowed",
        opacity: page < totalPages ? 1 : 0.55,
      }}
      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
      disabled={page === totalPages}
    >
      Next
    </button>
  </div>
</div>

  
</div>

        </div>
      </div>
    </div>
  );
}
export default function GSIReport() {
  const [entries, setEntries] = useState([
    {
      badge: "",
      classification: "",
      location: "",
      mainLocation: "",
      sideLocation: "",
      exactLocation: "",
      findings: "",
      status: "",
      risk: "",
      images: [],
    date: getNowDatetimeLocalRiyadh(),
    }  
  ]);
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 600);
  };
  window.addEventListener("resize", handleResize);
  handleResize(); // أول تشغيل
  return () => window.removeEventListener("resize", handleResize);
}, []);  const [showLastReportsPopup, setShowLastReportsPopup] = useState(false);
  const [showStatsPopup, setShowStatsPopup] = useState(false);
  const [observations, setObservations] = useState([]);

  // دالة حذف عنصر من الملاحظات
  const handleDelete = (indexToDelete) => {
    setEntries((prevEntries) => prevEntries.filter((_, idx) => idx !== indexToDelete));
  };
const [showSearchPopup, setShowSearchPopup] = useState(false);

  // مراقبة حجم الشاشة لتحديد هل الجهاز موبايل أم لا
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600); // شاشة أصغر من 600px تعتبر موبايل
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function formatRangeForTable(from, to) {
    if (!from || !to) return "";
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const dayFrom = fromDate.getDate();
    const dayTo = toDate.getDate();
    const month = fromDate.toLocaleString("default", { month: "long" });
    const year = fromDate.getFullYear();

    if (
      fromDate.getMonth() === toDate.getMonth() &&
      fromDate.getFullYear() === toDate.getFullYear()
    ) {
      // مثال: 17 to 18 \n July-2025
      return `${dayFrom} to ${dayTo}\n${month}-${year}`;
    } else {
      // مختلفين للاحتياط (نادر يصير)
      const monthTo = toDate.toLocaleString("default", { month: "long" });
      const yearTo = toDate.getFullYear();
      return `${dayFrom} of ${month} - ${year}\nto\n${dayTo} of ${monthTo} - ${yearTo}`;
    }
  }
  // state لمتابعة أي Date Picker مفتوح
  const [openDateIdx, setOpenDateIdx] = useState(null);

  const [loggedIn, setLoggedIn] = useState(false);
  const [badgeInput, setBadgeInput] = useState("");
  const [userName, setUserName] = useState("");
  const [showStats, setShowStats] = useState(false);

useEffect(() => {
  const savedBadge = localStorage.getItem("gsi_badge");
  const savedEntries = localStorage.getItem("gsi_entries");
  if (savedBadge && savedEntries) {
    const parsedEntries = JSON.parse(savedEntries);
    setBadgeInput(savedBadge);
    setEntries(parsedEntries);
  }
}, []);

const saveForLater = async () => {
    const hasImages = entries.some(entry => entry.images && entry.images.length > 0);

  if (hasImages) {
    alert("Please delete attached photos to save. You can add them later.");
    return; // تمنع الحفظ إذا فيه صور
  }
  const entriesCopy = await Promise.all(entries.map(async (entry) => {
    const imagesBase64 = await Promise.all(
      (entry.images || []).map(fileToBase64)
    );
    return { ...entry, images: imagesBase64 };
  }));

  localStorage.setItem("gsi_entries", JSON.stringify(entriesCopy));
  localStorage.setItem("gsi_badge", badgeInput || entries[0]?.badge || "");
  alert("Saved");
};

  // لإضافة ملاحظة جديدة
  const addEntry = () => {
    const last = entries[entries.length - 1] || {};
    const first = entries[0] || {};
    setEntries([
      ...entries,
      {
        badge: last.badge || "",
      date: getNowDatetimeLocalRiyadh(),
        mainLocation: last.mainLocation || "",
        sideLocation: last.sideLocation || "",
        location: last.location || "",
        exactLocation: last.exactLocation || "",
        findings: "",
        status: "",
        classification: "",
        risk: "",
        images: []
      }
    ]);
  };

  // تحديث بيانات الحقول
  const updateEntry = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    setEntries(newEntries);
  };

  // تحديث الصور
  const updateImages = (index, files) => {
    const newEntries = [...entries];
    const selectedImages = Array.from(files);
    const existingImages = newEntries[index].images || [];
    const images = [...existingImages, ...selectedImages].slice(0, 2);
    newEntries[index].images = images;
    setEntries(newEntries);
  };

  // حذف صورة
  const removeImage = (entryIndex, imageIndex) => {
    const newEntries = [...entries];
    newEntries[entryIndex].images.splice(imageIndex, 1);
    setEntries(newEntries);
  };
function toDateFixed(val) {
  if (typeof val === "string" && val.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})$/)) {
    return new Date(val + ":00");
  }
  return toDateFixed(val)
;
}

  // ملف مع الصور الحقيقية
const generateWordWithImages = async () => {
  // استخراج جميع التواريخ
 const allDates = entries
  .map(e => toDateFixed(e.date))

  .filter(d => d instanceof Date && !isNaN(d.valueOf()))
  .sort((a, b) => a - b);

const from = allDates[0];
const to = allDates[allDates.length - 1];

const formatDate = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.valueOf())) return "—";
  return `${date.getDate()} ${date.toLocaleString("en-US", { month: "long" })} - ${date.getFullYear()}`;
};

const periodStr = (from && to && from.getTime() === to.getTime())
  ? formatDate(from)
  : `${formatDate(from)} to ${formatDate(to)}`;


  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "No.", color: "FFFFFF", bold: true })], alignment: "center" })] }),
        new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "Date", color: "FFFFFF", bold: true })], alignment: "center" })] }),
        new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "Exact Location", color: "FFFFFF", bold: true })], alignment: "center" })] }),
        new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "Description of Observation", color: "FFFFFF", bold: true })], alignment: "center" })] }),
        new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "Attached Photo", color: "FFFFFF", bold: true })], alignment: "center" })] }),
      ],
    }),
    ...(await Promise.all(entries.map(async (entry, index) => {
      let imageParagraphs = [];
      if (entry.images && entry.images.length > 0) {
        for (let i = 0; i < entry.images.length; i++) {
          const imgFile = entry.images[i];
          const imgBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result.split(",")[1]);
            reader.readAsDataURL(imgFile);
          });
          imageParagraphs.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: Uint8Array.from(atob(imgBase64), c => c.charCodeAt(0)),
                  transformation: { width: 120, height: 70 }
                })
              ],
              alignment: "center"
            })
          );
        }
      } else {
        imageParagraphs.push(new Paragraph({ text: "" }));
      }
      return new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: String(index + 1), alignment: "center" })] }),
          new TableCell({
            children: [
              new Paragraph({
                text: formatDateTime(entry.date),

                alignment: "center",
              }),
            ],
          }),
          new TableCell({ children: [new Paragraph({ text: entry.exactLocation || "—", alignment: "center" })] }),
          new TableCell({ children: [new Paragraph({ text: entry.findings, alignment: "center" })] }),
          new TableCell({ children: imageParagraphs }),
        ],
      });
    }))
    )
  ];

  const doc = new Document({
    sections: [
      {
        children: [
          // Location أعلى اليسار
          new Paragraph({
            children: [
              new TextRun({
                text: `Location: ${entries[0]?.mainLocation || ""}${entries[0]?.sideLocation ? " - " + entries[0]?.sideLocation : ""}`,
                bold: true,
                size: 28, // حجم أكبر
                color: "2563eb", // أزرق
              }),
            ],
            alignment: "left",
            spacing: { after: 50 }, // مسافة تحت
          }),
          // Date (من - إلى) أعلى اليسار تحت Location
          new Paragraph({
            children: [
              new TextRun({
                text: `Date: ${periodStr}`,
                bold: true,
                size: 26,
                color: "2563eb",
              }),
            ],
            alignment: "left",
            spacing: { after: 120 },
          }),

          // الجدول الرئيسي
          new Table({
            rows: tableRows,
            width: { size: 100, type: "pct" }
          }),
        ],
      },
    ],
  });

const blob = await Packer.toBlob(doc);
const badge = entries[0]?.badge || "UnknownBadge";
const assignedLocation = entries[0]?.sideLocation || "UnknownLocation";
const exactLocation = entries[0]?.exactLocation || "UnknownExactLocation";
const today = new Date();
const dateString = today.toISOString().slice(0,10);

const filename = `Photos ${assignedLocation} ${exactLocation} ${badge} ${dateString}.docx`;

  // upload + download
  let fileUrl;
  try {
    const badge = entries[0]?.badge;
    fileUrl = await uploadReportBlob(blob, filename, badge);
    console.log("Uploaded report to:", fileUrl);
  } catch (err) {
    console.error("Upload report failed", err);
    alert("تعذّر رفع التقرير إلى السحابة، سيتم تنزيله محلياً فقط.");
  }
  saveAs(blob, filename);

  // تنظيف
  localStorage.removeItem("gsi_entries");
  localStorage.removeItem("gsi_badge");
  alert("Word file created. Saved data has been deleted.");
};


function groupEntries(entries) {
  const groups = {};
  entries.forEach((entry) => {
    const key = [
      String(entry.date || ""),
      String(entry.mainLocation || ""),
      String(entry.sideLocation || "")
    ].join("__");
    if (!groups[key]) {
      groups[key] = { ...entry, mergedFindings: [entry.findings], mergedEntries: [entry] };
    } else {
      groups[key].mergedFindings.push(entry.findings);
      groups[key].mergedEntries.push(entry);
    }
  });
  return Object.values(groups);
}
function formatDateTime(val) {
  if (!val) return "—";
  const d = new Date(val);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  hours = hours.toString().padStart(2, "0");
  // لا تحط فاصلة
  return `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString("en-US", { month: "long" })} ${d.getFullYear()} - ${hours}:${minutes} ${ampm}`;
}




const generateWordPhotoNumbers = async () => {
  // 1️⃣ أرسل كل Entry أولاً
  try {
    await sendToExcel(entries);
  } catch (err) {
    console.error('Excel send error:', err);
    alert('تعذّر حفظ البيانات في الإكسل.');
    return;
  }


  // 2️⃣ دوال مساعدة (نفس كودك القديم)
  const formatRangeForTable = (from, to) => {
    if (!from || !to) return '';
    const d1 = new Date(from), d2 = new Date(to);
    const m = d1.toLocaleString('en-US',{month:'long'}), y=d1.getFullYear();
    return d1.getTime()===d2.getTime()
      ? `${d1.getDate()} ${m} - ${y}`
      : `${d1.getDate()} to ${d2.getDate()} ${m} - ${y}`;
  };
  const groupEntries = arr => {
    const map = {};
    arr.forEach(e => {
      const key = [e.date, e.mainLocation, e.sideLocation].join('__');
      map[key] = map[key]||[];
      map[key].push(e);
    });
    return Object.values(map);
  };

  // 3️⃣ إعداد صفوف الجدول مثل كودك
  let photoCounter = 1;
  let rowNumber = 1;
  const grouped = groupEntries(entries);

const tableRows = [
  new TableRow({
    children: [
      'No.','Date / Time','Location',
      'Assigned Inspection Location','Exact Location',
      'Description of Observation','Attached Photo',
      'Status of Finding','Risk/Priority'
    ].map(txt => new TableCell({
      shading: { fill: '4F81BD' },
      children: [ new Paragraph({
        children: [ new TextRun({
          text: txt,
          bold: true,
          color: 'FFFFFF',
          font: "Times New Roman",
          size: 16 // حجم 8 (كل وحدة = نصف pt)
        }) ],
        alignment: 'center'
      }) ]
    }))
  }),
  ...grouped.flatMap(group =>
    group.map(e => {
      let photoText = '';
      if (e.images?.length) {
        const start = photoCounter, end = photoCounter + e.images.length - 1;
        photoText = e.images.length === 1
          ? `Photo#${start}`
          : `Photos#${start},${end}`;
        photoCounter += e.images.length;
      }
      return new TableRow({
        children: [
          String(rowNumber++),
          formatDateTime(e.date),
          e.mainLocation || '—',
          e.sideLocation || '—',
          e.exactLocation || '',
          e.findings || '',
          photoText,
          e.status || '',
          e.risk || ''
        ].map(val => new TableCell({
          children: [ new Paragraph({
            children: [ new TextRun({
              text: String(val),
              font: "Times New Roman",
              size: 16 // حجم 8
            }) ],
            alignment: 'center'
          }) ]
        }))
      });
    })
  )
];


  // 4️⃣ أنشئ وحمّل الـ Word
  const doc = new Document({
  sections: [{
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: 'We would like to bring to your kind attention the following observations noted by our representative from the General Services Inspection during the above-mentioned period;',
            font: "Times New Roman",
            size: 16
          })
        ]
      }),
      new Paragraph(''),
      new Table({ rows: tableRows, width: { size: 100, type: 'pct' } }),
      new Paragraph(''),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Please see the attached inspection photos for your easy reference.',
            font: "Times New Roman",
            size: 16
          })
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'We would appreciate your feedback on action/s taken regarding the above observations within five (05) days of receiving this memorandum.',
            font: "Times New Roman",
            size: 16
          })
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Thank you for your usual cooperation.',
            font: "Times New Roman",
            size: 16
          })
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Best Regards.',
            font: "Times New Roman",
            size: 16
          })
        ]
      }),
    ]
  }]
});

const blob = await Packer.toBlob(doc);
const badge = entries[0]?.badge || "UnknownBadge";
const assignedLocation = entries[0]?.sideLocation || "UnknownLocation";
const exactLocation = entries[0]?.exactLocation || "UnknownExactLocation";
const today = new Date();
const dateString = today.toISOString().slice(0,10);

const filename = `Report ${assignedLocation} ${exactLocation} ${badge} ${dateString}.docx`;

   // 6️⃣ حاول ترفع الملف أولاً وخزّن الرابط
  let fileUrl;
  try {
    const badge = entries[0]?.badge;
    fileUrl = await uploadReportBlob(blob, filename, badge);
    console.log("Uploaded report to:", fileUrl);
  } catch (err) {
    console.error("Upload report failed", err);
    // لو الرفع فشل ممكن تنبه المستخدم أو تستمر وتنزل الملف محلياً:
    alert("تعذّر رفع التقرير إلى السحابة، سيتم تنزيله محلياً فقط.");
  }
  // نزّل ملف الورد فقط (تحميل محلي)
  saveAs(blob, filename);

  // تنظيف التخزين المحلي
  localStorage.removeItem("gsi_entries");
  localStorage.removeItem("gsi_badge");
  alert("Word file created. Saved data has been deleted.");
};

  // شاشة تسجيل الدخول
  if (!loggedIn) {
  return (
<div
  style={{
    minHeight: "100vh",
    width: "100%",
     backgroundImage: "linear-gradient(120deg, #2563eb 0%, #280055ff 100%)",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    display: "flex",            // ⬅️ أضفت هذه
    flexDirection: "column",    // ⬅️ أضفت هذه
    alignItems: "center",       // محاذاة أفقية بالنص
    justifyContent: "center",   // محاذاة عمودية بالنص
  }}
    >
      {/* الهيدر */}
      
      <div
  style={{
    width: "100%",
    padding: isMobile ? "18px 12px 0 12px" : "34px 46px 0 46px",
    boxSizing: "border-box",
    position: "relative",
    display: "flex",
    flexDirection: isMobile ? "column" : "row",         // صف أو عمودي
    justifyContent: isMobile ? "center" : "space-between",
    alignItems: isMobile ? "center" : "flex-start",      // محاذاة فوق أو وسط حسب الجهاز
    gap: isMobile ? 18 : 0,                              // فراغ بسيط للجوال
    textAlign: isMobile ? "center" : "left"
  }}
>
  {/* يسار: شعار + وزارة */}
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexDirection: isMobile ? "column" : "row",
    marginBottom: isMobile ? 10 : 0,
  }}>
    <img
      src="/mngha.png"
      alt="mngha"
      style={{
        width: isMobile ? 110 : 150,
        height: isMobile ? 72 : 100,
        objectFit: "contain",
        marginBottom: isMobile ? 6 : 0,
      }}
    />
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: isMobile ? "center" : "flex-start",
      lineHeight: 1.12,
      minWidth: 180,
    }}>
      <span style={{
        color: "#fff",
        fontWeight: 700,
        fontSize: isMobile ? 16 : 21,
        whiteSpace: "nowrap",
        marginBottom: 2,
      }}>
        Ministry of National Guard
      </span>
      <span style={{
        color: "#fff",
        fontWeight: 800,
        fontSize: isMobile ? 14 : 18,
        whiteSpace: "nowrap",
        letterSpacing: ".2px",
      }}>
        Health Affairs
      </span>
    </div>
  </div>
  {/* يمين: عناوين التدقيق */}
  <div style={{
    textAlign: isMobile ? "center" : "right",
    marginTop: isMobile ? 12 : 0
  }}>
    <div style={{
      color: "#fff",
      fontWeight: 700,
      fontSize: isMobile ? 16 : 21,
      marginBottom: 2
    }}>
      Internal Audit
    </div>
    <div style={{
      color: "#fff",
      fontWeight: 800,
      fontSize: isMobile ? 14 : 18
    }}>
      General Services Inspections
    </div>
  </div>
</div>

      {/* فورم تسجيل الدخول في الوسط */}
<div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    width: "100vw",
    padding: 20,
    boxSizing: "border-box",
    overflowX: "hidden", // يمنع التحريك يمين يسار بالجوال
  }}
>

<div
  style={{
    background: "rgba(30,36,48,0.11)",
    padding: 36,
    borderRadius: 16,
    boxShadow: "0 6px 36px #3b82f633",
    width: "100%",
    maxWidth: 430,
    margin: "0 auto",
    boxSizing: "border-box", // ✅ أضف هذا
    backdropFilter: "blur(1.5px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }}
>
          <h2
            style={{
              color: "#ffffffff",
              textShadow: "0 2px 8px #fff9",
              marginBottom: 18,
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            Enter your Badge Number
          </h2>
          <input
            type="text"
            placeholder="Badge Number"
            value={badgeInput}
            onChange={e => setBadgeInput(e.target.value)}
            style={{
              padding: 12,
              fontSize: 18,
              borderRadius: 8,
              marginBottom: 16,
              border: "1.5px solid #2563eb",
              minWidth: 200,
              background: "#f1f5f9",
              color: "#222",
              fontWeight: "bold",
              outline: "none",
            }}
          />
          <button
            style={{
              background: "linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)",
              color: "#fff",
              fontWeight: 600,
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              padding: "10px 22px",
              cursor: "pointer",
              boxShadow: "0 2px 8px #2563eb40",
            }}
            onClick={() => {
              if (badgeUsers[badgeInput.trim()]) {
                setLoggedIn(true);
                setUserName(badgeUsers[badgeInput.trim()]);
                const savedBadge = localStorage.getItem("gsi_badge");
                const savedEntries = localStorage.getItem("gsi_entries");
                if (savedBadge === badgeInput.trim() && savedEntries) {
                  setEntries(JSON.parse(savedEntries));
                } else {
                  setEntries([
                    { ...entries[0], badge: badgeInput.trim() }
                  ]);
                }
              } else {
                alert("Badge not recognized. Please contact admin.");
                localStorage.removeItem("gsi_entries");
                localStorage.removeItem("gsi_badge");
              }
            }}
          >
            Enter
          </button>
        </div>
      </div>
       </div>
  );
}

  return (
<div
style={{
  minHeight: "100vh",
  width: "100%",
   backgroundImage: "linear-gradient(120deg, #2563eb 0%, #280055ff 100%)",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
}}

>
  <div
    style={{
      maxWidth: 1000,
      margin: "0 auto",
      padding: "40px 0px"
    }}
  >
        
         {/* Two Logos & Title */}
<div style={{
  display: "flex",
  flexDirection: "column",
  alignItems: "center", // عشان الاسم تحت الصورة ومرتب
  gap: 0,                // مسافة صغيرة بين الصورة والاسم
}}>
 <img
        src="/ia.png"
        alt="Logo AI"
     style={{
        width: isMobile ? 80 : 110,
        height: isMobile ? 72 : 100,
        objectFit: "contain",
        marginBottom: isMobile ? -20 : -26,
      }}
      />
      <img
        src="/gsi.png"
        alt="Logo AI"
    style={{
        width: isMobile ? 110 : 150,
        height: isMobile ? 72 : 100,
        objectFit: "contain",
        marginBottom: isMobile ? 6 :0,
      }}
  />

  {userName && (
    <div
style={{
  color: "#ffe066", // ذهبي فاتح وواضح جدًا مع الأزرق
  textShadow: "0 2px 16px #1d235b88, 0 1px 0 #0008", // ظل أزرق غامق + أسود خفيف يوضح الحروف
  fontWeight: 900,
  fontSize: 16,
  margin: "20px 0 32px 0",
  letterSpacing: "1.2px",
  textAlign: "center",
  textTransform: "uppercase", // كل الحروف كبيرة، تعطي وضوح أكثر
  fontFamily: "Segoe UI, Arial, sans-serif",
}}

>
      <span style={{ color: "#000000ff", fontWeight: "bold" }}>WELCOME, </span>
      <span>{userName}</span>
    </div>
  )}
    
  
        {/* وسط: عنوان + اسم المستخدم */}
 <div style={{ flex: 1, textAlign: "center", alignSelf: "center" }}>

<div style={{
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
  justifyContent: "center",
  marginTop: 16,
}}>
  {showSearchPopup && (
  <SearchReportPopup onClose={() => setShowSearchPopup(false)} />
)}

<button style={searchreportstyle} onClick={() => setShowSearchPopup(true)}>
  Search Reports
</button>
{showSearchPopup && (
  <SearchReportPopup onClose={() => setShowSearchPopup(false)} />
  
)}
  {/* زر الإكسل */}
  <button
    style={{
   background: "linear-gradient(90deg, #000000ff 0%, #60a5fa 100%)",
  color: "#fff",
  fontWeight: 600,
  border: "none",
  borderRadius: 10,
  fontSize: 12,
  padding: "6px 6px",
  boxShadow: "0 2px 8px #6366f140",
  cursor: "pointer",
  transition: "background 0.2s",
    }}
    onClick={() =>
      window.open(
        "https://ptsassoc-my.sharepoint.com/:x:/g/personal/v5jl_ptsassoc_onmicrosoft_com/EQazCzrL6GhLhhjA8rLhaC4BbPeBZUEeflofyGUdQTHVdA?e=XWRy0s",
        "_blank"
      )
    }
  >
     Excel Sheet
  </button>

  {/* زر Last Reports */}
  <button
  style={lastReportsBtnStyle}
  onClick={() => setShowLastReportsPopup(true)}
>
  Last Reports
</button>

{showLastReportsPopup && (
  <LastReportsPopup onClose={() => setShowLastReportsPopup(false)} />
)}


</div>



          </div>
          
        </div>
        {/* Observations */}
  
{entries.map((entry, idx) => (
  <div
    key={idx}
    style={{
      background: "#fff",
      borderRadius: 16,
      padding: isMobile ? "16px" : "clamp(16px, 4vw, 28px)",
      maxWidth: 800,
      width: isMobile ? "calc(100vw - 32px)" : "calc(100vw - 20px)", // More margin on mobile
      margin: isMobile ? "16px" : "24px auto",
      boxShadow: "0 3px 10px rgba(147, 197, 253, 0.27)",
      borderLeft: "6px solid #2563eb",
      position: "relative",
      boxSizing: "border-box", // Important: prevents padding from adding to width
    }}
  >
    {/* Delete Button */}
    <button
      onClick={() => handleDelete(idx)}
  style={{
    position: "absolute",
    top: isMobile ? 10 : 16,
    right: isMobile ? -160 : 16,
    background: "transparent",
    border: "none",
    color: "#e11d48",
    fontSize: isMobile ? 28 : 24,
    cursor: "pointer",
    width: isMobile ? 32 : "auto",
    height: isMobile ? 32 : "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5, // تأكد أنه فوق كل شي
  }}
      aria-label={`Delete observation ${idx + 1}`}
    >
  <span style={{fontWeight:"900", fontSize: isMobile ? 28 : 22, letterSpacing: 1}}>×</span>
    </button>

    {/* Row 1: Date, Location, Assigned Location */}
    <div style={{ 
      display: "flex", 
      flexDirection: isMobile ? "column" : "row", 
      gap: isMobile ? 16 : 14, 
      marginBottom: 16 
    }}>
      <div style={{ flex: isMobile ? "none" : "1 1 150px" }}>
        <label style={{
          ...labelStyle,
          display: 'block',
          marginBottom: 8,
          fontSize: isMobile ? 16 : 14,
          fontWeight: 600
        }}>Date</label>
<input
  type="datetime-local"
  value={entry.date || getNowDatetimeLocalRiyadh()}
  onChange={e => updateEntry(idx, "date", e.target.value)}
  style={{
    ...inputStyle,
    width: "100%",
    fontSize: isMobile ? 16 : 14,
    padding: isMobile ? "6px 8px" : "8px 12px",
    height: isMobile ? 40 : 32,
    boxSizing: "border-box"
  }}
/>

\
      </div>
      
      <div style={{ flex: isMobile ? "none" : "2 1 220px" }}>
        <label style={{
          ...labelStyle,
          display: 'block',
          marginBottom: 8,
          fontSize: isMobile ? 16 : 14,
          fontWeight: 600
        }}>Location</label>
        <select
          id={`main-location-${idx}`}
          value={entry.mainLocation || ""}
          onChange={(e) => {
            updateEntry(idx, "mainLocation", e.target.value);
            updateEntry(idx, "sideLocation", "");
            if (!LOCATIONS[e.target.value] || LOCATIONS[e.target.value].length === 0) {
              updateEntry(idx, "location", e.target.value);
            } else {
              updateEntry(idx, "location", "");
            }
          }}
          style={{
            ...inputStyle,
            width: "100%",
            fontSize: isMobile ? 16 : 14,
            padding: isMobile ? "12px" : "8px 12px",
            boxSizing: "border-box"
          }}
        >
          <option value="">Select Location</option>
          {Object.keys(LOCATIONS).map((main) => (
            <option key={main} value={main}>
              {main}
            </option>
          ))}
        </select>
      </div>
      
      <div style={{ flex: isMobile ? "none" : "2 1 220px" }}>
        <label style={{
          ...labelStyle,
          display: 'block',
          marginBottom: 8,
          fontSize: isMobile ? 16 : 14,
          fontWeight: 600
        }}>Assigned Inspection Location</label>
        <select
          id={`side-location-${idx}`}
          value={entry.sideLocation || ""}
          onChange={(e) => {
            updateEntry(idx, "sideLocation", e.target.value);
            updateEntry(idx, "location", `${entry.mainLocation} - ${e.target.value}`);
          }}
          style={{
            ...inputStyle,
            width: "100%",
            fontSize: isMobile ? 16 : 14,
            padding: isMobile ? "12px" : "8px 12px",
            boxSizing: "border-box"
          }}
        >
          <option value="">Select Assigned Inspection Location</option>
          {entry.mainLocation && LOCATIONS[entry.mainLocation]
            ? LOCATIONS[entry.mainLocation].map((side) => (
                <option key={side} value={side}>
                  {side}
                </option>
              ))
            : null}
        </select>
      </div>
    </div>

    {/* Row 2: Exact Location (Full Width) */}
    <div style={{ marginBottom: 16 }}>
      <label style={{
        ...labelStyle,
        display: 'block',
        marginBottom: 8,
        fontSize: isMobile ? 16 : 14,
        fontWeight: 600
      }}>Exact Location</label>
      <input
        id={`exact-location-${idx}`}
        placeholder="Enter the exact location (Ward 11, Room #101, etc)"
        value={entry.exactLocation || ""}
        onChange={(e) => updateEntry(idx, "exactLocation", e.target.value)}
        style={{
          ...inputStyle,
          width: "100%",
          fontSize: isMobile ? 16 : 14,
          padding: isMobile ? "12px" : "8px 12px",
          boxSizing: "border-box"
        }}
      />
    </div>

    {/* Row 3: Status and Risk/Priority */}
    <div style={{ 
      display: "flex", 
      flexDirection: isMobile ? "column" : "row", 
      gap: isMobile ? 16 : 12, 
      marginBottom: 16 
    }}>
      <div style={{ flex: "1" }}>
        <label style={{
          ...labelStyle,
          display: 'block',
          marginBottom: 8,
          fontSize: isMobile ? 16 : 14,
          fontWeight: 600
        }}>Status</label>
        <select
          id={`status-${idx}`}
          value={entry.status}
          onChange={(e) => updateEntry(idx, "status", e.target.value)}
          style={{
            ...inputStyle,
            width: "100%",
            fontSize: isMobile ? 16 : 14,
            padding: isMobile ? "12px" : "8px 12px",
            boxSizing: "border-box"
          }}
        >
          <option value="">Select status</option>
          <option value="Rectified">Rectified</option>
          <option value="Previously reported / Not Rectified">Previously reported / Not Rectified</option>
          <option value="New">New</option>
        </select>
      </div>
      
      <div style={{ flex: "1" }}>
        <label style={{
          ...labelStyle,
          display: 'block',
          marginBottom: 8,
          fontSize: isMobile ? 16 : 14,
          fontWeight: 600
        }}>Risk / Priority</label>
        <select
          id={`risk-${idx}`}
          value={entry.risk}
          onChange={(e) => updateEntry(idx, "risk", e.target.value)}
          style={{
            ...inputStyle,
            width: "100%",
            fontSize: isMobile ? 16 : 14,
            padding: isMobile ? "12px" : "8px 12px",
            boxSizing: "border-box"
          }}
        >
          <option value="">Risk/Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
    </div>

    {/* Row 4: Description, Photo Upload, and Classification */}
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: 16, 
      marginBottom: 16,
      width: "100%", // Ensure container doesn't overflow
      boxSizing: "border-box"
    }}>
      {/* Description - Full Width */}
      <div>
        <label style={{
          ...labelStyle,
          display: 'block',
          marginBottom: 8,
          fontSize: isMobile ? 16 : 14,
          fontWeight: 600
        }}>Description of Observation</label>
        <textarea
          id={`findings-${idx}`}
          placeholder="Enter The Description of The Observation"
          value={entry.findings}
          onChange={(e) => updateEntry(idx, "findings", e.target.value)}
          style={{
            ...inputStyle,
            width: "100%",
            minHeight: isMobile ? 100 : 80,
            resize: "vertical",
            fontSize: isMobile ? 16 : 14,
            padding: isMobile ? "12px" : "8px 12px",
            boxSizing: "border-box",
            maxWidth: "100%" // Prevent textarea from growing beyond container
          }}
        />
      </div>
      
      {/* Photo Upload and Classification Side by Side on Desktop, Stacked on Mobile */}
      <div style={{ 
        display: "flex", 
        flexDirection: isMobile ? "column" : "row", 
        gap: isMobile ? 16 : 12 
      }}>
        <div style={{ flex: isMobile ? "none" : "1" }}>
          <label style={{
            ...labelStyle,
            display: 'block',
            marginBottom: 8,
            fontSize: isMobile ? 16 : 14,
            fontWeight: 600,
            textAlign: isMobile ? "left" : "center"
          }}>Attach Photos (2 Max)</label>
          <input
            id={`image-upload-${idx}`}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => updateImages(idx, e.target.files)}
            disabled={entry.images && entry.images.length >= 2}
            style={{
              width: "100%",
              fontSize: isMobile ? 16 : 14,
              padding: isMobile ? "8px" : "4px",
              boxSizing: "border-box"
            }}
          />
        </div>
        
        <div style={{ flex: isMobile ? "none" : "2" }}>
          <label style={{
            ...labelStyle,
            display: 'block',
            marginBottom: 8,
            fontSize: isMobile ? 16 : 14,
            fontWeight: 600
          }}>Classification</label>
          <select
            id={`classification-${idx}`}
            value={entry.classification}
            onChange={(e) => updateEntry(idx, "classification", e.target.value)}
            style={{
              ...inputStyle,
              width: "100%",
              fontSize: isMobile ? 16 : 14,
              padding: isMobile ? "12px" : "8px 12px",
              boxSizing: "border-box"
            }}
          >
            <option value="">Classification</option>
            <option value="Building Structures and Appearance">Building Structures and Appearance</option>
            <option value="Facility Maintenance (e.g., Electrical plumbing drainage issue)">
              Facility Maintenance (e.g., Electrical plumbing drainage issue)
            </option>
            <option value="Safety & Security measures in internal and external areas">
              Safety & Security measures in internal and external areas
            </option>
            <option value="Support Services (e.g., Environmental /Housekeeping)">
              Support Services (e.g., Environmental /Housekeeping)
            </option>
            <option value="Availability, Attitude and attentiveness of service providers">
              Availability, Attitude and attentiveness of service providers
            </option>
            <option value="Concerns raised by staff at any inspected location">
              Concerns raised by staff at any inspected location
            </option>
            <option value="Unsolved patients Issues during the time of inspection">
              Unsolved patients Issues during the time of inspection
            </option>
            <option value="Policy Compliance (general policies such as non-smoking and dress code-wearing badges)">
              Policy Compliance (general policies such as non-smoking and dress code-wearing badges)
            </option>
            <option value="Space utilization">Space utilization</option>
            <option value="property condition">property condition</option>
            <option value="any other Operational deficiencies/ Obstacles">
              any other Operational deficiencies/ Obstacles
            </option>
          </select>
        </div>
      </div>
    </div>

    {/* Row 5: Badge Number and Image Previews */}
    <div style={{ 
      display: "flex", 
      flexDirection: isMobile ? "column" : "row", 
      gap: 16, 
      alignItems: isMobile ? "stretch" : "flex-start" 
    }}>
      <div style={{ flex: isMobile ? "none" : "0 0 200px" }}>
        <label htmlFor={`badge-${idx}`} style={{
          ...labelStyle,
          display: 'block',
          marginBottom: 8,
          fontSize: isMobile ? 16 : 14,
          fontWeight: 600
        }}>
          Badge Number:
        </label>
        <input
          id={`badge-${idx}`}
          type="number"
          min="1"
          placeholder="Badge number"
          value={entry.badge}
          onChange={(e) => updateEntry(idx, "badge", e.target.value)}
          style={{
            ...inputStyle,
            fontWeight: "bold",
            width: isMobile ? "100%" : "120px",
            fontSize: isMobile ? 16 : 14,
            padding: isMobile ? "12px" : "8px 12px",
            boxSizing: "border-box"
          }}
        />
      </div>


      {/* Image Previews */}
      {entry.images && entry.images.length > 0 && (
        <div style={{ 
          display: "flex", 
          gap: 12, 
          flexWrap: "wrap", 
          flex: "1",
          marginTop: isMobile ? 8 : 0
        }}>
          <label style={{
            ...labelStyle,
            display: 'block',
            width: '100%',
            marginBottom: 8,
            fontSize: isMobile ? 16 : 14,
            fontWeight: 600
          }}>Photo Previews:</label>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {entry.images.map((img, i) => {
              if (!img || !(img instanceof Blob)) return null;
              return (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    border: "1px solid #e0e7ef",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                >
                  <img
                    src={URL.createObjectURL(img)}
                    alt=""
                    width={isMobile ? 80 : 64}
                    height={isMobile ? 60 : 48}
                    style={{ objectFit: "cover" }}
                  />
                   <button
  onClick={() => removeImage(idx, i)}
      style={{
        position: "absolute",
        top: -8,
        right: -2,
        background: "transparent",
        border: "none",
        color: "#e11d48",
        fontSize: isMobile ? 28 : 24, // Larger on mobile for touch
        cursor: "pointer",
        width: isMobile ? 32 : 'auto',
        height: isMobile ? 32 : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      aria-label={`Delete observation ${idx + 1}`}
    >
  <span style={{fontWeight:"900", fontSize: isMobile ? 28 : 22, letterSpacing: 1}}>×</span>
    </button>
    
                </div>
              );
            })}
          </div>
  
        </div>
      )}
    </div>
  </div>
))}
        {/* الأزرار */}
        <div style={{ display: "flex", gap: 13, justifyContent: "center", marginTop: 15, flexWrap: "wrap" }}>
          <button style={mainBtnStyle} onClick={addEntry}>Add Observation</button>
          <button style={mainBtnStyle} onClick={generateWordPhotoNumbers}>Word</button>
          <button style={mainBtnStyle} onClick={generateWordWithImages}>Word (with Photos)</button>
          <button style={mainBtnStyle} onClick={() => setShowStats(true)}>Show Statistics</button>
          <button style={mainBtnStyle} onClick={saveForLater}>Save & Pause Inspection (Delete Photos to save you can add them later)</button>
        </div>
                <div
  style={{
    width: "100%",
    textAlign: "center",
    color: "#64748b",
    fontSize: 13,
    margin: "24px 0 8px 0",
    opacity: 0.7,
    letterSpacing: ".03em",
  }}
>
  Developed & Designed by Khalid Al Mutairi ©  
</div>
        {/* Popup الإحصائيات */}
        {showStats && (
          <StatisticsPopup onClose={() => setShowStats(false)} />
        )}
      </div>


    </div>
  );
}

// ========= COMPONENT: StatisticsPopup =========
function StatisticsPopup({ onClose }) {
  // اسم المكان الحالي والإحصائيات
  const [areas, setAreas] = useState([
    makeEmptyArea(""),
  ]);
  const [currentName, setCurrentName] = useState("");

  // إضافة مكان جديد
  const addArea = () => {
    if (!currentName.trim()) return;
    setAreas([...areas, makeEmptyArea(currentName.trim())]);
    setCurrentName("");
  };

  // تحديث القيم داخل الجدول
  const updateStat = (areaIdx, typeKey, field, value) => {
    setAreas(areas.map((area, idx) =>
      idx !== areaIdx ? area : {
        ...area,
        stats: area.stats.map(stat =>
          stat.key !== typeKey ? stat : { ...stat, [field]: value }
        ),
      }
    ));
  };
const generateStatsWord = async () => {
  const tableCellStyle = {
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: "2563eb" },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: "2563eb" },
      left: { style: BorderStyle.SINGLE, size: 2, color: "2563eb" },
      right: { style: BorderStyle.SINGLE, size: 2, color: "2563eb" },
    },
  };

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "GSI Areas Audit Statistics", bold: true, size: 32 }),
            ],
            alignment: "center",
            spacing: { after: 300 }
          }),
          ...areas.filter(a => a.name.trim()).map((area) => [
            new Paragraph({
              children: [new TextRun({ text: `Area Name: ${area.name}`, bold: true, size: 26 })],
              spacing: { after: 150 },
            }),
            new Table({
              rows: [
                // Header row
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: "Type", bold: true })],
                      shading: { fill: "2563eb" },
                      ...tableCellStyle,
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: "Total", bold: true })],
                      shading: { fill: "2563eb" },
                      ...tableCellStyle,
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: "With Findings", bold: true })],
                      shading: { fill: "2563eb" },
                      ...tableCellStyle,
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: "No Findings", bold: true })],
                      shading: { fill: "2563eb" },
                      ...tableCellStyle,
                    }),
                  ],
                  tableHeader: true,
                }),
                // Data rows
                ...area.stats.map(stat =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(stat.label)], ...tableCellStyle }),
                      new TableCell({ children: [new Paragraph(stat.total.toString())], ...tableCellStyle }),
                      new TableCell({ children: [new Paragraph(stat.withFindings.toString())], ...tableCellStyle }),
                      new TableCell({ children: [new Paragraph(stat.withoutFindings.toString())], ...tableCellStyle }),
                    ],
                  })
                ),
              ],
              width: { size: 100, type: "pct" },
            }),
            new Paragraph(" "),
          ]).flat(),
        ],
      },
    ],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, "GSI_Areas_Statistics.docx");
};

  return (
    <div style={statsPopupStyle}>
      <div style={statsContentStyle}>
        <h2 style={{ color: "#2563eb", textAlign: "center", marginBottom: 8 }}>
          Areas Statistics
        </h2>

        {/* إضافة منطقة جديدة */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
          <input
            type="text"
            placeholder="Enter area/location name"
            value={currentName}
            onChange={(e) => setCurrentName(e.target.value)}
            style={{
              padding: 6,
              fontSize: 15,
              borderRadius: 8,
              border: "1.5px solid #2563eb",
              minWidth: 170,
              background: "#fff",
              color: "#2563eb",
              fontWeight: "bold",
              outline: "none",
            }}
          />
          <button
            onClick={addArea}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              padding: "8px 14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Add Area
          </button>
        </div>

        {/* قائمة الأماكن والإحصائيات */}
        <div style={{ maxHeight: 400, overflow: "auto", marginBottom: 20 }}>
          {areas.map((area, areaIdx) =>
            area.name.trim() ? (
              <div
                key={areaIdx}
                style={{
                  background: "#f3f7ff",
                  borderRadius: 11,
                  boxShadow: "0 2px 12px #60a5fa14",
                  padding: 12,
                  marginBottom: 18,
                  borderLeft: "6px solid #2563eb",
                }}
              >
                <h3 style={{ margin: 0, color: "#2563eb", fontSize: 17 }}>
                  {area.name}
                </h3>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 9 }}>
                  <thead>
                    <tr style={{ background: "#dbeafe", color: "#1e293b" }}>
                      <th style={cellStyle}>Type</th>
                      <th style={cellStyle}>Total</th>
                      <th style={cellStyle}>With Findings</th>
                      <th style={cellStyle}>No Findings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {area.stats.map((stat) => (
                      <tr key={stat.key}>
                        <td style={{ ...cellStyle, color: "#2563eb", fontWeight: "bold" }}>
                          {stat.label}
                        </td>
                        <td style={cellStyle}>
                          <input
                            type="number"
                            min={0}
                            value={stat.total}
                            onChange={(e) =>
                              updateStat(areaIdx, stat.key, "total", e.target.value)
                            }
                            style={inputStyle}
                          />
                        </td>
                        <td style={cellStyle}>
                          <input
                            type="number"
                            min={0}
                            value={stat.withFindings}
                            onChange={(e) =>
                              updateStat(areaIdx, stat.key, "withFindings", e.target.value)
                            }
                            style={inputStyle}
                          />
                        </td>
                        <td style={cellStyle}>
                          <input
                            type="number"
                            min={0}
                            value={stat.withoutFindings}
                            onChange={(e) =>
                              updateStat(areaIdx, stat.key, "withoutFindings", e.target.value)
                            }
                            style={inputStyle}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null
          )}
        </div>

        <div
          style={{
            textAlign: "center",
            marginBottom: 20,
            display: "flex",
            gap: 12,
            justifyContent: "center",
          }}
        >
          <button onClick={generateStatsWord} style={mainBtnStyle}>
            Download Statistics Word
          </button>
          <button onClick={onClose} style={{ ...mainBtnStyle, background: "#e11d48" }}>
            Close
          </button>
        </div>

      
      </div>

    </div>
  );
}
