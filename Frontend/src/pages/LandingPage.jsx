import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EnhancedIndiaMap from "../components/EnhancedIndiaMap";
import NewsVehicles from "../components/NewsVehicles";
import ParticleBackground from "../components/ParticleBackground";
import DataStream from "../components/DataStream";
import HolographicPanel from "../components/HolographicPanel";
import SlideInNewsPanel from "../components/SlideInNewsPanel";
import LoadingState from "../components/LoadingState";
import { useNavigate } from "react-router-dom";
import 'mapbox-gl/dist/mapbox-gl.css'
import Map, { Source, Layer } from "react-map-gl/mapbox";
import { Truck, Plane, Zap, Radio, Activity, Globe } from "lucide-react";
import "./LandingPage.css";
import StateDetector from "../components/StateDetector";

export default function LandingPage() {
    const [carPosition, setCarPosition] = useState({ x: 300, y: 150 });
    const [currentState, setCurrentState] = useState("");
    const [isMoving, setIsMoving] = useState(false);
    const [showNews, setShowNews] = useState(false);
    const [activeVehicle, setActiveVehicle] = useState("van");
    const [isLoading, setIsLoading] = useState(true);
    const [showNewsPanel, setShowNewsPanel] = useState(false);
    const [showSourcesPanel, setShowSourcesPanel] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [lng, setLng] = useState(75.9629)
    const [lat, setLat] = useState(22.5937)

    const navigate = useNavigate();

    const mapRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/auth";
    };

    const handleKeyPress = useCallback(
        (event) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
                event.preventDefault();
            }

            const step = activeVehicle === "helicopter" || activeVehicle === "drone" ? 15 : 12;
            setIsMoving(true);
            setShowNews(false);
            setShowNewsPanel(false);
            setShowSourcesPanel(false);

            switch (event.key) {
                case "ArrowUp":
                    setCarPosition((prev) => ({ ...prev, y: Math.max(50, prev.y - step) }));
                    break;
                case "ArrowDown":
                    setCarPosition((prev) => ({ ...prev, y: Math.min(550, prev.y + step) }));
                    break;
                case "ArrowLeft":
                    setCarPosition((prev) => ({ ...prev, x: Math.max(50, prev.x - step) }));
                    break;
                case "ArrowRight":
                    setCarPosition((prev) => ({ ...prev, x: Math.min(650, prev.x + step) }));
                    break;
                default:
                    setIsMoving(false);
                    return;
            }

            setTimeout(() => {
                setIsMoving(false);
                setShowNews(true);
                if (currentState) {
                    setTimeout(() => {
                        setShowNewsPanel(true);
                        setTimeout(() => setShowSourcesPanel(true), 200);
                    }, 300);
                }
            }, 600);
        },
        [activeVehicle, currentState]
    );

    const moveToState = useCallback((stateName, position) => {
        setIsMoving(true);
        setShowNews(false);
        setShowNewsPanel(false);
        setShowSourcesPanel(false);
        setCarPosition(position);

        setTimeout(() => {
            setIsMoving(false);
            setCurrentState(stateName);
            setShowNews(true);
            setTimeout(() => {
                setShowNewsPanel(true);
                setTimeout(() => setShowSourcesPanel(true), 200);
            }, 300);
        }, 1000);
    }, []);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [handleKeyPress]);

    useEffect(() => {
        const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <LoadingState />;
    }


    const vehicles = [
        { id: "van", icon: Truck, label: "Van", color: "cyan" },
        { id: "helicopter", icon: Plane, label: "Chopper", color: "purple" },
        { id: "drone", icon: Zap, label: "Drone", color: "pink" },
    ];

    return (
        <div className="app-root">
            {/* Mesh background */}
            <div className="mesh-bg" />

            {/* Particles + DataStream */}
            <ParticleBackground />
            <DataStream />

            {/* Spotlight follows cursor */}
            <motion.div
                className="cursor-spotlight"
                style={{ left: mousePosition.x - 192, top: mousePosition.y - 192 }}
                animate={{ x: 0, y: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 100 }}
            />

            {/* Scanlines */}
            <div className="scanlines-overlay" />

            {/* Live Ticker */}
            <motion.div
                className="ticker-wrap"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="ticker-bg-grid" />
                <div className="ticker-bar">
                    <div className="ticker-label">
                        <motion.div
                            className="ticker-led"
                            animate={{
                                opacity: [1, 0.3, 1],
                                scale: [1, 0.9, 1],
                                boxShadow: [
                                    "0 0 0px rgba(255,255,255,0.4)",
                                    "0 0 8px rgba(255,255,255,0.8)",
                                    "0 0 0px rgba(255,255,255,0.4)",
                                ],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="ticker-label-text">Live Feed</span>
                    </div>

                    <div className="ticker-rail">
                        <div className="ticker-track">
                            {[
                                "Multi-source news verification now live across all Indian states",
                                "Navigate the map using arrow keys to explore regional news",
                                "Real-time bias analysis available for all news sources",
                                "Compare perspectives from multiple outlets on the same story",
                                "Interactive map now supports helicopter and drone views",
                                "Stay informed with unbiased news coverage from NewsQuest",
                            ].map((news, i) => (
                                <span key={i} className="ticker-item">
                                    <span className="dot" />
                                    {news}
                                </span>
                            ))}

                            {[
                                "Multi-source news verification now live across all Indian states",
                                "Navigate the map using arrow keys to explore regional news",
                                "Real-time bias analysis available for all news sources",
                                "Compare perspectives from multiple outlets on the same story",
                                "Interactive map now supports helicopter and drone views",
                                "Stay informed with unbiased news coverage from NewsQuest",
                            ].map((news, i) => (
                                <span key={i} className="ticker-item">
                                    <span className="dot" />
                                    {news}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <motion.div
                    className="ticker-bottom-glow"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />
            </motion.div>

            <button
                onClick={handleLogout}
                style={{
                    position: "absolute",
                    top: "80px",
                    right: "20px",
                    zIndex: 100,
                    background: "#00b3ff",
                    color: "white",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    cursor: "pointer"
                }}
            >
                Logout
            </button>

            {/* Top HUD */}
            <motion.div
                className="hud-wrap"
                style={{ top: "40px" }}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
                <div className="hud-inner">
                    <HolographicPanel>
                        <div className="hud-content">
                            <div className="hud-row">
                                {/* Brand */}
                                <div className="brand">
                                    <motion.div
                                        className="brand-icon"
                                        animate={{
                                            boxShadow: [
                                                "0 0 20px rgba(6,182,212,0.3)",
                                                "0 0 40px rgba(6,182,212,0.6)",
                                                "0 0 20px rgba(6,182,212,0.3)",
                                            ],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Radio className="icon-24 white" />
                                    </motion.div>
                                    <div>
                                        <h1 className="brand-title">
                                            <span className="brand-faint">NEWS</span>
                                            <span className="brand-grad">QUEST</span>
                                        </h1>
                                        <p className="brand-sub">REAL-TIME INTELLIGENCE</p>
                                    </div>
                                </div>

                                {/* Current State */}
                                <motion.div
                                    className="state-pill"
                                    animate={{
                                        borderColor: currentState
                                            ? [
                                                "rgba(6,182,212,0.35)",
                                                "rgba(6,182,212,0.7)",
                                                "rgba(6,182,212,0.35)",
                                            ]
                                            : "rgba(6,182,212,0.35)",
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Map className="icon-16 cyan" />
                                    <span className="state-text">
                                        {currentState || "Navigate to explore"}
                                    </span>
                                </motion.div>

                                {/* Status */}
                                <div className="status-row">
                                    <div className="status-chip ok">
                                        <Activity className="icon-16 emerald" />
                                        <span>ONLINE</span>
                                    </div>
                                    <div className="status-chip live">
                                        <div className="live-dot" />
                                        <span>LIVE</span>
                                    </div>
                                    <div className="status-loc">
                                        <Globe className="icon-16 cyan-60" />
                                        <span>INDIA</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </HolographicPanel>
                </div>
            </motion.div>

            {/* Map area */}
            <div className="map-wrap">
                <motion.div
                    className="map-anim"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                >
                    <div className="map-card-wrap">
                        <div className="map-card-glow" />
                        <HolographicPanel>
                            <div className="map-card">
                                <Map
                                    ref={mapRef} // <-- pass the ref so StateDetector can access map.unproject
                                    mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                                    style={{ width: "550px", height: "500px", borderRadius: "14px"}}
                                    
                                    initialViewState={{
                                        longitude: lng,
                                        latitude: lat,
                                        zoom: 2.8
                                    }}
                                    // mapStyle="mapbox://styles/mapbox/streets-v9"
                                    className = "main-map"
                                >
                                    <Source id="india-states" type="geojson" data="/data/india_state.geojson">
                                        <Layer
                                            id="states-fill"
                                            type="fill"
                                            paint={{
                                                "fill-color": "#00bcd4",
                                                "fill-opacity": 0.25
                                            }}
                                        />
                                        <Layer
                                            id="states-outline"
                                            type="line"
                                            paint={{
                                                "line-color": "#00eaff",
                                                "line-width": 1.5
                                            }}
                                        />
                                    </Source>

                                </Map>

                                {/* NEW: StateDetector will detect which state the car is in and call setCurrentState */}
                                <StateDetector
                                  carPosition={carPosition}
                                  mapRef={mapRef}
                                  setCurrentState={setCurrentState}
                                  setShowNewsPanel={setShowNewsPanel}
                                  setShowSourcesPanel={setShowSourcesPanel}
                                />

                                <NewsVehicles
                                    position={carPosition}
                                    isMoving={isMoving}
                                    activeVehicle={activeVehicle}
                                />
                            </div>
                        </HolographicPanel>
                    </div>
                </motion.div>
            </div>

            {/* Bottom controls */}
            <motion.div
                className="bottom-wrap"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            >
                <div className="bottom-inner">
                    <div className="bottom-row">
                        {/* Vehicle selector */}
                        <HolographicPanel className="flex-grow">
                            <div className="veh-sel">
                                <div className="veh-row">
                                    {vehicles.map((v) => {
                                        const Icon = v.icon;
                                        const isActive = activeVehicle === v.id;
                                        return (
                                            <motion.button
                                                key={v.id}
                                                onClick={() => setActiveVehicle(v.id)}
                                                className={`veh-btn ${isActive ? "active" : ""} ${v.color}`}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                {isActive && <motion.div layoutId="activeVehicleBg" className="veh-btn-bg" transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} />}
                                                <div className="veh-btn-inner">
                                                    <Icon className={`icon-24 ${isActive ? "glow" : ""}`} />
                                                    <span className="veh-label">{v.label}</span>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        </HolographicPanel>

                        {/* Keyboard controls */}
                        <HolographicPanel>
                            <div className="keys">
                                <div className="keys-title">CONTROLS</div>
                                <div className="keys-row">
                                    {["↑", "↓", "←", "→"].map((a, i) => (
                                        <div key={i} className="key">
                                            {a}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </HolographicPanel>
                    </div>
                </div>
            </motion.div>

            {/* Right News Panel */}
            <AnimatePresence>
                {showNewsPanel && currentState && (
                    <SlideInNewsPanel
                        state={currentState}
                        showNews={showNews && !isMoving}
                        onClose={() => setShowNewsPanel(false)}
                    />
                )}
            </AnimatePresence>


            {/* Corner details */}
            <motion.div
                className="corner-details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <div>NEWSQUEST v2.0.1</div>
                <div>SYSTEM ONLINE</div>
            </motion.div>
        </div>
    );
}
