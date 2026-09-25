import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import type { ToolDefinition } from "../../tool.type.js";

const createDirectorySchema = z.object({
  path: z.string().min(1),
  recursive: z.boolean().default(false),
});

type CreateDirectoryInput = z.infer<typeof createDirectorySchema>;

interface CreateDirectoryOutput {
  path: string;
  created: boolean;
}

const createDirectoryTool: ToolDefinition<
  CreateDirectoryInput,
  CreateDirectoryOutput
> = {
  name: "create_directory",

  description:
    "Creates a directory inside the current working directory. Set recursive to true when parent directories should also be created.",

  category: "filesystem",

  inputSchema: createDirectorySchema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not defined.",
        };
      }

      const workingDirectory = path.resolve(context.workingDirectory);
      const directoryPath = path.resolve(workingDirectory, input.path);

      const relativePath = path.relative(workingDirectory, directoryPath);

      if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        return {
          success: false,
          error: "Directory path is outside the working directory.",
        };
      }

      try {
        const stats = await fs.stat(directoryPath);

        if (stats.isDirectory()) {
          return {
            success: true,
            data: {
              path: relativePath,
              created: false,
            },
          };
        }

        return {
          success: false,
          error: "A file already exists at the requested directory path.",
        };
      } catch (error) {
        const nodeError = error as NodeJS.ErrnoException;

        if (nodeError.code !== "ENOENT") {
          throw error;
        }
      }

      await fs.mkdir(directoryPath, {
        recursive: input.recursive,
      });

      return {
        success: true,

        data: {
          path: relativePath,
          created: true,
        },
      };
    } catch (error) {
      return {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to create directory.",
      };
    }
  },
};

export default createDirectoryTool;
