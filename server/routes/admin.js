/**
 * routes/admin.js
 *
 * Administrative operations.
 *
 * Requires:
 * - JWT authentication
 * - Admin role
 *
 * Features:
 * - Database backup
 * - Database restore
 * - Audit viewing
 */

const express           = require('express');
const router            = express.Router();
const authenticateToken = require('../middleware/auth');
const requireRole       = require('../middleware/requireRole');
const createBackup      = require('../utils/backup');
const restoreBackup     = require('../utils/import');
const AuditLog          = require('../models/AuditLog');
const fs                = require('fs');
const path              = require('path');

// --------------------------------------------------
// POST /api/admin/backup
//
// Creates a database backup.
// Admin only.
// --------------------------------------------------

router.post(
    '/backup',
    authenticateToken,
    requireRole('admin'),

    async(req,res)=>{

      try {
        const filename = await createBackup();
        await AuditLog.create({
            username:req.user.username,
            role:req.user.role,
            action:'DATABASE_BACKUP',
            details:`Created backup ${filename}`
        });

        res.json({message:'Backup created successfully', file: filename});
      }

      catch(err){
        console.error(err);
        res.status(500).json({error:'Backup failed'});
      }
});

// --------------------------------------------------
// GET /api/admin/download/:filename
//
// Downloads a database backup file.
// Admin only.
// --------------------------------------------------

router.get(
    '/download/:filename',
    authenticateToken,
    requireRole('admin'),

    (req, res) => {
        const filename = req.params.filename;
        const filepath = path.join(
            __dirname,
            '../backups',
            filename
        );

        res.download(
            filepath,
            filename,
            (err) => {
                if (err) {
                    console.error(err);
                    res.status(404).json({error: 'Backup file not found'});
                }
            }
        );
    }
);

// --------------------------------------------------
// POST /api/admin/import
// Restores database backup
// --------------------------------------------------

router.post(
    '/import',
    authenticateToken,
    requireRole('admin'),

    async(req,res)=>{

        try {
            const filename = req.body.filename;
            if(!filename){
                return res.status(400).json({error: 'Backup filename required'});
            }
            const result = await restoreBackup(filename);
            await AuditLog.create({
                username:req.user.username,
                role:req.user.role,
                action: 'DATABASE_IMPORT',
                details:
                    `Restored ${filename}. ` +
                    `${result.imported} animals imported. ` +
                    `${result.corrected} records corrected.`
                })

            res.json({
                message:'Database restored successfully',
                records: result.imported,
                corrected: result.corrected
            });;
        }

        catch(err){
            console.error(err);
            res.status(500).json({error: err.message});
        }
    }
);

// --------------------------------------------------
// GET /api/admin/backups
//
// Returns every backup file.
// Admin only.
// --------------------------------------------------

router.get(
    '/backups',
    authenticateToken,
    requireRole('admin'),
    async (req, res) => {

        try {
            const backupFolder = path.join(__dirname, '../backups');
            const files = fs.readdirSync(backupFolder);
            const backups = files
              .filter(file => file.endsWith('.json'))
              .sort()
              .reverse();
            res.json(backups);
        }

        catch (err) {
            console.error(err);
            res.status(500).json({error: 'Unable to read backups.'});
        }
    }
);


// --------------------------------------------------
// GET /api/admin/audit
//
// Returns audit log entries.
// Admin only.
// --------------------------------------------------

router.get(
    '/audit',
    authenticateToken,
    requireRole('admin'),
    async (req, res) => {

        try {
            const logs = await AuditLog
                .find()
                .sort({ timestamp: -1 });

            res.json(logs);
        }

        catch (err) {
            console.error(err);
            res.status(500).json({error: 'Unable to retrieve audit logs'});
        }
    }
);

module.exports = router;