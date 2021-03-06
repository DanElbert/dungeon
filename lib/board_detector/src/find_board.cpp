#include "opencv2/core/core.hpp"
#include "opencv2/imgproc.hpp"
#include "opencv2/calib3d.hpp"
#include "opencv2/highgui.hpp"
#include "opencv2/features2d.hpp"
#include <stdlib.h>
#include <stdio.h>
#include <iostream>


#include "image_manipulator.h"
#include "detector.h"

using namespace std;

int main( int argc, char** argv )
{
  if (argc < 6) { return -1; }

  cv::Mat src_image;
  src_image = cv::imread( argv[1] );

  if( !src_image.data )
    { return -1; }

  int pattern_size = atoi(argv[2]);
  int pattern_dimension = atoi(argv[3]);
  int output_size_x = atoi(argv[4]);
  int output_size_y = atoi(argv[5]);

  Detector detector(pattern_size, src_image);

  vector<cv::Point2f> corners = detector.calculate_board_corners();

  if (corners.size() < 4) {
    cerr << "No Board Found" << endl;
    return -1;
  }

  ImageManipulator orig(src_image);
  int gutter = (pattern_dimension / pattern_size) * 2;
  ImageManipulator warped = orig.warp(corners, gutter, output_size_x, output_size_y);
  warped.mask_pattern(pattern_dimension, gutter);

  warped.debug();

  cv::SimpleBlobDetector::Params parameters;
  parameters.filterByArea = true;
  parameters.minArea = 750;
  parameters.maxArea = 5000000;
  parameters.filterByInertia = false;
  parameters.filterByConvexity = false;
  parameters.minThreshold = 100;
  parameters.maxThreshold = 200;
  parameters.thresholdStep = 4;

  cv::Ptr<cv::SimpleBlobDetector> blob_detector = cv::SimpleBlobDetector::create(parameters);

//  int minHessian = 400;
//  cv::SurfFeatureDetector blob_detector( minHessian );

  vector<cv::KeyPoint> keypoints;
  blob_detector->detect(warped.get_image(), keypoints);

  warped.debug(false, NULL, &keypoints);

  // output json
  cout << "{ \"width\": " << warped.width() << ", \"height\": " << warped.height() << ", \"items\": [";

  for (int x = 0; x < keypoints.size(); x++) {
    cv::KeyPoint kp = keypoints[x];
    if (x != 0) { cout << ","; }
    float center_x = kp.pt.x;
    float center_y = kp.pt.y;
    float size = kp.size;
    cout << "{ \"center\": [" << center_x << ", " << center_y << "], \"size\": " << size << "}";
  }

  cout << "]}" << endl;

  return 0;
}