import type { CodeLab, ErrorType, QuizQuestionTypeV2, QuizQuestionV2, Session, VisualizationSpec } from "../types";
import { ensureCodeLabShape, makeEquation, makeWrongTags, session, step } from "./v2SessionHelpers";

const part = "Part 10. 최종 평가";

type ExamQuestionType = Exclude<QuizQuestionTypeV2, "counterexample">;

type FinalExamSet = {
  examId: string;
  title: string;
  purpose: string;
  linkedPart: string;
  connectedSessions: string[];
  passPercent: number;
  excellentPercent: number;
  questions: QuizQuestionV2[];
};

export const finalExamScoring = {
  pointsByDifficulty: {
    easy: 1,
    medium: 2,
    hard: 3,
  },
  passPercent: 70,
  excellentPercent: 90,
  feedbackBands: [
    { min: 0, max: 49, message: "기초 개념 복습 필요" },
    { min: 50, max: 69, message: "계산과 코드 실습 보강 필요" },
    { min: 70, max: 89, message: "실전 프로젝트로 넘어갈 수 있음" },
    { min: 90, max: 100, message: "심화 프로젝트 가능" },
  ],
};

export const calculateFinalExamPercent = (earnedPoints: number, totalPoints: number): number => {
  if (totalPoints <= 0) return 0;
  return Math.round((earnedPoints / totalPoints) * 100);
};

const errorByType: Record<ExamQuestionType, ErrorType> = {
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
  examId: string,
  id: string,
  type: ExamQuestionType,
  difficulty: QuizQuestionV2["difficulty"],
  conceptTag: string,
  question: string,
  expectedAnswer: string,
  explanation: string,
  commonWrongAnswer: string,
  whyWrong: string,
  reviewSession: string,
  retryQuestionType: QuizQuestionTypeV2,
): QuizQuestionV2 => ({
  id: `${examId}_${id}`,
  examId,
  type,
  difficulty,
  conceptTag,
  question,
  expectedAnswer,
  explanation,
  wrongAnswerAnalysis: {
    commonWrongAnswer,
    whyWrong,
    errorType: errorByType[type],
    reviewSession,
    retryQuestionType,
    recommendedReview: [reviewSession],
    severity: type === "safety_analysis" || type === "integration_pipeline" || difficulty === "hard" ? "high" : "medium",
  },
});

const makeExamCodeLab = (examId: string, title: string): CodeLab =>
  ensureCodeLabShape({
    id: `lab_${examId}_score_calculator`,
    title: `${title} Score Calculator`,
    language: "python",
    theoryConnection: "percent = earned_points / total_points * 100, pass if percent >= 70",
    starterCode: `def score_exam(earned_points, total_points):
    # TODO: total_points가 0 이하이면 0점을 반환한다.
    # TODO: earned_points / total_points * 100을 반올림해 반환한다.
    pass

def feedback(percent):
    # TODO: 0~49, 50~69, 70~89, 90~100 구간별 피드백을 반환한다.
    pass

if __name__ == "__main__":
    percent = score_exam(14, 20)
    print(percent)
    print(feedback(percent))`,
    solutionCode: `def score_exam(earned_points, total_points):
    if total_points <= 0:
        return 0
    return round((earned_points / total_points) * 100)

def feedback(percent):
    if percent < 50:
        return "기초 개념 복습 필요"
    if percent < 70:
        return "계산과 코드 실습 보강 필요"
    if percent < 90:
        return "실전 프로젝트로 넘어갈 수 있음"
    return "심화 프로젝트 가능"

if __name__ == "__main__":
    percent = score_exam(14, 20)
    print(percent)
    print(feedback(percent))`,
    testCode: `from score_calculator import score_exam, feedback

def test_pass_boundary():
    assert score_exam(14, 20) == 70
    assert feedback(70) == "실전 프로젝트로 넘어갈 수 있음"

def test_low_score_feedback():
    assert feedback(49) == "기초 개념 복습 필요"

def test_excellent_feedback():
    assert feedback(90) == "심화 프로젝트 가능"`,
    expectedOutput: "70\n실전 프로젝트로 넘어갈 수 있음",
    runCommand: "python score_calculator.py && pytest test_score_calculator.py",
    commonBugs: ["total_points가 0일 때 나눗셈 오류", "70점을 탈락으로 처리함", "어려운 문제 점수 가중치를 계산에 반영하지 않음"],
    extensionTask: "문제 difficulty 배열을 받아 easy=1, medium=2, hard=3으로 총점을 자동 계산하라.",
  });

const makeExamVisualization = (exam: FinalExamSet, labId: string): VisualizationSpec => {
  const visualConceptTag =
    exam.questions.find((question) => question.type === "visualization_interpretation")?.conceptTag ?? exam.examId;
  return {
    id: `vis_${exam.examId}_score_profile`,
    title: `${exam.title} Score Profile`,
    conceptTag: visualConceptTag,
    parameters: [
      { name: "score_percent", symbol: "S", min: 0, max: 100, default: 70, description: "최종 점수 percent" },
      { name: "safety_score", symbol: "S_safe", min: 0, max: 100, default: 70, description: "안전/실패 분석 점수" },
      { name: "integration_score", symbol: "S_int", min: 0, max: 100, default: 70, description: "통합 pipeline 점수" },
    ],
    connectedEquation: "percent = earned_points / total_points * 100",
    connectedCodeLab: labId,
    normalCase: "score_percent가 70 이상이면 통과이고, 90 이상이면 심화 프로젝트로 넘어간다.",
    failureCase: "score_percent가 70 미만이거나 safety_score가 낮으면 관련 세션을 복습한 뒤 다시 평가한다.",
    interpretationQuestions: [
      "score_percent=68이면 통과인지 탈락인지 말하라.",
      "전체 점수는 75인데 safety_score가 40이면 어떤 세션을 먼저 복습해야 하는지 말하라.",
      "integration_score가 낮으면 코드 한 줄보다 어떤 pipeline 연결을 다시 확인해야 하는지 설명하라.",
    ],
  };
};

const robotMathQuestions: QuizQuestionV2[] = [
  q("exam_robot_math_final", "q01_2d_rotation", "calculation", "medium", "robot_math_2d_rotation_matrix", "theta=90도=pi/2, p=[1,0]일 때 R(theta)p를 계산하라.", "R=[[0,-1],[1,0]]이고 R[1,0]=[0,1]이다.", "cos(pi/2)=0, sin(pi/2)=1을 2D 회전행렬에 넣으면 x축 점이 y축 점으로 간다.", "[1,0] 그대로라고 답함", "회전행렬을 곱하지 않고 원래 점을 그대로 둔 것이다.", "robot_math_2d_rotation_matrix", "calculation"),
  q("exam_robot_math_final", "q02_so3_condition", "concept", "medium", "robot_math_3d_rotation_so3", "3D 회전행렬에서 R^T R=I는 무엇을 뜻하는가?", "회전 뒤에도 세 축의 길이가 1이고 서로 직각이라는 뜻이다.", "R^T R=I는 정규직교 조건이다. 여기에 det(R)=1까지 만족해야 올바른 SO(3) 회전이다.", "행렬 원소가 모두 1이라는 뜻이라고 답함", "I는 모든 원소가 1인 행렬이 아니라 대각선만 1인 identity matrix다.", "robot_math_3d_rotation_so3", "concept"),
  q("exam_robot_math_final", "q03_homogeneous_transform", "derivation", "hard", "robot_math_homogeneous_transform_se3", "T=[[R,t],[0,0,0,1]]이고 Rz(90도), t=[1,2,0], p=[1,0,0]이면 Tp를 계산하고 왜 Rp+t인지 유도하라.", "homogeneous point [p,1]에 T를 곱하면 위 3개 성분은 Rp+t가 된다. Rz p=[0,1,0]이므로 결과는 [1,3,0]이다.", "마지막 좌표 1이 translation 열 t를 더하게 만든다. 그래서 4x4 곱은 회전과 이동을 한 번에 처리한다.", "R과 t를 따로 더하지 않고 [0,1,0]만 답함", "translation t=[1,2,0]를 빠뜨리면 SE(3) 변환이 아니라 순수 회전만 계산한 것이다.", "robot_math_homogeneous_transform_se3", "calculation"),
  q("exam_robot_math_final", "q04_quaternion_reason", "system_design", "medium", "robot_math_quaternion_slerp", "로봇팔 자세 waypoint를 연결할 때 quaternion과 SLERP가 필요한 이유를 설명하라.", "Euler angle gimbal lock과 불연속을 줄이고, 두 orientation 사이를 일정한 회전 속도로 부드럽게 보간하기 위해 필요하다.", "실제 로봇팔은 위치뿐 아니라 자세도 부드럽게 바뀌어야 한다. quaternion SLERP는 orientation trajectory를 안정적으로 만든다.", "x,y,z 위치만 보간하면 된다고 답함", "gripper 자세가 갑자기 튀면 충돌이나 grasp 실패가 생긴다. orientation도 계획해야 한다.", "robot_math_quaternion_slerp", "robot_scenario"),
  q("exam_robot_math_final", "q05_fk_code", "code_completion", "medium", "robot_math_forward_kinematics", "2-link FK에서 x를 계산하는 Python 한 줄을 완성하라: x = ?", "x = l1 * np.cos(theta1) + l2 * np.cos(theta1 + theta2)", "두 번째 링크의 절대각은 theta2가 아니라 theta1+theta2다.", "x = l1*cos(theta1)+l2*cos(theta2)", "두 번째 링크는 첫 번째 링크 끝에 붙어 있으므로 각도가 누적된다.", "robot_math_forward_kinematics", "code_debug"),
  q("exam_robot_math_final", "q06_ik_reachable", "safety_analysis", "hard", "robot_math_inverse_kinematics", "l1=1, l2=1인 2-link 팔에 target=[3,0]이 들어왔다. IK를 실행해도 안전한가?", "최대 도달 거리는 2인데 target 거리는 3이므로 unreachable이다. IK는 실패를 반환하고 로봇을 움직이지 않아야 한다.", "닿을 수 없는 목표를 억지로 풀면 관절 명령이 이상해질 수 있다. reachable 검사 후 안전 정지 또는 재계획이 필요하다.", "가장 가까운 방향으로 무조건 움직이면 된다고 답함", "도달 불가능한 목표를 무조건 추종하면 limit, singularity, 충돌 위험이 커진다.", "robot_math_inverse_kinematics", "robot_scenario"),
  q("exam_robot_math_final", "q07_jacobian_meaning", "robot_scenario", "medium", "robot_math_jacobian_velocity_kinematics", "로봇팔에서 v=J(q)qdot의 의미를 실제 움직임으로 설명하라.", "현재 자세 q에서 관절 속도 qdot이 손끝 속도 v로 어떻게 바뀌는지 알려주는 관계다.", "Jacobian은 작은 관절 변화가 손끝 위치/속도에 주는 영향을 나타낸다. resolved-rate control의 기본이다.", "J는 항상 고정된 상수 행렬이라고 답함", "Jacobian은 현재 관절 자세 q에 따라 계속 바뀐다.", "robot_math_jacobian_velocity_kinematics", "visualization_interpretation"),
  q("exam_robot_math_final", "q08_singularity_visual", "visualization_interpretation", "hard", "robot_math_singularity_damped_least_squares", "singularity 시각화에서 sigma_min이 0에 가까워지고 velocity gain이 커진다. 무엇을 의미하는가?", "Jacobian이 특정 방향 움직임을 만들기 어려운 상태라서 pseudoinverse 속도 명령이 폭주할 수 있다는 뜻이다.", "작은 singular value는 어떤 task 방향을 만들기 위해 큰 joint velocity가 필요함을 뜻한다.", "로봇이 더 강해져서 빠르게 움직일 수 있다는 뜻이라고 답함", "gain 증가는 성능 향상이 아니라 수치 불안정과 안전 위험이다.", "robot_math_singularity_damped_least_squares", "safety_analysis"),
  q("exam_robot_math_final", "q09_dls_debug", "code_debug", "hard", "robot_math_singularity_damped_least_squares", "DLS 코드가 qdot = J.T @ inv(J @ J.T) @ e로 되어 있어 singularity에서 터진다. 빈칸에 무엇을 더해야 하는가?", "J @ J.T에 lambda^2 * I를 더해 qdot = J.T @ inv(J @ J.T + lambda^2 I) @ e로 만든다.", "DLS는 작은 singular value의 gain을 제한하기 위해 damping 항 lambda^2 I를 더한다.", "J에 그냥 lambda를 곱한다고 답함", "damping은 행렬을 스케일하는 것이 아니라 역행렬 안쪽에 lambda^2 I로 더해 안정화한다.", "robot_math_singularity_damped_least_squares", "code_completion"),
  q("exam_robot_math_final", "q10_tf2_pipeline", "integration_pipeline", "hard", "ros2_tf2_transform", "카메라가 본 물체 점을 로봇팔 base_link grasp 목표로 보내는 TF2 좌표변환 pipeline을 설계하라.", "camera pixel/depth를 camera_link 3D 점으로 만들고, timestamp가 맞는 camera_link->base_link TF를 조회해 SE(3) 변환을 적용한 뒤 grasp planner에 전달한다.", "인식 결과는 반드시 frame과 timestamp를 가진 좌표로 바뀌어야 한다. TF2는 이 frame chain을 안전하게 연결한다.", "픽셀 좌표를 그대로 로봇팔 목표로 보낸다고 답함", "픽셀은 로봇팔 base_link 좌표가 아니므로 직접 쓰면 grasp 위치가 틀어진다.", "ros2_tf2_transform", "system_design"),
];

const mathFoundationQuestions: QuizQuestionV2[] = [
  q("exam_math_foundation_final", "q01_eigen_concept", "concept", "easy", "eigen_covariance_ellipse", "공분산 ellipse에서 큰 고유값은 무엇을 뜻하는가?", "그 방향으로 위치 불확실성이 크다는 뜻이다.", "고유값은 ellipse 축 길이와 연결된다.", "큰 고유값은 센서가 더 정확하다는 뜻이라고 답함", "분산이 크다는 것은 더 불확실하다는 뜻이다.", "eigen_covariance_ellipse", "calculation"),
  q("exam_math_foundation_final", "q02_svd_calc", "calculation", "medium", "svd_condition_number", "singular values가 [10, 0.5]이면 condition number는?", "10/0.5=20이다.", "condition number는 sigma_max/sigma_min이다.", "10+0.5=10.5라고 답함", "condition number는 합이 아니라 비율이다.", "svd_condition_number", "calculation"),
  q("exam_math_foundation_final", "q03_least_squares_derivation", "derivation", "hard", "least_squares", "least squares가 X^T X theta = X^T y로 이어지는 이유를 한 줄로 유도하라.", "||Xtheta-y||^2를 theta로 미분해 0으로 두면 X^T X theta = X^T y가 된다.", "잔차 제곱합의 기울기가 0인 지점이 최소제곱 해다.", "양변에 X만 곱한다고 답함", "전치 X^T가 나오는 이유는 목적함수 미분 때문이다.", "least_squares", "calculation"),
  q("exam_math_foundation_final", "q04_code_completion", "code_completion", "medium", "least_squares", "NumPy 최소제곱 한 줄을 쓰라.", "theta, *_ = np.linalg.lstsq(X, y, rcond=None)", "직접 inverse보다 lstsq가 rank 문제에 더 안전하다.", "np.linalg.inv(X) @ y라고 답함", "X가 정방행렬이 아닐 수 있고 수치적으로 불안정하다.", "least_squares", "code_debug"),
  q("exam_math_foundation_final", "q05_code_debug", "code_debug", "medium", "svd_condition_number", "sigma_min=0인데 sigma_max/sigma_min을 바로 계산했다. 어떻게 고치는가?", "sigma_min이 1e-12보다 작으면 inf 또는 안전한 큰 값으로 처리한다.", "0으로 나누면 조건수 계산이 깨진다.", "epsilon 없이 계속 나눈다고 답함", "rank deficient 행렬에서는 분모가 0일 수 있다.", "svd_condition_number", "code_completion"),
  q("exam_math_foundation_final", "q06_visual", "visualization_interpretation", "medium", "eigen_covariance_ellipse", "ellipse가 x방향으로 길면 무엇을 의미하는가?", "x방향 불확실성이 y방향보다 크다.", "ellipse 장축은 큰 분산 방향을 보여준다.", "x방향 속도가 크다고 답함", "공분산 ellipse는 속도보다 불확실성을 나타낸다.", "eigen_covariance_ellipse", "concept"),
  q("exam_math_foundation_final", "q07_robot", "robot_scenario", "hard", "gaussian_mle", "센서 노이즈가 커졌는데 Kalman R을 그대로 두면 어떤 문제가 생기는가?", "측정을 과하게 믿어 추정이 흔들릴 수 있다.", "R은 measurement noise covariance다.", "항상 더 빠르게 수렴한다고 답함", "노이즈 큰 측정을 과신하면 추정 품질이 나빠진다.", "gaussian_mle", "safety_analysis"),
  q("exam_math_foundation_final", "q08_design", "system_design", "hard", "low_pass_filter", "저역통과 필터를 로봇 센서 pipeline에 넣을 때 기록할 파라미터 2개는?", "cutoff frequency와 sampling period를 기록한다.", "필터 동작은 주파수와 샘플링 주기에 좌우된다.", "필터 이름만 기록하면 된다고 답함", "재현 가능한 실험에는 수치 파라미터가 필요하다.", "low_pass_filter", "integration_pipeline"),
  q("exam_math_foundation_final", "q09_safety", "safety_analysis", "hard", "svd_condition_number", "condition number가 매우 큰 제어 행렬을 그대로 inverse하면 왜 위험한가?", "작은 측정/계산 오차가 큰 명령으로 증폭될 수 있다.", "ill-conditioned matrix는 역문제에서 노이즈를 키운다.", "계산이 더 정밀해진다고 답함", "큰 조건수는 안정성이 아니라 불안정 경고다.", "svd_condition_number", "system_design"),
  q("exam_math_foundation_final", "q10_pipeline", "integration_pipeline", "hard", "least_squares", "센서 calibration pipeline에서 최소제곱 결과를 배포하기 전 확인할 3가지는?", "잔차 크기, rank/condition number, train/test split 또는 검증 데이터를 확인한다.", "calibration은 숫자 하나가 아니라 데이터 품질과 수치 안정성 확인까지 포함한다.", "parameter만 저장하면 된다고 답함", "검증 없이 저장하면 실제 로봇에서 calibration 오류가 커질 수 있다.", "least_squares", "system_design"),
];

const ros2Questions: QuizQuestionV2[] = [
  q("exam_ros2_practical", "q01_concept", "concept", "easy", "ros2_tf2_transform", "ROS2 TF2가 관리하는 것은 무엇인가?", "시간이 있는 frame tree와 frame 간 transform이다.", "TF2는 map, odom, base_link, sensor frame 관계를 관리한다.", "topic 이름만 관리한다고 답함", "TF2는 topic 목록이 아니라 좌표 frame 변환 시스템이다.", "ros2_tf2_transform", "concept"),
  q("exam_ros2_practical", "q02_calc", "calculation", "medium", "ros2_tf2_transform", "odom->base translation x=1이고 base point x=2이면 odom x는?", "1+2=3이다.", "identity rotation이면 translation을 더한다.", "2라고 답함", "parent frame translation을 빠뜨렸다.", "ros2_tf2_transform", "calculation"),
  q("exam_ros2_practical", "q03_derivation", "derivation", "hard", "ros2_tf2_transform", "T_map_base = T_map_odom T_odom_base 순서가 필요한 이유를 설명하라.", "base 점을 odom으로, 다시 map으로 보내는 순서라서 오른쪽 transform이 먼저 적용된다.", "행렬곱은 frame chain 순서와 방향을 지켜야 한다.", "곱셈은 항상 순서가 상관없다고 답함", "transform 행렬곱은 일반적으로 교환법칙이 성립하지 않는다.", "ros2_tf2_transform", "visualization_interpretation"),
  q("exam_ros2_practical", "q04_code_completion", "code_completion", "medium", "ros2_tf2_transform", "TransformStamped에서 parent frame을 넣는 필드는?", "tf.header.frame_id", "child는 child_frame_id이고 parent는 header.frame_id다.", "tf.child_frame_id라고 답함", "child_frame_id는 자식 frame 이름이다.", "ros2_tf2_transform", "code_debug"),
  q("exam_ros2_practical", "q05_debug", "code_debug", "hard", "ros2_tf2_transform", "tf2_echo에서 extrapolation error가 난다. 가장 먼저 확인할 것은?", "timestamp mismatch, stale transform, clock 설정을 확인한다.", "TF2 오류는 frame 이름뿐 아니라 시간 문제일 수 있다.", "RViz 색만 바꾼다고 답함", "시각화 설정이 아니라 transform 시간 계약을 확인해야 한다.", "ros2_tf2_transform", "robot_scenario"),
  q("exam_ros2_practical", "q06_visual", "visualization_interpretation", "medium", "ros2_tf2_transform", "TF tree 시각화에서 base_link가 map과 끊겨 있으면 어떤 뜻인가?", "필요한 transform chain이 없어 좌표 변환을 할 수 없다는 뜻이다.", "TF tree는 연결되어야 lookup이 가능하다.", "성능이 빨라진다는 뜻이라고 답함", "끊긴 tree는 속도 문제가 아니라 변환 불가능 문제다.", "ros2_tf2_transform", "integration_pipeline"),
  q("exam_ros2_practical", "q07_robot", "robot_scenario", "hard", "ros2_tf2_transform", "카메라 detection을 base_link 명령으로 바꾸려면 무엇이 필요한가?", "camera_link에서 base_link까지 timestamp가 맞는 TF chain이 필요하다.", "인식 결과는 로봇 frame으로 변환되어야 action이 된다.", "픽셀을 cmd_vel에 바로 넣는다고 답함", "픽셀 좌표와 base_link 좌표는 단위와 frame이 다르다.", "ros2_tf2_transform", "system_design"),
  q("exam_ros2_practical", "q08_design", "system_design", "hard", "ros2_tf2_transform", "TF broadcaster 설계에서 watchdog이 검사할 항목 3개는?", "필수 frame 존재, transform age, quaternion normalization을 검사한다.", "TF는 frame 이름, 시간, 회전 표현이 모두 맞아야 한다.", "frame 이름만 보면 된다고 답함", "시간과 quaternion 오류도 실제 로봇 동작을 망친다.", "ros2_tf2_transform", "safety_analysis"),
  q("exam_ros2_practical", "q09_safety", "safety_analysis", "hard", "safety_watchdog_timer", "cmd_vel topic이 끊겼는데 base가 마지막 속도를 유지한다. 안전 대응은?", "watchdog timeout 후 zero velocity를 보내고 motor enable을 내린다.", "통신 끊김은 fail-safe 정지로 가야 한다.", "마지막 명령을 계속 유지한다고 답함", "마지막 명령 유지가 가장 위험한 실패 모드다.", "safety_watchdog_timer", "robot_scenario"),
  q("exam_ros2_practical", "q10_pipeline", "integration_pipeline", "hard", "ros2_tf2_transform", "ROS2 perception-to-action pipeline 순서를 쓰라.", "sensor message 수신, timestamp 확인, TF lookup, 좌표 변환, planner/controller command, safety monitor 검사를 거친다.", "ROS2 실전은 topic, time, TF, action, safety가 연결된 pipeline이다.", "노드 하나만 실행하면 된다고 답함", "실제 로봇은 여러 노드 계약이 맞아야 안전하게 동작한다.", "ros2_tf2_transform", "system_design"),
];

const autonomousDrivingQuestions: QuizQuestionV2[] = [
  q("exam_autonomous_driving_final", "q01_concept", "concept", "easy", "ekf_observation_jacobian", "EKF에서 Jacobian이 필요한 이유는?", "비선형 모델을 현재 추정값 근처에서 선형화하기 위해 필요하다.", "EKF는 선형 Kalman Filter를 비선형 시스템에 적용하기 위해 미분을 쓴다.", "Jacobian은 노이즈 제거 필터라고 답함", "Jacobian은 필터 자체가 아니라 선형화 행렬이다.", "ekf_observation_jacobian", "concept"),
  q("exam_autonomous_driving_final", "q02_calc", "calculation", "medium", "ekf_observation_jacobian", "예측 x=10, 측정 z=12이면 innovation z-h(x)는?", "12-10=2이다.", "innovation은 측정과 예측 측정의 차이다.", "22라고 답함", "innovation은 합이 아니라 차이다.", "ekf_observation_jacobian", "calculation"),
  q("exam_autonomous_driving_final", "q03_derivation", "derivation", "hard", "ekf_observation_jacobian", "range h=sqrt(x^2+y^2)의 x 편미분을 쓰라.", "dh/dx = x / sqrt(x^2+y^2)이다.", "sqrt 내부를 chain rule로 미분한다.", "2x라고 답함", "sqrt를 미분하지 않고 내부만 미분한 오류다.", "ekf_observation_jacobian", "calculation"),
  q("exam_autonomous_driving_final", "q04_code", "code_completion", "medium", "ekf_observation_jacobian", "EKF update에서 innovation 한 줄을 쓰라.", "y = z - h(x)", "측정 z와 예측 측정 h(x)의 차이가 innovation이다.", "y = z + h(x)라고 답함", "잔차는 합이 아니라 차이다.", "ekf_observation_jacobian", "code_debug"),
  q("exam_autonomous_driving_final", "q05_debug", "code_debug", "hard", "ekf_observation_jacobian", "각도 innovation이 pi 근처에서 튄다. 무엇을 해야 하는가?", "각도 차이를 [-pi, pi]로 normalize한다.", "각도는 wrap-around가 있어 일반 뺄셈만 쓰면 튄다.", "degree로 출력만 바꾼다고 답함", "표시 단위가 아니라 angle wrapping 문제다.", "ekf_observation_jacobian", "code_completion"),
  q("exam_autonomous_driving_final", "q06_visual", "visualization_interpretation", "medium", "eigen_covariance_ellipse", "localization covariance ellipse가 커지면 어떤 뜻인가?", "위치 추정 불확실성이 커졌다는 뜻이다.", "ellipse 크기는 covariance 크기와 연결된다.", "차가 더 큰 속도로 달린다는 뜻이라고 답함", "ellipse는 속도보다 불확실성 시각화다.", "eigen_covariance_ellipse", "concept"),
  q("exam_autonomous_driving_final", "q07_robot", "robot_scenario", "hard", "ekf_observation_jacobian", "GPS가 튀는 구간에서 차량이 갑자기 조향하면 무엇을 의심하는가?", "측정 outlier 처리, R covariance, innovation gate를 의심한다.", "나쁜 측정을 그대로 믿으면 제어가 흔들린다.", "조향 모터만 바꾸면 된다고 답함", "원인은 actuator가 아니라 상태 추정 입력일 수 있다.", "ekf_observation_jacobian", "safety_analysis"),
  q("exam_autonomous_driving_final", "q08_design", "system_design", "hard", "ekf_observation_jacobian", "자율주행 localization 로그에 남길 값 4개는?", "pose, covariance, innovation, sensor timestamp를 남긴다.", "디버깅에는 상태와 불확실성, 측정 잔차, 시간이 필요하다.", "pose만 저장한다고 답함", "pose만으로는 왜 틀렸는지 알 수 없다.", "ekf_observation_jacobian", "integration_pipeline"),
  q("exam_autonomous_driving_final", "q09_safety", "safety_analysis", "hard", "safety_sensor_timeout_handling", "LiDAR가 stale인데 obstacle avoidance가 계속 RUNNING이면 왜 위험한가?", "오래된 장애물 정보를 현재로 믿어 충돌할 수 있다.", "stale sensor는 안전 정지 또는 감속 조건이다.", "LiDAR 없이도 항상 안전하다고 답함", "필수 센서가 끊기면 perception 결과를 믿을 수 없다.", "safety_sensor_timeout_handling", "robot_scenario"),
  q("exam_autonomous_driving_final", "q10_pipeline", "integration_pipeline", "hard", "ekf_observation_jacobian", "자율주행 localization-to-control pipeline 순서를 쓰라.", "sensor sync, prediction, measurement update, covariance check, trajectory tracking, safety monitor 순서로 연결한다.", "추정 결과는 안전 검사 후 제어기로 전달되어야 한다.", "EKF 결과를 바로 모터 전류로 보낸다고 답함", "상태 추정과 actuator command 사이에는 planner/controller/safety 단계가 필요하다.", "ekf_observation_jacobian", "system_design"),
];

const physicalAIQuestions: QuizQuestionV2[] = [
  q("exam_physical_ai_system_design", "q01_concept", "concept", "easy", "behavior_cloning_covariate_shift", "Behavior Cloning에서 covariate shift란 무엇인가?", "정책이 학습 데이터와 다른 상태로 들어가 오류가 누적되는 현상이다.", "작은 예측 오류가 다음 입력 분포를 바꿔 더 큰 오류를 만든다.", "데이터가 많아지는 현상이라고 답함", "covariate shift는 데이터 양이 아니라 train/test 상태 분포 차이다.", "behavior_cloning_covariate_shift", "concept"),
  q("exam_physical_ai_system_design", "q02_calc", "calculation", "medium", "ai_metrics", "100개 중 성공 82개면 success rate는?", "82/100=82%이다.", "성공률은 성공 횟수를 전체 시도 횟수로 나눈다.", "18%라고 답함", "18%는 실패율이다.", "behavior_cloning_covariate_shift", "calculation"),
  q("exam_physical_ai_system_design", "q03_derivation", "derivation", "hard", "sim2real_domain_randomization", "domain randomization이 sim2real gap을 줄이는 논리를 3단계로 설명하라.", "시뮬레이션에서 texture, mass, friction을 랜덤화하고 다양한 관측에 강한 정책을 학습해 실제 환경 변화에도 덜 흔들리게 한다.", "훈련 분포를 넓혀 실제 환경이 그 안에 들어오게 만드는 전략이다.", "랜덤이면 무조건 성능이 좋아진다고 답함", "랜덤화 범위와 task 관련성이 맞아야 효과가 있다.", "sim2real_domain_randomization", "system_design"),
  q("exam_physical_ai_system_design", "q04_code", "code_completion", "medium", "behavior_cloning_covariate_shift", "BC 학습 루프에서 prediction과 action label의 MSE loss 한 줄을 쓰라.", "loss = ((pred_action - expert_action) ** 2).mean()", "BC는 expert action을 supervised target으로 사용한다.", "loss = pred_action.mean()이라고 답함", "expert label과 비교하지 않으면 imitation loss가 아니다.", "behavior_cloning_covariate_shift", "code_debug"),
  q("exam_physical_ai_system_design", "q05_debug", "code_debug", "hard", "sim2real_domain_randomization", "sim에서는 성공하지만 real에서 실패한다. 먼저 비교할 로그 3개는?", "관측 분포, action scale, latency를 비교한다.", "sim2real 실패는 입력, 출력, 시간 지연 차이에서 자주 나온다.", "모델 크기만 키운다고 답함", "원인이 시스템 mismatch이면 모델 크기만으로 해결되지 않는다.", "sim2real_domain_randomization", "integration_pipeline"),
  q("exam_physical_ai_system_design", "q06_visual", "visualization_interpretation", "medium", "sim2real_domain_randomization", "sim2real gap 시각화에서 real success가 sim success보다 낮으면 무엇을 뜻하는가?", "시뮬레이션에서 배운 정책이 실제 환경 변화에 충분히 일반화하지 못했다는 뜻이다.", "두 환경의 성능 차이가 gap이다.", "real 환경이 쉬워졌다는 뜻이라고 답함", "real success가 낮으면 실제 배포 위험이 크다.", "sim2real_domain_randomization", "safety_analysis"),
  q("exam_physical_ai_system_design", "q07_robot", "robot_scenario", "hard", "behavior_cloning_covariate_shift", "로봇이 시연 경로에서 조금 벗어나자 계속 더 벗어난다. 어떤 문제인가?", "covariate shift 문제이며 DAgger나 recovery data가 필요하다.", "정책이 본 적 없는 상태에서 잘못된 action을 내고 오류가 누적된다.", "목표가 가까워졌다고 답함", "경로 이탈 누적은 성공 신호가 아니라 distribution shift 신호다.", "behavior_cloning_covariate_shift", "system_design"),
  q("exam_physical_ai_system_design", "q08_design", "system_design", "hard", "sim2real_domain_randomization", "Physical AI 배포 전 안전 gate 4개를 설계하라.", "offline eval, simulation stress test, real low-speed test, watchdog/failsafe gate를 둔다.", "학습 정책은 검증 단계별로 위험을 줄이며 실제 로봇에 올라가야 한다.", "바로 최고 속도로 real test한다고 답함", "학습 정책은 예측 불가능한 실패가 있어 단계적 안전 gate가 필요하다.", "sim2real_domain_randomization", "safety_analysis"),
  q("exam_physical_ai_system_design", "q09_safety", "safety_analysis", "hard", "safety_actuator_limit_saturation", "학습 정책이 limit 밖 action을 자주 낸다. 안전 대응은?", "action clipping, hard stop, policy rollback, 로그 분석을 수행한다.", "limit 초과는 정책 오류와 안전 위험을 동시에 나타낸다.", "그대로 actuator에 보낸다고 답함", "limit 밖 명령은 장비와 사람을 위험하게 만든다.", "safety_actuator_limit_saturation", "robot_scenario"),
  q("exam_physical_ai_system_design", "q10_pipeline", "integration_pipeline", "hard", "sim2real_domain_randomization", "Physical AI 학습부터 배포까지 pipeline을 쓰라.", "data collection, training, validation, sim stress test, export, latency profiling, safety monitor, staged real deployment 순서로 연결한다.", "Physical AI는 모델만이 아니라 데이터, 학습, 시스템, 안전 배포가 모두 이어진다.", "학습 파일 하나만 저장하면 끝이라고 답함", "실제 로봇 배포에는 export, latency, safety, rollback 계획이 필요하다.", "sim2real_domain_randomization", "system_design"),
];

export const finalExamSets: FinalExamSet[] = [
  {
    examId: "exam_math_foundation_final",
    title: "Math Foundation Final Exam",
    purpose: "선형대수, SVD, 최소제곱, 확률/필터 기초를 로봇 계산과 연결해 검증한다.",
    linkedPart: "Part 1",
    connectedSessions: ["eigen_covariance_ellipse", "svd_condition_number", "least_squares", "gaussian_mle", "low_pass_filter"],
    passPercent: 70,
    excellentPercent: 90,
    questions: mathFoundationQuestions,
  },
  {
    examId: "exam_robot_math_final",
    title: "Robot Math Final Exam",
    purpose: "회전, SE(3), quaternion, FK/IK, Jacobian, singularity, TF2 좌표변환 이해를 검증한다.",
    linkedPart: "Part 2",
    connectedSessions: ["robot_math_2d_rotation_matrix", "robot_math_3d_rotation_so3", "robot_math_homogeneous_transform_se3", "robot_math_forward_kinematics", "robot_math_singularity_damped_least_squares"],
    passPercent: 70,
    excellentPercent: 90,
    questions: robotMathQuestions,
  },
  {
    examId: "exam_ros2_practical",
    title: "ROS2 Practical Exam",
    purpose: "ROS2 TF2, timestamp, frame chain, safety watchdog를 실제 노드 연결 관점에서 평가한다.",
    linkedPart: "Part 6",
    connectedSessions: ["ros2_tf2_transform", "safety_watchdog_timer"],
    passPercent: 70,
    excellentPercent: 90,
    questions: ros2Questions,
  },
  {
    examId: "exam_autonomous_driving_final",
    title: "Autonomous Driving Final Exam",
    purpose: "EKF, covariance, 센서 stale, localization-to-control pipeline을 평가한다.",
    linkedPart: "Part 4",
    connectedSessions: ["ekf_observation_jacobian", "eigen_covariance_ellipse", "safety_sensor_timeout_handling"],
    passPercent: 70,
    excellentPercent: 90,
    questions: autonomousDrivingQuestions,
  },
  {
    examId: "exam_physical_ai_system_design",
    title: "Physical AI System Design Exam",
    purpose: "Behavior Cloning, Sim2Real, latency, safety gate, 실제 배포 pipeline을 평가한다.",
    linkedPart: "Part 7-8",
    connectedSessions: ["behavior_cloning_covariate_shift", "sim2real_domain_randomization", "safety_actuator_limit_saturation"],
    passPercent: 70,
    excellentPercent: 90,
    questions: physicalAIQuestions,
  },
];

const sessionForExam = (exam: FinalExamSet): Session => {
  const lab = makeExamCodeLab(exam.examId, exam.title);
  const visualization = makeExamVisualization(exam, lab.id);
  const maxPoints = exam.questions.reduce((sum, question) => sum + finalExamScoring.pointsByDifficulty[question.difficulty], 0);

  return session({
    id: exam.examId,
    part,
    title: exam.title,
    level: "advanced",
    prerequisites: exam.connectedSessions,
    learningObjectives: [
      `${exam.title}의 10문제를 풀어 ${exam.linkedPart} 학습 성취를 확인한다.`,
      "오답의 conceptTag와 reviewSession을 따라 복습 경로를 정한다.",
      "70점 이상이면 통과, 90점 이상이면 심화 프로젝트로 이동한다.",
    ],
    theory: {
      definition: `${exam.title}은 ${exam.purpose}`,
      whyItMatters: "최종 평가는 공부를 했다는 느낌이 아니라 계산, 코드, 시각화, 로봇 상황, 안전 판단을 실제로 할 수 있는지 확인한다.",
      intuition: "게임의 마지막 스테이지처럼, 앞에서 배운 작은 기술을 한 번에 꺼내 쓰는 확인 단계다.",
      equations: [
        makeEquation("Weighted score", "percent = earned_points / total_points * 100", [["earned_points", "획득 점수"], ["total_points", `${maxPoints}점 만점`], ["percent", "최종 백분율"]], "난이도별 점수를 합산해 백분율로 바꾼다."),
        makeEquation("Pass condition", "pass = percent >= 70", [["percent", "최종 점수"], ["70", "통과 기준"]], "70점 이상이면 다음 실전 프로젝트로 넘어갈 수 있다."),
      ],
      derivation: [
        step("문제별 점수 배정", "easy=1점, medium=2점, hard=3점으로 채점한다."),
        step("획득 점수 합산", "맞힌 문제의 점수를 모두 더한다.", "earned_points=sum(points_i)"),
        step("백분율 변환", "획득 점수를 만점으로 나눠 100을 곱한다.", "percent=earned_points/total_points*100"),
        step("피드백 선택", "점수 구간에 따라 복습 또는 프로젝트 이동을 결정한다."),
      ],
      handCalculation: {
        problem: `${exam.title}에서 20점 만점 중 14점을 얻었다. 통과인가?`,
        given: { earned_points: 14, total_points: 20, pass_percent: 70 },
        steps: ["14/20*100=70", "70 >= 70", "통과 기준을 만족한다."],
        answer: "통과. 실전 프로젝트로 넘어갈 수 있음.",
      },
      robotApplication: "최종 평가는 실제 로봇 프로젝트 투입 전, 수학 계산과 시스템 안전 판단을 함께 확인하는 gate 역할을 한다.",
    },
    codeLabs: [lab],
    visualizations: [visualization],
    quizzes: exam.questions,
    wrongAnswerTags: makeWrongTags(exam.examId, `${exam.title} 오답 분석`, exam.connectedSessions),
    nextSessions: exam.examId === "exam_physical_ai_system_design" ? ["integration_project_capstone"] : ["exam_physical_ai_system_design"],
  });
};

export const finalExamQuestions: QuizQuestionV2[] = finalExamSets.flatMap((exam) => exam.questions);
export const finalExamSessions: Session[] = finalExamSets.map(sessionForExam);
