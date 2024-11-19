const { exec } = require('child_process'); // For running shell commands
const Client = require('ssh2-sftp-client'); // For handling SFTP transfers
const fs = require('fs');
const sftp = new Client();

const config = {
  host: '135.181.151.155',
  port: '7342',
  username: 'roma',
  privateKey: fs.readFileSync('E:/Archive/hetzner/openssh'), // Use SSH key authentication
};

// Path to deploy on VPS
const remotePath = '/home/roma/www/passkey';

// Step 1: Build the Vite project
console.log('Building the Vite project...');
const buildProcess = exec('npm run build');

// Log build stdout in real-time
buildProcess.stdout.on('data', (data) => {
  console.log(data.toString());
});

// Log build stderr in real-time
buildProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});

// Handle build completion
buildProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`Build process exited with code ${code}`);
    return;
  }

  console.log('Build successful. Starting file upload...');

  // Step 2: Connect to VPS via SFTP and upload the files
  sftp
    .connect(config)
    .then(() => {
      console.log('Connected to the VPS. Uploading files...');
      return sftp.uploadDir('./dist', remotePath); // Upload the 'dist' directory
    })
    .then(() => {
      console.log('Files uploaded successfully!');
      return sftp.end(); // Close the SFTP connection
    })
    .catch((err) => {
      console.error(`SFTP error: ${err.message}`);
    });
});
