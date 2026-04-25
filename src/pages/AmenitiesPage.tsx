import {
  Activity,
  CircleDot,
  Disc3,
  Dumbbell,
  Feather,
  Flag,
  Info,
  Loader2,
  PartyPopper,
  Snowflake,
  Star,
  Target,
  Waves,
} from 'lucide-react'
import type { ComponentType, KeyboardEvent } from 'react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAmenities, type Amenity } from '@/hooks/useAmenities'
import { cn } from '@/lib/utils'

const TEAL = '#004D57'

type FilterId = 'all' | 'sports' | 'wellness' | 'events'

// Icons cannot come from the API — kept client-side mapped by amenity id
const AMENITY_ICONS: Record<string, ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>> = {
  pool: Waves,
  badminton: Feather,
  squash: CircleDot,
  'grand-hall': PartyPopper,
  'wellness-hub': Dumbbell,
  'cricket-nets': Target,
  pickleball: Disc3,
  tennis: Activity,
  football: Flag,
  'skating-rink': Snowflake,
}

function badgeClass(variant: Amenity['badgeVariant']) {
  switch (variant) {
    case 'open':
      return 'border-0 bg-white/90 text-gray-800 shadow-sm'
    case 'limited':
      return 'border-0 bg-white/90 text-amber-900 shadow-sm'
    case 'booked':
      return 'border-0 bg-white/95 text-gray-800 shadow-sm'
    default:
      return ''
  }
}

export function AmenitiesPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<FilterId>('all')
  const { data: amenities = [], isLoading } = useAmenities(filter)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const FILTERS: { id: FilterId; label: string }[] = [
    { id: 'all',      label: t('amenities.allFacilities') },
    { id: 'sports',   label: t('amenities.sports') },
    { id: 'wellness', label: t('amenities.wellness') },
    { id: 'events',   label: t('amenities.events') },
  ]

  function handleTabKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = (index + 1) % FILTERS.length
      tabRefs.current[next]?.focus()
      setFilter(FILTERS[next].id)
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = (index - 1 + FILTERS.length) % FILTERS.length
      tabRefs.current[prev]?.focus()
      setFilter(FILTERS[prev].id)
    }
    if (e.key === 'Home') {
      e.preventDefault()
      tabRefs.current[0]?.focus()
      setFilter(FILTERS[0].id)
    }
    if (e.key === 'End') {
      e.preventDefault()
      tabRefs.current[FILTERS.length - 1]?.focus()
      setFilter(FILTERS[FILTERS.length - 1].id)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-3">
        <h1
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: TEAL }}
        >
          {t('amenities.title')}
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          {t('amenities.subtitle')}
        </p>
      </header>

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filter amenities by category"
        aria-orientation="horizontal"
      >
        {FILTERS.map((f, index) => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              ref={(el) => { tabRefs.current[index] = el }}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="amenities-panel"
              tabIndex={active ? 0 : -1}
              onClick={() => setFilter(f.id)}
              onKeyDown={(e) => handleTabKeyDown(e, index)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                  ? 'bg-[color:var(--primary)] text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-20"
          role="status"
          aria-label="Loading amenities"
        >
          <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : (
        <div
          id="amenities-panel"
          role="tabpanel"
          aria-label={`${FILTERS.find((f) => f.id === filter)?.label ?? ''} amenities`}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {amenities.length === 0 ? (
            <p className="col-span-full py-16 text-center text-sm text-muted-foreground">
              No amenities found for this category.
            </p>
          ) : amenities.map((item) =>
            item.featured ? (
              <FeaturedPoolCard key={item.id} item={item} />
            ) : (
              <FacilityCard key={item.id} item={item} />
            ),
          )}
        </div>
      )}
    </div>
  )
}

function FacilityCard({ item }: { item: Amenity }) {
  const { t } = useTranslation()
  const Icon = AMENITY_ICONS[item.id] ?? Feather
  const actionLabel = item.badgeVariant === 'booked' ? t('amenities.joinWaitlist') : t('amenities.bookNow')
  return (
    <Card
      className={cn(
        'overflow-hidden gap-0 rounded-2xl border py-0 shadow-sm ring-0 transition-all duration-200',
        'hover:-translate-y-1 hover:shadow-lg',
        'md:col-span-1',
      )}
    >
      <div className="relative overflow-hidden">
        <img
          src={item.image}
          alt={`${item.title} facility`}
          className="aspect-[4/3] w-full object-cover transition-transform duration-300 hover:scale-105 sm:h-48 sm:aspect-auto"
          loading="lazy"
        />
        <Badge
          className={cn(
            'absolute top-3 left-3 text-[10px] font-bold tracking-wide uppercase',
            badgeClass(item.badgeVariant),
          )}
        >
          {item.badge}
        </Badge>
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 backdrop-blur-sm">
          <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden="true" />
          <span className="text-[11px] font-bold text-white">{item.rating}</span>
        </div>
      </div>
      <CardContent className="flex flex-col gap-3 p-5 pt-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold leading-snug" style={{ color: TEAL }}>
            {item.title}
          </h2>
          <Icon className="size-5 shrink-0 text-[color:var(--primary)]" aria-hidden="true" />
        </div>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
        {item.bookPath ? (
          <Button className="mt-auto w-full font-semibold" size="lg" asChild>
            <Link to={item.bookPath} aria-label={`${actionLabel} — ${item.title}`}>
              {actionLabel}
            </Link>
          </Button>
        ) : (
          <Button variant="secondary" className="mt-auto w-full font-semibold" size="lg"
            aria-label={`${actionLabel} — ${item.title}`}
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function FeaturedPoolCard({ item }: { item: Amenity }) {
  const { t } = useTranslation()
  const Icon = AMENITY_ICONS[item.id] ?? Waves
  return (
    <Card
      className={cn(
        'overflow-hidden gap-0 rounded-2xl border py-0 shadow-sm ring-0 transition-all duration-200',
        'hover:shadow-lg',
        'md:col-span-2',
      )}
    >
      <div className="flex flex-col md:flex-row">
        <div className="relative overflow-hidden md:w-2/5 lg:w-2/5">
          <img
            src={item.image}
            alt={`${item.title} facility`}
            className="aspect-[4/3] h-full w-full object-cover transition-transform duration-300 hover:scale-105 md:aspect-square md:min-h-[260px]"
            loading="lazy"
          />
          <Badge
            className={cn(
              'absolute top-3 left-3 text-[10px] font-bold tracking-wide uppercase',
              badgeClass(item.badgeVariant),
            )}
          >
            {item.badge}
          </Badge>
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 backdrop-blur-sm">
            <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="text-[11px] font-bold text-white">{item.rating}</span>
          </div>
        </div>
        <CardContent className="flex flex-1 flex-col justify-center gap-4 p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <h2
              className="text-xl font-bold leading-snug sm:text-2xl"
              style={{ color: TEAL }}
            >
              {item.title}
            </h2>
            <Icon className="size-6 shrink-0 text-[color:var(--primary)]" aria-hidden="true" />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            {item.description}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {item.bookPath ? (
              <Button className="font-semibold" size="lg" asChild>
                <Link
                  to={item.bookPath}
                  aria-label={`${t('amenities.joinWaitlist')} — ${item.title}`}
                >
                  {t('amenities.joinWaitlist')}
                </Link>
              </Button>
            ) : (
              <Button
                className="font-semibold"
                size="lg"
                aria-label={`${t('amenities.joinWaitlist')} — ${item.title}`}
              >
                {t('amenities.joinWaitlist')}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 border-border bg-background"
              aria-label={`More information about ${item.title}`}
            >
              <Info className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
