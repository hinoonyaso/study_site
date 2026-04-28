// ============================================================
// odeSessions.ts
// ODE / 수치 적분 (Euler vs RK4 비교) — Part 1 기초수학
// ============================================================
import type { Session } from "../../types";
import {
  ensureCodeLabShape,
  makeCoreQuizzes,
  makeEquation,
  makeVisualization,
  makeWrongTags,
  session,
  step,
} from "../core/v2SessionHelpers";

// ──────────────────────────────────────────────
// [코드랩] Euler vs RK4 진자(Pendulum) 시뮬레이션
// ──────────────────────────────────────────────
const odeEulerRK4Lab = ensureCodeLabShape({
  id: "lab_ode_euler_rk4",
  title: "ODE 수치 적분: Euler vs RK4",
  language: "python",
  theoryConnection: "x[k+1] = x[k] + dt*f(x[k])  vs  RK4 4단계 가중 평균",
  starterCode: `import numpy as np
import matplotlib.pyplot as plt

def pendulum_deriv(state, g=9.81, L=1.0):
    """
    state = [theta, omega]
    theta: 각도 (rad), omega: 각속도 (rad/s)
    반환: [d_theta/dt, d_omega/dt]
    """
    theta, omega = state
    # TODO: d_theta = omega
    # TODO: d_omega = -(g/L) * sin(theta)
    raise NotImplementedError

def euler_step(state, dt, g=9.81, L=1.0):
    """x[k+1] = x[k] + dt * f(x[k])"""
    # TODO: f = pendulum_deriv(state)
    # TODO: state_next = state + dt * np.array(f)
    raise NotImplementedError

def rk4_step(state, dt, g=9.81, L=1.0):
    """4단계 룽게-쿠타"""
    # TODO: k1 = np.array(pendulum_deriv(state))
    # TODO: k2 = np.array(pendulum_deriv(state + dt/2 * k1))
    # TODO: k3 = np.array(pendulum_deriv(state + dt/2 * k2))
    # TODO: k4 = np.array(pendulum_deriv(state + dt   * k3))
    # TODO: state_next = state + (dt/6)*(k1 + 2*k2 + 2*k3 + k4)
    raise NotImplementedError

if __name__ == "__main__":
    dt = 0.05
    T = 5.0
    steps = int(T / dt)
    state0 = np.array([np.pi / 6, 0.0])  # 30도에서 시작

    states_euler = [state0.copy()]
    states_rk4   = [state0.copy()]
    for _ in range(steps):
        states_euler.append(euler_step(states_euler[-1], dt))
        states_rk4.append(rk4_step(states_rk4[-1], dt))

    t = np.linspace(0, T, steps + 1)
    euler_theta = [s[0] for s in states_euler]
    rk4_theta   = [s[0] for s in states_rk4]
    print(f"Euler 최종 theta: {euler_theta[-1]:.4f} rad")
    print(f"RK4   최종 theta: {rk4_theta[-1]:.4f} rad")`,
  solutionCode: `import numpy as np
import matplotlib.pyplot as plt

def pendulum_deriv(state, g=9.81, L=1.0):
    theta, omega = state
    d_theta = omega
    d_omega = -(g / L) * np.sin(theta)
    return [d_theta, d_omega]

def euler_step(state, dt, g=9.81, L=1.0):
    f = pendulum_deriv(state, g, L)
    return state + dt * np.array(f)

def rk4_step(state, dt, g=9.81, L=1.0):
    k1 = np.array(pendulum_deriv(state, g, L))
    k2 = np.array(pendulum_deriv(state + dt / 2 * k1, g, L))
    k3 = np.array(pendulum_deriv(state + dt / 2 * k2, g, L))
    k4 = np.array(pendulum_deriv(state + dt * k3, g, L))
    return state + (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4)

if __name__ == "__main__":
    dt = 0.05
    T = 5.0
    steps = int(T / dt)
    state0 = np.array([np.pi / 6, 0.0])

    states_euler = [state0.copy()]
    states_rk4   = [state0.copy()]
    for _ in range(steps):
        states_euler.append(euler_step(states_euler[-1], dt))
        states_rk4.append(rk4_step(states_rk4[-1], dt))

    t = np.linspace(0, T, steps + 1)
    euler_theta = [s[0] for s in states_euler]
    rk4_theta   = [s[0] for s in states_rk4]

    print(f"Euler 최종 theta: {euler_theta[-1]:.4f} rad")
    print(f"RK4   최종 theta: {rk4_theta[-1]:.4f} rad")

    plt.figure(figsize=(10, 4))
    plt.plot(t, euler_theta, "r--", label="Euler (부정확)")
    plt.plot(t, rk4_theta,   "b-",  label="RK4 (정확)")
    plt.xlabel("Time (s)")
    plt.ylabel("theta (rad)")
    plt.title("Euler vs RK4: Pendulum Simulation")
    plt.legend()
    plt.grid(True)
    plt.savefig("ode_euler_rk4.png")
    plt.close()
    print("ode_euler_rk4.png 저장 완료")`,
  testCode: `import numpy as np
from ode_euler_rk4 import pendulum_deriv, euler_step, rk4_step

def test_pendulum_deriv_zero_angle():
    """theta=0이면 d_omega=0"""
    d = pendulum_deriv(np.array([0.0, 0.0]))
    assert abs(d[0]) < 1e-10
    assert abs(d[1]) < 1e-10

def test_euler_moves_forward():
    state = np.array([np.pi / 6, 0.0])
    next_state = euler_step(state, 0.01)
    assert next_state[0] != state[0] or next_state[1] != state[1]

def test_rk4_more_accurate_than_euler():
    """100 step 후 RK4가 에너지를 더 잘 보존한다"""
    state = np.array([np.pi / 4, 0.0])
    g, L = 9.81, 1.0
    E0 = 0.5 * state[1] ** 2 + (g / L) * (1 - np.cos(state[0]))
    s_rk4 = state.copy()
    s_eul  = state.copy()
    for _ in range(100):
        s_rk4 = rk4_step(s_rk4, 0.1, g, L)
        s_eul  = euler_step(s_eul, 0.1, g, L)
    E_rk4 = 0.5 * s_rk4[1] ** 2 + (g / L) * (1 - np.cos(s_rk4[0]))
    E_eul  = 0.5 * s_eul[1]  ** 2 + (g / L) * (1 - np.cos(s_eul[0]))
    assert abs(E_rk4 - E0) < abs(E_eul - E0)`,
  expectedOutput: "Euler 최종 theta: -0.6621 rad\nRK4   최종 theta: -0.4980 rad\node_euler_rk4.png 저장 완료",
  runCommand: "python ode_euler_rk4.py && pytest test_ode_euler_rk4.py",
  commonBugs: [
    "np.sin(theta) 대신 theta만 써서 선형 근사만 됨",
    "RK4에서 k2 계산 시 k1을 np.array()로 감싸지 않아 shape 오류",
    "state + dt * f에서 f가 list라 numpy 연산 실패",
    "dt=0.5처럼 너무 큰 step에서 Euler 발산을 RK4 오류로 착각",
  ],
  extensionTask:
    "dt를 0.01, 0.05, 0.1, 0.5로 바꾸며 5초 후 theta 오차를 표로 만들어라. Euler와 RK4 오차가 dt에 따라 어떻게 달라지는가?",
});

// ──────────────────────────────────────────────
// [세션 정의]
// ──────────────────────────────────────────────
export const odeSessions: Session[] = [
  session({
    id: "ode_euler_rk4",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "ODE 수치 적분: Euler·RK4와 동역학 시뮬레이션",
    level: "intermediate",
    difficulty: "medium",
    estimatedMinutes: 70,
    prerequisites: ["calculus_derivative_chain_rule", "state_space_model"],
    learningObjectives: [
      "ODE x'=f(x)를 Euler method로 한 step 근사한다.",
      "RK4가 Euler보다 더 정확한 이유를 4개의 기울기로 설명한다.",
      "dt 크기와 수치 오차·안정성의 관계를 실험으로 확인한다.",
      "pendulum 동역학 ODE를 Python으로 시뮬레이션한다.",
    ],
    theory: {
      definition:
        "ODE(상미분방정식)는 x'(t)=f(x,t) 형태로 시스템 상태 변화를 기술한다. 수치 적분은 이 연속 변화를 컴퓨터가 작은 dt 단위로 근사하는 방법이다.",
      whyItMatters:
        "로봇 동역학, 관절 토크 계산, 시뮬레이터 내부 물리 엔진은 모두 ODE 수치 적분으로 작동한다. Euler와 RK4를 이해해야 시뮬레이터 dt 설정과 실제 제어 루프 주기를 올바르게 설계할 수 있다.",
      intuition:
        "공이 지금 이 방향으로 가고 있다면, 0.01초 뒤 어디 있을지 '지금 속도×시간'으로 계산하는 것이 Euler다. RK4는 중간 지점의 속도도 4번 재보고 평균을 내서 훨씬 정확하게 계산한다.",
      equations: [
        makeEquation(
          "Euler method",
          "x[k+1] = x[k] + \\Delta t \\cdot f(x[k])",
          [
            ["x[k]", "현재 상태"],
            ["f(x[k])", "현재 상태에서의 미분값(기울기)"],
            ["Δt", "적분 시간 간격"],
          ],
          "한 점의 기울기만 사용하므로 dt가 클수록 오차가 크다.",
        ),
        makeEquation(
          "RK4 (4차 룽게-쿠타)",
          "x[k+1] = x[k] + \\frac{\\Delta t}{6}(k_1 + 2k_2 + 2k_3 + k_4)",
          [
            ["k1", "구간 시작 기울기"],
            ["k2", "중간 Euler로 이동한 뒤 기울기"],
            ["k3", "k2로 이동한 뒤 기울기"],
            ["k4", "구간 끝 Euler로 이동한 뒤 기울기"],
          ],
          "4개의 기울기를 가중 평균하므로 같은 dt에서 오차가 훨씬 작다.",
        ),
        makeEquation(
          "진자 ODE",
          "\\dot{\\theta} = \\omega, \\quad \\dot{\\omega} = -\\frac{g}{L}\\sin\\theta",
          [
            ["θ", "진자 각도 (rad)"],
            ["ω", "진자 각속도 (rad/s)"],
            ["g/L", "중력 가속도 / 진자 길이"],
          ],
          "단진자의 비선형 ODE. sin(θ)≠θ이므로 작은 각도에서만 선형 근사가 성립한다.",
        ),
      ],
      derivation: [
        step(
          "왜 수치 적분이 필요한가",
          "진자 ODE는 sin(θ)가 있어 해석 해가 없다. 컴퓨터로 dt씩 쪼개서 근사한다.",
        ),
        step(
          "Euler 1단계",
          "theta_next = theta + dt * omega, omega_next = omega + dt * (-(g/L)*sin(theta)).",
        ),
        step(
          "RK4: k1 계산",
          "k1 = f(x) — 현재 상태에서 미분값을 그대로 계산한다.",
        ),
        step(
          "RK4: k2 계산",
          "k2 = f(x + dt/2 * k1) — Euler로 반 step 이동한 뒤 기울기를 재보정한다.",
        ),
        step(
          "RK4: k3, k4",
          "k3 = f(x + dt/2 * k2), k4 = f(x + dt * k3)로 중간·끝 기울기를 추가한다.",
        ),
        step(
          "RK4: 가중 평균",
          "(k1 + 2*k2 + 2*k3 + k4)/6으로 이동량을 확정한다.",
        ),
        step(
          "에너지 보존 확인",
          "0.5*omega^2 + (g/L)*(1-cos(theta))가 일정하게 유지되면 수치 적분이 정확한 것이다.",
        ),
      ],
      handCalculation: {
        problem: "theta=π/6, omega=0, dt=0.01, g=9.81, L=1일 때 Euler 1단계 후 상태는?",
        given: { theta: "π/6 ≈ 0.5236 rad", omega: 0, dt: 0.01 },
        steps: [
          "d_theta = omega = 0",
          "d_omega = -(9.81/1)*sin(0.5236) = -9.81*0.5 = -4.905",
          "theta_next = 0.5236 + 0.01 * 0 = 0.5236",
          "omega_next = 0 + 0.01 * (-4.905) = -0.04905",
        ],
        answer: "theta: 0.5236 rad, omega: -0.04905 rad/s",
      },
      robotApplication:
        "Gazebo, Isaac Sim 등 물리 시뮬레이터는 내부적으로 ODE solver를 사용한다. ros2_control의 controller_period가 너무 크면 Euler 불안정과 유사한 진동이 생긴다. integrator_type=rk4 옵션이 이 선택에 해당한다.",
    },
    codeLabs: [odeEulerRK4Lab],
    visualizations: [
      makeVisualization(
        "vis_ode_euler_rk4",
        "Euler vs RK4 수치 오차 비교",
        "ode_euler_rk4",
        "x[k+1]=x[k]+dt*f vs RK4 4단계",
        odeEulerRK4Lab.id,
        [
          {
            name: "dt",
            symbol: "\\Delta t",
            min: 0.01,
            max: 0.5,
            default: 0.05,
            description: "적분 시간 간격 (클수록 Euler 오차 커짐)",
          },
          {
            name: "theta0_deg",
            symbol: "\\theta_0",
            min: 5,
            max: 60,
            default: 30,
            description: "초기 각도 (degree)",
          },
        ],
        "dt가 작으면 Euler도 RK4와 비슷한 궤적을 그린다.",
        "dt가 0.3 이상이면 Euler가 발산하지만 RK4는 안정적으로 유지된다.",
      ),
    ],
    quizzes: makeCoreQuizzes({
      id: "ode_euler_rk4",
      conceptTag: "ode_euler_rk4",
      reviewSession: "ODE 수치 적분",
      conceptQuestion: "Euler method와 RK4의 핵심 차이는?",
      conceptAnswer:
        "Euler는 구간 시작 기울기 1개만 쓰고, RK4는 구간 내 4개의 기울기를 가중 평균한다.",
      calculationQuestion:
        "theta=0.5, omega=0, dt=0.01, g=9.81, L=1일 때 Euler 1단계 후 omega는?",
      calculationAnswer:
        "d_omega = -(9.81)*sin(0.5) ≈ -9.81*0.479 = -4.70이므로 omega_next = 0 + 0.01*(-4.70) = -0.0470이다.",
      codeQuestion: "RK4에서 k2를 계산하는 Python 코드 한 줄은?",
      codeAnswer: "k2 = np.array(pendulum_deriv(state + dt / 2 * k1))",
      debugQuestion: "RK4 코드에서 k3 계산 시 k2 대신 k1을 쓰면 어떤 문제가 생기는가?",
      debugAnswer:
        "k3가 잘못 계산되어 RK4가 2차 정확도로 떨어지고 Euler와 다를 바 없어진다.",
      visualQuestion: "dt 슬라이더를 0.4로 올리면 Euler 곡선과 RK4 곡선이 어떻게 달라지는가?",
      visualAnswer:
        "Euler는 에너지가 점점 증가하며 발산하는 반면 RK4는 진자 운동을 안정적으로 유지한다.",
      robotQuestion:
        "ros2_control에서 controller_period=0.1(100ms)로 설정했더니 로봇팔이 진동한다면 무엇이 원인인가?",
      robotAnswer:
        "Euler 적분 dt가 너무 커서 수치 불안정이 생긴 것이다. period를 0.001~0.01로 줄이거나 integrator_type=rk4 옵션을 확인한다.",
      designQuestion: "시뮬레이터 dt를 결정하는 기준은 무엇인가?",
      designAnswer:
        "시스템의 최고 주파수 성분의 최소 10배 빠른 샘플링으로 설정하고, RK4를 쓸 때는 Euler보다 2~4배 큰 dt를 허용할 수 있다.",
    }),
    wrongAnswerTags: makeWrongTags("ode_euler_rk4", "ODE 수치 적분 오류", [
      "state_space_model",
      "calculus_derivative_chain_rule",
    ]),
    nextSessions: ["state_space_model", "kalman_filter_1d", "robot_dynamics_2link_lagrange"],
  }),
];
