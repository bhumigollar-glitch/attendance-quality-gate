export interface AttendanceRecord {
  rowNumber: number;
  [key: string]: string | number | undefined;
}

export interface ValidationError {
  rowNumber: number;
  studentId: string;
  issueType: 'Missing Value' | 'Duplicate Record' | 'Invalid Attendance' | 'Percentage Mismatch';
  explanation: string;
  severity: 'Warning' | 'Error';
  suggestedAction: string;
}

export interface ValidationSummary {
  totalRecords: number;
  totalIssues: number;
  missingValueCount: number;
  duplicateCount: number;
  invalidAttendanceCount: number;
  percentageMismatchCount: number;
  errors: number;
  warnings: number;
}

export interface ValidationResult {
  summary: ValidationSummary;
  errors: ValidationError[];
  data: AttendanceRecord[];
}
