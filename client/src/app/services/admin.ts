/**
 * admin.service.ts - Service for administrative operations
 * Provides methods for backup management, restore operations, and audit log access
 * All methods interact with the backend API endpoints
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root' // Service is available application-wide as a singleton
})

export class AdminService {
  // Base API URL from environment configuration
  private base = environment.apiUrl;

  constructor(
    private http: HttpClient // HTTP client for making API requests
  ) {}

  /**
   * Creates a new database backup
   * @returns {Observable<any>} Observable containing backup status and filename
   * API Endpoint: POST /admin/backup
   */
  createBackup(): Observable<any> {
    return this.http.post(`${this.base}/admin/backup`, {});
  }

  /**
   * Restores the database from a specified backup file
   * @param {string} filename - Name of the backup file to restore
   * @returns {Observable<any>} Observable containing restore results (records imported, corrected)
   * API Endpoint: POST /admin/import
   */
  restoreBackup(filename: string): Observable<any> {
    return this.http.post(`${this.base}/admin/import`, { filename });
  }

  /**
   * Retrieves the audit log of all system actions
   * @returns {Observable<any>} Observable containing array of audit log entries
   * API Endpoint: GET /admin/audit
   */
  getAuditLogs(): Observable<any> {
    return this.http.get(`${this.base}/admin/audit`);
  }

  /**
   * Retrieves the list of available backup files
   * @returns {Observable<any>} Observable containing array of backup filenames
   * API Endpoint: GET /admin/backups
   */
  getBackups(): Observable<any> {
    return this.http.get(`${this.base}/admin/backups`);
  }

  /**
   * Downloads a specific backup file
   * @param {string} filename - Name of the backup file to download
   * @returns {Observable<Blob>} Observable containing the backup file as a Blob
   * API Endpoint: GET /admin/download/{filename}
   * Response type is set to 'blob' to handle binary file download
   */
  downloadBackup(filename: string) {
    return this.http.get(`${this.base}/admin/download/${filename}`, {
      responseType: 'blob'    // Treat response as binary data for file download
    });
  }
}
