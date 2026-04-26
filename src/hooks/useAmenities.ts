import { useMemo } from 'react'
import { AMENITIES, getAmenity } from '@/data/amenities'
export type { Amenity } from '@/data/amenities'

export function useAmenities(category?: string) {
  const data = useMemo(() => {
    if (!category || category === 'all') return AMENITIES
    return AMENITIES.filter((a) => a.categories.includes(category))
  }, [category])

  return { data, isLoading: false, error: null }
}

export function useAmenity(id: string) {
  const data = useMemo(() => getAmenity(id), [id])
  return { data, isLoading: false, error: null }
}
