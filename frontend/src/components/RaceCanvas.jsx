import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { useRaceStore } from '../store/useRaceStore';
import RaceScene from '../game/RaceScene';

function RaceCanvas() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const { frames, currentFrame, currentRace } = useRaceStore();

  useEffect(() => {
    if (!canvasRef.current || gameRef.current) return;

    const config = {
      type: Phaser.AUTO,
      parent: canvasRef.current,
      width: 800,
      height: 400,
      backgroundColor: '#0a0a0f',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: [RaceScene]
    };

    gameRef.current = new Phaser.Game(config);

    // Cleanup
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // Update game with race frames when frames change
  useEffect(() => {
    if (!gameRef.current || !frames || frames.length === 0) {
      return;
    }

    // Wait a bit for Phaser to be fully initialized
    const timeoutId = setTimeout(() => {
      const scene = gameRef.current?.scene?.scenes?.[0];
      if (scene && scene.setRaceData) {
        console.log('RaceCanvas: Setting race data to Phaser', { framesLength: frames.length });
        scene.setRaceData(frames, currentRace);
      } else {
        console.warn('RaceCanvas: Scene not ready for setRaceData');
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [frames, currentRace]);

  // Update Phaser scene with current frame
  useEffect(() => {
    if (!gameRef.current || !frames || frames.length === 0) {
      return;
    }

    // Wait for scene to be ready
    const scene = gameRef.current.scene.scenes[0];
    if (!scene) {
      return;
    }

    // Ensure scene is initialized and has racers
    if (currentFrame < frames.length && scene.updateToFrame && scene.isReady) {
      console.log('RaceCanvas: Updating to frame', currentFrame);
      // Call update immediately - scene should be ready
      try {
        scene.updateToFrame(currentFrame);
      } catch (error) {
        console.error('Error updating Phaser frame:', error);
      }
    }
  }, [currentFrame, frames]);

  return (
    <div className="flex justify-center">
      <div
        ref={canvasRef}
        className="rounded-xl overflow-hidden border-2 border-primary/30 shadow-2xl"
      />
    </div>
  );
}

export default RaceCanvas;

