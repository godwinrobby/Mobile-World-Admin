import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats, Html5Qrcode } from 'html5-qrcode';
import { Product, ProductVariant } from '../../types';
import { Camera, X, Scan, Volume2, VolumeX, CheckCircle2, AlertTriangle, RefreshCw, Zap, Laptop, Smartphone } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onProductScanned: (product: Product, variant?: ProductVariant, imei?: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  onProductScanned
}) => {
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedFeedback, setScannedFeedback] = useState<{ text: string; success: boolean } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [continuousScan, setContinuousScan] = useState(true);

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'pos-camera-barcode-reader';

  // Sound Synthesizer for scanner beep
  const playBeep = (isSuccess = true) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isSuccess ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(isSuccess ? 1200 : 300, ctx.currentTime);
      if (isSuccess) {
        osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.08);
      }

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (isSuccess ? 0.12 : 0.2));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + (isSuccess ? 0.12 : 0.2));
    } catch (e) {
      console.warn('Audio Context error:', e);
    }
  };

  // Get Camera Devices
  useEffect(() => {
    if (!isOpen) {
      stopScanning();
      return;
    }

    Html5Qrcode.getCameras()
      .then((deviceList) => {
        if (deviceList && deviceList.length > 0) {
          setCameras(deviceList);
          // Default to back/environment camera if available
          const backCam = deviceList.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear') || d.label.toLowerCase().includes('environment'));
          setSelectedCameraId(backCam ? backCam.id : deviceList[0].id);
        } else {
          setScanError('No camera devices detected. Ensure camera permissions are granted.');
        }
      })
      .catch((err) => {
        console.error('Camera access error:', err);
        setScanError('Camera permission denied or camera unavailable.');
      });

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  // Start scanning when camera is selected
  useEffect(() => {
    if (isOpen && selectedCameraId) {
      startScanning(selectedCameraId);
    }
  }, [selectedCameraId, isOpen]);

  const startScanning = async (cameraId: string) => {
    await stopScanning();

    try {
      setScanError(null);
      const html5Qrcode = new Html5Qrcode(scannerContainerId);
      html5QrcodeRef.current = html5Qrcode;

      const config = {
        fps: 15,
        qrbox: { width: 280, height: 180 },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.DATA_MATRIX
        ]
      };

      await html5Qrcode.start(
        cameraId,
        config,
        (decodedText) => {
          handleCodeDetected(decodedText.trim());
        },
        (errorMessage) => {
          // parse errors are normal while frame scanning
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Failed to start scanner:', err);
      setScanError(err?.message || 'Failed to initialize camera video feed.');
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      try {
        await html5QrcodeRef.current.stop();
        html5QrcodeRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
    html5QrcodeRef.current = null;
    setIsScanning(false);
  };

  // Match scanned code against inventory
  const handleCodeDetected = (scannedCode: string) => {
    if (!scannedCode) return;

    const normalizedCode = scannedCode.toLowerCase().trim();

    // Search for matching product in inventory
    let matchedProduct: Product | undefined;
    let matchedVariant: ProductVariant | undefined;
    let matchedImei: string | undefined;

    for (const p of products) {
      // 1. Check exact IMEI list match
      if (p.imeiList && p.imeiList.length > 0) {
        const foundImei = p.imeiList.find(i => i.toLowerCase().trim() === normalizedCode);
        if (foundImei) {
          matchedProduct = p;
          matchedImei = foundImei;
          break;
        }
      }

      // 2. Check barcode property (if present)
      if ((p as any).barcode && (p as any).barcode.toLowerCase().trim() === normalizedCode) {
        matchedProduct = p;
        break;
      }

      // 3. Check SKU property
      if ((p as any).sku && (p as any).sku.toLowerCase().trim() === normalizedCode) {
        matchedProduct = p;
        break;
      }

      // 4. Check product ID
      if (p.id.toLowerCase().trim() === normalizedCode) {
        matchedProduct = p;
        break;
      }

      // 5. Check product variant SKU
      if (p.variants && p.variants.length > 0) {
        const v = p.variants.find(v => v.sku.toLowerCase().trim() === normalizedCode);
        if (v) {
          matchedProduct = p;
          matchedVariant = v;
          break;
        }
      }

      // 6. Check if code matches product name (exact match fallback)
      if (p.name.toLowerCase().trim() === normalizedCode) {
        matchedProduct = p;
        break;
      }
    }

    if (matchedProduct) {
      playBeep(true);
      onProductScanned(matchedProduct, matchedVariant, matchedImei);

      const imeiInfo = matchedImei ? ` (IMEI: ${matchedImei})` : '';
      const feedbackText = `Added "${matchedProduct.name}"${imeiInfo} to POS Cart!`;
      setScannedFeedback({ text: feedbackText, success: true });

      if (!continuousScan) {
        onClose();
      } else {
        setTimeout(() => setScannedFeedback(null), 3000);
      }
    } else {
      playBeep(false);
      setScannedFeedback({
        text: `No matching product found for code: "${scannedCode}"`,
        success: false
      });
      setTimeout(() => setScannedFeedback(null), 3500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Modal Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">POS Camera Barcode & IMEI Scanner</h3>
              <p className="text-[10px] text-slate-400">Scan product barcodes, EAN/UPC labels or 15-digit serial numbers</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                soundEnabled ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
              title={soundEnabled ? 'Audio Beep Enabled' : 'Audio Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scanner Feed Container */}
        <div className="p-4 space-y-3">

          {/* Camera Selection Dropdown */}
          {cameras.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold shrink-0">Camera Device:</span>
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                className="flex-1 bg-slate-950 text-slate-200 border border-slate-800 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                {cameras.map(cam => (
                  <option key={cam.id} value={cam.id}>{cam.label || `Camera ${cam.id}`}</option>
                ))}
              </select>
            </div>
          )}

          {/* Video Stream Box */}
          <div className="relative bg-black rounded-xl overflow-hidden border border-slate-800 min-h-[260px] flex items-center justify-center">
            <div id={scannerContainerId} className="w-full h-full"></div>

            {/* Scanning Laser Animation Overlay */}
            {isScanning && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-64 h-44 border-2 border-indigo-500/60 rounded-xl relative overflow-hidden shadow-2xl">
                  <div className="absolute inset-x-0 h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-pulse top-1/2 -translate-y-1/2"></div>
                  <div className="absolute top-2 left-2 text-[10px] font-mono text-indigo-300 bg-slate-950/80 px-1.5 py-0.5 rounded">
                    SCANNING BARCODE
                  </div>
                </div>
              </div>
            )}

            {scanError && (
              <div className="p-6 text-center space-y-3 text-rose-300">
                <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
                <p className="text-xs font-semibold">{scanError}</p>
                <button
                  onClick={() => selectedCameraId && startScanning(selectedCameraId)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Retry Camera Feed
                </button>
              </div>
            )}
          </div>

          {/* Feedback Banner */}
          {scannedFeedback && (
            <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 ${
              scannedFeedback.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {scannedFeedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{scannedFeedback.text}</span>
            </div>
          )}

          {/* Scanning Options Bar */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer font-semibold">
              <input
                type="checkbox"
                checked={continuousScan}
                onChange={(e) => setContinuousScan(e.target.checked)}
                className="accent-indigo-500 w-4 h-4 rounded"
              />
              <span>Continuous Scan Mode (Keep Camera Open)</span>
            </label>

            <span className="text-[10px] font-mono text-slate-500">Supported: EAN-13, CODE128, IMEI</span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Hardware USB Scanners run automatically in background</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg transition cursor-pointer"
          >
            Close Scanner
          </button>
        </div>

      </div>
    </div>
  );
};
