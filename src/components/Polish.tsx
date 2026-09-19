import { useEffect, useRef } from 'react'
import type { JSX, ReactNode } from 'react'
import './polish.css'

/**
 * Pointer-follow wrapper: translates its child toward the pointer with a
 * damped rAF lerp (max ±10px). Active only on fine-pointer devices that
 * have not requested reduced motion; the loop stops as soon as settled,
 * so there is no idle rAF.
 */
export function Magnetic({
  children,
  strength = 0.3,
}: {
  children: ReactNode
  strength?: number
}): JSX.Element {
  const outerRef = useRef<HTMLSpanElement | null>(null)
  const innerRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let rafId = 0
    let running = false

    const apply = () => {
      inner.style.transform = `translate(${current.x}px, ${current.y}px)`
    }

    const step = () => {
      current.x += (target.x - current.x) * 0.15
      current.y += (target.y - current.y) * 0.15
      if (Math.abs(current.x - target.x) < 0.1 && Math.abs(current.y - target.y) < 0.1) {
        current.x = target.x
        current.y = target.y
        apply()
        rafId = 0
        running = false
        return
      }
      apply()
      rafId = requestAnimationFrame(step)
    }

    const kick = () => {
      if (!running) {
        running = true
        rafId = requestAnimationFrame(step)
      }
    }

    const onMove = (event: PointerEvent) => {
      const rect = outer.getBoundingClientRect()
      target.x = Math.max(-10, Math.min(10, (event.clientX - rect.left - rect.width / 2) * strength))
      target.y = Math.max(-10, Math.min(10, (event.clientY - rect.top - rect.height / 2) * strength))
      kick()
    }

    const onLeave = () => {
      target.x = 0
      target.y = 0
      kick()
    }

    const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)')
    const fineQuery = matchMedia('(pointer: fine)')

    const reset = () => {
      cancelAnimationFrame(rafId)
      running = false
      target.x = 0
      target.y = 0
      current.x = 0
      current.y = 0
      apply()
    }
    const onFineChange = () => {
      if (fineQuery.matches && !reduceQuery.matches) {
        outer.addEventListener('pointermove', onMove, { passive: true })
        outer.addEventListener('pointerleave', onLeave, { passive: true })
      } else {
        outer.removeEventListener('pointermove', onMove)
        outer.removeEventListener('pointerleave', onLeave)
        reset()
      }
    }

    const onReduceChange = () => {
      if (!reduceQuery.matches) {
        onFineChange()
      } else {
        outer.removeEventListener('pointermove', onMove)
        outer.removeEventListener('pointerleave', onLeave)
        reset()
      }
    }

    onFineChange()
    fineQuery.addEventListener('change', onFineChange)
    reduceQuery.addEventListener('change', onReduceChange)

    return () => {
      fineQuery.removeEventListener('change', onFineChange)
      reduceQuery.removeEventListener('change', onReduceChange)
      outer.removeEventListener('pointermove', onMove)
      outer.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(rafId)
    }
  }, [strength])

  return (
    <span ref={outerRef} className="magnetic">
      <span ref={innerRef}>{children}</span>
    </span>
  )
}

/**
 * Animated gradient text. Pure markup — the gradient, shift animation,
 * reduced-motion override, and clip fallback all live in polish.css, so
 * text is never left invisible.
 */
export function GradientWord({ children }: { children: ReactNode }): JSX.Element {
  return <span className="gradient-word">{children}</span>
}
