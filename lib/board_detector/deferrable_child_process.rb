module BoardDetector
  class DeferrableChildProcess < EventMachine::Connection
    include EventMachine::Deferrable

    def initialize
      super
      @data = []
    end

    def self.open cmd
      EventMachine.popen(cmd, DeferrableChildProcess)
    end

    def receive_data data
      @data << data
    end

    def unbind
      status = get_status
      if status.exitstatus != 0
        fail(@data.join, status)
      else
        succeed(@data.join, status)
      end
    end

  end
end