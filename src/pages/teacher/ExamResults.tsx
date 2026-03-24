import { useEffect, useState } from 'react';
import { getStudents } from '@/lib/data';
import { globalDb } from '@/lib/globalDb';
import type { Profile } from '@/types';

export default function TeacherExamResults() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newResult, setNewResult] = useState({ student_id: '', date: '', ball: '', percent: '' });
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    setLoading(true);
    const studentsData = await getStudents();
    setStudents(studentsData);
    const results = await globalDb.getExamResults();
    setExamResults(results);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function handleInputChange(e) {
    setNewResult({ ...newResult, [e.target.name]: e.target.value });
  }

  async function handleSaveResult(e) {
    e.preventDefault();
    setSaving(true);
    await globalDb.addExamResult(
      newResult.student_id,
      newResult.ball,
      newResult.percent,
      '' // grade (optional, can be calculated)
    );
    setNewResult({ student_id: '', date: '', ball: '', percent: '' });
    await loadAll();
    setSaving(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Imtihon javoblari (ball va foiz)</h1>
      <div className="mb-6 max-w-md mx-auto bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col gap-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Imtihon javobini qo'shish</h2>
        <form onSubmit={handleSaveResult} className="flex flex-col gap-3">
          <select name="student_id" value={newResult.student_id} onChange={handleInputChange} className="px-3 py-2 rounded border" required>
            <option value="">O'quvchini tanlang</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.last_name} {s.first_name}</option>)}
          </select>
          <input name="date" type="date" value={newResult.date} onChange={handleInputChange} className="px-3 py-2 rounded border" required />
          <input name="ball" type="number" min="0" max="100" value={newResult.ball} onChange={handleInputChange} className="px-3 py-2 rounded border" placeholder="Ball (masalan, 85)" required />
          <input name="percent" type="number" min="0" max="100" value={newResult.percent} onChange={handleInputChange} className="px-3 py-2 rounded border" placeholder="Foiz (masalan, 85)" required />
          <button type="submit" disabled={saving} className="bg-primary-600 hover:bg-primary-700 text-white rounded py-2 font-medium disabled:opacity-50">{saving ? 'Saqlanmoqda...' : 'Saqlash'}</button>
        </form>
      </div>
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
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Ball</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Foiz</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {examResults.map((res, idx) => {
                const student = students.find(s => s.id === res.student_id);
                return (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{student ? student.last_name + ' ' + student.first_name : '—'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{res.ball ?? Math.round(res.percentage ?? res.percent ?? 0)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{res.percentage ?? res.percent ?? 0}%</td>
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
