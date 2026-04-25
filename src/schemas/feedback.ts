import { z } from 'zod'

export const FEEDBACK_CATEGORIES = [
  { value: 'amenities', label: 'Amenities' },
  { value: 'staff', label: 'Staff & Service' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'cleanliness', label: 'Cleanliness' },
  { value: 'noise', label: 'Noise & Disturbance' },
  { value: 'general', label: 'General' },
] as const

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]['value']

export const feedbackSchema = z.object({
  category: z.enum(
    FEEDBACK_CATEGORIES.map((c) => c.value) as [FeedbackCategory, ...FeedbackCategory[]],
    { required_error: 'Please select a category' },
  ),
  amenityId: z.string().optional(),
  rating: z
    .number({ required_error: 'Please select a rating' })
    .int()
    .min(1, 'Please select a rating')
    .max(5),
  subject: z.string().trim().min(4, 'Subject must be at least 4 characters').max(100),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(1000),
})

export type FeedbackFormValues = z.infer<typeof feedbackSchema>
