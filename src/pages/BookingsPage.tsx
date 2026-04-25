import { format, parseISO } from 'date-fns'
import {
  Activity,
  ArrowRight,
  Calendar,
  CalendarDays,
  Check,
  Clock,
  Dumbbell,
  Feather,
  Loader2,
  PartyPopper,
  Waves,
  X,
  XCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarPicker } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useUpcomingBookings,
  useBookingHistory,
  useBookingHistoryInfinite,
  useCancelBooking,
  useRescheduleBooking,
  type Booking,
} from '@/hooks/useBookings'
import { useSlots } from '@/hooks/useSlots'
import { cn } from '@/lib/utils'

const TEAL = '#004D57'
const HISTORY_PAGE_SIZE = 5

const AMENITY_ICONS: Record<string, LucideIcon> = {
  pool: Waves,
  badminton: Feather,
  squash: Activity,
  'grand-hall': PartyPopper,
  'wellness-hub': Dumbbell,
}

function formatDate(iso: string) {
  try { return format(parseISO(iso), 'MMM d, yyyy') }
  catch { return iso }
}

// ── Reschedule Modal ──────────────────────────────────────────────────────────

function RescheduleModal({
  booking,
  onClose,
}: {
  booking: Booking
  onClose: () => void
}) {
  const today = useMemo(() => new Date(), [])
  const [month, setMonth] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  const isoDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  const { data: rawSlots = [], isLoading: slotsLoading } = useSlots(
    booking.amenityId,
    isoDate,
  )

  const reschedule = useRescheduleBooking()

  // Slots display — exclude the current booking's slot (it will be freed)
  const slots = useMemo(() => {
    return rawSlots
      .filter((s) => s.id !== booking.slotId) // hide current slot from picker
      .map((s) => ({
        ...s,
        displayStatus: (
          s.status === 'booked' ? 'booked'
          : s.status === 'mine'  ? 'mine'
          : s.id === selectedSlotId ? 'selected'
          : 'available'
        ) as 'booked' | 'mine' | 'selected' | 'available',
      }))
  }, [rawSlots, selectedSlotId, booking.slotId])

  const selectedSlot = rawSlots.find((s) => s.id === selectedSlotId)
  const canConfirm = !!selectedSlotId && !reschedule.isPending

  const handleConfirm = () => {
    if (!selectedSlotId || !selectedSlot || !isoDate) return
    reschedule.mutate(
      {
        bookingId: booking.id,
        oldSlotId: booking.slotId,
        newSlotId: selectedSlotId,
        newDate: isoDate,
        newTime: selectedSlot.label,
        amenityId: booking.amenityId,
      },
      { onSuccess: onClose },
    )
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Reschedule ${booking.amenityTitle}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 flex w-full flex-col overflow-hidden rounded-t-3xl bg-background shadow-2xl sm:mx-4 sm:max-w-2xl sm:rounded-3xl">

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden" aria-hidden="true">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/25" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-base font-bold" style={{ color: TEAL }}>
              Reschedule Booking
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pick a new date and time slot
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close reschedule dialog"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5" style={{ maxHeight: '75vh' }}>

          {/* Current booking info */}
          <div
            className="mb-6 flex items-center gap-3 rounded-2xl border p-3"
            style={{ borderColor: `${TEAL}30`, backgroundColor: `${TEAL}08` }}
          >
            <img
              src={booking.image}
              alt={booking.amenityTitle}
              className="size-12 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold" style={{ color: TEAL }}>
                {booking.amenityTitle}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Current: {formatDate(booking.date)} · {booking.time}
              </p>
            </div>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: `${TEAL}15`, color: TEAL }}
            >
              Changing
            </span>
          </div>

          {/* Step 1 — Date */}
          <div className="mb-5">
            <div className="mb-3 flex items-center gap-2">
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: TEAL }}
                aria-hidden="true"
              >
                1
              </span>
              <h3 className="text-sm font-semibold text-foreground">Choose a new date</h3>
            </div>
            <div className="rounded-2xl border bg-card shadow-sm">
              <CalendarPicker
                mode="single"
                month={month}
                onMonthChange={setMonth}
                selected={selectedDate}
                onSelect={(d) => {
                  setSelectedDate(d)
                  setSelectedSlotId(null)
                }}
                disabled={[
                  { before: today },
                  // Disable the original booking date/slot combo — same date is allowed (different slot)
                ]}
                className="w-full max-w-none p-3"
              />
              {selectedDate && (
                <div
                  className="flex items-center gap-2 border-t px-4 py-2.5 text-sm font-semibold"
                  style={{ color: TEAL }}
                >
                  <CalendarDays className="size-4" aria-hidden="true" />
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </div>
              )}
            </div>
          </div>

          {/* Step 2 — Time slot */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                  selectedDate ? 'text-white' : 'bg-muted text-muted-foreground',
                )}
                style={selectedDate ? { backgroundColor: TEAL } : undefined}
                aria-hidden="true"
              >
                2
              </span>
              <h3 className={cn('text-sm font-semibold', selectedDate ? 'text-foreground' : 'text-muted-foreground')}>
                Choose a new time slot
              </h3>
            </div>

            {!selectedDate ? (
              <div className="flex items-center justify-center rounded-2xl border border-dashed bg-muted/30 py-10">
                <p className="text-sm text-muted-foreground">Select a date first</p>
              </div>
            ) : slotsLoading ? (
              <div
                className="flex items-center justify-center rounded-2xl border bg-card py-10"
                role="status"
                aria-label="Loading slots"
              >
                <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : slots.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-card py-10 text-center">
                <Clock className="size-7 text-muted-foreground/40" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">No available slots for this date.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="group" aria-label="Available time slots">
                {slots.map((slot) => {
                  const isUnavailable = slot.displayStatus === 'booked' || slot.displayStatus === 'mine'
                  const label =
                    slot.displayStatus === 'selected' ? 'Selected'
                    : slot.displayStatus === 'mine'   ? 'Mine'
                    : slot.displayStatus === 'booked' ? 'Taken'
                    : 'Free'
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isUnavailable}
                      aria-disabled={isUnavailable}
                      aria-pressed={slot.displayStatus === 'selected'}
                      aria-label={`${slot.label} — ${label}`}
                      onClick={() => !isUnavailable && setSelectedSlotId(slot.id)}
                      className={cn(
                        'flex flex-col items-center gap-0.5 rounded-xl border px-2 py-3 text-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        slot.displayStatus === 'booked' &&
                          'cursor-not-allowed border-transparent bg-muted/60 text-muted-foreground/50',
                        slot.displayStatus === 'mine' &&
                          'cursor-not-allowed border-orange-200 bg-orange-50 text-orange-900',
                        slot.displayStatus === 'available' &&
                          'cursor-pointer border-border bg-card text-foreground hover:border-[color:var(--primary)]/40 hover:bg-muted/30',
                        slot.displayStatus === 'selected' &&
                          'border-transparent text-white shadow-md',
                      )}
                      style={slot.displayStatus === 'selected' ? { backgroundColor: TEAL } : undefined}
                    >
                      <span className="text-[13px] font-bold leading-none" aria-hidden="true">
                        {slot.label.replace(' AM', '').replace(' PM', '')}
                      </span>
                      <span
                        className={cn(
                          'text-[9px] font-semibold uppercase tracking-wider',
                          slot.displayStatus === 'available' && 'text-muted-foreground',
                          slot.displayStatus === 'selected' && 'text-white/70',
                          slot.displayStatus === 'mine' && 'text-orange-600',
                          slot.displayStatus === 'booked' && 'opacity-50',
                        )}
                        aria-hidden="true"
                      >
                        {slot.label.includes('AM') ? 'AM' : 'PM'}
                      </span>
                      <span
                        className={cn(
                          'mt-0.5 text-[9px] font-medium',
                          slot.displayStatus === 'available' && 'text-muted-foreground/60',
                          slot.displayStatus === 'selected' && 'text-white/60',
                          slot.displayStatus === 'mine' && 'text-orange-500',
                          slot.displayStatus === 'booked' && 'text-muted-foreground/40',
                        )}
                        aria-hidden="true"
                      >
                        {label}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sticky footer */}
        <div className="border-t bg-background px-5 py-4">
          {/* Summary row */}
          {selectedDate && selectedSlot ? (
            <div
              className="mb-3 flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{ backgroundColor: `${TEAL}0c` }}
            >
              <Check className="size-4 shrink-0" style={{ color: TEAL }} aria-hidden="true" />
              <div className="min-w-0 flex-1 text-sm">
                <span className="font-semibold" style={{ color: TEAL }}>
                  {format(selectedDate, 'EEE, MMM d')}
                </span>
                <span className="mx-1.5 text-muted-foreground">·</span>
                <span className="font-semibold" style={{ color: TEAL }}>
                  {selectedSlot.label}
                </span>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">New time</span>
            </div>
          ) : null}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-11 flex-1"
              onClick={onClose}
              disabled={reschedule.isPending}
            >
              Cancel
            </Button>
            <Button
              className="h-11 flex-1 gap-2 font-bold"
              disabled={!canConfirm}
              aria-disabled={!canConfirm}
              aria-busy={reschedule.isPending}
              onClick={handleConfirm}
              style={{ backgroundColor: canConfirm ? TEAL : undefined }}
            >
              {reschedule.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                <>
                  Confirm Reschedule
                  <ArrowRight className="size-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── History helpers ───────────────────────────────────────────────────────────

function HistoryList({ items, showViewAll }: { items: Booking[]; showViewAll?: boolean }) {
  const { t } = useTranslation()
  return (
    <div className="rounded-2xl bg-muted/50 p-1 sm:p-2">
      <div className="rounded-xl bg-card/80 p-2 shadow-sm">
        <ul role="list" className="list-none p-0 m-0">
          {items.map((row, i) => {
            const Icon = row.status === 'cancelled' ? XCircle : (AMENITY_ICONS[row.amenityId] ?? Activity)
            const isCancelled = row.status === 'cancelled'
            return (
              <li key={row.id}>
                {i > 0 ? <Separator className="my-1" /> : null}
                <div className="flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-[color:var(--primary)]"
                    aria-hidden="true"
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground">{row.amenityTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(row.date)} · {row.time}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-right sm:flex-row sm:items-center sm:gap-4">
                    <span className={cn('text-sm font-medium', isCancelled ? 'text-destructive' : 'text-muted-foreground')}>
                      {isCancelled ? t('bookings.cancelled') : t('bookings.completed')}
                    </span>
                    {row.status === 'completed' ? (
                      <Link
                        to="/amenities"
                        className="text-sm font-semibold hover:underline"
                        style={{ color: TEAL }}
                        aria-label={`${t('bookings.bookAgain')} — ${row.amenityTitle}`}
                      >
                        {t('bookings.bookAgain')}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="text-sm font-semibold hover:underline"
                        style={{ color: TEAL }}
                        aria-label={`${t('bookings.details')} — ${row.amenityTitle}`}
                      >
                        {t('bookings.details')}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        {showViewAll ? (
          <>
            <Separator />
            <div className="flex justify-center py-4">
              <Link
                to="/bookings?tab=history"
                className="text-sm font-semibold hover:underline"
                style={{ color: TEAL }}
              >
                {t('bookings.viewFullHistory')}
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

function HistorySkeletons({ count }: { count: number }) {
  return (
    <div className="rounded-2xl bg-muted/50 p-1 sm:p-2" aria-hidden="true">
      <div className="rounded-xl bg-card/80 p-2 shadow-sm">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i}>
            {i > 0 && <Separator className="my-1" />}
            <div className="flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4">
              <div className="size-10 shrink-0 animate-pulse rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-2/5 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HistoryTab() {
  const { t } = useTranslation()
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useBookingHistoryInfinite()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const allItems = data?.pages.flatMap((p) => p.items) ?? []
  const total = data?.pages[0]?.total ?? 0

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          {t('bookings.allHistory')}
        </h2>
        {total > 0 && (
          <p className="text-xs text-muted-foreground" aria-live="polite" aria-atomic="true">
            {t('bookings.showingOf', { shown: allItems.length, total })}
          </p>
        )}
      </div>

      {isLoading ? (
        <>
          <p className="sr-only" role="status">{t('bookings.loadingMore')}</p>
          <HistorySkeletons count={HISTORY_PAGE_SIZE} />
        </>
      ) : allItems.length === 0 ? (
        <p className="rounded-2xl border bg-muted/30 py-12 text-center text-sm text-muted-foreground">
          {t('bookings.noHistory')}
        </p>
      ) : (
        <HistoryList items={allItems} />
      )}

      <div ref={sentinelRef} className="h-px" aria-hidden="true" />

      {isFetchingNextPage ? (
        <>
          <p className="sr-only" role="status">{t('bookings.loadingMore')}</p>
          <HistorySkeletons count={3} />
        </>
      ) : !hasNextPage && allItems.length > 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground" aria-live="polite">
          {t('bookings.endOfHistory', { total })}
        </p>
      ) : null}
    </>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function BookingsPage() {
  const { t } = useTranslation()
  const { data: upcomingBookings = [], isLoading: upcomingLoading } = useUpcomingBookings()
  const { data: historyBookings = [], isLoading: historyLoading } = useBookingHistory()
  const cancelBooking = useCancelBooking()

  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'history' ? 'history' : 'upcoming'

  const [rescheduleTarget, setRescheduleTarget] = useState<Booking | null>(null)

  return (
    <div className="space-y-8">
      {rescheduleTarget && (
        <RescheduleModal
          booking={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
        />
      )}

      <Tabs
        value={activeTab}
        onValueChange={(tab) => setSearchParams({ tab }, { replace: true })}
        className="w-full gap-6"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: TEAL }}>
              {t('bookings.title')}
            </h1>
            <p className="mt-2 max-w-lg text-muted-foreground">
              {t('bookings.subtitle')}
            </p>
          </div>
          <TabsList className="h-10 shrink-0 rounded-full bg-muted/80 p-1 shadow-inner">
            <TabsTrigger value="upcoming" className="rounded-full px-5">{t('bookings.upcoming')}</TabsTrigger>
            <TabsTrigger value="history" className="rounded-full px-5">{t('bookings.history')}</TabsTrigger>
          </TabsList>
        </div>

        {/* ── UPCOMING TAB ── */}
        <TabsContent value="upcoming" className="mt-0 space-y-10 outline-none">
          <section aria-labelledby="upcoming-heading">
            <h2
              id="upcoming-heading"
              className="mb-4 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase"
            >
              {t('bookings.upcomingSection')}
            </h2>
            {upcomingLoading ? (
              <div
                className="flex items-center justify-center py-12"
                role="status"
                aria-label="Loading upcoming bookings"
              >
                <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : upcomingBookings.length === 0 ? (
              <p className="rounded-2xl border bg-muted/30 py-12 text-center text-sm text-muted-foreground">
                {t('bookings.noUpcoming')}{' '}
                <Link to="/amenities" className="font-semibold hover:underline" style={{ color: TEAL }}>
                  {t('bookings.browseAmenities')}
                </Link>
              </p>
            ) : (
              <ul role="list" className="grid grid-cols-1 gap-4 md:grid-cols-2 list-none p-0">
                {upcomingBookings.map((b) => (
                  <li key={b.id}>
                    <Card className="overflow-hidden rounded-2xl border shadow-sm h-full">
                      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                        <img
                          src={b.image}
                          alt={`${b.amenityTitle} facility`}
                          className="size-16 shrink-0 rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h3 className="font-bold leading-snug" style={{ color: TEAL }}>
                              {b.amenityTitle}
                            </h3>
                            {b.status === 'confirmed' ? (
                              <Badge className="border-0 bg-sky-100 font-semibold text-sky-800 uppercase">
                                {t('bookings.confirmed')}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="border-0 font-semibold uppercase text-muted-foreground">
                                {t('bookings.pending')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-0">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="size-4 shrink-0" aria-hidden="true" />
                          <span>{formatDate(b.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="size-4 shrink-0" aria-hidden="true" />
                          <span>{b.time}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex items-center gap-3 border-t bg-muted/30 pt-4">
                        <Button
                          className="flex-1 font-semibold"
                          style={{ backgroundColor: TEAL }}
                          aria-label={`${t('bookings.reschedule')} — ${b.amenityTitle}`}
                          onClick={() => setRescheduleTarget(b)}
                        >
                          {t('bookings.reschedule')}
                        </Button>
                        <button
                          type="button"
                          disabled={cancelBooking.isPending}
                          aria-disabled={cancelBooking.isPending}
                          aria-busy={cancelBooking.isPending}
                          onClick={() => cancelBooking.mutate(b.id)}
                          aria-label={`${t('bookings.cancel')} — ${b.amenityTitle}`}
                          className="text-sm font-semibold transition-opacity hover:opacity-70 disabled:opacity-40"
                          style={{ color: TEAL }}
                        >
                          {t('bookings.cancel')}
                        </button>
                      </CardFooter>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="recent-history-heading">
            <h2
              id="recent-history-heading"
              className="mb-4 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase"
            >
              {t('bookings.recentHistory')}
            </h2>
            {historyLoading ? (
              <div className="flex items-center justify-center py-8" role="status" aria-label="Loading recent history">
                <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : (
              <HistoryList items={historyBookings.slice(0, 3)} showViewAll={historyBookings.length > 3} />
            )}
          </section>
        </TabsContent>

        {/* ── HISTORY TAB ── */}
        <TabsContent value="history" className="mt-0 outline-none">
          <HistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
