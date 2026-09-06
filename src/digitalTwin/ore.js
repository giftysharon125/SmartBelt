import * as BABYLON from '@babylonjs/core';

/**
 * Iron Ore System
 * Generates a dense, consistent dynamic stream of 3D iron ore rocks resting flush on top of the carrying belt deck.
 * Matches exact Digital Twin mineral color palette (#59382E, #795548, #9A5B3D) and central belt channel alignment.
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
    // Top carrying rubber belt deck surface is at Y = 1.26
    this.beltSurfaceBaseY = 1.26;
    this.maxRocks = 130;

    this.rocks = [];
    this.createOreMaterials();
    this.createOreBaseMeshes();
    this.initRockPool();
  }

  createOreMaterials() {
    this.oreMaterials = [];

    // Natural Conveyor Digital Twin Iron Ore Color Palette (#59382E, #795548, #9A5B3D, #4E2E25)
    const oreColors = [
      { diffuse: new BABYLON.Color3(0.35, 0.22, 0.18), spec: new BABYLON.Color3(0.18, 0.16, 0.15) }, // Classic Iron Ore (#59382E)
      { diffuse: new BABYLON.Color3(0.47, 0.33, 0.28), spec: new BABYLON.Color3(0.20, 0.18, 0.16) }, // Earthy Ore Brown (#795548)
      { diffuse: new BABYLON.Color3(0.60, 0.36, 0.24), spec: new BABYLON.Color3(0.22, 0.18, 0.15) }, // Hematite Warm Oxide (#9A5B3D)
      { diffuse: new BABYLON.Color3(0.31, 0.18, 0.15), spec: new BABYLON.Color3(0.15, 0.14, 0.14) }  // Raw Lump Taconite (#4E2E25)
    ];

    oreColors.forEach((c, idx) => {
      const mat = new BABYLON.StandardMaterial(`oreMat_${idx}`, this.scene);
      mat.diffuseColor = c.diffuse;
      mat.specularColor = c.spec;
      mat.roughness = 0.85;
      this.oreMaterials.push(mat);
    });
  }

  createOreBaseMeshes() {
    this.rockPrototypes = [];

    // Create 4 distinct realistic iron ore rock prototypes (size 0.16m to 0.28m)
    for (let i = 0; i < 4; i++) {
      const size = 0.16 + (i % 3) * 0.05;
      const proto = BABYLON.MeshBuilder.CreatePolyhedron(`oreProto_${i}`, {
        type: i % 4,
        size: size
      }, this.scene);
      proto.material = this.oreMaterials[i % this.oreMaterials.length];
      proto.isVisible = false;
      if (this.shadowGenerator) {
        this.shadowGenerator.addShadowCaster(proto);
      }
      this.rockPrototypes.push({ mesh: proto, size: size });
    }
  }

  initRockPool() {
    for (let i = 0; i < this.maxRocks; i++) {
      const protoObj = this.rockPrototypes[i % this.rockPrototypes.length];
      const instance = protoObj.mesh.createInstance(`oreInstance_${i}`);
      const size = protoObj.size;

      // Pre-seed 70 active rocks evenly aligned along central trough channel (-6.8m to +6.0m)
      const isInitialActive = i < 70;
      const initialX = isInitialActive ? -6.8 + (i / 70) * 12.8 : this.loadZoneX;
      // Central alignment down troughed belt channel (Z: -0.22 to +0.22)
      const initialZ = isInitialActive ? (Math.random() - 0.5) * 0.44 : 0;
      const initialY = this.beltSurfaceBaseY + (size / 2);

      instance.isVisible = isInitialActive;
      instance.position.set(initialX, initialY, initialZ);
      instance.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      if (this.shadowGenerator) {
        this.shadowGenerator.addShadowCaster(instance);
      }

      this.rocks.push({
        mesh: instance,
        active: isInitialActive,
        size: size,
        x: initialX,
        y: initialY,
        z: initialZ,
        vx: 0,
        vy: 0,
        vz: 0,
        rotSpeed: new BABYLON.Vector3(
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 1.5
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
    // Central alignment down troughed belt channel (Z: -0.22 to +0.22)
    inactive.z = (Math.random() - 0.5) * 0.44;
    inactive.y = this.beltSurfaceBaseY + (inactive.size / 2);

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

    const spawnInterval = Math.max(0.03, 0.20 - (activeLoad / 100) * 0.15);
    this.spawnTimer += dt;

    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;
      const count = Math.ceil((activeLoad / 100) * 2.5);
      for (let c = 0; c < count; c++) {
        this.spawnRock(activeSpeed);
      }
    }

    const targetActiveCount = Math.floor((activeLoad / 100) * this.maxRocks);

    let currentActive = 0;
    for (const r of this.rocks) {
      if (!r.active) continue;

      currentActive++;
      if (currentActive > targetActiveCount + 20 && !r.falling) {
        r.active = false;
        r.mesh.isVisible = false;
        continue;
      }

      if (!r.falling) {
        // Move ore continuously along central carrying belt channel from right (+X) to left (-X)
        r.x -= activeSpeed * dt;
        r.y = this.beltSurfaceBaseY + (r.size / 2);
        r.mesh.position.set(r.x, r.y, r.z);

        // Discharge ONLY AFTER reaching past the tail roller drum (X <= -7.1)
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



