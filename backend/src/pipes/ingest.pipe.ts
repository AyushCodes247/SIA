import { PDFParse } from "pdf-parse";
import { v4 as UUID } from "uuid";
import vectorDB from "@/vector.js";
import { docChunks } from "@schemas/vector.schema.js";
import { embedText } from "./embedding.pipe.js";

function chunkText(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50,
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);

    const chunk = text.slice(start, end).trim();

    if (chunk.length > 50) {
      chunks.push(chunk);
    }

    start += chunkSize - overlap;
  }

  return chunks;
}

export async function ingestDocument(
  filePath: string,
  fileName: string,
  documentId: string,
  mimeType: string,
) {
  const parser = new PDFParse({
    url: filePath,
  });

  try {
    const { text } = await parser.getText();

    const chunks = chunkText(text);

    console.info(`Processing ${chunks.length} chunks from ${fileName}`);

    for (let index = 0; index <= chunks.length; index++) {
      const chunk = chunks[index];

      if (!chunk) continue;

      const embedding = await embedText(chunk);

      await vectorDB.insert(docChunks).values([
        {
          id: UUID(),
          documentId,
          content: chunk,
          embedding,
          metadata: {
            fileName,
            mimeType,
            chunkIndex: index,
          },
        },
      ]);
    }

    return chunks.length;
  } catch (error) {
    console.error("Error while ingesting document:", error);
    throw new Error("Error in ingestion.");
  } finally {
    await parser.destroy();
  }
}
