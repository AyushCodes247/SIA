import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import type { ToolDefinition } from "../../tool.type.js";

const searchFilesSchema = z.object({
  query: z.string().min(1),
  path: z.string().default("."),
  maxResults: z.number().int().min(1).max(100).default(50),
});

type SearchFilesInput = z.infer<typeof searchFilesSchema>;

interface SearchResult {
  path: string;
  type: "file" | "directory";
}

interface SearchFilesOutput {
  query: string;
  searchPath: string;
  results: SearchResult[];
  count: number;
  truncated: boolean;
}

const searchFilesTool: ToolDefinition<SearchFilesInput, SearchFilesOutput> = {
  name: "search_files",

  description:
    "Recursively searches for files and directories by name inside the current working directory.",

  category: "filesystem",

  inputSchema: searchFilesSchema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not defined.",
        };
      }

      const workingDirectory = path.resolve(context.workingDirectory);

      const searchRoot = path.resolve(workingDirectory, input.path);

      const relativeSearchRoot = path.relative(workingDirectory, searchRoot);

      if (
        relativeSearchRoot.startsWith("..") ||
        path.isAbsolute(relativeSearchRoot)
      ) {
        return {
          success: false,
          error: "Search path is outside the working directory.",
        };
      }

      const stats = await fs.stat(searchRoot);

      if (!stats.isDirectory()) {
        return {
          success: false,
          error: "The search path is not a directory.",
        };
      }

      const results: SearchResult[] = [];

      let truncated = false;

      const search = async (directory: string): Promise<void> => {
        if (results.length >= input.maxResults) {
          truncated = true;
          return;
        }

        const entries = await fs.readdir(directory, {
          withFileTypes: true,
        });

        const DEFAULT_IGNORED_DIRECTORIES = new Set([
          "node_modules",
          ".git",
          "dist",
          "build",
          "coverage",
          ".next",
        ]);

        for (const entry of entries) {
          if (results.length >= input.maxResults) {
            truncated = true;
            return;
          }

          if (
            entry.isDirectory() &&
            DEFAULT_IGNORED_DIRECTORIES.has(entry.name)
          ) {
            continue;
          }

          const absolutePath = path.join(directory, entry.name);

          const relativePath = path.relative(workingDirectory, absolutePath);

          if (entry.name.toLowerCase().includes(input.query.toLowerCase())) {
            if (entry.isFile() || entry.isDirectory()) {
              results.push({
                path: relativePath,
                type: entry.isDirectory() ? "directory" : "file",
              });
            }
          }

          if (entry.isDirectory()) {
            await search(absolutePath);
          }
        }
      };

      await search(searchRoot);

      return {
        success: true,

        data: {
          query: input.query,
          searchPath: relativeSearchRoot || ".",
          results,
          count: results.length,
          truncated,
        },
      };
    } catch (error) {
      return {
        success: false,

        error:
          error instanceof Error ? error.message : "Failed to search files.",
      };
    }
  },
};

export default searchFilesTool;
