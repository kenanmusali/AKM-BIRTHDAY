import { put } from '@vercel/blob';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Verify Blob token is configured
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
        }

        const { fileName, folderPath = 'docs/', fileType = 'application/octet-stream' } = req.body;

        if (!fileName) {
            return res.status(400).json({ error: 'File name is required' });
        }

        // Create the full path
        const fullPath = `${folderPath.replace(/\/$/, '')}/${Date.now()}-${fileName}`;

        // Create a mock file buffer (actual file will be uploaded directly to the URL)
        const mockBuffer = Buffer.from('');

        const blob = await put(fullPath, mockBuffer, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
            contentType: fileType
        });

        return res.status(200).json({
            success: true,
            uploadUrl: blob.url,
            filePath: fullPath,
            downloadUrl: blob.downloadUrl
        });

    } catch (error) {
        console.error('Blob error:', error);
        return res.status(500).json({
            error: 'Upload failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}