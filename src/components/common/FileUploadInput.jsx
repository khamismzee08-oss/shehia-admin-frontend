import { useEffect, useRef, useState } from "react";

/**
 * Lets staff either pick an existing file (photo or PDF) or take a photo
 * directly with the device camera, and hands the raw File back to the
 * parent via onChange. The parent attaches it to a FormData request (see
 * residentsApi.register in ../../api/api.js).
 *
 * "Take Photo" opens the REAL device camera (laptop webcam or phone camera)
 * via getUserMedia with a live preview, lets the user retake or confirm the
 * shot, then converts the captured frame into a normal `File` — so the rest
 * of the app (preview, size validation, FormData upload) works exactly as
 * it does for a picked file.
 *
 * If the browser/device has no camera support (or camera permission is
 * denied), this falls back to the device's native camera/file picker
 * (capture="environment") so the feature still degrades gracefully.
 *
 * Usage:
 *   const [idDocument, setIdDocument] = useState(null);
 *   <FileUploadInput label="ID document" onChange={setIdDocument} />
 */
export default function FileUploadInput({
  label,
  helpText,
  onChange,
  required = false,
  accept = "image/jpeg,image/png,image/webp,image/heic,application/pdf",
  maxSizeMb = 10,
}) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");

  // Live-camera modal state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [facingMode, setFacingMode] = useState("environment");
  const [multipleCameras, setMultipleCameras] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedUrl, setCapturedUrl] = useState(null);

  const handleFile = (selected) => {
    setError("");
    if (!selected) return;

    if (selected.size > maxSizeMb * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${maxSizeMb}MB.`);
      return;
    }

    setFile(selected);
    onChange?.(selected);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(selected.type.startsWith("image/") ? URL.createObjectURL(selected) : null);
  };

  const clear = () => {
    setFile(null);
    setError("");
    onChange?.(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  // ------------------------------------------------------------
  // Live camera (getUserMedia)
  // ------------------------------------------------------------

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const attachStream = (stream) => {
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  };

  const openCamera = async () => {
    setError("");
    setCameraError("");
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(null);
    setCapturedBlob(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      // Very old browser / non-secure context: fall back to the device's
      // native camera/file picker instead of a broken live preview.
      cameraInputRef.current?.click();
      return;
    }

    setCameraOpen(true);
    setFacingMode("environment");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      attachStream(stream);

      if (navigator.mediaDevices.enumerateDevices) {
        navigator.mediaDevices
          .enumerateDevices()
          .then((devices) => setMultipleCameras(devices.filter((d) => d.kind === "videoinput").length > 1))
          .catch(() => {});
      }
    } catch (err) {
      let msg = "Could not open the camera.";
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        msg = "Camera access was denied. Please allow camera access in your browser settings, then try again.";
      } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
        msg = "No camera was found on this device.";
      } else if (err?.name === "NotReadableError") {
        msg = "The camera is currently in use by another application.";
      }
      setCameraError(msg);
    }
  };

  const closeCamera = () => {
    stopStream();
    setCameraOpen(false);
    setCameraError("");
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(null);
    setCapturedBlob(null);
  };

  const flipCamera = async () => {
    if (!streamRef.current) return;
    const nextFacing = facingMode === "environment" ? "user" : "environment";
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: nextFacing } },
        audio: false,
      });
      setFacingMode(nextFacing);
      attachStream(stream);
    } catch {
      openCamera();
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        if (capturedUrl) URL.revokeObjectURL(capturedUrl);
        setCapturedBlob(blob);
        setCapturedUrl(URL.createObjectURL(blob));
      },
      "image/jpeg",
      0.92
    );
  };

  const retake = () => {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(null);
    setCapturedBlob(null);
  };

  const usePhoto = () => {
    if (!capturedBlob) return;
    const cameraFile = new File([capturedBlob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
    const fitsSizeLimit = cameraFile.size <= maxSizeMb * 1024 * 1024;
    handleFile(cameraFile);
    if (fitsSizeLimit) closeCamera();
  };

  const useNativeFallback = () => {
    closeCamera();
    cameraInputRef.current?.click();
  };

  useEffect(() => stopStream, []);

  const isFrontCamera = facingMode === "user";

  return (
    <div>
      {label && (
        <label className="form-label small fw-semibold">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      {!file && (
        <div className="d-flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="bi bi-upload me-1" />
            Choose File
          </button>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={openCamera}>
            <i className="bi bi-camera me-1" />
            Take Photo
          </button>
        </div>
      )}

      {file && (
        <div className="d-flex align-items-center gap-2 border rounded p-2 bg-white">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              style={{ height: 44, width: 44, objectFit: "cover", borderRadius: 4 }}
            />
          ) : (
            <i className="bi bi-file-earmark-text text-danger" style={{ fontSize: 28 }} />
          )}
          <span className="small text-truncate flex-grow-1">{file.name}</span>
          <button type="button" className="btn btn-sm btn-link text-danger p-0" onClick={clear}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="d-none"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {/* Fallback only: used when getUserMedia is unsupported/denied. On
          mobile this opens the device's own camera app; capture="environment"
          is ignored by desktop browsers, which is why the live getUserMedia
          camera below is the primary path. */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="d-none"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {helpText && !error && <div className="form-text">{helpText}</div>}
      {error && <div className="text-danger small mt-1">{error}</div>}

      {/* Live camera modal */}
      {cameraOpen && (
        <div
          className="modal-backdrop-custom"
          style={{ zIndex: 2100 }}
          onMouseDown={(e) => e.target === e.currentTarget && closeCamera()}
        >
          <div className="modal-card p-3" style={{ maxWidth: 460 }}>
            <div className="d-flex align-items-center mb-2">
              <h6 className="mb-0">Take Photo</h6>
              <button type="button" className="btn btn-light btn-sm ms-auto" onClick={closeCamera}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {cameraError ? (
              <div className="p-3 text-center">
                <div className="alert alert-warning small mb-3">{cameraError}</div>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={useNativeFallback}>
                  <i className="bi bi-upload me-1" />
                  Choose File Instead
                </button>
              </div>
            ) : (
              <div className="position-relative" style={{ background: "#000", borderRadius: 6, overflow: "hidden" }}>
                {capturedUrl ? (
                  <img src={capturedUrl} alt="Captured" style={{ width: "100%", display: "block" }} />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: "100%",
                      display: "block",
                      transform: isFrontCamera ? "scaleX(-1)" : "none",
                    }}
                  />
                )}
                {!capturedUrl && multipleCameras && (
                  <button
                    type="button"
                    className="btn btn-sm btn-light position-absolute"
                    style={{ top: 8, right: 8, opacity: 0.9 }}
                    onClick={flipCamera}
                    title="Switch camera"
                  >
                    <i className="bi bi-arrow-repeat" />
                  </button>
                )}
              </div>
            )}
            <canvas ref={canvasRef} className="d-none" />
            {error && <div className="text-danger small mt-2">{error}</div>}

            {!cameraError && (
              <div className="d-flex justify-content-center gap-2 mt-3">
                {capturedUrl ? (
                  <>
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={retake}>
                      <i className="bi bi-arrow-counterclockwise me-1" />
                      Retake
                    </button>
                    <button type="button" className="btn btn-shehia-primary btn-sm" onClick={usePhoto}>
                      <i className="bi bi-check-lg me-1" />
                      Use Photo
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn btn-shehia-primary btn-sm px-4" onClick={capturePhoto}>
                    <i className="bi bi-camera me-1" />
                    Capture
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
