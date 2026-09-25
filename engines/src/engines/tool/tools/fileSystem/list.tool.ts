import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import type { ToolDefinition } from "../../tool.type.js";

const listDirectorySchema = z.object({
  path: z.string(),
});

type ListDirectoryInput = z.infer<typeof listDirectorySchema>;

interface DirectoryEntry {
  name: string;
  type: "file" | "directory" | "other";
}

interface ListDirectoryOutput {
  path: string;
  entries: DirectoryEntry[];
}

const listDirectoryTool: ToolDefinition<
  ListDirectoryInput,
  ListDirectoryOutput
> = {
  name: "list_directory",

  description:
    "Lists files and directories inside a directory within the current working directory.",

  category: "filesystem",

  inputSchema: listDirectorySchema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not defined.",
        };
      }

      const workingDirectory = path.resolve(context.workingDirectory);

      const directoryPath = path.resolve(workingDirectory, input.path || ".");

      const relativePath = path.relative(workingDirectory, directoryPath);

      if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        return {
          success: false,
          error: "Directory path is outside the working directory.",
        };
      }

      const stats = await fs.stat(directoryPath);

      if (!stats.isDirectory()) {
        return {
          success: false,
          error: "The requested path is not a directory.",
        };
      }

      const directoryEntries = await fs.readdir(directoryPath, {
        withFileTypes: true,
      });

      const entries: DirectoryEntry[] = directoryEntries.map((entry) => ({
        name: entry.name,

        type: entry.isFile()
          ? "file"
          : entry.isDirectory()
            ? "directory"
            : "other",
      }));

      return {
        success: true,

        data: {
          path: relativePath || ".",
          entries,
        },
      };
    } catch (error) {
      return {
        success: false,

        error:
          error instanceof Error ? error.message : "Failed to list directory.",
      };
    }
  },
};

export default listDirectoryTool;
