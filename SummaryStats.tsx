import { ValidationSummary } from '../types';

interface SummaryStatsProps {
  summary: ValidationSummary;
}

export function SummaryStats({ summary }: SummaryStatsProps) {
  const stats = [
    {
      label: 'Total Records',
      value: summary.totalRecords,
      color: 'bg-slate-100 text-slate-700',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      label: 'Total Issues',
      value: summary.totalIssues,
      color: summary.totalIssues > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
    },
    {
      label: 'Errors',
      value: summary.errors,
      color: 'bg-red-100 text-red-700',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    {
      label: 'Warnings',
      value: summary.warnings,
      color: 'bg-yellow-100 text-yellow-700',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const issueBreakdown = [
    { label: 'Missing Values', count: summary.missingValueCount, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Duplicates', count: summary.duplicateCount, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Invalid Attendance', count: summary.invalidAttendanceCount, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Percentage Mismatch', count: summary.percentageMismatchCount, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Issue Breakdown */}
      {summary.totalIssues > 0 && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Issues by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {issueBreakdown.map((item) => (
              <div key={item.label} className={`${item.bg} rounded-lg p-3 text-center`}>
                <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
                <p className="text-xs text-slate-600 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
          
          {/* Visual bar */}
          {summary.totalIssues > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
                {summary.missingValueCount > 0 && (
                  <div 
                    className="bg-purple-500 transition-all" 
                    style={{ width: `${(summary.missingValueCount / summary.totalIssues) * 100}%` }}
                    title={`Missing Values: ${summary.missingValueCount}`}
                  />
                )}
                {summary.duplicateCount > 0 && (
                  <div 
                    className="bg-orange-500 transition-all" 
                    style={{ width: `${(summary.duplicateCount / summary.totalIssues) * 100}%` }}
                    title={`Duplicates: ${summary.duplicateCount}`}
                  />
                )}
                {summary.invalidAttendanceCount > 0 && (
                  <div 
                    className="bg-red-500 transition-all" 
                    style={{ width: `${(summary.invalidAttendanceCount / summary.totalIssues) * 100}%` }}
                    title={`Invalid Attendance: ${summary.invalidAttendanceCount}`}
                  />
                )}
                {summary.percentageMismatchCount > 0 && (
                  <div 
                    className="bg-blue-500 transition-all" 
                    style={{ width: `${(summary.percentageMismatchCount / summary.totalIssues) * 100}%` }}
                    title={`Percentage Mismatch: ${summary.percentageMismatchCount}`}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success message when no issues */}
      {summary.totalIssues === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-800">No Issues Found!</h3>
          <p className="text-sm text-green-600 mt-1">Your attendance data passed all validation checks.</p>
        </div>
      )}
    </div>
  );
}
