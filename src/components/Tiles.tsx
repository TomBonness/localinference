import { useEffect, useRef } from 'react'
import type { JSX } from 'react'
import './tiles.css'

export type SpecItem = {
  label: string
  value: string
  href?: string
  external?: boolean
}

export type PillarItem = {
  index: string
  title: string
  body: string
}

export type ResourceLink = {
  label: string
  href: string
  external?: boolean
  note?: string
}

/**
 * Pointer-tracked spotlight: one passive pointermove listener on the list,
 * rAF-throttled, writes --spot-x/--spot-y to the tile under the cursor.
 */
function useSpotlightRef() {
  const ref = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    let frame = 0
    let x = 0
    let y = 0
    let target: EventTarget | null = null

    const apply = () => {
      frame = 0
      const el = target as HTMLElement | null
      const tile = (el ? el.closest('.tile') : null) as HTMLElement | null
      if (tile && root.contains(tile)) {
        const rect = tile.getBoundingClientRect()
        tile.style.setProperty('--spot-x', `${x - rect.left}px`)
        tile.style.setProperty('--spot-y', `${y - rect.top}px`)
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      x = event.clientX
      y = event.clientY
      target = event.target
      if (frame === 0) {
        frame = requestAnimationFrame(apply)
      }
    }

    root.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => {
      root.removeEventListener('pointermove', onPointerMove)
      if (frame !== 0) {
        cancelAnimationFrame(frame)
      }
    }
  }, [])

  return ref
}

export function SpecGrid({
  items,
  className,
}: {
  items: SpecItem[]
  className?: string
}): JSX.Element {
  const ref = useSpotlightRef()
  const rootClass = className ? `spec-grid tile-list ${className}` : 'spec-grid tile-list'
  return (
    <ul ref={ref} className={rootClass} data-spotlight>
      {items.map((item) => (
        <li key={item.label} className="tile spec-tile">
          <span className="tile-label">{item.label}</span>
          {item.href ? (
            <a
              className="tile-value tile-link"
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
            >
              {item.value}
              {item.external ? (
                <span className="visually-hidden">opens in a new tab</span>
              ) : null}
            </a>
          ) : (
            <span className="tile-value">{item.value}</span>
          )}
        </li>
      ))}
    </ul>
  )
}

export function PillarCards({
  items,
  className,
}: {
  items: PillarItem[]
  className?: string
}): JSX.Element {
  const ref = useSpotlightRef()
  const rootClass = className
    ? `pillar-grid tile-list ${className}`
    : 'pillar-grid tile-list'
  return (
    <ul ref={ref} className={rootClass} data-spotlight>
      {items.map((item) => (
        <li key={item.index} className="tile pillar-tile">
          <span className="pillar-index">{item.index}</span>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </li>
      ))}
    </ul>
  )
}

export function ResourceTiles({
  links,
  className,
}: {
  links: ResourceLink[]
  className?: string
}): JSX.Element {
  const ref = useSpotlightRef()
  const rootClass = className ? `cta-tiles tile-list ${className}` : 'cta-tiles tile-list'
  return (
    <ul ref={ref} className={rootClass} data-spotlight>
      {links.map((link) => (
        <li key={link.label} className="tile cta-tile">
          <a
            className="cta-tile-link"
            href={link.href}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
          >
            {link.label}
            <span className="cta-arrow" aria-hidden="true">
              ↗
            </span>
            {link.note ? <span className="cta-note">{link.note}</span> : null}
            {link.external ? (
              <span className="visually-hidden">opens in a new tab</span>
            ) : null}
          </a>
        </li>
      ))}
    </ul>
  )
}
