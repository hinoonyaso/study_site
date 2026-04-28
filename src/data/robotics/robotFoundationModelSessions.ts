import type { Session } from "../../types";
import { makeAdvancedSession } from "../core/advancedSessionFactory";

const foundationModelLab = {
  id: "lab_robot_foundation_action_gate",
  title: "Robot Foundation Model Action Token + Safety Gate",
  language: "python" as const,
  theoryConnection: "model token -> decoded action -> safety gate -> robot command",
  starterCode: `import numpy as np

ACTION_TABLE = {
    0: np.array([0.0, 0.0, 0.0]),    # stop
    1: np.array([0.02, 0.0, 0.0]),   # +x
    2: np.array([0.0, 0.02, 0.0]),   # +y
    3: np.array([0.0, 0.0, -0.02]),  # down
}

def decode_action_token(token):
    # TODO: token id -> delta xyz
    raise NotImplementedError

def safety_gate(delta, workspace_radius=0.05):
    # TODO: clamp norm to workspace_radius
    raise NotImplementedError

if __name__ == "__main__":
    cmd = safety_gate(decode_action_token(3))
    print(np.round(cmd, 3))`,
  solutionCode: `import numpy as np

ACTION_TABLE = {
    0: np.array([0.0, 0.0, 0.0]),
    1: np.array([0.02, 0.0, 0.0]),
    2: np.array([0.0, 0.02, 0.0]),
    3: np.array([0.0, 0.0, -0.02]),
}

def decode_action_token(token):
    return ACTION_TABLE.get(int(token), ACTION_TABLE[0]).astype(float)

def safety_gate(delta, workspace_radius=0.05):
    delta = np.asarray(delta, dtype=float)
    norm = np.linalg.norm(delta)
    if norm <= workspace_radius or norm < 1e-12:
        return delta
    return delta * (workspace_radius / norm)

if __name__ == "__main__":
    cmd = safety_gate(decode_action_token(3))
    print(np.round(cmd, 3))`,
  testCode: `import numpy as np
from robot_foundation_action_gate import decode_action_token, safety_gate

def test_unknown_token_stops():
    assert np.allclose(decode_action_token(99), [0, 0, 0])

def test_gate_clamps_norm():
    out = safety_gate(np.array([1.0, 0.0, 0.0]), workspace_radius=0.05)
    assert abs(np.linalg.norm(out) - 0.05) < 1e-12`,
  expectedOutput: "[ 0.    0.   -0.02]",
  runCommand: "python robot_foundation_action_gate.py && pytest test_robot_foundation_action_gate.py",
  commonBugs: [
    "foundation model action token을 actuator command로 바로 보내 safety gate를 우회함",
    "unknown token을 stop으로 처리하지 않아 out-of-vocabulary action이 움직임으로 변함",
    "delta action 단위가 meter인지 joint radian인지 명시하지 않음",
  ],
  extensionTask: "language command confidence와 visual grounding score를 함께 받아 stop/escalate/execute 세 가지 mode로 분기하라.",
};

export const robotFoundationModelSessions: Session[] = [
  makeAdvancedSession({
    id: "robot_foundation_model_deployment",
    part: "Part 7. Physical AI / Embodied AI",
    title: "Robot Foundation Model 개념: RT-2·OpenVLA·π0 배포 체크리스트",
    prerequisites: ["vla_architecture_concepts", "world_model_dreamer_overview", "ros2_control_pid_hardware_loop"],
    objectives: [
      "robot foundation model이 perception, language, action prior를 결합하는 방식을 설명한다.",
      "action tokenization과 continuous action head 차이를 비교한다.",
      "foundation model output을 safety gate로 감싸는 이유를 코드로 확인한다.",
      "실제 로봇 배포 전 offline eval, shadow mode, slow-speed test 순서를 설계한다.",
    ],
    definition:
      "Robot foundation model은 대규모 시각/언어/로봇 데이터로 사전학습되어 다양한 작업에서 action을 생성하거나 policy prior로 쓰이는 범용 로봇 모델이다.",
    whyItMatters:
      "OpenVLA, RT-2, π0 계열은 Physical AI의 최신 흐름이다. 하지만 이 모델들도 ROS2/제어/안전 레이어 없이 actuator에 직접 연결할 수 없다.",
    intuition:
      "큰 모델은 '무엇을 해야 하는지'를 넓게 이해하지만, 실제 로봇팔이 안전하게 움직이는 세부 제한은 별도의 안전 게이트와 controller가 책임진다.",
    equations: [
      {
        label: "Policy prior",
        expression: "a_t \\sim \\pi_\\theta(a|I_t,c,s_t)",
        terms: [["I", "image"], ["c", "language command"], ["s", "robot state"]],
        explanation: "관측과 명령에서 action distribution을 만든다.",
      },
      {
        label: "Action tokenization",
        expression: "token \\rightarrow \\Delta x,\\Delta y,\\Delta z,gripper",
        terms: [["token", "discrete model output"]],
        explanation: "언어 모델형 policy는 action을 token으로 표현할 수 있다.",
      },
      {
        label: "Safety gate",
        expression: "a_{safe}=gate(a, limits, TF, collision, EStop)",
        terms: [["gate", "deployment safety layer"]],
        explanation: "모델 output은 robot controller에 들어가기 전에 제한과 충돌 검사를 통과해야 한다.",
      },
    ],
    derivation: [
      ["입력 정렬", "image, language, proprioception timestamp와 frame을 맞춘다."],
      ["모델 추론", "foundation model이 action token 또는 continuous action을 낸다."],
      ["해석/디코딩", "token을 end-effector delta, joint delta, gripper command로 변환한다."],
      ["안전 게이트", "workspace, joint limit, collision, velocity, confidence를 검사한다."],
      ["제어 실행", "low-level controller가 안전한 command만 actuator로 보낸다."],
    ],
    handCalculation: {
      problem: "action delta norm=0.2m, workspace_radius=0.05m라면 safety gate 후 norm은?",
      given: { norm: 0.2, radius: 0.05 },
      steps: ["norm이 radius보다 크다.", "delta 방향은 유지하고 크기를 0.05로 스케일한다."],
      answer: "0.05m",
    },
    robotApplication:
      "VLA/foundation policy를 실제 팔에 연결할 때는 MoveIt collision check, TF timestamp, gripper force limit, E-stop, watchdog이 모델보다 더 높은 우선순위에 있어야 한다.",
    lab: foundationModelLab,
    visualization: {
      id: "vis_robot_foundation_model_pipeline",
      title: "Robot Foundation Model 배포 파이프라인",
      equation: "vision+language+state -> action token -> safety gate",
      parameters: [
        { name: "confidence", symbol: "p", min: 0, max: 1, default: 0.8, description: "model confidence" },
        { name: "action_norm", symbol: "\\|a\\|", min: 0, max: 0.2, default: 0.02, description: "raw action magnitude" },
      ],
      normalCase: "confidence가 높고 action이 limit 안이면 controller로 전달된다.",
      failureCase: "confidence가 낮거나 action이 workspace를 넘으면 stop/escalate로 바뀐다.",
    },
    quiz: {
      id: "robot_foundation",
      conceptQuestion: "Robot foundation model output을 actuator에 바로 보내면 안 되는 이유는?",
      conceptAnswer: "모델은 물리 limit, 충돌, stale TF, E-stop을 보장하지 않으므로 safety gate와 low-level controller가 필요하다.",
      calculationQuestion: "token table에서 stop=0, +x=1이고 unknown token=99이면 어떤 command로 처리해야 하는가?",
      calculationAnswer: "unknown은 안전하게 stop token 0으로 처리한다.",
      codeQuestion: "unknown token fallback Python 한 줄은?",
      codeAnswer: "return ACTION_TABLE.get(int(token), ACTION_TABLE[0])",
      debugQuestion: "언어 명령과 다른 물체로 움직이면 무엇을 확인하는가?",
      debugAnswer: "visual grounding, command parsing, action token decoding, dataset bias, TF transform을 확인한다.",
      visualQuestion: "confidence가 낮아지면 pipeline은 어떻게 반응해야 하는가?",
      visualAnswer: "execute 대신 stop 또는 human confirmation으로 escalate해야 한다.",
      robotQuestion: "foundation model을 shadow mode로 먼저 돌리는 이유는?",
      robotAnswer: "실제 actuator를 움직이지 않고 모델 action과 안전 gate 로그를 수집해 실패 패턴을 확인하기 위해서다.",
      designQuestion: "A+ 수준의 robot foundation model 배포 체크리스트는?",
      designAnswer: "offline eval, sim rollout, shadow mode, low-speed real test, safety monitor, rollback plan, logging schema를 포함한다.",
    },
    wrongTagLabel: "Robot foundation model/action safety 오류",
    nextSessions: ["sim2real_domain_randomization", "safety_watchdog_timer"],
  }),
];
