import type { Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

const projectionLab = {
  id: "lab_pinhole_projection",
  title: "Pinhole Camera Projection",
  language: "python" as const,
  theoryConnection: "u=fx*X/Z+cx, v=fy*Y/Z+cy and inverse with depth",
  starterCode: `import numpy as np

def project_point(P, fx, fy, cx, cy):
    # TODO: 3D camera point -> pixel
    raise NotImplementedError

def pixel_to_ray(u, v, depth, fx, fy, cx, cy):
    # TODO: pixel + depth -> 3D camera point
    raise NotImplementedError

if __name__ == "__main__":
    print(project_point(np.array([1.0, 0.5, 2.0]), 400, 400, 320, 240))
    print(np.round(pixel_to_ray(520, 340, 2.0, 400, 400, 320, 240), 3))`,
  solutionCode: `import numpy as np

def project_point(P, fx, fy, cx, cy):
    X, Y, Z = P
    return np.array([fx * X / Z + cx, fy * Y / Z + cy])

def pixel_to_ray(u, v, depth, fx, fy, cx, cy):
    X = (u - cx) * depth / fx
    Y = (v - cy) * depth / fy
    return np.array([X, Y, depth])

if __name__ == "__main__":
    print(project_point(np.array([1.0, 0.5, 2.0]), 400, 400, 320, 240))
    print(np.round(pixel_to_ray(520, 340, 2.0, 400, 400, 320, 240), 3))`,
  testCode: `import numpy as np
from pinhole_projection import project_point, pixel_to_ray

def test_projection_inverse():
    P = np.array([1.0, 0.5, 2.0])
    uv = project_point(P, 400, 400, 320, 240)
    assert np.allclose(pixel_to_ray(uv[0], uv[1], 2.0, 400, 400, 320, 240), P)

def test_center_pixel():
    assert np.allclose(pixel_to_ray(320, 240, 2.0, 400, 400, 320, 240), [0,0,2])`,
  expectedOutput: "[520. 340.]\n[1.  0.5 2. ]",
  runCommand: "python pinhole_projection.py && pytest test_pinhole_projection.py",
  commonBugs: ["Z로 나누지 않음", "cx/cy principal point를 빼먹음", "depth가 camera z인지 ray length인지 혼동함"],
  extensionTask: "camera_link 점을 base_link로 변환하는 TF 행렬을 추가하라.",
};

export const pinholeProjectionSessions: Session[] = [
  makeAdvancedSession({
    id: "pinhole_camera_projection",
    part: "Part 5. 인식 AI와 로봇 비전",
    title: "Camera Intrinsics와 Pinhole Projection",
    prerequisites: ["cnn_conv2d_feature_map", "ros2_tf2_transform"],
    objectives: ["3D camera point를 pixel로 투영한다.", "pixel과 depth에서 3D point를 복원한다.", "camera intrinsics fx,fy,cx,cy의 의미를 설명한다.", "depth 기반 grasp point 계산과 TF2를 연결한다."],
    definition: "Pinhole camera model은 3D camera frame 점을 초점거리와 principal point로 이미지 pixel에 투영하는 기본 카메라 기하 모델이다.",
    whyItMatters: "로봇이 detection box 중심을 실제 grasp 위치로 바꾸려면 pixel, depth, camera intrinsics, TF2를 모두 연결해야 한다.",
    intuition: "카메라 중심에서 물체로 가는 광선이 이미지 평면을 뚫는 위치가 pixel 좌표다.",
    equations: [
      { label: "Projection", expression: "u=f_xX/Z+c_x,\\quad v=f_yY/Z+c_y", terms: [["X,Y,Z", "camera frame 3D point"], ["u,v", "pixel"]], explanation: "깊이 Z가 클수록 같은 물체가 작게 보인다." },
      { label: "Back projection", expression: "X=(u-c_x)Z/f_x,\\quad Y=(v-c_y)Z/f_y", terms: [["Z", "depth"]], explanation: "depth가 있어야 pixel을 3D point로 되돌릴 수 있다." },
      { label: "Camera matrix", expression: "K=\\begin{bmatrix}f_x&0&c_x\\\\0&f_y&c_y\\\\0&0&1\\end{bmatrix}", terms: [["K", "intrinsic matrix"]], explanation: "카메라 내부 파라미터를 행렬로 묶는다." },
    ],
    derivation: [["similar triangle", "X/Z 비율이 image plane 위치를 결정한다."], ["principal point", "카메라 중심 pixel offset cx,cy를 더한다."], ["depth inverse", "pixel offset에 depth/focal length를 곱한다."], ["TF 연결", "camera point를 base_link로 변환해야 action이 가능하다."]],
    handCalculation: { problem: "fx=400,cx=320,X=1,Z=2이면 u는?", given: { fx: 400, cx: 320, X: 1, Z: 2 }, steps: ["u=400*1/2+320", "u=520"], answer: "u=520 px" },
    robotApplication: "RGB-D 카메라 detection center와 depth를 3D point로 변환한 뒤 camera_link->base_link TF를 적용하면 grasp target이 된다.",
    lab: projectionLab,
    visualization: { id: "vis_pinhole_projection", title: "3D Point와 Pixel Projection", equation: "u=fxX/Z+cx", parameters: [{ name: "depth", symbol: "Z", min: 0.3, max: 5, default: 2, description: "depth meter" }, { name: "fx", symbol: "f_x", min: 100, max: 1000, default: 400, description: "focal length px" }], normalCase: "depth가 커지면 pixel 이동량이 줄어든다.", failureCase: "depth가 없거나 TF frame이 틀리면 grasp point가 크게 어긋난다." },
    quiz: {
      id: "pinhole",
      conceptQuestion: "pixel 하나만으로 3D point를 알 수 없는 이유는?",
      conceptAnswer: "pixel은 camera ray 방향만 주고 깊이 Z가 없으면 ray 위 어느 점인지 알 수 없기 때문이다.",
      calculationQuestion: "fx=500,X=0.2,Z=1,cx=320이면 u는?",
      calculationAnswer: "u=500*0.2/1+320=420이다.",
      codeQuestion: "pixel에서 X를 복원하는 코드 한 줄은?",
      codeAnswer: "X = (u - cx) * depth / fx",
      debugQuestion: "복원된 3D 점이 좌우 반전되면 무엇을 확인하는가?",
      debugAnswer: "camera frame 축 convention과 u-cx 부호를 확인한다.",
      visualQuestion: "depth를 늘리면 같은 X의 pixel offset은?",
      visualAnswer: "X/Z가 작아져 principal point에 가까워진다.",
      robotQuestion: "detection을 grasp pose로 바꾸는 데 필요한 정보는?",
      robotAnswer: "pixel 위치, depth, camera intrinsics, camera_link에서 base_link까지 TF가 필요하다.",
      designQuestion: "depth outlier가 있을 때 안전 gate는?",
      designAnswer: "depth validity, workspace bound, temporal consistency, collision check를 통과해야 action을 허용한다.",
    },
    wrongTagLabel: "Camera projection/depth/TF 오류",
    nextSessions: ["semantic_segmentation_basics", "vla_architecture_concepts"],
  }),
];

