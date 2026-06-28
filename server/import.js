require('dotenv').config();
const fs      = require('fs');
const path    = require('path');
const mongoose = require('mongoose');
const { parse } = require('csv-parse');

const CSV_PATH = path.join(__dirname, '..', 'aac.csv');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected');

  await mongoose.connection.collection('animals').drop().catch(() => {});

  const records = [];

  fs.createReadStream(CSV_PATH, { encoding: 'latin1' })
    .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
    .on('data', (row) => {
      if (row.location_lat)              row.location_lat              = parseFloat(row.location_lat);
      if (row.location_long)             row.location_long             = parseFloat(row.location_long);
      if (row.age_upon_outcome_in_weeks) row.age_upon_outcome_in_weeks = parseFloat(row.age_upon_outcome_in_weeks);
      records.push(row);
    })
    .on('end', async () => {
      console.log(`Inserting ${records.length} records...`);
      await mongoose.connection.collection('animals').insertMany(records);
      console.log('Done');
      mongoose.disconnect();
    })
    .on('error', (err) => {
      console.error(err.message);
      mongoose.disconnect();
    });
});