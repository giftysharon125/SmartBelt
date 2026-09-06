/**
 * ConveyorState - Centralized State Management
 * Accepts and normalizes sensor data from any backend, IoT device, or React dashboard.
 * Exposes global functions for window postMessage and direct JS calls.
 */

class ConveyorState {
  constructor() {
    this.state = {
      speed: 3.8,           // m/s (HW-201 IR Encoder)
      vibration: 1.8,       // mm/s (MPU6050 Accel/Gyro)
      alignment: 1.2,       // mm offset / tracking (HW-201 IR Sensor)
      motor_rpm: 50,        // RPM (HW-201 IR Encoder - Max motor speed: 60 RPM)
      running: true,        // boolean
      activeAnomaly: null,  // null | 'JOINT_RUPTURE' | 'MISALIGNMENT_SPIKE' | 'MOTOR_OVERHEAT'
      minimalMode: false    // boolean for dashboard embed view
    };

    this.listeners = new Set();
    this.setupGlobalAPI();
  }

  getState() {
    return { ...this.state };
  }

  getDerivedMetrics() {
    const { speed, load, running } = this.state;
    const motorRpm = running ? Math.round(speed * 31.05) : 0;
    const materialFlow = running ? parseFloat((speed * (load / 100) * 1.33).toFixed(1)) : 0.0;
    const motorPower = running ? parseFloat((12.5 + (load / 100) * 52.0 + (speed / 6.0) * 12.0).toFixed(1)) : 0.0;
    
    return {
      motorRpm,
      materialFlow,
      motorPower
    };
  }

  /**
   * Accepts raw sensor telemetry in ANY format
   * and normalizes it into internal ConveyorState.
   */
  updateState(input) {
    if (!input || typeof input !== 'object') return;

    const normalized = {};

    // 1. Speed / RPM handling
    if (input.speed !== undefined) {
      normalized.speed = parseFloat(input.speed);
    } else if (input.speedRpm !== undefined) {
      normalized.speed = parseFloat((input.speedRpm / 15.8).toFixed(1));
    } else if (input.rpm !== undefined) {
      normalized.speed = parseFloat((input.rpm / 15.8).toFixed(1));
    }

    // 2. Temperature handling
    if (input.temperature !== undefined) {
      normalized.temperature = parseFloat(input.temperature);
    } else if (input.temperature_c !== undefined) {
      normalized.temperature = parseFloat(input.temperature_c);
    }

    // 3. Vibration handling
    if (input.vibration !== undefined) {
      normalized.vibration = parseFloat(input.vibration);
    } else if (input.vibration_g_rms !== undefined) {
      normalized.vibration = parseFloat((input.vibration_g_rms * 12.0).toFixed(1));
    }

    // 4. Alignment / Tracking handling
    if (input.alignment !== undefined) {
      normalized.alignment = parseFloat(input.alignment);
    } else if (input.tracking !== undefined) {
      normalized.alignment = parseFloat(input.tracking);
    } else if (input.belt_sag_mm_from_baseline !== undefined) {
      normalized.alignment = parseFloat(input.belt_sag_mm_from_baseline);
    }

    // 5. Load handling
    if (input.load !== undefined) {
      normalized.load = parseFloat(input.load);
    }

    // 6. Tension handling
    if (input.tension !== undefined) {
      normalized.tension = parseFloat(input.tension);
    }

    // 7. Acoustic handling
    if (input.acoustic !== undefined) {
      normalized.acoustic = parseFloat(input.acoustic);
    } else if (input.acoustic_baseline_ratio !== undefined) {
      normalized.acoustic = parseFloat((input.acoustic_baseline_ratio * 55.0).toFixed(1));
    }

    // 8. Active Anomaly
    if (input.activeAnomaly !== undefined) {
      normalized.activeAnomaly = input.activeAnomaly;
    } else if (input.anomaly_type !== undefined) {
      normalized.activeAnomaly = input.anomaly_type === 'RESET' ? null : input.anomaly_type;
    }

    // 9. Running state & Minimal mode
    if (input.running !== undefined) normalized.running = Boolean(input.running);
    if (input.minimalMode !== undefined) normalized.minimalMode = Boolean(input.minimalMode);

    // Apply normalized updates
    let changed = false;
    for (const key in normalized) {
      if (this.state[key] !== normalized[key]) {
        this.state[key] = normalized[key];
        changed = true;
      }
    }

    if (changed) {
      this.state.motor_rpm = this.state.running ? Math.round(this.state.speed * 31.05) : 0;
      this.notifyListeners();
    }
  }

  setupGlobalAPI() {
    if (typeof window !== 'undefined') {
      window.updateConveyorSensors = (sensorData) => {
        this.updateState(sensorData);
      };

      window.setConveyorAnomaly = (anomalyType) => {
        this.updateState({ activeAnomaly: anomalyType });
      };

      window.addEventListener('message', (event) => {
        if (!event.data) return;
        if (event.data.type === 'UPDATE_TELEMETRY' || event.data.type === 'SENSOR_DATA') {
          this.updateState(event.data.payload || event.data.data);
        } else if (event.data.type === 'SET_ANOMALY') {
          this.updateState({ activeAnomaly: event.data.anomaly });
        } else if (event.data.type === 'SET_MODE') {
          this.updateState({ minimalMode: event.data.mode === 'minimal' });
        }
      });
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getState(), this.getDerivedMetrics());
    return () => {
      this.listeners.delete(listener);
    };
  }

  notifyListeners() {
    const currentState = this.getState();
    const derived = this.getDerivedMetrics();
    for (const listener of this.listeners) {
      try {
        listener(currentState, derived);
      } catch (err) {
        console.error("Error in state listener:", err);
      }
    }
  }
}

export const conveyorState = new ConveyorState();
