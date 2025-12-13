const path = require('path');

module.exports = {
    entry: './src/index.ts',
    output: {
        filename: 'utils-lib.js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            name: 'UtilsLib',
            type: 'umd',
        },
        globalObject: 'this',
        iife: true,
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    // Use source-map or false to avoid eval() wrapping
    devtool: false,
    optimization: {
        minimize: false,
        concatenateModules: false,
    },
};
