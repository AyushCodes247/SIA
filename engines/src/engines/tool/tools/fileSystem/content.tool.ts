import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import type { ToolDefinition } from "../../tool.type.js";

const searchContentSchema = z.object({
  query: z.string().min(1),
  path: z.string().default("."),
  caseSensitive: z.boolean().default(false),
  maxResults: z.number().int().min(1).max(100).default(50),
});

type SearchContentInput = z.infer<typeof searchContentSchema>;

interface SearchContentMatch {
  path: string;
  line: number;
  content: string;
}

interface SearchContentOutput {
  query: string;
  searchPath: string;
  matches: SearchContentMatch[];
  count: number;
  truncated: boolean;
}

const DEFAULT_IGNORED_DIRECTORIES = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
]);

const searchContentTool: ToolDefinition<
  SearchContentInput,
  SearchContentOutput
> = {
  name: "search_content",

  description:
    "Recursively searches the contents of text files inside the current working directory and returns matching file paths, line numbers, and matching lines.",

  category: "filesystem",

  inputSchema: searchContentSchema,

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

      const matches: SearchContentMatch[] = [];
      let truncated = false;

      const searchFile = async (filePath: string): Promise<void> => {
        if (matches.length >= input.maxResults) {
          truncated = true;
          return;
        }

        let content: string;

        try {
          content = await fs.readFile(filePath, "utf-8");
        } catch {
          return;
        }

        // Basic binary-file protection.
        if (content.includes("\u0000")) {
          return;
        }

        const lines = content.split(/\r?\n/);

        const searchQuery = input.caseSensitive
          ? input.query
          : input.query.toLowerCase();

        for (let index = 0; index < lines.length; index++) {
          if (matches.length >= input.maxResults) {
            truncated = true;
            return;
          }

          const line = lines[index] ?? "";

          const searchableLine = input.caseSensitive
            ? line
            : line.toLowerCase();

          if (searchableLine.includes(searchQuery)) {
            matches.push({
              path: path.relative(workingDirectory, filePath),
              line: index + 1,
              content: line,
            });
          }
        }
      };

      const searchDirectory = async (directory: string): Promise<void> => {
        if (matches.length >= input.maxResults) {
          truncated = true;
          return;
        }

        const entries = await fs.readdir(directory, {
          withFileTypes: true,
        });

        for (const entry of entries) {
          if (matches.length >= input.maxResults) {
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

          if (entry.isDirectory()) {
            await searchDirectory(absolutePath);
            continue;
          }

          if (entry.isFile()) {
            await searchFile(absolutePath);
          }
        }
      };

      if (stats.isFile()) {
        await searchFile(searchRoot);
      } else if (stats.isDirectory()) {
        await searchDirectory(searchRoot);
      } else {
        return {
          success: false,
          error: "The search path must be a file or directory.",
        };
      }

      return {
        success: true,

        data: {
          query: input.query,
          searchPath: relativeSearchRoot || ".",
          matches,
          count: matches.length,
          truncated,
        },
      };
    } catch (error) {
      return {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to search file contents.",
      };
    }
  },
};

export default searchContentTool;
