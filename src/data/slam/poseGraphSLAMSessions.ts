import type { Session } from "../../types";
import { makeAdvancedSession } from "../core/advancedSessionFactory";

const poseGraphLab = {
  id: "lab_pose_graph_loop_closure",
  title: "Pose Graph Loop Closure Toy Optimizer",
  language: "python" as const,
  theoryConnection: "minimize odometry edge error plus loop closure edge error",
  starterCode: `import numpy as np

def apply_loop_closure(poses, closure_error):
    # TODO: distribute loop closure correction across trajectory
    raise NotImplementedError

if __name__ == "__main__":
    poses = np.array([[0,0],[1,0],[2,0],[3,0],[4,0.4]], dtype=float)
    fixed = apply_loop_closure(poses, closure_error=np.array([0.0, -0.4]))
    print(np.round(fixed[-1], 3))`,
  solutionCode: `import numpy as np

def apply_loop_closure(poses, closure_error):
    poses = poses.astype(float).copy()
    n = len(poses)
    for i in range(n):
        poses[i] += (i / (n - 1)) * closure_error
    return poses

if __name__ == "__main__":
    poses = np.array([[0,0],[1,0],[2,0],[3,0],[4,0.4]], dtype=float)
    fixed = apply_loop_closure(poses, closure_error=np.array([0.0, -0.4]))
    print(np.round(fixed[-1], 3))`,
  testCode: `import numpy as np
from pose_graph_loop_closure import apply_loop_closure

def test_loop_endpoint_corrected():
    poses = np.array([[0,0],[1,0],[2,0.2]], dtype=float)
    out = apply_loop_closure(poses, np.array([0.0, -0.2]))
    assert np.allclose(out[-1], [2,0])

def test_start_fixed():
    poses = np.array([[0,0],[1,0]], dtype=float)
    out = apply_loop_closure(poses, np.array([0.0, 1.0]))
    assert np.allclose(out[0], [0,0])`,
  expectedOutput: "[4. 0.]",
  runCommand: "python pose_graph_loop_closure.py && pytest test_pose_graph_loop_closure.py",
  commonBugs: ["loop edge를 모든 pose에 같은 크기로 더해 시작점까지 움직임", "false positive loop closure를 검증 없이 적용함", "edge information matrix를 무시함"],
  extensionTask: "Gauss-Newton으로 1D pose graph least-squares를 직접 구현하라.",
};

export const poseGraphSLAMSessions: Session[] = [
  makeAdvancedSession({
    id: "pose_graph_slam_basics",
    part: "Part 4. 자율주행과 SLAM",
    title: "Graph-based SLAM과 Loop Closure",
    prerequisites: ["slam_occupancy_grid", "least_squares", "quaternion_so3_slerp"],
    objectives: ["pose graph의 node와 edge를 설명한다.", "odometry drift와 loop closure correction을 구분한다.", "least-squares error minimization 형태를 이해한다.", "slam_toolbox graph optimization과 연결한다."],
    definition: "Pose graph SLAM은 로봇 pose를 node, odometry/loop closure constraint를 edge로 두고 전체 pose trajectory가 edge measurement를 가장 잘 만족하도록 최적화한다.",
    whyItMatters: "Occupancy grid가 local mapping이라면 pose graph는 장거리 drift와 loop closure를 다룬다. 실내 SLAM에서 복도 한 바퀴 후 map이 어긋나는 문제를 줄이는 핵심이다.",
    intuition: "고무줄처럼 이어진 이동 경로의 끝이 시작점과 안 맞을 때, loop closure가 고무줄 전체를 조금씩 당겨 닫아주는 느낌이다.",
    equations: [
      { label: "Pose graph objective", expression: "\\min_x \\sum_{(i,j)} e_{ij}(x_i,x_j)^T\\Omega_{ij}e_{ij}(x_i,x_j)", terms: [["e_ij", "edge residual"], ["Ω_ij", "information matrix"]], explanation: "모든 edge 오차를 weighted least squares로 줄인다." },
      { label: "Odometry edge", expression: "e_{i,i+1}=z_{i,i+1}^{-1}(x_i^{-1}x_{i+1})", terms: [["z", "measured relative pose"]], explanation: "연속 pose 사이 측정과 현재 추정 차이다." },
      { label: "Loop closure", expression: "z_{0,n}: x_n \\approx x_0", terms: [["z_0n", "재방문 constraint"]], explanation: "긴 drift를 줄이는 강한 edge가 된다." },
    ],
    derivation: [["node 구성", "각 timestamp의 pose를 optimization variable로 둔다."], ["edge residual", "측정 상대 pose와 추정 상대 pose 차이를 계산한다."], ["information weight", "신뢰도 높은 edge에 더 큰 weight를 준다."], ["반복 최적화", "Gauss-Newton/LM으로 residual을 줄인다."]],
    handCalculation: { problem: "마지막 pose y drift가 0.4이고 loop closure가 y=-0.4 correction을 요구하면 마지막 y는?", given: { y_last: 0.4, correction: -0.4 }, steps: ["y_new=0.4-0.4"], answer: "0.0" },
    robotApplication: "slam_toolbox는 scan matching edge와 loop closure edge를 최적화해 /map을 갱신한다. 잘못된 loop closure는 전체 지도를 찌그러뜨리므로 검증이 중요하다.",
    lab: poseGraphLab,
    visualization: { id: "vis_pose_graph_slam_basics", title: "Pose Graph Optimization 전/후", equation: "min sum e^T Omega e", parameters: [{ name: "loop_weight", symbol: "\\Omega", min: 0, max: 10, default: 5, description: "loop closure weight" }, { name: "drift", symbol: "d", min: 0, max: 1, default: 0.4, description: "odometry drift" }], normalCase: "loop closure 후 trajectory gap이 줄어든다.", failureCase: "false loop closure weight가 크면 map 전체가 찌그러진다." },
    quiz: {
      id: "pose_graph",
      conceptQuestion: "Pose graph에서 node와 edge는 각각 무엇인가?",
      conceptAnswer: "node는 robot pose, edge는 odometry나 loop closure 같은 relative pose constraint다.",
      calculationQuestion: "residual=2, information=3인 scalar edge cost는?",
      calculationAnswer: "e^TΩe=2*3*2=12이다.",
      codeQuestion: "linear correction을 i/(n-1)만큼 분배하는 이유는?",
      codeAnswer: "시작 pose는 고정하고 끝 pose로 갈수록 loop correction을 크게 적용하기 위해서다.",
      debugQuestion: "loop closure 후 map이 더 찌그러지면 무엇을 의심하는가?",
      debugAnswer: "false positive loop closure 또는 과도하게 큰 information weight를 의심한다.",
      visualQuestion: "loop_weight를 키우면 trajectory는 어떻게 변하는가?",
      visualAnswer: "loop edge를 더 강하게 만족하도록 끝 gap이 더 줄지만 false closure 위험도 커진다.",
      robotQuestion: "복도 한 바퀴 후 지도 끝이 안 맞으면 어떤 SLAM 기능이 필요한가?",
      robotAnswer: "loop closure detection과 pose graph optimization이 필요하다.",
      designQuestion: "loop closure를 안전하게 적용하려면?",
      designAnswer: "scan similarity, geometric consistency, robust kernel, max correction threshold를 둔다.",
    },
    wrongTagLabel: "Pose graph/loop closure 오류",
    nextSessions: ["particle_filter_sir", "imu_preintegration_basic"],
  }),
];

