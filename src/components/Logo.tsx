import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  asLink?: boolean
  /** Use on coloured backgrounds (footer, login panel) — inverts colours to white */
  variant?: 'default' | 'on-color'
  className?: string
}

export function Logo({ size = 'md', asLink = true, variant = 'default', className }: LogoProps) {
  const onColor = variant === 'on-color'

  const dims = {
    sm: { svg: 26,  text: 'text-[13px]', gap: 'gap-1.5' },
    md: { svg: 30,  text: 'text-[15px]', gap: 'gap-2'   },
    lg: { svg: 36,  text: 'text-[18px]', gap: 'gap-2.5' },
  }[size]

  const mark = (
    <span className={cn('flex items-center', dims.gap, className)}>

      {/* ── Custom SVG mark: city skyline silhouette ── */}
      <svg
        width={dims.svg}
        height={dims.svg}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        {/* Background rounded square */}
        <rect
          width="32"
          height="32"
          rx="8"
          fill={onColor ? 'rgba(255,255,255,0.15)' : 'var(--primary)'}
        />

        {/* Ground line — ties all towers to a shared baseline */}
        <rect x="3" y="27" width="26" height="1.5" rx="0.75"
          fill="white" fillOpacity={onColor ? 0.25 : 0.35} />

        {/* Left tower — shorter, recedes */}
        <rect x="3" y="15" width="7" height="12" rx="1.5"
          fill="white" fillOpacity={onColor ? 0.4 : 0.55} />

        {/* Centre tower — tallest, hero element */}
        <rect x="12" y="5" width="8" height="22" rx="1.5"
          fill="white" fillOpacity={onColor ? 0.9 : 1} />

        {/* Centre tower penthouse cap — brighter accent at apex */}
        <rect x="14" y="5" width="4" height="5" rx="1"
          fill="white" fillOpacity={onColor ? 1 : 1} />

        {/* Right tower — mid height */}
        <rect x="22" y="11" width="7" height="16" rx="1.5"
          fill="white" fillOpacity={onColor ? 0.45 : 0.65} />

        {/* Window dots on centre tower — add detail at larger sizes */}
        <rect x="14.5" y="10" width="3" height="2" rx="0.75"
          fill={onColor ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.12)'} />
        <rect x="14.5" y="14.5" width="3" height="2" rx="0.75"
          fill={onColor ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.12)'} />
        <rect x="14.5" y="19" width="3" height="2" rx="0.75"
          fill={onColor ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.12)'} />
      </svg>

      {/* ── Wordmark: high weight contrast ── */}
      <span className={cn('leading-none', dims.text)}>
        {/* "Resident" — medium weight, fully legible */}
        <span
          className={cn(
            'font-[450]',
            onColor ? 'text-white/90' : 'text-foreground',
          )}
        >
          Resident
        </span>
        {/* "Hub" — black weight, punchy contrast */}
        <span
          className="font-black"
          style={{ color: onColor ? 'white' : 'var(--primary)' }}
        >
          Hub
        </span>
      </span>
    </span>
  )

  if (!asLink) return mark

  return (
    <Link
      to="/"
      className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Resident Hub — go to home"
    >
      {mark}
    </Link>
  )
}
