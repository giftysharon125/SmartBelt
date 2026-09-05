import * as BABYLON from '@babylonjs/core';

/**
 * Drive Motor, Control Box & Side Belt Transmission Module
 */
export class DriveMotor {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.headX = options.headX || 7;
    this.height = options.height || 0.7;

    this.pulseTimer = 0;
    this.createMotorMesh();
    this.createControlBox();
    this.createSideBeltTransmission();
  }

  createMotorMesh() {
    this.motorGroup = new BABYLON.TransformNode("motorGroup", this.scene);
    // Align motor box behind lower transmission pulley on the same side of blue frame rod
    this.motorGroup.position = new BABYLON.Vector3(this.headX + 1.35, 0.25, -0.45);

    // Blue Motor Body Material
    this.blueMotorMat = new BABYLON.StandardMaterial("blueMotorMat", this.scene);
    this.blueMotorMat.diffuseColor = new BABYLON.Color3(0.05, 0.4, 0.75);
    this.blueMotorMat.specularColor = new BABYLON.Color3(0.4, 0.5, 0.6);

    // Main Cylindrical Electric Motor Casing
    this.stator = BABYLON.MeshBuilder.CreateCylinder("physicalMotorStator", {
      diameter: 0.65,
      height: 0.8,
      tessellation: 24
    }, this.scene);
    this.stator.rotation.z = Math.PI / 2;
    this.stator.position = new BABYLON.Vector3(0, 0, 0);
    this.stator.material = this.blueMotorMat;
    this.stator.parent = this.motorGroup;

    // Capacitor Cylinder
    const capMat = new BABYLON.StandardMaterial("capMat", this.scene);
    capMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.92);

    const capacitor = BABYLON.MeshBuilder.CreateCylinder("motorCapacitor", {
      diameter: 0.2,
      height: 0.4,
      tessellation: 16
    }, this.scene);
    capacitor.position = new BABYLON.Vector3(0.2, 0.35, 0.2);
    capacitor.material = capMat;
    capacitor.parent = this.motorGroup;
  }

  createControlBox() {
    const boxMat = new BABYLON.StandardMaterial("controlBoxMat", this.scene);
    boxMat.diffuseColor = new BABYLON.Color3(0.85, 0.88, 0.9);
    boxMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);

    const boxGroup = new BABYLON.TransformNode("controlBoxGroup", this.scene);
    boxGroup.position = new BABYLON.Vector3(this.headX + 1.35, this.height + 0.35, -0.45);

    // Main Housing Box
    const mainBox = BABYLON.MeshBuilder.CreateBox("ctrlBoxMain", {
      width: 1.2,
      height: 0.6,
      depth: 1.1
    }, this.scene);
    mainBox.material = boxMat;
    mainBox.parent = boxGroup;

    // Open Flip-Lid Panel
    const lid = BABYLON.MeshBuilder.CreateBox("ctrlBoxLid", {
      width: 1.2,
      height: 0.8,
      depth: 0.04
    }, this.scene);
    lid.position = new BABYLON.Vector3(0, 0.6, -0.55);
    lid.rotation.x = -Math.PI / 4;
    lid.material = boxMat;
    lid.parent = boxGroup;

    // Internal components
    const relayMat = new BABYLON.StandardMaterial("relayMat", this.scene);
    relayMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.12);

    const relay = BABYLON.MeshBuilder.CreateBox("relaySwitch", {
      width: 0.3,
      height: 0.3,
      depth: 0.3
    }, this.scene);
    relay.position = new BABYLON.Vector3(-0.2, 0.1, 0);
    relay.material = relayMat;
    relay.parent = boxGroup;

    // Status LED Light on Control Box Panel
    this.statusLedMat = new BABYLON.StandardMaterial("controlBoxLedMat", this.scene);
    this.statusLedMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
    this.statusLedMat.emissiveColor = new BABYLON.Color3(0, 0.9, 0.3);

    const led = BABYLON.MeshBuilder.CreateSphere("controlBoxLed", {
      diameter: 0.08,
      segments: 16
    }, this.scene);
    led.position = new BABYLON.Vector3(0.4, 0.32, -0.52);
    led.material = this.statusLedMat;
    led.parent = boxGroup;
  }

  createSideBeltTransmission() {
    const transGroup = new BABYLON.TransformNode("sideTransmissionGroup", this.scene);
    transGroup.position = new BABYLON.Vector3(this.headX, 0, -0.88);

    // Vivid Blue Gloss Material for the 2 Transmission Pulleys (matching hardware photo)
    const bluePulleyMat = new BABYLON.StandardMaterial("bluePulleyMat", this.scene);
    bluePulleyMat.diffuseColor = new BABYLON.Color3(0.04, 0.36, 0.84); // Hardware Blue Lacquer
    bluePulleyMat.specularColor = new BABYLON.Color3(0.5, 0.6, 0.8);
    bluePulleyMat.roughness = 0.3;

    // Steel Shaft Pin Material
    const shaftMat = new BABYLON.StandardMaterial("shaftMat", this.scene);
    shaftMat.diffuseColor = new BABYLON.Color3(0.7, 0.75, 0.8);
    shaftMat.specularColor = new BABYLON.Color3(0.9, 0.9, 0.95);

    // Bearing Pillow Block Mount Material
    const mountMat = new BABYLON.StandardMaterial("pillowBlockMountMat", this.scene);
    mountMat.diffuseColor = new BABYLON.Color3(0.2, 0.25, 0.3);
    mountMat.specularColor = new BABYLON.Color3(0.6, 0.6, 0.7);

    // Black Rubber V-Belt Material with Yellow Text Branding
    const vBeltMat = new BABYLON.StandardMaterial("vBeltMat", this.scene);
    vBeltMat.diffuseColor = new BABYLON.Color3(0.12, 0.12, 0.14);
    vBeltMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    // Canvas Texture for FENNER FHP 2180 Labeling on V-Belt
    const vBeltCanvas = document.createElement('canvas');
    vBeltCanvas.width = 512;
    vBeltCanvas.height = 64;
    const ctx = vBeltCanvas.getContext('2d');
    ctx.fillStyle = '#1D1F21';
    ctx.fillRect(0, 0, 512, 64);
    ctx.fillStyle = '#E9A23B';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('FENNER FHP 2180', 40, 40);
    ctx.fillText('FENNER FHP 2180', 300, 40);

    const vBeltTex = new BABYLON.HtmlElementTexture("vBeltLabelTex", vBeltCanvas, { scene: this.scene, engine: this.scene.getEngine() });
    vBeltMat.diffuseTexture = vBeltTex;

    // 1. Upper Head Drive Shaft Blue Pulley Assembly (Mounted on Blue Frame Rod)
    const upperGroup = new BABYLON.TransformNode("upperPulleyGroup", this.scene);
    upperGroup.position = new BABYLON.Vector3(0, this.height, 0);
    upperGroup.parent = transGroup;

    // Pillow Block Bearing Mount on Blue Rod Frame
    const upperMount = BABYLON.MeshBuilder.CreateBox("upperShaftMount", {
      width: 0.3,
      height: 0.3,
      depth: 0.14
    }, this.scene);
    upperMount.position = new BABYLON.Vector3(0, 0, 0.08);
    upperMount.material = mountMat;
    upperMount.parent = upperGroup;

    // Blue Main Pulley Disk
    const upperDisk = BABYLON.MeshBuilder.CreateCylinder("upperDrivePulleyDisk", {
      diameter: 0.46,
      height: 0.12,
      tessellation: 32
    }, this.scene);
    upperDisk.rotation.x = Math.PI / 2;
    upperDisk.material = bluePulleyMat;
    upperDisk.parent = upperGroup;

    // Steel Shaft Center Pin / Stub
    const upperShaftPin = BABYLON.MeshBuilder.CreateCylinder("upperShaftPin", {
      diameter: 0.09,
      height: 0.24,
      tessellation: 20
    }, this.scene);
    upperShaftPin.rotation.x = Math.PI / 2;
    upperShaftPin.material = shaftMat;
    upperShaftPin.parent = upperGroup;

    this.upperPulley = upperDisk;

    // 2. Lower Motor Shaft Blue Pulley Assembly (Mounted on Motor Drive Shaft & Blue Rod Frame)
    const lowerXOffset = 1.35;
    const lowerYPos = 0.25;

    const lowerGroup = new BABYLON.TransformNode("lowerPulleyGroup", this.scene);
    lowerGroup.position = new BABYLON.Vector3(lowerXOffset, lowerYPos, 0);
    lowerGroup.parent = transGroup;

    // Pillow Block Bearing Mount on Blue Frame Rod
    const lowerMount = BABYLON.MeshBuilder.CreateBox("lowerShaftMount", {
      width: 0.32,
      height: 0.32,
      depth: 0.14
    }, this.scene);
    lowerMount.position = new BABYLON.Vector3(0, 0, 0.08);
    lowerMount.material = mountMat;
    lowerMount.parent = lowerGroup;

    // Solid Steel Extension Shaft connecting Motor Shaft to Lower Shaft Mount
    const motorExtensionShaft = BABYLON.MeshBuilder.CreateCylinder("motorExtensionShaft", {
      diameter: 0.09,
      height: 0.5,
      tessellation: 20
    }, this.scene);
    motorExtensionShaft.rotation.x = Math.PI / 2;
    motorExtensionShaft.position = new BABYLON.Vector3(0, 0, 0.3);
    motorExtensionShaft.material = shaftMat;
    motorExtensionShaft.parent = lowerGroup;

    // Blue Motor Shaft Pulley Disk
    const lowerDisk = BABYLON.MeshBuilder.CreateCylinder("lowerMotorPulleyDisk", {
      diameter: 0.38,
      height: 0.12,
      tessellation: 32
    }, this.scene);
    lowerDisk.rotation.x = Math.PI / 2;
    lowerDisk.material = bluePulleyMat;
    lowerDisk.parent = lowerGroup;

    // Steel Shaft Center Pin / Stub
    const lowerShaftPin = BABYLON.MeshBuilder.CreateCylinder("lowerShaftPin", {
      diameter: 0.09,
      height: 0.24,
      tessellation: 20
    }, this.scene);
    lowerShaftPin.rotation.x = Math.PI / 2;
    lowerShaftPin.material = shaftMat;
    lowerShaftPin.parent = lowerGroup;

    this.lowerPulley = lowerDisk;

    // 3. Stretched Angled V-Belt Drive Loop connecting upper and lower pulleys
    const rUpper = 0.23;
    const rLower = 0.19;
    const pUpper = new BABYLON.Vector3(0, this.height, 0);
    const pLower = new BABYLON.Vector3(lowerXOffset, lowerYPos, 0);

    const beltLoopPoints = [];
    const steps = 16;

    // Top strand & upper arc around head shaft pulley
    for (let i = 0; i <= steps; i++) {
      const angle = (Math.PI / 2) + (i / steps) * Math.PI;
      beltLoopPoints.push(new BABYLON.Vector3(
        pUpper.x + rUpper * Math.cos(angle),
        pUpper.y + rUpper * Math.sin(angle),
        0
      ));
    }

    // Bottom strand & lower arc around motor shaft pulley
    for (let i = 0; i <= steps; i++) {
      const angle = (-Math.PI / 2) + (i / steps) * Math.PI;
      beltLoopPoints.push(new BABYLON.Vector3(
        pLower.x + rLower * Math.cos(angle),
        pLower.y + rLower * Math.sin(angle),
        0
      ));
    }

    // Close loop
    beltLoopPoints.push(beltLoopPoints[0]);

    const vBeltLoop = BABYLON.MeshBuilder.CreateTube("sideVBeltLoop", {
      path: beltLoopPoints,
      radius: 0.038,
      sideOrientation: BABYLON.Mesh.DOUBLESIDE,
      tessellation: 16
    }, this.scene);
    vBeltLoop.material = vBeltMat;
    vBeltLoop.parent = transGroup;

    this.sideTransGroup = transGroup;
  }

  update(dt, healthStatus, running = true, speed = 3.8) {
    if (running && speed > 0) {
      this.pulseTimer += dt * 4;
      if (this.lowerPulley) this.lowerPulley.rotate(BABYLON.Axis.Y, dt * speed * 3, BABYLON.Space.LOCAL);
      if (this.upperPulley) this.upperPulley.rotate(BABYLON.Axis.Y, dt * speed * 1.5, BABYLON.Space.LOCAL);
    }

    const motorHealth = healthStatus ? healthStatus.components.motor : 'NORMAL';

    if (motorHealth === 'CRITICAL') {
      const intensity = 0.5 + Math.sin(this.pulseTimer * 2) * 0.4;
      this.blueMotorMat.emissiveColor = new BABYLON.Color3(intensity, 0.05, 0.05);
      this.statusLedMat.emissiveColor = new BABYLON.Color3(1.0, 0.0, 0.0);
    } else if (motorHealth === 'WARNING') {
      this.blueMotorMat.emissiveColor = new BABYLON.Color3(0.5, 0.35, 0.0);
      this.statusLedMat.emissiveColor = new BABYLON.Color3(1.0, 0.7, 0.0);
    } else {
      this.blueMotorMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
      this.statusLedMat.emissiveColor = new BABYLON.Color3(0.0, 0.9, 0.4);
    }
  }
}
