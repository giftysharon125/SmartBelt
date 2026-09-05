import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';

/**
 * Sensors Module - Compact & Unobtrusive 3D Probes & Badges
 */
export class ConveyorSensors {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.headX = options.headX || 7;
    this.tailX = options.tailX || -7;
    this.height = options.height || 0.7;

    this.sensorProbes = [];
    this.guiLabels = {};

    this.createSensorMaterials();
    this.create3DSensorProbes();
    this.createUIOverlayLabels();
  }

  createSensorMaterials() {
    this.bracketMat = new BABYLON.StandardMaterial("bracketMat", this.scene);
    this.bracketMat.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.65);

    this.probeBodyMat = new BABYLON.StandardMaterial("probeBodyMat", this.scene);
    this.probeBodyMat.diffuseColor = new BABYLON.Color3(0.15, 0.45, 0.2);

    this.probeTipMat = new BABYLON.StandardMaterial("probeTipMat", this.scene);
    this.probeTipMat.diffuseColor = new BABYLON.Color3(0.0, 0.9, 1.0);
    this.probeTipMat.emissiveColor = new BABYLON.Color3(0.0, 0.5, 0.7);
  }

  create3DSensorProbes() {
    const opticalAlignSensor = this.createBracketProbeMesh("sensor_opt_align", new BABYLON.Vector3(-5.5, this.height + 0.1, 0.92));
    const tempSensor = this.createBracketProbeMesh("sensor_temp", new BABYLON.Vector3(6.2, this.height + 0.2, 0.92));
    const vibSensor = this.createBracketProbeMesh("sensor_vib", new BABYLON.Vector3(2.0, this.height + 0.1, 0.92));
    const loadSensor = this.createBracketProbeMesh("sensor_load", new BABYLON.Vector3(-2.0, this.height + 0.1, 0.92));
    const tensionSensor = this.createBracketProbeMesh("sensor_tension", new BABYLON.Vector3(-6.8, this.height - 0.1, 0.92));

    this.sensorProbes = [
      { id: 'alignment', mesh: opticalAlignSensor },
      { id: 'temperature', mesh: tempSensor },
      { id: 'vibration', mesh: vibSensor },
      { id: 'load', mesh: loadSensor },
      { id: 'tension', mesh: tensionSensor }
    ];
  }

  createBracketProbeMesh(name, position) {
    const probeGroup = new BABYLON.TransformNode(name, this.scene);
    probeGroup.position = position;

    const bracket = BABYLON.MeshBuilder.CreateBox(`${name}_bracket`, {
      width: 0.04,
      height: 0.14,
      depth: 0.06
    }, this.scene);
    bracket.rotation.z = Math.PI / 6;
    bracket.material = this.bracketMat;
    bracket.parent = probeGroup;

    const probe = BABYLON.MeshBuilder.CreateCylinder(`${name}_cylinder`, {
      diameter: 0.035,
      height: 0.10,
      tessellation: 12
    }, this.scene);
    probe.position = new BABYLON.Vector3(0.02, 0.06, -0.02);
    probe.material = this.probeBodyMat;
    probe.parent = probeGroup;

    const tip = BABYLON.MeshBuilder.CreateSphere(`${name}_tip`, {
      diameter: 0.025,
      segments: 12
    }, this.scene);
    tip.position = new BABYLON.Vector3(0.02, 0.12, -0.02);
    tip.material = this.probeTipMat;
    tip.parent = probeGroup;

    return probeGroup;
  }

  createUIOverlayLabels() {
    this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI_Sensors", true, this.scene);

    const labelConfigs = [
      { id: 'motor_health', text: 'MOTOR HEALTHY', target: this.sensorProbes[1].mesh, offsetY: -55, color: '#00e676' },
      { id: 'temperature', text: 'TEMP: 42 °C', target: this.sensorProbes[1].mesh, offsetY: -32, color: '#00e5ff' },
      { id: 'vibration', text: 'VIB: 1.8 mm/s', target: this.sensorProbes[2].mesh, offsetY: -35, color: '#00e5ff' },
      { id: 'alignment', text: 'ALIGNMENT: OK', target: this.sensorProbes[0].mesh, offsetY: -35, color: '#00e676' },
      { id: 'load', text: 'LOAD: 83 %', target: this.sensorProbes[3].mesh, offsetY: -35, color: '#ffb300' }
    ];

    labelConfigs.forEach(cfg => {
      const labelContainer = new GUI.Rectangle(`rect_${cfg.id}`);
      labelContainer.width = "115px";
      labelContainer.height = "20px";
      labelContainer.cornerRadius = 4;
      labelContainer.color = cfg.color;
      labelContainer.thickness = 1.2;
      labelContainer.background = "rgba(11, 14, 20, 0.85)";

      const text = new GUI.TextBlock(`text_${cfg.id}`);
      text.text = cfg.text;
      text.color = "#ffffff";
      text.fontSize = 9;
      text.fontFamily = "Chakra Petch, sans-serif";
      text.fontWeight = "bold";

      labelContainer.addControl(text);
      this.advancedTexture.addControl(labelContainer);

      labelContainer.linkWithMesh(cfg.target);
      labelContainer.linkOffsetY = cfg.offsetY;

      this.guiLabels[cfg.id] = { container: labelContainer, text: text };
    });
  }

  update(state, healthStatus) {
    if (!this.guiLabels.temperature) return;

    const tempHealth = healthStatus ? healthStatus.metrics.temperature : 'NORMAL';
    this.guiLabels.temperature.text.text = `TEMP: ${state.temperature} °C`;
    this.guiLabels.temperature.container.color = tempHealth === 'CRITICAL' ? '#ff1744' : tempHealth === 'WARNING' ? '#ffb300' : '#00e5ff';

    const vibHealth = healthStatus ? healthStatus.metrics.vibration : 'NORMAL';
    this.guiLabels.vibration.text.text = `VIB: ${state.vibration.toFixed(1)} mm/s`;
    this.guiLabels.vibration.container.color = vibHealth === 'CRITICAL' ? '#ff1744' : vibHealth === 'WARNING' ? '#ffb300' : '#00e5ff';

    const alignHealth = healthStatus ? healthStatus.metrics.alignment : 'NORMAL';
    if (alignHealth === 'CRITICAL') {
      this.guiLabels.alignment.text.text = 'ALIGN: BLOCKED';
      this.guiLabels.alignment.container.color = '#ff1744';
    } else if (alignHealth === 'WARNING') {
      this.guiLabels.alignment.text.text = 'ALIGN: DRIFT';
      this.guiLabels.alignment.container.color = '#ffb300';
    } else {
      this.guiLabels.alignment.text.text = 'ALIGNMENT: OK';
      this.guiLabels.alignment.container.color = '#00e676';
    }

    const motorHealth = healthStatus ? healthStatus.components.motor : 'NORMAL';
    if (motorHealth === 'CRITICAL') {
      this.guiLabels.motor_health.text.text = 'MOTOR CRITICAL';
      this.guiLabels.motor_health.container.color = '#ff1744';
      this.guiLabels.motor_health.text.color = '#ff1744';
    } else if (motorHealth === 'WARNING') {
      this.guiLabels.motor_health.text.text = 'MOTOR OVERHEAT';
      this.guiLabels.motor_health.container.color = '#ffb300';
      this.guiLabels.motor_health.text.color = '#ffb300';
    } else {
      this.guiLabels.motor_health.text.text = 'MOTOR HEALTHY';
      this.guiLabels.motor_health.container.color = '#00e676';
      this.guiLabels.motor_health.text.color = '#00e676';
    }
  }
}
