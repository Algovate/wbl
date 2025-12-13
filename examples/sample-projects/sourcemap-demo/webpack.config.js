const path = require('path');

module.exports = {
    entry: './src/index.ts',
    output: {
        filename: 'sourcemap-demo.js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            name: 'SourceMapDemo',
            type: 'umd',
        },
        globalObject: 'this',
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
    // Generate separate source map file
    devtool: 'source-map',
    optimization: {
        minimize: false,
        concatenateModules: false,
    },
};
