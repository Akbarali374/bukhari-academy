import { useEffect, useState } from 'react';
import { getStudents, getGroupsWithTeacher } from '@/lib/data';
import type { Profile } from '@/types';

// TODO: Replace with real exam data fetching
function getExamResultsMock() {
  // Example: [{ studentId, date, percent }]
  return [
    { studentId: 'student-1', date: '2026-03-01', percent: 85 },
    { studentId: 'student-2', date: '2026-03-01', percent: 92 },
    { studentId: 'student-1', date: '2026-03-21', percent: 78 },
  ];
}

export default function TeacherExamResults() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const studentsData = await getStudents();
      setStudents(studentsData);
      setExamResults(getExamResultsMock());
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Imtihon javoblari (ball va foiz)</h1>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : examResults.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Hozircha imtihon bo'lmagan</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">O'quvchi</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Sana</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Ball</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Foiz</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {examResults.map((res, idx) => {
                const student = students.find(s => s.id === res.studentId);
                // Ball: res.ball, Foiz: res.percent
                return (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{student ? student.last_name + ' ' + student.first_name : '—'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{res.date}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{res.ball ?? Math.round(res.percent)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{res.percent}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
