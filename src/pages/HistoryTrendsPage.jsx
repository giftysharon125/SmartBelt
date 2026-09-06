import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Thermometer, 
  Weight, 
  Gauge, 
  BrainCircuit, 
  Wrench,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  X,
  Radio,
  MapPin,
  Maximize2
} from 'lucide-react';
import { useConveyor } from '../context/ConveyorContext';

export const HistoryTrendsPage = () => {
  const { sensors, mlMetrics, activeAnomaly } = useConveyor();

  // Selected Sensor Card for Detailed Modal
  const [selectedSensorModal, setSelectedSensorModal] = useState(null);

  // Hover state for What Changed rows
  const [hoveredWhatChanged, setHoveredWhatChanged] = useState(null);

  // Failure History Array (Dynamic from API / Fallback)
  const [failureHistory, setFailureHistory] = useState([
    {
      id: 'HIST-101',
      date: '18 Aug 2026',
      time: '02:35 PM',
      title: 'Increased vibration on Joint J-03',
      location: 'Joint J-03 (890m)',
      patternMatch: '82%',
      identifiedIssue: 'Belt Joint Deterioration',
      keyIndicators: [
        'High vibration (2/2)',
        'Temperature rise (2/2)'
      ],
      actionPerformed: 'Joint inspection & splice re-bonding',
      actionCode: 'ACT-03',
      performedBy: 'Maintenance Team',
      actionDate: '18 Aug 2026',
      resultOutcome: 'Condition Stabilized',
      resultExplanation: 'Vibration returned towards baseline and belt operated normally after maintenance.',
      effectiveness: '92%'
    },
    {
      id: 'HIST-102',
      date: '12 Aug 2026',
      time: '09:15 AM',
      title: 'Elevated temperature',
      location: 'Drive Pulley Bearing #2',
      patternMatch: '78%',
      identifiedIssue: 'Pulley Bearing Thermal Spike',
      keyIndicators: [
        'Bearing temp rise (2/2)',
        'Acoustic noise (1/2)'
      ],
      actionPerformed: 'Bearing re-lubrication & seal purge',
      actionCode: 'ACT-02',
      performedBy: 'Mechanical Tech Team',
      actionDate: '12 Aug 2026',
      resultOutcome: 'Temperature Normalized',
      resultExplanation: 'Bearing temperature dropped from 68°C to 47°C within 15 minutes of re-greasing.',
      effectiveness: '95%'
    },
    {
      id: 'HIST-103',
      date: '28 Jul 2026',
      time: '11:20 AM',
      title: 'Load variation detected',
      location: 'Return Idler Frame #14',
      patternMatch: '74%',
      identifiedIssue: 'Return Tracking Misalignment',
      keyIndicators: [
        'Optical tracking offset (2/2)',
        'Tension fluctuation (1/2)'
      ],
      actionPerformed: 'Tracking idler realignment & chute clearing',
      actionCode: 'ACT-01',
      performedBy: 'Conveyor Ops Team',
      actionDate: '28 Jul 2026',
      resultOutcome: 'Tracking Realigned',
      resultExplanation: 'Belt offset reduced from +4.2mm back to +1.1mm centered path.',
      effectiveness: '89%'
    }
  ]);

  // Selected Failure Stack Index (Default 0: 18 Aug 2026)
  const [selectedIncidentIdx, setSelectedIncidentIdx] = useState(0);

  // Fetch dynamic history from backend API if available
  useEffect(() => {
    fetch('http://localhost:8005/api/maintenance/history')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge API data format with UI fields
          const formatted = data.map((item, idx) => ({
            id: item.id || `HIST-${idx+1}`,
            date: item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '18 Aug 2026',
            time: '02:35 PM',
            title: item.title || item.problem || 'Incident Recorded',
            location: 'Conveyor Section #1',
            patternMatch: '82%',
            identifiedIssue: item.problem || 'Parameter Deviation',
            keyIndicators: ['Telemetry anomaly (2/2)', 'Threshold exceeded (1/2)'],
            actionPerformed: item.solution || 'Inspection & Maintenance',
            actionCode: `ACT-0${idx+1}`,
            performedBy: item.technician || 'Maintenance Team',
            actionDate: item.date || '18 Aug 2026',
            resultOutcome: item.result || 'Condition Stabilized',
            resultExplanation: item.result || 'System returned to nominal operating status after intervention.',
            effectiveness: '92%'
          }));
          setFailureHistory(formatted);
        }
      })
      .catch(() => {
        // Fallback to static default failureHistory
      });
  }, []);

  // Current selected incident
  const currentIncident = failureHistory[selectedIncidentIdx] || failureHistory[0];

  // Dynamic Status & Health Score Logic
  const getHealthStatus = () => {
    if (activeAnomaly === 'JOINT_RUPTURE' || mlMetrics?.condition === 'CRITICAL') {
      return {
        label: 'CRITICAL RISK',
        score: '58%',
        scoreNum: 58,
        desc: 'Immediate splice failure and belt tear risk detected. Action required.',
        bg: 'bg-[#D64545]',
        textColor: 'text-[#D64545]',
        border: 'border-[#D64545]/40',
        badgeBg: 'bg-[#D64545]/15'
      };
    }
    if (activeAnomaly === 'MISALIGNMENT_SPIKE' || activeAnomaly === 'MOTOR_OVERHEAT' || mlMetrics?.condition === 'WARNING') {
      return {
        label: 'WARNING DEVIATION',
        score: '78%',
        scoreNum: 78,
        desc: 'Abnormal parameter increase detected. Inspection recommended.',
        bg: 'bg-[#E9A23B]',
        textColor: 'text-[#E9A23B]',
        border: 'border-[#E9A23B]/40',
        badgeBg: 'bg-[#E9A23B]/15'
      };
    }
    return {
      label: 'STABLE',
      score: `${mlMetrics?.healthScore || 92}%`,
      scoreNum: mlMetrics?.healthScore || 92,
      desc: 'Operating Normally • All key parameters are within safe range.',
      bg: 'bg-[#2E9D59]',
      textColor: 'text-[#2E9D59]',
      border: 'border-[#2E9D59]/40',
      badgeBg: 'bg-[#2E9D59]/15'
    };
  };

  const currentStatus = getHealthStatus();

  // Dynamic Sensor Data for What Changed & Sensor Condition (3 Prototype Hardware Sensors)
  const currentVib = sensors.vibration;
  const currentRpm = sensors.rpm || 50;
  const currentSpeed = sensors.speed || 1.57;
  const currentTracking = sensors.tracking || 1.2;
  const currentAlignment = sensors.alignment || (currentTracking > 5 ? 'MISALIGNED' : 'OK');

  const whatChangedRows = [
    { 
      id: 'vib', 
      name: 'Vibration (MPU6050)', 
      icon: Activity, 
      val: `${currentVib} mm/s`, 
      change: currentVib > 4.0 ? '↑ 18%' : '→ Stable', 
      isAbnormal: currentVib > 3.0, 
      baseline: '1.8 mm/s', 
      desc: 'Tri-axial accelerometer & gyroscope vibration on drive housing.' 
    },
    { 
      id: 'rpm', 
      name: 'Pulley Speed (HW-201)', 
      icon: Gauge, 
      val: `${currentRpm} RPM`, 
      change: currentRpm < 40 ? '↓ Drop' : '→ Stable', 
      isAbnormal: currentRpm < 40, 
      baseline: '50 RPM', 
      desc: 'Reflective IR pulse encoder measuring pulley shaft rotational speed.' 
    },
    { 
      id: 'speed', 
      name: 'Linear Speed (HW-201)', 
      icon: Gauge, 
      val: `${currentSpeed} m/s`, 
      change: '→ Stable', 
      isAbnormal: false, 
      baseline: '1.57 m/s', 
      desc: 'Linear belt velocity derived from pulley encoder shaft pulses.' 
    },
    { 
      id: 'align', 
      name: 'Belt Alignment (HW-201)', 
      icon: Radio, 
      val: `${currentAlignment} (${currentTracking} mm)`, 
      change: currentAlignment === 'MISALIGNED' ? '↑ Drift' : '→ Centered', 
      isAbnormal: currentAlignment === 'MISALIGNED' || Math.abs(currentTracking) > 5, 
      baseline: '1.2 mm (OK)', 
      desc: 'Reflective IR edge sensor detecting belt tracking misalignment.' 
    }
  ];

  const sensorCards = [
    { 
      id: 'vib', 
      name: 'Vibration Sensor', 
      icon: Activity, 
      val: `${currentVib} mm/s`, 
      change: currentVib > 4.0 ? 'Increasing' : 'Stable', 
      isAbnormal: currentVib > 3.0, 
      location: 'Drive Motor & Joint J-03',
      threshold: '3.0 mm/s',
      baseline: '1.8 mm/s',
      trend: currentVib > 4.0 ? 'Upward Trend (+18%)' : 'Nominal Baseline',
      history: ['1.6 mm/s', '1.7 mm/s', '1.8 mm/s', `${currentVib} mm/s`]
    },
    { 
      id: 'rpm', 
      name: 'Pulley Speed Encoder', 
      icon: Gauge, 
      val: `${currentRpm} RPM`, 
      change: currentRpm < 40 ? 'Speed Reduction' : 'Stable', 
      isAbnormal: currentRpm < 40, 
      location: 'Head Drive Pulley Shaft',
      threshold: '40 RPM',
      baseline: '50 RPM',
      trend: currentRpm < 40 ? 'Reduced Speed' : 'Locked Speed (50 RPM)',
      history: ['50 RPM', '48 RPM', '49 RPM', `${currentRpm} RPM`]
    },
    { 
      id: 'speed', 
      name: 'Linear Belt Speed', 
      icon: Gauge, 
      val: `${currentSpeed} m/s`, 
      change: 'Stable', 
      isAbnormal: false, 
      location: 'Primary Overland Deck CV-01',
      threshold: '1.25 m/s',
      baseline: '1.57 m/s',
      trend: 'Optimal Conveyor Transport Speed',
      history: ['1.57 m/s', '1.55 m/s', '1.57 m/s', `${currentSpeed} m/s`]
    },
    { 
      id: 'align', 
      name: 'Belt Alignment Sensor', 
      icon: Radio, 
      val: `${currentAlignment}`, 
      change: currentAlignment === 'MISALIGNED' ? 'Edge Drift' : 'Centered', 
      isAbnormal: currentAlignment === 'MISALIGNED' || Math.abs(currentTracking) > 5, 
      location: 'Return Idler Outer Edge Zone',
      threshold: '5.0 mm offset',
      baseline: '1.2 mm offset (OK)',
      trend: currentAlignment === 'MISALIGNED' ? 'Side Misalignment' : 'Centered Tracking Path',
      history: ['1.1 mm', '1.2 mm', '1.3 mm', `${currentTracking} mm`]
    }
  ];

  return (
    <div className="space-y-6 text-[#172B3A] font-sans select-none pb-6 bg-[#F3F6F7] min-h-full">
      {/* ====================================================
          1. CONDITION SUMMARY (Dynamic Health & Status)
         ==================================================== */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          {/* Circular Status Health Indicator */}
          <div className={`w-14 h-14 rounded-2xl ${currentStatus.badgeBg} border ${currentStatus.border} flex items-center justify-center shrink-0 relative shadow-xs`}>
            <ShieldCheck className={`w-7 h-7 ${currentStatus.textColor}`} />
            <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full ${currentStatus.bg} ring-2 ring-white animate-pulse`}></span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">
                BELT CONDITION:
              </span>
              <span className={`text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-md border ${currentStatus.badgeBg} ${currentStatus.textColor} ${currentStatus.border}`}>
                {currentStatus.label}
              </span>
            </div>

            <div className="flex items-center space-x-3 mt-1">
              <h2 className="text-xl font-extrabold text-[#172B3A] tracking-wide">
                Health Score: <span className={currentStatus.textColor}>{currentStatus.score}</span>
              </h2>
            </div>

            <p className="text-xs text-[#667085] font-medium mt-0.5">
              {currentStatus.desc}
            </p>
          </div>
        </div>

        {/* Last Updated Timestamp */}
        <div className="flex items-center space-x-2.5 text-xs text-[#667085] font-mono bg-[#F8FAFC] px-3.5 py-2 rounded-xl border border-[#CBD5E1] shrink-0 shadow-2xs">
          <Clock className="w-4 h-4 text-[#159A9C]" />
          <span>Last Updated: <strong className="text-[#172B3A]">04 Sep 2026 10:45 PM</strong></span>
        </div>
      </div>

      {/* ====================================================
          2. WHAT CHANGED? & SENSOR CONDITION (2-Column Grid)
         ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* WHAT CHANGED? (6 Cols) - Sensor Comparison Rows */}
        <div className="lg:col-span-6 bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#172B3A] border-b border-[#CBD5E1] pb-2.5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#159A9C]" />
              WHAT CHANGED?
              <span className="text-[10px] font-normal text-[#667085] normal-case ml-auto">
                Key parameter variations from baseline
              </span>
            </h3>

            <div className="space-y-2.5 mt-3.5">
              {whatChangedRows.map((row) => {
                const Icon = row.icon;
                const isHovered = hoveredWhatChanged === row.id;

                return (
                  <div
                    key={row.id}
                    onMouseEnter={() => setHoveredWhatChanged(row.id)}
                    onMouseLeave={() => setHoveredWhatChanged(null)}
                    style={{ perspective: '600px' }}
                    className={`p-3 bg-[#F8FAFC] rounded-xl border transition-all duration-300 cursor-pointer space-y-1.5 ${
                      isHovered
                        ? 'border-[#2E9D59] bg-[#2E9D59]/10 shadow-xs [transform:rotateX(2deg)_translateZ(4px)]'
                        : 'border-[#CBD5E1] hover:border-[#2E9D59] hover:bg-[#2E9D59]/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-1.5 rounded-lg ${isHovered ? 'bg-[#2E9D59] text-white' : 'bg-[#123047]/10 text-[#123047]'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs text-[#172B3A]">{row.name}</span>
                      </div>

                      <div className="flex items-center space-x-3 font-mono">
                        <span className="font-extrabold text-xs text-[#172B3A]">{row.val}</span>
                        <span className={`text-xs font-extrabold ${row.isAbnormal ? 'text-[#E9A23B]' : 'text-[#2E9D59]'}`}>
                          {row.change}
                        </span>
                      </div>
                    </div>

                    {isHovered && (
                      <div className="pt-2 text-[11px] border-t border-[#2E9D59]/30 text-[#172B3A] animate-fadeIn">
                        <div className="font-mono text-[10px] text-[#667085]">Baseline: <strong>{row.baseline}</strong></div>
                        <p className="text-[#159A9C] font-medium mt-0.5">{row.desc}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SENSOR CONDITION (6 Cols) - Interactive Clickable Sensor Cards */}
        <div className="lg:col-span-6 bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#172B3A] border-b border-[#CBD5E1] pb-2.5 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#159A9C]" />
              SENSOR CONDITION
              <span className="text-[10px] font-normal text-[#667085] normal-case ml-auto">
                Click any sensor tile to inspect details
              </span>
            </h3>

            <div className="grid grid-cols-2 gap-3 mt-3.5">
              {sensorCards.map((tile) => {
                const Icon = tile.icon;

                return (
                  <div
                    key={tile.id}
                    onClick={() => setSelectedSensorModal(tile)}
                    className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#CBD5E1] transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[95px] hover:border-[#2E9D59] hover:bg-[#2E9D59]/10 hover:-translate-y-0.5 hover:shadow-xs group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-white rounded-lg text-[#159A9C] border border-[#CBD5E1] group-hover:border-[#2E9D59]">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[10px] font-mono text-[#667085] flex items-center gap-0.5 group-hover:text-[#2E9D59]">
                        Inspect <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#172B3A]">{tile.name}</span>
                        <span className="font-mono text-xs font-extrabold text-[#172B3A]">{tile.val}</span>
                      </div>
                      <span className={`text-[11px] font-extrabold flex items-center gap-1 mt-0.5 ${tile.isAbnormal ? 'text-[#E9A23B]' : 'text-[#2E9D59]'}`}>
                        {tile.change === 'Increasing' ? '↑ Increasing' : '→ Stable'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          4. PREVIOUS FAILURE PATTERN (Dynamic Stacked Failure-Event)
         ==================================================== */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs">
        <div className="border-b border-[#CBD5E1] pb-2.5 mb-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#172B3A] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#159A9C]" />
            PREVIOUS FAILURE PATTERN
          </h3>
          <p className="text-xs text-[#667085] font-medium mt-0.5">
            Past incidents, AI insights and maintenance outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* LEFT: 3D Metallic Stacked Failure Records with Corner Rivets */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="w-full bg-gradient-to-b from-[#DFE6EC] to-[#CFD9E1] border border-[#B0C0CC] rounded-2xl p-2.5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_8px_16px_rgba(0,0,0,0.08)] relative space-y-2">
              {failureHistory.map((inc, idx) => {
                const isSelected = selectedIncidentIdx === idx;

                // Color themes matching the reference metallic card stack
                const cardStyles = [
                  // Card 1 (Active Top Card - Cyan Metallic)
                  {
                    bg: isSelected 
                      ? 'bg-gradient-to-r from-[#C9E7EC] via-[#D5EEF2] to-[#E2F5F8] border-[#80C2CB] shadow-[0_6px_16px_rgba(21,154,156,0.3)] ring-2 ring-[#159A9C]/40 -translate-y-1' 
                      : 'bg-gradient-to-r from-[#D0EFF2]/80 to-[#E2F5F8]/80 border-[#9ACCCF] opacity-90',
                    textColor: 'text-[#123047]',
                    timeBg: 'bg-[#1C3243] text-white',
                    rivet: 'bg-[#70959E] border-[#4A6D75]'
                  },
                  // Card 2 (Middle Card - Silver Metallic)
                  {
                    bg: isSelected
                      ? 'bg-gradient-to-r from-[#BFCFD9] via-[#CBD8E2] to-[#D6E3ED] border-[#93A7B8] shadow-md ring-2 ring-[#159A9C]/40 -translate-y-1'
                      : 'bg-gradient-to-r from-[#C2CFD8] to-[#D8E2E9] border-[#9BB0C0]',
                    textColor: 'text-[#1E3342]',
                    timeBg: 'bg-[#2A3F4E] text-white',
                    rivet: 'bg-[#7C8F9E] border-[#536573]'
                  },
                  // Card 3 (Bottom Card - Darker Silver/Slate Metallic)
                  {
                    bg: isSelected
                      ? 'bg-gradient-to-r from-[#A7B7C5] via-[#B4C4D2] to-[#C1D1DF] border-[#8095A6] shadow-md ring-2 ring-[#159A9C]/40 -translate-y-1'
                      : 'bg-gradient-to-r from-[#A6B5C3] to-[#BDCBD6] border-[#899DAE]',
                    textColor: 'text-[#233746]',
                    timeBg: 'bg-[#314656] text-white',
                    rivet: 'bg-[#6D8090] border-[#475765]'
                  }
                ];

                const style = cardStyles[idx] || cardStyles[0];

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncidentIdx(idx)}
                    className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer relative ${style.bg}`}
                  >
                    {/* Metallic Screws / Rivets on 4 Corners */}
                    <span className={`w-1.5 h-1.5 rounded-full absolute top-1.5 left-1.5 border ${style.rivet} shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.4)]`}></span>
                    <span className={`w-1.5 h-1.5 rounded-full absolute top-1.5 right-1.5 border ${style.rivet} shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.4)]`}></span>
                    <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 left-1.5 border ${style.rivet} shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.4)]`}></span>
                    <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 right-1.5 border ${style.rivet} shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.4)]`}></span>

                    {/* Card Top Row: Date + Time Badge + Chevron */}
                    <div className="flex items-center justify-between mb-1.5 px-2">
                      <div className="flex items-center space-x-2">
                        <span className={`font-mono text-xs font-black ${style.textColor}`}>
                          {inc.date}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shadow-2xs ${style.timeBg}`}>
                          {inc.time}
                        </span>
                      </div>
                      <ChevronRight className={`w-4 h-4 font-black ${isSelected ? 'text-[#159A9C]' : 'text-[#506575]'}`} />
                    </div>

                    {/* Card Title */}
                    <p className={`text-xs font-extrabold line-clamp-1 px-2 ${style.textColor}`}>
                      {inc.title}
                    </p>
                  </div>
                );
              })}
            </div>

            <span className="text-xs font-mono font-black text-[#172B3A] mt-2.5 block text-center">
              3 previous occurrences
            </span>
          </div>

          {/* RIGHT: Connected 3-Stage Flow + 3D Industrial Conveyor Belt Graphic */}
          <div className="lg:col-span-8 relative flex flex-col justify-between space-y-4">
            {/* 3 Stage Cards with Connecting Arrows */}
            <div className="flex flex-col md:flex-row items-center gap-2 relative z-10">
              {/* STAGE 1: AI ASSESSMENT */}
              <div className="flex-1 bg-white border border-[#CBD5E1] rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full min-h-[170px]">
                <div>
                  <div className="flex items-center space-x-2 border-b border-[#E2E8F0] pb-2 mb-2.5">
                    <BrainCircuit className="w-4.5 h-4.5 text-[#159A9C]" />
                    <span className="text-xs font-bold text-[#486581]">AI Assessment</span>
                  </div>

                  <div className="text-center my-1.5">
                    <span className="text-2xl font-black font-mono text-[#123047] block">
                      {currentIncident.patternMatch}
                    </span>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase block tracking-wider">
                      Pattern Match
                    </span>
                  </div>

                  <h4 className="font-extrabold text-xs text-[#123047] mb-2">
                    {currentIncident.identifiedIssue}
                  </h4>

                  <div className="space-y-1 text-[11px] text-[#486581]">
                    <span className="font-bold text-[10px] block uppercase text-[#123047]">Key indicators:</span>
                    {currentIncident.keyIndicators.map((ind, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#159A9C] shrink-0"></span>
                        <span className="font-medium text-[11px]">{ind}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Connecting Arrow 1 */}
              <div className="hidden md:flex items-center justify-center px-1 text-[#159A9C]">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>

              {/* STAGE 2: ACTION PERFORMED */}
              <div className="flex-1 bg-white border border-[#CBD5E1] rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full min-h-[170px]">
                <div>
                  <div className="flex items-center space-x-2 border-b border-[#E2E8F0] pb-2 mb-2.5">
                    <Wrench className="w-4.5 h-4.5 text-[#159A9C]" />
                    <span className="text-xs font-bold text-[#486581]">Action Performed</span>
                  </div>

                  <h4 className="font-extrabold text-xs text-[#123047] mb-2 leading-snug">
                    {currentIncident.actionPerformed}
                  </h4>

                  <div className="inline-block bg-[#159A9C]/15 text-[#159A9C] text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-md border border-[#159A9C]/30 mb-3">
                    {currentIncident.actionCode}
                  </div>

                  <div className="space-y-1 text-[11px] text-[#486581] font-mono pt-1">
                    <div className="flex justify-between">
                      <span>Performed By:</span>
                      <strong className="text-[#123047] font-bold">{currentIncident.performedBy}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <strong className="text-[#123047] font-bold">{currentIncident.actionDate}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connecting Arrow 2 */}
              <div className="hidden md:flex items-center justify-center px-1 text-[#159A9C]">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>

              {/* STAGE 3: RESULT */}
              <div className="flex-1 bg-white border border-[#CBD5E1] rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full min-h-[170px]">
                <div>
                  <div className="flex items-center space-x-2 border-b border-[#E2E8F0] pb-2 mb-2.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-[#2E9D59]" />
                    <span className="text-xs font-bold text-[#486581]">Result</span>
                  </div>

                  <div className="bg-[#2E9D59]/15 text-[#2E9D59] border border-[#2E9D59]/30 p-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{currentIncident.resultOutcome}</span>
                  </div>

                  <p className="text-[11px] text-[#486581] leading-relaxed mb-3">
                    "{currentIncident.resultExplanation}"
                  </p>

                  <div className="flex justify-between text-[11px] font-mono pt-2 border-t border-[#CBD5E1]">
                    <span className="text-[#486581]">Effectiveness</span>
                    <strong className="text-[#2E9D59] font-black">{currentIncident.effectiveness}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 3D INDUSTRIAL CONVEYOR BELT GRAPHIC (Spanning across full width under stage cards) */}
            <div className="w-full pt-1 overflow-visible">
              <svg viewBox="0 0 800 115" className="w-full h-auto drop-shadow-md overflow-visible select-none">
                <defs>
                  {/* Metallic Roller Radial Gradient */}
                  <radialGradient id="rollerGrad" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="40%" stopColor="#CBD5E1" />
                    <stop offset="85%" stopColor="#64748B" />
                    <stop offset="100%" stopColor="#334155" />
                  </radialGradient>

                  {/* Pulley Drum Radial Gradient */}
                  <radialGradient id="pulleyGrad" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#E2E8F0" />
                    <stop offset="50%" stopColor="#94A3B8" />
                    <stop offset="100%" stopColor="#1E293B" />
                  </radialGradient>

                  {/* Frame Steel Beam Linear Gradient */}
                  <linearGradient id="frameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#64748B" />
                    <stop offset="25%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#1E293B" />
                  </linearGradient>

                  {/* Rubber Belt Loop Gradient */}
                  <linearGradient id="beltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="40%" stopColor="#1E293B" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </linearGradient>

                  {/* Iron Ore Rock 3D Gradient */}
                  <linearGradient id="oreHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#64748B" />
                    <stop offset="60%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </linearGradient>
                </defs>

                {/* Floor Contact Soft Shadow */}
                <ellipse cx="400" cy="108" rx="390" ry="5" fill="#000000" opacity="0.2" />

                {/* 4 Vertical Structural I-Beam Support Legs */}
                {[90, 290, 510, 710].map((xLoc, i) => (
                  <g key={i}>
                    {/* Vertical Beam */}
                    <rect x={xLoc - 6} y="62" width="12" height="42" fill="#334155" rx="1" />
                    <rect x={xLoc - 4} y="62" width="8" height="42" fill="#1E293B" />
                    {/* Base Foot Plate */}
                    <rect x={xLoc - 15} y="102" width="30" height="5" rx="1.5" fill="#475569" stroke="#0F172A" strokeWidth="0.8" />
                    <rect x={xLoc - 11} y="100" width="22" height="2" fill="#94A3B8" />
                  </g>
                ))}

                {/* Left & Right Pulley End Drums */}
                <circle cx="26" cy="46" r="17" fill="url(#pulleyGrad)" stroke="#0F172A" strokeWidth="1.5" />
                <circle cx="26" cy="46" r="6" fill="#0F172A" />
                <circle cx="774" cy="46" r="17" fill="url(#pulleyGrad)" stroke="#0F172A" strokeWidth="1.5" />
                <circle cx="774" cy="46" r="6" fill="#0F172A" />

                {/* Main Steel Frame Channel Beam */}
                <rect x="18" y="52" width="764" height="14" rx="3" fill="url(#frameGrad)" stroke="#0F172A" strokeWidth="1" />
                <rect x="20" y="53" width="760" height="2" fill="#94A3B8" opacity="0.8" />

                {/* Row of 3 Metallic Idler Rollers (2 at ends, 1 at middle) */}
                {[75, 400, 725].map((xPos, idx) => (
                  <g key={idx}>
                    <circle cx={xPos} cy="48" r="9" fill="url(#rollerGrad)" stroke="#1E293B" strokeWidth="1" />
                    <circle cx={xPos} cy="48" r="3.5" fill="#0F172A" />
                    <circle cx={xPos} cy="48" r="1.5" fill="#E2E8F0" />
                  </g>
                ))}

                {/* Top Rubber Conveyor Belt Strand */}
                <rect x="18" y="31" width="764" height="8" rx="2" fill="url(#beltGrad)" stroke="#0F172A" strokeWidth="0.8" />
                {/* Bottom Return Belt Strand */}
                <rect x="26" y="59" width="748" height="4" rx="1" fill="#0F172A" opacity="0.9" />

                {/* 3D Raw Iron Ore Payload Chunks (Resting on Top Belt) */}
                {/* Ore Group 1 (under Stage 1 AI Assessment, ~x=130) */}
                <g transform="translate(115, 14)">
                  <polygon points="0,17 8,5 22,1 34,7 40,17" fill="url(#oreHighlight)" stroke="#0F172A" strokeWidth="0.8" />
                  <polygon points="8,5 22,1 26,10 14,15" fill="#64748B" />
                  <polygon points="22,1 34,7 40,17 26,10" fill="#1E293B" />
                </g>
                <g transform="translate(155, 16)">
                  <polygon points="0,15 5,5 15,0 25,6 30,15" fill="url(#oreHighlight)" stroke="#0F172A" strokeWidth="0.8" />
                </g>

                {/* Ore Group 2 (under Stage 2 Action Performed, ~x=375) */}
                <g transform="translate(360, 13)">
                  <polygon points="0,18 9,5 24,0 36,8 44,18" fill="url(#oreHighlight)" stroke="#0F172A" strokeWidth="0.8" />
                  <polygon points="9,5 24,0 28,10 16,16" fill="#64748B" />
                  <polygon points="24,0 36,8 44,18 28,10" fill="#1E293B" />
                </g>
                <g transform="translate(405, 16)">
                  <polygon points="0,15 6,5 16,1 24,7 28,15" fill="url(#oreHighlight)" stroke="#0F172A" strokeWidth="0.8" />
                </g>

                {/* Ore Group 3 (under Stage 3 Result, ~x=625) */}
                <g transform="translate(610, 14)">
                  <polygon points="0,17 8,4 20,1 30,7 36,17" fill="url(#oreHighlight)" stroke="#0F172A" strokeWidth="0.8" />
                  <polygon points="8,4 20,1 24,10 14,15" fill="#64748B" />
                </g>
                <g transform="translate(650, 15)">
                  <polygon points="0,16 6,5 18,0 28,6 32,16" fill="url(#oreHighlight)" stroke="#0F172A" strokeWidth="0.8" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          SENSOR DETAIL MODAL (Opens when clicking any sensor card)
         ==================================================== */}
      {selectedSensorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#123047] text-[#159A9C] rounded-xl">
                  {React.createElement(selectedSensorModal.icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#172B3A]">
                    {selectedSensorModal.name} Sensor Analysis
                  </h3>
                  <span className="text-xs text-[#667085] font-medium flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#159A9C]" /> {selectedSensorModal.location}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSensorModal(null)}
                className="text-[#667085] hover:text-[#172B3A] p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#CBD5E1]">
                <span className="text-[10px] font-bold text-[#667085] block uppercase">Current Telemetry</span>
                <span className="text-lg font-mono font-black text-[#172B3A]">{selectedSensorModal.val}</span>
              </div>

              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#CBD5E1]">
                <span className="text-[10px] font-bold text-[#667085] block uppercase">Operating Threshold</span>
                <span className="text-lg font-mono font-black text-[#E9A23B]">{selectedSensorModal.threshold}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#667085]">Status:</span>
                <span className={`font-bold font-mono ${selectedSensorModal.isAbnormal ? 'text-[#E9A23B]' : 'text-[#2E9D59]'}`}>
                  {selectedSensorModal.change}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#667085]">Historical Baseline:</span>
                <span className="font-mono font-bold text-[#172B3A]">{selectedSensorModal.baseline}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#667085]">Trend Status:</span>
                <span className="font-bold text-[#159A9C]">{selectedSensorModal.trend}</span>
              </div>
            </div>

            {/* Historical Telemetry Values */}
            <div>
              <span className="text-[10px] uppercase font-bold text-[#667085] tracking-wider block mb-2">
                Recent Telemetry History (Last 4 Cycles)
              </span>
              <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                {selectedSensorModal.history.map((val, idx) => (
                  <div key={idx} className="bg-[#F8FAFC] p-2 rounded-lg border border-[#CBD5E1]">
                    <span className="text-[9px] text-[#667085] block">T-{4-idx}</span>
                    <strong className="text-[#172B3A] font-bold">{val}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#CBD5E1] flex justify-end">
              <button
                onClick={() => setSelectedSensorModal(null)}
                className="px-4 py-2 bg-[#123047] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#1C3D5A] transition-colors"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
