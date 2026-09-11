/**
 * CampusHub File Downloader Utility
 * Provides client-side document and file generation with direct browser download triggers.
 */

export interface MaterialDownloadInfo {
  id?: string;
  title: string;
  subject: string;
  type?: string;
  size?: string;
  uploadedDate?: string;
  author?: string;
}

export interface NoticeDownloadInfo {
  id?: string;
  title: string;
  attachmentName: string;
  department?: string;
  date?: string;
  priority?: string;
  content?: string;
}

export interface TransportPassInfo {
  studentName: string;
  rollNumber: string;
  course: string;
  route: string;
  stop: string;
  busNumber: string;
  passId: string;
  validUntil: string;
}

/**
 * Universal browser file trigger using Blob and Object URLs
 */
export const downloadFile = (
  filename: string,
  content: string,
  mimeType: string = 'text/plain;charset=utf-8'
): void => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('File download failed:', err);
  }
};

/**
 * Generate and download formatted study material / lecture notes (.md / .txt)
 */
export const downloadLearningMaterial = (mat: MaterialDownloadInfo): void => {
  const sanitizeFilename = (name: string) =>
    name.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');

  const filename = `${sanitizeFilename(mat.title)}.md`;

  const content = `# CAMPUSHUB LEARNING RESOURCE REPOSITORY
=============================================================================
DOCUMENT: ${mat.title}
SUBJECT / COURSE: ${mat.subject}
RESOURCE TYPE: ${mat.type || 'Lecture Notes / Reference Material'}
UPLOADED ON: ${mat.uploadedDate || new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
ESTIMATED SIZE: ${mat.size || '2.4 MB'}
INSTITUTION: Department of Computer Science & Engineering, CampusHub
=============================================================================

## 1. COURSE MODULE OVERVIEW
This comprehensive reference document contains detailed theoretical notes,
algorithmic proofs, architecture diagrams, and practical implementation snippets 
curated by faculty instructors for ${mat.subject}.

## 2. KEY LEARNING OBJECTIVES
- Master core fundamental principles, theorems, and state transitions.
- Understand asymptotic computational complexities (Time: O(n log n), Space: O(1)).
- Implement practical, real-world design patterns adhering to industry standards.
- Solve sample assessment questions and review diagnostic trace tables.

## 3. CORE CONTENT & REFERENCE NOTES

### 3.1 Key Definitions & Conceptual Breakdown
${mat.title} provides deep coverage of systematic problem solving:
1. Architectural Hierarchy & Functional Component Mapping.
2. Protocol Header Structures & Packet Encapsulation Formats.
3. Verification Benchmarks and High-Throughput System Tuning.

### 3.2 Reference Formulas & Algorithms
\`\`\`text
[Input Data Stream] ──► [Hash & Transform Stage] ──► [Optimized Execution Buffer]
                               │
                               ▼
                    [Output State Verification]
\`\`\`

\`\`\`python
# Sample Implementation & Reference Solution
def execute_core_routine(dataset):
    """
    Standard processing function for ${mat.subject}
    Calculates optimized metrics with memoized traversal.
    """
    metrics = []
    for item in dataset:
        processed_val = (item * 31) % 10007
        metrics.append(processed_val)
    return sorted(metrics)

if __name__ == '__main__':
    sample_input = [12, 45, 78, 23, 56, 89]
    result = execute_core_routine(sample_input)
    print(f"Computed Output: {result}")
\`\`\`

## 4. SAMPLE PRACTICE QUESTIONS
1. Explain the step-by-step state changes during execution with a diagram.
2. Differentiate between static partitioning and dynamic allocation.
3. Compute the maximum theoretical throughput under variable workload scenarios.

## 5. SUMMARY & ADDITIONAL READINGS
- Recommended Textbook: Modern Computing Systems & Network Architectures (5th Edition).
- Official Documentation & Open Standards Reference Guides.
- CampusHub Digital Library Code: #LIB-CSE-${Math.floor(1000 + Math.random() * 9000)}

-----------------------------------------------------------------------------
Generated securely by CampusHub Academic Learning Management System (LMS)
`;

  downloadFile(filename, content, 'text/markdown;charset=utf-8');
};

/**
 * Generate and download notice attachment document
 */
export const downloadNoticeAttachment = (notice: NoticeDownloadInfo): void => {
  const filename = notice.attachmentName.includes('.')
    ? notice.attachmentName
    : `${notice.attachmentName}.txt`;

  const content = `=============================================================================
OFFICIAL CAMPUS NOTICE ATTACHMENT
=============================================================================
ATTACHMENT FILE: ${filename}
NOTICE TITLE: ${notice.title}
ISSUING DEPARTMENT: ${notice.department || 'Academic Administration'}
CIRCULAR DATE: ${notice.date || new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
PRIORITY: ${notice.priority || 'General'}
=============================================================================

OFFICIAL MEMORANDUM & SCHEDULE:

${notice.content || 'Please find the attached detailed schedule and instructions pertaining to the circular above. All students and faculty members are requested to strictly adhere to the published timelines.'}

1. SCHEDULE & VENUES:
   - Primary Session: Campus Main Auditorium / Central Academic Block
   - Reporting Time: 09:00 AM IST
   - Required Items: Valid Student ID Card, Admit Pass, Writing Materials

2. GUIDELINES & COMPLIANCE:
   - Attendance is mandatory for all registered candidates.
   - Any schedule clashes must be reported to the departmental coordinator within 48 hours.
   - Electronic unauthorized devices are strictly prohibited during evaluations.

Authorized by:
Office of the Academic Registrar & Student Affairs
CampusHub Central University
`;

  downloadFile(filename, content, 'text/plain;charset=utf-8');
};

/**
 * Export data as a CSV spreadsheet
 */
export const downloadCSV = (
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void => {
  const escapeCell = (cell: string | number) => {
    const str = String(cell);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(','))
  ].join('\r\n');

  const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  downloadFile(finalFilename, csvContent, 'text/csv;charset=utf-8');
};

/**
 * Generate and download transport pass
 */
export const downloadTransportPass = (pass: TransportPassInfo): void => {
  const filename = `Transport_Pass_${pass.rollNumber || 'Student'}.txt`;

  const content = `=============================================================================
             CAMPUSHUB DIGITAL TRANSPORT TRANSIT PASS
=============================================================================
PASS ID: ${pass.passId || 'TP-2026-8842'}
VALIDITY: Academic Year 2026–2027 (Valid until: ${pass.validUntil || '30 Jun 2027'})
STATUS: ACTIVE & VERIFIED

STUDENT DETAILS:
-----------------------------------------------------------------------------
Student Name     : ${pass.studentName || 'Alex Morgan'}
Roll Number      : ${pass.rollNumber || 'CS2023001'}
Academic Program : ${pass.course || 'B.Tech - Computer Science & Engineering'}

TRANSIT & BUS ROUTE SPECIFICATIONS:
-----------------------------------------------------------------------------
Assigned Route   : ${pass.route || 'Route 4: Central Station ──► North Campus'}
Boarding Stop    : ${pass.stop || 'Central Metro Junction (Gate 2)'}
Assigned Bus No. : ${pass.busNumber || 'Bus #14 (Plate: DL-01-AB-4920)'}
Pickup Time      : 07:45 AM IST
Drop Time        : 05:30 PM IST

SECURITY & QR VERIFICATION:
-----------------------------------------------------------------------------
Digital Signature: [SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855]
Authorized By    : Campus Transit & Logistics Directorate

INSTRUCTIONS:
1. Carry this pass (digital copy or printout) alongside your Student ID Badge.
2. Present the pass to the bus conductor / transit terminal upon boarding.
3. This pass is non-transferable.
=============================================================================
`;

  downloadFile(filename, content, 'text/plain;charset=utf-8');
};

export interface StudentIdCardInfo {
  studentName: string;
  rollNumber: string;
  department: string;
  section: string;
  year: string;
  bloodGroup: string;
  validUntil: string;
  email: string;
  emergencyContact: string;
}

/**
 * Generate and download official Student ID Badge record
 */
export const downloadStudentIdCard = (card: StudentIdCardInfo): void => {
  const filename = `Student_ID_Card_${card.rollNumber || 'Badge'}.txt`;

  const content = `=============================================================================
             CAMPUSHUB CENTRAL UNIVERSITY - OFFICIAL STUDENT ID BADGE
=============================================================================
STUDENT ID NUMBER : ${card.rollNumber || '236F1A0551'}
VALIDITY PERIOD   : 2023 – ${card.validUntil || 'JULY 2027'}
ACCREDITATION     : NAAC A++ Autonomous Institutional Body
STATUS            : ACTIVE ENROLLED SCHOLAR
=============================================================================

SCHOLAR PARTICULARS:
-----------------------------------------------------------------------------
Student Full Name : ${card.studentName || 'Rajana Ganesh'}
Academic Program  : Bachelor of Technology (B.Tech)
Department        : ${card.department || 'Computer Science & Engineering'}
Current Section   : ${card.section || 'CSE-A (Semester 8)'}
Academic Year     : ${card.year || 'IV Year (Final Semester)'}
Institutional Mail: ${card.email || 'student@campushub.edu'}
Blood Group       : ${card.bloodGroup || 'O+ve'}
Emergency Phone   : ${card.emergencyContact || '+91 98765 43210'}

INSTITUTIONAL METRICS & IDENTIFIERS:
-----------------------------------------------------------------------------
Campus RFID Tag   : #RFID-CSE-${Math.floor(100000 + Math.random() * 900000)}
Library Barcode   : ||| |||||| ||||| |||| ||||||| 8942001
Transit Route     : Route 4 - North Campus Express
Hostel Residence  : Block B - Room 304 (Hostel Campus)

SECURITY ENCRYPTED TOKEN:
-----------------------------------------------------------------------------
Digital Signature : [SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069]
Issuing Authority : Dean of Academic & Student Affairs

DISCLAIMER & TERMS:
1. This card is the property of CampusHub Central University.
2. Loss of ID card must be reported immediately to the Academic Security Helpdesk.
3. Tap at library kiosks, laboratory entry gates, and cafeteria POS for verification.
=============================================================================
`;

  downloadFile(filename, content, 'text/plain;charset=utf-8');
};

export interface FacultyIdCardInfo {
  facultyName: string;
  empId: string;
  department: string;
  designation: string;
  email: string;
  phone: string;
  bloodGroup: string;
  validUntil: string;
  specialization?: string;
  cabinRoom?: string;
  emergencyContact?: string;
}

/**
 * Generate and download official Faculty & Staff ID Badge record
 */
export const downloadFacultyIdCard = (card: FacultyIdCardInfo): void => {
  const filename = `Faculty_ID_Badge_${card.empId || 'Badge'}.txt`;

  const content = `=============================================================================
             CAMPUSHUB CENTRAL UNIVERSITY - OFFICIAL FACULTY ID BADGE
=============================================================================
EMPLOYEE ID NUMBER : ${card.empId || 'FAC-101'}
VALIDITY PERIOD    : ACTIVE / TENURED (${card.validUntil || 'PERMANENT'})
ACCREDITATION      : NAAC A++ Autonomous University Senate
DESIGNATION ROLE   : ${card.designation?.toUpperCase() || 'PROFESSOR'}
=============================================================================

FACULTY MEMBER PARTICULARS:
-----------------------------------------------------------------------------
Faculty Full Name  : ${card.facultyName || 'Dr. Suresh Kumar'}
Academic Department: ${card.department || 'Computer Science & Engineering'}
Designation / Rank : ${card.designation || 'Professor & Department Chair'}
Areas of Research  : ${card.specialization || 'Distributed Systems, Advanced Algorithms'}
Office / Cabin Loc : ${card.cabinRoom || 'Cabin 302, Academic Block 2'}
Institutional Mail : ${card.email || 'faculty@campushub.com'}
Contact Phone      : ${card.phone || '+91 98765 43201'}
Blood Group        : ${card.bloodGroup || 'A+ve'}
Emergency Contact  : ${card.emergencyContact || '+91 98765 00000'}

CAMPUS ACCESS TOKENS & METRICS:
-----------------------------------------------------------------------------
Faculty RFID Tag   : #FAC-RFID-${Math.floor(100000 + Math.random() * 900000)}
Faculty Keycard PIN: ||| |||||| ||||| |||| ||||||| 9402108
Lab Access Level   : Level 4 Autonomous Access (Research & Server Labs)
Library Privilege  : Tier 1 Research Privilege (15 Concurrent Volumes)
Parking Permit     : Designated Slot - Faculty Reserved Tier P1

SECURITY ENCRYPTED TOKEN:
-----------------------------------------------------------------------------
Digital Signature  : [SHA256: 9e32f17042a967f6bb30e1688d0b284e3c914d9b40fae4209db89324e908b1a8]
Issuing Authority  : Office of the Registrar & University Senate

DISCLAIMER & TERMS:
1. This identity credential is the property of CampusHub Central University.
2. Must be presented upon request at campus security checkpoints and research facilities.
3. Cardholder is authorized for faculty parking, faculty lounge, and 24/7 academic block access.
=============================================================================
`;

  downloadFile(filename, content, 'text/plain;charset=utf-8');
};

export interface AttendanceReportInfo {
  studentName: string;
  rollNumber: string;
  department: string;
  semester: string;
  overallPercentage: number;
  totalHeld: number;
  totalAttended: number;
  subjects: Array<{
    code: string;
    name: string;
    conducted: number;
    attended: number;
    percentage: number;
    status: string;
  }>;
}

/**
 * Generate and download official Consolidated Attendance Transcript
 */
export const downloadAttendanceReport = (report: AttendanceReportInfo): void => {
  const filename = `Attendance_Record_${report.rollNumber || '236F1A0551'}.txt`;

  const subjectRows = report.subjects
    .map(
      (s) =>
        `${s.code.padEnd(8)} | ${s.name.padEnd(42).slice(0, 42)} | ${String(s.conducted).padStart(3)} | ${String(s.attended).padStart(3)} | ${(s.percentage.toFixed(1) + '%').padStart(6)} | ${s.status}`
    )
    .join('\n');

  const content = `========================================================================================================
                      CAMPUSHUB CENTRAL UNIVERSITY - OFFICIAL ATTENDANCE TRANSCRIPT
========================================================================================================
ACADEMIC YEAR     : 2026 – 2027 (EVEN SEMESTER)
REPORT GENERATED  : ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} at ${new Date().toLocaleTimeString()}
AUDIT AUTHORITY   : Office of the Academic Registrar & Dean of Academic Affairs
========================================================================================================

SCHOLAR PARTICULARS:
--------------------------------------------------------------------------------------------------------
Student Full Name : ${report.studentName || 'Rajana Ganesh'}
Roll Number       : ${report.rollNumber || '236F1A0551'}
Department        : ${report.department || 'Computer Science & Engineering'}
Semester          : ${report.semester || 'Semester 8 (Final Year)'}
Overall Attendance: ${report.overallPercentage.toFixed(1)}% (${report.totalAttended} / ${report.totalHeld} Lectures Attended)
Eligibility Status: ${report.overallPercentage >= 75 ? 'ELIGIBLE FOR FINAL EXAMINATIONS (Satisfies >=75% Requirement)' : 'CRITICAL - CONDITIONAL EXAM ADMIT'}
--------------------------------------------------------------------------------------------------------

SUBJECT-WISE ATTENDANCE BREAKDOWN:
--------------------------------------------------------------------------------------------------------
CODE     | COURSE TITLE                               | HELD| ATT | ATT %  | STATUS
--------------------------------------------------------------------------------------------------------
${subjectRows}
--------------------------------------------------------------------------------------------------------

INSTITUTIONAL REGULATION CLAUSES:
1. Minimum 75% aggregate physical attendance is mandatory across all theory and laboratory courses.
2. Condonation for medical and sports On-Duty (OD) requires Dean approval with authorized documentation.
3. This is a system-generated official ledger verified by the institutional biometric gateway.
========================================================================================================
`;

  downloadFile(filename, content, 'text/plain;charset=utf-8');
};

