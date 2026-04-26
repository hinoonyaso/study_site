import type { Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

const qLearningLab = {
  id: "lab_q_learning_gridworld",
  title: "Q-learning Gridworld",
  language: "python" as const,
  theoryConnection: "Q(s,a) <- Q(s,a) + alpha * (r + gamma max Q(s',a') - Q(s,a))",
  starterCode: `import numpy as np

ACTIONS = [(-1,0), (1,0), (0,-1), (0,1)]

def step_env(state, action, size=4):
    # TODO: move in grid, reward +1 at goal (3,3), -0.01 otherwise
    raise NotImplementedError

def q_update(Q, s, a, r, sp, alpha=0.5, gamma=0.95):
    # TODO: Bellman update
    raise NotImplementedError

def train(episodes=200):
    # TODO: epsilon-greedy Q-learning
    raise NotImplementedError

if __name__ == "__main__":
    np.random.seed(0)
    Q = train(300)
    print("start best action:", int(np.argmax(Q[0,0])))`,
  solutionCode: `import numpy as np

ACTIONS = [(-1,0), (1,0), (0,-1), (0,1)]

def step_env(state, action, size=4):
    r, c = state
    dr, dc = ACTIONS[action]
    nr = int(np.clip(r + dr, 0, size - 1))
    nc = int(np.clip(c + dc, 0, size - 1))
    done = (nr, nc) == (size - 1, size - 1)
    return (nr, nc), (1.0 if done else -0.01), done

def q_update(Q, s, a, r, sp, alpha=0.5, gamma=0.95):
    target = r + gamma * np.max(Q[sp])
    Q[s][a] += alpha * (target - Q[s][a])

def train(episodes=200):
    Q = np.zeros((4, 4, 4))
    for ep in range(episodes):
        s = (0, 0)
        eps = max(0.05, 0.5 * (0.99 ** ep))
        for _ in range(60):
            a = np.random.randint(4) if np.random.rand() < eps else int(np.argmax(Q[s]))
            sp, r, done = step_env(s, a)
            q_update(Q, s, a, r, sp)
            s = sp
            if done:
                break
    return Q

if __name__ == "__main__":
    np.random.seed(0)
    Q = train(300)
    print("start best action:", int(np.argmax(Q[0,0])))`,
  testCode: `import numpy as np
from q_learning_gridworld import step_env, q_update, train

def test_step_reaches_goal():
    sp, r, done = step_env((3,2), 3)
    assert sp == (3,3) and r == 1.0 and done

def test_q_update_increases_good_action():
    Q = np.zeros((4,4,4))
    q_update(Q, (0,0), 1, 1.0, (1,0))
    assert Q[0,0,1] > 0

def test_training_learns_positive_value():
    np.random.seed(0)
    Q = train(300)
    assert np.max(Q[0,0]) > 0.5`,
  expectedOutput: "start best action: 3",
  runCommand: "python q_learning_gridworld.py && pytest test_q_learning_gridworld.py",
  commonBugs: [
    "epsilon을 0으로 시작해 exploration 없이 local behavior에 갇힘",
    "target에서 max Q(s') 대신 Q(s,a)를 다시 사용함",
    "terminal state에서도 bootstrap을 더해 goal value가 부풀어 오름",
  ],
  extensionTask: "reward shaping을 바꾸며 episode return curve를 저장하고 pure greedy와 epsilon-greedy를 비교하라.",
};

export const rlBasicSessions: Session[] = [
  makeAdvancedSession({
    id: "rl_q_learning_policy_gradient_basics",
    part: "Part 7. Physical AI / Embodied AI",
    title: "강화학습 기초: MDP, Q-learning, Policy Gradient",
    prerequisites: ["pytorch_bc_mlp", "calculus_gradient_descent"],
    objectives: [
      "MDP의 state, action, reward, transition을 정의한다.",
      "Bellman update로 Q-table을 학습한다.",
      "exploration과 exploitation trade-off를 설명한다.",
      "Policy Gradient가 BC 이후 online improvement로 이어지는 이유를 이해한다.",
    ],
    definition: "강화학습은 agent가 환경과 상호작용하며 누적 reward를 최대화하는 policy를 학습하는 문제다. Q-learning은 Bellman optimality를 tabular하게 근사한다.",
    whyItMatters: "Behavior Cloning은 expert data 바깥에서 covariate shift를 겪는다. RL은 reward와 trial을 통해 policy를 개선하므로 contact-rich manipulation과 locomotion의 핵심 학습 방법이다.",
    intuition: "미로에서 시행착오를 하며 어느 칸에서 어느 방향으로 가면 나중에 보상이 큰지 표를 채워가는 과정이다.",
    equations: [
      { label: "Bellman update", expression: "Q(s,a)\\leftarrow Q(s,a)+\\alpha[r+\\gamma\\max_{a'}Q(s',a')-Q(s,a)]", terms: [["α", "학습률"], ["γ", "discount factor"]], explanation: "현재 추정과 더 나은 target 사이 차이를 줄인다." },
      { label: "Return", expression: "G_t=\\sum_{k=0}^{\\infty}\\gamma^k r_{t+k}", terms: [["G_t", "discounted return"]], explanation: "미래 reward를 현재 가치로 할인해 합친다." },
      { label: "Policy Gradient", expression: "\\nabla J(\\theta)=E[\\nabla_\\theta \\log \\pi_\\theta(a|s)G_t]", terms: [["πθ", "stochastic policy"], ["G_t", "return"]], explanation: "좋은 return을 낸 action 확률을 높인다." },
    ],
    derivation: [
      ["MDP 정의", "state, action, reward, transition, discount를 고정한다."],
      ["TD target", "r + gamma max Q(s')를 현재 action의 목표값으로 둔다."],
      ["오차 보정", "target-Q(s,a)를 alpha만큼 반영한다."],
      ["Policy gradient 연결", "Q-table 대신 neural policy 확률을 reward 방향으로 업데이트한다."],
    ],
    handCalculation: {
      problem: "Q=0.2, r=1, gamma=0.9, maxQ'=0.5, alpha=0.1이면 업데이트 후 Q는?",
      given: { Q: 0.2, r: 1, gamma: 0.9, maxQ: 0.5, alpha: 0.1 },
      steps: ["target=1+0.9*0.5=1.45", "TD error=1.45-0.2=1.25", "Qnew=0.2+0.1*1.25=0.325"],
      answer: "Qnew=0.325",
    },
    robotApplication: "로봇 grasping에서 BC policy가 실패 state에 들어가면 expert data가 없어 복구하지 못한다. RL fine-tuning이나 DAgger가 이 분포 이동 문제를 줄인다.",
    lab: qLearningLab,
    visualization: {
      id: "vis_rl_q_learning_reward",
      title: "Q-table Heatmap과 Reward Curve",
      equation: "Q <- Q + alpha(r+gamma maxQ'-Q)",
      parameters: [
        { name: "epsilon", symbol: "\\epsilon", min: 0, max: 1, default: 0.2, description: "random exploration 비율" },
        { name: "gamma", symbol: "\\gamma", min: 0, max: 0.99, default: 0.95, description: "미래 reward 할인율" },
      ],
      normalCase: "episode가 진행될수록 start state value와 reward가 증가한다.",
      failureCase: "epsilon이 너무 낮으면 탐색 부족으로 goal을 찾지 못한다.",
    },
    quiz: {
      id: "rl_basic",
      conceptQuestion: "exploration이 필요한 이유는?",
      conceptAnswer: "현재 greedy action만 따르면 아직 발견하지 못한 더 좋은 경로를 찾을 수 없기 때문이다.",
      calculationQuestion: "r=1, gamma=0.9, maxQ'=2이면 target은?",
      calculationAnswer: "1+0.9*2=2.8이다.",
      codeQuestion: "epsilon-greedy에서 random action을 고르는 조건은?",
      codeAnswer: "np.random.rand() < epsilon",
      debugQuestion: "Q-table이 모두 0 근처에 머물면 무엇을 의심하는가?",
      debugAnswer: "reward가 너무 sparse하거나 exploration이 부족하거나 terminal update가 잘못됐는지 확인한다.",
      visualQuestion: "epsilon을 0으로 두면 reward curve는 어떻게 될 수 있는가?",
      visualAnswer: "초기 policy에 갇혀 goal을 찾지 못하고 reward가 낮게 유지될 수 있다.",
      robotQuestion: "실제 로봇에서 RL exploration을 그대로 하면 위험한 이유는?",
      robotAnswer: "무작위 action이 충돌과 하드웨어 손상을 만들 수 있어 simulator, safety shield, action limit이 필요하다.",
      designQuestion: "BC와 RL을 함께 쓰는 안전한 학습 순서는?",
      designAnswer: "expert BC로 초기 policy를 만들고 simulator RL fine-tuning 후 안전 제한 하에 real-world residual tuning을 한다.",
    },
    wrongTagLabel: "RL Bellman/exploration 오류",
    nextSessions: ["world_model_dreamer_overview", "vla_architecture_concepts"],
  }),
];
