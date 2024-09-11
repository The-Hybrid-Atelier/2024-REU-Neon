import path from 'path';
import fs from 'fs';

export default function handler(req, res) {
  try {
    const basePath = path.join(process.cwd(), 'data'); // Base path to the 'data' folder

    // Helper function to filter out hidden files and directories
    const isNotHidden = name => !name.startsWith('.');

    // Read the list of users (top-level folders)
    const users = fs.readdirSync(basePath)
      .filter(user => isNotHidden(user) && fs.lstatSync(path.join(basePath, user)).isDirectory());

    // Crawl through each user to find bends, trials, and videos
    const folderStructure = users.map(user => {
      const userPath = path.join(basePath, user);
      const bends = fs.readdirSync(userPath)
        .filter(bend => isNotHidden(bend) && fs.lstatSync(path.join(userPath, bend)).isDirectory());

      const userBends = bends.map(bend => {
        const bendPath = path.join(userPath, bend);
        const trials = fs.readdirSync(bendPath)
          .filter(trial => isNotHidden(trial) && fs.lstatSync(path.join(bendPath, trial)).isDirectory());

        const userBendTrials = trials.map(trial => {
          const trialPath = path.join(bendPath, trial);
          const videos = fs.readdirSync(trialPath)
            .filter(file => isNotHidden(file) && (file.endsWith('-video.mp4') || file.endsWith('-video.mov')));

          return {
            trial,
            videos,
          };
        });

        return {
          bend,
          trials: userBendTrials,
        };
      });

      return {
        user,
        bends: userBends,
      };
    });

    // Return the folder structure as a JSON response
    return res.status(200).json(folderStructure);
  } catch (error) {
    console.error('Error reading folder structure:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
