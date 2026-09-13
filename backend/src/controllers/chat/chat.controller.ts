import { asyncHandler } from "@utils/essential.util.js";
import { ingestDocument } from "@pipes/ingest.pipe.js";

const chat = asyncHandler(async (req, res) => {
  const { query } = req.body;
  const files = req.files as {
    file?: Express.Multer.File[];
    image?: Express.Multer.File[];
  };

  if (files?.file) {
    for (const file of files.file ?? []) {
      const count = await ingestDocument(file.path, file.filename);
    }
  }

  if (files?.image) {
    for (const image of files.image ?? []) {
    }
  }
});

export default chat;
