"use client";
import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, ImageRun } from "docx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { uploadReportBlob, uploadImageBlob } from "./lib/storage";
import { employeesMap } from "@/data/employees";
import LastReportsPopup from "@/components/LastReportsPopup";
import { Analytics } from "@vercel/analytics/next"
import { useRouter } from "next/navigation";
import React from "react";
import './globals.css';




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

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
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
  "53075": "Hanan Al Shuwaier",
  "51888": "Bander Al Zakari",
  "55723": "Haitham Al Mughamis",
  "56392": "Nasser Abu Haimed",
  "62111": "Bader Al Enezi",
  "74770": "Sumer Alkhudeiri",
  "69444": "Khulood Al Otaibi",
  "18000": "Salma Al Saqaby",
  "78879": "Khalid Al Mutairi",
  "100696": "Abdullah Al Enezi",
  "100729": "Ghozlan Alkharaan",
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
      date: ""
    }  
  ]);
  const [isMobile, setIsMobile] = useState(false);
  const [showLastReportsPopup, setShowLastReportsPopup] = useState(false);
  const [showStatsPopup, setShowStatsPopup] = useState(false);
  const [observations, setObservations] = useState([]);

  // دالة حذف عنصر من الملاحظات
  const handleDelete = (indexToDelete) => {
    setEntries((prevEntries) => prevEntries.filter((_, idx) => idx !== indexToDelete));
  };

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
        date: last.date || "",
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

  // ملف مع الصور الحقيقية
const generateWordWithImages = async () => {
 const formatDate = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleString("en-US", { month: "long" })} - ${d.getFullYear()}`;
  };

  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "No.", color: "FFFFFF", bold: true })], alignment: "center" })] }),
new TableCell({
  shading: { fill: "4F81BD" },
  children: [
    new Paragraph({
      children: [new TextRun({ text: "Date", color: "FFFFFF", bold: true })],
      alignment: "center"
    })
  ]
}),
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
text: formatDate(entry.date),
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
          // Date  أعلى اليسار تحت Location
          new Paragraph({
            children: [
              new TextRun({
text: `Date: ${formatDate(entries[0]?.date)}`,
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
// ... بعد Packer.toBlob(doc) داخل generateWordWithImages

const blob    = await Packer.toBlob(doc);
const badge = entries[0]?.badge || "UnknownBadge";
const assignedLocation = (entries[0]?.sideLocation || "UnknownLocation").replace(/\s+/g, "_");
const today = new Date();
const dateString = today.toISOString().slice(0,10);

const filename = `Photos_${assignedLocation}_${badge}_${dateString}.docx`;


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

const generateWordPhotoNumbers = async () => {
  // 1️⃣ أرسل كل Entry أولاً
  try {
    await sendToExcel(entries);
  } catch (err) {
    console.error('Excel send error:', err);
    alert('تعذّر حفظ البيانات في الإكسل.');
    return;
  }

  // 2️⃣ دوال مساعدة
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

  // 3️⃣ جهّز صفوف الجدول مع ترقيم الصور
  let photoCounter = 1;
  const grouped = groupEntries(entries);
  const tableRows = [
    // header
    new TableRow({
      children: [
        'No.','Date','Location',
        'Assigned Inspection Location','Exact Location',
        'Description of Observation','Attached Photo',
        'Status of Finding','Risk/Priority'
      ].map(txt => new TableCell({
        shading:{fill:'4F81BD'},
        children:[ new Paragraph({
          children:[ new TextRun({text:txt,bold:true,color:'FFFFFF'}) ],
          alignment:'center'
        }) ]
      }))
    }),
    // data
    ...grouped.flatMap(group =>
      group.map((e, idx) => {
        let photoText = '';
        if (e.images?.length) {
          const start = photoCounter, end = photoCounter + e.images.length - 1;
          photoText = e.images.length===1
            ? `Photo#${start}`
            : `Photos#${start},${end}`;
          photoCounter += e.images.length;
        }
        return new TableRow({
          children: [
            String(idx+1),
            e.date ? new Date(e.date).toLocaleDateString("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric"
}) : "—",
            e.mainLocation||'—',
            e.sideLocation||'—',
            e.exactLocation||'',
            e.findings||'',
            photoText,
            e.status||'',
            e.risk||''
          ].map(val=>new TableCell({
            children:[new Paragraph({text:val,alignment:'center'})]
          }))
        });
      })
    )
  ];

  // 4️⃣ أنشئ وحمّل الـ Word
  const doc = new Document({
    sections:[{
      children:[
        new Paragraph('We would like to bring to your kind attention the following observations noted by our representative from the General Services Inspection during the above-mentioned period;'),
        new Paragraph(''),
        new Table({ rows: tableRows, width: { size:100, type:'pct' } }),
        new Paragraph(''),
        new Paragraph('Please see the attached inspection photos for your easy reference.'),
        new Paragraph('We would appreciate your feedback on action/s taken regarding the above observations within five (05) days of receiving this memorandum.'),
        new Paragraph('Thank you for your usual cooperation.'),
        new Paragraph('Best Regards.')
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
const badge = entries[0]?.badge || "UnknownBadge";
const assignedLocation = (entries[0]?.sideLocation || "UnknownLocation").replace(/\s+/g, "_");
const today = new Date();
const dateString = today.toISOString().slice(0,10);

const filename = `Report_${assignedLocation}_${badge}_${dateString}.docx`;


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

// 7️⃣ نزّل الملف للمستخدم
saveAs(blob, filename);

// 8️⃣ نظّف التخزين المحلي
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
    background: "linear-gradient(120deg, #2563eb 0%, #280055ff 100%)",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  }}
    >
      {/* الهيدر */}
      <div
        style={{
          width: "100%",
          padding: "34px 46px 0 46px",
          boxSizing: "border-box",
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        {/* يسار: شعار + وزارة */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src="/mngha.png" // عدل المسار حسب صورتك
            alt="mngha"
            style={{
              width: 150,
              height: 100,
              objectFit: "contain",
            }}
          />
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            lineHeight: 1.12,
            minWidth: 180,
          }}>
            <div
  style={{
    width: "100%",
    padding: "34px 46px 0 46px",
    boxSizing: "border-box",
    position: "relative",
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "space-between",
    alignItems: isMobile ? "center" : "flex-start",
    gap: isMobile ? 20 : 0,
  }}
></div>
            <span style={{
              color: "#ffffffff",
              fontWeight: 700,
              fontSize: 21,
              whiteSpace: "nowrap",
              marginBottom: 2,
            }}>
              Ministry of National Guard
            </span>
            <span style={{
              color: "#ffffffff",
              fontWeight: 800,
              fontSize: 18,
              whiteSpace: "nowrap",
              letterSpacing: ".2px",
            }}>
              Health Affairs
            </span>
          </div>
        </div>
        {/* يمين: عناوين التدقيق */}
        <div style={{ textAlign: "right" }}>
          <div
  style={{
    width: "100%",
    padding: "34px 46px 0 46px",
    boxSizing: "border-box",
    position: "relative",
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "space-between",
    alignItems: isMobile ? "center" : "flex-start",
    gap: isMobile ? 20 : 0,
  }}
></div>
          <div style={{ color: "#ffffffff", fontWeight: 700, fontSize: 21, marginBottom: 2 }}>
            Internal Audit
          </div>
          <div style={{ color: "#ffffffff", fontWeight: 800, fontSize: 18 }}>
            General Services Inspections
          </div>
        </div>
      </div>

      {/* فورم تسجيل الدخول في الوسط */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            background: "rgba(30,36,48,0.11)",
            padding: 36,
            borderRadius: 16,
            boxShadow: "0 6px 36px #3b82f633",
            minWidth: 320,
            maxWidth: 340,
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
  background: "linear-gradient(120deg, #2563eb 0%, #280055ff 100%)",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
}}

>
  <div
    style={{
      maxWidth: 800,
      margin: "0 auto",
      padding: "40px 10px"
    }}
  >
        
         {/* Two Logos & Title */}
<div style={{
  display: "flex",
  flexDirection: "column",
  alignItems: "center", // عشان الاسم تحت الصورة ومرتب
  gap: 4,                // مسافة صغيرة بين الصورة والاسم
}}>
  <img
    src="/gsi.png"
    alt="Logo AI"
    style={{
      width: 50,
      height: 50,
      borderRadius: 12,
      objectFit: "contain",
    }}
  />
  {userName && (
    <div
      style={{
        fontSize: 14,
        color: "#000000ff",
        fontWeight: "bold",
        marginTop: 4,
      }}
    >
      <span style={{ color: "#000000ff", fontWeight: "bold" }}>Welcome, </span>
      <span>{userName}</span>
    </div>
  )}
    
  
        {/* وسط: عنوان + اسم المستخدم */}
 <div style={{ flex: 1, textAlign: "center", alignSelf: "center" }}>

<div style={{
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  justifyContent: "center",
  marginTop: 16,
}}>

  {/* زر الإكسل */}
  <button
    style={{
      background: "linear-gradient(90deg, #21c65e 0%, #34d399 100%)",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "6px 6px",
      fontWeight: "bold",
      fontSize: 12,
      cursor: "pointer",
      boxShadow: "0 2px 6px #21c65e66",
    }}
    onClick={() =>
      window.open(
        "https://ptsassoc-my.sharepoint.com/:x:/g/personal/v5jl_ptsassoc_onmicrosoft_com/EQazCzrL6GhLhhjA8rLhaC4BbPeBZUEeflofyGUdQTHVdA?e=XWRy0s",
        "_blank"
      )
    }
  >
    Open Excel Sheet
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

  {/* زر Reload */}
  <button
    onClick={() => window.location.reload()}
    style={{
      background: "#e11d48",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "6px 6px",
      fontWeight: "bold",
      fontSize: 12,
      cursor: "pointer",
      boxShadow: "0 2px 6px #e11d4844",
    }}
  >
    Reload
  </button>
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
  padding: "clamp(10px, 4vw, 28px)",
  maxWidth: 800, // كافي للجوال والكمبيوتر
  width: "98vw",
  margin: "24px auto",
  boxShadow: "0 3px 10px rgba(147, 197, 253, 0.27)",
  borderLeft: "6px solid #2563eb",
  position: "relative",
    }}
  >
    {/* زر الحذف */}
    <button
      onClick={() => handleDelete(idx)}
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        background: "transparent",
        border: "none",
        color: "#e11d48",
        fontSize: 24,
        cursor: "pointer",
      }}
      aria-label={`Delete observation ${idx + 1}`}
    >
      &times;
    </button>

    {/* السطر الأول */}
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
      <div style={{ flex: "1 1 150px" }}>
       <label style={labelStyle}>Date</label>
<input
  type="date"
  value={entry.date}
  onChange={e => updateEntry(idx, "date", e.target.value)}
  style={inputStyle}
/>

      </div>
      <div style={{ flex: "2 1 220px" }}>
        <label style={labelStyle}>Location</label>
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
          style={inputStyle}
        >
          <option value="">Select Location</option>
          {Object.keys(LOCATIONS).map((main) => (
            <option key={main} value={main}>
              {main}
            </option>
          ))}
        </select>
      </div>
      <div style={{ flex: "2 1 220px" }}>
        <label style={labelStyle}>Assigned Inspection Location</label>
        <select
          id={`side-location-${idx}`}
          value={entry.sideLocation || ""}
          onChange={(e) => {
            updateEntry(idx, "sideLocation", e.target.value);
            updateEntry(idx, "location", `${entry.mainLocation} - ${e.target.value}`);
          }}
          style={inputStyle}
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

    {/* السطر الثاني */}
<div style={{ flex: "4 1 600px" }}>  {/* زودت flex عشان يكون عرضه أكبر */}
  <label style={labelStyle}>Exact Location</label>
  <input
    id={`exact-location-${idx}`}
    placeholder="Enter the exact location (Ward 11, Room #101,etc)"
    value={entry.exactLocation || ""}
    onChange={(e) => updateEntry(idx, "exactLocation", e.target.value)}
    style={{ ...inputStyle, width: "98%" }}  // عشان ياخذ كل عرض الـ div
  />
      
<div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
  <div style={{ flex: "1 1 150px" }}>
    <label style={labelStyle}>Status</label>
<select
  id={`status-${idx}`}
  value={entry.status}
  onChange={(e) => updateEntry(idx, "status", e.target.value)}
  style={{ ...inputStyle, width: "300px" }}
>
  <option value="">Select status</option>
  <option value="Rectified">Rectified</option>
  <option value="Previously reported / Not Rectified">Previously reported / Not Rectified</option>
  <option value="New">New</option>
</select>

  </div>
  <div style={{ flex: "1 1 150px" }}>
    <label style={labelStyle}>Risk / Priority</label>
<select
  id={`risk-${idx}`}
  value={entry.risk}
  onChange={(e) => updateEntry(idx, "risk", e.target.value)}
  style={{ ...inputStyle, width: "300px" }}
>
  <option value="">Risk/Priority</option>
  <option value="High">High</option>
  <option value="Medium">Medium</option>
  <option value="Low">Low</option>
</select>

  </div>
  </div>
  </div>

    {/* السطر الثالث */}
    <div
      style={{
        display: "flex",
        gap: 16,
        flexWrap: "wrap",
        alignItems: "flex-end",
        marginBottom: 12,
      }}
    >
      <div style={{ flex: "3 1 400px" }}>
      <label style={labelStyle}>Description of Observation</label>
<textarea
  id={`findings-${idx}`}
  placeholder="Enter The Description of The Observation"
  value={entry.findings}
  onChange={(e) => updateEntry(idx, "findings", e.target.value)}
  style={{ ...inputStyle, width: "98%", minHeight: 80, resize: "vertical" }}
/>

      </div>
      <div style={{ flex: "1 1 180px" }}>
        <label style={{ ...labelStyle, textAlign: "center", marginBottom: 4 }}>Attach Photos (2 Max)</label>
        <input
          id={`image-upload-${idx}`}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => updateImages(idx, e.target.files)}
          disabled={entry.images && entry.images.length >= 2}
          style={{ marginBottom: 0 }}
        />
      </div>
      <div style={{ flex: "1 1 180px" }}>
        <label style={labelStyle}>Classification</label>
        <select
  id={`classification-${idx}`}
  value={entry.classification}
  onChange={(e) => updateEntry(idx, "classification", e.target.value)}
  style={{ ...inputStyle, width: "700px" }}
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

    {/* السطر الرابع */}
    <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
      <div style={{ flex: "1 1 200px" }}>
        <label htmlFor={`badge-${idx}`} style={labelStyle}>
          Badge Number:
        </label>
        <input
          id={`badge-${idx}`}
          type="number"
          min="1"
          placeholder="Badge number"
          value={entry.badge}
          onChange={(e) => updateEntry(idx, "badge", e.target.value)}
          style={{ ...inputStyle, fontWeight: "bold" , width: "80px" }}
        />
      </div>

      {/* صور المعاينة */}
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap", flex: "2 1 400px" }}>
  {entry.images && entry.images.map((img, i) => {
    // تأكد إن img موجود ومن النوع الصحيح
    if (!img || !(img instanceof Blob)) return null;
    return (
      <div
        key={i}
        style={{
          position: "relative",
          border: "1px solid #e0e7ef",
          borderRadius: 9,
          overflow: "hidden",
        }}
      >
        <img
          src={URL.createObjectURL(img)}
          alt=""
          width={64}
          height={48}
          style={{ objectFit: "cover" }}
        />
        <button
          onClick={() => removeImage(idx, i)}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "rgba(255, 0, 0, 0.8)",
            border: "none",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            borderRadius: "0 9px 0 9px",
            width: 24,
            height: 24,
            lineHeight: "22px",
            textAlign: "center",
            padding: 0,
          }}
          aria-label={`Remove image ${i + 1}`}
        >
          ×
        </button>
      </div>
    );
  })}
</div>

    </div>
  </div>
))}

        {/* الأزرار */}
        <div style={{ display: "flex", gap: 13, justifyContent: "center", marginTop: 15, flexWrap: "wrap" }}>
          <button style={mainBtnStyle} onClick={addEntry}>Add Observation</button>
          <button style={mainBtnStyle} onClick={generateWordPhotoNumbers}>Word</button>
          <button style={mainBtnStyle} onClick={generateWordWithImages}>Word (with Photos)</button>
          <button style={mainBtnStyle} onClick={() => setShowStats(true)}>Show Statistics</button>
          <button style={mainBtnStyle} onClick={saveForLater}>Save & Pause Inspection (Delete Photos to save)</button>
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

  // توليد ملف وورد
  const generateStatsWord = async () => {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun({ text: "GSI Areas Audit Statistics", bold: true, size: 30 })],
              alignment: "center",
            }),
            new Paragraph(" "),
            ...areas.filter(a => a.name.trim()).map((area, idx) => [
              new Paragraph({ children: [new TextRun({ text: `Area Name: ${area.name}`, bold: true, size: 24 })], spacing: { after: 150 } }),
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: "Type", bold: true })] }),
                      new TableCell({ children: [new Paragraph({ text: "Total", bold: true })] }),
                      new TableCell({ children: [new Paragraph({ text: "With Findings", bold: true })] }),
                      new TableCell({ children: [new Paragraph({ text: "No Findings", bold: true })] }),
                    ],
                  }),
                  ...area.stats.map(stat =>
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph(stat.label)] }),
                        new TableCell({ children: [new Paragraph(stat.total.toString())] }),
                        new TableCell({ children: [new Paragraph(stat.withFindings.toString())] }),
                        new TableCell({ children: [new Paragraph(stat.withoutFindings.toString())] }),
                      ],
                    })
                  ),
                ],
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
