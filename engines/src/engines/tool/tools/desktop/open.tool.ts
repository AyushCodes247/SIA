import { execFile } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { promisify } from "util";
import { randomUUID } from "crypto";
import { boolean, z } from "zod";
import type { ToolDefinition } from "../../tool.type.js";
import { OpenIdProviderDiscoveryMetadataSchema } from "@modelcontextprotocol/sdk/shared/auth";

const execFileAsync = promisify(execFile);

const openApplicationSchema = z.object({
  application: z.string().min(1),
  opened: z.boolean(),
});

type OpenApplicationInput = z.infer<typeof openApplicationSchema>;

interface OpenApplicationOutput {
  application: string;
  opened: boolean;
}

const OpenApplicationTool: ToolDefinition<
  OpenApplicationInput,
  OpenApplicationOutput
> = {
  name: "open_application",

  description:
    "Opens an installed application on macOS using its application name.",

  category: "desktop",

  inputSchema: openApplicationSchema,

  async execute(input) {
    try {
      if (process.platform !== "darwin") {
        return {
          success: false,
          error: "The open_application tool currently supports macOS only.",
        };
      }

      const application = input.application.trim();

      if (!application) {
        return {
          success: false,
          error: "Application name cannot be empty.",
        };
      }

      await execFileAsync("open", ["-a", application]);

      return {
        success: true,

        data: {
          application,
          opened: true,
        },
      };
    } catch (error) {
      return {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to open application.",
      };
    }
  },
};

export default OpenApplicationTool;