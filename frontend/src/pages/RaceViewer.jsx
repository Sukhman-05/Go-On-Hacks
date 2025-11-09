import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRaceStore } from '../store/useRaceStore';
import RaceCanvas from '../components/RaceCanvas';

function RaceViewer() {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const { currentRace, frames, currentFrame, raceStatus, setRewards, advanceFrame } = useRaceStore();
  const [countdown, setCountdown] = useState(3);
  const frameIntervalRef = useRef(null);

  // Memoize current frame data to prevent unnecessary re-renders
  // MUST be called before any conditional returns (Rules of Hooks)
  const currentFrameData = useMemo(() => {
    if (!frames || frames.length === 0) {
      console.warn('No frames available', { framesLength: frames?.length, currentFrame });
      return null;
    }
    
    if (currentFrame >= frames.length) {
      console.warn('Current frame out of bounds', { currentFrame, framesLength: frames.length });
      return frames[frames.length - 1]; // Return last frame
    }
    
    const frame = frames[currentFrame];
    if (!frame || !frame.positions || frame.positions.length < 2) {
      console.warn('Invalid frame data', { frame, currentFrame });
      return null;
    }
    
    return frame;
  }, [frames, currentFrame]);

  const racer1 = currentFrameData?.positions?.[0];
  const racer2 = currentFrameData?.positions?.[1];

  // Debug: Log when component renders
  useEffect(() => {
    console.log('RaceViewer render:', { 
      countdown, 
      currentFrame, 
      framesLength: frames?.length,
      hasCurrentRace: !!currentRace,
      hasFrames: !!frames && frames.length > 0
    });
  });

  // Countdown before race starts
  useEffect(() => {
    if (!currentRace || !frames || frames.length === 0) {
      console.log('Countdown effect skipped - missing data', { currentRace: !!currentRace, framesLength: frames?.length });
      return;
    }

    if (countdown > 0) {
      console.log('Countdown:', countdown);
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      console.log('Countdown complete, race should start');
    }
  }, [countdown, frames, currentRace]);

  // Advance frames during race
  useEffect(() => {
    if (countdown > 0 || !frames || frames.length === 0) {
      return;
    }

    // Clear any existing interval
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    // Advance frame every second (matching race simulation frame rate)
    frameIntervalRef.current = setInterval(() => {
      // Get current frame from store to check if we should stop
      const storeState = useRaceStore.getState();
      if (storeState.currentFrame >= frames.length - 1) {
        // Reached the end, stop the interval
        if (frameIntervalRef.current) {
          clearInterval(frameIntervalRef.current);
          frameIntervalRef.current = null;
        }
        return;
      }
      advanceFrame();
    }, 1000);

    // Cleanup
    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
    };
  }, [countdown, frames, advanceFrame]);

  // Check if race is finished and navigate
  useEffect(() => {
    // Only check if race is finished after countdown has completed AND we've advanced through frames
    if (countdown === 0 && frames && frames.length > 0) {
      // Only navigate to results if we've actually reached the last frame
      if (currentFrame >= frames.length - 1) {
        console.log('Race finished! Navigating to results...', {
          currentFrame,
          framesLength: frames.length,
          currentRace,
          rewards: useRaceStore.getState().rewards
        });
        // Race finished, navigate to results after a short delay
        const timer = setTimeout(() => {
          navigate('/results');
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentFrame, frames, countdown, navigate, currentRace]);

  // Show loading if race data is not available
  // After a reasonable timeout, redirect if data still not loaded
  useEffect(() => {
    if (!currentRace || !frames || frames.length === 0) {
      const redirectTimer = setTimeout(() => {
        console.warn('Race data not loaded after timeout, redirecting to race setup');
        navigate('/race');
      }, 2000); // Give 2 seconds for data to load

      return () => clearTimeout(redirectTimer);
    }
  }, [currentRace, frames, navigate]);

  // Now we can do conditional returns after all hooks
  if (!currentRace || !frames || frames.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="dna-loader text-6xl mb-4">🧬</div>
          <p className="text-gray-400">Loading race data...</p>
        </div>
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

  // Log when we're about to render the race view
  console.log('Rendering race view', { 
    currentFrame, 
    framesLength: frames?.length,
    hasCurrentFrameData: !!currentFrameData,
    hasRacer1: !!racer1,
    hasRacer2: !!racer2
  });

  // Show error state if we don't have valid frame data
  if (!currentFrameData || !racer1 || !racer2) {
    console.error('Invalid race data for rendering', { 
      currentFrameData, 
      racer1, 
      racer2, 
      currentFrame, 
      framesLength: frames?.length,
      frames: frames?.slice(0, 2) // Log first 2 frames for debugging
    });
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-500">Error Loading Race</h1>
          <p className="text-gray-400 mb-4">Unable to load race data.</p>
          <p className="text-gray-500 text-sm mb-4">
            Current Frame: {currentFrame} / {frames?.length || 0}
          </p>
          <button 
            onClick={() => navigate('/race')}
            className="btn-primary"
          >
            Return to Race Setup
          </button>
        </div>
      </div>
    );
  }

  const RACE_DISTANCE = 1000;
  const racer1Progress = racer1 ? Math.min(100, (racer1.position / RACE_DISTANCE) * 100) : 0;
  const racer2Progress = racer2 ? Math.min(100, (racer2.position / RACE_DISTANCE) * 100) : 0;
  const raceProgress = Math.min(100, ((currentFrame + 1) / frames.length) * 100);
  const isRacer1Leading = racer1?.position > racer2?.position;

  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        {/* Header with Race Progress */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            🏁 Race in Progress
          </h1>
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Race Progress</span>
              <span>{Math.round(raceProgress)}%</span>
            </div>
            <div className="w-full bg-dark rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${raceProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Race Canvas */}
        <div className="mb-8">
          {(() => {
            try {
              return <RaceCanvas />;
            } catch (error) {
              console.error('Error rendering RaceCanvas:', error);
              return (
                <div className="bg-dark-card p-8 rounded-xl border border-red-500/30 text-center">
                  <p className="text-red-400">Error rendering race visualization</p>
                  <p className="text-gray-400 text-sm mt-2">Race stats are still available below</p>
                </div>
              );
            }
          })()}
        </div>

        {/* Live Stats with Enhanced Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-6">
          {/* Racer 1 Stats */}
          <motion.div 
            className={`bg-dark-card p-6 rounded-xl border-2 transition-all duration-300 ${
              isRacer1Leading 
                ? 'border-primary/60 shadow-lg shadow-primary/20' 
                : 'border-primary/30'
            }`}
            animate={{ 
              scale: isRacer1Leading ? 1.02 : 1,
              boxShadow: isRacer1Leading ? '0 0 20px rgba(0, 212, 255, 0.3)' : 'none'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-primary">{racer1?.name || 'Racer 1'}</h3>
              {isRacer1Leading && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-semibold">
                  LEADING
                </span>
              )}
            </div>
            
            {/* Position Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Distance</span>
                <span className="font-bold text-white">{Math.round(racer1?.position || 0)}m / {RACE_DISTANCE}m</span>
              </div>
              <div className="w-full bg-dark rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${racer1Progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-dark/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Velocity</div>
                <div className="text-lg font-bold text-primary">
                  {racer1?.velocity?.toFixed(1) || '0.0'} <span className="text-xs text-gray-400">m/s</span>
                </div>
              </div>
              <div className="bg-dark/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Stamina</div>
                <div className="text-lg font-bold text-green-400">
                  {Math.round(racer1?.stamina || 0)}<span className="text-xs text-gray-400">%</span>
                </div>
              </div>
            </div>

            {/* Stamina Bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Stamina</span>
                <span>{Math.round(racer1?.stamina || 0)}%</span>
              </div>
              <div className="w-full bg-dark rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-400 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, racer1?.stamina || 0))}%` }}
                />
              </div>
            </div>
          </motion.div>

          {/* Racer 2 Stats */}
          <motion.div 
            className={`bg-dark-card p-6 rounded-xl border-2 transition-all duration-300 ${
              !isRacer1Leading 
                ? 'border-secondary/60 shadow-lg shadow-secondary/20' 
                : 'border-secondary/30'
            }`}
            animate={{ 
              scale: !isRacer1Leading ? 1.02 : 1,
              boxShadow: !isRacer1Leading ? '0 0 20px rgba(139, 92, 246, 0.3)' : 'none'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-secondary">{racer2?.name || 'Racer 2'}</h3>
              {!isRacer1Leading && (
                <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full font-semibold">
                  LEADING
                </span>
              )}
            </div>
            
            {/* Position Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Distance</span>
                <span className="font-bold text-white">{Math.round(racer2?.position || 0)}m / {RACE_DISTANCE}m</span>
              </div>
              <div className="w-full bg-dark rounded-full h-2.5">
                <div
                  className="bg-secondary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${racer2Progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-dark/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Velocity</div>
                <div className="text-lg font-bold text-secondary">
                  {racer2?.velocity?.toFixed(1) || '0.0'} <span className="text-xs text-gray-400">m/s</span>
                </div>
              </div>
              <div className="bg-dark/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Stamina</div>
                <div className="text-lg font-bold text-green-400">
                  {Math.round(racer2?.stamina || 0)}<span className="text-xs text-gray-400">%</span>
                </div>
              </div>
            </div>

            {/* Stamina Bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Stamina</span>
                <span>{Math.round(racer2?.stamina || 0)}%</span>
              </div>
              <div className="w-full bg-dark rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-400 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, racer2?.stamina || 0))}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Frame Counter */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-dark-card px-4 py-2 rounded-full border border-gray-700">
            <span className="text-xs text-gray-400">Frame</span>
            <span className="font-bold text-white">{currentFrame + 1}</span>
            <span className="text-xs text-gray-500">/</span>
            <span className="text-gray-400">{frames.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RaceViewer;

