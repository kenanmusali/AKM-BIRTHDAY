import { put } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

 try {
    const { fileName, folderPath = 'docs', fileType = 'application/octet-stream' } = req.body;
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${folderPath.replace(/\/$/, '')}/${Date.now()}-${safeName}`;

    const blob = await put(filePath, req.body, {
      access: 'public',
      contentType: fileType,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    return res.status(200).json({
      uploadUrl: blob.url,
      filePath,
      downloadUrl: blob.downloadUrl,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }


  
}
