/**
 * @type {import('@rspack/cli').Configuration}
 */
module.exports = {
  context: __dirname,
  entry: {
    main: "./src/main.tsx",
  },
  builtins: {
    html: [{template: "./index.html"}],
  },
  devServer: {
    port: 1337,
    historyApiFallback: {
      index: "/",
    },
  },
  module: {
    rules: [
      {test: /\.svg$/, type: "asset"},
      // includes tsx files in src directory + @kontrol/layout-tree from node modules
      {
        test: /\.tsx?$/,
        include: [/src/, /@kontrol\/layout-tree/],
        // use: [{loader: "ts-loader"}],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {plugins: {tailwindcss: {}, autoprefixer: {}}},
            },
          },
        ],
        type: "css",
      },
    ],
  },
};
