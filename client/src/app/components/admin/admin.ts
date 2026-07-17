/**
 * AdminComponent
 * 
 * Provides administrative functionality for the application including:
 * - Creating database backups
 * - Restoring from backup files
 * - Viewing and paginating backup history
 * - Viewing and paginating audit logs
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin';
import { ChangeDetectorRef } from '@angular/core';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})

export class AdminComponent implements OnInit {
  // Backup-related properties
  backupMessage = '';     // Status message for backup operations
  backupFile = '';        // Name of the most recently created backup file
  backupPage = 0;         // Current page index for backup pagination
  backupPageSize = 5;     // Number of backups to display per page

  // Restore-related properties
  restoreFilename = '';   // Name of the backup file to restore
  restoreMessage = '';    // Status message for restore operations
  recordsImported = 0;    // Number of records imported during restore
  recordsCorrected = 0;   // Number of records corrected during restore

  Math = Math;            // Expose Math object for template usage

  backups: string[] = []; // List of available backup filenames

  // Audit log-related properties
  auditLogs: any[] = [];  // List of audit log entries
  auditPage = 0;          // Current page index for audit log pagination
  auditPageSize = 10;     // Number of audit logs to display per page

  constructor(
    private adminService: AdminService, // Service for admin operations
    private router: Router,             // Router for navigation
    private cdr: ChangeDetectorRef      // Change detector for manual change detection
  ) {}

  /**
   * Lifecycle hook that initializes the component
   * Loads backup list and audit logs on component initialization
   */
  ngOnInit(): void {
    this.loadBackups();
    this.loadAuditLogs();
  }

  /**
   * Creates a new database backup
   * Displays success/error messages and refreshes the backup list
   */
  createBackup(): void {
    console.log('Create Backup clicked');

    this.adminService
      .createBackup()
      .subscribe({
        next: (result) => {
          console.log(result);
          this.backupMessage = result.message;
          this.backupFile = result.file;
          this.loadBackups();            // Refresh backup list after creation
          this.cdr.detectChanges();      // Manually trigger change detection
        },
        error: () => {
          console.error(Error);
          this.backupMessage = 'Backup failed';
        }
      });
  }

  /**
   * Restores the database from a specified backup file
   * Validates that a filename is provided before attempting restore
   */
  restoreBackup(): void {
    // Validate that a filename has been entered
    if (!this.restoreFilename.trim()) {
      this.restoreMessage = 'Please enter a backup filename.';
      return;
    }

    this.adminService
      .restoreBackup(this.restoreFilename)
      .subscribe({
        next: (result) => {
          this.restoreMessage = result.message;
          this.recordsImported = result.records;
          this.recordsCorrected = result.corrected;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.restoreMessage = 'Restore failed.';
        }
      });
  }

  /**
   * Loads the list of available backup files from the server
   */
  loadBackups(): void {
    this.adminService
      .getBackups()
      .subscribe({
        next: (files) => {
          this.backups = files;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  /**
   * Getter that returns the current page of backups for display
   * Uses backupPage and backupPageSize to slice the backups array
   */
  get displayedBackups(): string[] {
    const start = this.backupPage * this.backupPageSize;
    return this.backups.slice(
      start,
      start + this.backupPageSize
    );
  }

  /**
   * Advances to the next page of backups if available
   */
  nextBackupPage(): void {
    if ((this.backupPage + 1) * this.backupPageSize < this.backups.length) {
      this.backupPage++;
    }
  }

  /**
   * Returns to the previous page of backups if available
   */
  previousBackupPage(): void {
    if (this.backupPage > 0) {
      this.backupPage--;
    }
  }

  /**
   * Selects a backup file from the list and sets it as the restore target
   * @param filename - The name of the backup file to select
   */
  selectBackup(filename: string): void {
    this.restoreFilename = filename;
  }

  /**
   * Formats a backup filename into a human-readable date string
   * Extracts timestamp from filename pattern: YYYY-MM-DD_HH-MM-SS
   * @param filename - The backup filename to format
   * @returns Formatted date string or empty string if pattern doesn't match
   */
  formatBackupDate(filename: string): string {
    // Extract timestamp components from filename
    const match = filename.match(/(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})/);

    if (!match) {
      return '';
    }

    const [
      ,
      year,
      month,
      day,
      hour,
      minute,
      second
    ] = match;

    // Create date object from extracted components
    const date = new Date(
      Number(year),
      Number(month) - 1, // Month is 0-indexed in JavaScript Date
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );

    return date.toLocaleString(); // Convert to localized date string
  }

  /**
   * Loads the audit logs from the server
   */
  loadAuditLogs(): void {
    this.adminService
      .getAuditLogs()
      .subscribe({
        next: (logs) => {
          this.auditLogs = logs;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(
            'Failed loading audit logs',
            err
          );
        }
      });
  }

  /**
   * Getter that returns the current page of audit logs for display
   * Uses auditPage and auditPageSize to slice the auditLogs array
   */
  get displayedAuditLogs(): any[] {
    const start = this.auditPage * this.auditPageSize;
    return this.auditLogs.slice(
      start,
      start + this.auditPageSize
    );
  }

  /**
   * Advances to the next page of audit logs if available
   */
  nextAuditPage(): void {
    if ((this.auditPage + 1) * this.auditPageSize < this.auditLogs.length) {
      this.auditPage++;
    }
  }

  /**
   * Returns to the previous page of audit logs if available
   */
  previousAuditPage(): void {
    if (this.auditPage > 0) {
      this.auditPage--;
    }
  }

  /**
   * Download DB backup file
   */
  downloadBackup(filename: string): void {
    this.adminService
      .downloadBackup(filename)
      .subscribe({
        next: (file) => {
          const url = window.URL.createObjectURL(file);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          window.URL.revokeObjectURL(url);
          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error('Download failed', err);
        }
      });
  }

  /**
   * Navigates back to the dashboard
   */
  returnDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
