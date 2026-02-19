import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Material } from '../../api/materials'
import { materialsKeys, fetchMaterials } from '../../api/materials'
import PageNavButtons from '../../components/PageNavButtons'
import Pagination, { PAGE_SIZE } from '../../components/Pagination'
import './MaterialsPage.css'

function MaterialCard({ item }: { item: Material }) {
  return (
    <article className="card material-card">
      <div className="material-info-item">
        <span className="material-info-label">Название</span>
        <span className="material-info-value material-info-title">{item.title}</span>
      </div>
      {item.description && (
        <div className="material-info-item">
          <span className="material-info-label">Описание</span>
          <p className="material-info-desc">{item.description}</p>
        </div>
      )}
      {item.fileUrl && (
        <div className="material-info-item">
          <span className="material-info-label">Материал</span>
          <a href={item.fileUrl} target="_blank" rel="noreferrer" className="material-info-link">
            Открыть материал
          </a>
        </div>
      )}
    </article>
  )
}

export default function MaterialsPage() {
  const [page, setPage] = useState(1)
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: materialsKeys.list(),
    queryFn: fetchMaterials,
  })

  if (isLoading) {
    return (
      <section className="page">
        <h1>Материалы</h1>
        <div className="card"><p>Загрузка...</p></div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="page">
        <h1>Материалы</h1>
        <div className="card">
          <p className="error">
            {error instanceof Error ? error.message : 'Не удалось загрузить материалы'}
          </p>
        </div>
      </section>
    )
  }

  const total = items.length
  const from = (page - 1) * PAGE_SIZE
  const pageItems = items.slice(from, from + PAGE_SIZE)

  return (
    <section className="page materials-page">
      <h1>Материалы уроков и мероприятий</h1>
      <p className="materials-intro">
        Открытые уроки, видеоматериалы, фотогалерея, презентации и документы.
      </p>
      <div className="materials-list">
        {pageItems.length === 0 ? (
          <div className="card"><p>Материалов пока нет.</p></div>
        ) : (
          pageItems.map((item) => <MaterialCard key={item.id} item={item} />)
        )}
      </div>
      <Pagination totalItems={total} currentPage={page} onPageChange={setPage} />
      <PageNavButtons />
    </section>
  )
}
