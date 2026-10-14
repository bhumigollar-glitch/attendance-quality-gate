import { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { SummaryStats } from './components/SummaryStats';
import { ErrorTable } from './components/ErrorTable';
import { DataPreview } from './components/DataPreview';
import { parseFile, validateAttendanceData, exportErrorReport, generateSampleData } from './lib/validator';
import { AttendanceRecord, ValidationError, ValidationSummary } from './types';

type AppState = 'idle' | 'loading' | 'results' | 'error';

export default function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [summary, setSummary] = useState<ValidationSummary | null>(null);
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [fileName, setFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const handleFileUpload = useCallback(async (file: File) => {
    setAppState('loading');
    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    
    try {
      const { data: parsedData, headers } = await parseFile(file);
      const result = validateAttendanceData(parsedData, headers);
      
      setData(parsedData);
      setErrors(result.errors);
      setSummary(result.summary);
      setAppState('results');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unknown error occurred.');
      setAppState('error');
    }
  }, []);

  const handleSampleData = useCallback(() => {
    setAppState('loading');
    setFileName('sample_attendance');
    
    setTimeout(() => {
      const sampleData = generateSampleData();
      const headers = ['Student ID', 'Subject', 'Classes Held', 'Classes Attended', 'Percentage', 'Date'];
      const result = validateAttendanceData(sampleData, headers);
      
      setData(sampleData);
      setErrors(result.errors);
      setSummary(result.summary);
      setAppState('results');
    }, 500);
  }, []);

  const handleExport = useCallback(() => {
    if (errors.length > 0) {
      exportErrorReport(errors, fileName);
    }
  }, [errors, fileName]);

  const handleReset = useCallback(() => {
    setAppState('idle');
    setErrors([]);
    setSummary(null);
    setData([]);
    setFileName('');
    setErrorMessage('');
    setFilterType('all');
    setFilterSeverity('all');
  }, []);

  const filteredErrors = errors.filter(e => {
    const typeMatch = filterType === 'all' || e.issueType === filterType;
    const severityMatch = filterSeverity === 'all' || e.severity === filterSeverity;
    return typeMatch && severityMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Attendance Quality Gate</h1>
                <p className="text-sm text-slate-500">Spreadsheet data validation tool</p>
              </div>
            </div>
            {appState === 'results' && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                ← New Validation
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {appState === 'idle' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                Validate Your Attendance Spreadsheets
              </h2>
              <p className="text-lg text-slate-600">
                Upload your attendance data to automatically detect missing values, duplicates, 
                invalid counts, and percentage errors.
              </p>
            </div>

            {/* Upload Area */}
            <FileUpload onFileUpload={handleFileUpload} onSampleData={handleSampleData} />

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Missing Values</h3>
                <p className="text-sm text-slate-600">Detects records with empty required fields like Student ID or Subject.</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Duplicate Records</h3>
                <p className="text-sm text-slate-600">Identifies repeated student + class session combinations.</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Invalid Counts</h3>
                <p className="text-sm text-slate-600">Flags negative values and impossible attendance counts.</p>
              </div>
            </div>

            {/* Supported Formats */}
            <div className="text-center text-sm text-slate-500">
              <p>Supported formats: <span className="font-medium">.xlsx</span>, <span className="font-medium">.xls</span>, <span className="font-medium">.csv</span></p>
            </div>
          </div>
        )}

        {appState === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <p className="text-lg font-medium text-slate-700">Validating your spreadsheet...</p>
            <p className="text-sm text-slate-500 mt-2">Checking for data quality issues</p>
          </div>
        )}

        {appState === 'error' && (
          <div className="max-w-lg mx-auto text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Validation Failed</h3>
            <p className="text-slate-600 mb-6">{errorMessage}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {appState === 'results' && summary && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">File: {fileName}</p>
                  <p className="text-xs text-slate-500">Validation complete</p>
                </div>
              </div>
              <button
                onClick={handleExport}
                disabled={errors.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Report
              </button>
            </div>

            {/* Summary Stats */}
            <SummaryStats summary={summary} />

            {/* Filters */}
            {errors.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-sm font-medium text-slate-700">Filters:</span>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Issue Types</option>
                    <option value="Missing Value">Missing Value</option>
                    <option value="Duplicate Record">Duplicate Record</option>
                    <option value="Invalid Attendance">Invalid Attendance</option>
                    <option value="Percentage Mismatch">Percentage Mismatch</option>
                  </select>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Severities</option>
                    <option value="Error">Error</option>
                    <option value="Warning">Warning</option>
                  </select>
                  <span className="text-sm text-slate-500">
                    Showing {filteredErrors.length} of {errors.length} issues
                  </span>
                </div>
              </div>
            )}

            {/* Error Table */}
            <ErrorTable errors={filteredErrors} />

            {/* Data Preview */}
            {data.length > 0 && (
              <DataPreview data={data} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-500">
            Attendance Spreadsheet Quality Gate — Data validation tool for academic attendance records.
          </p>
        </div>
      </footer>
    </div>
  );
}
