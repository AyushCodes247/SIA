export interface CameraOptions {
  facingMode?: "user" | "environment";

  width?: number;

  height?: number;

  frameRate?: number;
}

class CameraService {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  isSupported(): boolean {
    return Boolean(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia,
    );
  }

  async start(
    videoElement: HTMLVideoElement,
    options: CameraOptions = {},
  ): Promise<MediaStream> {
    if (!this.isSupported()) {
      throw new Error("Camera access is not supported in this browser.");
    }

    if (this.stream) {
      this.stop();
    }

    const {
      facingMode = "user",
      width = 1280,
      height = 720,
      frameRate = 30,
    } = options;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: {
            ideal: width,
          },
          height: {
            ideal: height,
          },
          frameRate: {
            ideal: frameRate,
          },
        },

        audio: false,
      });

      this.stream = stream;
      this.videoElement = videoElement;

      videoElement.srcObject = stream;

      /*
       * Useful for hand-controlled interaction because the
       * camera behaves like a mirror.
       */
      videoElement.playsInline = true;
      videoElement.muted = true;

      await videoElement.play();

      return stream;
    } catch (error) {
      this.cleanup();

      throw new Error(this.getCameraErrorMessage(error), {
        cause: error,
      });
    }
  }

  stop(): void {
    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        track.stop();
      }
    }
  }

  pause(): void {
    const videoTrack = this.getVideoTrack();

    if (videoTrack) {
      videoTrack.enabled = false;
    }
  }

  resume(): void {
    const videoTrack = this.getVideoTrack();

    if (videoTrack) {
      videoTrack.enabled = true;
    }
  }

  isActive(): boolean {
    const videoTrack = this.getVideoTrack();

    if (!videoTrack) {
      return false;
    }

    return videoTrack.readyState === "live" && videoTrack.enabled;
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  getVideoTrack(): MediaStreamTrack | null {
    if (!this.stream) {
      return null;
    }

    return this.stream.getVideoTracks()[0] ?? null;
  }

  getSettings(): MediaTrackSettings | null {
    const videoTrack = this.getVideoTrack();

    if (!videoTrack) {
      return null;
    }

    return videoTrack.getSettings();
  }

  private cleanup(): void {
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.srcObject = null;
    }

    this.stream = null;
    this.videoElement = null;
  }

  private getCameraErrorMessage(error: unknown): string {
    if (!(error instanceof DOMException)) {
      return "Unable to access the camera.";
    }

    switch (error.name) {
      case "NotAllowedError":
        return "Camera permission was denied.";

      case "NotFoundError":
        return "No camera was found.";

      case "NotReadableError":
        return "The camera is already in use or cannot be accessed.";

      case "OverconstrainedError":
        return "The requested camera configuration is not supported.";

      case "SecurityError":
        return "Camera access was blocked by the browser.";

      case "AbortError":
        return "Camera access was interrupted.";

      default:
        return error.message || "Unable to access the camera.";
    }
  }
}

export default new CameraService();
