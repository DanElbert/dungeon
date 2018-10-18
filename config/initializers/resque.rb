
rails_env = ENV['RAILS_ENV'] || 'development'

case rails_env
  when 'docker', 'production'
    Resque.redis = 'redis:6379'
  else
    #noop
end

Redis::Namespace.class_eval do
  def client
    _client
  end
end