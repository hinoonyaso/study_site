import type {
  CurriculumModule,
  CodeExample,
  LessonSection,
  PracticeBlock,
  PracticeParameter,
  Formula,
  QuizQuestion,
  ResourceLink,
  ExecutableLabId,
  TheoryUnit,
  TheoryGraphId,
  VisualizerId,
  WorkedExample,
} from "../types";

type LegacyLessonSection = Omit<LessonSection, "theory"> & {
  theory: string[];
};

type LegacyCurriculumModule = Omit<CurriculumModule, "sections"> & {
  sections: LegacyLessonSection[];
};

const defaultParameters = (runtime: "C++" | "Python", topic: string): PracticeParameter[] => [
  {
    name: "입력 데이터",
    defaultValue: "예제 코드 내 상수",
    unit: "-",
    description: `${topic} 실습에서 바꿔가며 결과를 비교할 기본 입력값입니다.`,
  },
  {
    name: "실행 환경",
    defaultValue: runtime === "C++" ? "Ubuntu 22.04 / CMake" : "Python 3.10 / venv",
    unit: "-",
    description: "브라우저는 코드를 컴파일하지 않고, 같은 개념을 시각화로 검산합니다.",
  },
];

const cpp = (
  topic: string,
  body: string,
  expected: string,
  tasks: string[],
  parameters = defaultParameters("C++", topic),
): PracticeBlock => ({
  goal: `${topic}을 C++ 모듈로 분리해 재사용 가능한 형태로 구현한다.`,
  code: body.trim(),
  starterCode: body.trim(),
  solutionCode: body.trim(),
  expected,
  expectedOutput: expected,
  tasks,
  parameters,
  checks: tasks,
});

const py = (
  topic: string,
  body: string,
  expected: string,
  tasks: string[],
  parameters = defaultParameters("Python", topic),
): PracticeBlock => ({
  goal: `${topic}을 Python에서 빠르게 검산하고 그래프로 확인한다.`,
  code: body.trim(),
  starterCode: body.trim(),
  solutionCode: body.trim(),
  expected,
  expectedOutput: expected,
  tasks,
  parameters,
  checks: tasks,
});

const sourceIdsBySection = (sectionId: string): string[] => {
  if (sectionId.includes("math")) {
    return ["openstax-algebra-trig", "khan-trigonometry", "mit-1806", "mit-1802", "harvard-stat110", "boyd-convex"];
  }
  if (sectionId.includes("cpp-python") || sectionId.includes("ros2")) {
    return ["ros2-humble", "ros2-cpp-pubsub", "ros2-python-pubsub", "ros2-launch", "ros2-qos", "tf2-main"];
  }
  if (sectionId.includes("manipulator")) {
    return ["modern-robotics", "modern-robotics-pdf", "moveit-humble", "ros2-control-humble", "eigen-quick-reference", "pinocchio"];
  }
  if (sectionId.includes("mobile") || sectionId.includes("planning") || sectionId.includes("pure")) {
    return ["probabilistic-robotics", "planning-algorithms", "nav2", "nav2-costmap-2d", "slam-toolbox", "robot-localization"];
  }
  if (sectionId.includes("ai")) return ["pytorch", "pytorch-tutorials", "opencv-docs", "onnx-runtime", "onnx-runtime-cpp-api", "tensorrt-docs"];
  if (sectionId.includes("llm")) return ["openai-prompting", "openai-evals", "openai-function-calling", "anthropic-context-engineering", "langchain-docs"];
  if (sectionId.includes("jetrover")) return ["jetrover-docs", "jetrover-arm-course", "jetrover-mapping-navigation", "jetrover-moveit-gazebo"];
  if (sectionId.includes("realtime") || sectionId.includes("safety")) return ["ros2-executors", "ros2-callback-groups", "ros2-qos", "rosbag2", "mit-underactuated-mpc", "feedback-systems"];
  if (sectionId.includes("links")) return ["ros2-humble", "modern-robotics", "moveit-humble", "nav2", "pytorch", "onnx-runtime", "openstax-linear-algebra"];
  return ["ros2-humble", "modern-robotics", "mit-underactuated"];
};

const graphIdsBySection = (sectionId: string): TheoryGraphId[] => {
  if (sectionId.includes("math")) return ["rotation-basis", "gaussian-kf", "gradient-descent"];
  if (sectionId.includes("manipulator")) return ["rotation-basis", "trajectory-polynomial"];
  if (sectionId.includes("mobile") || sectionId.includes("planning") || sectionId.includes("pure")) {
    return ["covariance-ellipse", "astar-cost"];
  }
  if (sectionId.includes("ai")) return ["confusion-matrix", "gradient-descent"];
  if (sectionId.includes("llm")) return ["retrieval-pipeline", "state-machine"];
  if (sectionId.includes("realtime") || sectionId.includes("safety")) return ["state-machine", "trajectory-polynomial"];
  return ["state-machine", "gradient-descent"];
};

const executableLabBySection = (sectionId: string): ExecutableLabId => {
  if (sectionId.includes("math")) return "rotation-2d";
  if (sectionId.includes("manipulator")) return "two-link-fk";
  if (sectionId.includes("mobile-localization")) return "diff-drive";
  if (sectionId.includes("mobile-planning")) return "astar-grid";
  if (sectionId.includes("mobile-local-control")) return "pure-pursuit";
  if (sectionId.includes("ai")) return "ai-metrics";
  if (sectionId.includes("realtime") || sectionId.includes("safety")) return "latency-stats";
  return "kalman-1d";
};

const figureByGraphId = (id: TheoryGraphId) => {
  const labels: Record<TheoryGraphId, [string, string]> = {
    "rotation-basis": ["회전 basis", "basis vector가 회전행렬의 열벡터로 이동하는 모습을 본다."],
    "gaussian-kf": ["Gaussian / Kalman", "측정값과 추정값이 noise와 gain에 따라 어떻게 섞이는지 본다."],
    "gradient-descent": ["Gradient descent", "loss surface에서 음의 gradient 방향으로 parameter가 이동한다."],
    "covariance-ellipse": ["Covariance ellipse", "공분산 행렬의 크기와 방향이 위치 불확실성 타원을 만든다."],
    "trajectory-polynomial": ["Trajectory polynomial", "위치, 속도, 가속도 경계조건이 부드러운 궤적을 만든다."],
    "astar-cost": ["A* cost field", "g-cost와 h-cost의 합이 search frontier를 목표 쪽으로 당긴다."],
    "confusion-matrix": ["Confusion matrix", "TP/FP/FN/TN에서 accuracy, precision, recall, F1이 나온다."],
    "state-machine": ["State machine", "NORMAL, WARNING, STOP, RECOVERY 같은 discrete state 전이를 본다."],
    "retrieval-pipeline": ["Retrieval pipeline", "chunking, top-k retrieval, context assembly, eval이 하나의 하네스를 이룬다."],
  };
  const [title, explanation] = labels[id];
  return { id, title, explanation };
};

const executableStarter = (id: ExecutableLabId) => {
  const snippets: Partial<Record<ExecutableLabId, string>> = {
    "unit-circle-trig": `const angles = [0, Math.PI / 6, Math.PI / 4, Math.PI / 2];
const table = angles.map((theta) => ({
  theta: Number(theta.toFixed(4)),
  cos: Number(Math.cos(theta).toFixed(4)),
  sin: Number(Math.sin(theta).toFixed(4)),
  identity: Number((Math.cos(theta) ** 2 + Math.sin(theta) ** 2).toFixed(4)),
}));
console.log("unit circle", table);
return { values: table.map((row) => row.sin), table };`,
    "rotation-2d": `const theta = Math.PI / 6;
const v = [1, 0.5];
const result = {
  x: Math.cos(theta) * v[0] - Math.sin(theta) * v[1],
  y: Math.sin(theta) * v[0] + Math.cos(theta) * v[1],
};
console.log("rotated", result);
return result;`,
    "homogeneous-transform": `const theta = Math.PI / 3;
const t = [2, 1];
const p = [1, 0];
const rotated = [
  Math.cos(theta) * p[0] - Math.sin(theta) * p[1],
  Math.sin(theta) * p[0] + Math.cos(theta) * p[1],
];
const transformed = [rotated[0] + t[0], rotated[1] + t[1]];
console.log("T*p", transformed);
return { x: transformed[0], y: transformed[1], values: transformed };`,
    "svd-pseudoinverse": `const sigma = [3, 0.2];
const lambda = 0.15;
const dampedInverse = sigma.map((s) => s / (s * s + lambda * lambda));
console.log("DLS singular value inverse", dampedInverse);
return { values: dampedInverse, maxGain: Math.max(...dampedInverse) };`,
    "two-link-fk": `const l1 = 1.0, l2 = 0.7;
const q1 = Math.PI / 6, q2 = Math.PI / 3;
const x = l1 * Math.cos(q1) + l2 * Math.cos(q1 + q2);
const y = l1 * Math.sin(q1) + l2 * Math.sin(q1 + q2);
const detJ = l1 * l2 * Math.sin(q2);
console.log("ee", x, y, "detJ", detJ);
return { x, y, detJ };`,
    "kalman-1d": `let x = 0, p = 1;
const q = 0.02, r = 0.25;
const measurements = [0.2, 0.4, 0.9, 0.8, 1.1];
const estimates = measurements.map((z) => {
  p += q;
  const k = p / (p + r);
  x = x + k * (z - x);
  p = (1 - k) * p;
  return Number(x.toFixed(3));
});
console.log("estimates", estimates);
return { estimates };`,
    "ekf-2d": `let state = { x: 0, y: 0, theta: 0 };
let covarianceTrace = 0.2;
const commands = [
  { v: 0.4, w: 0.1, dt: 1 },
  { v: 0.4, w: 0.0, dt: 1 },
  { v: 0.3, w: -0.1, dt: 1 },
];
const path = commands.map(({ v, w, dt }) => {
  state = {
    x: state.x + v * Math.cos(state.theta) * dt,
    y: state.y + v * Math.sin(state.theta) * dt,
    theta: state.theta + w * dt,
  };
  covarianceTrace += 0.03 + Math.abs(w) * 0.02;
  return Number(covarianceTrace.toFixed(3));
});
console.log("ekf predict trace", path);
return { x: state.x, y: state.y, theta: state.theta, values: path };`,
    "diff-drive": `const vl = 0.2, vr = 0.6, b = 0.5, dt = 1.0;
const v = (vr + vl) / 2;
const omega = (vr - vl) / b;
const pose = { x: v * dt, y: 0, theta: omega * dt };
console.log("pose", pose);
return pose;`,
    "occupancy-log-odds": `const prior = 0;
const hit = Math.log(0.7 / 0.3);
const miss = Math.log(0.4 / 0.6);
const observations = ["hit", "hit", "miss", "hit"];
let logOdds = prior;
const values = observations.map((obs) => {
  logOdds += obs === "hit" ? hit : miss;
  return Number((1 / (1 + Math.exp(-logOdds))).toFixed(3));
});
console.log("occupancy probability", values);
return { values, final: values.at(-1) };`,
    "astar-grid": `const g = 8;
const h = 5;
const f = g + h;
console.log("f-cost", f);
return { g, h, f, chosen: f < 20 };`,
    "pure-pursuit": `const y = 0.4;
const Ld = 1.0;
const curvature = 2 * y / (Ld * Ld);
console.log("curvature", curvature);
return { curvature };`,
    "stanley-controller": `const headingError = 0.18;
const crossTrackError = 0.35;
const speed = 1.2;
const k = 0.8;
const steering = headingError + Math.atan2(k * crossTrackError, speed);
console.log("stanley steering", steering);
return { steering, values: [headingError, crossTrackError, steering] };`,
    "pid-response": `const target = 1;
let y = 0, integral = 0, prevError = 0;
const values = [];
for (let i = 0; i < 18; i++) {
  const error = target - y;
  integral += error * 0.1;
  const derivative = (error - prevError) / 0.1;
  const u = 1.2 * error + 0.2 * integral + 0.05 * derivative;
  y += 0.1 * (-0.6 * y + u);
  prevError = error;
  values.push(Number(y.toFixed(3)));
}
console.log("pid response", values);
return { values, final: y };`,
    "lqr-step": `const a = 1.0, b = 0.2;
const k = 1.6;
let x = 1.0;
const values = [];
for (let i = 0; i < 12; i++) {
  const u = -k * x;
  x = a * x + b * u;
  values.push(Number(x.toFixed(4)));
}
console.log("closed-loop state", values);
return { values, final: x };`,
    "mpc-rollout": `const horizon = 6;
const candidates = [-0.4, -0.2, 0, 0.2];
const scored = candidates.map((u) => {
  let x = 1;
  let cost = 0;
  for (let k = 0; k < horizon; k++) {
    x = x + u;
    cost += x * x + 0.2 * u * u;
  }
  return { u, cost: Number(cost.toFixed(3)) };
});
const best = scored.reduce((a, b) => (a.cost < b.cost ? a : b));
console.log("mpc candidates", scored, "best", best);
return { values: scored.map((item) => item.cost), bestU: best.u };`,
    "camera-projection": `const fx = 520, fy = 520, cx = 320, cy = 240;
const point = { X: 0.2, Y: -0.1, Z: 1.4 };
const u = fx * point.X / point.Z + cx;
const v = fy * point.Y / point.Z + cy;
console.log("pixel", { u, v });
return { u, v, values: [u, v] };`,
    "convolution-kernel": `const signal = [0, 1, 2, 3, 2, 1, 0];
const kernel = [-1, 0, 1];
const values = signal.slice(1, -1).map((_, i) =>
  kernel.reduce((sum, k, j) => sum + k * signal[i + j], 0)
);
console.log("edge response", values);
return { values };`,
    "ai-metrics": `const tp = 45, fp = 5, fn = 15, tn = 35;
const precision = tp / (tp + fp);
const recall = tp / (tp + fn);
const f1 = 2 * precision * recall / (precision + recall);
console.log({ precision, recall, f1 });
return { precision, recall, f1, accuracy: (tp + tn) / (tp + fp + fn + tn) };`,
    "onnx-shape-contract": `const expected = [1, 3, 224, 224];
const actual = [1, 224, 224, 3];
const mismatches = expected.map((dim, index) => ({ index, expected: dim, actual: actual[index], ok: dim === actual[index] }));
console.log("shape contract", mismatches);
return { values: mismatches.map((item) => item.ok ? 1 : 0), mismatchCount: mismatches.filter((item) => !item.ok).length };`,
    "latency-stats": `const periods = [19, 21, 20, 25, 18, 22, 40];
const target = 20;
const mean = periods.reduce((a, b) => a + b, 0) / periods.length;
const misses = periods.filter((p) => p > 33.3).length;
console.log("mean", mean, "misses", misses);
return { mean, misses, jitter: periods.map((p) => p - target) };`,
    "tf-tree-latency": `const transforms = [
  { edge: "map->odom", ageMs: 12 },
  { edge: "odom->base_link", ageMs: 8 },
  { edge: "base_link->camera", ageMs: 41 },
];
const stale = transforms.filter((tf) => tf.ageMs > 33);
console.log("tf ages", transforms, "stale", stale);
return { values: transforms.map((tf) => tf.ageMs), staleCount: stale.length };`,
    "rosbag-metric-analyzer": `const errors = [0.22, 0.18, 0.31, 0.15, 0.12, 0.28];
const mean = errors.reduce((a, b) => a + b, 0) / errors.length;
const max = Math.max(...errors);
const passRate = errors.filter((error) => error < 0.25).length / errors.length;
console.log("bag metrics", { mean, max, passRate });
return { values: errors, mean, max, passRate };`,
    "opencv-contour": `const threshold = 127;
const object = { x: 40, y: 30, w: 61, h: 51, intensity: 255 };
const visible = object.intensity > threshold;
const noiseHits = 2;
console.log("contours", visible ? 1 : 0, "bbox", object);
return { values: [threshold, object.w, object.h, noiseHits], contours: visible ? 1 : 0 };`,
    "pnp-pose": `const fx = 500, X = 0.1, Z = 1.0;
const pixelOffset = fx * X / Z;
const reprojectionError = 0.8;
console.log("pnp offset", pixelOffset, "error", reprojectionError);
return { values: [pixelOffset, reprojectionError], z: Z, pass: reprojectionError < 3 };`,
    "stereo-depth": `const f = 500, baseline = 0.1;
const disparities = [50, 25, 10];
const values = disparities.map((d) => f * baseline / d);
console.log("depths", values);
return { values, final: values.at(-1) };`,
    "backprop-numpy": `const y = 0.29, target = 1.0;
const dldy = 2 * (y - target);
const reluGate = 1;
const gradW1Scale = dldy * reluGate;
console.log("backprop", { dldy, gradW1Scale });
return { values: [y, dldy, gradW1Scale], final: gradW1Scale };`,
    "svd-jacobian-condition": `const sigma = [1.8, 0.12];
const condition = sigma[0] / sigma[1];
const manipulability = sigma[0] * sigma[1];
console.log("svd jacobian", { condition, manipulability });
return { values: sigma, condition, manipulability };`,
    "ros2-control-pid": `const raw = 4.2;
const limit = 1.0;
const command = Math.max(-limit, Math.min(limit, raw));
const nextState = 0 + 0.1 * command;
console.log("ros2_control mock", { command, nextState });
return { values: [raw, command, nextState], command, final: nextState };`,
  };
  return snippets[id] ?? `const values = [1, 0.5, 0.25].map((value, index) => Number((value / (index + 1)).toFixed(3)));
console.log("${id}", values);
return { values, final: values.at(-1) };`;
};

const expectedResultShape = (id: ExecutableLabId) => {
  const shapes: Partial<Record<ExecutableLabId, string>> = {
    "unit-circle-trig": "{ values: number[], table: Array<{ theta, sin, cos }> }",
    "rotation-2d": "{ x: number, y: number }",
    "homogeneous-transform": "{ x: number, y: number, values: number[] }",
    "svd-pseudoinverse": "{ values: number[], maxGain: number }",
    "two-link-fk": "{ x: number, y: number, detJ: number }",
    "kalman-1d": "{ estimates: number[] }",
    "ekf-2d": "{ x: number, y: number, theta: number, values: number[] }",
    "diff-drive": "{ x: number, y: number, theta: number }",
    "occupancy-log-odds": "{ values: number[], final: number }",
    "astar-grid": "{ g: number, h: number, f: number, chosen: boolean }",
    "pure-pursuit": "{ curvature: number }",
    "stanley-controller": "{ steering: number, values: number[] }",
    "pid-response": "{ values: number[], final: number }",
    "lqr-step": "{ values: number[], final: number }",
    "mpc-rollout": "{ values: number[], bestU: number }",
    "camera-projection": "{ u: number, v: number, values: number[] }",
    "convolution-kernel": "{ values: number[] }",
    "ai-metrics": "{ precision: number, recall: number, f1: number, accuracy: number }",
    "onnx-shape-contract": "{ values: number[], mismatchCount: number }",
    "latency-stats": "{ mean: number, misses: number, jitter: number[] }",
    "tf-tree-latency": "{ values: number[], staleCount: number }",
    "rosbag-metric-analyzer": "{ values: number[], mean: number, max: number, passRate: number }",
    "opencv-contour": "{ values: number[], contours: number }",
    "pnp-pose": "{ values: number[], z: number, pass: boolean }",
    "stereo-depth": "{ values: number[], final: number }",
    "backprop-numpy": "{ values: number[], final: number }",
    "svd-jacobian-condition": "{ values: number[], condition: number, manipulability: number }",
    "ros2-control-pid": "{ values: number[], command: number, final: number }",
  };
  return shapes[id] ?? "{ values: number[], final?: number }";
};

const professionalUnit = (section: LegacyLessonSection): TheoryUnit => {
  const sourceIds = sourceIdsBySection(section.id);
  const figures = graphIdsBySection(section.id).map(figureByGraphId);
  const common = {
    id: `${section.id}-professional-core`,
    title: `${section.title} 전문 핵심`,
    summary: `${section.focus} PDF의 학습 목표를 공식 문서 기반 이론, 계산, 구현 관점으로 다시 정리한다.`,
    intuition:
      "공식은 외워야 할 문장이 아니라 입력이 어떻게 출력으로 바뀌는지 압축한 지도다. 이 단원에서는 변수의 물리적 의미와 좌표계, 단위, 노이즈, 시간축을 같이 본다.",
    assumptions: [
      "모든 각도는 별도 표기가 없으면 radian 기준으로 계산한다.",
      "좌표계와 frame 기준은 수식 앞에 먼저 정의한다.",
      "브라우저 시뮬레이션은 교육용 단순 모델이며 실제 ROS 2/하드웨어 검증을 대체하지 않는다.",
    ],
    proof: [
      "상태 또는 기하 변수의 정의를 먼저 둔다.",
      "정의에서 출발해 필요한 좌표변환, 미분, 확률 업데이트를 한 단계씩 적용한다.",
      "마지막 식이 코드의 입력/출력과 같은 형태인지 확인한다.",
    ],
    engineeringMeaning: [
      "같은 식이라도 센서 지연, 노이즈, actuator limit, frame mismatch가 있으면 실제 로봇 거동은 달라진다.",
      "따라서 수식, 코드, 로그, 시각화를 함께 확인해야 디버깅 가능한 지식이 된다.",
    ],
    implementationNotes: [
      "Python으로 먼저 작은 숫자 예제를 검산하고 C++ 함수로 옮긴다.",
      "ROS 2 연결 전에는 입력 단위, 출력 단위, 예외 조건, 로그 metric을 정한다.",
    ],
    commonMistakes: [
      "좌표계 기준을 명시하지 않고 수식이나 코드를 작성한다.",
      "이론에서 정의한 입력/출력 단위와 코드 파라미터 단위를 다르게 둔다.",
      "한 번 성공한 결과만 보고 로그, 오차, 실패 조건을 남기지 않는다.",
    ],
    figures,
    graphExplanations: figures.map((figure) => `${figure.title}: ${figure.explanation}`),
    sourceIds,
  };

  if (section.id.includes("manipulator")) {
    return {
      ...common,
      intuition:
        "로봇팔은 링크 벡터를 차례로 이어 붙이는 기하 문제로 시작하지만, 속도와 힘을 다루는 순간 미분과 선형대수 문제가 된다. FK는 위치를 합성하고, Jacobian은 그 합성식을 관절각으로 미분한 국소 선형 근사다.",
      assumptions: [
        "2링크 예제는 평면 revolute joint이고 링크 길이는 양수다.",
        "q1은 base frame x축에서 첫 링크까지의 각도, q2는 첫 링크에서 둘째 링크까지의 상대각이다.",
        "동역학/제어를 제외한 운동학 계산에서는 링크 질량과 마찰을 무시한다.",
      ],
      details: [
        "로봇팔 이론은 frame 정의에서 시작한다. 모든 pose는 어느 frame에서 어느 frame으로 가는 변환인지 T_ab처럼 표기해야 FK, IK, Jacobian의 부호 오류를 줄일 수 있다.",
        "2링크 평면팔 FK는 각 링크의 회전 누적으로 구한다. 첫 링크 끝점은 q1, 말단은 q1+q2 방향을 사용하므로 x와 y 식의 두 번째 항이 항상 합각을 포함한다.",
        "IK는 목표점 거리 r이 |l1-l2|와 l1+l2 사이인지 먼저 검사한다. 그 다음 cosine law로 q2를 구하고 atan2 차이로 q1을 구한다.",
        "Jacobian determinant가 0에 가까우면 같은 말단속도를 만들기 위해 큰 관절속도가 필요해진다. 이 상태가 singularity이며 DLS나 joint limit 회피가 필요하다.",
      ],
      formulas: [
        {
          label: "2-link FK",
          expression: "x = l1 cos(q1) + l2 cos(q1 + q2), y = l1 sin(q1) + l2 sin(q1 + q2)",
          description: "관절각에서 말단 위치를 계산한다.",
        },
        {
          label: "Jacobian determinant",
          expression: "det(J) = l1 l2 sin(q2)",
          description: "0에 가까울수록 singularity에 가까워진다.",
        },
        {
          label: "DLS IK update",
          expression: "dq = J^T (J J^T + lambda^2 I)^-1 e",
          description: "pseudoinverse가 불안정한 영역에서 damping을 넣는다.",
        },
      ],
      derivation: [
        "각 링크 벡터를 base frame에 표현한다: p1 = [l1 cos q1, l1 sin q1].",
        "두 번째 링크 방향은 q1 + q2이므로 p2 = [l2 cos(q1+q2), l2 sin(q1+q2)].",
        "말단 위치 p = p1 + p2를 q1, q2로 편미분하면 Jacobian의 네 원소가 나온다.",
        "2x2 determinant를 전개하면 중간 항이 소거되어 l1 l2 sin(q2)가 남는다.",
      ],
      proof: [
        "R(q1)로 첫 링크 벡터 [l1, 0]^T를 회전시키면 p1=[l1 cos q1, l1 sin q1]^T이다.",
        "둘째 링크는 base 기준으로 q1+q2만큼 회전하므로 p2=[l2 cos(q1+q2), l2 sin(q1+q2)]^T이다.",
        "p=p1+p2를 q1, q2로 편미분하면 J의 각 열은 해당 관절이 말단 위치에 주는 순간 변화율이다.",
        "det(J)=(-l1 sin q1-l2 sin(q1+q2))*l2 cos(q1+q2)-(-l2 sin(q1+q2))*(l1 cos q1+l2 cos(q1+q2))를 정리하면 l1 l2 sin q2가 된다.",
      ],
      engineeringMeaning: [
        "det(J)가 작으면 말단 방향의 작은 움직임도 큰 관절속도를 요구하므로 제어 명령이 튀기 쉽다.",
        "MoveIt이나 ros2_control에서 joint limit, velocity limit, collision constraint가 중요한 이유가 여기서 나온다.",
      ],
      implementationNotes: [
        "FK 함수와 Jacobian 함수는 같은 좌표계/각도 convention을 공유해야 한다.",
        "수치미분 Jacobian과 해석 Jacobian을 비교하는 테스트를 반드시 둔다.",
        "IK solver는 target reachable check와 joint limit clamp를 먼저 넣고 DLS damping을 추가한다.",
      ],
      workedExample: {
        prompt: "l1=1.0, l2=0.7, q1=30도, q2=60도일 때 말단 위치와 det(J)를 구하라.",
        steps: [
          "q1+q2=90도이므로 cos(90)=0, sin(90)=1을 사용한다.",
          "x = 1*cos30 + 0.7*cos90 = 0.866",
          "y = 1*sin30 + 0.7*sin90 = 1.200",
          "det(J)=1*0.7*sin60=0.606",
        ],
        result: "p=(0.866, 1.200), det(J)=0.606으로 singularity에서 충분히 떨어져 있다.",
      },
    };
  }

  if (section.id.includes("mobile") || section.id.includes("planning") || section.id.includes("pure")) {
    return {
      ...common,
      intuition:
        "모바일 로봇은 작은 시간 동안의 body velocity를 world frame pose 변화로 계속 적분한다. localization은 그 적분의 drift를 센서 관측으로 줄이는 과정이고, planning/control은 현재 pose에서 목표까지 안전한 속도 명령을 고르는 과정이다.",
      assumptions: [
        "차동구동 예제는 바퀴 미끄럼이 없고 좌우 바퀴 반지름이 같다고 둔다.",
        "짧은 dt 동안 속도는 일정하다고 가정해 Euler integration을 쓴다.",
        "grid planning 예제는 cell cost가 균일하고 장애물 cell은 통과 불가능하다고 둔다.",
      ],
      details: [
        "모바일 로봇은 pose (x, y, theta)를 시간에 따라 적분한다. odom frame은 연속적이지만 drift가 있고, map frame은 global localization 보정이 들어갈 수 있다.",
        "Differential drive는 좌우 바퀴 속도 평균으로 선속도, 차이와 wheel base로 각속도를 만든다. 이 값이 작은 dt마다 누적되어 odometry가 된다.",
        "A*는 g-cost와 heuristic을 합친 f-cost가 낮은 노드를 확장한다. heuristic이 admissible하면 최단 경로성이 유지된다.",
        "Pure Pursuit는 로봇 좌표계의 lookahead target을 향해 곡률 kappa = 2y/Ld^2를 계산한다.",
      ],
      formulas: [
        {
          label: "Differential drive",
          expression: "v = (vr + vl) / 2, omega = (vr - vl) / b",
          description: "좌우 바퀴 속도에서 body twist를 계산한다.",
        },
        {
          label: "Odometry integration",
          expression: "x += v cos(theta) dt, y += v sin(theta) dt, theta += omega dt",
          description: "짧은 시간 간격에서 pose를 적분한다.",
        },
        {
          label: "A* score",
          expression: "f(n) = g(n) + h(n)",
          description: "이미 온 비용과 목표까지의 추정 비용을 합친다.",
        },
      ],
      derivation: [
        "바퀴 중심의 선속도는 두 바퀴 선속도의 평균이다.",
        "회전속도는 오른쪽과 왼쪽의 이동 거리 차이를 wheel base로 나눈 값이다.",
        "현재 yaw 기준으로 body x축 속도를 world frame으로 회전해 x/y에 더한다.",
        "로컬 플래너에서는 이 적분 모델을 여러 후보 trajectory에 적용해 collision과 cost를 비교한다.",
      ],
      proof: [
        "왼쪽/오른쪽 바퀴 이동거리를 각각 dl=vl dt, dr=vr dt라고 두면 중심 이동거리는 (dl+dr)/2이다.",
        "두 바퀴 이동거리 차이 dr-dl은 바퀴 간격 b를 반지름으로 하는 회전호 차이를 만들며 dtheta=(dr-dl)/b이다.",
        "body frame 전진속도 v를 world frame으로 회전하면 dx=v cos(theta)dt, dy=v sin(theta)dt가 된다.",
        "A*에서 h가 실제 남은 비용보다 크지 않으면 f=g+h가 최적 경로 후보를 과도하게 배제하지 않으므로 최단 경로성이 유지된다.",
      ],
      engineeringMeaning: [
        "odom은 부드럽지만 drift가 있고 map은 global correction으로 점프할 수 있어 controller에는 frame 선택이 중요하다.",
        "Pure Pursuit lookahead가 짧으면 빠르게 반응하지만 흔들리고, 길면 부드럽지만 코너를 크게 돈다.",
      ],
      implementationNotes: [
        "encoder tick, wheel radius, wheel base 단위를 로그에 남긴다.",
        "Nav2 튜닝은 planner/controller/costmap/BT를 분리해서 한 번에 하나씩 바꾼다.",
        "EKF는 covariance를 값으로만 외우지 말고 센서 신뢰도의 상대적 가중치로 해석한다.",
      ],
      workedExample: {
        prompt: "vl=0.4m/s, vr=0.8m/s, b=0.5m, theta=0, dt=1s일 때 pose 변화는?",
        steps: ["v=(0.8+0.4)/2=0.6", "omega=(0.8-0.4)/0.5=0.8", "x+=0.6*cos0*1=0.6", "y+=0"],
        result: "1초 뒤 근사 pose는 (0.6, 0, 0.8rad)이다.",
      },
    };
  }

  if (section.id.includes("ai")) {
    return {
      ...common,
      intuition:
        "AI 모델은 센서 입력을 숫자 텐서로 바꾸고, 학습된 함수가 그 텐서에서 의미 있는 출력을 내도록 하는 시스템이다. 로봇에서는 정확도뿐 아니라 지연, 입력 shape, 전처리 일치성, 실패 조건이 같은 비중으로 중요하다.",
      assumptions: [
        "classification metric은 positive class 하나를 기준으로 정의한다.",
        "전처리 예제는 uint8 RGB/BGR 이미지가 float tensor로 바뀐다고 가정한다.",
        "ONNX 배포에서는 학습 모델과 추론 runtime의 입력 shape와 dtype이 일치해야 한다.",
      ],
      details: [
        "AI 학습은 데이터 분할, 전처리, 모델, loss, metric이 하나의 계약처럼 맞아야 한다. 특히 로봇에서는 학습 전처리와 배포 전처리 불일치가 치명적이다.",
        "Confusion matrix는 positive/negative 예측의 성공과 실패를 분해한다. 정확도만 보면 class imbalance에서 성능을 과대평가할 수 있다.",
        "ONNX export는 학습 프레임워크와 배포 runtime 사이의 중간 표현이다. C++ 배포에서는 입력 shape, dtype, normalization, channel order를 고정해야 한다.",
      ],
      formulas: [
        { label: "Precision", expression: "TP / (TP + FP)", description: "positive라고 한 것 중 실제 positive 비율." },
        { label: "Recall", expression: "TP / (TP + FN)", description: "실제 positive 중 찾아낸 비율." },
        { label: "F1", expression: "2PR / (P + R)", description: "precision과 recall의 조화평균." },
      ],
      derivation: [
        "positive class 기준으로 TP, FP, FN, TN을 정의한다.",
        "정밀도는 예측 positive 집합의 순도를 본다.",
        "재현율은 실제 positive 집합의 회수율을 본다.",
        "두 값을 동시에 높이고 싶을 때 F1을 사용한다.",
      ],
      proof: [
        "precision은 예측 positive 집합 중 실제 positive의 비율이므로 분모가 TP+FP가 된다.",
        "recall은 실제 positive 집합 중 모델이 찾아낸 비율이므로 분모가 TP+FN이 된다.",
        "F1은 precision과 recall의 조화평균이므로 둘 중 하나가 낮으면 값이 크게 낮아진다.",
        "cross entropy는 정답 class 확률을 크게 만들수록 loss가 작아지는 음의 로그우도 형태다.",
      ],
      engineeringMeaning: [
        "로봇 카메라 추론에서는 false positive와 false negative의 위험이 다르므로 metric 선택이 안전성과 연결된다.",
        "ONNX export 뒤에는 Python 결과와 C++ Runtime 결과가 같은 입력에서 같은 출력을 내는지 비교해야 한다.",
      ],
      implementationNotes: [
        "resize, channel order, normalization mean/std, batch dimension을 명시한다.",
        "latency는 preprocessing, inference, postprocessing으로 나누어 기록한다.",
        "confusion matrix는 class별로 저장하고 dataset split 누수를 점검한다.",
      ],
      workedExample: {
        prompt: "TP=45, FP=5, FN=15일 때 precision, recall, F1을 구하라.",
        steps: ["precision=45/(45+5)=0.900", "recall=45/(45+15)=0.750", "F1=2*0.9*0.75/(0.9+0.75)=0.818"],
        result: "F1은 약 0.818이다.",
      },
    };
  }

  if (section.id.includes("llm")) {
    return {
      ...common,
      intuition:
        "LLM 시스템은 단일 prompt가 아니라 입력 문서, retrieval, context assembly, model call, output parser, evaluator가 이어진 pipeline이다. 좋은 하네스는 이 pipeline의 변경이 품질과 지연에 어떤 영향을 주는지 반복 측정한다.",
      assumptions: [
        "문서는 의미 단위 chunk로 나뉘고 각 chunk는 검색 가능한 표현을 갖는다.",
        "eval set은 입력, 기대 조건, 채점 기준을 포함한다.",
        "프롬프트 변경은 pass rate와 failure category로 비교한다.",
      ],
      details: [
        "프롬프트는 역할, 목표, 제약, 출력 형식을 분리해야 평가 가능한 시스템이 된다.",
        "컨텍스트 엔지니어링은 문서를 chunk로 나누고, 질문과 관련 있는 chunk만 검색해 prompt에 넣는 과정이다.",
        "하네스는 eval set, grader, trace, latency, regression 비교를 묶어 프롬프트 변경의 품질을 수치화한다.",
      ],
      formulas: [
        { label: "Cosine similarity", expression: "sim(a,b)=a·b/(||a||||b||)", description: "검색에서 query와 chunk의 방향 유사도를 잰다." },
        { label: "Pass rate", expression: "passed / total", description: "eval set에서 기준을 통과한 비율." },
      ],
      derivation: [
        "문서를 의미 단위로 chunking한다.",
        "query와 chunk를 같은 embedding 공간에 놓고 similarity를 계산한다.",
        "상위 k개 chunk를 prompt context에 넣는다.",
        "golden output 또는 grader로 결과를 평가하고 trace를 저장한다.",
      ],
      proof: [
        "cosine similarity는 벡터 크기보다 방향을 비교하므로 긴 문서와 짧은 query의 스케일 차이를 줄인다.",
        "top-k retrieval은 context window를 제한된 자원으로 보고 관련 chunk만 선택하는 근사 최적화다.",
        "eval pass rate는 특정 기준을 만족한 run의 비율이므로 regression 비교의 최소 지표가 된다.",
      ],
      engineeringMeaning: [
        "retrieval 품질이 낮으면 모델이 모르는 내용을 채워 넣기 쉬워 grounding이 약해진다.",
        "trace와 latency를 남기면 실패가 검색, 프롬프트, 모델, parser 중 어디서 생겼는지 분해할 수 있다.",
      ],
      implementationNotes: [
        "prompt template, retrieved chunk id, model config, output parser 결과를 JSONL로 남긴다.",
        "golden answer를 완전일치로만 보지 말고 필수 조건 pass/fail로 쪼갠다.",
      ],
      workedExample: {
        prompt: "20개 eval 중 17개 통과, 평균 latency 820ms이면 pass rate와 병목을 어떻게 기록할까?",
        steps: ["pass rate=17/20=0.85", "실패 3개를 failure taxonomy로 분류", "latency는 retrieval/model/postprocess로 나눠 trace에 기록"],
        result: "pass rate 85%, latency 820ms baseline으로 저장한다.",
      },
    };
  }

  return {
    ...common,
    intuition:
      "이 단원은 특정 알고리즘 하나보다 Physical AI 학습 절차 자체를 다룬다. 이론을 읽고 끝내지 않고, 수식 정의와 구현 입력/출력, 실험 로그까지 이어야 실제 역량으로 남는다.",
    details: [
      ...section.theory,
      "이 단원은 PDF의 기초역량 로드맵을 실제 구현과 평가로 연결하기 위한 학습 단위다.",
      "공식 문서의 개념은 API 사용법보다 먼저 시스템 경계, 입력/출력, 실패 조건을 이해하는 데 활용한다.",
    ],
    formulas: [
      {
        label: "학습 루프",
        expression: "theory -> derivation -> code -> simulation -> log -> evaluation",
        description: "PDF가 반복해서 강조하는 Physical AI 학습 절차.",
      },
    ],
    derivation: [
      "개념을 수식 또는 상태 변수로 정의한다.",
      "작은 입력 예제로 손계산한다.",
      "Python으로 검산하고 C++ 구조로 옮긴다.",
      "ROS 2 또는 브라우저 시뮬레이션으로 입출력 변화를 확인한다.",
    ],
    proof: [
      "정의가 없으면 입력과 출력이 흔들리고, 입력/출력이 없으면 구현 테스트를 만들 수 없다.",
      "테스트가 없으면 실험 결과가 우연인지 개선인지 비교할 수 없다.",
      "따라서 학습 루프는 이론에서 평가까지 닫힌 순환이어야 한다.",
    ],
    engineeringMeaning: [
      "프로젝트가 커질수록 작은 수식/코드/로그 단위가 재사용 가능한 디버깅 자산이 된다.",
      "반복 실험과 기록은 JetRover 실기와 시뮬레이터 결과 차이를 설명하는 기반이다.",
    ],
    implementationNotes: [
      "각 섹션마다 최소 하나의 수식, 하나의 코드 함수, 하나의 metric을 남긴다.",
      "공식 문서를 읽을 때 명령어보다 개념, 메시지 타입, frame, parameter를 먼저 표시한다.",
    ],
    workedExample: {
      prompt: "새 알고리즘을 공부할 때 최소 산출물을 정의하라.",
      steps: ["핵심 공식 1개", "손계산 예제 1개", "Python 검산 1개", "C++ 함수 skeleton 1개", "로그 metric 1개"],
      result: "이 다섯 가지가 있어야 다음 실험에서 비교 가능하다.",
    },
  };
};

const legacyBulletToUnit = (section: LegacyLessonSection, bullet: string, index: number): TheoryUnit => ({
  id: `${section.id}-theory-${index + 1}`,
  title: `${section.title} · 개념 ${index + 1}`,
  summary: bullet,
  intuition:
    "이 항목은 이름만 알아서는 부족하다. 어떤 상태변수, 좌표계, 확률, 제어입력, 평가 metric과 연결되는지까지 잡아야 코드로 옮길 수 있다.",
  assumptions: [
    "PDF의 항목은 ROS 2 Humble + Ubuntu 22.04 학습 흐름을 기준으로 해석한다.",
    "수식은 작은 예제로 손계산하고, 구현은 Python 검산 뒤 C++ 또는 ROS 2 구조로 옮긴다.",
  ],
  details: [
    bullet,
    "정의: 이 개념은 시스템에서 어떤 입력을 받아 어떤 출력을 내는지 설명하는 이름이다. 예를 들어 좌표변환은 frame A의 점을 frame B에서 표현하게 하고, 필터는 noisy measurement를 더 안정적인 state estimate로 바꾼다.",
    "직관: 좋은 이론 이해는 '왜 이 공식이 필요한가'를 말할 수 있어야 한다. 로봇팔에서는 말단 위치를 알기 위해 FK가 필요하고, 모바일 로봇에서는 다음 pose를 예측하기 위해 운동학 적분이 필요하다.",
    "수식화: 모든 항목은 최소한 변수, 단위, 관계식 하나로 압축해야 한다. 변수가 없으면 구현 파라미터가 생기지 않고, 단위가 없으면 실기에서 값이 틀어진다.",
    "구현 연결: C++에서는 타입과 함수 경계를 명확히 하고, Python에서는 샘플 입력을 빠르게 바꿔 그래프로 확인한다. ROS 2에서는 topic, frame, timestamp, QoS까지 같은 계약에 포함된다.",
    "검증: 결과가 맞는지는 정답 숫자 하나보다 오차, 조건 변화, 실패 케이스를 함께 봐야 한다. 그래서 로그와 metric이 이론 공부의 일부다.",
  ],
  formulas: [
    {
      label: "일반 상태-출력 관점",
      expression: "output = f(state, input, parameter, noise, time)",
      description: "Physical AI 개념을 코드로 옮길 때 최소한 확인해야 하는 관계.",
    },
  ],
  derivation: [
    "문제에서 상태변수 x와 입력 u를 정한다.",
    "좌표계, 시간, 노이즈, 파라미터 중 어떤 것이 식에 들어가는지 표시한다.",
    "작은 숫자 예제를 넣어 손계산으로 출력 y를 구한다.",
    "동일한 계산을 Python/C++ 함수로 작성하고 오차를 비교한다.",
  ],
  proof: [
    "입력과 출력의 단위가 맞으면 식의 차원이 일관된다.",
    "작은 예제에서 손계산과 코드 결과가 일치하면 구현의 첫 번째 신뢰 근거가 생긴다.",
    "조건을 바꿨을 때 결과 변화가 직관과 맞으면 이론 모델이 시스템을 설명하고 있다고 볼 수 있다.",
  ],
  engineeringMeaning: [
    "이론 항목 하나를 실험 가능한 단위로 바꾸면 나중에 ROS 2 노드, 시뮬레이터, JetRover 로그와 연결할 수 있다.",
    "반대로 이름만 암기하면 디버깅 시 어떤 값을 찍어야 하는지 알기 어렵다.",
  ],
  implementationNotes: [
    "함수 signature에 단위가 드러나게 이름을 짓는다.",
    "입력 파라미터는 YAML/JSON 또는 UI slider와 연결할 수 있게 분리한다.",
    "출력은 숫자, 그래프, 로그 중 최소 하나로 확인한다.",
  ],
  commonMistakes: ["용어를 외우고 구현 입력/출력 형태를 확인하지 않는다.", "단위와 frame을 생략해 코드 결과를 해석하지 못한다."],
  figures: graphIdsBySection(section.id)
    .slice(0, 1)
    .map(figureByGraphId),
  graphExplanations: graphIdsBySection(section.id)
    .slice(0, 1)
    .map((id) => figureByGraphId(id))
    .map((figure) => `${figure.title}: ${figure.explanation}`),
  sourceIds: sourceIdsBySection(section.id),
});

const advancedQuestionsForSection = (section: LegacyLessonSection): QuizQuestion[] => {
  const generic: QuizQuestion[] = [
    {
      id: `${section.id}-formula-state-output`,
      type: "formulaBlank",
      difficulty: "기초",
      prompt: "Physical AI 개념을 코드로 옮길 때 일반 관계식 output=f(____, input, parameter, noise, time)의 빈칸을 채워라.",
      answer: "state",
      acceptedExpressions: ["state", "x", "상태", "상태변수"],
      formulaSymbols: ["x", "u", "f()", "noise", "t"],
      hint: "시스템이 현재 무엇을 기억하고 있는지를 나타내는 변수다.",
      points: 2,
      explanation: "상태변수 state가 있어야 입력과 파라미터가 출력으로 바뀌는 관계를 정의할 수 있다.",
    },
    {
      id: `${section.id}-derive-loop`,
      type: "derivationStep",
      difficulty: "유도",
      prompt: "이론을 구현 가능한 지식으로 바꾸는 최소 절차 3단계를 쓰라.",
      answer: "정의, 손계산, 구현",
      expectedSteps: ["정의", "손계산", "구현"],
      hint: "PDF의 Python 검산 -> C++ 구현 -> ROS 2 연결 흐름을 떠올려라.",
      points: 3,
      explanation: "정의와 손계산 없이 구현하면 입력/출력 계약이 흔들리고, 구현 없이 이론만 보면 실험 역량이 생기지 않는다.",
    },
    {
      id: `${section.id}-formula-dimension`,
      type: "formulaBlank",
      difficulty: "전문",
      prompt: "공학 계산에서 식의 좌변과 우변은 같은 ____를 가져야 한다.",
      answer: "단위",
      acceptedExpressions: ["단위", "unit", "dimension", "차원"],
      formulaSymbols: ["m", "s", "rad", "N", "kg"],
      hint: "m와 rad/s처럼 값의 의미를 고정하는 것.",
      points: 2,
      explanation: "단위/차원 일관성은 수식과 코드 파라미터 오류를 초기에 잡는 가장 강한 검사다.",
    },
    {
      id: `${section.id}-trace-log-contract`,
      type: "codeTrace",
      difficulty: "전문",
      prompt: "아래 코드가 실험 로그에 반드시 남기는 세 값을 쓰라.",
      answer: "scenario, parameter, metric",
      codeSnippet: `const row = {
  scenario: "baseline",
  parameter: "lookahead=0.8",
  metric: "tracking_error=0.18",
};`,
      expectedTrace: "scenario parameter metric",
      hint: "어떤 조건에서, 무엇을 바꾸고, 무엇을 측정했는지다.",
      points: 2,
      explanation: "재현 가능한 실험 로그는 scenario, parameter, metric을 함께 가져야 한다.",
    },
  ];

  if (section.id.includes("manipulator")) {
    return [
      {
        id: `${section.id}-numeric-detj`,
        type: "numeric",
        difficulty: "계산",
        prompt: "l1=1.0, l2=0.7, q2=30도일 때 2링크 평면팔 Jacobian determinant det(J)=l1*l2*sin(q2)를 계산하라.",
        answer: "0.35",
        numericAnswer: 0.35,
        tolerance: 0.01,
        hint: "sin(30도)=0.5이다.",
        points: 3,
        explanation: "sin(30도)=0.5이므로 det(J)=1.0*0.7*0.5=0.35이다.",
      },
      {
        id: `${section.id}-derive-fk`,
        type: "derivationStep",
        difficulty: "유도",
        prompt: "2링크 FK x식을 유도하는 핵심 단계를 순서대로 쓰라.",
        answer: "p1, p2, sum",
        expectedSteps: ["p1 = l1 cos(q1)", "p2 = l2 cos(q1+q2)", "x = p1 + p2"],
        hint: "각 링크 벡터의 x성분을 base frame에서 더한다.",
        points: 4,
        explanation: "두 링크 벡터를 base frame에 표현하고 x 성분을 더하면 된다.",
      },
      {
        id: `${section.id}-formula-dls`,
        type: "formulaBlank",
        difficulty: "전문",
        prompt: "DLS IK update에서 dq = J^T (J J^T + ____ I)^-1 e의 빈칸을 채워라.",
        answer: "lambda^2",
        acceptedExpressions: ["lambda^2", "λ^2", "lambda squared", "람다제곱"],
        formulaSymbols: ["λ", "^2", "J(q)", "I", "e"],
        hint: "singularity 근처에서 damping을 만드는 양수 항이다.",
        points: 3,
        explanation: "DLS는 λ^2 I를 더해 JJ^T가 특이해질 때 역행렬 계산을 안정화한다.",
      },
      {
        id: `${section.id}-numeric-fk-y`,
        type: "numeric",
        difficulty: "계산",
        prompt: "l1=1, l2=1, q1=0도, q2=90도일 때 y=l1*sin(q1)+l2*sin(q1+q2)를 계산하라.",
        answer: "1",
        numericAnswer: 1,
        tolerance: 0.001,
        hint: "sin(0)=0, sin(90)=1이다.",
        points: 2,
        explanation: "y=1*0+1*1=1이다.",
      },
      {
        id: `${section.id}-proof-singularity`,
        type: "derivationStep",
        difficulty: "전문",
        prompt: "det(J)=l1*l2*sin(q2)가 q2=0에서 singularity가 되는 이유를 단계적으로 쓰라.",
        answer: "sin0=0, detJ=0, rank loss",
        expectedSteps: ["sin", "det", "rank"],
        hint: "determinant가 0이면 2x2 Jacobian이 full rank가 아니다.",
        points: 4,
        explanation: "q2=0이면 sin(q2)=0이고 det(J)=0이 되어 Jacobian rank가 떨어진다.",
      },
      ...generic,
    ];
  }
  if (section.id.includes("mobile") || section.id.includes("planning") || section.id.includes("pure")) {
    return [
      {
        id: `${section.id}-numeric-omega`,
        type: "numeric",
        difficulty: "계산",
        prompt: "vl=0.2m/s, vr=0.6m/s, wheel_base=0.5m일 때 omega=(vr-vl)/b를 계산하라.",
        answer: "0.8",
        numericAnswer: 0.8,
        tolerance: 0.001,
        hint: "오른쪽과 왼쪽 속도 차이를 바퀴 간격으로 나눈다.",
        points: 3,
        explanation: "(0.6-0.2)/0.5=0.8 rad/s이다.",
      },
      {
        id: `${section.id}-formula-astar`,
        type: "formulaBlank",
        difficulty: "기초",
        prompt: "A*의 평가 함수는 f(n)=____+h(n)이다.",
        answer: "g(n)",
        acceptedExpressions: ["g(n)", "g", "cost so far", "누적비용"],
        formulaSymbols: ["g(n)", "h(n)", "f(n)"],
        hint: "시작점에서 현재 노드까지 이미 지불한 비용이다.",
        points: 2,
        explanation: "g(n)은 시작점에서 현재 노드까지의 누적 비용이다.",
      },
      {
        id: `${section.id}-numeric-pure-curvature`,
        type: "numeric",
        difficulty: "계산",
        prompt: "Pure Pursuit에서 로봇 좌표계 target y=0.4m, Ld=1.0m일 때 curvature=2y/Ld^2를 계산하라.",
        answer: "0.8",
        numericAnswer: 0.8,
        tolerance: 0.001,
        hint: "2*0.4/1^2.",
        points: 3,
        explanation: "curvature=2*0.4/1.0=0.8이다.",
      },
      {
        id: `${section.id}-formula-ekf`,
        type: "formulaBlank",
        difficulty: "전문",
        prompt: "EKF covariance prediction의 대표식은 P' = F P F^T + ____ 이다.",
        answer: "Q",
        acceptedExpressions: ["q", "process noise", "프로세스 노이즈", "Q"],
        formulaSymbols: ["P", "F", "Q", "Σ"],
        hint: "모델 예측 과정에서 추가되는 불확실성이다.",
        points: 3,
        explanation: "Q는 process noise covariance로 모델 예측의 불확실성을 나타낸다.",
      },
      {
        id: `${section.id}-proof-admissible`,
        type: "derivationStep",
        difficulty: "유도",
        prompt: "A* heuristic이 admissible할 때 최단 경로성을 유지하는 이유의 핵심 단계를 쓰라.",
        answer: "h<=true cost, no overestimate, optimal",
        expectedSteps: ["h", "over", "optimal"],
        hint: "남은 비용을 실제보다 크게 잡지 않는다는 조건이다.",
        points: 4,
        explanation: "h가 실제 비용을 과대평가하지 않으면 최적 경로 후보를 f-cost에서 부당하게 밀어내지 않는다.",
      },
      ...generic,
    ];
  }
  if (section.id.includes("ai")) {
    return [
      {
        id: `${section.id}-numeric-f1`,
        type: "numeric",
        difficulty: "계산",
        prompt: "precision=0.8, recall=0.5일 때 F1=2PR/(P+R)을 계산하라.",
        answer: "0.615",
        numericAnswer: 0.615,
        tolerance: 0.01,
        hint: "분자는 2*0.8*0.5, 분모는 1.3이다.",
        points: 3,
        explanation: "2*0.8*0.5/(0.8+0.5)=0.615이다.",
      },
      {
        id: `${section.id}-trace-preprocess`,
        type: "codeTrace",
        difficulty: "전문",
        prompt: "image.convertTo(float_img, CV_32FC3, 1.0/255.0)의 출력 범위를 쓰라.",
        answer: "0~1",
        codeSnippet: "resized.convertTo(float_img, CV_32FC3, 1.0 / 255.0);",
        expectedTrace: "uint8 0~255 pixel values become float 0~1 values",
        hint: "uint8 최댓값 255에 1/255를 곱한다.",
        points: 2,
        explanation: "1/255 스케일링은 uint8 픽셀을 모델 입력용 float 범위로 바꾼다.",
      },
      {
        id: `${section.id}-formula-cross-entropy`,
        type: "formulaBlank",
        difficulty: "전문",
        prompt: "one-hot 정답 y와 예측확률 p에 대한 cross entropy는 L=-Σ y_i ____ p_i 이다.",
        answer: "log",
        acceptedExpressions: ["log", "ln", "로그"],
        formulaSymbols: ["Σ", "log()", "p_i", "y_i"],
        hint: "확률이 작을 때 loss를 크게 만드는 함수.",
        points: 3,
        explanation: "cross entropy는 정답 class 확률의 음의 로그우도다.",
      },
      {
        id: `${section.id}-numeric-precision`,
        type: "numeric",
        difficulty: "계산",
        prompt: "TP=18, FP=6일 때 precision=TP/(TP+FP)를 계산하라.",
        answer: "0.75",
        numericAnswer: 0.75,
        tolerance: 0.001,
        hint: "18/(18+6).",
        points: 2,
        explanation: "precision=18/24=0.75이다.",
      },
      {
        id: `${section.id}-derive-onnx-contract`,
        type: "derivationStep",
        difficulty: "유도",
        prompt: "학습 PyTorch 모델과 ONNX Runtime C++ 추론 결과를 맞추기 위한 계약 3가지를 쓰라.",
        answer: "shape, dtype, normalization",
        expectedSteps: ["shape", "dtype", "normal"],
        hint: "입력 텐서의 모양, 자료형, 전처리.",
        points: 3,
        explanation: "shape, dtype, normalization/channel order가 다르면 같은 모델도 다른 출력을 낼 수 있다.",
      },
      ...generic,
    ];
  }
  return [
    {
      id: `${section.id}-formula-loop`,
      type: "formulaBlank",
      difficulty: "기초",
      prompt: "PDF의 추천 학습 루프는 Python 검산 -> C++ 구현 -> ROS 2 연결 -> ____ 기록이다.",
      answer: "로그",
      acceptedExpressions: ["로그", "log", "logging", "실험 로그"],
      formulaSymbols: ["log", "metric", "CSV", "rosbag2"],
      hint: "재현 가능한 실험을 위해 남기는 기록이다.",
      points: 2,
      explanation: "실험은 재현 가능해야 하므로 로그와 파라미터 기록이 핵심이다.",
    },
    {
      id: `${section.id}-numeric-passrate`,
      type: "numeric",
      difficulty: "계산",
      prompt: "20번 실험 중 15번 성공했다. pass rate=success/total을 계산하라.",
      answer: "0.75",
      numericAnswer: 0.75,
      tolerance: 0.001,
      hint: "15/20.",
      points: 2,
      explanation: "15/20=0.75이다.",
    },
    {
      id: `${section.id}-formula-latency`,
      type: "formulaBlank",
      difficulty: "전문",
      prompt: "loop jitter는 실제 period와 목표 period의 ____를 반복 측정해 본다.",
      answer: "차이",
      acceptedExpressions: ["차이", "difference", "error", "편차"],
      formulaSymbols: ["dt", "target", "error"],
      hint: "target period에서 얼마나 벗어났는지.",
      points: 2,
      explanation: "jitter는 주기 흔들림이므로 실제 period와 목표 period의 편차를 본다.",
    },
    {
      id: `${section.id}-derive-eval`,
      type: "derivationStep",
      difficulty: "유도",
      prompt: "반복 실험 평가표를 만들 때 필요한 3요소를 쓰라.",
      answer: "scenario, parameter, metric",
      expectedSteps: ["scenario", "parameter", "metric"],
      hint: "어떤 조건에서, 무엇을 바꿨고, 무엇을 측정했는지.",
      points: 3,
      explanation: "scenario, parameter, metric이 있어야 재현 가능한 비교가 된다.",
    },
    ...generic,
  ];
};

type MicroTopic = {
  id: string;
  title: string;
  focus: string;
  graphIds?: TheoryGraphId[];
  executableLabId?: ExecutableLabId;
};

const microTopicsBySection = (section: LessonSection): MicroTopic[] => {
  const topics: Record<string, MicroTopic[]> = {
    "overview-core": [
      {
        id: "concept-map",
        title: "Physical AI 6축 개념 지도",
        focus: "수학, 로봇, 센서, 계획, AI, ROS 2 시스템화를 하나의 의존성 그래프로 읽는다.",
        graphIds: ["state-machine"],
        executableLabId: "latency-stats",
      },
      {
        id: "capability-criteria",
        title: "기초역량 판정 기준",
        focus: "설명 가능한 이론, 손계산, 코드 구현, 로그 평가를 같은 기준으로 묶는다.",
        graphIds: ["state-machine", "gradient-descent"],
        executableLabId: "latency-stats",
      },
    ],
    "math-foundations": [
      {
        id: "linear-algebra-transforms",
        title: "선형대수와 좌표변환",
        focus: "벡터, 내적, 행렬곱, 회전행렬, homogeneous transform을 frame 변환 문제로 연결한다.",
        graphIds: ["rotation-basis"],
        executableLabId: "rotation-2d",
      },
      {
        id: "algebra-functions-graphs",
        title: "대수, 함수, 그래프",
        focus: "변수, 함수, 직선/곡선 그래프를 로봇 상태와 센서 모델의 입력-출력 관계로 읽는다.",
        graphIds: ["gradient-descent"],
        executableLabId: "rosbag-metric-analyzer",
      },
      {
        id: "trigonometry-unit-circle",
        title: "삼각함수와 unit circle",
        focus: "sin, cos, tan, atan2가 회전, heading, bearing, polar coordinate에 쓰이는 방식을 익힌다.",
        graphIds: ["rotation-basis"],
        executableLabId: "unit-circle-trig",
      },
      {
        id: "vectors-dot-cross",
        title: "벡터, 내적, 외적",
        focus: "벡터 크기, 방향, projection, normal vector를 로봇 기하와 충돌 판정으로 연결한다.",
        graphIds: ["rotation-basis"],
        executableLabId: "homogeneous-transform",
      },
      {
        id: "homogeneous-transform-inverse",
        title: "Homogeneous transform과 역변환",
        focus: "R과 t를 4x4 행렬로 합치고 T^-1, transform chain, point/vector 차이를 증명한다.",
        graphIds: ["rotation-basis"],
        executableLabId: "homogeneous-transform",
      },
      {
        id: "svd-pseudoinverse",
        title: "SVD와 pseudoinverse",
        focus: "rank, singular value, condition number, damped inverse가 IK와 least squares에 주는 의미를 본다.",
        graphIds: ["gradient-descent"],
        executableLabId: "svd-pseudoinverse",
      },
      {
        id: "differential-jacobian",
        title: "미분과 Jacobian",
        focus: "편미분, chain rule, gradient, Jacobian을 속도기구학과 최적화의 언어로 해석한다.",
        graphIds: ["gradient-descent", "rotation-basis"],
        executableLabId: "two-link-fk",
      },
      {
        id: "single-variable-calculus",
        title: "단일변수 미분/적분",
        focus: "미분을 순간 변화율, 적분을 누적량으로 해석해 속도-위치, error-area 관계를 이해한다.",
        graphIds: ["gradient-descent"],
        executableLabId: "pid-response",
      },
      {
        id: "multivariable-gradient",
        title: "다변수 미적분과 gradient",
        focus: "partial derivative, gradient, tangent plane을 loss 최적화와 센서 모델 선형화에 연결한다.",
        graphIds: ["gradient-descent"],
        executableLabId: "svd-pseudoinverse",
      },
      {
        id: "differential-equations-state-space",
        title: "미분방정식과 state-space",
        focus: "x_dot=f(x,u), 이산화, 안정성 직관을 제어주기와 시뮬레이션 업데이트로 연결한다.",
        graphIds: ["state-machine", "trajectory-polynomial"],
        executableLabId: "pid-response",
      },
      {
        id: "probability-kalman",
        title: "확률, Gaussian, Kalman Filter",
        focus: "평균, 분산, 공분산, likelihood, Bayes update가 noisy sensor를 추정값으로 바꾸는 과정을 본다.",
        graphIds: ["gaussian-kf", "covariance-ellipse"],
        executableLabId: "kalman-1d",
      },
      {
        id: "statistics-bayes-covariance",
        title: "통계, Bayes, covariance",
        focus: "조건부확률, Bayes rule, covariance matrix를 센서 신뢰도와 fusion weight로 해석한다.",
        graphIds: ["gaussian-kf", "covariance-ellipse"],
        executableLabId: "ekf-2d",
      },
      {
        id: "optimization-integration",
        title: "최적화와 수치적분",
        focus: "gradient descent, Gauss-Newton, LM, Euler/RK 적분이 로봇 상태 업데이트와 학습을 어떻게 지탱하는지 본다.",
        graphIds: ["gradient-descent", "trajectory-polynomial"],
        executableLabId: "rotation-2d",
      },
      {
        id: "numerical-methods-stability",
        title: "수치해석과 안정성",
        focus: "floating point, conditioning, step size, Euler/RK error가 로봇 시뮬레이션과 제어에 미치는 영향을 본다.",
        graphIds: ["gradient-descent", "trajectory-polynomial"],
        executableLabId: "pid-response",
      },
    ],
    "cpp-python-ros2": [
      {
        id: "cpp-structure",
        title: "C++ 구조화와 CMake",
        focus: "타입, 함수 경계, Eigen/OpenCV 링크, timer loop를 재사용 가능한 모듈로 만든다.",
        executableLabId: "latency-stats",
      },
      {
        id: "cmake-package-dependencies",
        title: "CMake와 package dependency",
        focus: "ament_cmake, package.xml, target_link_libraries, find_package가 빌드 그래프를 만드는 방식을 익힌다.",
        graphIds: ["state-machine"],
        executableLabId: "rosbag-metric-analyzer",
      },
      {
        id: "eigen-opencv-bindings",
        title: "Eigen/OpenCV C++ 기초",
        focus: "Eigen 행렬과 OpenCV Mat을 알고리즘 함수의 입력/출력 타입으로 안정적으로 사용한다.",
        graphIds: ["rotation-basis"],
        executableLabId: "homogeneous-transform",
      },
      {
        id: "python-validation",
        title: "Python 검산과 그래프",
        focus: "NumPy, pandas, matplotlib로 작은 수치 예제를 빠르게 검산하고 시각화한다.",
        graphIds: ["gradient-descent"],
        executableLabId: "kalman-1d",
      },
      {
        id: "numpy-scipy-validation",
        title: "NumPy/SciPy 수치 검산",
        focus: "array shape, broadcasting, least squares, optimize 결과를 C++ 구현 전 기준값으로 만든다.",
        graphIds: ["gradient-descent"],
        executableLabId: "svd-pseudoinverse",
      },
      {
        id: "ros2-system",
        title: "ROS 2 노드, 토픽, tf2",
        focus: "package, launch, topic, service, action, tf2, params, QoS를 시스템 계약으로 이해한다.",
        graphIds: ["state-machine"],
        executableLabId: "latency-stats",
      },
      {
        id: "ros2-pubsub-cpp-python",
        title: "ROS 2 pub/sub C++와 Python",
        focus: "rclcpp/rclpy publisher/subscriber의 callback, queue, message 타입을 비교한다.",
        graphIds: ["state-machine"],
        executableLabId: "tf-tree-latency",
      },
      {
        id: "ros2-parameters-launch",
        title: "ROS 2 parameter와 launch",
        focus: "YAML parameter, launch argument, namespace를 실험 조건 관리 도구로 사용한다.",
        graphIds: ["state-machine"],
        executableLabId: "rosbag-metric-analyzer",
      },
      {
        id: "ros2-qos-executor-callback",
        title: "QoS, executor, callback group",
        focus: "QoS mismatch, blocking callback, executor thread가 데이터 손실과 latency를 만드는 과정을 분석한다.",
        graphIds: ["state-machine"],
        executableLabId: "tf-tree-latency",
      },
      {
        id: "ros2-actions-services",
        title: "Service와 Action",
        focus: "짧은 요청/응답 service와 장기 작업 action의 goal-feedback-result 구조를 구분한다.",
        graphIds: ["state-machine"],
        executableLabId: "latency-stats",
      },
      {
        id: "tf2-frames-time",
        title: "tf2 frame과 시간",
        focus: "transform tree, timestamp, lookup timeout이 perception/planning/control 연결에 주는 영향을 본다.",
        graphIds: ["state-machine", "rotation-basis"],
        executableLabId: "tf-tree-latency",
      },
      {
        id: "experiment-logging",
        title: "실험 기록과 재현성",
        focus: "CSV, rosbag2, Foxglove, Markdown, Git으로 파라미터와 metric을 남긴다.",
        graphIds: ["state-machine", "gradient-descent"],
        executableLabId: "latency-stats",
      },
      {
        id: "rosbag-foxglove-plotjuggler",
        title: "rosbag2, Foxglove, PlotJuggler",
        focus: "입력 rosbag, time-series plot, failure replay를 반복 평가와 오답노트처럼 관리한다.",
        graphIds: ["gradient-descent", "state-machine"],
        executableLabId: "rosbag-metric-analyzer",
      },
    ],
    "manipulator-kinematics": [
      {
        id: "pose-representation",
        title: "자세표현과 frame",
        focus: "rotation matrix, Euler, axis-angle, quaternion, transform의 장단점과 singularity를 비교한다.",
        graphIds: ["rotation-basis"],
        executableLabId: "rotation-2d",
      },
      {
        id: "so3-se3-lie-groups",
        title: "SO(3), SE(3), Lie group 직관",
        focus: "회전/강체변환을 행렬군으로 보고 exp/log map이 작은 twist와 pose를 연결하는 방식을 이해한다.",
        graphIds: ["rotation-basis"],
        executableLabId: "homogeneous-transform",
      },
      {
        id: "screw-axis-twist",
        title: "Screw axis와 twist",
        focus: "회전축, 선속도, angular velocity를 screw coordinate로 묶어 PoE FK의 재료로 만든다.",
        graphIds: ["rotation-basis"],
        executableLabId: "homogeneous-transform",
      },
      {
        id: "dh-poe",
        title: "DH와 PoE 표기",
        focus: "링크 체인 FK를 DH parameter와 Product of Exponentials 관점에서 서로 대응시킨다.",
        graphIds: ["rotation-basis"],
        executableLabId: "two-link-fk",
      },
      {
        id: "dh-table-construction",
        title: "DH table 작성법",
        focus: "a, alpha, d, theta를 frame assignment 규칙에 따라 채우고 transform chain을 만든다.",
        graphIds: ["rotation-basis"],
        executableLabId: "homogeneous-transform",
      },
      {
        id: "forward-kinematics",
        title: "Forward Kinematics 행렬곱",
        focus: "관절각에서 end-effector pose를 구하는 FK 식을 행렬곱과 벡터합으로 유도한다.",
        graphIds: ["rotation-basis"],
        executableLabId: "two-link-fk",
      },
      {
        id: "fk-unit-tests",
        title: "FK unit test와 frame 검증",
        focus: "T*T^-1, zero pose, symmetric pose, finite difference를 이용해 FK 코드의 frame 오류를 잡는다.",
        graphIds: ["rotation-basis"],
        executableLabId: "homogeneous-transform",
      },
      {
        id: "inverse-kinematics",
        title: "Inverse Kinematics 해석/수치해",
        focus: "2-link cosine law, pseudoinverse, DLS, joint limit이 IK 안정성에 주는 영향을 본다.",
        graphIds: ["rotation-basis", "trajectory-polynomial"],
        executableLabId: "two-link-fk",
      },
      {
        id: "analytic-ik-cosine-law",
        title: "해석 IK와 cosine law",
        focus: "reachable workspace, elbow-up/down, atan2 차이로 2-link IK 해를 직접 유도한다.",
        graphIds: ["rotation-basis"],
        executableLabId: "two-link-fk",
      },
      {
        id: "numerical-ik-dls",
        title: "수치 IK와 DLS",
        focus: "J^+와 damped least squares update를 비교하고 singularity 근처 안정성을 본다.",
        graphIds: ["gradient-descent", "trajectory-polynomial"],
        executableLabId: "svd-pseudoinverse",
      },
      {
        id: "jacobian-singularity",
        title: "Jacobian, 특이점, manipulability",
        focus: "xdot=Jqdot, tau=J^TF, det(J), rank loss, manipulability를 계산하고 시각화한다.",
        graphIds: ["rotation-basis", "trajectory-polynomial"],
        executableLabId: "two-link-fk",
      },
      {
        id: "manipulability-ellipsoid",
        title: "Manipulability ellipsoid",
        focus: "J J^T의 eigenvalue가 말단속도 가능 방향과 크기를 어떻게 표현하는지 해석한다.",
        graphIds: ["covariance-ellipse", "trajectory-polynomial"],
        executableLabId: "svd-pseudoinverse",
      },
    ],
    "manipulator-dynamics-control": [
      {
        id: "rigid-body-dynamics",
        title: "동역학 M, C, g",
        focus: "관절 토크와 가속도를 M(q), C(q,qdot), g(q) 구조로 읽는다.",
        graphIds: ["trajectory-polynomial"],
        executableLabId: "two-link-fk",
      },
      {
        id: "energy-lagrange-dynamics",
        title: "에너지와 Lagrange 동역학",
        focus: "운동에너지, 위치에너지, Lagrange equation에서 M, C, g 구조가 나오는 흐름을 이해한다.",
        graphIds: ["trajectory-polynomial"],
        executableLabId: "pid-response",
      },
      {
        id: "trajectory-polynomial",
        title: "Cubic/Quintic trajectory",
        focus: "경계조건에서 cubic/quintic polynomial 계수를 유도하고 속도/가속도 연속성을 본다.",
        graphIds: ["trajectory-polynomial"],
        executableLabId: "latency-stats",
      },
      {
        id: "time-scaling-and-limits",
        title: "Time scaling과 제한",
        focus: "velocity/acceleration/jerk limit을 만족하도록 trajectory duration과 scaling을 조정한다.",
        graphIds: ["trajectory-polynomial"],
        executableLabId: "pid-response",
      },
      {
        id: "controller-design",
        title: "PD, 중력보상, computed torque",
        focus: "feedback, feedforward, saturation이 실제 관절 추종 안정성에 어떤 의미를 갖는지 본다.",
        graphIds: ["trajectory-polynomial", "state-machine"],
        executableLabId: "latency-stats",
      },
      {
        id: "computed-torque-stability",
        title: "Computed torque와 안정성",
        focus: "모델 기반 feedforward로 error dynamics를 선형화하고 gain 선택이 수렴에 미치는 영향을 본다.",
        graphIds: ["trajectory-polynomial", "gradient-descent"],
        executableLabId: "pid-response",
      },
      {
        id: "moveit-ros2-control",
        title: "URDF, MoveIt 2, ros2_control",
        focus: "URDF/tf/joint state/controller manager/planning pipeline을 로봇팔 시스템으로 연결한다.",
        graphIds: ["state-machine"],
        executableLabId: "two-link-fk",
      },
      {
        id: "planning-scene-collision",
        title: "Planning scene과 collision object",
        focus: "MoveIt planning scene, attached object, collision matrix가 planning timeout과 실패를 만드는 과정을 본다.",
        graphIds: ["state-machine"],
        executableLabId: "tf-tree-latency",
      },
      {
        id: "ros2-control-hardware-interface",
        title: "ros2_control hardware interface",
        focus: "command/state interface, controller manager, update rate가 실제 joint command로 연결되는 구조를 익힌다.",
        graphIds: ["state-machine"],
        executableLabId: "latency-stats",
      },
    ],
    "mobile-localization": [
      {
        id: "kinematics-odometry",
        title: "차동구동 운동학과 odometry",
        focus: "vl, vr, wheel base에서 v, omega를 계산하고 pose를 시간 적분한다.",
        graphIds: ["covariance-ellipse"],
        executableLabId: "diff-drive",
      },
      {
        id: "odometry-error-propagation",
        title: "Odometry 오차 전파",
        focus: "wheel radius, encoder quantization, slip이 pose covariance와 drift를 어떻게 키우는지 본다.",
        graphIds: ["covariance-ellipse"],
        executableLabId: "ekf-2d",
      },
      {
        id: "sensor-time-sync",
        title: "센서, timestamp, calibration",
        focus: "encoder, IMU, LiDAR, camera의 timestamp와 frame calibration이 추정 품질을 어떻게 좌우하는지 본다.",
        graphIds: ["state-machine", "covariance-ellipse"],
        executableLabId: "latency-stats",
      },
      {
        id: "imu-bias-calibration",
        title: "IMU bias와 calibration",
        focus: "gyro/accel bias, covariance, gravity alignment가 EKF 입력 품질에 미치는 영향을 분석한다.",
        graphIds: ["gaussian-kf", "covariance-ellipse"],
        executableLabId: "ekf-2d",
      },
      {
        id: "kf-ekf-pf",
        title: "KF, EKF, Particle Filter",
        focus: "predict/update, covariance propagation, linearization, particle resampling을 비교한다.",
        graphIds: ["gaussian-kf", "covariance-ellipse"],
        executableLabId: "kalman-1d",
      },
      {
        id: "ekf-linearization-jacobian",
        title: "EKF 선형화와 Jacobian",
        focus: "비선형 motion/measurement model을 F,H Jacobian으로 선형화하는 이유를 유도한다.",
        graphIds: ["gaussian-kf", "gradient-descent"],
        executableLabId: "ekf-2d",
      },
      {
        id: "map-odom-base-link",
        title: "map, odom, base_link frame",
        focus: "map 보정, odom 연속성, base_link 실체를 tf tree와 localization 패키지 관점에서 이해한다.",
        graphIds: ["state-machine", "covariance-ellipse"],
        executableLabId: "diff-drive",
      },
      {
        id: "robot-localization-yaml",
        title: "robot_localization YAML 설계",
        focus: "two_d_mode, sensor config vector, differential/relative mode, covariance 설정을 실험 계약으로 정리한다.",
        graphIds: ["state-machine", "covariance-ellipse"],
        executableLabId: "tf-tree-latency",
      },
    ],
    "mobile-planning-control": [
      {
        id: "occupancy-costmap",
        title: "Occupancy grid와 costmap",
        focus: "occupancy probability, obstacle inflation, footprint cost가 planner 입력을 어떻게 만드는지 본다.",
        graphIds: ["astar-cost", "covariance-ellipse"],
        executableLabId: "astar-grid",
      },
      {
        id: "occupancy-log-odds",
        title: "Occupancy log-odds update",
        focus: "Bayes update를 log-odds 형태로 바꿔 hit/miss 관측을 grid probability에 누적한다.",
        graphIds: ["gaussian-kf", "astar-cost"],
        executableLabId: "occupancy-log-odds",
      },
      {
        id: "costmap-inflation-footprint",
        title: "Costmap inflation과 footprint",
        focus: "robot footprint, inflation radius, obstacle cost가 좁은 통로와 안전 여유에 주는 tradeoff를 본다.",
        graphIds: ["astar-cost"],
        executableLabId: "astar-grid",
      },
      {
        id: "astar-global-planner",
        title: "A* global planner",
        focus: "g-cost, h-cost, admissible heuristic, open set 확장이 최단 경로를 만드는 원리를 증명한다.",
        graphIds: ["astar-cost"],
        executableLabId: "astar-grid",
      },
      {
        id: "sampling-planning-rrt-prm",
        title: "Sampling planning RRT/PRM",
        focus: "continuous configuration space에서 random sample과 collision check로 feasible path를 찾는 원리를 본다.",
        graphIds: ["astar-cost", "state-machine"],
        executableLabId: "mpc-rollout",
      },
      {
        id: "local-planner-rollout",
        title: "Local planner와 trajectory rollout",
        focus: "candidate trajectory, collision check, velocity sample, score function을 local costmap에서 평가한다.",
        graphIds: ["astar-cost", "state-machine"],
        executableLabId: "pure-pursuit",
      },
      {
        id: "dwb-mppi-score-functions",
        title: "DWB/MPPI score function",
        focus: "trajectory 후보의 obstacle, path alignment, goal distance, smoothness cost를 비교한다.",
        graphIds: ["astar-cost", "gradient-descent"],
        executableLabId: "mpc-rollout",
      },
      {
        id: "nav2-behavior-tree",
        title: "Nav2 Behavior Tree",
        focus: "planner server, controller server, BT navigator, recovery behavior가 navigation lifecycle을 구성한다.",
        graphIds: ["state-machine"],
        executableLabId: "astar-grid",
      },
      {
        id: "slam-toolbox-debug",
        title: "slam_toolbox와 rosbag 디버깅",
        focus: "mapping/localization, pose graph, scan matching, rosbag replay로 failure case를 재현한다.",
        graphIds: ["covariance-ellipse", "state-machine"],
        executableLabId: "diff-drive",
      },
      {
        id: "pose-graph-loop-closure",
        title: "Pose graph와 loop closure",
        focus: "scan matching constraint와 loop closure가 map drift를 줄이는 그래프 최적화 관점을 이해한다.",
        graphIds: ["covariance-ellipse", "state-machine"],
        executableLabId: "rosbag-metric-analyzer",
      },
    ],
    "mobile-local-control": [
      {
        id: "pure-pursuit-curvature",
        title: "Pure Pursuit 곡률 계산",
        focus: "lookahead target의 로봇 좌표 y와 Ld에서 kappa=2y/Ld^2를 유도한다.",
        graphIds: ["astar-cost"],
        executableLabId: "pure-pursuit",
      },
      {
        id: "stanley-control",
        title: "Stanley 제어",
        focus: "heading error와 lateral error를 조합해 steering command를 만드는 구조를 본다.",
        graphIds: ["astar-cost", "state-machine"],
        executableLabId: "stanley-controller",
      },
      {
        id: "pid-speed-control",
        title: "PID 속도 제어",
        focus: "P/I/D 항이 steady-state error, overshoot, noise 민감도에 미치는 영향을 실험한다.",
        graphIds: ["trajectory-polynomial", "gradient-descent"],
        executableLabId: "pid-response",
      },
      {
        id: "tracking-error-sweep",
        title: "Tracking error와 파라미터 sweep",
        focus: "lookahead, 속도 제한, angular velocity limit을 metric으로 비교한다.",
        graphIds: ["gradient-descent", "astar-cost"],
        executableLabId: "pure-pursuit",
      },
      {
        id: "controller-latency-compensation",
        title: "Controller latency 보상",
        focus: "센서-계획-제어 지연이 tracking error를 키우는 과정을 측정하고 보상 아이디어를 정리한다.",
        graphIds: ["state-machine", "gradient-descent"],
        executableLabId: "latency-stats",
      },
    ],
    "ai-foundations": [
      {
        id: "ml-math-loss",
        title: "ML 수학과 loss",
        focus: "linear layer, activation, cross entropy, gradient descent를 작은 숫자로 계산한다.",
        graphIds: ["gradient-descent", "confusion-matrix"],
        executableLabId: "ai-metrics",
      },
      {
        id: "tensor-shape-autograd",
        title: "Tensor shape와 autograd",
        focus: "batch/channel/height/width shape와 gradient graph가 학습 코드의 계약이 되는 이유를 이해한다.",
        graphIds: ["gradient-descent"],
        executableLabId: "convolution-kernel",
      },
      {
        id: "dataset-metrics",
        title: "Dataset split과 metric",
        focus: "train/val/test split, label 품질, confusion matrix, precision/recall/F1을 평가 계약으로 본다.",
        graphIds: ["confusion-matrix"],
        executableLabId: "ai-metrics",
      },
      {
        id: "data-leakage-class-imbalance",
        title: "Data leakage와 class imbalance",
        focus: "데이터 분할 누수, 불균형 class, threshold 선택이 metric 해석을 왜곡하는 과정을 본다.",
        graphIds: ["confusion-matrix"],
        executableLabId: "ai-metrics",
      },
      {
        id: "mlp-cnn-vision",
        title: "MLP/CNN/Vision 기초",
        focus: "convolution, feature map, pooling, classifier head가 이미지 입력을 label/logit으로 바꾸는 과정을 본다.",
        graphIds: ["gradient-descent", "confusion-matrix"],
        executableLabId: "convolution-kernel",
      },
      {
        id: "camera-calibration-projection",
        title: "Camera calibration과 projection",
        focus: "intrinsic matrix, distortion, pixel projection을 로봇 perception 좌표계 문제로 연결한다.",
        graphIds: ["rotation-basis"],
        executableLabId: "camera-projection",
      },
      {
        id: "pcl-filter-segmentation",
        title: "PCL filtering과 segmentation",
        focus: "voxel grid, pass-through, RANSAC plane, cluster extraction이 LiDAR point cloud를 정리하는 과정을 본다.",
        graphIds: ["state-machine"],
        executableLabId: "rosbag-metric-analyzer",
      },
      {
        id: "preprocessing-contract",
        title: "Vision preprocessing 계약",
        focus: "resize, RGB/BGR, normalization, dtype, shape mismatch가 추론 결과를 바꾸는 이유를 점검한다.",
        graphIds: ["confusion-matrix"],
        executableLabId: "onnx-shape-contract",
      },
      {
        id: "onnx-runtime-deploy",
        title: "ONNX Runtime 배포",
        focus: "PyTorch export, ONNX graph, Runtime session, C++ inference buffer, latency 측정을 연결한다.",
        graphIds: ["state-machine", "confusion-matrix"],
        executableLabId: "onnx-shape-contract",
      },
      {
        id: "onnx-cpp-buffer-contract",
        title: "ONNX Runtime C++ buffer 계약",
        focus: "input name, dtype, contiguous memory, shape vector, output tensor 해석을 C++ API 기준으로 정리한다.",
        graphIds: ["state-machine"],
        executableLabId: "onnx-shape-contract",
      },
      {
        id: "tensorrt-jetson-latency",
        title: "TensorRT/Jetson latency 튜닝",
        focus: "FP16/INT8, batch size, warmup, preprocess/inference/postprocess 분리 측정으로 배포 성능을 본다.",
        graphIds: ["gradient-descent", "state-machine"],
        executableLabId: "latency-stats",
      },
      {
        id: "ros-image-inference-node",
        title: "ROS 2 image inference node",
        focus: "image_transport, cv_bridge, header timestamp, inference result topic을 하나의 perception node로 연결한다.",
        graphIds: ["state-machine", "confusion-matrix"],
        executableLabId: "tf-tree-latency",
      },
    ],
    "llm-engineering": [
      {
        id: "prompt-design",
        title: "Prompt 설계",
        focus: "role, task, constraints, output schema, few-shot 예시를 평가 가능한 템플릿으로 만든다.",
        graphIds: ["retrieval-pipeline", "state-machine"],
        executableLabId: "latency-stats",
      },
      {
        id: "tool-calling-contract",
        title: "Tool/function calling 계약",
        focus: "tool schema, argument validation, structured output이 자동화 하네스에서 필요한 이유를 이해한다.",
        graphIds: ["retrieval-pipeline", "state-machine"],
        executableLabId: "rosbag-metric-analyzer",
      },
      {
        id: "retrieval-context",
        title: "Retrieval과 context assembly",
        focus: "chunking, embedding, top-k retrieval, context window 예산을 grounding 문제로 다룬다.",
        graphIds: ["retrieval-pipeline"],
        executableLabId: "latency-stats",
      },
      {
        id: "chunking-embedding-eval",
        title: "Chunking, embedding, retrieval eval",
        focus: "chunk 크기, overlap, top-k, cosine similarity가 답변 근거와 latency에 주는 tradeoff를 본다.",
        graphIds: ["retrieval-pipeline", "gradient-descent"],
        executableLabId: "svd-pseudoinverse",
      },
      {
        id: "eval-harness",
        title: "Eval harness와 regression",
        focus: "golden output, grader, pass rate, latency logging, trace export를 프롬프트 변경 관리에 사용한다.",
        graphIds: ["retrieval-pipeline", "state-machine"],
        executableLabId: "latency-stats",
      },
      {
        id: "agent-trace-debugging",
        title: "Agent trace와 failure taxonomy",
        focus: "retrieval 실패, tool 오류, reasoning 실패, parser 실패를 trace와 rubric으로 분류한다.",
        graphIds: ["retrieval-pipeline", "state-machine"],
        executableLabId: "rosbag-metric-analyzer",
      },
    ],
    "jetrover-vs-sim": [
      {
        id: "hardware-scope",
        title: "JetRover 실기 범위",
        focus: "실제 센서, frame, safety limit, rosbag 기록처럼 하드웨어에서만 드러나는 요소를 확인한다.",
        graphIds: ["state-machine"],
        executableLabId: "latency-stats",
      },
      {
        id: "simulation-sweep",
        title: "시뮬레이터 반복 실험",
        focus: "dynamics, controller gain, planner parameter, dynamic obstacle을 안전하게 반복 비교한다.",
        graphIds: ["gradient-descent", "trajectory-polynomial"],
        executableLabId: "latency-stats",
      },
    ],
    "recommended-stack": [
      {
        id: "arm-stack",
        title: "로봇팔 이론/라이브러리 스택",
        focus: "Modern Robotics, Eigen, KDL, Pinocchio/RBDL, MoveIt 2, ros2_control의 역할을 구분한다.",
        executableLabId: "two-link-fk",
      },
      {
        id: "nav-stack",
        title: "자율주행 스택",
        focus: "Nav2, slam_toolbox, robot_localization, OpenCV/PCL, tf2가 navigation pipeline에서 맡는 역할을 정리한다.",
        executableLabId: "astar-grid",
      },
      {
        id: "ai-stack",
        title: "AI 배포 스택",
        focus: "PyTorch, OpenCV, ONNX Runtime, TensorRT, ROS 2 image transport를 학습과 배포 단계로 나눈다.",
        executableLabId: "ai-metrics",
      },
    ],
    "weekly-routine": [
      {
        id: "weekly-loop",
        title: "주간 이론-구현 루프",
        focus: "월~금의 이론, 유도, C++, Python 시각화, ROS 2/로그를 균형 있게 배치한다.",
        executableLabId: "latency-stats",
      },
      {
        id: "review-log",
        title: "회고와 로그 리뷰",
        focus: "이번 주 실패 조건, metric 변화, 다음 실험 가설을 기록 가능한 데이터로 남긴다.",
        graphIds: ["gradient-descent", "state-machine"],
        executableLabId: "latency-stats",
      },
    ],
    "minimum-done": [
      {
        id: "arm-check",
        title: "로봇팔 최소 구현 기준",
        focus: "2-link FK/IK/Jacobian, singularity, trajectory, URDF/tf를 직접 설명하고 구현한다.",
        executableLabId: "two-link-fk",
      },
      {
        id: "mobile-check",
        title: "자율주행 최소 구현 기준",
        focus: "odometry, KF/EKF, occupancy grid, A*, Pure Pursuit, Nav2 frame을 직접 확인한다.",
        executableLabId: "astar-grid",
      },
      {
        id: "ai-check",
        title: "AI 최소 배포 기준",
        focus: "dataset split, metric, PyTorch small model, ONNX export, Runtime inference를 끝까지 연결한다.",
        executableLabId: "ai-metrics",
      },
      {
        id: "llm-check",
        title: "LLM 하네스 최소 기준",
        focus: "prompt template, chunking/retrieval, eval set, trace/log를 regression 가능한 구조로 만든다.",
        graphIds: ["retrieval-pipeline"],
        executableLabId: "latency-stats",
      },
    ],
    realtime: [
      {
        id: "loop-latency",
        title: "제어주기, latency, jitter",
        focus: "target period, measured period, jitter, deadline miss를 숫자와 histogram으로 분석한다.",
        graphIds: ["state-machine", "trajectory-polynomial"],
        executableLabId: "latency-stats",
      },
      {
        id: "executor-qos",
        title: "ROS 2 executor와 QoS",
        focus: "callback group, blocking, timestamp, QoS policy가 주기와 센서 처리에 주는 영향을 이해한다.",
        graphIds: ["state-machine"],
        executableLabId: "latency-stats",
      },
    ],
    "safety-control-fusion-eval": [
      {
        id: "safety-monitor",
        title: "Safety monitor와 watchdog",
        focus: "fail-safe, E-stop, soft/hard limit, heartbeat timeout, recovery state를 상태머신으로 설계한다.",
        graphIds: ["state-machine"],
        executableLabId: "latency-stats",
      },
      {
        id: "advanced-control",
        title: "LQR/MPC와 constraint",
        focus: "state-space, controllability, cost function, constraint가 고급 제어의 핵심 언어임을 이해한다.",
        graphIds: ["trajectory-polynomial", "gradient-descent"],
        executableLabId: "latency-stats",
      },
      {
        id: "sensor-fusion",
        title: "센서융합과 covariance tuning",
        focus: "time sync, covariance, EKF/UKF, calibration, IMU bias가 fusion 품질을 어떻게 바꾸는지 본다.",
        graphIds: ["gaussian-kf", "covariance-ellipse"],
        executableLabId: "kalman-1d",
      },
      {
        id: "evaluation-regression",
        title: "반복 평가와 failure taxonomy",
        focus: "benchmark, ablation, parameter sweep, regression test, failure taxonomy로 개선을 증명한다.",
        graphIds: ["gradient-descent", "state-machine"],
        executableLabId: "latency-stats",
      },
    ],
    "judgement-criteria": [
      {
        id: "ten-axis-rubric",
        title: "10축 역량 루브릭",
        focus: "수학/표현부터 반복 평가까지 10개 축을 증거 기반으로 채점한다.",
        graphIds: ["state-machine"],
        executableLabId: "latency-stats",
      },
      {
        id: "self-assessment",
        title: "자기 평가와 심화 선택",
        focus: "4개 판정 질문의 구현 증거를 모으고 다음 심화 도메인을 고른다.",
        graphIds: ["gradient-descent", "state-machine"],
        executableLabId: "latency-stats",
      },
    ],
    "official-links": [
      {
        id: "source-map",
        title: "공식 자료 지도",
        focus: "ROS 2, MoveIt, Nav2, PyTorch, ONNX Runtime 문서를 학습 세션과 연결한다.",
        graphIds: ["retrieval-pipeline", "state-machine"],
        executableLabId: "latency-stats",
      },
      {
        id: "doc-reading",
        title: "공식 문서 읽기 방법",
        focus: "버전, API, concept, tutorial, troubleshooting을 구분해 실습 코드 옆에 출처를 남긴다.",
        graphIds: ["retrieval-pipeline"],
        executableLabId: "latency-stats",
      },
    ],
    "final-loop": [
      {
        id: "python-cpp-ros-loop",
        title: "Python-C++-ROS 2 반복 루프",
        focus: "검산, 모듈화, 시스템 연결, 하드웨어/시뮬레이터 확인을 하나의 닫힌 루프로 사용한다.",
        graphIds: ["state-machine"],
        executableLabId: "latency-stats",
      },
      {
        id: "log-evaluate",
        title: "로그와 평가로 끝내기",
        focus: "매 실험을 metric, 그래프, 실패 분류, 다음 가설로 마무리한다.",
        graphIds: ["gradient-descent", "state-machine"],
        executableLabId: "latency-stats",
      },
    ],
  };

  return (
    topics[section.id] ?? [
      {
        id: "core",
        title: `${section.title} 핵심`,
        focus: section.focus,
        graphIds: section.graphIds,
        executableLabId: section.executableLabId,
      },
      {
        id: "implementation",
        title: `${section.title} 구현/평가`,
        focus: `${section.focus} 수식, 코드, 로그 평가를 연결한다.`,
        graphIds: section.graphIds,
        executableLabId: section.executableLabId,
      },
    ]
  );
};

const topicQuestions = (section: LessonSection, topic: MicroTopic): QuizQuestion[] => [
  {
    id: `${section.id}-${topic.id}-concept-role`,
    type: "choice",
    difficulty: "기초",
    prompt: `[${topic.title}] 이 세션에서 가장 먼저 고정해야 할 것은 무엇인가?`,
    choices: [
      "변수, 좌표계, 단위, 입력/출력 계약",
      "버튼 색상만 선택",
      "정답 숫자 하나만 암기",
      "로그 없이 결과만 기억",
    ],
    answer: "변수, 좌표계, 단위, 입력/출력 계약",
    points: 1,
    explanation: "전문 학습은 개념 이름보다 변수, 좌표계, 단위, 입출력 계약을 먼저 고정해야 구현과 검증으로 이어진다.",
  },
  {
    id: `${section.id}-${topic.id}-numeric-pass-rate`,
    type: "numeric",
    difficulty: "계산",
    prompt: `[${topic.title}] 50회 실험 중 42회 기준을 통과했다. pass rate=passed/total을 계산하라.`,
    answer: "0.84",
    numericAnswer: 0.84,
    tolerance: 0.001,
    points: 2,
    hint: "42를 50으로 나눈다.",
    explanation: "42/50=0.84이며 반복 평가에서는 성공률과 실패 분류를 함께 본다.",
  },
  {
    id: `${section.id}-${topic.id}-formula-theta`,
    type: "formulaBlank",
    difficulty: "전문",
    prompt: `[${topic.title}] y=f(x,u,____,t)에서 시스템 파라미터를 나타내는 기호를 채워라.`,
    answer: "theta",
    acceptedExpressions: ["theta", "θ", "parameter", "파라미터"],
    formulaSymbols: ["x", "u", "θ", "t", "f()"],
    points: 2,
    hint: "학습 또는 튜닝으로 바뀌는 상수/계수다.",
    explanation: "θ는 모델/제어/평가에서 조정되는 파라미터를 나타내는 전형적인 표기다.",
  },
  {
    id: `${section.id}-${topic.id}-derive-evidence`,
    type: "derivationStep",
    difficulty: "유도",
    prompt: `[${topic.title}] 이론을 실험 증거로 바꾸는 절차를 4단계로 쓰라.`,
    answer: "정의, 공식, 구현, 로그",
    expectedSteps: ["정의", "공식", "구현", "로그"],
    points: 4,
    hint: "교과서식 설명에서 브라우저/ROS 2 실험까지 내려오는 순서다.",
    explanation: "정의가 공식이 되고, 공식이 코드가 되며, 코드는 로그와 metric으로 검증된다.",
  },
  {
    id: `${section.id}-${topic.id}-trace-p-controller`,
    type: "codeTrace",
    difficulty: "계산",
    prompt: `[${topic.title}] 아래 코드에서 command 값을 계산하라.`,
    answer: "1.0",
    codeSnippet: `const target = 1.0;
const estimate = 0.6;
const kp = 2.5;
const error = target - estimate;
const command = kp * error;`,
    expectedTrace: "error 0.4 command 1.0",
    points: 2,
    hint: "오차를 먼저 계산하고 gain을 곱한다.",
    explanation: "error=1.0-0.6=0.4이고 command=2.5*0.4=1.0이다.",
  },
  {
    id: `${section.id}-${topic.id}-formula-units`,
    type: "formulaBlank",
    difficulty: "전문",
    prompt: `[${topic.title}] 계산 문제를 풀기 전에 반드시 맞춰야 하는 두 가지 기준을 쓰라: 좌표계(frame)와 ____.`,
    answer: "unit",
    acceptedExpressions: ["unit", "units", "단위", "dimension", "차원"],
    formulaSymbols: ["frame", "unit", "dimension"],
    points: 2,
    hint: "m, rad, s, pixel처럼 수치가 어떤 물리량인지 정한다.",
    explanation: "frame과 단위를 맞추지 않으면 공식이 맞아도 결과가 물리적으로 틀린 값이 된다.",
  },
  {
    id: `${section.id}-${topic.id}-derive-debug-loop`,
    type: "derivationStep",
    difficulty: "전문",
    prompt: `[${topic.title}] 실무 디버깅 답안을 쓸 때 포함할 4요소를 순서대로 쓰라.`,
    answer: "원인, 공식, 로그, 수정",
    expectedSteps: ["원인", "공식", "로그", "수정"],
    points: 4,
    hint: "왜 그런지, 어떤 이론과 연결되는지, 무엇을 찍어볼지, 무엇을 바꿀지.",
    explanation: "전문 답안은 원인 가설, 관련 공식/원리, 확인할 로그, 수정 방향을 함께 제시해야 한다.",
  },
];

const scenarioTagsBySection = (sectionId: string) => {
  if (sectionId.includes("manipulator")) return ["MoveIt 2", "planning scene", "Jacobian", "trajectory"];
  if (sectionId.includes("mobile") || sectionId.includes("planning") || sectionId.includes("pure")) {
    return ["Nav2", "costmap", "Pure Pursuit", "EKF"];
  }
  if (sectionId.includes("ai")) return ["ONNX Runtime", "OpenCV preprocessing", "metric", "latency"];
  if (sectionId.includes("llm")) return ["retrieval", "eval harness", "latency", "golden output"];
  if (sectionId.includes("realtime") || sectionId.includes("safety")) return ["watchdog", "deadline", "QoS", "failure taxonomy"];
  return ["ROS 2", "logging", "parameter sweep", "reproducibility"];
};

const cheatsBySection = (sectionId: string) => {
  const common = [
    {
      label: "토픽 목록",
      command: "ros2 topic list",
      description: "현재 graph에서 publish/subscribe 중인 topic을 확인한다.",
      domain: "ROS 2",
    },
    {
      label: "토픽 주기",
      command: "ros2 topic hz /topic_name",
      description: "sensor, command, inference 결과 topic의 실제 주기를 측정한다.",
      domain: "ROS 2",
    },
    {
      label: "패키지 빌드",
      command: "colcon build --packages-select my_package",
      description: "학습 중인 패키지만 선택 빌드해 반복 시간을 줄인다.",
      domain: "Build",
    },
  ];
  if (sectionId.includes("manipulator")) {
    return [
      ...common,
      {
        label: "MoveIt launch 인자",
        command: "ros2 launch my_moveit_config demo.launch.py --show-args",
        description: "planning pipeline, controller, RViz 관련 launch parameter를 확인한다.",
        domain: "MoveIt",
      },
      {
        label: "joint state 확인",
        command: "ros2 topic echo /joint_states",
        description: "URDF, controller, robot_state_publisher가 기대한 joint 값을 내는지 본다.",
        domain: "Robot Arm",
      },
    ];
  }
  if (sectionId.includes("mobile") || sectionId.includes("planning") || sectionId.includes("pure")) {
    return [
      ...common,
      {
        label: "Nav2 parameter 확인",
        command: "ros2 param list /controller_server",
        description: "FollowPath controller와 costmap 관련 parameter 이름을 확인한다.",
        domain: "Nav2",
      },
      {
        label: "rosbag 기록",
        command: "ros2 bag record /tf /tf_static /odom /cmd_vel /scan",
        description: "localization, planning, control 실패를 재현하기 위한 최소 topic을 기록한다.",
        domain: "Debug",
      },
    ];
  }
  if (sectionId.includes("ai")) {
    return [
      ...common,
      {
        label: "이미지 토픽 확인",
        command: "ros2 topic echo /camera/image_raw --once",
        description: "image inference 입력 topic의 header, encoding, size를 먼저 확인한다.",
        domain: "Vision",
      },
      {
        label: "추론 latency 로그",
        command: "ros2 topic hz /inference/result",
        description: "preprocess, inference, postprocess를 합친 결과 주기를 관찰한다.",
        domain: "AI",
      },
    ];
  }
  return common;
};

const sourceIdsForTopic = (section: LessonSection, topic: MicroTopic): string[] => {
  const id = `${section.id} ${topic.id}`;
  const ids = new Set(sourceIdsBySection(section.id));
  const add = (...items: string[]) => items.forEach((item) => ids.add(item));

  if (id.includes("algebra") || id.includes("function")) add("khan-algebra", "openstax-college-algebra");
  if (id.includes("trig") || id.includes("unit-circle")) add("khan-unit-circle", "openstax-precalculus", "pauls-trig-review");
  if (id.includes("vector")) add("khan-vectors", "khan-dot-cross", "openstax-calc3-vectors");
  if (id.includes("linear") || id.includes("transform") || id.includes("svd")) add("mit-1806", "3b1b-linear-algebra", "eigen-quick-reference");
  if (id.includes("calculus") || id.includes("jacobian") || id.includes("gradient")) add("mit-1802", "pauls-partial-derivatives", "matrix-calculus-dl");
  if (id.includes("differential-equation") || id.includes("dynamics")) add("mit-1803", "mit-underactuated-multibody", "spong-robot-modeling-control");
  if (id.includes("probability") || id.includes("kalman") || id.includes("ekf") || id.includes("covariance")) {
    add("harvard-stat110", "probabilistic-robotics", "mit-6041", "robot-localization-config");
  }
  if (id.includes("optimization") || id.includes("lqr") || id.includes("mpc") || id.includes("trajopt")) {
    add("boyd-convex", "mit-underactuated-lqr", "mit-underactuated-mpc", "ceres-solver");
  }
  if (id.includes("dh") || id.includes("poe") || id.includes("screw") || id.includes("se3") || id.includes("so3")) {
    add("modern-robotics-pdf", "modern-robotics-videos", "stanford-cs223a-see");
  }
  if (id.includes("moveit")) add("moveit-getting-started", "moveit-planning-scene", "moveit-motion-planning-api");
  if (id.includes("ros2-control")) add("ros2-control-concepts", "gazebo-ros2-control");
  if (id.includes("qos")) add("ros2-qos", "ros2-executors", "ros2-callback-groups");
  if (id.includes("tf")) add("tf2-main", "tf2-broadcaster-cpp", "tf2-listener-cpp");
  if (id.includes("rosbag")) add("rosbag2", "foxglove-docs", "plotjuggler");
  if (id.includes("costmap") || id.includes("occupancy")) add("nav2-costmap-2d", "probabilistic-robotics");
  if (id.includes("astar") || id.includes("planner")) add("planning-algorithms-pdf", "nav2-smac-planner", "nav2-navfn-planner");
  if (id.includes("pure") || id.includes("stanley") || id.includes("controller")) add("nav2-regulated-pp", "nav2-dwb-controller", "nav2-mppi");
  if (id.includes("slam")) add("slam-toolbox", "slam-toolbox-github", "nav2-with-slam");
  if (id.includes("opencv") || id.includes("camera") || id.includes("vision")) add("opencv-docs", "opencv-camera-calibration", "opencv-python-tutorials");
  if (id.includes("pcl") || id.includes("point")) add("pcl-tutorials", "pcl-filtering", "pcl-registration");
  if (id.includes("onnx")) add("onnx", "onnx-runtime-docs", "onnx-runtime-cpp-api", "onnx-runtime-c-guidelines");
  if (id.includes("tensor") || id.includes("jetson")) add("tensorrt-docs", "tensorrt-cpp-api", "jetson-ai-lab");
  if (id.includes("prompt") || id.includes("retrieval") || id.includes("eval")) {
    add("openai-prompting", "openai-evals", "anthropic-context-engineering", "langchain-docs", "llamaindex-docs");
  }
  if (id.includes("jetrover")) add("jetrover-docs", "jetrover-arm-course", "jetrover-mapping-navigation", "jetrover-moveit-gazebo");

  return [...ids].slice(0, 10);
};

const readingGuideForTopic = (section: LessonSection, topic: MicroTopic): string[] => {
  const sources = sourceIdsForTopic(section, topic);
  return [
    `1단계: ${sources[0]} 자료에서 용어와 API 이름을 확인한다.`,
    `2단계: ${sources[1] ?? sources[0]} 자료에서 수식/개념의 정의를 다시 읽는다.`,
    `3단계: ${sources[2] ?? sources[0]} 자료의 예제 코드 또는 튜토리얼을 이 세션의 C++/Python 실습과 대조한다.`,
    "4단계: 읽은 문서를 노트에 링크하고, 어떤 공식/파라미터/명령어를 실제 코드에 썼는지 기록한다.",
  ];
};

const prerequisiteIdsByTopic = (section: LessonSection, topic: MicroTopic) => {
  const prereqs = [section.parentId ?? section.id];
  if (section.id.includes("manipulator")) prereqs.push("math-foundations--linear-algebra-transforms");
  if (section.id.includes("mobile")) prereqs.push("math-foundations--probability-kalman");
  if (section.id.includes("ai")) prereqs.push("math-foundations--optimization-integration");
  if (section.id.includes("llm")) prereqs.push("cpp-python-ros2--experiment-logging");
  if (topic.id.includes("jacobian") || topic.id.includes("ik")) prereqs.push("manipulator-kinematics--forward-kinematics");
  if (topic.id.includes("astar") || topic.id.includes("costmap")) prereqs.push("mobile-localization--map-odom-base-link");
  return [...new Set(prereqs)];
};

const scenarioQuestionsForTopic = (section: LessonSection, topic: MicroTopic): QuizQuestion[] => {
  if (section.id.includes("manipulator")) {
    return [
      {
        id: `${section.id}-${topic.id}-scenario-moveit-timeout`,
        type: "derivationStep",
        difficulty: "전문",
        prompt: `[${topic.title}] MoveIt planning이 5초 이상 걸릴 때 확인해야 할 3가지를 쓰고, planning scene / collision / joint limit 관점으로 설명하라.`,
        answer: "planning scene, collision object, joint limit",
        expectedSteps: ["planning scene", "collision", "joint"],
        points: 4,
        hint: "환경 모델, 충돌 객체, 관절 제한/goal constraint를 분리해서 본다.",
        explanation: "planning scene이 최신인지, collision object가 과도하게 막고 있는지, joint limit/goal tolerance가 너무 빡빡한지 확인한다.",
      },
      {
        id: `${section.id}-${topic.id}-scenario-jacobian-command`,
        type: "codeTrace",
        difficulty: "계산",
        prompt: `[${topic.title}] det(J)가 0.03으로 작고 목표 말단속도가 큰 상황에서 DLS damping을 키우면 관절속도 명령은 어떻게 변하는가?`,
        answer: "작아지고 안정화된다",
        codeSnippet: "dq = J^T (J J^T + lambda^2 I)^-1 e;",
        expectedTrace: "lambda damping joint velocity smaller stable",
        points: 3,
        hint: "lambda^2 I가 역행렬 계산을 완만하게 만든다.",
        explanation: "DLS damping을 키우면 singularity 근처에서 과도한 joint velocity가 줄어 안정성이 커진다.",
      },
    ];
  }
  if (section.id.includes("mobile") || section.id.includes("planning") || section.id.includes("pure")) {
    return [
      {
        id: `${section.id}-${topic.id}-scenario-nav2-followpath`,
        type: "derivationStep",
        difficulty: "전문",
        prompt: `[${topic.title}] Nav2 FollowPath가 경로를 이탈할 때 lookahead_dist를 0.8에서 1.2로 키우면 Pure Pursuit 곡률 kappa=2y/Ld^2는 어떻게 변하는가?`,
        answer: "곡률 감소, 부드러움 증가, 코너 반응 둔화",
        expectedSteps: ["Ld", "curvature", "smooth"],
        points: 4,
        hint: "Ld가 분모에 제곱으로 들어간다.",
        explanation: "Ld가 커지면 같은 lateral target y에서 kappa=2y/Ld^2가 작아져 부드러워지지만 급한 코너 반응은 느려질 수 있다.",
      },
      {
        id: `${section.id}-${topic.id}-scenario-costmap-debug`,
        type: "derivationStep",
        difficulty: "전문",
        prompt: `[${topic.title}] 로봇이 장애물 근처에서 멈춘다. costmap inflation, footprint, sensor timestamp 중 확인 순서를 쓰라.`,
        answer: "timestamp, footprint, inflation",
        expectedSteps: ["timestamp", "footprint", "inflation"],
        points: 3,
        hint: "먼저 관측이 최신인지, 그 다음 로봇 크기와 장애물 확장을 본다.",
        explanation: "오래된 센서 데이터는 잘못된 obstacle을 남기고, footprint/inflation이 과하면 통로가 막힌 것처럼 보인다.",
      },
    ];
  }
  if (section.id.includes("ai")) {
    return [
      {
        id: `${section.id}-${topic.id}-scenario-onnx-shape`,
        type: "derivationStep",
        difficulty: "전문",
        prompt: `[${topic.title}] ONNX Runtime C++ 추론 output shape이 [1,3,224,224]로 나온다. 원인 2가지와 해결책을 쓰라.`,
        answer: "출력 노드 선택 오류, preprocessing/channel 계약 오류",
        expectedSteps: ["output", "shape", "preprocess"],
        points: 4,
        hint: "classification이면 보통 [1,num_classes]가 기대된다.",
        explanation: "중간 feature map을 output으로 export했거나, 모델 head/export/output name을 잘못 선택했을 수 있다. 입력 shape/channel order도 확인한다.",
      },
      {
        id: `${section.id}-${topic.id}-scenario-metric-risk`,
        type: "derivationStep",
        difficulty: "전문",
        prompt: `[${topic.title}] false negative가 위험한 로봇 비전 시스템에서 accuracy만 보고 배포하면 안 되는 이유를 precision/recall로 설명하라.`,
        answer: "recall 확인 필요",
        expectedSteps: ["FN", "recall", "risk"],
        points: 3,
        hint: "놓치면 위험한 class에서는 실제 positive를 얼마나 찾았는지가 중요하다.",
        explanation: "FN이 위험하면 recall=TP/(TP+FN)을 반드시 봐야 한다. accuracy는 class imbalance에서 위험을 숨길 수 있다.",
      },
    ];
  }
  if (section.id.includes("llm")) {
    return [
      {
        id: `${section.id}-${topic.id}-scenario-retrieval-regression`,
        type: "derivationStep",
        difficulty: "전문",
        prompt: `[${topic.title}] prompt 수정 후 pass rate가 0.85에서 0.72로 떨어졌다. retrieval, prompt, grader 중 어디를 어떤 로그로 분리 확인할까?`,
        answer: "retrieved chunk id, prompt version, grader result",
        expectedSteps: ["chunk", "prompt", "grader"],
        points: 4,
        hint: "입력 근거, 모델 입력, 평가 결과를 따로 남긴다.",
        explanation: "retrieved chunk id, prompt template version, model output, grader result를 trace로 비교해야 회귀 원인을 분해할 수 있다.",
      },
    ];
  }
  return [
    {
      id: `${section.id}-${topic.id}-scenario-ros2-debug`,
      type: "derivationStep",
      difficulty: "전문",
      prompt: `[${topic.title}] ROS 2 실험 결과가 재현되지 않는다. topic, param, rosbag, commit 관점에서 확인할 증거 4가지를 쓰라.`,
      answer: "topic hz, parameter, rosbag2, git commit",
      expectedSteps: ["topic", "param", "rosbag", "commit"],
      points: 4,
      hint: "실행 당시 입력과 설정과 코드를 남겨야 한다.",
      explanation: "topic 주기, parameter 값, rosbag2 입력, git commit/hash가 있어야 같은 실험을 다시 만들 수 있다.",
    },
  ];
};

const cloneQuestionForTopic = (question: QuizQuestion, section: LessonSection, topic: MicroTopic): QuizQuestion => ({
  ...question,
  id: `${section.id}-${topic.id}-${question.id}`,
  prompt: `[${topic.title}] ${question.prompt}`,
});

const practiceExamplesForTopic = (section: LessonSection, topic: MicroTopic, language: "cpp" | "python"): CodeExample[] => {
  const ids = sourceIdsForTopic(section, topic);
  const key = `${section.id} ${topic.id}`;
  const example = (
    id: string,
    title: string,
    starterCode: string,
    solutionCode: string,
    explanation: string,
    checks: string[],
  ): CodeExample => ({
    id: `${section.id}-${topic.id}-${language}-${id}`,
    title,
    language,
    starterCode: starterCode.trim(),
    solutionCode: solutionCode.trim(),
    explanation,
    checks,
    sourceIds: ids.slice(0, 4),
  });

  if (language === "cpp") {
    if (key.includes("ros2") || key.includes("qos") || key.includes("tf") || key.includes("callback") || key.includes("action")) {
      return [
        example(
          "ros2-node-skeleton",
          "rclcpp 노드 구조와 parameter",
          `
#include <rclcpp/rclcpp.hpp>

class StudyNode : public rclcpp::Node {
public:
  StudyNode() : Node("study_node") {
    this->declare_parameter<double>("gain", 1.0);
    timer_ = create_wall_timer(std::chrono::milliseconds(20), [this]() {
      const double gain = this->get_parameter("gain").as_double();
      RCLCPP_INFO_THROTTLE(get_logger(), *get_clock(), 1000, "gain=%.2f", gain);
    });
  }
private:
  rclcpp::TimerBase::SharedPtr timer_;
};
          `,
          `
#include <chrono>
#include <rclcpp/rclcpp.hpp>
using namespace std::chrono_literals;

class StudyNode : public rclcpp::Node {
public:
  StudyNode() : Node("study_node") {
    this->declare_parameter<double>("gain", 1.0);
    timer_ = create_wall_timer(20ms, [this]() {
      const double gain = this->get_parameter("gain").as_double();
      RCLCPP_INFO_THROTTLE(get_logger(), *get_clock(), 1000, "gain=%.2f", gain);
    });
  }
private:
  rclcpp::TimerBase::SharedPtr timer_;
};

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<StudyNode>());
  rclcpp::shutdown();
  return 0;
}
          `,
          "parameter와 timer callback을 분리해 ROS 2 노드의 주기 실행 계약을 연습한다.",
          ["rclcpp", "declare_parameter", "create_wall_timer", "spin"],
        ),
        example(
          "tf2-lookup-check",
          "tf2 lookup 실패 조건 점검",
          `
// TODO: buffer.lookupTransform("map", "base_link", time) 구조를 작성한다.
          `,
          `
#include <tf2_ros/buffer.h>
#include <geometry_msgs/msg/transform_stamped.hpp>

geometry_msgs::msg::TransformStamped lookupBase(
  tf2_ros::Buffer& buffer, const rclcpp::Time& stamp) {
  return buffer.lookupTransform("map", "base_link", stamp, rclcpp::Duration::from_seconds(0.05));
}
          `,
          "frame 이름, timestamp, timeout을 명시해 tf2 lookup contract를 확인한다.",
          ["lookupTransform", "map", "base_link", "Duration"],
        ),
      ];
    }

    if (key.includes("ai") || key.includes("opencv") || key.includes("onnx") || key.includes("camera") || key.includes("pcl")) {
      return [
        example(
          "opencv-preprocess",
          "OpenCV 전처리 계약",
          `
#include <opencv2/opencv.hpp>
cv::Mat preprocess(const cv::Mat& bgr) {
  // TODO: resize, color conversion, normalization
  return bgr;
}
          `,
          `
#include <opencv2/opencv.hpp>

cv::Mat preprocess(const cv::Mat& bgr) {
  cv::Mat rgb, resized, float_img;
  cv::cvtColor(bgr, rgb, cv::COLOR_BGR2RGB);
  cv::resize(rgb, resized, cv::Size(224, 224));
  resized.convertTo(float_img, CV_32FC3, 1.0 / 255.0);
  return float_img;
}
          `,
          "학습 때와 배포 때의 resize, RGB/BGR, dtype 계약을 C++ 코드로 고정한다.",
          ["cv::cvtColor", "cv::resize", "convertTo", "CV_32F"],
        ),
        example(
          "onnx-shape-check",
          "ONNX Runtime shape 검증",
          `
// TODO: input/output shape를 검사하는 함수를 작성한다.
          `,
          `
#include <vector>
#include <stdexcept>

void checkShape(const std::vector<int64_t>& actual, const std::vector<int64_t>& expected) {
  if (actual.size() != expected.size()) throw std::runtime_error("rank mismatch");
  for (size_t i = 0; i < actual.size(); ++i) {
    if (expected[i] > 0 && actual[i] != expected[i]) throw std::runtime_error("shape mismatch");
  }
}
          `,
          "모델 I/O shape 계약을 코드로 검사해 중간 feature map을 잘못 쓰는 실수를 잡는다.",
          ["vector", "expected", "shape", "throw"],
        ),
      ];
    }

    if (key.includes("mobile") || key.includes("planner") || key.includes("astar") || key.includes("pure") || key.includes("stanley")) {
      return [
        example(
          "diff-drive-odom",
          "차동구동 odometry 함수",
          `
struct Pose2D { double x, y, yaw; };
Pose2D step(Pose2D pose, double vl, double vr, double b, double dt) {
  // TODO
  return pose;
}
          `,
          `
#include <cmath>
struct Pose2D { double x, y, yaw; };

Pose2D step(Pose2D pose, double vl, double vr, double b, double dt) {
  const double v = 0.5 * (vr + vl);
  const double w = (vr - vl) / b;
  pose.x += v * std::cos(pose.yaw) * dt;
  pose.y += v * std::sin(pose.yaw) * dt;
  pose.yaw += w * dt;
  return pose;
}
          `,
          "wheel velocity를 body twist와 world pose 적분으로 연결한다.",
          ["cos", "sin", "vr", "vl", "yaw"],
        ),
        example(
          "astar-node-score",
          "A* f-cost comparator",
          `
struct Node { int x, y; double g, h; };
double score(const Node& n) {
  // TODO
  return 0.0;
}
          `,
          `
struct Node { int x, y; double g, h; };

double score(const Node& n) {
  return n.g + n.h;
}

bool better(const Node& a, const Node& b) {
  return score(a) < score(b);
}
          `,
          "g-cost와 admissible h-cost의 합을 우선순위로 사용한다.",
          ["g", "h", "score", "return"],
        ),
      ];
    }

    return [
      example(
        "eigen-transform",
        "Eigen transform 검산",
        `
#include <Eigen/Dense>
Eigen::Vector2d rotate(double theta, const Eigen::Vector2d& p) {
  // TODO
  return p;
}
        `,
        `
#include <cmath>
#include <Eigen/Dense>

Eigen::Vector2d rotate(double theta, const Eigen::Vector2d& p) {
  Eigen::Matrix2d R;
  R << std::cos(theta), -std::sin(theta),
       std::sin(theta),  std::cos(theta);
  return R * p;
}
        `,
        "공식의 행렬곱을 Eigen 코드로 옮기는 기본 패턴이다.",
        ["Eigen", "Matrix2d", "cos", "sin", "return"],
      ),
      example(
        "metric-logger",
        "실험 metric CSV row",
        `
#include <string>
std::string csvRow(double error, double latency_ms) {
  // TODO
  return "";
}
        `,
        `
#include <sstream>
#include <string>

std::string csvRow(double error, double latency_ms) {
  std::ostringstream out;
  out << error << "," << latency_ms;
  return out.str();
}
        `,
        "수식 결과를 로그로 남겨 다음 실험과 비교할 수 있게 만든다.",
        ["ostringstream", "error", "latency", "return"],
      ),
    ];
  }

  if (key.includes("ai") || key.includes("opencv") || key.includes("onnx") || key.includes("camera") || key.includes("pcl")) {
    return [
      example(
        "numpy-preprocess",
        "NumPy 전처리 shape 검산",
        `
import numpy as np

def normalize(img):
    # TODO: HWC uint8 -> float32 [0,1]
    return img
        `,
        `
import numpy as np

def normalize(img):
    x = img.astype(np.float32) / 255.0
    chw = np.transpose(x, (2, 0, 1))
    return np.expand_dims(chw, axis=0)
        `,
        "Python에서 shape와 dtype을 빠르게 검산한 뒤 C++ 배포 코드와 맞춘다.",
        ["astype", "transpose", "expand_dims", "float32"],
      ),
      example(
        "metric-compute",
        "confusion matrix metric",
        `
def metrics(tp, fp, fn, tn):
    # TODO
    return {}
        `,
        `
def metrics(tp, fp, fn, tn):
    precision = tp / (tp + fp)
    recall = tp / (tp + fn)
    f1 = 2 * precision * recall / (precision + recall)
    accuracy = (tp + tn) / (tp + fp + fn + tn)
    return {"precision": precision, "recall": recall, "f1": f1, "accuracy": accuracy}
        `,
        "accuracy 하나로 숨겨지는 오류를 precision/recall/F1로 분해한다.",
        ["precision", "recall", "f1", "return"],
      ),
    ];
  }

  if (key.includes("mobile") || key.includes("planner") || key.includes("astar") || key.includes("pure") || key.includes("stanley")) {
    return [
      example(
        "odometry-python",
        "odometry 손계산 함수",
        `
import math

def step(x, y, yaw, vl, vr, b, dt):
    # TODO
    return x, y, yaw
        `,
        `
import math

def step(x, y, yaw, vl, vr, b, dt):
    v = 0.5 * (vr + vl)
    w = (vr - vl) / b
    return x + v * math.cos(yaw) * dt, y + v * math.sin(yaw) * dt, yaw + w * dt
        `,
        "차동구동 모델을 작은 숫자로 검산한다.",
        ["math.cos", "math.sin", "vr", "vl", "return"],
      ),
      example(
        "pure-pursuit-python",
        "Pure Pursuit curvature",
        `
def curvature(y, lookahead):
    # TODO
    return 0.0
        `,
        `
def curvature(y, lookahead):
    return 2.0 * y / (lookahead ** 2)
        `,
        "lookahead가 커질수록 곡률이 어떻게 줄어드는지 실험한다.",
        ["lookahead", "** 2", "return"],
      ),
    ];
  }

  return [
    example(
      "formula-check",
      "수식 직접 검산",
      `
import math

def rotate(theta, p):
    # TODO: 2D rotation
    return p
      `,
      `
import math

def rotate(theta, p):
    x, y = p
    return (
        math.cos(theta) * x - math.sin(theta) * y,
        math.sin(theta) * x + math.cos(theta) * y,
    )
      `,
      "교재의 회전행렬을 Python 함수로 옮겨 숫자 예제를 확인한다.",
      ["math.cos", "math.sin", "return"],
    ),
    example(
      "table-log",
      "결과 표 만들기",
      `
def summarize(values):
    # TODO
    return {}
      `,
      `
def summarize(values):
    return {
        "mean": sum(values) / len(values),
        "max": max(values),
        "min": min(values),
    }
      `,
      "시뮬레이션 결과를 metric dictionary로 정리한다.",
      ["mean", "max", "min", "return"],
    ),
  ];
};

const latexExpression = (expression: string) =>
  expression
    .replace(/\b(cos|sin|tan|atan2|sqrt|log|ln|exp|det)\b/g, "\\$1")
    .replace(/\btheta\b/gi, "\\theta")
    .replace(/\blambda\b/gi, "\\lambda")
    .replace(/\bomega\b/gi, "\\omega")
    .replace(/\bepsilon\b/gi, "\\epsilon")
    .replace(/\bSigma\b/g, "\\Sigma")
    .replace(/\bmu\b/gi, "\\mu")
    .replace(/\b([lqxyuvpr])(\d)\b/g, "$1_$2")
    .replace(/\^(-?\d+|T)/g, "^{$1}")
    .replace(/->/g, "\\to")
    .replace(/·/g, "\\cdot ");

type TextbookProfile = {
  subject: string;
  coreQuestion: string;
  concept: string;
  mentalModel: string;
  variables: string[];
  principles: string[];
  formulas: Formula[];
  derivation: string[];
  proof: string[];
  workedExample: WorkedExample;
  implementationNotes: string[];
  engineeringMeaning: string[];
  commonMistakes: string[];
  examTargets: string[];
};

const formula = (label: string, expression: string, description: string): Formula => ({
  label,
  expression: latexExpression(expression),
  description,
});

const profileForTopic = (section: LessonSection, topic: MicroTopic): TextbookProfile => {
  const id = `${section.id} ${topic.id}`;

  if (
    id.includes("algebra") ||
    id.includes("trig") ||
    id.includes("unit-circle") ||
    id.includes("vectors") ||
    id.includes("single-variable-calculus") ||
    id.includes("differential-equations") ||
    id.includes("numerical-methods")
  ) {
    return {
      subject: "기초수학에서 로봇/AI로 이어지는 언어",
      coreQuestion: "함수, 그래프, 삼각함수, 변화율, 누적량을 로봇 상태와 알고리즘의 입력-출력 관계로 어떻게 읽을 것인가?",
      concept:
        "기초수학은 로봇공학의 준비운동이 아니라 실제 모델의 언어다. 함수는 입력이 출력으로 바뀌는 규칙이고, 그래프는 파라미터 변화에 대한 출력의 모양이다. 삼각함수는 회전과 방향을, 미분은 순간 변화율을, 적분은 누적 변화를, 미분방정식은 시간이 흐르며 상태가 변하는 법칙을 표현한다.",
      mentalModel:
        "로봇이 움직인다는 것은 시간 t가 변할 때 위치 x(t), 속도 v(t), heading theta(t)가 함께 변한다는 뜻이다. 수학 문제의 x, y, f(x)는 실제 시스템에서는 센서값, 모터 명령, 오차, 비용, 확률이 된다.",
      variables: [
        "x: 독립변수 또는 상태 입력",
        "y=f(x): 입력이 규칙을 지나 나온 출력",
        "theta: 회전각 또는 조정할 파라미터",
        "dx/dt: 시간에 따른 상태 변화율",
        "Delta t: 이산 시뮬레이션의 시간 간격",
      ],
      principles: [
        "함수의 정의역과 치역은 코드의 입력 범위와 출력 범위에 해당한다.",
        "sin/cos는 unit circle에서 좌표를 읽는 함수라서 회전행렬과 원호 운동의 기본이 된다.",
        "미분은 작은 변화에 대한 민감도이고 Jacobian, gradient, velocity model로 확장된다.",
        "수치적분은 연속시간 모델을 컴퓨터가 계산할 수 있는 반복 업데이트로 바꾸는 과정이다.",
      ],
      formulas: [
        formula("function model", "y=f(x)", "입력 x가 규칙 f를 지나 출력 y가 된다."),
        formula("unit circle", "cos^2(theta)+sin^2(theta)=1", "회전과 삼각함수의 길이 보존 성질."),
        formula("derivative", "f'(x)=lim_{h->0} (f(x+h)-f(x))/h", "순간 변화율의 정의."),
        formula("Euler integration", "x_{k+1}=x_k+Delta t f(x_k,u_k)", "연속 모델을 이산 업데이트로 근사."),
      ],
      derivation: [
        "함수를 먼저 입력, 파라미터, 출력으로 나눈다.",
        "그래프의 기울기는 출력이 입력 변화에 얼마나 민감한지 나타낸다.",
        "unit circle에서 각도 theta의 점 좌표가 (cos theta, sin theta)이므로 회전행렬 열벡터가 된다.",
        "x_dot=f(x,u)를 작은 시간 Delta t 동안 상수로 보면 x_{k+1}=x_k+Delta t f(x_k,u_k)가 된다.",
      ],
      proof: [
        "unit circle 위 점은 원점에서 거리 1이므로 x^2+y^2=1이고, x=cos theta, y=sin theta를 대입하면 항등식이 나온다.",
        "미분 정의의 h를 점점 작게 하면 평균 변화율이 한 점의 접선 기울기로 수렴한다.",
        "Euler 적분은 Taylor 전개 x(t+Delta t)=x(t)+Delta t x_dot(t)+O(Delta t^2)의 1차 항만 남긴 근사다.",
      ],
      workedExample: {
        prompt: "v=0.4m/s, theta=60도, Delta t=0.5s일 때 x 방향 이동량을 구하라.",
        steps: ["x 방향 속도는 v cos(theta)", "cos60=0.5", "Delta x=0.4*0.5*0.5=0.1m"],
        result: "삼각함수는 추상 공식이 아니라 로봇 heading을 world frame 이동량으로 바꾸는 도구다.",
      },
      implementationNotes: [
        "각도 입력은 radian으로 통일하고 degree 값은 코드 진입점에서 변환한다.",
        "그래프 실습에서는 입력 범위를 바꿔 함수 출력이 어떻게 휘는지 먼저 본다.",
        "Euler 적분은 step size가 너무 크면 오차가 커지므로 dt sweep을 로그로 비교한다.",
      ],
      engineeringMeaning: [
        "기초수학을 정확히 알면 FK, odometry, Kalman filter, gradient descent가 서로 다른 암기 과목으로 보이지 않는다.",
        "시험 계산 문제는 대부분 입력값을 식의 변수로 옮기고 단위와 범위를 점검하는 데서 시작한다.",
      ],
      commonMistakes: [
        "degree 값을 radian 함수에 그대로 넣는다.",
        "그래프의 x축/단위를 확인하지 않고 추세만 해석한다.",
        "Euler 적분 결과가 정확한 해라고 생각하고 step size 오차를 무시한다.",
      ],
      examTargets: ["함수 입출력 해석", "unit circle 항등식", "미분 정의", "Euler 적분 계산"],
    };
  }

  if (id.includes("linear-algebra") || id.includes("pose-representation")) {
    return {
      subject: "선형대수와 좌표계 표현",
      coreQuestion: "같은 물체의 위치와 방향을 서로 다른 좌표계에서 어떻게 일관되게 표현할 것인가?",
      concept:
        "로봇공학에서 벡터는 단순한 숫자 목록이 아니라 어느 frame에서 본 물리량이다. 회전행렬은 basis vector를 다른 frame으로 옮기는 선형변환이고, homogeneous transform은 회전과 평행이동을 하나의 행렬곱으로 합친 표기다. 이 개념을 모르면 FK, odometry, camera projection, tf2 tree가 모두 암기 대상처럼 보인다.",
      mentalModel:
        "좌표변환은 지도를 돌리는 일이 아니라 같은 점을 다른 자와 다른 원점으로 다시 재는 일이다. 회전행렬의 각 열은 새 좌표축이 원래 좌표계에서 어디를 향하는지 나타내므로, 열벡터의 직교성과 길이 1 조건이 곧 '회전은 길이와 각도를 보존한다'는 뜻이 된다.",
      variables: [
        "p_A: frame A에서 표현한 점 또는 벡터",
        "R_AB: frame B의 basis를 frame A에서 본 회전행렬",
        "t_AB: frame A에서 본 frame B 원점의 위치",
        "T_AB: R_AB와 t_AB를 합친 homogeneous transform",
      ],
      principles: [
        "회전행렬은 직교행렬이므로 R^T R=I이고 역행렬은 전치행렬이다.",
        "점 변환은 p_A = R_AB p_B + t_AB로 쓰며, transform chain은 T_AC = T_AB T_BC처럼 곱한다.",
        "방향 벡터에는 평행이동이 적용되지 않지만, 점에는 회전과 평행이동이 모두 적용된다.",
        "tf2, URDF, camera extrinsic은 모두 이 변환 체인을 코드와 메시지로 표현한 것이다.",
      ],
      formulas: [
        formula("2D rotation", "R(theta) = [[cos(theta), -sin(theta)], [sin(theta), cos(theta)]]", "yaw 회전의 기본 행렬."),
        formula("rigid transform", "p_A = R_AB p_B + t_AB", "frame B의 점을 frame A 표현으로 바꾼다."),
        formula("inverse transform", "T_AB^-1 = [[R_AB^T, -R_AB^T t_AB], [0, 1]]", "회전의 직교성을 이용한 역변환."),
      ],
      derivation: [
        "2D에서 unit x축 e1=[1,0]^T를 theta만큼 돌리면 [cos(theta), sin(theta)]^T가 된다.",
        "unit y축 e2=[0,1]^T를 같은 각도로 돌리면 [-sin(theta), cos(theta)]^T가 된다.",
        "회전행렬은 변환된 basis를 열로 쌓은 행렬이므로 R(theta)의 두 열이 곧 새 basis다.",
        "역변환은 p_B = R_AB^T (p_A - t_AB)로 얻는다. 여기서 R^-1=R^T가 핵심이다.",
      ],
      proof: [
        "R의 두 열벡터 내적은 cos(theta)(-sin(theta))+sin(theta)cos(theta)=0이므로 서로 직교한다.",
        "각 열벡터의 길이는 cos^2(theta)+sin^2(theta)=1이므로 단위벡터다.",
        "따라서 R^T R=I이고 회전은 벡터 길이와 벡터 사이 각도를 보존한다.",
      ],
      workedExample: {
        prompt: "p_B=(1,0), theta=90도, t_AB=(2,3)일 때 p_A를 구하라.",
        steps: ["R(90)p_B=(0,1)", "p_A=(0,1)+(2,3)", "따라서 p_A=(2,4)"],
        result: "회전 후 평행이동한다는 순서가 중요하다.",
      },
      implementationNotes: [
        "C++에서는 Eigen::Matrix3d 또는 tf2::Transform으로 transform을 명확히 표현한다.",
        "ROS 2에서는 frame 이름과 timestamp를 같이 봐야 오래된 transform을 잘못 쓰지 않는다.",
        "코드 테스트는 T*T^-1이 identity에 가까운지, transform chain 순서가 맞는지 확인한다.",
      ],
      engineeringMeaning: [
        "카메라-로봇팔 hand-eye calibration, odom-base_link, map-odom 관계는 모두 같은 수학을 공유한다.",
        "좌표계 오류는 값이 조금 틀리는 문제가 아니라 방향이 완전히 반대로 가는 문제를 만든다.",
      ],
      commonMistakes: [
        "T_AB와 T_BA를 이름만 보고 뒤섞는다.",
        "점과 방향 벡터를 구분하지 않고 둘 다 평행이동한다.",
        "degree와 radian을 섞어 회전행렬을 만든다.",
      ],
      examTargets: ["회전행렬 구성", "역변환 유도", "frame chain 순서 판별", "수치 예제 계산"],
    };
  }

  if (id.includes("probability") || id.includes("kalman") || id.includes("kf-ekf-pf") || id.includes("sensor-fusion") || id.includes("covariance")) {
    return {
      subject: "확률추정과 센서융합",
      coreQuestion: "노이즈가 있는 센서 관측을 어떻게 믿을 만한 상태 추정값과 불확실성으로 바꿀 것인가?",
      concept:
        "확률추정은 센서값을 하나의 정답으로 믿지 않고 평균과 공분산을 가진 믿음 상태로 다루는 학문이다. Kalman Filter는 예측 모델로 다음 상태를 먼저 추정하고, 센서 관측이 들어오면 두 정보의 불확실성을 비교해 가중 평균처럼 보정한다. EKF/UKF/Particle Filter는 이 아이디어를 비선형 시스템에 맞게 확장한다.",
      mentalModel:
        "두 사람이 같은 위치를 다른 정확도로 말한다고 생각하면 된다. GPS가 거칠고 wheel odometry가 짧은 시간에는 안정적이면, 가까운 시간에는 odometry를 더 믿고 장기 drift는 GPS나 map observation으로 보정한다. 공분산은 각 사람이 얼마나 자신 있게 말하는지 나타내는 타원이다.",
      variables: [
        "x: 추정하려는 상태 벡터",
        "P: 상태 추정의 공분산",
        "Q: motion model 또는 process noise 공분산",
        "R: measurement noise 공분산",
        "K: Kalman gain, 예측과 관측의 혼합 비율",
      ],
      principles: [
        "prediction 단계에서는 모델을 따라 상태를 전파하고 불확실성은 보통 증가한다.",
        "update 단계에서는 관측 residual을 Kalman gain으로 반영해 평균과 공분산을 줄인다.",
        "공분산 행렬의 대각항은 각 변수 분산, 비대각항은 변수 간 상관관계다.",
        "시간 동기화와 frame calibration이 틀리면 수식이 맞아도 fusion 결과가 틀어진다.",
      ],
      formulas: [
        formula("Bayes update", "p(x|z) = p(z|x)p(x)/p(z)", "관측 z가 들어왔을 때 belief를 갱신하는 기본식."),
        formula("KF predict covariance", "P' = F P F^T + Q", "선형화된 모델로 불확실성을 전파."),
        formula("Kalman gain", "K = P' H^T (H P' H^T + R)^-1", "예측과 관측을 섞는 비율."),
        formula("KF update", "x = x' + K(z - H x')", "innovation을 상태에 반영."),
      ],
      derivation: [
        "상태 전이는 x'=f(x,u)로 예측하고, 작은 오차에 대해서 F=partial f/partial x로 선형화한다.",
        "선형 변환 AX의 공분산은 A Sigma A^T이므로 P'=F P F^T가 된다.",
        "모델 자체의 흔들림을 process noise Q로 더한다.",
        "관측 residual z-Hx'의 신뢰도는 H P' H^T + R이며, 이를 이용해 K를 계산한다.",
        "K가 크면 관측을 더 믿고, K가 작으면 예측을 더 믿는다.",
      ],
      proof: [
        "공분산 정의 E[(X-mu)(X-mu)^T]에 Y=AX를 대입하면 Cov(Y)=A Cov(X) A^T가 된다.",
        "Gaussian prior와 Gaussian measurement likelihood를 곱하면 다시 Gaussian이 되므로 평균과 공분산 갱신만 추적하면 된다.",
        "Kalman gain 식은 update 후 posterior covariance를 최소화하는 선형 추정기의 해로 유도된다.",
      ],
      workedExample: {
        prompt: "예측 분산 P'=4, 센서 분산 R=1인 1D 측정에서 K를 구하라.",
        steps: ["K=P'/(P'+R)", "K=4/(4+1)", "K=0.8이므로 관측을 강하게 반영한다."],
        result: "센서가 예측보다 더 정확하므로 update가 측정값 쪽으로 많이 이동한다.",
      },
      implementationNotes: [
        "robot_localization YAML에서는 각 센서별 covariance와 enabled variable mask를 함께 확인한다.",
        "IMU bias, encoder slip, LiDAR timestamp delay는 Q/R tuning보다 먼저 분리해 보아야 한다.",
        "rosbag replay에서 /tf, /odom, /imu, /scan timestamp를 같이 보며 update 순서를 검증한다.",
      ],
      engineeringMeaning: [
        "공분산은 단순한 부가 정보가 아니라 planner와 controller가 추정값을 얼마나 믿을지 결정하는 계약이다.",
        "센서융합이 잘못되면 지도와 로봇 위치가 흔들리고, 그 결과 costmap과 controller까지 연쇄적으로 나빠진다.",
      ],
      commonMistakes: [
        "Q와 R을 감으로 키우고 줄이면서 로그를 남기지 않는다.",
        "센서 frame이 다르거나 timestamp가 어긋난 상태에서 filter 수식만 의심한다.",
        "공분산 행렬의 단위와 변수 순서를 확인하지 않는다.",
      ],
      examTargets: ["Bayes update 의미", "P'=FPF^T+Q 유도", "Kalman gain 계산", "센서융합 실패 진단"],
    };
  }

  if (id.includes("optimization") || id.includes("advanced-control") || id.includes("lqr") || id.includes("mpc") || id.includes("gradient")) {
    return {
      subject: "최적화와 고급 제어",
      coreQuestion: "목표 오차와 제약 조건이 있을 때 어떤 입력이 비용을 가장 작게 만드는가?",
      concept:
        "최적화는 로봇 문제를 '좋은 해'가 아니라 비용함수를 최소화하는 해로 표현한다. Gradient descent는 비용이 가장 빨리 증가하는 방향의 반대로 움직이고, Gauss-Newton/LM은 잔차제곱 문제의 국소 2차 구조를 이용한다. LQR/MPC는 상태방정식과 비용함수, 입력 제한을 이용해 제어 명령을 계산한다.",
      mentalModel:
        "로봇 제어는 눈앞의 오차만 줄이는 운전이 아니라 미래 비용까지 고려하는 계산이다. LQR은 선형 시스템에서 부드럽고 빠른 균형점을 찾고, MPC는 매 순간 짧은 미래를 예측해 제한을 지키는 입력을 다시 푼다.",
      variables: [
        "J(theta): 최소화할 비용함수",
        "grad J: 비용의 기울기",
        "x_{k+1}=A x_k + B u_k: 선형 상태방정식",
        "Q, R: 상태오차와 입력크기의 비용 가중치",
      ],
      principles: [
        "gradient descent는 theta_{k+1}=theta_k-alpha grad J(theta_k)로 비용을 줄인다.",
        "학습률 alpha가 너무 크면 발산하고 너무 작으면 수렴이 느리다.",
        "LQR은 상태오차와 입력 사용량의 균형을 비용함수로 표현한다.",
        "MPC는 constraint를 명시적으로 넣을 수 있지만 계산시간과 실시간성이 중요하다.",
      ],
      formulas: [
        formula("gradient descent", "theta_{k+1}=theta_k - alpha grad J(theta_k)", "비용이 증가하는 방향의 반대로 업데이트."),
        formula("linear dynamics", "x_{k+1}=A x_k + B u_k", "이산시간 선형 상태공간 모델."),
        formula("quadratic cost", "J=sum_k (x_k^T Q x_k + u_k^T R u_k)", "상태오차와 입력크기의 누적 비용."),
        formula("MPC objective", "min_u J subject to x_{k+1}=f(x_k,u_k)", "모델과 제약을 만족하는 최적 입력을 찾는다."),
      ],
      derivation: [
        "비용함수 J(theta)를 현재 theta 근처에서 1차 Taylor 전개하면 J(theta+d)≈J(theta)+grad J^T d다.",
        "d=-alpha grad J를 고르면 grad J^T d=-alpha ||grad J||^2라서 작은 alpha에서 비용이 감소한다.",
        "제어에서는 상태전이 x_{k+1}=Ax_k+Bu_k를 rollout해 미래 상태를 입력 sequence의 함수로 만든다.",
        "미래 상태오차와 입력크기를 Q/R로 가중합하면 controller가 빠름과 부드러움 사이를 조절한다.",
      ],
      proof: [
        "Taylor 전개에서 gradient 방향은 함수가 가장 빨리 증가하는 방향이므로 그 반대는 국소 감소 방향이다.",
        "Q가 positive semidefinite이고 R이 positive definite이면 quadratic cost는 오차와 입력 크기에 대해 음수가 되지 않는다.",
        "선형 시스템과 quadratic cost의 조합은 Riccati 방정식으로 안정적인 feedback gain을 유도할 수 있다.",
      ],
      workedExample: {
        prompt: "J(theta)=theta^2, theta=3, alpha=0.1일 때 한 번의 gradient descent 후 theta는?",
        steps: ["grad J=2theta=6", "theta_new=3-0.1*6", "theta_new=2.4"],
        result: "비용은 9에서 5.76으로 줄어든다.",
      },
      implementationNotes: [
        "최적화 실험은 초기값, step size, iteration count, termination 조건을 반드시 기록한다.",
        "MPC는 solver 시간의 tail latency가 제어주기를 넘지 않는지 측정해야 한다.",
        "LQR/MPC 결과는 saturation과 rate limit을 통과한 실제 command로 다시 검증한다.",
      ],
      engineeringMeaning: [
        "튜닝은 gain을 감으로 바꾸는 일이 아니라 비용 항과 제약을 명확히 바꾸고 metric으로 비교하는 일이다.",
        "고급 제어가 실패할 때는 모델 불일치, 제약 설정, solver 시간, 센서 지연을 분리해서 본다.",
      ],
      commonMistakes: [
        "비용함수의 단위가 다른 항들을 가중치 없이 더한다.",
        "학습률이나 solver tolerance만 바꾸고 실패 로그를 남기지 않는다.",
        "constraint를 무시한 이상적인 command를 실제 로봇에 그대로 보낸다.",
      ],
      examTargets: ["gradient descent 계산", "Taylor 감소 방향 증명", "LQR 비용식 해석", "MPC 제약 진단"],
    };
  }

  if (id.includes("jacobian") || id.includes("differential") || id.includes("inverse-kinematics")) {
    return {
      subject: "미분, Jacobian, 수치적 역기구학",
      coreQuestion: "입력 변수가 조금 바뀔 때 출력 pose나 오차가 어느 방향으로 얼마나 바뀌는가?",
      concept:
        "Jacobian은 다변수 함수의 국소 선형 근사다. 로봇팔에서는 관절속도 qdot이 말단속도 xdot으로 바뀌는 비율이고, 최적화에서는 파라미터 변화가 오차를 줄이는 방향을 찾는 도구다. IK가 어려운 이유는 FK의 역함수가 항상 단순하지 않고, singularity 근처에서 작은 말단 움직임이 큰 관절 움직임을 요구하기 때문이다.",
      mentalModel:
        "산의 지도에서 현재 위치 주변의 기울기를 보는 것과 같다. 아주 작은 영역에서는 곡선도 직선처럼 보이므로 Jacobian으로 '지금 이 순간 어느 관절을 움직이면 말단이 어느 쪽으로 가는지' 예측할 수 있다.",
      variables: [
        "q: 관절각 벡터",
        "x=f(q): 말단 위치 또는 pose",
        "J(q)=partial f / partial q: 관절 변화가 말단 변화에 주는 민감도",
        "e=x_target-x_current: IK가 줄여야 할 task-space 오차",
      ],
      principles: [
        "속도기구학은 xdot = J(q) qdot으로 표현한다.",
        "작은 오차에 대해 e ≈ J dq이므로 dq를 풀면 iterative IK update가 된다.",
        "J가 full rank가 아니면 특정 방향의 말단속도를 만들 수 없고 이것이 singularity다.",
        "Damped least squares는 J가 나쁠 때 역행렬 문제를 안정화한다.",
      ],
      formulas: [
        formula("velocity kinematics", "xdot = J(q) qdot", "관절속도에서 말단속도를 구한다."),
        formula("pseudoinverse IK", "dq = J^+ e", "국소 선형 근사에서 task error를 줄이는 관절 변화."),
        formula("DLS update", "dq = J^T (J J^T + lambda^2 I)^-1 e", "singularity 근처에서 damping을 넣은 update."),
      ],
      derivation: [
        "FK를 x=f(q)라고 두고 q 주변에서 1차 Taylor 전개를 한다.",
        "f(q+dq) ≈ f(q) + J(q)dq이므로 목표 오차 e=x_target-f(q)는 Jdq로 근사된다.",
        "정방행렬이면 dq=J^-1 e를 쓰지만, 일반 로봇은 비정방 또는 rank-deficient일 수 있다.",
        "least squares 문제 min ||Jdq-e||^2를 풀면 pseudoinverse가 나오고, 정칙성이 나쁠 때 lambda^2 I를 더하면 DLS가 된다.",
      ],
      proof: [
        "Taylor 1차 근사는 미분 가능한 함수가 작은 근방에서 선형함수처럼 행동한다는 정리에서 나온다.",
        "least squares 목적함수 ||Jdq-e||^2를 dq로 미분해 0으로 두면 normal equation이 나온다.",
        "DLS는 normal equation에 lambda^2||dq||^2 penalty를 추가한 ridge regression 형태다.",
      ],
      workedExample: {
        prompt: "2링크 팔에서 det(J)=0.02이고 task error가 크다. 왜 DLS가 필요한가?",
        steps: ["det(J)가 작으면 J의 condition이 나쁘다.", "pseudoinverse는 작은 오차도 큰 dq로 증폭할 수 있다.", "lambda^2 I를 더하면 update가 완만해진다."],
        result: "정답은 '정확도 조금 손해를 보고 안정성을 얻는다'이다.",
      },
      implementationNotes: [
        "해석 Jacobian과 finite difference Jacobian을 같은 입력에서 비교한다.",
        "IK loop는 error norm, dq norm, iteration count, damping lambda를 로그로 남긴다.",
        "joint limit과 velocity limit clamp 없이 DLS만 쓰면 실제 로봇 명령은 여전히 위험할 수 있다.",
      ],
      engineeringMeaning: [
        "MoveIt planner가 목표에 못 가거나 팔이 쭉 펴진 자세에서 흔들리는 현상은 Jacobian 조건과 연결된다.",
        "Jacobian은 위치 제어뿐 아니라 tau=J^T F로 힘/토크 해석에도 이어진다.",
      ],
      commonMistakes: [
        "Jacobian의 행과 열 의미를 외우지 않고 숫자만 계산한다.",
        "degree 단위 q를 그대로 sin/cos에 넣는다.",
        "singularity를 det(J)=0이라는 암기문장으로만 보고 rank와 조작가능성 의미를 놓친다.",
      ],
      examTargets: ["Taylor 전개", "Jdq=e 유도", "DLS 빈칸", "det(J)와 singularity 해석"],
    };
  }

  if (
    id.includes("rigid-body-dynamics") ||
    id.includes("trajectory-polynomial") ||
    id.includes("controller-design") ||
    id.includes("computed-torque")
  ) {
    return {
      subject: "로봇팔 동역학·궤적·제어",
      coreQuestion: "원하는 관절 궤적을 실제 모터 토크와 안정적인 추종으로 어떻게 연결할 것인가?",
      concept:
        "운동학이 '어디에 있는가'를 다룬다면 동역학은 '어떤 힘/토크가 있어야 그렇게 움직이는가'를 다룬다. M(q), C(q,qdot), g(q)는 각각 관성, 속도에 의한 결합항, 중력항을 나타낸다. 궤적 생성은 관절 목표를 시간함수로 만들고, 제어기는 오차를 줄이면서 actuator limit 안에서 명령을 낸다.",
      mentalModel:
        "무거운 문을 움직일 때 처음에는 더 큰 힘이 필요하고, 빨리 움직이면 관성 때문에 멈추기도 어렵다. 로봇팔도 링크 질량과 자세에 따라 같은 위치 오차라도 필요한 토크가 달라진다.",
      variables: [
        "q, qdot, qddot: 관절 위치, 속도, 가속도",
        "tau: 관절 토크",
        "M(q): 관성행렬",
        "C(q,qdot): 코리올리/원심 항",
        "g(q): 중력보상 항",
      ],
      principles: [
        "동역학 기본식은 M(q)qddot + C(q,qdot)qdot + g(q)=tau다.",
        "trajectory는 위치뿐 아니라 속도와 가속도 연속성을 만족해야 actuator command가 부드럽다.",
        "PD 제어는 feedback으로 오차를 줄이고 중력보상/feedforward는 예측 가능한 부하를 미리 상쇄한다.",
        "computed torque는 모델 기반 feedforward와 error dynamics 설계를 결합한다.",
      ],
      formulas: [
        formula("manipulator dynamics", "M(q) qddot + C(q,qdot) qdot + g(q) = tau", "로봇팔 토크와 가속도의 관계."),
        formula("PD control", "tau = Kp(q_d-q) + Kd(qdot_d-qdot) + g(q)", "오차 feedback과 중력보상."),
        formula("quintic boundary", "s(t)=10 tau^3 - 15 tau^4 + 6 tau^5", "0속도/0가속도 시작과 끝을 만족하는 normalized trajectory."),
      ],
      derivation: [
        "원하는 관절 경로 q_d(t)를 먼저 정한다.",
        "quintic s(t)는 s(0)=0, s(1)=1, s'(0)=s'(1)=0, s''(0)=s''(1)=0을 만족하도록 계수를 푼다.",
        "제어 오차 e=q_d-q, edot=qdot_d-qdot를 만들고 Kp e + Kd edot로 feedback torque를 만든다.",
        "팔의 자세에 따른 중력항 g(q)를 더하면 같은 오차에서도 내려가는 방향과 올라가는 방향의 토크 차이를 보상한다.",
      ],
      proof: [
        "quintic polynomial은 6개 계수와 6개 경계조건을 가지므로 유일한 계수해를 갖는다.",
        "단순 1자유도에서 e''+Kd e'+Kp e=0 형태가 되면 Kp,Kd가 양수일 때 감쇠진동 또는 과감쇠로 오차가 줄어든다.",
        "관성행렬 M(q)는 물리적으로 운동에너지의 quadratic form에서 나오므로 대칭 양의 정부호 성질을 갖는다.",
      ],
      workedExample: {
        prompt: "q_d=1.0, q=0.8, qdot_d=0, qdot=0.1, Kp=20, Kd=4, g(q)=2일 때 tau는?",
        steps: ["e=0.2", "edot=-0.1", "feedback=20*0.2+4*(-0.1)=3.6", "tau=3.6+2=5.6"],
        result: "중력보상을 더한 최종 토크 명령은 5.6이다.",
      },
      implementationNotes: [
        "ros2_control controller는 command interface, state interface, update rate가 수식의 q/qdot/tau와 맞아야 한다.",
        "trajectory 실행 전 joint limit, velocity limit, acceleration limit을 검사한다.",
        "실험 로그에는 desired, measured, error, command, saturation 여부를 같은 timestamp로 저장한다.",
      ],
      engineeringMeaning: [
        "동역학을 이해하면 팔이 느리게 처지는 문제와 planner 경로 문제를 구분할 수 있다.",
        "부드러운 궤적은 하드웨어 수명을 늘리고 controller saturation을 줄인다.",
      ],
      commonMistakes: [
        "위치 목표만 부드러우면 된다고 생각하고 속도/가속도 discontinuity를 놓친다.",
        "Kp만 키워 overshoot와 진동을 만든다.",
        "모델 기반 보상 없이 중력 방향 자세에서 생기는 steady-state error를 controller 탓으로만 본다.",
      ],
      examTargets: ["동역학 식 해석", "quintic 경계조건", "PD+중력보상 계산", "controller 로그 진단"],
    };
  }

  if (id.includes("manipulator") || id.includes("dh-poe") || id.includes("forward-kinematics")) {
    return {
      subject: "로봇팔 운동학과 제어",
      coreQuestion: "관절공간의 숫자를 어떻게 말단 pose, 속도, 궤적, 제어 명령으로 바꿀 것인가?",
      concept:
        "로봇팔은 링크와 조인트가 만든 기하학적 사슬이다. FK는 관절값에서 말단 pose를 계산하고, IK는 원하는 말단 pose를 만들 관절값을 찾는다. trajectory는 시간에 따라 관절값이 어떻게 변해야 부드러운지 정하고, 제어기는 그 목표를 실제 actuator 명령으로 바꾼다.",
      mentalModel:
        "로봇팔은 접히는 자를 여러 개 이어 붙인 것과 같다. 각 링크는 이전 링크 좌표계 위에 놓이고, 전체 말단 pose는 작은 transform을 순서대로 곱한 결과다. 순서가 틀리면 완전히 다른 위치가 나온다.",
      variables: [
        "q, qdot, qddot: 관절 위치/속도/가속도",
        "l_i: 링크 길이 또는 DH parameter",
        "T_i: i번째 링크 transform",
        "M(q), C(q,qdot), g(q): 동역학의 관성, 코리올리/원심, 중력항",
      ],
      principles: [
        "FK는 transform chain T_0n=T_01 T_12 ... T_(n-1)n이다.",
        "2링크 평면팔은 벡터합으로 FK를 쉽게 유도할 수 있다.",
        "quintic trajectory는 위치, 속도, 가속도 경계조건 6개를 만족해 부드럽게 출발/정지한다.",
        "PD 제어는 오차와 오차 변화율을 줄이고, feedforward는 예측 가능한 중력/동역학 항을 미리 보상한다.",
      ],
      formulas: [
        formula("2-link FK x", "x = l1 cos(q1) + l2 cos(q1+q2)", "두 링크 x성분의 합."),
        formula("2-link FK y", "y = l1 sin(q1) + l2 sin(q1+q2)", "두 링크 y성분의 합."),
        formula("quintic blend", "s(t)=10 tau^3 - 15 tau^4 + 6 tau^5", "tau=t/T에서 0속도/0가속도 경계조건을 만족."),
      ],
      derivation: [
        "첫 링크 벡터는 base frame에서 [l1 cos(q1), l1 sin(q1)]이다.",
        "두 번째 링크는 첫 링크 기준 q2만큼 더 돌아가므로 base 기준 각도는 q1+q2다.",
        "말단 위치는 두 링크 벡터의 합이다.",
        "trajectory는 q(t)=q0+(qf-q0)s(t)로 두고 s(0)=0, s(1)=1, s'(0)=s'(1)=0, s''(0)=s''(1)=0을 만족하게 계수를 푼다.",
      ],
      proof: [
        "링크 벡터를 같은 base frame으로 표현했기 때문에 벡터합이 가능하다.",
        "회전은 길이를 보존하므로 각 링크 길이는 변하지 않고 방향만 q로 바뀐다.",
        "quintic polynomial은 6개 계수를 갖고 경계조건 6개를 정확히 만족할 수 있다.",
      ],
      workedExample: {
        prompt: "l1=1, l2=0.7, q1=30도, q2=60도일 때 말단 위치를 구하라.",
        steps: ["q1+q2=90도", "x=1*cos30+0.7*cos90=0.866", "y=1*sin30+0.7*sin90=1.2"],
        result: "말단은 (0.866, 1.2)에 있고, 이 값은 FK 시각화에서 바로 확인할 수 있다.",
      },
      implementationNotes: [
        "URDF joint origin과 수식의 frame convention이 같은지 확인한다.",
        "MoveIt planning 실패는 collision, joint limit, start state, goal tolerance로 나눠 본다.",
        "ros2_control에서는 controller update rate와 command interface가 실제 제어 품질에 직접 영향을 준다.",
      ],
      engineeringMeaning: [
        "운동학을 이해하면 planner가 낸 궤적을 RViz에서 보는 데서 멈추지 않고 왜 그런 경로가 나왔는지 해석할 수 있다.",
        "하드웨어 실험 전 trajectory와 제한을 확인하는 것은 모터 과부하와 충돌 위험을 줄인다.",
      ],
      commonMistakes: [
        "FK transform 곱셈 순서를 바꾼다.",
        "IK에서 reachable check 없이 acos에 1보다 큰 값을 넣는다.",
        "trajectory가 위치만 맞으면 된다고 생각하고 속도/가속도 불연속을 놓친다.",
      ],
      examTargets: ["FK 벡터합", "IK reachable 조건", "trajectory 경계조건", "MoveIt 실패 원인 분해"],
    };
  }

  if (
    id.includes("ros2") ||
    id.includes("cpp") ||
    id.includes("python") ||
    id.includes("experiment") ||
    id.includes("logging") ||
    id.includes("source-map") ||
    id.includes("doc-reading") ||
    id.includes("final-loop")
  ) {
    return {
      subject: "ROS 2 시스템공학과 실험 재현성",
      coreQuestion: "알고리즘을 ROS 2 노드, 메시지, 파라미터, 로그, 빌드 구조로 어떻게 재현 가능하게 만들 것인가?",
      concept:
        "ROS 2는 단순한 실행 도구가 아니라 분산 시스템의 계약을 정하는 프레임워크다. topic은 데이터 흐름, service/action은 요청-응답과 장기 작업, tf2는 시간 stamped frame graph, parameter는 실험 조건, launch는 실행 조합을 의미한다. 재현 가능한 학습은 코드와 함께 입력 데이터, 파라미터, 버전, 로그를 남기는 일이다.",
      mentalModel:
        "하나의 로봇 프로그램은 여러 연구자가 동시에 쓰는 실험 장치와 같다. 메시지 이름, frame 이름, QoS, launch argument가 조금만 달라도 다른 실험이 된다. 그래서 ROS 2 시스템은 알고리즘보다 계약 관리가 먼저다.",
      variables: [
        "node: 계산 책임을 가진 process 또는 component",
        "topic: 시간에 따라 흐르는 message stream",
        "QoS: reliability, durability, history 같은 통신 정책",
        "launch/param: 실행 구성과 실험 조건",
      ],
      principles: [
        "package 구조는 build, dependency, test, launch를 분리해 반복 실험을 빠르게 만든다.",
        "tf2는 frame 관계와 timestamp를 같이 관리하므로 최신 transform인지 확인해야 한다.",
        "QoS mismatch는 코드가 맞아도 메시지가 안 보이는 대표 원인이다.",
        "rosbag2와 parameter snapshot은 실험 재현성의 최소 증거다.",
      ],
      formulas: [
        formula("experiment record", "run = code_version + params + bag + metrics", "재현 가능한 실험의 최소 구성."),
        formula("topic rate", "hz = messages / seconds", "센서와 명령 topic의 실제 주기."),
        formula("latency", "latency = t_output - t_input", "pipeline 지연시간."),
      ],
      derivation: [
        "알고리즘 함수를 library로 분리하고 node는 ROS 2 입출력 변환을 담당하게 한다.",
        "launch 파일은 어떤 node와 parameter가 함께 실행되는지 선언한다.",
        "실험 시작 시 git commit, parameter YAML, rosbag topic 목록을 저장한다.",
        "실험 후 metric CSV와 그래프를 만들어 같은 입력에서 다음 변경과 비교한다.",
      ],
      proof: [
        "같은 code version, 같은 parameter, 같은 rosbag input을 사용하면 알고리즘 변경의 영향을 분리해서 비교할 수 있다.",
        "topic 주기와 latency를 기록하면 성능 변화가 알고리즘 품질인지 시스템 지연인지 구분할 근거가 생긴다.",
      ],
      workedExample: {
        prompt: "추론 노드가 느려졌다. 재현을 위해 남길 4가지는?",
        steps: ["git commit hash", "parameter YAML", "입력 rosbag2", "preprocess/inference/postprocess latency metric"],
        result: "이 네 가지가 있어야 다음 실행에서 같은 조건을 만들고 병목을 비교할 수 있다.",
      },
      implementationNotes: [
        "colcon build --packages-select로 변경한 패키지만 빠르게 빌드한다.",
        "ros2 launch ... --show-args로 실험 파라미터를 확인하고 기본값을 노트에 남긴다.",
        "ros2 topic hz/echo와 tf2_tools view_frames로 데이터 흐름과 frame graph를 먼저 검증한다.",
      ],
      engineeringMeaning: [
        "좋은 알고리즘도 ROS 2 계약이 흔들리면 시스템에서는 실패한다.",
        "재현성은 논문식 형식이 아니라 디버깅 시간을 줄이는 실전 기술이다.",
      ],
      commonMistakes: [
        "노드 안에 알고리즘과 ROS 2 입출력을 모두 섞어 테스트하기 어렵게 만든다.",
        "parameter를 바꿨지만 어떤 값으로 실험했는지 기록하지 않는다.",
        "QoS와 timestamp를 확인하지 않고 subscriber 콜백이 안 돈다고 코드만 고친다.",
      ],
      examTargets: ["ROS 2 통신 계약", "QoS/tf2 디버깅", "실험 재현성 구성", "latency/topic hz 계산"],
    };
  }

  if (id.includes("mobile") || id.includes("pure") || id.includes("astar") || id.includes("costmap")) {
    return {
      subject: "모바일 로봇 위치추정·계획·제어",
      coreQuestion: "로봇이 지금 어디 있고, 어디로 갈 수 있으며, 다음 속도 명령은 무엇인가?",
      concept:
        "모바일 로봇은 pose를 시간에 따라 적분하면서 움직인다. localization은 odometry drift를 센서 관측으로 줄이고, costmap은 주변 공간을 통과 가능/위험/장애물 영역으로 표현한다. global planner는 큰 길을 찾고, local controller는 현재 속도 제한과 장애물 상황에서 안전한 명령을 만든다.",
      mentalModel:
        "자율주행은 지도 위에 선을 긋는 문제 하나가 아니라, '내 위치 추정', '갈 수 있는 공간 계산', '목표까지의 경로', '지금 당장 낼 속도'가 매 주기 이어지는 폐루프 시스템이다.",
      variables: [
        "x,y,theta: 2D pose",
        "vl, vr, b: 왼쪽/오른쪽 바퀴 속도와 wheel base",
        "P, Q, R: 상태 공분산, process noise, measurement noise",
        "g(n), h(n), f(n): A*의 누적비용, heuristic, 총 비용",
      ],
      principles: [
        "차동구동의 선속도는 좌우 바퀴 평균, 각속도는 속도 차이를 wheel base로 나눈 값이다.",
        "EKF는 prediction으로 불확실성이 커지고 measurement update로 줄어드는 반복 구조다.",
        "A*는 admissible heuristic을 쓰면 최단 경로성을 유지한다.",
        "Pure Pursuit는 lookahead target을 향한 원호 곡률을 계산한다.",
      ],
      formulas: [
        formula("differential drive", "v=(vr+vl)/2, omega=(vr-vl)/b", "바퀴 속도에서 body twist를 계산."),
        formula("EKF prediction", "P' = F P F^T + Q", "선형화된 모델로 공분산을 예측."),
        formula("A* score", "f(n)=g(n)+h(n)", "누적 비용과 휴리스틱의 합."),
        formula("Pure Pursuit curvature", "kappa = 2 y / Ld^2", "로봇 좌표계 lookahead target y에서 곡률 계산."),
      ],
      derivation: [
        "좌우 바퀴 이동거리 dl=vl dt, dr=vr dt를 둔다.",
        "중심 이동거리는 (dl+dr)/2이고 heading 변화는 (dr-dl)/b다.",
        "body frame 전진속도를 world frame으로 회전하면 dx=v cos(theta)dt, dy=v sin(theta)dt가 된다.",
        "Pure Pursuit는 로봇과 lookahead point를 잇는 원호를 가정하고 기하적으로 kappa=2y/Ld^2를 얻는다.",
      ],
      proof: [
        "바퀴가 미끄러지지 않는다면 양쪽 바퀴가 만든 호의 길이 차이가 회전각을 결정한다.",
        "A*에서 h가 실제 남은 비용보다 크지 않으면 최적 후보를 f-cost에서 부당하게 제외하지 않는다.",
        "EKF covariance 식은 선형 변환 AX의 공분산이 A Sigma A^T가 된다는 성질에서 나온다.",
      ],
      workedExample: {
        prompt: "vl=0.2, vr=0.6, b=0.5일 때 omega를 구하라.",
        steps: ["속도 차이는 0.4", "wheel base 0.5로 나눈다", "omega=0.8 rad/s"],
        result: "오른쪽 바퀴가 더 빠르므로 로봇은 왼쪽으로 회전한다.",
      },
      implementationNotes: [
        "Nav2 디버깅은 map/odom/base_link frame, costmap, planner, controller를 분리해서 본다.",
        "rosbag2에는 /tf, /odom, /cmd_vel, /scan 같은 재현 필수 topic을 기록한다.",
        "parameter를 바꿀 때는 tracking error, collision, latency, recovery count를 함께 기록한다.",
      ],
      engineeringMeaning: [
        "lookahead를 키우면 곡률이 작아져 부드럽지만 코너 반응은 늦어진다.",
        "costmap inflation이 크면 안전 여유가 커지지만 좁은 통로를 못 지나갈 수 있다.",
      ],
      commonMistakes: [
        "odom frame과 map frame의 역할을 혼동한다.",
        "local planner 문제를 global planner 문제로 착각한다.",
        "heuristic이 admissible해야 한다는 조건을 빼고 A* 최적성을 설명한다.",
      ],
      examTargets: ["odometry 수치계산", "EKF covariance 식", "A* admissibility", "Pure Pursuit 곡률 변화 해석"],
    };
  }

  if (id.includes("ai")) {
    return {
      subject: "AI 학습·평가·배포",
      coreQuestion: "센서 데이터를 모델 입력 텐서로 바꾸고, 그 출력이 로봇 의사결정에 충분히 믿을 만한지 어떻게 검증할 것인가?",
      concept:
        "로봇 AI는 모델 구조만의 문제가 아니다. 데이터 분할, 전처리, loss, metric, export, runtime, latency가 모두 연결되어야 한다. 학습 때의 Python 결과와 배포 때의 C++ ONNX Runtime 결과가 같은 입력에서 같은 의미를 내야 실제 시스템에 넣을 수 있다.",
      mentalModel:
        "AI pipeline은 물류 라인과 같다. 이미지가 resize, color conversion, normalization, tensor shape 변환을 거쳐 모델에 들어가고, 출력은 threshold와 postprocess를 거쳐 ROS 2 메시지가 된다. 어느 한 단계가 학습 때와 다르면 전체 결과가 바뀐다.",
      variables: [
        "x: 입력 tensor",
        "y: 정답 label 또는 target",
        "p_i: 모델이 예측한 class 확률",
        "TP, FP, FN, TN: confusion matrix 원소",
      ],
      principles: [
        "cross entropy는 정답 class 확률이 작을수록 큰 loss를 준다.",
        "accuracy는 class imbalance에서 위험을 숨길 수 있어 precision/recall/F1을 함께 봐야 한다.",
        "ONNX export 후에는 input/output name, shape, dtype, normalization 계약을 고정해야 한다.",
        "로봇에서는 정확도뿐 아니라 latency와 failure mode가 배포 가능성을 결정한다.",
      ],
      formulas: [
        formula("cross entropy", "L=-sum_i y_i log(p_i)", "정답 class 확률의 음의 로그우도."),
        formula("precision", "TP/(TP+FP)", "positive 예측의 순도."),
        formula("recall", "TP/(TP+FN)", "실제 positive 회수율."),
        formula("F1", "2 P R/(P+R)", "precision과 recall의 조화평균."),
      ],
      derivation: [
        "one-hot y에서는 정답 class 항만 남아 L=-log(p_correct)가 된다.",
        "precision은 예측 positive 집합 중 실제 positive 비율이므로 분모가 TP+FP다.",
        "recall은 실제 positive 집합 중 찾아낸 비율이므로 분모가 TP+FN이다.",
        "F1은 두 비율 중 하나가 낮을 때 함께 낮아지도록 조화평균을 쓴다.",
      ],
      proof: [
        "-log(p)는 p가 1에 가까우면 0에 가까워지고 p가 0에 가까우면 커진다.",
        "따라서 cross entropy 최소화는 정답 class 확률을 키우는 방향의 학습과 일치한다.",
        "조화평균은 산술평균보다 작은 값에 민감하므로 precision/recall 불균형을 잘 드러낸다.",
      ],
      workedExample: {
        prompt: "TP=45, FP=5, FN=15일 때 precision, recall, F1을 계산하라.",
        steps: ["precision=45/(45+5)=0.9", "recall=45/(45+15)=0.75", "F1=2*0.9*0.75/(1.65)=0.818"],
        result: "정확도 하나보다 어떤 오류가 많은지 더 잘 보인다.",
      },
      implementationNotes: [
        "OpenCV는 BGR, 많은 학습 코드는 RGB를 쓰므로 channel order를 반드시 확인한다.",
        "ONNX Runtime C++에서는 input tensor memory layout과 dtype을 명시적으로 맞춘다.",
        "latency는 preprocess, inference, postprocess로 쪼개 로그를 남긴다.",
      ],
      engineeringMeaning: [
        "false negative가 위험한 검출 문제에서는 recall이 안전성 지표가 된다.",
        "배포 후 output shape이 이상하면 모델 head가 아닌 중간 feature가 export됐는지 확인한다.",
      ],
      commonMistakes: [
        "train/validation/test split을 섞어 성능을 과대평가한다.",
        "학습과 배포에서 normalization mean/std가 다르다.",
        "ONNX output shape만 보고 postprocess 계약을 확인하지 않는다.",
      ],
      examTargets: ["cross entropy 의미", "metric 계산", "전처리 계약", "ONNX shape 문제 진단"],
    };
  }

  if (id.includes("llm")) {
    return {
      subject: "LLM prompt·retrieval·evaluation harness",
      coreQuestion: "언어 모델 출력이 우연히 좋아 보이는지, 근거와 평가를 갖춘 시스템인지 어떻게 구분할 것인가?",
      concept:
        "LLM 시스템은 prompt 한 줄이 아니라 문서 chunking, retrieval, context assembly, model call, parser, evaluator가 이어진 pipeline이다. 로봇/AI 학습에서 LLM을 쓰려면 답변 품질뿐 아니라 근거 chunk, latency, 실패 유형을 로그로 남겨야 한다.",
      mentalModel:
        "retrieval은 시험장에 들고 들어갈 참고자료를 고르는 일이다. 너무 적게 가져가면 근거가 부족하고, 너무 많이 가져가면 핵심이 흐려진다. eval harness는 같은 문제지를 반복해서 풀려 변경이 개선인지 회귀인지 보는 장치다.",
      variables: [
        "q: 사용자 질문 또는 task input",
        "c_i: 검색 후보 chunk",
        "sim(q,c_i): query와 chunk의 유사도",
        "pass rate: eval set에서 기준을 통과한 비율",
      ],
      principles: [
        "prompt는 역할, 목표, 제약, 출력 형식을 분리해야 평가 가능하다.",
        "retrieval은 top-k chunk 선택으로 context window 예산을 배분한다.",
        "golden output은 완전일치보다 필수 조건 충족 여부로 쪼개는 것이 견고하다.",
        "trace에는 prompt version, retrieved chunk id, output, grader result, latency가 들어가야 한다.",
      ],
      formulas: [
        formula("cosine similarity", "sim(a,b)=a dot b/(||a|| ||b||)", "embedding 검색의 기본 유사도."),
        formula("pass rate", "passed/total", "eval set 통과 비율."),
      ],
      derivation: [
        "문서를 의미 단위 chunk로 나눈다.",
        "query와 chunk embedding을 같은 공간에 놓고 cosine similarity를 계산한다.",
        "상위 k개 chunk를 prompt context로 넣는다.",
        "출력을 parser로 구조화하고 grader로 pass/fail을 기록한다.",
      ],
      proof: [
        "cosine similarity는 벡터 크기가 아니라 방향을 비교하므로 긴 문서와 짧은 질문의 scale 차이를 줄인다.",
        "pass rate는 Bernoulli trial의 평균으로 볼 수 있어 regression 비교의 최소 통계량이 된다.",
      ],
      workedExample: {
        prompt: "20개 eval 중 17개 통과하면 pass rate는?",
        steps: ["passed=17", "total=20", "pass rate=17/20=0.85"],
        result: "prompt 변경 전후 pass rate와 실패 유형을 함께 비교한다.",
      },
      implementationNotes: [
        "eval JSONL에는 input, expected criteria, metadata를 넣는다.",
        "retrieved chunk id와 prompt version을 trace에 저장한다.",
        "latency는 retrieval, model, parsing으로 나눠 병목을 찾는다.",
      ],
      engineeringMeaning: [
        "로봇 시스템에서 LLM은 근거 없는 지시를 만들 수 있으므로 grounding과 evaluator가 중요하다.",
        "하네스가 있어야 prompt 변경이 개선인지 감으로 판단하지 않는다.",
      ],
      commonMistakes: [
        "좋아 보이는 예시 하나로 prompt를 확정한다.",
        "retrieval 실패와 model reasoning 실패를 같은 오류로 묶는다.",
        "출력 형식을 parser가 검증하지 않는다.",
      ],
      examTargets: ["chunking/retrieval 흐름", "cosine similarity", "pass rate", "trace 설계"],
    };
  }

  if (id.includes("realtime") || id.includes("safety")) {
    return {
      subject: "실시간성·안전성·센서융합·평가",
      coreQuestion: "물리 시스템이 시간 안에 안전하게 반응하고, 실패를 반복 실험으로 설명할 수 있는가?",
      concept:
        "Physical AI는 알고리즘이 맞아도 늦으면 실패한다. control loop의 latency와 jitter, sensor timestamp, watchdog, rate limit, covariance tuning은 모두 물리 세계와 연결된 시스템의 기본 안전장치다.",
      mentalModel:
        "로봇은 매 순간 마감시간이 있는 시험을 본다. deadline을 넘긴 좋은 답은 늦은 답이다. 안전 상태머신은 불확실할 때 멈추는 규칙을 명확히 해 사고를 줄인다.",
      variables: [
        "T_target: 목표 제어주기",
        "T_actual: 실제 측정 주기",
        "jitter=T_actual-T_target",
        "timeout: heartbeat가 끊겼다고 판단하는 시간",
      ],
      principles: [
        "latency는 평균뿐 아니라 tail latency와 deadline miss를 봐야 한다.",
        "watchdog은 heartbeat 실패나 장애물 조건에서 zero command로 전환한다.",
        "covariance는 센서 신뢰도를 수치화해 fusion에서 가중치 역할을 한다.",
        "parameter sweep은 개선을 주장하기 위한 실험 설계다.",
      ],
      formulas: [
        formula("jitter", "jitter = T_actual - T_target", "주기 흔들림."),
        formula("deadline miss rate", "misses/total", "마감시간을 넘긴 run 비율."),
        formula("EKF covariance", "P' = F P F^T + Q", "모델 예측 불확실성 전파."),
      ],
      derivation: [
        "각 loop마다 timestamp를 찍고 연속 timestamp 차이로 T_actual을 구한다.",
        "T_actual에서 T_target을 빼면 jitter sample이 된다.",
        "deadline보다 큰 sample 수를 total sample 수로 나누면 miss rate다.",
        "parameter sweep에서는 scenario와 parameter set을 고정하고 metric만 비교한다.",
      ],
      proof: [
        "제어 입력은 샘플링된 시간 간격마다 적용되므로 dt 변화는 이산 시스템의 pole과 안정성에 영향을 준다.",
        "watchdog은 입력 정보가 오래되면 상태 추정이 현재를 대표하지 않는다는 전제에서 안전 정지로 간다.",
      ],
      workedExample: {
        prompt: "목표 주기 20ms, 측정 주기 [19,21,40]ms일 때 deadline 33.3ms miss 수는?",
        steps: ["33.3ms보다 큰 값은 40ms 하나", "misses=1", "miss rate=1/3"],
        result: "평균만 보면 놓치는 순간적 지연을 miss rate가 드러낸다.",
      },
      implementationNotes: [
        "timer callback 안의 동적 할당, blocking I/O, 큰 image processing을 의심한다.",
        "safety node는 command limit, timeout, obstacle stop을 한곳에서 검증한다.",
        "평가 결과는 baseline 대비 개선율과 failure taxonomy로 남긴다.",
      ],
      engineeringMeaning: [
        "실시간성은 고급 옵션이 아니라 제어 성능과 안전성의 기반이다.",
        "반복 평가표가 있어야 좋은 날 한 번 성공한 데모와 실제 개선을 구분한다.",
      ],
      commonMistakes: [
        "평균 latency만 보고 tail latency를 보지 않는다.",
        "센서 timestamp와 processing timestamp를 혼동한다.",
        "안전 로직을 controller 내부 곳곳에 흩어놓아 검증하기 어렵게 만든다.",
      ],
      examTargets: ["jitter 계산", "watchdog 상태 전이", "covariance 의미", "parameter sweep 평가"],
    };
  }

  return {
    subject: "Physical AI 학습 방법론과 ROS 2 시스템화",
    coreQuestion: "읽은 개념을 설명, 계산, 코드, 로그, 평가로 이어지는 학습 자산으로 바꿀 수 있는가?",
    concept:
      "이 사이트의 공통 학습 방법은 이론을 읽고 끝내지 않는 것이다. 개념을 변수와 공식으로 정의하고, 작은 수치 예제로 손계산한 뒤, Python/C++/JS 시뮬레이션과 ROS 2 로그로 확인해야 시험과 실전 모두에서 쓸 수 있다.",
    mentalModel:
      "학습 루프는 작은 과학 실험이다. 가설을 세우고, 입력을 정하고, 출력을 계산하고, 코드로 재현하고, 결과를 로그로 남긴다. 이 루프가 닫혀야 '안다'가 된다.",
    variables: [
      "scenario: 실험 조건",
      "parameter: 바꾼 값",
      "metric: 비교할 성능 수치",
      "artifact: 코드, 그래프, 로그, 노트",
    ],
    principles: [
      "정의 없이 구현하면 입력/출력 계약이 흔들린다.",
      "손계산 없이 코드를 쓰면 오류를 눈으로 잡기 어렵다.",
      "로그 없이 튜닝하면 개선과 우연을 구분할 수 없다.",
      "ROS 2 시스템에서는 topic, parameter, frame, timestamp가 모두 계약이다.",
    ],
    formulas: [
      formula("learning loop", "theory -> derivation -> code -> simulation -> log -> evaluation", "닫힌 학습 루프."),
      formula("pass rate", "success/total", "반복 실험 성공률."),
    ],
    derivation: [
      "개념을 한 문장으로 정의한다.",
      "상태, 입력, 파라미터, 출력, 노이즈를 표로 나눈다.",
      "핵심 공식을 손계산 예제로 검산한다.",
      "코드와 시각화로 같은 결과가 나오는지 확인한다.",
      "실험 로그로 다음 비교의 기준선을 만든다.",
    ],
    proof: [
      "같은 입력에서 손계산과 코드 결과가 일치하면 구현이 정의한 수식을 따랐다는 근거가 된다.",
      "같은 scenario에서 parameter만 바꿔 metric을 비교하면 개선의 원인을 좁힐 수 있다.",
    ],
    workedExample: {
      prompt: "20회 실험 중 15회 성공하면 pass rate는?",
      steps: ["success=15", "total=20", "pass rate=0.75"],
      result: "성공률만 쓰지 말고 실패 유형도 함께 기록해야 다음 개선이 가능하다.",
    },
    implementationNotes: [
      "Markdown 노트에는 정의, 공식, 손계산, 코드 링크, 로그 파일명을 같이 남긴다.",
      "ROS 2 launch와 YAML parameter를 실험 결과와 함께 versioning한다.",
      "퀴즈 오답은 관련 공식과 함께 다시 복습 카드로 돌린다.",
    ],
    engineeringMeaning: [
      "기초 학습의 목표는 많은 용어를 아는 것이 아니라, 낯선 문제를 작은 실험 단위로 쪼갤 수 있는 능력이다.",
      "이 루프는 로봇팔, 자율주행, AI, LLM 하네스에 모두 적용된다.",
    ],
    commonMistakes: [
      "개념 이름만 외우고 변수 정의를 하지 않는다.",
      "결과 그래프만 보고 입력 파라미터를 기록하지 않는다.",
      "한 번 성공한 demo를 검증된 성능으로 착각한다.",
    ],
    examTargets: ["학습 루프 설명", "pass rate 계산", "로그 설계", "ROS 2 실험 재현성"],
  };
};

const textbookUnitForTopic = (section: LessonSection, topic: MicroTopic, graphIds: TheoryGraphId[]): TheoryUnit => {
  const profile = profileForTopic(section, topic);
  const figures = graphIds.map(figureByGraphId);
  const sourceIds = sourceIdsForTopic(section, topic);
  return {
    id: `${section.id}-${topic.id}-textbook-foundation`,
    title: `${topic.title} · 전공 교재식 본문`,
    summary: `${profile.subject}: ${profile.coreQuestion}`,
    intuition: profile.mentalModel,
    assumptions: [
      "모든 수식은 먼저 좌표계, 단위, 시간 기준을 정한 뒤 사용한다.",
      "시험 문제는 이론 본문에 나온 변수 정의와 공식 유도에서 출제된다고 가정한다.",
      "브라우저 시각화와 JS 실행은 실제 ROS 2/하드웨어를 대체하지 않고 손계산 검산을 돕는다.",
    ],
    details: [
      `핵심 질문: ${profile.coreQuestion}`,
      `개념 설명: ${profile.concept}`,
      `직관 모델: ${profile.mentalModel}`,
      "변수 읽기: " + profile.variables.join(" / "),
      "기본 원리 1: " + profile.principles[0],
      "기본 원리 2: " + profile.principles[1],
      "기본 원리 3: " + profile.principles[2],
      "기본 원리 4: " + (profile.principles[3] ?? profile.principles[profile.principles.length - 1]),
      "시험 연결: 문제를 풀 때는 먼저 어떤 물리량이 입력이고 어떤 값이 출력인지 표시한다. 그 다음 단위와 frame을 맞추고, 공식에 넣을 숫자를 분리한 뒤 계산한다.",
      "실전 연결: 실제 로봇에서는 공식 자체보다 timestamp, noise, actuator limit, parameter mismatch가 결과를 흔든다. 그래서 이론, 코드, 로그를 같이 본다.",
    ],
    formulas: profile.formulas,
    derivation: profile.derivation,
    proof: profile.proof,
    engineeringMeaning: profile.engineeringMeaning,
    implementationNotes: profile.implementationNotes,
    figures,
    graphExplanations: figures.map((figure) => `${figure.title}: ${figure.explanation}`),
    workedExample: profile.workedExample,
    commonMistakes: profile.commonMistakes,
    sourceIds,
    readingGuide: readingGuideForTopic(section, topic),
  };
};

const examBridgeUnitForTopic = (section: LessonSection, topic: MicroTopic, graphIds: TheoryGraphId[]): TheoryUnit => {
  const profile = profileForTopic(section, topic);
  const figures = graphIds.slice(0, 1).map(figureByGraphId);
  const sourceIds = sourceIdsForTopic(section, topic);
  return {
    id: `${section.id}-${topic.id}-exam-bridge`,
    title: `${topic.title} · 시험 풀이 브릿지`,
    summary: "이 단원 시험문제를 풀기 위해 이론 본문에서 반드시 가져와야 하는 공식, 판단 기준, 풀이 순서를 정리한다.",
    intuition:
      "시험문제는 암기가 아니라 변환 문제다. 문장 속 상황을 변수와 공식으로 바꾸고, 수치 문제는 단위가 맞는지 확인하며, 서술 문제는 원인-공식-결과-검증 순서로 답한다.",
    assumptions: [
      "객관식은 핵심 개념의 역할을 묻고, 수치 문제는 공식 대입 능력을 묻는다.",
      "유도 문제는 완전한 긴 증명보다 핵심 단계가 빠지지 않았는지를 본다.",
      "코드 추적 문제는 코드의 변수명이 이론 변수와 어떻게 대응되는지를 본다.",
    ],
    details: [
      "먼저 문제 문장에서 조건값을 모두 표시한다. 예: link length, wheel velocity, covariance, TP/FP/FN, latency sample.",
      "두 번째로 이 값들이 들어갈 공식을 고른다. 공식 이름만 쓰지 말고 분자, 분모, 행렬 차원, frame 기준을 같이 확인한다.",
      "세 번째로 계산한다. 각도는 degree인지 radian인지 확인하고, 확률/metric은 0~1 범위인지 점검한다.",
      "네 번째로 결과를 해석한다. det(J)가 작으면 singularity, recall이 낮으면 false negative 위험, jitter가 크면 deadline miss 가능성처럼 수치의 의미를 말해야 한다.",
      "서술형 답안은 '원인 → 관련 공식/원리 → 관찰할 로그 → 수정 방향' 순서로 쓰면 대부분의 실전 문제를 안정적으로 풀 수 있다.",
      "코드 추적형 답안은 코드 줄마다 이론 변수로 다시 이름 붙인다. 예: error는 target-current, command는 gain*error, f는 g+h다.",
    ],
    formulas: [
      ...profile.formulas.slice(0, 3),
      formula("answer pattern", "condition -> formula -> calculation -> interpretation", "전문 문제 풀이 공통 구조."),
    ],
    derivation: [
      "문장의 명사를 변수로 바꾼다.",
      "변수의 단위와 frame을 확인한다.",
      "해당 단원의 핵심 공식에 대입한다.",
      "중간 계산을 한 줄 이상 남긴다.",
      "계산 결과가 시스템에서 어떤 의미인지 해석한다.",
    ],
    proof: [
      "풀이가 맞으려면 입력 변수와 공식의 차원이 일치해야 한다.",
      "유도 단계가 맞으려면 정의에서 시작해 근사 또는 보존 법칙을 명시해야 한다.",
      "실무형 문제는 하나의 정답보다 진단 순서가 중요하므로 로그와 검증 포인트를 포함해야 한다.",
    ],
    engineeringMeaning: [
      "시험을 잘 푼다는 것은 실제 디버깅 상황에서 어떤 값을 찍고 어떤 parameter를 의심할지 말할 수 있다는 뜻이다.",
      "따라서 모든 답안은 숫자 계산과 시스템 해석을 함께 가져야 한다.",
    ],
    implementationNotes: [
      "풀이 후 같은 공식을 JS 실행 실습에서 작은 숫자로 검산한다.",
      "오답은 복습 카드에서 공식과 함께 다시 본다.",
      "메모에는 틀린 이유를 '공식 선택 오류', '단위 오류', '개념 해석 오류', '코드 추적 오류'로 분류한다.",
    ],
    figures,
    graphExplanations: figures.map((figure) => `${figure.title}: ${figure.explanation}`),
    workedExample: {
      prompt: `${topic.title} 문제를 풀 때 답안 구조를 어떻게 잡을까?`,
      steps: [
        "조건값을 변수로 옮겨 적는다.",
        `핵심 공식 후보: ${profile.formulas.map((item) => item.label).slice(0, 3).join(", ")}`,
        "계산 결과를 단위와 함께 쓴다.",
        "결과가 로봇 시스템에서 의미하는 위험/성능/오차를 해석한다.",
      ],
      result: `이 단원에서 특히 설명할 수 있어야 하는 것: ${profile.examTargets.join(", ")}.`,
    },
    commonMistakes: [
      ...profile.commonMistakes.slice(0, 2),
      "문제에 나온 상황을 로그나 검증 포인트로 연결하지 않는다.",
    ],
    sourceIds,
    readingGuide: readingGuideForTopic(section, topic),
  };
};

const theoryForTopic = (section: LessonSection, topic: MicroTopic, graphIds: TheoryGraphId[]): TheoryUnit[] => {
  const figures = graphIds.map(figureByGraphId);
  const sourceIds = sourceIdsForTopic(section, topic);
  return section.theory.map((unit, index) => ({
    ...unit,
    id: `${section.id}-${topic.id}-${unit.id}`,
    title: index === 0 ? `${topic.title} · 전공서적식 이론` : `${topic.title} · ${unit.title}`,
    summary:
      index === 0
        ? `${topic.focus} 기존 PDF 항목을 정의, 직관, 수식, 증명, 계산 예제, 구현 연결 순서로 확장한다.`
        : unit.summary,
    details:
      index === 0
        ? [
            `정의: ${topic.focus}`,
            "직관: 로봇 시스템의 전문 지식은 수식 하나를 외우는 일이 아니라 상태, 입력, 파라미터, 노이즈, 시간축 사이의 관계를 설명하는 일이다.",
            "수학식: 모든 세션은 y=f(x,u,theta,t)+noise 형태로 해석할 수 있다. 여기서 x는 상태, u는 입력, theta는 파라미터, t는 시간이며 noise는 실제 센서와 actuator의 불확실성을 나타낸다.",
            "증명 관점: 정의한 변수가 같은 단위와 같은 frame에 놓이면 식의 양변 차원이 맞고, 손계산 예제와 코드 결과를 비교할 수 있다.",
            "그래프 해석: 이 단원의 미니 그래프는 식의 값이 바뀔 때 상태, 오차, 비용, 공분산, 경로가 어떻게 변하는지 시각적으로 보여준다.",
            "구현 연결: C++/Python 타이핑 실습은 구조와 API 감각을 만들고, 실행 가능한 JS 실습은 같은 수식을 즉시 실행해 숫자와 그래프로 검산한다.",
            ...unit.details,
          ]
        : unit.details,
    formulas: (index === 0
      ? [
          {
            label: `${topic.title} 상태 모델`,
            expression: "y = f(x, u, theta, t) + epsilon",
            description: "상태, 입력, 파라미터, 시간, 노이즈를 분리해 구현 가능한 관계로 만든다.",
          },
          ...unit.formulas,
        ]
      : unit.formulas
    ).map((formula) => ({ ...formula, expression: latexExpression(formula.expression) })),
    derivation:
      index === 0
        ? [
            "세션의 물리량을 상태 x, 입력 u, 파라미터 theta, 출력 y로 나눈다.",
            "좌표계와 단위를 명시해 같은 frame에서 계산한다.",
            "핵심 공식을 손계산 예제에 적용한다.",
            "동일한 식을 코드 함수로 옮기고 로그 metric으로 검증한다.",
            ...unit.derivation,
          ]
        : unit.derivation,
    proof:
      index === 0
        ? [
            "같은 좌표계와 단위를 쓰면 식의 좌변과 우변이 같은 물리 차원을 갖는다.",
            "손계산과 코드 실행 결과가 허용 오차 안에서 일치하면 구현이 이론식을 보존했다는 1차 증거가 된다.",
            "파라미터를 바꿨을 때 그래프와 metric 변화가 직관과 맞으면 모델의 해석 가능성이 커진다.",
            ...unit.proof,
          ]
        : unit.proof,
    figures,
    graphExplanations: figures.map((figure) => `${figure.title}: ${figure.explanation}`),
    sourceIds: [...new Set([...(unit.sourceIds ?? []), ...sourceIds])],
    readingGuide: [...(unit.readingGuide ?? []), ...readingGuideForTopic(section, topic)].slice(0, 4),
  }));
};

const upgradeSection = (section: LegacyLessonSection): LessonSection => {
  const simulationId = section.visualizerId;
  const graphIds = graphIdsBySection(section.id);
  const executableLabId = executableLabBySection(section.id);
  return {
    ...section,
    theory: [professionalUnit(section), ...section.theory.map((bullet, index) => legacyBulletToUnit(section, bullet, index))],
    quiz: [...advancedQuestionsForSection(section), ...section.quiz],
    cppPractice: {
      ...section.cppPractice,
      simulationId,
      executableJsStarter: executableStarter(executableLabId),
      executableJsSolution: executableStarter(executableLabId),
      expectedResultShape: expectedResultShape(executableLabId),
      checks: section.cppPractice.checks?.length ? section.cppPractice.checks : section.cppPractice.tasks,
    },
    pythonPractice: {
      ...section.pythonPractice,
      simulationId,
      executableJsStarter: executableStarter(executableLabId),
      executableJsSolution: executableStarter(executableLabId),
      expectedResultShape: expectedResultShape(executableLabId),
      checks: section.pythonPractice.checks?.length ? section.pythonPractice.checks : section.pythonPractice.tasks,
    },
    graphIds,
    executableLabId,
  };
};

const expandSections = (section: LessonSection): LessonSection[] =>
  microTopicsBySection(section).map((topic) => {
    const graphIds = topic.graphIds ?? section.graphIds ?? graphIdsBySection(section.id);
    const executableLabId = topic.executableLabId ?? section.executableLabId ?? executableLabBySection(section.id);
    const jsStarter = executableStarter(executableLabId);
    const sourceIds = sourceIdsForTopic(section, topic);
    const questions = [
      ...scenarioQuestionsForTopic(section, topic),
      ...topicQuestions(section, topic),
      ...section.quiz.map((question) => cloneQuestionForTopic(question, section, topic)),
    ];

    return {
      ...section,
      id: `${section.id}--${topic.id}`,
      title: topic.title,
      focus: topic.focus,
      level: 2,
      parentId: section.id,
      groupTitle: section.title,
      theory: [
        textbookUnitForTopic(section, topic, graphIds),
        examBridgeUnitForTopic(section, topic, graphIds),
        ...theoryForTopic(section, topic, graphIds),
      ],
      quiz: questions,
      graphIds,
      executableLabId,
      sourceIds,
      cheats: cheatsBySection(section.id),
      prerequisiteIds: prerequisiteIdsByTopic(section, topic),
      scenarioTags: scenarioTagsBySection(section.id),
      cppPractice: {
        ...section.cppPractice,
        executableJsStarter: jsStarter,
        executableJsSolution: jsStarter,
        expectedResultShape: expectedResultShape(executableLabId),
        examples: practiceExamplesForTopic(section, topic, "cpp"),
      },
      pythonPractice: {
        ...section.pythonPractice,
        executableJsStarter: jsStarter,
        executableJsSolution: jsStarter,
        expectedResultShape: expectedResultShape(executableLabId),
        examples: practiceExamplesForTopic(section, topic, "python"),
      },
      checklist: [
        `${topic.title}의 정의, 직관, 수식, 증명 흐름을 설명할 수 있다.`,
        `${topic.title}의 계산 예제를 손으로 풀고 브라우저 실행 결과와 비교했다.`,
        `${topic.title}의 코드 실습을 직접 타이핑하고 구조 검사를 통과했다.`,
        `${topic.title}의 그래프 또는 시뮬레이션 결과를 로그/metric 관점으로 해석했다.`,
        ...section.checklist.slice(0, 2),
      ],
    };
  });

const rawCurriculum: LegacyCurriculumModule[] = [
  {
    id: "overview",
    title: "0. 한눈에 보는 결론",
    summary: "Physical AI 기초역량을 수학, 로봇, 센서, 제어, AI, ROS 2 시스템으로 묶어 보는 출발점.",
    sections: [
      {
        id: "overview-core",
        title: "핵심 질문과 6축 지도",
        focus: "문서를 끝까지 따라갔을 때 설명하고 구현할 수 있어야 하는 기준을 세운다.",
        theory: [
          "로봇팔은 위치, 자세, 속도, 힘, 토크를 수식으로 설명해야 한다.",
          "모바일 로봇은 위치추정, 맵핑, 경로계획, 로컬 제어 흐름을 연결해서 봐야 한다.",
          "AI는 Python 학습 실험과 C++/ROS 2 배포 감각을 분리해서 익힌다.",
          "프롬프트, 컨텍스트, 하네스 엔지니어링은 LLM 기반 로봇 시스템의 평가와 안정성을 담당한다.",
          "전체 지도는 수학/표현, 운동학/동역학, 센서/인식, 계획/제어, AI 추론/배포, ROS 2 시스템화의 6축이다.",
        ],
        why: [
          "Physical AI는 단일 모델보다 물리 시스템 안에서 알고리즘을 연결하는 능력이 중요하다.",
          "초반에 큰 지도를 잡아야 로봇팔, 자율주행, AI, ROS 2 실습이 따로 놀지 않는다.",
        ],
        cppPractice: cpp(
          "학습 진행도 데이터 구조",
          `
#include <iostream>
#include <map>
#include <string>

struct SectionProgress {
  bool theory_done = false;
  int best_quiz_score = 0;
};

int main() {
  std::map<std::string, SectionProgress> progress;
  progress["fk_ik"].theory_done = true;
  progress["fk_ik"].best_quiz_score = 80;
  std::cout << progress["fk_ik"].best_quiz_score << "\\n";
}
          `,
          "섹션별 이론 완료와 최고 점수를 구조화해 저장하는 감각을 얻는다.",
          ["섹션 id를 추가한다.", "CSV 저장 함수를 붙인다.", "점수가 낮아지면 덮어쓰지 않도록 수정한다."],
        ),
        pythonPractice: py(
          "학습 축 진단표",
          `
axes = ["math", "manipulator", "mobile", "sensor", "control", "ai", "ros2"]
scores = dict.fromkeys(axes, 0)
scores["math"] = 2
scores["manipulator"] = 1

for name, score in scores.items():
    print(name, "#" * score)
          `,
          "내가 어느 축을 더 공부해야 하는지 간단한 텍스트 그래프로 확인한다.",
          ["점수 범위를 0-5로 확장한다.", "matplotlib 막대그래프로 바꾼다.", "JSON 파일 저장을 추가한다."],
        ),
        quiz: [
          {
            id: "overview-q1",
            type: "choice",
            prompt: "PDF가 Physical AI 기초역량을 볼 때 제시한 핵심 축이 아닌 것은?",
            choices: ["센서/인식", "계획/제어", "AI 추론/배포", "광고 캠페인 운영"],
            answer: "광고 캠페인 운영",
            explanation: "문서는 로봇과 AI 시스템 통합에 필요한 기술 축을 다룬다.",
          },
          {
            id: "overview-q2",
            type: "trueFalse",
            prompt: "이 가이드의 목표는 대형 프로젝트 예시보다 기초 이론과 C++/Python 구현 실습이다.",
            choices: ["참", "거짓"],
            answer: "참",
            explanation: "PDF는 프로젝트 예시를 제외하고 기초 이론과 구현 실습 중심으로 정리한다고 밝힌다.",
          },
        ],
        checklist: [
          "네 축: 로봇팔, 자율주행, AI, 프롬프트/컨텍스트/하네스를 말할 수 있다.",
          "6축 지도에서 내가 약한 축을 표시했다.",
          "Python 검산, C++ 구현, ROS 2 연결, 로그 기록의 반복 흐름을 설명할 수 있다.",
        ],
      },
    ],
  },
  {
    id: "prerequisites",
    title: "1. 공통 선수지식",
    summary: "수학, C++/Python, ROS 2, 실험 기록 도구를 같은 학습 기반으로 묶는다.",
    sections: [
      {
        id: "math-foundations",
        title: "수학: 선형대수, 미분, 확률, 최적화",
        focus: "FK/IK, EKF, SLAM, 신경망, 제어를 지탱하는 최소 수학을 구현 가능한 수준으로 익힌다.",
        theory: [
          "선형대수: 벡터, 내적/외적, 행렬곱, 역행렬, 회전행렬, 좌표계 변환, SVD, pseudoinverse.",
          "미분: 속도와 가속도의 물리적 의미, 편미분, chain rule, gradient, Jacobian.",
          "확률: 평균, 분산, 공분산, Gaussian, likelihood, Bayes, process/measurement noise.",
          "최적화: gradient descent, Gauss-Newton, Levenberg-Marquardt, Euler/RK 적분의 감각.",
        ],
        why: [
          "로봇팔 FK/IK/Jacobian, EKF/SLAM 상태추정, 카메라/라이다 좌표변환이 모두 행렬과 미분 위에 있다.",
          "모델 학습과 센서퓨전은 확률과 최적화 없이 튜닝 감각만으로 다루기 어렵다.",
        ],
        cppPractice: cpp(
          "2D 회전행렬과 homogeneous transform",
          `
#include <Eigen/Dense>
#include <cmath>

Eigen::Matrix3d makeTransform(double x, double y, double yaw) {
  Eigen::Matrix3d t = Eigen::Matrix3d::Identity();
  const double c = std::cos(yaw);
  const double s = std::sin(yaw);
  t(0, 0) = c;  t(0, 1) = -s; t(0, 2) = x;
  t(1, 0) = s;  t(1, 1) = c;  t(1, 2) = y;
  return t;
}
          `,
          "좌표계 변환을 행렬곱으로 연결하고 역변환을 검산한다.",
          ["두 transform을 곱해 frame composition을 확인한다.", "역행렬과 직접 inverse 공식을 비교한다.", "SVD 기반 pseudoinverse 함수를 추가한다."],
        ),
        pythonPractice: py(
          "회전 벡터 시각화",
          `
import numpy as np
import matplotlib.pyplot as plt

theta = np.deg2rad(35)
R = np.array([[np.cos(theta), -np.sin(theta)],
              [np.sin(theta),  np.cos(theta)]])
v = np.array([1.0, 0.4])
rv = R @ v

plt.arrow(0, 0, v[0], v[1], width=0.01, label="original")
plt.arrow(0, 0, rv[0], rv[1], width=0.01, color="crimson")
plt.axis("equal")
plt.grid(True)
plt.show()
          `,
          "회전 전후 벡터를 그림으로 비교한다.",
          ["각도를 바꾸며 결과를 비교한다.", "3D 회전행렬로 확장한다.", "수치 미분과 해석 미분을 비교한다."],
        ),
        visualizerId: "linear-algebra",
        quiz: [
          {
            id: "math-q1",
            type: "choice",
            prompt: "Jacobian이 특히 필요한 학습 주제는?",
            choices: ["IK와 속도기구학", "Markdown 제목 꾸미기", "파일명 정렬", "웹 폰트 선택"],
            answer: "IK와 속도기구학",
            explanation: "Jacobian은 관절속도와 말단속도의 관계, 수치 IK, singularity 분석에 직접 쓰인다.",
          },
          {
            id: "math-q2",
            type: "blank",
            prompt: "측정 노이즈와 프로세스 노이즈를 다루는 대표 확률 필터는 ____ Filter이다.",
            answer: "Kalman",
            explanation: "Kalman Filter와 EKF는 센서퓨전과 위치추정의 기본 도구다.",
          },
        ],
        checklist: [
          "2D/3D 회전행렬을 직접 만들 수 있다.",
          "homogeneous transform의 곱과 inverse를 설명할 수 있다.",
          "pseudoinverse가 IK에서 왜 필요한지 말할 수 있다.",
          "Gaussian noise가 추정값에 미치는 영향을 그래프로 봤다.",
        ],
      },
      {
        id: "cpp-python-ros2",
        title: "C++/Python/ROS 2 공통 축",
        focus: "빠른 검산은 Python, 재사용/배포는 C++, 통합은 ROS 2로 나누어 익힌다.",
        theory: [
          "C++: class/struct, STL, smart pointer, template, lambda, CMake, 라이브러리 링크, timer loop.",
          "Python: type hint, venv/conda, NumPy, matplotlib, pandas, Jupyter, OpenCV, PyTorch, argparse/logging.",
          "ROS 2 Humble: workspace/package/colcon, rclcpp/rclpy, topic/service/action, launch/params, tf2, rosbag2, RViz2.",
          "실험 기록: CSV logging, matplotlib, rosbag2, Foxglove, Git, Markdown으로 재현성을 남긴다.",
        ],
        why: [
          "Physical AI는 알고리즘 단품보다 노드, 토픽, 파라미터, 로그를 묶은 시스템으로 검증된다.",
          "실험 파라미터와 실패 로그를 남겨야 튜닝이 감이 아니라 비교가 된다.",
        ],
        cppPractice: cpp(
          "CSV logger와 timer loop",
          `
#include <chrono>
#include <fstream>
#include <thread>

int main() {
  std::ofstream log("loop.csv");
  log << "step,dt_ms\\n";
  auto prev = std::chrono::steady_clock::now();
  for (int i = 0; i < 100; ++i) {
    std::this_thread::sleep_for(std::chrono::milliseconds(20));
    auto now = std::chrono::steady_clock::now();
    double dt = std::chrono::duration<double, std::milli>(now - prev).count();
    log << i << "," << dt << "\\n";
    prev = now;
  }
}
          `,
          "루프 주기를 수치로 기록하고 제어 주기 흔들림을 확인한다.",
          ["평균/최대/최소 주기를 출력한다.", "YAML config로 목표 Hz를 바꾼다.", "ROS 2 timer callback으로 옮긴다."],
        ),
        pythonPractice: py(
          "로그 후처리",
          `
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("loop.csv")
print(df["dt_ms"].describe())
df["dt_ms"].plot(title="Control loop period")
plt.ylabel("ms")
plt.show()
          `,
          "C++에서 남긴 로그를 Python으로 읽고 주기 안정성을 확인한다.",
          ["히스토그램을 추가한다.", "deadline miss 비율을 계산한다.", "rosbag2 후처리 스크립트로 확장한다."],
        ),
        visualizerId: "latency",
        quiz: [
          {
            id: "ros2-q1",
            type: "choice",
            prompt: "ROS 2에서 frame 관계를 관리할 때 핵심 도구는?",
            choices: ["tf2", "printf", "HTML form", "npm"],
            answer: "tf2",
            explanation: "map, odom, base_link, sensor frame을 연결하는 데 tf2가 핵심이다.",
          },
          {
            id: "ros2-q2",
            type: "trueFalse",
            prompt: "실험은 파라미터, 실패 로그, 결과 그래프가 남아야 재현 가능하다.",
            choices: ["참", "거짓"],
            answer: "참",
            explanation: "PDF의 공통 원칙은 재현 가능한 실험과 자동 저장된 결과다.",
          },
        ],
        checklist: [
          "CMake로 외부 라이브러리를 링크해봤다.",
          "rclcpp 또는 rclpy publisher/subscriber skeleton을 작성했다.",
          "launch 파일과 YAML 파라미터를 연결해봤다.",
          "CSV나 rosbag2로 실험 로그를 남겼다.",
        ],
      },
    ],
  },
  {
    id: "manipulator",
    title: "2. 로봇팔 Manipulator",
    summary: "좌표계, FK/IK, Jacobian, 동역학, trajectory, 제어, URDF/MoveIt/ros2_control까지 연결한다.",
    sections: [
      {
        id: "manipulator-kinematics",
        title: "좌표계, FK, IK, Jacobian",
        focus: "관절각에서 말단 pose를 구하고, 목표 pose에서 관절각을 찾으며, 속도와 힘 변환까지 연결한다.",
        theory: [
          "자세표현: rotation matrix, Euler angle, axis-angle, quaternion, homogeneous transform.",
          "DH와 PoE는 같은 FK 문제를 다른 표기법으로 푸는 대표 방식이다.",
          "FK는 링크-조인트 체인의 transform multiplication으로 end-effector pose를 구한다.",
          "IK는 해석적 IK, Jacobian pseudoinverse, damped least squares, joint limit handling으로 나뉜다.",
          "Jacobian은 xdot = J(q) qdot, tau = J^T F, singularity, manipulability를 연결한다.",
        ],
        why: [
          "MoveIt, tf2, URDF에서 막히는 대부분의 초반 문제는 frame과 pose 표현의 혼동에서 시작한다.",
          "IK와 Jacobian을 직접 구현해야 planner/controller 결과를 신뢰하고 디버깅할 수 있다.",
        ],
        cppPractice: cpp(
          "2링크 FK와 Jacobian",
          `
#include <Eigen/Dense>
#include <cmath>

Eigen::Vector2d fk(double q1, double q2, double l1, double l2) {
  return {
    l1 * std::cos(q1) + l2 * std::cos(q1 + q2),
    l1 * std::sin(q1) + l2 * std::sin(q1 + q2)
  };
}

Eigen::Matrix2d jacobian(double q1, double q2, double l1, double l2) {
  Eigen::Matrix2d j;
  j(0,0) = -l1 * std::sin(q1) - l2 * std::sin(q1 + q2);
  j(0,1) = -l2 * std::sin(q1 + q2);
  j(1,0) =  l1 * std::cos(q1) + l2 * std::cos(q1 + q2);
  j(1,1) =  l2 * std::cos(q1 + q2);
  return j;
}
          `,
          "FK 결과와 numerical Jacobian을 비교하고 singularity 근처 condition number를 확인한다.",
          ["해석적 IK를 추가한다.", "DLS IK 반복 루프를 만든다.", "joint limit clamp를 추가한다."],
        ),
        pythonPractice: py(
          "workspace sampling",
          `
import numpy as np
import matplotlib.pyplot as plt

l1, l2 = 1.0, 0.7
pts = []
for q1 in np.linspace(-np.pi, np.pi, 80):
    for q2 in np.linspace(-np.pi, np.pi, 80):
        pts.append([l1*np.cos(q1)+l2*np.cos(q1+q2),
                    l1*np.sin(q1)+l2*np.sin(q1+q2)])
pts = np.array(pts)
plt.scatter(pts[:,0], pts[:,1], s=1)
plt.axis("equal")
plt.show()
          `,
          "reachable workspace를 산점도로 확인한다.",
          ["manipulability heatmap을 추가한다.", "target별 IK 수렴 횟수를 표시한다.", "초기값을 바꿔 local minimum을 관찰한다."],
        ),
        visualizerId: "manipulator",
        quiz: [
          {
            id: "manipulator-q1",
            type: "choice",
            prompt: "관절속도 qdot과 말단속도 xdot의 관계를 나타내는 식은?",
            choices: ["xdot = J(q) qdot", "F = ma만 사용", "loss = accuracy", "map = list"],
            answer: "xdot = J(q) qdot",
            explanation: "Jacobian은 속도기구학의 핵심 행렬이다.",
          },
          {
            id: "manipulator-q2",
            type: "blank",
            prompt: "singularity 근처에서 pseudoinverse IK를 안정화하기 위해 자주 쓰는 방법은 damped ____ squares이다.",
            answer: "least",
            explanation: "DLS는 singularity 근처에서 큰 관절속도가 튀는 문제를 줄인다.",
          },
        ],
        checklist: [
          "2링크 FK를 직접 유도하고 구현했다.",
          "2링크 해석적 IK와 수치 IK의 차이를 설명할 수 있다.",
          "Jacobian을 해석/수치 미분으로 비교했다.",
          "singularity와 manipulability를 그림으로 확인했다.",
        ],
      },
      {
        id: "manipulator-dynamics-control",
        title: "동역학, trajectory, 제어, ROS 2 연결",
        focus: "토크와 가속도, 시간축 궤적, PD/중력보상, URDF/MoveIt/ros2_control의 연결을 익힌다.",
        theory: [
          "동역학은 M(q), C(q,qdot), g(q), friction, motor/gearbox 영향으로 구성된다.",
          "trajectory generation은 cubic/quintic polynomial, trapezoidal velocity, time parameterization을 다룬다.",
          "제어는 PD/PID, gravity compensation, computed torque, impedance/admittance, task-space control로 확장된다.",
          "ROS 2 연결은 URDF/Xacro, robot_state_publisher, joint state publisher, MoveIt 2, ros2_control로 이어진다.",
        ],
        why: [
          "FK/IK만 맞아도 실제 로봇은 제어주기, 제한, 토크, 충돌 때문에 다르게 움직인다.",
          "시뮬레이터에서 먼저 dynamics와 gain sweep을 해보면 하드웨어 위험을 줄일 수 있다.",
        ],
        cppPractice: cpp(
          "quintic trajectory sampler",
          `
struct QuinticPoint {
  double position;
  double velocity;
  double acceleration;
};

QuinticPoint sample(double t, double T, double q0, double qf) {
  double s = t / T;
  double s2 = s * s, s3 = s2 * s, s4 = s3 * s, s5 = s4 * s;
  double blend = 10*s3 - 15*s4 + 6*s5;
  double dblend = (30*s2 - 60*s3 + 30*s4) / T;
  double ddblend = (60*s - 180*s2 + 120*s3) / (T*T);
  double dq = qf - q0;
  return {q0 + dq * blend, dq * dblend, dq * ddblend};
}
          `,
          "position/velocity/acceleration이 부드럽게 시작하고 끝나는지 검산한다.",
          ["joint limit 검사기를 붙인다.", "PD controller 목표 궤적으로 사용한다.", "ROS 2 joint command publisher로 감싼다."],
        ),
        pythonPractice: py(
          "PD step response",
          `
import numpy as np
import matplotlib.pyplot as plt

q, dq, target = 0.0, 0.0, 1.0
kp, kd, dt = 40.0, 8.0, 0.005
history = []
for _ in range(800):
    tau = kp * (target - q) - kd * dq
    ddq = tau
    dq += ddq * dt
    q += dq * dt
    history.append(q)
plt.plot(history)
plt.grid(True)
plt.show()
          `,
          "gain 변화에 따른 overshoot와 settling time을 비교한다.",
          ["중력항을 추가한다.", "cubic/quintic trajectory를 목표로 넣는다.", "gain sweep 결과표를 만든다."],
        ),
        visualizerId: "sweep",
        quiz: [
          {
            id: "manipulator-control-q1",
            type: "choice",
            prompt: "URDF/Xacro와 함께 로봇팔 planning을 다룰 때 대표적으로 쓰는 ROS 2 도구는?",
            choices: ["MoveIt 2", "pandas", "Vite", "CSS Grid"],
            answer: "MoveIt 2",
            explanation: "MoveIt 2는 로봇팔 motion planning과 collision/joint limit 처리를 다룬다.",
          },
          {
            id: "manipulator-control-q2",
            type: "trueFalse",
            prompt: "trajectory는 위치만 맞으면 되고 속도/가속도 연속성은 중요하지 않다.",
            choices: ["참", "거짓"],
            answer: "거짓",
            explanation: "실제 로봇에서는 속도/가속도 제한과 부드러움이 안정성과 안전성에 직접 연결된다.",
          },
        ],
        checklist: [
          "cubic 또는 quintic trajectory generator를 만들었다.",
          "PD와 gravity compensation의 차이를 비교했다.",
          "URDF/Xacro, tf, joint state의 역할을 설명할 수 있다.",
          "JetRover 실기와 시뮬레이터 실험 범위를 구분했다.",
        ],
      },
    ],
  },
  {
    id: "mobile",
    title: "3. 자율주행 / 모바일 로봇",
    summary: "위치추정, 센서, 맵, 전역/로컬 planning, 제어, Nav2 통합을 단계별로 공부한다.",
    sections: [
      {
        id: "mobile-localization",
        title: "운동학, 센서, 위치추정",
        focus: "2D pose, odometry, encoder/IMU/LiDAR/camera, Kalman/EKF/Particle Filter를 연결한다.",
        theory: [
          "운동학: 2D pose (x, y, theta), differential drive, bicycle, ackermann, omni, mecanum, odometry.",
          "센서: encoder, IMU, LiDAR, camera, GPS, timestamp, synchronization, calibration.",
          "위치추정: Kalman Filter, EKF, Particle Filter, SLAM, robot_localization, map/odom/base_link frame.",
          "센서퓨전은 covariance와 timestamp를 같이 봐야 안정된다.",
        ],
        why: [
          "자율주행의 첫 질문은 지금 어디 있는지이고, 이 답이 흔들리면 planning/control이 모두 불안정해진다.",
          "map, odom, base_link 관계를 이해해야 Nav2와 slam_toolbox 디버깅이 가능하다.",
        ],
        cppPractice: cpp(
          "differential drive odometry",
          `
#include <cmath>

struct Pose2D { double x; double y; double yaw; };

Pose2D step(Pose2D p, double vl, double vr, double wheel_base, double dt) {
  const double v = 0.5 * (vr + vl);
  const double w = (vr - vl) / wheel_base;
  p.x += v * std::cos(p.yaw) * dt;
  p.y += v * std::sin(p.yaw) * dt;
  p.yaw += w * dt;
  return p;
}
          `,
          "좌우 바퀴 속도에서 pose 변화가 어떻게 나오는지 확인한다.",
          ["encoder tick을 거리로 변환한다.", "tf broadcaster 형태로 감싼다.", "IMU yaw와 wheel odom 차이를 로그로 남긴다."],
        ),
        pythonPractice: py(
          "1D Kalman Filter",
          `
import numpy as np

x, p = 0.0, 1.0
q, r = 0.02, 0.25
measurements = [0.2, 0.4, 0.9, 0.8, 1.1]
for z in measurements:
    p = p + q
    k = p / (p + r)
    x = x + k * (z - x)
    p = (1 - k) * p
    print(round(x, 3), round(p, 3))
          `,
          "measurement noise와 process noise에 따른 추정값 변화를 확인한다.",
          ["q/r 값을 바꿔본다.", "2D EKF prediction/update로 확장한다.", "particle filter animation을 만든다."],
        ),
        visualizerId: "mobile-odom",
        quiz: [
          {
            id: "mobile-q1",
            type: "choice",
            prompt: "ROS 2 navigation에서 일반적으로 base_link의 누적 위치추정과 관련 깊은 frame은?",
            choices: ["odom", "npm", "viewport", "shader"],
            answer: "odom",
            explanation: "map -> odom -> base_link 체인은 localization과 odometry를 구분하는 핵심 구조다.",
          },
          {
            id: "mobile-q2",
            type: "blank",
            prompt: "비선형 시스템의 Kalman Filter 확장은 보통 ____라고 부른다.",
            answer: "EKF",
            explanation: "Extended Kalman Filter는 비선형 모델을 선형화해 예측/업데이트를 수행한다.",
          },
        ],
        checklist: [
          "differential drive 또는 bicycle model을 구현했다.",
          "odometry를 직접 적분해 pose trajectory를 그렸다.",
          "1D KF와 2D EKF의 차이를 설명할 수 있다.",
          "map/odom/base_link의 역할을 말할 수 있다.",
        ],
      },
      {
        id: "mobile-planning-control",
        title: "환경표현, A*, 로컬 플래너, Nav2",
        focus: "occupancy grid, costmap, global planning, local planning/control, behavior tree를 공부한다.",
        theory: [
          "환경표현: occupancy grid, costmap, obstacle inflation, camera projection, point cloud filtering, ICP/NDT.",
          "전역계획: Dijkstra, A*, Hybrid A*, OMPL.",
          "로컬 플래너: local costmap, footprint, collision checking, trajectory rollout, DWB, Regulated Pure Pursuit, MPPI, TEB.",
          "행동결정: behavior tree, recovery, replanning, goal preemption.",
          "ROS 2 통합: Nav2 planner/controller server, behavior tree navigator, slam_toolbox, robot_localization, rosbag2 디버깅.",
        ],
        why: [
          "전역 경로가 좋아도 로컬 장애물과 제어기가 맞지 않으면 실제 로봇은 부드럽게 움직이지 않는다.",
          "Nav2는 planner, controller, BT, costmap 파라미터가 함께 성능을 만든다.",
        ],
        cppPractice: cpp(
          "A* 노드 구조",
          `
#include <queue>
#include <vector>

struct Node {
  int x;
  int y;
  double g;
  double f;
};

struct Compare {
  bool operator()(const Node& a, const Node& b) const {
    return a.f > b.f;
  }
};

std::priority_queue<Node, std::vector<Node>, Compare> open_set;
          `,
          "grid map에서 휴리스틱과 open set을 이용해 최단 경로를 찾는 구조를 잡는다.",
          ["4방향/8방향 neighbor를 구현한다.", "obstacle inflation을 추가한다.", "path smoothing을 붙인다."],
        ),
        pythonPractice: py(
          "Pure Pursuit tracking error",
          `
import numpy as np

path = np.array([[0, 0], [1, 0], [2, 0.5], [3, 1.0]])
robot = np.array([0.8, -0.2])
dist = np.linalg.norm(path - robot, axis=1)
target = path[np.argmax(dist > 0.8)]
print("lookahead target:", target)
          `,
          "lookahead target 선택이 추종 거동에 주는 영향을 확인한다.",
          ["lookahead를 바꿔 tracking error를 비교한다.", "Stanley 제어와 비교한다.", "local trajectory candidate cost를 시각화한다."],
        ),
        visualizerId: "astar",
        quiz: [
          {
            id: "planning-q1",
            type: "choice",
            prompt: "grid 기반 전역 경로계획에서 휴리스틱을 사용하는 대표 알고리즘은?",
            choices: ["A*", "PID", "JPEG", "OAuth"],
            answer: "A*",
            explanation: "A*는 g-cost와 heuristic을 함께 사용해 목표까지의 경로를 찾는다.",
          },
          {
            id: "planning-q2",
            type: "trueFalse",
            prompt: "local planner는 global path만 따라가며 충돌검사나 footprint는 고려하지 않는다.",
            choices: ["참", "거짓"],
            answer: "거짓",
            explanation: "local planner는 local costmap, footprint, collision checking, trajectory rollout을 다룬다.",
          },
        ],
        checklist: [
          "occupancy grid 또는 costmap을 코드로 다뤘다.",
          "A*를 구현하고 heuristic 차이를 비교했다.",
          "Pure Pursuit 또는 Stanley를 구현했다.",
          "Nav2의 planner server와 controller server 역할을 구분한다.",
        ],
      },
      {
        id: "mobile-local-control",
        title: "Pure Pursuit와 로컬 추종",
        focus: "lookahead, lateral error, 속도 제한이 실제 주행 안정성에 주는 영향을 본다.",
        theory: [
          "Pure Pursuit는 경로 위 lookahead target을 향해 곡률 명령을 계산한다.",
          "lookahead가 너무 짧으면 흔들림이 커지고, 너무 길면 코너 추종이 둔해질 수 있다.",
          "Stanley는 lateral error와 heading error를 조합해 조향을 계산한다.",
        ],
        why: [
          "PDF는 JetRover에서 local planner parameter tuning 입문을 확인하라고 권한다.",
          "시뮬레이터에서는 planner/controller 비교와 dynamic obstacle scenario를 반복하기 좋다.",
        ],
        cppPractice: cpp(
          "Pure Pursuit 곡률",
          `
#include <cmath>

double curvature(double target_x_robot, double target_y_robot) {
  double ld2 = target_x_robot * target_x_robot + target_y_robot * target_y_robot;
  if (ld2 < 1e-6) return 0.0;
  return 2.0 * target_y_robot / ld2;
}
          `,
          "로봇 좌표계 target point에서 곡률 명령을 계산한다.",
          ["lookahead distance를 속도에 따라 바꾼다.", "max angular velocity 제한을 추가한다.", "tracking error logger를 붙인다."],
        ),
        pythonPractice: py(
          "lookahead sweep",
          `
lookaheads = [0.3, 0.6, 1.0, 1.5]
errors = [0.28, 0.15, 0.18, 0.32]
for ld, err in zip(lookaheads, errors):
    print(ld, err)
          `,
          "lookahead별 평균 tracking error를 비교하는 표를 만든다.",
          ["matplotlib 그래프로 바꾼다.", "속도 제한 조건을 추가한다.", "rosbag 로그에서 error를 계산한다."],
        ),
        visualizerId: "pure-pursuit",
        quiz: [
          {
            id: "pure-q1",
            type: "choice",
            prompt: "Pure Pursuit에서 주로 조절하는 핵심 파라미터는?",
            choices: ["lookahead distance", "image width only", "HTML title", "compiler version only"],
            answer: "lookahead distance",
            explanation: "lookahead는 추종 안정성과 코너 반응에 큰 영향을 준다.",
          },
          {
            id: "pure-q2",
            type: "trueFalse",
            prompt: "로컬 제어 실험은 tracking error와 command latency를 함께 기록하면 좋다.",
            choices: ["참", "거짓"],
            answer: "참",
            explanation: "반복 실험과 평가에서는 오차와 지연을 함께 보는 것이 유용하다.",
          },
        ],
        checklist: [
          "lookahead 변화가 경로 추종에 미치는 영향을 봤다.",
          "lateral error를 계산했다.",
          "속도 제한과 각속도 제한을 적용했다.",
        ],
      },
    ],
  },
  {
    id: "ai",
    title: "4. AI 기초역량",
    summary: "데이터 준비, ML/DL/Vision, ONNX 배포, ROS 2 image inference 연결을 공부한다.",
    sections: [
      {
        id: "ai-foundations",
        title: "데이터, 모델, 평가, 배포",
        focus: "Python에서 학습하고 C++에서 추론하는 흐름을 로봇 센서와 연결한다.",
        theory: [
          "ML 기초: 선형대수, 미분, 확률, loss function, gradient descent, regularization, bias/variance.",
          "데이터/평가: dataset split, label 품질, augmentation, accuracy, precision, recall, F1, confusion matrix.",
          "딥러닝: MLP, CNN, sequence model, transformer, embedding 감각.",
          "비전/센서 AI: preprocessing, classification, detection, segmentation, tracking, sensor fusion.",
          "배포: ONNX export, ONNX Runtime, TensorRT 개요, C++ inference pipeline, latency/throughput/batching.",
        ],
        why: [
          "로봇 AI는 모델 정확도만큼 입력 전처리, latency, ROS 2 topic 연결, postprocessing이 중요하다.",
          "학습과 배포의 전처리가 다르면 좋은 모델도 현장에서 쉽게 실패한다.",
        ],
        cppPractice: cpp(
          "OpenCV 전처리 skeleton",
          `
#include <opencv2/opencv.hpp>

cv::Mat preprocess(const cv::Mat& image) {
  cv::Mat resized, float_img;
  cv::resize(image, resized, cv::Size(224, 224));
  resized.convertTo(float_img, CV_32FC3, 1.0 / 255.0);
  return float_img;
}
          `,
          "카메라 frame을 모델 입력 tensor 형식으로 바꾸는 전처리 흐름을 만든다.",
          ["mean/std normalization을 추가한다.", "batch dimension을 붙인다.", "ONNX Runtime 입력 buffer로 연결한다."],
        ),
        pythonPractice: py(
          "confusion matrix metric",
          `
import numpy as np

cm = np.array([[42, 8],
               [5, 45]])
tp = cm[1, 1]
fp = cm[0, 1]
fn = cm[1, 0]
precision = tp / (tp + fp)
recall = tp / (tp + fn)
f1 = 2 * precision * recall / (precision + recall)
print(precision, recall, f1)
          `,
          "정확도만 보지 않고 precision/recall/F1을 계산한다.",
          ["class imbalance 예제를 만든다.", "PyTorch 모델 결과로 cm을 계산한다.", "ONNX 전후 결과 일치성을 확인한다."],
        ),
        visualizerId: "ai-metrics",
        quiz: [
          {
            id: "ai-q1",
            type: "choice",
            prompt: "학습한 모델을 C++ 추론으로 옮길 때 자주 쓰는 중간 포맷은?",
            choices: ["ONNX", "CSV only", "Markdown", "PNG"],
            answer: "ONNX",
            explanation: "PDF는 export to ONNX와 ONNX Runtime을 배포 흐름의 핵심으로 둔다.",
          },
          {
            id: "ai-q2",
            type: "trueFalse",
            prompt: "AI 실습에서 dataset split과 metric은 모델 구조보다 항상 덜 중요하다.",
            choices: ["참", "거짓"],
            answer: "거짓",
            explanation: "데이터 분리, 라벨 품질, metric은 모델을 신뢰할 수 있는지 판단하는 기본이다.",
          },
        ],
        checklist: [
          "dataset split과 label 품질의 중요성을 설명할 수 있다.",
          "PyTorch로 작은 모델을 학습했다.",
          "confusion matrix와 F1을 계산했다.",
          "ONNX export와 ONNX Runtime 추론 흐름을 설명할 수 있다.",
        ],
      },
    ],
  },
  {
    id: "prompt-context-harness",
    title: "5. 프롬프트 / 컨텍스트 / 하네스",
    summary: "LLM 시스템을 로봇/AI 도구와 연결할 때 필요한 prompt, retrieval, eval harness를 익힌다.",
    sections: [
      {
        id: "llm-engineering",
        title: "프롬프트, 컨텍스트, 평가 하네스",
        focus: "출력 형식, 검색 기반 grounding, regression eval, trace/log를 설계한다.",
        theory: [
          "프롬프트: 역할, 목표, 제약, 출력형식 분리, few-shot, instruction hierarchy, failure mode 줄이기.",
          "컨텍스트: context window 한계, chunking, retrieval, summary memory, grounding.",
          "하네스: eval set, regression test, tracing, latency logging, fallback, retry policy, golden output 비교.",
          "Python 중심 구현 순서는 prompt template runner, document chunker, retriever, evaluation harness, trace exporter다.",
        ],
        why: [
          "Physical AI는 언어 인터페이스, 멀티모달 추론, 도구 호출, 검색 기반 지식 연결이 점점 중요해지고 있다.",
          "하네스가 없으면 프롬프트 변경이 개선인지 우연인지 판단하기 어렵다.",
        ],
        cppPractice: cpp(
          "latency profiler",
          `
#include <chrono>
#include <iostream>

class Timer {
 public:
  Timer() : start_(std::chrono::steady_clock::now()) {}
  void stop(const std::string& name) {
    auto end = std::chrono::steady_clock::now();
    double ms = std::chrono::duration<double, std::milli>(end - start_).count();
    std::cout << name << "," << ms << "\\n";
  }
 private:
  std::chrono::steady_clock::time_point start_;
};
          `,
          "request/response wrapper나 inference server 주변에 timing log를 붙인다.",
          ["JSON schema validator를 연결한다.", "retrieved context id를 같이 기록한다.", "retry 횟수를 trace에 남긴다."],
        ),
        pythonPractice: py(
          "간단 retrieval",
          `
docs = [
    "FK maps joint angles to end effector pose",
    "A star uses heuristic search on a grid",
    "ONNX Runtime runs exported neural networks",
]
query = "grid heuristic planner"
scores = [sum(word in doc.lower() for word in query.split()) for doc in docs]
print(docs[max(range(len(docs)), key=lambda i: scores[i])])
          `,
          "청킹과 검색이 답변 품질을 어떻게 바꾸는지 작은 예제로 확인한다.",
          ["cosine similarity로 바꾼다.", "eval set을 JSONL로 만든다.", "pass/fail metric과 latency를 CSV로 저장한다."],
        ),
        quiz: [
          {
            id: "llm-q1",
            type: "choice",
            prompt: "프롬프트 변경이 성능을 악화시키지 않았는지 확인하는 반복 평가 구조는?",
            choices: ["evaluation harness", "URDF mesh", "costmap inflation", "quaternion"],
            answer: "evaluation harness",
            explanation: "하네스는 eval set과 metric으로 변경 전후를 비교한다.",
          },
          {
            id: "llm-q2",
            type: "blank",
            prompt: "문서를 작은 단위로 나누어 검색에 쓰는 과정을 보통 ____이라고 한다.",
            answer: "chunking",
            explanation: "컨텍스트 엔지니어링에서 chunking은 검색과 grounding의 기본 단계다.",
          },
        ],
        checklist: [
          "프롬프트 템플릿의 역할/목표/출력형식을 분리했다.",
          "문서 chunker와 간단 retriever를 만들었다.",
          "eval harness로 pass/fail과 latency를 기록했다.",
          "golden output과 regression run을 비교했다.",
        ],
        visualizerId: "retrieval-flow",
      },
    ],
  },
  {
    id: "jetrover-sim",
    title: "6. JetRover 실기와 시뮬레이터",
    summary: "실제 하드웨어에서 익힐 것과 시뮬레이터/워크스테이션에서 반복할 것을 분리한다.",
    sections: [
      {
        id: "jetrover-vs-sim",
        title: "실기 범위와 심화 범위 분리",
        focus: "실기에서는 실제 센서/프레임/명령 감각을, 시뮬레이터에서는 반복 실험과 고급 비교를 맡긴다.",
        theory: [
          "JetRover 실기: joint command, FK/IK 감각, MoveIt 입문, camera-arm frame 연결, odometry, slam_toolbox, Nav2 basic bringup.",
          "실기 AI: camera topic 처리, lightweight inference, ROS 2 image topic 연결, rosbag2 기록/재생.",
          "시뮬레이터: dynamics parameter sweep, IK solver 비교, trajectory tuning, controller gain sweep, dynamic obstacle scenario.",
          "워크스테이션: 모델 학습, ONNX/TensorRT 변환, latency benchmark, 여러 모델 비교.",
        ],
        why: [
          "실기에서는 안전과 하드웨어 제약 때문에 반복 실패 실험을 마음껏 하기 어렵다.",
          "시뮬레이터는 다양한 조건을 빠르게 바꿔 알고리즘의 실패 조건을 찾는 데 적합하다.",
        ],
        cppPractice: cpp(
          "safety command filter",
          `
struct CmdVel { double vx; double wz; };

CmdVel limit(CmdVel cmd, double max_vx, double max_wz) {
  if (cmd.vx > max_vx) cmd.vx = max_vx;
  if (cmd.vx < -max_vx) cmd.vx = -max_vx;
  if (cmd.wz > max_wz) cmd.wz = max_wz;
  if (cmd.wz < -max_wz) cmd.wz = -max_wz;
  return cmd;
}
          `,
          "실기 주행 전에 속도 제한 필터를 항상 통과시키는 습관을 만든다.",
          ["timeout이면 zero velocity를 내보낸다.", "LiDAR 최소거리 조건을 추가한다.", "ROS 2 node로 감싼다."],
        ),
        pythonPractice: py(
          "실기/시뮬레이터 실험표",
          `
experiments = [
    ("JetRover", "odom repeat run", "pose_error"),
    ("Simulator", "controller sweep", "tracking_error"),
    ("Workstation", "onnx benchmark", "latency_ms"),
]
for env, name, metric in experiments:
    print(env, name, metric)
          `,
          "환경별 실험 목적과 metric을 분리해 관리한다.",
          ["CSV로 저장한다.", "battery/CPU 상태 컬럼을 추가한다.", "baseline vs 개선안 비교표를 만든다."],
        ),
        quiz: [
          {
            id: "jetrover-q1",
            type: "choice",
            prompt: "실기보다 시뮬레이터에서 먼저 검증하기 좋은 것은?",
            choices: ["impedance/admittance 개념 실험", "실제 배터리 전압 측정", "실제 카메라 케이블 연결", "실제 모터 발열 확인"],
            answer: "impedance/admittance 개념 실험",
            explanation: "고급 제어와 반복 파라미터 실험은 시뮬레이터가 안전하고 빠르다.",
          },
          {
            id: "jetrover-q2",
            type: "trueFalse",
            prompt: "JetRover 실기는 실제 센서 timestamp와 frame 체인을 확인하기에 적합하다.",
            choices: ["참", "거짓"],
            answer: "참",
            explanation: "실제 센서와 프레임 연결 감각은 하드웨어에서 특히 중요하다.",
          },
        ],
        checklist: [
          "실기에서 할 실험과 시뮬레이터에서 할 실험을 분리했다.",
          "실기 명령에는 timeout과 limit를 둔다.",
          "rosbag2로 실기 데이터를 기록해 후처리한다.",
        ],
      },
    ],
  },
  {
    id: "stack",
    title: "7. 추천 학습 스택",
    summary: "로봇팔, 자율주행, AI, LLM 하네스에 맞는 이론/라이브러리/시스템 스택을 정리한다.",
    sections: [
      {
        id: "recommended-stack",
        title: "분야별 스택",
        focus: "어떤 책과 라이브러리를 어떤 순서로 연결할지 정한다.",
        theory: [
          "로봇팔: Modern Robotics, Siciliano/Spong, Eigen, KDL, Pinocchio/RBDL, NumPy, SymPy, matplotlib, URDF/Xacro, MoveIt 2, ros2_control.",
          "자율주행: Probabilistic Robotics, Planning Algorithms, Eigen, OpenCV, PCL, MRPT, Nav2, slam_toolbox, robot_localization, tf2.",
          "AI: PyTorch, OpenCV, NumPy, pandas, matplotlib, ONNX Runtime, TensorRT 선택, ROS 2 image transport, logging, bag replay.",
          "프롬프트/컨텍스트/하네스: Jupyter, pandas, yaml, json, evaluation scripts, CSV/JSONL/Markdown 기록.",
        ],
        why: [
          "스택을 분리하면 이론 공부, 알고리즘 구현, ROS 2 통합, 평가 자동화의 역할이 명확해진다.",
          "공식 문서와 검증된 라이브러리를 같이 보면 구현과 실전 연결 사이의 간극을 줄일 수 있다.",
        ],
        cppPractice: cpp(
          "라이브러리 선택 기록",
          `
#include <string>
#include <vector>

struct StackItem {
  std::string domain;
  std::string library;
  std::string purpose;
};

std::vector<StackItem> stack = {
  {"manipulator", "Eigen", "matrix math"},
  {"navigation", "OpenCV/PCL", "perception"},
  {"ai", "ONNX Runtime", "inference"}
};
          `,
          "내가 쓰는 라이브러리와 목적을 명시적으로 정리한다.",
          ["CMake 링크 예제를 추가한다.", "버전 컬럼을 둔다.", "대체 라이브러리를 비교한다."],
        ),
        pythonPractice: py(
          "스택 체크리스트",
          `
stack = {
    "robot_arm": ["Eigen", "MoveIt2", "ros2_control"],
    "mobile": ["Nav2", "slam_toolbox", "robot_localization"],
    "ai": ["PyTorch", "ONNX Runtime", "OpenCV"],
}
for domain, tools in stack.items():
    print(domain, "->", ", ".join(tools))
          `,
          "도메인별 필수 도구를 빠르게 확인한다.",
          ["설치 여부를 검사한다.", "학습 우선순위를 붙인다.", "링크 모음을 Markdown으로 생성한다."],
        ),
        quiz: [
          {
            id: "stack-q1",
            type: "choice",
            prompt: "로봇팔 동역학 라이브러리로 PDF에서 언급된 것은?",
            choices: ["Pinocchio/RBDL", "Express", "SQLite", "Redux"],
            answer: "Pinocchio/RBDL",
            explanation: "Pinocchio와 RBDL은 rigid body dynamics 관련 라이브러리다.",
          },
          {
            id: "stack-q2",
            type: "choice",
            prompt: "자율주행 ROS 2 통합에서 대표적으로 보는 스택은?",
            choices: ["Nav2, slam_toolbox, robot_localization", "Tailwind, NextAuth, Prisma", "Unity, Blender, Figma", "SMTP, POP3, IMAP"],
            answer: "Nav2, slam_toolbox, robot_localization",
            explanation: "PDF의 자율주행 스택은 Nav2, SLAM, localization 중심이다.",
          },
        ],
        checklist: [
          "분야별 이론 자료와 구현 라이브러리를 연결했다.",
          "내 환경에서 설치/빌드 가능한 우선순위를 정했다.",
          "스택별 공식 문서를 즐겨찾기했다.",
        ],
      },
    ],
  },
  {
    id: "routine",
    title: "8. 주간 학습 루틴",
    summary: "주 5일, 하루 2시간 기준으로 이론, 손유도, 구현, 시각화, 로그 정리를 반복한다.",
    sections: [
      {
        id: "weekly-routine",
        title: "공부 루프",
        focus: "Python 검산 -> C++ 구현 -> ROS 2 연결 -> 로그 기록의 반복 루프를 생활화한다.",
        theory: [
          "월: 이론 읽기와 핵심 수식 3개 정리.",
          "화: 손유도와 노트 정리.",
          "수: C++ 구현.",
          "목: Python 시뮬레이션/시각화.",
          "금: ROS 2 연결 또는 실험 로그 정리.",
          "하루 2시간은 이론 40분, 수식/개념 노트 20분, 구현 50분, 결과 정리 10분으로 배분한다.",
        ],
        why: [
          "매일 새 개념만 읽으면 구현 감각이 약해지고, 구현만 하면 수식과 실패 해석이 약해진다.",
          "짧아도 매주 로그를 남기면 성장과 빈틈이 보인다.",
        ],
        cppPractice: cpp(
          "학습 로그 레코드",
          `
#include <string>

struct StudyLog {
  std::string date;
  std::string topic;
  std::string result;
  int minutes;
};
          `,
          "학습을 코드처럼 기록 가능한 데이터로 다룬다.",
          ["CSV writer를 붙인다.", "topic별 누적 시간을 계산한다.", "실패 원인 필드를 추가한다."],
        ),
        pythonPractice: py(
          "주간 시간 집계",
          `
logs = [
    ("Mon", "theory", 40),
    ("Wed", "cpp", 50),
    ("Thu", "python", 50),
]
total = sum(item[2] for item in logs)
print("weekly minutes:", total)
          `,
          "루틴이 실제로 지켜졌는지 수치로 본다.",
          ["pandas groupby로 바꾼다.", "부족한 축을 자동 표시한다.", "Markdown 회고를 생성한다."],
        ),
        quiz: [
          {
            id: "routine-q1",
            type: "choice",
            prompt: "PDF가 권장하는 가장 좋은 구현 순서는?",
            choices: ["Python 검산 -> C++ 구현 -> ROS 2 연결 -> 로그", "ROS 2부터 무작정 실행", "문서 없이 튜닝", "결과만 저장하고 파라미터 생략"],
            answer: "Python 검산 -> C++ 구현 -> ROS 2 연결 -> 로그",
            explanation: "빠른 검산, 재사용 구현, 시스템 연결, 재현성 기록의 순서가 권장된다.",
          },
          {
            id: "routine-q2",
            type: "trueFalse",
            prompt: "실험 결과 정리는 구현보다 항상 나중에 몰아서 해도 충분하다.",
            choices: ["참", "거짓"],
            answer: "거짓",
            explanation: "결과와 파라미터를 곧바로 남기는 습관이 재현성을 만든다.",
          },
        ],
        checklist: [
          "이번 주 이론/수식/구현/시각화/로그 시간을 기록했다.",
          "Python 검산 후 C++로 옮긴 예제가 있다.",
          "실패 로그를 최소 하나 남겼다.",
        ],
      },
    ],
  },
  {
    id: "minimum-checklist",
    title: "9. 최소 체크리스트",
    summary: "로봇팔, 자율주행, AI, 프롬프트/컨텍스트/하네스의 최소 달성 기준을 점검한다.",
    sections: [
      {
        id: "minimum-done",
        title: "최소 완료 기준",
        focus: "입문-중급 초입으로 넘어가기 위한 손구현 기준을 확인한다.",
        theory: [
          "로봇팔: 2링크 FK/IK, Jacobian, quaternion/Euler/rotation matrix, singularity/manipulability, trajectory, PD/중력보상, URDF/tf.",
          "자율주행: differential drive/bicycle model, odometry, 1D KF/2D EKF, occupancy grid/costmap, A*, Pure Pursuit/Stanley, Nav2/slam_toolbox/robot_localization.",
          "AI: dataset split, metric, PyTorch small model, confusion matrix, ONNX export, ONNX Runtime, ROS 2 image inference.",
          "LLM 하네스: prompt template, chunking/retrieval, eval harness, trace/log/result CSV.",
        ],
        why: [
          "체크리스트는 공부량을 과시하기 위한 것이 아니라 빈 축을 찾기 위한 장치다.",
          "직접 구현해본 항목과 설명만 가능한 항목을 구분해야 다음 학습이 정확해진다.",
        ],
        cppPractice: cpp(
          "체크리스트 item",
          `
struct CheckItem {
  const char* domain;
  const char* item;
  bool done;
};

CheckItem items[] = {
  {"arm", "2-link FK", true},
  {"mobile", "A star", false},
  {"ai", "ONNX export", false}
};
          `,
          "도메인별 완료 상태를 명확하게 관리한다.",
          ["JSON 저장으로 바꾼다.", "완료율을 계산한다.", "낮은 도메인부터 추천하는 함수를 만든다."],
        ),
        pythonPractice: py(
          "완료율 계산",
          `
items = {"arm": [1, 1, 0], "mobile": [1, 0, 0], "ai": [1, 1, 1]}
for domain, done in items.items():
    print(domain, sum(done) / len(done))
          `,
          "도메인별 빈틈을 빠르게 계산한다.",
          ["막대그래프로 표시한다.", "이번 주 우선순위를 자동 추천한다.", "Markdown 체크리스트를 생성한다."],
        ),
        quiz: [
          {
            id: "check-q1",
            type: "choice",
            prompt: "로봇팔 최소 체크리스트에 포함되는 항목은?",
            choices: ["2링크 FK/IK와 Jacobian", "이메일 자동분류", "CSS 애니메이션", "데이터베이스 샤딩"],
            answer: "2링크 FK/IK와 Jacobian",
            explanation: "PDF는 로봇팔 최소 기준으로 FK/IK/Jacobian을 직접 구현하는 것을 둔다.",
          },
          {
            id: "check-q2",
            type: "trueFalse",
            prompt: "AI 최소 기준에는 ONNX export와 Runtime 추론 경험이 포함된다.",
            choices: ["참", "거짓"],
            answer: "참",
            explanation: "학습뿐 아니라 배포/추론 흐름을 이해하는 것이 목표다.",
          },
        ],
        checklist: [
          "로봇팔 최소 항목을 3개 이상 직접 구현했다.",
          "자율주행 최소 항목을 3개 이상 직접 구현했다.",
          "AI 배포 흐름을 한 번 이상 끝까지 확인했다.",
          "하네스가 결과 CSV/JSONL을 남긴다.",
        ],
      },
    ],
  },
  {
    id: "advanced-foundations",
    title: "10. 실무형 Physical AI 추가 기초축",
    summary: "실시간성, 안전성, 고급 제어, 센서융합, 반복 실험/평가를 기초역량의 확장 축으로 포함한다.",
    sections: [
      {
        id: "realtime",
        title: "실시간성 / 지연 / 제어주기",
        focus: "control frequency, latency, jitter, executor, QoS, timestamp를 측정한다.",
        theory: [
          "같은 제어식도 10 Hz, 50 Hz, 100 Hz, 1 kHz에서 거동이 달라진다.",
          "latency, jitter, deadline miss, blocking/non-blocking callback, executor, callback group, QoS가 중요하다.",
          "sensor timestamp와 processing timestamp를 구분해야 지연을 제대로 해석한다.",
          "control loop 안의 동적 메모리 할당은 실시간성에 영향을 줄 수 있다.",
        ],
        why: [
          "주기 흔들림이 커지면 제어 안정성과 센서퓨전 품질이 떨어진다.",
          "rosbag2, RViz, Gazebo, perception 노드가 동시에 돌 때 실제 주기가 밀릴 수 있다.",
        ],
        cppPractice: cpp(
          "loop period statistics",
          `
#include <algorithm>
#include <numeric>
#include <vector>

double mean(const std::vector<double>& xs) {
  return std::accumulate(xs.begin(), xs.end(), 0.0) / xs.size();
}

double max_value(const std::vector<double>& xs) {
  return *std::max_element(xs.begin(), xs.end());
}
          `,
          "loop period 평균/최대/최소/표준편차를 계산한다.",
          ["rclcpp::Rate loop에 붙인다.", "publisher/subscriber 지연 측정으로 확장한다.", "SingleThreadedExecutor와 MultiThreadedExecutor를 비교한다."],
        ),
        pythonPractice: py(
          "latency histogram",
          `
import numpy as np
import matplotlib.pyplot as plt

latency_ms = np.random.normal(20, 4, 300)
plt.hist(latency_ms, bins=20)
plt.axvline(33.3, color="red")
plt.show()
          `,
          "deadline 기준선을 두고 지연 분포를 확인한다.",
          ["timer drift를 기록한다.", "sensor timestamp 차이를 계산한다.", "CSV 로그를 읽어 percentile을 구한다."],
        ),
        visualizerId: "latency",
        quiz: [
          {
            id: "realtime-q1",
            type: "choice",
            prompt: "제어주기 흔들림을 뜻하는 용어는?",
            choices: ["jitter", "embedding", "inflation", "segmentation"],
            answer: "jitter",
            explanation: "jitter는 반복 루프 주기가 일정하지 않은 정도를 뜻한다.",
          },
          {
            id: "realtime-q2",
            type: "trueFalse",
            prompt: "sensor timestamp와 processing timestamp는 항상 같은 의미다.",
            choices: ["참", "거짓"],
            answer: "거짓",
            explanation: "센서가 측정한 시각과 노드가 처리한 시각은 다를 수 있다.",
          },
        ],
        checklist: [
          "10/50/100 Hz loop의 실제 주기를 측정했다.",
          "latency histogram을 만들었다.",
          "executor와 callback group 차이를 설명할 수 있다.",
        ],
      },
      {
        id: "safety-control-fusion-eval",
        title: "안전성, 고급 제어, 센서융합, 평가",
        focus: "Physical AI의 실무 기초인 보호 로직, LQR/MPC 감각, 시간동기화, 반복 실험을 묶어서 본다.",
        theory: [
          "안전성: fail-safe, E-stop, watchdog timer, soft/hard limit, collision checking, geofence, recovery, FMEA, safety monitor node.",
          "고급 제어: state-space, controllability/observability, LQR, MPC, constraint, cost function, feedforward + feedback.",
          "센서융합: time sync, approximate/exact sync, covariance tuning, EKF/UKF, factor graph, extrinsic/intrinsic calibration, IMU bias.",
          "평가/통합: metric, benchmark, reproducibility, ablation, parameter sweep, regression test, rosbag/dataset 관리, failure taxonomy.",
        ],
        why: [
          "Physical AI는 물리 세계와 연결되므로 잘못된 판단이 실제 충돌, 낙하, 모터 과부하로 이어질 수 있다.",
          "한 번 성공한 데모보다 반복 조건에서 실패를 분류하고 수치로 비교하는 능력이 더 오래 간다.",
        ],
        cppPractice: cpp(
          "watchdog 상태머신",
          `
enum class SafetyState { Normal, Warning, Stop, Recovery };

SafetyState update(bool heartbeat_ok, bool obstacle_close) {
  if (!heartbeat_ok || obstacle_close) return SafetyState::Stop;
  return SafetyState::Normal;
}
          `,
          "센서 heartbeat와 장애물 조건으로 안전 상태를 전환한다.",
          ["STOP에서 zero velocity를 publish한다.", "RECOVERY 조건을 추가한다.", "fault event를 CSV로 기록한다."],
        ),
        pythonPractice: py(
          "parameter sweep 결과표",
          `
import pandas as pd

df = pd.DataFrame({
    "lookahead": [0.4, 0.8, 1.2],
    "tracking_error": [0.31, 0.18, 0.24],
    "latency_ms": [18, 20, 21],
})
print(df.sort_values("tracking_error"))
          `,
          "여러 파라미터 세트를 metric으로 비교한다.",
          ["실패 케이스 taxonomy를 추가한다.", "baseline 대비 개선율을 계산한다.", "Markdown 리포트를 자동 생성한다."],
        ),
        visualizerId: "sweep",
        quiz: [
          {
            id: "safety-q1",
            type: "choice",
            prompt: "명령이 일정 시간 들어오지 않으면 zero velocity를 보내는 보호 장치는?",
            choices: ["watchdog timer", "confusion matrix", "quintic spline", "chunker"],
            answer: "watchdog timer",
            explanation: "watchdog은 timeout이나 heartbeat 실패 시 안전 상태로 전환하는 기본 보호 로직이다.",
          },
          {
            id: "safety-q2",
            type: "choice",
            prompt: "여러 파라미터 조합을 반복 실행해 metric을 비교하는 방법은?",
            choices: ["parameter sweep", "Euler angle", "URDF material", "label smoothing only"],
            answer: "parameter sweep",
            explanation: "반복 실험/평가 축에서 parameter sweep은 성능 비교의 기본 도구다.",
          },
        ],
        checklist: [
          "cmd_vel limit filter와 watchdog을 설계했다.",
          "LQR/MPC가 어떤 문제를 풀기 위한 제어인지 설명할 수 있다.",
          "sensor timestamp 차이를 분석했다.",
          "parameter sweep 결과를 표와 그래프로 남겼다.",
        ],
      },
    ],
  },
  {
    id: "judgement",
    title: "11. Physical AI 기초역량 판정",
    summary: "입문-중급 초입의 핵심 기초체력에 도달했는지 스스로 판정한다.",
    sections: [
      {
        id: "judgement-criteria",
        title: "10축 판정 기준",
        focus: "기초를 다 갖췄다고 말하기보다, 입문-중급 초입의 핵심 기초체력을 갖췄는지 판단한다.",
        theory: [
          "10축: 수학/표현, 로봇팔 운동학/동역학, 모바일 로봇 운동학/자율주행, 센서/인식, 계획/제어, AI 추론/배포, ROS 2 시스템화, 실시간성/안전성, 고급 제어/센서융합 기초, 반복 실험/평가/통합 경험.",
          "4개 판정 질문: 로봇팔 수식과 구현, 모바일 localization/planning/control, AI 학습/추론/배포, ROS 2와 logging/evaluation 시스템 연결.",
          "4개 중 3개 이상 가능하면 Physical AI 기초역량이 꽤 갖춰진 상태로 본다.",
        ],
        why: [
          "이 단계 이후 성장은 특정 도메인 하나를 골라 깊게 파는 방식이 좋다.",
          "넓은 기초와 깊은 전문성은 다른 전략이 필요하다.",
        ],
        cppPractice: cpp(
          "판정 스코어",
          `
int count_ready(bool arm, bool mobile, bool ai, bool ros_eval) {
  return static_cast<int>(arm) + static_cast<int>(mobile)
       + static_cast<int>(ai) + static_cast<int>(ros_eval);
}
          `,
          "4개 판정 질문 중 몇 개를 만족하는지 계산한다.",
          ["도메인별 증거 링크를 추가한다.", "최소 점수 기준을 바꿔본다.", "학습 사이트 progress와 연결한다."],
        ),
        pythonPractice: py(
          "10축 레이더 준비 데이터",
          `
axes = {
    "math": 3,
    "arm": 2,
    "mobile": 2,
    "ai": 3,
    "ros2": 2,
    "eval": 1,
}
weak = sorted(axes.items(), key=lambda item: item[1])[:2]
print("next focus:", weak)
          `,
          "낮은 축을 다음 학습 목표로 고른다.",
          ["radar chart로 그린다.", "월간 목표를 자동 생성한다.", "증거 로그를 링크한다."],
        ),
        quiz: [
          {
            id: "judge-q1",
            type: "choice",
            prompt: "PDF의 최종 표현에 가장 가까운 것은?",
            choices: ["입문-중급 초입의 핵심 기초체력", "모든 고급 연구 역량 완료", "웹 개발자 전환 완료", "수학 공부 불필요"],
            answer: "입문-중급 초입의 핵심 기초체력",
            explanation: "문서는 '다 갖췄다'보다 입문-중급 초입의 기초체력이라는 표현이 정확하다고 본다.",
          },
          {
            id: "judge-q2",
            type: "trueFalse",
            prompt: "이후 성장은 특정 분야 하나를 골라 깊게 파는 방식이 좋다.",
            choices: ["참", "거짓"],
            answer: "참",
            explanation: "넓은 기초 이후에는 도메인 심화가 필요하다.",
          },
        ],
        checklist: [
          "10축 중 내가 낮은 축 2개를 골랐다.",
          "4개 판정 질문 중 3개 이상에 구현 증거가 있다.",
          "다음 심화 도메인을 하나 정했다.",
        ],
      },
    ],
  },
  {
    id: "links",
    title: "12. 공식 링크 모음",
    summary: "공식 문서와 대표 자료를 학습 스택별로 모아 둔다.",
    sections: [
      {
        id: "official-links",
        title: "자료 연결",
        focus: "공식 문서와 교재를 implementation checklist와 연결한다.",
        theory: [
          "로봇팔: Modern Robotics, KDL, Pinocchio, RBDL, MoveIt 2, ros2_control.",
          "자율주행: Probabilistic Robotics, Planning Algorithms, Nav2, slam_toolbox, robot_localization, OpenCV, PCL, MRPT, OMPL.",
          "AI: PyTorch docs, OpenCV docs, ONNX Runtime docs, TensorRT docs.",
          "프롬프트/컨텍스트/하네스: OpenAI prompt/evals docs, Anthropic prompting/context docs.",
        ],
        why: [
          "공식 문서와 구현 과제를 같이 보면 검색 시간이 줄고 학습 경로가 흔들리지 않는다.",
          "라이브러리 버전은 바뀔 수 있으므로 실제 설치 전 공식 문서를 확인하는 습관이 필요하다.",
        ],
        cppPractice: cpp(
          "문서 링크 metadata",
          `
struct DocLink {
  const char* name;
  const char* domain;
  const char* purpose;
};
          `,
          "학습 자료를 도메인과 목적별로 분류한다.",
          ["URL 필드를 추가한다.", "마지막 확인 날짜를 넣는다.", "Markdown 링크 목록을 생성한다."],
        ),
        pythonPractice: py(
          "Markdown 링크 생성",
          `
links = [("MoveIt 2", "manipulator"), ("Nav2", "mobile"), ("PyTorch", "ai")]
for name, domain in links:
    print(f"- [{domain}] {name}")
          `,
          "자료 목록을 노트에 붙일 수 있는 형태로 만든다.",
          ["실제 URL 컬럼을 추가한다.", "분야별로 정렬한다.", "학습 완료 체크박스를 붙인다."],
        ),
        quiz: [
          {
            id: "links-q1",
            type: "choice",
            prompt: "Nav2와 가장 관련 깊은 분야는?",
            choices: ["자율주행/모바일 로봇", "로봇팔 동역학만", "프론트엔드 스타일링", "이메일 송신"],
            answer: "자율주행/모바일 로봇",
            explanation: "Nav2는 ROS 2 navigation stack이다.",
          },
          {
            id: "links-q2",
            type: "trueFalse",
            prompt: "공식 문서는 버전이 바뀔 수 있으므로 실습 전 확인하는 것이 좋다.",
            choices: ["참", "거짓"],
            answer: "참",
            explanation: "ROS 2, MoveIt, Nav2, ONNX Runtime 등은 버전별 사용법이 달라질 수 있다.",
          },
        ],
        checklist: [
          "분야별 공식 문서를 북마크했다.",
          "현재 설치 버전과 문서 버전을 맞췄다.",
          "실습 코드 옆에 참고 문서를 연결했다.",
        ],
        resources: [
          {
            title: "Modern Robotics",
            url: "https://hades.mech.northwestern.edu/index.php/Modern_Robotics",
            domain: "로봇팔 / 이론",
            note: "Northwestern의 Modern Robotics 온라인 자료와 책 정보.",
          },
          {
            title: "MoveIt 2 Documentation: Humble",
            url: "https://moveit.picknik.ai/humble/",
            domain: "로봇팔 / ROS 2",
            note: "ROS 2 Humble용 MoveIt 2 튜토리얼, how-to, concept 문서.",
          },
          {
            title: "ros2_control: Humble",
            url: "https://control.ros.org/humble/doc/ros2_control/doc/index.html",
            domain: "제어 / ROS 2",
            note: "controller manager, hardware interface, joint limiting 문서.",
          },
          {
            title: "ROS 2 Humble Documentation",
            url: "https://docs.ros.org/en/humble/",
            domain: "ROS 2 공통",
            note: "workspace, package, topic, service, action, launch 학습 출발점.",
          },
          {
            title: "Nav2 Documentation",
            url: "https://docs.nav2.org/",
            domain: "자율주행",
            note: "planner, controller, behavior tree, costmap 중심 navigation stack.",
          },
          {
            title: "slam_toolbox: Humble",
            url: "https://docs.ros.org/en/ros2_packages/humble/api/slam_toolbox/",
            domain: "SLAM",
            note: "2D SLAM, mapping/localization, pose-graph 관련 ROS 문서.",
          },
          {
            title: "robot_localization ROS Index",
            url: "https://index.ros.org/r/robot_localization/",
            domain: "센서융합",
            note: "EKF/UKF 기반 nonlinear state estimation 패키지 정보.",
          },
          {
            title: "PyTorch Documentation",
            url: "https://docs.pytorch.org/docs/stable/index.html",
            domain: "AI 학습",
            note: "tensor, autograd, neural network, export 학습용 공식 문서.",
          },
          {
            title: "OpenCV Documentation",
            url: "https://docs.opencv.org/4.x/",
            domain: "Vision",
            note: "image preprocessing, calibration, classical vision 알고리즘 문서.",
          },
          {
            title: "ONNX Runtime Documentation",
            url: "https://onnxruntime.ai/docs/",
            domain: "AI 배포",
            note: "ONNX 모델 로딩, 추론, 성능 튜닝과 C++/Python API 문서.",
          },
          {
            title: "NVIDIA TensorRT Documentation",
            url: "https://docs.nvidia.com/tensorrt/",
            domain: "AI 최적화",
            note: "NVIDIA GPU 기반 고성능 inference 최적화 문서.",
          },
          {
            title: "OpenAI Evals API Reference",
            url: "https://platform.openai.com/docs/api-reference/evals",
            domain: "하네스",
            note: "LLM evaluation set과 run을 관리하는 API 참고 문서.",
          },
        ],
      },
    ],
  },
  {
    id: "final-guide",
    title: "13. 마지막 한 줄 가이드",
    summary: "Python 검산, C++ 구현, ROS 2 연결, JetRover 실기, 시뮬레이터 반복, 로그 기록을 꾸준히 반복한다.",
    sections: [
      {
        id: "final-loop",
        title: "반복 루프",
        focus: "학습 사이트의 모든 기능을 하나의 반복 루프로 사용한다.",
        theory: [
          "Python으로 빠르게 검산한다.",
          "C++로 정확하고 재사용 가능한 모듈을 구현한다.",
          "ROS 2 노드로 연결한다.",
          "JetRover 실기에서 실제 감각을 익힌다.",
          "시뮬레이터에서 반복 실험과 고급 기능을 비교한다.",
          "모든 결과를 로그와 노트로 남긴다.",
        ],
        why: [
          "이 흐름을 꾸준히 반복하면 Physical AI 기초체력이 충분히 쌓인다.",
          "이론, 코드, 시각화, 평가가 같은 루프에 들어와야 배운 것이 실제 문제 해결로 이어진다.",
        ],
        cppPractice: cpp(
          "학습 루프 runner",
          `
enum class Step { PythonCheck, CppModule, Ros2Node, Hardware, Simulation, Log };

Step next(Step step) {
  switch (step) {
    case Step::PythonCheck: return Step::CppModule;
    case Step::CppModule: return Step::Ros2Node;
    case Step::Ros2Node: return Step::Hardware;
    case Step::Hardware: return Step::Simulation;
    case Step::Simulation: return Step::Log;
    case Step::Log: return Step::PythonCheck;
  }
  return Step::PythonCheck;
}
          `,
          "학습 흐름을 명시적인 반복 단계로 생각한다.",
          ["각 단계별 산출물을 정의한다.", "실패 시 이전 단계로 돌아가는 규칙을 추가한다.", "progress UI와 연결한다."],
        ),
        pythonPractice: py(
          "오늘의 다음 행동",
          `
loop = ["Python 검산", "C++ 구현", "ROS 2 연결", "JetRover 확인", "시뮬레이터 반복", "로그 정리"]
done = {"Python 검산", "C++ 구현"}
todo = [step for step in loop if step not in done]
print(todo[0])
          `,
          "오늘 어디서 다시 시작해야 하는지 바로 찾는다.",
          ["완료 상태를 localStorage export JSON으로 저장한다.", "주간 루틴과 연결한다.", "회고 문장을 자동 생성한다."],
        ),
        quiz: [
          {
            id: "final-q1",
            type: "choice",
            prompt: "PDF 마지막 가이드의 핵심 흐름에 포함되지 않는 것은?",
            choices: ["모든 결과를 로그와 노트로 남기기", "Python으로 빠르게 검산", "C++로 재사용 모듈 구현", "실험 파라미터를 기억에만 의존"],
            answer: "실험 파라미터를 기억에만 의존",
            explanation: "실험은 재현 가능해야 하므로 파라미터와 로그를 기록해야 한다.",
          },
          {
            id: "final-q2",
            type: "trueFalse",
            prompt: "시각화는 수식과 코드가 실제로 어떻게 움직이는지 확인하는 데 도움이 된다.",
            choices: ["참", "거짓"],
            answer: "참",
            explanation: "브라우저 시각화는 교육용 단순 모델이지만 핵심 동작 확인에 유용하다.",
          },
        ],
        checklist: [
          "오늘 학습한 내용을 이론, 코드, 시각화, 로그 중 최소 2가지 형태로 남겼다.",
          "다음 반복 단계가 무엇인지 정했다.",
          "완료한 섹션을 사이트에서 체크했다.",
        ],
      },
    ],
  },
];

export const curriculum: CurriculumModule[] = rawCurriculum.map((module) => ({
  ...module,
  sections: module.sections.map(upgradeSection).flatMap(expandSections),
}));
