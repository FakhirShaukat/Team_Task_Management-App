import { assets } from '../assets/assets'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const RegisterUser = () => {

    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {

        if (!name || !email || !password) {
            return alert("Please fill all fields");
        }

        try {

            setLoading(true);

            const response = await api.post('/auth/register', {
                name,
                email,
                password
            });

            alert(response.data.message);

            navigate('/dashboard');

        } catch (error) {

            alert(
                error.response?.data?.message || "Registration failed"
            );

        } finally {

            setLoading(false);

        }
    }

    return (
        <div className='form-container flex justify-center items-center h-screen bg-[#0F172A]'>
            <div className=' w-[300px] md:w-[500px] h-auto bg-white rounded-md shadow-md '>
                <div className='form-details p-6'>
                    <div>
                        <div className='logo flex justify-center items-center gap-1'>
                            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center"><img src={assets.logo} alt="" className="invert w-4" /></div>
                            <h1 className="text-center font-pacifico  cursor-pointer">WorkSphere</h1>
                        </div>
                        <h1 className='text-xl font-semibold pt-4'>Create New Account</h1>
                        <p className='pt-1 text-xs text-gray-400'>Quickly organize your thoughts by creating an account</p>
                        <div className='inputs flex flex-col gap-4 pt-6'>
                            <input type="text" placeholder='Name' name='firstName' className='border rounded text-sm p-2 w-full focus:outline-none' value={name} onChange={(e) => setName(e.target.value)} />
                            <input type="email" placeholder='Email' name='email' className='border rounded text-sm p-2 focus:outline-none' value={email} onChange={(e) => setEmail(e.target.value)} />
                            <div className='relative w-full  '>
                                <input type={showPassword ? "text" : "password"} placeholder="Enter your Password" className="border w-full  rounded text-sm p-2 focus:outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
                                <button type='button' className='absolute right-3 top-1/2 -translate-y-1/2 ' onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <img src={assets.hide} alt="Hide" className='w-4' /> : <img src={assets.show} alt="Show" className='w-4' />}
                                </button>
                            </div>                            <div className='flex flex-col items-center justify-center'>
                                <button className='rounded p-2 text-sm w-full font-semibold bg-blue-600 text-white hover:bg-blue-600 transition duration-300' onClick={handleRegister} disabled={loading}>
                                    {loading ? "Registering..." : "Register"}
                                </button>
                                <a href="/" className='mt-4 text-[10px] text-gray-500 font-outfit underline text-center'>Back to login</a>
                            </div>
                        </div>


                    </div>

                </div>
            </div>

        </div>
    )
}

export default RegisterUser
