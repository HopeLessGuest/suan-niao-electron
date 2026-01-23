import { useState } from 'react'
import './App.css'

function App() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [copyStatus, setCopyStatus] = useState<string | null>(null)
  const [lastCopiedText, setLastCopiedText] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [history, setHistory] = useState<string[]>([])

  // 脏话库
  const dirtyWords = [
    '你真是个小天才！',
    '你智商堪忧啊！',
    '真的，你不行！',
    '你咋这么菜呢！',
    '活该！哎呀！',
  ]

  // 兼容性复制函数
  const copyToClipboard = async (text: string) => {
    try {
      // 现代浏览器 API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
        return true
      } else {
        // 备用方案：使用 textarea
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        const success = document.execCommand('copy')
        document.body.removeChild(textarea)
        return success
      }
    } catch (err) {
      console.error('复制失败:', err)
      return false
    }
  }

  const handleBirdClick = async () => {
    // 开始动画
    setIsAnimating(true)
    
    // 随机选择一句脏话
    const randomIndex = Math.floor(Math.random() * dirtyWords.length)
    const selectedText = dirtyWords[randomIndex]
    
    // 复制到剪贴板
    const success = await copyToClipboard(selectedText)
    
    if (success) {
      setLastCopiedText(selectedText)
      setCopyStatus('已复制')
      // 只在复制成功时添加到历史
      setHistory([selectedText, ...history.slice(0, 2)])
      console.log('已复制：', selectedText)
    } else {
      setLastCopiedText('✗ 复制失败')
      setCopyStatus('失败')
      console.error('复制失败')
    }

    // 动画持续时间后重置
    setTimeout(() => {
      setIsAnimating(false)
      setCopyStatus(null)
    }, 2000)
  }

  return (
    <div className="app-wrapper">
      {/* 背景遮罩（手机侧栏打开时） */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 主容器 */}
      <div className="container">
        {/* 中心内容 */}
        <div className="center-content">
          <h1 className="title">爆躁小鸟</h1>
          <p className="subtitle">点击小鸟，复制一句"肺腑之言"</p>

          {/* 小鸟区域 */}
          <div className="bird-wrapper">
            <div
              className={`bird ${isAnimating ? 'animate' : ''}`}
              onClick={handleBirdClick}
            >
              {/* SVG 小鸟 */}
              <svg
                viewBox="0 0 100 100"
                width="150"
                height="150"
                className="bird-svg"
              >
                {/* 鸟身体 */}
                <circle cx="50" cy="55" r="35" fill="#FF5A4E" />
                
                {/* 鸟头 */}
                <circle cx="50" cy="35" r="28" fill="#FF5A4E" />
                
                {/* 眼睛 */}
                <circle cx="42" cy="30" r="5" fill="#000" />
                <circle cx="58" cy="30" r="5" fill="#000" />
                
                {/* 眉毛 (愤怒) */}
                <line
                  x1="38"
                  y1="24"
                  x2="46"
                  y2="20"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="54"
                  y1="20"
                  x2="62"
                  y2="24"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                
                {/* 嘴 */}
                <ellipse cx="50" cy="42" rx="6" ry="8" fill="#FFC800" />
                
                {/* 翅膀 */}
                <ellipse cx="30" cy="55" rx="15" ry="25" fill="#E84A3F" />
                <ellipse cx="70" cy="55" rx="15" ry="25" fill="#E84A3F" />
              </svg>

              {/* 对话框提示（现在作为 bird 的子元素，定位参考为 .bird） */}
              {copyStatus && (
                <div className="copy-dialog">
                  <div className="dialog-bubble">
                    {lastCopiedText}
                  </div>
                  <div className="dialog-tail"></div>
                </div>
              )}
            </div>
          </div>

          <p className="click-hint">点击小鸟 ↑</p>
        </div>

        {/* 右侧历史面板 */}
        <div className={`history-panel ${sidebarOpen ? 'open' : ''}`}>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
          <h2 className="history-title">嘲讽历史</h2>
          <div className="history-items">
            {history.length === 0 ? (
              <div className="history-empty">暂无记录</div>
            ) : (
              history.map((text, index) => (
                <div key={index} className="history-item">
                  {text}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 手机端侧栏切换按钮 */}
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title="打开历史记录"
        >
          ☰
        </button>
      </div>
    </div>
  )
}

export default App
