import { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'

const Teams = () => {

    const [teams, setTeams] = useState([])
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [teamName, setTeamName] = useState('')
    const [loading, setLoading] = useState(false)
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [memberName, setMemberName] = useState("");

    // ---------------- FETCH TEAMS ----------------
    async function fetchTeams() {
        try {
            const res = await api.get('/teams')
            setTeams(res.data)
        } catch (err) {
            console.log('Error fetching teams:', err)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchTeams()
    }, [])

    // ---------------- CREATE TEAM ----------------
    const handleCreateTeam = async () => {
        if (!teamName.trim()) return

        try {
            setLoading(true)

            await api.post('/teams', {
                name: teamName
            })

            setTeamName('')
            setShowModal(false)

            fetchTeams()

        } catch (err) {
            console.log('Error creating team:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleAddMember = async () => {
        try {
            await api.post(
                `/teams/${selectedTeam.id}/members`,
                {
                    name: memberName.trim(),
                }
            );

            alert("Member added successfully");

            setIsAddOpen(false);
            setMemberName("");
            setSelectedTeam(null);

            fetchTeams();

        } catch (err) {
            console.log(err);

            const msg = err?.response?.data?.message || "Error adding member";
            alert(msg);
        }
    };
    // ---------------- DELETE TEAM ----------------
    const handleDelete = async (id) => {
        try {
            console.log("Deleting:", id);

            await api.delete(`/teams/${id}`);

            fetchTeams();

        } catch (err) {
            console.log("DELETE ERROR:", err.response?.data || err.message);
        }
    };


    const filtered = teams.filter(t =>
        t.name?.toLowerCase().includes(search.toLowerCase())
    );

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
                            Teams
                        </h1>
                        <p className='text-sm text-slate-400 mt-0.5'>
                            Manage your teams and members
                        </p>
                    </div>

                    <div className='flex items-center gap-3'>

                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder='Search teams...'
                            className='border rounded-lg w-52 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300'
                        />

                        <button
                            onClick={() => setShowModal(true)}
                            className='flex items-center gap-2 px-4 py-2 text-sm rounded-full bg-blue-500 text-white hover:bg-blue-600'
                        >
                            <img src={assets.plus} className='w-3 invert' />
                            New team
                        </button>

                    </div>
                </div>

                {/* GRID */}
                <div className='grid grid-cols-3 gap-4'>

                    {filtered.map(team => (
                        <div
                            key={team.id}
                            className='bg-white rounded-xl shadow-sm border p-5 flex flex-col gap-4'
                        >

                            {/* TOP */}
                            <div className='flex items-start justify-between'>

                                <div className='flex items-center gap-3'>

                                    <div className='w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold'>
                                        {team.name?.charAt(0)}
                                    </div>

                                    <div>
                                        <h3 className='text-sm font-semibold text-slate-800'>
                                            {team.name}
                                        </h3>
                                        <p className='text-xs text-slate-400'>
                                            Team workspace
                                        </p>
                                    </div>

                                </div>

                                <span className='text-[10px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-600'>
                                    Active
                                </span>

                            </div>

                            {/* MEMBERS */}
                            <div className='text-xs text-slate-500'>
                                Members: {team.members_count || 0}
                            </div>

                            {/* ACTIONS */}
                            <div className='flex gap-2 pt-2 border-t border-slate-50'>

                                <button
                                    onClick={() => {
                                        setSelectedTeam(team);
                                        setIsAddOpen(true);
                                    }}
                                    className='flex-1 py-1.5 text-xs rounded-lg border text-gray-500'
                                >
                                    Add Member
                                </button>

                                <button
                                    onClick={() => handleDelete(team.id)}
                                    className='flex-1 py-1.5 text-xs rounded-lg border border-red-200 text-red-500 hover:bg-red-50'
                                >
                                    Delete
                                </button>

                            </div>

                        </div>
                    ))}
                    {isAddOpen && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white w-[320px] rounded-xl p-5 shadow-lg">

                                <h2 className="text-sm font-semibold mb-3">
                                    Add Member to {selectedTeam?.name}
                                </h2>

                                <input
                                    type="text"
                                    placeholder="Enter member name"
                                    value={memberName}
                                    onChange={(e) => setMemberName(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
                                />

                                <div className="flex gap-2 justify-end">

                                    <button
                                        onClick={() => {
                                            setIsAddOpen(false);
                                            setMemberName("");
                                            setSelectedTeam(null);
                                        }}
                                        className="px-3 py-1.5 text-xs border rounded-lg"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleAddMember}
                                        className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg"
                                    >
                                        Add
                                    </button>

                                </div>
                            </div>
                        </div>
                    )}

                    {/* CREATE CARD */}
                    <div
                        onClick={() => setShowModal(true)}
                        className='bg-white rounded-xl border border-dashed p-5 flex flex-col items-center justify-center cursor-pointer'
                    >
                        <div className='w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl'>
                            +
                        </div>

                        <p className='text-sm font-medium text-slate-400'>
                            Create new team
                        </p>
                    </div>

                </div>

                {/* MODAL */}
                {showModal && (
                    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>

                        <div className='bg-white rounded-2xl w-full max-w-md p-6'>

                            <h2 className='text-base font-semibold mb-4'>
                                Create new team
                            </h2>

                            <input
                                value={teamName}
                                onChange={e => setTeamName(e.target.value)}
                                placeholder='Team name'
                                className='w-full border p-2 rounded mb-4'
                            />

                            <div className='flex gap-2'>

                                <button
                                    onClick={() => setShowModal(false)}
                                    className='flex-1 border p-2 rounded'
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleCreateTeam}
                                    disabled={loading}
                                    className='flex-1 bg-blue-500 text-white p-2 rounded'
                                >
                                    {loading ? 'Creating...' : 'Create'}
                                </button>

                            </div>

                        </div>

                    </div>
                )}

            </div>
        </div>
    )
}

export default Teams
