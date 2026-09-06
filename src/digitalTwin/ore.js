import * as BABYLON from '@babylonjs/core';

/**
 * Iron Ore System
 * Generates dynamic 3D iron ore rocks resting flush directly on top of the black rubber belt deck.
 * Discharge point is positioned BEFORE the motor assembly (X = 5.8 vs Motor at X = 7.0) so ore falls down cleanly.
 */
export class IronOreSystem {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.headX = options.headX || 7;
    this.tailX = options.tailX || -7;
    // Discharge point is AFTER the end tail roller drum (X = -7.1)
    this.dischargeX = -7.1;
    // Load zone is near head end (X = +6.0)
    this.loadZoneX = 6.0;
    this.beltSurfaceY = 1.25;
    this.maxRocks = 120;

    this.rocks = [];
    this.createOreMaterials();
    this.createOreBaseMeshes();
    this.initRockPool();
  }

  createOreMaterials() {
    this.oreMat = new BABYLON.StandardMaterial("oreMat", this.scene);
    this.oreMat.diffuseColor = new BABYLON.Color3(0.35, 0.22, 0.18);
    this.oreMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    this.oreMat.roughness = 0.9;
  }

  createOreBaseMeshes() {
    this.rockPrototypes = [];

    for (let i = 0; i < 3; i++) {
      const proto = BABYLON.MeshBuilder.CreatePolyhedron(`oreProto_${i}`, {
        type: i + 1,
        size: 0.14 + i * 0.04
      }, this.scene);
      proto.material = this.oreMat;
      proto.isVisible = false;
      this.rockPrototypes.push(proto);
    }
  }

  initRockPool() {
    for (let i = 0; i < this.maxRocks; i++) {
      const protoIndex = i % 3;
      const instance = this.rockPrototypes[protoIndex].createInstance(`oreInstance_${i}`);

      // Pre-seed initial 35 rocks along the conveyor belt surface so ore is immediately visible on startup
      const isInitialActive = i < 35;
      const initialX = isInitialActive ? -6.8 + (i / 35) * 12.8 : this.loadZoneX;
      const initialZ = isInitialActive ? (Math.random() - 0.5) * 0.7 : 0;

      instance.isVisible = isInitialActive;
      if (isInitialActive) {
        instance.position.set(initialX, this.beltSurfaceY, initialZ);
        instance.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      }

      this.rocks.push({
        mesh: instance,
        active: isInitialActive,
        x: initialX,
        y: this.beltSurfaceY,
        z: initialZ,
        vx: 0,
        vy: 0,
        vz: 0,
        rotSpeed: new BABYLON.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ),
        falling: false
      });
    }

    this.spawnTimer = 0;
  }

  spawnRock(speed) {
    const inactive = this.rocks.find(r => !r.active);
    if (!inactive) return;

    inactive.active = true;
    inactive.mesh.isVisible = true;
    inactive.falling = false;
    inactive.x = this.loadZoneX + (Math.random() - 0.5) * 0.4;
    inactive.y = this.beltSurfaceY;
    inactive.z = (Math.random() - 0.5) * 0.7;

    inactive.vx = -speed * 0.5;
    inactive.vy = 0;
    inactive.vz = 0;

    inactive.mesh.position.set(inactive.x, inactive.y, inactive.z);
    inactive.mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  }

  update(dt, speed, loadPercent, running) {
    if (!running) return;

    if (loadPercent > 0 && speed > 0) {
      const spawnInterval = Math.max(0.04, 0.4 - (loadPercent / 100) * 0.35);
      this.spawnTimer += dt;

      if (this.spawnTimer >= spawnInterval) {
        this.spawnTimer = 0;
        const count = Math.ceil((loadPercent / 100) * 2);
        for (let c = 0; c < count; c++) {
          this.spawnRock(speed);
        }
      }
    }

    const targetActiveCount = Math.floor((loadPercent / 100) * this.maxRocks);

    let currentActive = 0;
    for (const r of this.rocks) {
      if (!r.active) continue;

      currentActive++;
      if (currentActive > targetActiveCount + 10 && !r.falling) {
        r.active = false;
        r.mesh.isVisible = false;
        continue;
      }

      if (!r.falling) {
        // Move ore along top surface of belt from right to left (towards -X)
        r.x -= speed * dt;
        r.mesh.position.x = r.x;
        r.mesh.position.y = this.beltSurfaceY;

        // Discharge ONLY AFTER reaching past the end roller drum (X <= -7.1)
        if (r.x <= this.dischargeX) {
          r.falling = true;
          r.vx = -speed * 0.4;
          r.vy = -1.2;
          r.vz = (Math.random() - 0.5) * 0.2;
        }
      } else {
        r.vy -= 12.0 * dt;
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        r.z += r.vz * dt;

        r.mesh.position.set(r.x, r.y, r.z);
        r.mesh.rotation.addInPlace(r.rotSpeed.scale(dt * 3));

        if (r.y < -0.8) {
          r.active = false;
          r.mesh.isVisible = false;
        }
      }
    }
  }
}
