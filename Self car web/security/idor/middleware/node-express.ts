import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4, validate as validateUuid } from "uuid";

export function requireUuidParam(paramName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[paramName];
    if (!validateUuid(value)) return res.status(400).json({ error: "invalid id" });
    next();
  };
}

export function enforceOwnership(loadOwnerId: (resourceId: string) => Promise<string>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id || req.headers["x-user-id"];
    if (!userId) return res.status(401).json({ error: "unauthorized" });
    const resourceId = (req.params.id as string) || "";
    try {
      const ownerId = await loadOwnerId(resourceId);
      if (ownerId !== userId) return res.status(403).json({ error: "forbidden" });
      next();
    } catch (e) {
      return res.status(404).json({ error: "not found" });
    }
  };
}

