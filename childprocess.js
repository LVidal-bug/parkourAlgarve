
const spawnSync = require('child_process').spawnSync;


function DeleteFile(file) {
    const spawnSync = require('child_process').spawnSync;
    if (file.length < 4) return 'Invalid File'
    file = `public/${file}`
    let toDelete = file
    return spawnSync('rm', [toDelete])
}


module.exports = DeleteFile