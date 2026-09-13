import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import {
  getManagementData,
  saveManagementData,
  getFacultyAssignedCourses,
  getFacultyAssignedLabs,
  getLabSessions,
  saveLabSession,
  CourseRecord,
  StudentRecord,
  LabRecord,
  LabSessionRecord
} from '../../data/managementData';
import { dbService } from '../../services/dbService';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import { getFacultyAttendanceHistory, saveFacultyAttendanceHistory, AttendanceHistoryRecord, safeGetStorage, safeSetStorage } from '../../services/storageService';
import {
  sendAttendanceShortageEmail,
  sendBulkAttendanceShortageEmails,
  getAttendanceShortageEmails,
  AttendanceShortageEmailRecord,
  SendShortageEmailParams
} from '../../services/emailService';

// Comprehensive Gazetted Academic & Public Holidays Directory (2026)
const ACADEMIC_PUBLIC_HOLIDAYS: Record<string, string> = {
  // September 2026
  '2026-09-06': 'Holiday',
  '2026-09-13': 'Holiday',
  '2026-09-14': 'Milad-un-Nabi / Hindi Diwas',
  '2026-09-19': 'Ganesh Chaturthi (Vinayaka Chaturthi)',
  '2026-09-20': 'Holiday',
  '2026-09-27': 'Holiday',
  '2026-09-28': 'Bhagat Singh Jayanti',

  // August 2026
  '2026-08-02': 'Holiday',
  '2026-08-09': 'Holiday',
  '2026-08-15': 'Independence Day',
  '2026-08-16': 'Holiday',
  '2026-08-23': 'Holiday',
  '2026-08-28': 'Janmashtami / Raksha Bandhan',
  '2026-08-30': 'Holiday',

  // October 2026
  '2026-10-02': 'Mahatma Gandhi Jayanti',
  '2026-10-04': 'Holiday',
  '2026-10-11': 'Holiday',
  '2026-10-18': 'Holiday',
  '2026-10-20': 'Maha Navami (Dussehra Holiday)',
  '2026-10-21': 'Vijaya Dashami (Dussehra)',
  '2026-10-25': 'Holiday',

  // November 2026
  '2026-11-01': 'Holiday',
  '2026-11-08': 'Diwali / Deepavali (Holiday)',
  '2026-11-09': 'Govardhan Puja Holiday',
  '2026-11-15': 'Holiday',
  '2026-11-22': 'Holiday',
  '2026-11-24': 'Guru Nanak Jayanti',
  '2026-11-29': 'Holiday',

  // December 2026
  '2026-12-06': 'Holiday',
  '2026-12-13': 'Holiday',
  '2026-12-20': 'Holiday',
  '2026-12-25': 'Christmas Day',
  '2026-12-27': 'Holiday'
};

const isSunday = (dateStr: string): boolean => {
  try {
    const parts = dateStr.split('-').map(Number);
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.getDay() === 0;
    }
    return false;
  } catch {
    return false;
  }
};

const getHolidayInfo = (dateStr: string): { isHoliday: boolean; isSunday: boolean; name: string } => {
  const isSun = isSunday(dateStr);
  const holidayName = ACADEMIC_PUBLIC_HOLIDAYS[dateStr];
  if (isSun) {
    return {
      isHoliday: true,
      isSunday: true,
      name: holidayName && holidayName !== 'Sunday' && holidayName !== 'Holiday' ? `${holidayName} (Holiday)` : 'Holiday'
    };
  }
  if (holidayName) {
    return {
      isHoliday: true,
      isSunday: false,
      name: holidayName
    };
  }
  return {
    isHoliday: false,
    isSunday: false,
    name: ''
  };
};

// Helper to generate full month of dates (1 to 30 for September, 1 to 31 for August/October)
const generateMonthDates = (year = 2026, month = 9) => {
  const daysInMonth = new Date(year, month, 0).getDate(); // 30 days for September
  const dateList: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = d < 10 ? `0${d}` : `${d}`;
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    dateList.push(`${year}-${monthStr}-${dayStr}`);
  }
  return dateList;
};

// Default initial dates for September 2026 register (Full Month: 01 Sep - 30 Sep)
const DEFAULT_REGISTER_DATES = generateMonthDates(2026, 9);

type AttendanceStatus = 'P' | 'X' | 'H' | '';
type AttendanceMatrix = Record<string, Record<string, AttendanceStatus>>;

export const FacultyAttendance: React.FC = () => {
  const { user } = useAuth();
  const [mgmt, setMgmt] = useState(() => getManagementData());

  // Dynamic courses and practical labs assigned to logged in faculty
  const [courses, setCourses] = useState<CourseRecord[]>(() => getFacultyAssignedCourses(user));
  const [facultyLabs, setFacultyLabs] = useState<LabRecord[]>(() => getFacultyAssignedLabs(user));

  // Active view tab: Theory Matrix vs Scheduled Lab Practical vs Session History vs Email Audits
  const [activeTab, setActiveTab] = useState<'matrix' | 'labs' | 'history' | 'emails'>('matrix');

  // Scheduled Lab Attendance State
  const [selectedLabId, setSelectedLabId] = useState<string>(() => {
    const assignedLabs = getFacultyAssignedLabs(user);
    return assignedLabs.length > 0 ? assignedLabs[0].id : 'LAB-101';
  });

  const [selectedLabDate, setSelectedLabDate] = useState<string>('2026-09-13');
  const [experimentTitle, setExperimentTitle] = useState<string>('Exp 4: RPC & Distributed Shared Memory implementation');
  const [labVerificationMode, setLabVerificationMode] = useState<'Workstation Biometric Terminal' | 'Manual Roll-Call' | 'Continuous Viva Assessment'>('Workstation Biometric Terminal');
  const [labSessionsList, setLabSessionsList] = useState<LabSessionRecord[]>(() => getLabSessions());
  const [previewLabSession, setPreviewLabSession] = useState<LabSessionRecord | null>(null);

  useEffect(() => {
    const handleSync = async () => {
      const freshMgmt = getManagementData();
      try {
        const remoteStudents = await dbService.getStudents();
        if (remoteStudents && remoteStudents.length > 0) {
          freshMgmt.students = remoteStudents;
          saveManagementData(freshMgmt);
        }
      } catch (err) {
        console.warn('Attendance remote student sync error:', err);
      }
      setMgmt(freshMgmt);
      setCourses(getFacultyAssignedCourses(user));
      setFacultyLabs(getFacultyAssignedLabs(user));
      setLabSessionsList(getLabSessions());
    };

    handleSync();

    window.addEventListener('storage', handleSync);
    window.addEventListener('campushub_management_updated', handleSync);
    window.addEventListener('campushub_lab_session_saved', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('campushub_management_updated', handleSync);
      window.removeEventListener('campushub_lab_session_saved', handleSync);
    };
  }, [user]);

  // Active course and section filter
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>(() => {
    const assigned = getFacultyAssignedCourses(user);
    return assigned.length > 0 ? assigned[0].code : 'CSE-301';
  });

  useEffect(() => {
    if (courses.length > 0 && !courses.some((c) => c.code === selectedCourseCode)) {
      setSelectedCourseCode(courses[0].code);
    }
  }, [courses, selectedCourseCode]);

  useEffect(() => {
    if (facultyLabs.length > 0 && !facultyLabs.some((l) => l.id === selectedLabId)) {
      setSelectedLabId(facultyLabs[0].id);
    }
  }, [facultyLabs, selectedLabId]);

  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Shortage' | 'Safe'>('All');

  // Current Date Cutoff (Attendance recorded up to this date; future days appear empty white boxes)
  const [currentCutoffDate, setCurrentCutoffDate] = useState<string>('2026-09-13');

  // Storage keys for persistent matrix per month, course & section
  const datesStorageKey = `campushub_faculty_att_dates_${selectedMonth}_${selectedCourseCode}_${selectedSection}`;
  const matrixStorageKey = `campushub_faculty_att_matrix_${selectedMonth}_${selectedCourseCode}_${selectedSection}`;

  // Date list state
  const [dates, setDates] = useState<string[]>(() => {
    return safeGetStorage<string[]>(datesStorageKey, DEFAULT_REGISTER_DATES);
  });

  // Helper to build initial matrix ensuring all students have populated data up to cutoff, and Sundays/holidays marked in red ('H')
  const generateInitialMatrix = useCallback((dateList: string[], studentList: StudentRecord[], cutoff: string, existingMatrix?: AttendanceMatrix | null): AttendanceMatrix => {
    const mat: AttendanceMatrix = {};
    studentList.forEach((stu) => {
      mat[stu.id] = {};
      const existing = existingMatrix?.[stu.id];
      const targetPct = (stu.attendancePercent || 85) / 100;
      dateList.forEach((dateStr, idx) => {
        const holiday = getHolidayInfo(dateStr);
        if (holiday.isHoliday) {
          // Sundays and Public Holidays are ALWAYS marked in RED as 'H' (Holiday)
          mat[stu.id][dateStr] = 'H';
        } else if (existing && existing[dateStr] !== undefined && existing[dateStr] !== null && existing[dateStr] !== '') {
          mat[stu.id][dateStr] = existing[dateStr];
        } else if (dateStr <= cutoff) {
          // Conducted working lecture dates up to cutoff: 'P' (Present, green) or 'X' (Absent, red)
          const charCode = (stu.id.charCodeAt(stu.id.length - 1) + idx * 7) % 100;
          mat[stu.id][dateStr] = charCode < (targetPct * 100) ? 'P' : 'X';
        } else {
          // Remaining future working days in the month: empty white box
          mat[stu.id][dateStr] = '';
        }
      });
    });
    return mat;
  }, []);

  // Attendance Matrix State
  const [matrix, setMatrix] = useState<AttendanceMatrix>(() => {
    const saved = safeGetStorage<AttendanceMatrix | null>(matrixStorageKey, null);
    return generateInitialMatrix(DEFAULT_REGISTER_DATES, mgmt.students, '2026-09-13', saved);
  });

  // Reload dates & matrix when course, section, or month changes
  useEffect(() => {
    const [yStr, mStr] = selectedMonth.split('-');
    const year = parseInt(yStr, 10) || 2026;
    const month = parseInt(mStr, 10) || 9;
    const defaultMonthDates = generateMonthDates(year, month);
    
    const savedDates = safeGetStorage<string[]>(datesStorageKey, defaultMonthDates);
    setDates(savedDates);
    const savedMatrix = safeGetStorage<AttendanceMatrix | null>(matrixStorageKey, null);
    const resolvedMatrix = generateInitialMatrix(savedDates, mgmt.students, currentCutoffDate, savedMatrix);
    setMatrix(resolvedMatrix);
  }, [selectedCourseCode, selectedSection, selectedMonth, datesStorageKey, matrixStorageKey, generateInitialMatrix, mgmt.students, currentCutoffDate]);

  // List of conducted working dates up to cutoff (excluding Sundays and holidays unless explicitly marked P/X)
  const conductedDates = useMemo(() => {
    return dates.filter(
      (d) => {
        const holiday = getHolidayInfo(d);
        if (holiday.isHoliday) {
          return mgmt.students.some((s) => matrix[s.id]?.[d] === 'P' || matrix[s.id]?.[d] === 'X');
        }
        return d <= currentCutoffDate || mgmt.students.some((s) => matrix[s.id]?.[d] === 'P' || matrix[s.id]?.[d] === 'X');
      }
    );
  }, [dates, currentCutoffDate, mgmt.students, matrix]);

  const holidaysInMonthCount = useMemo(() => {
    return dates.filter((d) => getHolidayInfo(d).isHoliday).length;
  }, [dates]);

  const lastDayOfMonth = dates[dates.length - 1] || '2026-09-30';
  const isMonthEnd = currentCutoffDate >= lastDayOfMonth;

  // Filter students based on section and search query (excluding admin/faculty accounts)
  const displayedStudents = useMemo(() => {
    return mgmt.students.filter((stu) => {
      // Exclude Admin or Faculty accounts from Student Attendance Matrix
      const stuName = (stu.name || '').toLowerCase().trim();
      const stuEmail = (stu.email || '').toLowerCase().trim();
      const stuId = (stu.id || '').toLowerCase().trim();

      if (
        stuName === 'admin' ||
        stuName.includes('admincampushub') ||
        stuName.includes('system admin') ||
        stuName.includes('administrator') ||
        stuEmail.startsWith('admin@') ||
        stuEmail.includes('admincampushub') ||
        stuEmail.startsWith('faculty@') ||
        stuId.startsWith('adm') ||
        stuId.startsWith('fac')
      ) {
        return false;
      }

      // Section match
      if (selectedSection !== 'All') {
        const studentSec = (stu.section || '').replace(/Section\s*/i, '').trim().toUpperCase();
        const filterSec = selectedSection.trim().toUpperCase();
        if (studentSec && studentSec !== filterSec) {
          const rollNum = parseInt(stu.id.replace(/\D/g, '') || '0', 10);
          if (filterSec === 'A' && rollNum % 2 === 0) return false;
          if (filterSec === 'B' && rollNum % 2 !== 0) return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (stu.name || '').toLowerCase().includes(q);
        const matchRoll = (stu.id || '').toLowerCase().includes(q);
        if (!matchName && !matchRoll) return false;
      }

      // Status filter (Safe >=75%, Shortage <75%)
      if (statusFilter !== 'All') {
        const studentRecords = matrix[stu.id] || {};
        const pCount = dates.filter((d) => studentRecords[d] === 'P').length;
        const xCount = dates.filter((d) => studentRecords[d] === 'X').length;
        const conductedTotal = pCount + xCount || 1;
        const pct = Math.round((pCount / conductedTotal) * 100);

        if (statusFilter === 'Shortage' && pct >= 75) return false;
        if (statusFilter === 'Safe' && pct < 75) return false;
      }

      return true;
    });
  }, [mgmt.students, selectedSection, searchQuery, statusFilter, matrix, dates]);

  // Attendance History records loaded from persistent storage
  const [history, setHistory] = useState<AttendanceHistoryRecord[]>(() => getFacultyAttendanceHistory());

  // Email Notification State
  const [shortageEmails, setShortageEmails] = useState<AttendanceShortageEmailRecord[]>(() => getAttendanceShortageEmails());
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [autoEmailOnSave, setAutoEmailOnSave] = useState(true);
  const [previewEmailItem, setPreviewEmailItem] = useState<AttendanceShortageEmailRecord | null>(null);

  // Sync emails on event
  useEffect(() => {
    const handleEmailSync = () => setShortageEmails(getAttendanceShortageEmails());
    window.addEventListener('campushub_shortage_email_sent', handleEmailSync);
    window.addEventListener('storage', handleEmailSync);
    return () => {
      window.removeEventListener('campushub_shortage_email_sent', handleEmailSync);
      window.removeEventListener('storage', handleEmailSync);
    };
  }, []);

  // Modals state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAddDateModalOpen, setIsAddDateModalOpen] = useState(false);
  const [newDateInput, setNewDateInput] = useState(() => new Date().toISOString().split('T')[0]);
  const [newDateDefaultStatus, setNewDateDefaultStatus] = useState<AttendanceStatus>('P');

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // List of students with shortage (<75%)
  const shortageStudentsList = useMemo(() => {
    return displayedStudents
      .map((stu) => {
        const studentMap = matrix[stu.id] || {};
        const pCount = dates.filter((d) => studentMap[d] === 'P').length;
        const xCount = dates.filter((d) => studentMap[d] === 'X').length;
        const stuConducted = pCount + xCount;
        const pct = stuConducted > 0 ? Math.round((pCount / stuConducted) * 100) : 100;
        return {
          student: stu,
          pCount,
          xCount,
          stuConducted,
          pct,
          isShortage: pct < 75
        };
      })
      .filter((item) => item.isShortage);
  }, [displayedStudents, matrix, dates]);

  // -------------------------------------------------------------
  // REAL-TIME EMAIL DISPATCH HANDLERS
  // -------------------------------------------------------------
  const handleSendSingleEmail = (stu: StudentRecord) => {
    const studentMap = matrix[stu.id] || {};
    const pCount = dates.filter((d) => studentMap[d] === 'P').length;
    const xCount = dates.filter((d) => studentMap[d] === 'X').length;
    const stuConducted = pCount + xCount;
    const pct = stuConducted > 0 ? Math.round((pCount / stuConducted) * 100) : 100;
    const currentCourse = courses.find((c) => c.code === selectedCourseCode);

    const sent = sendAttendanceShortageEmail({
      studentId: stu.id,
      studentName: stu.name,
      studentEmail: stu.email,
      courseCode: selectedCourseCode,
      courseName: currentCourse?.name || 'Data Structures & Algorithms',
      facultyName: user?.name || 'Dr. Suresh Kumar',
      section: `Section ${selectedSection}`,
      conductedClasses: stuConducted,
      presentClasses: pCount,
      absentClasses: xCount,
      attendancePercentage: pct
    });

    setShortageEmails(getAttendanceShortageEmails());
    showToast(`Official attendance shortage email sent to ${stu.name} (${sent.studentEmail})!`, 'success');
  };

  const handleSendBulkEmails = () => {
    if (shortageStudentsList.length === 0) {
      showToast('No students currently below 75% attendance.', 'info');
      return;
    }

    setIsSendingEmails(true);
    const currentCourse = courses.find((c) => c.code === selectedCourseCode);

    setTimeout(() => {
      const payloads: SendShortageEmailParams[] = shortageStudentsList.map((item) => ({
        studentId: item.student.id,
        studentName: item.student.name,
        studentEmail: item.student.email,
        courseCode: selectedCourseCode,
        courseName: currentCourse?.name || 'Data Structures & Algorithms',
        facultyName: user?.name || 'Dr. Suresh Kumar',
        section: `Section ${selectedSection}`,
        conductedClasses: item.stuConducted,
        presentClasses: item.pCount,
        absentClasses: item.xCount,
        attendancePercentage: item.pct
      }));

      sendBulkAttendanceShortageEmails(payloads);
      setShortageEmails(getAttendanceShortageEmails());
      setIsSendingEmails(false);
      setIsEmailModalOpen(false);
      showToast(`Shortage warning emails successfully dispatched to ${payloads.length} student(s) in real-time!`, 'success');
    }, 600);
  };

  // -------------------------------------------------------------
  // SCHEDULED LAB PRACTICAL STATE & HANDLERS
  // -------------------------------------------------------------
  const selectedLab = useMemo(() => {
    return facultyLabs.find((l) => l.id === selectedLabId) || facultyLabs[0];
  }, [facultyLabs, selectedLabId]);

  // Students eligible for the selected practical lab based on batch
  const eligibleLabStudents = useMemo(() => {
    if (!selectedLab) return displayedStudents;
    const b = (selectedLab.batch || '').toLowerCase();
    return mgmt.students.filter((stu) => {
      const stuName = (stu.name || '').toLowerCase().trim();
      const stuEmail = (stu.email || '').toLowerCase().trim();
      const stuId = (stu.id || '').toLowerCase().trim();
      if (
        stuName === 'admin' ||
        stuName.includes('admincampushub') ||
        stuName.includes('system admin') ||
        stuEmail.startsWith('admin@') ||
        stuEmail.startsWith('faculty@') ||
        stuId.startsWith('adm') ||
        stuId.startsWith('fac')
      ) {
        return false;
      }
      const rollNum = parseInt(stu.id.replace(/\D/g, '') || '0', 10);
      if (b.includes('batch a') && rollNum % 2 === 0) return false;
      if (b.includes('batch b') && rollNum % 2 !== 0) return false;
      return true;
    });
  }, [mgmt.students, displayedStudents, selectedLab]);

  // Workstation attendance roster map
  const [labAttendanceRoster, setLabAttendanceRoster] = useState<
    Record<string, { workstationNo: string; status: 'Present' | 'Absent' | 'Late' | 'On-Duty'; marks: number; remarks: string }>
  >({});

  // Initialize or re-sync roster on lab change
  useEffect(() => {
    if (!selectedLab) return;
    const initial: Record<string, { workstationNo: string; status: 'Present' | 'Absent' | 'Late' | 'On-Duty'; marks: number; remarks: string }> = {};
    eligibleLabStudents.forEach((stu, idx) => {
      const wsNum = `WS-${String(idx + 1).padStart(2, '0')}`;
      const isPresent = (stu.attendancePercent || 85) >= 70;
      initial[stu.id] = {
        workstationNo: wsNum,
        status: isPresent ? 'Present' : 'Absent',
        marks: isPresent ? 9 : 0,
        remarks: isPresent ? 'Workstation verified' : 'Absent from lab session'
      };
    });
    setLabAttendanceRoster(initial);
  }, [selectedLab?.id, eligibleLabStudents.length]);

  const handleToggleLabStudentStatus = (studentId: string, nextStatus: 'Present' | 'Absent' | 'Late' | 'On-Duty') => {
    setLabAttendanceRoster((prev) => {
      const current = prev[studentId] || {
        workstationNo: 'WS-01',
        status: 'Present',
        marks: 9,
        remarks: ''
      };
      return {
        ...prev,
        [studentId]: {
          ...current,
          status: nextStatus,
          marks: nextStatus === 'Present' ? (current.marks || 9) : nextStatus === 'Late' ? 7 : nextStatus === 'On-Duty' ? 8 : 0,
          remarks: nextStatus === 'Present' ? 'Practical verified' : nextStatus === 'Late' ? 'Late check-in' : nextStatus === 'On-Duty' ? 'Authorized On-Duty' : 'Absent'
        }
      };
    });
  };

  const handleUpdateLabMarks = (studentId: string, marks: number) => {
    setLabAttendanceRoster((prev) => {
      const current = prev[studentId] || {
        workstationNo: 'WS-01',
        status: 'Present',
        marks: 0,
        remarks: ''
      };
      return {
        ...prev,
        [studentId]: {
          ...current,
          marks: Math.max(0, Math.min(20, marks))
        }
      };
    });
  };

  const handleUpdateLabRemarks = (studentId: string, remarks: string) => {
    setLabAttendanceRoster((prev) => {
      const current = prev[studentId] || {
        workstationNo: 'WS-01',
        status: 'Present',
        marks: 9,
        remarks: ''
      };
      return {
        ...prev,
        [studentId]: {
          ...current,
          remarks
        }
      };
    });
  };

  const handleMarkAllLab = (status: 'Present' | 'Absent') => {
    setLabAttendanceRoster((prev) => {
      const updated = { ...prev };
      eligibleLabStudents.forEach((stu, idx) => {
        const wsNum = `WS-${String(idx + 1).padStart(2, '0')}`;
        updated[stu.id] = {
          workstationNo: wsNum,
          status,
          marks: status === 'Present' ? 9 : 0,
          remarks: status === 'Present' ? 'All workstations checked in' : 'Absent'
        };
      });
      return updated;
    });
    showToast(`All student workstations marked as ${status}.`, 'info');
  };

  const handleSubmitLabSession = () => {
    if (!selectedLab) {
      showToast('Please select a valid scheduled practical lab.', 'error');
      return;
    }

    const records = eligibleLabStudents.map((stu, idx) => {
      const entry = labAttendanceRoster[stu.id] || {
        workstationNo: `WS-${String(idx + 1).padStart(2, '0')}`,
        status: 'Present' as const,
        marks: 9,
        remarks: ''
      };
      return {
        studentId: stu.id,
        studentName: stu.name,
        workstationNo: entry.workstationNo,
        status: entry.status,
        marks: entry.marks,
        remarks: entry.remarks
      };
    });

    const presentCount = records.filter((r) => r.status === 'Present' || r.status === 'Late' || r.status === 'On-Duty').length;
    const actualPresents = records.filter((r) => r.status === 'Present').length;
    const absentCount = records.filter((r) => r.status === 'Absent').length;
    const totalStudents = records.length;
    const attendancePct = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 100;

    const dayName = formatDisplayDay(selectedLabDate) || selectedLab.scheduleDay;

    const sessionRecord: LabSessionRecord = {
      id: `LAB-SESS-${Date.now()}`,
      labId: selectedLab.id,
      labCode: selectedLab.code,
      labName: selectedLab.name,
      courseCode: selectedLab.courseCode,
      facultyId: (user as any)?.id || selectedLab.facultyId,
      facultyName: user?.name || selectedLab.facultyName,
      date: selectedLabDate,
      day: dayName,
      batch: selectedLab.batch,
      labRoom: selectedLab.labRoom,
      experimentTitle: experimentTitle.trim() || 'Scheduled Practical Experiment',
      totalStudents,
      presentCount: actualPresents,
      absentCount,
      attendancePct,
      records,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    saveLabSession(sessionRecord);
    setLabSessionsList(getLabSessions());

    showToast(
      `Lab practical attendance locked & recorded for ${selectedLab.code} (${actualPresents}/${totalStudents} Present)!`,
      'success'
    );
  };

  // -------------------------------------------------------------
  // CELL TOGGLE HANDLER: 'P' (Present) -> 'X' (Absent) -> 'H' (Holiday) -> '' (Empty)
  // -------------------------------------------------------------
  const toggleAttendance = (studentId: string, dateStr: string) => {
    setMatrix((prev) => {
      const studentMap = { ...(prev[studentId] || {}) };
      const currentStatus = studentMap[dateStr] || '';
      const holiday = getHolidayInfo(dateStr);
      let nextStatus: AttendanceStatus = 'P';

      if (holiday.isHoliday) {
        // Sundays & Public Holidays cycle: H (Red) -> P (Special Class) -> X (Absent) -> H (Red)
        if (currentStatus === 'H' || currentStatus === '') {
          nextStatus = 'P';
        } else if (currentStatus === 'P') {
          nextStatus = 'X';
        } else {
          nextStatus = 'H';
        }
      } else {
        // Regular working days cycle: P (Green) -> X (Red) -> '' (if future) / P (if conducted)
        if (currentStatus === 'P') {
          nextStatus = 'X';
        } else if (currentStatus === 'X') {
          nextStatus = dateStr > currentCutoffDate ? '' : 'P';
        } else {
          nextStatus = 'P';
        }
      }

      studentMap[dateStr] = nextStatus;

      const updated = {
        ...prev,
        [studentId]: studentMap
      };

      safeSetStorage(matrixStorageKey, updated);
      return updated;
    });
  };

  // Bulk set for a specific date column
  const handleMarkAllForDate = (dateStr: string, status: AttendanceStatus) => {
    setMatrix((prev) => {
      const updated = { ...prev };
      displayedStudents.forEach((stu) => {
        updated[stu.id] = {
          ...(updated[stu.id] || {}),
          [dateStr]: status
        };
      });
      safeSetStorage(matrixStorageKey, updated);
      return updated;
    });
    showToast(
      status === ''
        ? `Cleared attendance for ${formatDisplayDate(dateStr)} (marked empty).`
        : status === 'H'
        ? `Marked ${formatDisplayDate(dateStr)} as Holiday ('H' in red) for all students.`
        : `Marked all students as '${status === 'P' ? 'Present (P)' : 'Absent (X)'}' for ${formatDisplayDate(dateStr)}.`,
      'info'
    );
  };

  // Bulk set for all conducted working dates up to cutoff (Sundays and holidays remain marked in red only)
  const handleMarkAllGlobal = (status: AttendanceStatus) => {
    setMatrix((prev) => {
      const updated = { ...prev };
      displayedStudents.forEach((stu) => {
        const studentMap = { ...(updated[stu.id] || {}) };
        dates.forEach((d) => {
          const holiday = getHolidayInfo(d);
          if (holiday.isHoliday) {
            studentMap[d] = 'H'; // Sundays & public holidays remain marked in red as Holiday ('H')
          } else if (d <= currentCutoffDate) {
            studentMap[d] = status;
          } else {
            studentMap[d] = '';
          }
        });
        updated[stu.id] = studentMap;
      });
      safeSetStorage(matrixStorageKey, updated);
      return updated;
    });
    showToast(
      `All conducted working dates up to ${formatDisplayDate(currentCutoffDate)} marked as '${status === 'P' ? 'Present (P)' : 'Absent (X)'}'. Sundays & holidays remain marked as Holiday ('H' in red).`,
      status === 'P' ? 'success' : 'warning'
    );
  };

  // Reset Register according to current cutoff
  const handleResetRegister = () => {
    const initial = generateInitialMatrix(dates, mgmt.students, currentCutoffDate);
    setMatrix(initial);
    safeSetStorage(matrixStorageKey, initial);
    showToast(`Attendance register reset up to current date (${formatDisplayDate(currentCutoffDate)}). Sundays & holidays marked as Holiday ('H' in red).`, 'info');
  };

  // Change Cutoff Date
  const handleChangeCutoff = (newCutoff: string) => {
    setCurrentCutoffDate(newCutoff);
    setMatrix((prev) => {
      const updated = { ...prev };
      mgmt.students.forEach((stu) => {
        const stuMap = { ...(updated[stu.id] || {}) };
        dates.forEach((d, idx) => {
          const holiday = getHolidayInfo(d);
          if (holiday.isHoliday) {
            stuMap[d] = 'H'; // Sundays & holidays are always red 'H'
          } else if (d <= newCutoff) {
            if (!stuMap[d] || stuMap[d] === 'H') {
              const targetPct = (stu.attendancePercent || 85) / 100;
              const charCode = (stu.id.charCodeAt(stu.id.length - 1) + idx * 7) % 100;
              stuMap[d] = charCode < (targetPct * 100) ? 'P' : 'X';
            }
          } else {
            stuMap[d] = '';
          }
        });
        updated[stu.id] = stuMap;
      });
      safeSetStorage(matrixStorageKey, updated);
      return updated;
    });
    showToast(`Attendance displayed up to ${formatDisplayDate(newCutoff)}. Sundays & holidays marked as Holiday ('H' in red).`, 'info');
  };

  // Change Active Academic Month
  const handleChangeMonth = (newMonth: string) => {
    setSelectedMonth(newMonth);
    const [yStr, mStr] = newMonth.split('-');
    const year = parseInt(yStr, 10) || 2026;
    const month = parseInt(mStr, 10) || 9;
    const monthDates = generateMonthDates(year, month);

    let newCutoff = `${newMonth}-13`;
    if (newMonth < '2026-09') {
      newCutoff = monthDates[monthDates.length - 1]; // All days conducted for past months
    } else if (newMonth > '2026-09') {
      newCutoff = monthDates[0]; // Future month
    } else {
      newCutoff = '2026-09-13'; // Active term date
    }

    setCurrentCutoffDate(newCutoff);
    const newDatesKey = `campushub_faculty_att_dates_${newMonth}_${selectedCourseCode}_${selectedSection}`;
    const newMatrixKey = `campushub_faculty_att_matrix_${newMonth}_${selectedCourseCode}_${selectedSection}`;

    const savedDates = safeGetStorage<string[]>(newDatesKey, monthDates);
    setDates(savedDates);
    const savedMatrix = safeGetStorage<AttendanceMatrix | null>(newMatrixKey, null);
    const resolvedMatrix = generateInitialMatrix(savedDates, mgmt.students, newCutoff, savedMatrix);
    setMatrix(resolvedMatrix);

    const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
    showToast(`Switched attendance register to ${monthName}. Sundays & holidays marked as Holiday ('H' in red).`, 'info');
  };

  // Add Date Column
  const handleAddDateConfirm = () => {
    if (!newDateInput) {
      showToast('Please select a valid lecture date.', 'error');
      return;
    }
    if (dates.includes(newDateInput)) {
      showToast('This date column already exists in the attendance register.', 'warning');
      return;
    }

    const holiday = getHolidayInfo(newDateInput);
    const updatedDates = [...dates, newDateInput].sort();
    setDates(updatedDates);
    safeSetStorage(datesStorageKey, updatedDates);

    setMatrix((prev) => {
      const updated = { ...prev };
      mgmt.students.forEach((stu) => {
        updated[stu.id] = {
          ...(updated[stu.id] || {}),
          [newDateInput]: holiday.isHoliday ? 'H' : newDateInput <= currentCutoffDate ? newDateDefaultStatus : ''
        };
      });
      safeSetStorage(matrixStorageKey, updated);
      return updated;
    });

    setIsAddDateModalOpen(false);
    showToast(`Added new lecture date column (${formatDisplayDate(newDateInput)}).`, 'success');
  };

  // Delete Date Column
  const handleDeleteDate = (dateToDelete: string) => {
    if (dates.length <= 1) {
      showToast('At least one date column must remain in the register.', 'warning');
      return;
    }
    const updatedDates = dates.filter((d) => d !== dateToDelete);
    setDates(updatedDates);
    safeSetStorage(datesStorageKey, updatedDates);

    setMatrix((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((stuId) => {
        const studentMap = { ...updated[stuId] };
        delete studentMap[dateToDelete];
        updated[stuId] = studentMap;
      });
      safeSetStorage(matrixStorageKey, updated);
      return updated;
    });

    showToast(`Removed date column (${formatDisplayDate(dateToDelete)}) from register.`, 'info');
  };

  // Save register & push to history
  const handleConfirmSave = () => {
    safeSetStorage(matrixStorageKey, matrix);
    safeSetStorage(datesStorageKey, dates);

    // Create a new audit history record for the active cutoff date
    const presentCountOnLatest = displayedStudents.filter((s) => matrix[s.id]?.[currentCutoffDate] === 'P').length;
    const absentCountOnLatest = displayedStudents.filter((s) => matrix[s.id]?.[currentCutoffDate] === 'X').length;
    const latestPct = Math.round((presentCountOnLatest / (displayedStudents.length || 1)) * 100);

    const newRecord: AttendanceHistoryRecord = {
      id: `att-hist-${Date.now()}`,
      date: formatDisplayDate(currentCutoffDate),
      courseCode: selectedCourseCode,
      section: `Section ${selectedSection}`,
      presentCount: presentCountOnLatest,
      absentCount: absentCountOnLatest,
      totalStudents: displayedStudents.length,
      percentage: latestPct
    };

    const updatedHistory = [newRecord, ...history];
    setHistory(updatedHistory);
    saveFacultyAttendanceHistory(updatedHistory);

    // Sync marked attendance to Supabase public.attendance table
    const recordsToSync = displayedStudents
      .map((s) => {
        const val = matrix[s.id]?.[currentCutoffDate];
        if (!val || val === 'H') return null;
        return {
          studentId: s.id,
          status: val === 'P' ? ('Present' as const) : ('Absent' as const),
          remarks: val === 'P' ? 'Attended lecture' : 'Absent from class'
        };
      })
      .filter(Boolean) as Array<{ studentId: string; status: 'Present' | 'Absent'; remarks: string }>;

    if (recordsToSync.length > 0) {
      dbService.syncAttendanceBatch({
        courseCode: selectedCourseCode,
        date: currentCutoffDate,
        records: recordsToSync,
        facultyId: (user as any)?.id
      }).then((res) => {
        if (res.success && res.insertedCount) {
          console.log(`Synced ${res.insertedCount} attendance records to Supabase.`);
        }
      }).catch((err) => {
        console.warn('Attendance sync notice:', err);
      });
    }

    // Auto-send shortage emails if checked
    if (autoEmailOnSave && shortageStudentsList.length > 0) {
      const currentCourse = courses.find((c) => c.code === selectedCourseCode);
      const payloads: SendShortageEmailParams[] = shortageStudentsList.map((item) => ({
        studentId: item.student.id,
        studentName: item.student.name,
        studentEmail: item.student.email,
        courseCode: selectedCourseCode,
        courseName: currentCourse?.name || 'Data Structures & Algorithms',
        facultyName: user?.name || 'Dr. Suresh Kumar',
        section: `Section ${selectedSection}`,
        conductedClasses: item.stuConducted,
        presentClasses: item.pCount,
        absentClasses: item.xCount,
        attendancePercentage: item.pct
      }));
      sendBulkAttendanceShortageEmails(payloads);
      setShortageEmails(getAttendanceShortageEmails());
    }

    setIsConfirmModalOpen(false);
    showToast(
      `Attendance Register saved & synced successfully for ${selectedCourseCode} (Section ${selectedSection})!${
        autoEmailOnSave && shortageStudentsList.length > 0 ? ` Shortage emails dispatched to ${shortageStudentsList.length} student(s).` : ''
      }`,
      'success'
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Roll Number',
      'Student Name',
      'Section',
      ...dates.map((d) => {
        const h = getHolidayInfo(d);
        return h.isHoliday ? `${formatDisplayDate(d)} (Holiday)` : formatDisplayDate(d);
      }),
      'Present (P)',
      'Absent (X)',
      'Holidays (H)',
      'Conducted Working Days',
      'Attendance %',
      'Shortage Status (Month-End)'
    ];

    const rows = displayedStudents.map((stu) => {
      const stuRecord = matrix[stu.id] || {};
      const pCount = dates.filter((d) => stuRecord[d] === 'P').length;
      const xCount = dates.filter((d) => stuRecord[d] === 'X').length;
      const hCount = dates.filter((d) => stuRecord[d] === 'H').length;
      const conducted = pCount + xCount;
      const pct = conducted > 0 ? Math.round((pCount / conducted) * 100) : 100;
      const statusStr = isMonthEnd
        ? pct >= 75
          ? 'Eligible'
          : 'Shortage'
        : pct >= 75
        ? 'On Track'
        : 'At Risk (Evaluated at Month-End)';

      const dateMarks = dates.map((d) => (stuRecord[d] ? stuRecord[d] : '-'));

      return [
        `"${stu.id}"`,
        `"${stu.name}"`,
        `"Section ${selectedSection}"`,
        ...dateMarks.map((m) => `"${m}"`),
        pCount,
        xCount,
        hCount,
        conducted,
        `"${pct}%"`,
        `"${statusStr}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Register_${selectedCourseCode}_Section_${selectedSection}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance register exported as CSV file.', 'success');
  };

  // Helpers to format dates
  function formatDisplayDate(dateStr: string) {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    } catch {
      return dateStr;
    }
  }

  function formatDisplayDay(dateStr: string) {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { weekday: 'short' });
    } catch {
      return '';
    }
  }

  // Summary Metrics
  const totalRosterCount = displayedStudents.length;
  const totalConductedCount = conductedDates.length;

  let totalActualPresents = 0;
  let totalActualAbsents = 0;
  let shortageCount = 0;

  displayedStudents.forEach((stu) => {
    const studentMap = matrix[stu.id] || {};
    const pCount = dates.filter((d) => studentMap[d] === 'P').length;
    const xCount = dates.filter((d) => studentMap[d] === 'X').length;
    const stuConducted = pCount + xCount;

    totalActualPresents += pCount;
    totalActualAbsents += xCount;

    const pct = stuConducted > 0 ? Math.round((pCount / stuConducted) * 100) : 100;
    if (pct < 75) shortageCount += 1;
  });

  const totalPossibleConducted = totalActualPresents + totalActualAbsents;
  const overallAvgPercentage = totalPossibleConducted > 0 ? Math.round((totalActualPresents / totalPossibleConducted) * 100) : 100;

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Faculty Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Attendance Register</span>
            </div>
            <h1 className="module-title">Class Attendance & Shortage Email Alerts</h1>
            <p className="module-subtitle">
              Mark attendance up to current date. When a student has an attendance shortage (&lt;75%), real-time official email notices are automatically dispatched.
            </p>
          </div>

          <div className="module-header-meta" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {shortageStudentsList.length > 0 && (
              <button
                type="button"
                className="c1-btn"
                style={{
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(244, 63, 94, 0.35)',
                  fontWeight: 700
                }}
                onClick={() => setIsEmailModalOpen(true)}
                title="Send official shortage email alerts to all impacted students"
              >
                <i className="fa-solid fa-paper-plane"></i>
                <span>Send Shortage Emails ({shortageStudentsList.length})</span>
              </button>
            )}

            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => setIsAddDateModalOpen(true)}
              title="Add a new lecture date column"
            >
              <i className="fa-solid fa-calendar-plus" style={{ color: '#818cf8' }}></i>
              <span>Add Date</span>
            </button>

            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={handleExportCSV}
              title="Download CSV Register"
            >
              <i className="fa-solid fa-file-excel" style={{ color: '#34d399' }}></i>
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setIsConfirmModalOpen(true)}
            >
              <i className="fa-solid fa-cloud-arrow-up"></i>
              <span>Save & Sync Register</span>
            </button>
          </div>
        </div>

        {/* Shortage Email Alert Banner (If Any Students < 75%) */}
        {shortageStudentsList.length > 0 && (
          <div className="shortage-email-alert-card">
            <div className="shortage-email-card-info">
              <div className="shortage-email-icon">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <strong style={{ color: '#fb7185', fontSize: '0.95rem', display: 'block' }}>
                  Attendance Shortage Alert Detected ({shortageStudentsList.length} Student{shortageStudentsList.length > 1 ? 's' : ''} &lt; 75%)
                </strong>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {shortageStudentsList.map((s) => s.student.name).join(', ')} currently have attendance below 75%. Real-time email warnings are ready for dispatch.
                </span>
              </div>
            </div>

            <button
              type="button"
              className="c1-btn"
              style={{
                background: '#f43f5e',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8125rem',
                padding: '7px 16px'
              }}
              onClick={() => setIsEmailModalOpen(true)}
            >
              <i className="fa-solid fa-envelope-open-text"></i>
              <span>Review & Send Email Notices</span>
            </button>
          </div>
        )}

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{totalRosterCount} Students</span>
              <span className="stat-label">Enrolled in {selectedCourseCode} (Sec {selectedSection})</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-calendar-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#38bdf8' }}>
                {conductedDates.length} Conducted Days
              </span>
              <span className="stat-label">Conducted Lectures ({holidaysInMonthCount} Holidays in Red - Symbol H)</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-chart-pie"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>{overallAvgPercentage}%</span>
              <span className="stat-label">Conducted Average Rate</span>
            </div>
          </div>

          <div
            className="c1-card academic-stat-card"
            style={{ cursor: shortageCount > 0 ? 'pointer' : 'default' }}
            onClick={() => shortageCount > 0 && setIsEmailModalOpen(true)}
          >
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-envelope-circle-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: shortageCount > 0 ? '#fb7185' : '#34d399' }}>
                {shortageCount} Shortages
              </span>
              <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>{shortageCount > 0 ? 'Click to Send Warning Emails' : 'All Students On Track (≥75%)'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="exam-section-tabs">
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
            onClick={() => setActiveTab('matrix')}
          >
            <i className="fa-solid fa-table-cells"></i>
            <span>Date-Wise Attendance Matrix</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'labs' ? 'active' : ''}`}
            onClick={() => setActiveTab('labs')}
            style={activeTab === 'labs' ? { borderBottomColor: '#a855f7', color: '#c084fc' } : {}}
          >
            <i className="fa-solid fa-flask-vial" style={{ color: '#c084fc' }}></i>
            <span>Scheduled Lab Attendance</span>
            {facultyLabs.length > 0 && (
              <span className="c1-badge" style={{ marginLeft: '6px', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', fontSize: '0.7rem', padding: '1px 6px' }}>
                {facultyLabs.length} Labs
              </span>
            )}
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <i className="fa-solid fa-clock-rotate-left"></i>
            <span>Session Logs ({history.length + labSessionsList.length})</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'emails' ? 'active' : ''}`}
            onClick={() => setActiveTab('emails')}
          >
            <i className="fa-solid fa-paper-plane"></i>
            <span>Shortage Email Logs ({shortageEmails.length})</span>
          </button>
        </div>

        {/* ============================================================
            TAB 1: DATE-WISE ATTENDANCE MATRIX
            ============================================================ */}
        {activeTab === 'matrix' && (
          <div className="attendance-marking-view">
            {/* Session Selector Toolbar & Current Date Cutoff Controls */}
            <div className="c1-card academic-filters-card" style={{ marginBottom: '20px' }}>
              <div className="filters-row-wrap" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Academic Month Selector */}
                  <div className="filter-select-item">
                    <label htmlFor="select-att-month" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fa-solid fa-calendar-days" style={{ fontSize: '10px', color: '#6366f1' }}></i>
                      <span>Academic Month</span>
                    </label>
                    <select
                      id="select-att-month"
                      className="c1-select"
                      value={selectedMonth}
                      onChange={(e) => handleChangeMonth(e.target.value)}
                      style={{ minWidth: '180px' }}
                    >
                      <option value="2026-09">September 2026 (Active Term)</option>
                      <option value="2026-08">August 2026</option>
                      <option value="2026-10">October 2026</option>
                      <option value="2026-11">November 2026</option>
                      <option value="2026-12">December 2026</option>
                    </select>
                  </div>

                  {/* Course Dropdown */}
                  <div className="filter-select-item">
                    <label htmlFor="select-att-course">Subject Course</label>
                    <select
                      id="select-att-course"
                      className="c1-select"
                      value={selectedCourseCode}
                      onChange={(e) => setSelectedCourseCode(e.target.value)}
                    >
                      {courses.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code}: {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Section Dropdown */}
                  <div className="filter-select-item">
                    <label htmlFor="select-att-sec">Section</label>
                    <select
                      id="select-att-sec"
                      className="c1-select"
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                    >
                      <option value="A">Section A (Room CSE-204)</option>
                      <option value="B">Section B (Computer Lab 2)</option>
                      <option value="All">All Sections (Combined)</option>
                    </select>
                  </div>

                  {/* Current Date Cutoff Picker */}
                  <div className="filter-select-item">
                    <label htmlFor="cutoff-date-input" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Current Date (Attendance Up To)</span>
                      <span className="c1-badge c1-badge-cyan" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                        Active Cutoff
                      </span>
                    </label>
                    <input
                      id="cutoff-date-input"
                      type="date"
                      className="c1-input"
                      value={currentCutoffDate}
                      onChange={(e) => handleChangeCutoff(e.target.value)}
                      style={{ padding: '7px 12px', minWidth: '150px' }}
                    />
                  </div>

                  {/* Search Student */}
                  <div className="filter-select-item">
                    <label htmlFor="search-student-att">Search Student</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="search-student-att"
                        type="text"
                        className="c1-input"
                        placeholder="Search student..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '32px', width: '180px' }}
                      />
                      <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}></i>
                    </div>
                  </div>

                  {/* Filter by Attendance Status */}
                  <div className="filter-select-item">
                    <label htmlFor="filter-att-status">Attendance Filter</label>
                    <select
                      id="filter-att-status"
                      className="c1-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                      <option value="All">All Students ({displayedStudents.length})</option>
                      <option value="Safe">Safe (&gt;= 75%)</option>
                      <option value="Shortage">At Risk (&lt; 75%)</option>
                    </select>
                  </div>
                </div>

                {/* Bulk Actions Toolbar */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    onClick={() => handleMarkAllGlobal('P')}
                    title="Mark all conducted dates as Present (P)"
                  >
                    <i className="fa-solid fa-check-double" style={{ color: '#10b981' }}></i>
                    <span>Mark Conducted as 'P'</span>
                  </button>

                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    onClick={() => handleMarkAllGlobal('X')}
                    title="Mark all conducted dates as Absent (X)"
                  >
                    <i className="fa-solid fa-xmark" style={{ color: '#f43f5e' }}></i>
                    <span>Mark Conducted as 'X'</span>
                  </button>

                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    onClick={handleResetRegister}
                    title="Reset to default attendance distribution"
                  >
                    <i className="fa-solid fa-arrow-rotate-left"></i>
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance Matrix Register Card */}
            <div className="c1-card attendance-matrix-card">
              <div className="c1-card-header" style={{ marginBottom: '14px' }}>
                <div>
                  <h3 className="c1-card-title">
                    {selectedCourseCode} (Section {selectedSection}) — {new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]) - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })} Attendance Register
                  </h3>
                  <p className="c1-card-subtitle">
                    Attendance recorded up to <strong>{formatDisplayDate(currentCutoffDate)}</strong>. Sundays and public holidays are marked in <strong>RED only as Holiday ('H')</strong>. Conducted lectures marked with green <strong>'P'</strong> / red <strong>'X'</strong>. Remaining days appear empty (white box).
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="c1-badge c1-badge-cyan">
                    <i className="fa-solid fa-calendar-days"></i> {conductedDates.length} Conducted Lectures / {dates.length} Days
                  </span>
                  <span className="c1-badge c1-badge-error" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                    <i className="fa-solid fa-calendar-xmark"></i> {holidaysInMonthCount} Holidays in Red (H)
                  </span>
                  <span className="c1-badge c1-badge-success">
                    <i className="fa-solid fa-users"></i> {displayedStudents.length} Students
                  </span>
                </div>
              </div>

              {/* Matrix Scrollable Table */}
              <div className="attendance-matrix-table-wrap">
                <table className="attendance-matrix-table">
                  <thead>
                    <tr>
                      {/* Sticky Left: Roll No */}
                      <th className="sticky-col-roll">Roll No</th>

                      {/* Sticky Left: Student Candidate */}
                      <th className="sticky-col-name">Student Candidate</th>

                      {/* Dynamic Date Columns */}
                      {dates.map((dateStr) => {
                        const holiday = getHolidayInfo(dateStr);
                        const isHoliday = holiday.isHoliday;
                        const presentOnDate = displayedStudents.filter((s) => matrix[s.id]?.[dateStr] === 'P').length;
                        const absentOnDate = displayedStudents.filter((s) => matrix[s.id]?.[dateStr] === 'X').length;
                        const isUpcoming = dateStr > currentCutoffDate && presentOnDate === 0 && absentOnDate === 0 && !isHoliday;

                        return (
                          <th key={dateStr} className={`matrix-date-header ${isHoliday ? 'is-holiday-column' : ''}`}>
                            <div className="matrix-date-header-inner">
                              <span className="matrix-date-day" style={isHoliday ? { color: '#ef4444', fontWeight: 800 } : {}}>
                                {holiday.isSunday ? 'SUN' : formatDisplayDay(dateStr)}
                              </span>
                              <span className="matrix-date-text" style={isHoliday ? { color: '#f87171', fontWeight: 800 } : {}}>
                                {formatDisplayDate(dateStr)}
                              </span>

                              {isHoliday ? (
                                <span
                                  className="matrix-date-stat-chip holiday-chip"
                                  title={`${holiday.name || 'Holiday'} (Holiday marked with 'H' in red)`}
                                >
                                  <i className="fa-solid fa-calendar-xmark" style={{ marginRight: '3px', fontSize: '0.6rem' }}></i>
                                  Holiday
                                </span>
                              ) : isUpcoming ? (
                                <span className="matrix-date-stat-chip" style={{ opacity: 0.6, fontSize: '0.6rem' }}>
                                  Empty
                                </span>
                              ) : (
                                <span className="matrix-date-stat-chip" title={`${presentOnDate} Present / ${absentOnDate} Absent`}>
                                  <strong style={{ color: '#34d399' }}>{presentOnDate}P</strong> / <span style={{ color: '#fb7185' }}>{absentOnDate}X</span>
                                </span>
                              )}

                              {/* Column Action Buttons */}
                              <div className="matrix-date-actions">
                                <button
                                  type="button"
                                  className="matrix-col-btn"
                                  title={`Mark all students Present (P) on ${formatDisplayDate(dateStr)}`}
                                  onClick={() => handleMarkAllForDate(dateStr, 'P')}
                                >
                                  P
                                </button>
                                <button
                                  type="button"
                                  className="matrix-col-btn"
                                  title={`Mark all students Absent (X) on ${formatDisplayDate(dateStr)}`}
                                  onClick={() => handleMarkAllForDate(dateStr, 'X')}
                                >
                                  X
                                </button>
                                <button
                                  type="button"
                                  className="matrix-col-btn"
                                  style={{ color: '#ef4444', fontWeight: 800 }}
                                  title={`Mark ${formatDisplayDate(dateStr)} as Holiday ('H' in red)`}
                                  onClick={() => handleMarkAllForDate(dateStr, 'H')}
                                >
                                  H
                                </button>
                                <button
                                  type="button"
                                  className="matrix-col-btn btn-del"
                                  title={`Clear date / remove`}
                                  onClick={() => handleDeleteDate(dateStr)}
                                >
                                  <i className="fa-solid fa-trash" style={{ fontSize: '0.55rem' }}></i>
                                </button>
                              </div>
                            </div>
                          </th>
                        );
                      })}

                      {/* Summary Columns (Right) */}
                      <th className="matrix-summary-header" title="Total Present Count (Conducted Working Days)">Total P</th>
                      <th className="matrix-summary-header" title="Total Absent Count (Conducted Working Days)">Total X</th>
                      <th className="matrix-summary-header" title="Calculated Attendance Percentage">% Att.</th>
                      <th className="matrix-summary-header" title="Shortage Status & Real-Time Alert Action">
                        Shortage & Email Alert
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {displayedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={dates.length + 6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                          <i className="fa-solid fa-user-slash" style={{ fontSize: '2rem', marginBottom: '8px', display: 'block' }}></i>
                          No students found matching the selected filters.
                        </td>
                      </tr>
                    ) : (
                      displayedStudents.map((stu) => {
                        const studentMap = matrix[stu.id] || {};
                        const pCount = dates.filter((d) => studentMap[d] === 'P').length;
                        const xCount = dates.filter((d) => studentMap[d] === 'X').length;
                        const stuConducted = pCount + xCount;
                        const pct = stuConducted > 0 ? Math.round((pCount / stuConducted) * 100) : 100;
                        const isSafe = pct >= 75;

                        return (
                          <tr key={stu.id}>
                            {/* Sticky Left: Roll No */}
                            <td className="sticky-col-roll">
                              <span className="course-code-cell" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                                {stu.id}
                              </span>
                            </td>

                            {/* Sticky Left: Student Name */}
                            <td className="sticky-col-name">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    background: isSafe ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                                    color: isSafe ? '#34d399' : '#fb7185',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    flexShrink: 0
                                  }}
                                >
                                  {stu.name.charAt(0)}
                                </div>
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.8125rem' }}>
                                    {stu.name}
                                  </strong>
                                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                                    Sec {stu.section || selectedSection}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Dynamic Date Cells: 'H' in RED for Sundays & Holidays, 'P' in Green, 'X' in Red, or Empty White Box */}
                            {dates.map((dateStr) => {
                              const status = studentMap[dateStr] || '';
                              const holiday = getHolidayInfo(dateStr);
                              const isPresent = status === 'P';
                              const isAbsent = status === 'X';
                              const isHolidayMark = status === 'H' || (holiday.isHoliday && !isPresent && !isAbsent);

                              return (
                                <td key={dateStr} className={`attendance-cell-td ${holiday.isHoliday ? 'holiday-cell' : ''}`}>
                                  <button
                                    type="button"
                                    className={`attendance-mark-btn ${
                                      isHolidayMark
                                        ? 'status-h status-holiday'
                                        : isPresent
                                        ? 'status-p'
                                        : isAbsent
                                        ? 'status-x'
                                        : 'status-empty'
                                    }`}
                                    onClick={() => toggleAttendance(stu.id, dateStr)}
                                    title={
                                      isHolidayMark
                                        ? `${stu.name} - ${holiday.name || 'Holiday'} (Marked in RED as 'H' - Holiday / Off Day). Click to toggle.`
                                        : isPresent
                                        ? `${stu.name} (${formatDisplayDate(dateStr)}): Present (Green P). Click to toggle.`
                                        : isAbsent
                                        ? `${stu.name} (${formatDisplayDate(dateStr)}): Absent (Red X). Click to toggle.`
                                        : `${stu.name} (${formatDisplayDate(dateStr)}): Empty / Upcoming. Click to toggle.`
                                    }
                                  >
                                    {isHolidayMark ? 'H' : isPresent ? 'P' : isAbsent ? 'X' : ''}
                                  </button>
                                </td>
                              );
                            })}

                            {/* Summary Columns */}
                            <td className="matrix-summary-cell" style={{ color: '#34d399', fontWeight: 800 }}>
                              {pCount}
                            </td>
                            <td className="matrix-summary-cell" style={{ color: '#fb7185', fontWeight: 800 }}>
                              {xCount}
                            </td>
                            <td className="matrix-summary-cell">
                              <span className={`matrix-pct-badge ${pct >= 75 ? 'safe' : pct >= 65 ? 'warning' : 'critical'}`}>
                                {pct}%
                              </span>
                            </td>
                            <td className="matrix-summary-cell">
                              {isSafe ? (
                                <span className="c1-badge c1-badge-success" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                                  <i className="fa-solid fa-check"></i> On Track
                                </span>
                              ) : (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <span className="c1-badge c1-badge-error" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                                    <i className="fa-solid fa-triangle-exclamation"></i> Shortage
                                  </span>
                                  <button
                                    type="button"
                                    className="student-row-email-btn"
                                    onClick={() => handleSendSingleEmail(stu)}
                                    title={`Dispatch immediate shortage email alert to ${stu.name}`}
                                  >
                                    <i className="fa-solid fa-paper-plane"></i>
                                    <span>Send Email</span>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>

                  {/* Table Footer: Class Sum per Date */}
                  {displayedStudents.length > 0 && (
                    <tfoot className="matrix-tfoot">
                      <tr>
                        <td className="sticky-col-roll" style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                          Session Total
                        </td>
                        <td className="sticky-col-name" style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>
                          Conducted Summary
                        </td>

                        {dates.map((dateStr) => {
                          const holiday = getHolidayInfo(dateStr);
                          const pTotal = displayedStudents.filter((s) => matrix[s.id]?.[dateStr] === 'P').length;
                          const xTotal = displayedStudents.filter((s) => matrix[s.id]?.[dateStr] === 'X').length;
                          const markedTotal = pTotal + xTotal;

                          if (holiday.isHoliday && markedTotal === 0) {
                            return (
                              <td key={dateStr} style={{ textAlign: 'center', padding: '8px 4px', background: 'rgba(239, 68, 68, 0.06)' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ef4444' }}>
                                  HOLIDAY
                                </div>
                                <div style={{ fontSize: '0.62rem', color: '#f87171' }} title={holiday.name}>
                                  Holiday (H)
                                </div>
                              </td>
                            );
                          }

                          if (markedTotal === 0) {
                            return (
                              <td key={dateStr} style={{ textAlign: 'center', padding: '8px 4px', color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
                                —
                              </td>
                            );
                          }

                          const rate = Math.round((pTotal / markedTotal) * 100);

                          return (
                            <td key={dateStr} style={{ textAlign: 'center', padding: '8px 4px' }}>
                              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34d399' }}>{pTotal}P</div>
                              <div style={{ fontSize: '0.6875rem', color: '#fb7185' }}>{xTotal}X</div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{rate}%</div>
                            </td>
                          );
                        })}

                        <td className="matrix-summary-cell" style={{ color: '#34d399', fontWeight: 800 }}>
                          {totalActualPresents}
                        </td>
                        <td className="matrix-summary-cell" style={{ color: '#fb7185', fontWeight: 800 }}>
                          {totalActualAbsents}
                        </td>
                        <td className="matrix-summary-cell">
                          <strong style={{ color: '#38bdf8' }}>{overallAvgPercentage}%</strong>
                        </td>
                        <td className="matrix-summary-cell">
                          <span className="c1-badge c1-badge-cyan" style={{ fontSize: '0.6875rem' }}>
                            {isMonthEnd ? 'Finalized' : 'In Progress'}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Attendance Visual Legend */}
              <div className="attendance-legend-container">
                <div className="legend-items-group">
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Legend / Guide:</span>
                  <div className="legend-item">
                    <span className="legend-chip chip-h">H</span>
                    <span><strong>Sundays & Holidays</strong> — Marked in <strong>RED as 'H'</strong> (Holiday / Non-working off day)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-chip chip-p">P</span>
                    <span><strong>Present (P)</strong> — Marked in green</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-chip chip-x">X</span>
                    <span><strong>Absent (X)</strong> — Marked with an 'X'</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-chip chip-empty"></span>
                    <span><strong>Remaining Working Days</strong> — Empty white box (unconducted)</span>
                  </div>
                </div>

                <div className="legend-items-group">
                  <div className="legend-item">
                    <span className="matrix-pct-badge safe">&gt;= 75%</span>
                    <span>Safe (&gt;= 75%)</span>
                  </div>
                  <div className="legend-item">
                    <span className="c1-badge c1-badge-error" style={{ fontSize: '0.7rem' }}>
                      <i className="fa-solid fa-paper-plane"></i> Real-Time Email
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Emails sent automatically when attendance falls below 75%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 2: SCHEDULED LAB PRACTICAL ATTENDANCE
            ============================================================ */}
        {activeTab === 'labs' && (
          <div className="scheduled-lab-attendance-view" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Lab Session Selector & Parameters Card */}
            <div className="c1-card academic-filters-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 className="c1-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-flask-vial" style={{ color: '#a855f7' }}></i>
                    <span>Mark Today's Scheduled Lab Session</span>
                  </h3>
                  <p className="c1-card-subtitle">
                    Select your scheduled practical lab course, verify workstation roll-call, and lock student continuous attendance.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    style={{ fontSize: '0.8rem', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                    onClick={() => handleMarkAllLab('Present')}
                  >
                    <i className="fa-solid fa-check-double"></i>
                    <span>Mark All Present</span>
                  </button>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    style={{ fontSize: '0.8rem', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                    onClick={() => handleMarkAllLab('Absent')}
                  >
                    <i className="fa-solid fa-xmark"></i>
                    <span>Mark All Absent</span>
                  </button>
                  <button
                    type="button"
                    className="c1-btn c1-btn-gradient"
                    style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' }}
                    onClick={handleSubmitLabSession}
                  >
                    <i className="fa-solid fa-lock"></i>
                    <span>Submit & Lock Lab Attendance</span>
                  </button>
                </div>
              </div>

              {/* Lab Selection Controls Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                {/* Lab Practical Selector */}
                <div className="filter-select-item">
                  <label htmlFor="select-faculty-lab" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fa-solid fa-microchip" style={{ color: '#c084fc', fontSize: '11px' }}></i>
                    <span>Assigned Lab Course</span>
                  </label>
                  <select
                    id="select-faculty-lab"
                    className="c1-select"
                    value={selectedLabId}
                    onChange={(e) => setSelectedLabId(e.target.value)}
                  >
                    {facultyLabs.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.code}: {l.name} ({l.scheduleDay})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Session Date Picker */}
                <div className="filter-select-item">
                  <label htmlFor="select-lab-date" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fa-solid fa-calendar-day" style={{ color: 'var(--accent-blue)', fontSize: '11px' }}></i>
                    <span>Practical Session Date</span>
                  </label>
                  <input
                    id="select-lab-date"
                    type="date"
                    className="c1-input"
                    value={selectedLabDate}
                    onChange={(e) => setSelectedLabDate(e.target.value)}
                  />
                </div>

                {/* Verification Mode */}
                <div className="filter-select-item">
                  <label htmlFor="select-lab-mode" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fa-solid fa-fingerprint" style={{ color: '#10b981', fontSize: '11px' }}></i>
                    <span>Verification Mode</span>
                  </label>
                  <select
                    id="select-lab-mode"
                    className="c1-select"
                    value={labVerificationMode}
                    onChange={(e) => setLabVerificationMode(e.target.value as any)}
                  >
                    <option value="Workstation Biometric Terminal">Workstation Biometric Terminal</option>
                    <option value="Manual Roll-Call">Manual Roll-Call</option>
                    <option value="Continuous Viva Assessment">Continuous Viva Assessment</option>
                  </select>
                </div>
              </div>

              {/* Experiment Title & Topic Input */}
              <div style={{ marginTop: '14px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Experiment / Practical Syllabus Topic
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. Experiment 4: Implementation of RPC & Socket Programming"
                    value={experimentTitle}
                    onChange={(e) => setExperimentTitle(e.target.value)}
                  />
                </div>

                {selectedLab && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end', paddingTop: '18px' }}>
                    <span className="c1-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '6px 10px' }}>
                      <i className="fa-solid fa-clock" style={{ marginRight: '5px' }}></i>
                      {selectedLab.scheduleDay}, {selectedLab.scheduleTime}
                    </span>
                    <span className="c1-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '6px 10px' }}>
                      <i className="fa-solid fa-location-dot" style={{ marginRight: '5px' }}></i>
                      {selectedLab.labRoom}
                    </span>
                    <span className="c1-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '6px 10px' }}>
                      <i className="fa-solid fa-users" style={{ marginRight: '5px' }}></i>
                      {selectedLab.batch}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Live Lab Session Statistics Card */}
            {(() => {
              const records = eligibleLabStudents.map((stu) => labAttendanceRoster[stu.id] || { status: 'Present', marks: 9 });
              const presents = records.filter((r) => r.status === 'Present').length;
              const absents = records.filter((r) => r.status === 'Absent').length;
              const lates = records.filter((r) => r.status === 'Late').length;
              const ods = records.filter((r) => r.status === 'On-Duty').length;
              const total = eligibleLabStudents.length || 1;
              const rate = Math.round(((presents + lates + ods) / total) * 100);
              const avgScore = (records.reduce((sum, r) => sum + (r.marks || 0), 0) / (total || 1)).toFixed(1);

              return (
                <div className="academic-stats-grid">
                  <div className="c1-card academic-stat-card">
                    <div className="stat-card-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                      <i className="fa-solid fa-desktop"></i>
                    </div>
                    <div className="stat-card-data">
                      <span className="stat-num">{eligibleLabStudents.length}</span>
                      <span className="stat-label">Active Workstations</span>
                    </div>
                  </div>

                  <div className="c1-card academic-stat-card">
                    <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                      <i className="fa-solid fa-user-check"></i>
                    </div>
                    <div className="stat-card-data">
                      <span className="stat-num" style={{ color: '#34d399' }}>{presents} Present</span>
                      <span className="stat-label">{lates} Late • {ods} On-Duty</span>
                    </div>
                  </div>

                  <div className="c1-card academic-stat-card">
                    <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
                      <i className="fa-solid fa-user-xmark"></i>
                    </div>
                    <div className="stat-card-data">
                      <span className="stat-num" style={{ color: '#fb7185' }}>{absents} Absent</span>
                      <span className="stat-label">Unoccupied Terminals</span>
                    </div>
                  </div>

                  <div className="c1-card academic-stat-card">
                    <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                      <i className="fa-solid fa-chart-line"></i>
                    </div>
                    <div className="stat-card-data">
                      <span className="stat-num" style={{ color: '#38bdf8' }}>{rate}% ({avgScore}/10)</span>
                      <span className="stat-label">Session Rate & Avg Score</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Workstation Roll-Call Roster Table */}
            <div className="c1-card student-roster-card">
              <div className="c1-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 className="c1-card-title">
                    Workstation Seat Allocation & Attendance Roll-Call ({eligibleLabStudents.length} Students)
                  </h3>
                  <p className="c1-card-subtitle">
                    Assigned terminals for {selectedLab?.code} ({selectedLab?.name}) • {selectedLab?.labRoom}
                  </p>
                </div>
                <span className="c1-badge c1-badge-cyan">
                  <i className="fa-solid fa-wifi" style={{ marginRight: '4px' }}></i>
                  Terminal Gateway Connected
                </span>
              </div>

              <div className="student-roster-table-wrap">
                <table className="c1-table">
                  <thead>
                    <tr>
                      <th style={{ width: '130px' }}>Workstation</th>
                      <th>Roll Number</th>
                      <th>Student Name</th>
                      <th style={{ textAlign: 'center' }}>Attendance Status</th>
                      <th style={{ width: '120px' }}>Viva Marks (/10)</th>
                      <th>Practical Notes & Execution Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligibleLabStudents.map((stu, idx) => {
                      const entry = labAttendanceRoster[stu.id] || {
                        workstationNo: `WS-${String(idx + 1).padStart(2, '0')}`,
                        status: 'Present' as const,
                        marks: 9,
                        remarks: 'Workstation verified'
                      };

                      return (
                        <tr key={stu.id}>
                          <td>
                            <span
                              className="c1-badge"
                              style={{
                                background: 'rgba(99, 102, 241, 0.12)',
                                color: '#818cf8',
                                border: '1px solid rgba(99, 102, 241, 0.25)',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                padding: '4px 8px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <i className="fa-solid fa-desktop"></i>
                              {entry.workstationNo}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                              {stu.id}
                            </strong>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                  color: '#fff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: 700
                                }}
                              >
                                {stu.name.charAt(0)}
                              </div>
                              <div>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{stu.name}</span>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{stu.department}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                              <button
                                type="button"
                                className="c1-btn"
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  background: entry.status === 'Present' ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                                  color: entry.status === 'Present' ? '#ffffff' : 'var(--text-secondary)',
                                  border: entry.status === 'Present' ? '1px solid #10b981' : '1px solid var(--border-color)',
                                  borderRadius: '6px'
                                }}
                                onClick={() => handleToggleLabStudentStatus(stu.id, 'Present')}
                                title="Mark Present"
                              >
                                P (Present)
                              </button>

                              <button
                                type="button"
                                className="c1-btn"
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  background: entry.status === 'Absent' ? '#f43f5e' : 'rgba(255, 255, 255, 0.05)',
                                  color: entry.status === 'Absent' ? '#ffffff' : 'var(--text-secondary)',
                                  border: entry.status === 'Absent' ? '1px solid #f43f5e' : '1px solid var(--border-color)',
                                  borderRadius: '6px'
                                }}
                                onClick={() => handleToggleLabStudentStatus(stu.id, 'Absent')}
                                title="Mark Absent"
                              >
                                X (Absent)
                              </button>

                              <button
                                type="button"
                                className="c1-btn"
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  background: entry.status === 'Late' ? '#f59e0b' : 'rgba(255, 255, 255, 0.05)',
                                  color: entry.status === 'Late' ? '#ffffff' : 'var(--text-secondary)',
                                  border: entry.status === 'Late' ? '1px solid #f59e0b' : '1px solid var(--border-color)',
                                  borderRadius: '6px'
                                }}
                                onClick={() => handleToggleLabStudentStatus(stu.id, 'Late')}
                                title="Mark Late Check-in"
                              >
                                L (Late)
                              </button>

                              <button
                                type="button"
                                className="c1-btn"
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  background: entry.status === 'On-Duty' ? '#38bdf8' : 'rgba(255, 255, 255, 0.05)',
                                  color: entry.status === 'On-Duty' ? '#ffffff' : 'var(--text-secondary)',
                                  border: entry.status === 'On-Duty' ? '1px solid #38bdf8' : '1px solid var(--border-color)',
                                  borderRadius: '6px'
                                }}
                                onClick={() => handleToggleLabStudentStatus(stu.id, 'On-Duty')}
                                title="Mark Authorized On-Duty"
                              >
                                OD
                              </button>
                            </div>
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="10"
                              className="c1-input"
                              style={{ width: '80px', padding: '4px 8px', textAlign: 'center', fontWeight: 700 }}
                              value={entry.marks}
                              onChange={(e) => handleUpdateLabMarks(stu.id, Number(e.target.value))}
                              disabled={entry.status === 'Absent'}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="c1-input"
                              style={{ width: '100%', padding: '4px 8px', fontSize: '0.8125rem' }}
                              value={entry.remarks}
                              placeholder="Notes / code execution status..."
                              onChange={(e) => handleUpdateLabRemarks(stu.id, e.target.value)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Submit Action Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.01)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Showing {eligibleLabStudents.length} assigned workstations for {selectedLab?.name}.
                </span>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', padding: '10px 24px', fontSize: '0.9rem' }}
                  onClick={handleSubmitLabSession}
                >
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>Submit & Lock Lab Attendance</span>
                </button>
              </div>
            </div>

            {/* Previous Conducted Lab Sessions History */}
            {labSessionsList.length > 0 && (
              <div className="c1-card attendance-history-card">
                <div className="c1-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 className="c1-card-title">Conducted Practical Lab Sessions History</h3>
                    <p className="c1-card-subtitle">Saved practical roll-calls, experiment titles, and workstation logs</p>
                  </div>
                  <span className="c1-badge c1-badge-cyan">{labSessionsList.length} Practical Sessions Recorded</span>
                </div>

                <div className="history-table-wrap">
                  <table className="c1-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Lab Course</th>
                        <th>Experiment Syllabus Topic</th>
                        <th>Batch & Room</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Attendance %</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labSessionsList.map((sess) => (
                        <tr key={sess.id}>
                          <td>
                            <strong>{sess.date}</strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sess.day} • {sess.timestamp}</div>
                          </td>
                          <td>
                            <span className="course-code-cell" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                              {sess.labCode}
                            </span>
                          </td>
                          <td>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{sess.experimentTitle}</span>
                          </td>
                          <td>
                            <div>{sess.batch}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sess.labRoom}</div>
                          </td>
                          <td>
                            <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>{sess.presentCount} Students</span>
                          </td>
                          <td>
                            <span style={{ color: 'var(--color-error)', fontWeight: 700 }}>{sess.absentCount} Students</span>
                          </td>
                          <td>
                            <span className="matrix-pct-badge safe">{sess.attendancePct}%</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="c1-btn c1-btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#c084fc' }}
                              onClick={() => setPreviewLabSession(sess)}
                            >
                              <i className="fa-solid fa-eye"></i>
                              <span>View Roster</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 3: ATTENDANCE HISTORY
            ============================================================ */}
        {activeTab === 'history' && (
          <div className="c1-card attendance-history-card">
            <div className="c1-card-header">
              <div>
                <h3 className="c1-card-title">Past Attendance Records & Audit Logs</h3>
                <p className="c1-card-subtitle">Historical log of submitted roll calls and section statistics</p>
              </div>
              <span className="c1-badge c1-badge-cyan">{history.length} Sessions Logged</span>
            </div>

            <div className="history-table-wrap">
              <table className="c1-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Course Code</th>
                    <th>Section</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Attendance %</th>
                    <th>Audit Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((rec) => (
                    <tr key={rec.id}>
                      <td><strong>{rec.date}</strong></td>
                      <td><span className="course-code-cell">{rec.courseCode}</span></td>
                      <td>{rec.section}</td>
                      <td><span style={{ color: 'var(--color-success)', fontWeight: 700 }}>{rec.presentCount} Students</span></td>
                      <td><span style={{ color: 'var(--color-error)', fontWeight: 700 }}>{rec.absentCount} Students</span></td>
                      <td>
                        <strong style={{ color: '#38bdf8' }}>{rec.percentage}%</strong>
                      </td>
                      <td>
                        <span className="c1-badge c1-badge-success">
                          <i className="fa-solid fa-check"></i> Recorded
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 3: SHORTAGE EMAIL LOGS & ALERTS
            ============================================================ */}
        {activeTab === 'emails' && (
          <div className="c1-card attendance-history-card">
            <div className="c1-card-header">
              <div>
                <h3 className="c1-card-title">Real-Time Attendance Shortage Email Notices</h3>
                <p className="c1-card-subtitle">Audit trail of official email alerts sent to students with attendance &lt; 75%</p>
              </div>
              <button
                type="button"
                className="c1-btn c1-btn-gradient"
                onClick={() => setIsEmailModalOpen(true)}
              >
                <i className="fa-solid fa-paper-plane"></i>
                <span>Dispatch New Email Alert</span>
              </button>
            </div>

            {shortageEmails.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-envelope-circle-check" style={{ fontSize: '2.5rem', marginBottom: '10px', display: 'block', color: 'var(--color-success)' }}></i>
                No shortage emails have been dispatched yet. All students are currently maintaining satisfactory attendance.
              </div>
            ) : (
              <div className="history-table-wrap">
                <table className="c1-table">
                  <thead>
                    <tr>
                      <th>Dispatch Timestamp</th>
                      <th>Student Candidate</th>
                      <th>Recipient Email</th>
                      <th>Course & Section</th>
                      <th>Attendance Record</th>
                      <th>Delivery Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shortageEmails.map((eml) => (
                      <tr key={eml.id}>
                        <td>
                          <strong>{eml.sentAt}</strong>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{eml.studentName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Roll: {eml.studentId}</div>
                        </td>
                        <td>
                          <span className="course-code-cell" style={{ fontSize: '0.75rem' }}>
                            {eml.studentEmail}
                          </span>
                        </td>
                        <td>
                          <div><strong>{eml.courseCode}</strong></div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{eml.section}</div>
                        </td>
                        <td>
                          <span className="matrix-pct-badge critical" style={{ fontSize: '0.75rem' }}>
                            {eml.attendancePercentage}% ({eml.presentClasses}P / {eml.conductedClasses} Total)
                          </span>
                        </td>
                        <td>
                          <span className="c1-badge c1-badge-success" style={{ fontSize: '0.72rem' }}>
                            <i className="fa-solid fa-circle-check"></i> {eml.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="c1-btn c1-btn-secondary"
                            style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                            onClick={() => setPreviewEmailItem(eml)}
                          >
                            <i className="fa-solid fa-eye"></i> View Notice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            MODAL 1: SEND SHORTAGE EMAILS DISPATCH DIALOG
            ============================================================ */}
        {isEmailModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsEmailModalOpen(false)}
            title="Real-Time Attendance Shortage Email Dispatch"
            maxWidth="md"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="email-urgent-banner">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>
                  The following {shortageStudentsList.length} student(s) currently have attendance below the mandatory 75% university requirement.
                </span>
              </div>

              {/* Student Shortage Table */}
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <table className="c1-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Recipient Email</th>
                      <th>Conducted</th>
                      <th>Present</th>
                      <th>Current %</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shortageStudentsList.map((item) => (
                      <tr key={item.student.id}>
                        <td><span className="course-code-cell">{item.student.id}</span></td>
                        <td><strong>{item.student.name}</strong></td>
                        <td><span style={{ color: 'var(--text-secondary)' }}>{item.student.email || `${item.student.name.toLowerCase().replace(/\s+/g, '')}@campushub.edu`}</span></td>
                        <td>{item.stuConducted} Days</td>
                        <td><span style={{ color: '#34d399', fontWeight: 700 }}>{item.pCount}P</span></td>
                        <td>
                          <span className="matrix-pct-badge critical" style={{ fontSize: '0.72rem' }}>
                            {item.pct}%
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="student-row-email-btn"
                            onClick={() => handleSendSingleEmail(item.student)}
                          >
                            <i className="fa-solid fa-paper-plane"></i> Send
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Live Email Letter Preview */}
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
                  Official Email Template Preview (Automated Real-Time Notice)
                </label>
                <div className="email-preview-container">
                  <div className="email-letterhead">
                    <div className="email-letterhead-title">CampusHub University Academic Directorate</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Department of Computer Science & Engineering • Office of the Registrar</div>
                  </div>

                  <div className="email-header-meta-row">
                    <div><strong>Subject:</strong> URGENT: Academic Attendance Shortage Notice (&lt;75%) - {selectedCourseCode}</div>
                    <div><strong>From:</strong> Academic Affairs &lt;attendance-alerts@campushub.edu&gt;</div>
                    <div><strong>Faculty In-Charge:</strong> {user?.name || 'Dr. Suresh Kumar'}</div>
                  </div>

                  <p>Dear Student Candidate,</p>
                  <p>
                    This is an automated formal notification from the Faculty Office regarding your attendance record in <strong>{selectedCourseCode} ({`Section ${selectedSection}`})</strong>.
                  </p>

                  <table className="email-stats-table">
                    <tbody>
                      <tr>
                        <td><strong>Total Conducted Sessions:</strong></td>
                        <td>{totalConductedCount} Lectures</td>
                      </tr>
                      <tr>
                        <td><strong>Mandatory University Threshold:</strong></td>
                        <td>75.0% Attendance</td>
                      </tr>
                      <tr>
                        <td><strong>Current Candidate Status:</strong></td>
                        <td style={{ color: '#fb7185', fontWeight: 700 }}>ATTENDANCE SHORTAGE DETECTED</td>
                      </tr>
                    </tbody>
                  </table>

                  <p>
                    <strong>Action Required:</strong> Candidates falling short of 75% attendance at semester-end risk examination detention. Please consult your course instructor immediately to arrange academic compensatory sessions.
                  </p>
                </div>
              </div>

              <div className="modal-dialog-footer" style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsEmailModalOpen(false)}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="c1-btn"
                  style={{
                    background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(244, 63, 94, 0.4)'
                  }}
                  onClick={handleSendBulkEmails}
                  disabled={isSendingEmails}
                >
                  <i className={`fa-solid ${isSendingEmails ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                  <span>{isSendingEmails ? 'Dispatching Emails...' : `Dispatch Emails to All (${shortageStudentsList.length})`}</span>
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ============================================================
            MODAL 2: VIEW DISPATCHED EMAIL BODY
            ============================================================ */}
        {previewEmailItem && (
          <Modal
            isOpen={true}
            onClose={() => setPreviewEmailItem(null)}
            title="Dispatched Email Notice Details"
            maxWidth="md"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="email-header-meta-row">
                <div><strong>Message ID:</strong> {previewEmailItem.id}</div>
                <div><strong>Sent To:</strong> {previewEmailItem.studentName} &lt;{previewEmailItem.studentEmail}&gt;</div>
                <div><strong>Date & Time:</strong> {previewEmailItem.sentAt}</div>
                <div><strong>Subject:</strong> {previewEmailItem.subject}</div>
                <div><strong>Delivery Status:</strong> <span className="c1-badge c1-badge-success">{previewEmailItem.status}</span></div>
              </div>

              <pre style={{
                background: 'var(--bg-surface-2, #181c28)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontFamily: 'monospace',
                fontSize: '0.8125rem',
                whiteSpace: 'pre-wrap',
                color: 'var(--text-primary)',
                lineHeight: 1.6,
                maxHeight: '340px',
                overflowY: 'auto'
              }}>
                {previewEmailItem.messageText}
              </pre>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setPreviewEmailItem(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ============================================================
            MODAL 3: ADD LECTURE DATE COLUMN
            ============================================================ */}
        {isAddDateModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsAddDateModalOpen(false)}
            title="Add Lecture Attendance Date"
            maxWidth="sm"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="filter-select-item" style={{ width: '100%' }}>
                <label htmlFor="modal-date-picker">Lecture Date</label>
                <input
                  id="modal-date-picker"
                  type="date"
                  className="c1-input"
                  value={newDateInput}
                  onChange={(e) => setNewDateInput(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px' }}
                />
              </div>

              <div className="filter-select-item" style={{ width: '100%' }}>
                <label htmlFor="modal-default-status">Default Initial Status</label>
                <select
                  id="modal-default-status"
                  className="c1-select"
                  value={newDateDefaultStatus}
                  onChange={(e) => setNewDateDefaultStatus(e.target.value as AttendanceStatus)}
                  style={{ width: '100%' }}
                >
                  <option value="P">Mark All as 'P' (Present in Green) by default</option>
                  <option value="X">Mark All as 'X' (Absent in Red) by default</option>
                  <option value="H">Mark as Sunday / Holiday ('H' in Red)</option>
                  <option value="">Leave as Empty (White Box)</option>
                </select>
              </div>

              <div className="modal-dialog-footer" style={{ marginTop: '12px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsAddDateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={handleAddDateConfirm}
                >
                  <i className="fa-solid fa-plus"></i>
                  <span>Add Date Column</span>
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ============================================================
            MODAL 4: CONFIRM SAVE ATTENDANCE DIALOG
            ============================================================ */}
        {isConfirmModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsConfirmModalOpen(false)}
            title="Save Class Attendance Register"
            maxWidth="sm"
          >
            <div className="confirm-dialog-content">
              <div className="confirm-icon-box">
                <i className="fa-solid fa-clipboard-check"></i>
              </div>
              <h3 className="confirm-heading">Submit Attendance Register?</h3>
              <p className="confirm-body-text">
                You are about to save the attendance register for <strong>{displayedStudents.length} students</strong> up to current date <strong>{formatDisplayDate(currentCutoffDate)}</strong> in <strong>{selectedCourseCode} ({`Section ${selectedSection}`})</strong>.
              </p>

              <div className="confirm-summary-pill-row">
                <span className="c1-badge c1-badge-success">{totalActualPresents} Total Presents ('P')</span>
                <span className="c1-badge c1-badge-error">{totalActualAbsents} Total Absents ('X')</span>
                <span className="c1-badge c1-badge-cyan">{overallAvgPercentage}% Conducted Avg</span>
              </div>

              {shortageStudentsList.length > 0 && (
                <div style={{
                  background: 'rgba(244, 63, 94, 0.08)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  width: '100%',
                  textAlign: 'left',
                  marginTop: '8px'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={autoEmailOnSave}
                      onChange={(e) => setAutoEmailOnSave(e.target.checked)}
                      style={{ accentColor: '#f43f5e' }}
                    />
                    <span>
                      <strong>Auto-Dispatch Email Alerts</strong> to {shortageStudentsList.length} student(s) with shortage (&lt;75%)
                    </span>
                  </label>
                </div>
              )}

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsConfirmModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={handleConfirmSave}
                >
                  <i className="fa-solid fa-check"></i>
                  <span>Confirm & Save</span>
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ============================================================
            MODAL 5: PREVIEW LAB SESSION ROSTER DETAILS
            ============================================================ */}
        {previewLabSession && (
          <Modal
            isOpen={true}
            onClose={() => setPreviewLabSession(null)}
            title={`Practical Lab Session: ${previewLabSession.labCode}`}
            maxWidth="md"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="c1-alert c1-alert-info">
                <i className="fa-solid fa-flask-vial" style={{ color: '#c084fc' }}></i>
                <div>
                  <strong>{previewLabSession.labName}</strong> • {previewLabSession.experimentTitle}
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Conducted on {previewLabSession.date} ({previewLabSession.day}) • {previewLabSession.labRoom} • {previewLabSession.batch}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span className="c1-badge c1-badge-success">{previewLabSession.presentCount} Present</span>
                <span className="c1-badge c1-badge-error">{previewLabSession.absentCount} Absent</span>
                <span className="c1-badge c1-badge-cyan">{previewLabSession.attendancePct}% Attendance Rate</span>
              </div>

              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <table className="c1-table">
                  <thead>
                    <tr>
                      <th>Terminal</th>
                      <th>Roll Number</th>
                      <th>Student Name</th>
                      <th>Status</th>
                      <th>Viva Marks</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewLabSession.records.map((r) => (
                      <tr key={r.studentId}>
                        <td>
                          <span className="c1-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontSize: '0.75rem' }}>
                            {r.workstationNo}
                          </span>
                        </td>
                        <td><strong>{r.studentId}</strong></td>
                        <td>{r.studentName}</td>
                        <td>
                          <span className={`c1-badge ${r.status === 'Present' ? 'c1-badge-success' : r.status === 'Absent' ? 'c1-badge-error' : 'c1-badge-warning'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td><strong>{r.marks !== undefined ? `${r.marks}/10` : '—'}</strong></td>
                        <td><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.remarks || '—'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setPreviewLabSession(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Toast Notification Container */}
        {toastMsg && (
          <Toast
            message={toastMsg.message}
            type={toastMsg.type}
            onClose={() => setToastMsg(null)}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default FacultyAttendance;
