import { useEffect, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import { userAPI } from '../../api/user.api'

function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await userAPI.getAllUsers()
      setStudents(response.data.filter(u => u.role === 'student'))
    } catch (error) {
      console.error('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="flex h-screen">
      <Sidebar role="hostel_staff" />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Students</h1>
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">USN</th>
                  <th className="px-6 py-3 text-left">Room</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-t">
                    <td className="px-6 py-3">{student.name}</td>
                    <td className="px-6 py-3">{student.email}</td>
                    <td className="px-6 py-3">{student.usn}</td>
                    <td className="px-6 py-3">{student.room_no}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Students
