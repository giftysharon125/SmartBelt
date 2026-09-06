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
    const speedEncoderSensor = this.createBracketProbeMesh("sensor_speed", new BABYLON.Vector3(6.2, this.height + 0.2, 0.92));
    const vibSensor = this.createBracketProbeMesh("sensor_vib", new BABYLON.Vector3(2.0, this.height + 0.1, 0.92));

    this.sensorProbes = [
      { id: 'alignment', mesh: opticalAlignSensor },
      { id: 'speed', mesh: speedEncoderSensor },
      { id: 'vibration', mesh: vibSensor }
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
      { id: 'vibration', text: 'VIB: 1.8 mm/s', target: this.sensorProbes[2].mesh, offsetY: -35, color: '#00e5ff' },
      { id: 'speed', text: 'SPEED: 50 RPM', target: this.sensorProbes[1].mesh, offsetY: -35, color: '#00e5ff' },
      { id: 'alignment', text: 'ALIGNMENT: OK', target: this.sensorProbes[0].mesh, offsetY: -35, color: '#00e676' }
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
    if (!this.guiLabels.vibration) return;

    const vibVal = state.vibration ? state.vibration.toFixed(1) : '1.8';
    const vibHealth = state.vibration > 4 ? 'CRITICAL' : state.vibration > 3 ? 'WARNING' : 'NORMAL';
    this.guiLabels.vibration.text.text = `VIB: ${vibVal} mm/s`;
    this.guiLabels.vibration.container.color = vibHealth === 'CRITICAL' ? '#ff1744' : vibHealth === 'WARNING' ? '#ffb300' : '#00e5ff';

    const rpmVal = state.motor_rpm || state.rpm || 50;
    this.guiLabels.speed.text.text = `SPEED: ${rpmVal} RPM`;
    this.guiLabels.speed.container.color = rpmVal < 40 ? '#ffb300' : '#00e5ff';

    const isMisaligned = state.alignment === 'MISALIGNED' || Math.abs(state.alignment) > 5;
    if (isMisaligned) {
      this.guiLabels.alignment.text.text = 'ALIGN: DRIFT';
      this.guiLabels.alignment.container.color = '#ff1744';
    } else {
      this.guiLabels.alignment.text.text = 'ALIGNMENT: OK';
      this.guiLabels.alignment.container.color = '#00e676';
    }
  }
}
