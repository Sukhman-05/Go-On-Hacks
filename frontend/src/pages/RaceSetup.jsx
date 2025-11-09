import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getRacers, startPvERace } from '../services/api';
import { useGameStore } from '../store/useGameStore';
import { useRaceStore } from '../store/useRaceStore';
import RacerCard from '../components/RacerCard';
import BettingPanel from '../components/BettingPanel';

function RaceSetup() {
  const [selectedRacerId, setSelectedRacerId] = useState(null);
  const [raceType, setRaceType] = useState('pve'); // pve or pvp
  const [betAmount, setBetAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { racers, setRacers } = useGameStore();
  const { setCurrentRace, setFrames, setRaceStatus, setRewards, setWinner } = useRaceStore();

  useEffect(() => {
    loadRacers();
  }, []);

  const loadRacers = async () => {
    try {
      const data = await getRacers();
      setRacers(data.racers);
    } catch (error) {
      setError('Failed to load racers');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRace = async () => {
    if (!selectedRacerId) {
      setError('Please select a racer');
      return;
    }

    setError('');
    setStarting(true);
    setRaceStatus('starting');

    try {
      if (raceType === 'pve') {
        const raceData = await startPvERace(selectedRacerId, betAmount);
        console.log('Race data received:', raceData);
        
        // Verify we have the necessary data
        if (!raceData.race || !raceData.race.frames || raceData.race.frames.length === 0) {
          throw new Error('Invalid race data received');
        }
        
        // Set race data in store
        setCurrentRace(raceData.race);
        setFrames(raceData.race.frames);
        setRaceStatus('racing');
        setRewards(raceData.rewards);
        setWinner(raceData.race.winner);
        setStarting(false);
        
        // Navigate after a tiny delay to ensure store is updated
        setTimeout(() => {
          navigate('/race/' + raceData.race.id);
        }, 50);
      } else {
        // PvP - will be handled by WebSocket
        setStarting(false);
        navigate('/race/pvp');
      }
    } catch (err) {
      console.error('Race start error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to start race');
      setRaceStatus('idle');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="dna-loader text-6xl">🧬</div>
      </div>
    );
  }

  if (racers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">🎰</div>
          <h2 className="text-3xl font-bold mb-4">No Racers Available</h2>
          <p className="text-xl text-gray-400 mb-6">
            You need to summon a racer before you can race!
          </p>
          <a href="/summon" className="btn-primary inline-block">
            Summon Your First Racer
          </a>
        </div>
      </div>
    );
  }

  const selectedRacer = racers.find(r => r.id === selectedRacerId);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-8 text-center">Race Setup</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6 max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* Race Type Selection */}
        <div className="max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-bold mb-4">Select Race Type</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setRaceType('pve')}
              className={`p-6 rounded-xl border-2 transition ${
                raceType === 'pve'
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-600 bg-dark-card'
              }`}
            >
              <div className="text-4xl mb-2">🤖</div>
              <div className="font-bold text-xl mb-2">PvE</div>
              <div className="text-sm text-gray-400">Race against AI</div>
              <div className="text-sm text-primary mt-2">Entry: 50 DNA₵</div>
            </button>

            <button
              onClick={() => setRaceType('pvp')}
              className={`p-6 rounded-xl border-2 transition ${
                raceType === 'pvp'
                  ? 'border-secondary bg-secondary/10'
                  : 'border-gray-600 bg-dark-card'
              }`}
            >
              <div className="text-4xl mb-2">⚔️</div>
              <div className="font-bold text-xl mb-2">PvP</div>
              <div className="text-sm text-gray-400">Race against players</div>
              <div className="text-sm text-secondary mt-2">Custom wager</div>
            </button>
          </div>
        </div>

        {/* Racer Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Select Your Racer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {racers.map((racer) => (
              <div
                key={racer.id}
                onClick={() => setSelectedRacerId(racer.id)}
                className={`cursor-pointer transition transform hover:scale-105 ${
                  selectedRacerId === racer.id ? 'ring-4 ring-primary rounded-xl' : ''
                }`}
              >
                <RacerCard racer={racer} showDetails />
              </div>
            ))}
          </div>
        </div>

        {/* Betting Panel */}
        {selectedRacer && raceType === 'pve' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <BettingPanel
              maxBet={1000}
              onBetChange={setBetAmount}
              currentBet={betAmount}
            />
          </motion.div>
        )}

        {/* Start Race Button */}
        {selectedRacer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <button
              onClick={handleStartRace}
              disabled={starting}
              className="btn-primary text-2xl px-12 py-6 disabled:opacity-50"
            >
              {starting ? (
                <span className="flex items-center gap-2">
                  <span className="dna-loader">🧬</span> Starting Race...
                </span>
              ) : (
                `🏁 Start ${raceType.toUpperCase()} Race`
              )}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default RaceSetup;

