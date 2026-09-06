import React, { useState, useEffect } from 'react';
import { Bell, Clock, AlertTriangle, Cpu, Radio, Sparkles, Plus } from 'lucide-react';
import { useConveyor } from '../context/ConveyorContext';
import { ConnectEsp32Modal } from './ConnectEsp32Modal';

export const Header = ({ activeTab, setActiveTab }) => {
  const { 
    alerts, 
    mlMetrics, 
    dataSourceMode, 
    setDataSourceMode, 
    activeDeviceId,
    deviceStatus
  } = useConveyor();

  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Dashboard', sub: 'Real-time monitoring and health overview of the conveyor belt system' };
      case 'prediction':
        return { title: 'Failure Prediction', sub: 'AI-based assessment of conveyor belt and joint condition' };
      case 'history':
        return { title: 'Condition History', sub: 'Understand previous belt conditions and changes.' };
      case 'alerts':
        return { title: 'Alerts & Maintenance', sub: 'Active abnormal events log and preventive work order management' };
      case 'architecture':
        return { title: 'System Architecture', sub: 'Technical data pipeline overview (IoT Sensors → Edge → FastAPI → ML → Digital Twin)' };
      case 'team':
        return { title: 'Our Team', sub: 'Six specialized roles working together to build one intelligent conveyor monitoring system.' };
      default:
        return { title: 'Dashboard', sub: '' };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <>
      <header className="bg-[#D2D7D9] border-b border-[#B4BEC2] px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs sticky top-0 z-10">
        {/* Page Title & Subtitle */}
        <div>
          <h2 className="text-xl font-extrabold text-[#263238] tracking-wide flex items-center gap-2">
            {pageInfo.title}
            {mlMetrics.condition === 'CRITICAL' && activeTab === 'dashboard' && (
              <span className="bg-[#C6534F] text-white text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" /> CRITICAL ALERT
              </span>
            )}
          </h2>
          <p className="text-xs text-[#56656B] font-medium mt-0.5">{pageInfo.sub}</p>
        </div>

        {/* Right Top Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#263238]">

          {/* Small ESP32 Hardware Status Info Button */}
          <div 
            onClick={() => setIsConnectModalOpen(true)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border font-mono shadow-2xs text-xs font-bold cursor-pointer transition-all ${
              deviceStatus === 'ONLINE'
                ? 'bg-[#2E9D59]/10 border-[#2E9D59]/30 text-[#2E9D59] hover:bg-[#2E9D59]/20'
                : deviceStatus === 'NO_RECENT_DATA'
                ? 'bg-[#D97706]/10 border-[#D97706]/30 text-[#D97706] hover:bg-[#D97706]/20'
                : 'bg-[#C6534F]/10 border-[#C6534F]/30 text-[#C6534F] hover:bg-[#C6534F]/20'
            }`} 
            title="Click for ESP32 Connection Details"
          >
            <span className={`w-2 h-2 rounded-full ${
              deviceStatus === 'ONLINE' ? 'bg-[#2E9D59] animate-pulse' : deviceStatus === 'NO_RECENT_DATA' ? 'bg-[#D97706]' : 'bg-[#C6534F]'
            }`}></span>
            <span>{deviceStatus === 'ONLINE' ? 'ESP32 Online' : deviceStatus === 'NO_RECENT_DATA' ? 'No Recent Data' : 'ESP32 Offline'}</span>
          </div>

          {/* Live Clock & Date */}
          <div className="flex items-center space-x-2 text-[#263238] bg-[#EEF1F2] px-3 py-1.5 rounded-xl border border-[#B4BEC2] font-mono shadow-2xs">
            <Clock className="w-4 h-4 text-[#9A5B3D]" />
            <div className="flex flex-col text-right leading-tight">
              <span className="font-bold text-sm text-[#263238]">{timeStr}</span>
              <span className="text-[10px] text-[#56656B]">{dateStr}</span>
            </div>
          </div>

          {/* Alerts Bell Button */}
          <button
            onClick={() => setActiveTab('alerts')}
            className="relative p-2 rounded-xl bg-[#9A5B3D] hover:bg-[#795548] text-white transition-all shadow-2xs cursor-pointer"
            title="View Active Alerts"
          >
            <Bell className="w-5 h-5 text-white" />
            {activeAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C6534F] text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {activeAlerts.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Connect ESP32 Modal */}
      <ConnectEsp32Modal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />
    </>
  );
};
