import * as BABYLON from '@babylonjs/core';
import '@babylonjs/materials';
import { ConveyorBelt } from './belt.js';
import { ConveyorRollers } from './rollers.js';
import { DriveMotor } from './motor.js';
import { IronOreSystem } from './ore.js';
import { ConveyorSensors } from './sensors.js';
import { conveyorState } from './conveyorState.js';
import { HealthEvaluator } from './health.js';

export class ConveyorDigitalTwin {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas element with id '${canvasId}' not found`);
    }

    this.engine = new BABYLON.Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true
    });

    this.scene = this.createScene();
    this.initComponents();
    this.startRenderLoop();
    this.handleResize();

    // Global Camera Angle API
    if (typeof window !== 'undefined') {
      window.setConveyorViewAngle = (viewNumber) => this.setViewAngle(viewNumber);
    }
  }

  createScene() {
    const scene = new BABYLON.Scene(this.engine);
    scene.clearColor = new BABYLON.Color4(0.15, 0.20, 0.22, 1.0); // Industrial Steel background

    // Default Isometric View - Zoomed out & framed to fit 100% inside screen
    this.camera = new BABYLON.ArcRotateCamera(
      "DigitalTwinCamera",
      BABYLON.Tools.ToRadians(50),
      BABYLON.Tools.ToRadians(65),
      22.0,
      new BABYLON.Vector3(0, 0.8, 0),
      scene
    );

    this.camera.attachControl(this.canvas, true);
    this.camera.lowerRadiusLimit = 2;
    this.camera.upperRadiusLimit = 55;
    this.camera.lowerBetaLimit = BABYLON.Tools.ToRadians(10);
    this.camera.upperBetaLimit = BABYLON.Tools.ToRadians(88);
    this.camera.panningSensibility = 50;
    this.camera.wheelPrecision = 20;

    // Lighting
    const ambientLight = new BABYLON.HemisphericLight(
      "ambientLight",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    ambientLight.intensity = 0.75;
    ambientLight.diffuse = new BABYLON.Color3(0.8, 0.85, 0.95);
    ambientLight.groundColor = new BABYLON.Color3(0.15, 0.18, 0.22);

    const dirLight = new BABYLON.DirectionalLight(
      "dirLight",
      new BABYLON.Vector3(-1, -2, -1.5),
      scene
    );
    dirLight.position = new BABYLON.Vector3(15, 20, 15);
    dirLight.intensity = 1.2;

    this.shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
    this.shadowGenerator.useBlurExponentialShadowMap = true;
    this.shadowGenerator.blurKernel = 16;

    this.createIndustrialGridFloor(scene);

    return scene;
  }

  createIndustrialGridFloor(scene) {
    const floor = BABYLON.MeshBuilder.CreateGround("industrialFloor", {
      width: 50,
      height: 50,
      subdivisions: 4
    }, scene);
    floor.position.y = -0.2;
    floor.receiveShadows = true;

    const gridCanvas = document.createElement('canvas');
    gridCanvas.width = 512;
    gridCanvas.height = 512;
    const ctx = gridCanvas.getContext('2d');

    ctx.fillStyle = '#1D272C';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#3A4950';
    ctx.lineWidth = 2;
    const step = 64;
    for (let x = 0; x <= 512; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    const floorTexture = new BABYLON.HtmlElementTexture("floorGridTex", gridCanvas, { scene, engine: this.engine });

    const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
    floorMat.diffuseTexture = floorTexture;
    floorMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.08);
    floor.material = floorMat;
  }

  initComponents() {
    // Scaled length = 14m (headX = 7, tailX = -7) so the complete conveyor flight fits inside screen
    this.belt = new ConveyorBelt(this.scene, { length: 14, width: 1.4, height: 0.7 });
    this.rollers = new ConveyorRollers(this.scene, { length: 14, height: 0.7 });
    this.motor = new DriveMotor(this.scene, { headX: 7, height: 0.7 });
    this.oreSystem = new IronOreSystem(this.scene, { headX: 7, tailX: -7 });
    this.sensors = new ConveyorSensors(this.scene, { headX: 7, tailX: -7, height: 0.7 });
  }

  startRenderLoop() {
    let lastTime = performance.now();

    this.engine.runRenderLoop(() => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const state = conveyorState.getState();
      const healthStatus = HealthEvaluator.evaluateState(state);

      this.belt.update(dt, state.speed, state.running);
      this.rollers.update(dt, state.speed, state.running, healthStatus);
      this.motor.update(dt, healthStatus, state.running, state.speed);
      this.oreSystem.update(dt, state.speed, state.load, state.running);
      this.sensors.update(state, healthStatus);

      this.scene.render();
    });
  }

  setViewAngle(viewNumber) {
    if (!this.camera) return;

    if (viewNumber === 1) {
      // 1: ISOMETRIC VIEW - Perfectly framed to fit conveyor belt in screen
      this.camera.setPosition(new BABYLON.Vector3(14, 12, 19));
      this.camera.setTarget(new BABYLON.Vector3(0, 0.8, 0));
    } else if (viewNumber === 2) {
      // 2: DRIVE MOTOR & CONTROL BOX VIEW
      this.camera.setPosition(new BABYLON.Vector3(9.5, 2.8, 3.2));
      this.camera.setTarget(new BABYLON.Vector3(7, 0.8, 0.4));
    } else if (viewNumber === 3) {
      // 3: SIDE ELEVATION PROFILE - Fits complete length inside screen
      this.camera.setPosition(new BABYLON.Vector3(0, 2.0, 20));
      this.camera.setTarget(new BABYLON.Vector3(0, 0.8, 0));
    } else if (viewNumber === 4) {
      // 4: BELT JOINT SPLICE J-03 DETAIL ZOOM
      this.camera.setPosition(new BABYLON.Vector3(1.5, 2.8, 4.8));
      this.camera.setTarget(new BABYLON.Vector3(0, 1.0, 0));
    } else if (viewNumber === 5) {
      // 5: TAIL PULLEY & TENSIONER VIEW
      this.camera.setPosition(new BABYLON.Vector3(-9.5, 3.0, 3.8));
      this.camera.setTarget(new BABYLON.Vector3(-7, 0.8, 0));
    }
  }

  handleResize() {
    window.addEventListener('resize', () => {
      if (this.engine) this.engine.resize();
    });
  }
}
