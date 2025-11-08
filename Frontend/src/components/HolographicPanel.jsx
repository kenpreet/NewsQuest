import React from "react";
import { motion } from "framer-motion";
import "./HolographicPanel.css";

export default function HolographicPanel({
  children,
  className = "",
  glowColor = "cyan",
  angle = 0
}) {
  return (
    <motion.div
      className={`holo-container ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      style={{
        transformStyle: "preserve-3d",
        transform: `rotateY(${angle}deg)`,
      }}
    >
      <div className={`holo-inner holo-${glowColor}`}>
        
        {/* Hover Glow Layer */}
        <motion.div
          className="holo-glow"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Scanline */}
        {/* <motion.div
          className="holo-scanline"
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        /> */}

        {/* Corner Accents */}
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />

        {/* Grid Overlay */}
        <div className="holo-grid" />

        {/* Actual Content */}
        <div className="holo-content">
          {children}
        </div>
      </div>

      {/* Outer Glow */}
      <div className={`holo-outer-glow holo-outer-${glowColor}`} />
    </motion.div>
  );
}
