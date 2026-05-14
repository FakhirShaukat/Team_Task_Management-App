import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import api from '../api/axios'

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [teams, setTeams] = useState([]);
    const [user, setUser] = useState(null);

    const menuItems = [
        { name: 'Dashboard', icon: assets.dashboard, path: '/dashboard' },
        { name: 'Tasks', icon: assets.task, path: '/tasks' },
        { name: 'Teams', icon: assets.team, path: '/teams' },
    ];

    async function fetchSidebarData() {

        try {

            const [teamsResponse, userResponse] = await Promise.all([
                api.get('/teams'),
                api.get('/auth/me')
            ]);

            setTeams(teamsResponse.data);

            setUser(userResponse.data.user);

        } catch (error) {

            console.log(error);

        }
    }

    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchSidebarData();

    }, []);

    const handleLogout = async () => {

        try {

            await api.post('/auth/logout');

            navigate('/');

        } catch (error) {

            console.log(error);

        }
    }

    return (
        <div className="sidebar-side w-1/5 min-h-screen flex flex-col bg-[#0F172A] border-r border-white/5 fixed">
            <div className="p-4 mb-12 flex flex-col gap-6 justify-between ">
                <div className="logo flex items-center gap-2 mb-6 cursor-pointer">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center"><img src={assets.logo} alt="" className="invert w-4" /></div>
                    <h1 className="text-white font-semibold text-sm tracking-wide">WorkSphere</h1>
                </div>

                <div className="menu-links">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2">Main</span>
                    <ul className="mt-2 flex flex-col gap-0.5">
                        {menuItems.map(item => (
                            <Link to={item.path} key={item.name}>
                                <li className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-all duration-150 ${location.pathname === item.path ? 'bg-indigo-500/20 text-white font-medium border-r-2 border-indigo-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
                                    <img src={item.icon} alt="" className='invert w-4' />
                                    {item.name}
                                </li>
                            </Link>

                        ))}
                    </ul>
                </div>

                <div className="mt-2">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2">Teams</span>
                    <ul className="mt-2 flex flex-col gap-0.5">
                        {teams.slice(0, 2).map(team => (

                            <li key={team.id} className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all duration-150">
                                <span className="w-2 h-2 rounded-full flex-shrink-0 bg-indigo-400" />{team.name}
                            </li>

                        ))}
                        <li className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm text-indigo-400/70 hover:text-indigo-400 transition-all duration-150">
                            <span className="text-base leading-none">+</span>
                            Add team
                        </li>
                    </ul>
                </div>
            </div>

            <div className=" p-4 border-t border-white/5 flex flex-col justify-end ">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-300">{user?.name?.charAt(0)}</div>
                    <div>
                        <p className="text-xs font-medium text-slate-200">{user?.name}</p>
                        <p className="text-[10px] text-slate-500">{user?.email}</p>
                    </div>

                </div>

                <button onClick={handleLogout} className='w-full text-sm text-white font-semibold text-center mt-4 p-2 gap-2 bg-red-600 rounded-lg hover:bg-red-700 transition duration-300'>
                    logout
                </button>

            </div>
        </div>
    )
}

export default Sidebar
