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
  }

  preload() {
    // No assets needed for MVP - using simple shapes
  }

  create() {
    const { width, height } = this.cameras.main;

    // Create track background
    this.track = this.add.graphics();
    this.track.fillStyle(0x1a1a24, 1);
    this.track.fillRect(0, height / 2 - 100, width, 200);

    // Draw track lines
    this.track.lineStyle(2, 0x00d4ff, 0.3);
    this.track.strokeRect(0, height / 2 - 100, width, 200);
    
    // Center line
    this.track.lineStyle(2, 0xffffff, 0.2);
    this.track.lineBetween(0, height / 2, width, height / 2);

    // Finish line
    this.finishLine = this.add.graphics();
    this.finishLine.lineStyle(4, 0xfbbf24, 1);
    this.finishLine.lineBetween(width - 50, height / 2 - 100, width - 50, height / 2 + 100);
    
    // Checkered pattern for finish line
    for (let i = 0; i < 10; i++) {
      const y = height / 2 - 100 + (i * 20);
      if (i % 2 === 0) {
        this.finishLine.fillStyle(0xfbbf24, 0.5);
      } else {
        this.finishLine.fillStyle(0x000000, 0.5);
      }
      this.finishLine.fillRect(width - 55, y, 10, 20);
    }

    // Add finish line text
    this.add.text(width - 50, height / 2 - 130, 'FINISH', {
      fontSize: '16px',
      fontFamily: 'Inter',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Create racer 1 (Player) - Teardrop shape
    const racer1 = this.add.graphics();
    racer1.fillStyle(0x00d4ff, 1);
    racer1.fillEllipse(0, 0, 40, 20);
    racer1.fillTriangle(-20, 0, -30, -5, -30, 5);
    racer1.lineStyle(2, 0xffffff, 0.5);
    racer1.strokeEllipse(0, 0, 40, 20);
    
    const racer1Container = this.add.container(50, height / 2 - 50);
    racer1Container.add(racer1);
    
    // Add glow effect
    const racer1Glow = this.add.circle(0, 0, 25, 0x00d4ff, 0.3);
    racer1Container.add(racer1Glow);

    // Create racer 2 (Opponent) - Teardrop shape
    const racer2 = this.add.graphics();
    racer2.fillStyle(0x8b5cf6, 1);
    racer2.fillEllipse(0, 0, 40, 20);
    racer2.fillTriangle(-20, 0, -30, -5, -30, 5);
    racer2.lineStyle(2, 0xffffff, 0.5);
    racer2.strokeEllipse(0, 0, 40, 20);
    
    const racer2Container = this.add.container(50, height / 2 + 50);
    racer2Container.add(racer2);
    
    // Add glow effect
    const racer2Glow = this.add.circle(0, 0, 25, 0x8b5cf6, 0.3);
    racer2Container.add(racer2Glow);

    this.racers = [racer1Container, racer2Container];

    // Add racer labels
    this.racer1Label = this.add.text(50, height / 2 - 80, '', {
      fontSize: '14px',
      fontFamily: 'Inter',
      color: '#00d4ff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.racer2Label = this.add.text(50, height / 2 + 80, '', {
      fontSize: '14px',
      fontFamily: 'Inter',
      color: '#8b5cf6',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Mark scene as ready
    this.isReady = true;
    console.log('Phaser scene created and ready');
  }

  setRaceData(frames) {
    console.log('Phaser: Setting race data', { framesLength: frames?.length });
    this.raceData = frames;
    this.currentFrame = 0;
    
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
    const trackLength = width - 100; // Account for start and finish
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
        const x = 50 + (progress * trackLength);
        const targetX = Math.min(Math.max(x, 50), width - 50);
        
        // Get current position (default to 50 if not set)
        const currentX = this.racers[index].x !== undefined ? this.racers[index].x : 50;
        
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

        // Add particles for speed effect (only occasionally to reduce overhead)
        if (racer.velocity > 10 && Math.random() > 0.85) {
          this.addSpeedParticles(this.racers[index], index);
        }
      }
    });
  }

  addSpeedParticles(racer, index) {
    const color = index === 0 ? 0x00d4ff : 0x8b5cf6;
    const particle = this.add.circle(racer.x - 20, racer.y, 3, color, 0.6);
    
    this.tweens.add({
      targets: particle,
      x: racer.x - 50,
      alpha: 0,
      duration: 300,
      onComplete: () => particle.destroy()
    });
  }

  update() {
    // Animation loop
  }
}

