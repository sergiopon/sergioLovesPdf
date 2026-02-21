import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Merge from './pages/Merge'
import Home from './pages/Home'
import { Link } from 'react-router-dom'
import Navbar from './components/Navbar'

function App() {
  return (
    <BrowserRouter>
      <Navbar className="navbar" />{/* el navbar se muestra en todas las páginas */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/merge" element={<Merge />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App