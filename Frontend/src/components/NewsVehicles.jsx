import React from "react";
import { motion } from "framer-motion";
import "./NewsVehicles.css";

function NewsVan({ isMoving }) {
  return (
    <svg width="50" height="35" viewBox="0 0 120 80" className="vehicle-glow">
      <defs>
        <linearGradient id="vanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
        <linearGradient id="vanAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      <ellipse cx="60" cy="72" rx="40" ry="6" className="shadow-ellipse" />
      <rect x="15" y="35" width="90" height="25" rx="8" fill="url(#vanGradient)" />
      <rect x="20" y="25" width="80" height="20" rx="6" fill="url(#vanGradient)" />

      <rect x="25" y="30" width="70" height="12" rx="4" fill="#e0f2fe" opacity="0.9" stroke="#0ea5e9" strokeWidth="1" />

      <rect x="45" y="15" width="30" height="10" rx="2" fill="#374151" />
      <circle cx="60" cy="12" r="6" fill="none" stroke="#fbbf24" strokeWidth="2" />
      <circle cx="60" cy="12" r="3" fill="#f59e0b" />
      <rect x="55" y="5" width="10" height="7" rx="1" fill="#ef4444" />

      {isMoving && (
        <g>
          <circle cx="60" cy="12" r="8" className="pulse-radar" />
        </g>
      )}

      <rect x="20" y="40" width="15" height="15" rx="2" fill="#f3f4f6" stroke="#d1d5db" />
      <rect x="85" y="40" width="15" height="15" rx="2" fill="#f3f4f6" stroke="#d1d5db" />

      <rect x="40" y="45" width="40" height="8" rx="2" fill="url(#vanAccent)" />
      <text x="60" y="51" textAnchor="middle" className="vehicle-label">NEWS</text>

      <circle cx="35" cy="65" r="8" className="wheel" />
      <circle cx="85" cy="65" r="8" className="wheel" />

      {isMoving && (
        <g>
          <circle cx="35" cy="65" r="3" className="wheel-spin">
            <animateTransform attributeName="transform" type="rotate" values="0 35 65;360 35 65" dur="0.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="85" cy="65" r="3" className="wheel-spin">
            <animateTransform attributeName="transform" type="rotate" values="0 85 65;360 85 65" dur="0.5s" repeatCount="indefinite" />
          </circle>
        </g>
      )}

      <circle cx="12" cy="45" r="3" className="headlight" />
      <circle cx="12" cy="55" r="3" className="headlight" />
    </svg>
  );
}

function NewsHelicopter({ isMoving }) {
  return (
    <svg width="50" height="45" viewBox="0 0 100 90" className="vehicle-glow">
      <defs>
        <linearGradient id="heliGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="50%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#f87171" />
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="82" rx="35" ry="6" className="shadow-ellipse" />

      <g transform="translate(50, 25)">
        {isMoving ? (
          <ellipse cx="0" cy="0" rx="40" ry="3" className="propeller-blur">
            <animateTransform attributeName="transform" type="rotate" values="0;360" dur="0.1s" repeatCount="indefinite" />
          </ellipse>
        ) : (
          <g>
            <rect x="-35" y="-1" width="70" height="2" fill="#374151" />
            <rect x="-1" y="-35" width="2" height="70" fill="#374151" />
          </g>
        )}
        <circle cx="0" cy="0" r="3" fill="#6b7280" />
      </g>

      <ellipse cx="50" cy="50" rx="25" ry="15" fill="url(#heliGradient)" />
      <ellipse cx="50" cy="48" rx="20" ry="12" fill="url(#heliGradient)" />

      <ellipse cx="50" cy="45" rx="18" ry="10" fill="#e0f2fe" stroke="#0ea5e9" />

      <rect x="70" y="48" width="15" height="4" rx="2" fill="url(#heliGradient)" />
    </svg>
  );
}

function NewsDrone({ isMoving }) {
  return (
    <svg width="45" height="40" viewBox="0 0 90 80" className="vehicle-glow">
      <defs>
        <linearGradient id="droneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6b7280" />
          <stop offset="50%" stopColor="#4b5563" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>
      </defs>

      <ellipse cx="45" cy="72" rx="30" ry="5" className="shadow-ellipse" />
      {/* body */}
      <ellipse cx="45" cy="45" rx="12" ry="8" fill="url(#droneGradient)" />
    </svg>
  );
}

export default function NewsVehicles({ position, isMoving, activeVehicle }) {
  const offset = { van: [-25, -35], helicopter: [-25, -45], drone: [-22, -40] }[activeVehicle];

  return (
    <motion.div
      className="vehicle-wrapper"
      style={{ left: position.x + offset[0], top: position.y + offset[1] }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      animate={isMoving ? { scale: [1, 1.05] } : { scale: 1 }}
    >
      {activeVehicle === "van" && <NewsVan isMoving={isMoving} />}
      {activeVehicle === "helicopter" && <NewsHelicopter isMoving={isMoving} />}
      {activeVehicle === "drone" && <NewsDrone isMoving={isMoving} />}

      <div className={isMoving ? "status status-moving" : "status status-stopped"} />

      {isMoving && <div className="signal-wave" />}
    </motion.div>
  );
}
