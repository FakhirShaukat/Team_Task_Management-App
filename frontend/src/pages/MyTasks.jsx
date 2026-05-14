import { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'

const statusColors = {
    completed: 'bg-emerald-100 text-emerald-600',
    'in-progress': 'bg-blue-100 text-blue-600',
    pending: 'bg-yellow-100 text-yellow-600',
    todo: 'bg-slate-100 text-slate-600'
}

const filters = ['All', 'todo', 'in-progress', 'completed', 'pending']

const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'todo', label: 'To Do' },
]

const MyTasks = () => {

    const [tasks, setTasks] = useState([])
    const [teams, setTeams] = useState([])
    const [loading, setLoading] = useState(false)

    const [filter, setFilter] = useState('All')
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)

    const [editTask, setEditTask] = useState(null)

    const [form, setForm] = useState({
        title: '',
        description: '',
        team_id: '',
        assigned_to: '',
        due_date: '',
        status: 'pending'
    })

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            setLoading(true)

            const [tasksRes, teamsRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/teams')
            ])

            setTasks(tasksRes.data)
            setTeams(teamsRes.data)

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const filtered = tasks.filter((t) => {
        const matchSearch = t.title
            ?.toLowerCase()
            .includes(search.toLowerCase())

        const matchFilter =
            filter === 'All' ||
            t.status?.toLowerCase() === filter.toLowerCase()

        return matchSearch && matchFilter
    })

    const openCreate = () => {
        setEditTask(null)

        setForm({
            title: '',
            description: '',
            team_id: '',
            assigned_to: '',
            due_date: '',
            status: 'pending'
        })

        setShowModal(true)
    }

    const openEdit = (task) => {
        setEditTask(task)

        setForm({
            title: task.title || '',
            description: task.description || '',
            team_id: task.team_id || '',
            assigned_to: task.assigned_to || '',
            due_date: task.due_date ? task.due_date.slice(0, 10) : '',
            status: task.status || 'pending'
        })

        setShowModal(true)
    }

    const handleCreateTask = async () => {
        try {
            await api.post('/tasks', {
                title: form.title,
                description: form.description,
                team_id: Number(form.team_id),
                assigned_to: Number(form.assigned_to),
                due_date: form.due_date,
                status: form.status
            })

            alert("Task created successfully")
            setShowModal(false)
            fetchData()

        } catch (error) {
            console.log(error)
            alert(error.response?.data?.message || "Failed to create task")
        }
    }

    const handleUpdateTask = async () => {
        try {
            await api.put(`/tasks/${editTask.id}`, {
                title: form.title,
                description: form.description,
                status: form.status,
                assigned_to: Number(form.assigned_to),
                due_date: form.due_date
            })

            alert("Task updated successfully")
            setShowModal(false)
            fetchData()

        } catch (error) {
            console.log(error)
            alert("Failed to update task")
        }
    }

    const openDelete = async (task) => {
        try {
            await api.delete(`/tasks/${task.id}`)
            alert("Task deleted successfully")
            setShowModal(false)
            fetchData()
        } catch (error) {
            console.log(error)
            alert("Failed to delete task")
        }
    }


return (
    <div className='w-full flex h-screen'>
        <div className="w-1/5 bg-[#0F172A] border-r border-white/5">
            <Sidebar />
        </div>
        <div className='content-side w-4/5 p-4 overflow-y-auto'>

            {/* HEADER */}
            <div className='flex items-center justify-between mb-8'>
                <div>
                    <h1 className='text-2xl font-semibold text-slate-800'>
                        My Tasks
                    </h1>

                    <p className='text-sm text-slate-400 mt-0.5'>
                        {tasks.length} tasks across all teams
                    </p>
                </div>

                <div className='flex items-center gap-3'>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder='Search tasks...'
                        className='border rounded-lg w-52 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300'
                    />

                    <button
                        onClick={openCreate}
                        className='flex items-center gap-2 px-4 py-2 text-sm rounded-full bg-blue-500 text-white hover:bg-blue-600'
                    >
                        <img src={assets.plus} className='w-3 invert' />
                        New task
                    </button>
                </div>
            </div>

            {/* FILTERS */}
            <div className='flex gap-2 mb-6 flex-wrap'>
                {filters.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`text-xs px-4 py-2 rounded-full border 
                                ${filter === f
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-500'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* TASK LIST */}
            <div className='bg-white rounded-lg shadow-sm border overflow-hidden'>

                {loading && (
                    <p className='p-6 text-sm text-slate-400'>
                        Loading tasks...
                    </p>
                )}

                {!loading && filtered.length === 0 && (
                    <p className='text-sm text-slate-400 text-center py-10'>
                        No tasks found.
                    </p>
                )}

                {filtered.map((t) => (
                    <div
                        key={t.id}
                        className="grid grid-cols-12 items-center px-5 py-4 border-b hover:bg-slate-50"
                    >
                        {/* TASK */}
                        <div className="col-span-5">
                            <p className="text-sm font-medium text-slate-700">
                                {t.title}
                            </p>
                            <p className="text-xs text-slate-400">
                                {t.description}
                            </p>
                        </div>

                        {/* TEAM */}
                        <div className="col-span-2">
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                                {teams.find(team =>
                                    Number(team.id) === Number(t.team_id)
                                )?.name || "Unknown"}
                            </span>
                        </div>

                        {/* STATUS */}
                        <div className="col-span-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[t.status]}`}>
                                {t.status}
                            </span>
                        </div>

                        {/* DUE DATE */}
                        <div className="col-span-2 text-xs text-slate-400">
                            {t.due_date?.slice(0, 10)}
                        </div>

                        {/* ACTIONS */}
                        <div className="col-span-1 flex gap-3 justify-end">
                            <button
                                onClick={() => openEdit(t)}
                                className="text-slate-400 hover:text-blue-500"
                            >
                                ✎
                            </button>

                            <button
                                onClick={() => openDelete(t)}
                                className="text-slate-400 hover:text-red-500"
                            >
                                🗑
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            {showModal && (
                <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
                    <div className='bg-white w-full max-w-md rounded-xl p-6 '>

                        <h2 className='text-lg font-semibold mb-4'>
                            {editTask ? "Update Task" : "Create Task"}
                        </h2>

                        <input
                            placeholder='Title'
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            className='w-full border p-2 mb-2 rounded text-sm'
                        />

                        <textarea
                            placeholder='Description'
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className='w-full border p-2 mb-2 rounded text-sm '
                        />

                        <select
                            value={form.team_id}
                            onChange={e => setForm({ ...form, team_id: e.target.value })}
                            className='w-full border p-2 mb-2 rounded text-sm'
                        >
                            <option value="">Select Team</option>
                            {teams.map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>

                        <input
                            placeholder='Assign User ID'
                            value={form.assigned_to}
                            onChange={e => setForm({ ...form, assigned_to: e.target.value })}
                            className='w-full border p-2 mb-2 rounded text-sm'
                        />

                        <select
                            value={form.status}
                            onChange={e => setForm({ ...form, status: e.target.value })}
                            className='w-full border p-2 mb-2 rounded text-sm'
                        >
                            {statusOptions.map(status => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>

                        <input
                            type='date'
                            value={form.due_date}
                            onChange={e => setForm({ ...form, due_date: e.target.value })}
                            className='w-full border p-2 mb-4 rounded text-sm'
                        />

                        <div className='flex gap-2'>
                            <button
                                onClick={() => setShowModal(false)}
                                className='flex-1 border border-red-200 text-red-500 p-2 rounded text-sm'
                            >
                                Cancel
                            </button>

                            <button
                                onClick={editTask ? handleUpdateTask : handleCreateTask}
                                className='flex-1 bg-blue-500 text-white p-2 rounded text-sm '
                            >
                                {editTask ? "Update" : "Create"}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    </div>
)
}

export default MyTasks
