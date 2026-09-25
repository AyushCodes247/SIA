import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import type { ToolDefinition } from "../../tool.type.js";

const copyPathSchema = z.object({
  source: z.string().min(1),
  destination: z.string().min(1),
});

type CopyPathInput = z.infer<typeof copyPathSchema>;

interface CopyPathOutput {
  source: string;
  destination: string;
  type: "file" | "directory";
}

const copyPathTool: ToolDefinition<CopyPathInput, CopyPathOutput> = {
  name: "copy_path",

  description:
    "Copies a file or directory inside the current working directory. The destination must not already exist.",

  category: "filesystem",

  inputSchema: copyPathSchema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not defined.",
        };
      }

      const workingDirectory = path.resolve(context.workingDirectory);

      const sourcePath = path.resolve(workingDirectory, input.source);

      const destinationPath = path.resolve(workingDirectory, input.destination);

      const relativeSource = path.relative(workingDirectory, sourcePath);

      const relativeDestination = path.relative(
        workingDirectory,
        destinationPath,
      );

      if (relativeSource.startsWith("..") || path.isAbsolute(relativeSource)) {
        return {
          success: false,
          error: "Source path is outside the working directory.",
        };
      }

      if (
        relativeDestination.startsWith("..") ||
        path.isAbsolute(relativeDestination)
      ) {
        return {
          success: false,
          error: "Destination path is outside the working directory.",
        };
      }

      if (relativeSource === "") {
        return {
          success: false,
          error: "The working directory cannot be copied.",
        };
      }

      const sourceStats = await fs.stat(sourcePath);

      if (!sourceStats.isFile() && !sourceStats.isDirectory()) {
        return {
          success: false,
          error: "The source path is neither a regular file nor a directory.",
        };
      }

      try {
        await fs.stat(destinationPath);

        return {
          success: false,
          error: "The destination path already exists.",
        };
      } catch (error) {
        const nodeError = error as NodeJS.ErrnoException;

        if (nodeError.code !== "ENOENT") {
          throw error;
        }
      }

      if (sourceStats.isFile()) {
        await fs.copyFile(sourcePath, destinationPath);
      } else {
        await fs.cp(sourcePath, destinationPath, {
          recursive: true,
          errorOnExist: true,
          force: false,
        });
      }

      return {
        success: true,

        data: {
          source: relativeSource,
          destination: relativeDestination,
          type: sourceStats.isDirectory() ? "directory" : "file",
        },
      };
    } catch (error) {
      return {
        success: false,

        error: error instanceof Error ? error.message : "Failed to copy path.",
      };
    }
  },
};

export default copyPathTool;
