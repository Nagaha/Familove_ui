import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import { FamilyProvider } from './family-context.jsx'
import { NotificationProvider } from './notifications-context.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import FamilyPage from './pages/FamilyPage.jsx'
import AddMeal from './pages/AddMeal.jsx'
import MyMeals from './pages/MyMeals.jsx'
import Profile from './pages/Profile.jsx'
import Notifications from './pages/Notifications.jsx'

function RequireAuth() {
  const { user, ready } = useAuth()
  if (!ready) return <p className="muted pad">Loading…</p>
  if (!user) return <Navigate to="/login" replace />
  return (
    <FamilyProvider>
      <NotificationProvider>
        <Layout>
          <Outlet />
        </Layout>
      </NotificationProvider>
    </FamilyProvider>
  )
}

export default function App() {
  const { user, ready } = useAuth()
  const signedIn = ready && user

  return (
    <Routes>
      <Route path="/login" element={signedIn ? <Navigate to="/" replace /> : <Login mode="login" />} />
      <Route path="/register" element={signedIn ? <Navigate to="/" replace /> : <Login mode="register" />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/family" element={<FamilyPage />} />
        <Route path="/meals/new" element={<AddMeal />} />
        <Route path="/my-meals" element={<MyMeals />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
