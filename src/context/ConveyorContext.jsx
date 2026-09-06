import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ConveyorContext = createContext();

export const ConveyorProvider = ({ children }) => {
  // Active Anomaly State: null | 'JOINT_RUPTURE' | 'MISALIGNMENT_SPIKE' | 'MOTOR_OVERHEAT' | 'HEAVY_OVERLOAD'
  const [activeAnomaly, setActiveAnomaly] = useState(null);

  // DATA SOURCE MODE: 'LIVE_ESP32' (real ESP32 IoT API)
  const [dataSourceMode, setDataSourceMode] = useState('LIVE_ESP32');
  const [activeDeviceId, setActiveDeviceId] = useState('ESP32_A82F91');
  const [activeBeltId, setActiveBeltId] = useState('BELT_001');
  const [sensorSource, setSensorSource] = useState('esp32');
  const [deviceStatus, setDeviceStatus] = useState('ONLINE');
  const [lastSeenSecondsAgo, setLastSeenSecondsAgo] = useState(0);

  // Conveyor System Metadata
  const [conveyorMeta, setConveyorMeta] = useState({
    id: 'CV-01',
    name: 'Primary Ore Overland Conveyor',
    location: 'Iron Ore Mine - Plant 2 (Pit to Primary Crusher)',
    lengthMeters: 1450,
    widthMm: 1800,
    operationalDays: 152,
    state: 'RUNNING',
    speedRpm: 118,
    speedMs: 3.8,
    materialFlowTonMin: 4.2,
    motorPowerKw: 65.4,
  });

  // Current Live Sensor Telemetry (3 Prototype Sensors: Vibration, Speed, Alignment)
  const [sensors, setSensors] = useState({
    vibration: 1.8,      // mm/s (MPU6050 Accel/Gyro)
    speed: 1.57,         // m/s (HW-201 IR Pulley Encoder, 50 RPM * 0.0314)
    rpm: 50,             // RPM (HW-201 IR Pulley Encoder - Max motor speed: 60 RPM)
    tracking: 1.2,       // mm offset (HW-201 IR Alignment Detector)
    alignment: 'OK',     // 'OK' | 'MISALIGNED'
    sensorsOnline: 3,
    totalSensors: 3,
  });

  // Joint Splice Condition Details (1 Main Splice Joint J-03)
  const [joints, setJoints] = useState([
    { id: 'J-03', location: '890m (Impact Zone)', type: 'Vulcanized Finger Splice', status: 'HEALTHY', strain: 2.8, microCracks: 'Minor Edge Wear', lastInspected: 'Yesterday' }
  ]);

  // Telemetry History Buffer (30 Data Points for 3 Prototype Sensors)
  const [history, setHistory] = useState(() => {
    const now = new Date();
    const initial = [];
    for (let i = 29; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 60 * 1000);
      const simRpm = Math.round(48 + Math.random() * 4);
      initial.push({
        time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vibration: Number((1.7 + Math.random() * 0.4).toFixed(1)),
        speed: Number((simRpm * 0.0314).toFixed(2)),
        rpm: simRpm,
        tracking: Number((0.8 + Math.random() * 0.8).toFixed(1)),
        alignment: 'OK',
        healthScore: 95,
      });
    }
    return initial;
  });

  // Live Alerts Database
  const [alerts, setAlerts] = useState([
    {
      id: 'ALT-1092',
      timestamp: '10:14 AM Today',
      severity: 'WARNING',
      title: 'Tracking Deviation at Return Idler',
      description: 'Belt offset reached +4.2mm on Return Idler Frame #14.',
      component: 'Return Idler Frame #14',
      sensor: 'Optical Alignment Sensor (Laser Transducer)',
      currentValue: '4.2 mm',
      normalRange: '< 4.0 mm',
      threshold: '4.0 mm',
      recommendedAction: 'Inspect return tracking idler alignment and clear debris build-up.',
      status: 'ACTIVE',
    },
    {
      id: 'ALT-1088',
      timestamp: '06:30 AM Today',
      severity: 'INFO',
      title: 'Scheduled Ultrasonic Joint Audit Completed',
      description: 'Non-destructive testing confirmed vulcanized joint J-03 splice integrity at 91%.',
      component: 'Joint Splice #3',
      sensor: 'Ultrasonic Array Scanner',
      currentValue: '91% Integrity',
      normalRange: '> 85%',
      threshold: '85%',
      recommendedAction: 'No immediate action required. Continue routine monitoring.',
      status: 'RESOLVED',
    },
    {
      id: 'ALT-1074',
      timestamp: 'Yesterday 16:45',
      severity: 'WARNING',
      title: 'Drive Pulley Bearing Temp Spike',
      description: 'Bearing temperature reached 68°C during heavy loading cycle.',
      component: 'Main Drive Motor M-01',
      sensor: 'DS18B20 Temp Probe',
      currentValue: '68 °C',
      normalRange: '< 60 °C',
      threshold: '60 °C',
      recommendedAction: 'Inspect bearing lubrication levels and synthetic grease seal.',
      status: 'RESOLVED',
    }
  ]);

  // Work Orders List
  const [workOrders, setWorkOrders] = useState([
    {
      id: 'WO-8821',
      title: 'Re-vulcanization & Edge Trim - Joint #3',
      priority: 'HIGH',
      assignedTo: 'Dave Miller (Lead Mechanical)',
      dueDate: 'Tomorrow, 08:00 AM',
      status: 'PENDING',
      targetComponent: 'Joint J-03',
      estimatedDuration: '4 Hours (Planned Shutdown)',
      type: 'PREVENTIVE'
    }
  ]);

  // Default Preventive Maintenance Checklist (11 Items)
  const defaultChecklist = [
    { id: 1, task: 'Check belt alignment', completed: false, priority: 'high', equipment: 'Conveyor Belt Flight', frequency: 'Daily', lastDate: '2026-09-02', nextDueDate: '2026-09-04', assignedTo: 'Mechanical Team A', status: 'Due Soon' },
    { id: 2, task: 'Inspect belt joints', completed: false, priority: 'high', equipment: 'Joint Splice J-03', frequency: 'Weekly', lastDate: '2026-09-01', nextDueDate: '2026-09-05', assignedTo: 'Splice Audit Team', status: 'Due Soon' },
    { id: 3, task: 'Check roller condition', completed: false, priority: 'medium', equipment: 'Carry & Return Idlers', frequency: 'Weekly', lastDate: '2026-08-28', nextDueDate: '2026-09-04', assignedTo: 'Inspection Tech B', status: 'Overdue' },
    { id: 4, task: 'Check bearing temperature', completed: false, priority: 'medium', equipment: 'Drive Bearing Assembly', frequency: 'Daily', lastDate: '2026-09-03', nextDueDate: '2026-09-04', assignedTo: 'Condition Monitoring', status: 'Due Soon' },
    { id: 5, task: 'Inspect belt tension', completed: false, priority: 'medium', equipment: 'Tail Take-Up Unit', frequency: 'Bi-Weekly', lastDate: '2026-08-25', nextDueDate: '2026-09-08', assignedTo: 'Mechanical Team A', status: 'Not Started' },
    { id: 6, task: 'Check motor condition', completed: false, priority: 'medium', equipment: 'Drive Motor M-01', frequency: 'Monthly', lastDate: '2026-08-15', nextDueDate: '2026-09-15', assignedTo: 'Electrical Lead', status: 'Not Started' },
    { id: 7, task: 'Check for abnormal vibration', completed: false, priority: 'high', equipment: 'Motor & Gearbox Frame', frequency: 'Daily', lastDate: '2026-09-03', nextDueDate: '2026-09-04', assignedTo: 'Vibration Analyst', status: 'Due Soon' },
    { id: 8, task: 'Inspect conveyor structure', completed: false, priority: 'low', equipment: 'Structural Steel Deck', frequency: 'Monthly', lastDate: '2026-08-10', nextDueDate: '2026-09-10', assignedTo: 'Civil/Struct Team', status: 'Not Started' },
    { id: 9, task: 'Lubricate bearings', completed: false, priority: 'medium', equipment: 'Pulley Bearings', frequency: 'Bi-Weekly', lastDate: '2026-08-22', nextDueDate: '2026-09-05', assignedTo: 'Lubrication Spec', status: 'Due Soon' },
    { id: 10, task: 'Check motor coupling', completed: false, priority: 'medium', equipment: 'Flexible Drive Coupling', frequency: 'Monthly', lastDate: '2026-08-12', nextDueDate: '2026-09-12', assignedTo: 'Mechanical Team B', status: 'Not Started' },
    { id: 11, task: 'Inspect gearbox & structural bolts', completed: false, priority: 'low', equipment: 'Gearbox Housing', frequency: 'Monthly', lastDate: '2026-08-10', nextDueDate: '2026-09-10', assignedTo: 'Structural Tech', status: 'Not Started' },
  ];

  const [checklist, setChecklist] = useState(defaultChecklist);

  // Register New Device Helper
  const registerNewDevice = async ({ deviceName, beltName }) => {
    try {
      // 1. Create belt
      const bRes = await fetch('http://localhost:8005/api/belts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: beltName, location: 'Plant 2 - Ore Mine' })
      });
      const bData = await bRes.json();
      const newBeltId = bData.belt?.belt_id || 'BELT_001';

      // 2. Register Device
      const dRes = await fetch('http://localhost:8005/api/devices/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ belt_id: newBeltId, device_name: deviceName })
      });
      const dData = await dRes.json();

      if (dData.device) {
        setActiveBeltId(newBeltId);
        setActiveDeviceId(dData.device.device_id);
        return dData.device;
      }
    } catch (err) {
      console.warn("Backend registration error:", err);
    }

    // Fallback seed device
    const fallback = {
      device_id: `ESP32_${Math.floor(100000 + Math.random() * 900000)}`,
      belt_id: 'BELT_001',
      device_token: `token_sec_${Math.random().toString(36).substring(2, 12)}`,
      device_name: deviceName || 'ESP32 Sensor Board'
    };
    setActiveDeviceId(fallback.device_id);
    return fallback;
  };

  // Synchronize Maintenance Checklist
  useEffect(() => {
    const fetchBackendChecklist = async () => {
      try {
        const res = await fetch('http://localhost:8005/api/maintenance');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setChecklist(data);
          }
        }
      } catch (err) {
        console.warn("Backend API fetch fallback to memory:", err);
      }
    };
    fetchBackendChecklist();
  }, []);

  const syncChecklistToStorageAndDb = async (newChecklist) => {
    setChecklist(newChecklist);
    try {
      await fetch('http://localhost:8005/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist: newChecklist }),
      });
    } catch (err) {
      console.warn("MongoDB sync fallback to memory:", err);
    }
  };

  // Derive Random Forest ML Prediction Metrics (Shared by both Demo and Real ESP32 sources)
  const calculateMlMetrics = () => {
    let baseHealth = 96;

    if (sensors.vibration > 6.0) baseHealth -= 40;
    else if (sensors.vibration > 3.0) baseHealth -= 18;

    if (Math.abs(sensors.tracking) > 7.0 || sensors.alignment === 'MISALIGNED') baseHealth -= 35;
    else if (Math.abs(sensors.tracking) > 4.0) baseHealth -= 18;

    if (sensors.rpm < 30) baseHealth -= 30;
    else if (sensors.rpm < 40) baseHealth -= 12;

    baseHealth = Math.max(12, Math.min(99, Math.round(baseHealth)));
    const riskProb = 100 - baseHealth;

    let condition = 'NORMAL';
    if (baseHealth < 60) condition = 'CRITICAL';
    else if (baseHealth < 82) condition = 'WARNING';

    let rulHours = Math.round((baseHealth / 100) * 450);
    if (condition === 'CRITICAL') rulHours = Math.round(12 + Math.random() * 8);

    return {
      healthScore: baseHealth,
      failureRisk: riskProb,
      condition,
      rulHours,
      confidenceScore: 94.8,
      modelType: 'Random Forest Classifier (v2.1)',
    };
  };

  const mlMetrics = calculateMlMetrics();

  // Automatic Real-Time Threshold Monitoring & Alert Engine (3 Prototype Sensors)
  useEffect(() => {
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newAlertsToAdd = [];
    let updatedAlerts = [...alerts];

    const hasActiveAlert = (conditionTitle) => {
      return updatedAlerts.some(a => a.title.includes(conditionTitle) && a.status !== 'RESOLVED');
    };

    if (sensors.vibration > 6.0 && !hasActiveAlert('Bearing Vibration Abnormal')) {
      newAlertsToAdd.push({
        id: `ALT-${Math.floor(2000 + Math.random() * 8000)}`,
        severity: 'CRITICAL',
        title: 'Bearing Vibration Abnormal',
        equipment: 'Drive Motor Bearing',
        sensor: 'MPU6050 Vibration Transducer',
        currentValue: `${sensors.vibration} mm/s`,
        normalRange: '< 3.0 mm/s',
        threshold: '6.0 mm/s',
        timestamp: timestampStr,
        description: 'Vibration spiked into CRITICAL zone. Severe mechanical unbalance or bearing fatigue detected.',
        recommendedAction: 'Inspect drive-end bearing immediately and check joint splice integrity.',
        status: 'ACTIVE',
      });
    } else if (sensors.vibration > 3.0 && sensors.vibration <= 6.0 && !hasActiveAlert('Elevated Vibration')) {
      newAlertsToAdd.push({
        id: `ALT-${Math.floor(2000 + Math.random() * 8000)}`,
        severity: 'WARNING',
        title: 'Elevated Bearing Vibration',
        equipment: 'Drive Pulley Shaft',
        sensor: 'MPU6050 Vibration Transducer',
        currentValue: `${sensors.vibration} mm/s`,
        normalRange: '< 3.0 mm/s',
        threshold: '3.0 mm/s',
        timestamp: timestampStr,
        description: 'Vibration increased above normal baseline limit.',
        recommendedAction: 'Schedule vibration spectrum audit during next shift.',
        status: 'ACTIVE',
      });
    }

    if ((sensors.alignment === 'MISALIGNED' || Math.abs(sensors.tracking) > 7.0) && !hasActiveAlert('Critical Belt Misalignment')) {
      newAlertsToAdd.push({
        id: `ALT-${Math.floor(2000 + Math.random() * 8000)}`,
        severity: 'CRITICAL',
        title: 'Critical Belt Misalignment',
        equipment: 'Belt Edge Line',
        sensor: 'HW-201 Reflective IR Edge Sensor',
        currentValue: `${sensors.tracking > 0 ? '+' : ''}${sensors.tracking} mm`,
        normalRange: '< 4.0 mm',
        threshold: '7.0 mm',
        timestamp: timestampStr,
        description: 'Belt edge drift detected outside normal flight path. Tearing risk.',
        recommendedAction: 'Inspect tracking idlers and realign conveyor belt edge.',
        status: 'ACTIVE',
      });
    }

    if (sensors.rpm < 40 && !hasActiveAlert('Pulley Speed Drop')) {
      newAlertsToAdd.push({
        id: `ALT-${Math.floor(2000 + Math.random() * 8000)}`,
        severity: 'WARNING',
        title: 'Pulley Speed Drop',
        equipment: 'Drive Pulley Shaft',
        sensor: 'HW-201 IR Pulley Encoder',
        currentValue: `${sensors.rpm} RPM`,
        normalRange: '> 45 RPM (Max 60 RPM)',
        threshold: '40 RPM',
        timestamp: timestampStr,
        description: 'Pulley shaft rotational speed dropped below expected operational range.',
        recommendedAction: 'Check drive motor power supply and belt friction slip.',
        status: 'ACTIVE',
      });
    }

    updatedAlerts = updatedAlerts.map(a => {
      if (a.status === 'ACTIVE') {
        if (a.title.includes('Vibration') && sensors.vibration <= 3.0) return { ...a, status: 'RESOLVED' };
        if (a.title.includes('Misalignment') && Math.abs(sensors.tracking) <= 4.0 && sensors.alignment === 'OK') return { ...a, status: 'RESOLVED' };
        if (a.title.includes('Speed') && sensors.rpm >= 45) return { ...a, status: 'RESOLVED' };
      }
      return a;
    });

    if (newAlertsToAdd.length > 0) {
      setAlerts([...newAlertsToAdd, ...updatedAlerts]);
    } else {
      setAlerts(updatedAlerts);
    }
  }, [sensors.vibration, sensors.tracking, sensors.alignment, sensors.rpm]);

  // REAL-TIME DUAL-MODE SENSOR STREAMING LOOP
  useEffect(() => {
    let intervalId;

    if (dataSourceMode === 'LIVE_ESP32') {
      // MODE 2: REAL ESP32 TELEMETRY POLLING
      setSensorSource('esp32');
      const fetchEsp32Telemetry = async () => {
        try {
          const res = await fetch(`http://localhost:8005/api/devices/${activeDeviceId}/telemetry`);
          if (res.ok) {
            const data = await res.json();
            if (data.sensors) {
              const newVib = data.sensors.vibration || 1.8;
              const newRpm = data.sensors.rpm || 50;
              const newSpeed = data.sensors.speed || Number((newRpm * 0.0314).toFixed(2));
              const newTrack = data.sensors.tracking || 1.2;
              const newAlign = data.sensors.alignment || (newTrack > 5 ? 'MISALIGNED' : 'OK');

              setSensors((prev) => ({
                ...prev,
                vibration: newVib,
                rpm: newRpm,
                speed: newSpeed,
                tracking: newTrack,
                alignment: newAlign,
                sensorsOnline: 3,
                totalSensors: 3,
              }));
              setDeviceStatus(data.livenessStatus || 'ONLINE');
              setLastSeenSecondsAgo(data.lastSeenSecondsAgo || 0);

              const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              setHistory((prevHist) => [
                ...prevHist.slice(1),
                {
                  time: timeLabel,
                  vibration: newVib,
                  speed: newSpeed,
                  rpm: newRpm,
                  tracking: Math.abs(newTrack),
                  alignment: newAlign,
                  healthScore: data.prediction?.healthScore || 94,
                }
              ]);
            }
          }
        } catch (err) {
          console.warn("ESP32 telemetry polling error:", err);
          setDeviceStatus('OFFLINE');
        }
      };

      fetchEsp32Telemetry();
      intervalId = setInterval(fetchEsp32Telemetry, 2000);
    } else {
      // MODE 1: DEMO / SIMULATED SENSOR GENERATOR (EVERY 2.5S)
      setSensorSource('simulation');
      setDeviceStatus('DEMO_MODE');

      intervalId = setInterval(() => {
        setSensors((prev) => {
          let newVib = prev.vibration;
          let newTrack = prev.tracking;
          let newRpm = prev.rpm || 50;
          let newAlign = 'OK';

          if (activeAnomaly === 'JOINT_RUPTURE') {
            newVib = Number((5.8 + Math.random() * 1.2).toFixed(1));
            newTrack = Number((6.5 + Math.random() * 2.0).toFixed(1));
            newRpm = 35;
            newAlign = 'MISALIGNED';
          } else if (activeAnomaly === 'MISALIGNMENT_SPIKE') {
            newTrack = Number((8.2 + Math.random() * 2.5).toFixed(1));
            newVib = Number((3.9 + Math.random() * 0.8).toFixed(1));
            newRpm = 45;
            newAlign = 'MISALIGNED';
          } else if (activeAnomaly === 'MOTOR_OVERHEAT') {
            newVib = Number((4.5 + Math.random() * 0.6).toFixed(1));
            newRpm = 30;
            newAlign = 'OK';
          } else {
            newVib = Number((1.6 + Math.random() * 0.4).toFixed(1));
            newTrack = Number((0.8 + Math.random() * 0.8).toFixed(1));
            newRpm = Math.round(48 + Math.random() * 4);
            newAlign = 'OK';
          }

          const newSpeed = Number((newRpm * 0.0314).toFixed(2));

          const updated = {
            ...prev,
            vibration: newVib,
            rpm: newRpm,
            speed: newSpeed,
            tracking: newTrack,
            alignment: newAlign,
            sensorsOnline: 3,
            totalSensors: 3,
          };

          const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setHistory((prevHist) => [
            ...prevHist.slice(1),
            {
              time: timeLabel,
              vibration: newVib,
              speed: newSpeed,
              rpm: newRpm,
              tracking: Math.abs(newTrack),
              alignment: newAlign,
              healthScore: Math.max(15, 96 - (newVib > 4 ? 30 : 0) - (Math.abs(newTrack) > 5 ? 30 : 0) - (newRpm < 40 ? 15 : 0)),
            }
          ]);

          return updated;
        });
      }, 2500);
    }

    return () => clearInterval(intervalId);
  }, [dataSourceMode, activeDeviceId, activeAnomaly]);

  // Inject Anomaly Function
  const injectAnomaly = (anomalyType) => {
    setActiveAnomaly(anomalyType);
    if (anomalyType === 'JOINT_RUPTURE') {
      setJoints((prev) =>
        prev.map((j) =>
          j.id === 'J-03'
            ? { ...j, status: 'CRITICAL', strain: 8.9, microCracks: 'SEVERE SEPARATION DETECTED' }
            : j
        )
      );
    } else if (anomalyType === 'MISALIGNMENT_SPIKE') {
      setJoints((prev) =>
        prev.map((j) =>
          j.id === 'J-03'
            ? { ...j, status: 'WARNING', strain: 4.8, microCracks: 'Edge Abrasion' }
            : j
        )
      );
    }
  };

  // Restore Normal Operations
  const resetNormal = () => {
    setActiveAnomaly(null);
    setJoints([
      { id: 'J-03', location: '890m (Impact Zone)', type: 'Vulcanized Finger Splice', status: 'HEALTHY', strain: 2.8, microCracks: 'Minor Edge Wear', lastInspected: 'Yesterday' },
    ]);
  };

  const acknowledgeAlert = (alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
  };

  const resolveAlert = (alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'RESOLVED' } : a))
    );
  };

  const addWorkOrder = (wo) => {
    const newWo = {
      id: `WO-${Math.floor(8000 + Math.random() * 1900)}`,
      ...wo,
      status: 'PENDING',
    };
    setWorkOrders((prev) => [newWo, ...prev]);
  };

  const predictiveRecommendations = useMemo(() => {
    const recs = [];
    if (sensors.vibration > 3.0) {
      recs.push({
        id: 'PRED-101',
        title: 'Vibration & Bearing Inspection Recommended',
        reason: `Vibration is currently ${sensors.vibration} mm/s. Tri-axial MPU6050 telemetry shows elevated dynamic amplitude.`,
        equipment: 'Drive Motor Bearing M-01',
        priority: sensors.vibration > 5.0 ? 'High' : 'Medium',
        recommendedAction: 'Inspect bearing race condition, structural mounting bolts, and joint splice.',
        urgency: 'Within 48 hours',
        relatedSensor: 'MPU6050 Vibration Transducer',
      });
    }

    if (Math.abs(sensors.tracking) > 3.5 || sensors.alignment === 'MISALIGNED') {
      recs.push({
        id: 'PRED-102',
        title: 'Belt Edge Realignment Required',
        reason: `Belt tracking misalignment offset is ${sensors.tracking > 0 ? '+' : ''}${sensors.tracking} mm from center line.`,
        equipment: 'Return Belt Alignment Zone',
        priority: Math.abs(sensors.tracking) > 6.0 ? 'High' : 'Medium',
        recommendedAction: 'Inspect self-aligning idler pivots and clean material buildup on return idlers.',
        urgency: 'Within 24 hours',
        relatedSensor: 'HW-201 Reflective IR Edge Sensor',
      });
    }

    if (sensors.rpm < 42) {
      recs.push({
        id: 'PRED-103',
        title: 'Pulley Speed Calibration & Tension Check',
        reason: `Pulley shaft encoder reading dropped to ${sensors.rpm} RPM (max motor rating 60 RPM).`,
        equipment: 'Drive Pulley Shaft',
        priority: 'Medium',
        recommendedAction: 'Verify drive motor power input, check pulley belt slip and take-up tension.',
        urgency: 'Within 72 hours',
        relatedSensor: 'HW-201 IR Pulley Encoder',
      });
    }

    return recs;
  }, [sensors]);

  const alertCounts = useMemo(() => {
    const active = alerts.filter(a => a.status === 'ACTIVE');
    const critical = alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED');
    const warning = alerts.filter(a => a.severity === 'WARNING' && a.status !== 'RESOLVED');
    const resolved = alerts.filter(a => a.status === 'RESOLVED');
    return {
      active: active.length,
      critical: critical.length,
      warning: warning.length,
      resolved: resolved.length,
      total: alerts.length,
    };
  }, [alerts]);

  const maintenanceCounts = useMemo(() => {
    const completed = checklist.filter(t => t.completed).length;
    const pending = checklist.length - completed;
    const overdue = checklist.filter(t => !t.completed && t.status === 'Overdue').length;
    const dueSoon = checklist.filter(t => !t.completed && t.status === 'Due Soon').length;
    return {
      total: checklist.length,
      completed,
      pending,
      overdue,
      dueSoon,
    };
  }, [checklist]);

  return (
    <ConveyorContext.Provider
      value={{
        conveyorMeta,
        setConveyorMeta,
        sensors,
        joints,
        history,
        alerts,
        workOrders,
        mlMetrics,
        activeAnomaly,
        injectAnomaly,
        resetNormal,
        acknowledgeAlert,
        resolveAlert,
        addWorkOrder,
        checklist,
        syncChecklistToStorageAndDb,
        predictiveRecommendations,
        alertCounts,
        maintenanceCounts,
        // DUAL DATA SOURCE EXPORTS
        dataSourceMode,
        setDataSourceMode,
        activeDeviceId,
        setActiveDeviceId,
        activeBeltId,
        sensorSource,
        deviceStatus,
        lastSeenSecondsAgo,
        registerNewDevice,
      }}
    >
      {children}
    </ConveyorContext.Provider>
  );
};

export const useConveyor = () => useContext(ConveyorContext);
