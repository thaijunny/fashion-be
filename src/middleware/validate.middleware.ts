import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';

export const validate = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu không hợp lệ',
                    errors: error.issues.map((e: ZodIssue) => ({
                        path: e.path.join('.'),
                        message: e.message,
                    })),
                });
            }
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };
};
