import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import type { ToolDefinition } from "../../tool.type.js";

const writeFileSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
});

type WriteFileInput = z.infer<typeof writeFileSchema>;

interface WriteFileOutput {
  path: string;
  bytesWritten: number;
  created: boolean;
}

const writeFileTool: ToolDefinition<WriteFileInput, WriteFileOutput> = {
  name: "write_file",

  description:
    "Creates or overwrites a text file inside the current working directory.",

  category: "filesystem",

  inputSchema: writeFileSchema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not defined.",
        };
      }

      const workingDirectory = path.resolve(context.workingDirectory);

      const filePath = path.resolve(workingDirectory, input.path);

      const relativePath = path.relative(workingDirectory, filePath);

      if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        return {
          success: false,
          error: "File path is outside the working directory.",
        };
      }

      let created = false;

      try {
        const stats = await fs.stat(filePath);

        if (!stats.isFile()) {
          return {
            success: false,
            error: "The requested path is not a file.",
          };
        }
      } catch (error) {
        const nodeError = error as NodeJS.ErrnoException;

        if (nodeError.code === "ENOENT") {
          created = true;
        } else {
          throw error;
        }
      }

      await fs.writeFile(filePath, input.content, "utf-8");

      return {
        success: true,

        data: {
          path: relativePath,
          bytesWritten: Buffer.byteLength(input.content, "utf-8"),
          created,
        },
      };
    } catch (error) {
      return {
        success: false,

        error: error instanceof Error ? error.message : "Failed to write file.",
      };
    }
  },
};

export default writeFileTool;
