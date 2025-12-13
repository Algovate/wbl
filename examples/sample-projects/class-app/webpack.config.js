const path = require('path');

module.exports = {
    entry: {
        main: './src/index.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        iife: true,
    },
    // Use source-map or false to avoid eval() wrapping
    devtool: false,
    optimization: {
        minimize: false,
        concatenateModules: false,
        splitChunks: false,
    },
};
