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
  const pdfFinal = await PDFDocument.create()

  for (const archivo of req.files) {
    const bytesArchivo = fs.readFileSync(archivo.path)
    const pdf = await PDFDocument.load(bytesArchivo)
    const paginas = await pdfFinal.copyPages(pdf, pdf.getPageIndices())
    paginas.forEach(pagina => pdfFinal.addPage(pagina))
  }

  const bytes = await pdfFinal.save()
  res.set('Content-Type', 'application/pdf')
  res.set('Content-Disposition', 'attachment; filename="merged.pdf"')
  res.send(Buffer.from(bytes))
})

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`)
})