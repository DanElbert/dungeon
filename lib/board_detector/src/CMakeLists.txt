cmake_minimum_required(VERSION 2.8)
project( board_detector )
find_package( OpenCV REQUIRED )
add_executable( find_board find_board.cpp image_manipulator.cpp detector.cpp )


target_link_libraries( find_board ${OpenCV_LIBS} )