import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { useRaceStore } from '../store/useRaceStore';
import RaceScene from '../game/RaceScene';

function RaceCanvas() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const { frames } = useRaceStore();

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

  // Update game with race frames
  useEffect(() => {
    if (gameRef.current && frames && frames.length > 0) {
      const scene = gameRef.current.scene.scenes[0];
      if (scene && scene.setRaceData) {
        scene.setRaceData(frames);
      }
    }
  }, [frames]);

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

