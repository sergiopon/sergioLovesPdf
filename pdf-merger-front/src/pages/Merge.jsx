import logo from '../logo.jpg'
import '../App.css';
import axios from 'axios'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'



import { useState } from 'react'
function Merge() {
const [archivos, setArchivos] = useState([])
const [nombreArchivo, setNombreArchivo] = useState('merged')
const onDragEnd = (result) => {
  if (!result.destination) return  // si soltó fuera, no hacer nada
  
  const items = [...archivos]
  const [movido] = items.splice(result.source.index, 1)      // saca el elemento
  items.splice(result.destination.index, 0, movido)           // lo inserta en la nueva posición
  setArchivos(items)
}
const handleMerge = async () => {
  const formData = new FormData()
  // agrega cada archivo al formData con el campo 'pdfs'
  archivos.forEach(archivo => formData.append('pdfs',archivo))

  const response = await axios.post('http://localhost:4000/api/pdf/merge', formData, {
    responseType: 'blob'  // importante: le dice a axios que espere un archivo binario
  })

  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${nombreArchivo}.pdf`)
  document.body.appendChild(link)
  link.click()
  link.remove()
}




  const handleChange = (e) => {
  const seleccionados = Array.from(e.target.files)
  setArchivos(seleccionados)
  setNombreArchivo((seleccionados[0].name).replace('.pdf', ''))
}
const eliminarArchivo = (index) => {
  const nuevos = archivos.filter((_, i) => i !== index)
  setArchivos(nuevos)
}

  return (
    <div className="contenedor">
      <h1>PDF MERGER</h1>
      <p>Aquí puedes combinar tus PDFs localmente sin pagar nada</p>
      <input type="file" accept=".pdf" multiple onChange={handleChange} />
      <DragDropContext  onDragEnd={onDragEnd}>
        <Droppable droppableId="lista">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {archivos.map((archivo, index) => (
                <Draggable  key={archivo.name} draggableId={archivo.name} index={index}>
                  {(provided) => (
                    <div className= "archivo-item" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      {index + 1}. {archivo.name}
                      <button className="botonX" onClick={() => eliminarArchivo(index)}>✕</button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <input
        type="text"
        className="input"
        value={nombreArchivo}
        onChange={(e) => setNombreArchivo(e.target.value)}
        placeholder="Nombre del archivo"
      />
      {archivos.length >= 2 && (
      <button className="boton-merge" onClick = {handleMerge}>Combinar PDFs</button>
      )}
    </div>
  
  )
}
export default Merge

