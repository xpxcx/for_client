import { useEffect, useState } from 'react'

const STORAGE_KEY = 'cookie_notice_dismissed'

export default function CookieNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY) === '1'
      setVisible(!dismissed)
    } catch {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="cookie-notice" role="dialog" aria-label="Уведомление о cookie">
      <div className="cookie-notice__inner">
        <p className="cookie-notice__text">
          Этот сайт использует файлы cookie и другие технологии для сбора данных. Продолжая пользоваться сайтом, вы
          соглашаетесь с их использованием.
        </p>
        <button
          type="button"
          className="cookie-notice__close"
          aria-label="Закрыть уведомление"
          onClick={() => {
            try {
              localStorage.setItem(STORAGE_KEY, '1')
            } catch {}
            setVisible(false)
          }}
        >
          ×
        </button>
      </div>
    </div>
  )
}

