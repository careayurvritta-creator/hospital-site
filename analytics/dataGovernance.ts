/**
 * Data Governance Module
 * Handles data quality, retention, and compliance
 */

import { PRIVACY_CONFIG } from './config';
import type { ConsentState } from './types';

// Storage keys for governance
const DATA_INVENTORY_KEY = 'ayurvritta_data_inventory';
const AUDIT_LOG_KEY = 'ayurvritta_audit_log';

export interface DataInventoryItem {
    key: string;
    type: 'analytics' | 'consent' | 'user' | 'session' | 'performance';
    description: string;
    retentionDays: number;
    createdAt: number;
    lastAccessed?: number;
    size?: number;
}

export interface AuditLogEntry {
    timestamp: number;
    action: 'create' | 'read' | 'update' | 'delete' | 'export';
    dataType: string;
    key: string;
    userId?: string;
    details?: string;
}

/**
 * DataGovernance Class
 * Manages data lifecycle, quality, and compliance
 */
class DataGovernance {
    private inventory: Map<string, DataInventoryItem> = new Map();
    private auditLog: AuditLogEntry[] = [];

    constructor() {
        this.loadInventory();
        this.loadAuditLog();
    }

    /**
     * Load data inventory from storage
     */
    private loadInventory(): void {
        try {
            const saved = localStorage.getItem(DATA_INVENTORY_KEY);
            if (saved) {
                const items = JSON.parse(saved) as DataInventoryItem[];
                items.forEach(item => this.inventory.set(item.key, item));
            }
        } catch (e) {
            console.error('[Governance] Error loading inventory:', e);
        }
    }

    /**
     * Save data inventory
     */
    private saveInventory(): void {
        try {
            const items = Array.from(this.inventory.values());
            localStorage.setItem(DATA_INVENTORY_KEY, JSON.stringify(items));
        } catch (e) {
            console.error('[Governance] Error saving inventory:', e);
        }
    }

    /**
     * Load audit log
     */
    private loadAuditLog(): void {
        try {
            const saved = localStorage.getItem(AUDIT_LOG_KEY);
            if (saved) {
                this.auditLog = JSON.parse(saved);
            }
        } catch (e) {
            console.error('[Governance] Error loading audit log:', e);
        }
    }

    /**
     * Save audit log
     */
    private saveAuditLog(): void {
        try {
            // Keep last 500 entries
            const toSave = this.auditLog.slice(-500);
            localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(toSave));
        } catch (e) {
            console.error('[Governance] Error saving audit log:', e);
        }
    }

    /**
     * Register a data item in inventory
     */
    registerData(item: Omit<DataInventoryItem, 'createdAt'>): void {
        const fullItem: DataInventoryItem = {
            ...item,
            createdAt: Date.now(),
        };
        this.inventory.set(item.key, fullItem);
        this.saveInventory();

        this.log({
            action: 'create',
            dataType: item.type,
            key: item.key,
            details: item.description,
        });
    }

    /**
     * Record data access
     */
    recordAccess(key: string): void {
        const item = this.inventory.get(key);
        if (item) {
            item.lastAccessed = Date.now();
            this.saveInventory();
        }

        this.log({
            action: 'read',
            dataType: item?.type || 'unknown',
            key,
        });
    }

    /**
     * Add entry to audit log
     */
    log(entry: Omit<AuditLogEntry, 'timestamp'>): void {
        this.auditLog.push({
            ...entry,
            timestamp: Date.now(),
        });
        this.saveAuditLog();
    }

    /**
     * Run data retention cleanup
     * Removes data older than retention period
     */
    runRetentionCleanup(): { cleaned: number; remaining: number } {
        let cleaned = 0;
        const now = Date.now();
        const msPerDay = 24 * 60 * 60 * 1000;

        this.inventory.forEach((item, key) => {
            const ageInDays = (now - item.createdAt) / msPerDay;

            if (ageInDays > item.retentionDays) {
                // Remove from localStorage
                try {
                    localStorage.removeItem(key);
                    this.inventory.delete(key);
                    cleaned++;

                    this.log({
                        action: 'delete',
                        dataType: item.type,
                        key,
                        details: `Retention cleanup: ${Math.floor(ageInDays)} days old, limit ${item.retentionDays} days`,
                    });
                } catch (e) {
                    console.error(`[Governance] Error cleaning ${key}:`, e);
                }
            }
        });

        this.saveInventory();
        return { cleaned, remaining: this.inventory.size };
    }

    /**
     * Get data inventory
     */
    getInventory(): DataInventoryItem[] {
        return Array.from(this.inventory.values());
    }

    /**
     * Get audit log
     */
    getAuditLog(limit: number = 100): AuditLogEntry[] {
        return this.auditLog.slice(-limit);
    }

    /**
     * Get storage usage statistics
     */
    getStorageStats(): {
        totalItems: number;
        totalSizeEstimate: string;
        oldestData: string;
        newestData: string;
        byType: Record<string, number>;
    } {
        let totalSize = 0;
        let oldest = Date.now();
        let newest = 0;
        const byType: Record<string, number> = {};

        this.inventory.forEach(item => {
            // Estimate size
            try {
                const value = localStorage.getItem(item.key);
                if (value) {
                    totalSize += value.length * 2; // UTF-16
                }
            } catch (e) {
                // Item may not exist
            }

            if (item.createdAt < oldest) oldest = item.createdAt;
            if (item.createdAt > newest) newest = item.createdAt;
            byType[item.type] = (byType[item.type] || 0) + 1;
        });

        return {
            totalItems: this.inventory.size,
            totalSizeEstimate: this.formatBytes(totalSize),
            oldestData: this.inventory.size > 0 ? new Date(oldest).toLocaleDateString() : 'N/A',
            newestData: this.inventory.size > 0 ? new Date(newest).toLocaleDateString() : 'N/A',
            byType,
        };
    }

    /**
     * Format bytes to human readable
     */
    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Export all user data (GDPR data portability)
     */
    exportUserData(): string {
        const data: Record<string, any> = {
            exportDate: new Date().toISOString(),
            exportedBy: 'Ayurvritta Analytics System',
            dataInventory: this.getInventory(),
            userData: {},
        };

        // Collect all user-related data
        this.inventory.forEach((item, key) => {
            if (['user', 'consent', 'session'].includes(item.type)) {
                try {
                    const value = localStorage.getItem(key);
                    if (value) {
                        data.userData[key] = JSON.parse(value);
                    }
                } catch (e) {
                    data.userData[key] = 'Unable to parse';
                }
            }
        });

        this.log({
            action: 'export',
            dataType: 'all',
            key: 'user_data_export',
            details: `Exported ${Object.keys(data.userData).length} items`,
        });

        return JSON.stringify(data, null, 2);
    }

    /**
     * Delete all user data (GDPR right to erasure)
     */
    deleteAllUserData(): { deleted: number; errors: string[] } {
        let deleted = 0;
        const errors: string[] = [];

        this.inventory.forEach((item, key) => {
            try {
                localStorage.removeItem(key);
                this.inventory.delete(key);
                deleted++;
            } catch (e) {
                errors.push(`Failed to delete ${key}: ${e}`);
            }
        });

        // Clear audit log as well
        this.auditLog = [];
        localStorage.removeItem(AUDIT_LOG_KEY);
        localStorage.removeItem(DATA_INVENTORY_KEY);

        // Final log entry (will be cleared next save)
        this.log({
            action: 'delete',
            dataType: 'all',
            key: 'complete_data_erasure',
            details: `Deleted ${deleted} items`,
        });

        return { deleted, errors };
    }

    /**
     * Validate data quality
     */
    validateDataQuality(): {
        valid: number;
        invalid: number;
        issues: string[];
    } {
        let valid = 0;
        let invalid = 0;
        const issues: string[] = [];

        this.inventory.forEach((item, key) => {
            try {
                const value = localStorage.getItem(key);
                if (value) {
                    JSON.parse(value); // Validate JSON
                    valid++;
                } else {
                    invalid++;
                    issues.push(`Missing data: ${key}`);
                }
            } catch (e) {
                invalid++;
                issues.push(`Invalid JSON: ${key}`);
            }
        });

        return { valid, invalid, issues };
    }

    /**
     * Register standard analytics data items
     */
    registerStandardItems(): void {
        const standardItems: Omit<DataInventoryItem, 'createdAt'>[] = [
            { key: 'ayurvritta_consent', type: 'consent', description: 'User consent preferences', retentionDays: 365 },
            { key: 'ayurvritta_visitor_id', type: 'user', description: 'Anonymous visitor identifier', retentionDays: 365 },
            { key: 'ayurvritta_segments', type: 'user', description: 'User behavior segments', retentionDays: 90 },
            { key: 'ayurvritta_lead_score', type: 'analytics', description: 'Lead scoring data', retentionDays: 90 },
            { key: 'ayurvritta_ab_assignments', type: 'analytics', description: 'A/B test variant assignments', retentionDays: 30 },
            { key: 'ayurvritta_content_perf', type: 'performance', description: 'Content performance metrics', retentionDays: 90 },
            { key: 'ayurvritta_service_history', type: 'user', description: 'Service view history', retentionDays: 60 },
        ];

        standardItems.forEach(item => {
            if (!this.inventory.has(item.key)) {
                this.registerData(item);
            }
        });
    }
}

// Singleton instance
export const dataGovernance = new DataGovernance();

// Initialize standard items
dataGovernance.registerStandardItems();

// Export class for testing
export { DataGovernance };
