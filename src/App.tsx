import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute.tsx'
import { RootLayout } from '@/layouts/RootLayout.tsx'
import { AmenitiesPage } from '@/pages/AmenitiesPage.tsx'
import { BookingPage } from '@/pages/BookingPage.tsx'
import { BookingsPage } from '@/pages/BookingsPage.tsx'
import { HomePage } from '@/pages/HomePage.tsx'
import { LoginPage } from '@/pages/LoginPage.tsx'
import { NotFoundPage } from '@/pages/NotFoundPage.tsx'
import { FeedbackPage } from '@/pages/FeedbackPage.tsx'
import { MaintenancePage } from '@/pages/MaintenancePage.tsx'
import { ProfilePage } from '@/pages/ProfilePage.tsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/amenities/:amenityId/book" element={<BookingPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="amenities" element={<AmenitiesPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
