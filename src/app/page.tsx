import { Dashboard } from '@/pages/Dashboard';
import { TopNav } from '@/components/layout/TopNav';
import { SideNav } from '@/components/layout/SideNav';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopNav />
      <div style={{ display: 'flex', flex: 1 }}>
        <SideNav />
        <Dashboard />
      </div>
    </div>
  );
}
