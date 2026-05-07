import { useEffect } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const TEAL = '#0E5E6F'

const HERO_IMAGE =
  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200'

export function LoginPage() {
  const { t } = useTranslation()
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const next = new URLSearchParams(location.search).get('next') || '/'

  useEffect(() => {
    if (user) navigate(next, { replace: true })
  }, [user, navigate, next])

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

        {/* Right: sign-in */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="mx-auto w-full max-w-sm space-y-8">
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

            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={login}
                className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-md border border-[#DADCE0] bg-white px-4 py-2.5 text-sm font-medium text-[#3C4043] shadow-sm transition hover:bg-[#F8F9FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E5E6F]"
              >
                <GoogleIcon />
                Sign in with Google
              </button>
            </div>

            <footer className="space-y-2 border-t border-[#E5E7EB] pt-4 text-center text-[11px] text-[#9CA3AF]">
              <p>{t('login.copyright')}</p>
              <p className="flex flex-wrap items-center justify-center gap-2">
                <button type="button" className="cursor-pointer hover:underline">
                  {t('login.privacy')}
                </button>
                <span aria-hidden>·</span>
                <button type="button" className="cursor-pointer hover:underline">
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  )
}
