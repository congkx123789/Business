import { Outlet } from 'react-router-dom'
import Header from './Header'
import MobileNav from './MobileNav'
import Footer from './Footer'
import SkipLinks from '../Shared/SkipLinks'

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SkipLinks />
      <Header />
      <main id="main-content" className="flex-grow pb-16 md:pb-0" role="main" tabIndex={-1}>
        <Outlet />
      </main>
      <MobileNav />
      <Footer />
    </div>
  )
}

export default Layout

