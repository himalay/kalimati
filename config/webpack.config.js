const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const ROOT_DIRECTORY = path.join(__dirname, '..')
const SRC_DIRECTORY = path.join(ROOT_DIRECTORY, 'src')

const config = {
  entry: [path.resolve(__dirname, '../src/index.js')],
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  mode: 'development',
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: [path.resolve('node_modules'), 'node_modules'],
  },
  performance: {
    hints: false,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(SRC_DIRECTORY, 'index.html'),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(SRC_DIRECTORY, 'assets'),
          to: path.join(ROOT_DIRECTORY, 'build'),
        },
      ],
    }),
  ],
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader' },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|gif|pdf)$/,
        use: ['file-loader'],
      },
      {
        test: /\.?worker\.(c|m)?js$/i,
        use: [
          {
            loader: 'worker-loader',
          },
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    useBuiltIns: 'usage', // alternative mode: "entry"
                    corejs: 3, // default would be 2
                    targets: '> 0.25%, not dead',
                    // set your own target environment here (see Browserslist)
                  },
                ],
              ],
            },
          },
        ],
      },
    ],
  },
}

module.exports = config
