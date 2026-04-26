import type { Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

const trajectoryLab = {
  id: "lab_quintic_trajectory",
  title: "Quintic Polynomial Trajectory",
  language: "python" as const,
  theoryConnection: "q(t)=a0+a1t+...+a5t^5 with q, qdot, qddot boundary constraints",
  starterCode: `import numpy as np

def quintic_coeffs(q0, qf, T):
    # boundary: q(0)=q0, q(T)=qf, qdot(0)=qdot(T)=0, qddot(0)=qddot(T)=0
    # TODO: solve 6x6 linear system for coefficients a0..a5
    raise NotImplementedError

def sample(coeffs, t):
    # TODO: return q, qdot, qddot
    raise NotImplementedError

if __name__ == "__main__":
    coeffs = quintic_coeffs(0.0, 1.0, 2.0)
    q, v, a = sample(coeffs, 1.0)
    print(round(q, 3), round(v, 3), round(a, 3))`,
  solutionCode: `import numpy as np

def quintic_coeffs(q0, qf, T):
    A = np.array([
        [1, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0],
        [0, 0, 2, 0, 0, 0],
        [1, T, T**2, T**3, T**4, T**5],
        [0, 1, 2*T, 3*T**2, 4*T**3, 5*T**4],
        [0, 0, 2, 6*T, 12*T**2, 20*T**3],
    ], dtype=float)
    b = np.array([q0, 0, 0, qf, 0, 0], dtype=float)
    return np.linalg.solve(A, b)

def sample(coeffs, t):
    a0,a1,a2,a3,a4,a5 = coeffs
    q = a0 + a1*t + a2*t**2 + a3*t**3 + a4*t**4 + a5*t**5
    v = a1 + 2*a2*t + 3*a3*t**2 + 4*a4*t**3 + 5*a5*t**4
    acc = 2*a2 + 6*a3*t + 12*a4*t**2 + 20*a5*t**3
    return q, v, acc

if __name__ == "__main__":
    coeffs = quintic_coeffs(0.0, 1.0, 2.0)
    q, v, a = sample(coeffs, 1.0)
    print(round(q, 3), round(v, 3), round(a, 3))`,
  testCode: `from quintic_trajectory import quintic_coeffs, sample

def test_boundary_conditions():
    c = quintic_coeffs(0.0, 1.0, 2.0)
    q0,v0,a0 = sample(c, 0.0)
    qf,vf,af = sample(c, 2.0)
    assert abs(q0) < 1e-9 and abs(v0) < 1e-9 and abs(a0) < 1e-9
    assert abs(qf - 1.0) < 1e-9 and abs(vf) < 1e-9 and abs(af) < 1e-9

def test_midpoint():
    c = quintic_coeffs(0.0, 1.0, 2.0)
    assert abs(sample(c, 1.0)[0] - 0.5) < 1e-9`,
  expectedOutput: "0.5 0.938 0.0",
  runCommand: "python quintic_trajectory.py && pytest test_quintic_trajectory.py",
  commonBugs: [
    "velocity/acceleration boundary row에서 미분 계수를 잘못 씀",
    "T 대신 normalized time s=t/T를 섞어 coefficient scale이 틀림",
    "trajectory duration을 너무 짧게 잡아 velocity limit을 넘김",
  ],
  extensionTask: "joint velocity limit을 검사하고 T를 자동으로 늘리는 함수를 추가하라.",
};

export const trajectoryPlanningSessions: Session[] = [
  makeAdvancedSession({
    id: "trajectory_quintic_polynomial",
    part: "Part 2. 로봇 수학",
    title: "Trajectory Planning: 5차 다항식과 속도 프로파일",
    prerequisites: ["robot_math_forward_kinematics", "ode_euler_rk4"],
    objectives: [
      "q, qdot, qddot 경계조건으로 5차 다항식 계수를 구한다.",
      "위치·속도·가속도 profile을 샘플링한다.",
      "T가 짧을수록 velocity/acceleration peak가 커지는 이유를 설명한다.",
      "MoveIt trajectory와 joint limit 검사를 연결한다.",
    ],
    definition: "Trajectory planning은 시작/끝 pose 또는 joint 상태를 시간 함수 q(t)로 매끄럽게 연결하는 과정이다. 5차 다항식은 위치, 속도, 가속도 경계조건 6개를 만족한다.",
    whyItMatters: "FK/IK로 목표 joint를 찾는 것만으로는 로봇이 부드럽게 움직이지 않는다. actuator limit, jerk, collision checking을 만족하는 시간 경로가 필요하다.",
    intuition: "출발과 도착에서 멈춰 있는 엘리베이터처럼 속도와 가속도가 갑자기 튀지 않게 곡선을 잡는 일이다.",
    equations: [
      { label: "Quintic trajectory", expression: "q(t)=a_0+a_1t+a_2t^2+a_3t^3+a_4t^4+a_5t^5", terms: [["a_i", "다항식 계수"], ["T", "duration"]], explanation: "6개 계수로 6개 경계조건을 맞춘다." },
      { label: "Velocity", expression: "\\dot{q}(t)=a_1+2a_2t+3a_3t^2+4a_4t^3+5a_5t^4", terms: [["qdot", "joint velocity"]], explanation: "velocity limit 검사의 기준이다." },
      { label: "Acceleration", expression: "\\ddot{q}(t)=2a_2+6a_3t+12a_4t^2+20a_5t^3", terms: [["qddot", "joint acceleration"]], explanation: "torque 요구량과 승차감에 연결된다." },
    ],
    derivation: [
      ["경계조건 나열", "t=0과 t=T에서 q, qdot, qddot 값을 정한다."],
      ["선형 시스템 구성", "각 조건을 a0..a5에 대한 6x6 행렬로 쓴다."],
      ["계수 풀이", "np.linalg.solve로 coefficient를 구한다."],
      ["limit 검사", "샘플링한 qdot/qddot peak가 actuator limit 안인지 확인한다."],
    ],
    handCalculation: {
      problem: "q0=0,qf=1,T=2에서 중간 t=1의 q는 대칭성으로 얼마인가?",
      given: { q0: 0, qf: 1, T: 2 },
      steps: ["시작/끝 속도와 가속도가 모두 0", "경로가 midpoint 대칭", "t=T/2에서 q=(q0+qf)/2"],
      answer: "q(1)=0.5",
    },
    robotApplication: "MoveIt이 산출한 joint trajectory는 각 waypoint의 position, velocity, acceleration을 포함한다. controller가 이 profile을 따라가야 jerk와 saturation이 줄어든다.",
    lab: trajectoryLab,
    visualization: {
      id: "vis_quintic_trajectory_profile",
      title: "5차 다항식 위치·속도·가속도 프로파일",
      equation: "q(t)=a0+a1t+...+a5t^5",
      parameters: [
        { name: "duration", symbol: "T", min: 0.5, max: 5, default: 2, description: "trajectory duration" },
        { name: "distance", symbol: "\\Delta q", min: 0.1, max: 3, default: 1, description: "joint 이동량" },
      ],
      normalCase: "시작/끝에서 velocity와 acceleration이 0이다.",
      failureCase: "T가 너무 짧으면 velocity peak가 limit을 초과한다.",
    },
    quiz: {
      id: "traj_quintic",
      conceptQuestion: "5차 다항식이 필요한 이유는?",
      conceptAnswer: "위치, 속도, 가속도 시작/끝 조건 6개를 동시에 만족할 수 있기 때문이다.",
      calculationQuestion: "6개 경계조건을 만족하려면 계수는 몇 개인가?",
      calculationAnswer: "6개가 필요하므로 5차 다항식 a0~a5를 쓴다.",
      codeQuestion: "계수 선형 시스템을 푸는 NumPy 한 줄은?",
      codeAnswer: "coeffs = np.linalg.solve(A, b)",
      debugQuestion: "도착점에서 속도가 0이 아니면 어떤 row를 확인하는가?",
      debugAnswer: "t=T에서 qdot(T)=0을 나타내는 [0,1,2T,3T^2,4T^3,5T^4] row를 확인한다.",
      visualQuestion: "duration T를 줄이면 velocity peak는 어떻게 되는가?",
      visualAnswer: "같은 거리를 더 짧은 시간에 가야 하므로 velocity와 acceleration peak가 커진다.",
      robotQuestion: "joint limit 위반 trajectory를 그대로 보내면 어떤 문제가 생기는가?",
      robotAnswer: "controller saturation, tracking error, emergency stop이 발생할 수 있다.",
      designQuestion: "trajectory generator에서 반드시 검사할 제한은?",
      designAnswer: "joint position, velocity, acceleration, jerk, collision, torque limit을 검사한다.",
    },
    wrongTagLabel: "Trajectory boundary/limit 오류",
    nextSessions: ["mpc_1d_receding_horizon", "robot_dynamics_2link_lagrange"],
  }),
];

