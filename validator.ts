import * as XLSX from 'xlsx';
import { AttendanceRecord, ValidationError, ValidationSummary, ValidationResult } from '../types';

// Column name mappings (flexible matching)
const COLUMN_ALIASES = {
  studentId: ['student id', 'studentid', 'student_id', 'roll no', 'rollno', 'roll_no', 'enrollment no', 'enrollmentno', 'enrollment_no', 'reg no', 'regno', 'reg_no'],
  subject: ['subject', 'subject name', 'subjectname', 'subject_name', 'course', 'course name', 'coursename', 'course_name'],
  classesHeld: ['classes held', 'classesheld', 'classes_held', 'total classes', 'totalclasses', 'total_classes', 'total sessions', 'totalsessions'],
  classesAttended: ['classes attended', 'classesattended', 'classes_attended', 'present', 'attendance', 'attended', 'sessions attended', 'sessionsattended'],
  percentage: ['percentage', 'attendance %', 'attendance%', 'attendance_percentage', 'attendance percentage', 'percent', '%'],
  date: ['date', 'session date', 'sessiondate', 'class date', 'classdate'],
  session: ['session', 'class session', 'classsession', 'session_no', 'session no', 'sessionno', 'lecture', 'lecture no'],
};

function findColumn(headers: string[], aliases: string[]): string | null {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  for (const alias of aliases) {
    const idx = normalizedHeaders.indexOf(alias.toLowerCase().trim());
    if (idx !== -1) return headers[idx];
  }
  return null;
}

function getColumnValue(record: AttendanceRecord, columnName: string | null): string | number | undefined {
  if (!columnName) return undefined;
  return record[columnName];
}

function isEmpty(value: string | number | undefined | null): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  return false;
}

function toNumber(value: string | number | undefined): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number') return isNaN(value) ? null : value;
  const parsed = parseFloat(value.toString().trim());
  return isNaN(parsed) ? null : parsed;
}

export function parseFile(file: File): Promise<{ data: AttendanceRecord[]; headers: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string | number>>(worksheet, { defval: '' });
        
        if (jsonData.length === 0) {
          reject(new Error('The file appears to be empty or has no data rows.'));
          return;
        }

        const headers = Object.keys(jsonData[0]);
        const records: AttendanceRecord[] = jsonData.map((row, index) => ({
          rowNumber: index + 2, // +2 because row 1 is header, and index is 0-based
          ...row,
        }));

        resolve({ data: records, headers });
      } catch (err) {
        reject(new Error('Failed to parse the file. Please ensure it is a valid Excel or CSV file.'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read the file.'));
    reader.readAsArrayBuffer(file);
  });
}

export function validateAttendanceData(data: AttendanceRecord[], headers: string[]): ValidationResult {
  const errors: ValidationError[] = [];

  // Find mapped columns
  const studentIdCol = findColumn(headers, COLUMN_ALIASES.studentId);
  const subjectCol = findColumn(headers, COLUMN_ALIASES.subject);
  const classesHeldCol = findColumn(headers, COLUMN_ALIASES.classesHeld);
  const classesAttendedCol = findColumn(headers, COLUMN_ALIASES.classesAttended);
  const percentageCol = findColumn(headers, COLUMN_ALIASES.percentage);
  const dateCol = findColumn(headers, COLUMN_ALIASES.date);
  const sessionCol = findColumn(headers, COLUMN_ALIASES.session);

  // Rule 1: Missing Value Detection
  const requiredColumns = [studentIdCol, subjectCol].filter(Boolean) as string[];
  
  data.forEach((record) => {
    requiredColumns.forEach((col) => {
      const value = getColumnValue(record, col);
      if (isEmpty(value)) {
        errors.push({
          rowNumber: record.rowNumber,
          studentId: studentIdCol ? (getColumnValue(record, studentIdCol) as string || 'N/A') : 'N/A',
          issueType: 'Missing Value',
          explanation: `Required field "${col}" is missing or empty.`,
          severity: 'Error',
          suggestedAction: `Provide the ${col} value for this record.`,
        });
      }
    });

    // Rule 3: Invalid Attendance Counts
    if (classesHeldCol && classesAttendedCol) {
      const classesHeld = toNumber(getColumnValue(record, classesHeldCol));
      const classesAttended = toNumber(getColumnValue(record, classesAttendedCol));

      if (classesHeld !== null && classesAttended !== null) {
        if (classesHeld < 0) {
          errors.push({
            rowNumber: record.rowNumber,
            studentId: studentIdCol ? (getColumnValue(record, studentIdCol) as string || 'N/A') : 'N/A',
            issueType: 'Invalid Attendance',
            explanation: `Classes held (${classesHeld}) is negative.`,
            severity: 'Error',
            suggestedAction: 'Verify the total number of classes held. It cannot be negative.',
          });
        }

        if (classesAttended < 0) {
          errors.push({
            rowNumber: record.rowNumber,
            studentId: studentIdCol ? (getColumnValue(record, studentIdCol) as string || 'N/A') : 'N/A',
            issueType: 'Invalid Attendance',
            explanation: `Classes attended (${classesAttended}) is negative.`,
            severity: 'Error',
            suggestedAction: 'Verify the number of classes attended. It cannot be negative.',
          });
        }

        if (classesAttended > classesHeld && classesHeld >= 0) {
          errors.push({
            rowNumber: record.rowNumber,
            studentId: studentIdCol ? (getColumnValue(record, studentIdCol) as string || 'N/A') : 'N/A',
            issueType: 'Invalid Attendance',
            explanation: `Classes attended (${classesAttended}) exceeds classes held (${classesHeld}).`,
            severity: 'Error',
            suggestedAction: 'Check that the attendance count does not exceed the total classes held.',
          });
        }
      }
    }

    // Rule 4: Attendance Percentage Validation
    if (percentageCol && classesHeldCol && classesAttendedCol) {
      const reportedPercentage = toNumber(getColumnValue(record, percentageCol));
      const classesHeld = toNumber(getColumnValue(record, classesHeldCol));
      const classesAttended = toNumber(getColumnValue(record, classesAttendedCol));

      if (reportedPercentage !== null && classesHeld !== null && classesAttended !== null) {
        if (classesHeld === 0) {
          if (reportedPercentage !== 0) {
            errors.push({
              rowNumber: record.rowNumber,
              studentId: studentIdCol ? (getColumnValue(record, studentIdCol) as string || 'N/A') : 'N/A',
              issueType: 'Percentage Mismatch',
              explanation: `Classes held is 0, but reported percentage is ${reportedPercentage}%. Expected 0%.`,
              severity: 'Warning',
              suggestedAction: 'When no classes are held, attendance percentage should be 0%.',
            });
          }
        } else {
          const expectedPercentage = Math.round((classesAttended / classesHeld) * 10000) / 100;
          const tolerance = 1; // 1% tolerance for rounding
          if (Math.abs(reportedPercentage - expectedPercentage) > tolerance) {
            errors.push({
              rowNumber: record.rowNumber,
              studentId: studentIdCol ? (getColumnValue(record, studentIdCol) as string || 'N/A') : 'N/A',
              issueType: 'Percentage Mismatch',
              explanation: `Reported percentage (${reportedPercentage}%) does not match calculated value (${expectedPercentage}%). Difference exceeds ${tolerance}%.`,
              severity: 'Warning',
              suggestedAction: `Recalculate: (${classesAttended}/${classesHeld}) × 100 = ${expectedPercentage}%. Verify the reported value.`,
            });
          }
        }
      }
    }
  });

  // Rule 2: Duplicate Detection
  // Key = Student ID + Subject + Date/Session (if available)
  const duplicateKeyParts: string[] = [];
  if (studentIdCol) duplicateKeyParts.push(studentIdCol);
  if (subjectCol) duplicateKeyParts.push(subjectCol);
  if (dateCol) duplicateKeyParts.push(dateCol);
  if (sessionCol) duplicateKeyParts.push(sessionCol);

  if (duplicateKeyParts.length >= 2) {
    const seen = new Map<string, number[]>();
    
    data.forEach((record) => {
      const keyParts = duplicateKeyParts.map(col => {
        const val = getColumnValue(record, col);
        return val !== undefined ? val.toString().trim().toLowerCase() : '';
      });
      const key = keyParts.join('|');
      
      if (!seen.has(key)) {
        seen.set(key, []);
      }
      seen.get(key)!.push(record.rowNumber);
    });

    seen.forEach((rowNumbers, key) => {
      if (rowNumbers.length > 1) {
        rowNumbers.forEach((rowNum) => {
          const record = data.find(r => r.rowNumber === rowNum);
          errors.push({
            rowNumber: rowNum,
            studentId: studentIdCol ? (getColumnValue(record!, studentIdCol) as string || 'N/A') : 'N/A',
            issueType: 'Duplicate Record',
            explanation: `This record has the same ${duplicateKeyParts.join(' + ')} combination as row(s): ${rowNumbers.filter(r => r !== rowNum).join(', ')}.`,
            severity: 'Warning',
            suggestedAction: 'Verify if this is a legitimate duplicate or a data entry error. Remove if it is an accidental duplicate.',
          });
        });
      }
    });
  }

  // Build summary
  const summary: ValidationSummary = {
    totalRecords: data.length,
    totalIssues: errors.length,
    missingValueCount: errors.filter(e => e.issueType === 'Missing Value').length,
    duplicateCount: errors.filter(e => e.issueType === 'Duplicate Record').length,
    invalidAttendanceCount: errors.filter(e => e.issueType === 'Invalid Attendance').length,
    percentageMismatchCount: errors.filter(e => e.issueType === 'Percentage Mismatch').length,
    errors: errors.filter(e => e.severity === 'Error').length,
    warnings: errors.filter(e => e.severity === 'Warning').length,
  };

  return { summary, errors, data };
}

export function exportErrorReport(errors: ValidationError[], fileName: string): void {
  const exportData = errors.map(e => ({
    'Row Number': e.rowNumber,
    'Student ID': e.studentId,
    'Issue Type': e.issueType,
    'Explanation': e.explanation,
    'Severity': e.severity,
    'Suggested Action': e.suggestedAction,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Error Report');

  // Set column widths
  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 15 },
    { wch: 20 },
    { wch: 60 },
    { wch: 10 },
    { wch: 50 },
  ];

  XLSX.writeFile(workbook, `${fileName}_error_report.xlsx`);
}

export function generateSampleData(): AttendanceRecord[] {
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English'];
  const dates = ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19'];
  
  const data: AttendanceRecord[] = [];
  let rowNumber = 2;

  // Normal records
  for (let i = 0; i < 10; i++) {
    const classesHeld = Math.floor(Math.random() * 10) + 30;
    const classesAttended = Math.floor(Math.random() * classesHeld * 0.3) + Math.floor(classesHeld * 0.6);
    const percentage = Math.round((classesAttended / classesHeld) * 10000) / 100;
    
    data.push({
      rowNumber: rowNumber++,
      'Student ID': `STU${String(1001 + i).padStart(4, '0')}`,
      'Subject': subjects[i % subjects.length],
      'Classes Held': classesHeld,
      'Classes Attended': classesAttended,
      'Percentage': percentage,
      'Date': dates[i % dates.length],
    });
  }

  // Missing value records
  data.push({
    rowNumber: rowNumber++,
    'Student ID': '',
    'Subject': 'Mathematics',
    'Classes Held': 35,
    'Classes Attended': 30,
    'Percentage': 85.71,
    'Date': '2024-01-15',
  });

  data.push({
    rowNumber: rowNumber++,
    'Student ID': 'STU1020',
    'Subject': '',
    'Classes Held': 40,
    'Classes Attended': 35,
    'Percentage': 87.5,
    'Date': '2024-01-16',
  });

  // Duplicate record
  data.push({
    rowNumber: rowNumber++,
    'Student ID': 'STU1001',
    'Subject': 'Mathematics',
    'Classes Held': 35,
    'Classes Attended': 30,
    'Percentage': 85.71,
    'Date': '2024-01-15',
  });

  // Invalid attendance - negative
  data.push({
    rowNumber: rowNumber++,
    'Student ID': 'STU1021',
    'Subject': 'Physics',
    'Classes Held': -5,
    'Classes Attended': 3,
    'Percentage': 0,
    'Date': '2024-01-17',
  });

  // Invalid attendance - attended > held
  data.push({
    rowNumber: rowNumber++,
    'Student ID': 'STU1022',
    'Subject': 'Chemistry',
    'Classes Held': 30,
    'Classes Attended': 45,
    'Percentage': 150,
    'Date': '2024-01-18',
  });

  // Percentage mismatch
  data.push({
    rowNumber: rowNumber++,
    'Student ID': 'STU1023',
    'Subject': 'English',
    'Classes Held': 40,
    'Classes Attended': 32,
    'Percentage': 65.0, // Should be 80%
    'Date': '2024-01-19',
  });

  return data;
}
