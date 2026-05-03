import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useChartColors } from '../../hooks/use-chart-colors'
import { useI18n } from '../../lib/i18n'

interface DailyReadsChartProps {
  data: Array<{ date: string; read_count: number }>
}

function formatTick(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function DailyReadsChart({ data }: DailyReadsChartProps) {
  const colors = useChartColors()
  const { t } = useI18n()

  if (data.length === 0) {
    return <p className="text-sm text-muted py-8 text-center">{t('analytics.noData')}</p>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatTick}
          tick={{ fill: colors.muted, fontSize: 11 }}
          axisLine={{ stroke: colors.border }}
          tickLine={false}
          interval={data.length > 31 ? 'preserveStartEnd' : undefined}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: colors.muted, fontSize: 11 }}
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
          labelFormatter={(label) => {
            const d = new Date(String(label) + 'T00:00:00')
            return d.toLocaleDateString()
          }}
          formatter={(value) => [Number(value), t('analytics.readArticles')]}
          cursor={{ fill: colors.bgSubtle }}
        />
        <Bar dataKey="read_count" fill={colors.accent} radius={[3, 3, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}
