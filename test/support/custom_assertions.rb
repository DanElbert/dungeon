
module CustomAssertions

  def assert_same_elements(expected_collection, actual_collection, message = nil)
    msg = message || "Expected: #{expected_collection.inspect}\nActual: #{actual_collection.inspect}"

    same = !expected_collection.nil? && !actual_collection.nil?

    if same
      same = same_elements?(expected_collection.to_a, actual_collection.to_a)
    end

    assert same, msg
  end

  def difference_between_arrays(array1, array2)
    difference = array1.dup
    array2.each do |element|
      if index = difference.index(element)
        difference.delete_at(index)
      end
    end
    difference
  end

  def same_elements?(array1, array2)
    extra_items = difference_between_arrays(array1, array2)
    missing_items = difference_between_arrays(array2, array1)
    extra_items.empty? & missing_items.empty?
  end


end