function buildReachCells() {
  var data = {
    creature: [],
    threat: [],
    reach: []
  };

  var x, y;

  var size = arguments[arguments.length - 1];
  var patternSize = arguments.length - 1;

  var pattern = [];

  var makeRow = function(p) {
    return p.split("").concat(p.slice(0, Math.floor(size / 2)).split("").reverse());
  };

  for (y = 0; y < patternSize; y++) {
    pattern.push(makeRow(arguments[y]));
  }

  for (y = Math.floor(size / 2) - 1; y >= 0; y--) {
    pattern.push(makeRow(arguments[y]));
  }

  for (x = 0; x < size; x++) {
    for (y = 0; y < size; y++) {
      switch (pattern[y][x]) {
        case "C":
          data.creature.push([x, y]);
          break;
        case "T":
          data.threat.push([x, y]);
          break;
        case "R":
          data.reach.push([x, y]);
      }
    }
  }

  data.size = size;

  return data;
}

const reachData = {
  medium: buildReachCells(
    "RRR",
    "RTT",
    "RTC",
    5
  ),

  large_long: buildReachCells(
    "0RR",
    "RTT",
    "RTC",
    6
  ),

  large_tall: buildReachCells(
    "000RR",
    "0RRRR",
    "0RTTT",
    "RRTTT",
    "RRTTC",
    10
  ),

  huge_long: buildReachCells(
    "000RRR",
    "0RRRRR",
    "0RTTTT",
    "RRTTTT",
    "RRTTCC",
    "RRTTCC",
    11
  ),

  huge_tall: buildReachCells(
    "00000RRR",
    "000RRRRR",
    "00RRRRRR",
    "0RRRRTTT",
    "0RRRTTTT",
    "RRRTTTTT",
    "RRRTTTCC",
    "RRRTTTCC",
    15
  ),

  gargantuan_long: buildReachCells(
    "00000RRR",
    "000RRRRR",
    "00RRRRRR",
    "0RRRRTTT",
    "0RRRTTTT",
    "RRRTTTTT",
    "RRRTTTCC",
    "RRRTTTCC",
    16
  ),

  gargantuan_tall: buildReachCells(
    "0000000RRR",
    "00000RRRRR",
    "0000RRRRRR",
    "000RRRRRRR",
    "00RRRRRTTT",
    "0RRRRTTTTT",
    "0RRRRTTTTT",
    "RRRRTTTTTT",
    "RRRRTTTTCC",
    "RRRRTTTTCC",
    20
  ),

  colossal_long: buildReachCells(
    "0000000RRRR",
    "00000RRRRRR",
    "0000RRRRRRR",
    "000RRRRRRRR",
    "00RRRRRTTTT",
    "0RRRRTTTTTT",
    "0RRRRTTTTTT",
    "RRRRTTTTTTT",
    "RRRRTTTTCCC",
    "RRRRTTTTCCC",
    "RRRRTTTTCCC",
    22
  ),

  colossal_tall: buildReachCells(
    "00000000000RRRR",
    "000000000RRRRRR",
    "0000000RRRRRRRR",
    "00000RRRRRRRRRR",
    "0000RRRRRRRRRRR",
    "000RRRRRRRRRRRR",
    "000RRRRRRRRTTTT",
    "00RRRRRRRTTTTTT",
    "00RRRRRRTTTTTTT",
    "0RRRRRRTTTTTTTT",
    "0RRRRRRTTTTTTTT",
    "RRRRRRTTTTTTTTT",
    "RRRRRRTTTTTTCCC",
    "RRRRRRTTTTTTCCC",
    "RRRRRRTTTTTTCCC",
    30
  )
};

export default reachData;