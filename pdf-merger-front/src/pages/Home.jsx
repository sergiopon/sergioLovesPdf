import { Link } from 'react-router-dom'
function Home() {
  return (
    <div className="contenedor">
        <h1>PDF Tools</h1>
        <p>Herramientas para trabajar con tus PDFs</p>
        <div className="herramientas">

        <Link to="/merge" className="tarjeta">
          <span>📄</span>
          <h2>Merge PDF</h2>
          <p>Combina varios PDFs en uno</p>
        </Link>

        <div className="tarjeta">
          <span>✂️</span>
          <h2>Split PDF</h2>
          <p>Divide un PDF en partes</p>
        </div>

        <div className="tarjeta">
          <span>🗜️</span>
          <h2>Compress PDF</h2>
          <p>Reduce el tamaño de tu PDF</p>
        </div>

      </div>
    
    </div>
  )
}

export default Home