import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Merge from './pages/Merge'
import Home from './pages/Home'
import { Link } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/merge" element={<Merge />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App