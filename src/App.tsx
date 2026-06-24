import { AuthGate } from '@/components/AuthGate';
import { Header } from './app/components/Header';
import { ModuleGrid } from './app/components/ModuleGrid';
import { TodaysAttention } from './app/components/TodaysAttention';
import { LifeSnapshot } from './app/components/LifeSnapshot';
import { RecentActivity } from './app/components/RecentActivity';
import { BottomNav } from './app/components/BottomNav';
import { Fab } from './app/components/Fab';

function App() {
  return (
    <AuthGate>
      <div className="min-h-screen bg-cream pb-24">
        <Header />
        <ModuleGrid />
        <TodaysAttention />
        <LifeSnapshot />
        <RecentActivity />
        <Fab />
        <BottomNav />
      </div>
    </AuthGate>
  );
}

export default App;
