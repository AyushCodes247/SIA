import { spawn, type ChildProcessWithoutNullStreams } from "child_process";
import { createInterface, type Interface } from "readline";
import env from "@configs/env.config.js";

type MouseButton = "left" | "right";

interface MouseResponse {
  success: boolean;
  width?: number;
  height?: number;
  error?: string;
}

interface PendingRequest {
  resolve: (response: MouseResponse) => void;
  reject: (error: Error) => void;
}

class MouseService {
  private process: ChildProcessWithoutNullStreams | null = null;
  private readline: Interface | null = null;
  private pendingRequests: PendingRequest[] = [];

  private readonly helperPath = env.NATIVE_PACKAGE_PATH;

  private ensureProcess(): void {
    if (this.process) return;

    this.process = spawn(this.helperPath, [], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    this.readline = createInterface({
      input: this.process.stdout,
    });

    this.readline.on("line", (line) => {
      this.handleResponse(line);
    });

    this.process.stderr.on("data", (data) => {
      console.error(`[SIA_Mouse] ${data.toString().trim()}`);
    });

    this.process.on("exit", () => {
      this.process = null;
      this.readline?.close();
      this.readline = null;

      const pending = this.pendingRequests.splice(0);

      for (const request of pending) {
        request.reject(new Error("Native mouse helper process exited."));
      }
    });

    this.process.on("error", (error) => {
      this.process = null;
      this.readline?.close();
      this.readline = null;

      const pending = this.pendingRequests.splice(0);

      for (const request of pending) {
        request.reject(error);
      }
    });
  }

  async move(x: number, y: number): Promise<void> {
    this.validateCoordinate(x, "x");
    this.validateCoordinate(y, "y");

    await this.send({
      type: "move",
      x,
      y,
    });
  }

  async click(button: MouseButton = "left"): Promise<void> {
    await this.send({
      type: "click",
      button,
    });
  }

  async mouseDown(button: MouseButton = "left"): Promise<void> {
    await this.send({
      type: "down",
      button,
    });
  }

  async mouseUp(button: MouseButton = "left"): Promise<void> {
    await this.send({
      type: "up",
      button,
    });
  }

  async getScreenSize(): Promise<{
    width: number;
    height: number;
  }> {
    const response = await this.send({
      type: "screen_size",
    });

    if (
      typeof response.width !== "number" ||
      typeof response.height !== "number"
    ) {
      throw new Error("Native mouse helper returned invalid screen size.");
    }

    return {
      width: response.width,
      height: response.height,
    };
  }

  stop(): void {
    if (!this.process) return;

    this.process.kill();
    this.process = null;

    this.readline?.close();
    this.readline = null;
  }

  private send(command: Record<string, unknown>): Promise<MouseResponse> {
    this.ensureProcess();

    return new Promise((resolve, reject) => {
      this.pendingRequests.push({
        resolve,
        reject,
      });

      try {
        this.process?.stdin.write(`${JSON.stringify(command)}\n`);
      } catch (error) {
        this.pendingRequests.pop();

        reject(
          error instanceof Error
            ? error
            : new Error("Failed to send mouse command."),
        );
      }
    });
  }

  private handleResponse(line: string): void {
    try {
      const response = JSON.parse(line) as MouseResponse;
      const request = this.pendingRequests.shift();

      if (!request) return;

      if (response.success) {
        request.resolve(response);
      } else {
        request.reject(
          new Error(response.error ?? "Native mouse command failed."),
        );
      }
    } catch (error) {
      const request = this.pendingRequests.shift();

      if (!request) return;

      request.reject(
        error instanceof Error
          ? error
          : new Error("Invalid response from native mouse helper."),
      );
    }
  }

  private validateCoordinate(value: number, name: string): void {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(`Mouse ${name} coordinate must be between 0 and 1.`);
    }
  }
}

export default new MouseService();
