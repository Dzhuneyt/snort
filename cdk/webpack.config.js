// Webpack config that helps with bundling AWS Lambda
// and its dependencies into single, smaller chunks of JS files
const path = require('path');
const fs = require('fs');

const dir = __dirname + '/lambdas/';
const handlers = fs.readdirSync(dir).filter(function (file) {
    // Get only .ts files (ignore .d.ts)
    return file.match(/(^.?|\.[^d]|[^.]d|[^.][^d])\.ts$/);
});


const entries = {};
handlers.forEach(handler => {
    const filenameWithoutExt = handler.replace('.ts', '');
    const fullpath = dir + handler;
    entries[filenameWithoutExt] = fullpath;
});

module.exports = {
    entry: entries,
    mode: 'production',
    target: 'node',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        modules: [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, './lambdas'),
        ],
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'dist/lambdas'),
        filename: "[name].js"
    },
};
