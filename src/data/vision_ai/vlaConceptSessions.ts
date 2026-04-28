import type { Session } from "../../types";
import { makeAdvancedSession } from "../core/advancedSessionFactory";

const vlaLab = {
  id: "lab_vla_action_token_mock",
  title: "VLA Action Token Mock Pipeline",
  language: "python" as const,
  theoryConnection: "vision embedding + language embedding -> action head -> robot command",
  starterCode: `import numpy as np

def fuse_embeddings(vision, language):
    # TODO: concatenate and normalize
    raise NotImplementedError

def action_head(fused, W):
    # TODO: linear action head
    raise NotImplementedError

if __name__ == "__main__":
    z = fuse_embeddings(np.array([1.0, 0.0]), np.array([0.0, 1.0]))
    W = np.ones((2, 4))
    print(np.round(action_head(z, W), 3))`,
  solutionCode: `import numpy as np

def fuse_embeddings(vision, language):
    z = np.concatenate([vision, language]).astype(float)
    return z / max(np.linalg.norm(z), 1e-12)

def action_head(fused, W):
    return W @ fused

if __name__ == "__main__":
    z = fuse_embeddings(np.array([1.0, 0.0]), np.array([0.0, 1.0]))
    W = np.ones((2, 4))
    print(np.round(action_head(z, W), 3))`,
  testCode: `import numpy as np
from vla_action_token_mock import fuse_embeddings, action_head

def test_fusion_norm():
    z = fuse_embeddings(np.array([1,0]), np.array([0,1]))
    assert abs(np.linalg.norm(z) - 1) < 1e-12

def test_action_shape():
    z = np.ones(4)
    assert action_head(z, np.ones((3,4))).shape == (3,)`,
  expectedOutput: "[1.414 1.414]",
  runCommand: "python vla_action_token_mock.py && pytest test_vla_action_token_mock.py",
  commonBugs: ["언어 명령과 관측 timestamp가 다른데 그대로 fusion", "action head output 단위를 robot controller와 맞추지 않음", "safety gate 없이 end-to-end action을 바로 보냄"],
  extensionTask: "action output을 joint delta, gripper command, stop token으로 분리하고 safety clamp를 추가하라.",
};

const vlaTrainableLab = {
  id: "lab_vla_tiny_action_head_train",
  title: "Tiny Trainable VLA Action Head",
  language: "python" as const,
  theoryConnection: "min mean||W[vision,language,state]-a*||^2 with gradient descent",
  starterCode: `import numpy as np

def make_dataset(n=200, seed=0):
    # TODO: synthetic vision/language/state features and expert actions
    raise NotImplementedError

def train_linear_action_head(X, Y, lr=0.1, steps=300):
    # TODO: gradient descent on MSE
    raise NotImplementedError

if __name__ == "__main__":
    X, Y = make_dataset()
    W, losses = train_linear_action_head(X, Y)
    print(round(losses[-1], 4))`,
  solutionCode: `import numpy as np

def make_dataset(n=200, seed=0):
    rng = np.random.default_rng(seed)
    vision = rng.normal(size=(n, 2))
    language = rng.integers(0, 2, size=(n, 1)).astype(float)
    state = rng.normal(scale=0.2, size=(n, 1))
    X = np.hstack([vision, language, state, np.ones((n, 1))])
    true_W = np.array([[0.5, -0.2], [0.1, 0.4], [0.8, -0.8], [-0.3, 0.2], [0.05, -0.02]])
    Y = X @ true_W + rng.normal(scale=0.01, size=(n, 2))
    return X, Y

def train_linear_action_head(X, Y, lr=0.1, steps=300):
    W = np.zeros((X.shape[1], Y.shape[1]))
    losses = []
    for _ in range(steps):
        pred = X @ W
        err = pred - Y
        losses.append(float(np.mean(err ** 2)))
        grad = (2.0 / len(X)) * X.T @ err
        W -= lr * grad
    return W, losses

if __name__ == "__main__":
    X, Y = make_dataset()
    W, losses = train_linear_action_head(X, Y)
    print(round(losses[-1], 4))`,
  testCode: `from vla_tiny_action_head_train import make_dataset, train_linear_action_head

def test_loss_decreases():
    X, Y = make_dataset(seed=1)
    _, losses = train_linear_action_head(X, Y, steps=200)
    assert losses[-1] < 0.01
    assert losses[-1] < losses[0]`,
  expectedOutput: "0.0001",
  runCommand: "python vla_tiny_action_head_train.py && pytest test_vla_tiny_action_head_train.py",
  commonBugs: [
    "language feature를 숫자 token으로만 넣고 task embedding/one-hot 의미를 검증하지 않음",
    "bias column을 빼먹어 action offset을 학습하지 못함",
    "offline MSE만 보고 closed-loop rollout과 safety gate를 생략함",
  ],
  extensionTask: "language command를 one-hot 3개로 확장하고 command별 action distribution shift를 시각화하라.",
};

const vlaConceptSession = makeAdvancedSession({
    id: "vla_architecture_concepts",
    part: "Part 7. Physical AI / Embodied AI",
    title: "VLA 개념: Vision-Language-Action 아키텍처",
    prerequisites: ["cnn_conv2d_feature_map", "pytorch_bc_mlp", "rl_q_learning_policy_gradient_basics"],
    objectives: ["VLA의 perception, language, action head 구성을 설명한다.", "embedding fusion과 action token의 역할을 이해한다.", "BC/RL/VLA가 policy learning 관점에서 어떻게 이어지는지 설명한다.", "안전 gate와 latency budget 필요성을 판단한다."],
    definition: "VLA(Vision-Language-Action)는 이미지/상태 관측과 언어 명령을 함께 입력받아 로봇 action을 출력하는 policy architecture다.",
    whyItMatters: "OpenVLA, RT-2, π0 같은 최신 Physical AI 모델은 perception과 language understanding을 action generation으로 연결한다.",
    intuition: "로봇에게 '빨간 블록을 집어라'라는 문장과 카메라 이미지를 같이 주고, 그 의미에 맞는 움직임을 내보내는 신경망이다.",
    equations: [
      { label: "Fusion", expression: "z=\\phi_v(I)\\oplus\\phi_l(c)", terms: [["I", "image"], ["c", "language command"], ["⊕", "concatenation/fusion"]], explanation: "시각과 언어 feature를 하나의 policy 입력으로 합친다." },
      { label: "Action head", expression: "a_t=\\pi_\\theta(z_t, s_t)", terms: [["a_t", "robot action"], ["s_t", "robot state"]], explanation: "fused representation에서 action을 예측한다." },
      { label: "BC objective", expression: "\\min_\\theta E\\|\\pi_\\theta(o,c)-a^*\\|^2", terms: [["a*", "expert action"]], explanation: "대부분의 VLA fine-tuning은 demonstration BC를 포함한다." },
    ],
    derivation: [["관측 인코딩", "image encoder가 visual token을 만든다."], ["명령 인코딩", "language encoder가 task token을 만든다."], ["fusion", "cross attention이나 concat으로 multimodal context를 만든다."], ["action decoding", "joint delta, end-effector delta, gripper token을 출력한다."]],
    handCalculation: { problem: "vision embedding 2차원, language embedding 3차원, state 4차원이 concat되면 action head 입력 차원은?", given: { vision: 2, language: 3, state: 4 }, steps: ["2+3+4"], answer: "9차원" },
    robotApplication: "VLA policy도 최종적으로는 ROS2 action command를 내므로 TF, joint limit, workspace bound, E-stop gate가 반드시 필요하다.",
    lab: vlaLab,
    visualization: { id: "vis_vla_architecture", title: "VLA 아키텍처 블록 다이어그램", equation: "a=pi(vision,language,state)", parameters: [{ name: "vision_weight", symbol: "w_v", min: 0, max: 1, default: 0.5, description: "시각 feature 영향" }, { name: "language_weight", symbol: "w_l", min: 0, max: 1, default: 0.5, description: "언어 feature 영향" }], normalCase: "명령과 관측이 일치할 때 action head가 안정적인 command를 낸다.", failureCase: "언어 명령과 시각 관측이 모순되면 action uncertainty가 커진다." },
    quiz: {
      id: "vla",
      conceptQuestion: "VLA에서 action head의 역할은?",
      conceptAnswer: "시각/언어/상태 feature를 실제 robot action으로 변환한다.",
      calculationQuestion: "vision 512, language 768 concat이면 fused dim은?",
      calculationAnswer: "1280차원이다.",
      codeQuestion: "embedding concat Python 한 줄은?",
      codeAnswer: "z = np.concatenate([vision, language])",
      debugQuestion: "명령과 다른 물체를 집으면 무엇을 의심하는가?",
      debugAnswer: "language grounding, visual attention, dataset label mismatch, coordinate transform을 확인한다.",
      visualQuestion: "language_weight를 낮추면 어떤 문제가 생길 수 있는가?",
      visualAnswer: "언어 명령보다 시각 prior가 강해져 지시와 다른 default action을 할 수 있다.",
      robotQuestion: "VLA action을 바로 actuator에 보내면 위험한 이유는?",
      robotAnswer: "모델 output이 물리 limit과 충돌 안전을 보장하지 않으므로 safety gate가 필요하다.",
      designQuestion: "VLA 배포 전 검증 단계는?",
      designAnswer: "offline eval, simulator rollout, shadow mode, low-speed real test, safety monitor 순서로 진행한다.",
    },
    wrongTagLabel: "VLA fusion/action/safety 오류",
    nextSessions: ["world_model_dreamer_overview", "sim2real_domain_randomization"],
  });

export const vlaConceptSessions: Session[] = [
  {
    ...vlaConceptSession,
    codeLabs: [vlaTrainableLab, ...vlaConceptSession.codeLabs],
  },
];
