import { zodResolver } from '@hookform/resolvers/zod'
import {
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronRight,
  IdCard,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Shield,
  Smartphone,
  Star,
  Trophy,
  User,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useUser, useUpdateUser, type User as UserType } from '@/hooks/useUser'
import { profileSchema, type ProfileFormValues } from '@/schemas/profile'
import { cn, getInitials } from '@/lib/utils'

const TEAL = '#004D57'
const INPUT_BG = '#F3F4F6'

const INITIAL_USER = {
  name: 'Julian Ashworth',
  initials: 'JA',
  email: 'julian@residenthub.com',
  phone: '+1 (555) 234-8901',
  residentId: 'resident.042',
  unit: 'Unit 4B',
  tower: 'Tower A',
  floor: '14th Floor',
  moveInDate: 'March 15, 2022',
  leaseExpiry: 'March 14, 2027',
  leaseType: 'Long-Term Residential',
  parkingSlot: 'B-042',
  totalBookings: 19,
  completedBookings: 14,
  cancelledBookings: 4,
  favoriteAmenity: 'Swimming Pool',
  memberSince: '2022',
}

const STATS = [
  { label: 'Total Bookings', value: '19',  icon: BookOpen,    color: 'text-sky-600'     },
  { label: 'Completed',      value: '14',  icon: Trophy,      color: 'text-emerald-600' },
  { label: 'Cancelled',      value: '4',   icon: CalendarDays,color: 'text-amber-600'   },
  { label: 'Member Since',   value: "'22", icon: Star,        color: 'text-violet-600'  },
]

/* ── Toggle row ── */
interface ToggleRowProps {
  icon: typeof Bell
  label: string
  description: string
  defaultOn?: boolean
}

function ToggleRow({ icon: Icon, label, description, defaultOn = true }: ToggleRowProps) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${TEAL}12` }}>
          <Icon className="size-4" style={{ color: TEAL }} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={`${label} ${on ? 'on' : 'off'}`}
        onClick={() => setOn((v) => !v)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          on ? 'bg-[color:var(--primary)]' : 'bg-muted',
        )}
      >
        <span className={cn(
          'pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
          on ? 'translate-x-5' : 'translate-x-0',
        )} />
      </button>
    </div>
  )
}

/* ── Info row (view mode) ── */
interface InfoRowProps {
  icon: typeof User
  label: string
  value: string
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${TEAL}12` }}>
        <Icon className="size-4" style={{ color: TEAL }} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground break-all">{value}</p>
      </div>
    </div>
  )
}

/* ── Field row (edit mode) ── */
interface FieldRowProps {
  icon: typeof User
  label: string
  id: string
  error?: string
  children: React.ReactNode
}

function FieldRow({ icon: Icon, label, id, error, children }: FieldRowProps) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl mt-6" style={{ backgroundColor: `${TEAL}12` }}>
        <Icon className="size-4" style={{ color: TEAL }} aria-hidden="true" />
      </div>
      <div className="flex-1 space-y-1.5">
        <Label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </Label>
        {children}
        {error && (
          <p className="text-xs text-destructive" role="alert">{error}</p>
        )}
      </div>
    </div>
  )
}

/* ── Action row ── */
interface ActionRowProps {
  icon: typeof KeyRound
  label: string
  description: string
  danger?: boolean
  onClick?: () => void
}

function ActionRow({ icon: Icon, label, description, danger = false, onClick }: ActionRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-1 py-3.5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        danger && 'hover:bg-destructive/5',
      )}
    >
      <div
        className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', danger ? 'bg-destructive/10' : '')}
        style={!danger ? { backgroundColor: `${TEAL}12` } : undefined}
      >
        <Icon className="size-4" style={{ color: danger ? undefined : TEAL }} aria-hidden="true" />
      </div>
      <div className="flex-1">
        <p className={cn('text-sm font-semibold', danger ? 'text-destructive' : 'text-foreground')}>{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
    </button>
  )
}

/* ── Personal info card with edit flow ── */
function PersonalInfoCard({ user }: { user: UserType }) {
  const [isEditing, setIsEditing] = useState(false)
  const updateUser = useUpdateUser()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, email: user.email, phone: user.phone },
  })

  function onEdit() {
    reset({ name: user.name, email: user.email, phone: user.phone })
    setIsEditing(true)
  }

  function onCancel() {
    reset({ name: user.name, email: user.email, phone: user.phone })
    setIsEditing(false)
  }

  async function onSubmit(values: ProfileFormValues) {
    try {
      await updateUser.mutateAsync(values)
      setIsEditing(false)
      toast.success('Profile updated', {
        description: 'Your personal information has been saved.',
      })
    } catch {
      toast.error('Update failed', {
        description: 'Could not save your changes. Please try again.',
      })
    }
  }

  return (
    <Card className="rounded-2xl border shadow-sm py-0 gap-0">
      <CardContent className="p-6">
        {/* Card header */}
        <div className="mb-1 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-foreground">Personal Information</h3>
            {isEditing && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Changes are saved to your profile immediately.
              </p>
            )}
          </div>

          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 gap-1.5 text-xs font-semibold"
              style={{ color: TEAL }}
              aria-label="Edit personal information"
            >
              <Pencil className="size-3" aria-hidden="true" />
              Edit
            </Button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="cursor-pointer rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Cancel editing"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <Separator className="mb-1" />

        {/* ── View mode ── */}
        {!isEditing && (
          <>
            <InfoRow icon={User}   label="Full Name"     value={user.name} />
            <Separator />
            <InfoRow icon={Mail}   label="Email Address" value={user.email} />
            <Separator />
            <InfoRow icon={Phone}  label="Phone Number"  value={user.phone} />
            <Separator />
            <InfoRow
              icon={MapPin}
              label="Unit Address"
              value={`${INITIAL_USER.unit}, ${INITIAL_USER.tower}, ${INITIAL_USER.floor} — Grandview Terrace Estate`}
            />
          </>
        )}

        {/* ── Edit mode ── */}
        {isEditing && (
          <form
            id="profile-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-label="Edit personal information"
          >
            <FieldRow icon={User} label="Full Name" id="name" error={errors.name?.message}>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                autoFocus
                placeholder="Your full name"
                aria-invalid={!!errors.name}
                className={cn(
                  'h-10 border-0 text-sm',
                  errors.name && 'ring-2 ring-destructive/40 focus-visible:ring-destructive/50',
                )}
                style={{ backgroundColor: INPUT_BG }}
                {...register('name')}
              />
            </FieldRow>

            <Separator />

            <FieldRow icon={Mail} label="Email Address" id="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                className={cn(
                  'h-10 border-0 text-sm',
                  errors.email && 'ring-2 ring-destructive/40 focus-visible:ring-destructive/50',
                )}
                style={{ backgroundColor: INPUT_BG }}
                {...register('email')}
              />
            </FieldRow>

            <Separator />

            <FieldRow icon={Phone} label="Phone Number" id="phone" error={errors.phone?.message}>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 (555) 000-0000"
                aria-invalid={!!errors.phone}
                className={cn(
                  'h-10 border-0 text-sm',
                  errors.phone && 'ring-2 ring-destructive/40 focus-visible:ring-destructive/50',
                )}
                style={{ backgroundColor: INPUT_BG }}
                {...register('phone')}
              />
            </FieldRow>

            <Separator />

            {/* Unit address — always read-only */}
            <InfoRow
              icon={MapPin}
              label="Unit Address"
              value={`${INITIAL_USER.unit}, ${INITIAL_USER.tower}, ${INITIAL_USER.floor} — Grandview Terrace Estate`}
            />

            {/* Form actions */}
            <div className="mt-5 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting}
                className="h-9 px-4 text-sm font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="h-9 min-w-[120px] gap-2 text-sm font-bold text-white"
                style={{ backgroundColor: TEAL }}
              >
                {isSubmitting || updateUser.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Saving…
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

/* ── Page ── */
export function ProfilePage() {
  const { data: user, isLoading } = useUser()

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Page heading */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: TEAL }}>
          My Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information, preferences and account settings.
        </p>
      </header>

      {/* Hero card */}
      <Card className="overflow-hidden rounded-2xl border shadow-sm py-0 gap-0">
        <div
          className="h-28 sm:h-36"
          style={{ background: `linear-gradient(135deg, ${TEAL} 0%, #0a8a9f 50%, #12b5cc 100%)` }}
          aria-hidden="true"
        />
        <CardContent className="px-6 pb-6 pt-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="-mt-12 flex items-end gap-4">
              <Avatar
                className="size-24 border-4 border-background shadow-lg"
                style={{ backgroundColor: TEAL, color: 'white' }}
              >
                <AvatarFallback className="bg-transparent text-2xl font-black text-white">
                  {user ? getInitials(user.name) : INITIAL_USER.initials}
                </AvatarFallback>
              </Avatar>
              <div className="mb-1">
                <h2 className="text-xl font-bold text-foreground">{user?.name ?? INITIAL_USER.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {INITIAL_USER.unit} · {INITIAL_USER.tower} · {INITIAL_USER.floor}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:mb-1">
              <Badge
                className="border-0 px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: `${TEAL}18`, color: TEAL }}
              >
                Verified Resident
              </Badge>
              <Badge className="border-0 bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-800">
                Active Lease
              </Badge>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <IdCard className="size-4 shrink-0" aria-hidden="true" />
              <span className="font-mono font-semibold text-foreground">{user?.residentId ?? INITIAL_USER.residentId}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
              Member since {INITIAL_USER.memberSince}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              Parking Slot {INITIAL_USER.parkingSlot}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="rounded-2xl border shadow-sm py-0 gap-0">
            <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${TEAL}10` }}>
                <Icon className={cn('size-5', color)} aria-hidden="true" />
              </div>
              <span className="text-2xl font-black" style={{ color: TEAL }}>{value}</span>
              <span className="text-xs font-semibold text-muted-foreground">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Personal information — has its own edit state */}
        {isLoading || !user ? (
          <Card className="rounded-2xl border shadow-sm py-0 gap-0">
            <CardContent className="p-6 space-y-5" aria-busy="true" aria-label="Loading personal information">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2.5 w-20 rounded bg-muted animate-pulse" />
                    <div className="h-3.5 w-40 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <PersonalInfoCard user={user} />
        )}

        {/* Membership details */}
        <Card className="rounded-2xl border shadow-sm py-0 gap-0">
          <CardContent className="p-6">
            <h3 className="mb-1 font-bold text-foreground">Membership Details</h3>
            <Separator className="mb-1" />
            <InfoRow icon={IdCard}       label="Resident ID"    value={user?.residentId ?? INITIAL_USER.residentId} />
            <Separator />
            <InfoRow icon={Building2}    label="Unit & Tower"   value={`${INITIAL_USER.unit}, ${INITIAL_USER.tower}`} />
            <Separator />
            <InfoRow icon={CalendarDays} label="Move-in Date"   value={INITIAL_USER.moveInDate} />
            <Separator />
            <InfoRow icon={CalendarDays} label="Lease Expiry"   value={INITIAL_USER.leaseExpiry} />
            <Separator />
            <InfoRow icon={BookOpen}     label="Lease Type"     value={INITIAL_USER.leaseType} />
          </CardContent>
        </Card>

        {/* Notification preferences */}
        <Card className="rounded-2xl border shadow-sm py-0 gap-0">
          <CardContent className="p-6">
            <h3 className="mb-1 font-bold text-foreground">Notification Preferences</h3>
            <p className="mb-2 text-xs text-muted-foreground">
              Choose how you'd like to receive booking and community updates.
            </p>
            <Separator className="mb-1" />
            <ToggleRow icon={Mail}         label="Email Notifications" description="Booking confirmations and community news" defaultOn={true} />
            <Separator />
            <ToggleRow icon={Smartphone}   label="SMS Alerts"          description="Time-sensitive slot and cancellation alerts" defaultOn={true} />
            <Separator />
            <ToggleRow icon={Bell}         label="Push Notifications"  description="In-app alerts for upcoming bookings" defaultOn={false} />
            <Separator />
            <ToggleRow icon={MessageSquare} label="Community Updates"  description="Building notices and resident circulars" defaultOn={true} />
          </CardContent>
        </Card>

        {/* Account & security */}
        <Card className="rounded-2xl border shadow-sm py-0 gap-0">
          <CardContent className="p-6">
            <h3 className="mb-1 font-bold text-foreground">Account & Security</h3>
            <p className="mb-2 text-xs text-muted-foreground">
              Manage your password and account access.
            </p>
            <Separator className="mb-1" />
            <ActionRow icon={KeyRound}     label="Change Password"             description="Update your login credentials" />
            <Separator />
            <ActionRow icon={Shield}       label="Two-Factor Authentication"   description="Add an extra layer of security" />
            <Separator />
            <ActionRow icon={BookOpen}     label="Booking History"             description="View all past bookings and receipts" />
            <Separator />
            <Link to="/bookings" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
              <ActionRow icon={CalendarDays} label="My Bookings" description="View and manage upcoming reservations" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Favourite amenity highlight */}
      <Card
        className="rounded-2xl border-0 shadow-sm py-0 gap-0 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${TEAL} 0%, #0a8a9f 100%)` }}
      >
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Star className="size-6 fill-white text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">Most Booked Amenity</p>
              <p className="text-xl font-black text-white">{INITIAL_USER.favoriteAmenity}</p>
              <p className="text-sm text-white/75">{INITIAL_USER.completedBookings} completed sessions</p>
            </div>
          </div>
          <Button asChild className="shrink-0 bg-white font-bold hover:bg-white/90" style={{ color: TEAL }}>
            <Link to="/amenities">Browse Amenities</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
