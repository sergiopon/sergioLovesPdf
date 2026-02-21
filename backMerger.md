# Backend PDF Merger — Guía completa para repetirlo

## ¿Qué estamos construyendo?

Un servidor que recibe varios archivos PDF, los combina en uno solo, y devuelve ese PDF al cliente.

El flujo es así:
```
Usuario sube PDFs → Frontend los envía al servidor → Servidor los combina → Devuelve merged.pdf
```

Por ahora solo construimos el servidor (backend). El frontend viene después.

---

## Conceptos que necesitas entender antes de codear

### ¿Qué es un servidor?
Una computadora que está encendida esperando peticiones. Cuando alguien le pregunta algo, responde.
En desarrollo, el servidor vive en tu propia máquina en una dirección como `http://localhost:4000`.
El `4000` es el **puerto** — como el número de apartamento dentro del edificio.

### ¿Qué es un endpoint?
Una dirección específica dentro del servidor. Cada endpoint hace una cosa diferente:
```
http://localhost:4000/api/pdf/merge    → combinar PDFs
http://localhost:4000/api/pdf/split    → dividir PDFs (futuro)
http://localhost:4000/api/pdf/compress → comprimir PDFs (futuro)
```

### ¿Qué es GET vs POST?
Son tipos de peticiones:
- **GET** → pedir información. Ejemplo: "dame la lista de mis archivos"
- **POST** → enviar información. Ejemplo: "toma estos PDFs y combínalos"

Para el merge usamos POST porque el usuario *envía* archivos.

### ¿Qué son los headers?
Cuando el servidor responde, no solo envía el contenido — también envía información sobre ese contenido. Esa información son los headers. Es como las etiquetas en una caja de envío.

Para responder un PDF necesitas dos headers:
```js
res.set('Content-Type', 'application/pdf')                          // "lo que envío es un PDF"
res.set('Content-Disposition', 'attachment; filename="merged.pdf"') // "descárgalo con este nombre"
```

### ¿Qué es req y res?
Cuando llega una petición a tu endpoint, Express te da dos objetos:
- **req** (request) → información sobre lo que llegó. Archivos, datos, headers del cliente.
- **res** (response) → lo que usas para responder. `res.json()`, `res.send()`, etc.

Solo puedes llamar `res.json()` o `res.send()` **una vez** por petición.

---

## Las librerías que usamos

| Librería | Para qué sirve |
|---|---|
| `express` | Crear el servidor y definir endpoints |
| `multer` | Recibir archivos enviados por el cliente |
| `pdf-lib` | Leer, manipular y crear PDFs |
| `fs` | Leer archivos del disco (viene incluida en Node, no se instala) |

---

## Paso a paso para reproducirlo

### Paso 1 — Crear el proyecto
```bash
mkdir pdf-merger-api
cd pdf-merger-api
npm init -y
npm install express multer pdf-lib
mkdir uploads
```

`npm init -y` crea el `package.json` con valores por defecto.
`mkdir uploads` crea la carpeta donde multer va a guardar los archivos temporalmente.

---

### Paso 2 — Verificar que funciona algo mínimo

Antes de tocar PDFs, verifica que Express funciona. Crea `index.js` con esto:

```js
const express = require('express')
const app = express()
const port = 4000

app.get('/', (req, res) => {
  res.send('Hola desde el servidor')
})

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`)
})
```

Córrelo:
```bash
node index.js
```

Abre `http://localhost:4000` en el navegador. Debes ver "Hola desde el servidor".

---

### Paso 3 — Agregar el endpoint POST

Agrega este endpoint en `index.js` (antes del `app.listen`):

```js
app.post('/api/pdf/merge', (req, res) => {
  res.json({ message: 'Merge endpoint funcionando' })
})
```

Para probarlo no puedes usar el navegador (solo hace GET). Usa curl en la terminal:
```bash
curl -X POST http://localhost:4000/api/pdf/merge
```

Debes ver: `{"message":"Merge endpoint funcionando"}`

> **Ojo:** Cada vez que cambias el código debes parar el servidor (Ctrl+C) y volver a correr `node index.js`.

---

### Paso 4 — Recibir archivos con multer

Multer es el middleware que intercepta los archivos antes de que lleguen a tu endpoint.
Cuando multer procesa los archivos, los guarda en disco y los pone disponibles en `req.files`.

Cada elemento de `req.files` es un objeto así:
```js
{
  originalname: 'documento.pdf',  // nombre original del archivo
  path: 'uploads/123abc',         // donde multer lo guardó en tu disco
  size: 12345,                    // tamaño en bytes
  mimetype: 'application/pdf'     // tipo de archivo
}
```

Modifica tu `index.js` para usar multer:

```js
const express = require('express')
const multer = require('multer')
const app = express()
const port = 4000

// Configurar multer — dest es la carpeta donde guarda los archivos
const upload = multer({ dest: 'uploads/' })

// upload.array('pdfs') significa: espera múltiples archivos con el campo llamado 'pdfs'
app.post('/api/pdf/merge', upload.array('pdfs'), (req, res) => {
  const nombres = req.files.map(archivo => archivo.originalname)
  res.json({ archivos: nombres })
})

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`)
})
```

Pruébalo enviando archivos reales con curl:
```bash
curl -X POST http://localhost:4000/api/pdf/merge \
  -F "pdfs=@/ruta/archivo1.pdf" \
  -F "pdfs=@/ruta/archivo2.pdf"
```

Si los archivos tienen espacios en el nombre, escapa los espacios con `\`:
```bash
curl -X POST http://localhost:4000/api/pdf/merge \
  -F "pdfs=@/home/usuario/Downloads/Mi\ Archivo.pdf"
```

Debes ver los nombres de los archivos en la respuesta.

---

### Paso 5 — Combinar los PDFs con pdf-lib

Ahora sí, el merge real. El proceso es:
1. Crear un PDF vacío
2. Por cada archivo recibido: leer sus bytes, cargarlo, copiar sus páginas al PDF vacío
3. Convertir el PDF final a bytes
4. Enviarlo como respuesta

```js
const express = require('express')
const multer = require('multer')
const { PDFDocument } = require('pdf-lib')
const fs = require('fs')

const app = express()
const port = 4000
const upload = multer({ dest: 'uploads/' })

app.post('/api/pdf/merge', upload.array('pdfs'), async (req, res) => {

  // 1. Crear un PDF vacío donde vamos a pegar todo
  const pdfFinal = await PDFDocument.create()

  // 2. Por cada archivo que llegó...
  for (const archivo of req.files) {

    // 3. Leer los bytes del archivo del disco
    //    archivo.path es la ruta donde multer guardó el archivo
    const bytesArchivo = fs.readFileSync(archivo.path)

    // 4. Cargar esos bytes como un documento PDF manipulable
    const pdf = await PDFDocument.load(bytesArchivo)

    // 5. Copiar todas las páginas de este PDF al pdfFinal
    //    pdf.getPageIndices() devuelve [0, 1, 2, ...] según cuántas páginas tenga
    const paginas = await pdfFinal.copyPages(pdf, pdf.getPageIndices())

    // 6. Agregar cada página copiada al PDF final
    //    paginas es un array, pagina es cada elemento individual
    paginas.forEach(pagina => pdfFinal.addPage(pagina))
  }

  // 7. Convertir el PDF final a bytes para poder enviarlo
  const bytes = await pdfFinal.save()

  // 8. Configurar headers y enviar
  res.set('Content-Type', 'application/pdf')
  res.set('Content-Disposition', 'attachment; filename="merged.pdf"')
  res.send(Buffer.from(bytes))  // Buffer.from() convierte los bytes a formato que Express puede enviar

})

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`)
})
```

> **Importante:** El endpoint ahora es `async` porque pdf-lib usa promesas (`await`). Sin `async` el código no funciona.

---

### Paso 6 — Probar el merge real

```bash
curl -X POST http://localhost:4000/api/pdf/merge \
  -F "pdfs=@/ruta/archivo1.pdf" \
  -F "pdfs=@/ruta/archivo2.pdf" \
  --output merged.pdf
```

El `--output merged.pdf` le dice a curl que guarde la respuesta en un archivo en vez de intentar mostrarlo en la terminal.

Abre el `merged.pdf` resultante y verifica que tenga las páginas de ambos PDFs.

---

## Errores comunes y cómo evitarlos

| Error | Código incorrecto | Código correcto | Por qué |
|---|---|---|---|
| Pasar el objeto en vez de la ruta | `fs.readFileSync(archivo)` | `fs.readFileSync(archivo.path)` | `fs.readFileSync` necesita una ruta string, no el objeto completo |
| Pasar el PDF equivocado a copyPages | `copyPages(pdf, pdfFinal)` | `copyPages(pdf, pdf.getPageIndices())` | El segundo argumento son los índices de las páginas a copiar |
| Pasar el array en vez del elemento | `addPage(paginas)` | `addPage(pagina)` | `paginas` es el array completo, `pagina` es cada elemento del forEach |
| Enviar el objeto PDF en vez de bytes | `res.send(pdfFinal)` | `res.send(Buffer.from(bytes))` | El cliente necesita bytes, no el objeto JavaScript |
| Usar el mismo nombre de variable dos veces | `const bytes = ...` dentro y fuera del for | Usar `bytesArchivo` dentro del for y `bytes` afuera | JavaScript no permite redeclarar variables con `const` en el mismo scope |
| Llamar res.json() dos veces | `res.json(...); res.json(...)` | Solo un `res.json()` o `res.send()` | Solo puedes enviar una respuesta por petición |
| Olvidar el app.listen | — | Siempre al final del archivo | Sin esto el servidor nunca arranca |
| Olvidar async en el endpoint | `app.post(..., (req, res) => {` | `app.post(..., async (req, res) => {` | Necesitas async para poder usar await adentro |

---

## Checklist para verificar que todo funciona

- [ ] `node index.js` muestra "Servidor corriendo en puerto 4000"
- [ ] `curl -X POST http://localhost:4000/api/pdf/merge` responde JSON
- [ ] Enviando dos PDFs con curl y `--output merged.pdf` genera un archivo válido
- [ ] El `merged.pdf` tiene las páginas de ambos archivos combinadas

---

## Próximo paso — Frontend en React

El backend está listo. El frontend necesita:
- Una zona para arrastrar y soltar archivos (drag and drop)
- Una lista donde el usuario puede reordenar los PDFs antes de combinarlos
- Un botón que envía los archivos al endpoint y descarga el resultado

Las librerías que se usarán:
- `react` — la base
- `@hello-pangea/dnd` — para el drag and drop
- `axios` — para hacer la petición POST al backend