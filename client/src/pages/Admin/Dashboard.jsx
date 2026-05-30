import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'

function AdminDashboard() {
  return (
    <div className="flex h-screen">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-100 p-6 rounded shadow">
              <h2 className="text-lg font-semibold">Total Users</h2>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="bg-green-100 p-6 rounded shadow">
              <h2 className="text-lg font-semibold">Total Passes</h2>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="bg-yellow-100 p-6 rounded shadow">
              <h2 className="text-lg font-semibold">Pending Approvals</h2>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="bg-purple-100 p-6 rounded shadow">
              <h2 className="text-lg font-semibold">Today's Scans</h2>
              <p className="text-3xl font-bold">0</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
