/**
 * Cache for Panchang transition times
 * Stores calculated end times to avoid expensive recalculation
 */

const fs = require('fs');
const path = require('path');

class TransitionCache {
    constructor(cacheDir = './cache') {
        this.cacheDir = cacheDir;
        this.memoryCache = new Map(); // In-memory cache for current session
        
        // Ensure cache directory exists
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
    }
    
    /**
     * Generate cache key from parameters
     * Use local date (not UTC) to avoid timezone issues
     */
    getCacheKey(date, lat, lng) {
        // Extract local date components to avoid UTC conversion issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        return `${dateStr}_${lat.toFixed(4)}_${lng.toFixed(4)}`
    }
    
    /**
     * Get cached transition times
     */
    get(date, lat, lng) {
        const key = this.getCacheKey(date, lat, lng);
        
        // Check memory cache first
        if (this.memoryCache.has(key)) {
            console.log('  ✅ Cache HIT (memory):', key);
            return this.memoryCache.get(key);
        }
        
        // Check file cache
        const filePath = path.join(this.cacheDir, `${key}.json`);
        if (fs.existsSync(filePath)) {
            try {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                // Convert ISO strings back to Dates
                if (data.nakshatraEndTime) {
                    data.nakshatraEndTime = new Date(data.nakshatraEndTime);
                }
                if (data.tithiEndTime) {
                    data.tithiEndTime = new Date(data.tithiEndTime);
                }
                
                // Store in memory cache
                this.memoryCache.set(key, data);
                
                console.log('  ✅ Cache HIT (disk):', key);
                return data;
            } catch (error) {
                console.error('  ⚠️  Cache read error:', error.message);
            }
        }
        
        console.log('  ❌ Cache MISS:', key);
        return null;
    }
    
    /**
     * Store transition times in cache
     */
    set(date, lat, lng, data) {
        const key = this.getCacheKey(date, lat, lng);
        
        // Store in memory
        this.memoryCache.set(key, data);
        
        // Store in file
        const filePath = path.join(this.cacheDir, `${key}.json`);
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log('  💾 Cached to disk:', key);
        } catch (error) {
            console.error('  ⚠️  Cache write error:', error.message);
        }
    }
    
    /**
     * Clear old cache entries (older than X days)
     */
    clearOld(daysToKeep = 30) {
        const files = fs.readdirSync(this.cacheDir);
        const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
        let deletedCount = 0;
        
        files.forEach(file => {
            const filePath = path.join(this.cacheDir, file);
            const stats = fs.statSync(filePath);
            
            if (stats.mtimeMs < cutoffTime) {
                fs.unlinkSync(filePath);
                deletedCount++;
            }
        });
        
        if (deletedCount > 0) {
            console.log(`  🗑️  Cleaned ${deletedCount} old cache entries`);
        }
    }
    
    /**
     * Get cache statistics
     */
    getStats() {
        const files = fs.readdirSync(this.cacheDir);
        return {
            memoryEntries: this.memoryCache.size,
            diskEntries: files.length,
            cacheDir: this.cacheDir
        };
    }
}

// Export singleton instance
const transitionCache = new TransitionCache(path.join(__dirname, 'panchang-cache'));

module.exports = transitionCache;
