import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

export type Booking = {
  id: string
  userId: string
  amenityId: string
  amenityTitle: string
  image: string
  slotId: string | null
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  date: string
  time: string
}

const STORAGE_KEY = 'bookings'

function loadBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Booking[]) : []
  } catch {
    return []
  }
}

function saveBookings(bookings: Booking[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
}

function useAllUserBookings() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => loadBookings().filter((b) => b.userId === user!.id),
    enabled: !!user,
  })
}

export function useUpcomingBookings() {
  const query = useAllUserBookings()
  const upcoming = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return (query.data ?? [])
      .filter((b) => (b.status === 'confirmed' || b.status === 'pending') && b.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [query.data])
  return { ...query, data: upcoming }
}

export function useBookingHistory() {
  const query = useAllUserBookings()
  const history = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return (query.data ?? [])
      .filter(
        (b) =>
          b.status === 'completed' ||
          b.status === 'cancelled' ||
          ((b.status === 'confirmed' || b.status === 'pending') && b.date < today),
      )
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [query.data])
  return { ...query, data: history }
}

const HISTORY_PAGE_SIZE = 5

export function useBookingHistoryInfinite() {
  const { user } = useAuth()
  return useInfiniteQuery({
    queryKey: ['booking-history-infinite', user?.id],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      // Simulate network delay so the infinite scroll skeleton is visible
      await new Promise((r) => setTimeout(r, 800))

      const today = format(new Date(), 'yyyy-MM-dd')
      const history = loadBookings()
        .filter((b) => b.userId === user!.id)
        .filter(
          (b) =>
            b.status === 'completed' ||
            b.status === 'cancelled' ||
            ((b.status === 'confirmed' || b.status === 'pending') && b.date < today),
        )
        .sort((a, b) => b.date.localeCompare(a.date))

      const start = (pageParam - 1) * HISTORY_PAGE_SIZE
      const items = history.slice(start, start + HISTORY_PAGE_SIZE)
      const hasMore = start + HISTORY_PAGE_SIZE < history.length
      return { items, total: history.length, hasMore }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    enabled: !!user,
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
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateBookingPayload): Promise<Booking> => {
      const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        userId: user!.id,
        amenityId: payload.amenityId,
        amenityTitle: payload.amenityTitle,
        image: payload.image,
        slotId: payload.slotId,
        status: 'confirmed',
        date: payload.date,
        time: payload.time,
      }
      const all = loadBookings()
      saveBookings([...all, newBooking])
      return newBooking
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['slots', variables.amenityId, variables.date] })
      queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] })
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
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ bookingId, newSlotId, newDate, newTime }: ReschedulePayload): Promise<Booking> => {
      const all = loadBookings()
      const idx = all.findIndex((b) => b.id === bookingId)
      if (idx === -1) throw new Error('Booking not found')
      all[idx] = { ...all[idx], slotId: newSlotId, date: newDate, time: newTime }
      saveBookings(all)
      return all[idx]
    },
    onSuccess: (_, { amenityId, newDate }) => {
      queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['slots', amenityId, newDate] })
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
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (bookingId: string): Promise<Booking> => {
      const all = loadBookings()
      const idx = all.findIndex((b) => b.id === bookingId)
      if (idx === -1) throw new Error('Booking not found')
      all[idx] = { ...all[idx], status: 'cancelled' }
      saveBookings(all)
      return all[idx]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] })
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
