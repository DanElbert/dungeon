
rails_env = ENV['RAILS_ENV'] || 'development'

case rails_env
  when 'docker', 'production'
    Resque.redis = 'redis:6379'
  else
    #noop
end

Resque.logger = ActiveSupport::Logger.new(
    Rails.root.join('log', "#{Rails.env}_resque.log"),
    15,
    20*1024*1024)

Redis::Namespace.class_eval do
  def client
    _client
  end
end