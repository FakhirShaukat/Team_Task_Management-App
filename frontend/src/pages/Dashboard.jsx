import { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'

const Dashboard = () => {

    const [tasks, setTasks] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    const completedTasks = tasks.filter(task => task.status === "completed").length;
    const inProgressTasks = tasks.filter(task => task.status === "in-progress").length;
    const pendingTasks = tasks.filter(task => task.status === "pending").length;

    async function fetchDashboardData() {

        try {

            const tasksResponse = await api.get('/tasks');

            const teamsResponse = await api.get('/teams');

            setTasks(tasksResponse.data);

            setTeams(teamsResponse.data);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }
    }

    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchDashboardData();

    }, []);

    return (
        <div className=' flex h-screen'>
            <div className="w-1/5 bg-[#0F172A] border-r border-white/5">
                <Sidebar />
            </div>
            <div className='content-side w-4/5 p-6 overflow-y-auto bg-slate-50'>
                <div className='navbar flex items-center justify-between mb-8'>
                    <div>
                        <h1 className='text-2xl font-medium text-slate-800'>Dashboard</h1>
                        <p className='text-sm text-slate-400 mt-1'>Overview of your teams and current work</p>
                    </div>
                    <input type="text" placeholder='Search...' className='border border-slate-200 rounded-lg w-1/2 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white' />
                    <a href="/tasks" className='border border-blue-500 flex items-center gap-2 p-2 text-sm rounded-full px-4 bg-blue-500 text-white hover:bg-blue-600'>
                        <img src={assets.plus} className='w-3 invert' />
                        New task
                    </a>
                </div>

                {loading && (
                    <p className='mb-4 text-sm text-slate-400'>Loading dashboard...</p>
                )}

                <div className='info-boxes grid grid-cols-4 gap-4'>
                    <div className='bg-white p-4 h-[130px] rounded-lg shadow-sm border border-slate-100 flex flex-col justify-between'>
                        <div className='flex gap-2 items-center'>
                            <img src={assets.task} alt="Tasks" className='w-8 h-8 p-1.5 rounded-lg bg-blue-50' />
                            <h2 className='text-sm font-medium text-slate-500'>Tasks</h2>
                        </div>
                        <p className='text-3xl font-semibold text-blue-500'>{tasks.length}</p>
                    </div>
                    <div className='bg-white p-4 h-[130px] rounded-lg shadow-sm border border-slate-100 flex flex-col justify-between'>
                        <div className='flex gap-2 items-center'>
                            <img src={assets.completed} alt="Completed" className='w-8 h-8 p-1.5 rounded-lg bg-emerald-50' />
                            <h2 className='text-sm font-medium text-slate-500'>Completed</h2>
                        </div>
                        <p className='text-3xl font-semibold text-emerald-500'>{completedTasks}</p>
                    </div>
                    <div className='bg-white p-4 h-[130px] rounded-lg shadow-sm border border-slate-100 flex flex-col justify-between'>
                        <div className='flex gap-2 items-center'>
                            <img src={assets.progress} alt="In Progress" className='w-8 h-8 p-1.5 rounded-lg bg-amber-50' />
                            <h2 className='text-sm font-medium text-slate-500'>In Progress</h2>
                        </div>
                        <p className='text-3xl font-semibold text-amber-500'>{inProgressTasks}</p>
                    </div>
                    <div className='bg-white p-4 h-[130px] rounded-lg shadow-sm border border-slate-100 flex flex-col justify-between'>
                        <div className='flex gap-2 items-center'>
                            <img src={assets.pending} alt="Pending" className='w-8 h-8 p-1.5 rounded-lg bg-rose-50' />
                            <h2 className='text-sm font-medium text-slate-500'>Pending</h2>
                        </div>
                        <p className='text-3xl font-semibold text-rose-500'>{pendingTasks}</p>
                    </div>
                </div>

                <div className='two-sections mt-6 flex justify-between w-full gap-4'>
                    <div className='w-full border border-slate-100 bg-white p-4 h-[300px] rounded-lg shadow-sm'>
                        <div className='flex justify-between items-center'>
                            <h1 className='text-sm font-medium text-slate-700'>Teams</h1>
                            <a href="/teams" className='text-xs text-blue-500'>View All</a>
                        </div>
                        <div className='teams-info mt-4'>

                            {teams.slice(0, 3).map((team) => (

                                <div key={team.id} className='team flex items-center gap-3 p-2 border-b border-slate-100 rounded-lg mb-2 w-full'>
                                    <img src={assets.team} alt="Team" className='w-9 h-9 p-2 border border-blue-100 rounded-lg bg-blue-50' />
                                    <div className='details'>
                                        <h1 className='text-sm font-medium text-slate-700'>{team.name}</h1>
                                        <p className='text-slate-400 text-xs'>{team.members_count || 0} members</p>
                                    </div>
                                </div>

                            ))}


                        </div>
                    </div>
                    <div className='w-full border border-slate-100 bg-white p-4 rounded-lg shadow-sm'>
                        <div className='recent-tasks flex justify-between items-center'>
                            <h1 className='text-sm font-medium text-slate-700'>Recent Tasks</h1>
                        </div>
                        <div className='tasks-info mt-4'>
                            {tasks.slice(0, 5).map((task) => (

                                <div key={task.id} className='task flex items-center gap-3 p-2 border-b border-slate-100 rounded-lg mb-2 w-full'>

                                    <img src={assets.task} alt="Task" className='w-9 h-9 p-2 border border-blue-100 rounded-lg bg-blue-50' />
                                    <div className='details w-full'>
                                        <div className='flex justify-between items-center'>
                                            <h1 className='text-sm font-medium text-slate-700'>{task.title} </h1>
                                            <span className={`text-xs px-2 py-1 rounded-full
                        ${task.status === "completed"
                                                    ? "bg-green-100 text-green-600"
                                                    : task.status === "pending"
                                                        ? "bg-red-100 text-red-600"
                                                        : "bg-yellow-100 text-yellow-600"
                                                }
                        
                    `}>
                                                {task.status}
                                            </span>
                                        </div>
                                        <p className='text-slate-400 text-xs mt-0.5'>{task.description}</p>
                                    </div>
                                </div>

                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Dashboard
