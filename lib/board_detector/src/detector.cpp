#include "detector.h"

using namespace cv;

Detector::Detector(int pattern_size, Mat& src) : image(ImageManipulator(src)), pattern_size(pattern_size)
{
}

float Detector::distance(Point2f a, Point2f b) {
  return norm(a - b);
}

Point2f Detector::find_closest_point(const std::vector<Point2f>& points, const Point2f& target) {
  Point2f closest;
  float closest_distance = 999999;

  for (int x = 0; x < points.size(); x++) {
    float dist = distance(points[x], target);
    if (dist < closest_distance) {
      closest_distance = dist;
      closest = points[x];
    }
  }

  return closest;
}

void Detector::set_stage_1_settings(int& soften, int& threshold, int&erode) {
  soften = -1;
  threshold = -1;
  erode = 1;
}

void Detector::set_stage_2_settings(int& soften, int& threshold, int&erode) {
  soften = 3;
  threshold = 75;
  erode = -1;
}

void Detector::set_stage_3_settings(int& soften, int& threshold, int&erode) {
  soften = 3;
  threshold = 100;
  erode = 1;
}

std::vector<Point2f> Detector::calculate_board_corners()
{
  std::vector<Point2f> corners;

  void (*stages[])(int&, int&, int&) = {&set_stage_1_settings, &set_stage_2_settings, &set_stage_3_settings};
  const int stage_count = 3;

  // convert image to B&W
  ImageManipulator greyscale = image.get_grey_scale();

  std::vector<ImageManipulator> quads = greyscale.cut_into_quadrants();

  for (int x = 0; x < 4; x++) {
    ImageManipulator quad = quads[x];
    Size size(pattern_size - 1, pattern_size - 1);
    std::vector<Point2f> pattern_corners;
    bool found = false;
    int attempts = 0;

    while (!found && attempts < stage_count) {
      int soften;
      int threshold;
      int erode;
      ImageManipulator temp = quad.clone();
      (*stages[attempts])(soften, threshold, erode);

      if (soften > 0) { temp.soften(soften); }
      if (threshold > 0) { temp.threshold(threshold); }
      if (erode > 0) { temp.erode(erode); }

      pattern_corners.clear();
      found = findChessboardCorners(temp.get_image(), size, pattern_corners,
          CALIB_CB_ADAPTIVE_THRESH + CALIB_CB_NORMALIZE_IMAGE);

//      if(found)
//        cornerSubPix(temp.get_image(), pattern_corners, Size(11, 11), Size(-1, -1),
//          TermCriteria(CV_TERMCRIT_EPS + CV_TERMCRIT_ITER, 30, 0.1));

      temp.debug(false, &pattern_corners);
      //temp.debug(false);

      attempts++;
    }

    if (found) {
      Point2f target(0,0);
      int offset_x = 0;
      int offset_y = 0;

      if (x == 1) {
        target = Point2f(quad.width(), 0);
        offset_x = quad.width();
      } else if (x == 2) {
        target = Point2f(0, quad.height());
        offset_y = quad.height();
      } else if (x == 3) {
        target = Point2f(quad.width(), quad.height());
        offset_x = quad.width();
        offset_y = quad.height();
      }

      Point2f corner = find_closest_point(pattern_corners, target);
      corner = Point2f(corner.x + offset_x, corner.y + offset_y);
      corners.push_back(corner);
    }
  }

  image.debug(false, &corners);

  return corners;
}