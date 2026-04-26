import type { Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

const ros2NodeLab = {
  id: "lab_rclcpp_subscriber_timer_publisher",
  title: "rclcpp Subscriber→Timer→Publisher Node",
  language: "cpp" as const,
  theoryConnection: "subscription callback caches sensor state; timer callback validates timestamp and publishes bounded command",
  starterCode: `#include <algorithm>
#include <chrono>
#include <memory>

#include "geometry_msgs/msg/twist.hpp"
#include "rclcpp/rclcpp.hpp"
#include "sensor_msgs/msg/range.hpp"

class RangeFollowNode : public rclcpp::Node {
 public:
  RangeFollowNode() : Node("range_follow_node") {
    // TODO: create subscription to /range and publisher to /cmd_vel.
    // TODO: create wall timer at 20ms.
  }

 private:
  void OnRange(sensor_msgs::msg::Range::SharedPtr msg) {
    // TODO: cache range and stamp only; keep callback short.
  }

  void OnTimer() {
    // TODO: stale check, proportional control, clamp, publish Twist.
  }

  double latest_range_ = 0.0;
  rclcpp::Time latest_stamp_;
};

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<RangeFollowNode>());
  rclcpp::shutdown();
}`,
  solutionCode: `#include <algorithm>
#include <chrono>
#include <memory>

#include "geometry_msgs/msg/twist.hpp"
#include "rclcpp/rclcpp.hpp"
#include "sensor_msgs/msg/range.hpp"

using namespace std::chrono_literals;

class RangeFollowNode : public rclcpp::Node {
 public:
  RangeFollowNode() : Node("range_follow_node"), latest_stamp_(this->now()) {
    sub_ = create_subscription<sensor_msgs::msg::Range>(
      "/range", rclcpp::SensorDataQoS(),
      [this](sensor_msgs::msg::Range::SharedPtr msg) { OnRange(msg); });
    pub_ = create_publisher<geometry_msgs::msg::Twist>("/cmd_vel", 10);
    timer_ = create_wall_timer(20ms, [this]() { OnTimer(); });
  }

 private:
  void OnRange(sensor_msgs::msg::Range::SharedPtr msg) {
    latest_range_ = msg->range;
    latest_stamp_ = msg->header.stamp;
  }

  void OnTimer() {
    geometry_msgs::msg::Twist cmd;
    const double age = (this->now() - latest_stamp_).seconds();
    if (age < 0.2 && std::isfinite(latest_range_)) {
      const double error = latest_range_ - 0.5;
      cmd.linear.x = std::clamp(0.8 * error, -0.2, 0.2);
    }
    pub_->publish(cmd);
  }

  rclcpp::Subscription<sensor_msgs::msg::Range>::SharedPtr sub_;
  rclcpp::Publisher<geometry_msgs::msg::Twist>::SharedPtr pub_;
  rclcpp::TimerBase::SharedPtr timer_;
  double latest_range_ = 0.0;
  rclcpp::Time latest_stamp_;
};

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<RangeFollowNode>());
  rclcpp::shutdown();
}`,
  testCode: `# ROS2 환경에서 실행:
# colcon build --packages-select range_follow_demo
# ros2 run range_follow_demo range_follow_node
# ros2 topic pub /range sensor_msgs/msg/Range "{header: {stamp: {sec: 0, nanosec: 0}, frame_id: base_link}, radiation_type: 0, field_of_view: 0.1, min_range: 0.02, max_range: 4.0, range: 0.8}"
# ros2 topic echo /cmd_vel --once
# 기대: linear.x가 0.2 이하로 clamp된다.`,
  expectedOutput: "/cmd_vel linear.x within [-0.2, 0.2]",
  runCommand: "colcon build --packages-select range_follow_demo && ros2 run range_follow_demo range_follow_node",
  commonBugs: [
    "sensor callback 안에서 publish와 긴 계산을 모두 수행해 executor jitter를 키움",
    "header.stamp 대신 now()를 저장해 stale data를 검출하지 못함",
    "SensorDataQoS를 쓰지 않아 range topic drop/latency 특성이 실제 센서와 맞지 않음",
  ],
  extensionTask: "callback group을 분리하고 MultiThreadedExecutor에서 perception callback과 control timer jitter를 측정하라.",
};

const rosLoopLab = {
  id: "lab_ros2_subscriber_pub_loop",
  title: "ROS2 Subscriber to Publisher Control Loop",
  language: "cpp" as const,
  theoryConnection: "sensor callback updates state, timer publishes bounded command",
  starterCode: `#include <algorithm>
#include <iostream>

double clamp_command(double command, double limit) {
  // TODO: clamp to [-limit, limit]
  return command;
}

int main() {
  std::cout << clamp_command(2.5, 1.0) << "\\n";
}`,
  solutionCode: `#include <algorithm>
#include <iostream>

double clamp_command(double command, double limit) {
  return std::clamp(command, -limit, limit);
}

int main() {
  std::cout << clamp_command(2.5, 1.0) << "\\n";
}`,
  testCode: `#include <cassert>

double clamp_command(double command, double limit);

int main() {
  assert(clamp_command(2.5, 1.0) == 1.0);
  assert(clamp_command(-2.5, 1.0) == -1.0);
  assert(clamp_command(0.5, 1.0) == 0.5);
}`,
  expectedOutput: "1",
  runCommand: "g++ -std=c++17 ros2_subscriber_pub_loop.cpp -o ros2_subscriber_pub_loop && ./ros2_subscriber_pub_loop",
  commonBugs: ["subscriber callback 안에서 긴 계산을 수행해 executor를 막음", "command limit 없이 publisher에 보냄", "stale sensor timestamp를 확인하지 않음"],
  extensionTask: "실제 ROS2 node로 확장해 sensor_msgs 입력을 받고 geometry_msgs/Twist를 publish하라.",
};

const ros2SubscriberLoopSession = makeAdvancedSession({
    id: "ros2_subscriber_pub_loop",
    part: "Part 6. ROS2 실전 연결",
    title: "ROS2 Subscriber→Control→Publisher 루프",
    prerequisites: ["ros2_tf2_transform", "safety_watchdog_timer"],
    objectives: ["subscriber callback과 timer callback 역할을 구분한다.", "센서 timestamp와 stale data를 검사한다.", "command clamp와 watchdog을 publisher 앞에 둔다.", "ROS2 control loop latency를 설계한다."],
    definition: "ROS2 제어 노드는 센서 topic을 구독해 최신 state를 갱신하고, timer loop에서 안전 검사 후 command topic을 발행하는 구조로 작성한다.",
    whyItMatters: "실제 로봇SW는 수학 알고리즘보다 메시지 시간, stale data, command limit, callback blocking이 더 자주 문제를 만든다.",
    intuition: "센서가 들어올 때마다 메모장에 최신 값을 적고, 정해진 주기마다 메모장을 읽어 안전한 명령만 내보내는 방식이다.",
    equations: [
      { label: "Command clamp", expression: "u=\\min(u_{max},\\max(u_{min},u_{raw}))", terms: [["u_raw", "algorithm command"], ["u", "safe command"]], explanation: "actuator limit을 넘는 명령을 잘라낸다." },
      { label: "Stale check", expression: "t_{now}-t_{stamp}<t_{timeout}", terms: [["t_timeout", "허용 data age"]], explanation: "오래된 센서로 제어하지 않는다." },
      { label: "Loop budget", expression: "T_{compute}<T_{period}", terms: [["T_period", "control period"]], explanation: "주기 안에 계산이 끝나야 한다." },
    ],
    derivation: [["subscriber", "센서 callback은 최신 값과 timestamp만 저장한다."], ["timer", "정해진 주기로 state를 읽고 command를 계산한다."], ["safety gate", "stale, limit, estop, watchdog을 확인한다."], ["publisher", "통과한 command만 publish한다."]],
    handCalculation: { problem: "now=10.8, stamp=10.1, timeout=0.5이면 stale인가?", given: { now: 10.8, stamp: 10.1, timeout: 0.5 }, steps: ["age=0.7", "0.7>0.5"], answer: "stale이므로 command를 막는다." },
    robotApplication: "perception-to-action loop에서 camera detection이 200ms 늦으면 로봇팔이 이미 지나간 물체를 집으려 할 수 있어 timestamp gate가 필요하다.",
    lab: ros2NodeLab,
    visualization: { id: "vis_ros2_subscriber_loop", title: "ROS2 감지→제어→발행 루프", equation: "age<timeout and |u|<limit", parameters: [{ name: "sensor_age_ms", symbol: "\\Delta t", min: 0, max: 1000, default: 30, description: "sensor data age" }, { name: "command", symbol: "u", min: -2, max: 2, default: 0.5, description: "raw command" }], normalCase: "fresh sensor와 bounded command만 publish된다.", failureCase: "stale data나 command saturation이면 stop command로 전환한다." },
    quiz: {
      id: "ros2_loop",
      conceptQuestion: "subscriber callback에서 긴 계산을 피해야 하는 이유는?",
      conceptAnswer: "executor를 막아 다른 callback과 timer가 지연되고 control loop deadline을 놓칠 수 있기 때문이다.",
      calculationQuestion: "period=20ms이면 control frequency는?",
      calculationAnswer: "1/0.02=50Hz이다.",
      codeQuestion: "C++17 clamp 한 줄은?",
      codeAnswer: "return std::clamp(command, -limit, limit);",
      debugQuestion: "로봇이 오래된 detection으로 움직이면 무엇을 확인하는가?",
      debugAnswer: "message timestamp와 stale timeout gate를 확인한다.",
      visualQuestion: "sensor_age_ms가 timeout을 넘으면 루프는?",
      visualAnswer: "publish를 막거나 stop command로 전환해야 한다.",
      robotQuestion: "perception 결과를 action으로 연결할 때 최소 안전 gate는?",
      robotAnswer: "timestamp, TF availability, confidence, workspace bound, command limit, estop을 확인한다.",
      designQuestion: "실시간 ROS2 control node 구조는?",
      designAnswer: "callback은 state cache만 갱신하고 timer loop가 deterministic하게 계산과 safety gate, publish를 수행한다.",
    },
    wrongTagLabel: "ROS2 callback/latency/safety 오류",
    nextSessions: ["safety_latency_jitter_profiling", "vla_architecture_concepts"],
  });

export const ros2SubscriberLoopSessions: Session[] = [
  {
    ...ros2SubscriberLoopSession,
    codeLabs: [ros2NodeLab, rosLoopLab],
  },
];
