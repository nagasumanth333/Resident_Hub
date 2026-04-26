import { Bell, BookOpen, ChevronDown, LogOut, Mail, MapPin, Moon, Phone, Sun, User } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useTheme, type Theme } from '@/contexts/ThemeContext'
import { Logo } from '@/components/Logo'
import { useUser } from '@/hooks/useUser'
import { cn, getInitials } from '@/lib/utils'

const teal = '#004D57'

const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇺🇸' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'hi', label: 'हिन्दी',   flag: '🇮🇳' },
  { code: 'ja', label: '日本語',    flag: '🇯🇵' },
]

const THEMES: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', icon: Sun  },
  { id: 'dark',  label: 'Dark',  icon: Moon },
]

/* ── Shared hook: click-outside + Escape close ── */
function useDropdown() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [open])

  return { open, setOpen, containerRef, triggerRef }
}

function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const { open, setOpen, containerRef, triggerRef } = useDropdown()
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0]

  // Move focus to first item whenever the menu opens
  useEffect(() => {
    if (open) {
      // rAF ensures the DOM is rendered before we try to focus
      requestAnimationFrame(() => itemRefs.current[0]?.focus())
    }
  }, [open])

  function handleTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(true)
    }
    if (e.key === 'Escape') setOpen(false)
  }

  function handleItemKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key === 'Escape') {
      setOpen(false)
      triggerRef.current?.focus()
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      itemRefs.current[Math.min(index + 1, LANGUAGES.length - 1)]?.focus()
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (index === 0) {
        setOpen(false)
        triggerRef.current?.focus()
      } else {
        itemRefs.current[index - 1]?.focus()
      }
    }
    if (e.key === 'Home') { e.preventDefault(); itemRefs.current[0]?.focus() }
    if (e.key === 'End')  { e.preventDefault(); itemRefs.current[LANGUAGES.length - 1]?.focus() }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleTriggerKeyDown}
        className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-transparent px-2.5 text-sm font-semibold transition-colors hover:border-border hover:bg-muted/60 text-[color:var(--primary)]"
        aria-label={`Switch language, current: ${current.label}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="text-base leading-none" aria-hidden="true">{current.flag}</span>
        <span className="text-xs uppercase tracking-wide" aria-hidden="true">{current.code}</span>
        <ChevronDown
          className={cn('size-3.5 transition-transform duration-150', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="menu"
          aria-label="Language options"
          className="absolute right-0 top-full z-50 mt-1.5 w-36 overflow-hidden rounded-xl border bg-popover shadow-lg list-none p-0 m-0"
        >
          {LANGUAGES.map((lang, index) => (
            <li key={lang.code} role="none">
              <button
                ref={(el) => { itemRefs.current[index] = el }}
                role="menuitemradio"
                aria-checked={lang.code === i18n.language}
                tabIndex={-1}
                type="button"
                onKeyDown={(e) => handleItemKeyDown(e, index)}
                onClick={() => {
                  i18n.changeLanguage(lang.code)
                  setOpen(false)
                  triggerRef.current?.focus()
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-left text-sm text-popover-foreground transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none',
                  lang.code === i18n.language && 'font-bold',
                )}
              >
                <span className="text-base" aria-hidden="true">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { open, setOpen, containerRef, triggerRef } = useDropdown()
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0]
  const CurrentIcon = current.icon

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => itemRefs.current[0]?.focus())
    }
  }, [open])

  function handleTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(true)
    }
    if (e.key === 'Escape') setOpen(false)
  }

  function handleItemKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key === 'Escape') {
      setOpen(false)
      triggerRef.current?.focus()
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      itemRefs.current[Math.min(index + 1, THEMES.length - 1)]?.focus()
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (index === 0) {
        setOpen(false)
        triggerRef.current?.focus()
      } else {
        itemRefs.current[index - 1]?.focus()
      }
    }
    if (e.key === 'Home') { e.preventDefault(); itemRefs.current[0]?.focus() }
    if (e.key === 'End')  { e.preventDefault(); itemRefs.current[THEMES.length - 1]?.focus() }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleTriggerKeyDown}
        className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-transparent px-2.5 text-sm font-semibold transition-colors hover:border-border hover:bg-muted/60 text-[color:var(--primary)]"
        aria-label={`Switch theme, current: ${current.label}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <CurrentIcon className="size-4" aria-hidden="true" />
        <ChevronDown
          className={cn('size-3.5 transition-transform duration-150', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="menu"
          aria-label="Theme options"
          className="absolute right-0 top-full z-50 mt-1.5 w-36 overflow-hidden rounded-xl border bg-popover shadow-lg list-none p-0 m-0"
        >
          {THEMES.map(({ id, label, icon: Icon }, index) => (
            <li key={id} role="none">
              <button
                ref={(el) => { itemRefs.current[index] = el }}
                role="menuitemradio"
                aria-checked={id === theme}
                tabIndex={-1}
                type="button"
                onKeyDown={(e) => handleItemKeyDown(e, index)}
                onClick={() => {
                  setTheme(id)
                  setOpen(false)
                  triggerRef.current?.focus()
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-left text-sm text-popover-foreground transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none',
                  id === theme && 'font-bold',
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span>{label}</span>
                {id === theme && (
                  <span className="ml-auto size-1.5 rounded-full bg-[color:var(--primary)]" aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ProfileDropdown() {
  const navigate = useNavigate()
  const { open, setOpen, containerRef, triggerRef } = useDropdown()
  const itemRefs = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([])
  const { data: user } = useUser()
  const displayName = user?.name ?? 'Julian Ashworth'
  const residentId = user?.residentId ?? 'resident.042'
  const initials = getInitials(displayName)
  const firstInitial = initials[0] ?? 'J'

  useEffect(() => {
    if (open) requestAnimationFrame(() => itemRefs.current[0]?.focus())
  }, [open])

  function handleTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(true)
    }
    if (e.key === 'Escape') setOpen(false)
  }

  function handleItemKeyDown(e: KeyboardEvent<HTMLButtonElement | HTMLAnchorElement>, index: number, total: number) {
    if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus() }
    if (e.key === 'ArrowDown') { e.preventDefault(); itemRefs.current[Math.min(index + 1, total - 1)]?.focus() }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (index === 0) { setOpen(false); triggerRef.current?.focus() }
      else itemRefs.current[index - 1]?.focus()
    }
  }

  const MENU_ITEMS = [
    { icon: User,     label: 'View Profile',  action: () => { navigate('/profile'); setOpen(false) } },
    { icon: BookOpen, label: 'My Bookings',   action: () => { navigate('/bookings'); setOpen(false) } },
  ]

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleTriggerKeyDown}
        aria-label="Open profile menu"
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex cursor-pointer items-center gap-1.5 rounded-xl p-0.5 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar
          className="size-9"
          style={{ backgroundColor: `${teal}18`, color: teal }}
        >
          <AvatarFallback className="bg-transparent text-sm font-bold">{firstInitial}</AvatarFallback>
        </Avatar>
        <ChevronDown
          className={cn('size-3.5 text-muted-foreground transition-transform duration-150', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Profile menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border bg-popover shadow-xl"
        >
          {/* User card */}
          <div className="px-4 py-3.5" style={{ backgroundColor: `${teal}08` }}>
            <div className="flex items-center gap-3">
              <Avatar className="size-10" style={{ backgroundColor: teal, color: 'white' }}>
                <AvatarFallback className="bg-transparent text-sm font-black text-white">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground font-mono">{residentId}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Menu items */}
          <div className="py-1">
            {MENU_ITEMS.map(({ icon: Icon, label, action }, index) => (
              <button
                key={label}
                ref={(el) => { itemRefs.current[index] = el }}
                role="menuitem"
                tabIndex={-1}
                type="button"
                onClick={action}
                onKeyDown={(e) => handleItemKeyDown(e, index, MENU_ITEMS.length + 1)}
                className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm text-popover-foreground transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none"
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          <Separator />

          {/* Sign out */}
          <div className="py-1">
            <button
              ref={(el) => { itemRefs.current[MENU_ITEMS.length] = el }}
              role="menuitem"
              tabIndex={-1}
              type="button"
              onClick={() => { navigate('/login'); setOpen(false) }}
              onKeyDown={(e) => handleItemKeyDown(e, MENU_ITEMS.length, MENU_ITEMS.length + 1)}
              className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/5 focus:bg-destructive/5 focus:outline-none"
            >
              <LogOut className="size-4 shrink-0" aria-hidden="true" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function NavItem({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'text-sm font-semibold pb-3 inline-block border-b-2 transition-colors',
          isActive
            ? 'border-[color:var(--primary)] text-[color:var(--primary)]'
            : 'border-transparent text-[color:var(--primary)] hover:opacity-80',
        )
      }
      aria-current={undefined} /* NavLink sets this automatically */
    >
      {children}
    </NavLink>
  )
}

export function RootLayout() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip-to-content link — visually hidden until focused */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[200] focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-foreground focus:shadow-lg focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4 sm:px-6">
          <Logo size="md" />

          <nav
            className="flex flex-1 flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-10"
            aria-label="Primary navigation"
          >
            <NavItem to="/">{t('nav.home')}</NavItem>
            <NavItem to="/amenities">{t('nav.amenities')}</NavItem>
            <NavItem to="/bookings">{t('nav.myBookings')}</NavItem>
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <Button
              variant="ghost"
              size="icon"
              className="text-[color:var(--primary)]"
              aria-label="Notifications"
            >
              <Bell className="size-5" aria-hidden="true" />
            </Button>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 sm:px-6 sm:py-8"
        tabIndex={-1}
      >
        <Outlet />
      </main>

      <footer style={{ backgroundColor: teal }} className="mt-auto text-white">
        <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-12">

          {/* Top grid */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="mb-3">
                <Logo size="md" asLink={false} variant="on-color" />
              </div>
              <p className="mb-4 max-w-[220px] text-sm leading-relaxed text-white/65">
                {t('footer.tagline')}
              </p>
              <address className="not-italic space-y-2 text-sm text-white/60">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-white/50" aria-hidden="true" />
                  <span>12 Grandview Terrace, Estate Tower, Unit 4B</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 shrink-0 text-white/50" aria-hidden="true" />
                  <a href="tel:+18005559247" className="hover:text-white transition-colors">
                    +1 (800) 555-9247
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 shrink-0 text-white/50" aria-hidden="true" />
                  <a href="mailto:concierge@residenthub.com" className="hover:text-white transition-colors">
                    concierge@residenthub.com
                  </a>
                </div>
              </address>
            </div>

            {/* Quick links */}
            <nav aria-label="Footer navigation">
              <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.12em] text-white/45">
                {t('footer.navigate')}
              </h2>
              <ul className="space-y-2.5 text-sm text-white/70 list-none p-0">
                {([
                  { key: 'footer.home',      to: '/' },
                  { key: 'footer.amenities', to: '/amenities' },
                  { key: 'footer.myBookings',to: '/bookings' },
                  { key: 'footer.login',     to: '/login' },
                ] as const).map(({ key, to }) => (
                  <li key={to}>
                    <RouterLink to={to} className="hover:text-white transition-colors">
                      {t(key)}
                    </RouterLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Resident services */}
            <div>
              <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.12em] text-white/45">
                {t('footer.residentServices')}
              </h2>
              <ul className="space-y-2.5 text-sm text-white/70 list-none p-0">
                {(['footer.guestPass', 'footer.maintenance', 'footer.parcel', 'footer.submitFeedback', 'footer.buildingNotices'] as const).map((key) => (
                  <li key={key}>
                    {/* These are placeholder actions — kept as buttons since they don't navigate */}
                    <button type="button" className="cursor-pointer hover:text-white transition-colors text-left">
                      {t(key)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hours + emergency */}
            <div>
              <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.12em] text-white/45">
                {t('footer.managementHours')}
              </h2>
              <ul className="space-y-2 text-sm text-white/70 list-none p-0">
                <li className="flex justify-between gap-4">
                  <span>{t('footer.monFri')}</span>
                  <span className="text-white/90 font-medium">8:00 AM – 8:00 PM</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>{t('footer.saturday')}</span>
                  <span className="text-white/90 font-medium">9:00 AM – 5:00 PM</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>{t('footer.sunday')}</span>
                  <span className="text-white/90 font-medium">10:00 AM – 3:00 PM</span>
                </li>
              </ul>
              <div className="mt-5 rounded-xl bg-white/10 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-white/50 mb-0.5">
                  {t('footer.emergency')}
                </p>
                <a href="tel:+18005550911" className="text-sm font-bold hover:text-white/80 transition-colors">
                  +1 (800) 555-0911
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-8 border-t border-white/10" aria-hidden="true" />

          {/* Bottom bar */}
          <div className="flex flex-col items-center justify-between gap-3 text-[11px] text-white/40 sm:flex-row">
            <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
            <nav aria-label="Legal links">
              <ul className="flex gap-4 list-none p-0">
                {(['footer.privacy', 'footer.terms', 'footer.accessibility'] as const).map((key) => (
                  <li key={key}>
                    <button type="button" className="cursor-pointer hover:text-white/70 transition-colors">
                      {t(key)}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
