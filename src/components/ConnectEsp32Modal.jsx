import React, { useState } from 'react';
import { Cpu, Key, Check, Copy, AlertCircle, Server, Wifi, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { useConveyor } from '../context/ConveyorContext';

export const ConnectEsp32Modal = ({ isOpen, onClose }) => {
  const { registerNewDevice, setDataSourceMode, setActiveDeviceId } = useConveyor();

  const [deviceName, setDeviceName] = useState('ESP32 Edge Node #1');
  const [beltName, setBeltName] = useState('Primary Ore Overland Conveyor CV-01');
  const [registeredDevice, setRegisteredDevice] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await registerNewDevice({
        deviceName,
        beltName
      });
      setRegisteredDevice(result);
    } catch (err) {
      console.error("Device registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  const curlSnippet = registeredDevice
    ? `curl -X POST http://localhost:8005/api/devices/${registeredDevice.device_id}/sensor-data \\
  -H "Content-Type: application/json" \\
  -H "X-Device-Token: ${registeredDevice.device_token}" \\
  -d '{"vibration": 1.8, "speed": 3.8, "rpm": 120, "tracking": 1.2, "alignment": "OK"}'`
    : '';

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'token') {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  };

  const handleActivateDevice = () => {
    if (registeredDevice) {
      setActiveDeviceId(registeredDevice.device_id);
      setDataSourceMode('LIVE_ESP32');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border border-[#CBD5E1] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#123047] text-[#159A9C] rounded-xl shadow-xs">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#172B3A]">
                Connect Physical ESP32 Hardware
              </h2>
              <p className="text-xs text-[#64748B] font-medium">
                Register a device to receive live Wi-Fi telemetry via public API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#64748B] hover:text-[#172B3A] hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!registeredDevice ? (
          /* Step 1: Device Registration Form */
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-[#172B3A] block mb-1">
                  Conveyor Belt Name
                </label>
                <input
                  type="text"
                  value={beltName}
                  onChange={(e) => setBeltName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs font-mono text-[#172B3A] focus:outline-none focus:border-[#159A9C]"
                  placeholder="e.g. Primary Ore Conveyor CV-01"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#172B3A] block mb-1">
                  ESP32 Device Identifier / Name
                </label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs font-mono text-[#172B3A] focus:outline-none focus:border-[#159A9C]"
                  placeholder="e.g. ESP32 Edge Node #1"
                  required
                />
              </div>
            </div>

            <div className="bg-[#159A9C]/10 border border-[#159A9C]/30 rounded-xl p-3.5 flex items-start space-x-3 text-xs">
              <ShieldCheck className="w-5 h-5 text-[#159A9C] shrink-0 mt-0.5" />
              <div className="text-[#172B3A] font-medium leading-relaxed">
                <strong>Secure Device Authentication:</strong> Registering will generate a unique <code>Device ID</code> and encrypted <code>API Secret Token</code> used by your ESP32 board to authenticate data packets.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-[#CBD5E1] text-[#64748B] hover:text-[#172B3A] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#159A9C] hover:bg-[#117B7D] text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                {loading ? 'Generating Credentials...' : 'Register & Generate Credentials'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Display Generated Device Credentials & Setup Instructions */
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-[#2E9D59]/10 border border-[#2E9D59]/30 rounded-xl p-4 flex items-center space-x-3 text-xs">
              <div className="p-2 bg-[#2E9D59] text-white rounded-lg">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-[#2E9D59] text-sm block font-extrabold">
                  ESP32 Device Registered Successfully!
                </strong>
                <span className="text-[#172B3A] font-medium">
                  Your device is provisioned. Flash your ESP32 with the credentials below.
                </span>
              </div>
            </div>

            {/* Generated Credentials Box */}
            <div className="bg-[#123047] text-white rounded-xl p-4 space-y-3 font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between border-b border-[#1C3D5A] pb-2">
                <span className="text-[#94A3B8] font-bold">Device ID:</span>
                <strong className="text-[#159A9C] text-sm font-black">{registeredDevice.device_id}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] font-bold">Device API Key / Token:</span>
                <div className="flex items-center gap-2">
                  <span className="bg-[#0F172A] px-2.5 py-1 rounded text-[#E2E8F0] border border-[#334155]">
                    {registeredDevice.device_token}
                  </span>
                  <button
                    onClick={() => copyToClipboard(registeredDevice.device_token, 'token')}
                    className="p-1.5 bg-[#1C3D5A] hover:bg-[#284E73] text-white rounded transition-all cursor-pointer"
                    title="Copy Token"
                  >
                    {copiedToken ? <Check className="w-4 h-4 text-[#2E9D59]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Test HTTP POST Command */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#172B3A]">
                <span>Test API Ingestion (Without Hardware):</span>
                <button
                  onClick={() => copyToClipboard(curlSnippet, 'curl')}
                  className="text-[11px] text-[#159A9C] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedCurl ? <Check className="w-3.5 h-3.5 text-[#2E9D59]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCurl ? 'Copied curl' : 'Copy cURL Command'}</span>
                </button>
              </div>
              <pre className="p-3 bg-[#0F172A] text-[#38BDF8] rounded-xl text-[11px] font-mono overflow-x-auto border border-[#1E293B]">
                {curlSnippet}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0]">
              <button
                onClick={() => setRegisteredDevice(null)}
                className="w-full sm:w-auto px-4 py-2 bg-white border border-[#CBD5E1] text-[#64748B] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Register Another Device
              </button>
              <button
                onClick={handleActivateDevice}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#2E9D59] hover:bg-[#258249] text-white rounded-xl text-xs font-mono font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <span>Switch Dashboard to Live ESP32</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
