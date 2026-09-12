import { safeGetStorage, safeSetStorage, getStudentNotifications, saveStudentNotifications, StudentNotificationItem } from './storageService';

export interface AttendanceShortageEmailRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseCode: string;
  courseName: string;
  facultyName: string;
  section: string;
  conductedClasses: number;
  presentClasses: number;
  absentClasses: number;
  attendancePercentage: number;
  requiredPercentage: number; // 75%
  sentAt: string;
  subject: string;
  status: 'Sent' | 'Delivered' | 'Read';
  messageText: string;
}

const STORAGE_SHORTAGE_EMAILS_KEY = 'campushub_shortage_sent_emails';

// Default mock initial sent emails
const DEFAULT_SHORTAGE_EMAILS: AttendanceShortageEmailRecord[] = [
  {
    id: 'EML-ATT-1001',
    studentId: '236F1A0504',
    studentName: 'rohit',
    studentEmail: 'rohit@campushub.com',
    courseCode: 'CSE-301',
    courseName: 'Data Structures & Algorithms',
    facultyName: 'Dr. S. Kumar',
    section: 'Section A',
    conductedClasses: 18,
    presentClasses: 11,
    absentClasses: 7,
    attendancePercentage: 61,
    requiredPercentage: 75,
    sentAt: 'Today at 10:15 AM',
    subject: 'URGENT: Academic Attendance Shortage Notice (61%) - CSE-301',
    status: 'Delivered',
    messageText: 'Dear rohit (236F1A0504),\n\nThis is an automated formal notification from the Faculty Office regarding your attendance in CSE-301 (Data Structures & Algorithms). Your current attendance is 61%, which is below the mandatory university threshold of 75%.\n\nPlease meet Dr. S. Kumar during advisory hours.'
  }
];

export const getAttendanceShortageEmails = (): AttendanceShortageEmailRecord[] => {
  return safeGetStorage<AttendanceShortageEmailRecord[]>(STORAGE_SHORTAGE_EMAILS_KEY, DEFAULT_SHORTAGE_EMAILS);
};

export const saveAttendanceShortageEmails = (emails: AttendanceShortageEmailRecord[]): void => {
  safeSetStorage(STORAGE_SHORTAGE_EMAILS_KEY, emails);
};

export interface SendShortageEmailParams {
  studentId: string;
  studentName: string;
  studentEmail?: string;
  courseCode: string;
  courseName?: string;
  facultyName: string;
  section: string;
  conductedClasses: number;
  presentClasses: number;
  absentClasses: number;
  attendancePercentage: number;
}

/**
 * Real-time email dispatch for student attendance shortage
 */
export const sendAttendanceShortageEmail = (params: SendShortageEmailParams): AttendanceShortageEmailRecord => {
  const currentEmails = getAttendanceShortageEmails();
  const emailAddr = params.studentEmail || `${params.studentName.toLowerCase().replace(/\s+/g, '')}@campushub.edu`;
  const courseTitle = params.courseName || params.courseCode;
  const now = new Date();
  const timeStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' at ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const subject = `URGENT: Academic Attendance Shortage Notice (${params.attendancePercentage}%) - ${params.courseCode}`;
  
  const messageText = `Dear ${params.studentName} (Roll No: ${params.studentId}),

This is an automated formal notice from CampusHub Faculty Portal regarding your academic attendance in ${params.courseCode} (${courseTitle}).

Attendance Record Summary:
• Total Conducted Lectures: ${params.conductedClasses}
• Attended (Present): ${params.presentClasses}
• Missed (Absent): ${params.absentClasses}
• Current Attendance Rate: ${params.attendancePercentage}%
• Mandatory University Minimum: 75%

CRITICAL ACTION REQUIRED:
Your attendance is currently below the mandatory 75% eligibility threshold. In accordance with university examination regulations, candidates falling short of 75% attendance at the end of the semester risk detention from appearing in semester-end examinations.

Please contact course instructor ${params.facultyName} or your academic advisor immediately to discuss compensatory sessions and academic catch-up.

Issued by:
Faculty of Computer Science & Engineering
CampusHub Academic Management Portal`;

  const newEmailRecord: AttendanceShortageEmailRecord = {
    id: `EML-ATT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    studentId: params.studentId,
    studentName: params.studentName,
    studentEmail: emailAddr,
    courseCode: params.courseCode,
    courseName: courseTitle,
    facultyName: params.facultyName,
    section: params.section,
    conductedClasses: params.conductedClasses,
    presentClasses: params.presentClasses,
    absentClasses: params.absentClasses,
    attendancePercentage: params.attendancePercentage,
    requiredPercentage: 75,
    sentAt: timeStr,
    subject,
    status: 'Delivered',
    messageText
  };

  const updatedEmails = [newEmailRecord, ...currentEmails];
  saveAttendanceShortageEmails(updatedEmails);

  // Cross-dispatch to Student In-App Notifications Feed
  try {
    const studentNotifs = getStudentNotifications();
    const newStudentNotif: StudentNotificationItem = {
      id: `NOTIF-ATT-${Date.now()}`,
      category: 'Academic' as any,
      title: `Attendance Warning: ${params.courseCode} (${params.attendancePercentage}%)`,
      message: `Official email notice sent to ${emailAddr}. Your attendance in ${params.courseCode} is ${params.attendancePercentage}% (<75%). Contact ${params.facultyName}.`,
      time: 'Just now',
      isUnread: true,
      targetRoute: '/student/attendance',
      actionLabel: 'View Attendance'
    };
    const updatedNotifs = [newStudentNotif, ...studentNotifs];
    saveStudentNotifications(updatedNotifs);
  } catch (err) {
    console.warn('Could not sync student notification:', err);
  }

  // Real-time Event broadcast for active tabs / windows
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('campushub_shortage_email_sent', { detail: newEmailRecord }));
    window.dispatchEvent(new Event('campushub_student_notifications_updated'));
    window.dispatchEvent(new Event('storage'));
  }

  return newEmailRecord;
};

/**
 * Send batch shortage emails to all students below threshold
 */
export const sendBulkAttendanceShortageEmails = (records: SendShortageEmailParams[]): AttendanceShortageEmailRecord[] => {
  const sentList: AttendanceShortageEmailRecord[] = [];
  records.forEach((rec) => {
    const sent = sendAttendanceShortageEmail(rec);
    sentList.push(sent);
  });
  return sentList;
};
