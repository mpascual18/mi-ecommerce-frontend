'use client';

import { ReactNode, useMemo, useState } from 'react';
import Spinner from './Spinner';
import EmptyState from './EmptyState';

export type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  sortable?: boolean;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  searchableText?: (row: T) => string;
  extraFilters?: ReactNode;
};

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  emptyMessage = 'No hay datos para mostrar.',
  searchPlaceholder = 'Buscar...',
  searchableText,
  extraFilters,
}: Props<T>) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Safe check for rows array
  const safeRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

  const filtered = useMemo(() => {
    if (!searchableText || !query.trim()) return safeRows;
    const q = query.trim().toLowerCase();
    return safeRows.filter((row) => searchableText(row).toLowerCase().includes(q));
  }, [safeRows, query, searchableText]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortKey, sortDir, columns]);

  const toggleSort = (col: Column<T>) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  };

  return (
    <div>
      {(searchableText || extraFilters) && (
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {searchableText && (
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          {extraFilters}
        </div>
      )}
      <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col)}
                  className={`p-3 font-semibold text-gray-600 ${col.sortable ? 'cursor-pointer select-none hover:text-gray-900' : ''}`}
                >
                  {col.header}
                  {col.sortable && sortKey === col.key && (sortDir === 'asc' ? ' ▲' : ' ▼')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-10 text-center text-gray-400">
                  <Spinner className="mx-auto" />
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <EmptyState message={emptyMessage} />
                </td>
              </tr>
            ) : (
              sorted.map((row) => (
                <tr key={rowKey(row)} className="border-t border-gray-100 hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="p-3 align-middle">
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
