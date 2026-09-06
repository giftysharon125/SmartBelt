import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Thermometer, 
  Clock, 
  History, 
  Zap, 
  Sliders, 
  Flame, 
  RotateCcw,
  Info
} from 'lucide-react';
import { useConveyor } from '../context/ConveyorContext';

export const FailurePredictionPage = () => {
  const { sensors, mlMetrics, activeAnomaly } = useConveyor();
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Dynamic system values with clean defaults matching prompt specifications
  let failureProb = 68;
  let predictedCondition = 'WARNING';
  let modelConfidence = '89%';
  let lastPredictionTime = '10:42 AM';

  if (activeAnomaly === 'JOINT_RUPTURE' || mlMetrics.condition === 'CRITICAL') {
    failureProb = 92;
    predictedCondition = 'CRITICAL';
    modelConfidence = '94%';
  } else if (!activeAnomaly && mlMetrics.condition === 'NORMAL') {
    failureProb = 12;
    predictedCondition = 'NORMAL';
    modelConfidence = '91%';
  }

  // Section 2: Sensor parameters contributing to prediction (3 Prototype Hardware Sensors)
  const getSensorParameters = () => {
    const vib = sensors.vibration || 1.8;
    const rpm = sensors.rpm || 50;
    const speed = sensors.speed || 1.57;
    const tracking = sensors.tracking || 1.2;
    const align = sensors.alignment || (tracking > 5 ? 'MISALIGNED' : 'OK');

    if (predictedCondition === 'CRITICAL') {
      return [
        { name: 'Vibration (MPU6050)', value: `${vib} mm/s`, status: 'HIGH', isAbnormal: true },
        { name: 'Belt Alignment (HW-201)', value: `${align} (${tracking} mm)`, status: 'DRIFT', isAbnormal: true },
        { name: 'Pulley Speed (HW-201)', value: `${rpm} RPM`, status: 'REDUCED', isAbnormal: true },
        { name: 'Linear Speed (HW-201)', value: `${speed} m/s`, status: 'SLOWNESS', isAbnormal: true },
      ];
    }
    if (predictedCondition === 'WARNING') {
      return [
        { name: 'Vibration (MPU6050)', value: `${vib} mm/s`, status: 'ELEVATED', isAbnormal: true },
        { name: 'Belt Alignment (HW-201)', value: `${align} (${tracking} mm)`, status: 'WARNING', isAbnormal: true },
        { name: 'Pulley Speed (HW-201)', value: `${rpm} RPM`, status: 'NORMAL', isAbnormal: false },
        { name: 'Linear Speed (HW-201)', value: `${speed} m/s`, status: 'NORMAL', isAbnormal: false },
      ];
    }
    return [
      { name: 'Vibration (MPU6050)', value: `${vib} mm/s`, status: 'NORMAL', isAbnormal: false },
      { name: 'Belt Alignment (HW-201)', value: `${align} (${tracking} mm)`, status: 'NORMAL', isAbnormal: false },
      { name: 'Pulley Speed (HW-201)', value: `${rpm} RPM`, status: 'NORMAL', isAbnormal: false },
      { name: 'Linear Speed (HW-201)', value: `${speed} m/s`, status: 'NORMAL', isAbnormal: false },
    ];
  };

  const sensorParams = getSensorParameters();

  // Concise explanation for Section 2
  const getExplanation = () => {
    if (predictedCondition === 'CRITICAL') {
      return "Severe vibration spike combined with belt misalignment drift indicates imminent splice delamination and edge tear risk.";
    }
    if (predictedCondition === 'WARNING') {
      return "Elevated vibration combined with HW-201 edge tracking deviation is contributing to the current belt risk.";
    }
    return "All 3 prototype sensors (MPU6050 Vibration, HW-201 Speed, HW-201 Alignment) are operating within safe bounds.";
  };

  // Section 5: Historical Failure Records
  const historicalRecords = [
    { date: '02 Sep 2026', condition: 'Joint deterioration', cause: 'High vibration spike', trigger: '4.8 mm/s', action: 'Joint inspected & splice re-bonded' },
    { date: '18 Aug 2026', condition: 'Belt edge drift', cause: 'Tracking misalignment', trigger: '8.5 mm (MISALIGNED)', action: 'Tracking idler realigned' },
    { date: '05 Aug 2026', condition: 'Pulley slip', cause: 'Speed reduction', trigger: '35 RPM', action: 'Take-up tension recalibrated' },
    { date: '21 Jul 2026', condition: 'Vibration anomaly', cause: 'Bearing unbalance', trigger: '5.2 mm/s', action: 'Bearing re-greased' },
  ];

  const displayedRecords = showAllHistory ? historicalRecords : historicalRecords.slice(0, 3);

  // 3 Main Square Flip Cards for Section 4
  const main3FlipCards = [
    {
      title: 'Belt Joint Inspection',
      icon: Zap,
      badge: 'JOINT SPLICE',
      why: 'Elevated MPU6050 vibration indicates increased mechanical stress around the belt joint splice.',
      action: 'Inspect the belt joint/splice at the next safe shutdown.',
    },
    {
      title: 'Belt Alignment Check',
      icon: Sliders,
      badge: 'TRACKING',
      why: 'HW-201 reflective IR edge detector indicates tracking misalignment drift outside normal flight path.',
      action: 'Check belt tracking and self-aligning idler frame position.',
    },
    {
      title: 'Pulley Speed Audit',
      icon: Flame,
      badge: 'SPEED ENCODER',
      why: 'HW-201 pulley encoder indicates rotational speed drop below baseline 50 RPM.',
      action: 'Inspect drive pulley friction, motor coupling, and speed sensor alignment.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-industrial-dark">
      {/* ====================================================
          SECTION 1 — CURRENT FAILURE RISK
         ==================================================== */}
      <div className="bg-card-soft border border-steel-border rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-industrial-steel mb-3 pb-2 border-b border-steel-border">
          CURRENT FAILURE RISK
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-3.5 rounded-lg border border-steel-border">
            <span className="text-[10px] font-bold uppercase text-industrial-steel block">Failure Probability</span>
            <span className="text-2xl font-mono font-extrabold text-industrial-dark">{failureProb}%</span>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-steel-border">
            <span className="text-[10px] font-bold uppercase text-industrial-steel block">Predicted Condition</span>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
              predictedCondition === 'CRITICAL'
                ? 'bg-status-critical text-white'
                : predictedCondition === 'WARNING'
                ? 'bg-status-warning text-white'
                : 'bg-status-healthy text-white'
            }`}>
              {predictedCondition}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-steel-border">
            <span className="text-[10px] font-bold uppercase text-industrial-steel block">Model Confidence</span>
            <span className="text-xl font-mono font-bold text-industrial-teal">{modelConfidence}</span>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-steel-border">
            <span className="text-[10px] font-bold uppercase text-industrial-steel block">Last Prediction</span>
            <span className="text-sm font-mono font-bold text-industrial-dark">{lastPredictionTime}</span>
          </div>
        </div>

        {/* Risk Progress Bar */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-industrial-steel mb-1">
            <span>Risk Level</span>
            <span className="font-mono">{failureProb}%</span>
          </div>
          <div className="w-full bg-slate-300 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                failureProb > 80
                  ? 'bg-status-critical'
                  : failureProb > 40
                  ? 'bg-status-warning'
                  : 'bg-status-healthy'
              }`}
              style={{ width: `${failureProb}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* ====================================================
          MIDDLE GRID: SECTION 2 & SECTION 3
         ==================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* SECTION 2 — WHY IS THE RISK HIGH? (7 Cols) */}
        <div className="md:col-span-7 bg-card-soft border border-steel-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-industrial-dark mb-3 pb-2 border-b border-steel-border flex items-center gap-2">
              <Activity className="w-4 h-4 text-industrial-teal" />
              WHY IS THE RISK HIGH?
            </h3>

            {/* Sensor Parameter Rows with Very Soft Pastel Beige-Yellow Hover Highlight */}
            <div className="space-y-2.5">
              {sensorParams.map((param, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border bg-white border-steel-border text-xs transition-all duration-200 cursor-pointer hover:border-yellow-300 hover:ring-2 hover:ring-yellow-200/80 hover:bg-yellow-50/90 hover:shadow-sm"
                >
                  <span className="font-semibold text-industrial-dark text-sm">{param.name}</span>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-industrial-dark text-sm">{param.value}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        param.status === 'HIGH' || param.status === 'CRITICAL'
                          ? 'bg-status-critical text-white'
                          : param.status === 'ELEVATED'
                          ? 'bg-status-warning text-white'
                          : 'bg-status-healthy text-white'
                      }`}
                    >
                      {param.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-steel-border text-xs text-industrial-dark bg-white p-3 rounded-lg border border-steel-border">
            <p className="leading-relaxed font-medium">
              "{getExplanation()}"
            </p>
          </div>
        </div>

        {/* SECTION 3 — ESTIMATED OPERATING WINDOW (CIRCULAR TIMER GAUGE) (5 Cols) */}
        <div className="md:col-span-5 bg-card-soft border border-steel-border rounded-xl p-5 shadow-sm flex flex-col items-center justify-between">
          <div className="w-full">
            <h3 className="text-xs font-bold uppercase tracking-wider text-industrial-dark mb-3 pb-2 border-b border-steel-border flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-industrial-teal" />
              ESTIMATED OPERATING WINDOW
            </h3>
          </div>

          {/* Circular Timer Shape Gauge */}
          <div className="my-2 flex flex-col items-center justify-center">
            <div className={`w-40 h-40 rounded-full border-4 border-dashed flex flex-col items-center justify-center p-3 text-center shadow-inner transition-all ${
              predictedCondition === 'CRITICAL'
                ? 'border-status-critical bg-status-critical/10 text-status-critical'
                : 'border-industrial-teal bg-white text-industrial-dark'
            }`}>
              {predictedCondition === 'CRITICAL' ? (
                <div className="space-y-1">
                  <AlertTriangle className="w-7 h-7 text-status-critical mx-auto animate-bounce" />
                  <span className="text-xs font-extrabold uppercase block text-status-critical leading-tight">
                    IMMEDIATE INSPECTION RECOMMENDED
                  </span>
                </div>
              ) : (
                <>
                  <span className="text-2xl font-mono font-extrabold text-industrial-dark">
                    02:30:00
                  </span>
                  <span className="text-[10px] font-bold text-industrial-steel uppercase tracking-wider mt-1">
                    ~ 2.5 HOURS
                  </span>
                </>
              )}
            </div>

            <span className="text-[11px] font-bold text-industrial-steel uppercase tracking-wider mt-2">
              Estimated Remaining Operating Time
            </span>
          </div>

          <div className="w-full mt-3 p-3 bg-white rounded-lg border border-steel-border text-[11px] text-industrial-steel leading-tight">
            {predictedCondition === 'CRITICAL' ? (
              <p className="font-bold text-status-critical">
                ⚠️ Stop operation safely and inspect the belt/joint before restarting.
              </p>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-between font-mono">
                  <span>Current condition:</span>
                  <span className="font-bold text-status-warning">WARNING</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>Estimate confidence:</span>
                  <span className="font-bold text-industrial-teal">MEDIUM</span>
                </div>
                <p className="text-[10px] text-industrial-steel pt-1 border-t border-slate-100 mt-1">
                  Estimate based on current sensor conditions and available model data.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================
          SECTION 4 — RECOMMENDED ACTION (3 MAIN SQUARE FLIP CARDS ON HOVER)
         ==================================================== */}
      <div className="bg-card-soft border border-steel-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-steel-border pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-industrial-dark flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-industrial-teal" />
            RECOMMENDED ACTION (3 MAIN SQUARE CARDS — HOVER TO FLIP)
          </h3>
          <span className="text-[10px] text-industrial-steel font-mono">Move cursor over box to flip</span>
        </div>

        {/* 3 Main Square Flip Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {main3FlipCards.map((card, idx) => {
            const Icon = card.icon;

            return (
              <div
                key={idx}
                className="h-52 perspective-1000 group cursor-pointer"
              >
                <div className="relative w-full h-full transform-style-3d group-hover-flip rounded-xl shadow-sm border border-steel-border transition-all duration-500">
                  {/* FRONT OF CARD (SQUARE BOX) */}
                  <div className="absolute inset-0 w-full h-full bg-white rounded-xl p-4 flex flex-col items-center justify-between text-center backface-hidden border border-steel-border group-hover:border-industrial-teal transition-colors">
                    <span className="text-[10px] font-bold font-mono text-industrial-teal bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase">
                      {card.badge}
                    </span>

                    <div className="p-3 bg-industrial-teal/10 rounded-xl text-industrial-teal my-2 group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8" />
                    </div>

                    <h4 className="font-extrabold text-sm text-industrial-dark">
                      {card.title}
                    </h4>

                    <div className="flex items-center space-x-1 text-[10px] text-industrial-steel font-mono pt-1">
                      <RotateCcw className="w-3 h-3 text-industrial-teal animate-spin-once" />
                      <span>HOVER CURSOR TO FLIP</span>
                    </div>
                  </div>

                  {/* BACK OF CARD (SQUARE BOX) */}
                  <div className="absolute inset-0 w-full h-full bg-industrial-dark text-white rounded-xl p-4 flex flex-col justify-between rotate-y-180 backface-hidden text-left border border-slate-700 shadow-xl overflow-hidden">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        WHY?
                      </span>
                      <p className="text-xs text-slate-300 leading-snug">
                        {card.why}
                      </p>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-700">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                        RECOMMENDED ACTION:
                      </span>
                      <p className="text-xs text-white font-medium leading-snug">
                        {card.action}
                      </p>
                    </div>

                    <span className="text-[9px] font-mono text-slate-400 self-end pt-1">
                      Move cursor away to close
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ====================================================
          SECTION 5 — PREVIOUS FAILURE RECORDS
         ==================================================== */}
      <div className="bg-card-soft border border-steel-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-steel-border pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-industrial-dark flex items-center gap-2">
            <History className="w-4 h-4 text-industrial-teal" />
            PREVIOUS FAILURE RECORDS
          </h3>
          <button
            onClick={() => setShowAllHistory(!showAllHistory)}
            className="text-xs text-industrial-teal hover:underline font-bold"
          >
            {showAllHistory ? 'Show Less' : 'View All Records'}
          </button>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg border border-steel-border">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-200/80 text-industrial-dark border-b border-steel-border font-bold">
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Failure/Condition</th>
                <th className="p-2.5">Main Cause</th>
                <th className="p-2.5">Sensor Trigger</th>
                <th className="p-2.5">Action Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-border font-medium text-industrial-dark">
              {displayedRecords.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-2.5 font-mono text-industrial-steel">{rec.date}</td>
                  <td className="p-2.5 font-bold">{rec.condition}</td>
                  <td className="p-2.5 text-industrial-steel">{rec.cause}</td>
                  <td className="p-2.5 font-mono text-industrial-rust">{rec.trigger}</td>
                  <td className="p-2.5 text-slate-700">{rec.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
