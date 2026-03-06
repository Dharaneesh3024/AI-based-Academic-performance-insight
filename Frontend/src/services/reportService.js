import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateStudentReport = (student) => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    // Add Logo/Header Placeholder
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Accent Primary color
    doc.text("Academic Performance Insight", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${timestamp}`, 14, 28);
    doc.line(14, 32, 196, 32);

    // Student Profile Section
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Student Profile", 14, 45);

    doc.setFontSize(12);
    const profileDetails = [
        ["Name:", student.name],
        ["Roll No:", student.rollNo],
        ["Department:", student.department],
        ["Semester:", student.semester || "N/A"]
    ];

    autoTable(doc, {
        startY: 50,
        body: profileDetails,
        theme: "plain",
        styles: { fontSize: 11, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } }
    });

    // Academic Performance Table
    const academicY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.text("Academic Performance", 14, academicY);

    const tableRows = student.subjects.map((sub) => [
        sub.name,
        `${sub.marks}%`,
        `${sub.attendance}%`
    ]);

    autoTable(doc, {
        startY: academicY + 5,
        head: [["Subject", "Marks", "Attendance"]],
        body: tableRows,
        headStyles: { fillColor: [79, 70, 229] },
        alternateRowStyles: { fillColor: [245, 247, 255] }
    });

    // Summary Statement
    const summaryY = doc.lastAutoTable.finalY + 15;
    const avgMarks = (student.subjects.reduce((acc, s) => acc + s.marks, 0) / student.subjects.length).toFixed(1);
    const avgAtt = (student.subjects.reduce((acc, s) => acc + s.attendance, 0) / student.subjects.length).toFixed(1);

    doc.setFontSize(14);
    doc.text("Performance Summary", 14, summaryY);

    doc.setFontSize(11);
    doc.text(`Average Marks: ${avgMarks}%`, 14, summaryY + 10);
    doc.text(`Overall Attendance: ${avgAtt}%`, 14, summaryY + 18);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Confidential Academic Report - For Faculty Use Only", 14, 285);

    // Save PDF
    doc.save(`Performance_Report_${student.rollNo}.pdf`);
};
