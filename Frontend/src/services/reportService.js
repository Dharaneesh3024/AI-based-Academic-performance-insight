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

    // Technical Skills Section
    if (student.skills && student.skills.length > 0) {
        const skillsY = summaryY + 30;
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text("Technical Skills", 14, skillsY);

        const skillRows = student.skills.map(skill => [skill.name, `${skill.level}%`]);
        autoTable(doc, {
            startY: skillsY + 5,
            head: [["Skill", "Proficiency Level"]],
            body: skillRows,
            headStyles: { fillColor: [16, 185, 129] }, // Success green color
            alternateRowStyles: { fillColor: [240, 253, 244] }
        });
    }

    // Special Support Section
    const hasSpecialSupport = (student.specialSupport?.classes?.length > 0) || (student.specialSupport?.assessments?.length > 0);
    
    if (hasSpecialSupport) {
        // If we're near the bottom, add a new page
        if (doc.lastAutoTable.finalY > 200) {
            doc.addPage();
            var currentY = 20;
        } else {
            var currentY = doc.lastAutoTable.finalY + 15;
        }

        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text("Special Support Tracking", 14, currentY);

        // Additional Classes
        if (student.specialSupport?.classes?.length > 0) {
            doc.setFontSize(13);
            doc.text("Additional Learning Sessions", 14, currentY + 10);
            
            const classRows = student.specialSupport.classes.map(c => [
                new Date(c.dateTime).toLocaleDateString(),
                c.subject,
                c.topic,
                c.attendance.charAt(0).toUpperCase() + c.attendance.slice(1)
            ]);

            autoTable(doc, {
                startY: currentY + 15,
                head: [["Date", "Subject", "Topic", "Status"]],
                body: classRows,
                headStyles: { fillColor: [245, 158, 11] }, // Amber color
                alternateRowStyles: { fillColor: [255, 251, 235] }
            });
            currentY = doc.lastAutoTable.finalY + 10;
        }

        // Special Assessments
        if (student.specialSupport?.assessments?.length > 0) {
            if (currentY > 240) {
                doc.addPage();
                currentY = 20;
            }
            doc.setFontSize(13);
            doc.text("Special Performance Assessments", 14, currentY + 5);

            const assessmentRows = student.specialSupport.assessments.map(a => [
                a.subject,
                a.topic,
                new Date(a.deadline).toLocaleDateString(),
                a.status.charAt(0).toUpperCase() + a.status.slice(1),
                a.score !== undefined ? `${a.score}%` : "N/A"
            ]);

            autoTable(doc, {
                startY: currentY + 10,
                head: [["Subject", "Topic", "Deadline", "Status", "Score"]],
                body: assessmentRows,
                headStyles: { fillColor: [239, 68, 68] }, // Red color
                alternateRowStyles: { fillColor: [254, 242, 242] }
            });
        }
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, 14, 285);
        doc.text("Confidential Academic Report - For Faculty Use Only", 80, 285);
    }

    // Save PDF
    doc.save(`Performance_Report_${student.rollNo}.pdf`);
};
