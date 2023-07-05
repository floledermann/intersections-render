const testcases = [
  { // testcase
    label: "Default Testcase",
    settings: {
    },
    // global settings for entire intersection
    intersection: {
      expand: {
        parking: {
          type: ["pedestrian","cycle","car"], // 
          length: 50 // replaces retractFromCrossing setting
        }
      },
      crossing: {
        pedestrian: ["straight", "left", "right"] // this should be default
      }
    },
    streets: [
      {
        angle: -30,
        lanes: [
          {
            type: "pedestrian",
            curb: true,
            boundary: "building",
          },
          {
            type: "parking",
            paint: true,
            orientation: "parallel",
            width: 22
          },
          {
            type: "car",
            paint: true,
            direction: "backward",
          },          
          {
            type: "car",
            paint: true,
            direction: "forward",
          },          
          {
            type: "parking",
            paint: true,
            orientation: "diagonal",
            width: 37
          },/*
          {
            type: "cycle",
            curb: true,
            color: "red",
            oneway: false
          },*/
          {
            type: "pedestrian",
            curb: true,
            boundary: "building",
          },
        ],
      },
      {
        angle: 170,
        lanes: [
          {
            type: "pedestrian",
            curb: true,
            boundary: "building",
            curbHeight: 15,
          },/*
          {
            type: "cycle",
            curb: true,
            color: "red",
            oneway: false
          },*/
          {
            type: "parking",
            paint: true,
            orientation: "diagonal",
            width: 37
          },
          {
            type: "car",
            paint: true,
            direction: "backward",
          },          
          {
            type: "car",
            paint: true,
            direction: "forward",
          },          
          {
            type: "parking",
            paint: true,
            orientation: "parallel",
            width: 22
          },
          {
            type: "pedestrian",
            curb: true,
            boundary: "building",
            curbHeight: 15,
          },
        ],
      },
      {
        angle: 90,
        lanes: [
          {
            type: "pedestrian",
            curb: true,
            boundary: "building",
            curbHeight: 15,
          },
          {
            type: "cycle",
            curb: true,
            color: "red",
            oneway: false
          },
          {
            type: "car",
            paint: true,
            direction: "backward",
          },          
          {
            type: "parking",
            paint: true,
            orientation: "diagonal",
            width: 37
          },
          {
            type: "pedestrian",
            curb: true,
            boundary: "building",
            curbHeight: 15,
          },
        ],
      },
      {
        angle: 250,
        lanes: [
          {
            type: "pedestrian",
            curb: true,
            boundary: "building",
            curbHeight: 15,
          },
          {
            type: "parking",
            paint: true,
            orientation: "diagonal",
            width: 37
          },
          {
            type: "car",
            paint: true,
            direction: "backward",
          },          
          {
            type: "cycle",
            curb: true,
            color: "red",
            oneway: false
          },
          {
            type: "pedestrian",
            curb: true,
            boundary: "building",
            curbHeight: 15,
          },
        ],
      },
    ],
  }, // end of testcase

  {
    label: "Bend with single car lane continuing",
    streets: [
      {
        angle: -10,
        lanes: [
          {
            type: "car",
          },          
        ],
      },
      {
        angle: 190,
        lanes: [
          {
            type: "car",
          },          
        ],
      },
    ],
  }, // end of testcase

  {
    label: "Bend with single lane, changing type car -> cycle",
    streets: [
      {
        angle: -10,
        lanes: [
          {
            type: "car",
          },          
        ],
      },
      {
        angle: 190,
        lanes: [
          {
            type: "cycle",
          },          
        ],
      },
    ],
  }, // end of testcase

  { // testcase
    label: "Bend with double car lane continuing",
    comment: "Weird extension of intersection polygon for outer lane",
    streets: [
      {
        angle: -10,
        lanes: [
          {
            type: "car",
          },          
          {
            type: "car",
          },          
        ],
      },
      {
        angle: 190,
        lanes: [
          {
            type: "car",
          },          
          {
            type: "car",
          },          
        ],
      },
    ],
  }, // end of testcase

  { // testcase
    label: "Bend with two lane types, car + cycle",
    streets: [
      {
        angle: -10,
        lanes: [
          {
            type: "car",
          },          
          {
            type: "cycle",
          },          
        ],
      },
      {
        angle: 190,
        lanes: [
          {
            type: "cycle",
          },          
          {
            type: "car",
          },          
        ],
      },
    ],
  }, // end of testcase

  { // testcase
    label: "Bend with two lane types, switching sides, car + cycle",
    passes: false,
    streets: [
      {
        angle: -10,
        lanes: [
          {
            type: "car",
          },          
          {
            type: "cycle",
          },          
        ],
      },
      {
        angle: 190,
        lanes: [
          {
            type: "car",
          },          
          {
            type: "cycle",
          },          
        ],
      },
    ],
  }, // end of testcase

  {
    label: "3-way, single car lane continuing",
    streets: [
      {
        angle: -10,
        lanes: [
          {
            type: "car",
          },          
        ],
      },
      {
        angle: 75,
        lanes: [
          {
            type: "car",
          },          
        ],
      },
      {
        angle: 190,
        lanes: [
          {
            type: "car",
          },          
        ],
      },
    ],
  }, // end of testcase

  {
    label: "3-way, single car lane bend + cycle",
    passes: false,
    streets: [
      {
        angle: -10,
        lanes: [
          {
            type: "car",
          },          
        ],
      },
      {
        angle: 75,
        lanes: [
          {
            type: "cycle",
          },          
        ],
      },
      {
        angle: 190,
        lanes: [
          {
            type: "car",
          },          
        ],
      },
    ],
  }, // end of testcase

  {
    label: "3-way, car + cycle, cycle going off",
    streets: [
      {
        angle: -10,
        lanes: [
          {
            type: "cycle",
          },          
          {
            type: "car",
          },          
        ],
      },
      {
        angle: 75,
        lanes: [
          {
            type: "cycle",
          },          
        ],
      },
      {
        angle: 190,
        lanes: [
          {
            type: "car",
          },          
          {
            type: "cycle",
          },          
        ],
      },
    ],
  }, // end of testcase

  {
    label: "3-way, car + cycle, cycle going off across",
    passes: false,
    streets: [
      {
        angle: -10,
        lanes: [
          {
            type: "car",
          },          
          {
            type: "cycle",
          },          
        ],
      },
      {
        angle: 75,
        lanes: [
          {
            type: "cycle",
          },          
        ],
      },
      {
        angle: 190,
        lanes: [
          {
            type: "cycle",
          },          
          {
            type: "car",
          },          
        ],
      },
    ],
  }, // end of testcase


];

export default testcases;