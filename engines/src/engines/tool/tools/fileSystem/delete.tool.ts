import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import type { ToolDefinition } from "../../tool.type.js";

const deletePathSchema = z.object({
  path: z.string().min(1),
  recursive: z.boolean().default(false),
});

type DeletePathInput = z.infer<typeof deletePathSchema>;

interface DeletePathOutput {
  path: string;
  type: "file" | "directory";
}

const deletePathTool: ToolDefinition<DeletePathInput, DeletePathOutput> = {
  name: "delete_path",

  description:
    "Deletes a file or directory inside the current working directory. Non-empty directories require recursive to be true.",

  category: "filesystem",

  inputSchema: deletePathSchema,

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

      // Never allow deletion of the working directory itself.
      if (relativePath === "") {
        return {
          success: false,
          error: "The working directory cannot be deleted.",
        };
      }

      const stats = await fs.stat(targetPath);

      if (stats.isFile()) {
        await fs.unlink(targetPath);

        return {
          success: true,
          data: {
            path: relativePath,
            type: "file",
          },
        };
      }

      if (stats.isDirectory()) {
        if (input.recursive) {
          await fs.rm(targetPath, {
            recursive: true,
            force: false,
          });
        } else {
          await fs.rmdir(targetPath);
        }

        return {
          success: true,
          data: {
            path: relativePath,
            type: "directory",
          },
        };
      }

      return {
        success: false,
        error: "The requested path is neither a regular file nor a directory.",
      };
    } catch (error) {
      return {
        success: false,

        error:
          error instanceof Error ? error.message : "Failed to delete path.",
      };
    }
  },
};

export default deletePathTool;
