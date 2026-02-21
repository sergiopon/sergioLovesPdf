# PDF Merger — Guía completa (Backend + Frontend)

---

## PARTE 1 — BACKEND

### Conceptos clave

**Servidor** — Una computadora esperando peticiones. En desarrollo vive en tu propia máquina en `http://localhost:4000`. El `4000` es el puerto.

**Endpoint** — Una dirección específica dentro del servidor. Cada una hace una cosa diferente:
```
http://localhost:4000/api/pdf/merge    → combinar PDFs
http://localhost:4000/api/pdf/split    → dividir PDFs (futuro)
```

**GET vs POST**
- GET → pedir información
- POST → enviar información (archivos, datos)

**Headers** — Información sobre la respuesta. Le dicen al cliente qué tipo de contenido está recibiendo:
```js
res.set('Content-Type', 'application/pdf')
res.set('Content-Disposition', 'attachment; filename="merged.pdf"')
```

**req y res** — Cuando llega una petición, Express te da dos objetos:
- `req` → información sobre lo que llegó (archivos, datos)
- `res` → lo que usas para responder (`res.json()`, `res.send()`)
- Solo puedes llamar `res.json()` o `res.send()` **una vez** por petición

### Librerías

| Librería | Para qué sirve |
|---|---|
| `express` | Crear el servidor y definir endpoints |
| `multer` | Recibir archivos enviados por el cliente |
| `pdf-lib` | Leer, manipular y crear PDFs |
| `cors` | Permitir peticiones desde el frontend |
| `fs` | Leer archivos del disco (viene con Node, no se instala) |

### Paso a paso

#### 1. Crear el proyecto
```bash
mkdir pdf-merger-api
cd pdf-merger-api
npm init -y
npm install express multer pdf-lib cors
mkdir uploads
```

#### 2. index.js completo
```js
const express = require('express')
const multer = require('multer')
const cors = require('cors')
const { PDFDocument } = require('pdf-lib')
const fs = require('fs')

const app = express()
const port = 4000
const upload = multer({ dest: 'uploads/' })

app.use(cors())

app.post('/api/pdf/merge', upload.array('pdfs'), async (req, res) => {

  // 1. Crear un PDF vacío
  const pdfFinal = await PDFDocument.create()

  // 2. Por cada archivo que llegó...
  for (const archivo of req.files) {

    // 3. Leer los bytes del archivo del disco
    const bytesArchivo = fs.readFileSync(archivo.path)

    // 4. Cargar esos bytes como PDF
    const pdf = await PDFDocument.load(bytesArchivo)

    // 5. Copiar todas las páginas
    const paginas = await pdfFinal.copyPages(pdf, pdf.getPageIndices())

    // 6. Agregar cada página al PDF final
    paginas.forEach(pagina => pdfFinal.addPage(pagina))
  }

  // 7. Convertir a bytes y enviar
  const bytes = await pdfFinal.save()
  res.set('Content-Type', 'application/pdf')
  res.set('Content-Disposition', 'attachment; filename="merged.pdf"')
  res.send(Buffer.from(bytes))
})

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`)
})
```

#### 3. Correr el servidor
```bash
node index.js
```

#### 4. Probar con curl
```bash
curl -X POST http://localhost:4000/api/pdf/merge \
  -F "pdfs=@/ruta/archivo1.pdf" \
  -F "pdfs=@/ruta/archivo2.pdf" \
  --output merged.pdf
```

### Errores comunes en el backend

| Error | Código incorrecto | Código correcto |
|---|---|---|
| Pasar el objeto en vez de la ruta | `fs.readFileSync(archivo)` | `fs.readFileSync(archivo.path)` |
| Índices incorrectos en copyPages | `copyPages(pdf, pdfFinal)` | `copyPages(pdf, pdf.getPageIndices())` |
| Pasar el array en vez del elemento | `addPage(paginas)` | `addPage(pagina)` |
| Enviar el objeto PDF | `res.send(pdfFinal)` | `res.send(Buffer.from(bytes))` |
| Olvidar async | `(req, res) => {` | `async (req, res) => {` |
| Olvidar app.listen | — | Siempre al final del archivo |
| CORS bloqueado | — | `app.use(cors())` antes de las rutas |

---

## PARTE 2 — FRONTEND

### Conceptos clave

**HTML** — La estructura. Los huesos.
```html
<h1>Título</h1>
<p>Párrafo</p>
<button>Click</button>
<div>Contenedor</div>
```

**CSS** — El estilo. La apariencia.
```css
.clase {
  color: #ffffff;
  background-color: #1a1a1a;
  padding: 12px;
  border-radius: 8px;
}
```

**JSX** — HTML dentro de JavaScript (React).
```jsx
function MiComponente() {
  return (
    <div className="clase">
      <h1>Hola</h1>
    </div>
  )
}
```

**useState** — Variable especial que cuando cambia, React actualiza la pantalla:
```jsx
const [archivos, setArchivos] = useState([])
// archivos → valor actual
// setArchivos → función para actualizarlo
// useState([]) → valor inicial
```

**Estructura de un componente:**
```jsx
function App() {
  // 1. Estado y lógica (JavaScript)
  const [valor, setValor] = useState('')
  
  const miFuncion = () => {
    setValor('nuevo valor')
  }

  // 2. Lo que se muestra (JSX)
  return (
    <div>
      ...
    </div>
  )
}
export default App
```

### Librerías del frontend

| Librería | Para qué sirve |
|---|---|
| `react` | La base |
| `axios` | Hacer peticiones HTTP al backend |
| `@hello-pangea/dnd` | Drag and drop |
| `react-router-dom` | Manejar múltiples páginas |

### Paso a paso

#### 1. Crear el proyecto
```bash
npx create-react-app pdf-merger-front
cd pdf-merger-front
npm install axios @hello-pangea/dnd react-router-dom@6
```

> **Importante:** El frontend debe estar en una carpeta separada del backend, no dentro de él.

#### 2. Estructura de carpetas
```
pdf-merger-front/
  src/
    pages/
      Home.jsx      ← homepage
      Merge.jsx     ← el merger
    App.js          ← rutas
    App.css         ← estilos globales
```

#### 3. App.js — Rutas
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Merge from './pages/Merge'

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
```

#### 4. pages/Merge.jsx — El merger completo
```jsx
import '../App.css'
import axios from 'axios'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useState } from 'react'

function Merge() {
  const [archivos, setArchivos] = useState([])
  const [nombreArchivo, setNombreArchivo] = useState('merged')

  const onDragEnd = (result) => {
    if (!result.destination) return
    const items = [...archivos]
    const [movido] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, movido)
    setArchivos(items)
  }

  const handleMerge = async () => {
    const formData = new FormData()
    archivos.forEach(archivo => formData.append('pdfs', archivo))

    const response = await axios.post('http://localhost:4000/api/pdf/merge', formData, {
      responseType: 'blob'
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
    setNombreArchivo(seleccionados[0].name.replace('.pdf', ''))
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

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="lista">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {archivos.map((archivo, index) => (
                <Draggable key={archivo.name} draggableId={archivo.name} index={index}>
                  {(provided) => (
                    <div
                      className="archivo-item"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
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
        className="input-nombre"
        value={nombreArchivo}
        onChange={(e) => setNombreArchivo(e.target.value)}
        placeholder="Nombre del archivo"
      />

      {archivos.length >= 2 && (
        <button className="boton-merge" onClick={handleMerge}>Combinar PDFs</button>
      )}
    </div>
  )
}

export default Merge
```

#### 5. pages/Home.jsx — Homepage
```jsx
import { Link } from 'react-router-dom'
import '../App.css'

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
```

#### 6. App.css — Estilos
```css
body {
  background-color: #1a1a1a;
  color: #ffffff;
  margin: 0;
  font-family: sans-serif;
}

.contenedor {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
}

.contenedor h1 {
  color: #ffffff;
  margin: auto;
}

.contenedor input {
  width: 100%;
  border: 1px solid #444;
  padding: 12px;
  border-radius: 8px;
  background-color: #2a2a2a;
  cursor: pointer;
  box-sizing: border-box;
  color: #ffffff;
}

.contenedor p {
  background-color: #2a2a2a;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.archivo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2a2a2a;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 8px;
  color: #ffffff;
}

.botonX {
  background-color: #2a2a2a;
  padding: 5px;
  border-radius: 10px;
  margin-bottom: 2px;
  color: #ffffff;
  font-weight: bold;
  border: none;
  cursor: pointer;
}

.input-nombre {
  width: 100%;
  background-color: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 12px;
  color: #ffffff;
  box-sizing: border-box;
  margin-top: 16px;
}

.boton-merge {
  width: 100%;
  background-color: #e2001a;
  color: #ffffff;
  border: none;
  padding: 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
}

.herramientas {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 32px;
}

.tarjeta {
  background-color: #2a2a2a;
  border-radius: 12px;
  padding: 24px;
  width: 160px;
  text-decoration: none;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tarjeta:hover {
  background-color: #333;
}

.tarjeta span {
  font-size: 2rem;
}

.tarjeta h2 {
  font-size: 1rem;
  margin: 8px 0 4px;
}

.tarjeta p {
  font-size: 0.8rem;
  color: #aaa;
  background: none;
  padding: 0;
}
```

### Errores comunes en el frontend

| Error | Causa | Solución |
|---|---|---|
| Estado dentro del return | `const [x] = useState()` dentro del JSX | Moverlo antes del return |
| Dos elementos raíz en el return | Dos divs sueltos | Envolver todo en un solo div |
| CORS bloqueado | Frontend y backend en puertos distintos | `app.use(cors())` en el backend |
| Cannot find module | Ruta de import incorrecta | Usar `../` para subir un nivel |
| Librería no encontrada | Instalada en la carpeta equivocada | Verificar con `pwd` antes de instalar |

### CSS más útil

```css
/* Colores */
color: #ffffff;
background-color: #2a2a2a;

/* Espaciado */
padding: 12px;        /* interior */
margin: 8px;          /* exterior */
margin-top: 16px;

/* Tamaño */
width: 100%;
max-width: 600px;
box-sizing: border-box; /* el padding no agranda el elemento */

/* Bordes */
border: 1px solid #444;
border-radius: 8px;

/* Flexbox — para alinear elementos en fila */
display: flex;
justify-content: space-between; /* separa a los extremos */
align-items: center;            /* centra verticalmente */
gap: 16px;                      /* espacio entre elementos */

/* Efectos */
cursor: pointer;
transition: background-color 0.2s; /* animación suave */
```

---

## Próximos pasos

- **Split PDF** — nueva página y endpoint en el backend
- **Manejo de errores** — mostrar mensajes cuando algo falla
- **React Router** — ya implementado, agregar más rutas
- **Tailwind CSS** — reemplazar el CSS manual por clases utilitarias
- **Next.js** — cuando domines React, el siguiente nivel
