/**
 * Decode common HTML/XML entities that RSS feeds leave encoded in titles.
 * Handles named entities (&amp; &lt; &gt; &quot; &apos;),
 * decimal numeric (&#123;), and hex numeric (&#x7B;) references.
 */
export function decodeHtmlEntities(s: string): string {
  if (!s.includes('&')) return s
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
}
