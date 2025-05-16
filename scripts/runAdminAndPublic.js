const { exec } = require('child_process');

const scriptNames = ["admin", "public"]

// Run the npm script defined in package.json
scriptNames.forEach((scriptName) => exec(`npm run ${scriptName}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing script: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`); // Output from the script
    })
);
