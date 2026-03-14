import { useEffect, useState } from 'react';
import { getStudents } from '@/lib/data';
import type { Profile } from '@/types';

// TODO: Replace with real exam data fetching
function getExamResultsMock(studentId: string) {
  // Example: [{ date, percent }]
  return [
    { date: '2026-03-01', percent: 85 },
    { date: '2026-03-21', percent: 78 },
  ];
}

export default function StudentExamResults() {
  // TODO: Replace with real current student
  const [student, setStudent] = useState<Profile | null>(null);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const studentsData = await getStudents();
      // TODO: Replace with real auth context
      const currentStudent = studentsData[0];
      setStudent(currentStudent);
      setExamResults(getExamResultsMock(currentStudent.id));
      setLoading(false);
    }
    load();
  }, []);

  if (!student) return <div>O'quvchi topilmadi</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Imtihon javoblari (ball va foiz)</h1>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : examResults.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Imtihon javobi kutilmoqda</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Sana</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Ball</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Foiz</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {examResults.map((res, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{res.date}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{res.ball ?? Math.round(res.percent)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{res.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
