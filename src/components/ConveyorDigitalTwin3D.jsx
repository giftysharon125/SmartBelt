import React, { useEffect, useRef } from 'react';
import { ConveyorDigitalTwin } from '../digitalTwin/conveyor.js';
import { conveyorState } from '../digitalTwin/conveyorState.js';

/**
 * Drop-in BabylonJS 3D Conveyor Digital Twin React Component
 */
export const ConveyorDigitalTwin3D = ({ 
  sensors, 
  activeAnomaly = null, 
  mode = 'minimal', 
  viewAngle = 1,
  isPlaying = true
}) => {
  const canvasRef = useRef(null);
  const twinInstanceRef = useRef(null);

  // 1. Initialize Babylon 3D Scene on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    // Generate unique canvas ID
    const canvasId = `babylon-canvas-${Math.random().toString(36).substring(2, 9)}`;
    canvasRef.current.id = canvasId;

    try {
      twinInstanceRef.current = new ConveyorDigitalTwin(canvasId);
      conveyorState.updateState({ minimalMode: mode === 'minimal', running: isPlaying });

      if (viewAngle && window.setConveyorViewAngle) {
        window.setConveyorViewAngle(viewAngle);
      }
    } catch (err) {
      console.error("Error initializing 3D Digital Twin in React:", err);
    }

    // Cleanup Babylon engine on unmount
    return () => {
      if (twinInstanceRef.current && twinInstanceRef.current.engine) {
        twinInstanceRef.current.engine.dispose();
      }
    };
  }, []);

  // 2. Reactively update 3D Digital Twin state whenever React telemetry props or isPlaying state changes
  useEffect(() => {
    if (sensors) {
      conveyorState.updateState({
        ...sensors,
        running: isPlaying,
        activeAnomaly: activeAnomaly
      });
    } else {
      conveyorState.updateState({
        running: isPlaying,
        activeAnomaly: activeAnomaly
      });
    }
  }, [sensors, activeAnomaly, isPlaying]);

  // 3. Reactively update camera view angle
  useEffect(() => {
    if (twinInstanceRef.current && window.setConveyorViewAngle) {
      window.setConveyorViewAngle(viewAngle);
    }
  }, [viewAngle]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '380px', position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%', display: 'block', outline: 'none', cursor: 'grab' }} 
      />
    </div>
  );
};
