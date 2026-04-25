import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'

const DEMO_USER_ID = 'user-001'

export type Booking = {
  id: string
  userId: string
  amenityId: string
  amenityTitle: string
  image: string
  slotId: string | null
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  date: string   // ISO: YYYY-MM-DD
  time: string
}

function useAllUserBookings() {
  return useQuery({
    queryKey: ['bookings', DEMO_USER_ID],
    queryFn: () => api.get<Booking[]>(`/bookings?userId=${DEMO_USER_ID}`),
  })
}

export function useUpcomingBookings() {
  const query = useAllUserBookings()
  const upcoming = useMemo(
    () =>
      (query.data ?? [])
        .filter((b) => b.status === 'confirmed' || b.status === 'pending')
        .sort((a, b) => a.date.localeCompare(b.date)),
    [query.data],
  )
  return { ...query, data: upcoming }
}

export function useBookingHistory() {
  const query = useAllUserBookings()
  const history = useMemo(
    () =>
      (query.data ?? [])
        .filter((b) => b.status === 'completed' || b.status === 'cancelled')
        .sort((a, b) => b.date.localeCompare(a.date)),
    [query.data],
  )
  return { ...query, data: history }
}

const HISTORY_PAGE_SIZE = 5

export function useBookingHistoryInfinite() {
  return useInfiniteQuery({
    queryKey: ['booking-history-infinite', DEMO_USER_ID],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const [all] = await Promise.all([
        api.get<Booking[]>(`/bookings?userId=${DEMO_USER_ID}`),
        new Promise((r) => setTimeout(r, 800)),
      ])
      const history = (all as Booking[])
        .filter((b) => b.status === 'completed' || b.status === 'cancelled')
        .sort((a, b) => b.date.localeCompare(a.date)) // newest first
      const start = (pageParam - 1) * HISTORY_PAGE_SIZE
      const items = history.slice(start, start + HISTORY_PAGE_SIZE)
      const hasMore = start + HISTORY_PAGE_SIZE < history.length
      return { items, total: history.length, hasMore }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    staleTime: 30_000,
  })
}

type CreateBookingPayload = {
  amenityId: string
  amenityTitle: string
  image: string
  slotId: string
  date: string
  time: string
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateBookingPayload) => {
      const booking = await api.post<Booking>('/bookings', {
        id: `booking-${Date.now()}`,
        userId: DEMO_USER_ID,
        status: 'confirmed',
        ...payload,
      })
      // Mark the slot as booked
      await api.patch(`/slots/${payload.slotId}`, { status: 'booked' })
      return booking
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['slots', variables.amenityId, variables.date] })
      queryClient.invalidateQueries({ queryKey: ['bookings', DEMO_USER_ID] })
      queryClient.invalidateQueries({ queryKey: ['userSlotBookings', variables.amenityId, variables.date] })
      toast.success('Booking confirmed!', {
        description: 'Your slot has been reserved. Check My Bookings for details.',
      })
    },
    onError: () => {
      toast.error('Booking failed', {
        description: 'Could not confirm your booking. Please try again.',
      })
    },
  })
}

type ReschedulePayload = {
  bookingId: string
  oldSlotId: string | null
  newSlotId: string
  newDate: string
  newTime: string
  amenityId: string
}

export function useRescheduleBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ bookingId, oldSlotId, newSlotId, newDate, newTime }: ReschedulePayload) => {
      const booking = await api.patch<Booking>(`/bookings/${bookingId}`, {
        slotId: newSlotId,
        date: newDate,
        time: newTime,
      })
      if (oldSlotId) await api.patch(`/slots/${oldSlotId}`, { status: 'available' })
      await api.patch(`/slots/${newSlotId}`, { status: 'booked' })
      return booking
    },
    onSuccess: (_, { amenityId, newDate }) => {
      queryClient.invalidateQueries({ queryKey: ['bookings', DEMO_USER_ID] })
      queryClient.invalidateQueries({ queryKey: ['slots', amenityId, newDate] })
      queryClient.invalidateQueries({ queryKey: ['userSlotBookings', amenityId, newDate] })
      toast.success('Booking rescheduled!', {
        description: 'Your reservation has been updated.',
      })
    },
    onError: () => {
      toast.error('Could not reschedule', {
        description: 'Something went wrong. Please try again.',
      })
    },
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookingId: string) =>
      api.patch<Booking>(`/bookings/${bookingId}`, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', DEMO_USER_ID] })
      toast.success('Booking cancelled', {
        description: 'Your reservation has been removed.',
      })
    },
    onError: () => {
      toast.error('Could not cancel booking', {
        description: 'Something went wrong. Please try again.',
      })
    },
  })
}
