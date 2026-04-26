import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Building2, CheckCircle2, Loader2, MessageSquare, Send, Star, X } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Logo } from '@/components/Logo'
import { useAmenities } from '@/hooks/useAmenities'
import { cn } from '@/lib/utils'
import {
  FEEDBACK_CATEGORIES,
  feedbackSchema,
  type FeedbackFormValues,
} from '@/schemas/feedback'

const TEAL = '#004D57'

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

export function FeedbackPage() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const { data: amenities = [], isLoading: amenitiesLoading } = useAmenities()

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { rating: 0, amenityId: undefined },
  })

  const selectedCategory = watch('category')
  const selectedRating = watch('rating')
  const selectedAmenityId = watch('amenityId')
  const selectedAmenity = amenities.find((a) => a.id === selectedAmenityId)

  const onSubmit = async (_values: FeedbackFormValues) => {
    // Simulate API call — replace with real endpoint when available
    await new Promise((r) => setTimeout(r, 900))
    setSubmitted(true)
    toast.success('Feedback submitted — thank you!')
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
                Thank you!
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Your feedback has been received. Our team reviews every submission and will follow
                up if any action is needed.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              <Button
                className="w-full"
                style={{ backgroundColor: TEAL }}
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setSubmitted(false)}>
                Submit Another
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

      {/* Page hero strip */}
      <div className="border-b" style={{ backgroundColor: `${TEAL}08` }}>
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-7 sm:px-6">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${TEAL}18` }}
          >
            <MessageSquare className="size-5" style={{ color: TEAL }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: TEAL }}>
              Share Your Feedback
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Help us improve your estate experience.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-7">

          {/* ── CATEGORY ── */}
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-semibold text-foreground">
              Category <span className="text-destructive" aria-hidden="true">*</span>
            </legend>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup">
                  {FEEDBACK_CATEGORIES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={field.value === value}
                      onClick={() => field.onChange(value)}
                      className={cn(
                        'rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        field.value === value
                          ? 'border-transparent text-white shadow-sm'
                          : 'border-border bg-card text-foreground hover:border-border/60 hover:bg-muted/50',
                      )}
                      style={field.value === value ? { backgroundColor: TEAL } : undefined}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.category && (
              <p className="text-xs text-destructive" role="alert">
                {errors.category.message}
              </p>
            )}
          </fieldset>

          {/* ── AMENITY ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                Related Amenity
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">(optional)</span>
              </Label>
              {selectedAmenityId && (
                <button
                  type="button"
                  onClick={() => setValue('amenityId', undefined)}
                  className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  aria-label="Clear amenity selection"
                >
                  <X className="size-3" aria-hidden="true" />
                  Clear
                </button>
              )}
            </div>

            {/* Selected amenity pill */}
            {selectedAmenity && (
              <div
                className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
                style={{ borderColor: `${TEAL}40`, backgroundColor: `${TEAL}08` }}
              >
                <img
                  src={selectedAmenity.image}
                  alt={selectedAmenity.title}
                  className="size-9 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold" style={{ color: TEAL }}>
                    {selectedAmenity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedAmenity.location}</p>
                </div>
              </div>
            )}

            <Controller
              name="amenityId"
              control={control}
              render={({ field }) => (
                <div
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                  role="radiogroup"
                  aria-label="Select an amenity"
                >
                  {amenitiesLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-14 animate-pulse rounded-xl bg-muted"
                          aria-hidden="true"
                        />
                      ))
                    : amenities.map((amenity) => {
                        const isSelected = field.value === amenity.id
                        return (
                          <button
                            key={amenity.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() =>
                              field.onChange(isSelected ? undefined : amenity.id)
                            }
                            className={cn(
                              'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                              isSelected
                                ? 'border-transparent text-white shadow-sm'
                                : 'border-border bg-card hover:border-border/60 hover:bg-muted/30',
                            )}
                            style={isSelected ? { backgroundColor: TEAL } : undefined}
                          >
                            <img
                              src={amenity.image}
                              alt=""
                              aria-hidden="true"
                              className={cn(
                                'size-8 shrink-0 rounded-lg object-cover',
                                isSelected && 'ring-2 ring-white/40',
                              )}
                            />
                            <div className="min-w-0 flex-1">
                              <p
                                className={cn(
                                  'truncate text-sm font-semibold leading-tight',
                                  !isSelected && 'text-foreground',
                                )}
                              >
                                {amenity.title}
                              </p>
                              <p
                                className={cn(
                                  'text-[11px]',
                                  isSelected ? 'text-white/70' : 'text-muted-foreground',
                                )}
                              >
                                {amenity.location}
                              </p>
                            </div>
                            {isSelected && (
                              <Building2 className="size-4 shrink-0 text-white/80" aria-hidden="true" />
                            )}
                          </button>
                        )
                      })}
                </div>
              )}
            />
          </div>

          {/* ── STAR RATING ── */}
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-semibold text-foreground">
              Overall Rating <span className="text-destructive" aria-hidden="true">*</span>
            </legend>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <div
                  className="flex items-center gap-1.5"
                  role="radiogroup"
                  aria-label="Star rating"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      role="radio"
                      aria-checked={field.value === star}
                      aria-label={`${star} star${star > 1 ? 's' : ''} — ${STAR_LABELS[star]}`}
                      onClick={() => field.onChange(star)}
                      className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Star
                        className={cn(
                          'size-9 transition-colors duration-100',
                          star <= field.value
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-muted text-border',
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                  {selectedRating > 0 && (
                    <span
                      className="ml-2 text-sm font-semibold"
                      style={{ color: TEAL }}
                      aria-live="polite"
                    >
                      {STAR_LABELS[selectedRating]}
                    </span>
                  )}
                </div>
              )}
            />
            {errors.rating && (
              <p className="text-xs text-destructive" role="alert">
                {errors.rating.message}
              </p>
            )}
          </fieldset>

          {/* ── SUBJECT ── */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="subject" className="text-sm font-semibold">
              Subject <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Input
              id="subject"
              placeholder={
                selectedAmenity
                  ? `e.g. Feedback about ${selectedAmenity.title}`
                  : selectedCategory === 'amenities'
                    ? 'e.g. Pool temperature too cold'
                    : selectedCategory === 'staff'
                      ? 'e.g. Concierge was very helpful'
                      : selectedCategory === 'maintenance'
                        ? 'e.g. Gym equipment needs repair'
                        : 'Brief summary of your feedback'
              }
              aria-invalid={!!errors.subject}
              aria-describedby={errors.subject ? 'subject-error' : undefined}
              className="bg-muted/40 focus-visible:bg-background"
              {...register('subject')}
            />
            {errors.subject && (
              <p id="subject-error" className="text-xs text-destructive" role="alert">
                {errors.subject.message}
              </p>
            )}
          </div>

          {/* ── MESSAGE ── */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="message" className="text-sm font-semibold">
              Message <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Textarea
              id="message"
              rows={5}
              placeholder="Tell us more about your experience — what happened, when, and how we can do better."
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'message-error' : undefined}
              className="resize-none bg-muted/40 focus-visible:bg-background"
              {...register('message')}
            />
            {errors.message && (
              <p id="message-error" className="text-xs text-destructive" role="alert">
                {errors.message.message}
              </p>
            )}
          </div>

          {/* ── SUBMIT ── */}
          <div className="pt-1">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="h-12 w-full gap-2 text-base font-semibold sm:w-auto sm:min-w-[220px]"
              style={{ backgroundColor: TEAL }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="size-4" aria-hidden="true" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Header() {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur-sm px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="cursor-pointer rounded-md p-2 text-[color:var(--primary)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <Logo size="sm" />
      </div>
    </header>
  )
}
