module Images

  def self.build_blank_png(w, h)
    ChunkyPNG::Image.new(w, h).to_blob(:fast_rgba)
  end

end