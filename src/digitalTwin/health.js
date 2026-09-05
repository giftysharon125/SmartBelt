/**
 * Health Logic & Threshold Evaluator
 * Evaluates telemetry against central thresholds and anomaly triggers.
 */

export const HEALTH_THRESHOLDS = {
  temperature: { warning: 60, critical: 80 },
  vibration: { warning: 3.0, critical: 6.0 },
  load: { warning: 90, critical: 98 },
  tension: { warningMin: 80, warningMax: 200, criticalMin: 60, criticalMax: 230 },
  alignment: { warning: 2.5, critical: 4.0 }
};

export class HealthEvaluator {
  static evaluateState(state) {
    const { temperature, vibration, load, tension, alignment, activeAnomaly } = state;

    // Direct Anomaly Overrides
    if (activeAnomaly === 'JOINT_RUPTURE') {
      return {
        overallState: 'CRITICAL',
        components: { motor: 'NORMAL', load: 'WARNING', tension: 'CRITICAL', alignment: 'WARNING' },
        metrics: { temperature: 'NORMAL', vibration: 'CRITICAL', load: 'WARNING', tension: 'CRITICAL', alignment: 'WARNING' },
        activeAnomaly
      };
    } else if (activeAnomaly === 'MOTOR_OVERHEAT') {
      return {
        overallState: 'CRITICAL',
        components: { motor: 'CRITICAL', load: 'NORMAL', tension: 'NORMAL', alignment: 'NORMAL' },
        metrics: { temperature: 'CRITICAL', vibration: 'CRITICAL', load: 'NORMAL', tension: 'NORMAL', alignment: 'NORMAL' },
        activeAnomaly
      };
    } else if (activeAnomaly === 'MISALIGNMENT_SPIKE') {
      return {
        overallState: 'CRITICAL',
        components: { motor: 'NORMAL', load: 'NORMAL', tension: 'WARNING', alignment: 'CRITICAL' },
        metrics: { temperature: 'NORMAL', vibration: 'WARNING', load: 'NORMAL', tension: 'WARNING', alignment: 'CRITICAL' },
        activeAnomaly
      };
    } else if (activeAnomaly === 'HEAVY_OVERLOAD') {
      return {
        overallState: 'WARNING',
        components: { motor: 'WARNING', load: 'CRITICAL', tension: 'WARNING', alignment: 'NORMAL' },
        metrics: { temperature: 'WARNING', vibration: 'WARNING', load: 'CRITICAL', tension: 'WARNING', alignment: 'NORMAL' },
        activeAnomaly
      };
    }

    // Standard threshold evaluations
    const motorHealth = (temperature >= HEALTH_THRESHOLDS.temperature.critical || vibration >= HEALTH_THRESHOLDS.vibration.critical) ? 'CRITICAL' :
                        (temperature >= HEALTH_THRESHOLDS.temperature.warning || vibration >= HEALTH_THRESHOLDS.vibration.warning) ? 'WARNING' : 'NORMAL';

    const loadHealth = this.evaluateMetric('load', load);
    const tensionHealth = (tension <= HEALTH_THRESHOLDS.tension.criticalMin || tension >= HEALTH_THRESHOLDS.tension.criticalMax) ? 'CRITICAL' :
                          (tension <= HEALTH_THRESHOLDS.tension.warningMin || tension >= HEALTH_THRESHOLDS.tension.warningMax) ? 'WARNING' : 'NORMAL';
    const alignmentHealth = Math.abs(alignment) >= HEALTH_THRESHOLDS.alignment.critical ? 'CRITICAL' :
                            Math.abs(alignment) >= HEALTH_THRESHOLDS.alignment.warning ? 'WARNING' : 'NORMAL';

    let overallState = 'NORMAL';
    if (motorHealth === 'CRITICAL' || loadHealth === 'CRITICAL' || tensionHealth === 'CRITICAL' || alignmentHealth === 'CRITICAL') {
      overallState = 'CRITICAL';
    } else if (motorHealth === 'WARNING' || loadHealth === 'WARNING' || tensionHealth === 'WARNING' || alignmentHealth === 'WARNING') {
      overallState = 'WARNING';
    }

    return {
      overallState,
      components: { motor: motorHealth, load: loadHealth, tension: tensionHealth, alignment: alignmentHealth },
      metrics: {
        temperature: this.evaluateMetric('temperature', temperature),
        vibration: this.evaluateMetric('vibration', vibration),
        load: loadHealth,
        tension: tensionHealth,
        alignment: alignmentHealth
      },
      activeAnomaly: null
    };
  }

  static evaluateMetric(key, value) {
    const th = HEALTH_THRESHOLDS[key];
    if (!th) return 'NORMAL';
    if (value >= th.critical) return 'CRITICAL';
    if (value >= th.warning) return 'WARNING';
    return 'NORMAL';
  }
}
