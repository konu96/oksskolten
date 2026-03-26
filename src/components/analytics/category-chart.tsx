import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useChartColors } from '../../hooks/use-chart-colors'
import { useI18n } from '../../lib/i18n'

interface CategoryChartProps {
  data: Array<{ category_id: number | null; category_name: string | null; article_count: number }>
}

export function CategoryChart({ data }: CategoryChartProps) {
  const colors = useChartColors()
  const { t, locale } = useI18n()

  if (data.length === 0) {
    return <p className="text-sm text-muted py-8 text-center">{t('analytics.noData')}</p>
  }

  const chartData = data.map(d => ({
    ...d,
    category_name: d.category_name ?? t('analytics.uncategorized'),
  }))

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="article_count"
            nameKey="category_name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={2}
            stroke="none"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={colors.categorical[i % colors.categorical.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              color: colors.text,
              fontSize: 13,
            }}
            formatter={(value) => [t('analytics.articles', { count: Number(value).toLocaleString(locale) }), null]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
        {chartData.map((d, i) => (
          <li key={d.category_id ?? 'uncategorized'} className="flex items-center gap-1.5 text-xs text-muted">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: colors.categorical[i % colors.categorical.length] }}
            />
            <span>{d.category_name}</span>
            <span className="text-muted">({d.article_count})</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
