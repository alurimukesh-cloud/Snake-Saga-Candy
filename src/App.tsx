import { SnakeGame } from './components/SnakeGame';
import { MusicPlayer } from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-pink-500/30 overflow-hidden relative flex flex-col items-center justify-center py-10 px-4">
      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}
      />
      {/* Ambient Neon Glows */}
      <div className="absolute top-0 -translate-y-1/2 left-0 w-[500px] h-[500px] bg-pink-600 rounded-full blur-[150px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 translate-y-1/2 right-0 w-[500px] h-[500px] bg-cyan-600 rounded-full blur-[150px] opacity-20 pointer-events-none" />

      <header className="mb-12 z-10 text-center">
        <h1 className="text-5xl font-mono font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]">
          SYNTH_SNAKE
        </h1>
        <p className="font-mono text-zinc-500 text-sm tracking-widest uppercase mt-3">Audiovisual Operations Protocol</p>
      </header>

      <main className="z-10 flex flex-col lg:flex-row items-center lg:items-start gap-16 lg:gap-24 w-full max-w-5xl justify-center">
        <div className="flex-1 flex justify-center lg:justify-end">
          <SnakeGame />
        </div>
        
        <div className="flex-1 flex justify-center lg:justify-start w-full">
          <div className="w-full max-w-md lg:mt-16">
            <h2 className="font-mono text-zinc-500 text-xs tracking-widest uppercase mb-3 px-2">Now Playing</h2>
            <MusicPlayer />
          </div>
        </div>
      </main>
    </div>
  );
}
