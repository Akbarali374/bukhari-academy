import { ReactNode } from 'react'

interface Column {
  key: string
  label: string
  className?: string
}

interface ResponsiveTableProps {
  columns: Column[]
  data: any[]
  renderRow: (item: any, index: number) => ReactNode
  renderMobileCard: (item: any, index: number) => ReactNode
  emptyMessage?: string
  emptyIcon?: ReactNode
}

export function ResponsiveTable({
  columns,
  data,
  renderRow,
  renderMobileCard,
  emptyMessage = "Ma'lumotlar topilmadi",
  emptyIcon
}: ResponsiveTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item, index) => renderRow(item, index))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {data.map((item, index) => renderMobileCard(item, index))}
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {emptyIcon && <div className="flex justify-center mb-2">{emptyIcon}</div>}
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  )
}