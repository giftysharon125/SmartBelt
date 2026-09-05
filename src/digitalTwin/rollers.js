import * as BABYLON from '@babylonjs/core';

/**
 * Rollers & Frame Module
 * Keeps Head Pulley, Tail Pulley, and Blue C-Channel Frame.
 */
export class ConveyorRollers {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.length = options.length || 14;
    this.headX = this.length / 2;
    this.tailX = -this.length / 2;
    this.height = options.height || 0.7;
    this.pulleyRadius = options.pulleyRadius || 0.5;

    this.rotatingComponents = [];

    this.createMaterials();
    this.createFrame();
    this.createPulleys();
    this.createCabling();
  }

  createMaterials() {
    this.blueMat = new BABYLON.StandardMaterial("blueFrameMat", this.scene);
    this.blueMat.diffuseColor = new BABYLON.Color3(0.04, 0.36, 0.84);
    this.blueMat.specularColor = new BABYLON.Color3(0.4, 0.5, 0.7);
    this.blueMat.roughness = 0.4;

    this.steelMat = new BABYLON.StandardMaterial("steelMat", this.scene);
    this.steelMat.diffuseColor = new BABYLON.Color3(0.5, 0.55, 0.6);
    this.steelMat.specularColor = new BABYLON.Color3(0.8, 0.8, 0.9);

    this.cableMat = new BABYLON.StandardMaterial("cableMat", this.scene);
    this.cableMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.12);
  }

  createFrame() {
    const frameLength = this.length + 1.2;

    const leftStringer = BABYLON.MeshBuilder.CreateBox("leftStringer", {
      width: frameLength,
      height: 0.25,
      depth: 0.08
    }, this.scene);
    leftStringer.position = new BABYLON.Vector3(0, this.height, 0.8);
    leftStringer.material = this.blueMat;

    const rightStringer = leftStringer.clone("rightStringer");
    rightStringer.position.z = -0.8;

    // 3 Vertical Support Leg Assemblies
    const legXPositions = [-5.5, 0.0, 5.5];
    legXPositions.forEach(x => {
      const legLeft = BABYLON.MeshBuilder.CreateBox(`legL_${x}`, {
        width: 0.18,
        height: this.height + 0.3,
        depth: 0.18
      }, this.scene);
      legLeft.position = new BABYLON.Vector3(x, (this.height + 0.3) / 2 - 0.15, 0.8);
      legLeft.material = this.blueMat;

      const legRight = legLeft.clone(`legR_${x}`);
      legRight.position.z = -0.8;
    });
  }

  createPulleys() {
    // 1. Head Drive Pulley (Right side)
    const headPulley = BABYLON.MeshBuilder.CreateCylinder("headPulley", {
      diameter: this.pulleyRadius * 2,
      height: 1.5,
      tessellation: 32
    }, this.scene);
    headPulley.rotation.x = Math.PI / 2;
    headPulley.position = new BABYLON.Vector3(this.headX, this.height, 0);
    headPulley.material = this.steelMat;

    this.headPulley = headPulley;
    this.rotatingComponents.push({ mesh: headPulley, radius: this.pulleyRadius, dir: -1 });

    // 2. Tail Pulley (Left side)
    const tailPulley = BABYLON.MeshBuilder.CreateCylinder("tailPulley", {
      diameter: this.pulleyRadius * 2,
      height: 1.5,
      tessellation: 32
    }, this.scene);
    tailPulley.rotation.x = Math.PI / 2;
    tailPulley.position = new BABYLON.Vector3(this.tailX, this.height, 0);
    tailPulley.material = this.steelMat;

    this.tailPulley = tailPulley;
    this.rotatingComponents.push({ mesh: tailPulley, radius: this.pulleyRadius, dir: -1 });

    // 3. Top Carrying Idler Rollers along conveyor flight (3 total: 2 at ends, 1 at middle)
    const carryingXCoords = [-5.5, 0.0, 5.5];
    carryingXCoords.forEach((xPos, idx) => {
      const idler = BABYLON.MeshBuilder.CreateCylinder(`carryingIdler_${idx}`, {
        diameter: 0.2,
        height: 1.5,
        tessellation: 20
      }, this.scene);
      idler.rotation.x = Math.PI / 2;
      idler.position = new BABYLON.Vector3(xPos, this.height + 0.1, 0);
      idler.material = this.steelMat;
      this.rotatingComponents.push({ mesh: idler, radius: 0.1, dir: -1 });
    });

    // 4. Bottom Return Idler Rollers (3 total: 2 at ends, 1 at middle)
    const returnXCoords = [-5.5, 0.0, 5.5];
    returnXCoords.forEach((xPos, idx) => {
      const retIdler = BABYLON.MeshBuilder.CreateCylinder(`returnIdler_${idx}`, {
        diameter: 0.2,
        height: 1.5,
        tessellation: 20
      }, this.scene);
      retIdler.rotation.x = Math.PI / 2;
      retIdler.position = new BABYLON.Vector3(xPos, this.height - 0.45, 0);
      retIdler.material = this.steelMat;
      this.rotatingComponents.push({ mesh: retIdler, radius: 0.1, dir: -1 });
    });
  }

  createCabling() {
    const cablePath = [
      new BABYLON.Vector3(-6.5, this.height - 0.12, 0.85),
      new BABYLON.Vector3(0.0, this.height - 0.12, 0.85),
      new BABYLON.Vector3(6.5, this.height - 0.12, 0.85),
      new BABYLON.Vector3(7.2, this.height + 0.3, 0.85)
    ];

    const cable = BABYLON.MeshBuilder.CreateTube("sensorCableConduit", {
      path: cablePath,
      radius: 0.025,
      sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, this.scene);
    cable.material = this.cableMat;
  }

  update(dt, speed, running) {
    if (!running || speed <= 0) return;

    for (const comp of this.rotatingComponents) {
      const omega = (speed / comp.radius) * comp.dir * dt;
      comp.mesh.rotate(BABYLON.Axis.Y, omega, BABYLON.Space.LOCAL);
    }
  }
}
