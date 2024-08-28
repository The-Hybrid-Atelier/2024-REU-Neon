/* 
Create Pressure Graph with a progress bar that is synced with the YouTube Video to show you where you are in the video

TO-DO:
1. Connect progress bar with an image below it
2. Sync progress bar with YouTube Video
*/

import React from 'react';
import { Progress } from 'semantic-ui-react' //use to create progress bar effect for pressure plot

//define progress bar for pressure plot
const ProgressExampleLabel = () => <Progress percent={55}>Label</Progress>

//export default ProgressExampleLabel
/*HTML: <div class="ui progress" data-percent="55"><div class="bar" style="width:55%"></div><div class="label">Label</div></div> */
