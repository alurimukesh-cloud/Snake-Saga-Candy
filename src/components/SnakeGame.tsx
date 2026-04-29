import { useEffect, useState, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const BOARD_SIZE = GRID_SIZE * CELL_SIZE;

type Point = { x: number; y: number };

const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Point = { x: 0, y: -1 };

export function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false); // Game started
  
  // Use refs to avoid closure stale state in the game loop interval
  const dirRef = useRef(direction);
  const foodRef = useRef(food);

  const spawnFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // prevent food spawning on snake
      if (!currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    setFood(newFood);
    foodRef.current = newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    dirRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
    spawnFood(INITIAL_SNAKE);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' || e.key === 'Enter') {
        if (gameOver) {
          resetGame();
        } else if (!isPlaying) {
          resetGame();
        } else {
          setIsPaused((p) => !p);
        }
        return;
      }

      if (gameOver || isPaused || !isPlaying) return;

      const currentDir = dirRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y === 0) dirRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y === 0) dirRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x === 0) dirRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x === 0) dirRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused, isPlaying]);

  useEffect(() => {
    if (gameOver || isPaused || !isPlaying) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + dirRef.current.x,
          y: head.y + dirRef.current.y,
        };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self collision (ignoring the tip of the tail, as it moves out of the way)
        if (prevSnake.some((segment, index) => {
          if (index === prevSnake.length - 1) return false;
          return segment.x === newHead.x && segment.y === newHead.y;
        })) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision using the ref to avoid interval resets
        if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
          setScore((s) => {
            const newScore = s + 10;
            setHighScore((hs) => Math.max(hs, newScore));
            return newScore;
          });
          spawnFood(newSnake);
        } else {
          newSnake.pop(); // Remove tail if not eaten 
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, 120);
    return () => clearInterval(intervalId);
  }, [gameOver, isPaused, isPlaying, spawnFood]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-between items-end mb-4 font-mono">
        <div className="flex flex-col">
          <span className="text-zinc-500 text-xs uppercase tracking-widest">Score</span>
          <span className="text-cyan-400 text-2xl font-bold leading-none drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
            {score.toString().padStart(4, '0')}
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-zinc-500 text-xs uppercase tracking-widest">Best</span>
          <span className="text-pink-500 text-2xl font-bold leading-none drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]">
            {highScore.toString().padStart(4, '0')}
          </span>
        </div>
      </div>

      <div 
        className="relative bg-zinc-950/80 border border-zinc-800 rounded-lg overflow-hidden backdrop-blur-sm shadow-xl"
        style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
      >
        {/* Grid lines (optional, adds to aesthetic) */}
        <div className="absolute inset-0 opacity-10" 
             style={{
               backgroundImage: `linear-gradient(to right, #3f3f46 1px, transparent 1px),
                                 linear-gradient(to bottom, #3f3f46 1px, transparent 1px)`,
               backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
             }} 
        />

        {/* Snake rendering */}
        {snake.map((segment, index) => {
          const isHead = index === 0;
          return (
            <div
              key={`${segment.x}-${segment.y}-${index}`}
              className={`absolute rounded-sm transition-all duration-75 ease-linear ${
                isHead 
                  ? 'bg-cyan-300 shadow-[0_0_12px_#67e8f9] z-10' 
                  : 'bg-cyan-500 shadow-[0_0_8px_#06b6d4] opacity-80'
              }`}
              style={{
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                left: segment.x * CELL_SIZE + 1,
                top: segment.y * CELL_SIZE + 1,
              }}
            />
          );
        })}

        {/* Food rendering */}
        <div
          className="absolute bg-pink-500 rounded-full shadow-[0_0_12px_#ec4899] animate-pulse"
          style={{
            width: CELL_SIZE - 4,
            height: CELL_SIZE - 4,
            left: food.x * CELL_SIZE + 2,
            top: food.y * CELL_SIZE + 2,
          }}
        />

        {/* Overlays */}
        {(!isPlaying && !gameOver) && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
            <h2 className="font-mono text-3xl font-bold tracking-wider text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">SYNTH_SNAKE</h2>
            <button 
              onClick={resetGame}
              className="mt-6 px-6 py-2 border-2 border-cyan-500 text-cyan-400 font-mono font-bold uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all hover:shadow-[0_0_20px_#06b6d4] flex items-center gap-2"
            >
              <Play className="w-5 h-5" /> Start Protocol
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm z-20">
            <h2 className="font-mono text-4xl font-bold text-pink-500 drop-shadow-[0_0_15px_#ec4899]">SYSTEM FAILURE</h2>
            <p className="text-zinc-400 font-mono mt-2 mb-6 tracking-widest uppercase text-sm">Final Score: {score}</p>
            <button 
              onClick={resetGame}
              className="px-6 py-2 border-2 border-pink-500 text-pink-500 font-mono font-bold uppercase tracking-widest hover:bg-pink-500 hover:text-black transition-all hover:shadow-[0_0_20px_#ec4899] flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" /> Reboot
            </button>
          </div>
        )}

        {(isPaused && !gameOver && isPlaying) && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm z-20">
            <h2 className="font-mono text-3xl font-bold text-yellow-400 drop-shadow-[0_0_15px_#facc15] tracking-widest">PAUSED</h2>
            <button 
              onClick={() => setIsPaused(false)}
              className="mt-6 px-6 py-2 border-2 border-yellow-400 text-yellow-400 font-mono font-bold uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all hover:shadow-[0_0_20px_#facc15] flex items-center gap-2"
            >
              <Play className="w-5 h-5" /> Resume
            </button>
          </div>
        )}
      </div>
      
      {/* Controls Hint */}
      <div className="mt-6 flex justify-between w-full text-xs font-mono text-zinc-500 tracking-widest uppercase">
        <span>WASD / Arrows to move</span>
        <span>Space to pause</span>
      </div>
    </div>
  );
}
