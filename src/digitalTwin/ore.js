import * as BABYLON from '@babylonjs/core';

/**
 * Iron Ore System
 * Generates dynamic 3D iron ore rocks resting flush directly on top of the black rubber belt deck.
 * Discharge point is positioned AFTER the end roller drum (X = -7.1) so ore falls down cleanly into discharge chute.
 */
export class IronOreSystem {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.shadowGenerator = options.shadowGenerator || null;
    this.headX = options.headX || 7;
    this.tailX = options.tailX || -7;
    // Discharge point is AFTER the end tail roller drum (X = -7.1)
    this.dischargeX = -7.1;
    // Load zone is near head end (X = +6.0)
    this.loadZoneX = 6.0;
    // Belt top deck surface is at y = 1.26; 1.38 places rocks flush on top of top rubber belt deck
    this.beltSurfaceY = 1.38;
    this.maxRocks = 120;

    this.rocks = [];
    this.createOreMaterials();
    this.createOreBaseMeshes();
    this.initRockPool();
  }

  createOreMaterials() {
    this.oreMat = new BABYLON.StandardMaterial("oreMat", this.scene);
    this.oreMat.diffuseColor = new BABYLON.Color3(0.78, 0.35, 0.18); // Bright Hematite Iron Ore Rust Red / Copper-Brown
    this.oreMat.specularColor = new BABYLON.Color3(0.4, 0.3, 0.2);
    this.oreMat.emissiveColor = new BABYLON.Color3(0.18, 0.08, 0.04); // Self-illumination for high visibility against dark belt
    this.oreMat.roughness = 0.75;
  }

  createOreBaseMeshes() {
    this.rockPrototypes = [];

    for (let i = 0; i < 4; i++) {
      const proto = BABYLON.MeshBuilder.CreatePolyhedron(`oreProto_${i}`, {
        type: i % 4,
        size: 0.32 + (i % 3) * 0.08
      }, this.scene);
      proto.material = this.oreMat;
      proto.isVisible = false;
      if (this.shadowGenerator) {
        this.shadowGenerator.addShadowCaster(proto);
      }
      this.rockPrototypes.push(proto);
    }
  }

  initRockPool() {
    for (let i = 0; i < this.maxRocks; i++) {
      const protoIndex = i % 4;
      const instance = this.rockPrototypes[protoIndex].createInstance(`oreInstance_${i}`);

      // Pre-seed initial 40 rocks along the conveyor belt surface (-6.8m to +6.0m)
      const isInitialActive = i < 40;
      const initialX = isInitialActive ? -6.8 + (i / 40) * 12.8 : this.loadZoneX;
      const initialZ = isInitialActive ? (Math.random() - 0.5) * 0.7 : 0;

      instance.isVisible = isInitialActive;
      instance.position.set(initialX, this.beltSurfaceY, initialZ);
      instance.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      if (this.shadowGenerator) {
        this.shadowGenerator.addShadowCaster(instance);
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
    const isRunning = running !== false;
    if (!isRunning) return;

    const activeSpeed = (typeof speed === 'number' && !isNaN(speed) && speed > 0) ? speed : 3.8;
    const activeLoad = (typeof loadPercent === 'number' && !isNaN(loadPercent) && loadPercent > 0) ? loadPercent : 82.0;

    const spawnInterval = Math.max(0.04, 0.4 - (activeLoad / 100) * 0.35);
    this.spawnTimer += dt;

    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;
      const count = Math.ceil((activeLoad / 100) * 2);
      for (let c = 0; c < count; c++) {
        this.spawnRock(activeSpeed);
      }
    }

    const targetActiveCount = Math.floor((activeLoad / 100) * this.maxRocks);

    let currentActive = 0;
    for (const r of this.rocks) {
      if (!r.active) continue;

      currentActive++;
      if (currentActive > targetActiveCount + 15 && !r.falling) {
        r.active = false;
        r.mesh.isVisible = false;
        continue;
      }

      if (!r.falling) {
        // Move ore along top surface of belt from right to left (towards -X)
        r.x -= activeSpeed * dt;
        r.mesh.position.set(r.x, this.beltSurfaceY, r.z);

        // Discharge ONLY AFTER reaching past the end roller drum (X <= -7.1)
        if (r.x <= this.dischargeX) {
          r.falling = true;
          r.vx = -activeSpeed * 0.4;
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

