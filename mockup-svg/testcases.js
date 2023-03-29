const testcases = [
  {
    label: "Testcase 1",
    settings: {
    },
    // globa settings for entire intersection
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
  }, // end of testcase 1


];

export default testcases;