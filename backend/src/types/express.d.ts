import { Request } from 'express';
import { File } from 'multer';

declare global {
    namespace Express {
        interface Request {
            file?: File;
        }

        namespace Multer {
            interface File {
                fieldname: string;
                originalname: string;
                encoding: string;
                mimetype: string;
                size: number;
                destination: string;
                filename: string;
                path: string;
                buffer: Buffer;
            }
        }
    }
}

export { };
