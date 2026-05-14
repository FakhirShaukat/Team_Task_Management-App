import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import api from '../api/axios'

const LoginPage = () => {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {

    try {

      setLoading(true);

      const response = await api.post('/auth/login', {
        email: username,
        password: password
      });

      alert(response.data.message);

      navigate('/dashboard');

    } catch (error) {

      alert(
        error.response?.data?.message || "Login failed"
      );

    } finally {

      setLoading(false);

    }
  }

  return (
    <div className='form-container flex justify-center items-center h-screen bg-[#0F172A]'>
      <div className="w-[300px] md:w-[500px] h-auto bg-white rounded-md shadow-md pb-2">
        <div className="form-details p-6 flex flex-col ">
          <div className='logo flex justify-center items-center gap-1'>
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center"><img src={assets.logo} alt="" className="invert w-4" /></div>
            <h1 className="text-center font-pacifico  cursor-pointer">WorkSphere</h1>
          </div>

          <h1 className="text-xl font-semibold pt-4">Welcome</h1>
          <p className="pt-1 text-xs text-gray-400">Manage teams, assign tasks, and collaborate efficiently.</p>

          <div className="inputs flex flex-col gap-4 pt-4 w-full">
            <input type="email" placeholder="Enter your Email" className="border rounded text-sm p-2 focus:outline-none" value={username} onChange={(e) => setUsername(e.target.value)} />
            <div className='relative w-full  '>
              <input type={showPassword ? "text" : "password"} placeholder="Enter your Password" className="border w-full  rounded text-sm p-2 focus:outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button className='absolute right-3 top-1/2 -translate-y-1/2 ' onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <img src={assets.hide} alt="Hide" className='w-4' /> : <img src={assets.show} alt="Show" className='w-4' />}
              </button>
            </div>

            <div className="flex flex-col items-center">
              <button className="flex justify-end text-xs gap-2">
                Don't have an account ?{" "}
                <a href="/signup" className="text-blue-600 underline">SignUp</a>
              </button>
              <button className="flex justify-end text-xs text-blue-600 underline"><a href="/">Forgot Password ?</a></button>
            </div>

            <div onClick={handleLogin} className="flex justify-center"><button className="rounded p-2 text-sm w-full font-semibold bg-blue-600 text-white hover:bg-blue-800 transition duration-300">
              {loading ? "Logging in..." : "Login"}
            </button></div>

            <div className="divider flex justify-center items-center gap-1 text-sm text-gray-400">
              <div className="bg-gray-300 flex-1 h-px"></div>
              <div>OR</div>
              <div className="bg-gray-300 flex-1 h-px"></div>
            </div>

            {/* Google Sign-In */}
            <div id="google-login-btn" className=" flex justify-center items-center gap-2 border rounded p-2 cursor-pointer hover:bg-gray-100 transition duration-300">
              <img src={assets.googleLogo} alt="" className='w-6' />
              <button className='text-sm '>Continue With Google</button>
            </div>

          </div>


        </div>
      </div>

    </div>
  )
}

export default LoginPage
