import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
       <Link to="/">Sergio loves PDF</Link> 
      <Link to="/merge">Merge</Link>
        <Link to="/split">Split</Link>
        <Link to="/compress">Compress</Link>
    </nav>
  )
}

export default Navbar