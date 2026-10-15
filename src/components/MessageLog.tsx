import type { LogEntry } from '../game/index.ts'
import { formatLogEntry } from '../labels.ts'

type Props = {
  entries: LogEntry[]
}

export function MessageLog({ entries }: Props) {
  const latest = entries.slice(0, 5)
  return (
    <section className="message-log" aria-live="polite" aria-label="Shot log">
      <h2>Log</h2>
      {latest.length === 0 ? (
        <p className="log-empty">Shots will appear here.</p>
      ) : (
        <ol>
          {latest.map((entry, index) => (
            <li key={`${formatLogEntry(entry)}-${index}`}>{formatLogEntry(entry)}</li>
          ))}
        </ol>
      )}
    </section>
  )
}
