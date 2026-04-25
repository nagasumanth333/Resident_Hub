import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Booking } from '@/hooks/useBookings'

const DEMO_USER_ID = 'user-001'

export type Slot = {
  id: string
  amenityId: string
  date: string
  label: string
  status: 'available' | 'booked' | 'mine'
}

export function useSlots(amenityId: string, date: string) {
  const slotsQuery = useQuery({
    queryKey: ['slots', amenityId, date],
    queryFn: () => api.get<Slot[]>(`/slots?amenityId=${amenityId}&date=${date}`),
    enabled: !!amenityId && !!date,
  })

  // Fetch user's bookings for the same amenity+date to compute 'mine' status
  const isoDate = date // date is already in YYYY-MM-DD format from calendar
  const userBookingsQuery = useQuery({
    queryKey: ['userSlotBookings', amenityId, isoDate],
    queryFn: () =>
      api.get<Booking[]>(
        `/bookings?userId=${DEMO_USER_ID}&amenityId=${amenityId}&date=${isoDate}`,
      ),
    enabled: !!amenityId && !!date,
  })

  const slots = useMemo(() => {
    if (!slotsQuery.data) return []
    const mySlotIds = new Set(
      userBookingsQuery.data?.map((b) => b.slotId).filter(Boolean) ?? [],
    )
    return slotsQuery.data.map((s) => ({
      ...s,
      status: (mySlotIds.has(s.id) ? 'mine' : s.status) as Slot['status'],
    }))
  }, [slotsQuery.data, userBookingsQuery.data])

  return { ...slotsQuery, data: slots }
}
