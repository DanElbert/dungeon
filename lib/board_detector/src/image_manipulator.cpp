#include "image_manipulator.h"

using namespace cv;

ImageManipulator::ImageManipulator(Mat& image)
{
  this->debugging = false;
  this->image = image;
}

ImageManipulator ImageManipulator::clone()
{
  Mat new_data = this->image.clone();
  return ImageManipulator(new_data);
}

ImageManipulator ImageManipulator::get_grey_scale()
{
  Mat grey;
  cvtColor( this->image, grey, CV_BGR2GRAY );
  return ImageManipulator(grey);
}

ImageManipulator ImageManipulator::get_color()
{
  Mat color;
  cvtColor( this->image, color, CV_GRAY2BGR );
  return ImageManipulator(color);
}

ImageManipulator ImageManipulator::half()
{
  int downsize_width = image.cols - (image.cols % 2);
  int downsize_height = image.rows - (image.rows % 2);
  Mat cut (image, Rect(0, 0, downsize_width, downsize_height));
  Mat dst;
  pyrDown( cut, dst, Size( image.cols/2, image.rows/2 ));
  return ImageManipulator(dst);
}

std::vector<ImageManipulator> ImageManipulator::cut_into_quadrants()
{
  Mat raw_quadrants[4];
  std::vector<ImageManipulator> quadrants;
  quadrants.reserve(4);
  int width = this->image.cols;
  int height = this->image.rows;

  if (width % 2 == 1)
    width = width - 1;

  if (height % 2 == 1)
    height = height - 1;

  int mid_x = width / 2;
  int mid_y = height / 2;

  raw_quadrants[0] = Mat(this->image, Rect(0, 0, width / 2, height / 2));
  raw_quadrants[1] = Mat(this->image, Rect(mid_x, 0, width / 2, height / 2));
  raw_quadrants[2] = Mat(this->image, Rect(0, mid_y, width / 2, height / 2));
  raw_quadrants[3] = Mat(this->image, Rect(mid_x, mid_y, width / 2, height / 2));

  for (int x = 0; x < 4; x++) {
    quadrants.push_back(ImageManipulator(raw_quadrants[x]));
  }

  return quadrants;
}

ImageManipulator ImageManipulator::warp(vector<Point2f>& corners, int gutter, int output_width, int output_height)
{
  vector<Point2f> source(4, Point2f(0,0));
  vector<Point2f> destination(4, Point2f(0,0));

  source[0] = corners[0];
  source[1] = corners[1];
  source[2] = corners[2];
  source[3] = corners[3];

  destination[0] = Point2f(gutter, gutter);
  destination[1] = Point2f(output_width - gutter, gutter);
  destination[2] = Point2f(gutter, output_height - gutter);
  destination[3] = Point2f(output_width - gutter, output_height - gutter);

  //Mat warp_matrix = getPerspectiveTransform( source, destination );
  Mat warp_matrix = findHomography( source, destination );
  Mat result = Mat::zeros(output_height, output_width, image.type() );

  //warpAffine( image, result, warp_matrix, result.size() );
  warpPerspective(image, result, warp_matrix, result.size());

  return ImageManipulator(result);
}

void ImageManipulator::soften(int size) {
  GaussianBlur( image, image, Size(size, size), 0, 0, BORDER_DEFAULT );
}

void ImageManipulator::threshold(int thresh) {
  cv::threshold( image, image, thresh, 250, 0 );
}

void ImageManipulator::erode(int erosion_size) {
  int erosion_type = MORPH_RECT;

  Mat element = getStructuringElement( erosion_type,
                                       Size( 2*erosion_size + 1, 2*erosion_size+1 ),
                                       Point( erosion_size, erosion_size ) );
  /// Apply the erosion operation
  cv::erode( image, image, element );
}

void ImageManipulator::mask_pattern(int pattern_dimension, int gutter_size)
{
  int gutter = gutter_size / 2;
  Point basePoints[] = {Point(0, 0), Point(pattern_dimension, pattern_dimension)};
  int offsets[][2] = {
    {gutter, gutter},
    {gutter, this->height() - (gutter + pattern_dimension)},
    {this->width() - (gutter + pattern_dimension), gutter},
    {this->width() - (gutter + pattern_dimension), this->height() - (gutter + pattern_dimension)}
  };

  Mat img = this->get_image();
  Scalar color(255, 255, 255);

  for (int x = 0; x < 4; x++) {
    cv::rectangle(img, Point(basePoints[0].x + offsets[x][0], basePoints[0].y + offsets[x][1]), Point(basePoints[1].x + offsets[x][0], basePoints[1].y + offsets[x][1]), color, -1, 8);
  }
}

bool ImageManipulator::debugging = false;
string ImageManipulator::window_name = "test";

void ImageManipulator::debug(bool half, std::vector<Point2f>* points, std::vector<KeyPoint>* key_points)
{
#define __DUNGEON_IMAGE_MANIPULATOR_DEBUG
#ifdef __DUNGEON_IMAGE_MANIPULATOR_DEBUG
  if (!debugging) {
    cv::namedWindow( window_name, CV_WINDOW_AUTOSIZE );
    debugging = true;
  }

  ImageManipulator to_show(this->image);
  if (this->image.type() == CV_8UC1) {
    to_show = this->get_color();
  } else {
    to_show = this->clone();
  }

  if (points) {
    for (int x = 0; x < points->size(); x++) {
        Point2f p = (*points)[x];
        Scalar color(0, 255, 0);
        Mat i = to_show.get_image();
        circle(i, p, 6, color, 1);
      }
  }

  if (key_points) {
    for (int x = 0; x < key_points->size(); x++) {
      KeyPoint kp = (*key_points)[x];
      Point2f p = kp.pt;
      Scalar color(0, 0, 255);
      Mat i = to_show.get_image();
      circle(i, p, kp.size / 2, color, 2);
      }
  }

  if (half) { to_show = to_show.half(); }

  imshow(window_name, to_show.get_image());
  waitKey(0);
#endif
}