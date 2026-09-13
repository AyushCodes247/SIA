import { PDFParse } from "pdf-parse";
import { v4 } from "uuid";
import { pool } from "@schemas/vector.js";
import { embedText } from "./embedding.pipe.js";

function chunkText(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50,
) {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end).trim());
    start += chunkSize - overlap;
  }

  return chunks.filter((chunk) => chunk.length > 50);
}

export async function ingestDocument(filePath: string, filename: string) {
  const parser = new PDFParse({ url: filePath });
  const { text } = await parser.getText();
  const chunks = chunkText(text);

  console.info(`Processing ${chunks.length} chunks from ${filename}`);

  for (const chunk of chunks) {
    const embedding = await embedText(chunk);

    await pool.query(
      `INSERT INTO documents (id, content, embedding, created_at)
       VALUES ($1, $2, $3, $4::vector)`,
      [v4(), chunk, JSON.stringify(embedding), Date.now()],
    );
  }

  return chunks.length;
}
