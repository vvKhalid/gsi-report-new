"use client";
import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun,ImageRun,BorderStyle } from "docx";
import "react-datepicker/dist/react-datepicker.css";
import { uploadReportBlob, uploadImageBlob } from "./lib/storage";
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




export default function GSIReport() {
  const [entries, setEntries] = useState([
    {
      badge: "",
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
// ملف مع الصور الحقيقية (جدولين + ترقيم ثابت)
// ملف مع الصور الحقيقية (Outstanding ثم Rectified) مع ترقيم مستمر
// ملف الصور الحقيقية (Outstanding ثم Rectified) مع ترقيم مستمر ومضمون
const generateWordWithImages = async () => {
  // 1) فرز مستقر حسب التاريخ (الفارغ يروح آخر شيء) مع كسر تعادل بالفهرس الأصلي
  const withIndex = entries.map((e, i) => ({ ...e, _i: i }));
  withIndex.sort((a, b) => {
    const ta = Date.parse(a.date);
    const tb = Date.parse(b.date);
    const va = Number.isNaN(ta) ? Infinity : ta;
    const vb = Number.isNaN(tb) ? Infinity : tb;
    if (va !== vb) return va - vb;
    return a._i - b._i;
  });

  // 2) تقسيم بعد الفرز
  const unresolved = withIndex.filter(e => e.status !== "Rectified");
  const resolved   = withIndex.filter(e => e.status === "Rectified");

  // 3) أرقام تسلسلية ثابتة (مستمرة من الجدول الأول للثاني)
  const unresolvedSeq = unresolved.map((e, i) => ({ ...e, _seq: i + 1 }));
  const resolvedSeq   = resolved.map((e, i) => ({ ...e, _seq: unresolvedSeq.length + i + 1 }));

  // 4) مُنشئ الجدول
  const buildTable = async (data) => {
    const header = new TableRow({
      height: { value: 500, rule: "atLeast" },
      children: [
        new TableCell({
          width: { size: 8, type: "pct" },
          shading: { fill: "4F81BD" },
          verticalAlign: "center",
          children: [ new Paragraph({
            alignment: "center",
            children: [ new TextRun({ text: "No.", color: "FFFFFF", bold: true, font: "Times New Roman", size: 16 }) ]
          }) ]
        }),
        new TableCell({
          width: { size: 22, type: "pct" },
          shading: { fill: "4F81BD" },
          verticalAlign: "center",
          children: [ new Paragraph({
            alignment: "center",
            children: [ new TextRun({ text: "Exact Location", color: "FFFFFF", bold: true, font: "Times New Roman", size: 16 }) ]
          }) ]
        }),
        new TableCell({
          width: { size: 70, type: "pct" },
          shading: { fill: "4F81BD" },
          verticalAlign: "center",
          children: [ new Paragraph({
            alignment: "center",
            children: [ new TextRun({ text: "Attached Photo", color: "FFFFFF", bold: true, font: "Times New Roman", size: 16 }) ]
          }) ]
        }),
      ],
    });

    const rows = await Promise.all(
      data.map(async (entry) => {
        const imageParagraphs = [];

        if (entry.images && entry.images.length > 0) {
          for (const imgFile of entry.images) {
            const imgBase64 = await new Promise(resolve => {
              const reader = new FileReader();
              reader.onload = e => resolve(e.target.result.split(",")[1]);
              reader.readAsDataURL(imgFile);
            });
            imageParagraphs.push(
              new Paragraph({
                alignment: "center",
                children: [
                  new ImageRun({
                    data: Uint8Array.from(atob(imgBase64), c => c.charCodeAt(0)),
                    transformation: { width: 540, height: 300 }
                  })
                ]
              })
            );
          }
        } else {
          // ✅ لو ما فيه صور يكتب N/A
          imageParagraphs.push(
            new Paragraph({
              alignment: "center",
              children: [
                new TextRun({ text: "N/A", bold: true, font: "Times New Roman", size: 20 })
              ]
            })
          );
        }

        return new TableRow({
          children: [
            new TableCell({
              width: { size: 8, type: "pct" },
              verticalAlign: "center",
              children: [ new Paragraph({ alignment: "center", children: [ new TextRun(String(entry._seq)) ] }) ]
            }),
            new TableCell({
              width: { size: 22, type: "pct" },
              verticalAlign: "center",
              children: [ new Paragraph({ alignment: "center", children: [ new TextRun(entry.exactLocation || "—") ] }) ]
            }),
            new TableCell({
              width: { size: 70, type: "pct" },
              verticalAlign: "center",
              children: imageParagraphs
            }),
          ]
        });
      })
    );

    return [header, ...rows];
  };

  const unresolvedRows = await buildTable(unresolvedSeq);
  const resolvedRows   = await buildTable(resolvedSeq);

  // 5) رأس الصفحة
  const locationPara = new Paragraph({
    children: [ new TextRun({ text: `Location: ${entries[0]?.sideLocation || ""}`, bold: true, size: 28, color: "2563eb" }) ],
    spacing: { after: 50 },
  });
  const datePara = new Paragraph({
    children: [ new TextRun({ text: `Date: ${new Date().toLocaleDateString("en-US")}`, bold: true, size: 26, color: "2563eb" }) ],
    spacing: { after: 120 },
  });

  // 6) بناء المستند
  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 400, right: 400, bottom: 400, left: 400 } } },
      children: [
        locationPara,
        datePara,
        new Paragraph({
          children: [ new TextRun({ text: "Outstanding Observations:", font: "Times New Roman", bold: true, size: 20 }) ],
          spacing: { after: 200 }
        }),
        new Table({ rows: unresolvedRows, width: { size: 100, type: "pct" } }),
        new Paragraph(""),

        new Paragraph({
          children: [ new TextRun({ text: "Rectified Observations:", font: "Times New Roman", bold: true, size: 20 }) ],
          spacing: { after: 200 }
        }),
        new Table({ rows: resolvedRows, width: { size: 100, type: "pct" } }),
        new Paragraph(""),
      ]
    }]
  });

  // 7) حفظ الملف
  const blob = await Packer.toBlob(doc);
  const badge = entries[0]?.badge || "UnknownBadge";
  const assignedLocation = entries[0]?.sideLocation || "UnknownLocation";
  const exactLocation = entries[0]?.exactLocation || "UnknownExactLocation";
  const dateString = new Date().toISOString().slice(0, 10);
  const filename = `PhotosReport ${assignedLocation} ${exactLocation} ${badge} ${dateString}.docx`;

  saveAs(blob, filename);
  localStorage.removeItem("gsi_entries");
  localStorage.removeItem("gsi_badge");
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
 
  return `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString("en-US", { month: "long" })} ${d.getFullYear()} - ${hours}:${minutes} ${ampm}`;
}



const generateWordPhotoNumbers = async () => {

  // 2️⃣ تقسيم الملاحظات
  const unresolved = entries.filter(e => e.status !== "Rectified");
  const resolved   = entries.filter(e => e.status === "Rectified");

  // 3️⃣ دوال مساعدة
  const buildTable = (data, startRowNumber, startPhotoCounter) => {
    let rowNumber = startRowNumber;
    let photoCounter = startPhotoCounter;

    const header = new TableRow({
      children: [
        "No.","Date / Time","Exact Location","Description of Observation",
        "Attached Photo","Status of Finding","Risk/Priority"
      ].map(h => new TableCell({
        shading: { fill: "4F81BD" },
        children: [ new Paragraph({
          children: [ new TextRun({ text: h, bold: true, color: "FFFFFF", font: "Times New Roman", size: 18 }) ],
          alignment: "center"
        }) ]
      }))
    });

    const rows = data.map(e => {
      let photoText = "";

      // ✅ هنا التعديل الرئيسي:
      if (e.images && e.images.length > 0) {
        // فيه صور → نكتب Attached فقط
        photoText = "Attached";
      } else {
        // ما فيه صور → نكتب N/A
        photoText = "N/A";
      }

      return new TableRow({
        children: [
          String(rowNumber++),
          formatDateTime(e.date),
          e.exactLocation || "—",
          e.findings || "—",
          photoText,
          e.status || "—",
          e.risk || "—"
        ].map(val => new TableCell({
          children: [
            new Paragraph({
              alignment: "center",
              children: [ new TextRun({ text: String(val), font: "Times New Roman", size: 18 }) ]
            })
          ]
        }))
      });
    });

    return { rows: [header, ...rows], lastRow: rowNumber, lastPhoto: photoCounter };
  };

  // 4️⃣ بناء الجدولين
  const unresolvedTable = buildTable(unresolved, 1, 1);
  const resolvedTable   = buildTable(resolved, unresolvedTable.lastRow, unresolvedTable.lastPhoto);

  // 5️⃣ إنشاء المستند
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: 'We would like to bring to your kind attention the following observations noted by our representative from the General Services Inspection during the above-mentioned period;',
              font: "Times New Roman",
              size: 18
            })
          ]
        }),
        new Paragraph(''),
        new Table({ rows: unresolvedTable.rows, width: { size: 100, type: 'pct' } }),
        new Paragraph(''),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Also, we would like to express our thanks and appreciation for the response and rectification of the following observations noted in the recent rounds;',
              font: "Times New Roman",
              size: 18
            })
          ]
        }),
        new Paragraph(''),
        new Table({ rows: resolvedTable.rows, width: { size: 100, type: 'pct' } }),
        new Paragraph(''),
        new Paragraph({
          children: [ new TextRun({ text: 'Please see the attached inspection photos for your easy reference.', font: "Times New Roman", size: 18 }) ]
        }),
        new Paragraph({
          children: [ new TextRun({ text: 'We would appreciate your feedback on action/s taken regarding the unsolved observations within five (05) business days of receiving this memorandum.', font: "Times New Roman", size: 18 }) ]
        }),
        new Paragraph({
          children: [ new TextRun({ text: 'Thank you for your usual cooperation.', font: "Times New Roman", size: 18 }) ]
        }),
        new Paragraph({
          children: [ new TextRun({ text: 'Best Regards.', font: "Times New Roman", size: 18 }) ]
        }),
      ]
    }]
  });

  // 6️⃣ حفظ الملف
  const blob = await Packer.toBlob(doc);
  const badge = entries[0]?.badge || "UnknownBadge";
  const assignedLocation = entries[0]?.sideLocation || "UnknownLocation";
  const exactLocation = entries[0]?.exactLocation || "UnknownExactLocation";
  const today = new Date();
  const dateString = today.toISOString().slice(0,10);

  const filename = `Report ${assignedLocation} ${exactLocation} ${badge} ${dateString}.docx`;


  saveAs(blob, filename);

  localStorage.removeItem("gsi_entries");
  localStorage.removeItem("gsi_badge");
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
   backgroundImage: "linear-gradient(120deg, #2563eb 0%, #280055ff 80%)",
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
  color: "#0008", 
  textShadow: "0 2px 16px #070255ff, 0 1px 0 #0008", // ظل أزرق غامق + أسود خفيف يوضح الحروف
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
    
  
        {/* user name and subject*/}
 <div style={{ flex: 1, textAlign: "center", alignSelf: "center" }}>

<div style={{
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
  justifyContent: "center",
  marginTop: 16,
}}>


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
      {/* obs number*/}
    <div style={{
      position: "absolute",
      top: -12,
      left: 16,
      background: "#2563eb",
      color: "#fff",
      borderRadius: "8px",
      padding: "4px 10px",
      fontSize: 14,
      fontWeight: "bold",
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
    }}>
      #{idx + 1}
    </div>
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
          <option value="Moderate">Moderate</option>
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
  
</div>
</div>


    {/* Row 5: Badge Number and Image Previews */}
    <div style={{ 
      display: "flex", 
      flexDirection: isMobile ? "column" : "row", 
      gap: 16, 
      alignItems: isMobile ? "stretch" : "flex-start" 
    }}>
  


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
          <button style={mainBtnStyle} onClick={generateWordPhotoNumbers}>Word (E-CTS)</button>
          <button style={mainBtnStyle} onClick={generateWordWithImages}>Word (Photos)</button>
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
     
      </div>


    </div>
  );
}
