class ApplicationJob < ActiveJob::Base

  rescue_from(StandardError) do |exception|
    ExceptionNotifier.notify_exception(exception)
  end

end