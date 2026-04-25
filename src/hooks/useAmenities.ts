import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type Amenity = {
  id: string
  title: string
  description: string
  image: string
  badge: string
  badgeVariant: 'open' | 'limited' | 'booked'
  categories: string[]
  rating: string
  location: string
  reviewCount: number
  capacityLabel: string
  featured: boolean
  bookPath: string | null
  footerInfo: string
  footerInfoMuted: boolean
}

export function useAmenities(category?: string) {
  return useQuery({
    queryKey: ['amenities', category ?? 'all'],
    queryFn: async () => {
      const all = await api.get<Amenity[]>('/amenities')
      if (!category || category === 'all') return all
      return all.filter((a) => a.categories.includes(category))
    },
  })
}

export function useAmenity(id: string) {
  return useQuery({
    queryKey: ['amenities', id],
    queryFn: () => api.get<Amenity>(`/amenities/${id}`),
    enabled: !!id,
  })
}
