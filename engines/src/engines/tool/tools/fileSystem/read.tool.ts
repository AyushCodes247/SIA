import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import type { ToolDefinition } from "../../tool.type.js";

const readFileSchema = z.object({
  path: z.string().min(1),
});

type ReadFileInput = z.infer<typeof readFileSchema>;

interface ReadFileOutput {
  path: string;
  content: string;
}

const readFileTool: ToolDefinition<ReadFileInput, ReadFileOutput> = {
  name: "read_file",

  description:
    "Reads the text content of a file inside the current working directory.",

  category: "filesystem",

  inputSchema: readFileSchema,

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

      const stats = await fs.stat(filePath);

      if (!stats.isFile()) {
        return {
          success: false,
          error: "The requested path is not a file.",
        };
      }

      const content = await fs.readFile(filePath, "utf-8");

      return {
        success: true,
        data: {
          path: relativePath || path.basename(filePath),
          content,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to read file.",
      };
    }
  },
};

export default readFileTool;
