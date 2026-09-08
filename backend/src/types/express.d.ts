import "express";

declare global {
  namespace Express {
    interface User {
      publicId: string;
      username: string;
      email: string;
      verified: boolean;
      createdAt: Date;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
