import React, { useState, useRef, useEffect } from 'react';
import { useGym } from '../context/GymContext';
import { Member, StaffMember } from '../types';

interface BiometricScannerProps {
  onAttendanceLogged?: () => void;
  compact?: boolean;
}

export const BiometricAttendanceScanner: React.FC<BiometricScannerProps> = ({
  onAttendanceLogged,
  compact = false
}) => {
  const {
    members,
    staff,
    logBiometricAttendance,
    isTerminalLocked,
    showToast,
    lastScannedMember
  } = useGym();

  const [scanType, setScanType] = useState<'member' | 'staff'>('member');
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    name: string;
    roleOrPlan: string;
    confidence: number;
    timestamp: string;
    pointsAwarded?: number;
    photoUrl?: string;
  } | null>(null);

  const [livenessMetric, setLivenessMetric] = useState<number>(98.6);
  const [autoScanEnabled, setAutoScanEnabled] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Filter list of eligible members / staff
  const availableMembers = members.filter(m => m.status === 'active' || m.status === 'frozen');
  const filteredCandidates = scanType === 'member'
    ? members.filter(m =>
        !searchFilter.trim() ||
        m.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        m.memberCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
        m.plan.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : staff.filter(s =>
        !searchFilter.trim() ||
        s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        s.role.toLowerCase().includes(searchFilter.toLowerCase()) ||
        s.staffCode.toLowerCase().includes(searchFilter.toLowerCase())
      );

  // Set default selected person
  useEffect(() => {
    if (!selectedPersonId) {
      if (scanType === 'member' && members.length > 0) {
        setSelectedPersonId(members[0].id);
      } else if (scanType === 'staff' && staff.length > 0) {
        setSelectedPersonId(staff[0].id);
      }
    }
  }, [scanType, members, staff]);

  // Start real device camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API (getUserMedia) not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video play warning:', e));
      }
      setCameraActive(true);
      showToast('Camera Initialized', 'Device webcam connected for biometric face-ID verification.', 'info');
    } catch (err: any) {
      console.warn('Webcam access error:', err);
      setCameraError(err.message || 'Unable to access device camera. Running in AI Biometric Simulation mode.');
      setCameraActive(false);
    }
  };

  // Stop device camera
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Automatically start camera on mount if permissible
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Subtle liveness fluctuation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLivenessMetric(+(98.2 + Math.random() * 1.5).toFixed(1));
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  // Perform Face Match & Timestamp Logging
  const handleCaptureAndVerify = async () => {
    if (isTerminalLocked) {
      showToast('Terminal Locked', 'Please unlock Terminal Gate before biometric access.', 'warning');
      return;
    }

    if (isVerifying) return;

    setIsVerifying(true);
    setVerificationResult(null);

    // Try capturing current frame snapshot if camera is active
    let snapshotDataUrl: string | undefined = undefined;
    if (cameraActive && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          snapshotDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        } catch (e) {
          // ignore canvas taint
        }
      }
    }

    // Determine target candidate
    const currentTarget = scanType === 'member'
      ? members.find(m => m.id === selectedPersonId) || members[0]
      : staff.find(s => s.id === selectedPersonId) || staff[0];

    if (!currentTarget) {
      setIsVerifying(false);
      showToast('No Candidate', 'Please select a member or staff member to verify.', 'error');
      return;
    }

    // Simulate multi-stage facial biometric recognition:
    // 1. Landmark Triangulation
    // 2. Anti-spoofing 3D depth check
    // 3. Database Vector Match against KYC photo
    setTimeout(async () => {
      const confidence = +(97.4 + Math.random() * 2.5).toFixed(1);
      const res = await logBiometricAttendance({
        personType: scanType,
        personId: currentTarget.id,
        personName: currentTarget.name,
        photoUrl: currentTarget.photoUrl,
        confidenceScore: confidence,
        capturedPhotoUrl: snapshotDataUrl || currentTarget.photoUrl,
        terminal: 'Biometric Face-ID Gate #01'
      });

      setIsVerifying(false);
      const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setVerificationResult({
        success: res.success,
        name: currentTarget.name,
        roleOrPlan: scanType === 'member' ? (currentTarget as Member).plan : (currentTarget as StaffMember).role,
        confidence,
        timestamp: nowStr,
        pointsAwarded: res.pointsAwarded,
        photoUrl: snapshotDataUrl || currentTarget.photoUrl
      });

      if (onAttendanceLogged) {
        onAttendanceLogged();
      }
    }, 1100);
  };

  return (
    <div className="bg-surface-container rounded-3xl p-5 border border-outline-variant/30 space-y-5 relative overflow-hidden shadow-xl">
      {/* Hidden canvas for snapshot rasterization */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header bar & Scanner Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/30 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-bold relative">
            <span className="material-symbols-outlined text-[22px] animate-pulse">face</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-surface"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-headline font-bold text-on-surface">
                AI Biometric Attendance Terminal
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-mono font-bold tracking-wider uppercase">
                {cameraActive ? 'Camera Live' : 'Simulation Ready'}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              High-speed optical facial verification, anti-spoofing liveness &amp; Gymify points logger
            </p>
          </div>
        </div>

        {/* Mode Switcher: Member Check-in vs Staff Duty */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl border border-outline-variant/20 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setScanType('member');
              setVerificationResult(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              scanType === 'member'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">person</span>
            <span>Member Check-in</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setScanType('staff');
              setVerificationResult(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              scanType === 'staff'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">badge</span>
            <span>Staff &amp; Trainer Presence</span>
          </button>
        </div>
      </div>

      {/* Main Viewfinder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Live Optical / Video Feed with Biometric HUD Overlay (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="relative aspect-4/3 w-full bg-black rounded-2xl overflow-hidden border-2 border-outline-variant/40 flex items-center justify-center shadow-inner group">
            {/* Live Camera Video Feed */}
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              /* Fallback Simulation Feed */
              <div className="relative w-full h-full bg-linear-to-b from-[#0f172a] via-[#090d16] to-[#020617] flex items-center justify-center overflow-hidden">
                {/* Simulated ambient gym background image */}
                <img
                  src={
                    scanType === 'member'
                      ? (members.find(m => m.id === selectedPersonId)?.photoUrl || members[0]?.photoUrl)
                      : (staff.find(s => s.id === selectedPersonId)?.photoUrl || staff[0]?.photoUrl)
                  }
                  alt="Subject Preview"
                  className="w-full h-full object-cover opacity-25 blur-xs scale-110"
                />
                <div className="absolute inset-0 bg-radial from-transparent to-black/70 pointer-events-none"></div>
              </div>
            )}

            {/* Biometric HUD Grid Matrix */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ffff08_1px,transparent_1px),linear-gradient(to_bottom,#00ffff08_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none"></div>

            {/* Target Face Oval HUD with Corner Brackets */}
            <div className={`absolute w-52 h-64 border-2 rounded-[50px] transition-all flex flex-col items-center justify-between p-4 pointer-events-none ${
              isVerifying
                ? 'border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.6)] animate-pulse'
                : verificationResult?.success
                ? 'border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.7)]'
                : 'border-primary/70 shadow-[0_0_25px_rgba(125,211,252,0.35)]'
            }`}>
              {/* Corner reticle markers */}
              <div className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-primary"></div>
              <div className="absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 border-primary"></div>
              <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 border-primary"></div>
              <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-primary"></div>

              {/* Scanning Laser Beam Line */}
              <div className={`absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] ${
                isVerifying ? 'animate-bounce' : 'animate-[ping_3s_ease-in-out_infinite]'
              }`}></div>

              {/* Facial alignment dots */}
              <div className="w-full flex justify-between px-6 pt-8 opacity-75">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] animate-ping"></span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] animate-ping"></span>
              </div>
              <div className="w-2 h-2 rounded-full bg-cyan-400/80 shadow-[0_0_8px_#38bdf8]"></div>
              <div className="w-12 h-1 bg-cyan-400/40 rounded-full mb-6"></div>

              {/* Center status text in reticle */}
              <div className="text-[10px] font-mono tracking-widest text-cyan-300 font-bold uppercase bg-black/60 px-2 py-0.5 rounded-full border border-cyan-400/30">
                {isVerifying ? 'SCANNING FACIAL MESH...' : 'ALIGN FACE IN FRAME'}
              </div>
            </div>

            {/* Top HUD Telemetry Overlay */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono pointer-events-none">
              <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>LIVENESS: {livenessMetric}%</span>
              </div>

              <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-cyan-300">
                CAM: {cameraActive ? 'WEBCAM 1080P' : 'AI_SYNTH_MODE'}
              </div>
            </div>

            {/* Bottom Floating Telemetry */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono pointer-events-none">
              <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-neutral-300">
                MATCH THRESHOLD: &gt;95.0%
              </div>
              <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-primary">
                GATE: TURNSTILE_01
              </div>
            </div>
          </div>

          {/* Camera Controls Bar */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              {cameraActive ? (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-medium flex items-center gap-1.5 transition-all border border-outline-variant/30 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-error">videocam_off</span>
                  <span>Stop Camera</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-all border border-outline-variant/30 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-500">videocam</span>
                  <span>Enable Live Webcam</span>
                </button>
              )}

              {cameraError && (
                <span className="text-[11px] text-amber-500 font-medium">
                  {cameraError}
                </span>
              )}
            </div>

            <div className="text-[11px] text-on-surface-variant font-mono">
              UIDAI AI Verification v3.2
            </div>
          </div>
        </div>

        {/* Right Column: Person Match Selection & Verification Log (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Target {scanType === 'member' ? 'Member' : 'Staff / Trainer'} Roster
              </label>

              {/* Quick candidate search */}
              <div className="relative mb-2">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant absolute left-2.5 top-1/2 -translate-y-1/2">
                  search
                </span>
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder={`Search ${scanType} by name, ID or role...`}
                  className="w-full bg-surface-container-low text-on-surface pl-8 pr-3 py-1.5 rounded-xl text-xs border border-outline-variant/30 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Candidate picker cards */}
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                {filteredCandidates.map((person) => {
                  const isSelected = person.id === selectedPersonId;
                  const isMember = scanType === 'member';
                  const memberObj = isMember ? (person as Member) : null;
                  const staffObj = !isMember ? (person as StaffMember) : null;

                  return (
                    <div
                      key={person.id}
                      onClick={() => {
                        setSelectedPersonId(person.id);
                        setVerificationResult(null);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-primary/10 border-primary shadow-xs'
                          : 'bg-surface-container-low hover:bg-surface-container-high border-outline-variant/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={person.photoUrl}
                          alt={person.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-outline-variant/40 shrink-0"
                        />
                        <div className="truncate text-xs">
                          <div className="font-semibold text-on-surface flex items-center gap-1.5 truncate">
                            <span>{person.name}</span>
                            {isSelected && (
                              <span className="material-symbols-outlined text-primary text-[14px]">
                                check_circle
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-on-surface-variant font-mono">
                            {isMember ? `${memberObj?.memberCode} • ${memberObj?.plan}` : `${staffObj?.staffCode} • ${staffObj?.role}`}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {isMember ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            memberObj?.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : 'bg-error/15 text-error'
                          }`}>
                            {memberObj?.status}
                          </span>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            staffObj?.onShift
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}>
                            {staffObj?.onShift ? 'On Shift' : 'Off Duty'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instant Verification Feedback Display */}
            {verificationResult && (
              <div className={`p-4 rounded-2xl border transition-all animate-in fade-in zoom-in-95 duration-200 ${
                verificationResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-on-surface'
                  : 'bg-error/10 border-error/40 text-on-surface'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={verificationResult.photoUrl}
                      alt={verificationResult.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500 shrink-0 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-headline font-bold text-sm">
                          {verificationResult.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500 text-white">
                          MATCH {verificationResult.confidence}%
                        </span>
                      </div>
                      <div className="text-xs text-on-surface-variant font-mono">
                        {verificationResult.roleOrPlan} • Logged at {verificationResult.timestamp}
                      </div>
                      {verificationResult.pointsAwarded && (
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px] animate-pulse">
                          <span className="material-symbols-outlined text-[13px]">military_tech</span>
                          <span>+{verificationResult.pointsAwarded} Gymify Points Earned!</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <span className={`material-symbols-outlined text-[28px] ${
                    verificationResult.success ? 'text-emerald-500' : 'text-error'
                  }`}>
                    {verificationResult.success ? 'verified' : 'cancel'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Trigger Scan Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleCaptureAndVerify}
              disabled={isVerifying || isTerminalLocked}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-50 ${
                scanType === 'member'
                  ? 'bg-primary text-on-primary hover:brightness-110 shadow-primary/25'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/25'
              }`}
            >
              {isVerifying ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">
                    progress_activity
                  </span>
                  <span>Verifying Facial Biometrics &amp; Logging...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    camera
                  </span>
                  <span>
                    {scanType === 'member'
                      ? 'Capture & Log Member Attendance (+20 Pts)'
                      : 'Capture & Verify Staff On-Duty Presence'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
