"use client";

import { buttonClass, inputClass } from "@/components/ui/form";

/** 管理頁頂部：標題、數量、新增按鈕、搜尋同篩選 */
export function AdminToolbar({
  title,
  count,
  onAdd,
  search,
  onSearch,
  children,
}: {
  title: string;
  count?: number;
  onAdd: () => void;
  search: string;
  onSearch: (v: string) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-bold">
          {title}
          {count !== undefined && <span className="ml-2 text-lg font-normal text-muted">{count} 項</span>}
        </h1>
        <button type="button" onClick={onAdd} className={buttonClass.primary}>
          ＋ 新增
        </button>
      </div>
      <input
        type="search"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="搜尋…"
        className={inputClass}
      />
      {children && <div className="grid grid-cols-2 gap-2 md:grid-cols-4">{children}</div>}
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} py-2 text-base`}
    >
      <option value="">{label}：全部</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function AdminRow({
  title,
  meta,
  onEdit,
  onDelete,
}: {
  title: string;
  meta: string[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-bold">{title}</p>
        <p className="flex flex-wrap gap-x-2 text-sm text-muted">
          {meta.filter(Boolean).map((m) => (
            <span key={m}>{m}</span>
          ))}
        </p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onEdit} className={buttonClass.secondary}>
          編輯
        </button>
        <button type="button" onClick={onDelete} className={`${buttonClass.secondary} text-danger`}>
          刪除
        </button>
      </div>
    </li>
  );
}
