const testcases = [
  {
    label: "Testcase 1",
    settings: {
    },
    streets: [
      {
        angle: -22,
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
            width: 30
          },
          {
            type: "cycle",
            curb: true,
            color: "red",
            oneway: false
          },
        ],
      },
      {
        angle: 180,
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
            width: 30
          },
          {
            type: "cycle",
            curb: true,
            color: "red",
            oneway: false
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
            type: "car",
            paint: true,
            direction: "backward",
          },          
          {
            type: "parking",
            paint: true,
            orientation: "diagonal",
            width: 30
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
        angle: 260,
        lanes: [
          {
            type: "pedestrian",
            curb: true,
            boundary: "building",
            curbHeight: 15,
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
            width: 30
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
  }, // end of testcase 1


];

export default testcases;