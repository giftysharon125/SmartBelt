import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Wrench, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Thermometer, 
  Weight, 
  Gauge, 
  Save, 
  RotateCcw, 
  ArrowRight, 
  TrendingDown, 
  Play, 
  Calendar, 
  Check, 
  CheckSquare, 
  Square,
  Sparkles
} from 'lucide-react';
import { useConveyor } from '../context/ConveyorContext';

export const AlertsMaintenancePage = () => {
  const { sensors, mlMetrics } = useConveyor();

  // Active View Mode: 'PRE_MAINTENANCE' (Image 1) | 'AFTER_MAINTENANCE' (Image 2)
  const [viewMode, setViewMode] = useState('PRE_MAINTENANCE');

  // Animation replay trigger state for After Maintenance view
  const [replayAnimKey, setReplayAnimKey] = useState(0);

  // Interactive Checklist State (4 Items matching Image 1)
  const [checklistItems, setChecklistItems] = useState([
    {
      id: 'item-1',
      title: 'Inspect Belt Joint',
      desc: 'Check for visible damage or wear.',
      completed: true
    },
    {
      id: 'item-2',
      title: 'Check Belt Alignment',
      desc: 'Verify belt is running centrally.',
      completed: true
    },
    {
      id: 'item-3',
      title: 'Inspect Rollers & Bearings',
      desc: 'Check for abnormal movement or noise.',
      completed: false
    },
    {
      id: 'item-4',
      title: 'Check Joint Temperature',
      desc: 'Verify temperature is within normal range.',
      completed: false
    }
  ]);

  // Toggle individual checklist item
  const toggleChecklistItem = (id) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  // Reset Checklist to default
  const handleResetChecklist = () => {
    setChecklistItems([
      { id: 'item-1', title: 'Inspect Belt Joint', desc: 'Check for visible damage or wear.', completed: false },
      { id: 'item-2', title: 'Check Belt Alignment', desc: 'Verify belt is running centrally.', completed: false },
      { id: 'item-3', title: 'Inspect Rollers & Bearings', desc: 'Check for abnormal movement or noise.', completed: false },
      { id: 'item-4', title: 'Check Joint Temperature', desc: 'Verify temperature is within normal range.', completed: false }
    ]);
    setViewMode('PRE_MAINTENANCE');
  };

  // Save Maintenance -> Transitions to After Maintenance view
  const handleSaveMaintenance = () => {
    // Mark all as completed when saving maintenance
    setChecklistItems(prev => prev.map(item => ({ ...item, completed: true })));
    setViewMode('AFTER_MAINTENANCE');
    setReplayAnimKey(prev => prev + 1);
  };

  // Dynamic values based on 3 prototype hardware sensors
  const currentVib = sensors?.vibration || 1.8;
  const currentRpm = sensors?.rpm || 50;
  const currentSpeed = sensors?.speed || 1.57;
  const currentTracking = sensors?.tracking || 1.2;
  const currentAlignment = sensors?.alignment || (currentTracking > 5 ? 'MISALIGNED' : 'OK');

  return (
    <div className="space-y-6 text-[#172B3A] font-sans select-none pb-10 bg-[#F3F6F7] min-h-full">

      {/* ====================================================
          TOP VIEW SWITCHER BAR (Pre-Maintenance vs Post-Maintenance Impact)
         ==================================================== */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#123047] text-[#159A9C] rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-[#172B3A] tracking-wide">
              Alerts & Predictive Maintenance Lifecycle
            </h1>
            <p className="text-xs text-[#64748B]">
              Real-time risk assessment & post-maintenance impact analysis
            </p>
          </div>
        </div>

        {/* View Mode Toggle Switch */}
        <div className="flex items-center bg-[#F8FAFC] p-1 rounded-xl border border-[#CBD5E1] font-mono text-xs font-bold">
          <button
            onClick={() => setViewMode('PRE_MAINTENANCE')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'PRE_MAINTENANCE'
                ? 'bg-[#159A9C] text-white shadow-2xs font-extrabold'
                : 'text-[#64748B] hover:text-[#172B3A]'
            }`}
          >
            Active Risk & Checklist
          </button>

          <button
            onClick={() => {
              setViewMode('AFTER_MAINTENANCE');
              setReplayAnimKey(prev => prev + 1);
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'AFTER_MAINTENANCE'
                ? 'bg-[#159A9C] text-white shadow-2xs font-extrabold'
                : 'text-[#64748B] hover:text-[#172B3A]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>After Maintenance Impact</span>
          </button>
        </div>
      </div>

      {/* ====================================================
          MODE 1: PRE-MAINTENANCE / ACTIVE RISK VIEW (IMAGE 1)
         ==================================================== */}
      {viewMode === 'PRE_MAINTENANCE' && (
        <div className="space-y-6 animate-fadeIn">

          {/* CARD 1: CONVEYOR RISK INDICATOR (PROJECT-THEMED) */}
          <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs space-y-6">
            <div className="flex items-center space-x-3 border-b border-[#E2E8F0] pb-3">
              <div className="p-2.5 bg-[#123047] text-[#159A9C] rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#172B3A]">
                  Conveyor Risk Indicator (Project-themed)
                </h2>
                <p className="text-xs text-[#64748B] font-medium">
                  Real-time assessment of conveyor belt health
                </p>
              </div>
            </div>

            {/* Conveyor Risk Spectrum Bar */}
            <div className="space-y-4 px-2">
              {/* Floating Indicator Tooltip Badge above bar */}
              <div className="relative h-7">
                <div 
                  className="absolute bottom-0 -translate-x-1/2 flex flex-col items-center transition-all duration-500"
                  style={{ left: '68%' }}
                >
                  <div className="bg-[#123047] text-white text-xs font-mono font-black px-3 py-1 rounded-md shadow-md flex items-center gap-1">
                    <span>68%</span>
                  </div>
                  <div className="w-2 h-2 bg-[#D97706] rotate-45 -mt-1"></div>
                </div>
              </div>

              {/* 4-Color Risk Segments Spectrum */}
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs font-bold text-[#64748B]">
                <div className="text-[#2E9D59]">Normal</div>
                <div className="text-[#E9A23B]">Watch</div>
                <div className="text-[#D97706]">Warning</div>
                <div className="text-[#D64545]">Danger</div>
              </div>

              <div className="h-3 rounded-full grid grid-cols-4 gap-1 bg-[#E2E8F0] p-0.5 overflow-hidden">
                <div className="bg-[#2E9D59] rounded-l-full"></div>
                <div className="bg-[#E9A23B]"></div>
                <div className="bg-[#D97706]"></div>
                <div className="bg-[#D64545] rounded-r-full"></div>
              </div>

              {/* Conveyor Belt Track Graphic with Idlers */}
              <div className="bg-[#123047] rounded-2xl p-2.5 shadow-inner border border-[#1C3D5A]">
                <div className="h-4 bg-[#1E293B] rounded-full border border-[#334155] relative flex items-center px-4 justify-between">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full border-2 border-[#64748B] bg-[#0F172A] flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-[#94A3B8]"></div>
                    </div>
                  ))}
                  {/* Indicator Dot on Conveyor Track */}
                  <div 
                    className="absolute w-3 h-3 bg-[#D97706] rounded-full ring-4 ring-[#D97706]/40 animate-ping"
                    style={{ left: '68%' }}
                  ></div>
                  <div 
                    className="absolute w-3 h-3 bg-[#D97706] rounded-full ring-2 ring-white"
                    style={{ left: '68%' }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Bottom Alert Details Banner */}
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#D97706]/15 text-[#D97706] rounded-lg border border-[#D97706]/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Predicted Issue</span>
                  <strong className="text-sm font-extrabold text-[#172B3A]">Possible Belt Joint Deterioration</strong>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border border-[#CBD5E1]">
                <Clock className="w-4 h-4 text-[#159A9C]" />
                <div>
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Estimated Risk Window</span>
                  <strong className="text-xs font-black text-[#172B3A]">6 – 10 hours</strong>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: WHY DID AI PREDICT THIS? */}
          <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs space-y-5">
            <div className="flex items-center space-x-3 border-b border-[#E2E8F0] pb-3">
              <div className="p-2.5 bg-[#123047] text-[#159A9C] rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#172B3A]">
                  Why did AI predict this?
                </h2>
                <p className="text-xs text-[#64748B] font-medium">
                  Here are the sensor values contributing to the alert.
                </p>
              </div>
            </div>

            {/* 4 Prototype Sensor Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vibration (MPU6050) */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#CBD5E1] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-[#159A9C]/15 text-[#159A9C] rounded-xl border border-[#159A9C]/30">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#64748B] block">Vibration (MPU6050)</span>
                    <strong className="text-base font-mono font-black text-[#D97706]">{currentVib} mm/s</strong>
                  </div>
                </div>
              </div>

              {/* Belt Alignment (HW-201) */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#CBD5E1] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-[#D97706]/15 text-[#D97706] rounded-xl border border-[#D97706]/30">
                    <Activity className="w-5 h-5 text-[#D97706]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#64748B] block">Belt Alignment (HW-201 IR)</span>
                    <strong className="text-base font-mono font-black text-[#D97706]">{currentAlignment} ({currentTracking} mm)</strong>
                  </div>
                </div>
              </div>

              {/* Pulley Speed (HW-201) */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#CBD5E1] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-[#159A9C]/15 text-[#159A9C] rounded-xl border border-[#159A9C]/30">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#64748B] block">Pulley Speed (HW-201 IR)</span>
                    <strong className="text-base font-mono font-black text-[#172B3A]">{currentRpm} RPM</strong>
                  </div>
                </div>
              </div>

              {/* Belt Linear Speed */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#CBD5E1] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-[#159A9C]/15 text-[#159A9C] rounded-xl border border-[#159A9C]/30">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#64748B] block">Linear Speed</span>
                    <strong className="text-base font-mono font-black text-[#172B3A]">{currentSpeed} m/s</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation Strip */}
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-3.5 flex items-center space-x-3 text-xs">
              <div className="p-1.5 bg-[#D97706]/15 text-[#D97706] rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="font-mono">
                <strong className="text-[#172B3A] font-bold">Why this alert?</strong>
                <span className="text-[#64748B] ml-2 font-sans font-medium">
                  Elevated MPU6050 vibration or HW-201 edge misalignment detected on prototype hardware sensors.
                </span>
              </div>
            </div>
          </div>

          {/* CARD 3: RECOMMENDED MAINTENANCE */}
          <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs space-y-5">
            <div className="flex items-center space-x-3 border-b border-[#E2E8F0] pb-3">
              <div className="p-2.5 bg-[#123047] text-[#159A9C] rounded-xl">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#172B3A]">
                  Recommended Maintenance
                </h2>
                <p className="text-xs text-[#64748B] font-medium">
                  Complete the checks and save the record.
                </p>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2.5">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                    item.completed
                      ? 'bg-[#2E9D59]/5 border-[#2E9D59]/30'
                      : 'bg-[#F8FAFC] border-[#CBD5E1] hover:border-[#159A9C]'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`p-1 rounded ${item.completed ? 'text-[#2E9D59]' : 'text-[#64748B]'}`}>
                      {item.completed ? (
                        <CheckSquare className="w-5 h-5 text-[#2E9D59]" />
                      ) : (
                        <Square className="w-5 h-5 text-[#64748B]" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-[#172B3A]">{item.title}</h4>
                      <p className="text-[11px] text-[#64748B] font-medium">{item.desc}</p>
                    </div>
                  </div>

                  <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                    item.completed
                      ? 'bg-[#2E9D59]/15 text-[#2E9D59] border border-[#2E9D59]/30'
                      : 'bg-[#D97706]/15 text-[#D97706] border border-[#D97706]/30'
                  }`}>
                    {item.completed ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending</span>
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={handleSaveMaintenance}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#159A9C] hover:bg-[#117B7D] text-white rounded-xl text-xs font-mono font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Maintenance</span>
              </button>

              <button
                onClick={handleResetChecklist}
                className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-50 text-[#64748B] border border-[#CBD5E1] rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Checklist</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MODE 2: AFTER MAINTENANCE / POST-MAINTENANCE IMPACT (IMAGE 2)
         ==================================================== */}
      {viewMode === 'AFTER_MAINTENANCE' && (
        <div key={replayAnimKey} className="space-y-6 animate-fadeIn">

          {/* CARD 1: AFTER MAINTENANCE 3-STAGE IMPACT FLOW */}
          <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#123047] text-white flex items-center justify-center font-mono font-extrabold text-sm">
                  4
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#172B3A]">
                    After Maintenance
                  </h2>
                  <p className="text-xs text-[#64748B] font-medium">
                    What happened after the maintenance action?
                  </p>
                </div>
              </div>

              <button
                onClick={() => setReplayAnimKey(prev => prev + 1)}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#172B3A] rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-2xs cursor-pointer self-start sm:self-center"
              >
                <Play className="w-3.5 h-3.5 text-[#159A9C] fill-[#159A9C]" />
                <span>Replay Animation</span>
              </button>
            </div>

            {/* 3-Stage Impact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* STAGE 1: Before Maintenance */}
              <div className="bg-[#D97706]/10 border border-[#D97706]/30 rounded-2xl p-5 text-center space-y-2 relative shadow-xs">
                <span className="inline-block bg-[#D97706] text-white text-[10px] font-mono font-extrabold px-3 py-0.5 rounded-full uppercase">
                  Before Maintenance
                </span>

                <div className="pt-2">
                  <div className="flex items-center justify-center gap-2 text-[#D97706] font-extrabold text-base">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Warning 68% Risk</span>
                  </div>
                  <p className="text-xs text-[#64748B] font-medium mt-1">
                    Possible Belt Joint Deterioration
                  </p>
                </div>
              </div>

              {/* STAGE 2: Maintenance Performed */}
              <div className="bg-[#159A9C]/10 border border-[#159A9C]/30 rounded-2xl p-5 text-center space-y-2 relative shadow-xs">
                <span className="inline-block bg-[#159A9C] text-white text-[10px] font-mono font-extrabold px-3 py-0.5 rounded-full uppercase flex items-center gap-1 justify-center mx-auto w-fit">
                  <Wrench className="w-3 h-3" />
                  <span>Maintenance Performed</span>
                </span>

                <div className="pt-2 text-xs font-semibold text-[#172B3A] space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-[#2E9D59]">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Belt Joint Inspected</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[#2E9D59]">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Alignment Checked</span>
                  </div>
                </div>
              </div>

              {/* STAGE 3: After Maintenance */}
              <div className="bg-[#2E9D59]/10 border border-[#2E9D59]/30 rounded-2xl p-5 text-center space-y-2 relative shadow-xs">
                <span className="inline-block bg-[#2E9D59] text-white text-[10px] font-mono font-extrabold px-3 py-0.5 rounded-full uppercase">
                  After Maintenance
                </span>

                <div className="pt-2">
                  <div className="flex items-center justify-center gap-2 text-[#2E9D59] font-extrabold text-base">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Normal 24% Risk</span>
                  </div>
                  <p className="text-xs text-[#2E9D59] font-bold mt-1">
                    Condition Stabilized
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Conveyor Track Repair Visual */}
            <div className="bg-[#123047] rounded-2xl p-3 shadow-inner border border-[#1C3D5A] relative">
              <div className="h-5 bg-[#1E293B] rounded-full border border-[#334155] relative flex items-center px-4 justify-between overflow-hidden">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-3 h-3 rounded-full border-2 border-[#64748B] bg-[#0F172A] flex items-center justify-center shrink-0">
                    <div className="w-1 h-1 rounded-full bg-[#94A3B8]"></div>
                  </div>
                ))}

                {/* Point 1: Before Maintenance (Warning 68%) */}
                <div className="absolute left-[20%] flex items-center justify-center">
                  <div className="w-5 h-5 bg-[#D97706]/40 rounded-full animate-ping"></div>
                  <div className="w-4 h-4 bg-[#D97706] rounded-full border-2 border-white absolute"></div>
                </div>

                {/* Middle Wrench Repair Icon */}
                <div className="absolute left-[50%] -translate-x-1/2 bg-[#159A9C] p-1.5 rounded-full border-2 border-white shadow-md animate-bounce">
                  <Wrench className="w-4 h-4 text-white" />
                </div>

                {/* Point 2: After Maintenance (Normal 24%) */}
                <div className="absolute right-[20%] flex items-center justify-center">
                  <div className="w-5 h-5 bg-[#2E9D59]/40 rounded-full animate-ping"></div>
                  <div className="w-4 h-4 bg-[#2E9D59] rounded-full border-2 border-white absolute"></div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: SENSOR READINGS COMPARISON */}
          <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-[#123047] text-[#159A9C] rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#172B3A]">
                    Sensor Readings Comparison
                  </h2>
                  <p className="text-xs text-[#64748B] font-medium">
                    Key sensor values before and after maintenance.
                  </p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center space-x-4 font-mono text-xs">
                <span className="flex items-center gap-1.5 text-[#64748B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D64545]"></span>
                  Before Maintenance
                </span>
                <span className="flex items-center gap-1.5 text-[#64748B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2E9D59]"></span>
                  After Maintenance
                </span>
              </div>
            </div>

            {/* 4 Sensor Comparison Grid (2x2 Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Vibration Comparison */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#CBD5E1] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-[#159A9C]/15 text-[#159A9C] rounded-xl border border-[#159A9C]/30">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#64748B]">Vibration (MPU6050)</span>
                    <span className="text-[10px] text-[#64748B] font-mono block">mm/s</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 font-mono">
                  <span className="px-2.5 py-1 bg-[#D64545]/15 text-[#D64545] font-black text-xs rounded-md border border-[#D64545]/30">
                    5.8
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#64748B]" />
                  <span className="px-2.5 py-1 bg-[#2E9D59]/15 text-[#2E9D59] font-black text-xs rounded-md border border-[#2E9D59]/30">
                    1.8
                  </span>
                  <span className="text-xs font-extrabold text-[#2E9D59] flex items-center gap-0.5 ml-2">
                    <TrendingDown className="w-3.5 h-3.5" /> 69% reduction
                  </span>
                </div>
              </div>

              {/* Belt Alignment Comparison */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#CBD5E1] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-[#D97706]/15 text-[#D97706] rounded-xl border border-[#D97706]/30">
                    <Activity className="w-5 h-5 text-[#D97706]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#64748B]">Belt Alignment (HW-201)</span>
                    <span className="text-[10px] text-[#64748B] font-mono block">Offset mm</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 font-mono">
                  <span className="px-2.5 py-1 bg-[#D64545]/15 text-[#D64545] font-black text-xs rounded-md border border-[#D64545]/30">
                    8.5 mm (MISALIGNED)
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#64748B]" />
                  <span className="px-2.5 py-1 bg-[#2E9D59]/15 text-[#2E9D59] font-black text-xs rounded-md border border-[#2E9D59]/30">
                    1.2 mm (OK)
                  </span>
                  <span className="text-xs font-extrabold text-[#2E9D59] flex items-center gap-0.5 ml-2">
                    <TrendingDown className="w-3.5 h-3.5" /> Re-centered
                  </span>
                </div>
              </div>

              {/* Pulley Speed Comparison */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#CBD5E1] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-[#159A9C]/15 text-[#159A9C] rounded-xl border border-[#159A9C]/30">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#64748B]">Pulley Speed (HW-201)</span>
                    <span className="text-[10px] text-[#64748B] font-mono block">RPM</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 font-mono">
                  <span className="px-2.5 py-1 bg-[#D64545]/15 text-[#D64545] font-black text-xs rounded-md border border-[#D64545]/30">
                    35 RPM
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#64748B]" />
                  <span className="px-2.5 py-1 bg-[#2E9D59]/15 text-[#2E9D59] font-black text-xs rounded-md border border-[#2E9D59]/30">
                    50 RPM
                  </span>
                  <span className="text-xs font-extrabold text-[#2E9D59] flex items-center gap-0.5 ml-2">
                    Restored
                  </span>
                </div>
              </div>

              {/* Linear Speed Comparison */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#CBD5E1] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-[#159A9C]/15 text-[#159A9C] rounded-xl border border-[#159A9C]/30">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#64748B]">Linear Speed</span>
                    <span className="text-[10px] text-[#64748B] font-mono block">m/s</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 font-mono">
                  <span className="px-2.5 py-1 bg-[#D64545]/15 text-[#D64545] font-black text-xs rounded-md border border-[#D64545]/30">
                    1.1 m/s
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#64748B]" />
                  <span className="px-2.5 py-1 bg-[#2E9D59]/15 text-[#2E9D59] font-black text-xs rounded-md border border-[#2E9D59]/30">
                    1.57 m/s
                  </span>
                  <span className="text-xs font-extrabold text-[#2E9D59] flex items-center gap-0.5 ml-2">
                    Nominal
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: CONDITION STABILIZED SUMMARY BANNER */}
          <div className="bg-[#2E9D59]/10 border border-[#2E9D59]/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[#2E9D59] text-white rounded-2xl shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#2E9D59]">
                  Condition Stabilized
                </h3>
                <p className="text-xs text-[#172B3A] font-medium mt-0.5">
                  Sensor readings improved after maintenance. The conveyor is now operating within normal range.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-xl border border-[#2E9D59]/30 shrink-0 font-mono text-xs">
              <Calendar className="w-4 h-4 text-[#159A9C]" />
              <div>
                <span className="text-[10px] text-[#64748B] font-bold block uppercase">Maintenance Completed</span>
                <strong className="text-xs font-black text-[#172B3A]">05 Sep 2026, 12:15 AM</strong>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
