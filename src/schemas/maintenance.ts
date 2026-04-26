import { z } from 'zod'

export const ISSUE_TYPES = [
  { value: 'plumbing',    label: 'Plumbing',        icon: '🚿' },
  { value: 'electrical',  label: 'Electrical',       icon: '⚡' },
  { value: 'hvac',        label: 'AC / Heating',     icon: '❄️' },
  { value: 'appliances',  label: 'Appliances',       icon: '🍳' },
  { value: 'doors',       label: 'Doors & Windows',  icon: '🚪' },
  { value: 'pest',        label: 'Pest Control',     icon: '🐛' },
  { value: 'cleaning',    label: 'Cleaning',         icon: '🧹' },
  { value: 'other',       label: 'Other',            icon: '🔧' },
] as const

export const LOCATIONS = [
  { value: 'kitchen',        label: 'Kitchen' },
  { value: 'bathroom',       label: 'Bathroom' },
  { value: 'bedroom',        label: 'Bedroom' },
  { value: 'living_room',    label: 'Living Room' },
  { value: 'balcony',        label: 'Balcony' },
  { value: 'hallway',        label: 'Hallway' },
  { value: 'common_area',    label: 'Common Area' },
  { value: 'parking',        label: 'Parking' },
] as const

export const PRIORITIES = [
  { value: 'low',    label: 'Low',    description: 'Convenient fix, no rush',    color: '#16a34a', bg: '#f0fdf4' },
  { value: 'medium', label: 'Medium', description: 'Affects daily comfort',       color: '#d97706', bg: '#fffbeb' },
  { value: 'high',   label: 'High',   description: 'Needs attention soon',        color: '#ea580c', bg: '#fff7ed' },
  { value: 'urgent', label: 'Urgent', description: 'Safety risk or water damage', color: '#dc2626', bg: '#fef2f2' },
] as const

export type IssueType  = (typeof ISSUE_TYPES)[number]['value']
export type Location   = (typeof LOCATIONS)[number]['value']
export type Priority   = (typeof PRIORITIES)[number]['value']

export const maintenanceSchema = z.object({
  issueType:   z.enum(ISSUE_TYPES.map((t) => t.value)  as [IssueType, ...IssueType[]],  { error: 'Select an issue type' }),
  location:    z.enum(LOCATIONS.map((l) => l.value)     as [Location, ...Location[]],    { error: 'Select a location' }),
  priority:    z.enum(PRIORITIES.map((p) => p.value)    as [Priority, ...Priority[]],    { error: 'Select a priority' }),
  title:       z.string().trim().min(4, 'Title must be at least 4 characters').max(100),
  description: z.string().trim().min(10, 'Please describe the issue in at least 10 characters').max(1000),
  preferredTime: z.enum(['morning', 'afternoon', 'evening', 'any'] as const, { error: 'Select a preferred time' }),
})

export type MaintenanceFormValues = z.infer<typeof maintenanceSchema>
