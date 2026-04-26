import type { Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

const ros2ControlPidLab = {
  id: "lab_ros2_control_pid_mock",
  title: "C++ ros2_control PID Hardware Loop Mock",
  language: "cpp" as const,
  theoryConnection: "read() -> controller update(dt) -> write(), u=clip(PID(error), effort_limit)",
  starterCode: `#include <algorithm>
#include <cmath>
#include <iomanip>
#include <iostream>

class Pid {
 public:
  Pid(double kp, double ki, double kd, double limit)
      : kp_(kp), ki_(ki), kd_(kd), limit_(limit) {}

  double Update(double target, double measured, double dt) {
    // TODO: error, integral, derivative, saturation, anti-windup
    return 0.0;
  }

 private:
  double kp_, ki_, kd_, limit_;
  double integral_ = 0.0;
  double prev_error_ = 0.0;
};

struct HardwareLoopMock {
  double position = 0.0;
  double effort_command = 0.0;
  void Write(double effort, double dt) {
    // TODO: simple plant position += dt * effort
  }
};

int main() {
  Pid pid(4.0, 1.0, 0.1, 1.0);
  HardwareLoopMock hw;
  const double cmd = pid.Update(1.0, hw.position, 0.02);
  hw.Write(cmd, 0.1);
  std::cout << std::fixed << std::setprecision(3)
            << "cmd=" << cmd << "\\nstate=" << hw.position << "\\n";
}`,
  solutionCode: `#include <algorithm>
#include <cmath>
#include <iomanip>
#include <iostream>

class Pid {
 public:
  Pid(double kp, double ki, double kd, double limit)
      : kp_(kp), ki_(ki), kd_(kd), limit_(limit) {}

  double Update(double target, double measured, double dt) {
    const double error = target - measured;
    const double derivative = (error - prev_error_) / dt;
    const double candidate_integral = integral_ + error * dt;
    const double raw = kp_ * error + ki_ * candidate_integral + kd_ * derivative;
    const double saturated = std::clamp(raw, -limit_, limit_);
    if (std::abs(raw - saturated) < 1e-12 || error * saturated < 0.0) {
      integral_ = candidate_integral;
    }
    prev_error_ = error;
    return saturated;
  }

 private:
  double kp_, ki_, kd_, limit_;
  double integral_ = 0.0;
  double prev_error_ = 0.0;
};

struct HardwareLoopMock {
  double position = 0.0;
  double effort_command = 0.0;
  void Write(double effort, double dt) {
    effort_command = effort;
    position += dt * effort_command;
  }
};

int main() {
  Pid pid(4.0, 1.0, 0.1, 1.0);
  HardwareLoopMock hw;
  const double cmd = pid.Update(1.0, hw.position, 0.02);
  hw.Write(cmd, 0.1);
  std::cout << std::fixed << std::setprecision(3)
            << "cmd=" << cmd << "\\nstate=" << hw.position << "\\n";
}`,
  testCode: `#include <cassert>
#include <cmath>

class Pid;
struct HardwareLoopMock;

int main() {
  Pid pid(4.0, 1.0, 0.1, 1.0);
  HardwareLoopMock hw;
  const double cmd = pid.Update(1.0, 0.0, 0.02);
  assert(std::abs(cmd - 1.0) < 1e-12);
  hw.Write(cmd, 0.1);
  assert(std::abs(hw.position - 0.1) < 1e-12);
}`,
  expectedOutput: "cmd=1.000\nstate=0.100",
  runCommand: "g++ -std=c++17 ros2_control_pid_mock.cpp -o ros2_control_pid_mock && ./ros2_control_pid_mock",
  commonBugs: [
    "write()에서 effort limit을 다시 확인하지 않아 controller 버그가 바로 actuator로 전달됨",
    "saturation 중 integral을 계속 누적해 windup이 생김",
    "read/update/write 주기를 섞어 dt를 실제 controller period와 다르게 씀",
  ],
  extensionTask:
    "ros2_control SystemInterface의 read(), write() mock을 클래스로 분리하고 joint limit violation counter를 추가하라.",
};

export const ros2ControlPidSessions: Session[] = [
  makeAdvancedSession({
    id: "ros2_control_pid_hardware_loop",
    part: "Part 6. ROS2 실전 연결",
    title: "C++ ros2_control PID와 Hardware Loop Mock",
    prerequisites: ["pid_control_v2", "ros2_subscriber_pub_loop"],
    objectives: [
      "ros2_control의 read-update-write 흐름을 설명한다.",
      "C++ PID에 saturation과 anti-windup을 넣는다.",
      "hardware_interface에서 command limit을 한 번 더 확인해야 하는 이유를 말한다.",
      "controller period dt가 실제 plant update와 연결되는 방식을 계산한다.",
    ],
    definition:
      "ros2_control 기반 제어는 hardware read()로 state를 읽고 controller가 command를 계산한 뒤 hardware write()가 actuator 명령을 내보내는 반복 구조다.",
    whyItMatters:
      "현업 로봇 제어 코드는 대부분 C++ hardware_interface와 controller loop에서 돌아간다. Python PID만 알면 실제 actuator limit, dt, anti-windup 배치를 놓치기 쉽다.",
    intuition:
      "센서를 읽고, 제어기가 계산하고, 모터에 쓰는 세 단계를 컨베이어 벨트처럼 매 주기 반복한다. 각 단계에 안전 게이트가 있어야 한 단계의 실수가 다음 단계로 번지지 않는다.",
    equations: [
      {
        label: "PID with saturation",
        expression: "u=clip(K_pe+K_i\\int e dt+K_d\\dot e,-u_{max},u_{max})",
        terms: [["u", "actuator command"], ["u_max", "hardware effort limit"]],
        explanation: "controller 출력은 actuator 물리 한계를 넘을 수 없다.",
      },
      {
        label: "Anti-windup gate",
        expression: "\\int e dt \\leftarrow \\int e dt + e\\Delta t \\;\\; only\\; if\\; not\\; saturating",
        terms: [["Δt", "controller period"]],
        explanation: "saturation 중 integral이 계속 커지면 목표를 지난 뒤에도 명령이 늦게 풀린다.",
      },
      {
        label: "Hardware loop",
        expression: "x_{k+1}=read();\\; u_k=controller(x_k);\\; write(u_k)",
        terms: [["read/write", "hardware interface boundary"]],
        explanation: "알고리즘과 하드웨어 안전 책임을 분리한다.",
      },
    ],
    derivation: [
      ["read", "joint state와 timestamp를 hardware interface에서 읽는다."],
      ["update", "controller period dt로 PID command를 계산한다."],
      ["safety clamp", "controller와 hardware 양쪽에서 effort/velocity/position limit을 검사한다."],
      ["write", "limit을 통과한 command만 actuator interface로 보낸다."],
    ],
    handCalculation: {
      problem: "effort limit=1.0, raw PID output=4.2이면 write()로 보내는 command는?",
      given: { raw: 4.2, limit: 1.0 },
      steps: ["clip(4.2,-1,1)을 적용한다.", "상한 1.0을 넘으므로 1.0으로 포화된다."],
      answer: "u=1.0",
    },
    robotApplication:
      "ros2_control의 JointTrajectoryController 또는 custom controller에서 gain tuning보다 먼저 확인할 것은 command interface limit, update_rate, stale state, emergency stop이다.",
    lab: ros2ControlPidLab,
    visualization: {
      id: "vis_ros2_control_pid_loop",
      title: "ros2_control read-update-write 루프",
      equation: "read -> PID(dt) -> clamp -> write",
      parameters: [
        { name: "dt_ms", symbol: "\\Delta t", min: 1, max: 50, default: 10, description: "controller period" },
        { name: "raw_command", symbol: "u_{raw}", min: -3, max: 3, default: 1.6, description: "PID raw command" },
      ],
      normalCase: "dt가 작고 command가 limit 안에 있으면 tracking이 부드럽다.",
      failureCase: "dt가 크거나 command가 오래 포화되면 windup과 진동이 생긴다.",
    },
    quiz: {
      id: "ros2_control_pid",
      conceptQuestion: "ros2_control에서 read(), update(), write()를 분리하는 이유는?",
      conceptAnswer: "hardware state I/O와 controller 계산 책임을 분리해 dt, limit, safety gate를 명확히 하기 위해서다.",
      calculationQuestion: "raw=2.4, limit=1.0이면 saturated command는?",
      calculationAnswer: "clip(2.4,-1,1)=1.0이다.",
      codeQuestion: "C++17 saturation 한 줄은?",
      codeAnswer: "const double saturated = std::clamp(raw, -limit, limit);",
      debugQuestion: "목표 도달 후에도 command가 오래 남는다면 무엇을 의심하는가?",
      debugAnswer: "saturation 중 integral이 계속 누적되는 windup과 dt 설정 오류를 의심한다.",
      visualQuestion: "dt_ms를 크게 키우면 control loop는 어떻게 변하는가?",
      visualAnswer: "샘플링이 느려져 overshoot와 지연이 커지고 안정 여유가 줄어든다.",
      robotQuestion: "hardware_interface write()에서 controller가 이미 clamp했다고 믿으면 안 되는 이유는?",
      robotAnswer: "상위 controller 버그나 stale command가 있어도 hardware boundary에서 마지막 안전 제한을 적용해야 하기 때문이다.",
      designQuestion: "실제 ros2_control PID 배포 전 체크리스트는?",
      designAnswer: "joint limit, update_rate, anti-windup, stale state timeout, estop, command logging, slow-speed test를 확인한다.",
    },
    wrongTagLabel: "ros2_control PID/hardware loop 오류",
    nextSessions: ["safety_watchdog_timer", "ros2_subscriber_pub_loop"],
  }),
];
