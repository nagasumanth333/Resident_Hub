import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

const USER_ID = 'user-001'

export type User = {
  id: string
  name: string
  email: string
  phone: string
  residentId: string
}

export type UpdateUserPayload = Pick<User, 'name' | 'email' | 'phone'>

export function useUser() {
  return useQuery({
    queryKey: ['user', USER_ID],
    queryFn: () => api.get<User>(`/users/${USER_ID}`),
    staleTime: 60_000,
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) =>
      api.patch<User>(`/users/${USER_ID}`, payload),
    onSuccess: (updated) => {
      // Update the cache immediately — no refetch needed
      queryClient.setQueryData(['user', USER_ID], updated)
    },
  })
}
