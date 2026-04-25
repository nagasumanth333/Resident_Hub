import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowRight,
  Lock,
  ShieldCheck,
  User,
} from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { loginSchema, type LoginFormValues } from '@/schemas/login'

const TEAL = '#0E5E6F'
const INPUT_BG = '#F3F4F6'

const HERO_IMAGE =
  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      residentId: '',
      password: '',
      remember: false,
    },
  })

  function onValid() {
    toast.success(t('login.welcomeBack'), {
      description: t('login.signedIn'),
    })
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F4F6] p-4 sm:p-6">
      <div
        className={cn(
          'grid w-full max-w-[960px] overflow-hidden rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]',
          'md:grid-cols-2 md:min-h-[560px]',
        )}
      >
        {/* Left: branding */}
        <div className="relative hidden min-h-[280px] md:block">
          <img
            src={HERO_IMAGE}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${TEAL}cc 0%, ${TEAL}e6 50%, ${TEAL}f2 100%)`,
            }}
          />
          <div className="relative flex h-full min-h-[560px] flex-col justify-between p-8 text-white lg:p-10">
            <Logo size="md" asLink={false} variant="on-color" />
            <div className="max-w-md space-y-4">
              <h1 className="text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
                Elevate Your Living Experience.
              </h1>
              <p className="text-sm leading-relaxed text-white/90 lg:text-base">
                Welcome back to your private digital concierge. Manage your
                sanctuary with effortless precision.
              </p>
            </div>
            <div
              className="inline-flex max-w-sm items-start gap-3 rounded-full border border-white/20 bg-black/15 px-4 py-3 backdrop-blur-sm"
              style={{ backgroundColor: `${TEAL}66` }}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                <ShieldCheck className="size-5 text-white" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">Secure Community Access</p>
                <p className="text-xs text-white/85">Verified Resident Portal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="mx-auto w-full max-w-md space-y-8">
            <div className="md:hidden">
              <Logo size="md" asLink={false} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-[#1F2937] sm:text-3xl">
                {t('login.title')}
              </h2>
              <p className="text-sm text-[#6B7280]">
                {t('login.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit(onValid)} className="space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="resident-id" className="text-[#374151]">
                  {t('login.residentId')}
                </Label>
                <div className="relative">
                  <User
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]"
                    aria-hidden
                  />
                  <Input
                    id="resident-id"
                    type="text"
                    autoComplete="username"
                    placeholder={t('login.residentIdPlaceholder')}
                    aria-invalid={!!errors.residentId}
                    className={cn(
                      'h-11 border-0 pl-10 text-[#1F2937] placeholder:text-[#9CA3AF]',
                      errors.residentId &&
                        'ring-2 ring-destructive/40 focus-visible:ring-destructive/50',
                    )}
                    style={{ backgroundColor: INPUT_BG }}
                    {...register('residentId')}
                  />
                </div>
                {errors.residentId ? (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.residentId.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="password" className="text-[#374151]">
                    {t('login.password')}
                  </Label>
                  <button
                    type="button"
                    className="text-[10px] font-bold tracking-wide uppercase hover:underline"
                    style={{ color: TEAL }}
                  >
                    {t('login.forgotPassword')}
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]"
                    aria-hidden
                  />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    aria-invalid={!!errors.password}
                    className={cn(
                      'h-11 border-0 pl-10 text-[#1F2937] placeholder:text-[#9CA3AF]',
                      errors.password &&
                        'ring-2 ring-destructive/40 focus-visible:ring-destructive/50',
                    )}
                    style={{ backgroundColor: INPUT_BG }}
                    {...register('password')}
                  />
                </div>
                {errors.password ? (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <Controller
                  name="remember"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="remember"
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                      ref={field.ref}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                <Label
                  htmlFor="remember"
                  className="cursor-pointer text-sm font-normal text-[#6B7280]"
                >
                  {t('login.remember')}
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full text-base font-bold text-white shadow-sm"
                style={{ backgroundColor: TEAL }}
              >
                {t('login.signIn')}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <span className="w-full border-t border-[#E5E7EB]" />
              </div>
              <div className="relative flex justify-center text-[10px] font-semibold tracking-[0.15em] text-[#9CA3AF] uppercase">
                <span className="bg-white px-3">{t('login.newResident')}</span>
              </div>
            </div>

            <div className="text-center">
              <a
                href="mailto:concierge@residenthub.com"
                className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                style={{ color: TEAL }}
              >
                {t('login.contactConcierge')}
                <ArrowRight className="size-4" aria-hidden />
              </a>
            </div>

            <footer className="space-y-2 border-t border-transparent pt-2 text-center text-[11px] text-[#9CA3AF]">
              <p>{t('login.copyright')}</p>
              <p className="flex flex-wrap items-center justify-center gap-2">
                <button type="button" className="hover:underline">
                  {t('login.privacy')}
                </button>
                <span aria-hidden>·</span>
                <button type="button" className="hover:underline">
                  {t('login.terms')}
                </button>
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}
