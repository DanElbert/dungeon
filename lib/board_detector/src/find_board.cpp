#include "opencv2/core/core.hpp"
#include "opencv2/imgproc/imgproc.hpp"
#include "opencv2/calib3d/calib3d.hpp"
#include "opencv2/highgui/highgui.hpp"
#include <stdlib.h>
#include <stdio.h>
#include <iostream>

#include "image_manipulator.h"
#include "detector.h"

using namespace std;

int main( int argc, char** argv )
{
  cv::Mat src_image;
  src_image = imread( argv[1] );

  if( !src_image.data )
    { return -1; }

  Detector detector(4, src_image);

  vector<cv::Point2f> corners = detector.calculate_board_corners();

  ImageManipulator orig(src_image);

  ImageManipulator warped = orig.warp(corners);

  warped.debug();

  cout << corners << endl;

  return 0;
}