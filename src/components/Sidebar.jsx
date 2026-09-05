import React from 'react';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  History, 
  BellRing, 
  Cpu, 
  ShieldAlert,
  Activity,
  Users
} from 'lucide-react';
import { useConveyor } from '../context/ConveyorContext';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { conveyorMeta, alerts } = useConveyor();
  const activeAlertCount = alerts.filter(a => a.status === 'ACTIVE').length;

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'prediction', label: 'Failure Prediction', icon: AlertTriangle },
    { id: 'history', label: 'Condition History', icon: History },
    { 
      id: 'alerts', 
      label: 'Alerts & Maintenance', 
      icon: BellRing, 
      badge: activeAlertCount > 0 ? activeAlertCount : null 
    },
  ];

  const secondaryNavItems = [
    { id: 'architecture', label: 'System Architecture', icon: Cpu },
    { id: 'team', label: 'Our Team', icon: Users },
  ];

  return (
    <aside className="w-64 bg-[#263238] text-[#EEF1F2] flex flex-col justify-between h-screen sticky top-0 border-r border-[#3A4950] shadow-xl select-none z-20">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-[#3A4950] bg-[#263238]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#287F7A] rounded-lg shadow-md text-[#EEF1F2] flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold tracking-wider text-base text-[#EEF1F2] flex items-center gap-1">
                SMART<span className="text-[#3F9692]">BELT</span>
              </h1>
              <p className="text-[10px] text-[#C4CBCE] font-mono tracking-tight uppercase">
                Iron Ore Belt Health System
              </p>
            </div>
          </div>
        </div>

        {/* Main Navigation (4 Core Operational Pages) */}
        <div className="px-3 py-4">
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#287F7A] text-[#EEF1F2] shadow-md border-l-4 border-[#9A5B3D]'
                      : 'text-[#C4CBCE] hover:bg-[#9A5B3D]/20 hover:text-[#EEF1F2]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#EEF1F2]' : 'text-[#C4CBCE]/80'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-[#9A5B3D] text-[#EEF1F2] text-xs px-2 py-0.5 rounded-full font-bold shadow">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Divider */}
        <div className="my-2 px-4">
          <div className="border-t border-[#3A4950]"></div>
        </div>

        {/* Secondary Navigation */}
        <div className="px-3 py-2">
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#287F7A] text-[#EEF1F2] shadow border-l-4 border-[#9A5B3D]'
                      : 'text-[#C4CBCE]/80 hover:bg-[#9A5B3D]/20 hover:text-[#EEF1F2]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#EEF1F2]' : 'text-[#C4CBCE]/60'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] bg-[#155E63] text-[#EEF1F2] px-1.5 py-0.5 rounded border border-[#3F9692]/40">
                    INFO
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer System Info Card */}
      <div className="p-3 m-3 bg-[#1D272C] rounded-xl border border-[#3A4950] text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#C4CBCE] flex items-center gap-1 font-semibold">
            <Activity className="w-3.5 h-3.5 text-[#3F9692]" /> CONVEYOR ID
          </span>
          <span className="font-mono text-[#3F9692] font-bold">{conveyorMeta.id}</span>
        </div>
        <div className="space-y-1 text-[11px] text-[#C4CBCE]">
          <div className="flex justify-between">
            <span>Location:</span>
            <span className="text-[#EEF1F2] font-medium truncate max-w-[120px]" title={conveyorMeta.location}>
              Iron Ore Plant 2
            </span>
          </div>
          <div className="flex justify-between">
            <span>Uptime:</span>
            <span className="text-[#EEF1F2] font-medium">{conveyorMeta.operationalDays} Days</span>
          </div>
          <div className="flex justify-between border-t border-[#3A4950] pt-1 mt-1">
            <span>System Version:</span>
            <span className="font-mono text-[#C4CBCE]/70">v1.0.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
