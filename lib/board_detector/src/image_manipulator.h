#ifndef __DUNGEON_BOARD_DETECTOR_IMAGE_MANIPULATOR_HPP__
#define __DUNGEON_BOARD_DETECTOR_IMAGE_MANIPULATOR_HPP__

#include "opencv2/imgproc/imgproc.hpp"
#include "opencv2/calib3d/calib3d.hpp"
#include "opencv2/highgui/highgui.hpp"
#include <stdlib.h>
#include <stdio.h>
#include <iostream>

using namespace cv;

class ImageManipulator {
    Mat image;
    static bool debugging;
    static string window_name;
  public:
    ImageManipulator(Mat& image);
    Mat get_image() { return this->image; };
    void set_image(Mat& mat) { this->image = mat; };
    ImageManipulator clone();
    ImageManipulator get_grey_scale();
    ImageManipulator warp(vector<Point2f>& corners);
    int width() { return this->image.cols; };
    int height() { return this->image.rows; };
    ImageManipulator half();
    void soften(int size);
    void threshold(int thresh);
    void erode(int size);

    std::vector<ImageManipulator> cut_into_quadrants();
    void debug(bool half = false, std::vector<Point2f>* points = NULL);
};

#endif