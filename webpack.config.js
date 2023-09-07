const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'development',
    entry: ['./index.ts'],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.html$/i,
                loader: 'html-loader'
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    "css-loader",
                    "sass-loader",
                ],
            },
            {
                test: /\.css$/i,
                use: [
                    "css-loader",
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        modules: [path.resolve(__dirname, 'interface/*'), 'node_modules']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'nimble.js',
        globalObject: 'this',
        library: {
            name: 'nimble',
            type: 'umd'
        }
    },
    plugins: [new HtmlWebpackPlugin({ template: path.join(__dirname, 'index.html'), inject: true })],
    devServer: {
        historyApiFallback: true
    },

};