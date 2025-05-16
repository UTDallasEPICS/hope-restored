// cpenv.js
const fs = require('fs');
const path = require('path');
const directories = ["webcomponent", "admin"]

// Define the source and destination paths
const source = path.resolve(__dirname, '../.env.example');
const destinations = directories.map((directory) => path.resolve(__dirname, '../'+directory+"/.env"));

// Use fs.copyFile to copy the file
destinations.forEach((destination) => fs.copyFile(source, destination, (err) => { 
    if(err) 
        console.error('Error copying file:', err);
    }
));