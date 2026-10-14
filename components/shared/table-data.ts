export function selectTablePage<T>(data: T[], columns: Array<{ key: string; value: (row: T) => string | number | boolean | null | undefined }>, options: {
  search: string; filter: string; status?: (row: T) => string; sort: { key: string; descending: boolean } | null; page: number;
}) {
  const { search, filter, status, sort, page } = options;
  const matching = data.filter((r) => (!filter || status?.(r) === filter) && columns.some((c) => String(c.value(r) ?? "").toLocaleLowerCase().includes(search.toLocaleLowerCase())));
  const column = columns.find((c) => c.key === sort?.key);
  if (column && sort) matching.sort((a, b) => {
    const x = column.value(a), y = column.value(b);
    const comparison = typeof x === "number" && typeof y === "number" ? x - y : String(x ?? "").localeCompare(String(y ?? ""), undefined, { numeric: true });
    return sort.descending ? -comparison : comparison;
  });
  const pageCount = Math.max(1, Math.ceil(matching.length / 10));
  const currentPage = Math.min(Math.max(0, page), pageCount - 1);
  return { matching, pageCount, currentPage, rows: matching.slice(currentPage * 10, (currentPage + 1) * 10) };
}
