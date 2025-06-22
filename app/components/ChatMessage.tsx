import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  model?: string
  ttft?: number
  responseTime?: number
  tps?: number
  isError?: boolean
}

interface ChatMessageProps {
  message: Message
  index: number
}

export default function ChatMessage({ message, index }: ChatMessageProps) {
  const processedContent = message.content
    .replace(/<think>/g, '<div class="think-content">')
    .replace(/<\/think>/g, '</div>')

  return (
    <div
      data-testid={`message-${index}`}
      className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'
        }`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.isError
          ? 'bg-red-100 text-red-800'
          : message.role === 'user'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-200 text-gray-900'
          }`}
      >
        <div
          className={`prose prose-sm max-w-none ${message.role === 'user' ? 'prose-invert' : ''
            }`}
        >
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                return match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus as any}
                    language={match[1]}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              },
            }}
          >
            {processedContent}
          </ReactMarkdown>
        </div>
      </div>
      {message.role === 'assistant' && !message.isError && (
        <ChatMetrics message={message} />
      )}
    </div>
  )
}

interface ChatMetricsProps {
  message: Message
}

function ChatMetrics({ message }: ChatMetricsProps) {
  return (
    <div className="text-xs text-gray-400 mt-1 flex items-center space-x-2">
      {message.model && <span>{message.model}</span>}
      {message.ttft !== undefined && (
        <span className="text-gray-500">TTFT: {message.ttft}ms</span>
      )}
      {message.responseTime !== undefined && (
        <span className="text-gray-500">
          RT: {(message.responseTime / 1000).toFixed(2)}s
        </span>
      )}
      {message.tps !== undefined && (
        <span className="text-gray-500">TPS: {message.tps.toFixed(2)}</span>
      )}
    </div>
  )
} 