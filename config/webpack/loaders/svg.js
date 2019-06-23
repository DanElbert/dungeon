module.exports = {
  test: /dungeon_svg\/[a-zA-Z0-9-_]+\.svg$/i,
  use: [{
    loader: 'vue-svg-loader'
  }]
}
