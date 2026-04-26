import { format } from 'date-fns'
import { ArrowLeft, ArrowRight, Bell, CalendarDays, Clock, Loader2, MapPin, Star, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Logo } from '@/components/Logo'
import { useAmenity } from '@/hooks/useAmenities'
import { useSlots } from '@/hooks/useSlots'
import { useCreateBooking } from '@/hooks/useBookings'
import { useUser } from '@/hooks/useUser'
import { cn, getInitials } from '@/lib/utils'

const TEAL = '#004D57'

export function BookingPage() {
  const { amenityId } = useParams<{ amenityId: string }>()
  const navigate = useNavigate()

  const { data: meta, isLoading: metaLoading } = useAmenity(amenityId ?? '')
  const { data: user } = useUser()

  const today = useMemo(() => new Date(), [])
  const [month, setMonth] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => new Date())
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  const isoDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  const { data: rawSlots = [], isLoading: slotsLoading } = useSlots(amenityId ?? '', isoDate)

  const createBooking = useCreateBooking()

  const slots = useMemo(() => {
    type Display = 'booked' | 'mine' | 'selected' | 'available'
    const display = (s: (typeof rawSlots)[number]): Display => {
      if (s.status === 'booked') return 'booked'
      if (s.status === 'mine') return 'mine'
      if (s.id === selectedSlotId) return 'selected'
      return 'available'
    }
    return rawSlots.map((s) => ({ ...s, displayStatus: display(s) }))
  }, [rawSlots, selectedSlotId])

  const selectedSlot = rawSlots.find((s) => s.id === selectedSlotId)

  const handleSlotClick = (id: string, status: string) => {
    if (status === 'booked' || status === 'mine') return
    setSelectedSlotId((prev) => (prev === id ? null : id))
  }

  const handleConfirm = () => {
    if (!selectedSlotId || !amenityId || !isoDate || !meta) return
    const slot = rawSlots.find((s) => s.id === selectedSlotId)
    if (!slot) return
    createBooking.mutate(
      {
        amenityId,
        amenityTitle: meta.title,
        image: meta.image,
        slotId: selectedSlotId,
        date: isoDate,
        time: slot.label,
      },
      { onSuccess: () => navigate('/bookings') },
    )
  }

  const confirmDisabled = !selectedSlotId || createBooking.isPending

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="cursor-pointer rounded-md p-2 text-[color:var(--primary)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <Logo size="sm" />
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="text-[color:var(--primary)]" aria-label="Notifications">
            <Bell className="size-5" aria-hidden="true" />
          </Button>
          <Avatar
            className="size-9 cursor-default"
            style={{ backgroundColor: `${TEAL}18`, color: TEAL }}
            aria-hidden="true"
          >
            <AvatarFallback className="bg-transparent text-sm font-bold">
              {user ? getInitials(user.name)[0] : 'J'}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {metaLoading || !meta ? (
        <div className="flex items-center justify-center py-20" role="status" aria-label="Loading amenity details">
          <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : (
        <>
          {/* ── Compact amenity card ── */}
          <section aria-label={`${meta.title} details`}>
            <div
              className="border-b"
              style={{ background: `linear-gradient(135deg, ${TEAL}12 0%, ${TEAL}06 100%)` }}
            >
              <div className="mx-auto max-w-[1200px] px-4 py-5 sm:px-6">
                <div className="flex gap-4 sm:gap-5">
                  {/* Thumbnail */}
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl shadow-md sm:size-24">
                    <img
                      src={meta.image}
                      alt={`${meta.title} facility`}
                      className="size-full object-cover"
                    />
                    {/* Badge overlay */}
                    <span
                      className="absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider text-white"
                      style={{ backgroundColor: `${TEAL}cc` }}
                    >
                      {meta.badge}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <h1 className="mb-1.5 truncate text-xl font-bold leading-tight sm:text-2xl" style={{ color: TEAL }}>
                      {meta.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                      {meta.location && (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                          {meta.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" aria-hidden="true" />
                        <span className="font-semibold text-foreground">{meta.rating}</span>
                        {meta.reviewCount && (
                          <span className="text-xs">({meta.reviewCount})</span>
                        )}
                      </span>
                      {meta.capacityLabel && (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="size-3.5 shrink-0" aria-hidden="true" />
                          {meta.capacityLabel}
                        </span>
                      )}
                    </div>
                    {meta.description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {meta.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Main booking grid ── */}
          <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">

              {/* ── Date picker ── */}
              <section aria-labelledby="select-date-heading">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarDays className="size-4 shrink-0" style={{ color: TEAL }} aria-hidden="true" />
                  <h2 id="select-date-heading" className="text-base font-bold" style={{ color: TEAL }}>
                    Choose a Date
                  </h2>
                </div>
                <div className="rounded-2xl border bg-card shadow-sm">
                  <Calendar
                    mode="single"
                    month={month}
                    onMonthChange={setMonth}
                    selected={selectedDate}
                    onSelect={(d) => {
                      setSelectedDate(d)
                      setSelectedSlotId(null)
                    }}
                    disabled={{ before: today }}
                    className="w-full max-w-none p-3"
                  />
                  {selectedDate && (
                    <div
                      className="flex items-center gap-2 border-t px-4 py-3 text-sm font-semibold"
                      style={{ color: TEAL }}
                    >
                      <CalendarDays className="size-4" aria-hidden="true" />
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </div>
                  )}
                </div>
              </section>

              {/* ── Slot picker ── */}
              <section aria-labelledby="slots-heading">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 shrink-0" style={{ color: TEAL }} aria-hidden="true" />
                    <h2 id="slots-heading" className="text-base font-bold" style={{ color: TEAL }}>
                      Choose a Time
                    </h2>
                  </div>
                  {/* Legend */}
                  <div
                    className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                    aria-label="Slot status legend"
                  >
                    <span className="flex items-center gap-1">
                      <span className="size-2.5 rounded-sm bg-card ring-1 ring-border" aria-hidden="true" />
                      Free
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="size-2.5 rounded-sm bg-muted" aria-hidden="true" />
                      Taken
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="size-2.5 rounded-sm bg-orange-100 ring-1 ring-orange-300" aria-hidden="true" />
                      Mine
                    </span>
                  </div>
                </div>

                {slotsLoading ? (
                  <div
                    className="flex items-center justify-center rounded-2xl border bg-card py-16"
                    role="status"
                    aria-label="Loading available slots"
                  >
                    <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-card py-16 text-center">
                    <Clock className="size-8 text-muted-foreground/40" aria-hidden="true" />
                    <p className="text-sm font-medium text-muted-foreground">No slots available for this date.</p>
                  </div>
                ) : (
                  <div
                    className="grid grid-cols-3 gap-2 sm:grid-cols-4"
                    role="group"
                    aria-labelledby="slots-heading"
                  >
                    {slots.map((slot) => {
                      const statusLabel =
                        slot.displayStatus === 'booked'   ? 'Booked'
                        : slot.displayStatus === 'mine'   ? 'Mine'
                        : slot.displayStatus === 'selected' ? 'Selected'
                        : 'Free'
                      const isUnavailable = slot.status === 'booked' || slot.status === 'mine'
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isUnavailable}
                          aria-disabled={isUnavailable}
                          aria-pressed={slot.displayStatus === 'selected'}
                          aria-label={`${slot.label} — ${statusLabel}`}
                          onClick={() => handleSlotClick(slot.id, slot.status)}
                          className={cn(
                            'group flex flex-col items-center gap-0.5 rounded-xl border px-2 py-3 text-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            slot.displayStatus === 'booked' &&
                              'cursor-not-allowed border-transparent bg-muted/60 text-muted-foreground/50',
                            slot.displayStatus === 'available' &&
                              'cursor-pointer border-border bg-card text-foreground hover:border-[color:var(--primary)]/40 hover:bg-muted/30 hover:shadow-sm',
                            slot.displayStatus === 'selected' &&
                              'border-transparent text-white shadow-md ring-2',
                            slot.displayStatus === 'mine' &&
                              'cursor-not-allowed border-orange-200 bg-orange-50 text-orange-900',
                          )}
                          style={
                            slot.displayStatus === 'selected'
                              ? { backgroundColor: TEAL }
                              : undefined
                          }
                        >
                          <span className="text-[13px] font-bold leading-none" aria-hidden="true">
                            {slot.label.replace(' AM', '').replace(' PM', '')}
                          </span>
                          <span
                            className={cn(
                              'text-[9px] font-semibold uppercase tracking-wider',
                              slot.displayStatus === 'booked' && 'opacity-60',
                              slot.displayStatus === 'available' && 'text-muted-foreground',
                              slot.displayStatus === 'selected' && 'text-white/70',
                              slot.displayStatus === 'mine' && 'text-orange-600',
                            )}
                            aria-hidden="true"
                          >
                            {slot.label.includes('AM') ? 'AM' : 'PM'}
                          </span>
                          <span
                            className={cn(
                              'mt-0.5 text-[9px] font-medium',
                              slot.displayStatus === 'booked' && 'text-muted-foreground/50',
                              slot.displayStatus === 'available' && 'text-muted-foreground/60',
                              slot.displayStatus === 'selected' && 'text-white/60',
                              slot.displayStatus === 'mine' && 'text-orange-500',
                            )}
                            aria-hidden="true"
                          >
                            {statusLabel}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        </>
      )}

      {/* ── Sticky confirm bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
          {/* Booking summary */}
          <div className="min-w-0 flex-1">
            {selectedDate && selectedSlot ? (
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Selection</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                  <span className="flex items-center gap-1.5 text-sm font-bold" style={{ color: TEAL }}>
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {format(selectedDate, 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-bold" style={{ color: TEAL }}>
                    <Clock className="size-3.5" aria-hidden="true" />
                    {selectedSlot.label}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground" id="confirm-hint">
                Pick a date and time slot to continue.
              </p>
            )}
          </div>

          <Button
            size="lg"
            disabled={confirmDisabled}
            aria-disabled={confirmDisabled}
            aria-busy={createBooking.isPending}
            aria-describedby={!selectedSlotId ? 'confirm-hint' : undefined}
            onClick={handleConfirm}
            className="h-11 shrink-0 gap-2 text-sm font-bold sm:min-w-[200px]"
            style={{ backgroundColor: confirmDisabled ? undefined : TEAL }}
          >
            {createBooking.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Confirming…
              </>
            ) : (
              <>
                Confirm Booking
                <ArrowRight className="size-4" aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
