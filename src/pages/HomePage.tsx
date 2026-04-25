import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import {
  ArrowRight,
  CalendarDays,
  KeyRound,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  PartyPopper,
  Plus,
  Star,
  Wrench,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAmenities, type Amenity } from '@/hooks/useAmenities'
import { useUpcomingBookings } from '@/hooks/useBookings'
import { useUser } from '@/hooks/useUser'
import { cn, getInitials } from '@/lib/utils'

const TEAL = '#004D57'

const HERO_BG =
  'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1600'

function formatBookingTime(isoDate: string, time: string) {
  try {
    const d = parseISO(isoDate)
    const dayLabel = isToday(d) ? 'Today' : isTomorrow(d) ? 'Tomorrow' : format(d, 'MMM d')
    return `${dayLabel} · ${time}`
  } catch {
    return time
  }
}

export function HomePage() {
  const { t } = useTranslation()
  const { data: upcomingBookings = [], isLoading: bookingsLoading } = useUpcomingBookings()
  const { data: amenities = [], isLoading: amenitiesLoading } = useAmenities()
  const { data: user } = useUser()
  const displayName = user?.name ?? 'Julian Ashworth'
  const firstName = displayName.split(' ')[0]
  const initials = getInitials(displayName)

  const nextBooking = upcomingBookings[0] ?? null
  const secondBooking = upcomingBookings[1] ?? null
  const openCount = amenities.filter((a) => a.badgeVariant !== 'booked').length

  const CONCIERGE_ACTIONS = [
    { icon: KeyRound,      label: t('home.guestPass'),    description: t('home.guestPassDesc'),    bg: '#E0F2FE', color: '#0284C7', to: undefined },
    { icon: Wrench,        label: t('home.maintenance'),  description: t('home.maintenanceDesc'),  bg: '#FEF3C7', color: '#D97706', to: '/maintenance' },
    { icon: Package,       label: t('home.parcelPickup'), description: t('home.parcelPickupDesc'), bg: '#F3E8FF', color: '#7C3AED', to: undefined },
    { icon: MessageSquare, label: t('home.feedback'),     description: t('home.feedbackDesc'),     bg: '#D1FAE5', color: '#059669', to: '/feedback' },
  ]

  return (
    <div className="flex flex-col gap-8">

      {/* ── HERO ── */}
      <section aria-label={t('home.welcome')}>
        <div className="relative overflow-hidden rounded-3xl" style={{ minHeight: 320 }}>
          <img
            src={HERO_BG}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover"
          />
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                'linear-gradient(105deg, rgba(0,20,26,0.97) 0%, rgba(0,46,54,0.90) 40%, rgba(0,77,87,0.65) 70%, rgba(0,77,87,0.25) 100%)',
            }}
          />
          {/* Decorative orbs */}
          <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-white/[0.025]" aria-hidden="true" />
          <div className="pointer-events-none absolute top-6 right-[38%] size-10 rounded-full bg-white/[0.05]" aria-hidden="true" />
          <div className="pointer-events-none absolute bottom-6 right-[25%] size-5 rounded-full bg-white/[0.07]" aria-hidden="true" />

          {/* Content */}
          <div className="relative flex h-full min-h-[320px] flex-col justify-end px-7 pb-9 sm:px-10 sm:pb-10">
            <p className="mb-2 text-[11px] font-medium tracking-[0.15em] text-white/45 uppercase" aria-hidden="true">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
            <h1 className="mb-2 text-3xl font-bold leading-tight tracking-tight text-white sm:text-[2.6rem]">
              {t('home.welcome', { name: firstName })}
            </h1>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-white/60">
              {t('home.tagline')}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex flex-wrap gap-2"
                aria-live="polite"
                aria-atomic="true"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                  <MapPin className="size-3" aria-hidden="true" />
                  {amenitiesLoading ? '—' : t('home.amenitiesOpen', { count: openCount })}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                  <CalendarDays className="size-3" aria-hidden="true" />
                  {bookingsLoading ? '—' : t('home.upcoming', { count: upcomingBookings.length })}
                </span>
              </div>
              <RouterLink
                to="/amenities"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold shadow-lg transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ color: TEAL }}
              >
                <Plus className="size-3.5" aria-hidden="true" />
                {t('home.bookNow')}
              </RouterLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-5 lg:col-span-4">

          {/* NEXT RESERVATION */}
          <section aria-labelledby="next-reservation-heading">
            {bookingsLoading ? (
              <div
                className="flex h-56 items-center justify-center rounded-2xl border bg-card shadow-sm"
                role="status"
                aria-label="Loading reservations"
              >
                <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : nextBooking ? (
              <div className="relative overflow-hidden rounded-2xl shadow-md" style={{ height: 220 }}>
                <img
                  src={nextBooking.image}
                  alt={`${nextBooking.amenityTitle} facility`}
                  className="absolute inset-0 size-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" aria-hidden="true" />

                <RouterLink
                  to="/bookings"
                  className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label={t('home.viewAll') + ' bookings'}
                >
                  {t('home.viewAll')} <ArrowRight className="size-2.5" aria-hidden="true" />
                </RouterLink>

                <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
                  <p
                    id="next-reservation-heading"
                    className="mb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-teal-300"
                  >
                    {t('home.nextReservation')}
                  </p>
                  <p className="mb-1.5 text-lg font-bold leading-tight text-white">
                    {nextBooking.amenityTitle}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/65">
                      {formatBookingTime(nextBooking.date, nextBooking.time)}
                    </p>
                    <Badge
                      className={cn(
                        'border-0 text-[9px] font-bold uppercase tracking-wide',
                        nextBooking.status === 'confirmed'
                          ? 'bg-sky-400/25 text-sky-200'
                          : 'bg-amber-400/25 text-amber-200',
                      )}
                    >
                      {nextBooking.status === 'confirmed' ? t('bookings.confirmed') : t('bookings.pending')}
                    </Badge>
                  </div>

                  {secondBooking && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm">
                      <img
                        src={secondBooking.image}
                        alt={`${secondBooking.amenityTitle} facility`}
                        className="size-7 rounded-lg object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-bold text-white">
                          {secondBooking.amenityTitle}
                        </p>
                        <p className="text-[10px] text-white/55">
                          {formatBookingTime(secondBooking.date, secondBooking.time)}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          'shrink-0 border-0 text-[9px] font-bold uppercase',
                          secondBooking.status === 'confirmed'
                            ? 'bg-sky-400/25 text-sky-200'
                            : 'bg-amber-400/25 text-amber-200',
                        )}
                      >
                        {secondBooking.status === 'confirmed' ? t('bookings.confirmed') : t('bookings.pending')}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-muted/30">
                <span className="text-4xl" aria-hidden="true">🏊</span>
                <p className="text-sm font-medium text-muted-foreground">{t('home.noUpcoming')}</p>
                <RouterLink
                  to="/amenities"
                  className="text-xs font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  style={{ color: TEAL }}
                >
                  {t('home.browseAmenities')}
                </RouterLink>
              </div>
            )}
          </section>

          {/* COMMUNITY UPDATE */}
          <section aria-labelledby="community-update-heading">
            <div
              className="relative overflow-hidden rounded-2xl px-5 py-5 text-white"
              style={{ backgroundColor: TEAL }}
            >
              <div className="pointer-events-none absolute -bottom-8 -right-8 size-36 rounded-full bg-white/10" aria-hidden="true" />
              <div className="pointer-events-none absolute -top-5 right-8 size-20 rounded-full bg-white/[0.05]" aria-hidden="true" />
              <PartyPopper
                className="pointer-events-none absolute bottom-3 right-4 size-14 opacity-[0.12]"
                aria-hidden="true"
              />
              <div className="relative">
                <span
                  id="community-update-heading"
                  className="mb-2 inline-block rounded-full bg-sky-300/20 px-2.5 py-0.5 text-[9px] font-bold tracking-[0.14em] text-sky-200 uppercase"
                >
                  {t('home.communityUpdate')}
                </span>
                <h2 className="mb-1.5 text-sm font-bold leading-snug">{t('home.galaTitle')}</h2>
                <p className="mb-4 text-xs leading-relaxed text-white/70">
                  {t('home.galaDesc')}
                </p>
                <Button
                  size="sm"
                  className="h-8 bg-white px-4 text-xs font-bold shadow-sm hover:bg-gray-50"
                  style={{ color: TEAL }}
                >
                  {t('home.rsvpNow')}
                </Button>
              </div>
            </div>
          </section>

          {/* RESIDENT SUMMARY */}
          <section aria-label="Resident summary">
            <div
              className="rounded-2xl border bg-card px-4 py-4 shadow-sm"
              style={{ borderColor: `${TEAL}1a` }}
            >
              <div className="mb-3.5 flex items-center gap-3">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
                  style={{ backgroundColor: TEAL }}
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{displayName}</p>
                  <p className="text-xs text-muted-foreground">Unit 4B · Estate Tower</p>
                </div>
                <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                  <Star className="size-2.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  Gold
                </span>
              </div>
              <dl className="grid grid-cols-3 divide-x divide-border rounded-xl bg-muted/40 py-3">
                <div className="flex flex-col items-center gap-0.5">
                  <dt className="order-2 text-center text-[10px] text-muted-foreground">{t('bookings.upcoming')}</dt>
                  <dd className="order-1 text-base font-bold" style={{ color: TEAL }}>
                    {bookingsLoading ? '—' : upcomingBookings.length}
                  </dd>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <dt className="order-2 text-center text-[10px] text-muted-foreground">{t('home.openNow')}</dt>
                  <dd className="order-1 text-base font-bold" style={{ color: TEAL }}>
                    {amenitiesLoading ? '—' : openCount}
                  </dd>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <dt className="order-2 text-center text-[10px] text-muted-foreground">{t('home.memberSince')}</dt>
                  <dd className="order-1 text-base font-bold" style={{ color: TEAL }}>2021</dd>
                </div>
              </dl>
            </div>
          </section>
        </div>

        {/* ── RIGHT COLUMN – AMENITIES ── */}
        <section className="flex flex-col lg:col-span-8" aria-labelledby="popular-amenities-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="popular-amenities-heading"
              className="text-sm font-bold uppercase tracking-wide"
              style={{ color: TEAL }}
            >
              {t('home.popularAmenities')}
            </h2>
            <RouterLink
              to="/amenities"
              className="inline-flex items-center gap-1 text-xs font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              style={{ color: TEAL }}
              aria-label={`${t('home.viewAll')} amenities`}
            >
              {t('home.viewAll')} <ArrowRight className="size-3" aria-hidden="true" />
            </RouterLink>
          </div>

          {amenitiesLoading ? (
            <div
              className="flex flex-1 items-center justify-center py-28"
              role="status"
              aria-label="Loading amenities"
            >
              <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-4">
              {amenities[0] && <FeaturedAmenityCard amenity={amenities[0]} />}
              <div className="grid grid-cols-3 gap-4">
                {amenities.slice(1, 4).map((a) => (
                  <AmenityCard key={a.id} amenity={a} />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── DIGITAL CONCIERGE ── */}
      <section
        className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6"
        style={{ borderColor: `${TEAL}20` }}
        aria-labelledby="concierge-heading"
      >
        <div className="mb-4">
          <h2
            id="concierge-heading"
            className="text-sm font-bold uppercase tracking-wide"
            style={{ color: TEAL }}
          >
            {t('home.conciergeTitle')}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t('home.conciergeDesc')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CONCIERGE_ACTIONS.map(({ icon: Icon, label, description, bg, color, to }) => {
            const cardClass =
              'flex flex-col items-start gap-3 rounded-xl border border-transparent bg-muted/40 p-4 text-left transition-all duration-150 hover:border-black/8 hover:bg-card hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            const inner = (
              <>
                <div
                  className="flex size-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: bg }}
                  aria-hidden="true"
                >
                  <Icon className="size-[18px]" style={{ color }} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">{label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                </div>
              </>
            )
            return to ? (
              <RouterLink
                key={label}
                to={to}
                className={cardClass}
                aria-label={`${label}: ${description}`}
              >
                {inner}
              </RouterLink>
            ) : (
              <button
                key={label}
                type="button"
                className={cardClass}
                aria-label={`${label}: ${description}`}
              >
                {inner}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

/* ── SUB-COMPONENTS ── */

function FeaturedAmenityCard({ amenity: a }: { amenity: Amenity }) {
  const { t } = useTranslation()
  const isAvailable = a.badgeVariant !== 'booked'
  const actionLabel = a.bookPath ? t('home.bookNow') : t('home.exploreLabel')
  return (
    <RouterLink
      to={a.bookPath ?? '/amenities'}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
      aria-label={`${actionLabel} ${a.title} — ${isAvailable ? t('home.available') : t('home.fullyBooked')}`}
    >
      <div className="relative overflow-hidden rounded-2xl shadow-sm transition-shadow duration-200 group-hover:shadow-lg" style={{ height: 200 }}>
        <img
          src={a.image}
          alt={`${a.title} facility`}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" aria-hidden="true" />

        <Badge
          className={cn(
            'absolute top-3 left-3 border-0 text-[9px] font-bold uppercase tracking-wide',
            isAvailable ? 'bg-white/90 text-gray-800' : 'bg-gray-900/80 text-white',
          )}
          variant="secondary"
          aria-hidden="true"
        >
          {isAvailable ? t('home.available') : t('home.fullyBooked')}
        </Badge>

        <div className="absolute inset-y-0 left-0 flex flex-col justify-end p-5 sm:max-w-[55%]">
          <div className="mb-1 flex items-center gap-1">
            <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="text-xs font-bold text-white drop-shadow" aria-hidden="true">{a.rating}</span>
          </div>
          <p className="mb-1 text-xl font-bold leading-tight text-white drop-shadow" aria-hidden="true">{a.title}</p>
          <p className="mb-3 text-xs text-white/70" aria-hidden="true">{a.footerInfo}</p>
          <span
            className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold shadow transition-colors group-hover:bg-gray-50"
            style={{ color: TEAL }}
            aria-hidden="true"
          >
            {actionLabel} <ArrowRight className="size-3" aria-hidden="true" />
          </span>
        </div>
      </div>
    </RouterLink>
  )
}

function AmenityCard({ amenity: a }: { amenity: Amenity }) {
  const { t } = useTranslation()
  const isAvailable = a.badgeVariant !== 'booked'
  const actionLabel = a.bookPath ? t('home.bookNow') : t('home.exploreLabel')
  return (
    <RouterLink
      to={a.bookPath ?? '/amenities'}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
      aria-label={`${actionLabel} ${a.title} — ${isAvailable ? t('home.available') : t('home.fullyBooked')}`}
    >
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
        <div className="relative overflow-hidden" style={{ height: 120 }}>
          <img
            src={a.image}
            alt={`${a.title} facility`}
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" aria-hidden="true" />
          <Badge
            className={cn(
              'absolute top-2 left-2 border-0 text-[9px] font-bold uppercase tracking-wide',
              isAvailable ? 'bg-white/90 text-gray-800' : 'bg-gray-900/80 text-white',
            )}
            variant="secondary"
            aria-hidden="true"
          >
            {isAvailable ? t('home.available') : t('home.fullyBooked')}
          </Badge>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-2.5 pb-2">
            <p className="max-w-[75%] text-xs font-bold leading-tight text-white drop-shadow" aria-hidden="true">
              {a.title}
            </p>
            <div className="flex items-center gap-0.5" aria-hidden="true">
              <Star className="size-2.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span className="text-[10px] font-bold text-white drop-shadow">{a.rating}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-2.5 py-2" aria-hidden="true">
          <span
            className={cn('text-[10px] font-semibold', a.footerInfoMuted && 'text-muted-foreground')}
            style={!a.footerInfoMuted ? { color: TEAL } : undefined}
          >
            {a.footerInfo}
          </span>
          <span className="text-[9px] font-bold tracking-wide" style={{ color: TEAL }}>
            {a.bookPath ? `${t('home.bookNowLabel')} →` : `${t('home.exploreLabel')} →`}
          </span>
        </div>
      </div>
    </RouterLink>
  )
}
