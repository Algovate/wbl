/**
 * Shared Webpack Configuration
 * 
 * Base config for all sample projects.
 * Import and spread in project-specific webpack.config.js
 */

const sharedConfig = {
    // Disable source maps with eval - makes bundle cleaner
    devtool: false,

    optimization: {
        // Don't minimize - keeps code readable
        minimize: false,
        // Don't concatenate modules - preserves module boundaries for WBL
        concatenateModules: false,
        // Single bundle output
        splitChunks: false
    }
};

module.exports = { sharedConfig };
