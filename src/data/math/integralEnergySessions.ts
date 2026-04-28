import type { Session } from "../../types";
import { makeAdvancedSession } from "../core/advancedSessionFactory";

const integralLab = {
  id: "lab_energy_integral_impulse",
  title: "Numerical Integral: Energy and Impulse",
  language: "python" as const,
  theoryConnection: "integral force dt = impulse, integral power dt = energy",
  starterCode: `import numpy as np

def trapezoid_integral(y, dt):
    # TODO: trapezoidal rule
    raise NotImplementedError

def impulse(force, dt):
    # TODO: integral F dt
    raise NotImplementedError

if __name__ == "__main__":
    dt = 0.01
    t = np.arange(0, 1 + dt, dt)
    force = 2.0 * np.ones_like(t)
    print(round(impulse(force, dt), 3))`,
  solutionCode: `import numpy as np

def trapezoid_integral(y, dt):
    y = np.asarray(y, dtype=float)
    return float(dt * (0.5*y[0] + np.sum(y[1:-1]) + 0.5*y[-1]))

def impulse(force, dt):
    return trapezoid_integral(force, dt)

if __name__ == "__main__":
    dt = 0.01
    t = np.arange(0, 1 + dt, dt)
    force = 2.0 * np.ones_like(t)
    print(round(impulse(force, dt), 3))`,
  testCode: `import numpy as np
from energy_integral_impulse import trapezoid_integral, impulse

def test_constant_integral():
    y = np.ones(101) * 2
    assert abs(trapezoid_integral(y, 0.01) - 2.0) < 1e-9

def test_linear_integral():
    t = np.linspace(0, 1, 101)
    assert abs(trapezoid_integral(t, 0.01) - 0.5) < 1e-4

def test_impulse():
    assert abs(impulse(np.ones(11), 0.1) - 1.0) < 1e-9`,
  expectedOutput: "2.0",
  runCommand: "python energy_integral_impulse.py && pytest test_energy_integral_impulse.py",
  commonBugs: ["사다리꼴 rule에서 양 끝점 0.5 weight를 빼먹음", "sample 수와 interval 수를 혼동해 dt를 잘못 곱함", "force impulse와 energy 단위를 섞음"],
  extensionTask: "motor power P=tau*omega를 적분해 trajectory energy consumption을 계산하라.",
};

export const integralEnergySessions: Session[] = [
  makeAdvancedSession({
    id: "integral_energy_impulse",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "정적분 기초: 에너지, 임펄스, 수치 적분",
    prerequisites: ["calculus_derivative_chain_rule", "ode_euler_rk4"],
    objectives: ["정적분을 면적과 누적량으로 설명한다.", "사다리꼴 rule로 수치 적분을 구현한다.", "힘의 적분이 impulse, power의 적분이 energy임을 연결한다.", "로봇 trajectory의 에너지 비용을 해석한다."],
    definition: "정적분은 연속 신호의 누적량을 계산한다. 시간에 대한 힘의 적분은 impulse, power의 적분은 energy가 된다.",
    whyItMatters: "로봇 동역학과 제어에서 torque, velocity, power를 시간에 따라 적분해야 배터리 사용량, 충격량, cost function을 계산할 수 있다.",
    intuition: "속도 그래프 아래 면적이 이동거리이듯, 힘 그래프 아래 면적은 물체에 전달된 운동량 변화다.",
    equations: [
      { label: "Definite integral", expression: "\\int_a^b f(t)dt", terms: [["f(t)", "시간 신호"], ["a,b", "적분 구간"]], explanation: "곡선 아래 면적이 누적량이다." },
      { label: "Trapezoid rule", expression: "\\int ydt \\approx \\Delta t(\\frac{y_0}{2}+\\sum_{k=1}^{N-1}y_k+\\frac{y_N}{2})", terms: [["Δt", "sample 간격"]], explanation: "인접 sample 사이를 사다리꼴로 근사한다." },
      { label: "Energy", expression: "E=\\int P(t)dt=\\int \\tau(t)\\omega(t)dt", terms: [["τ", "joint torque"], ["ω", "joint velocity"]], explanation: "동작에 필요한 기계적 에너지를 계산한다." },
    ],
    derivation: [["리만합", "작은 직사각형 면적을 더해 누적량을 근사한다."], ["사다리꼴", "직사각형 대신 양 끝 평균 높이를 써 오차를 줄인다."], ["물리 연결", "Fdt는 impulse, Pdt는 energy가 된다."], ["최적화 연결", "trajectory cost에 energy term을 추가할 수 있다."]],
    handCalculation: { problem: "2N 힘이 1초 동안 일정하면 impulse는?", given: { F: "2N", T: "1s" }, steps: ["J=integral F dt", "상수이므로 J=F*T=2*1"], answer: "2 N*s" },
    robotApplication: "협동로봇 충돌 안전에서는 접촉 force의 peak뿐 아니라 impulse도 본다. 같은 peak force라도 오래 지속되면 더 위험하다.",
    lab: integralLab,
    visualization: { id: "vis_integral_energy_impulse", title: "힘/전력 그래프 아래 면적", equation: "J=integral Fdt, E=integral Pdt", parameters: [{ name: "force", symbol: "F", min: 0, max: 20, default: 2, description: "상수 힘" }, { name: "duration", symbol: "T", min: 0.1, max: 5, default: 1, description: "지속 시간" }], normalCase: "면적이 force*duration과 일치한다.", failureCase: "dt를 잘못 잡으면 적분값이 sample 수에 비례해 틀어진다." },
    quiz: {
      id: "integral_energy",
      conceptQuestion: "정적분을 로봇 물리량으로 해석하면?",
      conceptAnswer: "시간에 따라 변하는 힘, 속도, 전력 같은 신호의 누적량이다.",
      calculationQuestion: "P=10W가 3초 지속되면 에너지는?",
      calculationAnswer: "E=10*3=30J이다.",
      codeQuestion: "사다리꼴 적분에서 양 끝점 weight는?",
      codeAnswer: "0.5*y[0]과 0.5*y[-1]이다.",
      debugQuestion: "적분값이 100배 크게 나오면 무엇을 의심하는가?",
      debugAnswer: "dt를 곱하지 않았거나 sample interval을 초 대신 ms로 넣은 오류를 의심한다.",
      visualQuestion: "duration을 두 배로 늘리면 상수 힘 impulse는?",
      visualAnswer: "면적이 두 배가 되므로 impulse도 두 배가 된다.",
      robotQuestion: "충돌 안전에서 peak force만 보면 부족한 이유는?",
      robotAnswer: "force가 오래 지속되면 impulse가 커져 더 큰 운동량 변화와 위험을 만들기 때문이다.",
      designQuestion: "trajectory optimization에 energy term을 넣는 이유는?",
      designAnswer: "목표 도달뿐 아니라 배터리 사용량과 actuator heating을 줄이기 위해서다.",
    },
    wrongTagLabel: "정적분/단위/누적량 오류",
    nextSessions: ["trajectory_quintic_polynomial", "mpc_1d_receding_horizon"],
  }),
];

