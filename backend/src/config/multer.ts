import path from 'path';
import multer from 'multer';
import crypto from 'crypto';

export default {
    storage: multer.diskStorage({
        destination: path.resolve(__dirname, '..', '..', 'uploads'),
        filename(req, file, cb) {
            const hash = crypto.randomBytes(4).toString('hex');
            const date = new Date().getTime();

            const newFilename = `${date}:${hash}-${file.originalname}`;

            cb(null, newFilename);
        },
    }),
};
