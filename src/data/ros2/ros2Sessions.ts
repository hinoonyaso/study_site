import type { Session } from "../../types";
import { ensureCodeLabShape, makeCoreQuizzes, makeEquation, makeVisualization, makeWrongTags, session, step } from "../core/v2SessionHelpers";

const tf2Lab = ensureCodeLabShape({
  id: "lab_ros2_tf2_broadcaster",
  title: "ROS2 TF2 Transform Broadcaster",
  language: "cpp",
  theoryConnection: "T_map_base = T_map_odom * T_odom_base",
  starterCode: `#include <memory>
#include "rclcpp/rclcpp.hpp"
#include "geometry_msgs/msg/transform_stamped.hpp"
#include "tf2_ros/transform_broadcaster.h"

class StaticBaseBroadcaster : public rclcpp::Node {
public:
  StaticBaseBroadcaster() : Node("static_base_broadcaster") {
    // TODO: create tf2_ros::TransformBroadcaster
    // TODO: fill header.frame_id, child_frame_id, translation, rotation
    // TODO: send transform on timer
  }
};

int main(int argc, char ** argv) {
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<StaticBaseBroadcaster>());
  rclcpp::shutdown();
}`,
  solutionCode: `#include <memory>
#include "rclcpp/rclcpp.hpp"
#include "geometry_msgs/msg/transform_stamped.hpp"
#include "tf2_ros/transform_broadcaster.h"

class StaticBaseBroadcaster : public rclcpp::Node {
public:
  StaticBaseBroadcaster() : Node("static_base_broadcaster") {
    broadcaster_ = std::make_unique<tf2_ros::TransformBroadcaster>(*this);
    timer_ = create_wall_timer(std::chrono::milliseconds(50), [this]() {
      geometry_msgs::msg::TransformStamped tf;
      tf.header.stamp = now();
      tf.header.frame_id = "odom";
      tf.child_frame_id = "base_link";
      tf.transform.translation.x = 1.0;
      tf.transform.translation.y = 0.0;
      tf.transform.translation.z = 0.0;
      tf.transform.rotation.w = 1.0;
      broadcaster_->sendTransform(tf);
    });
  }
private:
  std::unique_ptr<tf2_ros::TransformBroadcaster> broadcaster_;
  rclcpp::TimerBase::SharedPtr timer_;
};

int main(int argc, char ** argv) {
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<StaticBaseBroadcaster>());
  rclcpp::shutdown();
}`,
  testCode: `# Build:
colcon build --packages-select tf2_lab
source install/setup.bash
ros2 run tf2_lab static_base_broadcaster

# Runtime checks:
ros2 run tf2_ros tf2_echo odom base_link
ros2 run tf2_tools view_frames

# Expected:
# translation x is close to 1.0
# parent frame is odom
# child frame is base_link`,
  expectedOutput: "odom -> base_link transform is published at about 20 Hz with x=1.0 and quaternion w=1.0",
  runCommand: "colcon build --packages-select tf2_lab && ros2 run tf2_lab static_base_broadcaster",
  commonBugs: ["header.stamp를 갱신하지 않아 stale TF가 됨", "parent/child frame을 반대로 발행함", "quaternion normalization을 지키지 않음"],
  extensionTask: "base_link->camera_link transform을 추가하고 RViz TF tree에서 frame 연결을 확인하라.",
});

export const ros2Sessions: Session[] = [
  session({
    id: "ros2_tf2_transform",
    part: "Part 6. ROS2 실전 연결",
    title: "ROS2 TF2 Transform Broadcaster",
    level: "intermediate",
    prerequisites: ["homogeneous_transform", "quaternion_basics", "ros2_node"],
    learningObjectives: ["TF2 parent/child frame 관계를 설명한다.", "TransformStamped를 C++ broadcaster로 발행한다.", "stale transform과 frame 방향 오류를 진단한다."],
    theory: {
      definition: "TF2는 시간에 따라 변하는 coordinate frame tree를 관리하고, 특정 시간의 frame 간 transform을 조회하게 해주는 ROS2 핵심 시스템이다.",
      whyItMatters: "카메라, LiDAR, base_link, odom, map frame이 일관되지 않으면 perception 결과가 로봇 action으로 안전하게 변환되지 않는다.",
      intuition: "로봇의 각 센서와 몸체에 이름표가 붙어 있고, TF2는 이름표 사이의 위치/자세 관계와 시간을 기록하는 족보다.",
      equations: [
        makeEquation("Transform chain", "T_{map}^{base}=T_{map}^{odom}T_{odom}^{base}", [["T", "homogeneous transform"], ["map, odom, base", "ROS frame"]], "frame 변환은 행렬곱 순서가 중요하다."),
        makeEquation("Point transform", "p_{odom}=T_{odom}^{base}p_{base}", [["p", "점 좌표"], ["T", "base에서 odom으로 가는 transform"]], "어느 frame의 점인지 명시해야 한다."),
      ],
      derivation: [
        step("frame 방향 정의", "parent frame에서 child frame pose를 나타내는 TransformStamped를 만든다."),
        step("translation/rotation 채우기", "meter와 normalized quaternion을 사용한다."),
        step("timestamp 부여", "동적 transform은 현재 time stamp를 계속 갱신한다."),
        step("chain 조회", "TF tree에서 필요한 source/target frame 사이 transform을 합성한다."),
      ],
      handCalculation: {
        problem: "odom->base_link가 x=1m translation이고 base point p=[2,0,1]이면 odom 좌표는?",
        given: { transform: "x=1m", point_base: "[2,0,1]" },
        steps: ["rotation은 identity", "translation [1,0]을 더함", "x=3, y=0"],
        answer: "p_odom=[3,0,1]",
      },
      robotApplication: "Object detection pixel을 depth와 camera intrinsics로 3D point로 만든 뒤 camera_link->base_link TF를 적용해야 로봇팔 grasp pose가 맞다.",
    },
    codeLabs: [tf2Lab],
    visualizations: [
      makeVisualization("vis_ros2_tf_tree", "ROS2 TF2 Transform Tree", "ros2_tf2_transform", "T_map_base=T_map_odom*T_odom_base", tf2Lab.id, [
        { name: "tf_age_ms", symbol: "\\Delta t", min: 0, max: 500, default: 20, description: "transform age in milliseconds" },
        { name: "yaw_deg", symbol: "\\psi", min: -180, max: 180, default: 0, description: "base_link yaw relative to odom" },
      ], "TF age가 작고 tree가 단일 연결이면 transform lookup이 안정적이다.", "stale TF나 끊긴 tree는 perception-to-action 변환을 실패시킨다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "ros2_tf2",
      conceptTag: "ros2_tf2_transform",
      reviewSession: "ROS2 TF2",
      conceptQuestion: "TF2에서 parent frame과 child frame을 바꾸면 왜 문제가 되는가?",
      conceptAnswer: "transform 방향이 반대로 해석되어 point 변환과 로봇 pose가 잘못 계산된다.",
      calculationQuestion: "identity rotation, translation x=1에서 base x=2 점의 odom x는?",
      calculationAnswer: "1+2=3이다.",
      codeQuestion: "동적 TF broadcaster가 매번 갱신해야 하는 필드는?",
      codeAnswer: "header.stamp를 현재 시간으로 갱신해야 한다.",
      debugQuestion: "tf2_echo에서 extrapolation error가 나면 무엇을 의심하는가?",
      debugAnswer: "timestamp mismatch, stale transform, clock 설정 문제를 의심한다.",
      visualQuestion: "tf_age_ms가 deadline보다 커지면 어떤 위험이 있는가?",
      visualAnswer: "오래된 pose로 perception 결과를 변환해 action 위치가 틀어진다.",
      robotQuestion: "카메라 detection을 base_link action으로 바꿀 때 필요한 TF chain은?",
      robotAnswer: "camera_link에서 base_link까지의 transform chain과 timestamp 일치가 필요하다.",
      designQuestion: "로봇 시스템 설계에서 TF watchdog은 무엇을 검사해야 하는가?",
      designAnswer: "필수 frame 존재, transform age, tree disconnect, quaternion normalization을 검사한다.",
    }),
    wrongAnswerTags: makeWrongTags("ros2_tf2_transform", "ROS2 TF2 frame/time 오류", ["Homogeneous Transform", "Quaternion Basics"]),
    nextSessions: ["sensor_pipeline", "robot_system_debugging"],
  }),
];
