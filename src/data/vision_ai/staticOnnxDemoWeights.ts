export const tinyOnnxDemoWeights = {
  inputSize: 8,
  inputName: "image",
  outputName: "class_logits",
  layout: "NCHW float32 [1,1,8,8]",
  classes: ["empty", "lane", "box"],
  kernels: [
    {
      name: "vertical edge",
      weights: [
        [-0.5, 0, 0.5],
        [-1, 0, 1],
        [-0.5, 0, 0.5],
      ],
    },
    {
      name: "horizontal edge",
      weights: [
        [-0.5, -1, -0.5],
        [0, 0, 0],
        [0.5, 1, 0.5],
      ],
    },
    {
      name: "center blob",
      weights: [
        [0, 0.25, 0],
        [0.25, 1, 0.25],
        [0, 0.25, 0],
      ],
    },
  ],
  dense: [
    [-1.1, -0.8, -0.55],
    [1.25, 0.1, -0.25],
    [0.35, 0.65, 1.1],
  ],
  bias: [0.85, -0.18, -0.32],
} as const;
