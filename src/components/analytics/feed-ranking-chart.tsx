import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useChartColors } from '../../hooks/use-chart-colors'
import { useI18n } from '../../lib/i18n'

interface FeedRankingChartProps {
  data: Array<{ feed_id: number; feed_name: string; read_count: number; total_count: number }>
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

export function FeedRankingChart({ data }: FeedRankingChartProps) {
  const colors = useChartColors()
  const { t } = useI18n()

  const top10 = data.filter(d => d.read_count > 0).slice(0, 10)

  if (top10.length === 0) {
    return <p className="text-sm text-muted py-8 text-center">{t('analytics.noData')}</p>
  }

  const chartData = top10.map(d => ({ ...d, feed_name: truncate(d.feed_name, 18) }))
  const height = Math.max(180, chartData.length * 32)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fill: colors.muted, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="feed_name"
          width={130}
          tick={{ fill: colors.text, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            color: colors.text,
            fontSize: 13,
          }}
          formatter={(value, name) => {
            const label = name === 'read_count' ? t('analytics.readArticles') : t('analytics.totalArticles')
            return [Number(value), label]
          }}
          cursor={{ fill: colors.bgSubtle }}
        />
        <Bar dataKey="read_count" fill={colors.accent} radius={[0, 3, 3, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  )
}
