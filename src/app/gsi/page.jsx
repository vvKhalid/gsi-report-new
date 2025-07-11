"use client";

import { useState } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun } from "docx";
const XLSX = require("xlsx");



export default function GSIReport() {
  const [entries, setEntries] = useState([
    { badge: "", classification:"", date: "", location: "", findings: "", status: "", images: [] },
    
  ]);
 const addEntry = () => {
  const firstBadge = entries[0]?.badge || "";
  setEntries([
    ...entries,
    {
      badge: firstBadge,  // Auto-fill from first entry
      date: "",
      location: "",
      findings: "",
      status: "",
      classification: "",
      images: []
    }
  ]);
};

const exportToExcel = () => {
  const wsData = [
    ["Badge Number", "Date/Time", "Location", "Findings/Observations", "Status", "Classification"],

    ...entries.map(entry => [
      entry.badge,
      entry.date,
      entry.location,
      entry.findings,
      entry.status,
      entry.classification,
    ])
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set custom column widths (order matches above)
  ws['!cols'] = [
    { wch: 18 }, // Badge Number
    { wch: 16 }, // Date/Time
    { wch: 22 }, // Location
    { wch: 60 }, // Findings/Observations
    { wch: 18 }, // Status
    { wch: 35 }  // Classification
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Observations");
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(data, "GSI_Observations.xlsx");
};

  const updateEntry = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    setEntries(newEntries);
  };

const updateImages = (index, files) => {
  const newEntries = [...entries];
  const existingImages = newEntries[index].images || [];
  const selectedImages = Array.from(files);
  const images = [...existingImages, ...selectedImages].slice(0, 2); // never more than 2
  newEntries[index].images = images;
  setEntries(newEntries);
};

  const removeImage = (entryIndex, imageIndex) => {
    const newEntries = [...entries];
    newEntries[entryIndex].images.splice(imageIndex, 1);
    setEntries(newEntries);
  };

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
      new TableCell({ shading: { fill: "4F81BD" }, children: [
        new Paragraph({
          children: [new TextRun({ text: "No.", color: "FFFFFF", bold: true })],
          alignment: "center"
        })
      ] }),
      new TableCell({ shading: { fill: "4F81BD" }, children: [
        new Paragraph({
          children: [new TextRun({ text: "Date/time", color: "FFFFFF", bold: true })],
          alignment: "center"
        })
      ] }),
      new TableCell({ shading: { fill: "4F81BD" }, children: [
        new Paragraph({
          children: [new TextRun({ text: "Inspected Area", color: "FFFFFF", bold: true })],
          alignment: "center"
        })
      ] }),
      new TableCell({ shading: { fill: "4F81BD" }, children: [
        new Paragraph({
          children: [new TextRun({ text: "Findings/Observations", color: "FFFFFF", bold: true })],
          alignment: "center"
        })
      ] }),
      new TableCell({ shading: { fill: "4F81BD" }, children: [
        new Paragraph({
          children: [new TextRun({ text: "Attached Photo", color: "FFFFFF", bold: true })],
          alignment: "center"
        })
      ] }),
      new TableCell({ shading: { fill: "4F81BD" }, children: [
        new Paragraph({
          children: [new TextRun({ text: "Status of Finding", color: "FFFFFF", bold: true })],
          alignment: "center"
        })
      ] }),
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
                    new TableCell({ children: [new Paragraph({ text: String(index + 1), alignment: "center" })] }),new TableCell({ children: [new Paragraph({ text: entry.date, alignment: "center" })] }),new TableCell({ children: [new Paragraph({ text: entry.location, alignment: "center" })] }),new TableCell({ children: [new Paragraph({ text: entry.findings, alignment: "center" })] }),new TableCell({ children: [new Paragraph({ text: photoText, alignment: "center" })] }),new TableCell({ children: [new Paragraph({ text: entry.status, alignment: "center" })] }),

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
          {/* Left Logo */}
          <img src="/ia.png" alt="Logo AI" style={{
            width: 90,
            height: 90,
            borderRadius: "20px",
            boxShadow: "0 3px 10px #0002",
            background: "#fff"
          }} />

          {/* Title */}
          <h1 style={{
            fontWeight: 700,
            fontSize: 36,
            letterSpacing: 1,
            color: "#2563eb",
            margin: 0,
            flex: 1,
            textAlign: "center"
          }}>GSI Internal Audit Report Maker</h1>

          {/* Right Logo */}
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
              <input
                type="date"
                value={entry.date}
                onChange={e => updateEntry(idx, "date", e.target.value)}
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
              {/* FILE INPUT + NOTE */}
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

             {/* Badge Number For excel only */}
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

              {/* Classification of Finding */}
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

              {/* SHOW IMAGES */}
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

        {/* Buttons */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 18 }}>
          <button style={mainBtnStyle} onClick={addEntry}>Add Observation</button>
          <button style={mainBtnStyle} onClick={generateWord}>Generate Word Report</button>
          <button style={mainBtnStyle} onClick={exportToExcel}>Export to Excel</button>
        </div>
      </div>
    </div>
  );
}

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

