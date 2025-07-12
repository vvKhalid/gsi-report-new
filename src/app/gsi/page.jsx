"use client";
import { useState } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun } from "docx";
import { jsPDF } from "jspdf";

export default function GSIReport() {
  const [entries, setEntries] = useState([
    { badge: "", classification: "", date: "", location: "", findings: "", status: "", images: [] }
  ]);

  // لإضافة ملاحظة جديدة
  const addEntry = () => {
    const firstBadge = entries[0]?.badge || "";
    setEntries([
      ...entries,
      {
        badge: firstBadge,
        date: "",
        location: "",
        findings: "",
        status: "",
        classification: "",
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

  // توليد ملف Word
  const generateWord = async () => {
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
                    new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "Inspected Area", color: "FFFFFF", bold: true })], alignment: "center" })] }),
                    new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "Findings/Observations", color: "FFFFFF", bold: true })], alignment: "center" })] }),
                    new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "Attached Photo", color: "FFFFFF", bold: true })], alignment: "center" })] }),
                    new TableCell({ shading: { fill: "4F81BD" }, children: [new Paragraph({ children: [new TextRun({ text: "Status of Finding", color: "FFFFFF", bold: true })], alignment: "center" })] }),
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
                      photoText = `Photo#${start},${end}`;
                    }
                    photoCounter += entry.images.length;
                  } else {
                    photoText = "";
                  }
                  return new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: String(index + 1), alignment: "center" })] }),
                      new TableCell({ children: [new Paragraph({ text: entry.date, alignment: "center" })] }),
                      new TableCell({ children: [new Paragraph({ text: entry.location, alignment: "center" })] }),
                      new TableCell({ children: [new Paragraph({ text: entry.findings, alignment: "center" })] }),
                      new TableCell({ children: [new Paragraph({ text: photoText, alignment: "center" })] }),
                      new TableCell({ children: [new Paragraph({ text: entry.status, alignment: "center" })] }),
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
    saveAs(blob, "GSI_Report.docx");
  };

  // توليد PDF (نفس لاي أوت البوربوينت)
 const generatePDF = async () => {
  const iaLogo = "https://i.imgur.com/yvn568E.png";
  const mnghaLogo = "https://i.imgur.com/r6ipmnF.png";
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // تحميل الشعارات
  const loadImgToBase64 = (url) =>
    new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = "Anonymous";
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = url;
    });
  const iaLogoBase64 = await loadImgToBase64(iaLogo);
  const mnghaLogoBase64 = await loadImgToBase64(mnghaLogo);

  // صفحة الغلاف
  doc.addImage(iaLogoBase64, "PNG", 18, 10, 38, 38);
  doc.addImage(mnghaLogoBase64, "PNG", 242, 10, 38, 38);

  // نص الغلاف
  doc.setTextColor(0,0,0);
  doc.setFontSize(13);
  doc.text("Ministry of National Guard- Health Affairs\nKing Abdulaziz Medical City\nInternal Audit Division\nGeneral Services Inspection", 65, 22);

  doc.setTextColor(183, 28, 28);
  doc.setFontSize(40);
  doc.setFont(undefined, "bold");
  doc.text("Inspection Pics", 148, 90, { align: "center" });

  doc.setTextColor(30, 53, 93);
  doc.setFontSize(26);
  doc.setFont(undefined, "normal");
  doc.text(entries[0]?.date || "(date)", 148, 110, { align: "center" });
  doc.text(entries[0]?.location || "(Location)", 148, 124, { align: "center" });

  // باقي الصفحات: كل observation بصفحة
  let photoNumber = 1;
  for (const entry of entries) {
    if (!entry.images || entry.images.length === 0) continue;

    doc.addPage("a4", "landscape");

    // صور obs
    let imgs = [];
    for (let i = 0; i < entry.images.length; i++) {
      const imgFile = entry.images[i];
      // حول الصورة إلى base64
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(imgFile);
      });
      imgs.push(base64);
    }

    // حدد الإحداثيات حسب كم صورة
    if (imgs.length === 2) {
      // صورتين - جنب بعض
      doc.addImage(imgs[0], "PNG", 35, 40, 100, 75);
      doc.addImage(imgs[1], "PNG", 155, 40, 100, 75);
    } else if (imgs.length === 1) {
      // صورة وحده - بالوسط
      doc.addImage(imgs[0], "PNG", 92, 40, 120, 90);
    }

    // العنوان تحت الصور
    doc.setTextColor(102, 102, 102);
    doc.setFontSize(16);
    let photoText = imgs.length === 2 
      ? `Photos#${photoNumber},${photoNumber + 1} (${entry.location})`
      : `Photo#${photoNumber} (${entry.location})`;
    doc.text(photoText, 148, 130, { align: "center" });

    // التاريخ أسفل الصفحة يمين
    doc.setFontSize(12);
    doc.setTextColor(120, 120, 120);
    doc.text(entry.date || "", 260, 200, { align: "right" });

    photoNumber += imgs.length;
  }

  doc.save("Inspection_Report.pdf");
};



  // ========== الواجهة ==========
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(120deg, #f8fafc 0%, #dbeafe 100%)",
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
          marginBottom: 32
        }}>
          <img src="/ia.png" alt="Logo AI" style={{
            width: 90,
            height: 90,
            borderRadius: "20px",
            boxShadow: "0 3px 10px #0002",
            background: "#fff"
          }} />
          <h1 style={{
            fontWeight: 700,
            fontSize: 36,
            letterSpacing: 1,
            color: "#2563eb",
            margin: 0,
            flex: 1,
            textAlign: "center"
          }}>GSI Internal Audit Report Maker</h1>
          <img src="/mngha.png" alt="Logo MNGHA" style={{
            width: 90,
            height: 90,
            borderRadius: "20px",
            boxShadow: "0 3px 10px #0002",
            background: "#fff"
          }} />
        </div>
        {/* Observations */}
        {entries.map((entry, idx) => (
          <div key={idx} style={{
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 3px 12px #93c5fd44",
            marginBottom: 28,
            padding: 24,
            borderLeft: "6px solid #2563eb"
          }}>
         <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={{ fontWeight: "bold", marginBottom: 4 }}>Date</label>
    <input
      type="date"
      value={entry.date}
      onChange={e => updateEntry(idx, "date", e.target.value)}
      style={inputStyle}
    />
  </div>
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={{ fontWeight: "bold", marginBottom: 4 }}>Location</label>
    <input
      placeholder="Location"
      value={entry.location}
      onChange={e => updateEntry(idx, "location", e.target.value)}
      style={inputStyle}
    />
              <input
                placeholder="Location"
                value={entry.location}
                onChange={e => updateEntry(idx, "location", e.target.value)}
                style={inputStyle}
              />
              <select
                value={entry.status}
                onChange={e => updateEntry(idx, "status", e.target.value)}
                style={{ ...inputStyle, minWidth: 180 }}
              >
                <option value="" disabled>Select status</option>
                <option value="Rectified">Rectified</option>
                <option value="Previously reported / Not Rectified">Previously reported / Not Rectified</option>
                <option value="New">New</option>
              </select>
            </div>
            <textarea
              placeholder="Findings / Observations"
              value={entry.findings}
              onChange={e => updateEntry(idx, "findings", e.target.value)}
              style={{
                ...inputStyle, width: "100%", minHeight: 48, resize: "vertical", marginBottom: 16
              }}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={e => updateImages(idx, e.target.files)}
                  disabled={entry.images && entry.images.length >= 2}
                  style={{ marginBottom: 0 }}
                />
                <span style={{ fontSize: 14, color: "#666", fontWeight: "bold" }}>
                  (Max 2 photos allowed per observation)
                </span>
              </div>
              <div style={{ margin: "16px 0 0 0", display: "flex", alignItems: "center", gap: 12 }}>
                <label htmlFor={`badge-${idx}`} style={{ fontWeight: "bold", color: "#000", fontSize: 16 }}>Badge Number(For Excel Only):</label>
                <input
                  id={`badge-${idx}`}
                  type="number"
                  min="1"
                  placeholder="Enter your badge number"
                  value={entry.badge}
                  onChange={e => updateEntry(idx, "badge", e.target.value)}
                  style={{
                    ...inputStyle,
                    width: 200,
                    fontWeight: "bold"
                  }}
                />
              </div>
              <div style={{ margin: "16px 0 0 0", display: "flex", alignItems: "center", gap: 12 }}>
                <label htmlFor={`classification-${idx}`} style={{ fontWeight: "bold", color: "#000", fontSize: 16 }}>Classification of Finding (For Excel Only):</label>
                <select
                  id={`classification-${idx}`}
                  value={entry.classification}
                  onChange={e => updateEntry(idx, "classification", e.target.value)}
                  style={{ ...inputStyle, width: 360, fontWeight: "bold" }}
                >
                  <option value="">Select classification</option>
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
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {entry.images && entry.images.map((img, i) => (
                  <div key={i} style={{
                    position: "relative",
                    border: "1px solid #e0e7ef",
                    borderRadius: 10,
                    overflow: "hidden"
                  }}>
                    <img src={URL.createObjectURL(img)} alt="" width={90} height={64} style={{ objectFit: "cover" }} />
                    <button onClick={() => removeImage(idx, i)} style={removeBtnStyle}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {/* الأزرار */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 18 }}>
          <button style={mainBtnStyle} onClick={addEntry}>Add Observation</button>
          <button style={mainBtnStyle} onClick={generateWord}>Generate Word Report</button>
          <button style={mainBtnStyle} onClick={generatePDF}>Generate PDF (For Pictures)</button>
        </div>
      </div>
    </div>
  );
}

// تنسيقات الحقول والأزرار
const inputStyle = {
  border: "1.5px solid #60a5fa",
  borderRadius: 10,
  fontSize: 14,
  padding: "10px 12px",
  minWidth: 150,
  background: "#f1f5f9",
  outline: "none",
  color: "#000",
  fontWeight: "bold",
};
const mainBtnStyle = {
  background: "linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)",
  color: "#fff",
  fontWeight: 600,
  border: "none",
  borderRadius: 10,
  fontSize: 17,
  padding: "12px 24px",
  boxShadow: "0 2px 8px #2563eb40",
  cursor: "pointer",
  transition: "background 0.2s",
};
const removeBtnStyle = {
  position: "absolute",
  top: 0,
  right: 0,
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "0 0 0 10px",
  width: 22,
  height: 22,
  fontWeight: "bold",
  cursor: "pointer"
};
