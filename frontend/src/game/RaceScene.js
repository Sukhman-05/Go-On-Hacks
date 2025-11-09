import Phaser from 'phaser';

export default class RaceScene extends Phaser.Scene {
  constructor() {
    super('RaceScene');
    this.raceData = null;
    this.currentFrame = 0;
    this.racers = [];
    this.track = null;
    this.finishLine = null;
    this.isReady = false;
    this.trackBounds = null;
    this.speedParticleKey = 'race-speed-particle';
  }

  preload() {
    this.load.spritesheet('racer-sperm', '/sprites/sperm_sheet.png', {
      frameWidth: 138,
      frameHeight: 150,
      spacing: 2
    });
  }

  create() {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, width, height, 0x05070d).setDepth(-5);
    this.createTrack(width, height);
    this.ensureParticleTexture();

    const laneOffset = 70;
    const startX = this.trackBounds?.startX ?? 70;

    if (!this.anims.exists('racer-sperm-swim')) {
      this.anims.create({
        key: 'racer-sperm-swim',
        frames: this.anims.generateFrameNumbers('racer-sperm', { start: 0, end: 2 }),
        frameRate: 12,
        repeat: -1
      });
    }

    // Check if this is a PvE race (AI opponent should be flipped 180 degrees)
    const isPvE = this.raceInfo?.race_type === 'pve' || 
                  this.raceData?.[0]?.raceType === 'pve' || 
                  this.raceData?.[0]?.race_type === 'pve';

    const racer1Container = this.createRacer(startX, height / 2 - laneOffset, {
      tint: 0x00d4ff,
      glowColor: 0x00d4ff
    });

    const racer2Container = this.createRacer(startX, height / 2 + laneOffset, {
      tint: 0x8b5cf6,
      glowColor: 0x8b5cf6,
      flipY: true,
      flip180: isPvE // Flip 180 degrees for AI in PvE
    });

    this.racers = [racer1Container, racer2Container];

    this.racer1Label = this.add.text(racer1Container.x, racer1Container.y - 60, '', {
      fontSize: '14px',
      fontFamily: 'Inter',
      color: '#00d4ff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.racer2Label = this.add.text(racer2Container.x, racer2Container.y + 60, '', {
      fontSize: '14px',
      fontFamily: 'Inter',
      color: '#8b5cf6',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Mark scene as ready
    this.isReady = true;
    console.log('Phaser scene created and ready with sprite racers');
  }

  createTrack(width, height) {
    const trackPadding = 60;
    const trackHeight = 220;
    const trackWidth = width - trackPadding * 2;
    const trackY = height / 2 - trackHeight / 2;

    const ambience = this.add.graphics();
    ambience.fillStyle(0x09101d, 1);
    ambience.fillRect(0, 0, width, height);
    ambience.setDepth(-4);

    const ambientGlowTop = this.add.rectangle(width / 2, trackY - 40, width, 120, 0x00d4ff, 0.08);
    ambientGlowTop.setBlendMode(Phaser.BlendModes.ADD);
    ambientGlowTop.setDepth(-3);

    const ambientGlowBottom = this.add.rectangle(width / 2, trackY + trackHeight + 40, width, 120, 0x8b5cf6, 0.08);
    ambientGlowBottom.setBlendMode(Phaser.BlendModes.ADD);
    ambientGlowBottom.setDepth(-3);

    this.track = this.add.graphics();
    this.track.fillStyle(0x151b2f, 0.95);
    this.track.fillRoundedRect(trackPadding, trackY, trackWidth, trackHeight, 24);
    this.track.lineStyle(4, 0x1f2a44, 0.75);
    this.track.strokeRoundedRect(trackPadding, trackY, trackWidth, trackHeight, 24);

    const innerTrack = this.add.graphics();
    innerTrack.fillStyle(0x111826, 0.4);
    innerTrack.fillRoundedRect(trackPadding + 18, trackY + 18, trackWidth - 36, trackHeight - 36, 18);

    const laneHighlight = this.add.graphics();
    laneHighlight.fillStyle(0x1f2a44, 0.4);
    laneHighlight.fillRoundedRect(trackPadding + 26, height / 2 - 80, trackWidth - 52, 70, 16);
    laneHighlight.fillRoundedRect(trackPadding + 26, height / 2 + 10, trackWidth - 52, 70, 16);

    const laneDivider = this.add.graphics();
    laneDivider.lineStyle(2, 0xffffff, 0.18);
    laneDivider.lineBetween(trackPadding + 18, height / 2, width - trackPadding - 18, height / 2);

    const finishLineX = width - trackPadding - 30;
    this.finishLine = this.add.graphics();
    this.finishLine.lineStyle(4, 0xfbbf24, 1);
    this.finishLine.lineBetween(finishLineX, height / 2 - 90, finishLineX, height / 2 + 90);

    for (let i = 0; i < 10; i++) {
      const y = height / 2 - 90 + (i * 18);
      const color = i % 2 === 0 ? 0xfbbf24 : 0x000000;
      this.finishLine.fillStyle(color, 0.6);
      this.finishLine.fillRect(finishLineX - 8, y, 16, 18);
    }

    this.add.text(finishLineX + 10, height / 2 - 120, 'FINISH', {
      fontSize: '16px',
      fontFamily: 'Inter',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.trackBounds = {
      startX: trackPadding + 30,
      finishX: finishLineX - 20
    };
  }

  ensureParticleTexture() {
    const key = this.speedParticleKey || 'race-speed-particle';
    this.speedParticleKey = key;

    if (this.textures.exists(key)) {
      return;
    }

    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff, 1);
    graphics.fillEllipse(8, 6, 16, 8);
    graphics.generateTexture(key, 16, 12);
    graphics.destroy();
  }

  createRacer(initialX, initialY, { tint = 0xffffff, glowColor = tint, flipY = false, flip180 = false } = {}) {
    const container = this.add.container(initialX, initialY);
    container.setDepth(2);

    const shadow = this.add.ellipse(0, 22, 70, 26, 0x000000, 0.35);
    shadow.setOrigin(0.5);
    shadow.setScale(1.2, 0.55);
    shadow.setBlendMode(Phaser.BlendModes.MULTIPLY);
    container.add(shadow);

    const glow = this.add.ellipse(0, 0, 90, 34, glowColor, 0.25);
    glow.setOrigin(0.5);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    container.add(glow);

    const sprite = this.add.sprite(0, 0, 'racer-sperm');
    sprite.setOrigin(0.5);
    sprite.setTint(tint);
    sprite.setAngle(flip180 ? 180 : 0);
    sprite.play('racer-sperm-swim');
    if (flipY) {
      sprite.setFlipY(true);
    }
    if (flip180) {
      sprite.setFlipX(true);
      sprite.setFlipY(true);
    }
    const baseScale = 0.36;
    sprite.setScale(baseScale);
    sprite.baseScale = baseScale;
    sprite.baseAngle = flip180 ? 180 : 0;
    container.add(sprite);

    this.tweens.add({
      targets: sprite,
      y: { from: -4, to: 4 },
      duration: 520,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    this.tweens.add({
      targets: glow,
      scaleX: { from: 0.95, to: 1.05 },
      scaleY: { from: 0.95, to: 1.05 },
      duration: 1200,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    container.racerSprite = sprite;
    container.glow = glow;
    container.shadow = shadow;

    return container;
  }

  setRaceData(frames, raceInfo = null) {
    console.log('Phaser: Setting race data', { framesLength: frames?.length, raceInfo });
    this.raceData = frames;
    this.currentFrame = 0;
    this.raceInfo = raceInfo;
    
    if (frames && frames.length > 0) {
      const firstFrame = frames[0];
      if (firstFrame.positions && firstFrame.positions.length >= 2) {
        if (this.racer1Label) {
          this.racer1Label.setText(firstFrame.positions[0].name);
        }
        if (this.racer2Label) {
          this.racer2Label.setText(firstFrame.positions[1].name);
        }
        // Update to first frame after a short delay to ensure scene is ready
        this.time.delayedCall(100, () => {
          this.updateToFrame(0);
        });
      }
    }
  }

  updateToFrame(frameIndex) {
    // Ensure scene is ready
    if (!this.isReady) {
      console.warn('Phaser scene not ready yet');
      return;
    }

    if (!this.raceData || frameIndex >= this.raceData.length || frameIndex < 0) {
      console.warn('Invalid frame index for Phaser update', { frameIndex, dataLength: this.raceData?.length });
      return;
    }

    const frame = this.raceData[frameIndex];
    if (!frame || !frame.positions || frame.positions.length < 2) {
      console.warn('Invalid frame data for Phaser update', { frame, frameIndex });
      return;
    }

    // Ensure racers are initialized
    if (!this.racers || this.racers.length < 2) {
      console.warn('Racers not initialized in Phaser scene', { racers: this.racers });
      return;
    }

    this.currentFrame = frameIndex;
    const { width } = this.cameras.main;
    const bounds = this.trackBounds || { startX: 50, finishX: width - 50 };
    const trackLength = bounds.finishX - bounds.startX;
    const RACE_DISTANCE = 1000; // meters

    console.log(`Phaser: Updating to frame ${frameIndex}`, {
      racer1Pos: frame.positions[0]?.position,
      racer2Pos: frame.positions[1]?.position
    });

    // Update racer positions
    frame.positions.forEach((racer, index) => {
      if (this.racers[index]) {
        // Calculate progress (0 to 1)
        const progress = Math.min(Math.max(racer.position / RACE_DISTANCE, 0), 1);
        const x = bounds.startX + (progress * trackLength);
        const targetX = Phaser.Math.Clamp(x, bounds.startX, bounds.finishX);
        
        // Cancel any existing tweens for this racer
        this.tweens.killTweensOf(this.racers[index]);
        
        // Always animate to new position for smooth movement
        // Duration slightly less than frame interval (1000ms) for smooth transitions
        this.tweens.add({
          targets: this.racers[index],
          x: targetX,
          duration: 950,
          ease: 'Linear'
        });

        // Update label position (follow racer smoothly)
        const label = index === 0 ? this.racer1Label : this.racer2Label;
        if (label) {
          this.tweens.killTweensOf(label);
          this.tweens.add({
            targets: label,
            x: targetX,
            duration: 950,
            ease: 'Linear'
          });
        }

        const racerContainer = this.racers[index];
        if (racerContainer?.racerSprite) {
          const sprite = racerContainer.racerSprite;
          const angleOffset = Phaser.Math.Clamp(racer.velocity / 20, -6, 10);
          sprite.setAngle(sprite.baseAngle + angleOffset);
          const speedScale = Phaser.Math.Clamp(racer.velocity / 400, 0, 0.18);
          sprite.setScale(sprite.baseScale + speedScale);
          
          // Maintain flip state for 180-degree rotated sprites
          if (sprite.baseAngle === 180) {
            sprite.setFlipX(true);
            sprite.setFlipY(true);
          }
        }

        if (racerContainer?.glow) {
          const glowAlpha = Phaser.Math.Clamp(0.35 + (racer.velocity / 200), 0.4, 0.8);
          racerContainer.glow.setAlpha(glowAlpha);
        }

        if (racerContainer?.shadow) {
          const shadowScale = Phaser.Math.Clamp(1.2 + (racer.velocity / 800), 1.2, 1.45);
          racerContainer.shadow.setScale(shadowScale, 0.55);
          const shadowAlpha = Phaser.Math.Clamp(0.25 + (racer.velocity / 1500), 0.25, 0.5);
          racerContainer.shadow.setAlpha(shadowAlpha);
        }

        // Add particles for speed effect (only occasionally to reduce overhead)
        if (racer.velocity > 10 && Math.random() > 0.85) {
          this.addSpeedParticles(this.racers[index], index);
        }
      }
    });
  }

  addSpeedParticles(racer, index) {
    const color = index === 0 ? 0x00d4ff : 0x8b5cf6;
    const particleKey = this.speedParticleKey && this.textures.exists(this.speedParticleKey)
      ? this.speedParticleKey
      : null;

    const yOffset = Phaser.Math.Between(-6, 6);
    const particle = particleKey
      ? this.add.image(racer.x - 10, racer.y + yOffset, particleKey).setAlpha(0.7)
      : this.add.circle(racer.x - 10, racer.y + yOffset, 3, color, 0.6);

    if (particle.setTint) {
      particle.setTint(color);
    }

    if (particle.setScale) {
      particle.setScale(0.6);
    }

    this.tweens.add({
      targets: particle,
      x: racer.x - 70,
      alpha: 0,
      duration: 320,
      ease: 'Sine.easeOut',
      onComplete: () => particle.destroy()
    });
  }

  update() {
    // Animation loop
  }
}

