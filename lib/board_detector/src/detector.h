#ifndef __DUNGEON_BOARD_DETECTOR_DETECTOR_HPP__
#define __DUNGEON_BOARD_DETECTOR_DETECTOR_HPP__

#include "opencv2/imgproc/imgproc.hpp"
#include "opencv2/calib3d/calib3d.hpp"
#include <stdlib.h>
#include <stdio.h>
#include <iostream>

#include "image_manipulator.h"

using namespace cv;

class Detector {
    int pattern_size;
    ImageManipulator image;
  public:
    Detector(int pattern_size, Mat& src);
    std::vector<Point2f> calculate_board_corners();
  private:
    static void set_stage_1_settings(int& soften, int& threshold, int&erode);
    static void set_stage_2_settings(int& soften, int& threshold, int&erode);
    static void set_stage_3_settings(int& soften, int& threshold, int&erode);
    float distance(Point2f a, Point2f b);
    Point2f find_closest_point(const vector<Point2f>& points, const Point2f& target);
};

#endif