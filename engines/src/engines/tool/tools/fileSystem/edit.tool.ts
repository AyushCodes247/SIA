import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import type { ToolDefinition } from "../../tool.type.js";

const editFileSchema = z.object({
  path: z.string().min(1),
  oldText: z.string().min(1),
  newText: z.string(),
});

type EditFileInput = z.infer<typeof editFileSchema>;

interface EditFileOutput {
  path: string;
  replacements: number;
}

const editFileTool: ToolDefinition<EditFileInput, EditFileOutput> = {
  name: "edit_file",

  description:
    "Edits an existing text file by replacing one exact, uniquely occurring text segment with new text.",

  category: "filesystem",

  inputSchema: editFileSchema,

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

      const occurrences = content.split(input.oldText).length - 1;

      if (occurrences === 0) {
        return {
          success: false,
          error: "The text to replace was not found in the file.",
        };
      }

      if (occurrences > 1) {
        return {
          success: false,
          error:
            "The text to replace occurs multiple times. Provide a more specific text segment.",
        };
      }

      const updatedContent = content.replace(input.oldText, input.newText);

      await fs.writeFile(filePath, updatedContent, "utf-8");

      return {
        success: true,

        data: {
          path: relativePath,
          replacements: 1,
        },
      };
    } catch (error) {
      return {
        success: false,

        error: error instanceof Error ? error.message : "Failed to edit file.",
      };
    }
  },
};

export default editFileTool;
