import { Canvas } from '@react-three/fiber';
import { OrbitControls, Preload } from '@react-three/drei';
import GameBoard from './components/GameBoard';
import UI from './components/UI';
import Lighting from './components/scene/Lighting';
import Environment from './components/scene/Environment';
import { useDarkMode } from './hooks/useDarkMode';
import SplashScreen from './components/SplashScreen';
import { useGameStore } from './store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useBeforeUnload } from './hooks/useBeforeUnload';
import { useGamePersistence } from './hooks/useGamePersistence';
import BeforeUnloadDialog from './components/BeforeUnloadDialog';

function App() {
  const bgColor = useDarkMode();
  const winner = useGameStore((state) => state.winner);
  const gameMode = useGameStore((state) => state.gameMode);
  const resetGame = useGameStore((state) => state.resetGame);
  const currentPlayer = useGameStore((state) => state.currentPlayer);
  const grid = useGameStore((state) => state.grid);
  const moveHistory = useGameStore((state) => state.moveHistory);
  const loadGame = useGameStore((state) => state.loadGame);

  const { showDialog, handleStay, handleLeave } = useBeforeUnload(moveHistory.length > 0 && !winner);

  useGamePersistence(
    { grid, currentPlayer, winner, gameMode, moveHistory },
    loadGame
  );

  return (
    <div className="w-full h-screen bg-slate-100 dark:bg-slate-900 relative">
      <BeforeUnloadDialog 
        isVisible={showDialog}
        onStay={handleStay}
        onLeave={handleLeave}
      />
      <SplashScreen />
      <UI />
      <Canvas
        camera={{ position: [10, 10, 10], fov: 45 }}
        className="w-full h-full"
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <Environment bgColor={bgColor} />
        <Lighting />
        <GameBoard />
        <OrbitControls
          minDistance={7}
          maxDistance={20}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          autoRotate={winner !== null}
          autoRotateSpeed={2}
        />
        <Preload all />
      </Canvas>
      
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-24 right-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-lg p-4 text-center z-50"
          >
            <h2 className="text-xl font-bold text-green-600 dark:text-green-400">
              {winner === 2 && gameMode === 'pvc' ? 'Computer' : `Player ${winner}`} Wins! 🎉
            </h2>
            <button
              onClick={resetGame}
              className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Play Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;