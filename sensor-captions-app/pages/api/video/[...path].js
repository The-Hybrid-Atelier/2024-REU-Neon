import path from 'path';
import fs from 'fs';

export default function handler(req, res) {
  const { path: filePathSegments } = req.query; // Captures the entire path
  const basePath = path.join(process.cwd(), 'data', ...filePathSegments); // Base path to the directory containing the files

  // Define the possible file extensions in the order of priority
  const fileExtensions = ['mp4', 'mov', 'txt'];

  try {
    // Read all files in the directory
    const files = fs.readdirSync(basePath);

    // Look for a file that ends with "-video" and has one of the allowed extensions
    for (const extension of fileExtensions) {
      const matchingFile = files.find(file => file.endsWith(`-video.${extension}`));

      if (matchingFile) {
        const filePath = path.join(basePath, matchingFile);

        if (extension === 'txt') {
          // If the file is a .txt, read the YouTube URL
          const youtubeUrl = fs.readFileSync(filePath, 'utf8').trim();
          return res.status(200).json({ url: youtubeUrl, type: 'video/youtube' });
        } else {
          // If the file is a .mp4 or .mov, serve the file
          const videoType = extension === 'mp4' ? 'video/mp4' : 'video/quicktime';
          res.setHeader('Content-Type', videoType);
          const stream = fs.createReadStream(filePath);
          return stream.pipe(res);
        }
      }
    }

    // If no file is found, return a 404 error
    return res.status(404).json({ error: 'File not found' });
  } catch (error) {
    console.error('Error reading files:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
