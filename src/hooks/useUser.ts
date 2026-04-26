import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

export type User = {
  id: string
  name: string
  email: string
  phone: string
  residentId: string
}

export type UpdateUserPayload = Pick<User, 'name' | 'email' | 'phone'>

const STORAGE_KEY = 'user_profiles'

function loadProfile(userId: string): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const profiles = raw ? (JSON.parse(raw) as Record<string, User>) : {}
    return profiles[userId] ?? null
  } catch {
    return null
  }
}

function saveProfile(user: User) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const profiles = raw ? (JSON.parse(raw) as Record<string, User>) : {}
    profiles[user.id] = user
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
  } catch {
    // ignore
  }
}

export function useUser() {
  const { user: authUser } = useAuth()
  return useQuery({
    queryKey: ['user', authUser?.id],
    queryFn: (): User => {
      const saved = loadProfile(authUser!.id)
      if (saved) return saved
      // Seed from Google profile on first load
      const seeded: User = {
        id: authUser!.id,
        name: authUser!.name,
        email: authUser!.email,
        phone: '',
        residentId: 'RES-' + authUser!.id.slice(0, 6).toUpperCase(),
      }
      saveProfile(seeded)
      return seeded
    },
    enabled: !!authUser,
    staleTime: 60_000,
  })
}

export function useUpdateUser() {
  const { user: authUser } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateUserPayload): Promise<User> => {
      const existing = loadProfile(authUser!.id)
      const updated: User = {
        id: authUser!.id,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        residentId: existing?.residentId ?? 'RES-' + authUser!.id.slice(0, 6).toUpperCase(),
      }
      saveProfile(updated)
      return updated
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['user', authUser?.id], updated)
      toast.success('Profile updated')
    },
    onError: () => {
      toast.error('Could not update profile')
    },
  })
}
