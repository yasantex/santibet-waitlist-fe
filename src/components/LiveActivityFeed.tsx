import SectionHead from './SectionHead'

const feedItems = [
  { id: 1, html: '<strong>David</strong> just joined' },
  { id: 2, html: '<strong>Esther</strong> moved up to Rank #42' },
  { id: 3, html: '<strong>15,284</strong> people predicted YES today' },
  { id: 4, html: '<strong>7</strong> winners just announced' },
  { id: 5, html: 'Founder <strong>#18,447</strong> just joined' },
]

export default function LiveActivityFeed() {
  return (
    <section id='activity' className='border-b border-line py-17'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead kicker='Right now' title='Live activity' />
        <div className='mx-auto max-w-140 overflow-hidden rounded-xl border border-line bg-navy-2'>
          {feedItems.map((item) => (
            <div
              key={item.id}
              className='animate-feed-in flex items-center gap-3 border-b border-line px-5 py-3.5 text-sm text-paper-dim last:border-b-0 [&_strong]:text-paper'
              dangerouslySetInnerHTML={{
                __html: `<span class="h-1.75 w-1.75 shrink-0 rounded-full bg-win inline-block"></span><span>${item.html}</span>`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
