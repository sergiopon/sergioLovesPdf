import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { ArrowDown, ArrowUp, File, Plus, Trash2, Loader2, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export function Merge() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFiles = (newFiles) => {
    if (!newFiles) return;
    const validFiles = Array.from(newFiles)
      .filter((file) => file.type === "application/pdf")
      .map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        size: formatFileSize(file.size),
      }));
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const mergePdfs = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const pdfFile of files) {
        const fileBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `merged_${Date.now()}.pdf`;
      link.click();
    } catch (error) {
      console.error(error);
      alert("Error merging PDFs");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center">Combinar PDFs</h1>
      
      <div
        className={cn("border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors", isDragging ? "border-red-500 bg-red-500/10" : "border-neutral-700 bg-[#2a2a2a]")}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} className="hidden" multiple accept=".pdf" onChange={(e) => handleFiles(e.target.files)} />
        <Plus className="w-8 h-8 mx-auto text-neutral-400 mb-4" />
        <p className="text-lg font-medium">Suelta tus PDF aquí</p>
      </div>

      <div className="space-y-3">
        {files.map((file) => (
          <div key={file.id} className="bg-[#2a2a2a] border border-neutral-700 rounded-lg p-4 flex items-center justify-between">
            <span className="truncate">{file.name}</span>
            <button onClick={() => setFiles(files.filter(f => f.id !== file.id))} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={mergePdfs}
          disabled={files.length < 2 || isProcessing}
          className="px-8 py-4 bg-red-600 text-white rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Combinando..." : "Combinar PDFs"}
        </button>
      </div>
    </div>
  );
}