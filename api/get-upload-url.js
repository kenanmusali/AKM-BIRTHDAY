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
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('BLOB_READ_WRITE_TOKEN is missing');
      throw new Error('Server configuration error');
    }

    const { fileName, folderPath = 'docs/', fileType = 'application/octet-stream' } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: 'File name is required' });
    }

    // Sanitize filename and create unique path
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fullPath = `${folderPath.replace(/\/$/, '')}/${Date.now()}-${safeFileName}`;

    // IMPORTANT: put expects (filePath, token, data, options)
    // Create empty file (Buffer.from('')) to get upload URL
    const blob = await put(fullPath, token, Buffer.from(''), {
      access: 'public',
      contentType: fileType,
    });

    return res.status(200).json({
      success: true,
      uploadUrl: blob.url,
      filePath: fullPath,
      downloadUrl: blob.downloadUrl,
    });

  } catch (error) {
    console.error('Blob error:', error);
    return res.status(500).json({
      error: 'Failed to generate upload URL',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
