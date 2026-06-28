import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthGate } from '@/components/AuthGate';
import { Header } from './app/components/Header';
import { Greeting } from './app/components/Greeting';
import { ModuleGrid } from './app/components/ModuleGrid';
import { TodaysAttention } from './app/components/TodaysAttention';
import { LifeSnapshot } from './app/components/LifeSnapshot';
import { RecentActivity } from './app/components/RecentActivity';
import { BottomNav } from './app/components/BottomNav';
import HisaabApp from '@/modules/hisaab/HisaabApp';
import AmaanatApp from '@/modules/amaanat/AmaanatApp';
import SanadApp from '@/modules/sanad/SanadApp';
import NazaraApp from '@/modules/nazara/NazaraApp';
import Settings from './pages/Settings';
import SettingsFamily from './pages/SettingsFamily';
import SettingsAbout from './pages/SettingsAbout';
import { UpdateBanner } from '@/modules/hisaab/shared/components/UpdateBanner';
import { SyncStatusBanner as FamilySyncStatusBanner } from '@/family/components/SyncStatusBanner';
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
    </div>
  );
}

const TAB_ROOT_PATHS = ['/', '/hisaab', '/amaanat', '/sanad', '/nazara'];

function TabBottomNav() {
  const { pathname } = useLocation();
  if (!TAB_ROOT_PATHS.includes(pathname)) return null;
  return <BottomNav />;
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
            <Route path="/nazara/*" element={<NazaraApp />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/family" element={<SettingsFamily />} />
            <Route path="/settings/about" element={<SettingsAbout />} />
          </Routes>
          <TabBottomNav />
          <UpdateBanner />
          <FamilySyncStatusBanner />
        </BrowserRouter>
      </AuthGate>
    </>
  );
}

export default App;
