import './Pagination.css'

const PAGE_SIZE = 5

export { PAGE_SIZE }

interface PaginationProps {
  totalItems: number
  pageSize?: number
  currentPage: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  totalItems,
  pageSize = PAGE_SIZE,
  currentPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  if (totalPages <= 1) return null

  const goToPage = (page: number) => {
    onPageChange(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pages: number[] = []
  let from = Math.max(1, currentPage - 2)
  let to = Math.min(totalPages, currentPage + 2)
  if (to - from < 4) {
    if (from === 1) to = Math.min(totalPages, 5)
    else if (to === totalPages) from = Math.max(1, totalPages - 4)
  }
  for (let i = from; i <= to; i++) pages.push(i)

  return (
    <nav className="pagination" aria-label="Пагинация">
      <button
        type="button"
        className="pagination-btn"
        disabled={currentPage <= 1}
        onClick={() => goToPage(currentPage - 1)}
        aria-label="Предыдущая страница"
      >
        ← Предыдущая
      </button>
      <ul className="pagination-pages">
        {from > 1 && (
          <>
            <li>
              <button type="button" className="pagination-num" onClick={() => goToPage(1)}>1</button>
            </li>
            {from > 2 && <li className="pagination-ellipsis">…</li>}
          </>
        )}
        {pages.map((p) => (
          <li key={p}>
            <button
              type="button"
              className={`pagination-num ${p === currentPage ? 'pagination-num-active' : ''}`}
              onClick={() => goToPage(p)}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          </li>
        ))}
        {to < totalPages && (
          <>
            {to < totalPages - 1 && <li className="pagination-ellipsis">…</li>}
            <li>
              <button type="button" className="pagination-num" onClick={() => goToPage(totalPages)}>
                {totalPages}
              </button>
            </li>
          </>
        )}
      </ul>
      <button
        type="button"
        className="pagination-btn"
        disabled={currentPage >= totalPages}
        onClick={() => goToPage(currentPage + 1)}
        aria-label="Следующая страница"
      >
        Следующая →
      </button>
    </nav>
  )
}
