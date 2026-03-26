import { useState } from 'react'
import useSWR from 'swr'
import { FileText, BookOpen, Bookmark, ThumbsUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { fetcher } from '../lib/fetcher'
import { useI18n } from '../lib/i18n'
import { DailyReadsChart } from '../components/analytics/daily-reads-chart'
import { FeedRankingChart } from '../components/analytics/feed-ranking-chart'
import { CategoryChart } from '../components/analytics/category-chart'
import { Skeleton } from '@/components/ui/skeleton'

type Period = '1w' | '2w' | '1m' | '3m' | 'all'

const PERIODS: Period[] = ['1w', '2w', '1m', '3m', 'all']

interface AnalyticsData {
  period: Period
  summary: {
    total_articles: number
    read_articles: number
    bookmarked_articles: number
    liked_articles: number
  }
  daily_reads: Array<{ date: string; read_count: number }>
  feed_ranking: Array<{ feed_id: number; feed_name: string; read_count: number; total_count: number }>
  category_distribution: Array<{ category_id: number | null; category_name: string | null; article_count: number }>
}

// --- StatCard ---

function StatCard({ label, value, icon: Icon }: { label: string; value: number | undefined; icon: LucideIcon }) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} strokeWidth={1.5} className="text-accent" />
        <span className="text-xs text-muted">{label}</span>
      </div>
      {value != null ? (
        <p className="text-2xl font-semibold text-text">{value.toLocaleString()}</p>
      ) : (
        <Skeleton className="h-8 w-16" />
      )}
    </div>
  )
}

// --- PeriodSelector ---

function PeriodSelector({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const { t } = useI18n()
  const periodKeys: Record<Period, string> = {
    '1w': 'analytics.period.1w',
    '2w': 'analytics.period.2w',
    '1m': 'analytics.period.1m',
    '3m': 'analytics.period.3m',
    'all': 'analytics.period.all',
  } as const

  return (
    <div className="flex gap-1">
      {PERIODS.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            p === value
              ? 'bg-hover text-accent font-medium'
              : 'text-muted hover:text-text hover:bg-hover'
          }`}
        >
          {t(periodKeys[p] as 'analytics.period.1w')}
        </button>
      ))}
    </div>
  )
}

// --- Section wrapper ---

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-medium text-muted mb-3">{title}</h2>
      <div className="rounded-xl border border-border bg-bg-card p-4">
        {children}
      </div>
    </section>
  )
}

// --- AnalyticsPage ---

export function AnalyticsPage() {
  const { t } = useI18n()
  const [period, setPeriod] = useState<Period>('1w')

  const { data } = useSWR<AnalyticsData>(`/api/analytics?period=${period}`, fetcher)

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-12 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-lg font-semibold text-text">{t('analytics.title')}</h1>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={FileText} label={t('analytics.totalArticles')} value={data?.summary.total_articles} />
        <StatCard icon={BookOpen} label={t('analytics.readArticles')} value={data?.summary.read_articles} />
        <StatCard icon={Bookmark} label={t('analytics.bookmarked')} value={data?.summary.bookmarked_articles} />
        <StatCard icon={ThumbsUp} label={t('analytics.liked')} value={data?.summary.liked_articles} />
      </div>

      {/* Daily reads chart */}
      <Section title={t('analytics.dailyReads')}>
        {data ? (
          <DailyReadsChart data={data.daily_reads} />
        ) : (
          <Skeleton className="h-[220px] w-full" />
        )}
      </Section>

      {/* Two-column: feed ranking + category breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title={t('analytics.feedRanking')}>
          {data ? (
            <FeedRankingChart data={data.feed_ranking} />
          ) : (
            <Skeleton className="h-[200px] w-full" />
          )}
        </Section>

        <Section title={t('analytics.categoryBreakdown')}>
          {data ? (
            <CategoryChart data={data.category_distribution} />
          ) : (
            <Skeleton className="h-[220px] w-full" />
          )}
        </Section>
      </div>
    </div>
  )
}
