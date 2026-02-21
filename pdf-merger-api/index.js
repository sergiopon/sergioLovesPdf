const express = require('express')
const multer = require('multer')
const app = express()
const port = 4000

const upload = multer({ dest: 'uploads/' })
const { PDFDocument } = require('pdf-lib')
const fs = require('fs')

app.post('/api/pdf/merge', upload.array('pdfs'), async (req, res) => {
  const pdfFinal = await PDFDocument.create()

  for (const archivo of req.files) {
    const bytes = fs.readFileSync(archivo.path)

    const pdf = await PDFDocument.load(bytes)

    const paginas = await pdfFinal.copyPages(pdf, pdf.getPageIndices())

    paginas.forEach(pagina => pdfFinal.addPage(pagina))
  }

  // 7. Convertir el PDF final a bytes
  const bytes = await pdfFinal.save()

  res.set('Content-Type', 'application/pdf')
  res.set('Content-Disposition', 'attachment; filename="merged.pdf"')
  res.send(Buffer.from(bytes))
})
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`)
})