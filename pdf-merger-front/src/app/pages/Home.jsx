import { ArrowRight, Combine, FileCheck, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export function Home() {
  const tools = [
    {
      id: "merge",
      title: "Combinar PDF",
      description: "Combina varios archivos PDF en uno solo de forma rápida y sencilla.",
      icon: Combine,
      color: "bg-red-500",
      href: "/merge",
    },
    {
      id: "compress",
      title: "Comprimir PDF",
      description: "Reduce el tamaño del archivo de tu PDF manteniendo la calidad.",
      icon: Layers,
      color: "bg-blue-500",
      href: "#",
      disabled: true,
    },
    {
      id: "convert",
      title: "Convertir PDF",
      description: "Convierte archivos de Word, PowerPoint y Excel a PDF y viceversa.",
      icon: FileCheck,
      color: "bg-green-500",
      href: "#",
      disabled: true,
    },
  ];

  return (
    <div className="space-y-16 py-12">
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold tracking-tighter"
        >
          Your All-in-One <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
            PDF Solution
          </span>
        </motion.h1>
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto">
          Merge, split, compress, and convert PDF files directly in your browser.
        </p>
        <Link to="/merge" className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all">
          Start Merging <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <Link key={tool.id} to={tool.href} className={`block h-full p-6 rounded-2xl border border-neutral-800 bg-[#2a2a2a] hover:bg-neutral-800 transition-colors ${tool.disabled ? "opacity-50 pointer-events-none" : ""}`}>
            <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center mb-4 text-white`}>
              <tool.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">{tool.title}</h3>
            <p className="text-neutral-400 text-sm">{tool.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}