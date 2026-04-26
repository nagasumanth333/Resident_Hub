import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'

export type Slot = {
  id: string
  amenityId: string
  date: string
  label: string
  status: 'available' | 'booked' | 'mine'
}

// Slots run 08:00 AM – 06:00 PM, one per hour
const SLOT_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

function hourLabel(h: number): string {
  if (h === 12) return '12:00 PM'
  return h < 12
    ? `${String(h).padStart(2, '0')}:00 AM`
    : `${String(h - 12).padStart(2, '0')}:00 PM`
}

function slotId(amenityId: string, date: string, hour: number): string {
  return `slot-${amenityId}-${date}-${String(hour).padStart(2, '0')}`
}

type StoredBooking = { slot_id: string | null; user_id: string; amenity_id: string; date: string; status: string }

function loadBookingsForSlot(amenityId: string, date: string): StoredBooking[] {
  try {
    const raw = localStorage.getItem('bookings')
    if (!raw) return []
    const all = JSON.parse(raw) as Array<{
      slotId: string | null
      userId: string
      amenityId: string
      date: string
      status: string
    }>
    return all
      .filter(
        (b) =>
          b.amenityId === amenityId &&
          b.date === date &&
          (b.status === 'confirmed' || b.status === 'pending'),
      )
      .map((b) => ({ slot_id: b.slotId, user_id: b.userId, amenity_id: b.amenityId, date: b.date, status: b.status }))
  } catch {
    return []
  }
}

export function useSlots(amenityId: string, date: string) {
  const { user } = useAuth()

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['slots', amenityId, date],
    queryFn: () => loadBookingsForSlot(amenityId, date),
    enabled: !!amenityId && !!date,
  })

  const slots: Slot[] = useMemo(() => {
    const bookedSlotIds = new Set(bookings.map((b) => b.slot_id).filter(Boolean))
    const mySlotIds = new Set(
      bookings.filter((b) => b.user_id === user?.id).map((b) => b.slot_id).filter(Boolean),
    )

    return SLOT_HOURS.map((h) => {
      const id = slotId(amenityId, date, h)
      const status: Slot['status'] = mySlotIds.has(id)
        ? 'mine'
        : bookedSlotIds.has(id)
          ? 'booked'
          : 'available'
      return { id, amenityId, date, label: hourLabel(h), status }
    })
  }, [bookings, amenityId, date, user?.id])

  return { data: slots, isLoading, error }
}
