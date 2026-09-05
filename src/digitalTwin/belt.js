import * as BABYLON from '@babylonjs/core';

/**
 * Belt Module - Solid Industrial Black Rubber Belt
 * Creates solid 3D belt decks (top deck, bottom return, head/tail curves)
 * with single vulcanized Joint Splice J-03.
 */
export class ConveyorBelt {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.length = options.length || 20;
    this.width = options.width || 1.4;
    this.pulleyRadius = options.pulleyRadius || 0.5;
    this.headX = this.length / 2;
    this.tailX = -this.length / 2;
    this.height = options.height || 0.7;

    this.jointOffset = 0;
    this.totalBeltLength = (this.length * 2) + (Math.PI * 2 * this.pulleyRadius);

    this.createBeltMesh();
    this.createTexture();
  }

  createBeltMesh() {
    this.beltGroup = new BABYLON.TransformNode("beltGroup", this.scene);

    const beltThickness = 0.06;
    const topY = this.height + this.pulleyRadius + beltThickness / 2;
    const botY = this.height - this.pulleyRadius - beltThickness / 2;

    // 1. Solid Top Carrying Belt Deck
    this.topDeck = BABYLON.MeshBuilder.CreateBox("beltTopDeck", {
      width: this.length,
      height: beltThickness,
      depth: this.width
    }, this.scene);
    this.topDeck.position = new BABYLON.Vector3(0, topY, 0);
    this.topDeck.parent = this.beltGroup;

    // 2. Solid Bottom Return Belt Deck
    this.botDeck = BABYLON.MeshBuilder.CreateBox("beltBotDeck", {
      width: this.length,
      height: beltThickness,
      depth: this.width
    }, this.scene);
    this.botDeck.position = new BABYLON.Vector3(0, botY, 0);
    this.botDeck.parent = this.beltGroup;

    // 3. Head Pulley Wrap Curve
    this.headWrap = BABYLON.MeshBuilder.CreateCylinder("beltHeadWrap", {
      diameter: (this.pulleyRadius + beltThickness) * 2,
      height: this.width,
      tessellation: 32
    }, this.scene);
    this.headWrap.rotation.x = Math.PI / 2;
    this.headWrap.position = new BABYLON.Vector3(this.headX, this.height, 0);
    this.headWrap.parent = this.beltGroup;

    // 4. Tail Pulley Wrap Curve
    this.tailWrap = BABYLON.MeshBuilder.CreateCylinder("beltTailWrap", {
      diameter: (this.pulleyRadius + beltThickness) * 2,
      height: this.width,
      tessellation: 32
    }, this.scene);
    this.tailWrap.rotation.x = Math.PI / 2;
    this.tailWrap.position = new BABYLON.Vector3(this.tailX, this.height, 0);
    this.tailWrap.parent = this.beltGroup;

    this.topDeck.receiveShadows = true;
  }

  createTexture() {
    const textureSize = 2048;
    this.dynamicCanvas = document.createElement('canvas');
    this.dynamicCanvas.width = textureSize;
    this.dynamicCanvas.height = 256;
    this.ctx = this.dynamicCanvas.getContext('2d');

    this.beltTexture = new BABYLON.DynamicTexture(
      "beltDynamicTexture",
      this.dynamicCanvas,
      this.scene,
      false
    );

    this.beltMaterial = new BABYLON.StandardMaterial("beltMaterial", this.scene);
    this.beltMaterial.diffuseTexture = this.beltTexture;
    this.beltMaterial.specularColor = new BABYLON.Color3(0.12, 0.12, 0.15);
    this.beltMaterial.roughness = 0.85;

    this.topDeck.material = this.beltMaterial;
    this.botDeck.material = this.beltMaterial;
    this.headWrap.material = this.beltMaterial;
    this.tailWrap.material = this.beltMaterial;

    this.drawTexture(0);
  }

  drawTexture(uvOffset) {
    const w = this.dynamicCanvas.width;
    const h = this.dynamicCanvas.height;
    const ctx = this.ctx;

    // Industrial Matte Black Rubber
    ctx.fillStyle = '#1a1d24';
    ctx.fillRect(0, 0, w, h);

    // Tread grain
    ctx.fillStyle = '#222630';
    for (let x = 0; x < w; x += 20) {
      ctx.fillRect(x, 0, 10, h);
    }

    // Reinforced edge borders
    ctx.fillStyle = '#111318';
    ctx.fillRect(0, 0, w, 18);
    ctx.fillRect(0, h - 18, w, 18);

    // Single Belt Joint: J-03 (Matching physical conveyor rig)
    const joints = [
      { name: 'BELT JOINT J-03', pos: 0.5 }
    ];

    joints.forEach(j => {
      let xPos = ((j.pos + uvOffset) % 1.0) * w;
      if (xPos < 0) xPos += w;

      ctx.fillStyle = '#ffb300';
      ctx.fillRect(xPos - 8, 0, 16, h);

      ctx.fillStyle = '#08090c';
      ctx.fillRect(xPos - 3, 0, 6, h);

      ctx.fillStyle = 'rgba(11, 14, 20, 0.9)';
      ctx.fillRect(xPos - 65, h / 2 - 18, 130, 36);
      ctx.strokeStyle = '#ffb300';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(xPos - 65, h / 2 - 18, 130, 36);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(j.name, xPos, h / 2);
    });

    this.beltTexture.update(false);
  }

  update(dt, speed, running) {
    if (!running || speed <= 0) return;
    const distanceMoved = speed * dt;
    this.jointOffset -= distanceMoved / this.totalBeltLength;
    if (this.jointOffset < 0) this.jointOffset += 1.0;

    this.drawTexture(this.jointOffset);
  }
}
