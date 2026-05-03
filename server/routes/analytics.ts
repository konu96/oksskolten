import type { FastifyInstance } from 'fastify'
import { periodToSince, getAnalyticsSummary, getDailyReads, getFeedRanking, getCategoryDistribution } from '../db/analytics.js'

const VALID_PERIODS = new Set(['1w', '2w', '1m', '3m', 'all'])

export async function analyticsRoutes(api: FastifyInstance): Promise<void> {
  api.get('/api/analytics', async (request, reply) => {
    const { period = '1w' } = request.query as { period?: string }

    if (!VALID_PERIODS.has(period)) {
      return reply.status(400).send({ error: 'Invalid period. Use: 1w, 2w, 1m, 3m, all' })
    }

    const since = periodToSince(period)

    reply.send({
      period,
      summary: getAnalyticsSummary(since),
      daily_reads: getDailyReads(since),
      feed_ranking: getFeedRanking(since),
      category_distribution: getCategoryDistribution(since),
    })
  })
}
