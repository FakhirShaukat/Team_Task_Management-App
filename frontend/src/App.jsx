import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage'
import RegisterUser from './pages/RegisterUser'
import Dashboard from './pages/Dashboard'
import MyTasks from './pages/MyTasks'
import Teams from './pages/Teams'

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/signup' element={<RegisterUser />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/tasks' element={<MyTasks />} />
        <Route path='/teams' element={<Teams />} />
      </Routes>
    </Router>
  )
}

export default App
