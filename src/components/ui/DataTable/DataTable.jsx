import { useMemo, useRef, useState } from 'react';
import { Button } from '../Button/Button.jsx';
import { Icon } from '../Icon/Icon.jsx';
import { Pagination } from '../Pagination/Pagination.jsx';
import { Skeleton } from '../Skeleton/Skeleton.jsx';
import './DataTable.css';

function getValue(row, column) {
  return column.accessor ? column.accessor(row) : row[column.key];
}

function compareValues(first, second) {
  if (first == null && second == null) return 0;
  if (first == null) return -1;
  if (second == null) return 1;
  if (typeof first === 'number' && typeof second === 'number') return first - second;
  return String(first).localeCompare(String(second), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

export function DataTable({
  rows = [],
  columns = [],
  label,
  labels,
  loading = false,
  error = false,
  errorMessage,
  onRetry,
  selectable = false,
  selectedRowIds,
  onSelectionChange,
  getRowId = (row, index) => row.id ?? index,
  getSelectRowLabel,
  visibleColumnKeys,
  onVisibleColumnKeysChange,
  defaultSort = null,
  sort,
  onSortChange,
  pagination,
  skeletonRows = 5,
  maxHeight = '32rem',
  className = '',
}) {
  const [internalSort, setInternalSort] = useState(defaultSort);
  const [internalSelectedIds, setInternalSelectedIds] = useState([]);
  const [internalVisibleKeys, setInternalVisibleKeys] = useState(() =>
    columns.filter((column) => !column.hidden).map((column) => column.key),
  );
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const rowRefs = useRef([]);
  const controlledSort = sort !== undefined;
  const activeSort = controlledSort ? sort : internalSort;
  const controlledSelection = selectedRowIds !== undefined;
  const selectedIds = controlledSelection ? selectedRowIds : internalSelectedIds;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const controlledVisibility = visibleColumnKeys !== undefined;
  const activeVisibleKeys = controlledVisibility ? visibleColumnKeys : internalVisibleKeys;
  const visibleSet = useMemo(() => new Set(activeVisibleKeys), [activeVisibleKeys]);
  const visibleColumns = columns.filter((column) => visibleSet.has(column.key));

  const sortedRows = useMemo(() => {
    const indexedRows = rows.map((row, originalIndex) => ({ row, originalIndex }));
    if (!activeSort?.key) return indexedRows;
    const column = columns.find((candidate) => candidate.key === activeSort.key);
    if (!column) return indexedRows;
    const direction = activeSort.direction === 'descending' ? -1 : 1;
    return indexedRows.sort(
      (first, second) =>
        compareValues(getValue(first.row, column), getValue(second.row, column)) * direction,
    );
  }, [activeSort, columns, rows]);

  const requestedPageSize =
    Number.isFinite(pagination?.pageSize) && pagination.pageSize > 0
      ? Math.floor(pagination.pageSize)
      : null;
  const pageSize = requestedPageSize > 0 ? requestedPageSize : null;
  const requestedPage = Number.isFinite(pagination?.page)
    ? Math.max(1, Math.floor(pagination.page))
    : 1;
  const requestedPageCount =
    pagination?.pageCount ??
    (pageSize ? Math.max(1, Math.ceil(sortedRows.length / pageSize)) : 1);
  const pageCount = Number.isFinite(requestedPageCount)
    ? Math.max(1, Math.floor(requestedPageCount))
    : 1;
  const page = Math.min(requestedPage, pageCount);
  const pageRows = pageSize
    ? sortedRows.slice((page - 1) * pageSize, page * pageSize)
    : sortedRows;
  const rowIds = pageRows.map(({ row, originalIndex }) => getRowId(row, originalIndex));
  const allRowsSelected = rowIds.length > 0 && rowIds.every((id) => selectedSet.has(id));
  const someRowsSelected = rowIds.some((id) => selectedSet.has(id)) && !allRowsSelected;
  const activeFocusedRowIndex = Math.min(focusedRowIndex, Math.max(0, pageRows.length - 1));

  function updateSelection(nextIds) {
    if (!controlledSelection) setInternalSelectedIds(nextIds);
    onSelectionChange?.(nextIds);
  }

  function toggleRow(id) {
    const nextIds = selectedSet.has(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];
    updateSelection(nextIds);
  }

  function toggleVisibleRows() {
    const nextIds = allRowsSelected
      ? selectedIds.filter((id) => !rowIds.includes(id))
      : [...new Set([...selectedIds, ...rowIds])];
    updateSelection(nextIds);
  }

  function toggleColumn(key) {
    if (visibleSet.has(key) && visibleColumns.length === 1) return;
    const nextKeys = visibleSet.has(key)
      ? activeVisibleKeys.filter((visibleKey) => visibleKey !== key)
      : [...activeVisibleKeys, key];
    if (!controlledVisibility) setInternalVisibleKeys(nextKeys);
    onVisibleColumnKeysChange?.(nextKeys);
  }

  function toggleSort(column) {
    const nextSort = {
      key: column.key,
      direction:
        activeSort?.key === column.key && activeSort.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    };
    if (!controlledSort) setInternalSort(nextSort);
    onSortChange?.(nextSort);
  }

  function handleRowKeyDown(event, index) {
    if (event.target.closest('button, input, select, textarea, a')) return;
    let nextIndex = index;
    if (event.key === 'ArrowDown') nextIndex = Math.min(pageRows.length - 1, index + 1);
    else if (event.key === 'ArrowUp') nextIndex = Math.max(0, index - 1);
    else return;
    event.preventDefault();
    setFocusedRowIndex(nextIndex);
    rowRefs.current[nextIndex]?.focus();
  }

  function getPageLabel(pageNumber) {
    return pagination?.getPageLabel?.(pageNumber) ?? labels.pageLabel?.(pageNumber);
  }

  return (
    <section
      className={`ui-data-table${className ? ` ${className}` : ''}`}
      aria-label={label}
      aria-busy={loading}
      style={{ '--ui-data-table-max-height': maxHeight }}
    >
      <div className="ui-data-table__toolbar">
        {selectable ? (
          <span className="ui-data-table__selection-count">
            {labels.selectedCount?.(selectedIds.length)}
          </span>
        ) : null}
        <details className="ui-data-table__column-menu">
          <summary>{labels.columns}</summary>
          <div className="ui-data-table__column-options">
            {columns.map((column) => (
              <label key={column.key}>
                <input
                  type="checkbox"
                  checked={visibleSet.has(column.key)}
                  disabled={visibleSet.has(column.key) && visibleColumns.length === 1}
                  onChange={() => toggleColumn(column.key)}
                />
                <span>{column.label}</span>
              </label>
            ))}
          </div>
        </details>
      </div>

      {loading ? (
        <div className="ui-data-table__skeleton" role="status" aria-label={labels.loading}>
          {Array.from({ length: skeletonRows }, (_, rowIndex) => (
            <div className="ui-data-table__skeleton-row" key={rowIndex}>
              {visibleColumns.map((column) => (
                <Skeleton key={column.key} width={`${56 + ((rowIndex + column.key.length) % 4) * 10}%`} />
              ))}
            </div>
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="ui-data-table__state ui-data-table__state--error" role="alert">
          <p>{errorMessage ?? labels.error}</p>
          {onRetry ? (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              {labels.retry}
            </Button>
          ) : null}
        </div>
      ) : null}

      {!loading && !error && pageRows.length === 0 ? (
        <div className="ui-data-table__state" role="status">
          {labels.empty}
        </div>
      ) : null}

      {!loading && !error && pageRows.length > 0 ? (
        <div className="ui-data-table__scroll" role="region" aria-label={label} tabIndex={0}>
          <table aria-label={label}>
            <thead>
              <tr>
                {selectable ? (
                  <th scope="col" className="ui-data-table__selection-cell">
                    <input
                      type="checkbox"
                      aria-label={labels.selectAllRows}
                      checked={allRowsSelected}
                      ref={(element) => {
                        if (element) element.indeterminate = someRowsSelected;
                      }}
                      onChange={toggleVisibleRows}
                    />
                  </th>
                ) : null}
                {visibleColumns.map((column) => {
                  const isSorted = activeSort?.key === column.key;
                  const ariaSort = isSorted ? activeSort.direction : 'none';
                  return (
                    <th
                      scope="col"
                      key={column.key}
                      aria-sort={column.sortable === false ? undefined : ariaSort}
                    >
                      {column.sortable === false ? (
                        column.label
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ui-data-table__sort"
                          aria-label={column.label}
                          iconEnd={
                            <Icon
                              name={
                                isSorted
                                  ? activeSort.direction === 'ascending'
                                    ? 'arrow-up'
                                    : 'arrow-down'
                                  : 'sort'
                              }
                              size={16}
                            />
                          }
                          onClick={() => toggleSort(column)}
                        >
                          {column.label}
                        </Button>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {pageRows.map(({ row, originalIndex }, rowIndex) => {
                const rowId = getRowId(row, originalIndex);
                return (
                  <tr
                    key={rowId}
                    ref={(element) => {
                      rowRefs.current[rowIndex] = element;
                    }}
                    tabIndex={rowIndex === activeFocusedRowIndex ? 0 : -1}
                    onKeyDown={(event) => handleRowKeyDown(event, rowIndex)}
                  >
                    {selectable ? (
                      <td
                        className="ui-data-table__selection-cell"
                        data-label={labels.selectColumn}
                      >
                        <input
                          type="checkbox"
                          aria-label={getSelectRowLabel?.(row, originalIndex) ?? labels.selectRow}
                          checked={selectedSet.has(rowId)}
                          onChange={() => toggleRow(rowId)}
                        />
                      </td>
                    ) : null}
                    {visibleColumns.map((column) => {
                      const value = getValue(row, column);
                      return (
                        <td key={column.key} data-label={column.label}>
                          {column.render ? column.render(row, value) : value}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && !error && pagination ? (
        <Pagination
          page={page}
          pageCount={pageCount}
          onPageChange={pagination.onPageChange}
          label={pagination.label ?? labels.pagination}
          previousLabel={pagination.previousLabel ?? labels.previousPage}
          nextLabel={pagination.nextLabel ?? labels.nextPage}
          getPageLabel={getPageLabel}
        />
      ) : null}
    </section>
  );
}
