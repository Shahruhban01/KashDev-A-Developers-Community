import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Existing pages
import Landing from './pages/Landing'
import Developers from './pages/Developers'
import DeveloperProfile from './pages/DeveloperProfile'
import Projects from './pages/Projects'
import Opportunities from './pages/Opportunities'
import HallOfFame from './pages/HallOfFame'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'

// New pages
import Search from './pages/Search'
import Companies from './pages/Companies'
import CompanyDetail from './pages/CompanyDetail'
import Forum from './pages/Forum'
import ForumAsk from './pages/ForumAsk'
import ForumQuestionDetail from './pages/ForumQuestionDetail'
import Insights from './pages/Insights'
import NearbyDevelopers from './pages/NearbyDevelopers'
import Messages from './pages/Messages'
import Groups from './pages/Groups'
import GroupDetail from './pages/GroupDetail'
import Account from './pages/Account'
import Popular from './pages/Popular'
import Waitlist from './pages/Waitlist'
import WaitlistAdmin from './pages/admin/WaitlistAdmin'
import WaitlistAnalytics from './pages/admin/WaitlistAnalytics'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-surface-0">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Core */}
            <Route path="/" element={<Landing />} />
            <Route path="/developers" element={<Developers />} />
            <Route path="/developers/:username" element={<DeveloperProfile />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/hall-of-fame" element={<HallOfFame />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Discovery */}
            <Route path="/search" element={<Search />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:companySlug" element={<CompanyDetail />} />

            {/* Geographic */}
            <Route path="/developers/nearby" element={<NearbyDevelopers />} />

            {/* Forum */}
            <Route path="/forum" element={<Forum />} />
            <Route path="/forum/ask" element={<ForumAsk />} />
            <Route path="/forum/question/:id" element={<ForumQuestionDetail />} />
            <Route path="/forum/tag/:slug" element={<Forum />} />

            {/* Analytics */}
            <Route path="/insights" element={<Insights />} />

            {/* New Routes */}
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:chatId" element={<Messages />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:slug" element={<GroupDetail />} />
            <Route path="/account" element={<Account />} />
            <Route path="/popular" element={<Popular />} />

            {/* Waitlist */}
            <Route path="/waitlist" element={<Waitlist />} />

            {/* Admin */}
            <Route path="/admin/waitlist" element={<WaitlistAdmin />} />
            <Route path="/admin/waitlist/analytics" element={<WaitlistAnalytics />} />
          </Routes>
        </main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1c1c1f', color: '#ededee',
              border: '1px solid #2e2e32', borderRadius: '10px', fontSize: '14px',
            },
          }}
        />
      </div>
    </AuthProvider>
  )
}