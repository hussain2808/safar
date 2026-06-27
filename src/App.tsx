import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthGate } from '@/components/AuthGate';
import { Header } from './app/components/Header';
import { Greeting } from './app/components/Greeting';
import { ModuleGrid } from './app/components/ModuleGrid';
import { TodaysAttention } from './app/components/TodaysAttention';
import { LifeSnapshot } from './app/components/LifeSnapshot';
import { RecentActivity } from './app/components/RecentActivity';
import { BottomNav } from './app/components/BottomNav';
import { Fab } from './app/components/Fab';
import HisaabApp from '@/modules/hisaab/HisaabApp';
import AmaanatApp from '@/modules/amaanat/AmaanatApp';
import SanadApp from '@/modules/sanad/SanadApp';
import { UpdateBanner } from '@/modules/hisaab/shared/components/UpdateBanner';
import { DebugErrorBanner } from '@/components/DebugErrorBanner';
import { installDebugErrorCapture } from '@/lib/debugErrorLog';

installDebugErrorCapture();

function HomeScreen() {
  return (
    <div className="min-h-screen bg-cream pb-24">
      <Header />
      <Greeting />
      <ModuleGrid />
      <TodaysAttention />
      <LifeSnapshot />
      <RecentActivity />
      <Fab />
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <>
      <DebugErrorBanner />
      <AuthGate>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/hisaab/*" element={<HisaabApp />} />
            <Route path="/amaanat/*" element={<AmaanatApp />} />
            <Route path="/sanad/*" element={<SanadApp />} />
          </Routes>
          <UpdateBanner />
        </BrowserRouter>
      </AuthGate>
    </>
  );
}

export default App;
