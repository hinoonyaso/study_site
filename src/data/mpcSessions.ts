import type { Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

const mpcLab = {
  id: "lab_mpc_1d_grid_search",
  title: "1D MPC by Finite Candidate Search",
  language: "python" as const,
  theoryConnection: "min sum Q(x-ref)^2 + R u^2 with receding horizon and input constraints",
  starterCode: `import itertools
import numpy as np

def rollout(x0, controls, dt=0.1):
    # TODO: x[k+1] = x[k] + dt*u[k]
    raise NotImplementedError

def cost(xs, us, ref=1.0, Q=10.0, R=0.1):
    # TODO: tracking cost + effort cost
    raise NotImplementedError

def mpc_action(x0, horizon=4, u_choices=(-1.0, 0.0, 1.0), ref=1.0):
    # TODO: try every control sequence and return first action of best sequence
    raise NotImplementedError

if __name__ == "__main__":
    x = 0.0
    for _ in range(10):
        u = mpc_action(x)
        x = x + 0.1 * u
    print("x:", round(x, 3))`,
  solutionCode: `import itertools
import numpy as np

def rollout(x0, controls, dt=0.1):
    xs = [float(x0)]
    x = float(x0)
    for u in controls:
        x = x + dt * float(u)
        xs.append(x)
    return np.array(xs)

def cost(xs, us, ref=1.0, Q=10.0, R=0.1):
    return float(Q * np.sum((xs[1:] - ref) ** 2) + R * np.sum(np.asarray(us) ** 2))

def mpc_action(x0, horizon=4, u_choices=(-1.0, 0.0, 1.0), ref=1.0):
    best_u, best_cost = 0.0, float("inf")
    for seq in itertools.product(u_choices, repeat=horizon):
        xs = rollout(x0, seq)
        c = cost(xs, seq, ref=ref)
        if c < best_cost:
            best_cost = c
            best_u = seq[0]
    return float(best_u)

if __name__ == "__main__":
    x = 0.0
    for _ in range(10):
        u = mpc_action(x)
        x = x + 0.1 * u
    print("x:", round(x, 3))`,
  testCode: `import numpy as np
from mpc_1d_grid_search import rollout, cost, mpc_action

def test_rollout_integrator():
    xs = rollout(0.0, [1.0, 1.0], dt=0.1)
    assert np.allclose(xs, [0.0, 0.1, 0.2])

def test_cost_prefers_tracking():
    assert cost(np.array([0.0, 1.0]), [0.0], ref=1.0) < cost(np.array([0.0, 0.0]), [0.0], ref=1.0)

def test_action_moves_toward_ref():
    assert mpc_action(0.0, horizon=3, ref=1.0) > 0.0`,
  expectedOutput: "x: 1.0",
  runCommand: "python mpc_1d_grid_search.py && pytest test_mpc_1d_grid_search.py",
  commonBugs: [
    "전체 최적 control sequence를 모두 실행해 receding horizon을 지키지 않음",
    "u constraint를 cost에만 넣고 실제 후보에서 제한하지 않음",
    "terminal state를 cost에서 빼서 horizon 끝 동작이 이상해짐",
  ],
  extensionTask: "u_choices를 5개 값으로 늘리고 horizon 증가에 따른 계산량을 측정하라.",
};

export const mpcSessions: Session[] = [
  makeAdvancedSession({
    id: "mpc_1d_receding_horizon",
    part: "Part 3. 로봇 동역학과 제어",
    title: "MPC 기초: Receding Horizon과 제약 최적화",
    prerequisites: ["state_space_model", "lqr_riccati", "convex_optimization_kkt"],
    objectives: [
      "MPC가 매 제어 주기마다 finite horizon 최적화를 다시 푸는 구조임을 설명한다.",
      "tracking cost와 control effort cost를 코드로 계산한다.",
      "입력 제한 u_min/u_max가 PID/LQR과 다른 MPC 장점임을 이해한다.",
      "horizon 길이와 계산량의 trade-off를 측정한다.",
    ],
    definition: "MPC(Model Predictive Control)는 현재 상태에서 미래 N step을 예측하며 비용함수를 최소화하는 control sequence를 찾고, 그중 첫 입력만 적용한 뒤 다음 주기에 다시 최적화하는 제어 방법이다.",
    whyItMatters: "자율주행 steering, 로봇팔 joint limit 회피, mobile robot local planner는 제약을 다뤄야 하므로 PID/LQR보다 MPC가 실전에서 자주 쓰인다.",
    intuition: "운전할 때 커브 전체를 미리 보고 조향을 계획하지만, 실제로는 지금 핸들을 조금만 돌리고 다음 순간 다시 계획하는 방식이다.",
    equations: [
      { label: "MPC objective", expression: "\\min_{u_{0:N-1}} \\sum_{k=1}^{N} Q(x_k-r)^2 + R u_k^2", terms: [["N", "prediction horizon"], ["Q", "tracking error weight"], ["R", "control effort weight"]], explanation: "목표 추종과 입력 크기 사이 균형을 최적화한다." },
      { label: "Dynamics constraint", expression: "x_{k+1}=Ax_k+Bu_k", terms: [["A,B", "상태공간 행렬"], ["u_k", "제어 입력"]], explanation: "미래 상태는 시스템 모델을 따라야 한다." },
      { label: "Input constraint", expression: "u_{min}\\le u_k\\le u_{max}", terms: [["u_min,u_max", "actuator limit"]], explanation: "제약을 명시적으로 다루는 것이 MPC의 큰 장점이다." },
    ],
    derivation: [
      ["상태 예측", "현재 x0에서 후보 control sequence를 넣어 x1...xN을 계산한다."],
      ["비용 계산", "각 step의 tracking error와 입력 크기를 더한다."],
      ["최적 sequence 선택", "가장 낮은 cost를 가진 sequence를 고른다."],
      ["첫 입력만 적용", "u0만 적용하고 다음 주기에서 horizon을 한 칸 밀어 다시 푼다."],
    ],
    handCalculation: {
      problem: "x0=0, ref=1, horizon=1, u 후보 {0,1}, dt=1, Q=1, R=0이면 어떤 u를 고르는가?",
      given: { x0: 0, ref: 1, candidates: "{0,1}" },
      steps: ["u=0이면 x1=0, cost=(0-1)^2=1", "u=1이면 x1=1, cost=(1-1)^2=0"],
      answer: "u=1을 선택한다.",
    },
    robotApplication: "Nav2 MPC controller나 자율주행 lateral controller는 속도, 조향각, 가속도 제한을 비용과 제약으로 동시에 반영한다.",
    lab: mpcLab,
    visualization: {
      id: "vis_mpc_1d_horizon",
      title: "MPC Prediction Horizon과 실제 궤적",
      equation: "min sum Q(x-r)^2+R u^2",
      parameters: [
        { name: "horizon", symbol: "N", min: 1, max: 10, default: 4, description: "미래 예측 step 수" },
        { name: "R", symbol: "R", min: 0, max: 5, default: 0.1, description: "입력 effort penalty" },
      ],
      normalCase: "horizon이 충분하면 목표에 부드럽게 접근한다.",
      failureCase: "horizon이 너무 짧거나 R이 너무 작으면 입력이 bang-bang으로 변한다.",
    },
    quiz: {
      id: "mpc_1d",
      conceptQuestion: "MPC가 LQR/PID보다 제약 처리에 유리한 이유는?",
      conceptAnswer: "u_min/u_max, state limit 같은 제약을 최적화 문제 안에 직접 넣기 때문이다.",
      calculationQuestion: "horizon=3, u_choices=5개면 brute-force 후보 sequence 수는?",
      calculationAnswer: "5^3=125개이다.",
      codeQuestion: "receding horizon에서 실제 적용하는 입력은?",
      codeAnswer: "best_sequence[0]만 적용한다.",
      debugQuestion: "MPC가 목표를 지나쳐 계속 진동하면 무엇을 의심하는가?",
      debugAnswer: "R이 너무 작거나 horizon이 짧고 terminal cost가 없어 입력 변화가 과격한 상황을 의심한다.",
      visualQuestion: "R 슬라이더를 키우면 control input은 어떻게 변하는가?",
      visualAnswer: "입력 effort penalty가 커져 더 작은 u를 선택하고 수렴은 느려진다.",
      robotQuestion: "자율주행에서 steering limit을 MPC에 넣지 않으면 어떤 문제가 생기는가?",
      robotAnswer: "물리적으로 불가능한 조향각을 계획해 actuator saturation과 tracking failure가 발생한다.",
      designQuestion: "100Hz 제어에서 horizon과 후보 수를 어떻게 정하는가?",
      designAnswer: "제어 주기 안에 최적화가 끝나도록 horizon, state dimension, solver tolerance를 제한하고 latency watchdog을 둔다.",
    },
    wrongTagLabel: "MPC horizon/cost/constraint 오류",
    nextSessions: ["trajectory_quintic_polynomial", "dwa_obstacle_avoidance"],
  }),
];

