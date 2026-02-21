import logo from './logo.jpg';
import './App.css';
import axios from 'axios'




import { useState } from 'react'
function App() {
const [archivos, setArchivos] = useState([])
const handleMerge = async () => {
  const formData = new FormData()
  // agrega cada archivo al formData con el campo 'pdfs'
  archivos.forEach(archivo => formData.append('pdfs',archivo))

  const response = await axios.post('http://localhost:4000/api/pdf/merge', formData, {
    responseType: 'blob'  // importante: le dice a axios que espere un archivo binario
  })

  // crear un link temporal y hacer click para descargar
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'merged.pdf')
  document.body.appendChild(link)
  link.click()
  link.remove()
}




  const handleChange = (e) => {
  const seleccionados = Array.from(e.target.files)
  setArchivos(seleccionados)
}

  return (
    <div>
      <h1>PDF MERGER</h1>
      <p>Aquí puedes combinar tus PDFs localmente sin pagar nada</p>
      <input type="file" accept=".pdf" multiple onChange={handleChange} />
      {archivos.map(archivo => (
      <p>{archivo.name}</p>
      ))}
      {archivos.length >= 2 && (
      <button onClick = {handleMerge}>Combinar PDFs</button>
      )}
    </div>
  
  )
}
export default App

