import type { Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

const stereoDepthLab = {
  id: "lab_stereo_disparity_depth",
  title: "Stereo Disparity to Depth Map",
  language: "python" as const,
  theoryConnection: "Z = f * B / d, point = Z * K^{-1} [u,v,1]",
  starterCode: `import numpy as np

def disparity_to_depth(disparity, focal_px, baseline_m):
    # TODO: depth Z = f*B/d, invalid d<=0 -> np.inf
    raise NotImplementedError

def pixel_to_point(u, v, z, fx, fy, cx, cy):
    # TODO: back-project pixel to camera-frame XYZ
    raise NotImplementedError

if __name__ == "__main__":
    disp = np.array([[50.0, 25.0]])
    depth = disparity_to_depth(disp, 500.0, 0.1)
    print(np.round(depth, 3))`,
  solutionCode: `import numpy as np

def disparity_to_depth(disparity, focal_px, baseline_m):
    disparity = np.asarray(disparity, dtype=float)
    depth = np.full_like(disparity, np.inf, dtype=float)
    valid = disparity > 1e-9
    depth[valid] = focal_px * baseline_m / disparity[valid]
    return depth

def pixel_to_point(u, v, z, fx, fy, cx, cy):
    x = (u - cx) * z / fx
    y = (v - cy) * z / fy
    return np.array([x, y, z], dtype=float)

if __name__ == "__main__":
    disp = np.array([[50.0, 25.0]])
    depth = disparity_to_depth(disp, 500.0, 0.1)
    print(np.round(depth, 3))`,
  testCode: `import numpy as np
from stereo_disparity_depth import disparity_to_depth, pixel_to_point

def test_depth_formula():
    z = disparity_to_depth(np.array([50.0]), 500.0, 0.1)
    assert abs(z[0] - 1.0) < 1e-12

def test_invalid_disparity():
    assert np.isinf(disparity_to_depth(np.array([0.0]), 500.0, 0.1)[0])

def test_back_projection_center():
    p = pixel_to_point(320, 240, 2.0, 500, 500, 320, 240)
    assert np.allclose(p, [0, 0, 2])`,
  expectedOutput: "[[1. 2.]]",
  runCommand: "python stereo_disparity_depth.py && pytest test_stereo_disparity_depth.py",
  commonBugs: [
    "disparity가 작을수록 depth가 커진다는 반비례 관계를 뒤집음",
    "baseline 단위를 cm로 넣어 depth가 100배 틀어짐",
    "u,v pixel 중심 cx,cy 보정을 빼먹어 point cloud가 한쪽으로 밀림",
  ],
  extensionTask: "synthetic disparity gradient를 만들고 depth map과 X/Y point cloud를 matplotlib 3D scatter로 저장하라.",
};

export const depthEstimationSessions: Session[] = [
  makeAdvancedSession({
    id: "depth_estimation_stereo_geometry",
    part: "Part 5. 인식 AI와 로봇 비전",
    title: "Depth Estimation 기초: Stereo Disparity와 Point Cloud",
    prerequisites: ["pinhole_camera_projection", "pose_estimation_pnp_6d"],
    objectives: [
      "stereo disparity와 depth의 반비례 관계를 설명한다.",
      "Z=fB/d 식으로 depth map을 계산한다.",
      "camera intrinsics로 pixel+depth를 3D point로 역투영한다.",
      "RealSense/ZED depth API가 내부적으로 제공하는 값을 해석한다.",
    ],
    definition:
      "Depth estimation은 이미지 pixel마다 카메라로부터의 거리 Z를 추정하는 문제다. Stereo 방식은 좌우 이미지의 pixel 차이(disparity)를 이용해 삼각측량으로 depth를 계산한다.",
    whyItMatters:
      "로봇 grasp, collision checking, navigation obstacle map은 2D pixel이 아니라 3D 위치가 필요하다. Depth map은 vision과 robot geometry를 연결하는 다리다.",
    intuition:
      "가까운 물체는 왼쪽/오른쪽 카메라에서 위치 차이가 크게 보이고, 먼 물체는 거의 같은 위치에 보인다. 그 차이를 거리로 바꾸는 것이 stereo depth다.",
    equations: [
      {
        label: "Stereo depth",
        expression: "Z=\\frac{fB}{d}",
        terms: [["f", "focal length in pixels"], ["B", "baseline meters"], ["d", "disparity pixels"]],
        explanation: "disparity가 작을수록 물체가 멀다.",
      },
      {
        label: "Back projection",
        expression: "X=\\frac{(u-c_x)Z}{f_x},\\quad Y=\\frac{(v-c_y)Z}{f_y}",
        terms: [["u,v", "pixel coordinate"], ["cx,cy", "principal point"]],
        explanation: "pixel과 depth를 camera-frame 3D point로 변환한다.",
      },
      {
        label: "Depth uncertainty",
        expression: "\\Delta Z \\approx \\frac{fB}{d^2}\\Delta d",
        terms: [["Δd", "disparity error"]],
        explanation: "멀리 있는 물체는 작은 disparity 오차에도 depth 오차가 크게 증가한다.",
      },
    ],
    derivation: [
      ["삼각측량", "두 카메라 사이 baseline B와 focal length f를 알고 같은 3D 점의 pixel 차이 d를 잰다."],
      ["depth 계산", "similar triangle에서 Z=fB/d가 나온다."],
      ["point cloud", "각 pixel의 Z를 K^{-1}로 역투영해 XYZ 점으로 만든다."],
      ["로봇 연결", "camera frame point를 TF로 base frame에 옮겨 collision/grasp에 사용한다."],
    ],
    handCalculation: {
      problem: "f=500px, B=0.1m, disparity=25px이면 depth는?",
      given: { f: 500, B: 0.1, d: 25 },
      steps: ["Z=fB/d", "Z=500*0.1/25=50/25=2"],
      answer: "2.0m",
    },
    robotApplication:
      "RealSense depth image는 pixel마다 Z를 mm 또는 meter 단위로 제공한다. 이를 camera intrinsics로 point cloud로 바꾸고 TF를 적용해야 robot base 기준 장애물/물체 위치가 된다.",
    lab: stereoDepthLab,
    visualization: {
      id: "vis_stereo_depth_map",
      title: "Stereo Disparity와 Depth Map",
      equation: "Z=fB/d",
      parameters: [
        { name: "disparity", symbol: "d", min: 5, max: 100, default: 50, description: "pixel disparity" },
        { name: "baseline_cm", symbol: "B", min: 3, max: 20, default: 10, description: "camera baseline" },
      ],
      normalCase: "disparity가 충분히 크면 안정적인 near-depth가 나온다.",
      failureCase: "disparity가 0에 가까우면 depth가 무한대로 발산하고 invalid pixel 처리가 필요하다.",
    },
    quiz: {
      id: "depth_stereo",
      conceptQuestion: "Stereo depth에서 disparity가 작다는 것은 무엇을 의미하는가?",
      conceptAnswer: "좌우 이미지 차이가 작으므로 물체가 멀리 있다는 뜻이다.",
      calculationQuestion: "f=400, B=0.2, d=40이면 Z는?",
      calculationAnswer: "Z=400*0.2/40=80/40=2m이다.",
      codeQuestion: "disparity to depth Python 한 줄은?",
      codeAnswer: "depth[valid] = focal_px * baseline_m / disparity[valid]",
      debugQuestion: "point cloud가 x 방향으로 밀려 있으면 무엇을 확인하는가?",
      debugAnswer: "cx/cy principal point 보정과 image resize 후 intrinsics scaling을 확인한다.",
      visualQuestion: "disparity 슬라이더를 낮추면 depth는 어떻게 변하는가?",
      visualAnswer: "Z=fB/d이므로 depth가 커지고 uncertainty도 커진다.",
      robotQuestion: "depth pixel을 바로 grasp 좌표로 쓰면 안 되는 이유는?",
      robotAnswer: "camera frame 좌표이므로 camera->base TF를 적용하고 단위와 timestamp를 맞춰야 한다.",
      designQuestion: "depth 기반 장애물 회피에서 invalid depth를 어떻게 처리하는가?",
      designAnswer: "unknown 또는 conservative occupied로 두고 confidence, temporal filtering, max range gate를 둔다.",
    },
    wrongTagLabel: "Stereo depth/point cloud 오류",
    nextSessions: ["pose_estimation_pnp_6d", "semantic_segmentation_basics"],
  }),
];
