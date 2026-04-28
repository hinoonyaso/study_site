import type { Session } from "../../types";
import { makeAdvancedSession } from "../core/advancedSessionFactory";

const pnpPoseLab = {
  id: "lab_pnp_pose_estimation",
  title: "OpenCV solvePnP 6D Pose Estimation",
  language: "python" as const,
  theoryConnection: "s * [u v 1]^T = K [R|t] X, solvePnP estimates rvec,tvec",
  starterCode: `import cv2
import numpy as np

def make_correspondences():
    # TODO: create four 3D square corners and their 2D projections.
    raise NotImplementedError

def estimate_pose(object_points, image_points, K):
    # TODO: cv2.solvePnP and return rvec, tvec
    raise NotImplementedError

if __name__ == "__main__":
    obj, img, K = make_correspondences()
    rvec, tvec = estimate_pose(obj, img, K)
    print(np.round(tvec.ravel(), 3))`,
  solutionCode: `import cv2
import numpy as np

def make_correspondences():
    object_points = np.array([
        [-0.1, -0.1, 0.0],
        [ 0.1, -0.1, 0.0],
        [ 0.1,  0.1, 0.0],
        [-0.1,  0.1, 0.0],
    ], dtype=np.float32)
    K = np.array([[500.0, 0.0, 320.0],
                  [0.0, 500.0, 240.0],
                  [0.0, 0.0, 1.0]], dtype=np.float32)
    rvec_true = np.zeros((3, 1), dtype=np.float32)
    tvec_true = np.array([[0.0], [0.0], [1.0]], dtype=np.float32)
    image_points, _ = cv2.projectPoints(object_points, rvec_true, tvec_true, K, None)
    return object_points, image_points.reshape(-1, 2), K

def estimate_pose(object_points, image_points, K):
    ok, rvec, tvec = cv2.solvePnP(object_points, image_points, K, None, flags=cv2.SOLVEPNP_ITERATIVE)
    if not ok:
        raise RuntimeError("solvePnP failed")
    return rvec, tvec

if __name__ == "__main__":
    obj, img, K = make_correspondences()
    rvec, tvec = estimate_pose(obj, img, K)
    print(np.round(tvec.ravel(), 3))`,
  testCode: `import numpy as np
from pnp_pose_estimation import make_correspondences, estimate_pose

def test_pnp_translation():
    obj, img, K = make_correspondences()
    _, tvec = estimate_pose(obj, img, K)
    assert np.allclose(tvec.ravel(), [0, 0, 1], atol=1e-4)

def test_correspondence_shapes():
    obj, img, K = make_correspondences()
    assert obj.shape == (4, 3)
    assert img.shape == (4, 2)
    assert K.shape == (3, 3)`,
  expectedOutput: "[0. 0. 1.]",
  runCommand: "python pnp_pose_estimation.py && pytest test_pnp_pose_estimation.py",
  commonBugs: [
    "2D image point 순서와 3D object point 순서가 다름",
    "K의 fx/fy/cx/cy를 잘못 넣어 translation scale이 틀어짐",
    "rvec를 Euler angle로 착각해 Rodrigues 변환을 빼먹음",
  ],
  extensionTask: "8개 corner와 Gaussian pixel noise를 추가하고 reprojection error 평균을 계산하라.",
};

export const poseEstimationSessions: Session[] = [
  makeAdvancedSession({
    id: "pose_estimation_pnp_6d",
    part: "Part 5. 인식 AI와 로봇 비전",
    title: "6D Pose Estimation 기초: PnP와 solvePnP",
    prerequisites: ["pinhole_camera_projection", "opencv_threshold_contour_basics", "quaternion_slerp_so3"],
    objectives: [
      "6D pose가 3D translation과 3D rotation임을 설명한다.",
      "pinhole projection 식에서 K, R, t의 역할을 분리한다.",
      "2D-3D 대응점으로 cv2.solvePnP를 실행한다.",
      "reprojection error로 pose 품질을 평가한다.",
    ],
    definition:
      "6D pose estimation은 물체 좌표계가 카메라 좌표계에 대해 어떤 3D 위치와 3D 방향을 갖는지 추정하는 문제다. PnP는 3D 점과 2D pixel 대응으로 이 pose를 구한다.",
    whyItMatters:
      "로봇 grasp planning은 물체 bbox만으로 부족하다. gripper가 접근할 방향과 회전까지 알아야 하므로 6D pose가 필요하다.",
    intuition:
      "정사각형 마커의 네 꼭짓점이 이미지에서 어디에 찍혔는지 보고, 카메라 앞에 실제 정사각형이 어느 거리와 각도로 놓였는지 역으로 맞추는 것이다.",
    equations: [
      {
        label: "Projection model",
        expression: "s\\begin{bmatrix}u\\\\v\\\\1\\end{bmatrix}=K[R|t]X",
        terms: [["K", "camera intrinsics"], ["R,t", "object-to-camera pose"], ["X", "3D object point"]],
        explanation: "3D 점을 pose와 camera intrinsics로 pixel에 투영한다.",
      },
      {
        label: "Reprojection error",
        expression: "e_i=\\|p_i-\\hat p_i(R,t)\\|_2",
        terms: [["p_i", "observed pixel"], ["p_hat", "projected pixel"]],
        explanation: "추정 pose가 2D 관측을 얼마나 잘 재현하는지 측정한다.",
      },
      {
        label: "Rodrigues",
        expression: "R=Rodrigues(rvec)",
        terms: [["rvec", "axis-angle rotation vector"]],
        explanation: "OpenCV solvePnP는 회전을 rotation vector로 반환한다.",
      },
    ],
    derivation: [
      ["3D 모델 점", "물체 좌표계의 corner 또는 keypoint를 준비한다."],
      ["2D 검출 점", "이미지에서 같은 순서의 pixel keypoint를 검출한다."],
      ["PnP 최적화", "R,t를 바꿔 projection error 합이 작아지도록 맞춘다."],
      ["로봇 변환", "camera->base TF와 곱해 grasp frame으로 변환한다."],
    ],
    handCalculation: {
      problem: "fx=500, X=0.1m, Z=1.0m이면 중심에서 u offset은?",
      given: { fx: 500, X: 0.1, Z: 1.0 },
      steps: ["u-cx = fx*X/Z", "500*0.1/1=50"],
      answer: "중심에서 50 pixel 오른쪽",
    },
    robotApplication:
      "FoundationPose, AprilTag, ArUco, SAM6D 결과는 모두 결국 object pose를 camera/base frame으로 만들고 MoveIt grasp pose 후보로 넘기는 흐름에 들어간다.",
    lab: pnpPoseLab,
    visualization: {
      id: "vis_pose_estimation_pnp",
      title: "PnP Reprojection Error와 6D Pose",
      equation: "s p = K[R|t]X",
      parameters: [
        { name: "pixel_noise", symbol: "\\sigma_p", min: 0, max: 5, default: 1, description: "2D keypoint noise" },
        { name: "depth_z", symbol: "Z", min: 0.4, max: 2.0, default: 1.0, description: "object distance" },
      ],
      normalCase: "2D-3D 대응점 순서가 맞으면 reprojection error가 작다.",
      failureCase: "대응점 순서가 섞이면 pose가 뒤집히거나 translation이 크게 틀어진다.",
    },
    quiz: {
      id: "pose_pnp",
      conceptQuestion: "6D pose에서 6D는 무엇을 의미하는가?",
      conceptAnswer: "3D translation x,y,z와 3D rotation roll,pitch,yaw 또는 SO(3) 방향을 뜻한다.",
      calculationQuestion: "fx=400, X=0.05, Z=0.5이면 pixel offset은?",
      calculationAnswer: "400*0.05/0.5=40 pixel이다.",
      codeQuestion: "OpenCV PnP 호출 한 줄은?",
      codeAnswer: "ok, rvec, tvec = cv2.solvePnP(object_points, image_points, K, None)",
      debugQuestion: "solvePnP pose가 심하게 튀면 가장 먼저 무엇을 확인하는가?",
      debugAnswer: "2D/3D point 순서, camera intrinsics, pixel 단위, reprojection error를 확인한다.",
      visualQuestion: "pixel_noise를 키우면 reprojection error는?",
      visualAnswer: "2D keypoint가 흔들려 pose 불확실성과 reprojection error가 커진다.",
      robotQuestion: "pose가 camera frame에 있을 때 grasp를 위해 무엇이 더 필요한가?",
      robotAnswer: "camera->base TF를 곱해 robot base 또는 end-effector frame의 pose로 변환해야 한다.",
      designQuestion: "6D pose estimator 배포 전 안전 검증은?",
      designAnswer: "reprojection error threshold, pose jump filter, workspace bound, collision check, slow-speed grasp dry-run이 필요하다.",
    },
    wrongTagLabel: "PnP/6D pose estimation 오류",
    nextSessions: ["depth_estimation_stereo_geometry", "ros2_subscriber_pub_loop"],
  }),
];
