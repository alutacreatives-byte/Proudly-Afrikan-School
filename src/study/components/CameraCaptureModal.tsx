import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, FlipHorizontal, ShieldAlert, Image as ImageIcon } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (photoBlob: Blob, photoDataUrl: string, fileName: string) => void;
  title?: string;
  subtitle?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
  title = 'Capture Study Material',
  subtitle = 'Position textbook, homework, handwritten notes, equations or diagrams in frame',
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop active media stream tracks cleanly
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (e) {
        console.warn('Error stopping stream tracks:', e);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch (e) {}
    }
    setStream(null);
  }, []);

  // Request camera stream and permission on demand
  const startCamera = useCallback(async (desiredFacing: 'environment' | 'user') => {
    setCameraError(null);
    setIsPermissionDenied(false);
    setIsInitializing(true);
    stopStream();

    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      setCameraError('Camera access is not directly supported by this browser. You can take or choose a photo of your study material using the button below.');
      setIsInitializing(false);
      return;
    }

    try {
      let newStream: MediaStream | null = null;

      // 1. Mobile & tablet resilient constraints (flexible width/height)
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: desiredFacing ? { ideal: desiredFacing } : 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (specErr: any) {
        // Permission denied shouldn't retry constraints
        if (specErr.name === 'NotAllowedError' || specErr.name === 'PermissionDeniedError') {
          throw specErr;
        }

        // Fallback constraint attempt 2: facing mode only
        try {
          newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: desiredFacing },
            audio: false,
          });
        } catch (facingErr: any) {
          if (facingErr.name === 'NotAllowedError' || facingErr.name === 'PermissionDeniedError') {
            throw facingErr;
          }

          // Fallback constraint attempt 3: standard video true
          newStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      if (!newStream) {
        throw new Error('Could not establish camera video stream.');
      }

      streamRef.current = newStream;
      setStream(newStream);
      setIsPermissionDenied(false);
      setCameraError(null);

      // Connect to video element with iOS / tablet playsInline safeguards
      if (videoRef.current) {
        const video = videoRef.current;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.srcObject = newStream;
        video.onloadedmetadata = () => {
          video.play().catch((playErr) => {
            console.warn('Video playback notice:', playErr);
          });
        };
      }

      // Check for multiple camera devices (front/back)
      if (navigator.mediaDevices.enumerateDevices) {
        navigator.mediaDevices.enumerateDevices()
          .then((devices) => {
            const videoDevices = devices.filter((d) => d.kind === 'videoinput');
            setHasMultipleCameras(videoDevices.length > 1);
          })
          .catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera getUserMedia error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setIsPermissionDenied(true);
        setCameraError('Camera access was not granted. Please allow camera permissions in your browser address bar or device settings, or tap "Take or Select Photo" below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setIsPermissionDenied(false);
        setCameraError('No active camera hardware was detected on this device. You can snap or select a photo of your study material using the button below.');
      } else {
        setIsPermissionDenied(false);
        setCameraError(err.message || 'Unable to open camera stream on this device. You can tap "Take or Select Photo" below.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [stopStream]);

  // Connect stream whenever videoRef and stream are present
  useEffect(() => {
    if (videoRef.current && stream) {
      const video = videoRef.current;
      if (video.srcObject !== stream) {
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play().catch(() => {});
        };
      }
    }
  }, [stream]);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      setCapturedDataUrl(null);
      setCapturedBlob(null);
      setCameraError(null);
      setIsPermissionDenied(false);
      startCamera(facingMode);
    } else {
      stopStream();
      setCapturedDataUrl(null);
      setCapturedBlob(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, facingMode, stopStream]);

  // Handle camera flip (front/back)
  const handleToggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Capture current video frame into canvas and produce Blob + DataURL
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedDataUrl(dataUrl);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
        }
      },
      'image/jpeg',
      0.92
    );

    // Stop active camera stream while reviewing
    stopStream();
  };

  // Retake photo: clear snapshot and re-open camera
  const handleRetake = () => {
    setCapturedDataUrl(null);
    setCapturedBlob(null);
    startCamera(facingMode);
  };

  // Confirm photo and pass into Study input
  const handleConfirmPhoto = () => {
    if (!capturedBlob || !capturedDataUrl) return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `study-capture-${timestamp}.jpg`;
    onPhotoCaptured(capturedBlob, capturedDataUrl, fileName);
    onClose();
  };

  // Direct native mobile camera shutter / file upload
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = (event.target?.result as string) || '';
      onPhotoCaptured(file, dataUrl, file.name || `study-capture-${Date.now()}.jpg`);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div 
      id="camera-capture-modal-backdrop"
      className="fixed inset-0 z-50 bg-[#161616]/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div 
        id="camera-capture-modal-content"
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col my-auto max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#18181B] text-[#D92B8A] flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5 text-[#D92B8A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-[#D92B8A] uppercase tracking-wider">
                  CAPTURE IT • DEVICE CAMERA
                </span>
              </div>
              <h2 className="font-display font-black text-lg sm:text-xl uppercase text-[#161616] tracking-tight">
                {title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            id="close-camera-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200/70 border border-stone-200 text-stone-700 transition-colors cursor-pointer"
            aria-label="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Canvas */}
        <div className="p-4 sm:p-6 space-y-4 bg-stone-950 flex-1 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[380px] relative overflow-hidden">
          {capturedDataUrl ? (
            // 1. REVIEW SNAPSHOT
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <img
                src={capturedDataUrl}
                alt="Captured study material"
                className="max-h-[360px] w-auto max-w-full rounded-2xl object-contain shadow-lg border border-stone-700"
              />
              <div className="absolute top-3 left-3 bg-emerald-600/95 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md backdrop-blur-xs">
                <Check className="w-3.5 h-3.5" />
                <span>PHOTO READY FOR STUDY</span>
              </div>
            </div>
          ) : stream ? (
            // 2. LIVE CAMERA VIEW
            <div className="relative w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-h-[380px] object-contain rounded-2xl bg-black"
              />

              {/* Document Alignment Frame Overlay */}
              <div className="absolute inset-3 sm:inset-5 border-2 border-dashed border-white/60 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between text-white/90 font-mono text-[10px] tracking-wider uppercase bg-black/70 px-2.5 py-1 rounded-md self-start">
                  <span>Frame Textbook, Notes or Diagrams</span>
                </div>
                <div className="flex justify-end text-white/90 font-mono text-[10px] tracking-wider uppercase bg-black/70 px-2.5 py-1 rounded-md self-end">
                  <span>Good Lighting • Clear View</span>
                </div>
              </div>

              {/* Camera Flip (front/back) */}
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={handleToggleFacingMode}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-black/70 hover:bg-black text-white border border-white/30 transition-all cursor-pointer shadow-md backdrop-blur-xs flex items-center gap-1.5 text-xs font-mono"
                  title="Switch Camera (Front / Back)"
                >
                  <FlipHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Flip</span>
                </button>
              )}
            </div>
          ) : (
            // 3. INITIALIZING, PERMISSION DENIED, OR ERROR STATE
            <div className="text-center p-4 sm:p-6 space-y-4 max-w-md">
              {isInitializing ? (
                <div className="flex flex-col items-center gap-3 text-stone-300">
                  <RefreshCw className="w-8 h-8 text-[#D92B8A] animate-spin" />
                  <p className="font-mono text-xs font-bold uppercase tracking-wider">
                    Requesting camera access & opening camera...
                  </p>
                </div>
              ) : isPermissionDenied ? (
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-full bg-rose-950/80 text-rose-400 border border-rose-700/60 flex items-center justify-center mx-auto shadow-sm">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5 text-stone-200">
                    <h3 className="font-display font-black text-lg uppercase text-rose-300">
                      Camera Access Needed
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                      Camera access is needed for <strong>CAPTURE IT</strong> to photograph textbook pages, handwritten homework, diagrams or worksheets.
                    </p>
                    <p className="text-xs font-mono text-stone-400 pt-1">
                      You can retry browser permission or use your device camera shutter directly below:
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
                    <button
                      type="button"
                      id="retry-camera-permission-btn"
                      onClick={() => startCamera(facingMode)}
                      className="px-6 py-3.5 rounded-full bg-[#D92B8A] hover:bg-[#c02479] text-white font-display font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Try Again</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-3.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-100 font-display font-bold text-xs uppercase tracking-wider transition-all border border-stone-700 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-[#D92B8A]" />
                      <span>Device Camera Shutter / File</span>
                    </button>
                  </div>
                </div>
              ) : (
                // GENERAL CAMERA ERROR / FALLBACK
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-full bg-stone-800 text-[#D92B8A] flex items-center justify-center mx-auto border border-stone-700">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div className="space-y-1 text-stone-200">
                    <h3 className="font-display font-black text-lg uppercase">
                      Open Camera
                    </h3>
                    <p className="text-xs font-mono text-stone-400">
                      {cameraError || 'Use your device camera to photograph your study materials.'}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
                    <button
                      type="button"
                      onClick={() => startCamera(facingMode)}
                      className="px-6 py-3.5 rounded-full bg-[#D92B8A] hover:bg-[#c02479] text-white font-display font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Retry Camera</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-3.5 rounded-full bg-stone-800 hover:bg-stone-700 text-white font-display font-bold text-xs uppercase tracking-wider transition-all border border-stone-700 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Select or Snap Photo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hidden Native File/Camera Input with capture="environment" for instant mobile shutter */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInputChange}
          className="hidden"
          id="native-camera-file-input"
        />

        {/* Subtitle guidance */}
        <div className="px-5 py-2.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs font-mono text-stone-600">
          <span className="truncate">{subtitle}</span>
          <span className="shrink-0 font-bold text-stone-800 uppercase hidden sm:inline">
            Smart OCR & Handwriting Transcription
          </span>
        </div>

        {/* Action Controls Bar */}
        <div className="p-4 sm:p-5 bg-white border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {capturedDataUrl ? (
            // CONTROLS WHEN PHOTO IS TAKEN
            <>
              <button
                type="button"
                id="retake-photo-btn"
                onClick={handleRetake}
                className="py-3 px-5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-800 font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake Photo</span>
              </button>

              <button
                type="button"
                id="use-captured-photo-btn"
                onClick={handleConfirmPhoto}
                className="py-3 px-6 rounded-xl bg-[#D92B8A] hover:bg-[#c02479] text-white font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Use as Study Input →</span>
              </button>
            </>
          ) : (
            // CONTROLS WHILE CAMERA IS ACTIVE
            <>
              <button
                type="button"
                id="choose-from-device-btn"
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-stone-500" />
                <span>Device Camera Shutter / File</span>
              </button>

              {stream && (
                <button
                  type="button"
                  id="snap-photo-btn"
                  onClick={handleSnapPhoto}
                  className="py-3.5 px-8 rounded-full bg-[#D92B8A] hover:bg-[#c02479] text-white font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
