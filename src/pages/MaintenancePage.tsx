import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Send,
  Wrench,
} from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Logo } from '@/components/Logo'
import { useUser } from '@/hooks/useUser'
import { cn } from '@/lib/utils'
import {
  ISSUE_TYPES,
  LOCATIONS,
  PRIORITIES,
  maintenanceSchema,
  type MaintenanceFormValues,
} from '@/schemas/maintenance'

const TEAL = '#004D57'

const PREFERRED_TIMES = [
  { value: 'morning',   label: 'Morning',   sub: '8 AM – 12 PM' },
  { value: 'afternoon', label: 'Afternoon', sub: '12 PM – 5 PM' },
  { value: 'evening',   label: 'Evening',   sub: '5 PM – 8 PM' },
  { value: 'any',       label: 'Any Time',  sub: 'Flexible' },
] as const

export function MaintenancePage() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const { data: user } = useUser()

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
  })

  const selectedPriority = watch('priority')
  const priorityMeta = PRIORITIES.find((p) => p.value === selectedPriority)

  const onSubmit = async (_values: MaintenanceFormValues) => {
    await new Promise((r) => setTimeout(r, 1000))
    setSubmitted(true)
    toast.success('Maintenance request submitted!')
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 py-16">
          <div className="flex max-w-sm flex-col items-center gap-5 text-center">
            <div
              className="flex size-20 items-center justify-center rounded-full"
              style={{ backgroundColor: `${TEAL}18` }}
            >
              <CheckCircle2 className="size-10" style={{ color: TEAL }} />
            </div>
            <div>
              <h1 className="mb-2 text-2xl font-bold" style={{ color: TEAL }}>
                Request Submitted
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Our maintenance team has been notified and will reach out to confirm your appointment
                shortly. You can track the status from your profile.
              </p>
            </div>
            <div
              className="w-full rounded-2xl border px-4 py-3 text-left text-sm"
              style={{ borderColor: `${TEAL}30`, backgroundColor: `${TEAL}08` }}
            >
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Reference
              </p>
              <p className="font-mono font-bold" style={{ color: TEAL }}>
                MNT-{Math.random().toString(36).slice(2, 8).toUpperCase()}
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              <Button className="w-full" style={{ backgroundColor: TEAL }} onClick={() => navigate('/')}>
                Back to Home
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setSubmitted(false)}>
                Submit Another Request
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <Header />

      {/* Hero strip */}
      <div className="border-b" style={{ backgroundColor: '#FEF3C708' }}>
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-7 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100">
              <Wrench className="size-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: TEAL }}>
                Maintenance Request
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Report an issue and we'll schedule a fix.
              </p>
            </div>
          </div>
          {/* Resident info badge */}
          {user && (
            <div
              className="hidden shrink-0 flex-col items-end sm:flex"
              aria-label="Submitting as"
            >
              <p className="text-xs font-semibold" style={{ color: TEAL }}>
                {user.name}
              </p>
              <p className="text-[11px] text-muted-foreground">Unit 4B · Estate Tower</p>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-8">

          {/* ── ISSUE TYPE ── */}
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-semibold text-foreground">
              Issue Type <span className="text-destructive" aria-hidden="true">*</span>
            </legend>
            <Controller
              name="issueType"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup">
                  {ISSUE_TYPES.map(({ value, label, icon }) => {
                    const isSelected = field.value === value
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => field.onChange(value)}
                        className={cn(
                          'flex flex-col items-start gap-2 rounded-xl border px-3 py-3 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isSelected
                            ? 'border-transparent text-white shadow-sm'
                            : 'border-border bg-card hover:bg-muted/50',
                        )}
                        style={isSelected ? { backgroundColor: TEAL } : undefined}
                      >
                        <span className="text-xl leading-none" aria-hidden="true">{icon}</span>
                        <span className={cn('text-xs font-semibold', !isSelected && 'text-foreground')}>
                          {label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            />
            {errors.issueType && (
              <p className="text-xs text-destructive" role="alert">{errors.issueType.message}</p>
            )}
          </fieldset>

          {/* ── LOCATION ── */}
          <fieldset className="flex flex-col gap-3">
            <legend className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <MapPin className="size-3.5 text-muted-foreground" aria-hidden="true" />
              Location in Unit <span className="text-destructive" aria-hidden="true">*</span>
            </legend>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup">
                  {LOCATIONS.map(({ value, label }) => {
                    const isSelected = field.value === value
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => field.onChange(value)}
                        className={cn(
                          'rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isSelected
                            ? 'border-transparent text-white shadow-sm'
                            : 'border-border bg-card text-foreground hover:bg-muted/50',
                        )}
                        style={isSelected ? { backgroundColor: TEAL } : undefined}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              )}
            />
            {errors.location && (
              <p className="text-xs text-destructive" role="alert">{errors.location.message}</p>
            )}
          </fieldset>

          {/* ── PRIORITY ── */}
          <fieldset className="flex flex-col gap-3">
            <legend className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <AlertTriangle className="size-3.5 text-muted-foreground" aria-hidden="true" />
              Priority <span className="text-destructive" aria-hidden="true">*</span>
            </legend>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup">
                  {PRIORITIES.map(({ value, label, description, color, bg }) => {
                    const isSelected = field.value === value
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => field.onChange(value)}
                        className={cn(
                          'flex flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isSelected ? 'shadow-sm' : 'border-border bg-card hover:bg-muted/30',
                        )}
                        style={
                          isSelected
                            ? { borderColor: color, backgroundColor: bg }
                            : undefined
                        }
                      >
                        <span
                          className="text-xs font-bold uppercase tracking-wide"
                          style={{ color: isSelected ? color : undefined }}
                        >
                          {label}
                        </span>
                        <span
                          className={cn(
                            'text-[11px] leading-tight',
                            isSelected ? 'text-foreground/70' : 'text-muted-foreground',
                          )}
                        >
                          {description}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            />
            {/* Urgent warning banner */}
            {selectedPriority === 'urgent' && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3" role="alert">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" aria-hidden="true" />
                <p className="text-xs leading-relaxed text-red-700">
                  For life-threatening emergencies, call our{' '}
                  <span className="font-bold">24/7 Emergency Line</span> immediately. This form is
                  for non-life-threatening urgent issues.
                </p>
              </div>
            )}
            {errors.priority && (
              <p className="text-xs text-destructive" role="alert">{errors.priority.message}</p>
            )}
          </fieldset>

          {/* ── TITLE ── */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="title" className="text-sm font-semibold">
              Issue Title <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Tap leaking under kitchen sink"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
              className="bg-muted/40 focus-visible:bg-background"
              {...register('title')}
            />
            {errors.title && (
              <p id="title-error" className="text-xs text-destructive" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* ── DESCRIPTION ── */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Description <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Describe the issue in detail — when it started, how severe it is, and anything else that might help our team."
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
              className="resize-none bg-muted/40 focus-visible:bg-background"
              {...register('description')}
            />
            {errors.description && (
              <p id="description-error" className="text-xs text-destructive" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* ── PREFERRED TIME ── */}
          <fieldset className="flex flex-col gap-3">
            <legend className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Clock className="size-3.5 text-muted-foreground" aria-hidden="true" />
              Preferred Visit Time <span className="text-destructive" aria-hidden="true">*</span>
            </legend>
            <Controller
              name="preferredTime"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup">
                  {PREFERRED_TIMES.map(({ value, label, sub }) => {
                    const isSelected = field.value === value
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => field.onChange(value)}
                        className={cn(
                          'flex flex-col items-start gap-0.5 rounded-xl border px-3 py-3 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isSelected
                            ? 'border-transparent text-white shadow-sm'
                            : 'border-border bg-card hover:bg-muted/50',
                        )}
                        style={isSelected ? { backgroundColor: TEAL } : undefined}
                      >
                        <span className={cn('text-sm font-semibold', !isSelected && 'text-foreground')}>
                          {label}
                        </span>
                        <span className={cn('text-[11px]', isSelected ? 'text-white/70' : 'text-muted-foreground')}>
                          {sub}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            />
            {errors.preferredTime && (
              <p className="text-xs text-destructive" role="alert">{errors.preferredTime.message}</p>
            )}
          </fieldset>

          {/* ── SUBMIT ── */}
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="h-12 w-full gap-2 text-base font-semibold sm:w-auto sm:min-w-[240px]"
              style={{ backgroundColor: priorityMeta?.color ?? TEAL }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="size-4" aria-hidden="true" />
                  Submit Request
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Our team typically responds within{' '}
              <span className="font-semibold text-foreground">
                {selectedPriority === 'urgent'
                  ? '2 hours'
                  : selectedPriority === 'high'
                    ? '24 hours'
                    : selectedPriority === 'medium'
                      ? '2–3 business days'
                      : '5–7 business days'}
              </span>
              .
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

function Header() {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur-sm px-4 sm:px-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="cursor-pointer rounded-md p-2 text-[color:var(--primary)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Go back"
      >
        <ArrowLeft className="size-5" aria-hidden="true" />
      </button>
      <Logo size="sm" />
    </header>
  )
}
