import { useEffect, useRef } from 'react'
import type { CSSProperties, JSX, ReactNode, Ref, RefObject } from 'react'

import './reveal.css'

interface RevealProps {
  as?: string
  className?: string
  delay?: number
  children?: ReactNode
}

export function Reveal({
  as = 'div',
  className,
  delay = 0,
  children,
}: RevealProps): JSX.Element {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let observer: IntersectionObserver | null = null
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')

    const reveal = () => {
      el.classList.add('is-revealed')
      if (observer) {
        observer.disconnect()
        observer = null
      }
    }

    if (mql.matches || typeof IntersectionObserver === 'undefined') {
      reveal()
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) reveal()
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
      )
      observer.observe(el)
    }

    const handleMediaChange = (event: MediaQueryListEvent) => {
      if (event.matches) reveal()
    }
    mql.addEventListener('change', handleMediaChange)

    return () => {
      mql.removeEventListener('change', handleMediaChange)
      if (observer) observer.disconnect()
    }
  }, [])

  // Unsupported tags degrade to the div check; the unchecked cast documents that.
  type RevealTag = 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'h2' | 'h3' | 'p' | 'span'
  const Tag = as as RevealTag
  const props = {
    // Ref<never> is assignable to the intrinsic union's per-element Ref<X> members.
    ref: ref as unknown as Ref<never>,
    className: `reveal ${className ?? ''}`.trim(),
    style: delay > 0 ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined,
    children,
  }

  return <Tag {...props} />
}

export function ScrollProgress(): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let rafId = 0
    let pending = false

    const update = () => {
      pending = false
      const max =
        document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      el.style.setProperty('--scroll-p', String(p))
    }
    const schedule = () => {
      if (!pending) {
        pending = true
        rafId = requestAnimationFrame(update)
      }
    }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div ref={ref} className="scroll-progress" aria-hidden="true">
      <div className="scroll-progress-bar" />
    </div>
  )
}

export function useScrollProgressVar(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    let rafId = 0
    let pending = false

    const update = () => {
      pending = false
      const rect = el.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, -rect.top / (rect.height + 200)))
      el.style.setProperty('--scroll-progress', String(p))
    }
    const schedule = () => {
      if (!pending) {
        pending = true
        rafId = requestAnimationFrame(update)
      }
    }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(rafId)
    }
  }, [ref])
}
