require 'test_helper'

class FixtureTest < ActiveSupport::TestCase
  test 'fixture validation' do
    count = 0
    klasses = []
    fixture_table_names.each do |fixture_name|
      klass_name = fixture_name.classify
      begin
        klasses << klass_name.constantize
      rescue NameError
        Rails.logger.warn "No model class (#{klass_name}) found for fixture #{fixture_name}"
      end
    end

    errors = []
    klasses.each do |klass|
      klass.all.each do |obj|
        errors << "Expected #{klass.to_s} fixture #{obj.id} to be valid.  Errors: #{obj.errors.to_a.join(', ')}.  Attribute values: #{obj.attributes.to_s}." unless obj.valid?
        count += 1
      end
    end

    assert errors.empty?, "\n#{errors.join("\n")}"
  end
end