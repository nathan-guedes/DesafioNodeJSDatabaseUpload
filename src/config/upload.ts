import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const filePath = path.resolve(__dirname, '..', '..', 'tmp');
export default {
  directory: filePath,
  storage: multer.diskStorage({
    destination: filePath,
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('HEX');
      const fileName = `${fileHash}-${Date.now()}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};
