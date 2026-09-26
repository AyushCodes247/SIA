import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";

import type { ToolDefinition } from "../../tool.type.js";

const execFileAsync = promisify(execFile);

const specialKeySchema = z.enum([
  "enter",
  "tab",
  "escape",
  "space",
  "backspace",
  "delete",
  "up",
  "down",
  "left",
  "right",
  "home",
  "end",
  "page_up",
  "page_down",
]);

const modifierSchema = z.enum(["command", "control", "option", "shift"]);

const keyboardSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("type"),
    text: z.string().min(1).max(10_000),
  }),

  z.object({
    action: z.literal("press"),
    key: specialKeySchema,
  }),

  z.object({
    action: z.literal("hotkey"),
    key: z.string().trim().min(1).max(1),
    modifiers: z.array(modifierSchema).min(1).max(4),
  }),
]);

type KeyboardInput = z.infer<typeof keyboardSchema>;

interface KeyboardOutput {
  action: KeyboardInput["action"];
  executed: boolean;
}

const KEY_CODES: Record<z.infer<typeof specialKeySchema>, number> = {
  enter: 36,
  tab: 48,
  escape: 53,
  space: 49,

  backspace: 51,
  delete: 117,

  left: 123,
  right: 124,
  down: 125,
  up: 126,

  home: 115,
  end: 119,

  page_up: 116,
  page_down: 121,
};

const keyboardTool: ToolDefinition<KeyboardInput, KeyboardOutput> = {
  name: "keyboard",

  description:
    "Performs keyboard actions in the currently focused macOS application. Can type text, press supported special keys, and execute keyboard shortcuts.",

  category: "desktop",

  inputSchema: keyboardSchema,

  async execute(input) {
    try {
      if (process.platform !== "darwin") {
        return {
          success: false,
          error: "The keyboard tool currently supports macOS only.",
        };
      }

      switch (input.action) {
        case "type":
          await typeText(input.text);
          break;

        case "press":
          await pressKey(input.key);
          break;

        case "hotkey":
          await pressHotkey(input.key, input.modifiers);
          break;
      }

      return {
        success: true,
        data: {
          action: input.action,
          executed: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to execute keyboard action.",
      };
    }
  },
};

const typeText = async (text: string): Promise<void> => {
  const script = `
    on run argv
      tell application "System Events"
        keystroke (item 1 of argv)
      end tell
    end run
  `;

  await execFileAsync("osascript", ["-e", script, text]);
};

const pressKey = async (key: keyof typeof KEY_CODES): Promise<void> => {
  const keyCode = KEY_CODES[key];

  const script = `
    tell application "System Events"
      key code ${keyCode}
    end tell
  `;

  await execFileAsync("osascript", ["-e", script]);
};

const pressHotkey = async (
  key: string,
  modifiers: Array<"command" | "control" | "option" | "shift">,
): Promise<void> => {
  const appleScriptModifiers = modifiers.map((modifier) => {
    switch (modifier) {
      case "command":
        return "command down";

      case "control":
        return "control down";

      case "option":
        return "option down";

      case "shift":
        return "shift down";
    }
  });

  const script = `
    on run argv
      tell application "System Events"
        keystroke (item 1 of argv) using {${appleScriptModifiers.join(", ")}}
      end tell
    end run
  `;

  await execFileAsync("osascript", ["-e", script, key]);
};

export default keyboardTool;
