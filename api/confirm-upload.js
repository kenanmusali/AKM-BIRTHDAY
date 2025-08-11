import { createWriteStream } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const fileData = await req.body;
        const fileName = req.headers['x-file-name'] || `upload-${Date.now()}.xls`;
        const filePath = join(process.cwd(), 'assets', 'docs', fileName);

        const fileStream = createWriteStream(filePath);
        fileData.pipe(fileStream);

        return new Promise((resolve, reject) => {
            fileStream.on('finish', () => {
                res.status(200).json({ message: 'File uploaded successfully', fileName });
                resolve();
            });
            
            fileStream.on('error', (error) => {
                console.error('File upload error:', error);
                res.status(500).json({ message: 'File upload failed' });
                reject(error);
            });
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}