"use client";
import { useState } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, ImageRun } from "docx";
  import { useEffect } from "react"; // تأكد أنه مضاف فوق


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

// ====== البادجات ======
const badgeUsers = {
  "53075": "Hanan Al Shuwaier",
  "51888": "Bander Al Zakari",
  "55723": "Haitham Al Mughamis",
  "56392": "Nasser Abu Haime",
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
    "Cardiac Center"
  ],
  "Primary Health Care": [
    "AL Yarmouk PHC",
    "HCSC PHC",
    "NGCSC PHC",
    "Dirab PHC",
    "Prince Bader PHC",
    "King Khalid PHC",
    "AL Qadessiah PHC"
  ],
  "External Buildings/Areas": [
    "Dental Building",
    "Surgical Tower",
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
    classification: "", 
    date: "", 
    location: "", 
    mainLocation: "",
    sideLocation: "",
    exactLocation: "",
    findings: "", 
    status: "", 
    risk: "", 
    images: [] 
  }
]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [badgeInput, setBadgeInput] = useState("");
  const [userName, setUserName] = useState("");
  const [showStats, setShowStats] = useState(false);


useEffect(() => {
  const savedBadge = localStorage.getItem("gsi_badge");
  const savedEntries = localStorage.getItem("gsi_entries");
  if (savedBadge && savedEntries) {
    setBadgeInput(savedBadge);
    setEntries(JSON.parse(savedEntries));
    // تقدر تسوي setLoggedIn(true); إذا تبي يدخل تلقائي
  }
}, []);

  const saveForLater = () => {
  localStorage.setItem("gsi_entries", JSON.stringify(entries));
  localStorage.setItem("gsi_badge", badgeInput || entries[0]?.badge || "");
alert("Saved. You can continue later by entering your badge number.");
};


const WEB_APP_URL =  'https://script.google.com/macros/s/AKfycbzw35Q7FYxLKz0w3KTCy-9-TcXLB-XZCFqkkkeaqa3L1mFOzzpr66gOskP7-C2Fu5qB/exec'; // استبدل هذا بالرابط الفعلي


fetch('URL_HERE', {
  method: 'POST',
  mode: 'no-cors', // مهم لتخطي مشكلة CORS
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    data: 'محتوى البيانات'
  })
}).then(response => {
  console.log('Data sent successfully:', response);
}).catch(error => {
  console.error('Error sending data:', error);
});



  // لإضافة ملاحظة جديدة
const addEntry = () => {
  const last = entries[entries.length - 1] || {};
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
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "No.", color: "FFFFFF", bold: true })], alignment: "center" })] }),
          new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "Date/time", color: "FFFFFF", bold: true })], alignment: "center" })] }),
    new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "Assigned Inspection Location", color: "FFFFFF", bold: true })], alignment: "center" })] }),
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
            new TableCell({ children: [new Paragraph({ text: entry.date, alignment: "center" })] }),
    new TableCell({ children: [new Paragraph({ text: entry.sideLocation || "—", alignment: "center" })] }),
    new TableCell({ children: [new Paragraph({ text: entry.exactLocation || "—", alignment: "center" })] }),
            new TableCell({ children: [new Paragraph({ text: entry.findings, alignment: "center" })] }),
            new TableCell({ children: imageParagraphs }),
          ],
        });
      })))
    ];
    const doc = new Document({
      sections: [
        {
          children: [
            // أول سطرين: التاريخ والوكيشن (تأخذ من أول entry أو حسب اللي تبي)
        new Paragraph({
          children: [
            new TextRun({ text: `Location: ${entries[0]?.mainLocation || ""}${entries[0]?.sideLocation ? " - " + entries[0]?.sideLocation : ""}` }),
          ],
          spacing: { after: 120 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Date: ${entries[0]?.date || ""}` }),
          ],
          spacing: { after: 240 }
        }),
        // الجدول مباشرة
        new Table({
          rows: tableRows,
          width: { size: 100, type: "pct" }
          }),
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "GSI_Report_withPhotos.docx");
  };

  // ملف أرقام الصور فقط
  const generateWordPhotoNumbers = async () => {
    let photoCounter = 1;
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph("We would like to bring to your kind attention the below observations noted by our representative from the General Services Inspection during the above-mentioned period;"),
            new Paragraph(" "),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "No.", color: "FFFFFF", bold: true })], alignment: "center" })] }),
                    new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "Date/time", color: "FFFFFF", bold: true })], alignment: "center" })] }),
                        new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "Location", color: "FFFFFF", bold: true })], alignment: "center" })] }),
    new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "Assigned Inspection Location", color: "FFFFFF", bold: true })], alignment: "center" })] }),
    new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "Exact Location", color: "FFFFFF", bold: true })], alignment: "center" })] }),
                    new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "Description of Observation", color: "FFFFFF", bold: true })], alignment: "center" })] }),
                    new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "Attached Photo", color: "FFFFFF", bold: true })], alignment: "center" })] }),
                    new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "Status of Finding", color: "FFFFFF", bold: true })], alignment: "center" })] }),
                    new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "Risk/Priority", color: "FFFFFF", bold: true })], alignment: "center" })] }),
                  ],
                }),
                ...entries.map((entry, index) => {
                  let photoText = "";
                  if (entry.images && entry.images.length > 0) {
                    const start = photoCounter;
                    const end = photoCounter + entry.images.length - 1;
                    if (entry.images.length === 1) {
                      photoText = `Photo#${start}`;
                    } else {
                      photoText = `Photos#${start},${end}`;
                    }
                    photoCounter += entry.images.length;
                  } else {
                    photoText = "";
                  }
                  return new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: String(index + 1), alignment: "center" })] }),
                      new TableCell({ children: [new Paragraph({ text: entry.date, alignment: "center" })] }),
                         new TableCell({ children: [new Paragraph({ text: entry.mainLocation || "—", alignment: "center" })] }),
    new TableCell({ children: [new Paragraph({ text: entry.sideLocation || "—", alignment: "center" })] }),
    new TableCell({ children: [new Paragraph({ text: entry.exactLocation || "—", alignment: "center" })] }),
                      new TableCell({ children: [new Paragraph({ text: entry.findings, alignment: "center" })] }),
                      new TableCell({ children: [new Paragraph({ text: photoText, alignment: "center" })] }),
                      new TableCell({ children: [new Paragraph({ text: entry.status, alignment: "center" })] }),
                      new TableCell({ children: [new Paragraph({ text: entry.risk, alignment: "center" })] }),
                    ],
                  });
                }),
              ],
            }),
            new Paragraph(" "),
            new Paragraph("Kindly see the inspection photos attached for your easy reference."),
            new Paragraph("We would appreciate your feedback on action/s taken regarding the above observations within five (05) days of receiving this memorandum."),
            new Paragraph("Thank you for your usual cooperation."),
            new Paragraph("Best Regards."),
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "GSI_Report_PhotoNumbers.docx");
    entries.forEach(entry => sendToSheet(entry));
localStorage.removeItem("gsiReport_" + badgeInput.trim());
alert("Word file created. Saved data has been deleted.");

  };

  // شاشة تسجيل الدخول
  if (!loggedIn) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#000000ff" }}>
        <h2>Enter your Badge Number</h2>
        <input
          type="text"
          placeholder="Badge Number"
          value={badgeInput}
          onChange={e => setBadgeInput(e.target.value)}
          style={{ padding: 12, fontSize: 18, borderRadius: 8, marginBottom: 16, border: "1px solid #2563ebff" }}
        />
        <button
          style={mainBtnStyle}
         onClick={() => {
  if (badgeUsers[badgeInput.trim()]) {
    setLoggedIn(true);
    setUserName(badgeUsers[badgeInput.trim()]);
    // جلب البيانات المحفوظة إذا فيه بيانات محفوظة بنفس البادج
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
  }
}}

        >
          Enter
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(120deg, #011224ff 0%, #ffffffff 100%)",
      fontFamily: "Segoe UI, Arial, sans-serif",
      padding: 0,
      margin: 0,
    }}>
      <div style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "40px 10px"
      }}>
        {/* Two Logos & Title */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24
        }}>
          <img src="/ia.png" alt="Logo AI" style={{
            width: 68, height: 68, borderRadius: "14px", boxShadow: "0 3px 10px #0002", background: "#fff"
          }} />
          <div style={{ textAlign: "center", flex: 1 }}>
            <h1 style={{
              fontWeight: 700,
              fontSize: 32,
              letterSpacing: 1,
              color: "#2563eb",
              margin: 0,
            }}>GSI</h1>
            {userName && (
              <div style={{
                textAlign: "center",
                marginTop: 4,
                marginBottom: 8,
                fontSize: 18,
                color: "#0b2148",
                fontWeight: "bold"
              }}>
                {userName}
              </div>
            )}
          </div>
          <img src="/mngha.png" alt="Logo MNGHA" style={{
            width: 68, height: 68, borderRadius: "14px", boxShadow: "0 3px 10px #0002", background: "#fff"
          }} />
        </div>
        {/* Observations */}
        {entries.map((entry, idx) => (
          <div key={idx} style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 3px 10px #93c5fd44",
            marginBottom: 24,
            padding: 18,
            borderLeft: "6px solid #2563eb"
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
            <div style={{ marginBottom: 12 }}>
  <label
    htmlFor={`date-${idx}`}
    style={{
      fontWeight: "bold",
      fontSize: 16,
      color: "#2563eb",
      display: "block",
      marginBottom: 6,
    }}
  >
    Date
  </label>
  <input
    id={`date-${idx}`}
    type="date"
    value={entry.date}
    onChange={e => updateEntry(idx, "date", e.target.value)}
    style={inputStyle}
  />
</div>

{/* Location Dropdowns */}
<div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
  <div>
    <label
      htmlFor={`main-location-${idx}`}
      style={{
        fontWeight: "bold",
        fontSize: 16,
        color: "#2563eb",
        display: "block",
        marginBottom: 6,
      }}
    >
      Location
    </label>
    <select
      id={`main-location-${idx}`}
      value={entry.mainLocation || ""}
      onChange={e => {
        updateEntry(idx, "mainLocation", e.target.value);
        updateEntry(idx, "sideLocation", "");
        if (!LOCATIONS[e.target.value] || LOCATIONS[e.target.value].length === 0) {
          updateEntry(idx, "location", e.target.value);
        } else {
          updateEntry(idx, "location", "");
        }
      }}
      style={{ ...inputStyle, minWidth: 180 }}
    >
      <option value="">Select Location</option>
      {Object.keys(LOCATIONS).map(main => (
        <option key={main} value={main}>{main}</option>
      ))}
    </select>
  </div>
  {LOCATIONS[entry.mainLocation] && LOCATIONS[entry.mainLocation].length > 0 && (
    <div>
      <label
        htmlFor={`side-location-${idx}`}
        style={{
          fontWeight: "bold",
          fontSize: 16,
          color: "#2563eb",
          display: "block",
          marginBottom: 6,
        }}
      >
        Assigned Inspection Location
      </label>
      <select
        id={`side-location-${idx}`}
        value={entry.sideLocation || ""}
        onChange={e => {
          updateEntry(idx, "sideLocation", e.target.value);
          updateEntry(idx, "location", `${entry.mainLocation} - ${e.target.value}`);
        }}
        style={{ ...inputStyle, minWidth: 200 }}
      >
        <option value="">Select Assigned Inspection Location</option>
        {LOCATIONS[entry.mainLocation].map(side => (
          <option key={side} value={side}>{side}</option>
        ))}
      </select>
    </div>
  )}
</div>
<div style={{ marginBottom: 12 }}>
  <label
    htmlFor={`exact-location-${idx}`}
    style={{
      fontWeight: "bold",
      fontSize: 16,
      color: "#2563eb",
      display: "block",
      marginBottom: 6,
    }}
  >
    Exact Location
  </label>
  <input
    id={`exact-location-${idx}`}
    placeholder="Enter the exact location (e.g., Room 101, Main Hall, etc.)"
    value={entry.exactLocation || ""}
    onChange={e => updateEntry(idx, "exactLocation", e.target.value)}
    style={inputStyle}
  />
</div>

           <div style={{ marginBottom: 12 }}>
  <label
    htmlFor={`status-${idx}`}
    style={{
      fontWeight: "bold",
      fontSize: 16,
      color: "#2563eb",
      display: "block",
      marginBottom: 6,
    }}
  >
    Status
  </label>
  <select
    id={`status-${idx}`}
    value={entry.status}
    onChange={e => updateEntry(idx, "status", e.target.value)}
    style={{ ...inputStyle, minWidth: 140 }}
  >
    <option value="" disabled>Select status</option>
    <option value="Rectified">Rectified</option>
    <option value="Previously reported / Not Rectified">Previously reported / Not Rectified</option>
    <option value="New">New</option>
  </select>
</div>

             <div style={{ marginBottom: 12 }}>
  <label
    htmlFor={`risk-${idx}`}
    style={{
      fontWeight: "bold",
      fontSize: 16,
      color: "#2563eb", // لون أحمر واضح
      display: "block",
      marginBottom: 6,
    }}
  >
    Risk / Priority
  </label>
  <select
    id={`risk-${idx}`}
    value={entry.risk}
    onChange={e => updateEntry(idx, "risk", e.target.value)}
    style={{ ...inputStyle, minWidth: 140 }}
  >
    <option value="">Risk/Priority</option>
    <option value="High">High</option>
    <option value="Medium">Medium</option>
    <option value="Low">Low</option>
  </select>
</div>

          <div style={{ marginBottom: 12 }}>
  <label
    htmlFor={`findings-${idx}`}
    style={{
      fontWeight: "bold",
      fontSize: 16,
      color: "#2563eb",
      display: "block",
      marginBottom: 5,
    }}
  >
    Description of Observation
  </label>
  <textarea
    id={`findings-${idx}`}
    placeholder="Enter The Description of The Observation"
    value={entry.findings}
    onChange={e => updateEntry(idx, "findings", e.target.value)}
    style={{
      ...inputStyle,
      width: "100%",
      minHeight: 44,
      resize: "vertical",
      marginBottom: 12,
    }}
  />
</div>

             <div style={{ marginBottom: 12 }}>
 <label
  htmlFor={`image-upload-${idx}`}
  style={{
    fontWeight: "bold",
    fontSize: 16,
    color: "#2563eb",
    display: "block",
    marginBottom: 4,
  }}
>
  Attach Photos (2 Max)
</label>

  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
    <input
      id={`image-upload-${idx}`}
      type="file"
      multiple
      accept="image/*"
      onChange={e => updateImages(idx, e.target.files)}
      disabled={entry.images && entry.images.length >= 2}
      style={{ marginBottom: 0 }}
    />
    <span style={{ fontSize: 13, color: "#666", fontWeight: "bold" }}>
      
    </span>
  </div>
</div>
 <label htmlFor={`classification-${idx}`} style={{ fontWeight: "bold", color: "#2563eb", fontSize: 16, marginLeft: 2 }}>Classification:</label>
                <select
                  id={`classification-${idx}`}
                  value={entry.classification}
                  onChange={e => updateEntry(idx, "classification", e.target.value)}
                  style={{ ...inputStyle, width: 150, fontWeight: "bold" }}
                >
                  <option value="">Classification</option>
                  <option value="Building Structures and Appearance">Building Structures and Appearance</option>
                  <option value="Facility Maintenance (e.g., Electrical plumbing drainage issue)">Facility Maintenance (e.g., Electrical plumbing drainage issue)</option>
                  <option value="Safety & Security measures in internal and external areas">Safety & Security measures in internal and external areas</option>
                  <option value="Support Services (e.g., Environmental /Housekeeping)">Support Services (e.g., Environmental /Housekeeping)</option>
                  <option value="Availability, Attitude and attentiveness of service providers">Availability, Attitude and attentiveness of service providers</option>
                  <option value="Concerns raised by staff at any inspected location">Concerns raised by staff at any inspected location</option>
                  <option value="Unsolved patients Issues during the time of inspection">Unsolved patients Issues during the time of inspection</option>
                  <option value="Policy Compliance (general policies such as non-smoking and dress code-wearing badges)">Policy Compliance (general policies such as non-smoking and dress code-wearing badges)</option>
                  <option value="Space utilization">Space utilization</option>
                  <option value="property condition">property condition</option>
                  <option value="any other Operational deficiencies/ Obstacles">any other Operational deficiencies/ Obstacles</option>
                </select>
              <div style={{ margin: "10px 0 0 0", display: "flex", alignItems: "center", gap: 10 }}>
                <label htmlFor={`badge-${idx}`} style={{ fontWeight: "bold", color: "#2563eb", fontSize: 16 }}>Badge Number:</label>
                <input
                  id={`badge-${idx}`}
                  type="number"
                  min="1"
                  placeholder="Badge number"
                  value={entry.badge}
                  onChange={e => updateEntry(idx, "badge", e.target.value)}
                  style={{
                    ...inputStyle,
                    width: 110,
                    fontWeight: "bold"
                  }}
                />
               
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 10 }}>
                {entry.images && entry.images.map((img, i) => (
                  <div key={i} style={{
                    position: "relative",
                    border: "1px solid #e0e7ef",
                    borderRadius: 9,
                    overflow: "hidden"
                  }}>
                    <img src={URL.createObjectURL(img)} alt="" width={64} height={48} style={{ objectFit: "cover" }} />
                    <button onClick={() => removeImage(idx, i)} style={removeBtnStyle}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {/* الأزرار */}
        <div style={{ display: "flex", gap: 13, justifyContent: "center", marginTop: 15, flexWrap: "wrap" }}>
          <button style={mainBtnStyle} onClick={addEntry}>Add Observation</button>
          <button style={mainBtnStyle} onClick={generateWordPhotoNumbers}>Word </button>
          <button style={mainBtnStyle} onClick={generateWordWithImages}>Word (with Photos)</button>
          <button style={mainBtnStyle} onClick={() => setShowStats(true)}>Show Statistics</button>
          <button style={mainBtnStyle} onClick={saveForLater}>
  Save for later
</button>

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
        <h2 style={{ color: "#2563eb", textAlign: "center", marginBottom: 8 }}>Areas Statistics</h2>
        {/* إضافة منطقة جديدة */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
        <input
  type="text"
  placeholder="Enter area/location name"
  value={currentName}
  onChange={e => setCurrentName(e.target.value)}
  style={{
    padding: 6,
    fontSize: 15,
    borderRadius: 8,
    border: "1.5px solid #2563eb",
    minWidth: 170,
    background: "#fff",    // خلي الخلفية بيضاء أو اللي تفضله
    color: "#2563eb",      // لون النص نفس لون البوردر (أزرق)
    fontWeight: "bold",
    outline: "none"
  }}
          />
          <button
            onClick={addArea}
            style={{
              background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, padding: "8px 14px", fontWeight: 600, cursor: "pointer"
            }}
          >
            Add Area
          </button>
        </div>
        {/* قائمة الأماكن والإحصائيات */}
        <div style={{ maxHeight: 1000, overflow: "auto" }}>
        {areas.map((area, areaIdx) => (
          area.name.trim() &&
          <div key={areaIdx} style={{
            background: "#f3f7ff",
            borderRadius: 11,
            boxShadow: "0 2px 12px #60a5fa14",
            padding: 1,
            marginBottom: 18,
            borderLeft: "6px solid #2563eb"
          }}>
            <h3 style={{ margin: 0, color: "#2563eb", fontSize: 17 }}>{area.name}</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 9, marginBottom: 2 }}>
              <thead>
                <tr style={{ background: "#dbeafe", color: "#1e293b" }}>
                  <th style={cellStyle}>Type</th>
                  <th style={cellStyle}>Total</th>
                  <th style={cellStyle}>With Findings</th>
                  <th style={cellStyle}>No Findings</th>
                </tr>
              </thead>
              <tbody>
                {area.stats.map(stat => (
                  <tr key={stat.key}>
                  <td style={{ ...cellStyle, color: "#2563eb", fontWeight: "bold" }}>{stat.label}</td>
<td style={cellStyle}>

                      <input type="number" min={0} value={stat.total} onChange={e => updateStat(areaIdx, stat.key, "total", e.target.value)} style={inputStyle} />
                    </td>
                    <td style={cellStyle}>
                      <input type="number" min={0} value={stat.withFindings} onChange={e => updateStat(areaIdx, stat.key, "withFindings", e.target.value)} style={inputStyle} />
                    </td>
                    <td style={cellStyle}>
                      <input type="number" min={0} value={stat.withoutFindings} onChange={e => updateStat(areaIdx, stat.key, "withoutFindings", e.target.value)} style={inputStyle} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 10, display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={generateStatsWord} style={mainBtnStyle}>
            Download Statistics Word
          </button>
          <button style={{ ...mainBtnStyle, background: "#e11d48" }} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
