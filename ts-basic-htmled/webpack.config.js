var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var WebpackCleanPlugin = require('webpack-clean');
var CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './out/hello.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist/html')
    },
    module:{
        rules:[{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        }
        ]
    },
    plugins: [
        new WebpackCleanPlugin(['dist/html']),
        new HtmlWebpackPlugin({
            title: 'Like GW BASIC',
            template: './src/index.html'
        }),
        new CopyPlugin([
            { from: 'src/**/*.css', to: '', flatten:true, ignore:['**/node_modules/**/*.css'] },
            { from: 'src/help*.html', to:'', flatten:true }
        ]),
    ]
  };
