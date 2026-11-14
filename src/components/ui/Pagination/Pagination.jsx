import { Button } from '../Button/Button.jsx';
import { Icon } from '../Icon/Icon.jsx';
import './Pagination.css';

export function Pagination({
  page,
  pageCount,
  onPageChange,
  label,
  previousLabel,
  nextLabel,
  getPageLabel,
  className = '',
}) {
  const totalPages = Number.isFinite(pageCount) ? Math.max(1, Math.floor(pageCount)) : 1;
  const requestedPage = Number.isFinite(page) ? Math.floor(page) : 1;
  const currentPage = Math.min(totalPages, Math.max(1, requestedPage));

  return (
    <nav
      className={`ui-pagination${className ? ` ${className}` : ''}`}
      aria-label={label}
    >
      <Button
        variant="ghost"
        size="sm"
        aria-label={previousLabel}
        disabled={currentPage === 1}
        onClick={() => onPageChange?.(currentPage - 1)}
      >
        <Icon name="chevron-left" flip />
      </Button>
      <div className="ui-pagination__pages">
        {Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;
          const current = pageNumber === currentPage;
          return (
            <Button
              key={pageNumber}
              variant={current ? 'primary' : 'ghost'}
              size="sm"
              aria-label={getPageLabel?.(pageNumber) ?? String(pageNumber)}
              aria-current={current ? 'page' : undefined}
              onClick={() => onPageChange?.(pageNumber)}
            >
              {pageNumber}
            </Button>
          );
        })}
      </div>
      <Button
        variant="ghost"
        size="sm"
        aria-label={nextLabel}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange?.(currentPage + 1)}
      >
        <Icon name="chevron-right" flip />
      </Button>
    </nav>
  );
}
