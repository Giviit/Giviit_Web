import { useEffect, useRef, useState } from 'react';
import { MdClose, MdCameraAlt, MdReplay, MdCheck, MdUploadFile } from 'react-icons/md';

export default function CameraCaptureModal({ open, onClose, onCapture, onFallbackUpload, facingMode = 'user' }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [photo, setPhoto] = useState(null); // { blob, previewUrl }
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;

    setPhoto(null);
    setError(null);

    navigator.mediaDevices?.getUserMedia({ video: { facingMode }, audio: false })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setError('Camera access was denied or is unavailable on this device.'));

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [open, facingMode]);

  if (!open) return null;

  const handleClose = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (photo?.previewUrl) URL.revokeObjectURL(photo.previewUrl);
    onClose();
  };

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      setPhoto({ blob, previewUrl: URL.createObjectURL(blob) });
    }, 'image/jpeg', 0.92);
  };

  const handleRetake = () => {
    if (photo?.previewUrl) URL.revokeObjectURL(photo.previewUrl);
    setPhoto(null);
  };

  const handleUsePhoto = () => {
    const file = new File([photo.blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
    streamRef.current?.getTracks().forEach(t => t.stop());
    onCapture(file, photo.previewUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={handleClose} />
      <div className="relative bg-dark rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl">
        <button onClick={handleClose} className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center">
          <MdClose className="text-lg" />
        </button>

        <div className="relative aspect-square bg-black flex items-center justify-center">
          {error ? (
            <div className="text-center px-6">
              <MdCameraAlt className="text-4xl text-white/40 mx-auto mb-3" />
              <p className="text-white/80 text-sm">{error}</p>
            </div>
          ) : photo ? (
            <img src={photo.previewUrl} alt="Captured selfie" className="w-full h-full object-cover" />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
          )}
        </div>

        <div className="p-4 flex items-center justify-center gap-4">
          {error ? (
            <button
              type="button"
              onClick={() => { handleClose(); onFallbackUpload?.(); }}
              className="flex items-center gap-2 bg-white text-dark font-semibold px-5 py-2.5 rounded-xl text-sm"
            >
              <MdUploadFile /> Upload Photo Instead
            </button>
          ) : photo ? (
            <>
              <button type="button" onClick={handleRetake} className="flex items-center gap-2 bg-white/10 text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-white/20">
                <MdReplay /> Retake
              </button>
              <button type="button" onClick={handleUsePhoto} className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-primary/90">
                <MdCheck /> Use Photo
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleCapture}
              className="w-16 h-16 rounded-full bg-white border-4 border-white/30 flex items-center justify-center hover:scale-105 transition-transform"
              aria-label="Capture photo"
            >
              <span className="w-12 h-12 rounded-full bg-white border-2 border-dark" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
