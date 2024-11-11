import { Request, Response } from "express";
import { CustomError } from "../common/errors/custom-error";

export const errorHandler = (err: Error, req: Request, res: Response) => {
    res.status(500).json({errors: [{message: "Something went wrong"}]})
}