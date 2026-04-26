import type { Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

const torqueLab = {
  id: "lab_cross_product_torque",
  title: "Cross Product Torque",
  language: "python" as const,
  theoryConnection: "tau = r x F",
  starterCode: `import numpy as np

def torque(r, F):
    # TODO: return cross product r x F
    raise NotImplementedError

if __name__ == "__main__":
    print(torque(np.array([1,0,0]), np.array([0,2,0])))`,
  solutionCode: `import numpy as np

def torque(r, F):
    return np.cross(r, F)

if __name__ == "__main__":
    print(torque(np.array([1,0,0]), np.array([0,2,0])))`,
  testCode: `import numpy as np
from cross_product_torque import torque

def test_z_torque():
    assert np.allclose(torque(np.array([1,0,0]), np.array([0,2,0])), [0,0,2])

def test_parallel_zero():
    assert np.allclose(torque(np.array([1,0,0]), np.array([2,0,0])), [0,0,0])`,
  expectedOutput: "[0 0 2]",
  runCommand: "python cross_product_torque.py && pytest test_cross_product_torque.py",
  commonBugs: ["F x r로 순서를 뒤집어 부호가 반대가 됨", "평행한 힘도 토크가 생긴다고 착각함", "lever arm 단위를 cm와 m로 섞음"],
  extensionTask: "3D gripper contact point와 force로 wrist torque limit을 검사하라.",
};

export const crossProductTorqueSessions: Session[] = [
  makeAdvancedSession({
    id: "cross_product_torque",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "외적과 토크: τ = r × F",
    prerequisites: ["vector_matrix_basics", "robot_dynamics_2link_lagrange"],
    objectives: ["외적의 방향과 크기를 오른손 법칙으로 설명한다.", "τ=r×F로 토크를 계산한다.", "lever arm과 force 방향이 토크에 미치는 영향을 이해한다.", "로봇 wrist torque limit과 연결한다."],
    definition: "외적은 두 3D 벡터에 수직인 벡터를 만들며, 토크는 위치 벡터 r과 힘 F의 외적이다.",
    whyItMatters: "로봇팔 끝단에 힘이 작용할 때 각 관절과 wrist에 걸리는 토크를 이해하려면 외적이 필요하다.",
    intuition: "문손잡이를 멀리 잡고 수직으로 밀수록 문이 잘 열리는 이유가 lever arm과 외적 크기다.",
    equations: [
      { label: "Cross product", expression: "a\\times b=\\|a\\|\\|b\\|\\sin\\theta\\,n", terms: [["n", "오른손 법칙 방향"]], explanation: "평행하면 sinθ=0이라 외적이 0이다." },
      { label: "Torque", expression: "\\tau=r\\times F", terms: [["r", "회전축에서 힘 작용점까지 벡터"], ["F", "힘"]], explanation: "힘이 회전을 만들 수 있는 정도다." },
      { label: "Magnitude", expression: "\\|\\tau\\|=\\|r\\|\\|F\\|\\sin\\theta", terms: [["θ", "r과 F 사이 각도"]], explanation: "수직일 때 최대 토크다." },
    ],
    derivation: [["방향", "오른손 네 손가락을 r에서 F로 감으면 엄지가 τ 방향이다."], ["크기", "F의 수직 성분만 회전에 기여한다."], ["순서", "r×F와 F×r는 부호가 반대다."], ["로봇 연결", "contact force를 joint torque limit과 비교한다."]],
    handCalculation: { problem: "r=[1,0,0], F=[0,2,0]이면 τ는?", given: { r: "[1,0,0]", F: "[0,2,0]" }, steps: ["x축 × y축 = z축", "크기=1*2*sin90=2"], answer: "[0,0,2]" },
    robotApplication: "gripper가 물체를 옆으로 밀 때 wrist에서 r×F 토크가 커지면 force limit을 넘기 전에 motion을 멈춰야 한다.",
    lab: torqueLab,
    visualization: { id: "vis_cross_product_torque_robot", title: "외적 방향과 Wrist Torque", equation: "tau=r x F", parameters: [{ name: "force_angle", symbol: "\\theta", min: 0, max: 180, default: 90, description: "r과 F 사이 각도" }, { name: "force", symbol: "F", min: 0, max: 20, default: 2, description: "힘 크기" }], normalCase: "θ=90도에서 토크 크기가 최대다.", failureCase: "순서를 뒤집으면 torque 방향이 반대로 표시된다." },
    quiz: {
      id: "cross_torque",
      conceptQuestion: "r과 F가 평행하면 토크가 0인 이유는?",
      conceptAnswer: "외적 크기가 |r||F|sinθ이고 θ=0이면 sinθ=0이기 때문이다.",
      calculationQuestion: "|r|=0.5m, |F|=10N, θ=90도이면 토크 크기는?",
      calculationAnswer: "0.5*10*1=5 N·m이다.",
      codeQuestion: "NumPy 외적 한 줄은?",
      codeAnswer: "return np.cross(r, F)",
      debugQuestion: "토크 방향이 반대로 나오면 무엇을 확인하는가?",
      debugAnswer: "np.cross(r,F)가 아니라 np.cross(F,r)로 순서를 뒤집었는지 확인한다.",
      visualQuestion: "force_angle을 0도로 두면 토크 크기는?",
      visualAnswer: "0이 된다.",
      robotQuestion: "wrist torque limit에 가까워지면 로봇은 어떻게 해야 하는가?",
      robotAnswer: "속도를 줄이거나 접촉 방향을 바꾸고 limit 초과 전 안전 정지를 수행한다.",
      designQuestion: "force control safety gate에는 어떤 항목이 필요한가?",
      designAnswer: "force magnitude, torque r×F, contact duration, velocity, workspace limit을 함께 본다.",
    },
    wrongTagLabel: "외적/토크 방향 오류",
    nextSessions: ["robot_dynamics_2link_lagrange", "safety_actuator_limit_saturation"],
  }),
];

