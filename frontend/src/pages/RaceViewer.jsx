import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRaceStore } from '../store/useRaceStore';
import RaceCanvas from '../components/RaceCanvas';

function RaceViewer() {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const { currentRace, frames, currentFrame, raceStatus, setRewards } = useRaceStore();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!currentRace || !frames || frames.length === 0) {
      navigate('/race');
      return;
    }

    // Countdown before race starts
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }

    // Check if race is finished
    if (currentFrame >= frames.length - 1) {
      // Store rewards and navigate to results
      setTimeout(() => {
        navigate('/results');
      }, 2000);
    }
  }, [countdown, currentFrame, frames, currentRace, navigate]);

  if (!currentRace || !frames || frames.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="dna-loader text-6xl">🧬</div>
      </div>
    );
  }

  if (countdown > 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <motion.div
          key={countdown}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          className="text-center"
        >
          <div className="text-9xl font-bold text-primary mb-4">
            {countdown === 0 ? 'GO!' : countdown}
          </div>
          <p className="text-2xl text-gray-400">Get Ready!</p>
        </motion.div>
      </div>
    );
  }

  const currentFrameData = frames[currentFrame];
  const racer1 = currentFrameData?.positions[0];
  const racer2 = currentFrameData?.positions[1];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className="text-4xl font-bold mb-8 text-center">🏁 Race in Progress</h1>

        {/* Race Canvas */}
        <div className="mb-8">
          <RaceCanvas />
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Racer 1 Stats */}
          <div className="bg-dark-card p-6 rounded-xl border border-primary/30">
            <h3 className="text-xl font-bold mb-4 text-primary">{racer1?.name}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Position:</span>
                <span className="font-bold">{Math.round(racer1?.position || 0)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Velocity:</span>
                <span className="font-bold">{racer1?.velocity?.toFixed(1) || 0} m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Stamina:</span>
                <span className="font-bold">{Math.round(racer1?.stamina || 0)}%</span>
              </div>
            </div>
            {/* Stamina Bar */}
            <div className="mt-4">
              <div className="w-full bg-dark rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${racer1?.stamina || 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Racer 2 Stats */}
          <div className="bg-dark-card p-6 rounded-xl border border-secondary/30">
            <h3 className="text-xl font-bold mb-4 text-secondary">{racer2?.name}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Position:</span>
                <span className="font-bold">{Math.round(racer2?.position || 0)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Velocity:</span>
                <span className="font-bold">{racer2?.velocity?.toFixed(1) || 0} m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Stamina:</span>
                <span className="font-bold">{Math.round(racer2?.stamina || 0)}%</span>
              </div>
            </div>
            {/* Stamina Bar */}
            <div className="mt-4">
              <div className="w-full bg-dark rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${racer2?.stamina || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-8 text-center text-gray-400">
          Frame {currentFrame + 1} / {frames.length}
        </div>
      </motion.div>
    </div>
  );
}

export default RaceViewer;

