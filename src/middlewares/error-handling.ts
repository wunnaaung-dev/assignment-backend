import { NextFunction, Request, Response } from "express";
import { CustomError } from "../common/errors/custom-error";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CustomError) {
        res.status(err.statusCode).json({ message: err.message });
    }
    res.status(500).json({ message: "Something went wrong" });
}