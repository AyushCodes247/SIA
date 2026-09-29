import { spawn } from "node:child_process";
import { z } from "zod";

import type {
  ToolDefinition,
  ToolExecutionContext,
  ToolExecutionResult,
} from "../../tool.type.js";

const mouseMoveSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

const mouseClickSchema = z.object({
  button: z.enum(["left", "right"]).default("left"),
});

const mouseButtonSchema = z.object({
  button: z.enum(["left", "right"]).default("left"),
});

const mouseScreenSizeSchema = z.object({});

const mouseActionSchema = z.discriminatedUnion(
  "action",
  [
    z.object({
      action: z.literal("move"),
      x: z.number().min(0).max(1),
      y: z.number().min(0).max(1),
    }),

    z.object({
      action: z.literal("click"),
      button: z
        .enum(["left", "right"])
        .default("left"),
    }),

    z.object({
      action: z.literal("down"),
      button: z
        .enum(["left", "right"])
        .default("left"),
    }),

    z.object({
      action: z.literal("up"),
      button: z
        .enum(["left", "right"])
        .default("left"),
    }),
  ],
);

type MouseAction = z.infer<
  typeof mouseActionSchema
>;

const helperPath =
  process.env.SIA_MOUSE_HELPER_PATH;

class MouseTool {
  private process: ReturnType<
    typeof spawn
  > | null = null;

  private screenWidth = 0;
  private screenHeight = 0;

  async execute(
    action: MouseAction,
  ): Promise<ToolExecutionResult> {
    try {
      if (!helperPath) {
        return {
          success: false,
          error:
            "SIA_MOUSE_HELPER_PATH is not configured.",
        };
      }

      await this.ensureScreenSize();

      switch (action.action) {
        case "move":
          await this.move(
            action.x,
            action.y,
          );
          break;

        case "click":
          await this.click(
            action.button,
          );
          break;

        case "down":
          await this.buttonDown(
            action.button,
          );
          break;

        case "up":
          await this.buttonUp(
            action.button,
          );
          break;
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Mouse action failed.",
      };
    }
  }

  async destroy(): Promise<void> {
    if (!this.process) {
      return;
    }

    this.process.kill();
    this.process = null;
  }

  private async move(
    x: number,
    y: number,
  ): Promise<void> {
    const screenX =
      Math.round(
        x * this.screenWidth,
      );

    const screenY =
      Math.round(
        y * this.screenHeight,
      );

    await this.send({
      type: "move",
      x: screenX,
      y: screenY,
    });
  }

  private async click(
    button: "left" | "right",
  ): Promise<void> {
    await this.send({
      type: "click",
      button,
    });
  }

  private async buttonDown(
    button: "left" | "right",
  ): Promise<void> {
    await this.send({
      type: "down",
      button,
    });
  }

  private async buttonUp(
    button: "left" | "right",
  ): Promise<void> {
    await this.send({
      type: "up",
      button,
    });
  }

  private async ensureScreenSize(): Promise<void> {
    if (
      this.screenWidth > 0 &&
      this.screenHeight > 0
    ) {
      return;
    }

    const result =
      await this.send({
        type: "screen_size",
      });

    if (
      typeof result.width !== "number" ||
      typeof result.height !== "number"
    ) {
      throw new Error(
        "Unable to determine macOS screen size.",
      );
    }

    this.screenWidth = result.width;
    this.screenHeight = result.height;
  }

  private async send(
    payload: Record<string, unknown>,
  ): Promise<any> {
    if (!this.process) {
      this.process = spawn(
        helperPath!,
        [],
        {
          stdio: [
            "pipe",
            "pipe",
            "pipe",
          ],
        },
      );
    }

    return new Promise(
      (resolve, reject) => {
        const process =
          this.process;

        if (!process?.stdin) {
          reject(
            new Error(
              "Mouse helper is unavailable.",
            ),
          );

          return;
        }

        const request =
          `${JSON.stringify(payload)}\n`;

        process.stdin.write(
          request,
        );

        const onData = (
          data: Buffer,
        ) => {
          try {
            const response =
              JSON.parse(
                data.toString(),
              );

            process.stdout?.off(
              "data",
              onData,
            );

            resolve(response);
          } catch {
            reject(
              new Error(
                "Invalid response from mouse helper.",
              ),
            );
          }
        };

        process.stdout?.on(
          "data",
          onData,
        );

        process.once(
          "error",
          reject,
        );

        process.once(
          "exit",
          () => {
            this.process = null;
          },
        );
      },
    );
  }
}

const mouseTool: ToolDefinition<
  MouseAction
> = {
  name: "mouse",
  description:
    "Controls the macOS mouse cursor using normalized screen coordinates. Supports cursor movement, left/right click, mouse button press, and mouse button release.",
  category: "desktop",
  inputSchema: mouseActionSchema,

  async execute(
    input,
    _context: ToolExecutionContext,
  ): Promise<ToolExecutionResult> {
    return mouseService.execute(
      input,
    );
  },
};

const mouseService =
  new MouseTool();

export default mouseTool;