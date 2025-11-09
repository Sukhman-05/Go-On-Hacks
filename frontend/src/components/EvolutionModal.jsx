import { motion, AnimatePresence } from 'framer-motion';
import { evolveRacer } from '../services/api';
import { useState } from 'react';

function EvolutionModal({ racer, isOpen, onClose, onEvolved }) {
  const [evolving, setEvolving] = useState(false);
  const [error, setError] = useState('');
  const [evolution, setEvolution] = useState(null);

  const handleEvolve = async () => {
    setError('');
    setEvolving(true);

    try {
      // Evolve animation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const data = await evolveRacer(racer.id);
      setEvolution(data.evolution);
      
      if (onEvolved) {
        onEvolved(data.evolution);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Evolution failed');
    } finally {
      setEvolving(false);
    }
  };

  const handleClose = () => {
    setEvolution(null);
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-dark-card rounded-xl p-8 max-w-2xl w-full border border-primary/30"
          >
            {!evolution ? (
              <>
                <h2 className="text-4xl font-bold mb-6 text-center">
                  ⭐ Evolution Available!
                </h2>

                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">🧬</div>
                  <p className="text-2xl mb-2">{racer.name}</p>
                  <p className="text-gray-400 mb-4">is ready to evolve into an AI Avatar!</p>
                  <p className="text-sm text-gray-500">
                    Evolved avatars can breed and create offspring with inherited traits.
                  </p>
                </div>

                {evolving && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center mb-6"
                  >
                    <div className="text-8xl dna-loader mb-4">🧬</div>
                    <p className="text-2xl text-primary">Evolving...</p>
                  </motion.div>
                )}

                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleClose}
                    className="btn-secondary px-8 py-3"
                    disabled={evolving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEvolve}
                    className="btn-primary px-8 py-3"
                    disabled={evolving}
                  >
                    {evolving ? 'Evolving...' : '⭐ Evolve Now'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center"
                >
                  <h2 className="text-5xl font-bold mb-6 text-primary">
                    🎉 Evolution Complete!
                  </h2>

                  <div className="mb-8">
                    <div className="text-8xl mb-4">⭐</div>
                    <p className="text-3xl font-bold mb-2 text-secondary">
                      {evolution.newName}
                    </p>
                    <p className="text-xl text-gray-400 mb-4">
                      Generation {evolution.generation} AI Avatar
                    </p>
                    <p className="text-sm text-gray-500">
                      Your racer has evolved! It can now breed to create offspring.
                    </p>
                  </div>

                  <div className="bg-dark p-6 rounded-lg mb-6">
                    <h3 className="text-xl font-bold mb-4">New Abilities Unlocked</h3>
                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🧬</span>
                        <span>Can breed to create offspring</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📊</span>
                        <span>60% stat inheritance to children</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🎯</span>
                        <span>Enhanced racing performance</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleClose}
                    className="btn-primary px-12 py-4 text-xl"
                  >
                    Amazing! ✨
                  </button>
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default EvolutionModal;

