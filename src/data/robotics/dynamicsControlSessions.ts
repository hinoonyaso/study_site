import type { QuizQuestionV2, Session, VisualizationSpec } from "../../types";
import { ensureCodeLabShape, makeCoreQuizzes, makeEquation, makeVisualization, makeWrongTags, session, step } from "../core/v2SessionHelpers";

const torqueLab = ensureCodeLabShape({
  id: "lab_two_link_torque",
  title: "2-link Robot Torque Calculation",
  language: "python",
  theoryConnection: "tau = M(q) qddot + C(q,qdot) qdot + g(q)",
  starterCode: `import math
import numpy as np

def gravity_torque(q1, q2, l1=1.0, l2=0.7, m1=1.2, m2=0.8, g=9.81):
    # TODO: compute center-of-mass gravity torque for joint 1 and joint 2
    # tau1 = dU/dq1, tau2 = dU/dq2
    raise NotImplementedError

if __name__ == "__main__":
    print(np.round(gravity_torque(math.radians(30), math.radians(45)), 3))`,
  solutionCode: `import math
import numpy as np

def gravity_torque(q1, q2, l1=1.0, l2=0.7, m1=1.2, m2=0.8, g=9.81):
    # Potential energy U = m1*g*y1 + m2*g*y2.
    # y1 = l1/2*sin(q1), y2 = l1*sin(q1) + l2/2*sin(q1+q2).
    tau1 = g * ((m1 * l1 / 2.0 + m2 * l1) * math.cos(q1) + m2 * l2 / 2.0 * math.cos(q1 + q2))
    tau2 = g * (m2 * l2 / 2.0 * math.cos(q1 + q2))
    return np.array([tau1, tau2], dtype=float)

if __name__ == "__main__":
    print(np.round(gravity_torque(math.radians(30), math.radians(45)), 3))`,
  testCode: `import math
import numpy as np
from two_link_torque import gravity_torque

def test_horizontal_arm_positive_gravity_torque():
    tau = gravity_torque(0.0, 0.0)
    assert tau[0] > tau[1] > 0.0

def test_vertical_arm_near_zero_torque():
    tau = gravity_torque(math.pi / 2.0, 0.0)
    assert np.allclose(tau, [0.0, 0.0], atol=1e-8)

def test_nominal_value():
    tau = gravity_torque(math.radians(30), math.radians(45))
    assert np.allclose(tau, [11.533, 0.711], atol=1e-3)`,
  expectedOutput: "[11.533  0.711]",
  runCommand: "python two_link_torque.py && pytest test_two_link_torque.py",
  commonBugs: ["각도를 degree로 넣음", "link2 질량이 joint1 토크에도 기여한다는 점을 빼먹음", "위치에너지 미분 부호를 반대로 씀"],
  extensionTask: "q1/q2 grid에서 gravity torque heatmap을 만들고 토크 한계선을 겹쳐 그려라.",
});

const lqrLab = ensureCodeLabShape({
  id: "lab_scalar_lqr",
  title: "Scalar LQR Riccati Iteration",
  language: "python",
  theoryConnection: "K = (R+B^T P B)^-1 B^T P A",
  starterCode: `def scalar_lqr(a, b, q, r, iterations=50):
    # TODO: iterate discrete Riccati equation
    # TODO: return feedback gain K
    raise NotImplementedError

if __name__ == "__main__":
    print(round(scalar_lqr(1.0, 0.2, 1.0, 0.1), 3))`,
  solutionCode: `def scalar_lqr(a, b, q, r, iterations=50):
    P = q
    for _ in range(iterations):
        K = (b * P * a) / (r + b * P * b)
        P = q + a * P * a - (a * P * b) * (b * P * a) / (r + b * P * b)
    return (b * P * a) / (r + b * P * b)

if __name__ == "__main__":
    print(round(scalar_lqr(1.0, 0.2, 1.0, 0.1), 3))`,
  testCode: `from scalar_lqr import scalar_lqr

def test_positive_gain():
    assert scalar_lqr(1.0, 0.2, 1.0, 0.1) > 0

def test_higher_state_cost_increases_gain():
    assert scalar_lqr(1.0, 0.2, 5.0, 0.1) > scalar_lqr(1.0, 0.2, 1.0, 0.1)

def test_higher_control_cost_decreases_gain():
    assert scalar_lqr(1.0, 0.2, 1.0, 10.0) < scalar_lqr(1.0, 0.2, 1.0, 0.1)`,
  expectedOutput: "2.702",
  runCommand: "python scalar_lqr.py && pytest test_scalar_lqr.py",
  commonBugs: ["R을 작게 만들수록 입력이 작아진다고 반대로 해석함", "P update의 감산항을 빠뜨림", "u=-Kx 부호를 잊음"],
  extensionTask: "Q/R 비율을 sweep하며 overshoot와 control energy를 비교하라.",
});

const pidStepLab = ensureCodeLabShape({
  id: "lab_pid_step_response_python",
  title: "PID Step Response with Saturation and Anti-windup",
  language: "python",
  theoryConnection: "u=Kp*e + Ki*integral(e dt) + Kd*de/dt, y_dot=(-y+u)/tau",
  starterCode: `import numpy as np

def clamp(value, lower, upper):
    raise NotImplementedError("min/max로 value를 제한한다")

class PID:
    def __init__(self, kp, ki, kd, u_min=-1.0, u_max=1.0, anti_windup=True):
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.u_min = u_min
        self.u_max = u_max
        self.anti_windup = anti_windup
        self.integral = 0.0
        self.prev_error = 0.0

    def update(self, target, measurement, dt):
        raise NotImplementedError("P, I, D 항과 saturation을 계산한다")

def simulate(kp, ki, kd, target=1.0, seconds=4.0, dt=0.02, limit=1.2):
    raise NotImplementedError("1차 모터 모델 y_dot=(-y+u)/tau를 적분한다")

if __name__ == "__main__":
    data = simulate(2.0, 0.6, 0.15)
    print(round(data["y"][-1], 3))
    print(data["saturated_count"])`,
  solutionCode: `import numpy as np

def clamp(value, lower, upper):
    return max(lower, min(upper, value))

class PID:
    def __init__(self, kp, ki, kd, u_min=-1.0, u_max=1.0, anti_windup=True):
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.u_min = u_min
        self.u_max = u_max
        self.anti_windup = anti_windup
        self.integral = 0.0
        self.prev_error = 0.0

    def update(self, target, measurement, dt):
        error = target - measurement
        self.integral += error * dt
        derivative = (error - self.prev_error) / dt
        raw = self.kp * error + self.ki * self.integral + self.kd * derivative
        command = clamp(raw, self.u_min, self.u_max)
        saturated = abs(raw - command) > 1e-9
        if self.anti_windup and saturated and np.sign(error) == np.sign(raw):
            self.integral -= error * dt
        self.prev_error = error
        return command, saturated

def simulate(kp, ki, kd, target=1.0, seconds=4.0, dt=0.02, limit=1.2):
    pid = PID(kp, ki, kd, -limit, limit, anti_windup=True)
    tau = 0.45
    y = 0.0
    ys = []
    us = []
    saturated_count = 0
    for _ in range(int(seconds / dt)):
        u, saturated = pid.update(target, y, dt)
        y += ((u - y) / tau) * dt
        ys.append(y)
        us.append(u)
        saturated_count += int(saturated)
    return {"y": np.array(ys), "u": np.array(us), "saturated_count": saturated_count}

if __name__ == "__main__":
    data = simulate(2.0, 0.6, 0.15)
    print(round(float(data["y"][-1]), 3))
    print(data["saturated_count"])`,
  testCode: `import numpy as np
from pid_step_response import PID, clamp, simulate

def test_clamp_limits_command():
    assert clamp(2.0, -1.0, 1.0) == 1.0
    assert clamp(-2.0, -1.0, 1.0) == -1.0

def test_pid_reaches_target_reasonably():
    data = simulate(2.2, 0.7, 0.18, target=1.0, seconds=5.0, limit=1.5)
    assert abs(float(data["y"][-1]) - 1.0) < 0.12

def test_saturation_is_counted():
    data = simulate(8.0, 2.0, 0.0, target=2.0, seconds=1.0, limit=0.5)
    assert data["saturated_count"] > 5

def test_anti_windup_keeps_integral_bounded():
    pid = PID(0.0, 5.0, 0.0, -0.2, 0.2, anti_windup=True)
    y = 0.0
    for _ in range(80):
        pid.update(10.0, y, 0.02)
    assert abs(pid.integral) < 1.0`,
  expectedOutput: "0.855\n5",
  runCommand: "python pid_step_response.py && pytest test_pid_step_response.py",
  commonBugs: [
    "오차 부호를 measurement-target으로 뒤집어 양의 feedback을 만듦",
    "saturation 중에도 integral을 계속 쌓아 windup이 발생함",
    "D항을 measurement noise에 그대로 걸어 제어 입력이 떨림",
  ],
  extensionTask: "anti_windup=True/False를 바꿔 overshoot와 saturated_count를 비교하는 표를 출력하라.",
});

const pidCppLab = ensureCodeLabShape({
  id: "lab_pid_controller_cpp",
  title: "C++ PIDController Class",
  language: "cpp",
  theoryConnection: "update(target, measurement, dt) returns saturated PID command with resettable integral state",
  starterCode: `#include <algorithm>
#include <iostream>

class PIDController {
 public:
  PIDController(double kp, double ki, double kd, double min_u, double max_u)
      : kp_(kp), ki_(ki), kd_(kd), min_u_(min_u), max_u_(max_u) {}

  void Reset() {
    integral_ = 0.0;
    prev_error_ = 0.0;
  }

  double Update(double target, double measurement, double dt) {
    throw "implement PID update with clamp and anti-windup";
  }

 private:
  double kp_;
  double ki_;
  double kd_;
  double min_u_;
  double max_u_;
  double integral_{0.0};
  double prev_error_{0.0};
};

int main() {
  PIDController pid(2.0, 0.4, 0.1, -1.0, 1.0);
  std::cout << pid.Update(1.0, 0.0, 0.02) << "\\n";
}`,
  solutionCode: `#include <algorithm>
#include <cmath>
#include <iostream>

class PIDController {
 public:
  PIDController(double kp, double ki, double kd, double min_u, double max_u)
      : kp_(kp), ki_(ki), kd_(kd), min_u_(min_u), max_u_(max_u) {}

  void Reset() {
    integral_ = 0.0;
    prev_error_ = 0.0;
  }

  double Update(double target, double measurement, double dt) {
    const double error = target - measurement;
    integral_ += error * dt;
    const double derivative = (error - prev_error_) / dt;
    const double raw = kp_ * error + ki_ * integral_ + kd_ * derivative;
    const double command = std::clamp(raw, min_u_, max_u_);
    if (std::abs(raw - command) > 1e-9 && error * raw > 0.0) {
      integral_ -= error * dt;
    }
    prev_error_ = error;
    return command;
  }

 private:
  double kp_;
  double ki_;
  double kd_;
  double min_u_;
  double max_u_;
  double integral_{0.0};
  double prev_error_{0.0};
};

int main() {
  PIDController pid(2.0, 0.4, 0.1, -1.0, 1.0);
  std::cout << pid.Update(1.0, 0.0, 0.02) << "\\n";
}`,
  testCode: `# Save as pid_controller_test.cpp and compile with the implementation above.
#include <cassert>
#include <cmath>
#include <iostream>

int main() {
  PIDController saturated(10.0, 0.0, 0.0, -1.0, 1.0);
  assert(std::abs(saturated.Update(1.0, 0.0, 0.02) - 1.0) < 1e-9);
  saturated.Reset();
  PIDController negative(2.0, 0.0, 0.0, -1.0, 1.0);
  assert(negative.Update(0.0, 1.0, 0.02) < 0.0);
  std::cout << "pid tests passed\\n";
}`,
  expectedOutput: "1",
  runCommand: "g++ -std=c++17 pid_controller.cpp -o pid_controller && ./pid_controller",
  commonBugs: [
    "std::clamp를 쓰려면 C++17과 <algorithm>이 필요함",
    "Reset에서 prev_error_를 초기화하지 않아 첫 D항이 튐",
    "dt가 0일 때 derivative 계산을 보호하지 않음",
  ],
  extensionTask: "dt<=0이면 이전 command를 유지하거나 예외를 반환하는 방어 로직을 추가하라.",
});

const pidVisualization: VisualizationSpec = {
  id: "vis_pid_step_response",
  title: "PID Step Response",
  conceptTag: "pid_control_v2",
  parameters: [
    { name: "Kp", symbol: "K_p", min: 0, max: 6, default: 2.2, description: "현재 오차를 바로 미는 비례 gain" },
    { name: "Ki", symbol: "K_i", min: 0, max: 3, default: 0.7, description: "오래 남은 오차를 쌓아 없애는 적분 gain" },
    { name: "Kd", symbol: "K_d", min: 0, max: 1.5, default: 0.18, description: "빠른 변화를 줄이는 미분 gain" },
    { name: "saturation", symbol: "u_max", min: 0.2, max: 3, default: 1.2, description: "모터 명령 제한" },
  ],
  connectedEquation: "u=Kp e + Ki integral(e dt) + Kd de/dt",
  connectedCodeLab: pidStepLab.id,
  normalCase: "적절한 gain과 anti-windup이면 overshoot가 작고 settling time 안에 목표값에 수렴한다.",
  failureCase: "Ki가 큰데 saturation 중 integral을 계속 쌓으면 overshoot와 늦은 회복이 생긴다.",
  interpretationQuestions: [
    "Kp를 크게 키우면 rise time과 overshoot가 어떻게 변하는지 말하라.",
    "Ki가 큰 상태에서 saturation warning이 뜨면 anti-windup이 왜 필요한지 설명하라.",
    "Kd를 키우면 빠른 변화가 줄지만 노이즈에 왜 민감해지는지 말하라.",
  ],
};

const pidQuizzes: QuizQuestionV2[] = [
  {
    id: "pid_control_v2_q01_concept",
    type: "concept",
    difficulty: "easy",
    conceptTag: "pid_control_v2",
    question: "PID에서 P, I, D 항을 쉬운 말로 설명하라.",
    expectedAnswer: "P는 현재 오차를 바로 미는 힘, I는 오래 쌓인 오차를 없애는 힘, D는 너무 빨리 변하지 않게 잡는 브레이크다.",
    explanation: "PID는 목표값과 현재값의 차이를 현재, 과거 누적, 변화 속도 세 관점에서 보고 제어 입력을 만든다.",
    stepByStepExplanation: ["오차 e=target-measurement를 정의한다.", "P는 e에 Kp를 곱한다.", "I는 e를 시간에 대해 누적한다.", "D는 e의 변화율을 본다."],
    wrongAnswerAnalysis: { commonWrongAnswer: "D가 오차를 오래 쌓는 항이라고 답함", whyWrong: "오래 쌓는 항은 I이고 D는 변화율을 보는 항이다.", errorType: "concept_confusion", reviewSession: "pid_control_v2", retryQuestionType: "concept", recommendedReview: ["pid_control_v2"] },
  },
  {
    id: "pid_control_v2_q02_calculation",
    type: "calculation",
    difficulty: "medium",
    conceptTag: "pid_control_v2",
    question: "Kp=2, Ki=0, Kd=0, target=1, measurement=0.4이면 u는?",
    expectedAnswer: "error=0.6이고 u=2*0.6=1.2이다.",
    explanation: "P 제어만 있으므로 현재 오차에 Kp를 곱하면 된다.",
    stepByStepExplanation: ["오차 e=1-0.4=0.6이다.", "I와 D는 0이므로 계산하지 않는다.", "u=Kp*e=2*0.6=1.2이다."],
    wrongAnswerAnalysis: { commonWrongAnswer: "0.8이라고 답함", whyWrong: "target-measurement가 아니라 measurement를 직접 곱한 오류다.", errorType: "calculation_error", reviewSession: "pid_control_v2", retryQuestionType: "calculation", recommendedReview: ["pid_control_v2"] },
  },
  {
    id: "pid_control_v2_q03_code_completion",
    type: "code_completion",
    difficulty: "medium",
    conceptTag: "pid_control_v2",
    question: "Python PID update에서 saturation을 적용하는 한 줄을 쓰라.",
    expectedAnswer: "command = clamp(raw, self.u_min, self.u_max)",
    explanation: "실제 모터 명령은 전압, 토크, 속도 한계를 넘으면 안 되므로 raw PID 출력을 제한해야 한다.",
    stepByStepExplanation: ["먼저 raw PID 출력을 계산한다.", "하한 self.u_min과 상한 self.u_max를 적용한다.", "제한된 command를 plant나 motor driver로 보낸다."],
    wrongAnswerAnalysis: { commonWrongAnswer: "command = raw", whyWrong: "saturation을 빼면 실제 actuator 한계를 넘는 명령을 낼 수 있다.", errorType: "code_logic_error", reviewSession: "pid_control_v2", retryQuestionType: "code_debug", recommendedReview: ["pid_control_v2"] },
  },
  {
    id: "pid_control_v2_q04_code_debug",
    type: "code_debug",
    difficulty: "medium",
    conceptTag: "pid_control_v2",
    question: "로봇팔이 목표 근처에서 떨린다. PID 코드에서 먼저 확인할 항목 3가지는?",
    expectedAnswer: "Kd 노이즈 민감도, Kp 과대, dt/derivative 계산과 saturation 여부를 확인한다.",
    explanation: "떨림은 gain 과대, 미분 노이즈, 시간 간격 오류, actuator 제한에서 자주 생긴다.",
    stepByStepExplanation: ["로그에서 measurement noise와 dt를 확인한다.", "Kp를 낮춰 overshoot가 줄어드는지 본다.", "D항 필터링과 saturation count를 확인한다."],
    wrongAnswerAnalysis: { commonWrongAnswer: "Ki만 키운다", whyWrong: "떨림 상황에서 Ki 증가는 windup과 overshoot를 더 키울 수 있다.", errorType: "robot_application_error", reviewSession: "pid_control_v2", retryQuestionType: "robot_scenario", recommendedReview: ["pid_control_v2"], severity: "high" },
  },
  {
    id: "pid_control_v2_q05_visualization",
    type: "visualization_interpretation",
    difficulty: "medium",
    conceptTag: "pid_control_v2",
    question: "PID 시각화에서 Ki를 크게 하고 saturation warning이 뜨면 어떤 실패를 의심해야 하는가?",
    expectedAnswer: "integral windup을 의심해야 한다. 제한 중에도 I항이 계속 쌓여 overshoot와 늦은 회복을 만든다.",
    explanation: "모터 명령이 한계에 걸린 동안 integral이 계속 커지면 제한이 풀린 뒤에도 과한 명령이 남는다.",
    stepByStepExplanation: ["saturation warning은 raw u와 command가 다름을 뜻한다.", "Ki가 크면 error 누적이 빨라진다.", "anti-windup이 없으면 overshoot가 커진다."],
    wrongAnswerAnalysis: { commonWrongAnswer: "목표에 빨리 가는 좋은 신호라고 답함", whyWrong: "saturation은 actuator 한계에 걸렸다는 경고이며 성능 향상이 아니다.", errorType: "visualization_misread", reviewSession: "pid_control_v2", retryQuestionType: "calculation", recommendedReview: ["pid_control_v2"] },
  },
  {
    id: "pid_control_v2_q06_robot_scenario",
    type: "robot_scenario",
    difficulty: "hard",
    conceptTag: "pid_control_v2",
    question: "모터 속도 제어에서 목표 속도에 항상 조금 못 미치는 steady-state error가 남는다. 어떤 항을 검토하는가?",
    expectedAnswer: "I항을 검토한다. 적분 제어는 오래 남은 오차를 누적해 steady-state error를 줄인다.",
    explanation: "마찰이나 중력처럼 계속 남는 외란은 P만으로는 작은 정상상태 오차를 남길 수 있다.",
    stepByStepExplanation: ["오차가 시간이 지나도 0이 아닌지 확인한다.", "saturation이 없는 범위에서 Ki를 조금 올린다.", "overshoot와 windup을 함께 감시한다."],
    wrongAnswerAnalysis: { commonWrongAnswer: "D항만 키운다", whyWrong: "D항은 변화율을 보는 브레이크라 지속 오차 제거에는 직접적이지 않다.", errorType: "robot_application_error", reviewSession: "pid_control_v2", retryQuestionType: "visualization_interpretation", recommendedReview: ["pid_control_v2"], severity: "high" },
  },
  {
    id: "pid_control_v2_q07_system_design",
    type: "system_design",
    difficulty: "hard",
    conceptTag: "pid_control_v2",
    question: "실제 로봇에 PID를 배포할 때 안전하게 넣어야 할 보호 장치 4가지는?",
    expectedAnswer: "command saturation, anti-windup, dt 이상 감지, emergency stop 또는 watchdog을 넣는다.",
    explanation: "PID는 단순하지만 실제 actuator와 연결되면 제한, 시간, 통신 실패를 같이 다뤄야 한다.",
    stepByStepExplanation: ["출력 제한으로 모터 한계를 지킨다.", "anti-windup으로 제한 중 적분 폭주를 막는다.", "dt가 튀면 D항을 보호한다.", "통신 끊김은 watchdog으로 정지한다."],
    wrongAnswerAnalysis: { commonWrongAnswer: "gain만 잘 튜닝하면 된다고 답함", whyWrong: "gain 튜닝은 정상 상황 대책이고, 실제 로봇은 실패 상황의 안전 gate가 필요하다.", errorType: "system_design_error", reviewSession: "pid_control_v2", retryQuestionType: "safety_analysis", recommendedReview: ["pid_control_v2", "safety_watchdog_timer"], severity: "high" },
  },
  {
    id: "pid_control_v2_q08_counterexample",
    type: "counterexample",
    difficulty: "hard",
    conceptTag: "pid_control_v2",
    question: "`Ki를 키우면 항상 더 정확해진다`는 주장에 대한 반례를 찾아라.",
    expectedAnswer: "출력 saturation이 있는 모터에서 Ki가 크고 anti-windup이 없으면 integral windup으로 overshoot가 커지고 오히려 늦게 안정된다.",
    explanation: "I항은 steady-state error를 줄이지만 제한 상황에서 계속 쌓이면 실패 원인이 된다.",
    counterexampleHint: "모터 출력 제한 u_max와 큰 target step을 함께 생각한다.",
    expectedFailureMode: "integral windup, overshoot 증가, settling time 증가",
    stepByStepExplanation: ["u가 limit에 걸리는 step input을 만든다.", "Ki가 큰 상태에서 error가 계속 누적된다.", "제한이 풀린 뒤 누적 integral이 과한 명령을 만든다.", "anti-windup을 켜면 같은 조건에서 overshoot가 줄어든다."],
    wrongAnswerAnalysis: { commonWrongAnswer: "Ki는 무조건 오차를 줄이므로 반례가 없다고 답함", whyWrong: "제어기는 actuator 한계와 함께 봐야 하며 I항은 windup이라는 대표 실패가 있다.", errorType: "safety_misjudgment", reviewSession: "pid_control_v2", retryQuestionType: "code_debug", recommendedReview: ["pid_control_v2"], severity: "high" },
  },
  {
    id: "pid_control_v2_q09_code_trace",
    type: "code_trace",
    difficulty: "medium",
    conceptTag: "pid_control_v2",
    question: "다음 코드의 출력으로 맞는 것을 고르라.",
    codeSnippet: "error = 1.0 - 0.4\nkp, ki, kd = 2.0, 0.0, 0.0\nu = kp * error\nprint(round(u, 2))",
    choices: ["1.2", "0.8", "2.0"],
    expectedAnswer: "1.2",
    explanation: "오차는 0.6이고 P 제어만 있으므로 u=2.0*0.6=1.2다.",
    stepByStepExplanation: ["target-measurement로 error를 구한다.", "I와 D gain은 0이라 제외한다.", "Kp*error를 계산한다.", "round(1.2,2)는 1.2다."],
    wrongAnswerAnalysis: { commonWrongAnswer: "0.8", whyWrong: "measurement 0.4를 직접 빼거나 gain을 잘못 적용한 계산 오류다.", errorType: "code_logic_error", reviewSession: "pid_control_v2", retryQuestionType: "calculation", recommendedReview: ["pid_control_v2"] },
  },
];

const pidControlSession = session({
  id: "pid_control_v2",
  part: "Part 3. 로봇 동역학과 제어",
  title: "PID Control with Saturation and Anti-windup",
  level: "intermediate",
  difficulty: "medium",
  estimatedMinutes: 90,
  prerequisites: ["differential_equation_discretization", "state_space_model"],
  learningObjectives: [
    "P, I, D 항을 쉬운 말과 수식으로 설명한다.",
    "overshoot, steady-state error, rise time, settling time을 step response에서 읽는다.",
    "saturation과 anti-windup이 실제 모터 제어에서 왜 필요한지 코드로 검증한다.",
  ],
  theory: {
    definition: "PID 제어는 목표값과 현재값의 차이인 오차를 P, I, D 세 항으로 나눠 제어 입력을 만드는 가장 널리 쓰이는 feedback 제어 방법이다.",
    whyItMatters: "로봇팔 관절, 바퀴 속도, 그리퍼 힘처럼 목표를 따라가야 하는 거의 모든 low-level 제어 루프에서 PID가 기본 출발점이다.",
    intuition: "목표 온도에 맞추는 에어컨처럼 생각하면 된다. P는 지금 덥거나 추운 만큼 바로 세게 틀고, I는 오래 남은 차이를 없애며, D는 너무 급하게 바뀌지 않도록 브레이크를 건다.",
    equations: [
      makeEquation("PID command", "u(t)=K_p e(t)+K_i \\int e(t)dt+K_d \\frac{de(t)}{dt}", [["u", "제어 입력"], ["e", "target-measurement 오차"], ["K_p", "현재 오차 gain"], ["K_i", "누적 오차 gain"], ["K_d", "오차 변화율 gain"]], "현재, 과거 누적, 미래 변화 경향을 한 명령으로 합친다."),
      makeEquation("Saturation", "u_{cmd}=clip(u,u_{min},u_{max})", [["clip", "하한/상한 제한"], ["u_min,u_max", "actuator 한계"]], "실제 모터에 보낼 수 있는 명령 범위를 넘지 않게 제한한다."),
      makeEquation("First-order motor", "\\dot y=(-y+u)/\\tau", [["y", "현재 속도 또는 위치"], ["u", "제어 입력"], ["\\tau", "반응 시간 상수"]], "간단한 모터 속도 응답을 step response로 실험하기 위한 모델이다."),
    ],
    derivation: [
      step("오차 정의", "목표와 현재값의 차이를 e=target-measurement로 둔다."),
      step("현재 오차 보정", "P항은 지금 남은 오차에 비례해 바로 밀어준다.", "u_P=K_p e"),
      step("누적 오차 보정", "I항은 오래 남은 오차를 시간에 따라 더해 steady-state error를 줄인다.", "u_I=K_i\\int e dt"),
      step("변화율 제동", "D항은 오차가 빨리 변할수록 반대 방향 브레이크처럼 작동한다.", "u_D=K_d de/dt"),
      step("실제 명령 제한", "세 항을 더한 뒤 actuator limit으로 clip하고 anti-windup으로 integral 폭주를 막는다."),
    ],
    handCalculation: {
      problem: "Kp=2, Ki=0.5, Kd=0, 현재 error=0.4, integral=0.6이면 u는?",
      given: { Kp: 2, Ki: 0.5, Kd: 0, error: 0.4, integral: 0.6 },
      steps: ["P항은 2*0.4=0.8", "I항은 0.5*0.6=0.3", "D항은 0", "u=0.8+0.3=1.1"],
      answer: "u=1.1",
    },
    robotApplication: "ros2_control position_controller나 velocity_controller 아래에서 실제 모터를 따라가게 만들 때 PID gain, saturation, anti-windup 설정이 tracking 품질과 안전을 좌우한다.",
  },
  codeLabs: [pidStepLab, pidCppLab],
  visualizations: [pidVisualization],
  quizzes: pidQuizzes,
  wrongAnswerTags: makeWrongTags("pid_control_v2", "PID gain, saturation, anti-windup 오류", ["pid_control_v2", "safety_watchdog_timer"]),
  commonMistakes: [
    "오차 부호를 뒤집어 positive feedback을 만듦",
    "Ki를 크게 올리면서 anti-windup을 넣지 않음",
    "D항을 노이즈 많은 measurement에 필터 없이 적용함",
    "saturation warning을 성능 향상 신호로 오해함",
  ],
  realWorldUseCase: "로봇팔 관절 위치 제어, 모바일 로봇 wheel speed 제어, 팬/펌프/그리퍼 힘 제어의 기본 low-level feedback loop다.",
  extensionTask: "실제 ros2_control YAML gain과 같은 Kp/Ki/Kd 조합을 넣고 step response overshoot, settling time, saturation count를 기록하라.",
  flashcards: [
    {
      id: "pid_control_v2_flashcard_terms",
      front: "PID에서 I항이 필요한 이유와 위험한 실패 모드는?",
      back: "I항은 steady-state error를 줄이지만 saturation 중 계속 누적되면 integral windup으로 overshoot와 늦은 회복을 만든다.",
      conceptTag: "pid_control_v2",
    },
  ],
  nextSessions: ["trajectory_planning_v2", "computed_torque_control"],
});

export const dynamicsControlSessions: Session[] = [
  pidControlSession,
  session({
    id: "robot_dynamics_2link_lagrange",
    part: "Part 3. 로봇 동역학과 제어",
    title: "2-link Robot Dynamics with Lagrange Equation",
    level: "advanced",
    prerequisites: ["forward_kinematics", "jacobian_from_multivariable_calculus", "differential_equation_discretization"],
    learningObjectives: ["2-link 로봇팔의 운동에너지와 위치에너지를 정의한다.", "Lagrange 방정식으로 joint torque 식을 유도한다.", "M(q), C(q,qdot), g(q)의 의미를 코드와 시각화로 연결한다."],
    theory: {
      definition: "Lagrange 동역학은 kinetic energy T와 potential energy U의 차이 L=T-U를 이용해 관절 토크 방정식을 얻는 방법이다.",
      whyItMatters: "로봇팔이 빠르게 움직이거나 payload를 들 때 단순 위치제어만으로는 토크, 관성, 중력 보상이 설명되지 않는다.",
      intuition: "로봇팔은 각 관절이 따로 움직이는 막대가 아니라, 한 관절 가속이 다른 관절 토크까지 바꾸는 연결된 에너지 시스템이다.",
      equations: [
        makeEquation("Lagrange equation", "\\tau_i=\\frac{d}{dt}\\frac{\\partial L}{\\partial \\dot q_i}-\\frac{\\partial L}{\\partial q_i}", [["L", "T-U"], ["q_i", "i번째 관절각"], ["\\tau_i", "i번째 관절 토크"]], "에너지 변화율에서 필요한 일반화 힘을 계산한다."),
        makeEquation("Manipulator equation", "\\tau=M(q)\\ddot q+C(q,\\dot q)\\dot q+g(q)", [["M", "관성행렬"], ["C", "Coriolis/centrifugal 항"], ["g", "중력 토크"]], "토크 계산과 computed torque control의 기본 식이다."),
      ],
      derivation: [
        step("COM 위치 정의", "각 링크 중심 y좌표를 q1, q2로 표현한다."),
        step("에너지 작성", "T는 translational/rotational kinetic energy, U는 mgy 합으로 쓴다."),
        step("Lagrangian 구성", "L=T-U를 만들고 각 qi에 대해 Lagrange equation을 적용한다."),
        step("항 묶기", "qddot 계수는 M, qdot 곱 항은 C, q만 남는 항은 g로 묶는다.", "\\tau=M(q)\\ddot q+C(q,\\dot q)\\dot q+g(q)"),
      ],
      handCalculation: {
        problem: "수평 자세 q1=0,q2=0에서 gravity torque 방향과 크기 관계를 판단하라.",
        given: { l1: 1, l2: 0.7, m1: 1.2, m2: 0.8, g: 9.81 },
        steps: ["joint2는 link2 COM만 지탱한다.", "joint1은 link1 COM과 link2 전체를 지탱한다.", "따라서 tau1 > tau2 > 0이다."],
        answer: "수평 자세에서 joint1 gravity torque가 joint2보다 크다.",
      },
      robotApplication: "MoveIt2 trajectory를 ros2_control로 실행할 때 feedforward gravity torque를 넣으면 같은 PID gain에서도 tracking error가 줄어든다.",
    },
    codeLabs: [torqueLab],
    visualizations: [
      makeVisualization("vis_two_link_dynamics_torque", "2-link Dynamics Torque Graph", "robot_dynamics_2link_lagrange", "tau=Mqddot+Cqdot+g", torqueLab.id, [
        { name: "q1", symbol: "q_1", min: -180, max: 180, default: 30, description: "shoulder angle degree" },
        { name: "q2", symbol: "q_2", min: -180, max: 180, default: 45, description: "elbow relative angle degree" },
        { name: "payload", symbol: "m_p", min: 0, max: 3, default: 0, description: "말단 payload 질량" },
      ], "토크가 actuator limit 아래면 추종 가능하다.", "수평+payload에서 gravity torque가 limit을 넘으면 tracking 실패와 과열 위험이 있다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "two_link_dynamics",
      conceptTag: "robot_dynamics_2link_lagrange",
      reviewSession: "2-link Robot Dynamics with Lagrange Equation",
      conceptQuestion: "M(q), C(q,qdot), g(q)는 각각 무엇을 의미하는가?",
      conceptAnswer: "M은 관성, C는 속도 결합에 의한 원심/코리올리 항, g는 중력 보상 토크다.",
      calculationQuestion: "qdot=0, qddot=0이면 필요한 토크 식은 무엇으로 줄어드는가?",
      calculationAnswer: "tau=g(q), 즉 gravity compensation 토크만 남는다.",
      codeQuestion: "gravity torque 코드에서 link2가 joint1 토크에도 들어가는 이유는?",
      codeAnswer: "joint1은 link2 전체의 무게와 COM 위치까지 지탱하기 때문이다.",
      debugQuestion: "수직 자세에서 gravity torque가 크게 나오면 어떤 버그를 의심하는가?",
      debugAnswer: "sin/cos 기준축 또는 degree/radian 변환 오류를 의심한다.",
      visualQuestion: "payload를 올릴 때 q1 torque graph가 크게 변하는 이유는?",
      visualAnswer: "payload 무게가 base joint에 대해 긴 moment arm을 만들기 때문이다.",
      robotQuestion: "로봇팔이 수평으로 팔을 뻗을 때 motor current가 커지는 이유는?",
      robotAnswer: "중력 모멘트 암이 커져 gravity compensation torque가 증가하기 때문이다.",
      designQuestion: "computed torque controller에 반드시 넣을 안전 제한은?",
      designAnswer: "토크/속도/온도 saturation, emergency stop, 모델 불확실성에 대한 fallback PID를 둔다.",
    }),
    wrongAnswerTags: makeWrongTags("robot_dynamics_2link_lagrange", "2-link 동역학과 토크 계산", ["Lagrange Equation", "Gravity Compensation"]),
    nextSessions: ["gravity_compensation", "computed_torque_control"],
  }),
  session({
    id: "lqr_riccati",
    part: "Part 3. 로봇 동역학과 제어",
    title: "LQR and Riccati Equation",
    level: "advanced",
    prerequisites: ["state_space_model", "stability"],
    learningObjectives: ["LQR cost function을 정의한다.", "Riccati equation과 feedback gain K의 관계를 설명한다.", "Q/R trade-off를 step response로 해석한다."],
    theory: {
      definition: "LQR은 선형 시스템에서 상태 오차와 제어 입력 비용의 가중합을 최소화하는 최적 feedback 제어기다.",
      whyItMatters: "자율주행 lateral control, 로봇팔 joint servo, balancing robot에서 PID보다 체계적으로 state coupling을 다룬다.",
      intuition: "목표에서 벗어난 정도와 제어를 세게 쓰는 비용 사이의 가격표를 정하고, 전체 비용이 가장 싼 feedback을 찾는다.",
      equations: [
        makeEquation("LQR cost", "J=\\sum_{k=0}^{\\infty}(x_k^TQx_k+u_k^TRu_k)", [["Q", "state error cost"], ["R", "control effort cost"], ["x,u", "state/control"]], "Q가 크면 빠르게 잡고 R이 크면 입력을 아낀다."),
        makeEquation("Feedback", "u=-Kx, K=(R+B^TPB)^{-1}B^TPA", [["P", "Riccati solution"], ["K", "feedback gain"]], "Riccati solution에서 안정화 gain을 계산한다."),
      ],
      derivation: [
        step("선형 모델", "x_{k+1}=Ax_k+Bu_k를 둔다."),
        step("quadratic value", "V(x)=x^TPx로 미래 비용을 표현한다."),
        step("Bellman 최소화", "현재 비용+다음 value를 u에 대해 최소화한다."),
        step("K 계산", "u에 대한 gradient를 0으로 두면 K 식이 나온다."),
      ],
      handCalculation: {
        problem: "R을 크게 키우면 LQR gain과 응답은 어떻게 변하는가?",
        given: { Q: "fixed", R: "increase" },
        steps: ["R은 입력 비용이다.", "입력을 비싸게 만들면 같은 오차에도 u를 덜 쓴다.", "따라서 K가 작아지고 응답은 느려진다."],
        answer: "gain은 감소하고 settling은 느려지지만 control energy는 줄어든다.",
      },
      robotApplication: "자율주행 lateral error와 heading error를 state로 둔 LQR controller는 속도별 gain scheduling으로 안정적인 path tracking을 만든다.",
    },
    codeLabs: [lqrLab],
    visualizations: [
      makeVisualization("vis_lqr_step_response", "PID vs LQR Step Response", "lqr_riccati", "u=-Kx", lqrLab.id, [
        { name: "Q", symbol: "Q", min: 0.1, max: 10, default: 1, description: "상태 오차 비용" },
        { name: "R", symbol: "R", min: 0.01, max: 10, default: 0.1, description: "입력 비용" },
      ], "적절한 Q/R이면 빠르고 과도하지 않은 수렴이 나온다.", "R이 너무 작으면 actuator saturation이 발생한다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "lqr",
      conceptTag: "lqr_riccati",
      reviewSession: "LQR",
      conceptQuestion: "LQR에서 Q와 R은 무엇을 조절하는가?",
      conceptAnswer: "Q는 상태 오차 비용, R은 제어 입력 비용을 조절한다.",
      calculationQuestion: "u=-Kx, K=2, x=0.5이면 u는?",
      calculationAnswer: "u=-1.0이다.",
      codeQuestion: "scalar LQR iteration에서 K는 어떤 분모를 갖는가?",
      codeAnswer: "R + B^T P B이며 scalar에서는 r + b*P*b다.",
      debugQuestion: "u=+Kx로 구현하면 어떤 문제가 생기는가?",
      debugAnswer: "음의 feedback이 양의 feedback으로 바뀌어 상태가 발산할 수 있다.",
      visualQuestion: "R을 낮출 때 응답은 빨라지지만 어떤 실패가 생길 수 있는가?",
      visualAnswer: "입력이 커져 actuator saturation이나 진동이 생길 수 있다.",
      robotQuestion: "속도가 높은 차량 lateral LQR에서 gain을 그대로 쓰면 위험한 이유는?",
      robotAnswer: "동역학이 속도에 따라 바뀌므로 같은 gain이 과도한 조향이나 불안정을 만들 수 있다.",
      designQuestion: "LQR을 실제 로봇에 넣을 때 PID 대비 추가해야 할 검증은?",
      designAnswer: "state estimation 지연, actuator saturation, 모델 A/B 오차, gain scheduling 범위를 검증한다.",
    }),
    wrongAnswerTags: makeWrongTags("lqr_riccati", "LQR Riccati와 Q/R trade-off", ["State-space Model", "Stability"]),
    nextSessions: ["mpc_formulation", "real_time_control_loop"],
  }),
];
