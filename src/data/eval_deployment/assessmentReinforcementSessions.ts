import type { ErrorType, QuizQuestionTypeV2, QuizQuestionV2, Session, VisualizationSpec } from "../../types";
import { makeAdvancedSession } from "../core/advancedSessionFactory";

type Param = VisualizationSpec["parameters"][number];

const param = (
  name: string,
  symbol: string,
  min: number,
  max: number,
  defaultValue: number,
  description: string,
): Param => ({ name, symbol, min, max, default: defaultValue, description });

const errorByType: Record<Exclude<QuizQuestionTypeV2, "counterexample">, ErrorType> = {
  concept: "concept_confusion",
  calculation: "calculation_error",
  derivation: "formula_misunderstanding",
  code_completion: "code_logic_error",
  code_debug: "code_logic_error",
  code_trace: "code_logic_error",
  visualization_interpretation: "visualization_misread",
  robot_scenario: "robot_application_error",
  system_design: "system_design_error",
  safety_analysis: "safety_misjudgment",
  integration_pipeline: "system_design_error",
  cli_command: "code_logic_error",
};

const q = (
  sessionId: string,
  suffix: string,
  type: Exclude<QuizQuestionTypeV2, "counterexample">,
  difficulty: QuizQuestionV2["difficulty"],
  question: string,
  expectedAnswer: string,
  explanation: string,
  retryQuestionType: QuizQuestionTypeV2,
  codeSnippet?: string,
  steps?: string[],
): QuizQuestionV2 => ({
  id: `${sessionId}_${suffix}`,
  type,
  difficulty,
  conceptTag: sessionId,
  question,
  expectedAnswer,
  explanation,
  codeSnippet,
  stepByStepExplanation: steps,
  wrongAnswerAnalysis: {
    commonWrongAnswer: "정답 키워드만 쓰고 수식, launch 필드, 시각화 파라미터, 복습 세션 연결을 빠뜨림",
    whyWrong: "평가 문제는 암기가 아니라 같은 개념을 식, 코드, 시각화, ROS 2 설정, 최종시험 복습으로 연결하는지 확인한다.",
    errorType: errorByType[type],
    reviewSession: sessionId,
    retryQuestionType,
    recommendedReview: [sessionId],
    severity: difficulty === "hard" ? "high" : "medium",
  },
});

const withExtraQuizzes = (base: Session, extra: QuizQuestionV2[]): Session => ({
  ...base,
  quizzes: [...base.quizzes, ...extra],
});

const partialDerivativeSessionId = "partial_derivative_assessment_drill";
const partialDerivativeSession = withExtraQuizzes(
  makeAdvancedSession({
    id: partialDerivativeSessionId,
    part: "Part 1. 로봇 공부의 첫걸음 (기초 수학과 환경 설정)",
    title: "편미분 전용 평가: gradient, chain rule, Jacobian entry",
    level: "beginner",
    difficulty: "medium",
    estimatedMinutes: 70,
    prerequisites: ["calculus_basics", "partial_derivative_gradient_tangent_plane"],
    objectives: [
      "편미분을 기울기 벡터와 Jacobian 원소로 해석한다.",
      "chain rule 유도 순서를 맞춘다.",
      "시각화된 tangent slope에서 파라미터를 추정한다.",
    ],
    definition: "편미분은 여러 입력 중 하나만 바꾸었을 때 출력이 얼마나 변하는지 측정하는 국소 민감도다.",
    whyItMatters: "IK, EKF, backprop, MPC는 모두 편미분으로 만든 Jacobian이나 gradient를 사용한다.",
    intuition: "언덕 위에서 x방향으로만 한 발 움직였을 때 높이가 얼마나 변하는지 보는 것이 편미분이다.",
    equations: [
      {
        label: "Partial derivative",
        expression: "\\partial f/\\partial x_i=\\lim_{h\\to0}(f(x+h e_i)-f(x))/h",
        terms: [["x_i", "하나의 입력 축"], ["e_i", "해당 축의 단위벡터"]],
        explanation: "한 축만 움직여 국소 변화율을 본다.",
      },
      {
        label: "Gradient",
        expression: "\\nabla f=[\\partial f/\\partial x_1,\\dots,\\partial f/\\partial x_n]^T",
        terms: [["nabla f", "가장 빠르게 증가하는 방향"]],
        explanation: "편미분을 모으면 gradient가 된다.",
      },
      {
        label: "Chain rule",
        expression: "\\partial f(g(x))/\\partial x=(\\partial f/\\partial g)(\\partial g/\\partial x)",
        terms: [["g", "중간 함수"]],
        explanation: "합성함수 미분은 바깥 변화율과 안쪽 변화율을 곱한다.",
      },
    ],
    derivation: [
      ["freeze axes", "한 입력 축만 움직이고 나머지는 고정한다.", "x_j=const"],
      ["local slope", "작은 h에 대한 변화율을 계산한다.", "\\Delta f/h"],
      ["limit", "h를 0으로 보내 순간 기울기를 얻는다.", "\\partial f/\\partial x_i"],
      ["stack", "각 축의 편미분을 모아 gradient/Jacobian을 만든다.", "J_{ij}=\\partial y_i/\\partial x_j"],
    ],
    handCalculation: {
      problem: "f(x,y)=x^2y+sin(y), (x,y)=(2,0)에서 df/dx는?",
      given: { x: 2, y: 0 },
      steps: ["df/dx=2xy", "2*2*0=0"],
      answer: "0",
    },
    robotApplication: "EKF observation h(x,y)=sqrt(x^2+y^2)의 Jacobian을 계산할 때 편미분이 바로 관측 민감도가 된다.",
    lab: {
      id: "lab_partial_derivative_assessment_drill",
      title: "Partial Derivative Finite Difference Checker",
      language: "python",
      theoryConnection: "partial derivative, gradient, chain rule",
      starterCode: `import math

def f(x, y):
    return x*x*y + math.sin(y)

def dfdx_fd(x, y, h=1e-5):
    # TODO: x방향 finite difference 편미분을 계산하라.
    raise NotImplementedError

if __name__ == "__main__":
    print(round(dfdx_fd(2.0, 0.0), 6))`,
      solutionCode: `import math

def f(x, y):
    return x*x*y + math.sin(y)

def dfdx_fd(x, y, h=1e-5):
    return (f(x + h, y) - f(x, y)) / h

if __name__ == "__main__":
    print(round(dfdx_fd(2.0, 0.0), 6))`,
      testCode: `from partial_derivative_assessment_drill import dfdx_fd

def test_partial_x_matches_zero_at_y_zero():
    assert abs(dfdx_fd(2.0, 0.0)) < 1e-4`,
      expectedOutput: "0.0",
      runCommand: "python partial_derivative_assessment_drill.py && pytest test_partial_derivative_assessment_drill.py",
      commonBugs: ["x와 y를 동시에 바꿔 total derivative로 계산함", "h를 너무 크게 잡아 곡률 오차가 커짐"],
      extensionTask: "df/dy도 구현하고 analytic 값 x^2+cos(y)와 비교하라.",
    },
    visualization: {
      id: "vis_partial_derivative_slope_estimate",
      title: "Partial Derivative Slope Estimate",
      equation: "\\partial f/\\partial x",
      parameters: [
        param("x", "x", -3, 3, 2, "현재 x 좌표"),
        param("y", "y", -3, 3, 0, "고정한 y 좌표"),
        param("step_h", "h", 0.001, 0.5, 0.05, "finite difference 간격"),
      ],
      normalCase: "h가 작고 한 축만 움직이면 analytic 편미분에 가까워진다.",
      failureCase: "두 축을 같이 바꾸면 편미분이 아니라 방향미분이 된다.",
    },
    quiz: {
      id: "partial_derivative_assessment",
      conceptQuestion: "편미분과 전체 미분의 차이는?",
      conceptAnswer: "편미분은 한 입력만 바꾸고 나머지를 고정한 변화율이고, 전체 미분은 모든 입력 변화의 합성 효과다.",
      calculationQuestion: "f=x^2y에서 df/dx는?",
      calculationAnswer: "2xy",
      codeQuestion: "finite difference로 df/dx를 구하는 한 줄은?",
      codeAnswer: "(f(x+h,y)-f(x,y))/h",
      debugQuestion: "편미분 코드가 x,y를 모두 x+h,y+h로 바꿨다. 무엇이 문제인가?",
      debugAnswer: "한 축만 바꿔야 하는데 방향미분을 계산했다.",
      visualQuestion: "시각화에서 h가 커질수록 slope estimate가 analytic 값에서 멀어지는 이유는?",
      visualAnswer: "국소 선형 근사가 아니라 넓은 구간 평균 기울기를 보기 때문이다.",
      robotQuestion: "EKF Jacobian에서 편미분 부호가 틀리면 어떤 일이 생기는가?",
      robotAnswer: "innovation 방향이 틀려 covariance와 상태 update가 잘못된다.",
      designQuestion: "편미분 평가 문제를 만들 때 포함할 세 가지 형식은?",
      designAnswer: "손계산, finite difference 코드, 시각화 slope 추정을 함께 넣는다.",
    },
    wrongTagLabel: "편미분/Jacobian 평가 공백",
    nextSessions: ["ik_assessment_drill"],
  }),
  [
    q(
      partialDerivativeSessionId,
      "q14_order_chain_rule",
      "derivation",
      "hard",
      "수식 유도 단계 순서 맞추기: z=f(g(x,y))의 dz/dx를 구할 때 올바른 순서를 쓰라.",
      "1) g를 x로 편미분한다. 2) f를 g로 미분한다. 3) 두 값을 곱해 dz/dx=(df/dg)(dg/dx)로 쓴다.",
      "합성함수는 안쪽 민감도와 바깥 민감도를 곱하는 순서로 유도한다.",
      "calculation",
      undefined,
      ["중간 변수 g 정의", "dg/dx 계산", "df/dg 계산", "곱해서 dz/dx 작성"],
    ),
    q(partialDerivativeSessionId, "q15_partial_y", "calculation", "medium", "f=x^2y+sin(y)에서 df/dy는?", "x^2+cos(y)", "x는 상수로 보고 y에 대해 미분한다.", "calculation"),
    q(partialDerivativeSessionId, "q16_visual_estimate", "visualization_interpretation", "hard", "시각화 보고 파라미터 추정하기: y=2, analytic df/dx=8이면 현재 x는 얼마인가?", "df/dx=2xy이므로 8=2*x*2, x=2다.", "편미분 식과 시각화 slope 값을 역으로 연결한다.", "calculation"),
    q(partialDerivativeSessionId, "q17_jacobian_entry", "calculation", "medium", "h=[x^2+y, xy]이면 J의 (2,1) 원소는?", "두 번째 출력 xy를 x로 편미분하므로 y다.", "Jacobian 원소 J_ij는 output i를 input j로 편미분한 값이다.", "derivation"),
    q(partialDerivativeSessionId, "q18_robot_frame", "robot_scenario", "hard", "camera projection Jacobian을 계산할 때 pixel 단위와 meter 단위를 섞으면 어떤 오답이 생기는가?", "민감도 단위가 틀려 optimizer step 크기와 covariance update가 잘못된다.", "편미분은 단위까지 포함한 변화율이므로 frame/unit 계약이 중요하다.", "safety_analysis"),
  ],
);

const ikSessionId = "ik_assessment_drill";
const ikSession = withExtraQuizzes(
  makeAdvancedSession({
    id: ikSessionId,
    part: "Part 2. 로봇팔의 뼈대와 관절 움직이기 (기구학과 회전)",
    title: "IK 평가 집중훈련: reachable, elbow branch, DLS, singularity",
    level: "intermediate",
    difficulty: "hard",
    estimatedMinutes: 90,
    prerequisites: ["fk_matrix_ik_singularity_visual_lab", "robot_math_inverse_kinematics"],
    objectives: ["IK reachable 검사를 적용한다.", "elbow-up/down branch와 joint limit을 구분한다.", "DLS damping과 singularity 시각화를 해석한다."],
    definition: "역기구학(IK)은 목표 end-effector pose를 만드는 joint angle을 찾는 문제다.",
    whyItMatters: "로봇팔이 실제 목표로 움직이려면 목표 도달 가능성, branch 선택, joint limit, singularity 안전조건을 모두 평가해야 한다.",
    intuition: "손끝 위치만 맞는 답이 아니라, 관절 제한 안에서 부드럽고 안전한 답을 골라야 한다.",
    equations: [
      { label: "2-link reach", expression: "r\\le l_1+l_2", terms: [["r", "target distance"]], explanation: "최대 길이를 넘으면 unreachable이다." },
      { label: "Cosine law", expression: "\\cos q_2=(r^2-l_1^2-l_2^2)/(2l_1l_2)", terms: [["q2", "elbow angle"]], explanation: "2-link analytic IK의 핵심이다." },
      { label: "DLS", expression: "\\dot q=J^T(JJ^T+\\lambda^2I)^{-1}e", terms: [["lambda", "damping"]], explanation: "singularity 근처 속도 폭주를 줄인다." },
    ],
    derivation: [
      ["reach", "target norm r을 계산한다.", "r=sqrt(x^2+y^2)"],
      ["elbow", "cosine law로 q2 후보를 만든다.", "q2=±acos(c2)"],
      ["shoulder", "atan2와 링크 기하로 q1을 계산한다.", "q1=atan2(y,x)-atan2(k2,k1)"],
      ["select", "joint limit, continuity, collision margin으로 branch를 고른다.", "argmin cost(q)"],
    ],
    handCalculation: {
      problem: "l1=l2=1, target=(1,1)일 때 cos q2는?",
      given: { l1: 1, l2: 1, r2: 2 },
      steps: ["c2=(2-1-1)/2=0", "q2=±pi/2"],
      answer: "0이며 elbow-up/down 두 해가 있다.",
    },
    robotApplication: "pick pose가 workspace 밖이면 IK solver를 계속 돌리지 말고 planner에 unreachable/fallback을 반환해야 한다.",
    lab: {
      id: "lab_ik_assessment_drill",
      title: "IK Reachability and DLS Guard",
      language: "python",
      theoryConnection: "reachability, cosine law, DLS damping",
      starterCode: `import math

def reachable(x, y, l1=1.0, l2=1.0):
    # TODO: target distance가 reachable 범위인지 반환하라.
    raise NotImplementedError

def cos_q2(x, y, l1=1.0, l2=1.0):
    # TODO: cosine law의 q2 cos 값을 계산하라.
    raise NotImplementedError

if __name__ == "__main__":
    print(reachable(1.0, 1.0), round(cos_q2(1.0, 1.0), 6))`,
      solutionCode: `import math

def reachable(x, y, l1=1.0, l2=1.0):
    r = math.hypot(x, y)
    return abs(l1 - l2) <= r <= l1 + l2

def cos_q2(x, y, l1=1.0, l2=1.0):
    r2 = x*x + y*y
    return (r2 - l1*l1 - l2*l2) / (2*l1*l2)

if __name__ == "__main__":
    print(reachable(1.0, 1.0), round(cos_q2(1.0, 1.0), 6))`,
      testCode: `from ik_assessment_drill import reachable, cos_q2

def test_reachable_and_unreachable():
    assert reachable(1.0, 1.0)
    assert not reachable(3.0, 0.0)

def test_cos_q2():
    assert abs(cos_q2(1.0, 1.0)) < 1e-9`,
      expectedOutput: "True 0.0",
      runCommand: "python ik_assessment_drill.py && pytest test_ik_assessment_drill.py",
      commonBugs: ["unreachable target도 acos에 넣어 NaN을 만듦", "elbow branch를 joint continuity 없이 임의 선택함"],
      extensionTask: "joint limit cost와 previous q continuity cost를 추가하라.",
    },
    visualization: {
      id: "vis_ik_assessment_singularity_estimate",
      title: "IK Singularity Parameter Estimate",
      equation: "\\dot q=J^T(JJ^T+\\lambda^2I)^{-1}e",
      parameters: [
        param("target_radius", "r", 0.1, 2.5, 1.4, "target distance"),
        param("damping_lambda", "\\lambda", 0.001, 0.5, 0.08, "DLS damping"),
        param("sigma_min", "\\sigma_{min}", 0.001, 1, 0.12, "smallest singular value"),
      ],
      normalCase: "reachable이고 sigma_min이 충분하면 작은 damping으로도 안정적이다.",
      failureCase: "unreachable 또는 sigma_min이 작으면 branch 전환, damping 증가, fallback이 필요하다.",
    },
    quiz: {
      id: "ik_assessment",
      conceptQuestion: "IK에서 reachable 검사와 solver 반복은 어떤 순서인가?",
      conceptAnswer: "먼저 target이 workspace 안에 있는지 검사하고, 그 다음 analytic/numeric solver를 실행한다.",
      calculationQuestion: "l1=l2=1, target=(3,0)은 reachable인가?",
      calculationAnswer: "r=3이고 최대 도달거리 2를 넘으므로 unreachable이다.",
      codeQuestion: "DLS inverse 안쪽에 추가하는 안정화 항은?",
      codeAnswer: "lambda^2 * I",
      debugQuestion: "IK가 elbow-up/down을 매 프레임 번갈아 선택하면 어떤 문제가 생기는가?",
      debugAnswer: "joint command가 불연속으로 튀어 진동과 충돌 위험이 생긴다.",
      visualQuestion: "시각화 보고 파라미터 추정하기: sigma_min이 작고 qdot gain이 크면 무엇을 추정하는가?",
      visualAnswer: "singularity 근처이며 damping 또는 fallback이 필요하다고 추정한다.",
      robotQuestion: "unreachable grasp pose가 들어오면 로봇은 어떻게 해야 하는가?",
      robotAnswer: "움직이지 않고 실패 상태를 반환한 뒤 replan 또는 perception 재요청으로 간다.",
      designQuestion: "IK 평가 harness의 golden output에는 무엇이 들어가야 하는가?",
      designAnswer: "reachable flag, branch id, joint limit pass, residual norm, continuity cost를 넣는다.",
    },
    wrongTagLabel: "IK 평가/최종시험 연결 부족",
    nextSessions: ["nav2_launch_stack_assessment_drill"],
  }),
  [
    q(ikSessionId, "q14_elbow_count", "calculation", "medium", "l1=l2=1, target=(1,1)인 2-link IK에서 q2 후보는 몇 개인가?", "cos q2=0이므로 q2=+pi/2, -pi/2 두 후보가 있다.", "2-link IK는 elbow-up/down branch를 가진다.", "calculation"),
    q(ikSessionId, "q15_branch_limit", "robot_scenario", "hard", "elbow-up은 joint limit 밖이고 elbow-down은 limit 안이면 어떤 해를 선택하는가?", "joint limit을 만족하는 elbow-down을 선택한다.", "위치 오차가 같아도 joint limit이 우선 gate다.", "safety_analysis"),
    q(ikSessionId, "q16_dls_order", "derivation", "hard", "수식 유도 단계 순서 맞추기: pseudoinverse에서 DLS로 바꾸는 순서를 쓰라.", "1) JJT를 만든다. 2) lambda^2 I를 더한다. 3) inverse를 취한다. 4) J^T와 error e를 곱한다.", "DLS는 inverse 안쪽 regularization이 핵심이다.", "code_debug"),
  ],
);

const nav2SessionId = "nav2_launch_stack_assessment_drill";
const nav2LaunchSnippet = `from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package="nav2_controller",
            executable="controller_server",
            name="____",
            parameters=["____"],
            output="screen",
        )
    ])`;

const nav2Session = withExtraQuizzes(
  makeAdvancedSession({
    id: nav2SessionId,
    part: "Part 4. 모바일 로봇이 스스로 길을 찾는 법 (자율주행과 SLAM)",
    title: "Nav2 스택 평가: launch 빈칸, lifecycle, costmap, BT",
    level: "intermediate",
    difficulty: "hard",
    estimatedMinutes: 85,
    prerequisites: ["nav2_behavior_tree_action_server", "ros2_cli_command_diagnostics_lab"],
    objectives: ["Nav2 launch 파일 빈칸을 채운다.", "lifecycle node 상태 전이를 진단한다.", "BT Navigator, controller, costmap 로그를 연결한다."],
    definition: "Nav2 stack은 map, localization, planner, controller, behavior tree, costmap, lifecycle manager를 연결해 mobile robot navigation을 실행하는 ROS 2 시스템이다.",
    whyItMatters: "Nav2 실패는 알고리즘 하나보다 launch parameter, lifecycle state, TF, costmap, action feedback 연결에서 자주 발생한다.",
    intuition: "Nav2는 여러 노드가 같은 지도, 좌표, 시간, goal 계약을 공유해야 움직이는 오케스트라다.",
    equations: [
      { label: "Nav2 readiness", expression: "ready=TF\\land map\\land costmap\\land lifecycle\\land action", terms: [["ready", "navigation 가능 상태"]], explanation: "모든 계약이 맞아야 goal을 받을 수 있다." },
      { label: "Costmap inflation", expression: "cost(d)=exp(-\\alpha d)", terms: [["d", "obstacle distance"]], explanation: "장애물 근처 cost가 커진다." },
      { label: "Controller deadline", expression: "T_{ctrl}<T_{deadline}", terms: [["Tctrl", "control cycle time"]], explanation: "controller loop가 deadline을 넘어가면 action feedback이 늦어진다." },
    ],
    derivation: [
      ["launch", "planner/controller/bt navigator node와 parameter 파일을 로드한다.", "Node(...parameters=[yaml])"],
      ["lifecycle", "configure -> activate 전이가 되었는지 확인한다.", "inactive->active"],
      ["tf", "map->odom->base_link chain을 확인한다.", "tf2 lookup"],
      ["action", "NavigateToPose feedback/result와 cancel path를 검증한다.", "goal->feedback->result"],
    ],
    handCalculation: {
      problem: "controller 주기가 20Hz라면 deadline은 몇 ms인가?",
      given: { hz: 20 },
      steps: ["T=1/20s", "0.05s=50ms"],
      answer: "50ms",
    },
    robotApplication: "Nav2가 goal을 받지 못하면 launch YAML, lifecycle active, TF chain, costmap topic, action server 순서로 진단한다.",
    lab: {
      id: "lab_nav2_launch_stack_assessment_drill",
      title: "Nav2 Launch Contract Checker",
      language: "python",
      theoryConnection: "launch blank, lifecycle active, action feedback",
      starterCode: `REQUIRED_NODES = {"planner_server", "controller_server", "bt_navigator", "lifecycle_manager"}

def launch_ready(nodes, params):
    # TODO: required nodes와 nav2_params.yaml 존재를 검사하라.
    raise NotImplementedError

if __name__ == "__main__":
    print(launch_ready(REQUIRED_NODES, ["nav2_params.yaml"]))`,
      solutionCode: `REQUIRED_NODES = {"planner_server", "controller_server", "bt_navigator", "lifecycle_manager"}

def launch_ready(nodes, params):
    return REQUIRED_NODES.issubset(set(nodes)) and "nav2_params.yaml" in params

if __name__ == "__main__":
    print(launch_ready(REQUIRED_NODES, ["nav2_params.yaml"]))`,
      testCode: `from nav2_launch_stack_assessment_drill import launch_ready, REQUIRED_NODES

def test_launch_ready_requires_nodes_and_params():
    assert launch_ready(REQUIRED_NODES, ["nav2_params.yaml"])
    assert not launch_ready({"planner_server"}, ["nav2_params.yaml"])`,
      expectedOutput: "True",
      runCommand: "python nav2_launch_stack_assessment_drill.py && pytest test_nav2_launch_stack_assessment_drill.py",
      commonBugs: ["node는 실행했지만 lifecycle active를 확인하지 않음", "parameter YAML namespace가 실제 robot namespace와 맞지 않음"],
      extensionTask: "BT XML 경로와 controller plugin 이름까지 검사하라.",
    },
    visualization: {
      id: "vis_nav2_launch_stack_assessment",
      title: "Nav2 Stack Readiness Estimate",
      equation: "ready=TF\\land map\\land costmap\\land lifecycle\\land action",
      parameters: [
        param("active_nodes", "n", 0, 8, 5, "active lifecycle nodes"),
        param("tf_age_ms", "t_tf", 0, 1000, 80, "TF age"),
        param("costmap_rate_hz", "f_c", 0, 30, 10, "costmap update rate"),
      ],
      normalCase: "필수 노드 active, TF fresh, costmap update가 유지된다.",
      failureCase: "lifecycle inactive나 stale TF면 goal을 보내도 navigation이 멈춘다.",
    },
    quiz: {
      id: "nav2_launch_stack_assessment",
      conceptQuestion: "Nav2 stack에서 lifecycle manager가 필요한 이유는?",
      conceptAnswer: "planner, controller, bt_navigator 같은 lifecycle node를 configure/activate 상태로 전환하기 위해서다.",
      calculationQuestion: "20Hz controller loop의 period는?",
      calculationAnswer: "50ms",
      codeQuestion: "ROS 2 launch 파일에서 Node를 import하는 줄은?",
      codeAnswer: "from launch_ros.actions import Node",
      debugQuestion: "Nav2 goal이 pending에 머물 때 가장 먼저 볼 세 가지는?",
      debugAnswer: "lifecycle active, TF chain, action server feedback/result를 확인한다.",
      visualQuestion: "시각화 보고 파라미터 추정하기: active_nodes가 2이고 TF age가 800ms면 무엇을 추정하는가?",
      visualAnswer: "Nav2 stack readiness가 낮고 lifecycle/TF부터 고쳐야 한다.",
      robotQuestion: "costmap이 오래된 장애물을 유지하면 어떤 위험이 있는가?",
      robotAnswer: "실제 빈 공간을 막힌 공간으로 보거나 반대로 장애물을 놓쳐 collision 위험이 생긴다.",
      designQuestion: "Nav2 평가 harness에 넣을 로그 키는?",
      designAnswer: "launch file, parameter YAML, lifecycle state, TF age, costmap rate, action result를 넣는다.",
    },
    wrongTagLabel: "Nav2 스택/launch 평가 공백",
    nextSessions: ["prompt_engineering_assessment_drill"],
  }),
  [
    q(nav2SessionId, "q14_launch_blank", "code_completion", "medium", "ROS 2 launch 파일 빈칸 채우기: controller_server Node의 name과 parameters에 들어갈 값은?", "name='controller_server', parameters=['nav2_params.yaml']", "Nav2 node 이름과 parameter YAML이 launch 계약의 핵심이다.", "code_debug", nav2LaunchSnippet),
    q(nav2SessionId, "q15_lifecycle_order", "derivation", "hard", "수식 유도 단계 순서 맞추기처럼 lifecycle 전이 순서를 쓰라.", "unconfigured -> inactive(configure) -> active(activate) -> finalized(shutdown) 순서다.", "Nav2 lifecycle node는 configure와 activate를 거쳐야 goal을 처리한다.", "integration_pipeline"),
    q(nav2SessionId, "q16_bt_xml", "code_completion", "medium", "bt_navigator launch에서 Behavior Tree XML 경로가 빠지면 어떤 parameter를 확인하는가?", "default_bt_xml_filename 또는 behavior_tree XML 경로 parameter를 확인한다.", "BT Navigator는 behavior tree 파일이 있어야 NavigateToPose를 실행한다.", "code_debug"),
  ],
);

const promptAssessmentSessionId = "prompt_engineering_assessment_drill";
const promptAssessmentSession = withExtraQuizzes(
  makeAdvancedSession({
    id: promptAssessmentSessionId,
    part: "Part 10. 프롬프트/컨텍스트/하네스 엔지니어링",
    title: "프롬프트 평가 집중훈련: schema, few-shot, golden, tracing",
    level: "intermediate",
    difficulty: "hard",
    estimatedMinutes: 90,
    prerequisites: ["prompt_template_role_goal_constraint_schema", "evaluation_harness_golden_regression"],
    objectives: ["프롬프트 출력 schema를 평가한다.", "few-shot과 retrieval 근거를 검증한다.", "golden output, latency trace, failure taxonomy를 연결한다."],
    definition: "프롬프트 평가는 prompt/model/context 변경을 같은 eval set으로 실행해 schema, grounding, golden match, latency를 기록하는 절차다.",
    whyItMatters: "LLM/VLA는 한 번 그럴듯하게 답하는 것보다 매번 같은 계약을 지키는지가 중요하다.",
    intuition: "프롬프트는 문장이 아니라 테스트 가능한 API 입력이고, eval harness는 그 API의 회귀 테스트다.",
    equations: [
      { label: "Eval pass", expression: "pass=schema\\_ok\\land grounding\\_ok\\land golden\\_ok\\land latency<d", terms: [["d", "deadline"]], explanation: "품질과 시간 조건을 동시에 만족해야 한다." },
      { label: "Regression", expression: "\\Delta p=p_{new}-p_{base}", terms: [["p", "pass rate"]], explanation: "변경 전후 통과율을 비교한다." },
      { label: "Trace total", expression: "T=T_{retrieval}+T_{model}+T_{parse}+T_{tool}", terms: [["T", "total latency"]], explanation: "느린 단계를 분리해 고친다." },
    ],
    derivation: [
      ["template", "role/goal/constraints/output_format을 고정한다.", "P=R+G+C+O"],
      ["cases", "golden output과 실패 taxonomy를 가진 eval case를 만든다.", "D_eval"],
      ["run", "같은 model/context 설정으로 반복 실행한다.", "y_i"],
      ["judge", "schema, grounding, golden diff, latency를 모두 채점한다.", "pass_i"],
    ],
    handCalculation: {
      problem: "baseline pass 80%, candidate pass 86%면 delta는?",
      given: { baseline: 0.8, candidate: 0.86 },
      steps: ["delta=0.86-0.80", "0.06=6%p"],
      answer: "+6%p",
    },
    robotApplication: "VLA action JSON이 schema를 통과해도 근거 chunk가 없거나 latency deadline을 넘으면 로봇 action으로 보내지 않는다.",
    lab: {
      id: "lab_prompt_engineering_assessment_drill",
      title: "Prompt Eval Scorecard",
      language: "python",
      theoryConnection: "schema_ok, grounding_ok, golden_ok, latency deadline",
      starterCode: `def eval_pass(row):
    # TODO: schema, grounding, golden, latency 조건을 모두 검사하라.
    raise NotImplementedError

if __name__ == "__main__":
    row = {"schema_ok": True, "grounding_ok": True, "golden_ok": True, "total_ms": 900, "deadline_ms": 1200}
    print(eval_pass(row))`,
      solutionCode: `def eval_pass(row):
    return (
        row["schema_ok"]
        and row["grounding_ok"]
        and row["golden_ok"]
        and row["total_ms"] <= row["deadline_ms"]
    )

if __name__ == "__main__":
    row = {"schema_ok": True, "grounding_ok": True, "golden_ok": True, "total_ms": 900, "deadline_ms": 1200}
    print(eval_pass(row))`,
      testCode: `from prompt_engineering_assessment_drill import eval_pass

def test_eval_pass_requires_all_gates():
    assert eval_pass({"schema_ok": True, "grounding_ok": True, "golden_ok": True, "total_ms": 900, "deadline_ms": 1200})
    assert not eval_pass({"schema_ok": True, "grounding_ok": False, "golden_ok": True, "total_ms": 900, "deadline_ms": 1200})`,
      expectedOutput: "True",
      runCommand: "python prompt_engineering_assessment_drill.py && pytest test_prompt_engineering_assessment_drill.py",
      commonBugs: ["schema만 통과하면 성공으로 처리함", "latency와 failure_type을 trace에 남기지 않음"],
      extensionTask: "JSONL trace를 읽어 failure taxonomy별 pass rate를 계산하라.",
    },
    visualization: {
      id: "vis_prompt_engineering_assessment_scorecard",
      title: "Prompt Eval Scorecard Estimate",
      equation: "pass=schema\\_ok\\land grounding\\_ok\\land golden\\_ok\\land latency<d",
      parameters: [
        param("schema_pass_rate", "p_s", 0, 1, 0.9, "schema pass rate"),
        param("grounding_pass_rate", "p_g", 0, 1, 0.82, "grounding pass rate"),
        param("p95_latency_ms", "L95", 100, 4000, 1200, "p95 latency"),
      ],
      normalCase: "schema, grounding, golden, latency가 모두 기준을 넘는다.",
      failureCase: "하나라도 낮으면 prompt/model/context 변경을 reject한다.",
    },
    quiz: {
      id: "prompt_engineering_assessment",
      conceptQuestion: "프롬프트 평가 harness가 필요한 이유는?",
      conceptAnswer: "prompt/model/context 변경을 같은 eval set으로 비교해 회귀와 실패 유형을 수치로 보기 위해서다.",
      calculationQuestion: "baseline 80%, candidate 86%면 pass-rate delta는?",
      calculationAnswer: "+6%p",
      codeQuestion: "eval row에서 네 gate를 모두 확인하는 조건은?",
      codeAnswer: "schema_ok and grounding_ok and golden_ok and total_ms <= deadline_ms",
      debugQuestion: "golden diff는 통과했지만 citation이 비어 있다. 어떤 실패인가?",
      debugAnswer: "grounding failure이며 hallucination 위험이 있다.",
      visualQuestion: "시각화 보고 파라미터 추정하기: grounding_pass_rate가 낮고 latency는 정상이다. 무엇을 고치는가?",
      visualAnswer: "retrieval query, chunking, citation check, context budget을 먼저 고친다.",
      robotQuestion: "VLA action이 JSON schema만 맞으면 바로 실행해도 되는가?",
      robotAnswer: "아니다. grounding, safety constraint, latency deadline, fallback 정책까지 통과해야 한다.",
      designQuestion: "프롬프트 평가 로그의 필수 key는?",
      designAnswer: "eval_run_id, prompt_version, case_id, schema_ok, grounding_ok, golden_id, latency_ms, failure_type이다.",
    },
    wrongTagLabel: "프롬프트 평가 문제/최종시험 연결 부족",
    nextSessions: ["latency_tracing_failure_taxonomy"],
  }),
  [
    q(promptAssessmentSessionId, "q14_json_yaml_gate", "code_debug", "medium", "JSON/YAML 출력 강제 문제: JSON parse는 됐지만 action enum이 허용값 밖이다. pass인가?", "parse_ok여도 schema_ok가 false이므로 fail이다.", "출력 강제는 parse뿐 아니라 schema validation까지 포함한다.", "code_completion"),
    q(promptAssessmentSessionId, "q15_few_shot_negative", "robot_scenario", "hard", "negative few-shot에 없는 unsafe case가 eval에서 실패했다. 무엇을 추가하는가?", "unsafe pattern을 negative example과 eval case에 추가하고 fallback_reason을 trace에 남긴다.", "few-shot은 예시 선택과 평가 케이스가 같이 확장되어야 한다.", "system_design"),
    q(promptAssessmentSessionId, "q16_golden_order", "derivation", "hard", "수식 유도 단계 순서 맞추기처럼 golden eval 승인 순서를 쓰라.", "1) template version 고정 2) eval set 실행 3) schema/grounding/golden diff 채점 4) latency trace 확인 5) regression 없을 때 승인", "프롬프트 변경 승인은 감이 아니라 같은 하네스의 비교 결과로 결정한다.", "integration_pipeline"),
  ],
);

export const assessmentCoverageChecklist = [
  {
    topic: "편미분 전용 문제",
    recommendedCount: 5,
    evidenceSessionIds: [partialDerivativeSessionId],
  },
  {
    topic: "IK 문제",
    recommendedCount: 10,
    evidenceSessionIds: [ikSessionId],
  },
  {
    topic: "Nav2 스택 문제",
    recommendedCount: 8,
    evidenceSessionIds: [nav2SessionId],
  },
  {
    topic: "프롬프트 엔지니어링 문제",
    recommendedCount: 15,
    evidenceSessionIds: [promptAssessmentSessionId],
  },
] as const;

export const assessmentMathSessions: Session[] = [partialDerivativeSession];
export const assessmentRobotMathSessions: Session[] = [ikSession];
export const assessmentNav2Sessions: Session[] = [nav2Session];
export const assessmentPromptSessions: Session[] = [promptAssessmentSession];
