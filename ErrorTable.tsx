import { ValidationError } from '../types';

interface ErrorTableProps {
  errors: ValidationError[];
}

export function ErrorTable({ errors }: ErrorTableProps) {
  if (errors.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-500">No issues match the current filters.</p>
      </div>
    );
  }

  const getIssueTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      'Missing Value': 'bg-purple-100 text-purple-700 border-purple-200',
      'Duplicate Record': 'bg-orange-100 text-orange-700 border-orange-200',
      'Invalid Attendance': 'bg-red-100 text-red-700 border-red-200',
      'Percentage Mismatch': 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return styles[type] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getSeverityBadge = (severity: string) => {
    if (severity === 'Error') {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Detected Issues</h3>
        <p className="text-sm text-slate-500 mt-1">Review each issue and take the suggested action</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap">Row</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap">Student ID</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap">Issue Type</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap">Explanation</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap">Severity</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap">Suggested Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {errors.map((error, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                  #{error.rowNumber}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                  {error.studentId}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getIssueTypeBadge(error.issueType)}`}>
                    {error.issueType}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 max-w-xs">
                  <p className="line-clamp-2">{error.explanation}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityBadge(error.severity)}`}>
                    {error.severity === 'Error' ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    {error.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 max-w-xs">
                  <p className="line-clamp-2">{error.suggestedAction}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
