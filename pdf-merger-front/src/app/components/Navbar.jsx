import { NavLink } from "react-router-dom";
import { FileStack, Github, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Home", href: "/" },
    { name: "Combinar PDF", href: "/merge" },
  ];

  return (
    <nav className="bg-[#2a2a2a] border-b border-neutral-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="bg-red-600 p-1.5 rounded-lg group-hover:bg-red-500 transition-colors">
              <FileStack className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Sergio<span className="text-red-500">Loves</span>Pdf
            </span>
          </NavLink>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.href}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors hover:text-white",
                    isActive ? "text-red-500" : "text-gray-400"
                  )
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white p-2 rounded-md"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#2a2a2a] border-b border-neutral-700 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {links.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                      isActive ? "bg-red-500/10 text-red-500" : "text-gray-300"
                    )
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

