import React, { useState } from 'react';
import { 
  Wrench, 
  Box, 
  Activity, 
  Wifi, 
  Brain, 
  Code,
  ArrowRight,
  ShieldCheck,
  Cpu,
  RotateCcw
} from 'lucide-react';

export const TeamPage = () => {
  const [flippedCards, setFlippedCards] = useState({});

  const toggleFlip = (id) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const teamCards = [
    {
      id: 1,
      badge: 'MECH',
      memberName: 'Hari Krishna',
      badgeBg: 'bg-[#9A5B3D]/15 text-[#9A5B3D] border-[#9A5B3D]/40',
      bg: 'bg-[#FDFAF5]',
      imgBg: 'bg-[#FDFAF5]',
      icon: Wrench,
      image: '/team-box1.png',
      title: 'Conveyor Belt & Mechanical Engineering',
      area: 'Mechanical Systems & Failure Dynamics',
      hasFlip: true,
      responsibilities: [
        'Conveyor belt design and structure',
        'Belt tension and alignment',
        'Rollers, idlers, pulleys and bearings',
        'Motor and gearbox components',
        'Conveyor operating conditions',
        'Mechanical failure modes',
        'Belt wear, damage and failure analysis'
      ]
    },
    {
      id: 2,
      badge: 'MECH',
      memberName: 'Basha Shaik',
      badgeBg: 'bg-[#9A5B3D]/15 text-[#9A5B3D] border-[#9A5B3D]/40',
      bg: 'bg-[#FDFFFF]',
      imgBg: 'bg-[#FDFFFF]',
      icon: Box,
      image: '/team-box2.png',
      title: 'Digital Twin & Simulation',
      area: '3D Simulation & Virtual Representation',
      hasFlip: true,
      responsibilities: [
        'Develop the conveyor digital twin',
        '3D representation of belt, rollers, pulleys and motor',
        'Simulate realistic belt movement',
        'Show sensor locations on the conveyor',
        'Visualize Normal / Warning / Critical conditions',
        'Connect the digital twin with live sensor data',
        'Represent real conveyor behaviour digitally'
      ]
    },
    {
      id: 3,
      badge: 'ECE',
      memberName: 'Viswaksen',
      badgeBg: 'bg-[#287F7A]/15 text-[#287F7A] border-[#287F7A]/40',
      bg: 'bg-[#FEFDFF]',
      imgBg: 'bg-[#FEFDFF]',
      icon: Activity,
      image: '/team-box3.png',
      title: 'Sensors & Measurement',
      area: 'IoT Telemetry & Signal Validation',
      hasFlip: true,
      responsibilities: [
        'Select appropriate sensors',
        'Vibration measurement',
        'Temperature measurement',
        'Motor/load-related sensing',
        'Sensor installation and placement',
        'Calibration and testing',
        'Noise and measurement-error handling',
        'Validate real-world sensor readings'
      ]
    },
    {
      id: 4,
      badge: 'ECE',
      memberName: 'Reshma',
      badgeBg: 'bg-[#287F7A]/15 text-[#287F7A] border-[#287F7A]/40',
      bg: 'bg-[#FDFFFF]',
      imgBg: 'bg-[#FDFFFF]',
      icon: Wifi,
      image: '/team-box4.png',
      title: 'ESP32 & IoT Communication',
      area: 'Microcontroller & Data Transmission',
      hasFlip: true,
      responsibilities: [
        'ESP32 programming',
        'Interface sensors with ESP32',
        'Sensor data acquisition',
        'Wi-Fi connectivity',
        'Real-time data transmission',
        'WebSocket communication',
        'Connection and communication reliability',
        'Send live sensor data to the backend'
      ]
    },
    {
      id: 5,
      badge: 'CSE',
      memberName: 'Gifty Sharon',
      badgeBg: 'bg-[#263238]/20 text-[#263238] border-[#263238]/40',
      bg: 'bg-[#FEFEFE]',
      imgBg: 'bg-[#FEFEFE]',
      isDark: false,
      icon: Brain,
      image: '/team-box5-v1.png',
      title: 'ML / AI & Health Prediction',
      area: 'Machine Learning & Predictive Intelligence',
      hasFlip: true,
      responsibilities: [
        'Process sensor data',
        'Detect abnormal behaviour',
        'Calculate belt health score',
        'Normal / Warning / Critical classification',
        'Trend and anomaly analysis',
        'Predict potential future belt damage',
        'Generate preventive alerts',
        'Provide maintenance recommendations'
      ]
    },
    {
      id: 6,
      badge: 'CSE',
      memberName: 'Suhashree Reddy',
      badgeBg: 'bg-[#263238]/20 text-[#263238] border-[#263238]/40',
      bg: 'bg-[#FBFBF3]',
      imgBg: 'bg-[#FBFBF3]',
      isDark: false,
      icon: Code,
      image: '/team-box6-v2.png',
      title: 'Frontend & Backend Engineer',
      area: 'Full-Stack Platform & System Integration',
      hasFlip: true,
      responsibilities: [
        'Develop React frontend',
        'Build monitoring dashboard',
        'FastAPI backend development',
        'MongoDB database integration',
        'WebSocket real-time data handling',
        'Display live sensor values',
        'Alerts and maintenance interface',
        'Connect all project modules into one system'
      ]
    }
  ];

  const workflowSteps = [
    { label: 'CONVEYOR', role: 'Mechanical' },
    { label: 'SENSORS', role: 'ECE Measurement' },
    { label: 'ESP32', role: 'IoT Telemetry' },
    { label: 'BACKEND', role: 'FastAPI Data Pipeline' },
    { label: 'ML / AI', role: 'Health Intelligence' },
    { label: 'DIGITAL TWIN & DASHBOARD', role: '3D Simulation & UI' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-[#263238] text-[#EEF1F2] border border-[#3A4950] rounded-2xl p-6 shadow-md text-center">
        <h1 className="text-2xl font-black uppercase tracking-widest text-[#EEF1F2] flex items-center justify-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#3F9692]" /> OUR TEAM
        </h1>
        <p className="text-sm text-[#C4CBCE] font-medium mt-2 max-w-3xl mx-auto italic">
          “Six specialized roles working together to build one intelligent conveyor monitoring system.”
        </p>
      </div>

      {/* 3 x 2 Grid Layout (6 Equal-Sized Boxes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teamCards.map((card) => {
          const Icon = card.icon;
          const isFlipped = !!flippedCards[card.id];
          const isDark = !!card.isDark;

          return (
            <div
              key={card.id}
              onClick={() => card.hasFlip && toggleFlip(card.id)}
              className={`border border-steel-border rounded-2xl p-5 shadow-xs transition-all duration-300 flex flex-col justify-between group min-h-[400px] ${
                card.bg || 'bg-card-soft'
              } ${
                card.hasFlip ? 'cursor-pointer hover:border-[#287F7A] hover:shadow-md' : 'hover:shadow-lg hover:border-[#287F7A]/60'
              }`}
            >
              {card.hasFlip && isFlipped ? (
                /* Back Side of Card (Details) */
                <div className="flex flex-col justify-between h-full animate-fadeIn">
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-steel-border pb-2.5">
                      <span className={`text-xs font-mono font-extrabold px-2.5 py-1 rounded-md border ${card.badgeBg}`}>
                        {card.badge} (Details)
                      </span>
                      <span className="text-[11px] font-mono text-[#287F7A] font-bold flex items-center gap-1">
                        <RotateCcw className="w-3.5 h-3.5" /> Flip Front
                      </span>
                    </div>

                    <h3 className={`font-extrabold text-base leading-snug ${isDark ? 'text-white' : 'text-industrial-dark'}`}>
                      {card.title}
                    </h3>
                    <p className={`text-xs font-semibold mt-0.5 mb-3 ${isDark ? 'text-slate-400' : 'text-industrial-steel'}`}>
                      {card.area}
                    </p>

                    <div className="space-y-1.5">
                      <span className={`text-[10px] font-mono uppercase font-bold tracking-wider block ${isDark ? 'text-slate-400' : 'text-industrial-steel'}`}>
                        Core Responsibilities:
                      </span>
                      <ul className={`space-y-1 text-xs ${isDark ? 'text-slate-200' : 'text-industrial-dark'}`}>
                        {card.responsibilities.map((resp, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 leading-tight">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#287F7A] mt-1 shrink-0"></span>
                            <span className="font-medium">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3"></div>
                </div>
              ) : (
                /* Front Side of Card */
                <div className="flex flex-col justify-between h-full">
                  <div>
                    {/* Header Row: Department Badge, Centered Member Name & Technical Icon */}
                    <div className="flex items-center justify-between mb-3 border-b border-steel-border pb-2.5 gap-2">
                      <span className={`text-xs font-mono font-extrabold px-2.5 py-1 rounded-md border shrink-0 ${card.badgeBg}`}>
                        {card.badge}
                      </span>
                      
                      {card.memberName && (
                        <span className={`text-sm font-black tracking-wider font-mono text-center flex-1 ${isDark ? 'text-white' : 'text-industrial-dark'}`}>
                          {card.memberName}
                        </span>
                      )}

                      <div className="p-2 bg-[#263238] text-[#3F9692] rounded-xl shadow-xs group-hover:bg-[#287F7A] group-hover:text-[#EEF1F2] transition-colors shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* If Card has Image (Box 1 and Box 6) */}
                    {card.image ? (
                      <div className="flex flex-col items-center text-center my-1">
                        <div className={`w-full h-52 my-1 flex items-center justify-center overflow-hidden ${card.imgBg || 'bg-transparent'}`}>
                          <img 
                            src={card.image} 
                            alt={card.title} 
                            className="h-full max-h-48 w-auto object-contain group-hover:scale-105 transition-transform duration-300" 
                          />
                        </div>
                        <h3 className={`font-extrabold text-base leading-snug transition-colors ${isDark ? 'text-white group-hover:text-[#3F9692]' : 'text-industrial-dark group-hover:text-[#287F7A]'}`}>
                          {card.title}
                        </h3>
                        <p className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-industrial-steel'}`}>
                          {card.area}
                        </p>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-extrabold text-base text-industrial-dark group-hover:text-[#287F7A] transition-colors leading-snug">
                          {card.title}
                        </h3>
                        <p className="text-xs font-semibold text-industrial-steel mt-1 mb-4">
                          {card.area}
                        </p>

                        <div className="space-y-2">
                          <span className="text-[10px] font-mono uppercase font-bold text-industrial-steel tracking-wider block">
                            Core Responsibilities:
                          </span>
                          <ul className="space-y-1.5 text-xs text-industrial-dark">
                            {card.responsibilities.map((resp, idx) => (
                              <li key={idx} className="flex items-start gap-2 leading-tight">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#287F7A] mt-1 shrink-0 group-hover:scale-125 transition-transform"></span>
                                <span className="group-hover:text-black font-medium">{resp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Team Workflow Visual Connection */}
      <div className="bg-card-soft border border-steel-border rounded-2xl p-5 shadow-xs">
        <div className="text-center mb-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-industrial-dark flex items-center justify-center gap-2">
            <Cpu className="w-4 h-4 text-[#287F7A]" /> INTEGRATED SYSTEM WORKFLOW
          </h3>
          <p className="text-xs text-industrial-steel mt-0.5">
            All six specialized engineering disciplines interlock to power continuous conveyor health monitoring
          </p>
        </div>

        {/* Workflow Chain */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
          {workflowSteps.map((step, idx) => (
            <div key={idx} className="flex items-center">
              <div className="bg-white border border-steel-border rounded-xl p-2.5 w-full text-center hover:border-[#287F7A] hover:shadow-xs transition-all">
                <span className="text-xs font-mono font-extrabold text-[#287F7A] block truncate">
                  {step.label}
                </span>
                <span className="text-[10px] text-industrial-steel font-medium block truncate mt-0.5">
                  {step.role}
                </span>
              </div>
              {idx < workflowSteps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-[#9A5B3D] shrink-0 mx-1 hidden lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
