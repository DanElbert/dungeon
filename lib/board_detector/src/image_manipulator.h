#ifndef __DUNGEON_BOARD_DETECTOR_IMAGE_MANIPULATOR_HPP__
#define __DUNGEON_BOARD_DETECTOR_IMAGE_MANIPULATOR_HPP__

#include "opencv2/imgproc.hpp"
#include "opencv2/calib3d.hpp"
#include "opencv2/highgui.hpp"
#include <stdlib.h>
#include <stdio.h>
#include <iostream>


class ImageManipulator {
    cv::Mat image;
    static bool debugging;
    static std::string window_name;
  public:
    ImageManipulator(cv::Mat& image);
    cv::Mat get_image() { return this->image; };
    void set_image(cv::Mat& mat) { this->image = mat; };
    ImageManipulator clone();
    ImageManipulator get_grey_scale();
    ImageManipulator get_color();
    ImageManipulator warp(std::vector<cv::Point2f>& corners, int gutter, int output_width, int output_height);
    int width() { return this->image.cols; };
    int height() { return this->image.rows; };
    ImageManipulator half();
    void soften(int size);
    void threshold(int thresh);
    void erode(int size);
    void mask_pattern(int pattern_dimension, int gutter_size);

    std::vector<ImageManipulator> cut_into_quadrants();
    void debug(bool half = false, std::vector<cv::Point2f>* points = NULL, std::vector<cv::KeyPoint>* key_points = NULL);
};

#endif