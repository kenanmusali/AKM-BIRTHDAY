import { createClient } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { filePath, fileName } = req.body;
        const client = createClient();
        await client.connect();

        await client.sql`
            INSERT INTO uploaded_files 
            (file_path, file_name, uploaded_at)
            VALUES (${filePath}, ${fileName}, NOW())
        `;

        await client.end();
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Error storing file reference' });
    }
}

// api/get-upload-url.js
import { put } from '@vercel/blob';

export default async function handler(req, res) {
    const { fileName } = req.body;
    const blob = await put(`docs/${fileName}`, req.body, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
    });
    res.json({ url: blob.url, path: blob.pathname });
}