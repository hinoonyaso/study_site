import type { Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

const worldLab = {
  id: "lab_world_model_latent_rollout",
  title: "Tiny Latent World Model Rollout",
  language: "python" as const,
  theoryConnection: "z_{t+1}=f(z_t,a_t), reward_hat=g(z_t,a_t) for imagination rollout",
  starterCode: `import numpy as np

def rollout_latent(z0, actions, A=0.9, B=0.2):
    # TODO: z <- A*z + B*a
    raise NotImplementedError

def predicted_reward(z):
    # TODO: reward = -z^2
    raise NotImplementedError

if __name__ == "__main__":
    zs = rollout_latent(1.0, [-1, -1, 0])
    print(np.round(zs, 3))
    print(round(sum(predicted_reward(z) for z in zs), 3))`,
  solutionCode: `import numpy as np

def rollout_latent(z0, actions, A=0.9, B=0.2):
    z = float(z0)
    zs = []
    for a in actions:
        z = A * z + B * float(a)
        zs.append(z)
    return np.array(zs)

def predicted_reward(z):
    return -float(z) ** 2

if __name__ == "__main__":
    zs = rollout_latent(1.0, [-1, -1, 0])
    print(np.round(zs, 3))
    print(round(sum(predicted_reward(z) for z in zs), 3))`,
  testCode: `import numpy as np
from world_model_latent_rollout import rollout_latent, predicted_reward

def test_rollout_shape():
    assert rollout_latent(0.0, [1,2,3]).shape == (3,)

def test_reward_best_near_zero():
    assert predicted_reward(0.0) > predicted_reward(2.0)`,
  expectedOutput: "[0.7   0.43  0.387]\n-0.825",
  runCommand: "python world_model_latent_rollout.py && pytest test_world_model_latent_rollout.py",
  commonBugs: ["latent rollout과 real environment rollout metric을 섞음", "model uncertainty 없이 long horizon imagination을 과신함", "reward model error가 policy를 잘못된 방향으로 학습시킴"],
  extensionTask: "ensemble world model uncertainty를 추가해 uncertain rollout penalty를 넣어라.",
};

const worldModelFitLab = {
  id: "lab_world_model_fit_dynamics",
  title: "Fit Tiny Linear World Model",
  language: "python" as const,
  theoryConnection: "learn z_{t+1}=A*z_t+B*a_t by least squares, then rollout",
  starterCode: `import numpy as np

def make_transitions(n=200, seed=0):
    # TODO: generate z, a, z_next with A=0.9, B=0.2
    raise NotImplementedError

def fit_dynamics(z, a, z_next):
    # TODO: least squares for [A,B,bias]
    raise NotImplementedError

if __name__ == "__main__":
    z, a, zn = make_transitions()
    params = fit_dynamics(z, a, zn)
    print(np.round(params, 3))`,
  solutionCode: `import numpy as np

def make_transitions(n=200, seed=0):
    rng = np.random.default_rng(seed)
    z = rng.normal(size=n)
    a = rng.uniform(-1, 1, size=n)
    z_next = 0.9 * z + 0.2 * a + rng.normal(scale=0.005, size=n)
    return z, a, z_next

def fit_dynamics(z, a, z_next):
    X = np.column_stack([z, a, np.ones_like(z)])
    params, *_ = np.linalg.lstsq(X, z_next, rcond=None)
    return params

if __name__ == "__main__":
    z, a, zn = make_transitions()
    params = fit_dynamics(z, a, zn)
    print(np.round(params, 3))`,
  testCode: `from world_model_fit_dynamics import make_transitions, fit_dynamics

def test_fit_recovers_dynamics():
    z, a, zn = make_transitions(seed=1)
    A, B, bias = fit_dynamics(z, a, zn)
    assert abs(A - 0.9) < 0.02
    assert abs(B - 0.2) < 0.02
    assert abs(bias) < 0.02`,
  expectedOutput: "[0.9 0.2 0. ]",
  runCommand: "python world_model_fit_dynamics.py && pytest test_world_model_fit_dynamics.py",
  commonBugs: [
    "z_next가 아니라 reward를 dynamics target으로 학습함",
    "action column을 빼먹어 policy가 상상한 행동 효과를 예측하지 못함",
    "train one-step error만 보고 long rollout error 누적을 확인하지 않음",
  ],
  extensionTask: "learned A,B로 20-step rollout을 수행하고 true dynamics와 error accumulation을 비교하라.",
};

const worldModelSession = makeAdvancedSession({
    id: "world_model_dreamer_overview",
    part: "Part 7. Physical AI / Embodied AI",
    title: "World Model 기초: Latent Dynamics와 Imagination",
    prerequisites: ["rl_q_learning_policy_gradient_basics", "pytorch_bc_mlp"],
    objectives: ["world model이 observation을 latent state로 압축하는 이유를 설명한다.", "latent dynamics rollout과 reward prediction을 구현한다.", "model error와 uncertainty 위험을 이해한다.", "Dreamer/RSSM 계열 아이디어를 Physical AI와 연결한다."],
    definition: "World model은 환경의 dynamics와 reward를 신경망으로 학습해 latent space에서 미래를 예측하는 모델이다. policy는 실제 환경 대신 model imagination에서 학습할 수 있다.",
    whyItMatters: "로봇은 실제 trial 비용이 크므로 model-based RL과 world model이 sample efficiency를 높인다. 하지만 model error가 안전 문제로 이어질 수 있다.",
    intuition: "머릿속 시뮬레이터를 만들어 여러 행동을 상상해 보고, 실제로 하기 전에 좋아 보이는 행동을 고르는 방식이다.",
    equations: [
      { label: "Latent dynamics", expression: "z_{t+1}=f_\\theta(z_t,a_t)", terms: [["z_t", "latent state"], ["a_t", "action"]], explanation: "관측 대신 압축된 state에서 미래를 예측한다." },
      { label: "Reward model", expression: "\\hat{r}_t=g_\\theta(z_t,a_t)", terms: [["r_hat", "predicted reward"]], explanation: "상상 rollout의 품질을 평가한다." },
      { label: "Model-based objective", expression: "\\max_\\pi E_{f_\\theta}[\\sum \\gamma^t \\hat{r}_t]", terms: [["E_f", "world model 안 expectation"]], explanation: "학습된 dynamics 안에서 policy를 개선한다." },
    ],
    derivation: [["encoder", "observation을 latent z로 압축한다."], ["dynamics", "z와 action으로 다음 z를 예측한다."], ["reward", "latent에서 reward를 예측한다."], ["policy", "예측된 미래 reward가 큰 action을 고른다."]],
    handCalculation: { problem: "z0=1, A=0.9, B=0.2, a=-1이면 z1은?", given: { z0: 1, A: 0.9, B: 0.2, a: -1 }, steps: ["z1=0.9*1+0.2*(-1)=0.7"], answer: "0.7" },
    robotApplication: "로봇 조작에서 world model은 object pose와 contact 결과를 latent로 예측해 실제 trial 수를 줄일 수 있지만, contact discontinuity 때문에 uncertainty 관리가 중요하다.",
    lab: worldLab,
    visualization: { id: "vis_world_model_rollout", title: "World Model Latent Rollout", equation: "z_next=f(z,a)", parameters: [{ name: "horizon", symbol: "H", min: 1, max: 20, default: 5, description: "imagination horizon" }, { name: "model_error", symbol: "\\epsilon", min: 0, max: 1, default: 0.1, description: "model prediction error" }], normalCase: "짧은 horizon에서 latent prediction이 reward 개선 방향을 제시한다.", failureCase: "horizon이 길고 model error가 크면 policy가 model exploit을 한다." },
    quiz: {
      id: "world_model",
      conceptQuestion: "World model을 쓰는 가장 큰 이유는?",
      conceptAnswer: "실제 환경 trial 없이 latent imagination에서 policy를 더 sample-efficient하게 학습하기 위해서다.",
      calculationQuestion: "z=2이면 reward=-z^2는?",
      calculationAnswer: "-4이다.",
      codeQuestion: "latent dynamics 업데이트 한 줄은?",
      codeAnswer: "z = A * z + B * a",
      debugQuestion: "sim imagination에서는 성공하지만 real rollout은 실패하면?",
      debugAnswer: "model error, unmodeled contact, reward model exploit을 의심한다.",
      visualQuestion: "model_error를 키우면 rollout 신뢰도는?",
      visualAnswer: "horizon이 길수록 uncertainty가 커져 신뢰도가 낮아진다.",
      robotQuestion: "contact-rich task에서 world model이 어려운 이유는?",
      robotAnswer: "작은 pose 차이가 접촉 여부를 바꿔 dynamics가 불연속적이기 때문이다.",
      designQuestion: "world model policy 배포 전 필요한 안전장치는?",
      designAnswer: "uncertainty threshold, action clamp, simulator validation, real-world shadow test가 필요하다.",
    },
    wrongTagLabel: "World model rollout/uncertainty 오류",
    nextSessions: ["vla_architecture_concepts", "sim2real_domain_randomization"],
  });

export const worldModelSessions: Session[] = [
  {
    ...worldModelSession,
    codeLabs: [worldModelFitLab, ...worldModelSession.codeLabs],
  },
];
