
Rails.application.config.assets.precompile << /(?:\/|\\|\A)games(?:\/index)?\.js$/
Rails.application.config.assets.precompile << 'initiative_screen.js'
Rails.application.config.assets.precompile << 'camera.js'