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
  Search,
  Snowflake,
  Star,
  Target,
  Waves,
  X,
} from 'lucide-react'
import type { ComponentType, KeyboardEvent } from 'react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAmenities, type Amenity } from '@/hooks/useAmenities'
import { cn } from '@/lib/utils'

const TEAL = '#004D57'

type CategoryId = 'sports' | 'wellness' | 'events'

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
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryId>>(new Set())
  const { data: amenities = [], isLoading } = useAmenities()
  const catRefs = useRef<(HTMLButtonElement | null)[]>([])

  const categoryFilters = [
    { id: 'sports'   as CategoryId, label: t('amenities.sports') },
    { id: 'wellness' as CategoryId, label: t('amenities.wellness') },
    { id: 'events'   as CategoryId, label: t('amenities.events') },
  ]

  function toggleCategory(id: CategoryId) {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function clearAll() {
    setSelectedCategories(new Set())
    setSearch('')
  }

  const normalised = search.trim().toLowerCase()

  const filtered = amenities.filter((a) => {
    const matchesCategory =
      selectedCategories.size === 0 ||
      [...selectedCategories].some((cat) => a.categories.includes(cat))

    const matchesSearch =
      normalised === '' ||
      a.title.toLowerCase().includes(normalised) ||
      a.description.toLowerCase().includes(normalised)

    return matchesCategory && matchesSearch
  })

  const hasActiveFilters = selectedCategories.size > 0 || normalised !== ''

  function handleCatKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      catRefs.current[(index + 1) % categoryFilters.length]?.focus()
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      catRefs.current[(index - 1 + categoryFilters.length) % categoryFilters.length]?.focus()
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

      {/* Search + filters */}
      <div className="flex flex-col gap-3">
        {/* Search input */}
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search amenities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 pr-9 text-sm"
            aria-label="Search amenities"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Clear search"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Category pills — multi-select */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategories(new Set())}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selectedCategories.size === 0
                ? 'bg-[color:var(--primary)] text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
            aria-pressed={selectedCategories.size === 0}
          >
            {t('amenities.allFacilities')}
          </button>

          {categoryFilters.map((cat, index) => {
            const active = selectedCategories.has(cat.id)
            return (
              <button
                key={cat.id}
                ref={(el) => { catRefs.current[index] = el }}
                type="button"
                aria-pressed={active}
                onClick={() => toggleCategory(cat.id)}
                onKeyDown={(e) => handleCatKeyDown(e, index)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'bg-[color:var(--primary)] text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
                )}
              >
                {cat.label}
              </button>
            )
          })}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Clear all filters"
            >
              <X className="size-3.5" aria-hidden="true" />
              Clear
            </button>
          )}
        </div>
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
        <>
          {/* Result count */}
          {hasActiveFilters && (
            <p className="text-sm text-muted-foreground" aria-live="polite" aria-atomic="true">
              {filtered.length === 0
                ? 'No amenities match your filters.'
                : `${filtered.length} ${filtered.length === 1 ? 'amenity' : 'amenities'} found`}
            </p>
          )}

          <div
            id="amenities-panel"
            role="region"
            aria-label="Amenities list"
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {filtered.length === 0 ? (
              <div className="col-span-full flex flex-col items-center gap-3 py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  No amenities match your search or filters.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-sm font-medium underline-offset-4 hover:underline"
                  style={{ color: TEAL }}
                >
                  Clear all filters
                </button>
              </div>
            ) : filtered.map((item) =>
                item.featured ? (
                  <FeaturedPoolCard key={item.id} item={item} />
                ) : (
                  <FacilityCard key={item.id} item={item} />
                ),
              )}
          </div>
        </>
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
