import { useMemo } from 'react'
import { useAppLayout } from '../app'

function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/** Resolve a CSS color to a hex string by rendering it in a temporary element. */
function resolveColor(color: string): string {
  const el = document.createElement('div')
  el.style.color = color
  document.body.appendChild(el)
  const computed = getComputedStyle(el).color
  document.body.removeChild(el)
  // computed is "rgb(r, g, b)" or "rgba(r, g, b, a)"
  const match = computed.match(/(\d+),\s*(\d+),\s*(\d+)/)
  if (!match) return color // fallback to original
  const toHex = (n: string) => parseInt(n, 10).toString(16).padStart(2, '0')
  return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`
}

/**
 * Mix two hex colors by ratio (0–1). Simple sRGB linear interpolation.
 */
function mixHex(a: string, b: string, ratio: number): string {
  const parse = (hex: string) => {
    const h = hex.replace('#', '')
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  const [r1, g1, b1] = parse(a)
  const [r2, g2, b2] = parse(b)
  if ([r1, g1, b1, r2, g2, b2].some(isNaN)) return a // fallback if parsing fails
  const mix = (c1: number, c2: number) => Math.round(c1 + (c2 - c1) * ratio)
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(mix(r1, r2))}${toHex(mix(g1, g2))}${toHex(mix(b1, b2))}`
}

/** Returns theme-aware colors for Recharts charts. Re-derives on theme/mode change. */
export function useChartColors() {
  const { settings } = useAppLayout()

  return useMemo(() => {
    const accent = getCssVar('--color-accent')
    const muted = getCssVar('--color-muted')
    const text = getCssVar('--color-text')
    const border = getCssVar('--color-border')
    const bg = getCssVar('--color-bg')
    const bgCard = getCssVar('--color-bg-card')
    const bgSubtle = getCssVar('--color-bg-subtle')

    // Resolve to hex for mixHex compatibility (handles oklch, hsl, etc.)
    const accentHex = resolveColor(accent)
    const bgHex = resolveColor(bg)
    const mutedHex = resolveColor(muted)

    return {
      accent,
      muted,
      text,
      border,
      bg,
      bgCard,
      bgSubtle,
      // Categorical palette for pie charts etc.
      categorical: [
        accentHex,
        mixHex(accentHex, bgHex, 0.3),
        mixHex(accentHex, bgHex, 0.5),
        mixHex(accentHex, bgHex, 0.7),
        mutedHex,
        mixHex(mutedHex, bgHex, 0.3),
        mixHex(mutedHex, bgHex, 0.5),
      ],
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.colorMode, settings.themeName])
}
