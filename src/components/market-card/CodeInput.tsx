import { useEffect, useRef } from 'react'
import { CODE_LENGTH } from './utils'

interface CodeInputProps {
  value: string
  onChange: (code: string) => void
}

/** One box per digit; focuses the first box on mount and handles paste and SMS autofill. */
export default function CodeInput({ value: code, onChange }: CodeInputProps) {
  const boxRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    boxRefs.current[0]?.focus()
  }, [])

  /** Writes several digits into the boxes from `start` (a full code always starts at the first box). */
  function fillCode(start: number, digits: string) {
    const from = digits.length >= CODE_LENGTH ? 0 : start
    const next = (
      code.slice(0, from) +
      digits +
      code.slice(from + digits.length)
    ).slice(0, CODE_LENGTH)
    onChange(next)
    boxRefs.current[Math.min(next.length, CODE_LENGTH - 1)]?.focus()
  }

  function handleBoxChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, '')
    // SMS autofill and keyboard clipboard suggestions arrive here as the whole code, not as a paste.
    if (digits.length > 2) {
      fillCode(index, digits)
      return
    }
    const char = digits.slice(-1)
    const next = (code.slice(0, index) + char + code.slice(index + 1)).slice(
      0,
      CODE_LENGTH,
    )
    onChange(next)
    if (char && index < CODE_LENGTH - 1) {
      boxRefs.current[index + 1]?.focus()
    }
  }

  function handleBoxKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      boxRefs.current[index - 1]?.focus()
      onChange(code.slice(0, index - 1) + code.slice(index))
    }
  }

  function handlePaste(index: number, e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, CODE_LENGTH)
    if (!pasted) return
    e.preventDefault()
    fillCode(index, pasted)
  }

  return (
    <div className='mb-3.5 flex gap-2'>
      {Array.from({ length: CODE_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            boxRefs.current[i] = el
          }}
          type='text'
          inputMode='numeric'
          // Only the first box offers the SMS code, or the OS suggests it six times.
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1} of verification code`}
          value={code[i] ?? ''}
          onChange={(e) => handleBoxChange(i, e.target.value)}
          onKeyDown={(e) => handleBoxKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          onFocus={(e) => e.target.select()}
          className={`h-13 w-full flex-1 rounded-[10px] border-[1.5px] bg-surface text-center text-xl font-black text-ink transition-colors ${
            code[i] ? 'border-lime' : 'border-border'
          }`}
        />
      ))}
    </div>
  )
}
