import React, { useState } from 'react';
import { ConveyorProvider } from './context/ConveyorContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

import { DashboardPage } from './pages/DashboardPage';
import { FailurePredictionPage } from './pages/FailurePredictionPage';
import { HistoryTrendsPage } from './pages/HistoryTrendsPage';
import { AlertsMaintenancePage } from './pages/AlertsMaintenancePage';
import { SystemArchitecturePage } from './pages/SystemArchitecturePage';
import { TeamPage } from './pages/TeamPage';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'prediction':
        return <FailurePredictionPage />;
      case 'history':
        return <HistoryTrendsPage />;
      case 'alerts':
        return <AlertsMaintenancePage />;
      case 'architecture':
        return <SystemArchitecturePage />;
      case 'team':
        return <TeamPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <ConveyorProvider>
      <div className="flex h-screen bg-[#D2D7D9] text-[#263238] overflow-hidden font-sans">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#D2D7D9]">
          {/* Header Bar */}
          <Header activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Main Container */}
          <main className="p-6 flex-1 bg-[#D2D7D9]">
            {renderActivePage()}
          </main>
        </div>
      </div>
    </ConveyorProvider>
  );
}

export default App;
