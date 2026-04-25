import { z } from 'zod'

const emailOrResidentId = z
  .string()
  .trim()
  .min(1, 'Enter your resident ID or email')
  .refine(
    (val) => {
      const parsed = z.string().email().safeParse(val)
      if (parsed.success) return true
      return /^resident\.[\w.-]+$/i.test(val)
    },
    { message: 'Enter a valid email or resident ID (e.g. resident.042)' },
  )

export const loginSchema = z.object({
  residentId: emailOrResidentId,
  password: z
    .string()
    .min(1, 'Enter your password')
    .min(8, 'Password must be at least 8 characters'),
  remember: z.boolean(),
})

export type LoginFormValues = z.infer<typeof loginSchema>
