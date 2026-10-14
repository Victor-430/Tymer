"use client";

import { useId, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { selectTablePage } from "./table-data";

export interface TableColumn<T> {
  key: string;
  label: string;
  value: (row: T) => string | number | boolean | null | undefined;
  render?: (row: T) => ReactNode;
}

export function DataTable<T>({ title, data, columns, rowKey, status, onInspect }: {
  title: string; data: T[]; columns: TableColumn<T>[]; rowKey: (row: T) => string | number;
  status?: (row: T) => string; onInspect?: (row: T) => void;
}) {
  const id = useId();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<{ key: string; descending: boolean } | null>(null);
  const [page, setPage] = useState(0);
  const { matching, pageCount, currentPage, rows } = selectTablePage(data, columns, { search, filter, status, sort, page });
  const statuses = status ? [...new Set(data.map(status))].sort() : [];
  return <div className="overflow-hidden rounded-2xl border bg-card">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b p-5">
      <div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{data.length} records</p></div>
      <div className="flex w-full flex-wrap gap-3 sm:w-auto">
        <div className="relative min-w-0 flex-1 sm:w-60">
          <label className="sr-only" htmlFor={`${id}-search`}>Search {title}</label>
          <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" aria-hidden="true" />
          <Input id={`${id}-search`} className="h-10 rounded-lg pl-9" placeholder="Search records…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        </div>
        {status && <div><label className="sr-only" htmlFor={`${id}-status`}>Filter {title} by status</label><select id={`${id}-status`} className="h-10 max-w-full rounded-lg border bg-background px-3 text-sm focus-visible:outline-ring" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(0); }}>
          <option value="">All statuses</option>{statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select></div>}
      </div>
    </div>
    <Table>
      <TableCaption className="sr-only">{title}, {matching.length} matching records</TableCaption>
      <TableHeader><TableRow>{columns.map((c) => <TableHead key={c.key} aria-sort={sort?.key === c.key ? sort.descending ? "descending" : "ascending" : "none"}>
        <button className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap text-xs focus-visible:outline-ring" onClick={() => { setSort({ key: c.key, descending: sort?.key === c.key && !sort.descending }); setPage(0); }} aria-label={`Sort ${title} by ${c.label}`}>
          {c.label}{sort?.key === c.key ? sort.descending ? <ArrowDown className="size-3" aria-hidden="true" /> : <ArrowUp className="size-3" aria-hidden="true" /> : <ChevronsUpDown className="size-3 opacity-40" aria-hidden="true" />}
        </button>
      </TableHead>)}{onInspect && <TableHead><span className="sr-only">Details</span></TableHead>}</TableRow></TableHeader>
      <TableBody>{rows.length ? rows.map((row) => <TableRow key={rowKey(row)}>{columns.map((c) => <TableCell className="py-4" key={c.key}>{c.render ? c.render(row) : String(c.value(row) ?? "—")}</TableCell>)}{onInspect && <TableCell><Button variant="ghost" size="sm" aria-label={`View ${title} record ${rowKey(row)}`} onClick={() => onInspect(row)}>View</Button></TableCell>}</TableRow>)
        : <TableRow><TableCell colSpan={columns.length + (onInspect ? 1 : 0)} className="py-14 text-center"><p className="font-medium">{data.length ? "No matching records" : "No records available"}</p><p className="mt-1 text-sm text-muted-foreground">{data.length ? "Try a different search or status filter." : "Records will appear here when available."}</p>{(search || filter) && <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setFilter(""); setPage(0); }}>Clear filters</Button>}</TableCell></TableRow>}</TableBody>
    </Table>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 text-xs text-muted-foreground">
      <p aria-live="polite">{matching.length ? `${currentPage * 10 + 1}–${Math.min((currentPage + 1) * 10, matching.length)} of ${matching.length}` : "0 records"}</p>
      <div className="flex items-center gap-3"><Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</Button><span>Page {currentPage + 1} of {pageCount}</span><Button variant="outline" size="sm" disabled={currentPage >= pageCount - 1} onClick={() => setPage(currentPage + 1)}>Next</Button></div>
    </div>
  </div>;
}
