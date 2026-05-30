import { Outlet } from 'react-router-dom'
import Navbar from '../common/Navbar'
import Sidebar from '../common/Sidebar'

function StudentLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar role="student" />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default StudentLayout
