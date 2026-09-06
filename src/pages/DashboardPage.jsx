import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Zap, 
  Gauge, 
  Thermometer, 
  Radio, 
  Volume2, 
  Weight, 
  PlayCircle,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Info,
  BellRing,
  Wrench,
  Clock,
  Sparkles,
  Cpu,
  RefreshCw,
  Server
} from 'lucide-react';
import { useConveyor } from '../context/ConveyorContext';
import { DigitalTwinCanvas } from '../components/DigitalTwinCanvas';

export const DashboardPage = () => {
  const { 
    sensors, 
    mlMetrics, 
    activeAnomaly, 
    injectAnomaly, 
    resetNormal,
    dataSourceMode,
    activeDeviceId,
    sensorSource,
    deviceStatus,
    lastSeenSecondsAgo
  } = useConveyor();

  const getStatusColor = (isNormal, isWarning, isCritical) => {
    if (isCritical) return 'text-status-critical bg-status-critical/10 border-status-critical/30';
    if (isWarning) return 'text-status-warning bg-status-warning/10 border-status-warning/30';
    return 'text-status-healthy bg-status-healthy/10 border-status-healthy/30';
  };

  const getStatusBadge = (condition) => {
    if (condition === 'CRITICAL') {
      return (
        <div className="flex items-center space-x-2 bg-status-critical/20 text-status-critical border border-status-critical px-3 py-1 rounded-full font-bold text-sm">
          <AlertTriangle className="w-4 h-4 animate-bounce" />
          <span>CRITICAL RISK</span>
        </div>
      );
    }
    if (condition === 'WARNING') {
      return (
        <div className="flex items-center space-x-2 bg-status-warning/20 text-status-warning border border-status-warning px-3 py-1 rounded-full font-bold text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>WARNING DEVIATION</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-2 bg-status-healthy/20 text-status-healthy border border-status-healthy px-3 py-1 rounded-full font-bold text-sm">
        <CheckCircle className="w-4 h-4" />
        <span>NORMAL - HEALTHY</span>
      </div>
    );
  };

  const getLivenessBadge = () => {
    if (dataSourceMode === 'DEMO') {
      return (
        <div className="flex items-center space-x-2 bg-[#D97706]/15 text-[#D97706] border border-[#D97706]/30 px-3 py-1 rounded-full font-mono font-extrabold text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] animate-pulse"></span>
          <span>🟡 SIMULATED VALUES</span>
        </div>
      );
    }

    if (deviceStatus === 'ONLINE') {
      return (
        <div className="flex items-center space-x-2 bg-[#2E9D59]/15 text-[#2E9D59] border border-[#2E9D59]/30 px-3 py-1 rounded-full font-mono font-extrabold text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2E9D59] animate-ping"></span>
          <span>🟢 LIVE ESP32 — ONLINE ({lastSeenSecondsAgo.toFixed(0)}s ago)</span>
        </div>
      );
    }

    if (deviceStatus === 'NO_RECENT_DATA') {
      return (
        <div className="flex items-center space-x-2 bg-[#D97706]/15 text-[#D97706] border border-[#D97706]/30 px-3 py-1 rounded-full font-mono font-extrabold text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span>
          <span>🟡 NO RECENT DATA</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 bg-[#D64545]/15 text-[#D64545] border border-[#D64545]/30 px-3 py-1 rounded-full font-mono font-extrabold text-xs">
        <span className="w-2.5 h-2.5 rounded-full bg-[#D64545]"></span>
        <span>🔴 ESP32 OFFLINE</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* LIVENESS INDICATOR & METRICS SNAPSHOT BANNER */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          {getLivenessBadge()}
        </div>

        {/* Live Key Metrics Snapshot Bar (3 Prototype Sensors) */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs border-t md:border-t-0 md:border-l border-[#E2E8F0] pt-3 md:pt-0 md:pl-4">
          <div className="bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-[#CBD5E1]">
            <span className="text-[10px] text-[#64748B] font-bold block uppercase">Vibration (MPU6050)</span>
            <strong className="text-sm text-[#172B3A] font-black">{sensors.vibration} mm/s</strong>
          </div>
          <div className="bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-[#CBD5E1]">
            <span className="text-[10px] text-[#64748B] font-bold block uppercase">Pulley Speed (HW-201)</span>
            <strong className="text-sm text-[#172B3A] font-black">{sensors.rpm || 50} RPM</strong>
          </div>
          <div className="bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-[#CBD5E1]">
            <span className="text-[10px] text-[#64748B] font-bold block uppercase">Belt Alignment (HW-201)</span>
            <strong className={`text-sm font-black ${sensors.alignment === 'MISALIGNED' || Math.abs(sensors.tracking) > 5 ? 'text-status-critical' : 'text-status-healthy'}`}>
              {sensors.alignment || (sensors.tracking > 5 ? 'MISALIGNED' : 'OK')}
            </strong>
          </div>
        </div>
      </div>

      {/* Interactive Anomaly Test Banner for Demonstration */}
      <div className="bg-card-soft border border-steel-border rounded-xl px-4 py-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 shrink-0">
          <div className="p-2 bg-industrial-teal text-white rounded-lg">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-industrial-dark text-xs uppercase tracking-wider block">
              LIVE SENSOR SCENARIO TESTER
            </span>
            <span className="text-xs text-industrial-steel">
              Test how AI & Digital Twin respond to real MPU6050 vibration spikes and HW-201 alignment drift.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 shrink-0 w-full md:w-auto">
          <button
            onClick={resetNormal}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              !activeAnomaly
                ? 'bg-industrial-teal text-white border-teal-800 shadow-xs'
                : 'bg-white hover:bg-slate-100 text-industrial-dark border-steel-border'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Normal Operation
          </button>

          <button
            onClick={() => injectAnomaly('MISALIGNMENT_SPIKE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
              activeAnomaly === 'MISALIGNMENT_SPIKE'
                ? 'bg-status-warning text-white border-amber-700 shadow-xs ring-2 ring-amber-400'
                : 'bg-white hover:bg-amber-50 text-status-warning border-status-warning/40'
            }`}
          >
            ⚡ Misalignment Drift
          </button>

          <button
            onClick={() => injectAnomaly('MOTOR_OVERHEAT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
              activeAnomaly === 'MOTOR_OVERHEAT'
                ? 'bg-industrial-rust text-white border-amber-900 shadow-xs'
                : 'bg-white hover:bg-orange-50 text-industrial-rust border-industrial-rust/40'
            }`}
          >
            ⚡ Speed Reduction
          </button>

          <button
            onClick={() => injectAnomaly('JOINT_RUPTURE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
              activeAnomaly === 'JOINT_RUPTURE'
                ? 'bg-status-critical text-white border-red-700 shadow-xs ring-2 ring-red-400'
                : 'bg-white hover:bg-red-50 text-status-critical border-status-critical/40'
            }`}
          >
            ⚠️ High Vibration Spike
          </button>
        </div>
      </div>

      {/* Main Grid Layout: Left Cards (ML Prediction & Sensors) + Right (Live Digital Twin) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): ML Health + Sensors */}
        <div className="lg:col-span-5 space-y-6">
          {/* Belt & Joint Health ML Card */}
          <div className="bg-card-soft border border-steel-border rounded-2xl p-5 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 border-b border-steel-border pb-2">
              <h3 className="font-bold text-sm text-industrial-dark uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-industrial-teal" />
                BELT & JOINT HEALTH (RANDOM FOREST ML)
              </h3>
              <span className="text-[10px] bg-industrial-dark text-slate-300 px-2 py-0.5 rounded font-mono">
                Random Forest Classifier
              </span>
            </div>

            <div className="flex items-center justify-between my-2">
              <div>
                {getStatusBadge(mlMetrics.condition)}
                <p className="text-xs text-industrial-steel mt-1.5">
                  {mlMetrics.condition === 'CRITICAL'
                    ? 'Immediate splice failure and belt tear risk detected!'
                    : mlMetrics.condition === 'WARNING'
                    ? 'Parameter deviation detected. Inspection recommended.'
                    : 'Conveyor system operating within optimal safe bounds'}
                </p>
              </div>

              {/* RUL Clock Badge */}
              <div className="text-right bg-white p-2.5 rounded-xl border border-steel-border shadow-sm">
                <span className="text-[10px] text-industrial-steel font-bold block uppercase">
                  ESTIMATED RUL
                </span>
                <span className="text-lg font-mono font-extrabold text-industrial-teal">
                  {mlMetrics.rulHours} <span className="text-xs">HRS</span>
                </span>
              </div>
            </div>

            {/* Health Score & Risk Progress Gauges */}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-steel-border">
              {/* Health Score */}
              <div className="bg-white p-3 rounded-xl border border-steel-border text-center">
                <span className="text-xs font-bold text-industrial-steel block mb-1">HEALTH SCORE</span>
                <div className="text-3xl font-extrabold font-mono text-industrial-dark">
                  {mlMetrics.healthScore}%
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      mlMetrics.healthScore > 80
                        ? 'bg-status-healthy'
                        : mlMetrics.healthScore > 60
                        ? 'bg-status-warning'
                        : 'bg-status-critical'
                    }`}
                    style={{ width: `${mlMetrics.healthScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Failure Risk */}
              <div className="bg-white p-3 rounded-xl border border-steel-border text-center">
                <span className="text-xs font-bold text-industrial-steel block mb-1">FAILURE RISK</span>
                <div className="text-3xl font-extrabold font-mono text-industrial-rust">
                  {mlMetrics.failureRisk}%
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      mlMetrics.failureRisk < 20
                        ? 'bg-status-healthy'
                        : mlMetrics.failureRisk < 40
                        ? 'bg-status-warning'
                        : 'bg-status-critical'
                    }`}
                    style={{ width: `${mlMetrics.failureRisk}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Sub Metrics Bar */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-200/60 p-2 rounded-lg flex justify-between">
                <span className="text-industrial-steel">Conveyor Status:</span>
                <span className="font-bold text-status-healthy uppercase">▶ RUNNING</span>
              </div>
              <div className="bg-slate-200/60 p-2 rounded-lg flex justify-between">
                <span className="text-industrial-steel">Belt Speed:</span>
                <span className="font-bold font-mono text-industrial-dark">{sensors.speed || 3.8} m/s</span>
              </div>
            </div>
          </div>

          {/* Live Sensor Readings Panel (3 Prototype Hardware Sensors) */}
          <div className="bg-card-soft border border-steel-border rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4 border-b border-steel-border pb-2">
              <h3 className="font-bold text-sm text-industrial-dark uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-industrial-teal" />
                LIVE SENSOR READINGS ({dataSourceMode === 'DEMO' ? '🟡 SIMULATED VALUES' : '🟢 REAL ESP32'})
              </h3>
              <span className="text-xs font-bold text-status-healthy bg-status-healthy/10 px-2 py-0.5 rounded border border-status-healthy/30 font-mono">
                {dataSourceMode === 'DEMO' ? '3 PROTOTYPE SENSORS' : `NODE: ${activeDeviceId}`}
              </span>
            </div>

            <div className="space-y-3">
              {/* Sensor 1: MPU6050 Vibration Sensor */}
              <div className="bg-white p-3 rounded-xl border border-steel-border flex items-center justify-between hover:bg-card-hover transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-teal-50 text-industrial-teal rounded-xl border border-teal-100">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-industrial-dark block">1. Vibration Sensor (MPU6050)</span>
                    <span className="text-[11px] text-industrial-steel">Tri-Axial Accel & Gyro | Limit: &lt; 3.0 mm/s</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-black text-base ${sensors.vibration > 4 ? 'text-status-critical' : 'text-industrial-dark'}`}>
                    {sensors.vibration} mm/s
                  </span>
                  <span className={`w-2.5 h-2.5 rounded-full inline-block ml-2 ${sensors.vibration > 4 ? 'bg-status-critical animate-ping' : 'bg-status-healthy'}`}></span>
                </div>
              </div>

              {/* Sensor 2: HW-201 Speed Encoder */}
              <div className="bg-white p-3 rounded-xl border border-steel-border flex items-center justify-between hover:bg-card-hover transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-industrial-dark block">2. Pulley Speed Sensor (HW-201 Encoder)</span>
                    <span className="text-[11px] text-industrial-steel">Reflective IR Pulse Interrupt | Linear: {sensors.speed || 1.57} m/s</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-base text-industrial-dark">
                    {sensors.rpm || 50} <span className="text-xs font-bold text-industrial-steel">RPM</span>
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-status-healthy inline-block ml-2"></span>
                </div>
              </div>

              {/* Sensor 3: HW-201 Belt Alignment Sensor */}
              <div className="bg-white p-3 rounded-xl border border-steel-border flex items-center justify-between hover:bg-card-hover transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-industrial-dark block">3. Belt Alignment Sensor (HW-201 IR)</span>
                    <span className="text-[11px] text-industrial-steel">Edge Drift Detector | Tracking Offset: &plusmn; {sensors.tracking || 1.2} mm</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-extrabold text-sm px-2 py-0.5 rounded border ${
                    sensors.alignment === 'MISALIGNED' || Math.abs(sensors.tracking) > 5
                      ? 'bg-red-50 text-status-critical border-red-200'
                      : 'bg-emerald-50 text-status-healthy border-emerald-200'
                  }`}>
                    {sensors.alignment || (sensors.tracking > 5 ? 'MISALIGNED' : 'OK')}
                  </span>
                  <span className={`w-2.5 h-2.5 rounded-full inline-block ml-2 ${
                    sensors.alignment === 'MISALIGNED' || Math.abs(sensors.tracking) > 5 ? 'bg-status-critical animate-ping' : 'bg-status-healthy'
                  }`}></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Live Digital Twin Viewport */}
        <div className="lg:col-span-7 flex flex-col">
          <DigitalTwinCanvas />
        </div>
      </div>
    </div>
  );
};
