/**
 * backup.js
 * Creates a JSON backup of the animals collection.
 * Used before administrative database updates.
 */

const Animal = require('../models/Animal');
const fs = require('fs-extra');
const path = require('path');

async function createBackup() {

    const animals = await Animal.find().lean();

    const backupFolder = path.join(__dirname, '../backups');

    fs.ensureDirSync(backupFolder);

    const now = new Date();

    const timestamp =
      now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + '_' +
      String(now.getHours()).padStart(2, '0') + '-' +
      String(now.getMinutes()).padStart(2, '0') + '-' +
      String(now.getSeconds()).padStart(2, '0');

    const filename = `animals_backup_${timestamp}.json`;

    const filepath = path.join(backupFolder, filename);

    fs.writeFileSync(filepath, JSON.stringify(animals, null, 2));

    return filename;
}

module.exports = createBackup;