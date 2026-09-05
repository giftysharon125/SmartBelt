import React, { useState } from 'react';
import { 
  ArrowDown, 
  X, 
  CircuitBoard
} from 'lucide-react';

export const SystemArchitecturePage = () => {
  // Selected component for slide-in panel (null or component id)
  const [selectedCompId, setSelectedCompId] = useState(null);

  const handleCompClick = (id) => {
    if (selectedCompId === id) {
      setSelectedCompId(null);
    } else {
      setSelectedCompId(id);
    }
  };

  // Detailed panel information for all architecture components
  const detailsMap = {
    conveyor: {
      title: 'Physical Conveyor System',
      badge: 'REAL WORLD ASSET',
      description: 'The real-world conveyor system whose operating condition is continuously monitored.',
      sections: [
        {
          label: 'Components',
          items: [
            '• Conveyor Belt',
            '• Belt Joint Splice J-03',
            '• Carry & Return Rollers',
            '• Drive & Tail Pulleys',
            '• 75 kW Motor',
          ],
        },
        {
          label: 'Output Signals',
          value: 'Mechanical load, vibration, heat, and strain signals.',
        },
      ],
    },
    sensors: {
      title: 'IoT Sensors Layer',
      badge: '4 FIELD TRANSDUCERS',
      description: 'Captures real-time conveyor operating conditions across 4 sensor transducer modules.',
      sections: [
        {
          label: 'Monitored Parameters',
          items: [
            '• MPU6050 — Vibration',
            '• DS18B20 — Temperature',
            '• Hall Sensor — Speed',
            '• Load Cell + HX711 — Load',
          ],
        },
        {
          label: 'Output Data',
          value: 'Raw analog physical signals converted to digital I2C / SPI / ADC data for ESP32.',
        },
      ],
    },
    esp32: {
      title: 'ESP32 Sensor Layer',
      badge: 'EDGE MCU & SENSORS',
      description: 'Collects real-time conveyor data from sensors such as vibration, temperature, belt speed, load, tension, acoustic and belt tracking sensors.',
      sections: [
        {
          label: 'Data',
          items: [
            '• Vibration',
            '• Temperature',
            '• Belt speed',
            '• Load',
            '• Tension',
            '• Acoustic data',
            '• Belt tracking',
          ],
        },
        {
          label: 'Output',
          value: 'Sensor data is transmitted to the FastAPI backend.',
        },
      ],
    },
    fastapi: {
      title: 'FastAPI Backend',
      badge: 'CENTRAL BACKEND (PORT 8005)',
      description: 'Acts as the communication layer between the ESP32 devices, ML model, database and frontend dashboard.',
      sections: [
        {
          label: 'Responsibilities',
          items: [
            '• Receive sensor data',
            '• Validate incoming data',
            '• Process requests',
            '• Send data to ML pipeline & Database',
            '• Provide APIs to React dashboard',
          ],
        },
      ],
    },
    ml: {
      title: 'Machine Learning Layer',
      badge: 'ML PREDICTION',
      description: 'Analyzes sensor data to identify abnormal conveyor behavior and predict possible faults.',
      sections: [
        {
          label: 'Input',
          value: 'Sensor readings from FastAPI backend',
        },
        {
          label: 'Processing',
          value: 'Feature extraction → ML prediction → fault classification',
        },
        {
          label: 'Output',
          items: [
            '• Normal',
            '• Warning',
            '• Fault',
            '• Predicted maintenance requirement',
          ],
        },
      ],
    },
    db: {
      title: 'Database Layer',
      badge: 'PERSISTENCE',
      description: 'Stores historical and real-time conveyor sensor information, predictions, alerts and maintenance records.',
      sections: [
        {
          label: 'Stores',
          items: [
            '• Sensor readings',
            '• ML predictions',
            '• Fault history',
            '• Alerts',
            '• Maintenance status',
            '• Timestamps',
          ],
        },
      ],
    },
    react: {
      title: 'React Monitoring Dashboard',
      badge: 'USER INTERFACE',
      description: 'Provides the operator with a real-time visual interface for monitoring conveyor health, integrating AI predictions and DB logs.',
      sections: [
        {
          label: 'Displays',
          items: [
            '• Live sensor values',
            '• Equipment health score & ML predictions',
            '• Fault alerts',
            '• Maintenance status',
            '• System architecture',
            '• Historical trends',
          ],
        },
      ],
    },
    godot: {
      title: 'Godot Digital Twin',
      badge: '3D VIRTUAL TWIN',
      description: 'Provides a 3D virtual representation of the conveyor system and reflects the current operational and health state.',
      sections: [
        {
          label: 'Displays',
          items: [
            '• Conveyor movement',
            '• Belt status',
            '• Equipment condition',
            '• Fault indication',
            '• Sensor-related status',
          ],
        },
      ],
    },
  };

  const activeDetail = selectedCompId ? detailsMap[selectedCompId] : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-[#263238] font-sans pb-12">

      {/* ====================================================
          MAIN ARCHITECTURE LAYOUT (FLOWCHART + SLIDE-IN PANEL)
         ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative items-start">
        {/* LEFT AREA: FLOWCHART (ALL ARROWS INDUSTRIAL TEAL #287F7A) */}
        <div className={`${selectedCompId ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all duration-300`}>
          <div className="bg-[#EEF1F2] border border-[#B4BEC2] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#B4BEC2] pb-2 font-mono text-xs mb-2">
              <h3 className="font-bold uppercase tracking-wider text-[#263238] flex items-center gap-2">
                <CircuitBoard className="w-4 h-4 text-[#287F7A]" />
                SYSTEM ARCHITECTURE FLOWCHART
              </h3>
            </div>

            {/* Flowchart Blocks Container */}
            <div className="max-w-md mx-auto space-y-3 font-mono text-xs text-center">
              
              {/* 1. Physical Conveyor */}
              <button
                onClick={() => handleCompClick('conveyor')}
                className={`w-full p-4 rounded-xl border transition-colors duration-200 cursor-pointer shadow-xs flex items-center justify-between ${
                  selectedCompId === 'conveyor'
                    ? 'bg-[#9A5B3D] text-white border-[#9A5B3D] shadow-md font-bold'
                    : 'bg-white text-[#263238] border-[#B4BEC2] hover:bg-[#D8E8E8] hover:border-[#9A5B3D]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🏭</span>
                  <strong className="text-xs tracking-wider">Physical Conveyor System</strong>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-mono ${
                  selectedCompId === 'conveyor' ? 'bg-[#263238] text-[#EEF1F2]' : 'bg-[#EEF1F2] text-[#56656B]'
                }`}>
                  REAL WORLD
                </span>
              </button>

              {/* INDUSTRIAL TEAL ARROW 1 */}
              <div className="flex justify-center text-[#287F7A]">
                <ArrowDown className="w-4 h-4 text-[#287F7A]" />
              </div>

              {/* 2. IoT Sensors Layer */}
              <button
                onClick={() => handleCompClick('sensors')}
                className={`w-full p-4 rounded-xl border transition-colors duration-200 cursor-pointer shadow-xs flex items-center justify-between ${
                  selectedCompId === 'sensors'
                    ? 'bg-[#287F7A] text-white border-[#287F7A] shadow-md font-bold'
                    : 'bg-white text-[#263238] border-[#B4BEC2] hover:bg-[#D8E8E8] hover:border-[#287F7A]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">📡</span>
                  <strong className="text-xs tracking-wider">IoT Sensors Layer</strong>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-mono ${
                  selectedCompId === 'sensors' ? 'bg-[#263238] text-[#EEF1F2]' : 'bg-[#EEF1F2] text-[#56656B]'
                }`}>
                  4 TRANSDUCERS
                </span>
              </button>

              {/* INDUSTRIAL TEAL ARROW 2 */}
              <div className="flex justify-center text-[#287F7A]">
                <ArrowDown className="w-4 h-4 text-[#287F7A]" />
              </div>

              {/* 3. ESP32 Sensors */}
              <button
                onClick={() => handleCompClick('esp32')}
                className={`w-full p-4 rounded-xl border transition-colors duration-200 cursor-pointer shadow-xs flex items-center justify-between ${
                  selectedCompId === 'esp32'
                    ? 'bg-[#287F7A] text-white border-[#287F7A] shadow-md font-bold'
                    : 'bg-white text-[#263238] border-[#B4BEC2] hover:bg-[#D8E8E8] hover:border-[#287F7A]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">⚡</span>
                  <strong className="text-xs tracking-wider">ESP32 Edge Controller</strong>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-mono ${
                  selectedCompId === 'esp32' ? 'bg-[#263238] text-[#EEF1F2]' : 'bg-[#EEF1F2] text-[#56656B]'
                }`}>
                  EDGE MCU
                </span>
              </button>

              {/* INDUSTRIAL TEAL ARROW 3 */}
              <div className="flex justify-center text-[#287F7A]">
                <ArrowDown className="w-4 h-4 text-[#287F7A]" />
              </div>

              {/* 4. FastAPI Backend */}
              <button
                onClick={() => handleCompClick('fastapi')}
                className={`w-full p-4 rounded-xl border transition-colors duration-200 cursor-pointer shadow-xs flex items-center justify-between ${
                  selectedCompId === 'fastapi'
                    ? 'bg-[#287F7A] text-white border-[#287F7A] shadow-md font-bold'
                    : 'bg-white text-[#263238] border-[#B4BEC2] hover:bg-[#D8E8E8] hover:border-[#287F7A]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🐍</span>
                  <strong className="text-xs tracking-wider">FastAPI Backend</strong>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-mono ${
                  selectedCompId === 'fastapi' ? 'bg-[#263238] text-[#EEF1F2]' : 'bg-[#EEF1F2] text-[#56656B]'
                }`}>
                  CENTRAL BACKEND
                </span>
              </button>

              {/* INDUSTRIAL TEAL DIVIDING ARROWS FROM FASTAPI TO ML MODEL & DATABASE */}
              <div className="relative py-2 flex flex-col items-center">
                <div className="w-0.5 h-3 bg-[#287F7A]"></div>
                <div className="w-[62%] h-0.5 bg-[#287F7A]"></div>
                <div className="w-[62%] flex justify-between pt-0.5 font-mono text-[10px] text-[#287F7A] font-bold">
                  <div className="flex flex-col items-center -ml-3">
                    <ArrowDown className="w-4 h-4 text-[#287F7A]" />
                    <span className="text-[9px] text-[#287F7A] font-bold">Feature Stream</span>
                  </div>
                  <div className="flex flex-col items-center -mr-3">
                    <ArrowDown className="w-4 h-4 text-[#287F7A]" />
                    <span className="text-[9px] text-[#287F7A] font-bold">Persistence</span>
                  </div>
                </div>
              </div>

              {/* Split Branch: 5. ML Model & 6. Database */}
              <div className="grid grid-cols-2 gap-4">
                {/* 5. ML Model */}
                <button
                  onClick={() => handleCompClick('ml')}
                  className={`p-4 rounded-xl border transition-colors duration-200 cursor-pointer shadow-xs flex flex-col items-center justify-center text-center ${
                    selectedCompId === 'ml'
                      ? 'bg-[#9A5B3D] text-white border-[#9A5B3D] shadow-md font-bold'
                      : 'bg-white text-[#263238] border-[#B4BEC2] hover:bg-[#D8E8E8] hover:border-[#9A5B3D]'
                  }`}
                >
                  <span className="text-xl mb-1">🧠</span>
                  <strong className="text-xs tracking-wider block">ML Model Layer</strong>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded mt-1 font-mono ${
                    selectedCompId === 'ml' ? 'bg-[#263238] text-[#EEF1F2]' : 'bg-[#9A5B3D]/15 text-[#9A5B3D]'
                  }`}>
                    RANDOM FOREST
                  </span>
                </button>

                {/* 6. Database */}
                <button
                  onClick={() => handleCompClick('db')}
                  className={`p-4 rounded-xl border transition-colors duration-200 cursor-pointer shadow-xs flex flex-col items-center justify-center text-center ${
                    selectedCompId === 'db'
                      ? 'bg-[#287F7A] text-white border-[#287F7A] shadow-md font-bold'
                      : 'bg-white text-[#263238] border-[#B4BEC2] hover:bg-[#D8E8E8] hover:border-[#287F7A]'
                  }`}
                >
                  <span className="text-xl mb-1">🗄️</span>
                  <strong className="text-xs tracking-wider block">Database Layer</strong>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded mt-1 font-mono ${
                    selectedCompId === 'db' ? 'bg-[#263238] text-[#EEF1F2]' : 'bg-[#EEF1F2] text-[#56656B]'
                  }`}>
                    SQLITE / MONGO
                  </span>
                </button>
              </div>

              {/* SINGLE INDUSTRIAL TEAL ARROW FROM ML MODEL & DB INTO REACT */}
              <div className="flex justify-center text-[#287F7A]">
                <ArrowDown className="w-4 h-4 text-[#287F7A]" />
              </div>

              {/* 7. React Dashboard */}
              <button
                onClick={() => handleCompClick('react')}
                className={`w-full p-4 rounded-xl border transition-colors duration-200 cursor-pointer shadow-xs flex items-center justify-between ${
                  selectedCompId === 'react'
                    ? 'bg-[#287F7A] text-white border-[#287F7A] shadow-md font-bold'
                    : 'bg-white text-[#263238] border-[#B4BEC2] hover:bg-[#D8E8E8] hover:border-[#287F7A]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">⚛️</span>
                  <strong className="text-xs tracking-wider">React Dashboard</strong>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-mono ${
                  selectedCompId === 'react' ? 'bg-[#263238] text-[#EEF1F2]' : 'bg-[#EEF1F2] text-[#56656B]'
                }`}>
                  MONITORING UI
                </span>
              </button>

              {/* INDUSTRIAL TEAL ARROW TO GODOT */}
              <div className="flex justify-center text-[#287F7A]">
                <ArrowDown className="w-4 h-4 text-[#287F7A]" />
              </div>

              {/* 8. Godot Digital Twin */}
              <button
                onClick={() => handleCompClick('godot')}
                className={`w-full p-4 rounded-xl border transition-colors duration-200 cursor-pointer shadow-xs flex items-center justify-between ${
                  selectedCompId === 'godot'
                    ? 'bg-[#263238] text-white border-[#263238] shadow-md font-bold'
                    : 'bg-white text-[#263238] border-[#B4BEC2] hover:bg-[#D8E8E8] hover:border-[#263238]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🎮</span>
                  <strong className="text-xs tracking-wider">Godot Digital Twin</strong>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-mono ${
                  selectedCompId === 'godot' ? 'bg-[#287F7A] text-white' : 'bg-[#EEF1F2] text-[#56656B]'
                }`}>
                  3D VIRTUAL TWIN
                </span>
              </button>

            </div>
          </div>
        </div>

        {/* RIGHT SIDE DETAIL PANEL (SLIDES FROM RIGHT → LEFT IN 0.35s) */}
        {selectedCompId && activeDetail && (
          <div className="lg:col-span-5 bg-[#EEF1F2] border-l-4 border-l-[#287F7A] border-y border-r border-[#B4BEC2] rounded-xl p-5 shadow-lg space-y-4 transition-all duration-350 ease-in-out sticky top-20 animate-fadeIn">
            {/* Header & Close Button */}
            <div className="flex items-center justify-between border-b border-[#B4BEC2] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#287F7A] uppercase font-mono tracking-wider block">
                  {activeDetail.badge}
                </span>
                <h3 className="font-extrabold text-base text-[#263238]">{activeDetail.title}</h3>
              </div>

              <button
                onClick={() => setSelectedCompId(null)}
                className="p-1.5 rounded-lg bg-white hover:bg-[#D8E8E8] text-[#263238] border border-[#B4BEC2] transition-colors"
                title="Close Detail Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description Statement */}
            <div className="bg-white p-3.5 rounded-lg border border-[#B4BEC2] space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#56656B] font-mono tracking-wider block">
                DESCRIPTION
              </span>
              <p className="text-xs text-[#263238] font-medium leading-relaxed">
                "{activeDetail.description}"
              </p>
            </div>

            {/* Dynamic Content Sections */}
            {activeDetail.sections.map((sec, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-lg border border-[#B4BEC2] space-y-1.5 font-mono text-xs">
                <span className="text-[10px] font-bold uppercase text-[#287F7A] tracking-wider block">
                  {sec.label}
                </span>
                {sec.items ? (
                  <ul className="space-y-1 text-xs text-[#263238] font-medium">
                    {sec.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs font-bold text-[#263238]">{sec.value}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
