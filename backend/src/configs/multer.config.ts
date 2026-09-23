import multer, { type FileFilterCallback } from "multer";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import type { Request } from "express";

import env from "@configs/env.config.js";
import { AppError } from "@utils/essential.util.js";

const uploadPath = env.UPLOAD_PATH;

const MAX_FILE_SIZE = 50 * 1024 * 1024;

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadPath);
  },

  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;

    cb(null, fileName);
  },
});

const allowedMimeTypes = new Set([
  "application/pdf",

  "image/jpeg",
  "image/png",
  "image/webp",

  "text/plain",
  "text/markdown",
]);

const fileFilter: multer.Options["fileFilter"] = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return cb(
      new AppError(
        "Only PDF, PNG, JPEG, WEBP, TXT and MD files are allowed.",
        400,
      ),
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,

  fileFilter,

  limits: {
    files: 1,
    fileSize: MAX_FILE_SIZE,
  },
});

export default upload;
