import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Eye, Maximize2, Layers, Cpu, AlertTriangle, CheckCircle2, Box, Zap } from 'lucide-react';
import { useConveyor } from '../context/ConveyorContext';
import { ConveyorDigitalTwin3D } from './ConveyorDigitalTwin3D';

export const DigitalTwinCanvas = () => {
  const { sensors, joints, mlMetrics, activeAnomaly } = useConveyor();
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewAngle, setViewAngle] = useState(1); // 1: Isometric, 2: Drive Motor, 3: Side Elevation, 4: Joint Splice J-03, 5: Tail Pulley
  const [renderMode, setRenderMode] = useState('3D'); // '3D' | '2D'
  const animFrameRef = useRef(null);
  const beltOffsetRef = useRef(0);

  useEffect(() => {
    if (renderMode !== '2D') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let running = true;

    const render = () => {
      if (!running) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas Background (Steel + Emerald + Copper Graphite Theme)
      ctx.fillStyle = '#263238';
      ctx.fillRect(0, 0, width, height);

      // Draw Grid / Floor
      ctx.strokeStyle = '#37474F';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update belt motion offset
      if (isPlaying) {
        beltOffsetRef.current = (beltOffsetRef.current + sensors.speed * 0.8) % 1000;
      }
      const offset = beltOffsetRef.current;

      if (viewAngle === 1 || viewAngle === 2) {
        drawIsometricConveyor(ctx, width, height, offset, sensors, joints, activeAnomaly);
      } else if (viewAngle === 3) {
        drawSideProfileConveyor(ctx, width, height, offset, sensors, joints, activeAnomaly);
      } else {
        drawJointSpliceDetail(ctx, width, height, offset, sensors, joints, activeAnomaly);
      }

      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [renderMode, isPlaying, viewAngle, sensors, joints, activeAnomaly]);

  // View 1: Isometric Conveyor Rendering
  const drawIsometricConveyor = (ctx, w, h, offset, sensors, joints, anomaly) => {
    const startX = 80;
    const startY = h / 2 + 30;
    const endX = w - 100;
    const endY = h / 2 - 40;

    // Structural Steel Framework
    ctx.strokeStyle = '#56656B';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(startX, startY + 40);
    ctx.lineTo(endX, endY + 40);
    ctx.stroke();

    // Support Legs
    const legCount = 6;
    for (let i = 0; i <= legCount; i++) {
      const lx = startX + (endX - startX) * (i / legCount);
      const ly = startY + (endY - startY) * (i / legCount);
      ctx.strokeStyle = '#56656B';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(lx, ly + 40);
      ctx.lineTo(lx, ly + 110);
      ctx.stroke();

      ctx.fillStyle = '#1D272C';
      ctx.fillRect(lx - 12, ly + 110, 24, 8);
    }

    // Drive Pulley (Left / Head)
    ctx.save();
    ctx.translate(startX, startY);
    ctx.fillStyle = anomaly === 'MOTOR_OVERHEAT' ? '#C6534F' : '#56656B';
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#B4BEC2';
    ctx.lineWidth = 4;
    ctx.stroke();
    // Pulley spokes
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    for (let a = 0; a < 4; a++) {
      const angle = (offset * 0.05) + (a * Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * 30, Math.sin(angle) * 30);
      ctx.stroke();
    }
    ctx.restore();

    // Drive Motor Unit
    ctx.fillStyle = anomaly === 'MOTOR_OVERHEAT' ? '#C6534F' : '#155E63';
    ctx.fillRect(startX - 60, startY + 10, 45, 45);
    ctx.strokeStyle = '#3F9692';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX - 60, startY + 10, 45, 45);
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.fillText('MOTOR', startX - 55, startY + 36);

    // Tail Pulley (Right)
    ctx.save();
    ctx.translate(endX, endY);
    ctx.fillStyle = '#56656B';
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#B4BEC2';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Continuous 2D Black Rubber Belt Loop wrapping outer circumferences of both end pulleys
    const rHead = 34; // Radius covering head pulley circumference
    const rTail = 30; // Radius covering tail pulley circumference
    const beltColor = anomaly === 'JOINT_RUPTURE' ? '#C6534F' : '#1D272C';

    ctx.save();
    ctx.strokeStyle = beltColor;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const slopeAngle = Math.atan2((endY - rTail) - (startY - rHead), endX - startX);

    ctx.beginPath();
    // Top carrying strand
    ctx.moveTo(startX + Math.sin(slopeAngle) * rHead, startY - Math.cos(slopeAngle) * rHead);
    ctx.lineTo(endX + Math.sin(slopeAngle) * rTail, endY - Math.cos(slopeAngle) * rTail);

    // 180° Wrap Arc around Tail Pulley Outer Circumference
    ctx.arc(endX, endY, rTail, -Math.PI / 2 + slopeAngle, Math.PI / 2 + slopeAngle, false);

    // Bottom return strand
    ctx.lineTo(startX - Math.sin(slopeAngle) * rHead, startY + Math.cos(slopeAngle) * rHead);

    // 180° Wrap Arc around Head Drive Pulley Outer Circumference
    ctx.arc(startX, startY, rHead, Math.PI / 2 + slopeAngle, Math.PI * 1.5 + slopeAngle, false);

    ctx.closePath();
    ctx.stroke();

    // Inner belt liner highlight
    ctx.strokeStyle = anomaly === 'MISALIGNMENT_SPIKE' ? '#D68A24' : '#37474F';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // Carrying Ore Payload
    const lumpCount = 20;
    for (let i = 0; i < lumpCount; i++) {
      const posRatio = ((i / lumpCount) + (offset / 1000)) % 1;
      const lx = startX + (endX - startX) * posRatio;
      const ly = (startY - 32) + (endY - startY) * posRatio;

      ctx.fillStyle = i % 2 === 0 ? '#795548' : '#9A5B3D';
      ctx.beginPath();
      ctx.ellipse(lx, ly - 8, 9, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Single Belt Joint Splice Marker (BELT JOINT J-03)
    const jRatio = (offset / 1000) % 1;
    const jx = startX + (endX - startX) * jRatio;
    const jy = (startY - 32) + (endY - startY) * jRatio;

    const isCritical = anomaly === 'JOINT_RUPTURE';
    const isWarning = anomaly === 'MISALIGNMENT_SPIKE';

    ctx.fillStyle = isCritical ? '#C6534F' : isWarning ? '#D68A24' : '#5F9F4A';
    ctx.fillRect(jx - 5, jy - 38, 10, 16);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('J-03', jx - 10, jy - 42);
  };

  // View 2: Side Profile
  const drawSideProfileConveyor = (ctx, w, h, offset, sensors, joints, anomaly) => {
    ctx.fillStyle = '#EEF1F2';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('ELEVATION SIDE PROFILE - CONVEYOR CV-01', 30, 40);

    const startX = 100;
    const endX = w - 100;
    const y = h / 2 + 10;

    ctx.strokeStyle = '#B4BEC2';
    ctx.lineWidth = 3;
    ctx.strokeRect(startX, y - 40, endX - startX, 80);
  };

  // View 3: Joint Detail
  const drawJointSpliceDetail = (ctx, w, h, offset, sensors, joints, anomaly) => {
    ctx.fillStyle = '#EEF1F2';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('BELT JOINT SPLICE J-03 ULTRASONIC INSPECTION VIEW', 30, 40);
  };

  return (
    <div className="bg-[#EEF1F2] border border-[#B4BEC2] rounded-2xl overflow-hidden shadow-md flex flex-col h-full">
      {/* Canvas Controls Bar */}
      <div className="bg-[#263238] border-b border-[#37474F] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 bg-[#287F7A] text-white rounded-lg font-mono text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
            <Box className="w-3.5 h-3.5" /> 3D DIGITAL TWIN
          </span>
          <span className="font-bold text-[#EEF1F2] tracking-wide text-xs">
            CONVEYOR BELT TWIN (BABYLON 3D)
          </span>
        </div>

        {/* View Angle Preset Toggle Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <button
            onClick={() => setViewAngle(1)}
            className={`px-2.5 py-1 rounded-md transition-all font-bold ${
              viewAngle === 1 ? 'bg-[#287F7A] text-white shadow-xs' : 'bg-[#37474F] text-[#C4CBCE] hover:text-white'
            }`}
          >
            Isometric 3D
          </button>

          <button
            onClick={() => setViewAngle(2)}
            className={`px-2.5 py-1 rounded-md transition-all font-bold flex items-center gap-1 ${
              viewAngle === 2 ? 'bg-[#9A5B3D] text-white shadow-xs' : 'bg-[#37474F] text-[#C4CBCE] hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3 text-[#3F9692]" /> Drive Motor
          </button>

          <button
            onClick={() => setViewAngle(3)}
            className={`px-2.5 py-1 rounded-md transition-all font-bold ${
              viewAngle === 3 ? 'bg-[#287F7A] text-white shadow-xs' : 'bg-[#37474F] text-[#C4CBCE] hover:text-white'
            }`}
          >
            Side Profile
          </button>

          <button
            onClick={() => setViewAngle(4)}
            className={`px-2.5 py-1 rounded-md transition-all font-bold ${
              viewAngle === 4 ? 'bg-[#9A5B3D] text-white shadow-xs' : 'bg-[#37474F] text-[#C4CBCE] hover:text-white'
            }`}
          >
            Joint Splice J-03
          </button>

          <button
            onClick={() => setViewAngle(5)}
            className={`px-2.5 py-1 rounded-md transition-all font-bold ${
              viewAngle === 5 ? 'bg-[#287F7A] text-white shadow-xs' : 'bg-[#37474F] text-[#C4CBCE] hover:text-white'
            }`}
          >
            Tail Pulley
          </button>

          <button
            onClick={() => setRenderMode(renderMode === '3D' ? '2D' : '3D')}
            className="px-2 py-1 bg-[#155E63] hover:bg-[#287F7A] text-[#EEF1F2] rounded-md font-mono text-[10px] font-bold border border-[#3F9692]/40"
            title="Switch Render Engine"
          >
            {renderMode === '3D' ? 'Engine: 3D Babylon' : 'Engine: 2D Canvas'}
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 bg-[#37474F] hover:bg-[#455A64] rounded-lg border border-[#546E7A] text-[#EEF1F2]"
            title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-[#D68A24]" /> : <Play className="w-4 h-4 text-[#5F9F4A]" />}
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative flex-grow min-h-[380px] bg-[#263238] flex items-center justify-center">
        {renderMode === '3D' ? (
          <ConveyorDigitalTwin3D 
            sensors={sensors} 
            activeAnomaly={activeAnomaly} 
            mode="minimal"
            viewAngle={viewAngle}
            isPlaying={isPlaying}
          />
        ) : (
          <canvas
            ref={canvasRef}
            width={800}
            height={380}
            className="w-full h-full object-contain block"
          />
        )}

        {/* Floating Telemetry HUD Card */}
        <div className="absolute bottom-3 right-3 bg-[#263238]/90 backdrop-blur-md border border-[#37474F] rounded-xl p-3 text-xs w-52 shadow-2xl z-10 font-mono">
          <div className="text-[10px] font-bold text-[#C4CBCE] uppercase tracking-wider mb-2 border-b border-[#37474F] pb-1 flex justify-between">
            <span>3D TWIN STATUS</span>
            <span className="text-[#5F9F4A]">LIVE SYNCED</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[#C4CBCE]">Belt Speed:</span>
              <span className="text-[#EEF1F2] font-bold">{sensors.speed} m/s ({sensors.speedRpm || 118} RPM)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#C4CBCE]">Ore Load:</span>
              <span className="text-[#5F9F4A] font-bold">{sensors.load}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#C4CBCE]">Tension:</span>
              <span className={`font-bold ${sensors.tension > 170 ? 'text-[#D68A24]' : 'text-[#EEF1F2]'}`}>
                {sensors.tension} kN
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#C4CBCE]">Vibration:</span>
              <span className={`font-bold ${sensors.vibration > 4 ? 'text-[#C6534F]' : 'text-[#5F9F4A]'}`}>
                {sensors.vibration} mm/s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#C4CBCE]">Temp:</span>
              <span className={`font-bold ${sensors.temperature > 70 ? 'text-[#C6534F]' : 'text-[#EEF1F2]'}`}>
                {sensors.temperature} °C
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#C4CBCE]">Tracking:</span>
              <span className={`font-bold ${Math.abs(sensors.tracking) > 5 ? 'text-[#C6534F]' : 'text-[#5F9F4A]'}`}>
                {sensors.tracking > 0 ? `+${sensors.tracking}` : sensors.tracking} mm
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom KPI Status Ribbon */}
      <div className="bg-[#263238] border-t border-[#37474F] px-4 py-2.5 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#5F9F4A]"></div>
          <span className="text-[#C4CBCE]">Material Flow:</span>
          <span className="text-[#EEF1F2] font-bold font-mono">4.2 ton/min</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#3F9692]"></div>
          <span className="text-[#C4CBCE]">Motor Power:</span>
          <span className="text-[#EEF1F2] font-bold font-mono">65.4 kW</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#D68A24]"></div>
          <span className="text-[#C4CBCE]">Belt Tension:</span>
          <span className="text-[#EEF1F2] font-bold font-mono">{sensors.tension} kN</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#5F9F4A]"></div>
          <span className="text-[#C4CBCE]">Alignment:</span>
          <span className={`font-bold ${Math.abs(sensors.tracking) > 5 ? 'text-[#C6534F]' : 'text-[#5F9F4A]'}`}>
            {Math.abs(sensors.tracking) > 5 ? 'DEVIATED' : 'GOOD'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#5F9F4A]"></div>
          <span className="text-[#C4CBCE]">State:</span>
          <span className="text-[#5F9F4A] font-bold uppercase">RUNNING 3D TWIN</span>
        </div>
      </div>
    </div>
  );
};
