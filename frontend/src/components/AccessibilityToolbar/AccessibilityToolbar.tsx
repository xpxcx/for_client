import './AccessibilityToolbar.css'

const FONT_STEP = 2
const MIN_PT = 12
const MAX_PT = 24

export type AccessibilityColorScheme = 'default' | 'inverted' | 'blue' | 'yellow' | 'brown'
export type AccessibilityImagesMode = 'on' | 'off' | 'grayscale'

interface AccessibilityToolbarProps {
  fontSizePt: number
  onFontSizeChange: (pt: number) => void
  colorScheme: AccessibilityColorScheme
  onColorSchemeChange: (scheme: AccessibilityColorScheme) => void
  imagesMode: AccessibilityImagesMode
  onImagesModeChange: (mode: AccessibilityImagesMode) => void
}

const COLOR_SCHEMES: { id: AccessibilityColorScheme; label: string; title: string }[] = [
  { id: 'default', label: 'Аа', title: 'Черным по белому' },
  { id: 'inverted', label: 'Аа', title: 'Белым по черному' },
  { id: 'blue', label: 'Аа', title: 'Синяя' },
  { id: 'yellow', label: 'Аа', title: 'Желтая' },
  { id: 'brown', label: 'Аа', title: 'Коричневая' },
]

export default function AccessibilityToolbar({
  fontSizePt,
  onFontSizeChange,
  colorScheme,
  onColorSchemeChange,
  imagesMode,
  onImagesModeChange,
}: AccessibilityToolbarProps) {
  const decreaseFont = () => onFontSizeChange(Math.max(MIN_PT, fontSizePt - FONT_STEP))
  const increaseFont = () => onFontSizeChange(Math.min(MAX_PT, fontSizePt + FONT_STEP))

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="accessibility-toolbar" role="toolbar" aria-label="Настройки для слабовидящих">
      <div className="accessibility-toolbar-inner">
        <section className="accessibility-toolbar-section" aria-label="Размер шрифта">
          <span className="accessibility-toolbar-label">Размер шрифта</span>
          <div className="accessibility-toolbar-font-controls">
            <button
              type="button"
              className="accessibility-toolbar-btn"
              onClick={decreaseFont}
              disabled={fontSizePt <= MIN_PT}
              aria-label="Уменьшить шрифт"
            >
              A−
            </button>
            <button
              type="button"
              className="accessibility-toolbar-btn"
              onClick={increaseFont}
              disabled={fontSizePt >= MAX_PT}
              aria-label="Увеличить шрифт"
            >
              A+
            </button>
          </div>
          <span className="accessibility-toolbar-value">{fontSizePt} пунктов</span>
        </section>

        <div className="accessibility-toolbar-sep" aria-hidden />

        <section className="accessibility-toolbar-section" aria-label="Цвета сайта">
          <span className="accessibility-toolbar-label">Цвета сайта</span>
          <div className="accessibility-toolbar-colors">
            {COLOR_SCHEMES.map(({ id, title }) => (
              <button
                key={id}
                type="button"
                className={`accessibility-toolbar-color-btn accessibility-toolbar-color-${id} ${colorScheme === id ? 'active' : ''}`}
                onClick={() => onColorSchemeChange(id)}
                title={title}
                aria-label={title}
                aria-pressed={colorScheme === id}
              >
                <span className="accessibility-toolbar-color-letter">А</span>
              </button>
            ))}
          </div>
          <span className="accessibility-toolbar-value">
            {COLOR_SCHEMES.find((s) => s.id === colorScheme)?.title ?? 'Черным по белому'}
          </span>
        </section>

        <div className="accessibility-toolbar-sep" aria-hidden />

        <section className="accessibility-toolbar-section" aria-label="Изображения">
          <span className="accessibility-toolbar-label">Изображения</span>
          <div className="accessibility-toolbar-images">
            <button
              type="button"
              className={`accessibility-toolbar-btn accessibility-toolbar-img-btn ${imagesMode === 'on' ? 'active' : ''}`}
              onClick={() => onImagesModeChange('on')}
              title="Включены"
              aria-label="Показывать изображения"
              aria-pressed={imagesMode === 'on'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </button>
            <button
              type="button"
              className={`accessibility-toolbar-btn accessibility-toolbar-img-btn ${imagesMode === 'off' ? 'active' : ''}`}
              onClick={() => onImagesModeChange('off')}
              title="Выключены"
              aria-label="Скрыть изображения"
              aria-pressed={imagesMode === 'off'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="21" x2="21" y2="3" />
              </svg>
            </button>
            <button
              type="button"
              className={`accessibility-toolbar-btn accessibility-toolbar-img-btn ${imagesMode === 'grayscale' ? 'active' : ''}`}
              onClick={() => onImagesModeChange('grayscale')}
              title="Оттенки серого"
              aria-label="Изображения в оттенках серого"
              aria-pressed={imagesMode === 'grayscale'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v18M3 12h18" />
              </svg>
            </button>
          </div>
          <span className="accessibility-toolbar-value">
            {imagesMode === 'on' ? 'Включены' : imagesMode === 'off' ? 'Выключены' : 'Оттенки серого'}
          </span>
        </section>

        <div className="accessibility-toolbar-sep" aria-hidden />

        <section className="accessibility-toolbar-section accessibility-toolbar-extra" aria-label="Дополнительно">
          <span className="accessibility-toolbar-label">Дополнительно</span>
          <div className="accessibility-toolbar-extra-btns">
            <button
              type="button"
              className="accessibility-toolbar-btn accessibility-toolbar-icon-btn"
              onClick={scrollToTop}
              title="Наверх"
              aria-label="Прокрутить страницу вверх"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
