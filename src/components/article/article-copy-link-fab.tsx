import { useState, useCallback } from 'react'
import { Link2, Check } from 'lucide-react'
import { useI18n } from '../../lib/i18n'

interface ArticleCopyLinkFabProps {
  url: string
  chatPanelOpen?: boolean
}

export function ArticleCopyLinkFab({ url, chatPanelOpen }: ArticleCopyLinkFabProps) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [url])

  // When chat panel is open (max-h 500px, bottom 5rem), move above it
  const bottom = chatPanelOpen
    ? 'calc(5rem + 500px + 0.75rem + var(--safe-area-inset-bottom))'
    : 'calc(5.5rem + var(--safe-area-inset-bottom))'

  return (
    <button
      onClick={handleCopy}
      style={{ bottom }}
      className="fixed right-6 z-50 h-12 rounded-full bg-accent text-accent-text flex items-center justify-center gap-2 px-4 shadow-lg hover:opacity-90 transition-all duration-300 select-none"
      aria-label={t('article.copyLink')}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">{t('article.linkCopied')}</span>
        </>
      ) : (
        <>
          <Link2 className="w-4 h-4" />
          <span className="text-sm font-medium">{t('article.copyLink')}</span>
        </>
      )}
    </button>
  )
}
