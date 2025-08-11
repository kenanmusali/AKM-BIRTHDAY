import { put } from '@vercel/blob';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({
            error: 'Method Not Allowed',
            message: 'Only POST requests are accepted'
        });
    }

    // Validate content type
    if (!req.headers['content-type']?.includes('application/json')) {
        return res.status(415).json({
            error: 'Unsupported Media Type',
            message: 'Request must be JSON formatted'
        });
    }

    try {
        // Validate request body
        const { fileName, folderPath } = req.body;
        
        if (!fileName || typeof fileName !== 'string') {
            return res.status(400).json({ 
                error: 'Invalid Request',
                message: 'File name is required and must be a string'
            });
        }

        if (!folderPath || typeof folderPath !== 'string') {
            return res.status(400).json({
                error: 'Invalid Request', 
                message: 'Folder path is required and must be a string'
            });
        }

        // Create full path and upload to blob storage
        const fullPath = `${folderPath.replace(/\/$/, '')}/${fileName}`;
        
        const blob = await put(fullPath, req.body, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
            contentType: req.body.fileType || 'application/octet-stream'
        });

        // Return success response
        return res.status(200).json({
            success: true,
            url: blob.url,
            filePath: blob.pathname,
            downloadUrl: blob.downloadUrl
        });

    } catch (error) {
        console.error('Blob upload error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to generate upload URL',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}