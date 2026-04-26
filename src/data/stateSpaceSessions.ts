import type { Session } from "../types";
import {
  ensureCodeLabShape,
  makeCoreQuizzes,
  makeEquation,
  makeVisualization,
  makeWrongTags,
  session,
  step,
} from "./v2SessionHelpers";

const stateSpaceLab = ensureCodeLabShape({
  id: "lab_state_space_simulate",
  title: "State-space Model Simulation",
  language: "python",
  theoryConnection: "x_dot = Ax + Bu, y = Cx, x[k+1] = (I+A*dt)x[k] + B*dt*u",
  starterCode: `import numpy as np
import matplotlib.pyplot as plt

def simulate_state_space(A, B, C, x0, u_seq, dt):
    # TODO: Euler discretization
    # x[k+1] = (I + A*dt)x[k] + B*dt*u[k]
    # y[k] = Cx[k]
    raise NotImplementedError

if __name__ == "__main__":
    tau = 0.5
    A = np.array([[-1/tau]])
    B = np.array([[1/tau]])
    C = np.array([[1.0]])
    x0 = np.array([0.0])
    states, outputs = simulate_state_space(A, B, C, x0, np.ones(500), dt=0.01)
    print(f"최종 상태: {states[-1, 0]:.4f} (이론값: 1.0)")`,
  solutionCode: `import numpy as np
import matplotlib.pyplot as plt

def simulate_state_space(A, B, C, x0, u_seq, dt):
    n = len(x0)
    steps = len(u_seq)
    I = np.eye(n)
    Ad = I + A * dt
    Bd = B * dt
    states = np.zeros((steps + 1, n))
    outputs = np.zeros((steps, C.shape[0]))
    states[0] = x0
    for k in range(steps):
        u = np.atleast_1d(u_seq[k])
        states[k + 1] = Ad @ states[k] + Bd @ u
        outputs[k] = C @ states[k]
    return states[1:], outputs

if __name__ == "__main__":
    tau = 0.5
    A = np.array([[-1/tau]])
    B = np.array([[1/tau]])
    C = np.array([[1.0]])
    x0 = np.array([0.0])
    steps = 500
    dt = 0.01
    states, outputs = simulate_state_space(A, B, C, x0, np.ones(steps), dt)
    print(f"최종 상태: {states[-1, 0]:.4f} (이론값: 1.0)")

    t = np.linspace(0, steps * dt, steps)
    plt.figure(figsize=(8, 4))
    plt.plot(t, states[:, 0], "b-", label="State x(t)")
    plt.plot(t, outputs[:, 0], "r--", label="Output y(t)")
    plt.axhline(1.0, color="g", linestyle=":", label="목표값 1.0")
    plt.xlabel("Time (s)")
    plt.ylabel("Value")
    plt.title("State-space 1차 모터 step 응답")
    plt.legend()
    plt.grid(True)
    plt.savefig("state_space.png")
    plt.close()
    print("state_space.png 저장 완료")`,
  testCode: `import numpy as np
from state_space_simulate import simulate_state_space

def test_first_order_converges():
    tau = 0.5
    A = np.array([[-1/tau]])
    B = np.array([[1/tau]])
    C = np.array([[1.0]])
    x0 = np.array([0.0])
    states, _ = simulate_state_space(A, B, C, x0, np.ones(500), dt=0.01)
    assert abs(states[-1, 0] - 1.0) < 0.01

def test_zero_input_decays():
    A = np.array([[-1.0]])
    B = np.array([[0.0]])
    C = np.array([[1.0]])
    x0 = np.array([5.0])
    states, _ = simulate_state_space(A, B, C, x0, np.zeros(500), dt=0.01)
    assert states[-1, 0] < 0.1

def test_output_shape():
    A = np.array([[-1.0, 0.0], [0.0, -2.0]])
    B = np.array([[1.0], [0.0]])
    C = np.array([[1.0, 0.0]])
    x0 = np.array([0.0, 0.0])
    states, outputs = simulate_state_space(A, B, C, x0, np.ones(100), dt=0.01)
    assert states.shape == (100, 2)
    assert outputs.shape == (100, 1)`,
  expectedOutput: "최종 상태: 1.0000 (이론값: 1.0)",
  runCommand: "python state_space_simulate.py && pytest test_state_space_simulate.py",
  commonBugs: [
    "x = A@x + B@u로 써서 Euler 이산화의 I와 dt를 빠뜨림",
    "u_seq[k]를 scalar로 처리하다가 B @ u shape 오류가 남",
    "outputs를 states[k+1] 기준으로 기록해 측정 시점이 한 step 밀림",
  ],
  extensionTask:
    "tau를 0.1, 0.5, 2.0으로 바꾸고 step 응답 수렴 시간을 비교하라.",
});

export const stateSpaceSessions: Session[] = [
  session({
    id: "state_space_model",
    part: "Part 3. 로봇 동역학과 제어",
    title: "상태공간 모델 완전 이해",
    level: "intermediate",
    difficulty: "medium",
    estimatedMinutes: 75,
    prerequisites: ["pid_control_v2", "calculus_derivative_chain_rule"],
    learningObjectives: [
      "x_dot=Ax+Bu, y=Cx에서 A,B,C 행렬의 역할을 설명한다.",
      "Euler 이산화 x[k+1]=(I+A*dt)x[k]+B*dt*u를 구현한다.",
      "고유값으로 연속 시스템 안정성을 판단한다.",
      "LQR, MPC, Kalman Filter가 상태공간 표현에서 출발함을 연결한다.",
    ],
    theory: {
      definition:
        "상태공간 표현은 시스템을 상태 x, 입력 u, 출력 y로 표현하는 방법이다. x_dot=Ax+Bu는 상태 변화, y=Cx는 측정 출력을 나타낸다.",
      whyItMatters:
        "PID를 넘어 위치+속도, 여러 관절, 센서 융합 상태를 함께 다루려면 LQR, MPC, Kalman Filter의 공통 언어인 상태공간 모델이 필요하다.",
      intuition:
        "자동차라면 x=[위치, 속도], u=가속도 명령, y=GPS 위치다. A는 상태끼리 어떻게 영향을 주는지, B는 입력이 상태를 어떻게 바꾸는지 말한다.",
      equations: [
        makeEquation(
          "연속 상태공간",
          "\\dot{x} = Ax + Bu, \\quad y = Cx",
          [
            ["x", "상태 벡터"],
            ["u", "입력 벡터"],
            ["y", "출력 벡터"],
            ["A,B,C", "시스템, 입력, 출력 행렬"],
          ],
          "미분방정식을 행렬식으로 쓴 표현이다.",
        ),
        makeEquation(
          "Euler 이산화",
          "x[k+1] = (I + A\\Delta t)x[k] + B\\Delta t\\,u[k]",
          [["Δt", "샘플링 시간"]],
          "컴퓨터 시뮬레이션과 제어 루프에서 연속 모델을 한 step씩 근사한다.",
        ),
        makeEquation(
          "안정성 조건",
          "\\text{stable} \\iff \\operatorname{Re}(\\lambda_i(A)) < 0",
          [["λ_i(A)", "A 행렬의 고유값"]],
          "연속 시스템은 모든 고유값의 실수부가 음수이면 입력 없이 수렴한다.",
        ),
      ],
      derivation: [
        step("1차 모터 모델", "dx/dt=-x/tau+u/tau이므로 A=[-1/tau], B=[1/tau]이다."),
        step("Euler 적분", "x[k+1]=x[k]+dt*(-x[k]/tau+u[k]/tau)로 근사한다."),
        step("행렬 형태", "위 식을 (I+A*dt)x + B*dt*u로 묶는다."),
        step("LQR 연결", "LQR은 이 A,B와 비용 Q,R을 사용해 최적 feedback gain을 구한다."),
      ],
      handCalculation: {
        problem: "tau=0.5, dt=0.01, x[0]=0, u=1일 때 x[1]은?",
        given: { tau: 0.5, dt: 0.01, x0: 0, u: 1 },
        steps: ["A=-2, B=2", "x[1]=(1-2*0.01)*0 + 2*0.01*1", "x[1]=0.02"],
        answer: "x[1] = 0.02",
      },
      robotApplication:
        "ros2_control의 joint controller, LQR/MPC 설계, robot_localization의 예측 모델은 상태공간 A,B,C 행렬을 명시하거나 내부적으로 사용한다.",
    },
    codeLabs: [stateSpaceLab],
    visualizations: [
      makeVisualization(
        "vis_state_space",
        "상태공간 Step 응답",
        "state_space_model",
        "x_dot = Ax + Bu",
        stateSpaceLab.id,
        [
          { name: "tau", symbol: "tau", min: 0.1, max: 2.0, default: 0.5, description: "시정수" },
          { name: "u_amp", symbol: "u", min: 0.5, max: 3.0, default: 1.0, description: "step 입력 크기" },
        ],
        "tau가 작으면 빠르게 수렴하고, tau가 크면 느리게 수렴한다.",
        "A의 고유값 실수부가 양수가 되면 시스템이 발산한다.",
      ),
    ],
    quizzes: makeCoreQuizzes({
      id: "state_space",
      conceptTag: "state_space_model",
      reviewSession: "상태공간 모델",
      conceptQuestion: "상태공간 A 행렬은 무엇을 나타내는가?",
      conceptAnswer: "입력이 없을 때 상태가 스스로 어떻게 변하는지 나타내는 시스템 dynamics 행렬이다.",
      calculationQuestion: "tau=0.5인 1차 모터의 A와 eigenvalue는?",
      calculationAnswer: "A=[-1/0.5]=[-2], eigenvalue=-2로 안정하다.",
      codeQuestion: "Euler 이산화 Python 코드는?",
      codeAnswer: "x_next = (np.eye(n) + A*dt) @ x + B*dt @ u",
      debugQuestion: "시뮬레이션이 발산하면 A 행렬에서 무엇을 확인하는가?",
      debugAnswer: "np.linalg.eigvals(A)의 실수부가 모두 음수인지 확인한다.",
      visualQuestion: "tau를 2.0으로 올리면 step 응답은 어떻게 변하는가?",
      visualAnswer: "시정수가 커져 같은 목표값에 더 느리게 접근한다.",
      robotQuestion: "제어 gain이 너무 높아 발진할 때 상태공간으로 어떻게 설명하는가?",
      robotAnswer: "폐루프 행렬 A-BK의 고유값이 불안정하거나 감쇠가 작아져 진동이 커진 것으로 볼 수 있다.",
      designQuestion: "A,B를 모르는 실제 로봇에서는 어떻게 상태공간 모델을 얻는가?",
      designAnswer: "step input 실험과 system identification으로 데이터에서 A,B를 추정하거나 물리 파라미터로 모델링한다.",
    }),
    wrongAnswerTags: makeWrongTags("state_space_model", "상태공간 모델과 안정성 오류", [
      "pid_control_v2",
      "lqr_riccati",
    ]),
    nextSessions: ["lqr_riccati", "kalman_filter_1d"],
  }),
];
