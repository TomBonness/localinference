import { useEffect, useRef, useState } from 'react'
import './App.css'
import HeroVisual from './components/HeroVisual'
import { Reveal, ScrollProgress, useScrollProgressVar } from './components/Reveal'
import { PillarCards, ResourceTiles, SpecGrid } from './components/Tiles'
import type { PillarItem, ResourceLink, SpecItem } from './components/Tiles'
import { GradientWord, Magnetic } from './components/Polish'

type PromptId = 'code' | 'reason' | 'create'

const PROMPT_EXAMPLES = [
  {
    id: 'code',
    label: 'Code',
    text: 'Write a Python function that groups a list of transactions by month. Include tests for empty input, invalid dates, and year boundaries.',
  },
  {
    id: 'reason',
    label: 'Reason',
    text: 'Compare running an AI assistant locally with using a hosted API for a small research team. Separate privacy, cost, maintenance, and reliability trade-offs, and state your assumptions.',
  },
  {
    id: 'create',
    label: 'Create',
    text: 'Draft three contrasting opening paragraphs for a science-fiction story about a city that owns its own AI. Give each a distinct voice, then explain the differences.',
  },
] as const

type CopyStatus = 'idle' | 'success' | 'failure'

const BASE_MODEL_URL = 'https://huggingface.co/Qwen/Qwen3.8-27B'
const COMMUNITY_MODEL_URL =
  'https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF'
const OLLAMA_URL = 'https://ollama.com/huihui_ai/qwen3.8-abliterated'

const SPEC_ITEMS: SpecItem[] = [
  {
    label: 'Base',
    value: 'Qwen3.8-27B',
    href: BASE_MODEL_URL,
    external: true,
  },
  {
    label: 'Community build',
    value: 'huihui-ai',
    href: COMMUNITY_MODEL_URL,
    external: true,
  },
  { label: 'Distribution', value: 'GGUF' },
  { label: 'License', value: 'Apache 2.0' },
]

const PILLARS: PillarItem[] = [
  {
    index: '01 /',
    title: 'Keep it close.',
    body: 'Your prompts can stay on your hardware when inference runs fully offline.',
  },
  {
    index: '02 /',
    title: 'Make it yours.',
    body: 'Choose the weights, runtime, and configuration instead of relying on a hosted endpoint.',
  },
  {
    index: '03 /',
    title: 'Keep access.',
    body: 'Once the weights and runtime are installed, compatible setups can work without an internet connection.',
  },
]

const RESOURCE_LINKS: ResourceLink[] = [
  {
    label: 'Explore the weights',
    href: COMMUNITY_MODEL_URL,
    external: true,
  },
  {
    label: 'Run with Ollama',
    href: OLLAMA_URL,
    external: true,
  },
]

export default function App() {
  const [selected, setSelected] = useState<PromptId>('code')
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const selectionAtClickRef = useRef<PromptId>(selected)
  const currentSelectionRef = useRef<PromptId>(selected)

  const example = PROMPT_EXAMPLES.find((entry) => entry.id === selected)!
  useEffect(() => {
    currentSelectionRef.current = selected
  }, [selected])

  const heroRef = useRef<HTMLElement>(null)

  useScrollProgressVar(heroRef)

  const selectPrompt = (id: PromptId) => {
    setSelected(id)
    setCopyStatus('idle')
  }

  const handleCopy = () => {
    const text = example.text
    selectionAtClickRef.current = selected
    const isStale = () =>
      selectionAtClickRef.current !== currentSelectionRef.current
    const fail = () => {
      if (isStale()) return
      setCopyStatus('failure')
      const el = textareaRef.current
      if (el) {
        el.focus()
        el.select()
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => {
          if (isStale()) return
          setCopyStatus('success')
        },
        () => fail(),
      )
    } else {
      fail()
    }
  }

  return (
    <>
      <div className="site-ambient" aria-hidden="true" />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ScrollProgress />
      <header className="site-header">
        <div className="header-inner">
          <a className="wordmark" href="#main" aria-label="LOCAL — back to top">
            LOCAL
          </a>
          <nav className="header-nav" aria-label="Sections">
            <a className="link-sweep" href="#why-local">
              <span className="nav-full">Why local</span>
              <span className="nav-short">Why local</span>
            </a>
            <a className="link-sweep" href="#model">
              <span className="nav-full">The model</span>
              <span className="nav-short">Model</span>
            </a>
            <a className="link-sweep" href="#get-started">
              <span className="nav-full">Get started</span>
              <span className="nav-short">Start</span>
            </a>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="hero" ref={heroRef} aria-label="Introduction">
          <div className="hero-aura" aria-hidden="true" />
          <div className="hero-inner">
            <Reveal className="hero-text">
              <p className="eyebrow">A case for local AI</p>
              <h1>
                <GradientWord>Intelligence.</GradientWord>
                <br />
                In your hands.
              </h1>
              <p className="intro">
                Meet Qwen 3.8 27B Abliterated. A community-modified open-weight
                model that puts more control in the hands of the people using
                it.
              </p>
              <div className="hero-links">
                <Magnetic>
                  <a className="btn-primary cta-sheen" href="#model">
                    Explore the model
                  </a>
                </Magnetic>
                <a className="btn-secondary" href="#why-local">
                  Why local matters
                </a>
              </div>
              <ul className="hero-meta" aria-label="Model characteristics">
                <li>27B parameters</li>
                <li>Open weights</li>
                <li>Local inference</li>
              </ul>
            </Reveal>
            <Reveal delay={140}>
              <HeroVisual />
            </Reveal>
          </div>
        </section>

        <section className="content-section" id="why-local">
          <Reveal>
            <h2>The power is in who holds it.</h2>
          </Reveal>
          <Reveal delay={120}>
            <PillarCards items={PILLARS} />
          </Reveal>
        </section>

        <section className="content-section" id="model">
          <Reveal>
            <div className="model-intro">
            <span className="model-badge">Community-abliterated</span>
            <h2>Meet Qwen 3.8 27B.</h2>
            <p className="section-body">
              A 27-billion-parameter open-weight model, with a community
              variant designed to reduce refusals. Explore coding, reasoning,
              and creative tasks in a runtime you control.
            </p>
            <SpecGrid items={SPEC_ITEMS} />
          </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="prompt-panel">
            <fieldset className="prompt-fieldset">
              <legend className="prompt-legend">Choose a prompt to try</legend>
              <div className="prompt-pills">
                {PROMPT_EXAMPLES.map((entry) => (
                  <label
                    key={entry.id}
                    className={
                      entry.id === selected ? 'prompt-pill selected' : 'prompt-pill'
                    }
                  >
                    <input
                      type="radio"
                      name="prompt-task"
                      value={entry.id}
                      checked={entry.id === selected}
                      onChange={() => selectPrompt(entry.id)}
                    />
                    <span>{entry.label}</span>
                    <span className="pill-check" aria-hidden="true">
                      ✓
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="prompt-output">
              <label
                className="prompt-label"
                htmlFor="prompt-idea"
              >
                Prompt idea
              </label>
              <textarea
                id="prompt-idea"
                ref={textareaRef}
                readOnly
                rows={4}
                value={example.text}
              />
              <p className="prompt-note">
                Examples to try locally—not generated responses.
              </p>
              <div className="prompt-actions">
                <button
                  className="copy-btn"
                  type="button"
                  onClick={handleCopy}
                >
                  Copy prompt
                </button>
                <p className="copy-status" role="status">
                  {copyStatus === 'success' && (
                    <span className="copy-status-text">
                      <span aria-hidden="true">✓ </span>
                      Prompt copied.
                    </span>
                  )}
                  {copyStatus === 'failure' && (
                    <span className="copy-status-text">
                      Copy unavailable. Select the prompt to copy it manually.
                    </span>
                  )}
                  {copyStatus === 'idle' && '\u00A0'}
                </p>
              </div>
            </div>
          </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="refusal-note">
            <h3>Fewer refusals. Not fewer responsibilities.</h3>
            <p>
              Abliteration modifies model weights to reduce refusal behavior.
              It does not guarantee accuracy, safety, or an answer to every
              prompt. The{' '}
              <a
                className="spec-link"
                href={COMMUNITY_MODEL_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                community publisher
                <span className="visually-hidden">opens in a new tab</span>
              </a>{' '}
              recommends research and controlled use; review outputs and choose
              safeguards for your application.
            </p>
          </div>
          </Reveal>
          <Reveal delay={260}>
            <p className="hardware-note">
              Speed, memory use, and output quality depend on your hardware,
              runtime, context length, and quantization.
            </p>
          </Reveal>
        </section>

        <section className="content-section" id="get-started">
          <Reveal>
            <h2>Don't just use AI. Own the setup.</h2>
            <p className="section-body">
              Start with the model card. Choose a build that fits your hardware.
              Then try it in a local runtime.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <ResourceTiles links={RESOURCE_LINKS} />
          </Reveal>
        </section>

        <footer className="site-footer">
          <Reveal className="footer-inner">
            <p className="footer-note">
              Independent showcase. Not affiliated with Qwen.
            </p>
            <nav className="footer-nav" aria-label="Model sources">
              <a
                href={BASE_MODEL_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Base model
                <span className="visually-hidden">opens in a new tab</span>
              </a>
              <a
                href={COMMUNITY_MODEL_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Community model
                <span className="visually-hidden">opens in a new tab</span>
              </a>
            </nav>
          </Reveal>
        </footer>
      </main>
    </>
  )
}
