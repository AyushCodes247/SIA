import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import type { ToolDefinition } from "../../tool.type.js";

const movePathSchema = z.object({
  source: z.string().min(1),
  destination: z.string().min(1),
});

type MovePathInput = z.infer<typeof movePathSchema>;

interface MovePathOutput {
  source: string;
  destination: string;
  type: "file" | "directory";
}

const movePathTool: ToolDefinition<MovePathInput, MovePathOutput> = {
  name: "move_path",

  description:
    "Moves or renames a file or directory inside the current working directory. The destination must not already exist.",

  category: "filesystem",

  inputSchema: movePathSchema,

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
          error: "The working directory cannot be moved.",
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

      await fs.rename(sourcePath, destinationPath);

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

        error: error instanceof Error ? error.message : "Failed to move path.",
      };
    }
  },
};

export default movePathTool;
