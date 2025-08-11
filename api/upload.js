import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm();
  const uploadDir = path.join(process.cwd(), 'public', 'assets', 'docs');

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  form.uploadDir = uploadDir;
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'File upload failed' });
    }

    const file = files.excelFile;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate new filename
    const timestamp = new Date().toLocaleString('az-AZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/[/:, ]/g, '_');
    
    const newFilename = `${fs.readdirSync(uploadDir).length + 1}. ${timestamp} - ${file.originalFilename}`;
    const newPath = path.join(uploadDir, newFilename);

    // Rename the file
    fs.renameSync(file.filepath, newPath);

    // Update excel-files.json
    const jsonPath = path.join(uploadDir, 'excel-files.json');
    let fileList = [];
    
    try {
      if (fs.existsSync(jsonPath)) {
        fileList = JSON.parse(fs.readFileSync(jsonPath));
      }
    } catch (e) {
      console.error('Error reading json file:', e);
    }

    fileList.push(newFilename);
    fs.writeFileSync(jsonPath, JSON.stringify(fileList, null, 2));

    return res.status(200).json({ 
      success: true, 
      filename: newFilename,
      message: 'File uploaded successfully'
    });
  });
}