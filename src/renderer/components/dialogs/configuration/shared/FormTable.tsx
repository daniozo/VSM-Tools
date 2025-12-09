/**
 * Composant de table réutilisable pour afficher/éditer des listes de données
 */

import React from 'react'
import { Button } from '@/renderer/components/ui/button'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react'

export interface Column<T> {
  key: keyof T | string
  label: string
  render?: (item: T) => React.ReactNode
  width?: string
}

interface FormTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onAdd?: () => void
  onEdit?: (item: T, index: number) => void
  onDelete?: (item: T, index: number) => void
  onMoveUp?: (index: number) => void
  onMoveDown?: (index: number) => void
  addLabel?: string
  emptyMessage?: string
  keyExtractor?: (item: T, index: number) => string
  showReorder?: boolean
}

export function FormTable<T>({
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  addLabel = 'Ajouter',
  emptyMessage = 'Aucune donnée',
  keyExtractor = (_, index) => index.toString(),
  showReorder = false
}: FormTableProps<T>) {
  return (
    <div className="space-y-3">
      {/* Bouton Ajouter */}
      {onAdd && (
        <div className="flex justify-end">
          <Button onClick={onAdd} size="sm">
            <Plus size={16} className="mr-2" />
            {addLabel}
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-left text-sm font-medium"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete || showReorder) && (
                <th className="px-4 py-3 text-right text-sm font-medium w-32">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={keyExtractor(item, index)} className="hover:bg-muted/50">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-4 py-3 text-sm">
                      {col.render
                        ? col.render(item)
                        : String((item as any)[col.key] ?? '')}
                    </td>
                  ))}
                  {(onEdit || onDelete || showReorder) && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {showReorder && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onMoveUp?.(index)}
                              disabled={index === 0}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronUp size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onMoveDown?.(index)}
                              disabled={index === data.length - 1}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronDown size={16} />
                            </Button>
                          </>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(item, index)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil size={16} />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(item, index)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
