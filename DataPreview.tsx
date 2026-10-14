import { useState } from 'react';
import { AttendanceRecord } from '../types';

interface DataPreviewProps {
  data: AttendanceRecord[];
}

export function DataPreview({ data }: DataPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const previewData = isExpanded ? data : data.slice(0, 10);
  const headers = Object.keys(data[0] || {}).filter(k => k !== 'rowNumber');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Data Preview</h3>
          <p className="text-sm text-slate-500 mt-1">First {isExpanded ? data.length : Math.min(10, data.length)} of {data.length} records</p>
        </div>
        {data.length > 10 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isExpanded ? 'Show Less' : 'Show All'}
          </button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap">Row</th>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {previewData.map((record) => (
              <tr key={record.rowNumber} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2.5 font-mono text-xs text-slate-500 whitespace-nowrap">
                  {record.rowNumber}
                </td>
                {headers.map((header) => (
                  <td key={header} className="px-4 py-2.5 text-slate-700 whitespace-nowrap">
                    {record[header] !== undefined && record[header] !== '' 
                      ? String(record[header]) 
                      : <span className="text-slate-300 italic">empty</span>
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
