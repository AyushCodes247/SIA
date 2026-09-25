import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import type { ToolDefinition } from "../../tool.type.js";

const getFileInfoSchema = z.object({
  path: z.string().min(1),
});

type GetFileInfoInput = z.infer<typeof getFileInfoSchema>;

interface GetFileInfoOutput {
  path: string;
  name: string;
  type: "file" | "directory" | "other";
  size: number;
  createdAt: string;
  modifiedAt: string;
}

const getFileInfoTool: ToolDefinition<GetFileInfoInput, GetFileInfoOutput> = {
  name: "get_file_info",

  description:
    "Returns metadata about a file or directory inside the current working directory, including its type, size, creation time, and modification time.",

  category: "filesystem",

  inputSchema: getFileInfoSchema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not defined.",
        };
      }

      const workingDirectory = path.resolve(context.workingDirectory);

      const targetPath = path.resolve(workingDirectory, input.path);

      const relativePath = path.relative(workingDirectory, targetPath);

      if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        return {
          success: false,
          error: "Path is outside the working directory.",
        };
      }

      const stats = await fs.stat(targetPath);

      const type: "file" | "directory" | "other" = stats.isFile()
        ? "file"
        : stats.isDirectory()
          ? "directory"
          : "other";

      return {
        success: true,

        data: {
          path: relativePath || ".",
          name: path.basename(targetPath),
          type,
          size: stats.size,
          createdAt: stats.birthtime.toISOString(),
          modifiedAt: stats.mtime.toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to get file information.",
      };
    }
  },
};

export default getFileInfoTool;
