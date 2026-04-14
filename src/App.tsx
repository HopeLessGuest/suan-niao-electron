import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import './App.css'

const HISTORY_LIMIT = 5
const HISTORY_STORAGE_KEY = 'suan-niao-history'
const INITIAL_MESSAGE = '点击小鸟，复制一句火力全开的台词。'

const featureTabs = [
  {
    id: 'home',
    icon: '鸟',
    label: '主窗口',
    title: '小鸟主控台',
    description: '当前核心功能会放在这里，后续所有能力页也都从上方功能入口展开。',
  },
  {
    id: 'library',
    icon: '库',
    label: '词库管理',
    title: '词库管理预留',
    description: '后续可以接词库分类、导入导出、屏蔽词过滤等管理能力。',
  },
  {
    id: 'float',
    icon: '浮',
    label: '悬浮互动',
    title: '悬浮窗预留',
    description: '这里先预留悬浮窗、桌宠互动和贴边快捷入口。',
  },
  {
    id: 'scene',
    icon: '景',
    label: '场景模式',
    title: '场景模式预留',
    description: '未来可以做游戏、聊天、直播等不同场景下的快捷内容页。',
  },
  {
    id: 'member',
    icon: '会',
    label: '会员扩展',
    title: '扩展能力预留',
    description: '这里可以放订阅功能、主题皮肤、音效包和更多高级能力。',
  },
  {
    id: 'settings',
    icon: '设',
    label: '设置中心',
    title: '设置中心预留',
    description: '桌面应用需要的启动项、托盘、热键、通知等设置都可以归到这里。',
  },
] as const

type LibraryStatus = 'loading' | 'ready' | 'error'

type FeatureTab = (typeof featureTabs)[number]

function App() {
  const [activeFeatureId, setActiveFeatureId] = useState<FeatureTab['id']>('home')
  const [isAnimating, setIsAnimating] = useState(false)
  const [copyStatus, setCopyStatus] = useState<string | null>(null)
  const [lastCopiedText, setLastCopiedText] = useState(INITIAL_MESSAGE)
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY)

      if (!savedHistory) {
        return []
      }

      const parsed = JSON.parse(savedHistory)

      if (!Array.isArray(parsed)) {
        return []
      }

      return parsed
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .slice(0, HISTORY_LIMIT)
    } catch (error) {
      console.error('读取历史记录失败:', error)
      return []
    }
  })
  const [dirtyWords, setDirtyWords] = useState<string[]>([])
  const [libraryStatus, setLibraryStatus] = useState<LibraryStatus>('loading')
  const resetTimerRef = useRef<number | null>(null)

  const activeFeature = featureTabs.find((tab) => tab.id === activeFeatureId) ?? featureTabs[0]

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
    } catch (error) {
      console.error('保存历史记录失败:', error)
    }
  }, [history])

  useEffect(() => {
    const dirtyWordsUrl = new URL('./dirtywords.txt', window.location.href).toString()
    const controller = new AbortController()

    fetch(dirtyWordsUrl, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`词库请求失败: ${res.status}`)
        }

        return res.text()
      })
      .then((text) => {
        const lines = text
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0)

        if (lines.length === 0) {
          throw new Error('词库为空')
        }

        setDirtyWords(lines)
        setLibraryStatus('ready')
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return
        }

        console.error('加载词库失败:', error)
        setLibraryStatus('error')
        setLastCopiedText('词库加载失败，请稍后再试。')
      })

    return () => {
      controller.abort()

      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current)
      }
    }
  }, [])

  const queueReset = () => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current)
    }

    resetTimerRef.current = window.setTimeout(() => {
      setIsAnimating(false)
      setCopyStatus(null)
    }, 2200)
  }

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        return true
      }

      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()

      const success = document.execCommand('copy')
      document.body.removeChild(textarea)
      return success
    } catch (error) {
      console.error('复制失败:', error)
      return false
    }
  }

  const pushHistory = (text: string) => {
    setHistory((previous) => [text, ...previous.filter((item) => item !== text)].slice(0, HISTORY_LIMIT))
  }

  const pickRandomPhrase = () => {
    if (dirtyWords.length === 0) {
      return null
    }

    if (dirtyWords.length === 1) {
      return dirtyWords[0]
    }

    let selectedText = dirtyWords[Math.floor(Math.random() * dirtyWords.length)]

    while (selectedText === lastCopiedText) {
      selectedText = dirtyWords[Math.floor(Math.random() * dirtyWords.length)]
    }

    return selectedText
  }

  const copyPhrase = async (text: string, source: 'bird' | 'history') => {
    if (source === 'bird') {
      setIsAnimating(true)
    }

    const success = await copyToClipboard(text)

    if (success) {
      setLastCopiedText(text)
      setCopyStatus(source === 'bird' ? '已复制到剪贴板' : '已重新复制')
      pushHistory(text)
    } else {
      setCopyStatus('复制失败')
      setLastCopiedText('这次复制没有成功，请再试一次。')
    }

    queueReset()
  }

  const handleBirdClick = async () => {
    if (dirtyWords.length === 0) {
      setIsAnimating(false)
      setCopyStatus(libraryStatus === 'error' ? '词库不可用' : '词库加载中')
      setLastCopiedText(
        libraryStatus === 'error'
          ? '词库暂时不可用，请检查资源文件。'
          : '词库还在准备，稍等一下再点。'
      )
      queueReset()
      return
    }

    const selectedText = pickRandomPhrase()

    if (!selectedText) {
      setCopyStatus('暂无可用台词')
      setLastCopiedText('词库里暂时没有可复制的内容。')
      queueReset()
      return
    }

    await copyPhrase(selectedText, 'bird')
  }

  const handleBirdKeyDown = async (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      await handleBirdClick()
    }
  }

  const librarySummary =
    libraryStatus === 'ready'
      ? `词库已就绪 · ${dirtyWords.length} 条`
      : libraryStatus === 'error'
        ? '词库异常'
        : '词库加载中'

  return (
    <div className="desktop-app">
      <div className="app-frame">
        <header className="top-ribbon">
          <div className="brand-area">
            <div className="brand-logo">鸟</div>
            <div>
              <p className="brand-mini">SuanNiao Desktop</p>
              <h1 className="brand-title">爆躁小鸟主窗口</h1>
            </div>
          </div>

          <nav className="feature-ribbon" aria-label="功能页面">
            {featureTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`feature-pill ${tab.id === activeFeatureId ? 'active' : ''}`}
                onClick={() => setActiveFeatureId(tab.id)}
              >
                <span className="feature-pill-icon">{tab.icon}</span>
                <span className="feature-pill-label">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="top-actions">
            <span className={`status-badge ${libraryStatus}`}>{librarySummary}</span>
            <div className="avatar-chip">
              <span className="avatar-dot" />
              <span>Alan</span>
            </div>
          </div>
        </header>

        <main className="content-window">
          <section className="hero-banner">
            <div className="score-orb">
              <strong>{dirtyWords.length || '--'}</strong>
              <span>词库条数</span>
            </div>

            <div className="hero-copy">
              <p className="section-kicker">{activeFeature.label}</p>
              <h2>{activeFeature.title}</h2>
              <p>{activeFeature.description}</p>
              <div className="hero-actions">
                <button
                  className="primary-cta"
                  type="button"
                  onClick={() => {
                    void handleBirdClick()
                  }}
                >
                  立即复制一句
                </button>
                <span className="hero-status">{copyStatus ?? '等待触发'}</span>
              </div>
            </div>

            <div className="reserved-box">
              <p className="section-kicker">功能预留</p>
              <div className="reserved-grid">
                {featureTabs.slice(1).map((tab) => (
                  <div key={tab.id} className="reserved-item">
                    <span>{tab.label}</span>
                    <small>即将开放</small>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="window-body">
            <div className="main-content-pane">
              <div className="pane-header">
                <div>
                  <p className="section-kicker">主要窗口</p>
                  <h3>当前内容页</h3>
                </div>
                <span className="pane-tag">主功能运行中</span>
              </div>

              <div className="interactive-board">
                <div className="bird-stage-shell">
                  <p className="stage-tip">
                    {libraryStatus === 'ready'
                      ? '点击中间的小鸟，马上复制一句内容。'
                      : libraryStatus === 'error'
                        ? '词库异常，当前只能查看预留布局。'
                        : '词库加载中，请稍等。'}
                  </p>

                  <div className="bird-stage-visual">
                    <div className="ring ring-large" />
                    <div className="ring ring-small" />

                    <button
                      className={`bird-core ${isAnimating ? 'animate' : ''}`}
                      type="button"
                      onClick={() => {
                        void handleBirdClick()
                      }}
                      onKeyDown={(event) => {
                        void handleBirdKeyDown(event)
                      }}
                      aria-label="点击小鸟复制一句台词"
                    >
                      <svg viewBox="0 0 100 100" className="bird-svg" aria-hidden="true">
                        <circle cx="50" cy="55" r="35" fill="#FF6A4D" />
                        <circle cx="50" cy="35" r="28" fill="#FF6A4D" />
                        <circle cx="42" cy="30" r="5" fill="#182226" />
                        <circle cx="58" cy="30" r="5" fill="#182226" />
                        <line x1="38" y1="24" x2="46" y2="20" stroke="#182226" strokeWidth="2" strokeLinecap="round" />
                        <line x1="54" y1="20" x2="62" y2="24" stroke="#182226" strokeWidth="2" strokeLinecap="round" />
                        <ellipse cx="50" cy="42" rx="6" ry="8" fill="#FFC800" />
                        <ellipse cx="30" cy="55" rx="15" ry="25" fill="#EB5437" />
                        <ellipse cx="70" cy="55" rx="15" ry="25" fill="#EB5437" />
                      </svg>

                      {copyStatus && (
                        <div className="copy-dialog">
                          <div className="dialog-bubble">{lastCopiedText}</div>
                          <div className="dialog-tail" />
                        </div>
                      )}
                    </button>
                  </div>

                  <div className="sr-only" aria-live="polite">
                    {copyStatus ? `${copyStatus}：${lastCopiedText}` : lastCopiedText}
                  </div>
                </div>

                <div className="live-panel">
                  <div className="live-card emphasis">
                    <span className="card-label">最新一句</span>
                    <p>{lastCopiedText}</p>
                  </div>
                  <div className="live-card">
                    <span className="card-label">当前页面</span>
                    <p>{activeFeature.description}</p>
                  </div>
                  <div className="live-card">
                    <span className="card-label">桌面扩展</span>
                    <p>这个区域后面可以继续扩成托盘、悬浮窗、任务中心等子页面入口。</p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="history-pane">
              <div className="pane-header history-pane-header">
                <div>
                  <p className="section-kicker">内容记录</p>
                  <h3>最近复制</h3>
                </div>
                <span className="pane-tag">保留 {HISTORY_LIMIT} 条</span>
              </div>

              <div className="history-list">
                {history.length === 0 ? (
                  <div className="history-empty">
                    <strong>暂时还没有记录</strong>
                    <p>点一次中间的小鸟，第一条记录就会出现在这里。</p>
                  </div>
                ) : (
                  history.map((text, index) => (
                    <button
                      key={`${text}-${index}`}
                      className="history-item"
                      type="button"
                      onClick={() => {
                        void copyPhrase(text, 'history')
                      }}
                    >
                      <span className="history-index">{index + 1}</span>
                      <span className="history-text">{text}</span>
                    </button>
                  ))
                )}
              </div>
            </aside>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
