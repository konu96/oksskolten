import { getDb } from './connection.js'

// --- Period helpers ---

const PERIOD_DAYS: Record<string, number> = { '1w': 7, '2w': 14, '1m': 30, '3m': 90 }

/** Convert period string to an ISO datetime, or null for 'all'. */
export function periodToSince(period: string): string | null {
  const days = PERIOD_DAYS[period]
  if (!days) return null // 'all'
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

// --- Summary ---

export function getAnalyticsSummary(since: string | null): {
  total_articles: number
  read_articles: number
  bookmarked_articles: number
  liked_articles: number
} {
  if (since) {
    const row = getDb().prepare(`
      SELECT
        (SELECT COUNT(*) FROM active_articles WHERE published_at >= ?) AS total_articles,
        (SELECT COUNT(*) FROM active_articles WHERE read_at IS NOT NULL AND read_at >= ?) AS read_articles,
        (SELECT COUNT(*) FROM active_articles WHERE bookmarked_at IS NOT NULL AND bookmarked_at >= ?) AS bookmarked_articles,
        (SELECT COUNT(*) FROM active_articles WHERE liked_at IS NOT NULL AND liked_at >= ?) AS liked_articles
    `).get(since, since, since, since) as {
      total_articles: number; read_articles: number; bookmarked_articles: number; liked_articles: number
    }
    return row
  }

  const row = getDb().prepare(`
    SELECT
      COUNT(*) AS total_articles,
      COUNT(read_at) AS read_articles,
      COUNT(bookmarked_at) AS bookmarked_articles,
      COUNT(liked_at) AS liked_articles
    FROM active_articles
  `).get() as {
    total_articles: number; read_articles: number; bookmarked_articles: number; liked_articles: number
  }
  return row
}

// --- Daily reads ---

export function getDailyReads(since: string | null): Array<{ date: string; read_count: number }> {
  if (since) {
    // Use recursive CTE to fill zero-count days
    const rows = getDb().prepare(`
      WITH RECURSIVE dates(d) AS (
        SELECT date(?)
        UNION ALL
        SELECT date(d, '+1 day') FROM dates WHERE d < date('now')
      ),
      reads AS (
        SELECT date(read_at) AS d, COUNT(*) AS cnt
        FROM active_articles
        WHERE read_at IS NOT NULL AND read_at >= ?
        GROUP BY date(read_at)
      )
      SELECT dates.d AS date, COALESCE(reads.cnt, 0) AS read_count
      FROM dates
      LEFT JOIN reads ON dates.d = reads.d
      ORDER BY dates.d
    `).all(since, since) as Array<{ date: string; read_count: number }>
    return rows
  }

  // 'all' period — sparse data, cap at 365 most recent days
  const rows = getDb().prepare(`
    SELECT date(read_at) AS date, COUNT(*) AS read_count
    FROM active_articles
    WHERE read_at IS NOT NULL
      AND read_at >= datetime('now', '-365 days')
    GROUP BY date(read_at)
    ORDER BY date ASC
  `).all() as Array<{ date: string; read_count: number }>
  return rows
}

// --- Feed ranking ---

export function getFeedRanking(since: string | null, limit = 15): Array<{
  feed_id: number
  feed_name: string
  read_count: number
  total_count: number
}> {
  if (since) {
    return getDb().prepare(`
      SELECT
        a.feed_id,
        f.name AS feed_name,
        COUNT(CASE WHEN a.read_at IS NOT NULL THEN 1 END) AS read_count,
        COUNT(*) AS total_count
      FROM active_articles a
      JOIN feeds f ON a.feed_id = f.id
      WHERE a.published_at >= ?
      GROUP BY a.feed_id
      ORDER BY read_count DESC, total_count DESC
      LIMIT ?
    `).all(since, limit) as Array<{ feed_id: number; feed_name: string; read_count: number; total_count: number }>
  }

  return getDb().prepare(`
    SELECT
      a.feed_id,
      f.name AS feed_name,
      COUNT(CASE WHEN a.read_at IS NOT NULL THEN 1 END) AS read_count,
      COUNT(*) AS total_count
    FROM active_articles a
    JOIN feeds f ON a.feed_id = f.id
    GROUP BY a.feed_id
    ORDER BY read_count DESC, total_count DESC
    LIMIT ?
  `).all(limit) as Array<{ feed_id: number; feed_name: string; read_count: number; total_count: number }>
}

// --- Category distribution ---

export function getCategoryDistribution(since: string | null): Array<{
  category_id: number | null
  category_name: string | null
  article_count: number
}> {
  if (since) {
    return getDb().prepare(`
      SELECT
        a.category_id,
        c.name AS category_name,
        COUNT(*) AS article_count
      FROM active_articles a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.published_at >= ?
      GROUP BY a.category_id
      ORDER BY article_count DESC
    `).all(since) as Array<{ category_id: number | null; category_name: string | null; article_count: number }>
  }

  return getDb().prepare(`
    SELECT
      a.category_id,
      c.name AS category_name,
      COUNT(*) AS article_count
    FROM active_articles a
    LEFT JOIN categories c ON a.category_id = c.id
    GROUP BY a.category_id
    ORDER BY article_count DESC
  `).all() as Array<{ category_id: number | null; category_name: string | null; article_count: number }>
}
