import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer";
import status from "http-status";

const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const MAX_BYTES = 5 * 1024 * 1024;

export const EVENT_UPLOAD_SUBDIR = path.join("uploads", "events");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), EVENT_UPLOAD_SUBDIR);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = MIME_EXT[file.mimetype] ?? "";
    cb(null, `${randomUUID()}${ext}`);
  },
});

const multerInstance = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIMES.has(file.mimetype)) {
      cb(new Error("Cover must be a JPEG, PNG, WebP, or GIF image"));
      return;
    }
    cb(null, true);
  },
});

/**
 * Optional single file field `cover_image`. Leaves `req.file` undefined when no file is sent.
 */
export const uploadEventCover = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  multerInstance.single("cover_image")(req, res, (err: unknown) => {
    if (err instanceof MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(status.BAD_REQUEST).json({
          message: `Cover image must be at most ${MAX_BYTES / (1024 * 1024)} MB`,
        });
        return;
      }
      res.status(status.BAD_REQUEST).json({ message: err.message });
      return;
    }
    if (err instanceof Error) {
      res.status(status.BAD_REQUEST).json({ message: err.message });
      return;
    }
    next();
  });
};
