// This file is used to serve the VTT files to the client
// The VTT files are located in the 'data' directory
// The file structure should be as follows:
// data/
// ├── p1/
// │   ├── l-bend/
// │   │   ├── t1/
// │   │   │   ├── light.vtt
// │   │   │   ├── synth.vtt
// │   │   │   ├── bloom.vtt
// │   │   │   ├── meter.vtt
// │   │   │   └── vibration.vtt
// │   └── ...


import path from 'path';
import fs from 'fs';

export default function handler(req, res) {
  const { path: filePathSegments } = req.query; // Captures the entire path
  const filePath = path.join(process.cwd(), 'data', ...filePathSegments); // Adjust 'data' if your files are located elsewhere

  if (fs.existsSync(filePath) && filePath.endsWith('.vtt')) {
    res.setHeader('Content-Type', 'text/vtt');
    res.status(200).send(fs.readFileSync(filePath));
  } else {
    res.status(404).json({ error: 'File not found' });
  }
}
