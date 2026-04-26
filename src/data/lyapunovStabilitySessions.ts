import type { Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

const lyapunovLab = {
  id: "lab_lyapunov_pd_stability",
  title: "Lyapunov Check for 1D PD Control",
  language: "python" as const,
  theoryConnection: "V=0.5*k*x^2+0.5*v^2, Vdot=-d*v^2 for damped PD",
  starterCode: `def lyapunov(x, v, k=4.0):
    # TODO: V = 0.5*k*x^2 + 0.5*v^2
    raise NotImplementedError

def vdot(v, d=1.0):
    # TODO: Vdot = -d*v^2
    raise NotImplementedError

if __name__ == "__main__":
    print(lyapunov(1.0, 0.0))
    print(vdot(2.0))`,
  solutionCode: `def lyapunov(x, v, k=4.0):
    return 0.5 * k * x**2 + 0.5 * v**2

def vdot(v, d=1.0):
    return -d * v**2

if __name__ == "__main__":
    print(lyapunov(1.0, 0.0))
    print(vdot(2.0))`,
  testCode: `from lyapunov_pd_stability import lyapunov, vdot

def test_positive():
    assert lyapunov(1, 0) > 0 and lyapunov(0, 0) == 0

def test_vdot_nonpositive():
    assert vdot(2) < 0 and vdot(0) == 0`,
  expectedOutput: "2.0\n-4.0",
  runCommand: "python lyapunov_pd_stability.py && pytest test_lyapunov_pd_stability.py",
  commonBugs: ["V가 positive definite인지 확인하지 않음", "Vdot<=0와 Vdot<0 조건을 혼동함", "damping이 음수일 때도 안정하다고 착각함"],
  extensionTask: "damping d를 음수로 바꿔 V가 증가하는 불안정 예제를 그려라.",
};

export const lyapunovStabilitySessions: Session[] = [
  makeAdvancedSession({
    id: "lyapunov_stability_pd",
    part: "Part 3. 로봇 동역학과 제어",
    title: "Lyapunov 안정성 기초와 PD 제어",
    prerequisites: ["state_space_model", "pid_control_v2"],
    objectives: ["Lyapunov 함수 V(x)를 에너지처럼 해석한다.", "positive definite와 Vdot<=0 조건을 설명한다.", "1D PD 제어에서 damping이 에너지를 줄이는 이유를 계산한다.", "gain tuning과 안정성 보장을 연결한다."],
    definition: "Lyapunov 안정성은 시스템 상태가 평형점 근처에 머물거나 수렴함을 에너지 형태 함수 V와 그 시간 미분 Vdot으로 증명하는 방법이다.",
    whyItMatters: "PID/LQR gain이 잘 동작하는지 경험적으로만 보는 것이 아니라, 폐루프 시스템이 에너지를 줄이는지 수학적으로 판단할 수 있다.",
    intuition: "그릇 안의 공이 마찰 때문에 점점 낮은 곳으로 내려오면 안정하다. V는 높이/에너지, Vdot은 에너지가 줄어드는 속도다.",
    equations: [
      { label: "Positive definite", expression: "V(x)>0\\; (x\\ne0),\\quad V(0)=0", terms: [["V", "Lyapunov candidate"]], explanation: "평형점에서만 최소인 에너지 함수다." },
      { label: "Stability condition", expression: "\\dot{V}(x)\\le0", terms: [["Vdot", "시간에 따른 에너지 변화"]], explanation: "에너지가 증가하지 않으면 상태가 폭주하지 않는다." },
      { label: "PD energy", expression: "V=\\frac12kx^2+\\frac12v^2,\\quad \\dot{V}=-dv^2", terms: [["k", "stiffness"], ["d", "damping"]], explanation: "d>0이면 velocity energy가 소산된다." },
    ],
    derivation: [["candidate 선택", "위치 오차 에너지와 속도 에너지를 더한다."], ["시간미분", "chain rule로 Vdot을 계산한다."], ["제어 대입", "PD 제어 law를 dynamics에 넣는다."], ["부호 확인", "damping이 양수면 Vdot이 0 이하임을 보인다."]],
    handCalculation: { problem: "d=2, v=3이면 Vdot=-d v^2는?", given: { d: 2, v: 3 }, steps: ["Vdot=-2*9"], answer: "-18" },
    robotApplication: "로봇팔 joint PD 제어에서 derivative damping이 충분하지 않으면 에너지가 줄지 않아 진동이 지속된다.",
    lab: lyapunovLab,
    visualization: { id: "vis_lyapunov_pd_energy", title: "Lyapunov Energy Surface와 감쇠", equation: "V=0.5kx^2+0.5v^2", parameters: [{ name: "damping", symbol: "d", min: -2, max: 5, default: 1, description: "damping coefficient" }, { name: "stiffness", symbol: "k", min: 0.1, max: 10, default: 4, description: "position gain" }], normalCase: "damping이 양수이면 V가 감소한다.", failureCase: "damping이 음수이면 V가 증가해 불안정하다." },
    quiz: {
      id: "lyapunov_pd",
      conceptQuestion: "Lyapunov 함수는 무엇을 에너지처럼 나타내는가?",
      conceptAnswer: "평형점에서 0이고 그 밖에서 양수인 상태의 에너지/거리 척도다.",
      calculationQuestion: "v=2,d=1이면 Vdot은?",
      calculationAnswer: "-1*4=-4이다.",
      codeQuestion: "V=0.5*k*x^2+0.5*v^2 한 줄은?",
      codeAnswer: "return 0.5*k*x**2 + 0.5*v**2",
      debugQuestion: "Vdot이 양수로 나오면 무엇을 의심하는가?",
      debugAnswer: "damping 부호, control law 부호, 미분 계산을 확인한다.",
      visualQuestion: "damping을 음수로 두면 energy는?",
      visualAnswer: "시간이 갈수록 증가해 불안정해진다.",
      robotQuestion: "PD 제어에서 D항이 하는 안정성 역할은?",
      robotAnswer: "속도에 비례해 에너지를 소산시켜 진동을 줄인다.",
      designQuestion: "안정성 증명과 시뮬레이션을 함께 해야 하는 이유는?",
      designAnswer: "증명은 이상 모델 기준이고 실제 actuator saturation, delay, noise는 시뮬레이션과 로그로 확인해야 한다.",
    },
    wrongTagLabel: "Lyapunov 안정성 조건 오류",
    nextSessions: ["mpc_1d_receding_horizon", "safety_latency_jitter_profiling"],
  }),
];

