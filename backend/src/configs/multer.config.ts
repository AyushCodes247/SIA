import multer, { type FileFilterCallback } from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";

import env from "@configs/env.config.js";
import { AppError } from "@utils/essential.util.js";
import type { Request } from "express";

const uploadPath = env.UPLOAD_PATH;

console.log(uploadPath)

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, uploadPath);
  },

  filename: (req: Request, file: Express.Multer.File, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;

    cb(null, fileName);
  },
});

const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

const fileFilter: multer.Options["fileFilter"] = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new AppError("Only PDF, PNG and JPEG images and files are allowed.", 400),
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 2,
    fileSize : 20 * 1024 * 1024
  },
});

export default upload;