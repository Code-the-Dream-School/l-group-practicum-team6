type PaginationItem = number | 'ellipsis';

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 2) {
    return [1, 2, 3, 'ellipsis'];
  }

  if (currentPage >= totalPages - 1) {
    return ['ellipsis', totalPages - 2, totalPages - 1, totalPages];
  }

  return ['ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis'];
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const items = getPaginationItems(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="flex w-full items-center justify-center gap-6 rounded-2xl px-6 py-5"
    >
      <button
        type="button"
        aria-label="Previous page"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="text-lg text-white/45 transition hover:text-white/75 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
      >
        &larr;
      </button>

      <div className="flex items-center gap-6">
        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="text-sm text-white/45">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Page ${item}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={
                item === page
                  ? 'flex h-9 w-9 items-center justify-center rounded-full bg-[#8b5cf6] text-sm font-medium text-white cursor-pointer'
                  : 'text-sm text-white/45 transition hover:text-white/75 cursor-pointer'
              }
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        aria-label="Next page"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="text-lg text-white/45 transition hover:text-white/75 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
      >
        &rarr;
      </button>
    </nav>
  );
}
