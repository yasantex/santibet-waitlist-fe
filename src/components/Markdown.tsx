import ReactMarkdown, { type Components } from 'react-markdown'

// react-markdown ignores raw HTML unless rehype-raw is added — keep it that way: page
// bodies come from the API.
const COMPONENTS: Components = {
  h1: ({ children }) => (
    <h3 className='mt-5 mb-2 font-display text-lg font-bold text-foreground first:mt-0'>
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h4 className='mt-5 mb-2 font-display text-base font-bold text-foreground first:mt-0'>
      {children}
    </h4>
  ),
  h3: ({ children }) => (
    <h5 className='mt-4 mb-1.5 text-sm font-bold text-foreground first:mt-0'>{children}</h5>
  ),
  p: ({ children }) => <p className='mb-3 last:mb-0'>{children}</p>,
  ul: ({ children }) => <ul className='mb-3 list-disc space-y-1.5 pl-5 last:mb-0'>{children}</ul>,
  ol: ({ children }) => (
    <ol className='mb-3 list-decimal space-y-1.5 pl-5 last:mb-0'>{children}</ol>
  ),
  strong: ({ children }) => (
    <strong className='font-semibold text-foreground'>{children}</strong>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith('mailto:') ? undefined : '_blank'}
      rel='noreferrer'
      className='link-action font-semibold text-dark dark:text-lime'
    >
      {children}
    </a>
  ),
}

/** Renders a Markdown page body in the site's text styles. */
export default function Markdown({ children }: { children: string }) {
  return (
    <div className='text-sm leading-6 text-muted'>
      <ReactMarkdown components={COMPONENTS}>{children}</ReactMarkdown>
    </div>
  )
}
