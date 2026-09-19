import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import type {
  JSX,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from 'react'

const ModelScene = lazy(() => import('./ModelScene'))

function FallbackVisual() {
  return (
    <img
      className="hero-svg"
      src="/core-fallback.svg"
      alt="Abstract illustration of three interlocking rings"
    />
  )
}

class SceneBoundary extends Component<
  { onUnavailable: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onUnavailable()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl'),
    )
  } catch {
    return false
  }
}
export default function HeroVisual(): JSX.Element {
  const stageRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef({ x: 0, y: 0 })
  const [reducedMotion, setReducedMotion] = useState<boolean>(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [compact, setCompact] = useState<boolean>(
    () => window.matchMedia('(max-width: 767px)').matches,
  )
  const [inView, setInView] = useState(true)
  const [documentVisible, setDocumentVisible] = useState(
    () => document.visibilityState === 'visible',
  )
  const [sceneMounted, setSceneMounted] = useState(false)
  const [ready, setReady] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [webglAvailable] = useState<boolean>(() => detectWebGL())
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!webglAvailable) setUnavailable(true)
  }, [webglAvailable])
  useEffect(() => {
    const motionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )
    const compactQuery = window.matchMedia('(max-width: 767px)')
    const onMotionChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches)
    }
    const onCompactChange = (event: MediaQueryListEvent) => {
      setCompact(event.matches)
    }
    const onVisibilityChange = () => {
      setDocumentVisible(document.visibilityState === 'visible')
    }
    motionQuery.addEventListener('change', onMotionChange)
    compactQuery.addEventListener('change', onCompactChange)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      motionQuery.removeEventListener('change', onMotionChange)
      compactQuery.removeEventListener('change', onCompactChange)
      document.removeEventListener(
        'visibilitychange',
        onVisibilityChange,
      )
    }
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        setInView(entries.some((entry) => entry.intersectionRatio > 0))
      },
      { threshold: 0, rootMargin: '0px' },
    )
    observer.observe(stage)
    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (inView && documentVisible && !reducedMotion) {
      setSceneMounted(true)
    }
  }, [inView, documentVisible, reducedMotion])

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1
    pointerRef.current.x = Math.max(-1, Math.min(1, x))
    pointerRef.current.y = Math.max(-1, Math.min(1, y))
  }

  const handlePointerLeave = () => {
    pointerRef.current.x = 0
    pointerRef.current.y = 0
  }

  const handleReady = useCallback(() => {
    setReady(true)
  }, [])

  const handleUnavailable = useCallback(() => {
    setUnavailable(true)
  }, [])

  const active = inView && documentVisible && !paused && !reducedMotion
  const showCanvas = sceneMounted && !reducedMotion && !unavailable && webglAvailable

  return (
    <div className="hero-visual">
      <div
        className="stage"
        ref={stageRef}
        aria-hidden="true"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {showCanvas ? (
          <Suspense fallback={<FallbackVisual />}>
            <SceneBoundary onUnavailable={handleUnavailable}>
              <ModelScene
                active={active}
                compact={compact}
                pointer={pointerRef}
                onReady={handleReady}
                onUnavailable={handleUnavailable}
              />
            </SceneBoundary>
          </Suspense>
        ) : (
          <FallbackVisual />
        )}
      </div>
      {ready && !unavailable && !reducedMotion && (
        <button
          className="motion-toggle"
          type="button"
          onClick={() => setPaused((previous) => !previous)}
        >
          {paused ? 'Resume motion' : 'Pause motion'}
        </button>
      )}
      <p className="hero-caption">
        {unavailable ? 'Static illustration' : 'Abstract illustration'}
      </p>
    </div>
  )
}
