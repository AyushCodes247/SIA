import { v4 as UUID } from "uuid";
import vectorDB from "@/vector.js";
import { docChunks } from "@schemas/vector.schema.js";
import { embedText } from "./embedding.pipe.js";
import { extractPdfText } from "./pdf.pipe.js";
import { extractImageContent } from "./image.pipe.js";

export async function ingestDocument(
  filePath: string,
  fileName: string,
  documentId: string,
  mimeType: string,
): Promise<number> {
  try {
    let chunks: string[];

    if (mimeType === "application/pdf") {
      chunks = await extractPdfText(filePath);
    } else if (mimeType.startsWith("image/")) {
      const imageContent = await extractImageContent(filePath);

      chunks = [imageContent];
    } else {
      throw new Error(`Unsupported file type for RAG ingestion: ${mimeType}`);
    }

    if (chunks.length === 0) {
      throw new Error(`No content extracted from ${fileName}.`);
    }

    console.info(`Processing ${chunks.length} chunks from ${fileName}`);

    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index];

      if (!chunk) {
        continue;
      }

      const embedding = await embedText(chunk);

      console.log("Embedding lengths:", embedding.length);

      await vectorDB.insert(docChunks).values({
        id: UUID(),
        documentId,
        content: chunk,
        embedding,
        metadata: {
          type: mimeType === "application/pdf" ? "pdf" : "image",
          fileName,
          mimeType,
          chunkIndex: index,
        },
      });
    }

    return chunks.length;
  } catch (error) {
    console.error(`Error while ingesting document "${fileName}":`, error);

    throw new Error("Error in document ingestion.");
  }
}
