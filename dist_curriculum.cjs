"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var curriculum_exports = {};
__export(curriculum_exports, {
  curriculum: () => curriculum
});
module.exports = __toCommonJS(curriculum_exports);
const defaultParameters = (runtime, topic) => [
  {
    name: "\uC785\uB825 \uB370\uC774\uD130",
    defaultValue: "\uC608\uC81C \uCF54\uB4DC \uB0B4 \uC0C1\uC218",
    unit: "-",
    description: `${topic} \uC2E4\uC2B5\uC5D0\uC11C \uBC14\uAFD4\uAC00\uBA70 \uACB0\uACFC\uB97C \uBE44\uAD50\uD560 \uAE30\uBCF8 \uC785\uB825\uAC12\uC785\uB2C8\uB2E4.`
  },
  {
    name: "\uC2E4\uD589 \uD658\uACBD",
    defaultValue: runtime === "C++" ? "Ubuntu 22.04 / CMake" : "Python 3.10 / venv",
    unit: "-",
    description: "\uBE0C\uB77C\uC6B0\uC800\uB294 \uCF54\uB4DC\uB97C \uCEF4\uD30C\uC77C\uD558\uC9C0 \uC54A\uACE0, \uAC19\uC740 \uAC1C\uB150\uC744 \uC2DC\uAC01\uD654\uB85C \uAC80\uC0B0\uD569\uB2C8\uB2E4."
  }
];
const cpp = (topic, body, expected, tasks, parameters = defaultParameters("C++", topic)) => ({
  goal: `${topic}\uC744 C++ \uBAA8\uB4C8\uB85C \uBD84\uB9AC\uD574 \uC7AC\uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uD615\uD0DC\uB85C \uAD6C\uD604\uD55C\uB2E4.`,
  code: body.trim(),
  starterCode: body.trim(),
  solutionCode: body.trim(),
  expected,
  expectedOutput: expected,
  tasks,
  parameters,
  checks: tasks
});
const py = (topic, body, expected, tasks, parameters = defaultParameters("Python", topic)) => ({
  goal: `${topic}\uC744 Python\uC5D0\uC11C \uBE60\uB974\uAC8C \uAC80\uC0B0\uD558\uACE0 \uADF8\uB798\uD504\uB85C \uD655\uC778\uD55C\uB2E4.`,
  code: body.trim(),
  starterCode: body.trim(),
  solutionCode: body.trim(),
  expected,
  expectedOutput: expected,
  tasks,
  parameters,
  checks: tasks
});
const sourceIdsBySection = (sectionId) => {
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
const graphIdsBySection = (sectionId) => {
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
const executableLabBySection = (sectionId) => {
  if (sectionId.includes("math")) return "rotation-2d";
  if (sectionId.includes("manipulator")) return "two-link-fk";
  if (sectionId.includes("mobile-localization")) return "diff-drive";
  if (sectionId.includes("mobile-planning")) return "astar-grid";
  if (sectionId.includes("mobile-local-control")) return "pure-pursuit";
  if (sectionId.includes("ai")) return "ai-metrics";
  if (sectionId.includes("realtime") || sectionId.includes("safety")) return "latency-stats";
  return "kalman-1d";
};
const figureByGraphId = (id) => {
  const labels = {
    "rotation-basis": ["\uD68C\uC804 basis", "basis vector\uAC00 \uD68C\uC804\uD589\uB82C\uC758 \uC5F4\uBCA1\uD130\uB85C \uC774\uB3D9\uD558\uB294 \uBAA8\uC2B5\uC744 \uBCF8\uB2E4."],
    "gaussian-kf": ["Gaussian / Kalman", "\uCE21\uC815\uAC12\uACFC \uCD94\uC815\uAC12\uC774 noise\uC640 gain\uC5D0 \uB530\uB77C \uC5B4\uB5BB\uAC8C \uC11E\uC774\uB294\uC9C0 \uBCF8\uB2E4."],
    "gradient-descent": ["Gradient descent", "loss surface\uC5D0\uC11C \uC74C\uC758 gradient \uBC29\uD5A5\uC73C\uB85C parameter\uAC00 \uC774\uB3D9\uD55C\uB2E4."],
    "covariance-ellipse": ["Covariance ellipse", "\uACF5\uBD84\uC0B0 \uD589\uB82C\uC758 \uD06C\uAE30\uC640 \uBC29\uD5A5\uC774 \uC704\uCE58 \uBD88\uD655\uC2E4\uC131 \uD0C0\uC6D0\uC744 \uB9CC\uB4E0\uB2E4."],
    "trajectory-polynomial": ["Trajectory polynomial", "\uC704\uCE58, \uC18D\uB3C4, \uAC00\uC18D\uB3C4 \uACBD\uACC4\uC870\uAC74\uC774 \uBD80\uB4DC\uB7EC\uC6B4 \uADA4\uC801\uC744 \uB9CC\uB4E0\uB2E4."],
    "astar-cost": ["A* cost field", "g-cost\uC640 h-cost\uC758 \uD569\uC774 search frontier\uB97C \uBAA9\uD45C \uCABD\uC73C\uB85C \uB2F9\uAE34\uB2E4."],
    "confusion-matrix": ["Confusion matrix", "TP/FP/FN/TN\uC5D0\uC11C accuracy, precision, recall, F1\uC774 \uB098\uC628\uB2E4."],
    "state-machine": ["State machine", "NORMAL, WARNING, STOP, RECOVERY \uAC19\uC740 discrete state \uC804\uC774\uB97C \uBCF8\uB2E4."],
    "retrieval-pipeline": ["Retrieval pipeline", "chunking, top-k retrieval, context assembly, eval\uC774 \uD558\uB098\uC758 \uD558\uB124\uC2A4\uB97C \uC774\uB8EC\uB2E4."]
  };
  const [title, explanation] = labels[id];
  return { id, title, explanation };
};
const executableStarter = (id) => {
  const snippets = {
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
return { values: [raw, command, nextState], command, final: nextState };`
  };
  return snippets[id] ?? `const values = [1, 0.5, 0.25].map((value, index) => Number((value / (index + 1)).toFixed(3)));
console.log("${id}", values);
return { values, final: values.at(-1) };`;
};
const expectedResultShape = (id) => {
  const shapes = {
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
    "ros2-control-pid": "{ values: number[], command: number, final: number }"
  };
  return shapes[id] ?? "{ values: number[], final?: number }";
};
const professionalUnit = (section) => {
  const sourceIds = sourceIdsBySection(section.id);
  const figures = graphIdsBySection(section.id).map(figureByGraphId);
  const common = {
    id: `${section.id}-professional-core`,
    title: `${section.title} \uC804\uBB38 \uD575\uC2EC`,
    summary: `${section.focus} PDF\uC758 \uD559\uC2B5 \uBAA9\uD45C\uB97C \uACF5\uC2DD \uBB38\uC11C \uAE30\uBC18 \uC774\uB860, \uACC4\uC0B0, \uAD6C\uD604 \uAD00\uC810\uC73C\uB85C \uB2E4\uC2DC \uC815\uB9AC\uD55C\uB2E4.`,
    intuition: "\uACF5\uC2DD\uC740 \uC678\uC6CC\uC57C \uD560 \uBB38\uC7A5\uC774 \uC544\uB2C8\uB77C \uC785\uB825\uC774 \uC5B4\uB5BB\uAC8C \uCD9C\uB825\uC73C\uB85C \uBC14\uB00C\uB294\uC9C0 \uC555\uCD95\uD55C \uC9C0\uB3C4\uB2E4. \uC774 \uB2E8\uC6D0\uC5D0\uC11C\uB294 \uBCC0\uC218\uC758 \uBB3C\uB9AC\uC801 \uC758\uBBF8\uC640 \uC88C\uD45C\uACC4, \uB2E8\uC704, \uB178\uC774\uC988, \uC2DC\uAC04\uCD95\uC744 \uAC19\uC774 \uBCF8\uB2E4.",
    assumptions: [
      "\uBAA8\uB4E0 \uAC01\uB3C4\uB294 \uBCC4\uB3C4 \uD45C\uAE30\uAC00 \uC5C6\uC73C\uBA74 radian \uAE30\uC900\uC73C\uB85C \uACC4\uC0B0\uD55C\uB2E4.",
      "\uC88C\uD45C\uACC4\uC640 frame \uAE30\uC900\uC740 \uC218\uC2DD \uC55E\uC5D0 \uBA3C\uC800 \uC815\uC758\uD55C\uB2E4.",
      "\uBE0C\uB77C\uC6B0\uC800 \uC2DC\uBBAC\uB808\uC774\uC158\uC740 \uAD50\uC721\uC6A9 \uB2E8\uC21C \uBAA8\uB378\uC774\uBA70 \uC2E4\uC81C ROS 2/\uD558\uB4DC\uC6E8\uC5B4 \uAC80\uC99D\uC744 \uB300\uCCB4\uD558\uC9C0 \uC54A\uB294\uB2E4."
    ],
    proof: [
      "\uC0C1\uD0DC \uB610\uB294 \uAE30\uD558 \uBCC0\uC218\uC758 \uC815\uC758\uB97C \uBA3C\uC800 \uB454\uB2E4.",
      "\uC815\uC758\uC5D0\uC11C \uCD9C\uBC1C\uD574 \uD544\uC694\uD55C \uC88C\uD45C\uBCC0\uD658, \uBBF8\uBD84, \uD655\uB960 \uC5C5\uB370\uC774\uD2B8\uB97C \uD55C \uB2E8\uACC4\uC529 \uC801\uC6A9\uD55C\uB2E4.",
      "\uB9C8\uC9C0\uB9C9 \uC2DD\uC774 \uCF54\uB4DC\uC758 \uC785\uB825/\uCD9C\uB825\uACFC \uAC19\uC740 \uD615\uD0DC\uC778\uC9C0 \uD655\uC778\uD55C\uB2E4."
    ],
    engineeringMeaning: [
      "\uAC19\uC740 \uC2DD\uC774\uB77C\uB3C4 \uC13C\uC11C \uC9C0\uC5F0, \uB178\uC774\uC988, actuator limit, frame mismatch\uAC00 \uC788\uC73C\uBA74 \uC2E4\uC81C \uB85C\uBD07 \uAC70\uB3D9\uC740 \uB2EC\uB77C\uC9C4\uB2E4.",
      "\uB530\uB77C\uC11C \uC218\uC2DD, \uCF54\uB4DC, \uB85C\uADF8, \uC2DC\uAC01\uD654\uB97C \uD568\uAED8 \uD655\uC778\uD574\uC57C \uB514\uBC84\uAE45 \uAC00\uB2A5\uD55C \uC9C0\uC2DD\uC774 \uB41C\uB2E4."
    ],
    implementationNotes: [
      "Python\uC73C\uB85C \uBA3C\uC800 \uC791\uC740 \uC22B\uC790 \uC608\uC81C\uB97C \uAC80\uC0B0\uD558\uACE0 C++ \uD568\uC218\uB85C \uC62E\uAE34\uB2E4.",
      "ROS 2 \uC5F0\uACB0 \uC804\uC5D0\uB294 \uC785\uB825 \uB2E8\uC704, \uCD9C\uB825 \uB2E8\uC704, \uC608\uC678 \uC870\uAC74, \uB85C\uADF8 metric\uC744 \uC815\uD55C\uB2E4."
    ],
    commonMistakes: [
      "\uC88C\uD45C\uACC4 \uAE30\uC900\uC744 \uBA85\uC2DC\uD558\uC9C0 \uC54A\uACE0 \uC218\uC2DD\uC774\uB098 \uCF54\uB4DC\uB97C \uC791\uC131\uD55C\uB2E4.",
      "\uC774\uB860\uC5D0\uC11C \uC815\uC758\uD55C \uC785\uB825/\uCD9C\uB825 \uB2E8\uC704\uC640 \uCF54\uB4DC \uD30C\uB77C\uBBF8\uD130 \uB2E8\uC704\uB97C \uB2E4\uB974\uAC8C \uB454\uB2E4.",
      "\uD55C \uBC88 \uC131\uACF5\uD55C \uACB0\uACFC\uB9CC \uBCF4\uACE0 \uB85C\uADF8, \uC624\uCC28, \uC2E4\uD328 \uC870\uAC74\uC744 \uB0A8\uAE30\uC9C0 \uC54A\uB294\uB2E4."
    ],
    figures,
    graphExplanations: figures.map((figure) => `${figure.title}: ${figure.explanation}`),
    sourceIds
  };
  if (section.id.includes("manipulator")) {
    return {
      ...common,
      intuition: "\uB85C\uBD07\uD314\uC740 \uB9C1\uD06C \uBCA1\uD130\uB97C \uCC28\uB840\uB85C \uC774\uC5B4 \uBD99\uC774\uB294 \uAE30\uD558 \uBB38\uC81C\uB85C \uC2DC\uC791\uD558\uC9C0\uB9CC, \uC18D\uB3C4\uC640 \uD798\uC744 \uB2E4\uB8E8\uB294 \uC21C\uAC04 \uBBF8\uBD84\uACFC \uC120\uD615\uB300\uC218 \uBB38\uC81C\uAC00 \uB41C\uB2E4. FK\uB294 \uC704\uCE58\uB97C \uD569\uC131\uD558\uACE0, Jacobian\uC740 \uADF8 \uD569\uC131\uC2DD\uC744 \uAD00\uC808\uAC01\uC73C\uB85C \uBBF8\uBD84\uD55C \uAD6D\uC18C \uC120\uD615 \uADFC\uC0AC\uB2E4.",
      assumptions: [
        "2\uB9C1\uD06C \uC608\uC81C\uB294 \uD3C9\uBA74 revolute joint\uC774\uACE0 \uB9C1\uD06C \uAE38\uC774\uB294 \uC591\uC218\uB2E4.",
        "q1\uC740 base frame x\uCD95\uC5D0\uC11C \uCCAB \uB9C1\uD06C\uAE4C\uC9C0\uC758 \uAC01\uB3C4, q2\uB294 \uCCAB \uB9C1\uD06C\uC5D0\uC11C \uB458\uC9F8 \uB9C1\uD06C\uAE4C\uC9C0\uC758 \uC0C1\uB300\uAC01\uC774\uB2E4.",
        "\uB3D9\uC5ED\uD559/\uC81C\uC5B4\uB97C \uC81C\uC678\uD55C \uC6B4\uB3D9\uD559 \uACC4\uC0B0\uC5D0\uC11C\uB294 \uB9C1\uD06C \uC9C8\uB7C9\uACFC \uB9C8\uCC30\uC744 \uBB34\uC2DC\uD55C\uB2E4."
      ],
      details: [
        "\uB85C\uBD07\uD314 \uC774\uB860\uC740 frame \uC815\uC758\uC5D0\uC11C \uC2DC\uC791\uD55C\uB2E4. \uBAA8\uB4E0 pose\uB294 \uC5B4\uB290 frame\uC5D0\uC11C \uC5B4\uB290 frame\uC73C\uB85C \uAC00\uB294 \uBCC0\uD658\uC778\uC9C0 T_ab\uCC98\uB7FC \uD45C\uAE30\uD574\uC57C FK, IK, Jacobian\uC758 \uBD80\uD638 \uC624\uB958\uB97C \uC904\uC77C \uC218 \uC788\uB2E4.",
        "2\uB9C1\uD06C \uD3C9\uBA74\uD314 FK\uB294 \uAC01 \uB9C1\uD06C\uC758 \uD68C\uC804 \uB204\uC801\uC73C\uB85C \uAD6C\uD55C\uB2E4. \uCCAB \uB9C1\uD06C \uB05D\uC810\uC740 q1, \uB9D0\uB2E8\uC740 q1+q2 \uBC29\uD5A5\uC744 \uC0AC\uC6A9\uD558\uBBC0\uB85C x\uC640 y \uC2DD\uC758 \uB450 \uBC88\uC9F8 \uD56D\uC774 \uD56D\uC0C1 \uD569\uAC01\uC744 \uD3EC\uD568\uD55C\uB2E4.",
        "IK\uB294 \uBAA9\uD45C\uC810 \uAC70\uB9AC r\uC774 |l1-l2|\uC640 l1+l2 \uC0AC\uC774\uC778\uC9C0 \uBA3C\uC800 \uAC80\uC0AC\uD55C\uB2E4. \uADF8 \uB2E4\uC74C cosine law\uB85C q2\uB97C \uAD6C\uD558\uACE0 atan2 \uCC28\uC774\uB85C q1\uC744 \uAD6C\uD55C\uB2E4.",
        "Jacobian determinant\uAC00 0\uC5D0 \uAC00\uAE4C\uC6B0\uBA74 \uAC19\uC740 \uB9D0\uB2E8\uC18D\uB3C4\uB97C \uB9CC\uB4E4\uAE30 \uC704\uD574 \uD070 \uAD00\uC808\uC18D\uB3C4\uAC00 \uD544\uC694\uD574\uC9C4\uB2E4. \uC774 \uC0C1\uD0DC\uAC00 singularity\uC774\uBA70 DLS\uB098 joint limit \uD68C\uD53C\uAC00 \uD544\uC694\uD558\uB2E4."
      ],
      formulas: [
        {
          label: "2-link FK",
          expression: "x = l1 cos(q1) + l2 cos(q1 + q2), y = l1 sin(q1) + l2 sin(q1 + q2)",
          description: "\uAD00\uC808\uAC01\uC5D0\uC11C \uB9D0\uB2E8 \uC704\uCE58\uB97C \uACC4\uC0B0\uD55C\uB2E4."
        },
        {
          label: "Jacobian determinant",
          expression: "det(J) = l1 l2 sin(q2)",
          description: "0\uC5D0 \uAC00\uAE4C\uC6B8\uC218\uB85D singularity\uC5D0 \uAC00\uAE4C\uC6CC\uC9C4\uB2E4."
        },
        {
          label: "DLS IK update",
          expression: "dq = J^T (J J^T + lambda^2 I)^-1 e",
          description: "pseudoinverse\uAC00 \uBD88\uC548\uC815\uD55C \uC601\uC5ED\uC5D0\uC11C damping\uC744 \uB123\uB294\uB2E4."
        }
      ],
      derivation: [
        "\uAC01 \uB9C1\uD06C \uBCA1\uD130\uB97C base frame\uC5D0 \uD45C\uD604\uD55C\uB2E4: p1 = [l1 cos q1, l1 sin q1].",
        "\uB450 \uBC88\uC9F8 \uB9C1\uD06C \uBC29\uD5A5\uC740 q1 + q2\uC774\uBBC0\uB85C p2 = [l2 cos(q1+q2), l2 sin(q1+q2)].",
        "\uB9D0\uB2E8 \uC704\uCE58 p = p1 + p2\uB97C q1, q2\uB85C \uD3B8\uBBF8\uBD84\uD558\uBA74 Jacobian\uC758 \uB124 \uC6D0\uC18C\uAC00 \uB098\uC628\uB2E4.",
        "2x2 determinant\uB97C \uC804\uAC1C\uD558\uBA74 \uC911\uAC04 \uD56D\uC774 \uC18C\uAC70\uB418\uC5B4 l1 l2 sin(q2)\uAC00 \uB0A8\uB294\uB2E4."
      ],
      proof: [
        "R(q1)\uB85C \uCCAB \uB9C1\uD06C \uBCA1\uD130 [l1, 0]^T\uB97C \uD68C\uC804\uC2DC\uD0A4\uBA74 p1=[l1 cos q1, l1 sin q1]^T\uC774\uB2E4.",
        "\uB458\uC9F8 \uB9C1\uD06C\uB294 base \uAE30\uC900\uC73C\uB85C q1+q2\uB9CC\uD07C \uD68C\uC804\uD558\uBBC0\uB85C p2=[l2 cos(q1+q2), l2 sin(q1+q2)]^T\uC774\uB2E4.",
        "p=p1+p2\uB97C q1, q2\uB85C \uD3B8\uBBF8\uBD84\uD558\uBA74 J\uC758 \uAC01 \uC5F4\uC740 \uD574\uB2F9 \uAD00\uC808\uC774 \uB9D0\uB2E8 \uC704\uCE58\uC5D0 \uC8FC\uB294 \uC21C\uAC04 \uBCC0\uD654\uC728\uC774\uB2E4.",
        "det(J)=(-l1 sin q1-l2 sin(q1+q2))*l2 cos(q1+q2)-(-l2 sin(q1+q2))*(l1 cos q1+l2 cos(q1+q2))\uB97C \uC815\uB9AC\uD558\uBA74 l1 l2 sin q2\uAC00 \uB41C\uB2E4."
      ],
      engineeringMeaning: [
        "det(J)\uAC00 \uC791\uC73C\uBA74 \uB9D0\uB2E8 \uBC29\uD5A5\uC758 \uC791\uC740 \uC6C0\uC9C1\uC784\uB3C4 \uD070 \uAD00\uC808\uC18D\uB3C4\uB97C \uC694\uAD6C\uD558\uBBC0\uB85C \uC81C\uC5B4 \uBA85\uB839\uC774 \uD280\uAE30 \uC27D\uB2E4.",
        "MoveIt\uC774\uB098 ros2_control\uC5D0\uC11C joint limit, velocity limit, collision constraint\uAC00 \uC911\uC694\uD55C \uC774\uC720\uAC00 \uC5EC\uAE30\uC11C \uB098\uC628\uB2E4."
      ],
      implementationNotes: [
        "FK \uD568\uC218\uC640 Jacobian \uD568\uC218\uB294 \uAC19\uC740 \uC88C\uD45C\uACC4/\uAC01\uB3C4 convention\uC744 \uACF5\uC720\uD574\uC57C \uD55C\uB2E4.",
        "\uC218\uCE58\uBBF8\uBD84 Jacobian\uACFC \uD574\uC11D Jacobian\uC744 \uBE44\uAD50\uD558\uB294 \uD14C\uC2A4\uD2B8\uB97C \uBC18\uB4DC\uC2DC \uB454\uB2E4.",
        "IK solver\uB294 target reachable check\uC640 joint limit clamp\uB97C \uBA3C\uC800 \uB123\uACE0 DLS damping\uC744 \uCD94\uAC00\uD55C\uB2E4."
      ],
      workedExample: {
        prompt: "l1=1.0, l2=0.7, q1=30\uB3C4, q2=60\uB3C4\uC77C \uB54C \uB9D0\uB2E8 \uC704\uCE58\uC640 det(J)\uB97C \uAD6C\uD558\uB77C.",
        steps: [
          "q1+q2=90\uB3C4\uC774\uBBC0\uB85C cos(90)=0, sin(90)=1\uC744 \uC0AC\uC6A9\uD55C\uB2E4.",
          "x = 1*cos30 + 0.7*cos90 = 0.866",
          "y = 1*sin30 + 0.7*sin90 = 1.200",
          "det(J)=1*0.7*sin60=0.606"
        ],
        result: "p=(0.866, 1.200), det(J)=0.606\uC73C\uB85C singularity\uC5D0\uC11C \uCDA9\uBD84\uD788 \uB5A8\uC5B4\uC838 \uC788\uB2E4."
      }
    };
  }
  if (section.id.includes("mobile") || section.id.includes("planning") || section.id.includes("pure")) {
    return {
      ...common,
      intuition: "\uBAA8\uBC14\uC77C \uB85C\uBD07\uC740 \uC791\uC740 \uC2DC\uAC04 \uB3D9\uC548\uC758 body velocity\uB97C world frame pose \uBCC0\uD654\uB85C \uACC4\uC18D \uC801\uBD84\uD55C\uB2E4. localization\uC740 \uADF8 \uC801\uBD84\uC758 drift\uB97C \uC13C\uC11C \uAD00\uCE21\uC73C\uB85C \uC904\uC774\uB294 \uACFC\uC815\uC774\uACE0, planning/control\uC740 \uD604\uC7AC pose\uC5D0\uC11C \uBAA9\uD45C\uAE4C\uC9C0 \uC548\uC804\uD55C \uC18D\uB3C4 \uBA85\uB839\uC744 \uACE0\uB974\uB294 \uACFC\uC815\uC774\uB2E4.",
      assumptions: [
        "\uCC28\uB3D9\uAD6C\uB3D9 \uC608\uC81C\uB294 \uBC14\uD034 \uBBF8\uB044\uB7FC\uC774 \uC5C6\uACE0 \uC88C\uC6B0 \uBC14\uD034 \uBC18\uC9C0\uB984\uC774 \uAC19\uB2E4\uACE0 \uB454\uB2E4.",
        "\uC9E7\uC740 dt \uB3D9\uC548 \uC18D\uB3C4\uB294 \uC77C\uC815\uD558\uB2E4\uACE0 \uAC00\uC815\uD574 Euler integration\uC744 \uC4F4\uB2E4.",
        "grid planning \uC608\uC81C\uB294 cell cost\uAC00 \uADE0\uC77C\uD558\uACE0 \uC7A5\uC560\uBB3C cell\uC740 \uD1B5\uACFC \uBD88\uAC00\uB2A5\uD558\uB2E4\uACE0 \uB454\uB2E4."
      ],
      details: [
        "\uBAA8\uBC14\uC77C \uB85C\uBD07\uC740 pose (x, y, theta)\uB97C \uC2DC\uAC04\uC5D0 \uB530\uB77C \uC801\uBD84\uD55C\uB2E4. odom frame\uC740 \uC5F0\uC18D\uC801\uC774\uC9C0\uB9CC drift\uAC00 \uC788\uACE0, map frame\uC740 global localization \uBCF4\uC815\uC774 \uB4E4\uC5B4\uAC08 \uC218 \uC788\uB2E4.",
        "Differential drive\uB294 \uC88C\uC6B0 \uBC14\uD034 \uC18D\uB3C4 \uD3C9\uADE0\uC73C\uB85C \uC120\uC18D\uB3C4, \uCC28\uC774\uC640 wheel base\uB85C \uAC01\uC18D\uB3C4\uB97C \uB9CC\uB4E0\uB2E4. \uC774 \uAC12\uC774 \uC791\uC740 dt\uB9C8\uB2E4 \uB204\uC801\uB418\uC5B4 odometry\uAC00 \uB41C\uB2E4.",
        "A*\uB294 g-cost\uC640 heuristic\uC744 \uD569\uCE5C f-cost\uAC00 \uB0AE\uC740 \uB178\uB4DC\uB97C \uD655\uC7A5\uD55C\uB2E4. heuristic\uC774 admissible\uD558\uBA74 \uCD5C\uB2E8 \uACBD\uB85C\uC131\uC774 \uC720\uC9C0\uB41C\uB2E4.",
        "Pure Pursuit\uB294 \uB85C\uBD07 \uC88C\uD45C\uACC4\uC758 lookahead target\uC744 \uD5A5\uD574 \uACE1\uB960 kappa = 2y/Ld^2\uB97C \uACC4\uC0B0\uD55C\uB2E4."
      ],
      formulas: [
        {
          label: "Differential drive",
          expression: "v = (vr + vl) / 2, omega = (vr - vl) / b",
          description: "\uC88C\uC6B0 \uBC14\uD034 \uC18D\uB3C4\uC5D0\uC11C body twist\uB97C \uACC4\uC0B0\uD55C\uB2E4."
        },
        {
          label: "Odometry integration",
          expression: "x += v cos(theta) dt, y += v sin(theta) dt, theta += omega dt",
          description: "\uC9E7\uC740 \uC2DC\uAC04 \uAC04\uACA9\uC5D0\uC11C pose\uB97C \uC801\uBD84\uD55C\uB2E4."
        },
        {
          label: "A* score",
          expression: "f(n) = g(n) + h(n)",
          description: "\uC774\uBBF8 \uC628 \uBE44\uC6A9\uACFC \uBAA9\uD45C\uAE4C\uC9C0\uC758 \uCD94\uC815 \uBE44\uC6A9\uC744 \uD569\uCE5C\uB2E4."
        }
      ],
      derivation: [
        "\uBC14\uD034 \uC911\uC2EC\uC758 \uC120\uC18D\uB3C4\uB294 \uB450 \uBC14\uD034 \uC120\uC18D\uB3C4\uC758 \uD3C9\uADE0\uC774\uB2E4.",
        "\uD68C\uC804\uC18D\uB3C4\uB294 \uC624\uB978\uCABD\uACFC \uC67C\uCABD\uC758 \uC774\uB3D9 \uAC70\uB9AC \uCC28\uC774\uB97C wheel base\uB85C \uB098\uB208 \uAC12\uC774\uB2E4.",
        "\uD604\uC7AC yaw \uAE30\uC900\uC73C\uB85C body x\uCD95 \uC18D\uB3C4\uB97C world frame\uC73C\uB85C \uD68C\uC804\uD574 x/y\uC5D0 \uB354\uD55C\uB2E4.",
        "\uB85C\uCEEC \uD50C\uB798\uB108\uC5D0\uC11C\uB294 \uC774 \uC801\uBD84 \uBAA8\uB378\uC744 \uC5EC\uB7EC \uD6C4\uBCF4 trajectory\uC5D0 \uC801\uC6A9\uD574 collision\uACFC cost\uB97C \uBE44\uAD50\uD55C\uB2E4."
      ],
      proof: [
        "\uC67C\uCABD/\uC624\uB978\uCABD \uBC14\uD034 \uC774\uB3D9\uAC70\uB9AC\uB97C \uAC01\uAC01 dl=vl dt, dr=vr dt\uB77C\uACE0 \uB450\uBA74 \uC911\uC2EC \uC774\uB3D9\uAC70\uB9AC\uB294 (dl+dr)/2\uC774\uB2E4.",
        "\uB450 \uBC14\uD034 \uC774\uB3D9\uAC70\uB9AC \uCC28\uC774 dr-dl\uC740 \uBC14\uD034 \uAC04\uACA9 b\uB97C \uBC18\uC9C0\uB984\uC73C\uB85C \uD558\uB294 \uD68C\uC804\uD638 \uCC28\uC774\uB97C \uB9CC\uB4E4\uBA70 dtheta=(dr-dl)/b\uC774\uB2E4.",
        "body frame \uC804\uC9C4\uC18D\uB3C4 v\uB97C world frame\uC73C\uB85C \uD68C\uC804\uD558\uBA74 dx=v cos(theta)dt, dy=v sin(theta)dt\uAC00 \uB41C\uB2E4.",
        "A*\uC5D0\uC11C h\uAC00 \uC2E4\uC81C \uB0A8\uC740 \uBE44\uC6A9\uBCF4\uB2E4 \uD06C\uC9C0 \uC54A\uC73C\uBA74 f=g+h\uAC00 \uCD5C\uC801 \uACBD\uB85C \uD6C4\uBCF4\uB97C \uACFC\uB3C4\uD558\uAC8C \uBC30\uC81C\uD558\uC9C0 \uC54A\uC73C\uBBC0\uB85C \uCD5C\uB2E8 \uACBD\uB85C\uC131\uC774 \uC720\uC9C0\uB41C\uB2E4."
      ],
      engineeringMeaning: [
        "odom\uC740 \uBD80\uB4DC\uB7FD\uC9C0\uB9CC drift\uAC00 \uC788\uACE0 map\uC740 global correction\uC73C\uB85C \uC810\uD504\uD560 \uC218 \uC788\uC5B4 controller\uC5D0\uB294 frame \uC120\uD0DD\uC774 \uC911\uC694\uD558\uB2E4.",
        "Pure Pursuit lookahead\uAC00 \uC9E7\uC73C\uBA74 \uBE60\uB974\uAC8C \uBC18\uC751\uD558\uC9C0\uB9CC \uD754\uB4E4\uB9AC\uACE0, \uAE38\uBA74 \uBD80\uB4DC\uB7FD\uC9C0\uB9CC \uCF54\uB108\uB97C \uD06C\uAC8C \uB3C8\uB2E4."
      ],
      implementationNotes: [
        "encoder tick, wheel radius, wheel base \uB2E8\uC704\uB97C \uB85C\uADF8\uC5D0 \uB0A8\uAE34\uB2E4.",
        "Nav2 \uD29C\uB2DD\uC740 planner/controller/costmap/BT\uB97C \uBD84\uB9AC\uD574\uC11C \uD55C \uBC88\uC5D0 \uD558\uB098\uC529 \uBC14\uAFBC\uB2E4.",
        "EKF\uB294 covariance\uB97C \uAC12\uC73C\uB85C\uB9CC \uC678\uC6B0\uC9C0 \uB9D0\uACE0 \uC13C\uC11C \uC2E0\uB8B0\uB3C4\uC758 \uC0C1\uB300\uC801 \uAC00\uC911\uCE58\uB85C \uD574\uC11D\uD55C\uB2E4."
      ],
      workedExample: {
        prompt: "vl=0.4m/s, vr=0.8m/s, b=0.5m, theta=0, dt=1s\uC77C \uB54C pose \uBCC0\uD654\uB294?",
        steps: ["v=(0.8+0.4)/2=0.6", "omega=(0.8-0.4)/0.5=0.8", "x+=0.6*cos0*1=0.6", "y+=0"],
        result: "1\uCD08 \uB4A4 \uADFC\uC0AC pose\uB294 (0.6, 0, 0.8rad)\uC774\uB2E4."
      }
    };
  }
  if (section.id.includes("ai")) {
    return {
      ...common,
      intuition: "AI \uBAA8\uB378\uC740 \uC13C\uC11C \uC785\uB825\uC744 \uC22B\uC790 \uD150\uC11C\uB85C \uBC14\uAFB8\uACE0, \uD559\uC2B5\uB41C \uD568\uC218\uAC00 \uADF8 \uD150\uC11C\uC5D0\uC11C \uC758\uBBF8 \uC788\uB294 \uCD9C\uB825\uC744 \uB0B4\uB3C4\uB85D \uD558\uB294 \uC2DC\uC2A4\uD15C\uC774\uB2E4. \uB85C\uBD07\uC5D0\uC11C\uB294 \uC815\uD655\uB3C4\uBFD0 \uC544\uB2C8\uB77C \uC9C0\uC5F0, \uC785\uB825 shape, \uC804\uCC98\uB9AC \uC77C\uCE58\uC131, \uC2E4\uD328 \uC870\uAC74\uC774 \uAC19\uC740 \uBE44\uC911\uC73C\uB85C \uC911\uC694\uD558\uB2E4.",
      assumptions: [
        "classification metric\uC740 positive class \uD558\uB098\uB97C \uAE30\uC900\uC73C\uB85C \uC815\uC758\uD55C\uB2E4.",
        "\uC804\uCC98\uB9AC \uC608\uC81C\uB294 uint8 RGB/BGR \uC774\uBBF8\uC9C0\uAC00 float tensor\uB85C \uBC14\uB010\uB2E4\uACE0 \uAC00\uC815\uD55C\uB2E4.",
        "ONNX \uBC30\uD3EC\uC5D0\uC11C\uB294 \uD559\uC2B5 \uBAA8\uB378\uACFC \uCD94\uB860 runtime\uC758 \uC785\uB825 shape\uC640 dtype\uC774 \uC77C\uCE58\uD574\uC57C \uD55C\uB2E4."
      ],
      details: [
        "AI \uD559\uC2B5\uC740 \uB370\uC774\uD130 \uBD84\uD560, \uC804\uCC98\uB9AC, \uBAA8\uB378, loss, metric\uC774 \uD558\uB098\uC758 \uACC4\uC57D\uCC98\uB7FC \uB9DE\uC544\uC57C \uD55C\uB2E4. \uD2B9\uD788 \uB85C\uBD07\uC5D0\uC11C\uB294 \uD559\uC2B5 \uC804\uCC98\uB9AC\uC640 \uBC30\uD3EC \uC804\uCC98\uB9AC \uBD88\uC77C\uCE58\uAC00 \uCE58\uBA85\uC801\uC774\uB2E4.",
        "Confusion matrix\uB294 positive/negative \uC608\uCE21\uC758 \uC131\uACF5\uACFC \uC2E4\uD328\uB97C \uBD84\uD574\uD55C\uB2E4. \uC815\uD655\uB3C4\uB9CC \uBCF4\uBA74 class imbalance\uC5D0\uC11C \uC131\uB2A5\uC744 \uACFC\uB300\uD3C9\uAC00\uD560 \uC218 \uC788\uB2E4.",
        "ONNX export\uB294 \uD559\uC2B5 \uD504\uB808\uC784\uC6CC\uD06C\uC640 \uBC30\uD3EC runtime \uC0AC\uC774\uC758 \uC911\uAC04 \uD45C\uD604\uC774\uB2E4. C++ \uBC30\uD3EC\uC5D0\uC11C\uB294 \uC785\uB825 shape, dtype, normalization, channel order\uB97C \uACE0\uC815\uD574\uC57C \uD55C\uB2E4."
      ],
      formulas: [
        { label: "Precision", expression: "TP / (TP + FP)", description: "positive\uB77C\uACE0 \uD55C \uAC83 \uC911 \uC2E4\uC81C positive \uBE44\uC728." },
        { label: "Recall", expression: "TP / (TP + FN)", description: "\uC2E4\uC81C positive \uC911 \uCC3E\uC544\uB0B8 \uBE44\uC728." },
        { label: "F1", expression: "2PR / (P + R)", description: "precision\uACFC recall\uC758 \uC870\uD654\uD3C9\uADE0." }
      ],
      derivation: [
        "positive class \uAE30\uC900\uC73C\uB85C TP, FP, FN, TN\uC744 \uC815\uC758\uD55C\uB2E4.",
        "\uC815\uBC00\uB3C4\uB294 \uC608\uCE21 positive \uC9D1\uD569\uC758 \uC21C\uB3C4\uB97C \uBCF8\uB2E4.",
        "\uC7AC\uD604\uC728\uC740 \uC2E4\uC81C positive \uC9D1\uD569\uC758 \uD68C\uC218\uC728\uC744 \uBCF8\uB2E4.",
        "\uB450 \uAC12\uC744 \uB3D9\uC2DC\uC5D0 \uB192\uC774\uACE0 \uC2F6\uC744 \uB54C F1\uC744 \uC0AC\uC6A9\uD55C\uB2E4."
      ],
      proof: [
        "precision\uC740 \uC608\uCE21 positive \uC9D1\uD569 \uC911 \uC2E4\uC81C positive\uC758 \uBE44\uC728\uC774\uBBC0\uB85C \uBD84\uBAA8\uAC00 TP+FP\uAC00 \uB41C\uB2E4.",
        "recall\uC740 \uC2E4\uC81C positive \uC9D1\uD569 \uC911 \uBAA8\uB378\uC774 \uCC3E\uC544\uB0B8 \uBE44\uC728\uC774\uBBC0\uB85C \uBD84\uBAA8\uAC00 TP+FN\uC774 \uB41C\uB2E4.",
        "F1\uC740 precision\uACFC recall\uC758 \uC870\uD654\uD3C9\uADE0\uC774\uBBC0\uB85C \uB458 \uC911 \uD558\uB098\uAC00 \uB0AE\uC73C\uBA74 \uAC12\uC774 \uD06C\uAC8C \uB0AE\uC544\uC9C4\uB2E4.",
        "cross entropy\uB294 \uC815\uB2F5 class \uD655\uB960\uC744 \uD06C\uAC8C \uB9CC\uB4E4\uC218\uB85D loss\uAC00 \uC791\uC544\uC9C0\uB294 \uC74C\uC758 \uB85C\uADF8\uC6B0\uB3C4 \uD615\uD0DC\uB2E4."
      ],
      engineeringMeaning: [
        "\uB85C\uBD07 \uCE74\uBA54\uB77C \uCD94\uB860\uC5D0\uC11C\uB294 false positive\uC640 false negative\uC758 \uC704\uD5D8\uC774 \uB2E4\uB974\uBBC0\uB85C metric \uC120\uD0DD\uC774 \uC548\uC804\uC131\uACFC \uC5F0\uACB0\uB41C\uB2E4.",
        "ONNX export \uB4A4\uC5D0\uB294 Python \uACB0\uACFC\uC640 C++ Runtime \uACB0\uACFC\uAC00 \uAC19\uC740 \uC785\uB825\uC5D0\uC11C \uAC19\uC740 \uCD9C\uB825\uC744 \uB0B4\uB294\uC9C0 \uBE44\uAD50\uD574\uC57C \uD55C\uB2E4."
      ],
      implementationNotes: [
        "resize, channel order, normalization mean/std, batch dimension\uC744 \uBA85\uC2DC\uD55C\uB2E4.",
        "latency\uB294 preprocessing, inference, postprocessing\uC73C\uB85C \uB098\uB204\uC5B4 \uAE30\uB85D\uD55C\uB2E4.",
        "confusion matrix\uB294 class\uBCC4\uB85C \uC800\uC7A5\uD558\uACE0 dataset split \uB204\uC218\uB97C \uC810\uAC80\uD55C\uB2E4."
      ],
      workedExample: {
        prompt: "TP=45, FP=5, FN=15\uC77C \uB54C precision, recall, F1\uC744 \uAD6C\uD558\uB77C.",
        steps: ["precision=45/(45+5)=0.900", "recall=45/(45+15)=0.750", "F1=2*0.9*0.75/(0.9+0.75)=0.818"],
        result: "F1\uC740 \uC57D 0.818\uC774\uB2E4."
      }
    };
  }
  if (section.id.includes("llm")) {
    return {
      ...common,
      intuition: "LLM \uC2DC\uC2A4\uD15C\uC740 \uB2E8\uC77C prompt\uAC00 \uC544\uB2C8\uB77C \uC785\uB825 \uBB38\uC11C, retrieval, context assembly, model call, output parser, evaluator\uAC00 \uC774\uC5B4\uC9C4 pipeline\uC774\uB2E4. \uC88B\uC740 \uD558\uB124\uC2A4\uB294 \uC774 pipeline\uC758 \uBCC0\uACBD\uC774 \uD488\uC9C8\uACFC \uC9C0\uC5F0\uC5D0 \uC5B4\uB5A4 \uC601\uD5A5\uC744 \uC8FC\uB294\uC9C0 \uBC18\uBCF5 \uCE21\uC815\uD55C\uB2E4.",
      assumptions: [
        "\uBB38\uC11C\uB294 \uC758\uBBF8 \uB2E8\uC704 chunk\uB85C \uB098\uB258\uACE0 \uAC01 chunk\uB294 \uAC80\uC0C9 \uAC00\uB2A5\uD55C \uD45C\uD604\uC744 \uAC16\uB294\uB2E4.",
        "eval set\uC740 \uC785\uB825, \uAE30\uB300 \uC870\uAC74, \uCC44\uC810 \uAE30\uC900\uC744 \uD3EC\uD568\uD55C\uB2E4.",
        "\uD504\uB86C\uD504\uD2B8 \uBCC0\uACBD\uC740 pass rate\uC640 failure category\uB85C \uBE44\uAD50\uD55C\uB2E4."
      ],
      details: [
        "\uD504\uB86C\uD504\uD2B8\uB294 \uC5ED\uD560, \uBAA9\uD45C, \uC81C\uC57D, \uCD9C\uB825 \uD615\uC2DD\uC744 \uBD84\uB9AC\uD574\uC57C \uD3C9\uAC00 \uAC00\uB2A5\uD55C \uC2DC\uC2A4\uD15C\uC774 \uB41C\uB2E4.",
        "\uCEE8\uD14D\uC2A4\uD2B8 \uC5D4\uC9C0\uB2C8\uC5B4\uB9C1\uC740 \uBB38\uC11C\uB97C chunk\uB85C \uB098\uB204\uACE0, \uC9C8\uBB38\uACFC \uAD00\uB828 \uC788\uB294 chunk\uB9CC \uAC80\uC0C9\uD574 prompt\uC5D0 \uB123\uB294 \uACFC\uC815\uC774\uB2E4.",
        "\uD558\uB124\uC2A4\uB294 eval set, grader, trace, latency, regression \uBE44\uAD50\uB97C \uBB36\uC5B4 \uD504\uB86C\uD504\uD2B8 \uBCC0\uACBD\uC758 \uD488\uC9C8\uC744 \uC218\uCE58\uD654\uD55C\uB2E4."
      ],
      formulas: [
        { label: "Cosine similarity", expression: "sim(a,b)=a\xB7b/(||a||||b||)", description: "\uAC80\uC0C9\uC5D0\uC11C query\uC640 chunk\uC758 \uBC29\uD5A5 \uC720\uC0AC\uB3C4\uB97C \uC7B0\uB2E4." },
        { label: "Pass rate", expression: "passed / total", description: "eval set\uC5D0\uC11C \uAE30\uC900\uC744 \uD1B5\uACFC\uD55C \uBE44\uC728." }
      ],
      derivation: [
        "\uBB38\uC11C\uB97C \uC758\uBBF8 \uB2E8\uC704\uB85C chunking\uD55C\uB2E4.",
        "query\uC640 chunk\uB97C \uAC19\uC740 embedding \uACF5\uAC04\uC5D0 \uB193\uACE0 similarity\uB97C \uACC4\uC0B0\uD55C\uB2E4.",
        "\uC0C1\uC704 k\uAC1C chunk\uB97C prompt context\uC5D0 \uB123\uB294\uB2E4.",
        "golden output \uB610\uB294 grader\uB85C \uACB0\uACFC\uB97C \uD3C9\uAC00\uD558\uACE0 trace\uB97C \uC800\uC7A5\uD55C\uB2E4."
      ],
      proof: [
        "cosine similarity\uB294 \uBCA1\uD130 \uD06C\uAE30\uBCF4\uB2E4 \uBC29\uD5A5\uC744 \uBE44\uAD50\uD558\uBBC0\uB85C \uAE34 \uBB38\uC11C\uC640 \uC9E7\uC740 query\uC758 \uC2A4\uCF00\uC77C \uCC28\uC774\uB97C \uC904\uC778\uB2E4.",
        "top-k retrieval\uC740 context window\uB97C \uC81C\uD55C\uB41C \uC790\uC6D0\uC73C\uB85C \uBCF4\uACE0 \uAD00\uB828 chunk\uB9CC \uC120\uD0DD\uD558\uB294 \uADFC\uC0AC \uCD5C\uC801\uD654\uB2E4.",
        "eval pass rate\uB294 \uD2B9\uC815 \uAE30\uC900\uC744 \uB9CC\uC871\uD55C run\uC758 \uBE44\uC728\uC774\uBBC0\uB85C regression \uBE44\uAD50\uC758 \uCD5C\uC18C \uC9C0\uD45C\uAC00 \uB41C\uB2E4."
      ],
      engineeringMeaning: [
        "retrieval \uD488\uC9C8\uC774 \uB0AE\uC73C\uBA74 \uBAA8\uB378\uC774 \uBAA8\uB974\uB294 \uB0B4\uC6A9\uC744 \uCC44\uC6CC \uB123\uAE30 \uC26C\uC6CC grounding\uC774 \uC57D\uD574\uC9C4\uB2E4.",
        "trace\uC640 latency\uB97C \uB0A8\uAE30\uBA74 \uC2E4\uD328\uAC00 \uAC80\uC0C9, \uD504\uB86C\uD504\uD2B8, \uBAA8\uB378, parser \uC911 \uC5B4\uB514\uC11C \uC0DD\uACBC\uB294\uC9C0 \uBD84\uD574\uD560 \uC218 \uC788\uB2E4."
      ],
      implementationNotes: [
        "prompt template, retrieved chunk id, model config, output parser \uACB0\uACFC\uB97C JSONL\uB85C \uB0A8\uAE34\uB2E4.",
        "golden answer\uB97C \uC644\uC804\uC77C\uCE58\uB85C\uB9CC \uBCF4\uC9C0 \uB9D0\uACE0 \uD544\uC218 \uC870\uAC74 pass/fail\uB85C \uCABC\uAC20\uB2E4."
      ],
      workedExample: {
        prompt: "20\uAC1C eval \uC911 17\uAC1C \uD1B5\uACFC, \uD3C9\uADE0 latency 820ms\uC774\uBA74 pass rate\uC640 \uBCD1\uBAA9\uC744 \uC5B4\uB5BB\uAC8C \uAE30\uB85D\uD560\uAE4C?",
        steps: ["pass rate=17/20=0.85", "\uC2E4\uD328 3\uAC1C\uB97C failure taxonomy\uB85C \uBD84\uB958", "latency\uB294 retrieval/model/postprocess\uB85C \uB098\uB220 trace\uC5D0 \uAE30\uB85D"],
        result: "pass rate 85%, latency 820ms baseline\uC73C\uB85C \uC800\uC7A5\uD55C\uB2E4."
      }
    };
  }
  return {
    ...common,
    intuition: "\uC774 \uB2E8\uC6D0\uC740 \uD2B9\uC815 \uC54C\uACE0\uB9AC\uC998 \uD558\uB098\uBCF4\uB2E4 Physical AI \uD559\uC2B5 \uC808\uCC28 \uC790\uCCB4\uB97C \uB2E4\uB8EC\uB2E4. \uC774\uB860\uC744 \uC77D\uACE0 \uB05D\uB0B4\uC9C0 \uC54A\uACE0, \uC218\uC2DD \uC815\uC758\uC640 \uAD6C\uD604 \uC785\uB825/\uCD9C\uB825, \uC2E4\uD5D8 \uB85C\uADF8\uAE4C\uC9C0 \uC774\uC5B4\uC57C \uC2E4\uC81C \uC5ED\uB7C9\uC73C\uB85C \uB0A8\uB294\uB2E4.",
    details: [
      ...section.theory,
      "\uC774 \uB2E8\uC6D0\uC740 PDF\uC758 \uAE30\uCD08\uC5ED\uB7C9 \uB85C\uB4DC\uB9F5\uC744 \uC2E4\uC81C \uAD6C\uD604\uACFC \uD3C9\uAC00\uB85C \uC5F0\uACB0\uD558\uAE30 \uC704\uD55C \uD559\uC2B5 \uB2E8\uC704\uB2E4.",
      "\uACF5\uC2DD \uBB38\uC11C\uC758 \uAC1C\uB150\uC740 API \uC0AC\uC6A9\uBC95\uBCF4\uB2E4 \uBA3C\uC800 \uC2DC\uC2A4\uD15C \uACBD\uACC4, \uC785\uB825/\uCD9C\uB825, \uC2E4\uD328 \uC870\uAC74\uC744 \uC774\uD574\uD558\uB294 \uB370 \uD65C\uC6A9\uD55C\uB2E4."
    ],
    formulas: [
      {
        label: "\uD559\uC2B5 \uB8E8\uD504",
        expression: "theory -> derivation -> code -> simulation -> log -> evaluation",
        description: "PDF\uAC00 \uBC18\uBCF5\uD574\uC11C \uAC15\uC870\uD558\uB294 Physical AI \uD559\uC2B5 \uC808\uCC28."
      }
    ],
    derivation: [
      "\uAC1C\uB150\uC744 \uC218\uC2DD \uB610\uB294 \uC0C1\uD0DC \uBCC0\uC218\uB85C \uC815\uC758\uD55C\uB2E4.",
      "\uC791\uC740 \uC785\uB825 \uC608\uC81C\uB85C \uC190\uACC4\uC0B0\uD55C\uB2E4.",
      "Python\uC73C\uB85C \uAC80\uC0B0\uD558\uACE0 C++ \uAD6C\uC870\uB85C \uC62E\uAE34\uB2E4.",
      "ROS 2 \uB610\uB294 \uBE0C\uB77C\uC6B0\uC800 \uC2DC\uBBAC\uB808\uC774\uC158\uC73C\uB85C \uC785\uCD9C\uB825 \uBCC0\uD654\uB97C \uD655\uC778\uD55C\uB2E4."
    ],
    proof: [
      "\uC815\uC758\uAC00 \uC5C6\uC73C\uBA74 \uC785\uB825\uACFC \uCD9C\uB825\uC774 \uD754\uB4E4\uB9AC\uACE0, \uC785\uB825/\uCD9C\uB825\uC774 \uC5C6\uC73C\uBA74 \uAD6C\uD604 \uD14C\uC2A4\uD2B8\uB97C \uB9CC\uB4E4 \uC218 \uC5C6\uB2E4.",
      "\uD14C\uC2A4\uD2B8\uAC00 \uC5C6\uC73C\uBA74 \uC2E4\uD5D8 \uACB0\uACFC\uAC00 \uC6B0\uC5F0\uC778\uC9C0 \uAC1C\uC120\uC778\uC9C0 \uBE44\uAD50\uD560 \uC218 \uC5C6\uB2E4.",
      "\uB530\uB77C\uC11C \uD559\uC2B5 \uB8E8\uD504\uB294 \uC774\uB860\uC5D0\uC11C \uD3C9\uAC00\uAE4C\uC9C0 \uB2EB\uD78C \uC21C\uD658\uC774\uC5B4\uC57C \uD55C\uB2E4."
    ],
    engineeringMeaning: [
      "\uD504\uB85C\uC81D\uD2B8\uAC00 \uCEE4\uC9C8\uC218\uB85D \uC791\uC740 \uC218\uC2DD/\uCF54\uB4DC/\uB85C\uADF8 \uB2E8\uC704\uAC00 \uC7AC\uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uB514\uBC84\uAE45 \uC790\uC0B0\uC774 \uB41C\uB2E4.",
      "\uBC18\uBCF5 \uC2E4\uD5D8\uACFC \uAE30\uB85D\uC740 JetRover \uC2E4\uAE30\uC640 \uC2DC\uBBAC\uB808\uC774\uD130 \uACB0\uACFC \uCC28\uC774\uB97C \uC124\uBA85\uD558\uB294 \uAE30\uBC18\uC774\uB2E4."
    ],
    implementationNotes: [
      "\uAC01 \uC139\uC158\uB9C8\uB2E4 \uCD5C\uC18C \uD558\uB098\uC758 \uC218\uC2DD, \uD558\uB098\uC758 \uCF54\uB4DC \uD568\uC218, \uD558\uB098\uC758 metric\uC744 \uB0A8\uAE34\uB2E4.",
      "\uACF5\uC2DD \uBB38\uC11C\uB97C \uC77D\uC744 \uB54C \uBA85\uB839\uC5B4\uBCF4\uB2E4 \uAC1C\uB150, \uBA54\uC2DC\uC9C0 \uD0C0\uC785, frame, parameter\uB97C \uBA3C\uC800 \uD45C\uC2DC\uD55C\uB2E4."
    ],
    workedExample: {
      prompt: "\uC0C8 \uC54C\uACE0\uB9AC\uC998\uC744 \uACF5\uBD80\uD560 \uB54C \uCD5C\uC18C \uC0B0\uCD9C\uBB3C\uC744 \uC815\uC758\uD558\uB77C.",
      steps: ["\uD575\uC2EC \uACF5\uC2DD 1\uAC1C", "\uC190\uACC4\uC0B0 \uC608\uC81C 1\uAC1C", "Python \uAC80\uC0B0 1\uAC1C", "C++ \uD568\uC218 skeleton 1\uAC1C", "\uB85C\uADF8 metric 1\uAC1C"],
      result: "\uC774 \uB2E4\uC12F \uAC00\uC9C0\uAC00 \uC788\uC5B4\uC57C \uB2E4\uC74C \uC2E4\uD5D8\uC5D0\uC11C \uBE44\uAD50 \uAC00\uB2A5\uD558\uB2E4."
    }
  };
};
const legacyBulletToUnit = (section, bullet, index) => ({
  id: `${section.id}-theory-${index + 1}`,
  title: `${section.title} \xB7 \uAC1C\uB150 ${index + 1}`,
  summary: bullet,
  intuition: "\uC774 \uD56D\uBAA9\uC740 \uC774\uB984\uB9CC \uC54C\uC544\uC11C\uB294 \uBD80\uC871\uD558\uB2E4. \uC5B4\uB5A4 \uC0C1\uD0DC\uBCC0\uC218, \uC88C\uD45C\uACC4, \uD655\uB960, \uC81C\uC5B4\uC785\uB825, \uD3C9\uAC00 metric\uACFC \uC5F0\uACB0\uB418\uB294\uC9C0\uAE4C\uC9C0 \uC7A1\uC544\uC57C \uCF54\uB4DC\uB85C \uC62E\uAE38 \uC218 \uC788\uB2E4.",
  assumptions: [
    "PDF\uC758 \uD56D\uBAA9\uC740 ROS 2 Humble + Ubuntu 22.04 \uD559\uC2B5 \uD750\uB984\uC744 \uAE30\uC900\uC73C\uB85C \uD574\uC11D\uD55C\uB2E4.",
    "\uC218\uC2DD\uC740 \uC791\uC740 \uC608\uC81C\uB85C \uC190\uACC4\uC0B0\uD558\uACE0, \uAD6C\uD604\uC740 Python \uAC80\uC0B0 \uB4A4 C++ \uB610\uB294 ROS 2 \uAD6C\uC870\uB85C \uC62E\uAE34\uB2E4."
  ],
  details: [
    bullet,
    "\uC815\uC758: \uC774 \uAC1C\uB150\uC740 \uC2DC\uC2A4\uD15C\uC5D0\uC11C \uC5B4\uB5A4 \uC785\uB825\uC744 \uBC1B\uC544 \uC5B4\uB5A4 \uCD9C\uB825\uC744 \uB0B4\uB294\uC9C0 \uC124\uBA85\uD558\uB294 \uC774\uB984\uC774\uB2E4. \uC608\uB97C \uB4E4\uC5B4 \uC88C\uD45C\uBCC0\uD658\uC740 frame A\uC758 \uC810\uC744 frame B\uC5D0\uC11C \uD45C\uD604\uD558\uAC8C \uD558\uACE0, \uD544\uD130\uB294 noisy measurement\uB97C \uB354 \uC548\uC815\uC801\uC778 state estimate\uB85C \uBC14\uAFBC\uB2E4.",
    "\uC9C1\uAD00: \uC88B\uC740 \uC774\uB860 \uC774\uD574\uB294 '\uC65C \uC774 \uACF5\uC2DD\uC774 \uD544\uC694\uD55C\uAC00'\uB97C \uB9D0\uD560 \uC218 \uC788\uC5B4\uC57C \uD55C\uB2E4. \uB85C\uBD07\uD314\uC5D0\uC11C\uB294 \uB9D0\uB2E8 \uC704\uCE58\uB97C \uC54C\uAE30 \uC704\uD574 FK\uAC00 \uD544\uC694\uD558\uACE0, \uBAA8\uBC14\uC77C \uB85C\uBD07\uC5D0\uC11C\uB294 \uB2E4\uC74C pose\uB97C \uC608\uCE21\uD558\uAE30 \uC704\uD574 \uC6B4\uB3D9\uD559 \uC801\uBD84\uC774 \uD544\uC694\uD558\uB2E4.",
    "\uC218\uC2DD\uD654: \uBAA8\uB4E0 \uD56D\uBAA9\uC740 \uCD5C\uC18C\uD55C \uBCC0\uC218, \uB2E8\uC704, \uAD00\uACC4\uC2DD \uD558\uB098\uB85C \uC555\uCD95\uD574\uC57C \uD55C\uB2E4. \uBCC0\uC218\uAC00 \uC5C6\uC73C\uBA74 \uAD6C\uD604 \uD30C\uB77C\uBBF8\uD130\uAC00 \uC0DD\uAE30\uC9C0 \uC54A\uACE0, \uB2E8\uC704\uAC00 \uC5C6\uC73C\uBA74 \uC2E4\uAE30\uC5D0\uC11C \uAC12\uC774 \uD2C0\uC5B4\uC9C4\uB2E4.",
    "\uAD6C\uD604 \uC5F0\uACB0: C++\uC5D0\uC11C\uB294 \uD0C0\uC785\uACFC \uD568\uC218 \uACBD\uACC4\uB97C \uBA85\uD655\uD788 \uD558\uACE0, Python\uC5D0\uC11C\uB294 \uC0D8\uD50C \uC785\uB825\uC744 \uBE60\uB974\uAC8C \uBC14\uAFD4 \uADF8\uB798\uD504\uB85C \uD655\uC778\uD55C\uB2E4. ROS 2\uC5D0\uC11C\uB294 topic, frame, timestamp, QoS\uAE4C\uC9C0 \uAC19\uC740 \uACC4\uC57D\uC5D0 \uD3EC\uD568\uB41C\uB2E4.",
    "\uAC80\uC99D: \uACB0\uACFC\uAC00 \uB9DE\uB294\uC9C0\uB294 \uC815\uB2F5 \uC22B\uC790 \uD558\uB098\uBCF4\uB2E4 \uC624\uCC28, \uC870\uAC74 \uBCC0\uD654, \uC2E4\uD328 \uCF00\uC774\uC2A4\uB97C \uD568\uAED8 \uBD10\uC57C \uD55C\uB2E4. \uADF8\uB798\uC11C \uB85C\uADF8\uC640 metric\uC774 \uC774\uB860 \uACF5\uBD80\uC758 \uC77C\uBD80\uB2E4."
  ],
  formulas: [
    {
      label: "\uC77C\uBC18 \uC0C1\uD0DC-\uCD9C\uB825 \uAD00\uC810",
      expression: "output = f(state, input, parameter, noise, time)",
      description: "Physical AI \uAC1C\uB150\uC744 \uCF54\uB4DC\uB85C \uC62E\uAE38 \uB54C \uCD5C\uC18C\uD55C \uD655\uC778\uD574\uC57C \uD558\uB294 \uAD00\uACC4."
    }
  ],
  derivation: [
    "\uBB38\uC81C\uC5D0\uC11C \uC0C1\uD0DC\uBCC0\uC218 x\uC640 \uC785\uB825 u\uB97C \uC815\uD55C\uB2E4.",
    "\uC88C\uD45C\uACC4, \uC2DC\uAC04, \uB178\uC774\uC988, \uD30C\uB77C\uBBF8\uD130 \uC911 \uC5B4\uB5A4 \uAC83\uC774 \uC2DD\uC5D0 \uB4E4\uC5B4\uAC00\uB294\uC9C0 \uD45C\uC2DC\uD55C\uB2E4.",
    "\uC791\uC740 \uC22B\uC790 \uC608\uC81C\uB97C \uB123\uC5B4 \uC190\uACC4\uC0B0\uC73C\uB85C \uCD9C\uB825 y\uB97C \uAD6C\uD55C\uB2E4.",
    "\uB3D9\uC77C\uD55C \uACC4\uC0B0\uC744 Python/C++ \uD568\uC218\uB85C \uC791\uC131\uD558\uACE0 \uC624\uCC28\uB97C \uBE44\uAD50\uD55C\uB2E4."
  ],
  proof: [
    "\uC785\uB825\uACFC \uCD9C\uB825\uC758 \uB2E8\uC704\uAC00 \uB9DE\uC73C\uBA74 \uC2DD\uC758 \uCC28\uC6D0\uC774 \uC77C\uAD00\uB41C\uB2E4.",
    "\uC791\uC740 \uC608\uC81C\uC5D0\uC11C \uC190\uACC4\uC0B0\uACFC \uCF54\uB4DC \uACB0\uACFC\uAC00 \uC77C\uCE58\uD558\uBA74 \uAD6C\uD604\uC758 \uCCAB \uBC88\uC9F8 \uC2E0\uB8B0 \uADFC\uAC70\uAC00 \uC0DD\uAE34\uB2E4.",
    "\uC870\uAC74\uC744 \uBC14\uAFE8\uC744 \uB54C \uACB0\uACFC \uBCC0\uD654\uAC00 \uC9C1\uAD00\uACFC \uB9DE\uC73C\uBA74 \uC774\uB860 \uBAA8\uB378\uC774 \uC2DC\uC2A4\uD15C\uC744 \uC124\uBA85\uD558\uACE0 \uC788\uB2E4\uACE0 \uBCFC \uC218 \uC788\uB2E4."
  ],
  engineeringMeaning: [
    "\uC774\uB860 \uD56D\uBAA9 \uD558\uB098\uB97C \uC2E4\uD5D8 \uAC00\uB2A5\uD55C \uB2E8\uC704\uB85C \uBC14\uAFB8\uBA74 \uB098\uC911\uC5D0 ROS 2 \uB178\uB4DC, \uC2DC\uBBAC\uB808\uC774\uD130, JetRover \uB85C\uADF8\uC640 \uC5F0\uACB0\uD560 \uC218 \uC788\uB2E4.",
    "\uBC18\uB300\uB85C \uC774\uB984\uB9CC \uC554\uAE30\uD558\uBA74 \uB514\uBC84\uAE45 \uC2DC \uC5B4\uB5A4 \uAC12\uC744 \uCC0D\uC5B4\uC57C \uD558\uB294\uC9C0 \uC54C\uAE30 \uC5B4\uB835\uB2E4."
  ],
  implementationNotes: [
    "\uD568\uC218 signature\uC5D0 \uB2E8\uC704\uAC00 \uB4DC\uB7EC\uB098\uAC8C \uC774\uB984\uC744 \uC9D3\uB294\uB2E4.",
    "\uC785\uB825 \uD30C\uB77C\uBBF8\uD130\uB294 YAML/JSON \uB610\uB294 UI slider\uC640 \uC5F0\uACB0\uD560 \uC218 \uC788\uAC8C \uBD84\uB9AC\uD55C\uB2E4.",
    "\uCD9C\uB825\uC740 \uC22B\uC790, \uADF8\uB798\uD504, \uB85C\uADF8 \uC911 \uCD5C\uC18C \uD558\uB098\uB85C \uD655\uC778\uD55C\uB2E4."
  ],
  commonMistakes: ["\uC6A9\uC5B4\uB97C \uC678\uC6B0\uACE0 \uAD6C\uD604 \uC785\uB825/\uCD9C\uB825 \uD615\uD0DC\uB97C \uD655\uC778\uD558\uC9C0 \uC54A\uB294\uB2E4.", "\uB2E8\uC704\uC640 frame\uC744 \uC0DD\uB7B5\uD574 \uCF54\uB4DC \uACB0\uACFC\uB97C \uD574\uC11D\uD558\uC9C0 \uBABB\uD55C\uB2E4."],
  figures: graphIdsBySection(section.id).slice(0, 1).map(figureByGraphId),
  graphExplanations: graphIdsBySection(section.id).slice(0, 1).map((id) => figureByGraphId(id)).map((figure) => `${figure.title}: ${figure.explanation}`),
  sourceIds: sourceIdsBySection(section.id)
});
const advancedQuestionsForSection = (section) => {
  const generic = [
    {
      id: `${section.id}-formula-state-output`,
      type: "formulaBlank",
      difficulty: "\uAE30\uCD08",
      prompt: "Physical AI \uAC1C\uB150\uC744 \uCF54\uB4DC\uB85C \uC62E\uAE38 \uB54C \uC77C\uBC18 \uAD00\uACC4\uC2DD output=f(____, input, parameter, noise, time)\uC758 \uBE48\uCE78\uC744 \uCC44\uC6CC\uB77C.",
      answer: "state",
      acceptedExpressions: ["state", "x", "\uC0C1\uD0DC", "\uC0C1\uD0DC\uBCC0\uC218"],
      formulaSymbols: ["x", "u", "f()", "noise", "t"],
      hint: "\uC2DC\uC2A4\uD15C\uC774 \uD604\uC7AC \uBB34\uC5C7\uC744 \uAE30\uC5B5\uD558\uACE0 \uC788\uB294\uC9C0\uB97C \uB098\uD0C0\uB0B4\uB294 \uBCC0\uC218\uB2E4.",
      points: 2,
      explanation: "\uC0C1\uD0DC\uBCC0\uC218 state\uAC00 \uC788\uC5B4\uC57C \uC785\uB825\uACFC \uD30C\uB77C\uBBF8\uD130\uAC00 \uCD9C\uB825\uC73C\uB85C \uBC14\uB00C\uB294 \uAD00\uACC4\uB97C \uC815\uC758\uD560 \uC218 \uC788\uB2E4."
    },
    {
      id: `${section.id}-derive-loop`,
      type: "derivationStep",
      difficulty: "\uC720\uB3C4",
      prompt: "\uC774\uB860\uC744 \uAD6C\uD604 \uAC00\uB2A5\uD55C \uC9C0\uC2DD\uC73C\uB85C \uBC14\uAFB8\uB294 \uCD5C\uC18C \uC808\uCC28 3\uB2E8\uACC4\uB97C \uC4F0\uB77C.",
      answer: "\uC815\uC758, \uC190\uACC4\uC0B0, \uAD6C\uD604",
      expectedSteps: ["\uC815\uC758", "\uC190\uACC4\uC0B0", "\uAD6C\uD604"],
      hint: "PDF\uC758 Python \uAC80\uC0B0 -> C++ \uAD6C\uD604 -> ROS 2 \uC5F0\uACB0 \uD750\uB984\uC744 \uB5A0\uC62C\uB824\uB77C.",
      points: 3,
      explanation: "\uC815\uC758\uC640 \uC190\uACC4\uC0B0 \uC5C6\uC774 \uAD6C\uD604\uD558\uBA74 \uC785\uB825/\uCD9C\uB825 \uACC4\uC57D\uC774 \uD754\uB4E4\uB9AC\uACE0, \uAD6C\uD604 \uC5C6\uC774 \uC774\uB860\uB9CC \uBCF4\uBA74 \uC2E4\uD5D8 \uC5ED\uB7C9\uC774 \uC0DD\uAE30\uC9C0 \uC54A\uB294\uB2E4."
    },
    {
      id: `${section.id}-formula-dimension`,
      type: "formulaBlank",
      difficulty: "\uC804\uBB38",
      prompt: "\uACF5\uD559 \uACC4\uC0B0\uC5D0\uC11C \uC2DD\uC758 \uC88C\uBCC0\uACFC \uC6B0\uBCC0\uC740 \uAC19\uC740 ____\uB97C \uAC00\uC838\uC57C \uD55C\uB2E4.",
      answer: "\uB2E8\uC704",
      acceptedExpressions: ["\uB2E8\uC704", "unit", "dimension", "\uCC28\uC6D0"],
      formulaSymbols: ["m", "s", "rad", "N", "kg"],
      hint: "m\uC640 rad/s\uCC98\uB7FC \uAC12\uC758 \uC758\uBBF8\uB97C \uACE0\uC815\uD558\uB294 \uAC83.",
      points: 2,
      explanation: "\uB2E8\uC704/\uCC28\uC6D0 \uC77C\uAD00\uC131\uC740 \uC218\uC2DD\uACFC \uCF54\uB4DC \uD30C\uB77C\uBBF8\uD130 \uC624\uB958\uB97C \uCD08\uAE30\uC5D0 \uC7A1\uB294 \uAC00\uC7A5 \uAC15\uD55C \uAC80\uC0AC\uB2E4."
    },
    {
      id: `${section.id}-trace-log-contract`,
      type: "codeTrace",
      difficulty: "\uC804\uBB38",
      prompt: "\uC544\uB798 \uCF54\uB4DC\uAC00 \uC2E4\uD5D8 \uB85C\uADF8\uC5D0 \uBC18\uB4DC\uC2DC \uB0A8\uAE30\uB294 \uC138 \uAC12\uC744 \uC4F0\uB77C.",
      answer: "scenario, parameter, metric",
      codeSnippet: `const row = {
  scenario: "baseline",
  parameter: "lookahead=0.8",
  metric: "tracking_error=0.18",
};`,
      expectedTrace: "scenario parameter metric",
      hint: "\uC5B4\uB5A4 \uC870\uAC74\uC5D0\uC11C, \uBB34\uC5C7\uC744 \uBC14\uAFB8\uACE0, \uBB34\uC5C7\uC744 \uCE21\uC815\uD588\uB294\uC9C0\uB2E4.",
      points: 2,
      explanation: "\uC7AC\uD604 \uAC00\uB2A5\uD55C \uC2E4\uD5D8 \uB85C\uADF8\uB294 scenario, parameter, metric\uC744 \uD568\uAED8 \uAC00\uC838\uC57C \uD55C\uB2E4."
    }
  ];
  if (section.id.includes("manipulator")) {
    return [
      {
        id: `${section.id}-numeric-detj`,
        type: "numeric",
        difficulty: "\uACC4\uC0B0",
        prompt: "l1=1.0, l2=0.7, q2=30\uB3C4\uC77C \uB54C 2\uB9C1\uD06C \uD3C9\uBA74\uD314 Jacobian determinant det(J)=l1*l2*sin(q2)\uB97C \uACC4\uC0B0\uD558\uB77C.",
        answer: "0.35",
        numericAnswer: 0.35,
        tolerance: 0.01,
        hint: "sin(30\uB3C4)=0.5\uC774\uB2E4.",
        points: 3,
        explanation: "sin(30\uB3C4)=0.5\uC774\uBBC0\uB85C det(J)=1.0*0.7*0.5=0.35\uC774\uB2E4."
      },
      {
        id: `${section.id}-derive-fk`,
        type: "derivationStep",
        difficulty: "\uC720\uB3C4",
        prompt: "2\uB9C1\uD06C FK x\uC2DD\uC744 \uC720\uB3C4\uD558\uB294 \uD575\uC2EC \uB2E8\uACC4\uB97C \uC21C\uC11C\uB300\uB85C \uC4F0\uB77C.",
        answer: "p1, p2, sum",
        expectedSteps: ["p1 = l1 cos(q1)", "p2 = l2 cos(q1+q2)", "x = p1 + p2"],
        hint: "\uAC01 \uB9C1\uD06C \uBCA1\uD130\uC758 x\uC131\uBD84\uC744 base frame\uC5D0\uC11C \uB354\uD55C\uB2E4.",
        points: 4,
        explanation: "\uB450 \uB9C1\uD06C \uBCA1\uD130\uB97C base frame\uC5D0 \uD45C\uD604\uD558\uACE0 x \uC131\uBD84\uC744 \uB354\uD558\uBA74 \uB41C\uB2E4."
      },
      {
        id: `${section.id}-formula-dls`,
        type: "formulaBlank",
        difficulty: "\uC804\uBB38",
        prompt: "DLS IK update\uC5D0\uC11C dq = J^T (J J^T + ____ I)^-1 e\uC758 \uBE48\uCE78\uC744 \uCC44\uC6CC\uB77C.",
        answer: "lambda^2",
        acceptedExpressions: ["lambda^2", "\u03BB^2", "lambda squared", "\uB78C\uB2E4\uC81C\uACF1"],
        formulaSymbols: ["\u03BB", "^2", "J(q)", "I", "e"],
        hint: "singularity \uADFC\uCC98\uC5D0\uC11C damping\uC744 \uB9CC\uB4DC\uB294 \uC591\uC218 \uD56D\uC774\uB2E4.",
        points: 3,
        explanation: "DLS\uB294 \u03BB^2 I\uB97C \uB354\uD574 JJ^T\uAC00 \uD2B9\uC774\uD574\uC9C8 \uB54C \uC5ED\uD589\uB82C \uACC4\uC0B0\uC744 \uC548\uC815\uD654\uD55C\uB2E4."
      },
      {
        id: `${section.id}-numeric-fk-y`,
        type: "numeric",
        difficulty: "\uACC4\uC0B0",
        prompt: "l1=1, l2=1, q1=0\uB3C4, q2=90\uB3C4\uC77C \uB54C y=l1*sin(q1)+l2*sin(q1+q2)\uB97C \uACC4\uC0B0\uD558\uB77C.",
        answer: "1",
        numericAnswer: 1,
        tolerance: 1e-3,
        hint: "sin(0)=0, sin(90)=1\uC774\uB2E4.",
        points: 2,
        explanation: "y=1*0+1*1=1\uC774\uB2E4."
      },
      {
        id: `${section.id}-proof-singularity`,
        type: "derivationStep",
        difficulty: "\uC804\uBB38",
        prompt: "det(J)=l1*l2*sin(q2)\uAC00 q2=0\uC5D0\uC11C singularity\uAC00 \uB418\uB294 \uC774\uC720\uB97C \uB2E8\uACC4\uC801\uC73C\uB85C \uC4F0\uB77C.",
        answer: "sin0=0, detJ=0, rank loss",
        expectedSteps: ["sin", "det", "rank"],
        hint: "determinant\uAC00 0\uC774\uBA74 2x2 Jacobian\uC774 full rank\uAC00 \uC544\uB2C8\uB2E4.",
        points: 4,
        explanation: "q2=0\uC774\uBA74 sin(q2)=0\uC774\uACE0 det(J)=0\uC774 \uB418\uC5B4 Jacobian rank\uAC00 \uB5A8\uC5B4\uC9C4\uB2E4."
      },
      ...generic
    ];
  }
  if (section.id.includes("mobile") || section.id.includes("planning") || section.id.includes("pure")) {
    return [
      {
        id: `${section.id}-numeric-omega`,
        type: "numeric",
        difficulty: "\uACC4\uC0B0",
        prompt: "vl=0.2m/s, vr=0.6m/s, wheel_base=0.5m\uC77C \uB54C omega=(vr-vl)/b\uB97C \uACC4\uC0B0\uD558\uB77C.",
        answer: "0.8",
        numericAnswer: 0.8,
        tolerance: 1e-3,
        hint: "\uC624\uB978\uCABD\uACFC \uC67C\uCABD \uC18D\uB3C4 \uCC28\uC774\uB97C \uBC14\uD034 \uAC04\uACA9\uC73C\uB85C \uB098\uB208\uB2E4.",
        points: 3,
        explanation: "(0.6-0.2)/0.5=0.8 rad/s\uC774\uB2E4."
      },
      {
        id: `${section.id}-formula-astar`,
        type: "formulaBlank",
        difficulty: "\uAE30\uCD08",
        prompt: "A*\uC758 \uD3C9\uAC00 \uD568\uC218\uB294 f(n)=____+h(n)\uC774\uB2E4.",
        answer: "g(n)",
        acceptedExpressions: ["g(n)", "g", "cost so far", "\uB204\uC801\uBE44\uC6A9"],
        formulaSymbols: ["g(n)", "h(n)", "f(n)"],
        hint: "\uC2DC\uC791\uC810\uC5D0\uC11C \uD604\uC7AC \uB178\uB4DC\uAE4C\uC9C0 \uC774\uBBF8 \uC9C0\uBD88\uD55C \uBE44\uC6A9\uC774\uB2E4.",
        points: 2,
        explanation: "g(n)\uC740 \uC2DC\uC791\uC810\uC5D0\uC11C \uD604\uC7AC \uB178\uB4DC\uAE4C\uC9C0\uC758 \uB204\uC801 \uBE44\uC6A9\uC774\uB2E4."
      },
      {
        id: `${section.id}-numeric-pure-curvature`,
        type: "numeric",
        difficulty: "\uACC4\uC0B0",
        prompt: "Pure Pursuit\uC5D0\uC11C \uB85C\uBD07 \uC88C\uD45C\uACC4 target y=0.4m, Ld=1.0m\uC77C \uB54C curvature=2y/Ld^2\uB97C \uACC4\uC0B0\uD558\uB77C.",
        answer: "0.8",
        numericAnswer: 0.8,
        tolerance: 1e-3,
        hint: "2*0.4/1^2.",
        points: 3,
        explanation: "curvature=2*0.4/1.0=0.8\uC774\uB2E4."
      },
      {
        id: `${section.id}-formula-ekf`,
        type: "formulaBlank",
        difficulty: "\uC804\uBB38",
        prompt: "EKF covariance prediction\uC758 \uB300\uD45C\uC2DD\uC740 P' = F P F^T + ____ \uC774\uB2E4.",
        answer: "Q",
        acceptedExpressions: ["q", "process noise", "\uD504\uB85C\uC138\uC2A4 \uB178\uC774\uC988", "Q"],
        formulaSymbols: ["P", "F", "Q", "\u03A3"],
        hint: "\uBAA8\uB378 \uC608\uCE21 \uACFC\uC815\uC5D0\uC11C \uCD94\uAC00\uB418\uB294 \uBD88\uD655\uC2E4\uC131\uC774\uB2E4.",
        points: 3,
        explanation: "Q\uB294 process noise covariance\uB85C \uBAA8\uB378 \uC608\uCE21\uC758 \uBD88\uD655\uC2E4\uC131\uC744 \uB098\uD0C0\uB0B8\uB2E4."
      },
      {
        id: `${section.id}-proof-admissible`,
        type: "derivationStep",
        difficulty: "\uC720\uB3C4",
        prompt: "A* heuristic\uC774 admissible\uD560 \uB54C \uCD5C\uB2E8 \uACBD\uB85C\uC131\uC744 \uC720\uC9C0\uD558\uB294 \uC774\uC720\uC758 \uD575\uC2EC \uB2E8\uACC4\uB97C \uC4F0\uB77C.",
        answer: "h<=true cost, no overestimate, optimal",
        expectedSteps: ["h", "over", "optimal"],
        hint: "\uB0A8\uC740 \uBE44\uC6A9\uC744 \uC2E4\uC81C\uBCF4\uB2E4 \uD06C\uAC8C \uC7A1\uC9C0 \uC54A\uB294\uB2E4\uB294 \uC870\uAC74\uC774\uB2E4.",
        points: 4,
        explanation: "h\uAC00 \uC2E4\uC81C \uBE44\uC6A9\uC744 \uACFC\uB300\uD3C9\uAC00\uD558\uC9C0 \uC54A\uC73C\uBA74 \uCD5C\uC801 \uACBD\uB85C \uD6C4\uBCF4\uB97C f-cost\uC5D0\uC11C \uBD80\uB2F9\uD558\uAC8C \uBC00\uC5B4\uB0B4\uC9C0 \uC54A\uB294\uB2E4."
      },
      ...generic
    ];
  }
  if (section.id.includes("ai")) {
    return [
      {
        id: `${section.id}-numeric-f1`,
        type: "numeric",
        difficulty: "\uACC4\uC0B0",
        prompt: "precision=0.8, recall=0.5\uC77C \uB54C F1=2PR/(P+R)\uC744 \uACC4\uC0B0\uD558\uB77C.",
        answer: "0.615",
        numericAnswer: 0.615,
        tolerance: 0.01,
        hint: "\uBD84\uC790\uB294 2*0.8*0.5, \uBD84\uBAA8\uB294 1.3\uC774\uB2E4.",
        points: 3,
        explanation: "2*0.8*0.5/(0.8+0.5)=0.615\uC774\uB2E4."
      },
      {
        id: `${section.id}-trace-preprocess`,
        type: "codeTrace",
        difficulty: "\uC804\uBB38",
        prompt: "image.convertTo(float_img, CV_32FC3, 1.0/255.0)\uC758 \uCD9C\uB825 \uBC94\uC704\uB97C \uC4F0\uB77C.",
        answer: "0~1",
        codeSnippet: "resized.convertTo(float_img, CV_32FC3, 1.0 / 255.0);",
        expectedTrace: "uint8 0~255 pixel values become float 0~1 values",
        hint: "uint8 \uCD5C\uB313\uAC12 255\uC5D0 1/255\uB97C \uACF1\uD55C\uB2E4.",
        points: 2,
        explanation: "1/255 \uC2A4\uCF00\uC77C\uB9C1\uC740 uint8 \uD53D\uC140\uC744 \uBAA8\uB378 \uC785\uB825\uC6A9 float \uBC94\uC704\uB85C \uBC14\uAFBC\uB2E4."
      },
      {
        id: `${section.id}-formula-cross-entropy`,
        type: "formulaBlank",
        difficulty: "\uC804\uBB38",
        prompt: "one-hot \uC815\uB2F5 y\uC640 \uC608\uCE21\uD655\uB960 p\uC5D0 \uB300\uD55C cross entropy\uB294 L=-\u03A3 y_i ____ p_i \uC774\uB2E4.",
        answer: "log",
        acceptedExpressions: ["log", "ln", "\uB85C\uADF8"],
        formulaSymbols: ["\u03A3", "log()", "p_i", "y_i"],
        hint: "\uD655\uB960\uC774 \uC791\uC744 \uB54C loss\uB97C \uD06C\uAC8C \uB9CC\uB4DC\uB294 \uD568\uC218.",
        points: 3,
        explanation: "cross entropy\uB294 \uC815\uB2F5 class \uD655\uB960\uC758 \uC74C\uC758 \uB85C\uADF8\uC6B0\uB3C4\uB2E4."
      },
      {
        id: `${section.id}-numeric-precision`,
        type: "numeric",
        difficulty: "\uACC4\uC0B0",
        prompt: "TP=18, FP=6\uC77C \uB54C precision=TP/(TP+FP)\uB97C \uACC4\uC0B0\uD558\uB77C.",
        answer: "0.75",
        numericAnswer: 0.75,
        tolerance: 1e-3,
        hint: "18/(18+6).",
        points: 2,
        explanation: "precision=18/24=0.75\uC774\uB2E4."
      },
      {
        id: `${section.id}-derive-onnx-contract`,
        type: "derivationStep",
        difficulty: "\uC720\uB3C4",
        prompt: "\uD559\uC2B5 PyTorch \uBAA8\uB378\uACFC ONNX Runtime C++ \uCD94\uB860 \uACB0\uACFC\uB97C \uB9DE\uCD94\uAE30 \uC704\uD55C \uACC4\uC57D 3\uAC00\uC9C0\uB97C \uC4F0\uB77C.",
        answer: "shape, dtype, normalization",
        expectedSteps: ["shape", "dtype", "normal"],
        hint: "\uC785\uB825 \uD150\uC11C\uC758 \uBAA8\uC591, \uC790\uB8CC\uD615, \uC804\uCC98\uB9AC.",
        points: 3,
        explanation: "shape, dtype, normalization/channel order\uAC00 \uB2E4\uB974\uBA74 \uAC19\uC740 \uBAA8\uB378\uB3C4 \uB2E4\uB978 \uCD9C\uB825\uC744 \uB0BC \uC218 \uC788\uB2E4."
      },
      ...generic
    ];
  }
  return [
    {
      id: `${section.id}-formula-loop`,
      type: "formulaBlank",
      difficulty: "\uAE30\uCD08",
      prompt: "PDF\uC758 \uCD94\uCC9C \uD559\uC2B5 \uB8E8\uD504\uB294 Python \uAC80\uC0B0 -> C++ \uAD6C\uD604 -> ROS 2 \uC5F0\uACB0 -> ____ \uAE30\uB85D\uC774\uB2E4.",
      answer: "\uB85C\uADF8",
      acceptedExpressions: ["\uB85C\uADF8", "log", "logging", "\uC2E4\uD5D8 \uB85C\uADF8"],
      formulaSymbols: ["log", "metric", "CSV", "rosbag2"],
      hint: "\uC7AC\uD604 \uAC00\uB2A5\uD55C \uC2E4\uD5D8\uC744 \uC704\uD574 \uB0A8\uAE30\uB294 \uAE30\uB85D\uC774\uB2E4.",
      points: 2,
      explanation: "\uC2E4\uD5D8\uC740 \uC7AC\uD604 \uAC00\uB2A5\uD574\uC57C \uD558\uBBC0\uB85C \uB85C\uADF8\uC640 \uD30C\uB77C\uBBF8\uD130 \uAE30\uB85D\uC774 \uD575\uC2EC\uC774\uB2E4."
    },
    {
      id: `${section.id}-numeric-passrate`,
      type: "numeric",
      difficulty: "\uACC4\uC0B0",
      prompt: "20\uBC88 \uC2E4\uD5D8 \uC911 15\uBC88 \uC131\uACF5\uD588\uB2E4. pass rate=success/total\uC744 \uACC4\uC0B0\uD558\uB77C.",
      answer: "0.75",
      numericAnswer: 0.75,
      tolerance: 1e-3,
      hint: "15/20.",
      points: 2,
      explanation: "15/20=0.75\uC774\uB2E4."
    },
    {
      id: `${section.id}-formula-latency`,
      type: "formulaBlank",
      difficulty: "\uC804\uBB38",
      prompt: "loop jitter\uB294 \uC2E4\uC81C period\uC640 \uBAA9\uD45C period\uC758 ____\uB97C \uBC18\uBCF5 \uCE21\uC815\uD574 \uBCF8\uB2E4.",
      answer: "\uCC28\uC774",
      acceptedExpressions: ["\uCC28\uC774", "difference", "error", "\uD3B8\uCC28"],
      formulaSymbols: ["dt", "target", "error"],
      hint: "target period\uC5D0\uC11C \uC5BC\uB9C8\uB098 \uBC97\uC5B4\uB0AC\uB294\uC9C0.",
      points: 2,
      explanation: "jitter\uB294 \uC8FC\uAE30 \uD754\uB4E4\uB9BC\uC774\uBBC0\uB85C \uC2E4\uC81C period\uC640 \uBAA9\uD45C period\uC758 \uD3B8\uCC28\uB97C \uBCF8\uB2E4."
    },
    {
      id: `${section.id}-derive-eval`,
      type: "derivationStep",
      difficulty: "\uC720\uB3C4",
      prompt: "\uBC18\uBCF5 \uC2E4\uD5D8 \uD3C9\uAC00\uD45C\uB97C \uB9CC\uB4E4 \uB54C \uD544\uC694\uD55C 3\uC694\uC18C\uB97C \uC4F0\uB77C.",
      answer: "scenario, parameter, metric",
      expectedSteps: ["scenario", "parameter", "metric"],
      hint: "\uC5B4\uB5A4 \uC870\uAC74\uC5D0\uC11C, \uBB34\uC5C7\uC744 \uBC14\uAFE8\uACE0, \uBB34\uC5C7\uC744 \uCE21\uC815\uD588\uB294\uC9C0.",
      points: 3,
      explanation: "scenario, parameter, metric\uC774 \uC788\uC5B4\uC57C \uC7AC\uD604 \uAC00\uB2A5\uD55C \uBE44\uAD50\uAC00 \uB41C\uB2E4."
    },
    ...generic
  ];
};
const microTopicsBySection = (section) => {
  const topics = {
    "overview-core": [
      {
        id: "concept-map",
        title: "Physical AI 6\uCD95 \uAC1C\uB150 \uC9C0\uB3C4",
        focus: "\uC218\uD559, \uB85C\uBD07, \uC13C\uC11C, \uACC4\uD68D, AI, ROS 2 \uC2DC\uC2A4\uD15C\uD654\uB97C \uD558\uB098\uC758 \uC758\uC874\uC131 \uADF8\uB798\uD504\uB85C \uC77D\uB294\uB2E4.",
        graphIds: ["state-machine"],
        executableLabId: "latency-stats"
      },
      {
        id: "capability-criteria",
        title: "\uAE30\uCD08\uC5ED\uB7C9 \uD310\uC815 \uAE30\uC900",
        focus: "\uC124\uBA85 \uAC00\uB2A5\uD55C \uC774\uB860, \uC190\uACC4\uC0B0, \uCF54\uB4DC \uAD6C\uD604, \uB85C\uADF8 \uD3C9\uAC00\uB97C \uAC19\uC740 \uAE30\uC900\uC73C\uB85C \uBB36\uB294\uB2E4.",
        graphIds: ["state-machine", "gradient-descent"],
        executableLabId: "latency-stats"
      }
    ],
    "math-foundations": [
      {
        id: "linear-algebra-transforms",
        title: "\uC120\uD615\uB300\uC218\uC640 \uC88C\uD45C\uBCC0\uD658",
        focus: "\uBCA1\uD130, \uB0B4\uC801, \uD589\uB82C\uACF1, \uD68C\uC804\uD589\uB82C, homogeneous transform\uC744 frame \uBCC0\uD658 \uBB38\uC81C\uB85C \uC5F0\uACB0\uD55C\uB2E4.",
        graphIds: ["rotation-basis"],
        executableLabId: "rotation-2d"
      },
      {
        id: "algebra-functions-graphs",
        title: "\uB300\uC218, \uD568\uC218, \uADF8\uB798\uD504",
        focus: "\uBCC0\uC218, \uD568\uC218, \uC9C1\uC120/\uACE1\uC120 \uADF8\uB798\uD504\uB97C \uB85C\uBD07 \uC0C1\uD0DC\uC640 \uC13C\uC11C \uBAA8\uB378\uC758 \uC785\uB825-\uCD9C\uB825 \uAD00\uACC4\uB85C \uC77D\uB294\uB2E4.",
        graphIds: ["gradient-descent"],
        executableLabId: "rosbag-metric-analyzer"
      },
      {
        id: "trigonometry-unit-circle",
        title: "\uC0BC\uAC01\uD568\uC218\uC640 unit circle",
        focus: "sin, cos, tan, atan2\uAC00 \uD68C\uC804, heading, bearing, polar coordinate\uC5D0 \uC4F0\uC774\uB294 \uBC29\uC2DD\uC744 \uC775\uD78C\uB2E4.",
        graphIds: ["rotation-basis"],
        executableLabId: "unit-circle-trig"
      },
      {
        id: "vectors-dot-cross",
        title: "\uBCA1\uD130, \uB0B4\uC801, \uC678\uC801",
        focus: "\uBCA1\uD130 \uD06C\uAE30, \uBC29\uD5A5, projection, normal vector\uB97C \uB85C\uBD07 \uAE30\uD558\uC640 \uCDA9\uB3CC \uD310\uC815\uC73C\uB85C \uC5F0\uACB0\uD55C\uB2E4.",
        graphIds: ["rotation-basis"],
        executableLabId: "homogeneous-transform"
      },
      {
        id: "homogeneous-transform-inverse",
        title: "Homogeneous transform\uACFC \uC5ED\uBCC0\uD658",
        focus: "R\uACFC t\uB97C 4x4 \uD589\uB82C\uB85C \uD569\uCE58\uACE0 T^-1, transform chain, point/vector \uCC28\uC774\uB97C \uC99D\uBA85\uD55C\uB2E4.",
        graphIds: ["rotation-basis"],
        executableLabId: "homogeneous-transform"
      },
      {
        id: "svd-pseudoinverse",
        title: "SVD\uC640 pseudoinverse",
        focus: "rank, singular value, condition number, damped inverse\uAC00 IK\uC640 least squares\uC5D0 \uC8FC\uB294 \uC758\uBBF8\uB97C \uBCF8\uB2E4.",
        graphIds: ["gradient-descent"],
        executableLabId: "svd-pseudoinverse"
      },
      {
        id: "differential-jacobian",
        title: "\uBBF8\uBD84\uACFC Jacobian",
        focus: "\uD3B8\uBBF8\uBD84, chain rule, gradient, Jacobian\uC744 \uC18D\uB3C4\uAE30\uAD6C\uD559\uACFC \uCD5C\uC801\uD654\uC758 \uC5B8\uC5B4\uB85C \uD574\uC11D\uD55C\uB2E4.",
        graphIds: ["gradient-descent", "rotation-basis"],
        executableLabId: "two-link-fk"
      },
      {
        id: "single-variable-calculus",
        title: "\uB2E8\uC77C\uBCC0\uC218 \uBBF8\uBD84/\uC801\uBD84",
        focus: "\uBBF8\uBD84\uC744 \uC21C\uAC04 \uBCC0\uD654\uC728, \uC801\uBD84\uC744 \uB204\uC801\uB7C9\uC73C\uB85C \uD574\uC11D\uD574 \uC18D\uB3C4-\uC704\uCE58, error-area \uAD00\uACC4\uB97C \uC774\uD574\uD55C\uB2E4.",
        graphIds: ["gradient-descent"],
        executableLabId: "pid-response"
      },
      {
        id: "multivariable-gradient",
        title: "\uB2E4\uBCC0\uC218 \uBBF8\uC801\uBD84\uACFC gradient",
        focus: "partial derivative, gradient, tangent plane\uC744 loss \uCD5C\uC801\uD654\uC640 \uC13C\uC11C \uBAA8\uB378 \uC120\uD615\uD654\uC5D0 \uC5F0\uACB0\uD55C\uB2E4.",
        graphIds: ["gradient-descent"],
        executableLabId: "svd-pseudoinverse"
      },
      {
        id: "differential-equations-state-space",
        title: "\uBBF8\uBD84\uBC29\uC815\uC2DD\uACFC state-space",
        focus: "x_dot=f(x,u), \uC774\uC0B0\uD654, \uC548\uC815\uC131 \uC9C1\uAD00\uC744 \uC81C\uC5B4\uC8FC\uAE30\uC640 \uC2DC\uBBAC\uB808\uC774\uC158 \uC5C5\uB370\uC774\uD2B8\uB85C \uC5F0\uACB0\uD55C\uB2E4.",
        graphIds: ["state-machine", "trajectory-polynomial"],
        executableLabId: "pid-response"
      },
      {
        id: "probability-kalman",
        title: "\uD655\uB960, Gaussian, Kalman Filter",
        focus: "\uD3C9\uADE0, \uBD84\uC0B0, \uACF5\uBD84\uC0B0, likelihood, Bayes update\uAC00 noisy sensor\uB97C \uCD94\uC815\uAC12\uC73C\uB85C \uBC14\uAFB8\uB294 \uACFC\uC815\uC744 \uBCF8\uB2E4.",
        graphIds: ["gaussian-kf", "covariance-ellipse"],
        executableLabId: "kalman-1d"
      },
      {
        id: "statistics-bayes-covariance",
        title: "\uD1B5\uACC4, Bayes, covariance",
        focus: "\uC870\uAC74\uBD80\uD655\uB960, Bayes rule, covariance matrix\uB97C \uC13C\uC11C \uC2E0\uB8B0\uB3C4\uC640 fusion weight\uB85C \uD574\uC11D\uD55C\uB2E4.",
        graphIds: ["gaussian-kf", "covariance-ellipse"],
        executableLabId: "ekf-2d"
      },
      {
        id: "optimization-integration",
        title: "\uCD5C\uC801\uD654\uC640 \uC218\uCE58\uC801\uBD84",
        focus: "gradient descent, Gauss-Newton, LM, Euler/RK \uC801\uBD84\uC774 \uB85C\uBD07 \uC0C1\uD0DC \uC5C5\uB370\uC774\uD2B8\uC640 \uD559\uC2B5\uC744 \uC5B4\uB5BB\uAC8C \uC9C0\uD0F1\uD558\uB294\uC9C0 \uBCF8\uB2E4.",
        graphIds: ["gradient-descent", "trajectory-polynomial"],
        executableLabId: "rotation-2d"
      },
      {
        id: "numerical-methods-stability",
        title: "\uC218\uCE58\uD574\uC11D\uACFC \uC548\uC815\uC131",
        focus: "floating point, conditioning, step size, Euler/RK error\uAC00 \uB85C\uBD07 \uC2DC\uBBAC\uB808\uC774\uC158\uACFC \uC81C\uC5B4\uC5D0 \uBBF8\uCE58\uB294 \uC601\uD5A5\uC744 \uBCF8\uB2E4.",
        graphIds: ["gradient-descent", "trajectory-polynomial"],
        executableLabId: "pid-response"
      }
    ],
    "cpp-python-ros2": [
      {
        id: "cpp-structure",
        title: "C++ \uAD6C\uC870\uD654\uC640 CMake",
        focus: "\uD0C0\uC785, \uD568\uC218 \uACBD\uACC4, Eigen/OpenCV \uB9C1\uD06C, timer loop\uB97C \uC7AC\uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uBAA8\uB4C8\uB85C \uB9CC\uB4E0\uB2E4.",
        executableLabId: "latency-stats"
      },
      {
        id: "cmake-package-dependencies",
        title: "CMake\uC640 package dependency",
        focus: "ament_cmake, package.xml, target_link_libraries, find_package\uAC00 \uBE4C\uB4DC \uADF8\uB798\uD504\uB97C \uB9CC\uB4DC\uB294 \uBC29\uC2DD\uC744 \uC775\uD78C\uB2E4.",
        graphIds: ["state-machine"],
        executableLabId: "rosbag-metric-analyzer"
      },
      {
        id: "eigen-opencv-bindings",
        title: "Eigen/OpenCV C++ \uAE30\uCD08",
        focus: "Eigen \uD589\uB82C\uACFC OpenCV Mat\uC744 \uC54C\uACE0\uB9AC\uC998 \uD568\uC218\uC758 \uC785\uB825/\uCD9C\uB825 \uD0C0\uC785\uC73C\uB85C \uC548\uC815\uC801\uC73C\uB85C \uC0AC\uC6A9\uD55C\uB2E4.",
        graphIds: ["rotation-basis"],
        executableLabId: "homogeneous-transform"
      },
      {
        id: "python-validation",
        title: "Python \uAC80\uC0B0\uACFC \uADF8\uB798\uD504",
        focus: "NumPy, pandas, matplotlib\uB85C \uC791\uC740 \uC218\uCE58 \uC608\uC81C\uB97C \uBE60\uB974\uAC8C \uAC80\uC0B0\uD558\uACE0 \uC2DC\uAC01\uD654\uD55C\uB2E4.",
        graphIds: ["gradient-descent"],
        executableLabId: "kalman-1d"
      },
      {
        id: "numpy-scipy-validation",
        title: "NumPy/SciPy \uC218\uCE58 \uAC80\uC0B0",
        focus: "array shape, broadcasting, least squares, optimize \uACB0\uACFC\uB97C C++ \uAD6C\uD604 \uC804 \uAE30\uC900\uAC12\uC73C\uB85C \uB9CC\uB4E0\uB2E4.",
        graphIds: ["gradient-descent"],
        executableLabId: "svd-pseudoinverse"
      },
      {
        id: "ros2-system",
        title: "ROS 2 \uB178\uB4DC, \uD1A0\uD53D, tf2",
        focus: "package, launch, topic, service, action, tf2, params, QoS\uB97C \uC2DC\uC2A4\uD15C \uACC4\uC57D\uC73C\uB85C \uC774\uD574\uD55C\uB2E4.",
        graphIds: ["state-machine"],
        executableLabId: "latency-stats"
      },
      {
        id: "ros2-pubsub-cpp-python",
        title: "ROS 2 pub/sub C++\uC640 Python",
        focus: "rclcpp/rclpy publisher/subscriber\uC758 callback, queue, message \uD0C0\uC785\uC744 \uBE44\uAD50\uD55C\uB2E4.",
        graphIds: ["state-machine"],
        executableLabId: "tf-tree-latency"
      },
      {
        id: "ros2-parameters-launch",
        title: "ROS 2 parameter\uC640 launch",
        focus: "YAML parameter, launch argument, namespace\uB97C \uC2E4\uD5D8 \uC870\uAC74 \uAD00\uB9AC \uB3C4\uAD6C\uB85C \uC0AC\uC6A9\uD55C\uB2E4.",
        graphIds: ["state-machine"],
        executableLabId: "rosbag-metric-analyzer"
      },
      {
        id: "ros2-qos-executor-callback",
        title: "QoS, executor, callback group",
        focus: "QoS mismatch, blocking callback, executor thread\uAC00 \uB370\uC774\uD130 \uC190\uC2E4\uACFC latency\uB97C \uB9CC\uB4DC\uB294 \uACFC\uC815\uC744 \uBD84\uC11D\uD55C\uB2E4.",
        graphIds: ["state-machine"],
        executableLabId: "tf-tree-latency"
      },
      {
        id: "ros2-actions-services",
        title: "Service\uC640 Action",
        focus: "\uC9E7\uC740 \uC694\uCCAD/\uC751\uB2F5 service\uC640 \uC7A5\uAE30 \uC791\uC5C5 action\uC758 goal-feedback-result \uAD6C\uC870\uB97C \uAD6C\uBD84\uD55C\uB2E4.",
        graphIds: ["state-machine"],
        executableLabId: "latency-stats"
      },
      {
        id: "tf2-frames-time",
        title: "tf2 frame\uACFC \uC2DC\uAC04",
        focus: "transform tree, timestamp, lookup timeout\uC774 perception/planning/control \uC5F0\uACB0\uC5D0 \uC8FC\uB294 \uC601\uD5A5\uC744 \uBCF8\uB2E4.",
        graphIds: ["state-machine", "rotation-basis"],
        executableLabId: "tf-tree-latency"
      },
      {
        id: "experiment-logging",
        title: "\uC2E4\uD5D8 \uAE30\uB85D\uACFC \uC7AC\uD604\uC131",
        focus: "CSV, rosbag2, Foxglove, Markdown, Git\uC73C\uB85C \uD30C\uB77C\uBBF8\uD130\uC640 metric\uC744 \uB0A8\uAE34\uB2E4.",
        graphIds: ["state-machine", "gradient-descent"],
        executableLabId: "latency-stats"
      },
      {
        id: "rosbag-foxglove-plotjuggler",
        title: "rosbag2, Foxglove, PlotJuggler",
        focus: "\uC785\uB825 rosbag, time-series plot, failure replay\uB97C \uBC18\uBCF5 \uD3C9\uAC00\uC640 \uC624\uB2F5\uB178\uD2B8\uCC98\uB7FC \uAD00\uB9AC\uD55C\uB2E4.",
        graphIds: ["gradient-descent", "state-machine"],
        executableLabId: "rosbag-metric-analyzer"
      }
    ],
    "manipulator-kinematics": [
      {
        id: "pose-representation",
        title: "\uC790\uC138\uD45C\uD604\uACFC frame",
        focus: "rotation matrix, Euler, axis-angle, quaternion, transform\uC758 \uC7A5\uB2E8\uC810\uACFC singularity\uB97C \uBE44\uAD50\uD55C\uB2E4.",
        graphIds: ["rotation-basis"],
        executableLabId: "rotation-2d"
      },
      {
        id: "so3-se3-lie-groups",
        title: "SO(3), SE(3), Lie group \uC9C1\uAD00",
        focus: "\uD68C\uC804/\uAC15\uCCB4\uBCC0\uD658\uC744 \uD589\uB82C\uAD70\uC73C\uB85C \uBCF4\uACE0 exp/log map\uC774 \uC791\uC740 twist\uC640 pose\uB97C \uC5F0\uACB0\uD558\uB294 \uBC29\uC2DD\uC744 \uC774\uD574\uD55C\uB2E4.",
        graphIds: ["rotation-basis"],
        executableLabId: "homogeneous-transform"
      },
      {
        id: "screw-axis-twist",
        title: "Screw axis\uC640 twist",
        focus: "\uD68C\uC804\uCD95, \uC120\uC18D\uB3C4, angular velocity\uB97C screw coordinate\uB85C \uBB36\uC5B4 PoE FK\uC758 \uC7AC\uB8CC\uB85C \uB9CC\uB4E0\uB2E4.",
        graphIds: ["rotation-basis"],
        executableLabId: "homogeneous-transform"
      },
      {
        id: "dh-poe",
        title: "DH\uC640 PoE \uD45C\uAE30",
        focus: "\uB9C1\uD06C \uCCB4\uC778 FK\uB97C DH parameter\uC640 Product of Exponentials \uAD00\uC810\uC5D0\uC11C \uC11C\uB85C \uB300\uC751\uC2DC\uD0A8\uB2E4.",
        graphIds: ["rotation-basis"],
        executableLabId: "two-link-fk"
      },
      {
        id: "dh-table-construction",
        title: "DH table \uC791\uC131\uBC95",
        focus: "a, alpha, d, theta\uB97C frame assignment \uADDC\uCE59\uC5D0 \uB530\uB77C \uCC44\uC6B0\uACE0 transform chain\uC744 \uB9CC\uB4E0\uB2E4.",
        graphIds: ["rotation-basis"],
        executableLabId: "homogeneous-transform"
      },
      {
        id: "forward-kinematics",
        title: "Forward Kinematics \uD589\uB82C\uACF1",
        focus: "\uAD00\uC808\uAC01\uC5D0\uC11C end-effector pose\uB97C \uAD6C\uD558\uB294 FK \uC2DD\uC744 \uD589\uB82C\uACF1\uACFC \uBCA1\uD130\uD569\uC73C\uB85C \uC720\uB3C4\uD55C\uB2E4.",
        graphIds: ["rotation-basis"],
        executableLabId: "two-link-fk"
      },
      {
        id: "fk-unit-tests",
        title: "FK unit test\uC640 frame \uAC80\uC99D",
        focus: "T*T^-1, zero pose, symmetric pose, finite difference\uB97C \uC774\uC6A9\uD574 FK \uCF54\uB4DC\uC758 frame \uC624\uB958\uB97C \uC7A1\uB294\uB2E4.",
        graphIds: ["rotation-basis"],
        executableLabId: "homogeneous-transform"
      },
      {
        id: "inverse-kinematics",
        title: "Inverse Kinematics \uD574\uC11D/\uC218\uCE58\uD574",
        focus: "2-link cosine law, pseudoinverse, DLS, joint limit\uC774 IK \uC548\uC815\uC131\uC5D0 \uC8FC\uB294 \uC601\uD5A5\uC744 \uBCF8\uB2E4.",
        graphIds: ["rotation-basis", "trajectory-polynomial"],
        executableLabId: "two-link-fk"
      },
      {
        id: "analytic-ik-cosine-law",
        title: "\uD574\uC11D IK\uC640 cosine law",
        focus: "reachable workspace, elbow-up/down, atan2 \uCC28\uC774\uB85C 2-link IK \uD574\uB97C \uC9C1\uC811 \uC720\uB3C4\uD55C\uB2E4.",
        graphIds: ["rotation-basis"],
        executableLabId: "two-link-fk"
      },
      {
        id: "numerical-ik-dls",
        title: "\uC218\uCE58 IK\uC640 DLS",
        focus: "J^+\uC640 damped least squares update\uB97C \uBE44\uAD50\uD558\uACE0 singularity \uADFC\uCC98 \uC548\uC815\uC131\uC744 \uBCF8\uB2E4.",
        graphIds: ["gradient-descent", "trajectory-polynomial"],
        executableLabId: "svd-pseudoinverse"
      },
      {
        id: "jacobian-singularity",
        title: "Jacobian, \uD2B9\uC774\uC810, manipulability",
        focus: "xdot=Jqdot, tau=J^TF, det(J), rank loss, manipulability\uB97C \uACC4\uC0B0\uD558\uACE0 \uC2DC\uAC01\uD654\uD55C\uB2E4.",
        graphIds: ["rotation-basis", "trajectory-polynomial"],
        executableLabId: "two-link-fk"
      },
      {
        id: "manipulability-ellipsoid",
        title: "Manipulability ellipsoid",
        focus: "J J^T\uC758 eigenvalue\uAC00 \uB9D0\uB2E8\uC18D\uB3C4 \uAC00\uB2A5 \uBC29\uD5A5\uACFC \uD06C\uAE30\uB97C \uC5B4\uB5BB\uAC8C \uD45C\uD604\uD558\uB294\uC9C0 \uD574\uC11D\uD55C\uB2E4.",
        graphIds: ["covariance-ellipse", "trajectory-polynomial"],
        executableLabId: "svd-pseudoinverse"
      }
    ],
    "manipulator-dynamics-control": [
      {
        id: "rigid-body-dynamics",
        title: "\uB3D9\uC5ED\uD559 M, C, g",
        focus: "\uAD00\uC808 \uD1A0\uD06C\uC640 \uAC00\uC18D\uB3C4\uB97C M(q), C(q,qdot), g(q) \uAD6C\uC870\uB85C \uC77D\uB294\uB2E4.",
        graphIds: ["trajectory-polynomial"],
        executableLabId: "two-link-fk"
      },
      {
        id: "energy-lagrange-dynamics",
        title: "\uC5D0\uB108\uC9C0\uC640 Lagrange \uB3D9\uC5ED\uD559",
        focus: "\uC6B4\uB3D9\uC5D0\uB108\uC9C0, \uC704\uCE58\uC5D0\uB108\uC9C0, Lagrange equation\uC5D0\uC11C M, C, g \uAD6C\uC870\uAC00 \uB098\uC624\uB294 \uD750\uB984\uC744 \uC774\uD574\uD55C\uB2E4.",
        graphIds: ["trajectory-polynomial"],
        executableLabId: "pid-response"
      },
      {
        id: "trajectory-polynomial",
        title: "Cubic/Quintic trajectory",
        focus: "\uACBD\uACC4\uC870\uAC74\uC5D0\uC11C cubic/quintic polynomial \uACC4\uC218\uB97C \uC720\uB3C4\uD558\uACE0 \uC18D\uB3C4/\uAC00\uC18D\uB3C4 \uC5F0\uC18D\uC131\uC744 \uBCF8\uB2E4.",
        graphIds: ["trajectory-polynomial"],
        executableLabId: "latency-stats"
      },
      {
        id: "time-scaling-and-limits",
        title: "Time scaling\uACFC \uC81C\uD55C",
        focus: "velocity/acceleration/jerk limit\uC744 \uB9CC\uC871\uD558\uB3C4\uB85D trajectory duration\uACFC scaling\uC744 \uC870\uC815\uD55C\uB2E4.",
        graphIds: ["trajectory-polynomial"],
        executableLabId: "pid-response"
      },
      {
        id: "controller-design",
        title: "PD, \uC911\uB825\uBCF4\uC0C1, computed torque",
        focus: "feedback, feedforward, saturation\uC774 \uC2E4\uC81C \uAD00\uC808 \uCD94\uC885 \uC548\uC815\uC131\uC5D0 \uC5B4\uB5A4 \uC758\uBBF8\uB97C \uAC16\uB294\uC9C0 \uBCF8\uB2E4.",
        graphIds: ["trajectory-polynomial", "state-machine"],
        executableLabId: "latency-stats"
      },
      {
        id: "computed-torque-stability",
        title: "Computed torque\uC640 \uC548\uC815\uC131",
        focus: "\uBAA8\uB378 \uAE30\uBC18 feedforward\uB85C error dynamics\uB97C \uC120\uD615\uD654\uD558\uACE0 gain \uC120\uD0DD\uC774 \uC218\uB834\uC5D0 \uBBF8\uCE58\uB294 \uC601\uD5A5\uC744 \uBCF8\uB2E4.",
        graphIds: ["trajectory-polynomial", "gradient-descent"],
        executableLabId: "pid-response"
      },
      {
        id: "moveit-ros2-control",
        title: "URDF, MoveIt 2, ros2_control",
        focus: "URDF/tf/joint state/controller manager/planning pipeline\uC744 \uB85C\uBD07\uD314 \uC2DC\uC2A4\uD15C\uC73C\uB85C \uC5F0\uACB0\uD55C\uB2E4.",
        graphIds: ["state-machine"],
        executableLabId: "two-link-fk"
      },
      {
        id: "planning-scene-collision",
        title: "Planning scene\uACFC collision object",
        focus: "MoveIt planning scene, attached object, collision matrix\uAC00 planning timeout\uACFC \uC2E4\uD328\uB97C \uB9CC\uB4DC\uB294 \uACFC\uC815\uC744 \uBCF8\uB2E4.",
        graphIds: ["state-machine"],
        executableLabId: "tf-tree-latency"
      },
      {
        id: "ros2-control-hardware-interface",
        title: "ros2_control hardware interface",
        focus: "command/state interface, controller manager, update rate\uAC00 \uC2E4\uC81C joint command\uB85C \uC5F0\uACB0\uB418\uB294 \uAD6C\uC870\uB97C \uC775\uD78C\uB2E4.",
        graphIds: ["state-machine"],
        executableLabId: "latency-stats"
      }
    ],
    "mobile-localization": [
      {
        id: "kinematics-odometry",
        title: "\uCC28\uB3D9\uAD6C\uB3D9 \uC6B4\uB3D9\uD559\uACFC odometry",
        focus: "vl, vr, wheel base\uC5D0\uC11C v, omega\uB97C \uACC4\uC0B0\uD558\uACE0 pose\uB97C \uC2DC\uAC04 \uC801\uBD84\uD55C\uB2E4.",
        graphIds: ["covariance-ellipse"],
        executableLabId: "diff-drive"
      },
      {
        id: "odometry-error-propagation",
        title: "Odometry \uC624\uCC28 \uC804\uD30C",
        focus: "wheel radius, encoder quantization, slip\uC774 pose covariance\uC640 drift\uB97C \uC5B4\uB5BB\uAC8C \uD0A4\uC6B0\uB294\uC9C0 \uBCF8\uB2E4.",
        graphIds: ["covariance-ellipse"],
        executableLabId: "ekf-2d"
      },
      {
        id: "sensor-time-sync",
        title: "\uC13C\uC11C, timestamp, calibration",
        focus: "encoder, IMU, LiDAR, camera\uC758 timestamp\uC640 frame calibration\uC774 \uCD94\uC815 \uD488\uC9C8\uC744 \uC5B4\uB5BB\uAC8C \uC88C\uC6B0\uD558\uB294\uC9C0 \uBCF8\uB2E4.",
        graphIds: ["state-machine", "covariance-ellipse"],
        executableLabId: "latency-stats"
      },
      {
        id: "imu-bias-calibration",
        title: "IMU bias\uC640 calibration",
        focus: "gyro/accel bias, covariance, gravity alignment\uAC00 EKF \uC785\uB825 \uD488\uC9C8\uC5D0 \uBBF8\uCE58\uB294 \uC601\uD5A5\uC744 \uBD84\uC11D\uD55C\uB2E4.",
        graphIds: ["gaussian-kf", "covariance-ellipse"],
        executableLabId: "ekf-2d"
      },
      {
        id: "kf-ekf-pf",
        title: "KF, EKF, Particle Filter",
        focus: "predict/update, covariance propagation, linearization, particle resampling\uC744 \uBE44\uAD50\uD55C\uB2E4.",
        graphIds: ["gaussian-kf", "covariance-ellipse"],
        executableLabId: "kalman-1d"
      },
      {
        id: "ekf-linearization-jacobian",
        title: "EKF \uC120\uD615\uD654\uC640 Jacobian",
        focus: "\uBE44\uC120\uD615 motion/measurement model\uC744 F,H Jacobian\uC73C\uB85C \uC120\uD615\uD654\uD558\uB294 \uC774\uC720\uB97C \uC720\uB3C4\uD55C\uB2E4.",
        graphIds: ["gaussian-kf", "gradient-descent"],
        executableLabId: "ekf-2d"
      },
      {
        id: "map-odom-base-link",
        title: "map, odom, base_link frame",
        focus: "map \uBCF4\uC815, odom \uC5F0\uC18D\uC131, base_link \uC2E4\uCCB4\uB97C tf tree\uC640 localization \uD328\uD0A4\uC9C0 \uAD00\uC810\uC5D0\uC11C \uC774\uD574\uD55C\uB2E4.",
        graphIds: ["state-machine", "covariance-ellipse"],
        executableLabId: "diff-drive"
      },
      {
        id: "robot-localization-yaml",
        title: "robot_localization YAML \uC124\uACC4",
        focus: "two_d_mode, sensor config vector, differential/relative mode, covariance \uC124\uC815\uC744 \uC2E4\uD5D8 \uACC4\uC57D\uC73C\uB85C \uC815\uB9AC\uD55C\uB2E4.",
        graphIds: ["state-machine", "covariance-ellipse"],
        executableLabId: "tf-tree-latency"
      }
    ],
    "mobile-planning-control": [
      {
        id: "occupancy-costmap",
        title: "Occupancy grid\uC640 costmap",
        focus: "occupancy probability, obstacle inflation, footprint cost\uAC00 planner \uC785\uB825\uC744 \uC5B4\uB5BB\uAC8C \uB9CC\uB4DC\uB294\uC9C0 \uBCF8\uB2E4.",
        graphIds: ["astar-cost", "covariance-ellipse"],
        executableLabId: "astar-grid"
      },
      {
        id: "occupancy-log-odds",
        title: "Occupancy log-odds update",
        focus: "Bayes update\uB97C log-odds \uD615\uD0DC\uB85C \uBC14\uAFD4 hit/miss \uAD00\uCE21\uC744 grid probability\uC5D0 \uB204\uC801\uD55C\uB2E4.",
        graphIds: ["gaussian-kf", "astar-cost"],
        executableLabId: "occupancy-log-odds"
      },
      {
        id: "costmap-inflation-footprint",
        title: "Costmap inflation\uACFC footprint",
        focus: "robot footprint, inflation radius, obstacle cost\uAC00 \uC881\uC740 \uD1B5\uB85C\uC640 \uC548\uC804 \uC5EC\uC720\uC5D0 \uC8FC\uB294 tradeoff\uB97C \uBCF8\uB2E4.",
        graphIds: ["astar-cost"],
        executableLabId: "astar-grid"
      },
      {
        id: "astar-global-planner",
        title: "A* global planner",
        focus: "g-cost, h-cost, admissible heuristic, open set \uD655\uC7A5\uC774 \uCD5C\uB2E8 \uACBD\uB85C\uB97C \uB9CC\uB4DC\uB294 \uC6D0\uB9AC\uB97C \uC99D\uBA85\uD55C\uB2E4.",
        graphIds: ["astar-cost"],
        executableLabId: "astar-grid"
      },
      {
        id: "sampling-planning-rrt-prm",
        title: "Sampling planning RRT/PRM",
        focus: "continuous configuration space\uC5D0\uC11C random sample\uACFC collision check\uB85C feasible path\uB97C \uCC3E\uB294 \uC6D0\uB9AC\uB97C \uBCF8\uB2E4.",
        graphIds: ["astar-cost", "state-machine"],
        executableLabId: "mpc-rollout"
      },
      {
        id: "local-planner-rollout",
        title: "Local planner\uC640 trajectory rollout",
        focus: "candidate trajectory, collision check, velocity sample, score function\uC744 local costmap\uC5D0\uC11C \uD3C9\uAC00\uD55C\uB2E4.",
        graphIds: ["astar-cost", "state-machine"],
        executableLabId: "pure-pursuit"
      },
      {
        id: "dwb-mppi-score-functions",
        title: "DWB/MPPI score function",
        focus: "trajectory \uD6C4\uBCF4\uC758 obstacle, path alignment, goal distance, smoothness cost\uB97C \uBE44\uAD50\uD55C\uB2E4.",
        graphIds: ["astar-cost", "gradient-descent"],
        executableLabId: "mpc-rollout"
      },
      {
        id: "nav2-behavior-tree",
        title: "Nav2 Behavior Tree",
        focus: "planner server, controller server, BT navigator, recovery behavior\uAC00 navigation lifecycle\uC744 \uAD6C\uC131\uD55C\uB2E4.",
        graphIds: ["state-machine"],
        executableLabId: "astar-grid"
      },
      {
        id: "slam-toolbox-debug",
        title: "slam_toolbox\uC640 rosbag \uB514\uBC84\uAE45",
        focus: "mapping/localization, pose graph, scan matching, rosbag replay\uB85C failure case\uB97C \uC7AC\uD604\uD55C\uB2E4.",
        graphIds: ["covariance-ellipse", "state-machine"],
        executableLabId: "diff-drive"
      },
      {
        id: "pose-graph-loop-closure",
        title: "Pose graph\uC640 loop closure",
        focus: "scan matching constraint\uC640 loop closure\uAC00 map drift\uB97C \uC904\uC774\uB294 \uADF8\uB798\uD504 \uCD5C\uC801\uD654 \uAD00\uC810\uC744 \uC774\uD574\uD55C\uB2E4.",
        graphIds: ["covariance-ellipse", "state-machine"],
        executableLabId: "rosbag-metric-analyzer"
      }
    ],
    "mobile-local-control": [
      {
        id: "pure-pursuit-curvature",
        title: "Pure Pursuit \uACE1\uB960 \uACC4\uC0B0",
        focus: "lookahead target\uC758 \uB85C\uBD07 \uC88C\uD45C y\uC640 Ld\uC5D0\uC11C kappa=2y/Ld^2\uB97C \uC720\uB3C4\uD55C\uB2E4.",
        graphIds: ["astar-cost"],
        executableLabId: "pure-pursuit"
      },
      {
        id: "stanley-control",
        title: "Stanley \uC81C\uC5B4",
        focus: "heading error\uC640 lateral error\uB97C \uC870\uD569\uD574 steering command\uB97C \uB9CC\uB4DC\uB294 \uAD6C\uC870\uB97C \uBCF8\uB2E4.",
        graphIds: ["astar-cost", "state-machine"],
        executableLabId: "stanley-controller"
      },
      {
        id: "pid-speed-control",
        title: "PID \uC18D\uB3C4 \uC81C\uC5B4",
        focus: "P/I/D \uD56D\uC774 steady-state error, overshoot, noise \uBBFC\uAC10\uB3C4\uC5D0 \uBBF8\uCE58\uB294 \uC601\uD5A5\uC744 \uC2E4\uD5D8\uD55C\uB2E4.",
        graphIds: ["trajectory-polynomial", "gradient-descent"],
        executableLabId: "pid-response"
      },
      {
        id: "tracking-error-sweep",
        title: "Tracking error\uC640 \uD30C\uB77C\uBBF8\uD130 sweep",
        focus: "lookahead, \uC18D\uB3C4 \uC81C\uD55C, angular velocity limit\uC744 metric\uC73C\uB85C \uBE44\uAD50\uD55C\uB2E4.",
        graphIds: ["gradient-descent", "astar-cost"],
        executableLabId: "pure-pursuit"
      },
      {
        id: "controller-latency-compensation",
        title: "Controller latency \uBCF4\uC0C1",
        focus: "\uC13C\uC11C-\uACC4\uD68D-\uC81C\uC5B4 \uC9C0\uC5F0\uC774 tracking error\uB97C \uD0A4\uC6B0\uB294 \uACFC\uC815\uC744 \uCE21\uC815\uD558\uACE0 \uBCF4\uC0C1 \uC544\uC774\uB514\uC5B4\uB97C \uC815\uB9AC\uD55C\uB2E4.",
        graphIds: ["state-machine", "gradient-descent"],
        executableLabId: "latency-stats"
      }
    ],
    "ai-foundations": [
      {
        id: "ml-math-loss",
        title: "ML \uC218\uD559\uACFC loss",
        focus: "linear layer, activation, cross entropy, gradient descent\uB97C \uC791\uC740 \uC22B\uC790\uB85C \uACC4\uC0B0\uD55C\uB2E4.",
        graphIds: ["gradient-descent", "confusion-matrix"],
        executableLabId: "ai-metrics"
      },
      {
        id: "tensor-shape-autograd",
        title: "Tensor shape\uC640 autograd",
        focus: "batch/channel/height/width shape\uC640 gradient graph\uAC00 \uD559\uC2B5 \uCF54\uB4DC\uC758 \uACC4\uC57D\uC774 \uB418\uB294 \uC774\uC720\uB97C \uC774\uD574\uD55C\uB2E4.",
        graphIds: ["gradient-descent"],
        executableLabId: "convolution-kernel"
      },
      {
        id: "dataset-metrics",
        title: "Dataset split\uACFC metric",
        focus: "train/val/test split, label \uD488\uC9C8, confusion matrix, precision/recall/F1\uC744 \uD3C9\uAC00 \uACC4\uC57D\uC73C\uB85C \uBCF8\uB2E4.",
        graphIds: ["confusion-matrix"],
        executableLabId: "ai-metrics"
      },
      {
        id: "data-leakage-class-imbalance",
        title: "Data leakage\uC640 class imbalance",
        focus: "\uB370\uC774\uD130 \uBD84\uD560 \uB204\uC218, \uBD88\uADE0\uD615 class, threshold \uC120\uD0DD\uC774 metric \uD574\uC11D\uC744 \uC65C\uACE1\uD558\uB294 \uACFC\uC815\uC744 \uBCF8\uB2E4.",
        graphIds: ["confusion-matrix"],
        executableLabId: "ai-metrics"
      },
      {
        id: "mlp-cnn-vision",
        title: "MLP/CNN/Vision \uAE30\uCD08",
        focus: "convolution, feature map, pooling, classifier head\uAC00 \uC774\uBBF8\uC9C0 \uC785\uB825\uC744 label/logit\uC73C\uB85C \uBC14\uAFB8\uB294 \uACFC\uC815\uC744 \uBCF8\uB2E4.",
        graphIds: ["gradient-descent", "confusion-matrix"],
        executableLabId: "convolution-kernel"
      },
      {
        id: "camera-calibration-projection",
        title: "Camera calibration\uACFC projection",
        focus: "intrinsic matrix, distortion, pixel projection\uC744 \uB85C\uBD07 perception \uC88C\uD45C\uACC4 \uBB38\uC81C\uB85C \uC5F0\uACB0\uD55C\uB2E4.",
        graphIds: ["rotation-basis"],
        executableLabId: "camera-projection"
      },
      {
        id: "pcl-filter-segmentation",
        title: "PCL filtering\uACFC segmentation",
        focus: "voxel grid, pass-through, RANSAC plane, cluster extraction\uC774 LiDAR point cloud\uB97C \uC815\uB9AC\uD558\uB294 \uACFC\uC815\uC744 \uBCF8\uB2E4.",
        graphIds: ["state-machine"],
        executableLabId: "rosbag-metric-analyzer"
      },
      {
        id: "preprocessing-contract",
        title: "Vision preprocessing \uACC4\uC57D",
        focus: "resize, RGB/BGR, normalization, dtype, shape mismatch\uAC00 \uCD94\uB860 \uACB0\uACFC\uB97C \uBC14\uAFB8\uB294 \uC774\uC720\uB97C \uC810\uAC80\uD55C\uB2E4.",
        graphIds: ["confusion-matrix"],
        executableLabId: "onnx-shape-contract"
      },
      {
        id: "onnx-runtime-deploy",
        title: "ONNX Runtime \uBC30\uD3EC",
        focus: "PyTorch export, ONNX graph, Runtime session, C++ inference buffer, latency \uCE21\uC815\uC744 \uC5F0\uACB0\uD55C\uB2E4.",
        graphIds: ["state-machine", "confusion-matrix"],
        executableLabId: "onnx-shape-contract"
      },
      {
        id: "onnx-cpp-buffer-contract",
        title: "ONNX Runtime C++ buffer \uACC4\uC57D",
        focus: "input name, dtype, contiguous memory, shape vector, output tensor \uD574\uC11D\uC744 C++ API \uAE30\uC900\uC73C\uB85C \uC815\uB9AC\uD55C\uB2E4.",
        graphIds: ["state-machine"],
        executableLabId: "onnx-shape-contract"
      },
      {
        id: "tensorrt-jetson-latency",
        title: "TensorRT/Jetson latency \uD29C\uB2DD",
        focus: "FP16/INT8, batch size, warmup, preprocess/inference/postprocess \uBD84\uB9AC \uCE21\uC815\uC73C\uB85C \uBC30\uD3EC \uC131\uB2A5\uC744 \uBCF8\uB2E4.",
        graphIds: ["gradient-descent", "state-machine"],
        executableLabId: "latency-stats"
      },
      {
        id: "ros-image-inference-node",
        title: "ROS 2 image inference node",
        focus: "image_transport, cv_bridge, header timestamp, inference result topic\uC744 \uD558\uB098\uC758 perception node\uB85C \uC5F0\uACB0\uD55C\uB2E4.",
        graphIds: ["state-machine", "confusion-matrix"],
        executableLabId: "tf-tree-latency"
      }
    ],
    "llm-engineering": [
      {
        id: "prompt-design",
        title: "Prompt \uC124\uACC4",
        focus: "role, task, constraints, output schema, few-shot \uC608\uC2DC\uB97C \uD3C9\uAC00 \uAC00\uB2A5\uD55C \uD15C\uD50C\uB9BF\uC73C\uB85C \uB9CC\uB4E0\uB2E4.",
        graphIds: ["retrieval-pipeline", "state-machine"],
        executableLabId: "latency-stats"
      },
      {
        id: "tool-calling-contract",
        title: "Tool/function calling \uACC4\uC57D",
        focus: "tool schema, argument validation, structured output\uC774 \uC790\uB3D9\uD654 \uD558\uB124\uC2A4\uC5D0\uC11C \uD544\uC694\uD55C \uC774\uC720\uB97C \uC774\uD574\uD55C\uB2E4.",
        graphIds: ["retrieval-pipeline", "state-machine"],
        executableLabId: "rosbag-metric-analyzer"
      },
      {
        id: "retrieval-context",
        title: "Retrieval\uACFC context assembly",
        focus: "chunking, embedding, top-k retrieval, context window \uC608\uC0B0\uC744 grounding \uBB38\uC81C\uB85C \uB2E4\uB8EC\uB2E4.",
        graphIds: ["retrieval-pipeline"],
        executableLabId: "latency-stats"
      },
      {
        id: "chunking-embedding-eval",
        title: "Chunking, embedding, retrieval eval",
        focus: "chunk \uD06C\uAE30, overlap, top-k, cosine similarity\uAC00 \uB2F5\uBCC0 \uADFC\uAC70\uC640 latency\uC5D0 \uC8FC\uB294 tradeoff\uB97C \uBCF8\uB2E4.",
        graphIds: ["retrieval-pipeline", "gradient-descent"],
        executableLabId: "svd-pseudoinverse"
      },
      {
        id: "eval-harness",
        title: "Eval harness\uC640 regression",
        focus: "golden output, grader, pass rate, latency logging, trace export\uB97C \uD504\uB86C\uD504\uD2B8 \uBCC0\uACBD \uAD00\uB9AC\uC5D0 \uC0AC\uC6A9\uD55C\uB2E4.",
        graphIds: ["retrieval-pipeline", "state-machine"],
        executableLabId: "latency-stats"
      },
      {
        id: "agent-trace-debugging",
        title: "Agent trace\uC640 failure taxonomy",
        focus: "retrieval \uC2E4\uD328, tool \uC624\uB958, reasoning \uC2E4\uD328, parser \uC2E4\uD328\uB97C trace\uC640 rubric\uC73C\uB85C \uBD84\uB958\uD55C\uB2E4.",
        graphIds: ["retrieval-pipeline", "state-machine"],
        executableLabId: "rosbag-metric-analyzer"
      }
    ],
    "jetrover-vs-sim": [
      {
        id: "hardware-scope",
        title: "JetRover \uC2E4\uAE30 \uBC94\uC704",
        focus: "\uC2E4\uC81C \uC13C\uC11C, frame, safety limit, rosbag \uAE30\uB85D\uCC98\uB7FC \uD558\uB4DC\uC6E8\uC5B4\uC5D0\uC11C\uB9CC \uB4DC\uB7EC\uB098\uB294 \uC694\uC18C\uB97C \uD655\uC778\uD55C\uB2E4.",
        graphIds: ["state-machine"],
        executableLabId: "latency-stats"
      },
      {
        id: "simulation-sweep",
        title: "\uC2DC\uBBAC\uB808\uC774\uD130 \uBC18\uBCF5 \uC2E4\uD5D8",
        focus: "dynamics, controller gain, planner parameter, dynamic obstacle\uC744 \uC548\uC804\uD558\uAC8C \uBC18\uBCF5 \uBE44\uAD50\uD55C\uB2E4.",
        graphIds: ["gradient-descent", "trajectory-polynomial"],
        executableLabId: "latency-stats"
      }
    ],
    "recommended-stack": [
      {
        id: "arm-stack",
        title: "\uB85C\uBD07\uD314 \uC774\uB860/\uB77C\uC774\uBE0C\uB7EC\uB9AC \uC2A4\uD0DD",
        focus: "Modern Robotics, Eigen, KDL, Pinocchio/RBDL, MoveIt 2, ros2_control\uC758 \uC5ED\uD560\uC744 \uAD6C\uBD84\uD55C\uB2E4.",
        executableLabId: "two-link-fk"
      },
      {
        id: "nav-stack",
        title: "\uC790\uC728\uC8FC\uD589 \uC2A4\uD0DD",
        focus: "Nav2, slam_toolbox, robot_localization, OpenCV/PCL, tf2\uAC00 navigation pipeline\uC5D0\uC11C \uB9E1\uB294 \uC5ED\uD560\uC744 \uC815\uB9AC\uD55C\uB2E4.",
        executableLabId: "astar-grid"
      },
      {
        id: "ai-stack",
        title: "AI \uBC30\uD3EC \uC2A4\uD0DD",
        focus: "PyTorch, OpenCV, ONNX Runtime, TensorRT, ROS 2 image transport\uB97C \uD559\uC2B5\uACFC \uBC30\uD3EC \uB2E8\uACC4\uB85C \uB098\uB208\uB2E4.",
        executableLabId: "ai-metrics"
      }
    ],
    "weekly-routine": [
      {
        id: "weekly-loop",
        title: "\uC8FC\uAC04 \uC774\uB860-\uAD6C\uD604 \uB8E8\uD504",
        focus: "\uC6D4~\uAE08\uC758 \uC774\uB860, \uC720\uB3C4, C++, Python \uC2DC\uAC01\uD654, ROS 2/\uB85C\uADF8\uB97C \uADE0\uD615 \uC788\uAC8C \uBC30\uCE58\uD55C\uB2E4.",
        executableLabId: "latency-stats"
      },
      {
        id: "review-log",
        title: "\uD68C\uACE0\uC640 \uB85C\uADF8 \uB9AC\uBDF0",
        focus: "\uC774\uBC88 \uC8FC \uC2E4\uD328 \uC870\uAC74, metric \uBCC0\uD654, \uB2E4\uC74C \uC2E4\uD5D8 \uAC00\uC124\uC744 \uAE30\uB85D \uAC00\uB2A5\uD55C \uB370\uC774\uD130\uB85C \uB0A8\uAE34\uB2E4.",
        graphIds: ["gradient-descent", "state-machine"],
        executableLabId: "latency-stats"
      }
    ],
    "minimum-done": [
      {
        id: "arm-check",
        title: "\uB85C\uBD07\uD314 \uCD5C\uC18C \uAD6C\uD604 \uAE30\uC900",
        focus: "2-link FK/IK/Jacobian, singularity, trajectory, URDF/tf\uB97C \uC9C1\uC811 \uC124\uBA85\uD558\uACE0 \uAD6C\uD604\uD55C\uB2E4.",
        executableLabId: "two-link-fk"
      },
      {
        id: "mobile-check",
        title: "\uC790\uC728\uC8FC\uD589 \uCD5C\uC18C \uAD6C\uD604 \uAE30\uC900",
        focus: "odometry, KF/EKF, occupancy grid, A*, Pure Pursuit, Nav2 frame\uC744 \uC9C1\uC811 \uD655\uC778\uD55C\uB2E4.",
        executableLabId: "astar-grid"
      },
      {
        id: "ai-check",
        title: "AI \uCD5C\uC18C \uBC30\uD3EC \uAE30\uC900",
        focus: "dataset split, metric, PyTorch small model, ONNX export, Runtime inference\uB97C \uB05D\uAE4C\uC9C0 \uC5F0\uACB0\uD55C\uB2E4.",
        executableLabId: "ai-metrics"
      },
      {
        id: "llm-check",
        title: "LLM \uD558\uB124\uC2A4 \uCD5C\uC18C \uAE30\uC900",
        focus: "prompt template, chunking/retrieval, eval set, trace/log\uB97C regression \uAC00\uB2A5\uD55C \uAD6C\uC870\uB85C \uB9CC\uB4E0\uB2E4.",
        graphIds: ["retrieval-pipeline"],
        executableLabId: "latency-stats"
      }
    ],
    realtime: [
      {
        id: "loop-latency",
        title: "\uC81C\uC5B4\uC8FC\uAE30, latency, jitter",
        focus: "target period, measured period, jitter, deadline miss\uB97C \uC22B\uC790\uC640 histogram\uC73C\uB85C \uBD84\uC11D\uD55C\uB2E4.",
        graphIds: ["state-machine", "trajectory-polynomial"],
        executableLabId: "latency-stats"
      },
      {
        id: "executor-qos",
        title: "ROS 2 executor\uC640 QoS",
        focus: "callback group, blocking, timestamp, QoS policy\uAC00 \uC8FC\uAE30\uC640 \uC13C\uC11C \uCC98\uB9AC\uC5D0 \uC8FC\uB294 \uC601\uD5A5\uC744 \uC774\uD574\uD55C\uB2E4.",
        graphIds: ["state-machine"],
        executableLabId: "latency-stats"
      }
    ],
    "safety-control-fusion-eval": [
      {
        id: "safety-monitor",
        title: "Safety monitor\uC640 watchdog",
        focus: "fail-safe, E-stop, soft/hard limit, heartbeat timeout, recovery state\uB97C \uC0C1\uD0DC\uBA38\uC2E0\uC73C\uB85C \uC124\uACC4\uD55C\uB2E4.",
        graphIds: ["state-machine"],
        executableLabId: "latency-stats"
      },
      {
        id: "advanced-control",
        title: "LQR/MPC\uC640 constraint",
        focus: "state-space, controllability, cost function, constraint\uAC00 \uACE0\uAE09 \uC81C\uC5B4\uC758 \uD575\uC2EC \uC5B8\uC5B4\uC784\uC744 \uC774\uD574\uD55C\uB2E4.",
        graphIds: ["trajectory-polynomial", "gradient-descent"],
        executableLabId: "latency-stats"
      },
      {
        id: "sensor-fusion",
        title: "\uC13C\uC11C\uC735\uD569\uACFC covariance tuning",
        focus: "time sync, covariance, EKF/UKF, calibration, IMU bias\uAC00 fusion \uD488\uC9C8\uC744 \uC5B4\uB5BB\uAC8C \uBC14\uAFB8\uB294\uC9C0 \uBCF8\uB2E4.",
        graphIds: ["gaussian-kf", "covariance-ellipse"],
        executableLabId: "kalman-1d"
      },
      {
        id: "evaluation-regression",
        title: "\uBC18\uBCF5 \uD3C9\uAC00\uC640 failure taxonomy",
        focus: "benchmark, ablation, parameter sweep, regression test, failure taxonomy\uB85C \uAC1C\uC120\uC744 \uC99D\uBA85\uD55C\uB2E4.",
        graphIds: ["gradient-descent", "state-machine"],
        executableLabId: "latency-stats"
      }
    ],
    "judgement-criteria": [
      {
        id: "ten-axis-rubric",
        title: "10\uCD95 \uC5ED\uB7C9 \uB8E8\uBE0C\uB9AD",
        focus: "\uC218\uD559/\uD45C\uD604\uBD80\uD130 \uBC18\uBCF5 \uD3C9\uAC00\uAE4C\uC9C0 10\uAC1C \uCD95\uC744 \uC99D\uAC70 \uAE30\uBC18\uC73C\uB85C \uCC44\uC810\uD55C\uB2E4.",
        graphIds: ["state-machine"],
        executableLabId: "latency-stats"
      },
      {
        id: "self-assessment",
        title: "\uC790\uAE30 \uD3C9\uAC00\uC640 \uC2EC\uD654 \uC120\uD0DD",
        focus: "4\uAC1C \uD310\uC815 \uC9C8\uBB38\uC758 \uAD6C\uD604 \uC99D\uAC70\uB97C \uBAA8\uC73C\uACE0 \uB2E4\uC74C \uC2EC\uD654 \uB3C4\uBA54\uC778\uC744 \uACE0\uB978\uB2E4.",
        graphIds: ["gradient-descent", "state-machine"],
        executableLabId: "latency-stats"
      }
    ],
    "official-links": [
      {
        id: "source-map",
        title: "\uACF5\uC2DD \uC790\uB8CC \uC9C0\uB3C4",
        focus: "ROS 2, MoveIt, Nav2, PyTorch, ONNX Runtime \uBB38\uC11C\uB97C \uD559\uC2B5 \uC138\uC158\uACFC \uC5F0\uACB0\uD55C\uB2E4.",
        graphIds: ["retrieval-pipeline", "state-machine"],
        executableLabId: "latency-stats"
      },
      {
        id: "doc-reading",
        title: "\uACF5\uC2DD \uBB38\uC11C \uC77D\uAE30 \uBC29\uBC95",
        focus: "\uBC84\uC804, API, concept, tutorial, troubleshooting\uC744 \uAD6C\uBD84\uD574 \uC2E4\uC2B5 \uCF54\uB4DC \uC606\uC5D0 \uCD9C\uCC98\uB97C \uB0A8\uAE34\uB2E4.",
        graphIds: ["retrieval-pipeline"],
        executableLabId: "latency-stats"
      }
    ],
    "final-loop": [
      {
        id: "python-cpp-ros-loop",
        title: "Python-C++-ROS 2 \uBC18\uBCF5 \uB8E8\uD504",
        focus: "\uAC80\uC0B0, \uBAA8\uB4C8\uD654, \uC2DC\uC2A4\uD15C \uC5F0\uACB0, \uD558\uB4DC\uC6E8\uC5B4/\uC2DC\uBBAC\uB808\uC774\uD130 \uD655\uC778\uC744 \uD558\uB098\uC758 \uB2EB\uD78C \uB8E8\uD504\uB85C \uC0AC\uC6A9\uD55C\uB2E4.",
        graphIds: ["state-machine"],
        executableLabId: "latency-stats"
      },
      {
        id: "log-evaluate",
        title: "\uB85C\uADF8\uC640 \uD3C9\uAC00\uB85C \uB05D\uB0B4\uAE30",
        focus: "\uB9E4 \uC2E4\uD5D8\uC744 metric, \uADF8\uB798\uD504, \uC2E4\uD328 \uBD84\uB958, \uB2E4\uC74C \uAC00\uC124\uB85C \uB9C8\uBB34\uB9AC\uD55C\uB2E4.",
        graphIds: ["gradient-descent", "state-machine"],
        executableLabId: "latency-stats"
      }
    ]
  };
  return topics[section.id] ?? [
    {
      id: "core",
      title: `${section.title} \uD575\uC2EC`,
      focus: section.focus,
      graphIds: section.graphIds,
      executableLabId: section.executableLabId
    },
    {
      id: "implementation",
      title: `${section.title} \uAD6C\uD604/\uD3C9\uAC00`,
      focus: `${section.focus} \uC218\uC2DD, \uCF54\uB4DC, \uB85C\uADF8 \uD3C9\uAC00\uB97C \uC5F0\uACB0\uD55C\uB2E4.`,
      graphIds: section.graphIds,
      executableLabId: section.executableLabId
    }
  ];
};
const topicQuestions = (section, topic) => [
  {
    id: `${section.id}-${topic.id}-concept-role`,
    type: "choice",
    difficulty: "\uAE30\uCD08",
    prompt: `[${topic.title}] \uC774 \uC138\uC158\uC5D0\uC11C \uAC00\uC7A5 \uBA3C\uC800 \uACE0\uC815\uD574\uC57C \uD560 \uAC83\uC740 \uBB34\uC5C7\uC778\uAC00?`,
    choices: [
      "\uBCC0\uC218, \uC88C\uD45C\uACC4, \uB2E8\uC704, \uC785\uB825/\uCD9C\uB825 \uACC4\uC57D",
      "\uBC84\uD2BC \uC0C9\uC0C1\uB9CC \uC120\uD0DD",
      "\uC815\uB2F5 \uC22B\uC790 \uD558\uB098\uB9CC \uC554\uAE30",
      "\uB85C\uADF8 \uC5C6\uC774 \uACB0\uACFC\uB9CC \uAE30\uC5B5"
    ],
    answer: "\uBCC0\uC218, \uC88C\uD45C\uACC4, \uB2E8\uC704, \uC785\uB825/\uCD9C\uB825 \uACC4\uC57D",
    points: 1,
    explanation: "\uC804\uBB38 \uD559\uC2B5\uC740 \uAC1C\uB150 \uC774\uB984\uBCF4\uB2E4 \uBCC0\uC218, \uC88C\uD45C\uACC4, \uB2E8\uC704, \uC785\uCD9C\uB825 \uACC4\uC57D\uC744 \uBA3C\uC800 \uACE0\uC815\uD574\uC57C \uAD6C\uD604\uACFC \uAC80\uC99D\uC73C\uB85C \uC774\uC5B4\uC9C4\uB2E4."
  },
  {
    id: `${section.id}-${topic.id}-numeric-pass-rate`,
    type: "numeric",
    difficulty: "\uACC4\uC0B0",
    prompt: `[${topic.title}] 50\uD68C \uC2E4\uD5D8 \uC911 42\uD68C \uAE30\uC900\uC744 \uD1B5\uACFC\uD588\uB2E4. pass rate=passed/total\uC744 \uACC4\uC0B0\uD558\uB77C.`,
    answer: "0.84",
    numericAnswer: 0.84,
    tolerance: 1e-3,
    points: 2,
    hint: "42\uB97C 50\uC73C\uB85C \uB098\uB208\uB2E4.",
    explanation: "42/50=0.84\uC774\uBA70 \uBC18\uBCF5 \uD3C9\uAC00\uC5D0\uC11C\uB294 \uC131\uACF5\uB960\uACFC \uC2E4\uD328 \uBD84\uB958\uB97C \uD568\uAED8 \uBCF8\uB2E4."
  },
  {
    id: `${section.id}-${topic.id}-formula-theta`,
    type: "formulaBlank",
    difficulty: "\uC804\uBB38",
    prompt: `[${topic.title}] y=f(x,u,____,t)\uC5D0\uC11C \uC2DC\uC2A4\uD15C \uD30C\uB77C\uBBF8\uD130\uB97C \uB098\uD0C0\uB0B4\uB294 \uAE30\uD638\uB97C \uCC44\uC6CC\uB77C.`,
    answer: "theta",
    acceptedExpressions: ["theta", "\u03B8", "parameter", "\uD30C\uB77C\uBBF8\uD130"],
    formulaSymbols: ["x", "u", "\u03B8", "t", "f()"],
    points: 2,
    hint: "\uD559\uC2B5 \uB610\uB294 \uD29C\uB2DD\uC73C\uB85C \uBC14\uB00C\uB294 \uC0C1\uC218/\uACC4\uC218\uB2E4.",
    explanation: "\u03B8\uB294 \uBAA8\uB378/\uC81C\uC5B4/\uD3C9\uAC00\uC5D0\uC11C \uC870\uC815\uB418\uB294 \uD30C\uB77C\uBBF8\uD130\uB97C \uB098\uD0C0\uB0B4\uB294 \uC804\uD615\uC801\uC778 \uD45C\uAE30\uB2E4."
  },
  {
    id: `${section.id}-${topic.id}-derive-evidence`,
    type: "derivationStep",
    difficulty: "\uC720\uB3C4",
    prompt: `[${topic.title}] \uC774\uB860\uC744 \uC2E4\uD5D8 \uC99D\uAC70\uB85C \uBC14\uAFB8\uB294 \uC808\uCC28\uB97C 4\uB2E8\uACC4\uB85C \uC4F0\uB77C.`,
    answer: "\uC815\uC758, \uACF5\uC2DD, \uAD6C\uD604, \uB85C\uADF8",
    expectedSteps: ["\uC815\uC758", "\uACF5\uC2DD", "\uAD6C\uD604", "\uB85C\uADF8"],
    points: 4,
    hint: "\uAD50\uACFC\uC11C\uC2DD \uC124\uBA85\uC5D0\uC11C \uBE0C\uB77C\uC6B0\uC800/ROS 2 \uC2E4\uD5D8\uAE4C\uC9C0 \uB0B4\uB824\uC624\uB294 \uC21C\uC11C\uB2E4.",
    explanation: "\uC815\uC758\uAC00 \uACF5\uC2DD\uC774 \uB418\uACE0, \uACF5\uC2DD\uC774 \uCF54\uB4DC\uAC00 \uB418\uBA70, \uCF54\uB4DC\uB294 \uB85C\uADF8\uC640 metric\uC73C\uB85C \uAC80\uC99D\uB41C\uB2E4."
  },
  {
    id: `${section.id}-${topic.id}-trace-p-controller`,
    type: "codeTrace",
    difficulty: "\uACC4\uC0B0",
    prompt: `[${topic.title}] \uC544\uB798 \uCF54\uB4DC\uC5D0\uC11C command \uAC12\uC744 \uACC4\uC0B0\uD558\uB77C.`,
    answer: "1.0",
    codeSnippet: `const target = 1.0;
const estimate = 0.6;
const kp = 2.5;
const error = target - estimate;
const command = kp * error;`,
    expectedTrace: "error 0.4 command 1.0",
    points: 2,
    hint: "\uC624\uCC28\uB97C \uBA3C\uC800 \uACC4\uC0B0\uD558\uACE0 gain\uC744 \uACF1\uD55C\uB2E4.",
    explanation: "error=1.0-0.6=0.4\uC774\uACE0 command=2.5*0.4=1.0\uC774\uB2E4."
  },
  {
    id: `${section.id}-${topic.id}-formula-units`,
    type: "formulaBlank",
    difficulty: "\uC804\uBB38",
    prompt: `[${topic.title}] \uACC4\uC0B0 \uBB38\uC81C\uB97C \uD480\uAE30 \uC804\uC5D0 \uBC18\uB4DC\uC2DC \uB9DE\uCDB0\uC57C \uD558\uB294 \uB450 \uAC00\uC9C0 \uAE30\uC900\uC744 \uC4F0\uB77C: \uC88C\uD45C\uACC4(frame)\uC640 ____.`,
    answer: "unit",
    acceptedExpressions: ["unit", "units", "\uB2E8\uC704", "dimension", "\uCC28\uC6D0"],
    formulaSymbols: ["frame", "unit", "dimension"],
    points: 2,
    hint: "m, rad, s, pixel\uCC98\uB7FC \uC218\uCE58\uAC00 \uC5B4\uB5A4 \uBB3C\uB9AC\uB7C9\uC778\uC9C0 \uC815\uD55C\uB2E4.",
    explanation: "frame\uACFC \uB2E8\uC704\uB97C \uB9DE\uCD94\uC9C0 \uC54A\uC73C\uBA74 \uACF5\uC2DD\uC774 \uB9DE\uC544\uB3C4 \uACB0\uACFC\uAC00 \uBB3C\uB9AC\uC801\uC73C\uB85C \uD2C0\uB9B0 \uAC12\uC774 \uB41C\uB2E4."
  },
  {
    id: `${section.id}-${topic.id}-derive-debug-loop`,
    type: "derivationStep",
    difficulty: "\uC804\uBB38",
    prompt: `[${topic.title}] \uC2E4\uBB34 \uB514\uBC84\uAE45 \uB2F5\uC548\uC744 \uC4F8 \uB54C \uD3EC\uD568\uD560 4\uC694\uC18C\uB97C \uC21C\uC11C\uB300\uB85C \uC4F0\uB77C.`,
    answer: "\uC6D0\uC778, \uACF5\uC2DD, \uB85C\uADF8, \uC218\uC815",
    expectedSteps: ["\uC6D0\uC778", "\uACF5\uC2DD", "\uB85C\uADF8", "\uC218\uC815"],
    points: 4,
    hint: "\uC65C \uADF8\uB7F0\uC9C0, \uC5B4\uB5A4 \uC774\uB860\uACFC \uC5F0\uACB0\uB418\uB294\uC9C0, \uBB34\uC5C7\uC744 \uCC0D\uC5B4\uBCFC\uC9C0, \uBB34\uC5C7\uC744 \uBC14\uAFC0\uC9C0.",
    explanation: "\uC804\uBB38 \uB2F5\uC548\uC740 \uC6D0\uC778 \uAC00\uC124, \uAD00\uB828 \uACF5\uC2DD/\uC6D0\uB9AC, \uD655\uC778\uD560 \uB85C\uADF8, \uC218\uC815 \uBC29\uD5A5\uC744 \uD568\uAED8 \uC81C\uC2DC\uD574\uC57C \uD55C\uB2E4."
  }
];
const scenarioTagsBySection = (sectionId) => {
  if (sectionId.includes("manipulator")) return ["MoveIt 2", "planning scene", "Jacobian", "trajectory"];
  if (sectionId.includes("mobile") || sectionId.includes("planning") || sectionId.includes("pure")) {
    return ["Nav2", "costmap", "Pure Pursuit", "EKF"];
  }
  if (sectionId.includes("ai")) return ["ONNX Runtime", "OpenCV preprocessing", "metric", "latency"];
  if (sectionId.includes("llm")) return ["retrieval", "eval harness", "latency", "golden output"];
  if (sectionId.includes("realtime") || sectionId.includes("safety")) return ["watchdog", "deadline", "QoS", "failure taxonomy"];
  return ["ROS 2", "logging", "parameter sweep", "reproducibility"];
};
const cheatsBySection = (sectionId) => {
  const common = [
    {
      label: "\uD1A0\uD53D \uBAA9\uB85D",
      command: "ros2 topic list",
      description: "\uD604\uC7AC graph\uC5D0\uC11C publish/subscribe \uC911\uC778 topic\uC744 \uD655\uC778\uD55C\uB2E4.",
      domain: "ROS 2"
    },
    {
      label: "\uD1A0\uD53D \uC8FC\uAE30",
      command: "ros2 topic hz /topic_name",
      description: "sensor, command, inference \uACB0\uACFC topic\uC758 \uC2E4\uC81C \uC8FC\uAE30\uB97C \uCE21\uC815\uD55C\uB2E4.",
      domain: "ROS 2"
    },
    {
      label: "\uD328\uD0A4\uC9C0 \uBE4C\uB4DC",
      command: "colcon build --packages-select my_package",
      description: "\uD559\uC2B5 \uC911\uC778 \uD328\uD0A4\uC9C0\uB9CC \uC120\uD0DD \uBE4C\uB4DC\uD574 \uBC18\uBCF5 \uC2DC\uAC04\uC744 \uC904\uC778\uB2E4.",
      domain: "Build"
    }
  ];
  if (sectionId.includes("manipulator")) {
    return [
      ...common,
      {
        label: "MoveIt launch \uC778\uC790",
        command: "ros2 launch my_moveit_config demo.launch.py --show-args",
        description: "planning pipeline, controller, RViz \uAD00\uB828 launch parameter\uB97C \uD655\uC778\uD55C\uB2E4.",
        domain: "MoveIt"
      },
      {
        label: "joint state \uD655\uC778",
        command: "ros2 topic echo /joint_states",
        description: "URDF, controller, robot_state_publisher\uAC00 \uAE30\uB300\uD55C joint \uAC12\uC744 \uB0B4\uB294\uC9C0 \uBCF8\uB2E4.",
        domain: "Robot Arm"
      }
    ];
  }
  if (sectionId.includes("mobile") || sectionId.includes("planning") || sectionId.includes("pure")) {
    return [
      ...common,
      {
        label: "Nav2 parameter \uD655\uC778",
        command: "ros2 param list /controller_server",
        description: "FollowPath controller\uC640 costmap \uAD00\uB828 parameter \uC774\uB984\uC744 \uD655\uC778\uD55C\uB2E4.",
        domain: "Nav2"
      },
      {
        label: "rosbag \uAE30\uB85D",
        command: "ros2 bag record /tf /tf_static /odom /cmd_vel /scan",
        description: "localization, planning, control \uC2E4\uD328\uB97C \uC7AC\uD604\uD558\uAE30 \uC704\uD55C \uCD5C\uC18C topic\uC744 \uAE30\uB85D\uD55C\uB2E4.",
        domain: "Debug"
      }
    ];
  }
  if (sectionId.includes("ai")) {
    return [
      ...common,
      {
        label: "\uC774\uBBF8\uC9C0 \uD1A0\uD53D \uD655\uC778",
        command: "ros2 topic echo /camera/image_raw --once",
        description: "image inference \uC785\uB825 topic\uC758 header, encoding, size\uB97C \uBA3C\uC800 \uD655\uC778\uD55C\uB2E4.",
        domain: "Vision"
      },
      {
        label: "\uCD94\uB860 latency \uB85C\uADF8",
        command: "ros2 topic hz /inference/result",
        description: "preprocess, inference, postprocess\uB97C \uD569\uCE5C \uACB0\uACFC \uC8FC\uAE30\uB97C \uAD00\uCC30\uD55C\uB2E4.",
        domain: "AI"
      }
    ];
  }
  return common;
};
const sourceIdsForTopic = (section, topic) => {
  const id = `${section.id} ${topic.id}`;
  const ids = new Set(sourceIdsBySection(section.id));
  const add = (...items) => items.forEach((item) => ids.add(item));
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
const readingGuideForTopic = (section, topic) => {
  const sources = sourceIdsForTopic(section, topic);
  return [
    `1\uB2E8\uACC4: ${sources[0]} \uC790\uB8CC\uC5D0\uC11C \uC6A9\uC5B4\uC640 API \uC774\uB984\uC744 \uD655\uC778\uD55C\uB2E4.`,
    `2\uB2E8\uACC4: ${sources[1] ?? sources[0]} \uC790\uB8CC\uC5D0\uC11C \uC218\uC2DD/\uAC1C\uB150\uC758 \uC815\uC758\uB97C \uB2E4\uC2DC \uC77D\uB294\uB2E4.`,
    `3\uB2E8\uACC4: ${sources[2] ?? sources[0]} \uC790\uB8CC\uC758 \uC608\uC81C \uCF54\uB4DC \uB610\uB294 \uD29C\uD1A0\uB9AC\uC5BC\uC744 \uC774 \uC138\uC158\uC758 C++/Python \uC2E4\uC2B5\uACFC \uB300\uC870\uD55C\uB2E4.`,
    "4\uB2E8\uACC4: \uC77D\uC740 \uBB38\uC11C\uB97C \uB178\uD2B8\uC5D0 \uB9C1\uD06C\uD558\uACE0, \uC5B4\uB5A4 \uACF5\uC2DD/\uD30C\uB77C\uBBF8\uD130/\uBA85\uB839\uC5B4\uB97C \uC2E4\uC81C \uCF54\uB4DC\uC5D0 \uC37C\uB294\uC9C0 \uAE30\uB85D\uD55C\uB2E4."
  ];
};
const prerequisiteIdsByTopic = (section, topic) => {
  const prereqs = [section.parentId ?? section.id];
  if (section.id.includes("manipulator")) prereqs.push("math-foundations--linear-algebra-transforms");
  if (section.id.includes("mobile")) prereqs.push("math-foundations--probability-kalman");
  if (section.id.includes("ai")) prereqs.push("math-foundations--optimization-integration");
  if (section.id.includes("llm")) prereqs.push("cpp-python-ros2--experiment-logging");
  if (topic.id.includes("jacobian") || topic.id.includes("ik")) prereqs.push("manipulator-kinematics--forward-kinematics");
  if (topic.id.includes("astar") || topic.id.includes("costmap")) prereqs.push("mobile-localization--map-odom-base-link");
  return [...new Set(prereqs)];
};
const scenarioQuestionsForTopic = (section, topic) => {
  if (section.id.includes("manipulator")) {
    return [
      {
        id: `${section.id}-${topic.id}-scenario-moveit-timeout`,
        type: "derivationStep",
        difficulty: "\uC804\uBB38",
        prompt: `[${topic.title}] MoveIt planning\uC774 5\uCD08 \uC774\uC0C1 \uAC78\uB9B4 \uB54C \uD655\uC778\uD574\uC57C \uD560 3\uAC00\uC9C0\uB97C \uC4F0\uACE0, planning scene / collision / joint limit \uAD00\uC810\uC73C\uB85C \uC124\uBA85\uD558\uB77C.`,
        answer: "planning scene, collision object, joint limit",
        expectedSteps: ["planning scene", "collision", "joint"],
        points: 4,
        hint: "\uD658\uACBD \uBAA8\uB378, \uCDA9\uB3CC \uAC1D\uCCB4, \uAD00\uC808 \uC81C\uD55C/goal constraint\uB97C \uBD84\uB9AC\uD574\uC11C \uBCF8\uB2E4.",
        explanation: "planning scene\uC774 \uCD5C\uC2E0\uC778\uC9C0, collision object\uAC00 \uACFC\uB3C4\uD558\uAC8C \uB9C9\uACE0 \uC788\uB294\uC9C0, joint limit/goal tolerance\uAC00 \uB108\uBB34 \uBE61\uBE61\uD55C\uC9C0 \uD655\uC778\uD55C\uB2E4."
      },
      {
        id: `${section.id}-${topic.id}-scenario-jacobian-command`,
        type: "codeTrace",
        difficulty: "\uACC4\uC0B0",
        prompt: `[${topic.title}] det(J)\uAC00 0.03\uC73C\uB85C \uC791\uACE0 \uBAA9\uD45C \uB9D0\uB2E8\uC18D\uB3C4\uAC00 \uD070 \uC0C1\uD669\uC5D0\uC11C DLS damping\uC744 \uD0A4\uC6B0\uBA74 \uAD00\uC808\uC18D\uB3C4 \uBA85\uB839\uC740 \uC5B4\uB5BB\uAC8C \uBCC0\uD558\uB294\uAC00?`,
        answer: "\uC791\uC544\uC9C0\uACE0 \uC548\uC815\uD654\uB41C\uB2E4",
        codeSnippet: "dq = J^T (J J^T + lambda^2 I)^-1 e;",
        expectedTrace: "lambda damping joint velocity smaller stable",
        points: 3,
        hint: "lambda^2 I\uAC00 \uC5ED\uD589\uB82C \uACC4\uC0B0\uC744 \uC644\uB9CC\uD558\uAC8C \uB9CC\uB4E0\uB2E4.",
        explanation: "DLS damping\uC744 \uD0A4\uC6B0\uBA74 singularity \uADFC\uCC98\uC5D0\uC11C \uACFC\uB3C4\uD55C joint velocity\uAC00 \uC904\uC5B4 \uC548\uC815\uC131\uC774 \uCEE4\uC9C4\uB2E4."
      }
    ];
  }
  if (section.id.includes("mobile") || section.id.includes("planning") || section.id.includes("pure")) {
    return [
      {
        id: `${section.id}-${topic.id}-scenario-nav2-followpath`,
        type: "derivationStep",
        difficulty: "\uC804\uBB38",
        prompt: `[${topic.title}] Nav2 FollowPath\uAC00 \uACBD\uB85C\uB97C \uC774\uD0C8\uD560 \uB54C lookahead_dist\uB97C 0.8\uC5D0\uC11C 1.2\uB85C \uD0A4\uC6B0\uBA74 Pure Pursuit \uACE1\uB960 kappa=2y/Ld^2\uB294 \uC5B4\uB5BB\uAC8C \uBCC0\uD558\uB294\uAC00?`,
        answer: "\uACE1\uB960 \uAC10\uC18C, \uBD80\uB4DC\uB7EC\uC6C0 \uC99D\uAC00, \uCF54\uB108 \uBC18\uC751 \uB454\uD654",
        expectedSteps: ["Ld", "curvature", "smooth"],
        points: 4,
        hint: "Ld\uAC00 \uBD84\uBAA8\uC5D0 \uC81C\uACF1\uC73C\uB85C \uB4E4\uC5B4\uAC04\uB2E4.",
        explanation: "Ld\uAC00 \uCEE4\uC9C0\uBA74 \uAC19\uC740 lateral target y\uC5D0\uC11C kappa=2y/Ld^2\uAC00 \uC791\uC544\uC838 \uBD80\uB4DC\uB7EC\uC6CC\uC9C0\uC9C0\uB9CC \uAE09\uD55C \uCF54\uB108 \uBC18\uC751\uC740 \uB290\uB824\uC9C8 \uC218 \uC788\uB2E4."
      },
      {
        id: `${section.id}-${topic.id}-scenario-costmap-debug`,
        type: "derivationStep",
        difficulty: "\uC804\uBB38",
        prompt: `[${topic.title}] \uB85C\uBD07\uC774 \uC7A5\uC560\uBB3C \uADFC\uCC98\uC5D0\uC11C \uBA48\uCD98\uB2E4. costmap inflation, footprint, sensor timestamp \uC911 \uD655\uC778 \uC21C\uC11C\uB97C \uC4F0\uB77C.`,
        answer: "timestamp, footprint, inflation",
        expectedSteps: ["timestamp", "footprint", "inflation"],
        points: 3,
        hint: "\uBA3C\uC800 \uAD00\uCE21\uC774 \uCD5C\uC2E0\uC778\uC9C0, \uADF8 \uB2E4\uC74C \uB85C\uBD07 \uD06C\uAE30\uC640 \uC7A5\uC560\uBB3C \uD655\uC7A5\uC744 \uBCF8\uB2E4.",
        explanation: "\uC624\uB798\uB41C \uC13C\uC11C \uB370\uC774\uD130\uB294 \uC798\uBABB\uB41C obstacle\uC744 \uB0A8\uAE30\uACE0, footprint/inflation\uC774 \uACFC\uD558\uBA74 \uD1B5\uB85C\uAC00 \uB9C9\uD78C \uAC83\uCC98\uB7FC \uBCF4\uC778\uB2E4."
      }
    ];
  }
  if (section.id.includes("ai")) {
    return [
      {
        id: `${section.id}-${topic.id}-scenario-onnx-shape`,
        type: "derivationStep",
        difficulty: "\uC804\uBB38",
        prompt: `[${topic.title}] ONNX Runtime C++ \uCD94\uB860 output shape\uC774 [1,3,224,224]\uB85C \uB098\uC628\uB2E4. \uC6D0\uC778 2\uAC00\uC9C0\uC640 \uD574\uACB0\uCC45\uC744 \uC4F0\uB77C.`,
        answer: "\uCD9C\uB825 \uB178\uB4DC \uC120\uD0DD \uC624\uB958, preprocessing/channel \uACC4\uC57D \uC624\uB958",
        expectedSteps: ["output", "shape", "preprocess"],
        points: 4,
        hint: "classification\uC774\uBA74 \uBCF4\uD1B5 [1,num_classes]\uAC00 \uAE30\uB300\uB41C\uB2E4.",
        explanation: "\uC911\uAC04 feature map\uC744 output\uC73C\uB85C export\uD588\uAC70\uB098, \uBAA8\uB378 head/export/output name\uC744 \uC798\uBABB \uC120\uD0DD\uD588\uC744 \uC218 \uC788\uB2E4. \uC785\uB825 shape/channel order\uB3C4 \uD655\uC778\uD55C\uB2E4."
      },
      {
        id: `${section.id}-${topic.id}-scenario-metric-risk`,
        type: "derivationStep",
        difficulty: "\uC804\uBB38",
        prompt: `[${topic.title}] false negative\uAC00 \uC704\uD5D8\uD55C \uB85C\uBD07 \uBE44\uC804 \uC2DC\uC2A4\uD15C\uC5D0\uC11C accuracy\uB9CC \uBCF4\uACE0 \uBC30\uD3EC\uD558\uBA74 \uC548 \uB418\uB294 \uC774\uC720\uB97C precision/recall\uB85C \uC124\uBA85\uD558\uB77C.`,
        answer: "recall \uD655\uC778 \uD544\uC694",
        expectedSteps: ["FN", "recall", "risk"],
        points: 3,
        hint: "\uB193\uCE58\uBA74 \uC704\uD5D8\uD55C class\uC5D0\uC11C\uB294 \uC2E4\uC81C positive\uB97C \uC5BC\uB9C8\uB098 \uCC3E\uC558\uB294\uC9C0\uAC00 \uC911\uC694\uD558\uB2E4.",
        explanation: "FN\uC774 \uC704\uD5D8\uD558\uBA74 recall=TP/(TP+FN)\uC744 \uBC18\uB4DC\uC2DC \uBD10\uC57C \uD55C\uB2E4. accuracy\uB294 class imbalance\uC5D0\uC11C \uC704\uD5D8\uC744 \uC228\uAE38 \uC218 \uC788\uB2E4."
      }
    ];
  }
  if (section.id.includes("llm")) {
    return [
      {
        id: `${section.id}-${topic.id}-scenario-retrieval-regression`,
        type: "derivationStep",
        difficulty: "\uC804\uBB38",
        prompt: `[${topic.title}] prompt \uC218\uC815 \uD6C4 pass rate\uAC00 0.85\uC5D0\uC11C 0.72\uB85C \uB5A8\uC5B4\uC84C\uB2E4. retrieval, prompt, grader \uC911 \uC5B4\uB514\uB97C \uC5B4\uB5A4 \uB85C\uADF8\uB85C \uBD84\uB9AC \uD655\uC778\uD560\uAE4C?`,
        answer: "retrieved chunk id, prompt version, grader result",
        expectedSteps: ["chunk", "prompt", "grader"],
        points: 4,
        hint: "\uC785\uB825 \uADFC\uAC70, \uBAA8\uB378 \uC785\uB825, \uD3C9\uAC00 \uACB0\uACFC\uB97C \uB530\uB85C \uB0A8\uAE34\uB2E4.",
        explanation: "retrieved chunk id, prompt template version, model output, grader result\uB97C trace\uB85C \uBE44\uAD50\uD574\uC57C \uD68C\uADC0 \uC6D0\uC778\uC744 \uBD84\uD574\uD560 \uC218 \uC788\uB2E4."
      }
    ];
  }
  return [
    {
      id: `${section.id}-${topic.id}-scenario-ros2-debug`,
      type: "derivationStep",
      difficulty: "\uC804\uBB38",
      prompt: `[${topic.title}] ROS 2 \uC2E4\uD5D8 \uACB0\uACFC\uAC00 \uC7AC\uD604\uB418\uC9C0 \uC54A\uB294\uB2E4. topic, param, rosbag, commit \uAD00\uC810\uC5D0\uC11C \uD655\uC778\uD560 \uC99D\uAC70 4\uAC00\uC9C0\uB97C \uC4F0\uB77C.`,
      answer: "topic hz, parameter, rosbag2, git commit",
      expectedSteps: ["topic", "param", "rosbag", "commit"],
      points: 4,
      hint: "\uC2E4\uD589 \uB2F9\uC2DC \uC785\uB825\uACFC \uC124\uC815\uACFC \uCF54\uB4DC\uB97C \uB0A8\uACA8\uC57C \uD55C\uB2E4.",
      explanation: "topic \uC8FC\uAE30, parameter \uAC12, rosbag2 \uC785\uB825, git commit/hash\uAC00 \uC788\uC5B4\uC57C \uAC19\uC740 \uC2E4\uD5D8\uC744 \uB2E4\uC2DC \uB9CC\uB4E4 \uC218 \uC788\uB2E4."
    }
  ];
};
const cloneQuestionForTopic = (question, section, topic) => ({
  ...question,
  id: `${section.id}-${topic.id}-${question.id}`,
  prompt: `[${topic.title}] ${question.prompt}`
});
const practiceExamplesForTopic = (section, topic, language) => {
  const ids = sourceIdsForTopic(section, topic);
  const key = `${section.id} ${topic.id}`;
  const example = (id, title, starterCode, solutionCode, explanation, checks) => ({
    id: `${section.id}-${topic.id}-${language}-${id}`,
    title,
    language,
    starterCode: starterCode.trim(),
    solutionCode: solutionCode.trim(),
    explanation,
    checks,
    sourceIds: ids.slice(0, 4)
  });
  if (language === "cpp") {
    if (key.includes("ros2") || key.includes("qos") || key.includes("tf") || key.includes("callback") || key.includes("action")) {
      return [
        example(
          "ros2-node-skeleton",
          "rclcpp \uB178\uB4DC \uAD6C\uC870\uC640 parameter",
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
          "parameter\uC640 timer callback\uC744 \uBD84\uB9AC\uD574 ROS 2 \uB178\uB4DC\uC758 \uC8FC\uAE30 \uC2E4\uD589 \uACC4\uC57D\uC744 \uC5F0\uC2B5\uD55C\uB2E4.",
          ["rclcpp", "declare_parameter", "create_wall_timer", "spin"]
        ),
        example(
          "tf2-lookup-check",
          "tf2 lookup \uC2E4\uD328 \uC870\uAC74 \uC810\uAC80",
          `
// TODO: buffer.lookupTransform("map", "base_link", time) \uAD6C\uC870\uB97C \uC791\uC131\uD55C\uB2E4.
          `,
          `
#include <tf2_ros/buffer.h>
#include <geometry_msgs/msg/transform_stamped.hpp>

geometry_msgs::msg::TransformStamped lookupBase(
  tf2_ros::Buffer& buffer, const rclcpp::Time& stamp) {
  return buffer.lookupTransform("map", "base_link", stamp, rclcpp::Duration::from_seconds(0.05));
}
          `,
          "frame \uC774\uB984, timestamp, timeout\uC744 \uBA85\uC2DC\uD574 tf2 lookup contract\uB97C \uD655\uC778\uD55C\uB2E4.",
          ["lookupTransform", "map", "base_link", "Duration"]
        )
      ];
    }
    if (key.includes("ai") || key.includes("opencv") || key.includes("onnx") || key.includes("camera") || key.includes("pcl")) {
      return [
        example(
          "opencv-preprocess",
          "OpenCV \uC804\uCC98\uB9AC \uACC4\uC57D",
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
          "\uD559\uC2B5 \uB54C\uC640 \uBC30\uD3EC \uB54C\uC758 resize, RGB/BGR, dtype \uACC4\uC57D\uC744 C++ \uCF54\uB4DC\uB85C \uACE0\uC815\uD55C\uB2E4.",
          ["cv::cvtColor", "cv::resize", "convertTo", "CV_32F"]
        ),
        example(
          "onnx-shape-check",
          "ONNX Runtime shape \uAC80\uC99D",
          `
// TODO: input/output shape\uB97C \uAC80\uC0AC\uD558\uB294 \uD568\uC218\uB97C \uC791\uC131\uD55C\uB2E4.
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
          "\uBAA8\uB378 I/O shape \uACC4\uC57D\uC744 \uCF54\uB4DC\uB85C \uAC80\uC0AC\uD574 \uC911\uAC04 feature map\uC744 \uC798\uBABB \uC4F0\uB294 \uC2E4\uC218\uB97C \uC7A1\uB294\uB2E4.",
          ["vector", "expected", "shape", "throw"]
        )
      ];
    }
    if (key.includes("mobile") || key.includes("planner") || key.includes("astar") || key.includes("pure") || key.includes("stanley")) {
      return [
        example(
          "diff-drive-odom",
          "\uCC28\uB3D9\uAD6C\uB3D9 odometry \uD568\uC218",
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
          "wheel velocity\uB97C body twist\uC640 world pose \uC801\uBD84\uC73C\uB85C \uC5F0\uACB0\uD55C\uB2E4.",
          ["cos", "sin", "vr", "vl", "yaw"]
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
          "g-cost\uC640 admissible h-cost\uC758 \uD569\uC744 \uC6B0\uC120\uC21C\uC704\uB85C \uC0AC\uC6A9\uD55C\uB2E4.",
          ["g", "h", "score", "return"]
        )
      ];
    }
    return [
      example(
        "eigen-transform",
        "Eigen transform \uAC80\uC0B0",
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
        "\uACF5\uC2DD\uC758 \uD589\uB82C\uACF1\uC744 Eigen \uCF54\uB4DC\uB85C \uC62E\uAE30\uB294 \uAE30\uBCF8 \uD328\uD134\uC774\uB2E4.",
        ["Eigen", "Matrix2d", "cos", "sin", "return"]
      ),
      example(
        "metric-logger",
        "\uC2E4\uD5D8 metric CSV row",
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
        "\uC218\uC2DD \uACB0\uACFC\uB97C \uB85C\uADF8\uB85C \uB0A8\uACA8 \uB2E4\uC74C \uC2E4\uD5D8\uACFC \uBE44\uAD50\uD560 \uC218 \uC788\uAC8C \uB9CC\uB4E0\uB2E4.",
        ["ostringstream", "error", "latency", "return"]
      )
    ];
  }
  if (key.includes("ai") || key.includes("opencv") || key.includes("onnx") || key.includes("camera") || key.includes("pcl")) {
    return [
      example(
        "numpy-preprocess",
        "NumPy \uC804\uCC98\uB9AC shape \uAC80\uC0B0",
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
        "Python\uC5D0\uC11C shape\uC640 dtype\uC744 \uBE60\uB974\uAC8C \uAC80\uC0B0\uD55C \uB4A4 C++ \uBC30\uD3EC \uCF54\uB4DC\uC640 \uB9DE\uCD98\uB2E4.",
        ["astype", "transpose", "expand_dims", "float32"]
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
        "accuracy \uD558\uB098\uB85C \uC228\uACA8\uC9C0\uB294 \uC624\uB958\uB97C precision/recall/F1\uB85C \uBD84\uD574\uD55C\uB2E4.",
        ["precision", "recall", "f1", "return"]
      )
    ];
  }
  if (key.includes("mobile") || key.includes("planner") || key.includes("astar") || key.includes("pure") || key.includes("stanley")) {
    return [
      example(
        "odometry-python",
        "odometry \uC190\uACC4\uC0B0 \uD568\uC218",
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
        "\uCC28\uB3D9\uAD6C\uB3D9 \uBAA8\uB378\uC744 \uC791\uC740 \uC22B\uC790\uB85C \uAC80\uC0B0\uD55C\uB2E4.",
        ["math.cos", "math.sin", "vr", "vl", "return"]
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
        "lookahead\uAC00 \uCEE4\uC9C8\uC218\uB85D \uACE1\uB960\uC774 \uC5B4\uB5BB\uAC8C \uC904\uC5B4\uB4DC\uB294\uC9C0 \uC2E4\uD5D8\uD55C\uB2E4.",
        ["lookahead", "** 2", "return"]
      )
    ];
  }
  return [
    example(
      "formula-check",
      "\uC218\uC2DD \uC9C1\uC811 \uAC80\uC0B0",
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
      "\uAD50\uC7AC\uC758 \uD68C\uC804\uD589\uB82C\uC744 Python \uD568\uC218\uB85C \uC62E\uACA8 \uC22B\uC790 \uC608\uC81C\uB97C \uD655\uC778\uD55C\uB2E4.",
      ["math.cos", "math.sin", "return"]
    ),
    example(
      "table-log",
      "\uACB0\uACFC \uD45C \uB9CC\uB4E4\uAE30",
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
      "\uC2DC\uBBAC\uB808\uC774\uC158 \uACB0\uACFC\uB97C metric dictionary\uB85C \uC815\uB9AC\uD55C\uB2E4.",
      ["mean", "max", "min", "return"]
    )
  ];
};
const latexExpression = (expression) => expression.replace(/\b(cos|sin|tan|atan2|sqrt|log|ln|exp|det)\b/g, "\\$1").replace(/\btheta\b/gi, "\\theta").replace(/\blambda\b/gi, "\\lambda").replace(/\bomega\b/gi, "\\omega").replace(/\bepsilon\b/gi, "\\epsilon").replace(/\bSigma\b/g, "\\Sigma").replace(/\bmu\b/gi, "\\mu").replace(/\b([lqxyuvpr])(\d)\b/g, "$1_$2").replace(/\^(-?\d+|T)/g, "^{$1}").replace(/->/g, "\\to").replace(/·/g, "\\cdot ");
const formula = (label, expression, description) => ({
  label,
  expression: latexExpression(expression),
  description
});
const profileForTopic = (section, topic) => {
  const id = `${section.id} ${topic.id}`;
  if (id.includes("algebra") || id.includes("trig") || id.includes("unit-circle") || id.includes("vectors") || id.includes("single-variable-calculus") || id.includes("differential-equations") || id.includes("numerical-methods")) {
    return {
      subject: "\uAE30\uCD08\uC218\uD559\uC5D0\uC11C \uB85C\uBD07/AI\uB85C \uC774\uC5B4\uC9C0\uB294 \uC5B8\uC5B4",
      coreQuestion: "\uD568\uC218, \uADF8\uB798\uD504, \uC0BC\uAC01\uD568\uC218, \uBCC0\uD654\uC728, \uB204\uC801\uB7C9\uC744 \uB85C\uBD07 \uC0C1\uD0DC\uC640 \uC54C\uACE0\uB9AC\uC998\uC758 \uC785\uB825-\uCD9C\uB825 \uAD00\uACC4\uB85C \uC5B4\uB5BB\uAC8C \uC77D\uC744 \uAC83\uC778\uAC00?",
      concept: "\uAE30\uCD08\uC218\uD559\uC740 \uB85C\uBD07\uACF5\uD559\uC758 \uC900\uBE44\uC6B4\uB3D9\uC774 \uC544\uB2C8\uB77C \uC2E4\uC81C \uBAA8\uB378\uC758 \uC5B8\uC5B4\uB2E4. \uD568\uC218\uB294 \uC785\uB825\uC774 \uCD9C\uB825\uC73C\uB85C \uBC14\uB00C\uB294 \uADDC\uCE59\uC774\uACE0, \uADF8\uB798\uD504\uB294 \uD30C\uB77C\uBBF8\uD130 \uBCC0\uD654\uC5D0 \uB300\uD55C \uCD9C\uB825\uC758 \uBAA8\uC591\uC774\uB2E4. \uC0BC\uAC01\uD568\uC218\uB294 \uD68C\uC804\uACFC \uBC29\uD5A5\uC744, \uBBF8\uBD84\uC740 \uC21C\uAC04 \uBCC0\uD654\uC728\uC744, \uC801\uBD84\uC740 \uB204\uC801 \uBCC0\uD654\uB97C, \uBBF8\uBD84\uBC29\uC815\uC2DD\uC740 \uC2DC\uAC04\uC774 \uD750\uB974\uBA70 \uC0C1\uD0DC\uAC00 \uBCC0\uD558\uB294 \uBC95\uCE59\uC744 \uD45C\uD604\uD55C\uB2E4.",
      mentalModel: "\uB85C\uBD07\uC774 \uC6C0\uC9C1\uC778\uB2E4\uB294 \uAC83\uC740 \uC2DC\uAC04 t\uAC00 \uBCC0\uD560 \uB54C \uC704\uCE58 x(t), \uC18D\uB3C4 v(t), heading theta(t)\uAC00 \uD568\uAED8 \uBCC0\uD55C\uB2E4\uB294 \uB73B\uC774\uB2E4. \uC218\uD559 \uBB38\uC81C\uC758 x, y, f(x)\uB294 \uC2E4\uC81C \uC2DC\uC2A4\uD15C\uC5D0\uC11C\uB294 \uC13C\uC11C\uAC12, \uBAA8\uD130 \uBA85\uB839, \uC624\uCC28, \uBE44\uC6A9, \uD655\uB960\uC774 \uB41C\uB2E4.",
      variables: [
        "x: \uB3C5\uB9BD\uBCC0\uC218 \uB610\uB294 \uC0C1\uD0DC \uC785\uB825",
        "y=f(x): \uC785\uB825\uC774 \uADDC\uCE59\uC744 \uC9C0\uB098 \uB098\uC628 \uCD9C\uB825",
        "theta: \uD68C\uC804\uAC01 \uB610\uB294 \uC870\uC815\uD560 \uD30C\uB77C\uBBF8\uD130",
        "dx/dt: \uC2DC\uAC04\uC5D0 \uB530\uB978 \uC0C1\uD0DC \uBCC0\uD654\uC728",
        "Delta t: \uC774\uC0B0 \uC2DC\uBBAC\uB808\uC774\uC158\uC758 \uC2DC\uAC04 \uAC04\uACA9"
      ],
      principles: [
        "\uD568\uC218\uC758 \uC815\uC758\uC5ED\uACFC \uCE58\uC5ED\uC740 \uCF54\uB4DC\uC758 \uC785\uB825 \uBC94\uC704\uC640 \uCD9C\uB825 \uBC94\uC704\uC5D0 \uD574\uB2F9\uD55C\uB2E4.",
        "sin/cos\uB294 unit circle\uC5D0\uC11C \uC88C\uD45C\uB97C \uC77D\uB294 \uD568\uC218\uB77C\uC11C \uD68C\uC804\uD589\uB82C\uACFC \uC6D0\uD638 \uC6B4\uB3D9\uC758 \uAE30\uBCF8\uC774 \uB41C\uB2E4.",
        "\uBBF8\uBD84\uC740 \uC791\uC740 \uBCC0\uD654\uC5D0 \uB300\uD55C \uBBFC\uAC10\uB3C4\uC774\uACE0 Jacobian, gradient, velocity model\uB85C \uD655\uC7A5\uB41C\uB2E4.",
        "\uC218\uCE58\uC801\uBD84\uC740 \uC5F0\uC18D\uC2DC\uAC04 \uBAA8\uB378\uC744 \uCEF4\uD4E8\uD130\uAC00 \uACC4\uC0B0\uD560 \uC218 \uC788\uB294 \uBC18\uBCF5 \uC5C5\uB370\uC774\uD2B8\uB85C \uBC14\uAFB8\uB294 \uACFC\uC815\uC774\uB2E4."
      ],
      formulas: [
        formula("function model", "y=f(x)", "\uC785\uB825 x\uAC00 \uADDC\uCE59 f\uB97C \uC9C0\uB098 \uCD9C\uB825 y\uAC00 \uB41C\uB2E4."),
        formula("unit circle", "cos^2(theta)+sin^2(theta)=1", "\uD68C\uC804\uACFC \uC0BC\uAC01\uD568\uC218\uC758 \uAE38\uC774 \uBCF4\uC874 \uC131\uC9C8."),
        formula("derivative", "f'(x)=lim_{h->0} (f(x+h)-f(x))/h", "\uC21C\uAC04 \uBCC0\uD654\uC728\uC758 \uC815\uC758."),
        formula("Euler integration", "x_{k+1}=x_k+Delta t f(x_k,u_k)", "\uC5F0\uC18D \uBAA8\uB378\uC744 \uC774\uC0B0 \uC5C5\uB370\uC774\uD2B8\uB85C \uADFC\uC0AC.")
      ],
      derivation: [
        "\uD568\uC218\uB97C \uBA3C\uC800 \uC785\uB825, \uD30C\uB77C\uBBF8\uD130, \uCD9C\uB825\uC73C\uB85C \uB098\uB208\uB2E4.",
        "\uADF8\uB798\uD504\uC758 \uAE30\uC6B8\uAE30\uB294 \uCD9C\uB825\uC774 \uC785\uB825 \uBCC0\uD654\uC5D0 \uC5BC\uB9C8\uB098 \uBBFC\uAC10\uD55C\uC9C0 \uB098\uD0C0\uB0B8\uB2E4.",
        "unit circle\uC5D0\uC11C \uAC01\uB3C4 theta\uC758 \uC810 \uC88C\uD45C\uAC00 (cos theta, sin theta)\uC774\uBBC0\uB85C \uD68C\uC804\uD589\uB82C \uC5F4\uBCA1\uD130\uAC00 \uB41C\uB2E4.",
        "x_dot=f(x,u)\uB97C \uC791\uC740 \uC2DC\uAC04 Delta t \uB3D9\uC548 \uC0C1\uC218\uB85C \uBCF4\uBA74 x_{k+1}=x_k+Delta t f(x_k,u_k)\uAC00 \uB41C\uB2E4."
      ],
      proof: [
        "unit circle \uC704 \uC810\uC740 \uC6D0\uC810\uC5D0\uC11C \uAC70\uB9AC 1\uC774\uBBC0\uB85C x^2+y^2=1\uC774\uACE0, x=cos theta, y=sin theta\uB97C \uB300\uC785\uD558\uBA74 \uD56D\uB4F1\uC2DD\uC774 \uB098\uC628\uB2E4.",
        "\uBBF8\uBD84 \uC815\uC758\uC758 h\uB97C \uC810\uC810 \uC791\uAC8C \uD558\uBA74 \uD3C9\uADE0 \uBCC0\uD654\uC728\uC774 \uD55C \uC810\uC758 \uC811\uC120 \uAE30\uC6B8\uAE30\uB85C \uC218\uB834\uD55C\uB2E4.",
        "Euler \uC801\uBD84\uC740 Taylor \uC804\uAC1C x(t+Delta t)=x(t)+Delta t x_dot(t)+O(Delta t^2)\uC758 1\uCC28 \uD56D\uB9CC \uB0A8\uAE34 \uADFC\uC0AC\uB2E4."
      ],
      workedExample: {
        prompt: "v=0.4m/s, theta=60\uB3C4, Delta t=0.5s\uC77C \uB54C x \uBC29\uD5A5 \uC774\uB3D9\uB7C9\uC744 \uAD6C\uD558\uB77C.",
        steps: ["x \uBC29\uD5A5 \uC18D\uB3C4\uB294 v cos(theta)", "cos60=0.5", "Delta x=0.4*0.5*0.5=0.1m"],
        result: "\uC0BC\uAC01\uD568\uC218\uB294 \uCD94\uC0C1 \uACF5\uC2DD\uC774 \uC544\uB2C8\uB77C \uB85C\uBD07 heading\uC744 world frame \uC774\uB3D9\uB7C9\uC73C\uB85C \uBC14\uAFB8\uB294 \uB3C4\uAD6C\uB2E4."
      },
      implementationNotes: [
        "\uAC01\uB3C4 \uC785\uB825\uC740 radian\uC73C\uB85C \uD1B5\uC77C\uD558\uACE0 degree \uAC12\uC740 \uCF54\uB4DC \uC9C4\uC785\uC810\uC5D0\uC11C \uBCC0\uD658\uD55C\uB2E4.",
        "\uADF8\uB798\uD504 \uC2E4\uC2B5\uC5D0\uC11C\uB294 \uC785\uB825 \uBC94\uC704\uB97C \uBC14\uAFD4 \uD568\uC218 \uCD9C\uB825\uC774 \uC5B4\uB5BB\uAC8C \uD718\uB294\uC9C0 \uBA3C\uC800 \uBCF8\uB2E4.",
        "Euler \uC801\uBD84\uC740 step size\uAC00 \uB108\uBB34 \uD06C\uBA74 \uC624\uCC28\uAC00 \uCEE4\uC9C0\uBBC0\uB85C dt sweep\uC744 \uB85C\uADF8\uB85C \uBE44\uAD50\uD55C\uB2E4."
      ],
      engineeringMeaning: [
        "\uAE30\uCD08\uC218\uD559\uC744 \uC815\uD655\uD788 \uC54C\uBA74 FK, odometry, Kalman filter, gradient descent\uAC00 \uC11C\uB85C \uB2E4\uB978 \uC554\uAE30 \uACFC\uBAA9\uC73C\uB85C \uBCF4\uC774\uC9C0 \uC54A\uB294\uB2E4.",
        "\uC2DC\uD5D8 \uACC4\uC0B0 \uBB38\uC81C\uB294 \uB300\uBD80\uBD84 \uC785\uB825\uAC12\uC744 \uC2DD\uC758 \uBCC0\uC218\uB85C \uC62E\uAE30\uACE0 \uB2E8\uC704\uC640 \uBC94\uC704\uB97C \uC810\uAC80\uD558\uB294 \uB370\uC11C \uC2DC\uC791\uD55C\uB2E4."
      ],
      commonMistakes: [
        "degree \uAC12\uC744 radian \uD568\uC218\uC5D0 \uADF8\uB300\uB85C \uB123\uB294\uB2E4.",
        "\uADF8\uB798\uD504\uC758 x\uCD95/\uB2E8\uC704\uB97C \uD655\uC778\uD558\uC9C0 \uC54A\uACE0 \uCD94\uC138\uB9CC \uD574\uC11D\uD55C\uB2E4.",
        "Euler \uC801\uBD84 \uACB0\uACFC\uAC00 \uC815\uD655\uD55C \uD574\uB77C\uACE0 \uC0DD\uAC01\uD558\uACE0 step size \uC624\uCC28\uB97C \uBB34\uC2DC\uD55C\uB2E4."
      ],
      examTargets: ["\uD568\uC218 \uC785\uCD9C\uB825 \uD574\uC11D", "unit circle \uD56D\uB4F1\uC2DD", "\uBBF8\uBD84 \uC815\uC758", "Euler \uC801\uBD84 \uACC4\uC0B0"]
    };
  }
  if (id.includes("linear-algebra") || id.includes("pose-representation")) {
    return {
      subject: "\uC120\uD615\uB300\uC218\uC640 \uC88C\uD45C\uACC4 \uD45C\uD604",
      coreQuestion: "\uAC19\uC740 \uBB3C\uCCB4\uC758 \uC704\uCE58\uC640 \uBC29\uD5A5\uC744 \uC11C\uB85C \uB2E4\uB978 \uC88C\uD45C\uACC4\uC5D0\uC11C \uC5B4\uB5BB\uAC8C \uC77C\uAD00\uB418\uAC8C \uD45C\uD604\uD560 \uAC83\uC778\uAC00?",
      concept: "\uB85C\uBD07\uACF5\uD559\uC5D0\uC11C \uBCA1\uD130\uB294 \uB2E8\uC21C\uD55C \uC22B\uC790 \uBAA9\uB85D\uC774 \uC544\uB2C8\uB77C \uC5B4\uB290 frame\uC5D0\uC11C \uBCF8 \uBB3C\uB9AC\uB7C9\uC774\uB2E4. \uD68C\uC804\uD589\uB82C\uC740 basis vector\uB97C \uB2E4\uB978 frame\uC73C\uB85C \uC62E\uAE30\uB294 \uC120\uD615\uBCC0\uD658\uC774\uACE0, homogeneous transform\uC740 \uD68C\uC804\uACFC \uD3C9\uD589\uC774\uB3D9\uC744 \uD558\uB098\uC758 \uD589\uB82C\uACF1\uC73C\uB85C \uD569\uCE5C \uD45C\uAE30\uB2E4. \uC774 \uAC1C\uB150\uC744 \uBAA8\uB974\uBA74 FK, odometry, camera projection, tf2 tree\uAC00 \uBAA8\uB450 \uC554\uAE30 \uB300\uC0C1\uCC98\uB7FC \uBCF4\uC778\uB2E4.",
      mentalModel: "\uC88C\uD45C\uBCC0\uD658\uC740 \uC9C0\uB3C4\uB97C \uB3CC\uB9AC\uB294 \uC77C\uC774 \uC544\uB2C8\uB77C \uAC19\uC740 \uC810\uC744 \uB2E4\uB978 \uC790\uC640 \uB2E4\uB978 \uC6D0\uC810\uC73C\uB85C \uB2E4\uC2DC \uC7AC\uB294 \uC77C\uC774\uB2E4. \uD68C\uC804\uD589\uB82C\uC758 \uAC01 \uC5F4\uC740 \uC0C8 \uC88C\uD45C\uCD95\uC774 \uC6D0\uB798 \uC88C\uD45C\uACC4\uC5D0\uC11C \uC5B4\uB514\uB97C \uD5A5\uD558\uB294\uC9C0 \uB098\uD0C0\uB0B4\uBBC0\uB85C, \uC5F4\uBCA1\uD130\uC758 \uC9C1\uAD50\uC131\uACFC \uAE38\uC774 1 \uC870\uAC74\uC774 \uACE7 '\uD68C\uC804\uC740 \uAE38\uC774\uC640 \uAC01\uB3C4\uB97C \uBCF4\uC874\uD55C\uB2E4'\uB294 \uB73B\uC774 \uB41C\uB2E4.",
      variables: [
        "p_A: frame A\uC5D0\uC11C \uD45C\uD604\uD55C \uC810 \uB610\uB294 \uBCA1\uD130",
        "R_AB: frame B\uC758 basis\uB97C frame A\uC5D0\uC11C \uBCF8 \uD68C\uC804\uD589\uB82C",
        "t_AB: frame A\uC5D0\uC11C \uBCF8 frame B \uC6D0\uC810\uC758 \uC704\uCE58",
        "T_AB: R_AB\uC640 t_AB\uB97C \uD569\uCE5C homogeneous transform"
      ],
      principles: [
        "\uD68C\uC804\uD589\uB82C\uC740 \uC9C1\uAD50\uD589\uB82C\uC774\uBBC0\uB85C R^T R=I\uC774\uACE0 \uC5ED\uD589\uB82C\uC740 \uC804\uCE58\uD589\uB82C\uC774\uB2E4.",
        "\uC810 \uBCC0\uD658\uC740 p_A = R_AB p_B + t_AB\uB85C \uC4F0\uBA70, transform chain\uC740 T_AC = T_AB T_BC\uCC98\uB7FC \uACF1\uD55C\uB2E4.",
        "\uBC29\uD5A5 \uBCA1\uD130\uC5D0\uB294 \uD3C9\uD589\uC774\uB3D9\uC774 \uC801\uC6A9\uB418\uC9C0 \uC54A\uC9C0\uB9CC, \uC810\uC5D0\uB294 \uD68C\uC804\uACFC \uD3C9\uD589\uC774\uB3D9\uC774 \uBAA8\uB450 \uC801\uC6A9\uB41C\uB2E4.",
        "tf2, URDF, camera extrinsic\uC740 \uBAA8\uB450 \uC774 \uBCC0\uD658 \uCCB4\uC778\uC744 \uCF54\uB4DC\uC640 \uBA54\uC2DC\uC9C0\uB85C \uD45C\uD604\uD55C \uAC83\uC774\uB2E4."
      ],
      formulas: [
        formula("2D rotation", "R(theta) = [[cos(theta), -sin(theta)], [sin(theta), cos(theta)]]", "yaw \uD68C\uC804\uC758 \uAE30\uBCF8 \uD589\uB82C."),
        formula("rigid transform", "p_A = R_AB p_B + t_AB", "frame B\uC758 \uC810\uC744 frame A \uD45C\uD604\uC73C\uB85C \uBC14\uAFBC\uB2E4."),
        formula("inverse transform", "T_AB^-1 = [[R_AB^T, -R_AB^T t_AB], [0, 1]]", "\uD68C\uC804\uC758 \uC9C1\uAD50\uC131\uC744 \uC774\uC6A9\uD55C \uC5ED\uBCC0\uD658.")
      ],
      derivation: [
        "2D\uC5D0\uC11C unit x\uCD95 e1=[1,0]^T\uB97C theta\uB9CC\uD07C \uB3CC\uB9AC\uBA74 [cos(theta), sin(theta)]^T\uAC00 \uB41C\uB2E4.",
        "unit y\uCD95 e2=[0,1]^T\uB97C \uAC19\uC740 \uAC01\uB3C4\uB85C \uB3CC\uB9AC\uBA74 [-sin(theta), cos(theta)]^T\uAC00 \uB41C\uB2E4.",
        "\uD68C\uC804\uD589\uB82C\uC740 \uBCC0\uD658\uB41C basis\uB97C \uC5F4\uB85C \uC313\uC740 \uD589\uB82C\uC774\uBBC0\uB85C R(theta)\uC758 \uB450 \uC5F4\uC774 \uACE7 \uC0C8 basis\uB2E4.",
        "\uC5ED\uBCC0\uD658\uC740 p_B = R_AB^T (p_A - t_AB)\uB85C \uC5BB\uB294\uB2E4. \uC5EC\uAE30\uC11C R^-1=R^T\uAC00 \uD575\uC2EC\uC774\uB2E4."
      ],
      proof: [
        "R\uC758 \uB450 \uC5F4\uBCA1\uD130 \uB0B4\uC801\uC740 cos(theta)(-sin(theta))+sin(theta)cos(theta)=0\uC774\uBBC0\uB85C \uC11C\uB85C \uC9C1\uAD50\uD55C\uB2E4.",
        "\uAC01 \uC5F4\uBCA1\uD130\uC758 \uAE38\uC774\uB294 cos^2(theta)+sin^2(theta)=1\uC774\uBBC0\uB85C \uB2E8\uC704\uBCA1\uD130\uB2E4.",
        "\uB530\uB77C\uC11C R^T R=I\uC774\uACE0 \uD68C\uC804\uC740 \uBCA1\uD130 \uAE38\uC774\uC640 \uBCA1\uD130 \uC0AC\uC774 \uAC01\uB3C4\uB97C \uBCF4\uC874\uD55C\uB2E4."
      ],
      workedExample: {
        prompt: "p_B=(1,0), theta=90\uB3C4, t_AB=(2,3)\uC77C \uB54C p_A\uB97C \uAD6C\uD558\uB77C.",
        steps: ["R(90)p_B=(0,1)", "p_A=(0,1)+(2,3)", "\uB530\uB77C\uC11C p_A=(2,4)"],
        result: "\uD68C\uC804 \uD6C4 \uD3C9\uD589\uC774\uB3D9\uD55C\uB2E4\uB294 \uC21C\uC11C\uAC00 \uC911\uC694\uD558\uB2E4."
      },
      implementationNotes: [
        "C++\uC5D0\uC11C\uB294 Eigen::Matrix3d \uB610\uB294 tf2::Transform\uC73C\uB85C transform\uC744 \uBA85\uD655\uD788 \uD45C\uD604\uD55C\uB2E4.",
        "ROS 2\uC5D0\uC11C\uB294 frame \uC774\uB984\uACFC timestamp\uB97C \uAC19\uC774 \uBD10\uC57C \uC624\uB798\uB41C transform\uC744 \uC798\uBABB \uC4F0\uC9C0 \uC54A\uB294\uB2E4.",
        "\uCF54\uB4DC \uD14C\uC2A4\uD2B8\uB294 T*T^-1\uC774 identity\uC5D0 \uAC00\uAE4C\uC6B4\uC9C0, transform chain \uC21C\uC11C\uAC00 \uB9DE\uB294\uC9C0 \uD655\uC778\uD55C\uB2E4."
      ],
      engineeringMeaning: [
        "\uCE74\uBA54\uB77C-\uB85C\uBD07\uD314 hand-eye calibration, odom-base_link, map-odom \uAD00\uACC4\uB294 \uBAA8\uB450 \uAC19\uC740 \uC218\uD559\uC744 \uACF5\uC720\uD55C\uB2E4.",
        "\uC88C\uD45C\uACC4 \uC624\uB958\uB294 \uAC12\uC774 \uC870\uAE08 \uD2C0\uB9AC\uB294 \uBB38\uC81C\uAC00 \uC544\uB2C8\uB77C \uBC29\uD5A5\uC774 \uC644\uC804\uD788 \uBC18\uB300\uB85C \uAC00\uB294 \uBB38\uC81C\uB97C \uB9CC\uB4E0\uB2E4."
      ],
      commonMistakes: [
        "T_AB\uC640 T_BA\uB97C \uC774\uB984\uB9CC \uBCF4\uACE0 \uB4A4\uC11E\uB294\uB2E4.",
        "\uC810\uACFC \uBC29\uD5A5 \uBCA1\uD130\uB97C \uAD6C\uBD84\uD558\uC9C0 \uC54A\uACE0 \uB458 \uB2E4 \uD3C9\uD589\uC774\uB3D9\uD55C\uB2E4.",
        "degree\uC640 radian\uC744 \uC11E\uC5B4 \uD68C\uC804\uD589\uB82C\uC744 \uB9CC\uB4E0\uB2E4."
      ],
      examTargets: ["\uD68C\uC804\uD589\uB82C \uAD6C\uC131", "\uC5ED\uBCC0\uD658 \uC720\uB3C4", "frame chain \uC21C\uC11C \uD310\uBCC4", "\uC218\uCE58 \uC608\uC81C \uACC4\uC0B0"]
    };
  }
  if (id.includes("probability") || id.includes("kalman") || id.includes("kf-ekf-pf") || id.includes("sensor-fusion") || id.includes("covariance")) {
    return {
      subject: "\uD655\uB960\uCD94\uC815\uACFC \uC13C\uC11C\uC735\uD569",
      coreQuestion: "\uB178\uC774\uC988\uAC00 \uC788\uB294 \uC13C\uC11C \uAD00\uCE21\uC744 \uC5B4\uB5BB\uAC8C \uBBFF\uC744 \uB9CC\uD55C \uC0C1\uD0DC \uCD94\uC815\uAC12\uACFC \uBD88\uD655\uC2E4\uC131\uC73C\uB85C \uBC14\uAFC0 \uAC83\uC778\uAC00?",
      concept: "\uD655\uB960\uCD94\uC815\uC740 \uC13C\uC11C\uAC12\uC744 \uD558\uB098\uC758 \uC815\uB2F5\uC73C\uB85C \uBBFF\uC9C0 \uC54A\uACE0 \uD3C9\uADE0\uACFC \uACF5\uBD84\uC0B0\uC744 \uAC00\uC9C4 \uBBFF\uC74C \uC0C1\uD0DC\uB85C \uB2E4\uB8E8\uB294 \uD559\uBB38\uC774\uB2E4. Kalman Filter\uB294 \uC608\uCE21 \uBAA8\uB378\uB85C \uB2E4\uC74C \uC0C1\uD0DC\uB97C \uBA3C\uC800 \uCD94\uC815\uD558\uACE0, \uC13C\uC11C \uAD00\uCE21\uC774 \uB4E4\uC5B4\uC624\uBA74 \uB450 \uC815\uBCF4\uC758 \uBD88\uD655\uC2E4\uC131\uC744 \uBE44\uAD50\uD574 \uAC00\uC911 \uD3C9\uADE0\uCC98\uB7FC \uBCF4\uC815\uD55C\uB2E4. EKF/UKF/Particle Filter\uB294 \uC774 \uC544\uC774\uB514\uC5B4\uB97C \uBE44\uC120\uD615 \uC2DC\uC2A4\uD15C\uC5D0 \uB9DE\uAC8C \uD655\uC7A5\uD55C\uB2E4.",
      mentalModel: "\uB450 \uC0AC\uB78C\uC774 \uAC19\uC740 \uC704\uCE58\uB97C \uB2E4\uB978 \uC815\uD655\uB3C4\uB85C \uB9D0\uD55C\uB2E4\uACE0 \uC0DD\uAC01\uD558\uBA74 \uB41C\uB2E4. GPS\uAC00 \uAC70\uCE60\uACE0 wheel odometry\uAC00 \uC9E7\uC740 \uC2DC\uAC04\uC5D0\uB294 \uC548\uC815\uC801\uC774\uBA74, \uAC00\uAE4C\uC6B4 \uC2DC\uAC04\uC5D0\uB294 odometry\uB97C \uB354 \uBBFF\uACE0 \uC7A5\uAE30 drift\uB294 GPS\uB098 map observation\uC73C\uB85C \uBCF4\uC815\uD55C\uB2E4. \uACF5\uBD84\uC0B0\uC740 \uAC01 \uC0AC\uB78C\uC774 \uC5BC\uB9C8\uB098 \uC790\uC2E0 \uC788\uAC8C \uB9D0\uD558\uB294\uC9C0 \uB098\uD0C0\uB0B4\uB294 \uD0C0\uC6D0\uC774\uB2E4.",
      variables: [
        "x: \uCD94\uC815\uD558\uB824\uB294 \uC0C1\uD0DC \uBCA1\uD130",
        "P: \uC0C1\uD0DC \uCD94\uC815\uC758 \uACF5\uBD84\uC0B0",
        "Q: motion model \uB610\uB294 process noise \uACF5\uBD84\uC0B0",
        "R: measurement noise \uACF5\uBD84\uC0B0",
        "K: Kalman gain, \uC608\uCE21\uACFC \uAD00\uCE21\uC758 \uD63C\uD569 \uBE44\uC728"
      ],
      principles: [
        "prediction \uB2E8\uACC4\uC5D0\uC11C\uB294 \uBAA8\uB378\uC744 \uB530\uB77C \uC0C1\uD0DC\uB97C \uC804\uD30C\uD558\uACE0 \uBD88\uD655\uC2E4\uC131\uC740 \uBCF4\uD1B5 \uC99D\uAC00\uD55C\uB2E4.",
        "update \uB2E8\uACC4\uC5D0\uC11C\uB294 \uAD00\uCE21 residual\uC744 Kalman gain\uC73C\uB85C \uBC18\uC601\uD574 \uD3C9\uADE0\uACFC \uACF5\uBD84\uC0B0\uC744 \uC904\uC778\uB2E4.",
        "\uACF5\uBD84\uC0B0 \uD589\uB82C\uC758 \uB300\uAC01\uD56D\uC740 \uAC01 \uBCC0\uC218 \uBD84\uC0B0, \uBE44\uB300\uAC01\uD56D\uC740 \uBCC0\uC218 \uAC04 \uC0C1\uAD00\uAD00\uACC4\uB2E4.",
        "\uC2DC\uAC04 \uB3D9\uAE30\uD654\uC640 frame calibration\uC774 \uD2C0\uB9AC\uBA74 \uC218\uC2DD\uC774 \uB9DE\uC544\uB3C4 fusion \uACB0\uACFC\uAC00 \uD2C0\uC5B4\uC9C4\uB2E4."
      ],
      formulas: [
        formula("Bayes update", "p(x|z) = p(z|x)p(x)/p(z)", "\uAD00\uCE21 z\uAC00 \uB4E4\uC5B4\uC654\uC744 \uB54C belief\uB97C \uAC31\uC2E0\uD558\uB294 \uAE30\uBCF8\uC2DD."),
        formula("KF predict covariance", "P' = F P F^T + Q", "\uC120\uD615\uD654\uB41C \uBAA8\uB378\uB85C \uBD88\uD655\uC2E4\uC131\uC744 \uC804\uD30C."),
        formula("Kalman gain", "K = P' H^T (H P' H^T + R)^-1", "\uC608\uCE21\uACFC \uAD00\uCE21\uC744 \uC11E\uB294 \uBE44\uC728."),
        formula("KF update", "x = x' + K(z - H x')", "innovation\uC744 \uC0C1\uD0DC\uC5D0 \uBC18\uC601.")
      ],
      derivation: [
        "\uC0C1\uD0DC \uC804\uC774\uB294 x'=f(x,u)\uB85C \uC608\uCE21\uD558\uACE0, \uC791\uC740 \uC624\uCC28\uC5D0 \uB300\uD574\uC11C F=partial f/partial x\uB85C \uC120\uD615\uD654\uD55C\uB2E4.",
        "\uC120\uD615 \uBCC0\uD658 AX\uC758 \uACF5\uBD84\uC0B0\uC740 A Sigma A^T\uC774\uBBC0\uB85C P'=F P F^T\uAC00 \uB41C\uB2E4.",
        "\uBAA8\uB378 \uC790\uCCB4\uC758 \uD754\uB4E4\uB9BC\uC744 process noise Q\uB85C \uB354\uD55C\uB2E4.",
        "\uAD00\uCE21 residual z-Hx'\uC758 \uC2E0\uB8B0\uB3C4\uB294 H P' H^T + R\uC774\uBA70, \uC774\uB97C \uC774\uC6A9\uD574 K\uB97C \uACC4\uC0B0\uD55C\uB2E4.",
        "K\uAC00 \uD06C\uBA74 \uAD00\uCE21\uC744 \uB354 \uBBFF\uACE0, K\uAC00 \uC791\uC73C\uBA74 \uC608\uCE21\uC744 \uB354 \uBBFF\uB294\uB2E4."
      ],
      proof: [
        "\uACF5\uBD84\uC0B0 \uC815\uC758 E[(X-mu)(X-mu)^T]\uC5D0 Y=AX\uB97C \uB300\uC785\uD558\uBA74 Cov(Y)=A Cov(X) A^T\uAC00 \uB41C\uB2E4.",
        "Gaussian prior\uC640 Gaussian measurement likelihood\uB97C \uACF1\uD558\uBA74 \uB2E4\uC2DC Gaussian\uC774 \uB418\uBBC0\uB85C \uD3C9\uADE0\uACFC \uACF5\uBD84\uC0B0 \uAC31\uC2E0\uB9CC \uCD94\uC801\uD558\uBA74 \uB41C\uB2E4.",
        "Kalman gain \uC2DD\uC740 update \uD6C4 posterior covariance\uB97C \uCD5C\uC18C\uD654\uD558\uB294 \uC120\uD615 \uCD94\uC815\uAE30\uC758 \uD574\uB85C \uC720\uB3C4\uB41C\uB2E4."
      ],
      workedExample: {
        prompt: "\uC608\uCE21 \uBD84\uC0B0 P'=4, \uC13C\uC11C \uBD84\uC0B0 R=1\uC778 1D \uCE21\uC815\uC5D0\uC11C K\uB97C \uAD6C\uD558\uB77C.",
        steps: ["K=P'/(P'+R)", "K=4/(4+1)", "K=0.8\uC774\uBBC0\uB85C \uAD00\uCE21\uC744 \uAC15\uD558\uAC8C \uBC18\uC601\uD55C\uB2E4."],
        result: "\uC13C\uC11C\uAC00 \uC608\uCE21\uBCF4\uB2E4 \uB354 \uC815\uD655\uD558\uBBC0\uB85C update\uAC00 \uCE21\uC815\uAC12 \uCABD\uC73C\uB85C \uB9CE\uC774 \uC774\uB3D9\uD55C\uB2E4."
      },
      implementationNotes: [
        "robot_localization YAML\uC5D0\uC11C\uB294 \uAC01 \uC13C\uC11C\uBCC4 covariance\uC640 enabled variable mask\uB97C \uD568\uAED8 \uD655\uC778\uD55C\uB2E4.",
        "IMU bias, encoder slip, LiDAR timestamp delay\uB294 Q/R tuning\uBCF4\uB2E4 \uBA3C\uC800 \uBD84\uB9AC\uD574 \uBCF4\uC544\uC57C \uD55C\uB2E4.",
        "rosbag replay\uC5D0\uC11C /tf, /odom, /imu, /scan timestamp\uB97C \uAC19\uC774 \uBCF4\uBA70 update \uC21C\uC11C\uB97C \uAC80\uC99D\uD55C\uB2E4."
      ],
      engineeringMeaning: [
        "\uACF5\uBD84\uC0B0\uC740 \uB2E8\uC21C\uD55C \uBD80\uAC00 \uC815\uBCF4\uAC00 \uC544\uB2C8\uB77C planner\uC640 controller\uAC00 \uCD94\uC815\uAC12\uC744 \uC5BC\uB9C8\uB098 \uBBFF\uC744\uC9C0 \uACB0\uC815\uD558\uB294 \uACC4\uC57D\uC774\uB2E4.",
        "\uC13C\uC11C\uC735\uD569\uC774 \uC798\uBABB\uB418\uBA74 \uC9C0\uB3C4\uC640 \uB85C\uBD07 \uC704\uCE58\uAC00 \uD754\uB4E4\uB9AC\uACE0, \uADF8 \uACB0\uACFC costmap\uACFC controller\uAE4C\uC9C0 \uC5F0\uC1C4\uC801\uC73C\uB85C \uB098\uBE60\uC9C4\uB2E4."
      ],
      commonMistakes: [
        "Q\uC640 R\uC744 \uAC10\uC73C\uB85C \uD0A4\uC6B0\uACE0 \uC904\uC774\uBA74\uC11C \uB85C\uADF8\uB97C \uB0A8\uAE30\uC9C0 \uC54A\uB294\uB2E4.",
        "\uC13C\uC11C frame\uC774 \uB2E4\uB974\uAC70\uB098 timestamp\uAC00 \uC5B4\uAE0B\uB09C \uC0C1\uD0DC\uC5D0\uC11C filter \uC218\uC2DD\uB9CC \uC758\uC2EC\uD55C\uB2E4.",
        "\uACF5\uBD84\uC0B0 \uD589\uB82C\uC758 \uB2E8\uC704\uC640 \uBCC0\uC218 \uC21C\uC11C\uB97C \uD655\uC778\uD558\uC9C0 \uC54A\uB294\uB2E4."
      ],
      examTargets: ["Bayes update \uC758\uBBF8", "P'=FPF^T+Q \uC720\uB3C4", "Kalman gain \uACC4\uC0B0", "\uC13C\uC11C\uC735\uD569 \uC2E4\uD328 \uC9C4\uB2E8"]
    };
  }
  if (id.includes("optimization") || id.includes("advanced-control") || id.includes("lqr") || id.includes("mpc") || id.includes("gradient")) {
    return {
      subject: "\uCD5C\uC801\uD654\uC640 \uACE0\uAE09 \uC81C\uC5B4",
      coreQuestion: "\uBAA9\uD45C \uC624\uCC28\uC640 \uC81C\uC57D \uC870\uAC74\uC774 \uC788\uC744 \uB54C \uC5B4\uB5A4 \uC785\uB825\uC774 \uBE44\uC6A9\uC744 \uAC00\uC7A5 \uC791\uAC8C \uB9CC\uB4DC\uB294\uAC00?",
      concept: "\uCD5C\uC801\uD654\uB294 \uB85C\uBD07 \uBB38\uC81C\uB97C '\uC88B\uC740 \uD574'\uAC00 \uC544\uB2C8\uB77C \uBE44\uC6A9\uD568\uC218\uB97C \uCD5C\uC18C\uD654\uD558\uB294 \uD574\uB85C \uD45C\uD604\uD55C\uB2E4. Gradient descent\uB294 \uBE44\uC6A9\uC774 \uAC00\uC7A5 \uBE68\uB9AC \uC99D\uAC00\uD558\uB294 \uBC29\uD5A5\uC758 \uBC18\uB300\uB85C \uC6C0\uC9C1\uC774\uACE0, Gauss-Newton/LM\uC740 \uC794\uCC28\uC81C\uACF1 \uBB38\uC81C\uC758 \uAD6D\uC18C 2\uCC28 \uAD6C\uC870\uB97C \uC774\uC6A9\uD55C\uB2E4. LQR/MPC\uB294 \uC0C1\uD0DC\uBC29\uC815\uC2DD\uACFC \uBE44\uC6A9\uD568\uC218, \uC785\uB825 \uC81C\uD55C\uC744 \uC774\uC6A9\uD574 \uC81C\uC5B4 \uBA85\uB839\uC744 \uACC4\uC0B0\uD55C\uB2E4.",
      mentalModel: "\uB85C\uBD07 \uC81C\uC5B4\uB294 \uB208\uC55E\uC758 \uC624\uCC28\uB9CC \uC904\uC774\uB294 \uC6B4\uC804\uC774 \uC544\uB2C8\uB77C \uBBF8\uB798 \uBE44\uC6A9\uAE4C\uC9C0 \uACE0\uB824\uD558\uB294 \uACC4\uC0B0\uC774\uB2E4. LQR\uC740 \uC120\uD615 \uC2DC\uC2A4\uD15C\uC5D0\uC11C \uBD80\uB4DC\uB7FD\uACE0 \uBE60\uB978 \uADE0\uD615\uC810\uC744 \uCC3E\uACE0, MPC\uB294 \uB9E4 \uC21C\uAC04 \uC9E7\uC740 \uBBF8\uB798\uB97C \uC608\uCE21\uD574 \uC81C\uD55C\uC744 \uC9C0\uD0A4\uB294 \uC785\uB825\uC744 \uB2E4\uC2DC \uD47C\uB2E4.",
      variables: [
        "J(theta): \uCD5C\uC18C\uD654\uD560 \uBE44\uC6A9\uD568\uC218",
        "grad J: \uBE44\uC6A9\uC758 \uAE30\uC6B8\uAE30",
        "x_{k+1}=A x_k + B u_k: \uC120\uD615 \uC0C1\uD0DC\uBC29\uC815\uC2DD",
        "Q, R: \uC0C1\uD0DC\uC624\uCC28\uC640 \uC785\uB825\uD06C\uAE30\uC758 \uBE44\uC6A9 \uAC00\uC911\uCE58"
      ],
      principles: [
        "gradient descent\uB294 theta_{k+1}=theta_k-alpha grad J(theta_k)\uB85C \uBE44\uC6A9\uC744 \uC904\uC778\uB2E4.",
        "\uD559\uC2B5\uB960 alpha\uAC00 \uB108\uBB34 \uD06C\uBA74 \uBC1C\uC0B0\uD558\uACE0 \uB108\uBB34 \uC791\uC73C\uBA74 \uC218\uB834\uC774 \uB290\uB9AC\uB2E4.",
        "LQR\uC740 \uC0C1\uD0DC\uC624\uCC28\uC640 \uC785\uB825 \uC0AC\uC6A9\uB7C9\uC758 \uADE0\uD615\uC744 \uBE44\uC6A9\uD568\uC218\uB85C \uD45C\uD604\uD55C\uB2E4.",
        "MPC\uB294 constraint\uB97C \uBA85\uC2DC\uC801\uC73C\uB85C \uB123\uC744 \uC218 \uC788\uC9C0\uB9CC \uACC4\uC0B0\uC2DC\uAC04\uACFC \uC2E4\uC2DC\uAC04\uC131\uC774 \uC911\uC694\uD558\uB2E4."
      ],
      formulas: [
        formula("gradient descent", "theta_{k+1}=theta_k - alpha grad J(theta_k)", "\uBE44\uC6A9\uC774 \uC99D\uAC00\uD558\uB294 \uBC29\uD5A5\uC758 \uBC18\uB300\uB85C \uC5C5\uB370\uC774\uD2B8."),
        formula("linear dynamics", "x_{k+1}=A x_k + B u_k", "\uC774\uC0B0\uC2DC\uAC04 \uC120\uD615 \uC0C1\uD0DC\uACF5\uAC04 \uBAA8\uB378."),
        formula("quadratic cost", "J=sum_k (x_k^T Q x_k + u_k^T R u_k)", "\uC0C1\uD0DC\uC624\uCC28\uC640 \uC785\uB825\uD06C\uAE30\uC758 \uB204\uC801 \uBE44\uC6A9."),
        formula("MPC objective", "min_u J subject to x_{k+1}=f(x_k,u_k)", "\uBAA8\uB378\uACFC \uC81C\uC57D\uC744 \uB9CC\uC871\uD558\uB294 \uCD5C\uC801 \uC785\uB825\uC744 \uCC3E\uB294\uB2E4.")
      ],
      derivation: [
        "\uBE44\uC6A9\uD568\uC218 J(theta)\uB97C \uD604\uC7AC theta \uADFC\uCC98\uC5D0\uC11C 1\uCC28 Taylor \uC804\uAC1C\uD558\uBA74 J(theta+d)\u2248J(theta)+grad J^T d\uB2E4.",
        "d=-alpha grad J\uB97C \uACE0\uB974\uBA74 grad J^T d=-alpha ||grad J||^2\uB77C\uC11C \uC791\uC740 alpha\uC5D0\uC11C \uBE44\uC6A9\uC774 \uAC10\uC18C\uD55C\uB2E4.",
        "\uC81C\uC5B4\uC5D0\uC11C\uB294 \uC0C1\uD0DC\uC804\uC774 x_{k+1}=Ax_k+Bu_k\uB97C rollout\uD574 \uBBF8\uB798 \uC0C1\uD0DC\uB97C \uC785\uB825 sequence\uC758 \uD568\uC218\uB85C \uB9CC\uB4E0\uB2E4.",
        "\uBBF8\uB798 \uC0C1\uD0DC\uC624\uCC28\uC640 \uC785\uB825\uD06C\uAE30\uB97C Q/R\uB85C \uAC00\uC911\uD569\uD558\uBA74 controller\uAC00 \uBE60\uB984\uACFC \uBD80\uB4DC\uB7EC\uC6C0 \uC0AC\uC774\uB97C \uC870\uC808\uD55C\uB2E4."
      ],
      proof: [
        "Taylor \uC804\uAC1C\uC5D0\uC11C gradient \uBC29\uD5A5\uC740 \uD568\uC218\uAC00 \uAC00\uC7A5 \uBE68\uB9AC \uC99D\uAC00\uD558\uB294 \uBC29\uD5A5\uC774\uBBC0\uB85C \uADF8 \uBC18\uB300\uB294 \uAD6D\uC18C \uAC10\uC18C \uBC29\uD5A5\uC774\uB2E4.",
        "Q\uAC00 positive semidefinite\uC774\uACE0 R\uC774 positive definite\uC774\uBA74 quadratic cost\uB294 \uC624\uCC28\uC640 \uC785\uB825 \uD06C\uAE30\uC5D0 \uB300\uD574 \uC74C\uC218\uAC00 \uB418\uC9C0 \uC54A\uB294\uB2E4.",
        "\uC120\uD615 \uC2DC\uC2A4\uD15C\uACFC quadratic cost\uC758 \uC870\uD569\uC740 Riccati \uBC29\uC815\uC2DD\uC73C\uB85C \uC548\uC815\uC801\uC778 feedback gain\uC744 \uC720\uB3C4\uD560 \uC218 \uC788\uB2E4."
      ],
      workedExample: {
        prompt: "J(theta)=theta^2, theta=3, alpha=0.1\uC77C \uB54C \uD55C \uBC88\uC758 gradient descent \uD6C4 theta\uB294?",
        steps: ["grad J=2theta=6", "theta_new=3-0.1*6", "theta_new=2.4"],
        result: "\uBE44\uC6A9\uC740 9\uC5D0\uC11C 5.76\uC73C\uB85C \uC904\uC5B4\uB4E0\uB2E4."
      },
      implementationNotes: [
        "\uCD5C\uC801\uD654 \uC2E4\uD5D8\uC740 \uCD08\uAE30\uAC12, step size, iteration count, termination \uC870\uAC74\uC744 \uBC18\uB4DC\uC2DC \uAE30\uB85D\uD55C\uB2E4.",
        "MPC\uB294 solver \uC2DC\uAC04\uC758 tail latency\uAC00 \uC81C\uC5B4\uC8FC\uAE30\uB97C \uB118\uC9C0 \uC54A\uB294\uC9C0 \uCE21\uC815\uD574\uC57C \uD55C\uB2E4.",
        "LQR/MPC \uACB0\uACFC\uB294 saturation\uACFC rate limit\uC744 \uD1B5\uACFC\uD55C \uC2E4\uC81C command\uB85C \uB2E4\uC2DC \uAC80\uC99D\uD55C\uB2E4."
      ],
      engineeringMeaning: [
        "\uD29C\uB2DD\uC740 gain\uC744 \uAC10\uC73C\uB85C \uBC14\uAFB8\uB294 \uC77C\uC774 \uC544\uB2C8\uB77C \uBE44\uC6A9 \uD56D\uACFC \uC81C\uC57D\uC744 \uBA85\uD655\uD788 \uBC14\uAFB8\uACE0 metric\uC73C\uB85C \uBE44\uAD50\uD558\uB294 \uC77C\uC774\uB2E4.",
        "\uACE0\uAE09 \uC81C\uC5B4\uAC00 \uC2E4\uD328\uD560 \uB54C\uB294 \uBAA8\uB378 \uBD88\uC77C\uCE58, \uC81C\uC57D \uC124\uC815, solver \uC2DC\uAC04, \uC13C\uC11C \uC9C0\uC5F0\uC744 \uBD84\uB9AC\uD574\uC11C \uBCF8\uB2E4."
      ],
      commonMistakes: [
        "\uBE44\uC6A9\uD568\uC218\uC758 \uB2E8\uC704\uAC00 \uB2E4\uB978 \uD56D\uB4E4\uC744 \uAC00\uC911\uCE58 \uC5C6\uC774 \uB354\uD55C\uB2E4.",
        "\uD559\uC2B5\uB960\uC774\uB098 solver tolerance\uB9CC \uBC14\uAFB8\uACE0 \uC2E4\uD328 \uB85C\uADF8\uB97C \uB0A8\uAE30\uC9C0 \uC54A\uB294\uB2E4.",
        "constraint\uB97C \uBB34\uC2DC\uD55C \uC774\uC0C1\uC801\uC778 command\uB97C \uC2E4\uC81C \uB85C\uBD07\uC5D0 \uADF8\uB300\uB85C \uBCF4\uB0B8\uB2E4."
      ],
      examTargets: ["gradient descent \uACC4\uC0B0", "Taylor \uAC10\uC18C \uBC29\uD5A5 \uC99D\uBA85", "LQR \uBE44\uC6A9\uC2DD \uD574\uC11D", "MPC \uC81C\uC57D \uC9C4\uB2E8"]
    };
  }
  if (id.includes("jacobian") || id.includes("differential") || id.includes("inverse-kinematics")) {
    return {
      subject: "\uBBF8\uBD84, Jacobian, \uC218\uCE58\uC801 \uC5ED\uAE30\uAD6C\uD559",
      coreQuestion: "\uC785\uB825 \uBCC0\uC218\uAC00 \uC870\uAE08 \uBC14\uB014 \uB54C \uCD9C\uB825 pose\uB098 \uC624\uCC28\uAC00 \uC5B4\uB290 \uBC29\uD5A5\uC73C\uB85C \uC5BC\uB9C8\uB098 \uBC14\uB00C\uB294\uAC00?",
      concept: "Jacobian\uC740 \uB2E4\uBCC0\uC218 \uD568\uC218\uC758 \uAD6D\uC18C \uC120\uD615 \uADFC\uC0AC\uB2E4. \uB85C\uBD07\uD314\uC5D0\uC11C\uB294 \uAD00\uC808\uC18D\uB3C4 qdot\uC774 \uB9D0\uB2E8\uC18D\uB3C4 xdot\uC73C\uB85C \uBC14\uB00C\uB294 \uBE44\uC728\uC774\uACE0, \uCD5C\uC801\uD654\uC5D0\uC11C\uB294 \uD30C\uB77C\uBBF8\uD130 \uBCC0\uD654\uAC00 \uC624\uCC28\uB97C \uC904\uC774\uB294 \uBC29\uD5A5\uC744 \uCC3E\uB294 \uB3C4\uAD6C\uB2E4. IK\uAC00 \uC5B4\uB824\uC6B4 \uC774\uC720\uB294 FK\uC758 \uC5ED\uD568\uC218\uAC00 \uD56D\uC0C1 \uB2E8\uC21C\uD558\uC9C0 \uC54A\uACE0, singularity \uADFC\uCC98\uC5D0\uC11C \uC791\uC740 \uB9D0\uB2E8 \uC6C0\uC9C1\uC784\uC774 \uD070 \uAD00\uC808 \uC6C0\uC9C1\uC784\uC744 \uC694\uAD6C\uD558\uAE30 \uB54C\uBB38\uC774\uB2E4.",
      mentalModel: "\uC0B0\uC758 \uC9C0\uB3C4\uC5D0\uC11C \uD604\uC7AC \uC704\uCE58 \uC8FC\uBCC0\uC758 \uAE30\uC6B8\uAE30\uB97C \uBCF4\uB294 \uAC83\uACFC \uAC19\uB2E4. \uC544\uC8FC \uC791\uC740 \uC601\uC5ED\uC5D0\uC11C\uB294 \uACE1\uC120\uB3C4 \uC9C1\uC120\uCC98\uB7FC \uBCF4\uC774\uBBC0\uB85C Jacobian\uC73C\uB85C '\uC9C0\uAE08 \uC774 \uC21C\uAC04 \uC5B4\uB290 \uAD00\uC808\uC744 \uC6C0\uC9C1\uC774\uBA74 \uB9D0\uB2E8\uC774 \uC5B4\uB290 \uCABD\uC73C\uB85C \uAC00\uB294\uC9C0' \uC608\uCE21\uD560 \uC218 \uC788\uB2E4.",
      variables: [
        "q: \uAD00\uC808\uAC01 \uBCA1\uD130",
        "x=f(q): \uB9D0\uB2E8 \uC704\uCE58 \uB610\uB294 pose",
        "J(q)=partial f / partial q: \uAD00\uC808 \uBCC0\uD654\uAC00 \uB9D0\uB2E8 \uBCC0\uD654\uC5D0 \uC8FC\uB294 \uBBFC\uAC10\uB3C4",
        "e=x_target-x_current: IK\uAC00 \uC904\uC5EC\uC57C \uD560 task-space \uC624\uCC28"
      ],
      principles: [
        "\uC18D\uB3C4\uAE30\uAD6C\uD559\uC740 xdot = J(q) qdot\uC73C\uB85C \uD45C\uD604\uD55C\uB2E4.",
        "\uC791\uC740 \uC624\uCC28\uC5D0 \uB300\uD574 e \u2248 J dq\uC774\uBBC0\uB85C dq\uB97C \uD480\uBA74 iterative IK update\uAC00 \uB41C\uB2E4.",
        "J\uAC00 full rank\uAC00 \uC544\uB2C8\uBA74 \uD2B9\uC815 \uBC29\uD5A5\uC758 \uB9D0\uB2E8\uC18D\uB3C4\uB97C \uB9CC\uB4E4 \uC218 \uC5C6\uACE0 \uC774\uAC83\uC774 singularity\uB2E4.",
        "Damped least squares\uB294 J\uAC00 \uB098\uC060 \uB54C \uC5ED\uD589\uB82C \uBB38\uC81C\uB97C \uC548\uC815\uD654\uD55C\uB2E4."
      ],
      formulas: [
        formula("velocity kinematics", "xdot = J(q) qdot", "\uAD00\uC808\uC18D\uB3C4\uC5D0\uC11C \uB9D0\uB2E8\uC18D\uB3C4\uB97C \uAD6C\uD55C\uB2E4."),
        formula("pseudoinverse IK", "dq = J^+ e", "\uAD6D\uC18C \uC120\uD615 \uADFC\uC0AC\uC5D0\uC11C task error\uB97C \uC904\uC774\uB294 \uAD00\uC808 \uBCC0\uD654."),
        formula("DLS update", "dq = J^T (J J^T + lambda^2 I)^-1 e", "singularity \uADFC\uCC98\uC5D0\uC11C damping\uC744 \uB123\uC740 update.")
      ],
      derivation: [
        "FK\uB97C x=f(q)\uB77C\uACE0 \uB450\uACE0 q \uC8FC\uBCC0\uC5D0\uC11C 1\uCC28 Taylor \uC804\uAC1C\uB97C \uD55C\uB2E4.",
        "f(q+dq) \u2248 f(q) + J(q)dq\uC774\uBBC0\uB85C \uBAA9\uD45C \uC624\uCC28 e=x_target-f(q)\uB294 Jdq\uB85C \uADFC\uC0AC\uB41C\uB2E4.",
        "\uC815\uBC29\uD589\uB82C\uC774\uBA74 dq=J^-1 e\uB97C \uC4F0\uC9C0\uB9CC, \uC77C\uBC18 \uB85C\uBD07\uC740 \uBE44\uC815\uBC29 \uB610\uB294 rank-deficient\uC77C \uC218 \uC788\uB2E4.",
        "least squares \uBB38\uC81C min ||Jdq-e||^2\uB97C \uD480\uBA74 pseudoinverse\uAC00 \uB098\uC624\uACE0, \uC815\uCE59\uC131\uC774 \uB098\uC060 \uB54C lambda^2 I\uB97C \uB354\uD558\uBA74 DLS\uAC00 \uB41C\uB2E4."
      ],
      proof: [
        "Taylor 1\uCC28 \uADFC\uC0AC\uB294 \uBBF8\uBD84 \uAC00\uB2A5\uD55C \uD568\uC218\uAC00 \uC791\uC740 \uADFC\uBC29\uC5D0\uC11C \uC120\uD615\uD568\uC218\uCC98\uB7FC \uD589\uB3D9\uD55C\uB2E4\uB294 \uC815\uB9AC\uC5D0\uC11C \uB098\uC628\uB2E4.",
        "least squares \uBAA9\uC801\uD568\uC218 ||Jdq-e||^2\uB97C dq\uB85C \uBBF8\uBD84\uD574 0\uC73C\uB85C \uB450\uBA74 normal equation\uC774 \uB098\uC628\uB2E4.",
        "DLS\uB294 normal equation\uC5D0 lambda^2||dq||^2 penalty\uB97C \uCD94\uAC00\uD55C ridge regression \uD615\uD0DC\uB2E4."
      ],
      workedExample: {
        prompt: "2\uB9C1\uD06C \uD314\uC5D0\uC11C det(J)=0.02\uC774\uACE0 task error\uAC00 \uD06C\uB2E4. \uC65C DLS\uAC00 \uD544\uC694\uD55C\uAC00?",
        steps: ["det(J)\uAC00 \uC791\uC73C\uBA74 J\uC758 condition\uC774 \uB098\uC058\uB2E4.", "pseudoinverse\uB294 \uC791\uC740 \uC624\uCC28\uB3C4 \uD070 dq\uB85C \uC99D\uD3ED\uD560 \uC218 \uC788\uB2E4.", "lambda^2 I\uB97C \uB354\uD558\uBA74 update\uAC00 \uC644\uB9CC\uD574\uC9C4\uB2E4."],
        result: "\uC815\uB2F5\uC740 '\uC815\uD655\uB3C4 \uC870\uAE08 \uC190\uD574\uB97C \uBCF4\uACE0 \uC548\uC815\uC131\uC744 \uC5BB\uB294\uB2E4'\uC774\uB2E4."
      },
      implementationNotes: [
        "\uD574\uC11D Jacobian\uACFC finite difference Jacobian\uC744 \uAC19\uC740 \uC785\uB825\uC5D0\uC11C \uBE44\uAD50\uD55C\uB2E4.",
        "IK loop\uB294 error norm, dq norm, iteration count, damping lambda\uB97C \uB85C\uADF8\uB85C \uB0A8\uAE34\uB2E4.",
        "joint limit\uACFC velocity limit clamp \uC5C6\uC774 DLS\uB9CC \uC4F0\uBA74 \uC2E4\uC81C \uB85C\uBD07 \uBA85\uB839\uC740 \uC5EC\uC804\uD788 \uC704\uD5D8\uD560 \uC218 \uC788\uB2E4."
      ],
      engineeringMeaning: [
        "MoveIt planner\uAC00 \uBAA9\uD45C\uC5D0 \uBABB \uAC00\uAC70\uB098 \uD314\uC774 \uCB49 \uD3B4\uC9C4 \uC790\uC138\uC5D0\uC11C \uD754\uB4E4\uB9AC\uB294 \uD604\uC0C1\uC740 Jacobian \uC870\uAC74\uACFC \uC5F0\uACB0\uB41C\uB2E4.",
        "Jacobian\uC740 \uC704\uCE58 \uC81C\uC5B4\uBFD0 \uC544\uB2C8\uB77C tau=J^T F\uB85C \uD798/\uD1A0\uD06C \uD574\uC11D\uC5D0\uB3C4 \uC774\uC5B4\uC9C4\uB2E4."
      ],
      commonMistakes: [
        "Jacobian\uC758 \uD589\uACFC \uC5F4 \uC758\uBBF8\uB97C \uC678\uC6B0\uC9C0 \uC54A\uACE0 \uC22B\uC790\uB9CC \uACC4\uC0B0\uD55C\uB2E4.",
        "degree \uB2E8\uC704 q\uB97C \uADF8\uB300\uB85C sin/cos\uC5D0 \uB123\uB294\uB2E4.",
        "singularity\uB97C det(J)=0\uC774\uB77C\uB294 \uC554\uAE30\uBB38\uC7A5\uC73C\uB85C\uB9CC \uBCF4\uACE0 rank\uC640 \uC870\uC791\uAC00\uB2A5\uC131 \uC758\uBBF8\uB97C \uB193\uCE5C\uB2E4."
      ],
      examTargets: ["Taylor \uC804\uAC1C", "Jdq=e \uC720\uB3C4", "DLS \uBE48\uCE78", "det(J)\uC640 singularity \uD574\uC11D"]
    };
  }
  if (id.includes("rigid-body-dynamics") || id.includes("trajectory-polynomial") || id.includes("controller-design") || id.includes("computed-torque")) {
    return {
      subject: "\uB85C\uBD07\uD314 \uB3D9\uC5ED\uD559\xB7\uADA4\uC801\xB7\uC81C\uC5B4",
      coreQuestion: "\uC6D0\uD558\uB294 \uAD00\uC808 \uADA4\uC801\uC744 \uC2E4\uC81C \uBAA8\uD130 \uD1A0\uD06C\uC640 \uC548\uC815\uC801\uC778 \uCD94\uC885\uC73C\uB85C \uC5B4\uB5BB\uAC8C \uC5F0\uACB0\uD560 \uAC83\uC778\uAC00?",
      concept: "\uC6B4\uB3D9\uD559\uC774 '\uC5B4\uB514\uC5D0 \uC788\uB294\uAC00'\uB97C \uB2E4\uB8EC\uB2E4\uBA74 \uB3D9\uC5ED\uD559\uC740 '\uC5B4\uB5A4 \uD798/\uD1A0\uD06C\uAC00 \uC788\uC5B4\uC57C \uADF8\uB807\uAC8C \uC6C0\uC9C1\uC774\uB294\uAC00'\uB97C \uB2E4\uB8EC\uB2E4. M(q), C(q,qdot), g(q)\uB294 \uAC01\uAC01 \uAD00\uC131, \uC18D\uB3C4\uC5D0 \uC758\uD55C \uACB0\uD569\uD56D, \uC911\uB825\uD56D\uC744 \uB098\uD0C0\uB0B8\uB2E4. \uADA4\uC801 \uC0DD\uC131\uC740 \uAD00\uC808 \uBAA9\uD45C\uB97C \uC2DC\uAC04\uD568\uC218\uB85C \uB9CC\uB4E4\uACE0, \uC81C\uC5B4\uAE30\uB294 \uC624\uCC28\uB97C \uC904\uC774\uBA74\uC11C actuator limit \uC548\uC5D0\uC11C \uBA85\uB839\uC744 \uB0B8\uB2E4.",
      mentalModel: "\uBB34\uAC70\uC6B4 \uBB38\uC744 \uC6C0\uC9C1\uC77C \uB54C \uCC98\uC74C\uC5D0\uB294 \uB354 \uD070 \uD798\uC774 \uD544\uC694\uD558\uACE0, \uBE68\uB9AC \uC6C0\uC9C1\uC774\uBA74 \uAD00\uC131 \uB54C\uBB38\uC5D0 \uBA48\uCD94\uAE30\uB3C4 \uC5B4\uB835\uB2E4. \uB85C\uBD07\uD314\uB3C4 \uB9C1\uD06C \uC9C8\uB7C9\uACFC \uC790\uC138\uC5D0 \uB530\uB77C \uAC19\uC740 \uC704\uCE58 \uC624\uCC28\uB77C\uB3C4 \uD544\uC694\uD55C \uD1A0\uD06C\uAC00 \uB2EC\uB77C\uC9C4\uB2E4.",
      variables: [
        "q, qdot, qddot: \uAD00\uC808 \uC704\uCE58, \uC18D\uB3C4, \uAC00\uC18D\uB3C4",
        "tau: \uAD00\uC808 \uD1A0\uD06C",
        "M(q): \uAD00\uC131\uD589\uB82C",
        "C(q,qdot): \uCF54\uB9AC\uC62C\uB9AC/\uC6D0\uC2EC \uD56D",
        "g(q): \uC911\uB825\uBCF4\uC0C1 \uD56D"
      ],
      principles: [
        "\uB3D9\uC5ED\uD559 \uAE30\uBCF8\uC2DD\uC740 M(q)qddot + C(q,qdot)qdot + g(q)=tau\uB2E4.",
        "trajectory\uB294 \uC704\uCE58\uBFD0 \uC544\uB2C8\uB77C \uC18D\uB3C4\uC640 \uAC00\uC18D\uB3C4 \uC5F0\uC18D\uC131\uC744 \uB9CC\uC871\uD574\uC57C actuator command\uAC00 \uBD80\uB4DC\uB7FD\uB2E4.",
        "PD \uC81C\uC5B4\uB294 feedback\uC73C\uB85C \uC624\uCC28\uB97C \uC904\uC774\uACE0 \uC911\uB825\uBCF4\uC0C1/feedforward\uB294 \uC608\uCE21 \uAC00\uB2A5\uD55C \uBD80\uD558\uB97C \uBBF8\uB9AC \uC0C1\uC1C4\uD55C\uB2E4.",
        "computed torque\uB294 \uBAA8\uB378 \uAE30\uBC18 feedforward\uC640 error dynamics \uC124\uACC4\uB97C \uACB0\uD569\uD55C\uB2E4."
      ],
      formulas: [
        formula("manipulator dynamics", "M(q) qddot + C(q,qdot) qdot + g(q) = tau", "\uB85C\uBD07\uD314 \uD1A0\uD06C\uC640 \uAC00\uC18D\uB3C4\uC758 \uAD00\uACC4."),
        formula("PD control", "tau = Kp(q_d-q) + Kd(qdot_d-qdot) + g(q)", "\uC624\uCC28 feedback\uACFC \uC911\uB825\uBCF4\uC0C1."),
        formula("quintic boundary", "s(t)=10 tau^3 - 15 tau^4 + 6 tau^5", "0\uC18D\uB3C4/0\uAC00\uC18D\uB3C4 \uC2DC\uC791\uACFC \uB05D\uC744 \uB9CC\uC871\uD558\uB294 normalized trajectory.")
      ],
      derivation: [
        "\uC6D0\uD558\uB294 \uAD00\uC808 \uACBD\uB85C q_d(t)\uB97C \uBA3C\uC800 \uC815\uD55C\uB2E4.",
        "quintic s(t)\uB294 s(0)=0, s(1)=1, s'(0)=s'(1)=0, s''(0)=s''(1)=0\uC744 \uB9CC\uC871\uD558\uB3C4\uB85D \uACC4\uC218\uB97C \uD47C\uB2E4.",
        "\uC81C\uC5B4 \uC624\uCC28 e=q_d-q, edot=qdot_d-qdot\uB97C \uB9CC\uB4E4\uACE0 Kp e + Kd edot\uB85C feedback torque\uB97C \uB9CC\uB4E0\uB2E4.",
        "\uD314\uC758 \uC790\uC138\uC5D0 \uB530\uB978 \uC911\uB825\uD56D g(q)\uB97C \uB354\uD558\uBA74 \uAC19\uC740 \uC624\uCC28\uC5D0\uC11C\uB3C4 \uB0B4\uB824\uAC00\uB294 \uBC29\uD5A5\uACFC \uC62C\uB77C\uAC00\uB294 \uBC29\uD5A5\uC758 \uD1A0\uD06C \uCC28\uC774\uB97C \uBCF4\uC0C1\uD55C\uB2E4."
      ],
      proof: [
        "quintic polynomial\uC740 6\uAC1C \uACC4\uC218\uC640 6\uAC1C \uACBD\uACC4\uC870\uAC74\uC744 \uAC00\uC9C0\uBBC0\uB85C \uC720\uC77C\uD55C \uACC4\uC218\uD574\uB97C \uAC16\uB294\uB2E4.",
        "\uB2E8\uC21C 1\uC790\uC720\uB3C4\uC5D0\uC11C e''+Kd e'+Kp e=0 \uD615\uD0DC\uAC00 \uB418\uBA74 Kp,Kd\uAC00 \uC591\uC218\uC77C \uB54C \uAC10\uC1E0\uC9C4\uB3D9 \uB610\uB294 \uACFC\uAC10\uC1E0\uB85C \uC624\uCC28\uAC00 \uC904\uC5B4\uB4E0\uB2E4.",
        "\uAD00\uC131\uD589\uB82C M(q)\uB294 \uBB3C\uB9AC\uC801\uC73C\uB85C \uC6B4\uB3D9\uC5D0\uB108\uC9C0\uC758 quadratic form\uC5D0\uC11C \uB098\uC624\uBBC0\uB85C \uB300\uCE6D \uC591\uC758 \uC815\uBD80\uD638 \uC131\uC9C8\uC744 \uAC16\uB294\uB2E4."
      ],
      workedExample: {
        prompt: "q_d=1.0, q=0.8, qdot_d=0, qdot=0.1, Kp=20, Kd=4, g(q)=2\uC77C \uB54C tau\uB294?",
        steps: ["e=0.2", "edot=-0.1", "feedback=20*0.2+4*(-0.1)=3.6", "tau=3.6+2=5.6"],
        result: "\uC911\uB825\uBCF4\uC0C1\uC744 \uB354\uD55C \uCD5C\uC885 \uD1A0\uD06C \uBA85\uB839\uC740 5.6\uC774\uB2E4."
      },
      implementationNotes: [
        "ros2_control controller\uB294 command interface, state interface, update rate\uAC00 \uC218\uC2DD\uC758 q/qdot/tau\uC640 \uB9DE\uC544\uC57C \uD55C\uB2E4.",
        "trajectory \uC2E4\uD589 \uC804 joint limit, velocity limit, acceleration limit\uC744 \uAC80\uC0AC\uD55C\uB2E4.",
        "\uC2E4\uD5D8 \uB85C\uADF8\uC5D0\uB294 desired, measured, error, command, saturation \uC5EC\uBD80\uB97C \uAC19\uC740 timestamp\uB85C \uC800\uC7A5\uD55C\uB2E4."
      ],
      engineeringMeaning: [
        "\uB3D9\uC5ED\uD559\uC744 \uC774\uD574\uD558\uBA74 \uD314\uC774 \uB290\uB9AC\uAC8C \uCC98\uC9C0\uB294 \uBB38\uC81C\uC640 planner \uACBD\uB85C \uBB38\uC81C\uB97C \uAD6C\uBD84\uD560 \uC218 \uC788\uB2E4.",
        "\uBD80\uB4DC\uB7EC\uC6B4 \uADA4\uC801\uC740 \uD558\uB4DC\uC6E8\uC5B4 \uC218\uBA85\uC744 \uB298\uB9AC\uACE0 controller saturation\uC744 \uC904\uC778\uB2E4."
      ],
      commonMistakes: [
        "\uC704\uCE58 \uBAA9\uD45C\uB9CC \uBD80\uB4DC\uB7EC\uC6B0\uBA74 \uB41C\uB2E4\uACE0 \uC0DD\uAC01\uD558\uACE0 \uC18D\uB3C4/\uAC00\uC18D\uB3C4 discontinuity\uB97C \uB193\uCE5C\uB2E4.",
        "Kp\uB9CC \uD0A4\uC6CC overshoot\uC640 \uC9C4\uB3D9\uC744 \uB9CC\uB4E0\uB2E4.",
        "\uBAA8\uB378 \uAE30\uBC18 \uBCF4\uC0C1 \uC5C6\uC774 \uC911\uB825 \uBC29\uD5A5 \uC790\uC138\uC5D0\uC11C \uC0DD\uAE30\uB294 steady-state error\uB97C controller \uD0D3\uC73C\uB85C\uB9CC \uBCF8\uB2E4."
      ],
      examTargets: ["\uB3D9\uC5ED\uD559 \uC2DD \uD574\uC11D", "quintic \uACBD\uACC4\uC870\uAC74", "PD+\uC911\uB825\uBCF4\uC0C1 \uACC4\uC0B0", "controller \uB85C\uADF8 \uC9C4\uB2E8"]
    };
  }
  if (id.includes("manipulator") || id.includes("dh-poe") || id.includes("forward-kinematics")) {
    return {
      subject: "\uB85C\uBD07\uD314 \uC6B4\uB3D9\uD559\uACFC \uC81C\uC5B4",
      coreQuestion: "\uAD00\uC808\uACF5\uAC04\uC758 \uC22B\uC790\uB97C \uC5B4\uB5BB\uAC8C \uB9D0\uB2E8 pose, \uC18D\uB3C4, \uADA4\uC801, \uC81C\uC5B4 \uBA85\uB839\uC73C\uB85C \uBC14\uAFC0 \uAC83\uC778\uAC00?",
      concept: "\uB85C\uBD07\uD314\uC740 \uB9C1\uD06C\uC640 \uC870\uC778\uD2B8\uAC00 \uB9CC\uB4E0 \uAE30\uD558\uD559\uC801 \uC0AC\uC2AC\uC774\uB2E4. FK\uB294 \uAD00\uC808\uAC12\uC5D0\uC11C \uB9D0\uB2E8 pose\uB97C \uACC4\uC0B0\uD558\uACE0, IK\uB294 \uC6D0\uD558\uB294 \uB9D0\uB2E8 pose\uB97C \uB9CC\uB4E4 \uAD00\uC808\uAC12\uC744 \uCC3E\uB294\uB2E4. trajectory\uB294 \uC2DC\uAC04\uC5D0 \uB530\uB77C \uAD00\uC808\uAC12\uC774 \uC5B4\uB5BB\uAC8C \uBCC0\uD574\uC57C \uBD80\uB4DC\uB7EC\uC6B4\uC9C0 \uC815\uD558\uACE0, \uC81C\uC5B4\uAE30\uB294 \uADF8 \uBAA9\uD45C\uB97C \uC2E4\uC81C actuator \uBA85\uB839\uC73C\uB85C \uBC14\uAFBC\uB2E4.",
      mentalModel: "\uB85C\uBD07\uD314\uC740 \uC811\uD788\uB294 \uC790\uB97C \uC5EC\uB7EC \uAC1C \uC774\uC5B4 \uBD99\uC778 \uAC83\uACFC \uAC19\uB2E4. \uAC01 \uB9C1\uD06C\uB294 \uC774\uC804 \uB9C1\uD06C \uC88C\uD45C\uACC4 \uC704\uC5D0 \uB193\uC774\uACE0, \uC804\uCCB4 \uB9D0\uB2E8 pose\uB294 \uC791\uC740 transform\uC744 \uC21C\uC11C\uB300\uB85C \uACF1\uD55C \uACB0\uACFC\uB2E4. \uC21C\uC11C\uAC00 \uD2C0\uB9AC\uBA74 \uC644\uC804\uD788 \uB2E4\uB978 \uC704\uCE58\uAC00 \uB098\uC628\uB2E4.",
      variables: [
        "q, qdot, qddot: \uAD00\uC808 \uC704\uCE58/\uC18D\uB3C4/\uAC00\uC18D\uB3C4",
        "l_i: \uB9C1\uD06C \uAE38\uC774 \uB610\uB294 DH parameter",
        "T_i: i\uBC88\uC9F8 \uB9C1\uD06C transform",
        "M(q), C(q,qdot), g(q): \uB3D9\uC5ED\uD559\uC758 \uAD00\uC131, \uCF54\uB9AC\uC62C\uB9AC/\uC6D0\uC2EC, \uC911\uB825\uD56D"
      ],
      principles: [
        "FK\uB294 transform chain T_0n=T_01 T_12 ... T_(n-1)n\uC774\uB2E4.",
        "2\uB9C1\uD06C \uD3C9\uBA74\uD314\uC740 \uBCA1\uD130\uD569\uC73C\uB85C FK\uB97C \uC27D\uAC8C \uC720\uB3C4\uD560 \uC218 \uC788\uB2E4.",
        "quintic trajectory\uB294 \uC704\uCE58, \uC18D\uB3C4, \uAC00\uC18D\uB3C4 \uACBD\uACC4\uC870\uAC74 6\uAC1C\uB97C \uB9CC\uC871\uD574 \uBD80\uB4DC\uB7FD\uAC8C \uCD9C\uBC1C/\uC815\uC9C0\uD55C\uB2E4.",
        "PD \uC81C\uC5B4\uB294 \uC624\uCC28\uC640 \uC624\uCC28 \uBCC0\uD654\uC728\uC744 \uC904\uC774\uACE0, feedforward\uB294 \uC608\uCE21 \uAC00\uB2A5\uD55C \uC911\uB825/\uB3D9\uC5ED\uD559 \uD56D\uC744 \uBBF8\uB9AC \uBCF4\uC0C1\uD55C\uB2E4."
      ],
      formulas: [
        formula("2-link FK x", "x = l1 cos(q1) + l2 cos(q1+q2)", "\uB450 \uB9C1\uD06C x\uC131\uBD84\uC758 \uD569."),
        formula("2-link FK y", "y = l1 sin(q1) + l2 sin(q1+q2)", "\uB450 \uB9C1\uD06C y\uC131\uBD84\uC758 \uD569."),
        formula("quintic blend", "s(t)=10 tau^3 - 15 tau^4 + 6 tau^5", "tau=t/T\uC5D0\uC11C 0\uC18D\uB3C4/0\uAC00\uC18D\uB3C4 \uACBD\uACC4\uC870\uAC74\uC744 \uB9CC\uC871.")
      ],
      derivation: [
        "\uCCAB \uB9C1\uD06C \uBCA1\uD130\uB294 base frame\uC5D0\uC11C [l1 cos(q1), l1 sin(q1)]\uC774\uB2E4.",
        "\uB450 \uBC88\uC9F8 \uB9C1\uD06C\uB294 \uCCAB \uB9C1\uD06C \uAE30\uC900 q2\uB9CC\uD07C \uB354 \uB3CC\uC544\uAC00\uBBC0\uB85C base \uAE30\uC900 \uAC01\uB3C4\uB294 q1+q2\uB2E4.",
        "\uB9D0\uB2E8 \uC704\uCE58\uB294 \uB450 \uB9C1\uD06C \uBCA1\uD130\uC758 \uD569\uC774\uB2E4.",
        "trajectory\uB294 q(t)=q0+(qf-q0)s(t)\uB85C \uB450\uACE0 s(0)=0, s(1)=1, s'(0)=s'(1)=0, s''(0)=s''(1)=0\uC744 \uB9CC\uC871\uD558\uAC8C \uACC4\uC218\uB97C \uD47C\uB2E4."
      ],
      proof: [
        "\uB9C1\uD06C \uBCA1\uD130\uB97C \uAC19\uC740 base frame\uC73C\uB85C \uD45C\uD604\uD588\uAE30 \uB54C\uBB38\uC5D0 \uBCA1\uD130\uD569\uC774 \uAC00\uB2A5\uD558\uB2E4.",
        "\uD68C\uC804\uC740 \uAE38\uC774\uB97C \uBCF4\uC874\uD558\uBBC0\uB85C \uAC01 \uB9C1\uD06C \uAE38\uC774\uB294 \uBCC0\uD558\uC9C0 \uC54A\uACE0 \uBC29\uD5A5\uB9CC q\uB85C \uBC14\uB010\uB2E4.",
        "quintic polynomial\uC740 6\uAC1C \uACC4\uC218\uB97C \uAC16\uACE0 \uACBD\uACC4\uC870\uAC74 6\uAC1C\uB97C \uC815\uD655\uD788 \uB9CC\uC871\uD560 \uC218 \uC788\uB2E4."
      ],
      workedExample: {
        prompt: "l1=1, l2=0.7, q1=30\uB3C4, q2=60\uB3C4\uC77C \uB54C \uB9D0\uB2E8 \uC704\uCE58\uB97C \uAD6C\uD558\uB77C.",
        steps: ["q1+q2=90\uB3C4", "x=1*cos30+0.7*cos90=0.866", "y=1*sin30+0.7*sin90=1.2"],
        result: "\uB9D0\uB2E8\uC740 (0.866, 1.2)\uC5D0 \uC788\uACE0, \uC774 \uAC12\uC740 FK \uC2DC\uAC01\uD654\uC5D0\uC11C \uBC14\uB85C \uD655\uC778\uD560 \uC218 \uC788\uB2E4."
      },
      implementationNotes: [
        "URDF joint origin\uACFC \uC218\uC2DD\uC758 frame convention\uC774 \uAC19\uC740\uC9C0 \uD655\uC778\uD55C\uB2E4.",
        "MoveIt planning \uC2E4\uD328\uB294 collision, joint limit, start state, goal tolerance\uB85C \uB098\uB220 \uBCF8\uB2E4.",
        "ros2_control\uC5D0\uC11C\uB294 controller update rate\uC640 command interface\uAC00 \uC2E4\uC81C \uC81C\uC5B4 \uD488\uC9C8\uC5D0 \uC9C1\uC811 \uC601\uD5A5\uC744 \uC900\uB2E4."
      ],
      engineeringMeaning: [
        "\uC6B4\uB3D9\uD559\uC744 \uC774\uD574\uD558\uBA74 planner\uAC00 \uB0B8 \uADA4\uC801\uC744 RViz\uC5D0\uC11C \uBCF4\uB294 \uB370\uC11C \uBA48\uCD94\uC9C0 \uC54A\uACE0 \uC65C \uADF8\uB7F0 \uACBD\uB85C\uAC00 \uB098\uC654\uB294\uC9C0 \uD574\uC11D\uD560 \uC218 \uC788\uB2E4.",
        "\uD558\uB4DC\uC6E8\uC5B4 \uC2E4\uD5D8 \uC804 trajectory\uC640 \uC81C\uD55C\uC744 \uD655\uC778\uD558\uB294 \uAC83\uC740 \uBAA8\uD130 \uACFC\uBD80\uD558\uC640 \uCDA9\uB3CC \uC704\uD5D8\uC744 \uC904\uC778\uB2E4."
      ],
      commonMistakes: [
        "FK transform \uACF1\uC148 \uC21C\uC11C\uB97C \uBC14\uAFBC\uB2E4.",
        "IK\uC5D0\uC11C reachable check \uC5C6\uC774 acos\uC5D0 1\uBCF4\uB2E4 \uD070 \uAC12\uC744 \uB123\uB294\uB2E4.",
        "trajectory\uAC00 \uC704\uCE58\uB9CC \uB9DE\uC73C\uBA74 \uB41C\uB2E4\uACE0 \uC0DD\uAC01\uD558\uACE0 \uC18D\uB3C4/\uAC00\uC18D\uB3C4 \uBD88\uC5F0\uC18D\uC744 \uB193\uCE5C\uB2E4."
      ],
      examTargets: ["FK \uBCA1\uD130\uD569", "IK reachable \uC870\uAC74", "trajectory \uACBD\uACC4\uC870\uAC74", "MoveIt \uC2E4\uD328 \uC6D0\uC778 \uBD84\uD574"]
    };
  }
  if (id.includes("ros2") || id.includes("cpp") || id.includes("python") || id.includes("experiment") || id.includes("logging") || id.includes("source-map") || id.includes("doc-reading") || id.includes("final-loop")) {
    return {
      subject: "ROS 2 \uC2DC\uC2A4\uD15C\uACF5\uD559\uACFC \uC2E4\uD5D8 \uC7AC\uD604\uC131",
      coreQuestion: "\uC54C\uACE0\uB9AC\uC998\uC744 ROS 2 \uB178\uB4DC, \uBA54\uC2DC\uC9C0, \uD30C\uB77C\uBBF8\uD130, \uB85C\uADF8, \uBE4C\uB4DC \uAD6C\uC870\uB85C \uC5B4\uB5BB\uAC8C \uC7AC\uD604 \uAC00\uB2A5\uD558\uAC8C \uB9CC\uB4E4 \uAC83\uC778\uAC00?",
      concept: "ROS 2\uB294 \uB2E8\uC21C\uD55C \uC2E4\uD589 \uB3C4\uAD6C\uAC00 \uC544\uB2C8\uB77C \uBD84\uC0B0 \uC2DC\uC2A4\uD15C\uC758 \uACC4\uC57D\uC744 \uC815\uD558\uB294 \uD504\uB808\uC784\uC6CC\uD06C\uB2E4. topic\uC740 \uB370\uC774\uD130 \uD750\uB984, service/action\uC740 \uC694\uCCAD-\uC751\uB2F5\uACFC \uC7A5\uAE30 \uC791\uC5C5, tf2\uB294 \uC2DC\uAC04 stamped frame graph, parameter\uB294 \uC2E4\uD5D8 \uC870\uAC74, launch\uB294 \uC2E4\uD589 \uC870\uD569\uC744 \uC758\uBBF8\uD55C\uB2E4. \uC7AC\uD604 \uAC00\uB2A5\uD55C \uD559\uC2B5\uC740 \uCF54\uB4DC\uC640 \uD568\uAED8 \uC785\uB825 \uB370\uC774\uD130, \uD30C\uB77C\uBBF8\uD130, \uBC84\uC804, \uB85C\uADF8\uB97C \uB0A8\uAE30\uB294 \uC77C\uC774\uB2E4.",
      mentalModel: "\uD558\uB098\uC758 \uB85C\uBD07 \uD504\uB85C\uADF8\uB7A8\uC740 \uC5EC\uB7EC \uC5F0\uAD6C\uC790\uAC00 \uB3D9\uC2DC\uC5D0 \uC4F0\uB294 \uC2E4\uD5D8 \uC7A5\uCE58\uC640 \uAC19\uB2E4. \uBA54\uC2DC\uC9C0 \uC774\uB984, frame \uC774\uB984, QoS, launch argument\uAC00 \uC870\uAE08\uB9CC \uB2EC\uB77C\uB3C4 \uB2E4\uB978 \uC2E4\uD5D8\uC774 \uB41C\uB2E4. \uADF8\uB798\uC11C ROS 2 \uC2DC\uC2A4\uD15C\uC740 \uC54C\uACE0\uB9AC\uC998\uBCF4\uB2E4 \uACC4\uC57D \uAD00\uB9AC\uAC00 \uBA3C\uC800\uB2E4.",
      variables: [
        "node: \uACC4\uC0B0 \uCC45\uC784\uC744 \uAC00\uC9C4 process \uB610\uB294 component",
        "topic: \uC2DC\uAC04\uC5D0 \uB530\uB77C \uD750\uB974\uB294 message stream",
        "QoS: reliability, durability, history \uAC19\uC740 \uD1B5\uC2E0 \uC815\uCC45",
        "launch/param: \uC2E4\uD589 \uAD6C\uC131\uACFC \uC2E4\uD5D8 \uC870\uAC74"
      ],
      principles: [
        "package \uAD6C\uC870\uB294 build, dependency, test, launch\uB97C \uBD84\uB9AC\uD574 \uBC18\uBCF5 \uC2E4\uD5D8\uC744 \uBE60\uB974\uAC8C \uB9CC\uB4E0\uB2E4.",
        "tf2\uB294 frame \uAD00\uACC4\uC640 timestamp\uB97C \uAC19\uC774 \uAD00\uB9AC\uD558\uBBC0\uB85C \uCD5C\uC2E0 transform\uC778\uC9C0 \uD655\uC778\uD574\uC57C \uD55C\uB2E4.",
        "QoS mismatch\uB294 \uCF54\uB4DC\uAC00 \uB9DE\uC544\uB3C4 \uBA54\uC2DC\uC9C0\uAC00 \uC548 \uBCF4\uC774\uB294 \uB300\uD45C \uC6D0\uC778\uC774\uB2E4.",
        "rosbag2\uC640 parameter snapshot\uC740 \uC2E4\uD5D8 \uC7AC\uD604\uC131\uC758 \uCD5C\uC18C \uC99D\uAC70\uB2E4."
      ],
      formulas: [
        formula("experiment record", "run = code_version + params + bag + metrics", "\uC7AC\uD604 \uAC00\uB2A5\uD55C \uC2E4\uD5D8\uC758 \uCD5C\uC18C \uAD6C\uC131."),
        formula("topic rate", "hz = messages / seconds", "\uC13C\uC11C\uC640 \uBA85\uB839 topic\uC758 \uC2E4\uC81C \uC8FC\uAE30."),
        formula("latency", "latency = t_output - t_input", "pipeline \uC9C0\uC5F0\uC2DC\uAC04.")
      ],
      derivation: [
        "\uC54C\uACE0\uB9AC\uC998 \uD568\uC218\uB97C library\uB85C \uBD84\uB9AC\uD558\uACE0 node\uB294 ROS 2 \uC785\uCD9C\uB825 \uBCC0\uD658\uC744 \uB2F4\uB2F9\uD558\uAC8C \uD55C\uB2E4.",
        "launch \uD30C\uC77C\uC740 \uC5B4\uB5A4 node\uC640 parameter\uAC00 \uD568\uAED8 \uC2E4\uD589\uB418\uB294\uC9C0 \uC120\uC5B8\uD55C\uB2E4.",
        "\uC2E4\uD5D8 \uC2DC\uC791 \uC2DC git commit, parameter YAML, rosbag topic \uBAA9\uB85D\uC744 \uC800\uC7A5\uD55C\uB2E4.",
        "\uC2E4\uD5D8 \uD6C4 metric CSV\uC640 \uADF8\uB798\uD504\uB97C \uB9CC\uB4E4\uC5B4 \uAC19\uC740 \uC785\uB825\uC5D0\uC11C \uB2E4\uC74C \uBCC0\uACBD\uACFC \uBE44\uAD50\uD55C\uB2E4."
      ],
      proof: [
        "\uAC19\uC740 code version, \uAC19\uC740 parameter, \uAC19\uC740 rosbag input\uC744 \uC0AC\uC6A9\uD558\uBA74 \uC54C\uACE0\uB9AC\uC998 \uBCC0\uACBD\uC758 \uC601\uD5A5\uC744 \uBD84\uB9AC\uD574\uC11C \uBE44\uAD50\uD560 \uC218 \uC788\uB2E4.",
        "topic \uC8FC\uAE30\uC640 latency\uB97C \uAE30\uB85D\uD558\uBA74 \uC131\uB2A5 \uBCC0\uD654\uAC00 \uC54C\uACE0\uB9AC\uC998 \uD488\uC9C8\uC778\uC9C0 \uC2DC\uC2A4\uD15C \uC9C0\uC5F0\uC778\uC9C0 \uAD6C\uBD84\uD560 \uADFC\uAC70\uAC00 \uC0DD\uAE34\uB2E4."
      ],
      workedExample: {
        prompt: "\uCD94\uB860 \uB178\uB4DC\uAC00 \uB290\uB824\uC84C\uB2E4. \uC7AC\uD604\uC744 \uC704\uD574 \uB0A8\uAE38 4\uAC00\uC9C0\uB294?",
        steps: ["git commit hash", "parameter YAML", "\uC785\uB825 rosbag2", "preprocess/inference/postprocess latency metric"],
        result: "\uC774 \uB124 \uAC00\uC9C0\uAC00 \uC788\uC5B4\uC57C \uB2E4\uC74C \uC2E4\uD589\uC5D0\uC11C \uAC19\uC740 \uC870\uAC74\uC744 \uB9CC\uB4E4\uACE0 \uBCD1\uBAA9\uC744 \uBE44\uAD50\uD560 \uC218 \uC788\uB2E4."
      },
      implementationNotes: [
        "colcon build --packages-select\uB85C \uBCC0\uACBD\uD55C \uD328\uD0A4\uC9C0\uB9CC \uBE60\uB974\uAC8C \uBE4C\uB4DC\uD55C\uB2E4.",
        "ros2 launch ... --show-args\uB85C \uC2E4\uD5D8 \uD30C\uB77C\uBBF8\uD130\uB97C \uD655\uC778\uD558\uACE0 \uAE30\uBCF8\uAC12\uC744 \uB178\uD2B8\uC5D0 \uB0A8\uAE34\uB2E4.",
        "ros2 topic hz/echo\uC640 tf2_tools view_frames\uB85C \uB370\uC774\uD130 \uD750\uB984\uACFC frame graph\uB97C \uBA3C\uC800 \uAC80\uC99D\uD55C\uB2E4."
      ],
      engineeringMeaning: [
        "\uC88B\uC740 \uC54C\uACE0\uB9AC\uC998\uB3C4 ROS 2 \uACC4\uC57D\uC774 \uD754\uB4E4\uB9AC\uBA74 \uC2DC\uC2A4\uD15C\uC5D0\uC11C\uB294 \uC2E4\uD328\uD55C\uB2E4.",
        "\uC7AC\uD604\uC131\uC740 \uB17C\uBB38\uC2DD \uD615\uC2DD\uC774 \uC544\uB2C8\uB77C \uB514\uBC84\uAE45 \uC2DC\uAC04\uC744 \uC904\uC774\uB294 \uC2E4\uC804 \uAE30\uC220\uC774\uB2E4."
      ],
      commonMistakes: [
        "\uB178\uB4DC \uC548\uC5D0 \uC54C\uACE0\uB9AC\uC998\uACFC ROS 2 \uC785\uCD9C\uB825\uC744 \uBAA8\uB450 \uC11E\uC5B4 \uD14C\uC2A4\uD2B8\uD558\uAE30 \uC5B4\uB835\uAC8C \uB9CC\uB4E0\uB2E4.",
        "parameter\uB97C \uBC14\uAFE8\uC9C0\uB9CC \uC5B4\uB5A4 \uAC12\uC73C\uB85C \uC2E4\uD5D8\uD588\uB294\uC9C0 \uAE30\uB85D\uD558\uC9C0 \uC54A\uB294\uB2E4.",
        "QoS\uC640 timestamp\uB97C \uD655\uC778\uD558\uC9C0 \uC54A\uACE0 subscriber \uCF5C\uBC31\uC774 \uC548 \uB3C8\uB2E4\uACE0 \uCF54\uB4DC\uB9CC \uACE0\uCE5C\uB2E4."
      ],
      examTargets: ["ROS 2 \uD1B5\uC2E0 \uACC4\uC57D", "QoS/tf2 \uB514\uBC84\uAE45", "\uC2E4\uD5D8 \uC7AC\uD604\uC131 \uAD6C\uC131", "latency/topic hz \uACC4\uC0B0"]
    };
  }
  if (id.includes("mobile") || id.includes("pure") || id.includes("astar") || id.includes("costmap")) {
    return {
      subject: "\uBAA8\uBC14\uC77C \uB85C\uBD07 \uC704\uCE58\uCD94\uC815\xB7\uACC4\uD68D\xB7\uC81C\uC5B4",
      coreQuestion: "\uB85C\uBD07\uC774 \uC9C0\uAE08 \uC5B4\uB514 \uC788\uACE0, \uC5B4\uB514\uB85C \uAC08 \uC218 \uC788\uC73C\uBA70, \uB2E4\uC74C \uC18D\uB3C4 \uBA85\uB839\uC740 \uBB34\uC5C7\uC778\uAC00?",
      concept: "\uBAA8\uBC14\uC77C \uB85C\uBD07\uC740 pose\uB97C \uC2DC\uAC04\uC5D0 \uB530\uB77C \uC801\uBD84\uD558\uBA74\uC11C \uC6C0\uC9C1\uC778\uB2E4. localization\uC740 odometry drift\uB97C \uC13C\uC11C \uAD00\uCE21\uC73C\uB85C \uC904\uC774\uACE0, costmap\uC740 \uC8FC\uBCC0 \uACF5\uAC04\uC744 \uD1B5\uACFC \uAC00\uB2A5/\uC704\uD5D8/\uC7A5\uC560\uBB3C \uC601\uC5ED\uC73C\uB85C \uD45C\uD604\uD55C\uB2E4. global planner\uB294 \uD070 \uAE38\uC744 \uCC3E\uACE0, local controller\uB294 \uD604\uC7AC \uC18D\uB3C4 \uC81C\uD55C\uACFC \uC7A5\uC560\uBB3C \uC0C1\uD669\uC5D0\uC11C \uC548\uC804\uD55C \uBA85\uB839\uC744 \uB9CC\uB4E0\uB2E4.",
      mentalModel: "\uC790\uC728\uC8FC\uD589\uC740 \uC9C0\uB3C4 \uC704\uC5D0 \uC120\uC744 \uAE0B\uB294 \uBB38\uC81C \uD558\uB098\uAC00 \uC544\uB2C8\uB77C, '\uB0B4 \uC704\uCE58 \uCD94\uC815', '\uAC08 \uC218 \uC788\uB294 \uACF5\uAC04 \uACC4\uC0B0', '\uBAA9\uD45C\uAE4C\uC9C0\uC758 \uACBD\uB85C', '\uC9C0\uAE08 \uB2F9\uC7A5 \uB0BC \uC18D\uB3C4'\uAC00 \uB9E4 \uC8FC\uAE30 \uC774\uC5B4\uC9C0\uB294 \uD3D0\uB8E8\uD504 \uC2DC\uC2A4\uD15C\uC774\uB2E4.",
      variables: [
        "x,y,theta: 2D pose",
        "vl, vr, b: \uC67C\uCABD/\uC624\uB978\uCABD \uBC14\uD034 \uC18D\uB3C4\uC640 wheel base",
        "P, Q, R: \uC0C1\uD0DC \uACF5\uBD84\uC0B0, process noise, measurement noise",
        "g(n), h(n), f(n): A*\uC758 \uB204\uC801\uBE44\uC6A9, heuristic, \uCD1D \uBE44\uC6A9"
      ],
      principles: [
        "\uCC28\uB3D9\uAD6C\uB3D9\uC758 \uC120\uC18D\uB3C4\uB294 \uC88C\uC6B0 \uBC14\uD034 \uD3C9\uADE0, \uAC01\uC18D\uB3C4\uB294 \uC18D\uB3C4 \uCC28\uC774\uB97C wheel base\uB85C \uB098\uB208 \uAC12\uC774\uB2E4.",
        "EKF\uB294 prediction\uC73C\uB85C \uBD88\uD655\uC2E4\uC131\uC774 \uCEE4\uC9C0\uACE0 measurement update\uB85C \uC904\uC5B4\uB4DC\uB294 \uBC18\uBCF5 \uAD6C\uC870\uB2E4.",
        "A*\uB294 admissible heuristic\uC744 \uC4F0\uBA74 \uCD5C\uB2E8 \uACBD\uB85C\uC131\uC744 \uC720\uC9C0\uD55C\uB2E4.",
        "Pure Pursuit\uB294 lookahead target\uC744 \uD5A5\uD55C \uC6D0\uD638 \uACE1\uB960\uC744 \uACC4\uC0B0\uD55C\uB2E4."
      ],
      formulas: [
        formula("differential drive", "v=(vr+vl)/2, omega=(vr-vl)/b", "\uBC14\uD034 \uC18D\uB3C4\uC5D0\uC11C body twist\uB97C \uACC4\uC0B0."),
        formula("EKF prediction", "P' = F P F^T + Q", "\uC120\uD615\uD654\uB41C \uBAA8\uB378\uB85C \uACF5\uBD84\uC0B0\uC744 \uC608\uCE21."),
        formula("A* score", "f(n)=g(n)+h(n)", "\uB204\uC801 \uBE44\uC6A9\uACFC \uD734\uB9AC\uC2A4\uD2F1\uC758 \uD569."),
        formula("Pure Pursuit curvature", "kappa = 2 y / Ld^2", "\uB85C\uBD07 \uC88C\uD45C\uACC4 lookahead target y\uC5D0\uC11C \uACE1\uB960 \uACC4\uC0B0.")
      ],
      derivation: [
        "\uC88C\uC6B0 \uBC14\uD034 \uC774\uB3D9\uAC70\uB9AC dl=vl dt, dr=vr dt\uB97C \uB454\uB2E4.",
        "\uC911\uC2EC \uC774\uB3D9\uAC70\uB9AC\uB294 (dl+dr)/2\uC774\uACE0 heading \uBCC0\uD654\uB294 (dr-dl)/b\uB2E4.",
        "body frame \uC804\uC9C4\uC18D\uB3C4\uB97C world frame\uC73C\uB85C \uD68C\uC804\uD558\uBA74 dx=v cos(theta)dt, dy=v sin(theta)dt\uAC00 \uB41C\uB2E4.",
        "Pure Pursuit\uB294 \uB85C\uBD07\uACFC lookahead point\uB97C \uC787\uB294 \uC6D0\uD638\uB97C \uAC00\uC815\uD558\uACE0 \uAE30\uD558\uC801\uC73C\uB85C kappa=2y/Ld^2\uB97C \uC5BB\uB294\uB2E4."
      ],
      proof: [
        "\uBC14\uD034\uAC00 \uBBF8\uB044\uB7EC\uC9C0\uC9C0 \uC54A\uB294\uB2E4\uBA74 \uC591\uCABD \uBC14\uD034\uAC00 \uB9CC\uB4E0 \uD638\uC758 \uAE38\uC774 \uCC28\uC774\uAC00 \uD68C\uC804\uAC01\uC744 \uACB0\uC815\uD55C\uB2E4.",
        "A*\uC5D0\uC11C h\uAC00 \uC2E4\uC81C \uB0A8\uC740 \uBE44\uC6A9\uBCF4\uB2E4 \uD06C\uC9C0 \uC54A\uC73C\uBA74 \uCD5C\uC801 \uD6C4\uBCF4\uB97C f-cost\uC5D0\uC11C \uBD80\uB2F9\uD558\uAC8C \uC81C\uC678\uD558\uC9C0 \uC54A\uB294\uB2E4.",
        "EKF covariance \uC2DD\uC740 \uC120\uD615 \uBCC0\uD658 AX\uC758 \uACF5\uBD84\uC0B0\uC774 A Sigma A^T\uAC00 \uB41C\uB2E4\uB294 \uC131\uC9C8\uC5D0\uC11C \uB098\uC628\uB2E4."
      ],
      workedExample: {
        prompt: "vl=0.2, vr=0.6, b=0.5\uC77C \uB54C omega\uB97C \uAD6C\uD558\uB77C.",
        steps: ["\uC18D\uB3C4 \uCC28\uC774\uB294 0.4", "wheel base 0.5\uB85C \uB098\uB208\uB2E4", "omega=0.8 rad/s"],
        result: "\uC624\uB978\uCABD \uBC14\uD034\uAC00 \uB354 \uBE60\uB974\uBBC0\uB85C \uB85C\uBD07\uC740 \uC67C\uCABD\uC73C\uB85C \uD68C\uC804\uD55C\uB2E4."
      },
      implementationNotes: [
        "Nav2 \uB514\uBC84\uAE45\uC740 map/odom/base_link frame, costmap, planner, controller\uB97C \uBD84\uB9AC\uD574\uC11C \uBCF8\uB2E4.",
        "rosbag2\uC5D0\uB294 /tf, /odom, /cmd_vel, /scan \uAC19\uC740 \uC7AC\uD604 \uD544\uC218 topic\uC744 \uAE30\uB85D\uD55C\uB2E4.",
        "parameter\uB97C \uBC14\uAFC0 \uB54C\uB294 tracking error, collision, latency, recovery count\uB97C \uD568\uAED8 \uAE30\uB85D\uD55C\uB2E4."
      ],
      engineeringMeaning: [
        "lookahead\uB97C \uD0A4\uC6B0\uBA74 \uACE1\uB960\uC774 \uC791\uC544\uC838 \uBD80\uB4DC\uB7FD\uC9C0\uB9CC \uCF54\uB108 \uBC18\uC751\uC740 \uB2A6\uC5B4\uC9C4\uB2E4.",
        "costmap inflation\uC774 \uD06C\uBA74 \uC548\uC804 \uC5EC\uC720\uAC00 \uCEE4\uC9C0\uC9C0\uB9CC \uC881\uC740 \uD1B5\uB85C\uB97C \uBABB \uC9C0\uB098\uAC08 \uC218 \uC788\uB2E4."
      ],
      commonMistakes: [
        "odom frame\uACFC map frame\uC758 \uC5ED\uD560\uC744 \uD63C\uB3D9\uD55C\uB2E4.",
        "local planner \uBB38\uC81C\uB97C global planner \uBB38\uC81C\uB85C \uCC29\uAC01\uD55C\uB2E4.",
        "heuristic\uC774 admissible\uD574\uC57C \uD55C\uB2E4\uB294 \uC870\uAC74\uC744 \uBE7C\uACE0 A* \uCD5C\uC801\uC131\uC744 \uC124\uBA85\uD55C\uB2E4."
      ],
      examTargets: ["odometry \uC218\uCE58\uACC4\uC0B0", "EKF covariance \uC2DD", "A* admissibility", "Pure Pursuit \uACE1\uB960 \uBCC0\uD654 \uD574\uC11D"]
    };
  }
  if (id.includes("ai")) {
    return {
      subject: "AI \uD559\uC2B5\xB7\uD3C9\uAC00\xB7\uBC30\uD3EC",
      coreQuestion: "\uC13C\uC11C \uB370\uC774\uD130\uB97C \uBAA8\uB378 \uC785\uB825 \uD150\uC11C\uB85C \uBC14\uAFB8\uACE0, \uADF8 \uCD9C\uB825\uC774 \uB85C\uBD07 \uC758\uC0AC\uACB0\uC815\uC5D0 \uCDA9\uBD84\uD788 \uBBFF\uC744 \uB9CC\uD55C\uC9C0 \uC5B4\uB5BB\uAC8C \uAC80\uC99D\uD560 \uAC83\uC778\uAC00?",
      concept: "\uB85C\uBD07 AI\uB294 \uBAA8\uB378 \uAD6C\uC870\uB9CC\uC758 \uBB38\uC81C\uAC00 \uC544\uB2C8\uB2E4. \uB370\uC774\uD130 \uBD84\uD560, \uC804\uCC98\uB9AC, loss, metric, export, runtime, latency\uAC00 \uBAA8\uB450 \uC5F0\uACB0\uB418\uC5B4\uC57C \uD55C\uB2E4. \uD559\uC2B5 \uB54C\uC758 Python \uACB0\uACFC\uC640 \uBC30\uD3EC \uB54C\uC758 C++ ONNX Runtime \uACB0\uACFC\uAC00 \uAC19\uC740 \uC785\uB825\uC5D0\uC11C \uAC19\uC740 \uC758\uBBF8\uB97C \uB0B4\uC57C \uC2E4\uC81C \uC2DC\uC2A4\uD15C\uC5D0 \uB123\uC744 \uC218 \uC788\uB2E4.",
      mentalModel: "AI pipeline\uC740 \uBB3C\uB958 \uB77C\uC778\uACFC \uAC19\uB2E4. \uC774\uBBF8\uC9C0\uAC00 resize, color conversion, normalization, tensor shape \uBCC0\uD658\uC744 \uAC70\uCCD0 \uBAA8\uB378\uC5D0 \uB4E4\uC5B4\uAC00\uACE0, \uCD9C\uB825\uC740 threshold\uC640 postprocess\uB97C \uAC70\uCCD0 ROS 2 \uBA54\uC2DC\uC9C0\uAC00 \uB41C\uB2E4. \uC5B4\uB290 \uD55C \uB2E8\uACC4\uAC00 \uD559\uC2B5 \uB54C\uC640 \uB2E4\uB974\uBA74 \uC804\uCCB4 \uACB0\uACFC\uAC00 \uBC14\uB010\uB2E4.",
      variables: [
        "x: \uC785\uB825 tensor",
        "y: \uC815\uB2F5 label \uB610\uB294 target",
        "p_i: \uBAA8\uB378\uC774 \uC608\uCE21\uD55C class \uD655\uB960",
        "TP, FP, FN, TN: confusion matrix \uC6D0\uC18C"
      ],
      principles: [
        "cross entropy\uB294 \uC815\uB2F5 class \uD655\uB960\uC774 \uC791\uC744\uC218\uB85D \uD070 loss\uB97C \uC900\uB2E4.",
        "accuracy\uB294 class imbalance\uC5D0\uC11C \uC704\uD5D8\uC744 \uC228\uAE38 \uC218 \uC788\uC5B4 precision/recall/F1\uC744 \uD568\uAED8 \uBD10\uC57C \uD55C\uB2E4.",
        "ONNX export \uD6C4\uC5D0\uB294 input/output name, shape, dtype, normalization \uACC4\uC57D\uC744 \uACE0\uC815\uD574\uC57C \uD55C\uB2E4.",
        "\uB85C\uBD07\uC5D0\uC11C\uB294 \uC815\uD655\uB3C4\uBFD0 \uC544\uB2C8\uB77C latency\uC640 failure mode\uAC00 \uBC30\uD3EC \uAC00\uB2A5\uC131\uC744 \uACB0\uC815\uD55C\uB2E4."
      ],
      formulas: [
        formula("cross entropy", "L=-sum_i y_i log(p_i)", "\uC815\uB2F5 class \uD655\uB960\uC758 \uC74C\uC758 \uB85C\uADF8\uC6B0\uB3C4."),
        formula("precision", "TP/(TP+FP)", "positive \uC608\uCE21\uC758 \uC21C\uB3C4."),
        formula("recall", "TP/(TP+FN)", "\uC2E4\uC81C positive \uD68C\uC218\uC728."),
        formula("F1", "2 P R/(P+R)", "precision\uACFC recall\uC758 \uC870\uD654\uD3C9\uADE0.")
      ],
      derivation: [
        "one-hot y\uC5D0\uC11C\uB294 \uC815\uB2F5 class \uD56D\uB9CC \uB0A8\uC544 L=-log(p_correct)\uAC00 \uB41C\uB2E4.",
        "precision\uC740 \uC608\uCE21 positive \uC9D1\uD569 \uC911 \uC2E4\uC81C positive \uBE44\uC728\uC774\uBBC0\uB85C \uBD84\uBAA8\uAC00 TP+FP\uB2E4.",
        "recall\uC740 \uC2E4\uC81C positive \uC9D1\uD569 \uC911 \uCC3E\uC544\uB0B8 \uBE44\uC728\uC774\uBBC0\uB85C \uBD84\uBAA8\uAC00 TP+FN\uC774\uB2E4.",
        "F1\uC740 \uB450 \uBE44\uC728 \uC911 \uD558\uB098\uAC00 \uB0AE\uC744 \uB54C \uD568\uAED8 \uB0AE\uC544\uC9C0\uB3C4\uB85D \uC870\uD654\uD3C9\uADE0\uC744 \uC4F4\uB2E4."
      ],
      proof: [
        "-log(p)\uB294 p\uAC00 1\uC5D0 \uAC00\uAE4C\uC6B0\uBA74 0\uC5D0 \uAC00\uAE4C\uC6CC\uC9C0\uACE0 p\uAC00 0\uC5D0 \uAC00\uAE4C\uC6B0\uBA74 \uCEE4\uC9C4\uB2E4.",
        "\uB530\uB77C\uC11C cross entropy \uCD5C\uC18C\uD654\uB294 \uC815\uB2F5 class \uD655\uB960\uC744 \uD0A4\uC6B0\uB294 \uBC29\uD5A5\uC758 \uD559\uC2B5\uACFC \uC77C\uCE58\uD55C\uB2E4.",
        "\uC870\uD654\uD3C9\uADE0\uC740 \uC0B0\uC220\uD3C9\uADE0\uBCF4\uB2E4 \uC791\uC740 \uAC12\uC5D0 \uBBFC\uAC10\uD558\uBBC0\uB85C precision/recall \uBD88\uADE0\uD615\uC744 \uC798 \uB4DC\uB7EC\uB0B8\uB2E4."
      ],
      workedExample: {
        prompt: "TP=45, FP=5, FN=15\uC77C \uB54C precision, recall, F1\uC744 \uACC4\uC0B0\uD558\uB77C.",
        steps: ["precision=45/(45+5)=0.9", "recall=45/(45+15)=0.75", "F1=2*0.9*0.75/(1.65)=0.818"],
        result: "\uC815\uD655\uB3C4 \uD558\uB098\uBCF4\uB2E4 \uC5B4\uB5A4 \uC624\uB958\uAC00 \uB9CE\uC740\uC9C0 \uB354 \uC798 \uBCF4\uC778\uB2E4."
      },
      implementationNotes: [
        "OpenCV\uB294 BGR, \uB9CE\uC740 \uD559\uC2B5 \uCF54\uB4DC\uB294 RGB\uB97C \uC4F0\uBBC0\uB85C channel order\uB97C \uBC18\uB4DC\uC2DC \uD655\uC778\uD55C\uB2E4.",
        "ONNX Runtime C++\uC5D0\uC11C\uB294 input tensor memory layout\uACFC dtype\uC744 \uBA85\uC2DC\uC801\uC73C\uB85C \uB9DE\uCD98\uB2E4.",
        "latency\uB294 preprocess, inference, postprocess\uB85C \uCABC\uAC1C \uB85C\uADF8\uB97C \uB0A8\uAE34\uB2E4."
      ],
      engineeringMeaning: [
        "false negative\uAC00 \uC704\uD5D8\uD55C \uAC80\uCD9C \uBB38\uC81C\uC5D0\uC11C\uB294 recall\uC774 \uC548\uC804\uC131 \uC9C0\uD45C\uAC00 \uB41C\uB2E4.",
        "\uBC30\uD3EC \uD6C4 output shape\uC774 \uC774\uC0C1\uD558\uBA74 \uBAA8\uB378 head\uAC00 \uC544\uB2CC \uC911\uAC04 feature\uAC00 export\uB410\uB294\uC9C0 \uD655\uC778\uD55C\uB2E4."
      ],
      commonMistakes: [
        "train/validation/test split\uC744 \uC11E\uC5B4 \uC131\uB2A5\uC744 \uACFC\uB300\uD3C9\uAC00\uD55C\uB2E4.",
        "\uD559\uC2B5\uACFC \uBC30\uD3EC\uC5D0\uC11C normalization mean/std\uAC00 \uB2E4\uB974\uB2E4.",
        "ONNX output shape\uB9CC \uBCF4\uACE0 postprocess \uACC4\uC57D\uC744 \uD655\uC778\uD558\uC9C0 \uC54A\uB294\uB2E4."
      ],
      examTargets: ["cross entropy \uC758\uBBF8", "metric \uACC4\uC0B0", "\uC804\uCC98\uB9AC \uACC4\uC57D", "ONNX shape \uBB38\uC81C \uC9C4\uB2E8"]
    };
  }
  if (id.includes("llm")) {
    return {
      subject: "LLM prompt\xB7retrieval\xB7evaluation harness",
      coreQuestion: "\uC5B8\uC5B4 \uBAA8\uB378 \uCD9C\uB825\uC774 \uC6B0\uC5F0\uD788 \uC88B\uC544 \uBCF4\uC774\uB294\uC9C0, \uADFC\uAC70\uC640 \uD3C9\uAC00\uB97C \uAC16\uCD98 \uC2DC\uC2A4\uD15C\uC778\uC9C0 \uC5B4\uB5BB\uAC8C \uAD6C\uBD84\uD560 \uAC83\uC778\uAC00?",
      concept: "LLM \uC2DC\uC2A4\uD15C\uC740 prompt \uD55C \uC904\uC774 \uC544\uB2C8\uB77C \uBB38\uC11C chunking, retrieval, context assembly, model call, parser, evaluator\uAC00 \uC774\uC5B4\uC9C4 pipeline\uC774\uB2E4. \uB85C\uBD07/AI \uD559\uC2B5\uC5D0\uC11C LLM\uC744 \uC4F0\uB824\uBA74 \uB2F5\uBCC0 \uD488\uC9C8\uBFD0 \uC544\uB2C8\uB77C \uADFC\uAC70 chunk, latency, \uC2E4\uD328 \uC720\uD615\uC744 \uB85C\uADF8\uB85C \uB0A8\uACA8\uC57C \uD55C\uB2E4.",
      mentalModel: "retrieval\uC740 \uC2DC\uD5D8\uC7A5\uC5D0 \uB4E4\uACE0 \uB4E4\uC5B4\uAC08 \uCC38\uACE0\uC790\uB8CC\uB97C \uACE0\uB974\uB294 \uC77C\uC774\uB2E4. \uB108\uBB34 \uC801\uAC8C \uAC00\uC838\uAC00\uBA74 \uADFC\uAC70\uAC00 \uBD80\uC871\uD558\uACE0, \uB108\uBB34 \uB9CE\uC774 \uAC00\uC838\uAC00\uBA74 \uD575\uC2EC\uC774 \uD750\uB824\uC9C4\uB2E4. eval harness\uB294 \uAC19\uC740 \uBB38\uC81C\uC9C0\uB97C \uBC18\uBCF5\uD574\uC11C \uD480\uB824 \uBCC0\uACBD\uC774 \uAC1C\uC120\uC778\uC9C0 \uD68C\uADC0\uC778\uC9C0 \uBCF4\uB294 \uC7A5\uCE58\uB2E4.",
      variables: [
        "q: \uC0AC\uC6A9\uC790 \uC9C8\uBB38 \uB610\uB294 task input",
        "c_i: \uAC80\uC0C9 \uD6C4\uBCF4 chunk",
        "sim(q,c_i): query\uC640 chunk\uC758 \uC720\uC0AC\uB3C4",
        "pass rate: eval set\uC5D0\uC11C \uAE30\uC900\uC744 \uD1B5\uACFC\uD55C \uBE44\uC728"
      ],
      principles: [
        "prompt\uB294 \uC5ED\uD560, \uBAA9\uD45C, \uC81C\uC57D, \uCD9C\uB825 \uD615\uC2DD\uC744 \uBD84\uB9AC\uD574\uC57C \uD3C9\uAC00 \uAC00\uB2A5\uD558\uB2E4.",
        "retrieval\uC740 top-k chunk \uC120\uD0DD\uC73C\uB85C context window \uC608\uC0B0\uC744 \uBC30\uBD84\uD55C\uB2E4.",
        "golden output\uC740 \uC644\uC804\uC77C\uCE58\uBCF4\uB2E4 \uD544\uC218 \uC870\uAC74 \uCDA9\uC871 \uC5EC\uBD80\uB85C \uCABC\uAC1C\uB294 \uAC83\uC774 \uACAC\uACE0\uD558\uB2E4.",
        "trace\uC5D0\uB294 prompt version, retrieved chunk id, output, grader result, latency\uAC00 \uB4E4\uC5B4\uAC00\uC57C \uD55C\uB2E4."
      ],
      formulas: [
        formula("cosine similarity", "sim(a,b)=a dot b/(||a|| ||b||)", "embedding \uAC80\uC0C9\uC758 \uAE30\uBCF8 \uC720\uC0AC\uB3C4."),
        formula("pass rate", "passed/total", "eval set \uD1B5\uACFC \uBE44\uC728.")
      ],
      derivation: [
        "\uBB38\uC11C\uB97C \uC758\uBBF8 \uB2E8\uC704 chunk\uB85C \uB098\uB208\uB2E4.",
        "query\uC640 chunk embedding\uC744 \uAC19\uC740 \uACF5\uAC04\uC5D0 \uB193\uACE0 cosine similarity\uB97C \uACC4\uC0B0\uD55C\uB2E4.",
        "\uC0C1\uC704 k\uAC1C chunk\uB97C prompt context\uB85C \uB123\uB294\uB2E4.",
        "\uCD9C\uB825\uC744 parser\uB85C \uAD6C\uC870\uD654\uD558\uACE0 grader\uB85C pass/fail\uC744 \uAE30\uB85D\uD55C\uB2E4."
      ],
      proof: [
        "cosine similarity\uB294 \uBCA1\uD130 \uD06C\uAE30\uAC00 \uC544\uB2C8\uB77C \uBC29\uD5A5\uC744 \uBE44\uAD50\uD558\uBBC0\uB85C \uAE34 \uBB38\uC11C\uC640 \uC9E7\uC740 \uC9C8\uBB38\uC758 scale \uCC28\uC774\uB97C \uC904\uC778\uB2E4.",
        "pass rate\uB294 Bernoulli trial\uC758 \uD3C9\uADE0\uC73C\uB85C \uBCFC \uC218 \uC788\uC5B4 regression \uBE44\uAD50\uC758 \uCD5C\uC18C \uD1B5\uACC4\uB7C9\uC774 \uB41C\uB2E4."
      ],
      workedExample: {
        prompt: "20\uAC1C eval \uC911 17\uAC1C \uD1B5\uACFC\uD558\uBA74 pass rate\uB294?",
        steps: ["passed=17", "total=20", "pass rate=17/20=0.85"],
        result: "prompt \uBCC0\uACBD \uC804\uD6C4 pass rate\uC640 \uC2E4\uD328 \uC720\uD615\uC744 \uD568\uAED8 \uBE44\uAD50\uD55C\uB2E4."
      },
      implementationNotes: [
        "eval JSONL\uC5D0\uB294 input, expected criteria, metadata\uB97C \uB123\uB294\uB2E4.",
        "retrieved chunk id\uC640 prompt version\uC744 trace\uC5D0 \uC800\uC7A5\uD55C\uB2E4.",
        "latency\uB294 retrieval, model, parsing\uC73C\uB85C \uB098\uB220 \uBCD1\uBAA9\uC744 \uCC3E\uB294\uB2E4."
      ],
      engineeringMeaning: [
        "\uB85C\uBD07 \uC2DC\uC2A4\uD15C\uC5D0\uC11C LLM\uC740 \uADFC\uAC70 \uC5C6\uB294 \uC9C0\uC2DC\uB97C \uB9CC\uB4E4 \uC218 \uC788\uC73C\uBBC0\uB85C grounding\uACFC evaluator\uAC00 \uC911\uC694\uD558\uB2E4.",
        "\uD558\uB124\uC2A4\uAC00 \uC788\uC5B4\uC57C prompt \uBCC0\uACBD\uC774 \uAC1C\uC120\uC778\uC9C0 \uAC10\uC73C\uB85C \uD310\uB2E8\uD558\uC9C0 \uC54A\uB294\uB2E4."
      ],
      commonMistakes: [
        "\uC88B\uC544 \uBCF4\uC774\uB294 \uC608\uC2DC \uD558\uB098\uB85C prompt\uB97C \uD655\uC815\uD55C\uB2E4.",
        "retrieval \uC2E4\uD328\uC640 model reasoning \uC2E4\uD328\uB97C \uAC19\uC740 \uC624\uB958\uB85C \uBB36\uB294\uB2E4.",
        "\uCD9C\uB825 \uD615\uC2DD\uC744 parser\uAC00 \uAC80\uC99D\uD558\uC9C0 \uC54A\uB294\uB2E4."
      ],
      examTargets: ["chunking/retrieval \uD750\uB984", "cosine similarity", "pass rate", "trace \uC124\uACC4"]
    };
  }
  if (id.includes("realtime") || id.includes("safety")) {
    return {
      subject: "\uC2E4\uC2DC\uAC04\uC131\xB7\uC548\uC804\uC131\xB7\uC13C\uC11C\uC735\uD569\xB7\uD3C9\uAC00",
      coreQuestion: "\uBB3C\uB9AC \uC2DC\uC2A4\uD15C\uC774 \uC2DC\uAC04 \uC548\uC5D0 \uC548\uC804\uD558\uAC8C \uBC18\uC751\uD558\uACE0, \uC2E4\uD328\uB97C \uBC18\uBCF5 \uC2E4\uD5D8\uC73C\uB85C \uC124\uBA85\uD560 \uC218 \uC788\uB294\uAC00?",
      concept: "Physical AI\uB294 \uC54C\uACE0\uB9AC\uC998\uC774 \uB9DE\uC544\uB3C4 \uB2A6\uC73C\uBA74 \uC2E4\uD328\uD55C\uB2E4. control loop\uC758 latency\uC640 jitter, sensor timestamp, watchdog, rate limit, covariance tuning\uC740 \uBAA8\uB450 \uBB3C\uB9AC \uC138\uACC4\uC640 \uC5F0\uACB0\uB41C \uC2DC\uC2A4\uD15C\uC758 \uAE30\uBCF8 \uC548\uC804\uC7A5\uCE58\uB2E4.",
      mentalModel: "\uB85C\uBD07\uC740 \uB9E4 \uC21C\uAC04 \uB9C8\uAC10\uC2DC\uAC04\uC774 \uC788\uB294 \uC2DC\uD5D8\uC744 \uBCF8\uB2E4. deadline\uC744 \uB118\uAE34 \uC88B\uC740 \uB2F5\uC740 \uB2A6\uC740 \uB2F5\uC774\uB2E4. \uC548\uC804 \uC0C1\uD0DC\uBA38\uC2E0\uC740 \uBD88\uD655\uC2E4\uD560 \uB54C \uBA48\uCD94\uB294 \uADDC\uCE59\uC744 \uBA85\uD655\uD788 \uD574 \uC0AC\uACE0\uB97C \uC904\uC778\uB2E4.",
      variables: [
        "T_target: \uBAA9\uD45C \uC81C\uC5B4\uC8FC\uAE30",
        "T_actual: \uC2E4\uC81C \uCE21\uC815 \uC8FC\uAE30",
        "jitter=T_actual-T_target",
        "timeout: heartbeat\uAC00 \uB04A\uACBC\uB2E4\uACE0 \uD310\uB2E8\uD558\uB294 \uC2DC\uAC04"
      ],
      principles: [
        "latency\uB294 \uD3C9\uADE0\uBFD0 \uC544\uB2C8\uB77C tail latency\uC640 deadline miss\uB97C \uBD10\uC57C \uD55C\uB2E4.",
        "watchdog\uC740 heartbeat \uC2E4\uD328\uB098 \uC7A5\uC560\uBB3C \uC870\uAC74\uC5D0\uC11C zero command\uB85C \uC804\uD658\uD55C\uB2E4.",
        "covariance\uB294 \uC13C\uC11C \uC2E0\uB8B0\uB3C4\uB97C \uC218\uCE58\uD654\uD574 fusion\uC5D0\uC11C \uAC00\uC911\uCE58 \uC5ED\uD560\uC744 \uD55C\uB2E4.",
        "parameter sweep\uC740 \uAC1C\uC120\uC744 \uC8FC\uC7A5\uD558\uAE30 \uC704\uD55C \uC2E4\uD5D8 \uC124\uACC4\uB2E4."
      ],
      formulas: [
        formula("jitter", "jitter = T_actual - T_target", "\uC8FC\uAE30 \uD754\uB4E4\uB9BC."),
        formula("deadline miss rate", "misses/total", "\uB9C8\uAC10\uC2DC\uAC04\uC744 \uB118\uAE34 run \uBE44\uC728."),
        formula("EKF covariance", "P' = F P F^T + Q", "\uBAA8\uB378 \uC608\uCE21 \uBD88\uD655\uC2E4\uC131 \uC804\uD30C.")
      ],
      derivation: [
        "\uAC01 loop\uB9C8\uB2E4 timestamp\uB97C \uCC0D\uACE0 \uC5F0\uC18D timestamp \uCC28\uC774\uB85C T_actual\uC744 \uAD6C\uD55C\uB2E4.",
        "T_actual\uC5D0\uC11C T_target\uC744 \uBE7C\uBA74 jitter sample\uC774 \uB41C\uB2E4.",
        "deadline\uBCF4\uB2E4 \uD070 sample \uC218\uB97C total sample \uC218\uB85C \uB098\uB204\uBA74 miss rate\uB2E4.",
        "parameter sweep\uC5D0\uC11C\uB294 scenario\uC640 parameter set\uC744 \uACE0\uC815\uD558\uACE0 metric\uB9CC \uBE44\uAD50\uD55C\uB2E4."
      ],
      proof: [
        "\uC81C\uC5B4 \uC785\uB825\uC740 \uC0D8\uD50C\uB9C1\uB41C \uC2DC\uAC04 \uAC04\uACA9\uB9C8\uB2E4 \uC801\uC6A9\uB418\uBBC0\uB85C dt \uBCC0\uD654\uB294 \uC774\uC0B0 \uC2DC\uC2A4\uD15C\uC758 pole\uACFC \uC548\uC815\uC131\uC5D0 \uC601\uD5A5\uC744 \uC900\uB2E4.",
        "watchdog\uC740 \uC785\uB825 \uC815\uBCF4\uAC00 \uC624\uB798\uB418\uBA74 \uC0C1\uD0DC \uCD94\uC815\uC774 \uD604\uC7AC\uB97C \uB300\uD45C\uD558\uC9C0 \uC54A\uB294\uB2E4\uB294 \uC804\uC81C\uC5D0\uC11C \uC548\uC804 \uC815\uC9C0\uB85C \uAC04\uB2E4."
      ],
      workedExample: {
        prompt: "\uBAA9\uD45C \uC8FC\uAE30 20ms, \uCE21\uC815 \uC8FC\uAE30 [19,21,40]ms\uC77C \uB54C deadline 33.3ms miss \uC218\uB294?",
        steps: ["33.3ms\uBCF4\uB2E4 \uD070 \uAC12\uC740 40ms \uD558\uB098", "misses=1", "miss rate=1/3"],
        result: "\uD3C9\uADE0\uB9CC \uBCF4\uBA74 \uB193\uCE58\uB294 \uC21C\uAC04\uC801 \uC9C0\uC5F0\uC744 miss rate\uAC00 \uB4DC\uB7EC\uB0B8\uB2E4."
      },
      implementationNotes: [
        "timer callback \uC548\uC758 \uB3D9\uC801 \uD560\uB2F9, blocking I/O, \uD070 image processing\uC744 \uC758\uC2EC\uD55C\uB2E4.",
        "safety node\uB294 command limit, timeout, obstacle stop\uC744 \uD55C\uACF3\uC5D0\uC11C \uAC80\uC99D\uD55C\uB2E4.",
        "\uD3C9\uAC00 \uACB0\uACFC\uB294 baseline \uB300\uBE44 \uAC1C\uC120\uC728\uACFC failure taxonomy\uB85C \uB0A8\uAE34\uB2E4."
      ],
      engineeringMeaning: [
        "\uC2E4\uC2DC\uAC04\uC131\uC740 \uACE0\uAE09 \uC635\uC158\uC774 \uC544\uB2C8\uB77C \uC81C\uC5B4 \uC131\uB2A5\uACFC \uC548\uC804\uC131\uC758 \uAE30\uBC18\uC774\uB2E4.",
        "\uBC18\uBCF5 \uD3C9\uAC00\uD45C\uAC00 \uC788\uC5B4\uC57C \uC88B\uC740 \uB0A0 \uD55C \uBC88 \uC131\uACF5\uD55C \uB370\uBAA8\uC640 \uC2E4\uC81C \uAC1C\uC120\uC744 \uAD6C\uBD84\uD55C\uB2E4."
      ],
      commonMistakes: [
        "\uD3C9\uADE0 latency\uB9CC \uBCF4\uACE0 tail latency\uB97C \uBCF4\uC9C0 \uC54A\uB294\uB2E4.",
        "\uC13C\uC11C timestamp\uC640 processing timestamp\uB97C \uD63C\uB3D9\uD55C\uB2E4.",
        "\uC548\uC804 \uB85C\uC9C1\uC744 controller \uB0B4\uBD80 \uACF3\uACF3\uC5D0 \uD769\uC5B4\uB193\uC544 \uAC80\uC99D\uD558\uAE30 \uC5B4\uB835\uAC8C \uB9CC\uB4E0\uB2E4."
      ],
      examTargets: ["jitter \uACC4\uC0B0", "watchdog \uC0C1\uD0DC \uC804\uC774", "covariance \uC758\uBBF8", "parameter sweep \uD3C9\uAC00"]
    };
  }
  return {
    subject: "Physical AI \uD559\uC2B5 \uBC29\uBC95\uB860\uACFC ROS 2 \uC2DC\uC2A4\uD15C\uD654",
    coreQuestion: "\uC77D\uC740 \uAC1C\uB150\uC744 \uC124\uBA85, \uACC4\uC0B0, \uCF54\uB4DC, \uB85C\uADF8, \uD3C9\uAC00\uB85C \uC774\uC5B4\uC9C0\uB294 \uD559\uC2B5 \uC790\uC0B0\uC73C\uB85C \uBC14\uAFC0 \uC218 \uC788\uB294\uAC00?",
    concept: "\uC774 \uC0AC\uC774\uD2B8\uC758 \uACF5\uD1B5 \uD559\uC2B5 \uBC29\uBC95\uC740 \uC774\uB860\uC744 \uC77D\uACE0 \uB05D\uB0B4\uC9C0 \uC54A\uB294 \uAC83\uC774\uB2E4. \uAC1C\uB150\uC744 \uBCC0\uC218\uC640 \uACF5\uC2DD\uC73C\uB85C \uC815\uC758\uD558\uACE0, \uC791\uC740 \uC218\uCE58 \uC608\uC81C\uB85C \uC190\uACC4\uC0B0\uD55C \uB4A4, Python/C++/JS \uC2DC\uBBAC\uB808\uC774\uC158\uACFC ROS 2 \uB85C\uADF8\uB85C \uD655\uC778\uD574\uC57C \uC2DC\uD5D8\uACFC \uC2E4\uC804 \uBAA8\uB450\uC5D0\uC11C \uC4F8 \uC218 \uC788\uB2E4.",
    mentalModel: "\uD559\uC2B5 \uB8E8\uD504\uB294 \uC791\uC740 \uACFC\uD559 \uC2E4\uD5D8\uC774\uB2E4. \uAC00\uC124\uC744 \uC138\uC6B0\uACE0, \uC785\uB825\uC744 \uC815\uD558\uACE0, \uCD9C\uB825\uC744 \uACC4\uC0B0\uD558\uACE0, \uCF54\uB4DC\uB85C \uC7AC\uD604\uD558\uACE0, \uACB0\uACFC\uB97C \uB85C\uADF8\uB85C \uB0A8\uAE34\uB2E4. \uC774 \uB8E8\uD504\uAC00 \uB2EB\uD600\uC57C '\uC548\uB2E4'\uAC00 \uB41C\uB2E4.",
    variables: [
      "scenario: \uC2E4\uD5D8 \uC870\uAC74",
      "parameter: \uBC14\uAFBC \uAC12",
      "metric: \uBE44\uAD50\uD560 \uC131\uB2A5 \uC218\uCE58",
      "artifact: \uCF54\uB4DC, \uADF8\uB798\uD504, \uB85C\uADF8, \uB178\uD2B8"
    ],
    principles: [
      "\uC815\uC758 \uC5C6\uC774 \uAD6C\uD604\uD558\uBA74 \uC785\uB825/\uCD9C\uB825 \uACC4\uC57D\uC774 \uD754\uB4E4\uB9B0\uB2E4.",
      "\uC190\uACC4\uC0B0 \uC5C6\uC774 \uCF54\uB4DC\uB97C \uC4F0\uBA74 \uC624\uB958\uB97C \uB208\uC73C\uB85C \uC7A1\uAE30 \uC5B4\uB835\uB2E4.",
      "\uB85C\uADF8 \uC5C6\uC774 \uD29C\uB2DD\uD558\uBA74 \uAC1C\uC120\uACFC \uC6B0\uC5F0\uC744 \uAD6C\uBD84\uD560 \uC218 \uC5C6\uB2E4.",
      "ROS 2 \uC2DC\uC2A4\uD15C\uC5D0\uC11C\uB294 topic, parameter, frame, timestamp\uAC00 \uBAA8\uB450 \uACC4\uC57D\uC774\uB2E4."
    ],
    formulas: [
      formula("learning loop", "theory -> derivation -> code -> simulation -> log -> evaluation", "\uB2EB\uD78C \uD559\uC2B5 \uB8E8\uD504."),
      formula("pass rate", "success/total", "\uBC18\uBCF5 \uC2E4\uD5D8 \uC131\uACF5\uB960.")
    ],
    derivation: [
      "\uAC1C\uB150\uC744 \uD55C \uBB38\uC7A5\uC73C\uB85C \uC815\uC758\uD55C\uB2E4.",
      "\uC0C1\uD0DC, \uC785\uB825, \uD30C\uB77C\uBBF8\uD130, \uCD9C\uB825, \uB178\uC774\uC988\uB97C \uD45C\uB85C \uB098\uB208\uB2E4.",
      "\uD575\uC2EC \uACF5\uC2DD\uC744 \uC190\uACC4\uC0B0 \uC608\uC81C\uB85C \uAC80\uC0B0\uD55C\uB2E4.",
      "\uCF54\uB4DC\uC640 \uC2DC\uAC01\uD654\uB85C \uAC19\uC740 \uACB0\uACFC\uAC00 \uB098\uC624\uB294\uC9C0 \uD655\uC778\uD55C\uB2E4.",
      "\uC2E4\uD5D8 \uB85C\uADF8\uB85C \uB2E4\uC74C \uBE44\uAD50\uC758 \uAE30\uC900\uC120\uC744 \uB9CC\uB4E0\uB2E4."
    ],
    proof: [
      "\uAC19\uC740 \uC785\uB825\uC5D0\uC11C \uC190\uACC4\uC0B0\uACFC \uCF54\uB4DC \uACB0\uACFC\uAC00 \uC77C\uCE58\uD558\uBA74 \uAD6C\uD604\uC774 \uC815\uC758\uD55C \uC218\uC2DD\uC744 \uB530\uB790\uB2E4\uB294 \uADFC\uAC70\uAC00 \uB41C\uB2E4.",
      "\uAC19\uC740 scenario\uC5D0\uC11C parameter\uB9CC \uBC14\uAFD4 metric\uC744 \uBE44\uAD50\uD558\uBA74 \uAC1C\uC120\uC758 \uC6D0\uC778\uC744 \uC881\uD790 \uC218 \uC788\uB2E4."
    ],
    workedExample: {
      prompt: "20\uD68C \uC2E4\uD5D8 \uC911 15\uD68C \uC131\uACF5\uD558\uBA74 pass rate\uB294?",
      steps: ["success=15", "total=20", "pass rate=0.75"],
      result: "\uC131\uACF5\uB960\uB9CC \uC4F0\uC9C0 \uB9D0\uACE0 \uC2E4\uD328 \uC720\uD615\uB3C4 \uD568\uAED8 \uAE30\uB85D\uD574\uC57C \uB2E4\uC74C \uAC1C\uC120\uC774 \uAC00\uB2A5\uD558\uB2E4."
    },
    implementationNotes: [
      "Markdown \uB178\uD2B8\uC5D0\uB294 \uC815\uC758, \uACF5\uC2DD, \uC190\uACC4\uC0B0, \uCF54\uB4DC \uB9C1\uD06C, \uB85C\uADF8 \uD30C\uC77C\uBA85\uC744 \uAC19\uC774 \uB0A8\uAE34\uB2E4.",
      "ROS 2 launch\uC640 YAML parameter\uB97C \uC2E4\uD5D8 \uACB0\uACFC\uC640 \uD568\uAED8 versioning\uD55C\uB2E4.",
      "\uD034\uC988 \uC624\uB2F5\uC740 \uAD00\uB828 \uACF5\uC2DD\uACFC \uD568\uAED8 \uB2E4\uC2DC \uBCF5\uC2B5 \uCE74\uB4DC\uB85C \uB3CC\uB9B0\uB2E4."
    ],
    engineeringMeaning: [
      "\uAE30\uCD08 \uD559\uC2B5\uC758 \uBAA9\uD45C\uB294 \uB9CE\uC740 \uC6A9\uC5B4\uB97C \uC544\uB294 \uAC83\uC774 \uC544\uB2C8\uB77C, \uB0AF\uC120 \uBB38\uC81C\uB97C \uC791\uC740 \uC2E4\uD5D8 \uB2E8\uC704\uB85C \uCABC\uAC24 \uC218 \uC788\uB294 \uB2A5\uB825\uC774\uB2E4.",
      "\uC774 \uB8E8\uD504\uB294 \uB85C\uBD07\uD314, \uC790\uC728\uC8FC\uD589, AI, LLM \uD558\uB124\uC2A4\uC5D0 \uBAA8\uB450 \uC801\uC6A9\uB41C\uB2E4."
    ],
    commonMistakes: [
      "\uAC1C\uB150 \uC774\uB984\uB9CC \uC678\uC6B0\uACE0 \uBCC0\uC218 \uC815\uC758\uB97C \uD558\uC9C0 \uC54A\uB294\uB2E4.",
      "\uACB0\uACFC \uADF8\uB798\uD504\uB9CC \uBCF4\uACE0 \uC785\uB825 \uD30C\uB77C\uBBF8\uD130\uB97C \uAE30\uB85D\uD558\uC9C0 \uC54A\uB294\uB2E4.",
      "\uD55C \uBC88 \uC131\uACF5\uD55C demo\uB97C \uAC80\uC99D\uB41C \uC131\uB2A5\uC73C\uB85C \uCC29\uAC01\uD55C\uB2E4."
    ],
    examTargets: ["\uD559\uC2B5 \uB8E8\uD504 \uC124\uBA85", "pass rate \uACC4\uC0B0", "\uB85C\uADF8 \uC124\uACC4", "ROS 2 \uC2E4\uD5D8 \uC7AC\uD604\uC131"]
  };
};
const textbookUnitForTopic = (section, topic, graphIds) => {
  const profile = profileForTopic(section, topic);
  const figures = graphIds.map(figureByGraphId);
  const sourceIds = sourceIdsForTopic(section, topic);
  return {
    id: `${section.id}-${topic.id}-textbook-foundation`,
    title: `${topic.title} \xB7 \uC804\uACF5 \uAD50\uC7AC\uC2DD \uBCF8\uBB38`,
    summary: `${profile.subject}: ${profile.coreQuestion}`,
    intuition: profile.mentalModel,
    assumptions: [
      "\uBAA8\uB4E0 \uC218\uC2DD\uC740 \uBA3C\uC800 \uC88C\uD45C\uACC4, \uB2E8\uC704, \uC2DC\uAC04 \uAE30\uC900\uC744 \uC815\uD55C \uB4A4 \uC0AC\uC6A9\uD55C\uB2E4.",
      "\uC2DC\uD5D8 \uBB38\uC81C\uB294 \uC774\uB860 \uBCF8\uBB38\uC5D0 \uB098\uC628 \uBCC0\uC218 \uC815\uC758\uC640 \uACF5\uC2DD \uC720\uB3C4\uC5D0\uC11C \uCD9C\uC81C\uB41C\uB2E4\uACE0 \uAC00\uC815\uD55C\uB2E4.",
      "\uBE0C\uB77C\uC6B0\uC800 \uC2DC\uAC01\uD654\uC640 JS \uC2E4\uD589\uC740 \uC2E4\uC81C ROS 2/\uD558\uB4DC\uC6E8\uC5B4\uB97C \uB300\uCCB4\uD558\uC9C0 \uC54A\uACE0 \uC190\uACC4\uC0B0 \uAC80\uC0B0\uC744 \uB3D5\uB294\uB2E4."
    ],
    details: [
      `\uD575\uC2EC \uC9C8\uBB38: ${profile.coreQuestion}`,
      `\uAC1C\uB150 \uC124\uBA85: ${profile.concept}`,
      `\uC9C1\uAD00 \uBAA8\uB378: ${profile.mentalModel}`,
      "\uBCC0\uC218 \uC77D\uAE30: " + profile.variables.join(" / "),
      "\uAE30\uBCF8 \uC6D0\uB9AC 1: " + profile.principles[0],
      "\uAE30\uBCF8 \uC6D0\uB9AC 2: " + profile.principles[1],
      "\uAE30\uBCF8 \uC6D0\uB9AC 3: " + profile.principles[2],
      "\uAE30\uBCF8 \uC6D0\uB9AC 4: " + (profile.principles[3] ?? profile.principles[profile.principles.length - 1]),
      "\uC2DC\uD5D8 \uC5F0\uACB0: \uBB38\uC81C\uB97C \uD480 \uB54C\uB294 \uBA3C\uC800 \uC5B4\uB5A4 \uBB3C\uB9AC\uB7C9\uC774 \uC785\uB825\uC774\uACE0 \uC5B4\uB5A4 \uAC12\uC774 \uCD9C\uB825\uC778\uC9C0 \uD45C\uC2DC\uD55C\uB2E4. \uADF8 \uB2E4\uC74C \uB2E8\uC704\uC640 frame\uC744 \uB9DE\uCD94\uACE0, \uACF5\uC2DD\uC5D0 \uB123\uC744 \uC22B\uC790\uB97C \uBD84\uB9AC\uD55C \uB4A4 \uACC4\uC0B0\uD55C\uB2E4.",
      "\uC2E4\uC804 \uC5F0\uACB0: \uC2E4\uC81C \uB85C\uBD07\uC5D0\uC11C\uB294 \uACF5\uC2DD \uC790\uCCB4\uBCF4\uB2E4 timestamp, noise, actuator limit, parameter mismatch\uAC00 \uACB0\uACFC\uB97C \uD754\uB4E0\uB2E4. \uADF8\uB798\uC11C \uC774\uB860, \uCF54\uB4DC, \uB85C\uADF8\uB97C \uAC19\uC774 \uBCF8\uB2E4."
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
    readingGuide: readingGuideForTopic(section, topic)
  };
};
const examBridgeUnitForTopic = (section, topic, graphIds) => {
  const profile = profileForTopic(section, topic);
  const figures = graphIds.slice(0, 1).map(figureByGraphId);
  const sourceIds = sourceIdsForTopic(section, topic);
  return {
    id: `${section.id}-${topic.id}-exam-bridge`,
    title: `${topic.title} \xB7 \uC2DC\uD5D8 \uD480\uC774 \uBE0C\uB9BF\uC9C0`,
    summary: "\uC774 \uB2E8\uC6D0 \uC2DC\uD5D8\uBB38\uC81C\uB97C \uD480\uAE30 \uC704\uD574 \uC774\uB860 \uBCF8\uBB38\uC5D0\uC11C \uBC18\uB4DC\uC2DC \uAC00\uC838\uC640\uC57C \uD558\uB294 \uACF5\uC2DD, \uD310\uB2E8 \uAE30\uC900, \uD480\uC774 \uC21C\uC11C\uB97C \uC815\uB9AC\uD55C\uB2E4.",
    intuition: "\uC2DC\uD5D8\uBB38\uC81C\uB294 \uC554\uAE30\uAC00 \uC544\uB2C8\uB77C \uBCC0\uD658 \uBB38\uC81C\uB2E4. \uBB38\uC7A5 \uC18D \uC0C1\uD669\uC744 \uBCC0\uC218\uC640 \uACF5\uC2DD\uC73C\uB85C \uBC14\uAFB8\uACE0, \uC218\uCE58 \uBB38\uC81C\uB294 \uB2E8\uC704\uAC00 \uB9DE\uB294\uC9C0 \uD655\uC778\uD558\uBA70, \uC11C\uC220 \uBB38\uC81C\uB294 \uC6D0\uC778-\uACF5\uC2DD-\uACB0\uACFC-\uAC80\uC99D \uC21C\uC11C\uB85C \uB2F5\uD55C\uB2E4.",
    assumptions: [
      "\uAC1D\uAD00\uC2DD\uC740 \uD575\uC2EC \uAC1C\uB150\uC758 \uC5ED\uD560\uC744 \uBB3B\uACE0, \uC218\uCE58 \uBB38\uC81C\uB294 \uACF5\uC2DD \uB300\uC785 \uB2A5\uB825\uC744 \uBB3B\uB294\uB2E4.",
      "\uC720\uB3C4 \uBB38\uC81C\uB294 \uC644\uC804\uD55C \uAE34 \uC99D\uBA85\uBCF4\uB2E4 \uD575\uC2EC \uB2E8\uACC4\uAC00 \uBE60\uC9C0\uC9C0 \uC54A\uC558\uB294\uC9C0\uB97C \uBCF8\uB2E4.",
      "\uCF54\uB4DC \uCD94\uC801 \uBB38\uC81C\uB294 \uCF54\uB4DC\uC758 \uBCC0\uC218\uBA85\uC774 \uC774\uB860 \uBCC0\uC218\uC640 \uC5B4\uB5BB\uAC8C \uB300\uC751\uB418\uB294\uC9C0\uB97C \uBCF8\uB2E4."
    ],
    details: [
      "\uBA3C\uC800 \uBB38\uC81C \uBB38\uC7A5\uC5D0\uC11C \uC870\uAC74\uAC12\uC744 \uBAA8\uB450 \uD45C\uC2DC\uD55C\uB2E4. \uC608: link length, wheel velocity, covariance, TP/FP/FN, latency sample.",
      "\uB450 \uBC88\uC9F8\uB85C \uC774 \uAC12\uB4E4\uC774 \uB4E4\uC5B4\uAC08 \uACF5\uC2DD\uC744 \uACE0\uB978\uB2E4. \uACF5\uC2DD \uC774\uB984\uB9CC \uC4F0\uC9C0 \uB9D0\uACE0 \uBD84\uC790, \uBD84\uBAA8, \uD589\uB82C \uCC28\uC6D0, frame \uAE30\uC900\uC744 \uAC19\uC774 \uD655\uC778\uD55C\uB2E4.",
      "\uC138 \uBC88\uC9F8\uB85C \uACC4\uC0B0\uD55C\uB2E4. \uAC01\uB3C4\uB294 degree\uC778\uC9C0 radian\uC778\uC9C0 \uD655\uC778\uD558\uACE0, \uD655\uB960/metric\uC740 0~1 \uBC94\uC704\uC778\uC9C0 \uC810\uAC80\uD55C\uB2E4.",
      "\uB124 \uBC88\uC9F8\uB85C \uACB0\uACFC\uB97C \uD574\uC11D\uD55C\uB2E4. det(J)\uAC00 \uC791\uC73C\uBA74 singularity, recall\uC774 \uB0AE\uC73C\uBA74 false negative \uC704\uD5D8, jitter\uAC00 \uD06C\uBA74 deadline miss \uAC00\uB2A5\uC131\uCC98\uB7FC \uC218\uCE58\uC758 \uC758\uBBF8\uB97C \uB9D0\uD574\uC57C \uD55C\uB2E4.",
      "\uC11C\uC220\uD615 \uB2F5\uC548\uC740 '\uC6D0\uC778 \u2192 \uAD00\uB828 \uACF5\uC2DD/\uC6D0\uB9AC \u2192 \uAD00\uCC30\uD560 \uB85C\uADF8 \u2192 \uC218\uC815 \uBC29\uD5A5' \uC21C\uC11C\uB85C \uC4F0\uBA74 \uB300\uBD80\uBD84\uC758 \uC2E4\uC804 \uBB38\uC81C\uB97C \uC548\uC815\uC801\uC73C\uB85C \uD480 \uC218 \uC788\uB2E4.",
      "\uCF54\uB4DC \uCD94\uC801\uD615 \uB2F5\uC548\uC740 \uCF54\uB4DC \uC904\uB9C8\uB2E4 \uC774\uB860 \uBCC0\uC218\uB85C \uB2E4\uC2DC \uC774\uB984 \uBD99\uC778\uB2E4. \uC608: error\uB294 target-current, command\uB294 gain*error, f\uB294 g+h\uB2E4."
    ],
    formulas: [
      ...profile.formulas.slice(0, 3),
      formula("answer pattern", "condition -> formula -> calculation -> interpretation", "\uC804\uBB38 \uBB38\uC81C \uD480\uC774 \uACF5\uD1B5 \uAD6C\uC870.")
    ],
    derivation: [
      "\uBB38\uC7A5\uC758 \uBA85\uC0AC\uB97C \uBCC0\uC218\uB85C \uBC14\uAFBC\uB2E4.",
      "\uBCC0\uC218\uC758 \uB2E8\uC704\uC640 frame\uC744 \uD655\uC778\uD55C\uB2E4.",
      "\uD574\uB2F9 \uB2E8\uC6D0\uC758 \uD575\uC2EC \uACF5\uC2DD\uC5D0 \uB300\uC785\uD55C\uB2E4.",
      "\uC911\uAC04 \uACC4\uC0B0\uC744 \uD55C \uC904 \uC774\uC0C1 \uB0A8\uAE34\uB2E4.",
      "\uACC4\uC0B0 \uACB0\uACFC\uAC00 \uC2DC\uC2A4\uD15C\uC5D0\uC11C \uC5B4\uB5A4 \uC758\uBBF8\uC778\uC9C0 \uD574\uC11D\uD55C\uB2E4."
    ],
    proof: [
      "\uD480\uC774\uAC00 \uB9DE\uC73C\uB824\uBA74 \uC785\uB825 \uBCC0\uC218\uC640 \uACF5\uC2DD\uC758 \uCC28\uC6D0\uC774 \uC77C\uCE58\uD574\uC57C \uD55C\uB2E4.",
      "\uC720\uB3C4 \uB2E8\uACC4\uAC00 \uB9DE\uC73C\uB824\uBA74 \uC815\uC758\uC5D0\uC11C \uC2DC\uC791\uD574 \uADFC\uC0AC \uB610\uB294 \uBCF4\uC874 \uBC95\uCE59\uC744 \uBA85\uC2DC\uD574\uC57C \uD55C\uB2E4.",
      "\uC2E4\uBB34\uD615 \uBB38\uC81C\uB294 \uD558\uB098\uC758 \uC815\uB2F5\uBCF4\uB2E4 \uC9C4\uB2E8 \uC21C\uC11C\uAC00 \uC911\uC694\uD558\uBBC0\uB85C \uB85C\uADF8\uC640 \uAC80\uC99D \uD3EC\uC778\uD2B8\uB97C \uD3EC\uD568\uD574\uC57C \uD55C\uB2E4."
    ],
    engineeringMeaning: [
      "\uC2DC\uD5D8\uC744 \uC798 \uD47C\uB2E4\uB294 \uAC83\uC740 \uC2E4\uC81C \uB514\uBC84\uAE45 \uC0C1\uD669\uC5D0\uC11C \uC5B4\uB5A4 \uAC12\uC744 \uCC0D\uACE0 \uC5B4\uB5A4 parameter\uB97C \uC758\uC2EC\uD560\uC9C0 \uB9D0\uD560 \uC218 \uC788\uB2E4\uB294 \uB73B\uC774\uB2E4.",
      "\uB530\uB77C\uC11C \uBAA8\uB4E0 \uB2F5\uC548\uC740 \uC22B\uC790 \uACC4\uC0B0\uACFC \uC2DC\uC2A4\uD15C \uD574\uC11D\uC744 \uD568\uAED8 \uAC00\uC838\uC57C \uD55C\uB2E4."
    ],
    implementationNotes: [
      "\uD480\uC774 \uD6C4 \uAC19\uC740 \uACF5\uC2DD\uC744 JS \uC2E4\uD589 \uC2E4\uC2B5\uC5D0\uC11C \uC791\uC740 \uC22B\uC790\uB85C \uAC80\uC0B0\uD55C\uB2E4.",
      "\uC624\uB2F5\uC740 \uBCF5\uC2B5 \uCE74\uB4DC\uC5D0\uC11C \uACF5\uC2DD\uACFC \uD568\uAED8 \uB2E4\uC2DC \uBCF8\uB2E4.",
      "\uBA54\uBAA8\uC5D0\uB294 \uD2C0\uB9B0 \uC774\uC720\uB97C '\uACF5\uC2DD \uC120\uD0DD \uC624\uB958', '\uB2E8\uC704 \uC624\uB958', '\uAC1C\uB150 \uD574\uC11D \uC624\uB958', '\uCF54\uB4DC \uCD94\uC801 \uC624\uB958'\uB85C \uBD84\uB958\uD55C\uB2E4."
    ],
    figures,
    graphExplanations: figures.map((figure) => `${figure.title}: ${figure.explanation}`),
    workedExample: {
      prompt: `${topic.title} \uBB38\uC81C\uB97C \uD480 \uB54C \uB2F5\uC548 \uAD6C\uC870\uB97C \uC5B4\uB5BB\uAC8C \uC7A1\uC744\uAE4C?`,
      steps: [
        "\uC870\uAC74\uAC12\uC744 \uBCC0\uC218\uB85C \uC62E\uACA8 \uC801\uB294\uB2E4.",
        `\uD575\uC2EC \uACF5\uC2DD \uD6C4\uBCF4: ${profile.formulas.map((item) => item.label).slice(0, 3).join(", ")}`,
        "\uACC4\uC0B0 \uACB0\uACFC\uB97C \uB2E8\uC704\uC640 \uD568\uAED8 \uC4F4\uB2E4.",
        "\uACB0\uACFC\uAC00 \uB85C\uBD07 \uC2DC\uC2A4\uD15C\uC5D0\uC11C \uC758\uBBF8\uD558\uB294 \uC704\uD5D8/\uC131\uB2A5/\uC624\uCC28\uB97C \uD574\uC11D\uD55C\uB2E4."
      ],
      result: `\uC774 \uB2E8\uC6D0\uC5D0\uC11C \uD2B9\uD788 \uC124\uBA85\uD560 \uC218 \uC788\uC5B4\uC57C \uD558\uB294 \uAC83: ${profile.examTargets.join(", ")}.`
    },
    commonMistakes: [
      ...profile.commonMistakes.slice(0, 2),
      "\uBB38\uC81C\uC5D0 \uB098\uC628 \uC0C1\uD669\uC744 \uB85C\uADF8\uB098 \uAC80\uC99D \uD3EC\uC778\uD2B8\uB85C \uC5F0\uACB0\uD558\uC9C0 \uC54A\uB294\uB2E4."
    ],
    sourceIds,
    readingGuide: readingGuideForTopic(section, topic)
  };
};
const theoryForTopic = (section, topic, graphIds) => {
  const figures = graphIds.map(figureByGraphId);
  const sourceIds = sourceIdsForTopic(section, topic);
  return section.theory.map((unit, index) => ({
    ...unit,
    id: `${section.id}-${topic.id}-${unit.id}`,
    title: index === 0 ? `${topic.title} \xB7 \uC804\uACF5\uC11C\uC801\uC2DD \uC774\uB860` : `${topic.title} \xB7 ${unit.title}`,
    summary: index === 0 ? `${topic.focus} \uAE30\uC874 PDF \uD56D\uBAA9\uC744 \uC815\uC758, \uC9C1\uAD00, \uC218\uC2DD, \uC99D\uBA85, \uACC4\uC0B0 \uC608\uC81C, \uAD6C\uD604 \uC5F0\uACB0 \uC21C\uC11C\uB85C \uD655\uC7A5\uD55C\uB2E4.` : unit.summary,
    details: index === 0 ? [
      `\uC815\uC758: ${topic.focus}`,
      "\uC9C1\uAD00: \uB85C\uBD07 \uC2DC\uC2A4\uD15C\uC758 \uC804\uBB38 \uC9C0\uC2DD\uC740 \uC218\uC2DD \uD558\uB098\uB97C \uC678\uC6B0\uB294 \uC77C\uC774 \uC544\uB2C8\uB77C \uC0C1\uD0DC, \uC785\uB825, \uD30C\uB77C\uBBF8\uD130, \uB178\uC774\uC988, \uC2DC\uAC04\uCD95 \uC0AC\uC774\uC758 \uAD00\uACC4\uB97C \uC124\uBA85\uD558\uB294 \uC77C\uC774\uB2E4.",
      "\uC218\uD559\uC2DD: \uBAA8\uB4E0 \uC138\uC158\uC740 y=f(x,u,theta,t)+noise \uD615\uD0DC\uB85C \uD574\uC11D\uD560 \uC218 \uC788\uB2E4. \uC5EC\uAE30\uC11C x\uB294 \uC0C1\uD0DC, u\uB294 \uC785\uB825, theta\uB294 \uD30C\uB77C\uBBF8\uD130, t\uB294 \uC2DC\uAC04\uC774\uBA70 noise\uB294 \uC2E4\uC81C \uC13C\uC11C\uC640 actuator\uC758 \uBD88\uD655\uC2E4\uC131\uC744 \uB098\uD0C0\uB0B8\uB2E4.",
      "\uC99D\uBA85 \uAD00\uC810: \uC815\uC758\uD55C \uBCC0\uC218\uAC00 \uAC19\uC740 \uB2E8\uC704\uC640 \uAC19\uC740 frame\uC5D0 \uB193\uC774\uBA74 \uC2DD\uC758 \uC591\uBCC0 \uCC28\uC6D0\uC774 \uB9DE\uACE0, \uC190\uACC4\uC0B0 \uC608\uC81C\uC640 \uCF54\uB4DC \uACB0\uACFC\uB97C \uBE44\uAD50\uD560 \uC218 \uC788\uB2E4.",
      "\uADF8\uB798\uD504 \uD574\uC11D: \uC774 \uB2E8\uC6D0\uC758 \uBBF8\uB2C8 \uADF8\uB798\uD504\uB294 \uC2DD\uC758 \uAC12\uC774 \uBC14\uB014 \uB54C \uC0C1\uD0DC, \uC624\uCC28, \uBE44\uC6A9, \uACF5\uBD84\uC0B0, \uACBD\uB85C\uAC00 \uC5B4\uB5BB\uAC8C \uBCC0\uD558\uB294\uC9C0 \uC2DC\uAC01\uC801\uC73C\uB85C \uBCF4\uC5EC\uC900\uB2E4.",
      "\uAD6C\uD604 \uC5F0\uACB0: C++/Python \uD0C0\uC774\uD551 \uC2E4\uC2B5\uC740 \uAD6C\uC870\uC640 API \uAC10\uAC01\uC744 \uB9CC\uB4E4\uACE0, \uC2E4\uD589 \uAC00\uB2A5\uD55C JS \uC2E4\uC2B5\uC740 \uAC19\uC740 \uC218\uC2DD\uC744 \uC989\uC2DC \uC2E4\uD589\uD574 \uC22B\uC790\uC640 \uADF8\uB798\uD504\uB85C \uAC80\uC0B0\uD55C\uB2E4.",
      ...unit.details
    ] : unit.details,
    formulas: (index === 0 ? [
      {
        label: `${topic.title} \uC0C1\uD0DC \uBAA8\uB378`,
        expression: "y = f(x, u, theta, t) + epsilon",
        description: "\uC0C1\uD0DC, \uC785\uB825, \uD30C\uB77C\uBBF8\uD130, \uC2DC\uAC04, \uB178\uC774\uC988\uB97C \uBD84\uB9AC\uD574 \uAD6C\uD604 \uAC00\uB2A5\uD55C \uAD00\uACC4\uB85C \uB9CC\uB4E0\uB2E4."
      },
      ...unit.formulas
    ] : unit.formulas).map((formula2) => ({ ...formula2, expression: latexExpression(formula2.expression) })),
    derivation: index === 0 ? [
      "\uC138\uC158\uC758 \uBB3C\uB9AC\uB7C9\uC744 \uC0C1\uD0DC x, \uC785\uB825 u, \uD30C\uB77C\uBBF8\uD130 theta, \uCD9C\uB825 y\uB85C \uB098\uB208\uB2E4.",
      "\uC88C\uD45C\uACC4\uC640 \uB2E8\uC704\uB97C \uBA85\uC2DC\uD574 \uAC19\uC740 frame\uC5D0\uC11C \uACC4\uC0B0\uD55C\uB2E4.",
      "\uD575\uC2EC \uACF5\uC2DD\uC744 \uC190\uACC4\uC0B0 \uC608\uC81C\uC5D0 \uC801\uC6A9\uD55C\uB2E4.",
      "\uB3D9\uC77C\uD55C \uC2DD\uC744 \uCF54\uB4DC \uD568\uC218\uB85C \uC62E\uAE30\uACE0 \uB85C\uADF8 metric\uC73C\uB85C \uAC80\uC99D\uD55C\uB2E4.",
      ...unit.derivation
    ] : unit.derivation,
    proof: index === 0 ? [
      "\uAC19\uC740 \uC88C\uD45C\uACC4\uC640 \uB2E8\uC704\uB97C \uC4F0\uBA74 \uC2DD\uC758 \uC88C\uBCC0\uACFC \uC6B0\uBCC0\uC774 \uAC19\uC740 \uBB3C\uB9AC \uCC28\uC6D0\uC744 \uAC16\uB294\uB2E4.",
      "\uC190\uACC4\uC0B0\uACFC \uCF54\uB4DC \uC2E4\uD589 \uACB0\uACFC\uAC00 \uD5C8\uC6A9 \uC624\uCC28 \uC548\uC5D0\uC11C \uC77C\uCE58\uD558\uBA74 \uAD6C\uD604\uC774 \uC774\uB860\uC2DD\uC744 \uBCF4\uC874\uD588\uB2E4\uB294 1\uCC28 \uC99D\uAC70\uAC00 \uB41C\uB2E4.",
      "\uD30C\uB77C\uBBF8\uD130\uB97C \uBC14\uAFE8\uC744 \uB54C \uADF8\uB798\uD504\uC640 metric \uBCC0\uD654\uAC00 \uC9C1\uAD00\uACFC \uB9DE\uC73C\uBA74 \uBAA8\uB378\uC758 \uD574\uC11D \uAC00\uB2A5\uC131\uC774 \uCEE4\uC9C4\uB2E4.",
      ...unit.proof
    ] : unit.proof,
    figures,
    graphExplanations: figures.map((figure) => `${figure.title}: ${figure.explanation}`),
    sourceIds: [.../* @__PURE__ */ new Set([...unit.sourceIds ?? [], ...sourceIds])],
    readingGuide: [...unit.readingGuide ?? [], ...readingGuideForTopic(section, topic)].slice(0, 4)
  }));
};
const upgradeSection = (section) => {
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
      checks: section.cppPractice.checks?.length ? section.cppPractice.checks : section.cppPractice.tasks
    },
    pythonPractice: {
      ...section.pythonPractice,
      simulationId,
      executableJsStarter: executableStarter(executableLabId),
      executableJsSolution: executableStarter(executableLabId),
      expectedResultShape: expectedResultShape(executableLabId),
      checks: section.pythonPractice.checks?.length ? section.pythonPractice.checks : section.pythonPractice.tasks
    },
    graphIds,
    executableLabId
  };
};
const expandSections = (section) => microTopicsBySection(section).map((topic) => {
  const graphIds = topic.graphIds ?? section.graphIds ?? graphIdsBySection(section.id);
  const executableLabId = topic.executableLabId ?? section.executableLabId ?? executableLabBySection(section.id);
  const jsStarter = executableStarter(executableLabId);
  const sourceIds = sourceIdsForTopic(section, topic);
  const questions = [
    ...scenarioQuestionsForTopic(section, topic),
    ...topicQuestions(section, topic),
    ...section.quiz.map((question) => cloneQuestionForTopic(question, section, topic))
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
      ...theoryForTopic(section, topic, graphIds)
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
      examples: practiceExamplesForTopic(section, topic, "cpp")
    },
    pythonPractice: {
      ...section.pythonPractice,
      executableJsStarter: jsStarter,
      executableJsSolution: jsStarter,
      expectedResultShape: expectedResultShape(executableLabId),
      examples: practiceExamplesForTopic(section, topic, "python")
    },
    checklist: [
      `${topic.title}\uC758 \uC815\uC758, \uC9C1\uAD00, \uC218\uC2DD, \uC99D\uBA85 \uD750\uB984\uC744 \uC124\uBA85\uD560 \uC218 \uC788\uB2E4.`,
      `${topic.title}\uC758 \uACC4\uC0B0 \uC608\uC81C\uB97C \uC190\uC73C\uB85C \uD480\uACE0 \uBE0C\uB77C\uC6B0\uC800 \uC2E4\uD589 \uACB0\uACFC\uC640 \uBE44\uAD50\uD588\uB2E4.`,
      `${topic.title}\uC758 \uCF54\uB4DC \uC2E4\uC2B5\uC744 \uC9C1\uC811 \uD0C0\uC774\uD551\uD558\uACE0 \uAD6C\uC870 \uAC80\uC0AC\uB97C \uD1B5\uACFC\uD588\uB2E4.`,
      `${topic.title}\uC758 \uADF8\uB798\uD504 \uB610\uB294 \uC2DC\uBBAC\uB808\uC774\uC158 \uACB0\uACFC\uB97C \uB85C\uADF8/metric \uAD00\uC810\uC73C\uB85C \uD574\uC11D\uD588\uB2E4.`,
      ...section.checklist.slice(0, 2)
    ]
  };
});
const rawCurriculum = [
  {
    id: "overview",
    title: "0. \uD55C\uB208\uC5D0 \uBCF4\uB294 \uACB0\uB860",
    summary: "Physical AI \uAE30\uCD08\uC5ED\uB7C9\uC744 \uC218\uD559, \uB85C\uBD07, \uC13C\uC11C, \uC81C\uC5B4, AI, ROS 2 \uC2DC\uC2A4\uD15C\uC73C\uB85C \uBB36\uC5B4 \uBCF4\uB294 \uCD9C\uBC1C\uC810.",
    sections: [
      {
        id: "overview-core",
        title: "\uD575\uC2EC \uC9C8\uBB38\uACFC 6\uCD95 \uC9C0\uB3C4",
        focus: "\uBB38\uC11C\uB97C \uB05D\uAE4C\uC9C0 \uB530\uB77C\uAC14\uC744 \uB54C \uC124\uBA85\uD558\uACE0 \uAD6C\uD604\uD560 \uC218 \uC788\uC5B4\uC57C \uD558\uB294 \uAE30\uC900\uC744 \uC138\uC6B4\uB2E4.",
        theory: [
          "\uB85C\uBD07\uD314\uC740 \uC704\uCE58, \uC790\uC138, \uC18D\uB3C4, \uD798, \uD1A0\uD06C\uB97C \uC218\uC2DD\uC73C\uB85C \uC124\uBA85\uD574\uC57C \uD55C\uB2E4.",
          "\uBAA8\uBC14\uC77C \uB85C\uBD07\uC740 \uC704\uCE58\uCD94\uC815, \uB9F5\uD551, \uACBD\uB85C\uACC4\uD68D, \uB85C\uCEEC \uC81C\uC5B4 \uD750\uB984\uC744 \uC5F0\uACB0\uD574\uC11C \uBD10\uC57C \uD55C\uB2E4.",
          "AI\uB294 Python \uD559\uC2B5 \uC2E4\uD5D8\uACFC C++/ROS 2 \uBC30\uD3EC \uAC10\uAC01\uC744 \uBD84\uB9AC\uD574\uC11C \uC775\uD78C\uB2E4.",
          "\uD504\uB86C\uD504\uD2B8, \uCEE8\uD14D\uC2A4\uD2B8, \uD558\uB124\uC2A4 \uC5D4\uC9C0\uB2C8\uC5B4\uB9C1\uC740 LLM \uAE30\uBC18 \uB85C\uBD07 \uC2DC\uC2A4\uD15C\uC758 \uD3C9\uAC00\uC640 \uC548\uC815\uC131\uC744 \uB2F4\uB2F9\uD55C\uB2E4.",
          "\uC804\uCCB4 \uC9C0\uB3C4\uB294 \uC218\uD559/\uD45C\uD604, \uC6B4\uB3D9\uD559/\uB3D9\uC5ED\uD559, \uC13C\uC11C/\uC778\uC2DD, \uACC4\uD68D/\uC81C\uC5B4, AI \uCD94\uB860/\uBC30\uD3EC, ROS 2 \uC2DC\uC2A4\uD15C\uD654\uC758 6\uCD95\uC774\uB2E4."
        ],
        why: [
          "Physical AI\uB294 \uB2E8\uC77C \uBAA8\uB378\uBCF4\uB2E4 \uBB3C\uB9AC \uC2DC\uC2A4\uD15C \uC548\uC5D0\uC11C \uC54C\uACE0\uB9AC\uC998\uC744 \uC5F0\uACB0\uD558\uB294 \uB2A5\uB825\uC774 \uC911\uC694\uD558\uB2E4.",
          "\uCD08\uBC18\uC5D0 \uD070 \uC9C0\uB3C4\uB97C \uC7A1\uC544\uC57C \uB85C\uBD07\uD314, \uC790\uC728\uC8FC\uD589, AI, ROS 2 \uC2E4\uC2B5\uC774 \uB530\uB85C \uB180\uC9C0 \uC54A\uB294\uB2E4."
        ],
        cppPractice: cpp(
          "\uD559\uC2B5 \uC9C4\uD589\uB3C4 \uB370\uC774\uD130 \uAD6C\uC870",
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
          "\uC139\uC158\uBCC4 \uC774\uB860 \uC644\uB8CC\uC640 \uCD5C\uACE0 \uC810\uC218\uB97C \uAD6C\uC870\uD654\uD574 \uC800\uC7A5\uD558\uB294 \uAC10\uAC01\uC744 \uC5BB\uB294\uB2E4.",
          ["\uC139\uC158 id\uB97C \uCD94\uAC00\uD55C\uB2E4.", "CSV \uC800\uC7A5 \uD568\uC218\uB97C \uBD99\uC778\uB2E4.", "\uC810\uC218\uAC00 \uB0AE\uC544\uC9C0\uBA74 \uB36E\uC5B4\uC4F0\uC9C0 \uC54A\uB3C4\uB85D \uC218\uC815\uD55C\uB2E4."]
        ),
        pythonPractice: py(
          "\uD559\uC2B5 \uCD95 \uC9C4\uB2E8\uD45C",
          `
axes = ["math", "manipulator", "mobile", "sensor", "control", "ai", "ros2"]
scores = dict.fromkeys(axes, 0)
scores["math"] = 2
scores["manipulator"] = 1

for name, score in scores.items():
    print(name, "#" * score)
          `,
          "\uB0B4\uAC00 \uC5B4\uB290 \uCD95\uC744 \uB354 \uACF5\uBD80\uD574\uC57C \uD558\uB294\uC9C0 \uAC04\uB2E8\uD55C \uD14D\uC2A4\uD2B8 \uADF8\uB798\uD504\uB85C \uD655\uC778\uD55C\uB2E4.",
          ["\uC810\uC218 \uBC94\uC704\uB97C 0-5\uB85C \uD655\uC7A5\uD55C\uB2E4.", "matplotlib \uB9C9\uB300\uADF8\uB798\uD504\uB85C \uBC14\uAFBC\uB2E4.", "JSON \uD30C\uC77C \uC800\uC7A5\uC744 \uCD94\uAC00\uD55C\uB2E4."]
        ),
        quiz: [
          {
            id: "overview-q1",
            type: "choice",
            prompt: "PDF\uAC00 Physical AI \uAE30\uCD08\uC5ED\uB7C9\uC744 \uBCFC \uB54C \uC81C\uC2DC\uD55C \uD575\uC2EC \uCD95\uC774 \uC544\uB2CC \uAC83\uC740?",
            choices: ["\uC13C\uC11C/\uC778\uC2DD", "\uACC4\uD68D/\uC81C\uC5B4", "AI \uCD94\uB860/\uBC30\uD3EC", "\uAD11\uACE0 \uCEA0\uD398\uC778 \uC6B4\uC601"],
            answer: "\uAD11\uACE0 \uCEA0\uD398\uC778 \uC6B4\uC601",
            explanation: "\uBB38\uC11C\uB294 \uB85C\uBD07\uACFC AI \uC2DC\uC2A4\uD15C \uD1B5\uD569\uC5D0 \uD544\uC694\uD55C \uAE30\uC220 \uCD95\uC744 \uB2E4\uB8EC\uB2E4."
          },
          {
            id: "overview-q2",
            type: "trueFalse",
            prompt: "\uC774 \uAC00\uC774\uB4DC\uC758 \uBAA9\uD45C\uB294 \uB300\uD615 \uD504\uB85C\uC81D\uD2B8 \uC608\uC2DC\uBCF4\uB2E4 \uAE30\uCD08 \uC774\uB860\uACFC C++/Python \uAD6C\uD604 \uC2E4\uC2B5\uC774\uB2E4.",
            choices: ["\uCC38", "\uAC70\uC9D3"],
            answer: "\uCC38",
            explanation: "PDF\uB294 \uD504\uB85C\uC81D\uD2B8 \uC608\uC2DC\uB97C \uC81C\uC678\uD558\uACE0 \uAE30\uCD08 \uC774\uB860\uACFC \uAD6C\uD604 \uC2E4\uC2B5 \uC911\uC2EC\uC73C\uB85C \uC815\uB9AC\uD55C\uB2E4\uACE0 \uBC1D\uD78C\uB2E4."
          }
        ],
        checklist: [
          "\uB124 \uCD95: \uB85C\uBD07\uD314, \uC790\uC728\uC8FC\uD589, AI, \uD504\uB86C\uD504\uD2B8/\uCEE8\uD14D\uC2A4\uD2B8/\uD558\uB124\uC2A4\uB97C \uB9D0\uD560 \uC218 \uC788\uB2E4.",
          "6\uCD95 \uC9C0\uB3C4\uC5D0\uC11C \uB0B4\uAC00 \uC57D\uD55C \uCD95\uC744 \uD45C\uC2DC\uD588\uB2E4.",
          "Python \uAC80\uC0B0, C++ \uAD6C\uD604, ROS 2 \uC5F0\uACB0, \uB85C\uADF8 \uAE30\uB85D\uC758 \uBC18\uBCF5 \uD750\uB984\uC744 \uC124\uBA85\uD560 \uC218 \uC788\uB2E4."
        ]
      }
    ]
  },
  {
    id: "prerequisites",
    title: "1. \uACF5\uD1B5 \uC120\uC218\uC9C0\uC2DD",
    summary: "\uC218\uD559, C++/Python, ROS 2, \uC2E4\uD5D8 \uAE30\uB85D \uB3C4\uAD6C\uB97C \uAC19\uC740 \uD559\uC2B5 \uAE30\uBC18\uC73C\uB85C \uBB36\uB294\uB2E4.",
    sections: [
      {
        id: "math-foundations",
        title: "\uC218\uD559: \uC120\uD615\uB300\uC218, \uBBF8\uBD84, \uD655\uB960, \uCD5C\uC801\uD654",
        focus: "FK/IK, EKF, SLAM, \uC2E0\uACBD\uB9DD, \uC81C\uC5B4\uB97C \uC9C0\uD0F1\uD558\uB294 \uCD5C\uC18C \uC218\uD559\uC744 \uAD6C\uD604 \uAC00\uB2A5\uD55C \uC218\uC900\uC73C\uB85C \uC775\uD78C\uB2E4.",
        theory: [
          "\uC120\uD615\uB300\uC218: \uBCA1\uD130, \uB0B4\uC801/\uC678\uC801, \uD589\uB82C\uACF1, \uC5ED\uD589\uB82C, \uD68C\uC804\uD589\uB82C, \uC88C\uD45C\uACC4 \uBCC0\uD658, SVD, pseudoinverse.",
          "\uBBF8\uBD84: \uC18D\uB3C4\uC640 \uAC00\uC18D\uB3C4\uC758 \uBB3C\uB9AC\uC801 \uC758\uBBF8, \uD3B8\uBBF8\uBD84, chain rule, gradient, Jacobian.",
          "\uD655\uB960: \uD3C9\uADE0, \uBD84\uC0B0, \uACF5\uBD84\uC0B0, Gaussian, likelihood, Bayes, process/measurement noise.",
          "\uCD5C\uC801\uD654: gradient descent, Gauss-Newton, Levenberg-Marquardt, Euler/RK \uC801\uBD84\uC758 \uAC10\uAC01."
        ],
        why: [
          "\uB85C\uBD07\uD314 FK/IK/Jacobian, EKF/SLAM \uC0C1\uD0DC\uCD94\uC815, \uCE74\uBA54\uB77C/\uB77C\uC774\uB2E4 \uC88C\uD45C\uBCC0\uD658\uC774 \uBAA8\uB450 \uD589\uB82C\uACFC \uBBF8\uBD84 \uC704\uC5D0 \uC788\uB2E4.",
          "\uBAA8\uB378 \uD559\uC2B5\uACFC \uC13C\uC11C\uD4E8\uC804\uC740 \uD655\uB960\uACFC \uCD5C\uC801\uD654 \uC5C6\uC774 \uD29C\uB2DD \uAC10\uAC01\uB9CC\uC73C\uB85C \uB2E4\uB8E8\uAE30 \uC5B4\uB835\uB2E4."
        ],
        cppPractice: cpp(
          "2D \uD68C\uC804\uD589\uB82C\uACFC homogeneous transform",
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
          "\uC88C\uD45C\uACC4 \uBCC0\uD658\uC744 \uD589\uB82C\uACF1\uC73C\uB85C \uC5F0\uACB0\uD558\uACE0 \uC5ED\uBCC0\uD658\uC744 \uAC80\uC0B0\uD55C\uB2E4.",
          ["\uB450 transform\uC744 \uACF1\uD574 frame composition\uC744 \uD655\uC778\uD55C\uB2E4.", "\uC5ED\uD589\uB82C\uACFC \uC9C1\uC811 inverse \uACF5\uC2DD\uC744 \uBE44\uAD50\uD55C\uB2E4.", "SVD \uAE30\uBC18 pseudoinverse \uD568\uC218\uB97C \uCD94\uAC00\uD55C\uB2E4."]
        ),
        pythonPractice: py(
          "\uD68C\uC804 \uBCA1\uD130 \uC2DC\uAC01\uD654",
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
          "\uD68C\uC804 \uC804\uD6C4 \uBCA1\uD130\uB97C \uADF8\uB9BC\uC73C\uB85C \uBE44\uAD50\uD55C\uB2E4.",
          ["\uAC01\uB3C4\uB97C \uBC14\uAFB8\uBA70 \uACB0\uACFC\uB97C \uBE44\uAD50\uD55C\uB2E4.", "3D \uD68C\uC804\uD589\uB82C\uB85C \uD655\uC7A5\uD55C\uB2E4.", "\uC218\uCE58 \uBBF8\uBD84\uACFC \uD574\uC11D \uBBF8\uBD84\uC744 \uBE44\uAD50\uD55C\uB2E4."]
        ),
        visualizerId: "linear-algebra",
        quiz: [
          {
            id: "math-q1",
            type: "choice",
            prompt: "Jacobian\uC774 \uD2B9\uD788 \uD544\uC694\uD55C \uD559\uC2B5 \uC8FC\uC81C\uB294?",
            choices: ["IK\uC640 \uC18D\uB3C4\uAE30\uAD6C\uD559", "Markdown \uC81C\uBAA9 \uAFB8\uBBF8\uAE30", "\uD30C\uC77C\uBA85 \uC815\uB82C", "\uC6F9 \uD3F0\uD2B8 \uC120\uD0DD"],
            answer: "IK\uC640 \uC18D\uB3C4\uAE30\uAD6C\uD559",
            explanation: "Jacobian\uC740 \uAD00\uC808\uC18D\uB3C4\uC640 \uB9D0\uB2E8\uC18D\uB3C4\uC758 \uAD00\uACC4, \uC218\uCE58 IK, singularity \uBD84\uC11D\uC5D0 \uC9C1\uC811 \uC4F0\uC778\uB2E4."
          },
          {
            id: "math-q2",
            type: "blank",
            prompt: "\uCE21\uC815 \uB178\uC774\uC988\uC640 \uD504\uB85C\uC138\uC2A4 \uB178\uC774\uC988\uB97C \uB2E4\uB8E8\uB294 \uB300\uD45C \uD655\uB960 \uD544\uD130\uB294 ____ Filter\uC774\uB2E4.",
            answer: "Kalman",
            explanation: "Kalman Filter\uC640 EKF\uB294 \uC13C\uC11C\uD4E8\uC804\uACFC \uC704\uCE58\uCD94\uC815\uC758 \uAE30\uBCF8 \uB3C4\uAD6C\uB2E4."
          }
        ],
        checklist: [
          "2D/3D \uD68C\uC804\uD589\uB82C\uC744 \uC9C1\uC811 \uB9CC\uB4E4 \uC218 \uC788\uB2E4.",
          "homogeneous transform\uC758 \uACF1\uACFC inverse\uB97C \uC124\uBA85\uD560 \uC218 \uC788\uB2E4.",
          "pseudoinverse\uAC00 IK\uC5D0\uC11C \uC65C \uD544\uC694\uD55C\uC9C0 \uB9D0\uD560 \uC218 \uC788\uB2E4.",
          "Gaussian noise\uAC00 \uCD94\uC815\uAC12\uC5D0 \uBBF8\uCE58\uB294 \uC601\uD5A5\uC744 \uADF8\uB798\uD504\uB85C \uBD24\uB2E4."
        ]
      },
      {
        id: "cpp-python-ros2",
        title: "C++/Python/ROS 2 \uACF5\uD1B5 \uCD95",
        focus: "\uBE60\uB978 \uAC80\uC0B0\uC740 Python, \uC7AC\uC0AC\uC6A9/\uBC30\uD3EC\uB294 C++, \uD1B5\uD569\uC740 ROS 2\uB85C \uB098\uB204\uC5B4 \uC775\uD78C\uB2E4.",
        theory: [
          "C++: class/struct, STL, smart pointer, template, lambda, CMake, \uB77C\uC774\uBE0C\uB7EC\uB9AC \uB9C1\uD06C, timer loop.",
          "Python: type hint, venv/conda, NumPy, matplotlib, pandas, Jupyter, OpenCV, PyTorch, argparse/logging.",
          "ROS 2 Humble: workspace/package/colcon, rclcpp/rclpy, topic/service/action, launch/params, tf2, rosbag2, RViz2.",
          "\uC2E4\uD5D8 \uAE30\uB85D: CSV logging, matplotlib, rosbag2, Foxglove, Git, Markdown\uC73C\uB85C \uC7AC\uD604\uC131\uC744 \uB0A8\uAE34\uB2E4."
        ],
        why: [
          "Physical AI\uB294 \uC54C\uACE0\uB9AC\uC998 \uB2E8\uD488\uBCF4\uB2E4 \uB178\uB4DC, \uD1A0\uD53D, \uD30C\uB77C\uBBF8\uD130, \uB85C\uADF8\uB97C \uBB36\uC740 \uC2DC\uC2A4\uD15C\uC73C\uB85C \uAC80\uC99D\uB41C\uB2E4.",
          "\uC2E4\uD5D8 \uD30C\uB77C\uBBF8\uD130\uC640 \uC2E4\uD328 \uB85C\uADF8\uB97C \uB0A8\uACA8\uC57C \uD29C\uB2DD\uC774 \uAC10\uC774 \uC544\uB2C8\uB77C \uBE44\uAD50\uAC00 \uB41C\uB2E4."
        ],
        cppPractice: cpp(
          "CSV logger\uC640 timer loop",
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
          "\uB8E8\uD504 \uC8FC\uAE30\uB97C \uC218\uCE58\uB85C \uAE30\uB85D\uD558\uACE0 \uC81C\uC5B4 \uC8FC\uAE30 \uD754\uB4E4\uB9BC\uC744 \uD655\uC778\uD55C\uB2E4.",
          ["\uD3C9\uADE0/\uCD5C\uB300/\uCD5C\uC18C \uC8FC\uAE30\uB97C \uCD9C\uB825\uD55C\uB2E4.", "YAML config\uB85C \uBAA9\uD45C Hz\uB97C \uBC14\uAFBC\uB2E4.", "ROS 2 timer callback\uC73C\uB85C \uC62E\uAE34\uB2E4."]
        ),
        pythonPractice: py(
          "\uB85C\uADF8 \uD6C4\uCC98\uB9AC",
          `
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("loop.csv")
print(df["dt_ms"].describe())
df["dt_ms"].plot(title="Control loop period")
plt.ylabel("ms")
plt.show()
          `,
          "C++\uC5D0\uC11C \uB0A8\uAE34 \uB85C\uADF8\uB97C Python\uC73C\uB85C \uC77D\uACE0 \uC8FC\uAE30 \uC548\uC815\uC131\uC744 \uD655\uC778\uD55C\uB2E4.",
          ["\uD788\uC2A4\uD1A0\uADF8\uB7A8\uC744 \uCD94\uAC00\uD55C\uB2E4.", "deadline miss \uBE44\uC728\uC744 \uACC4\uC0B0\uD55C\uB2E4.", "rosbag2 \uD6C4\uCC98\uB9AC \uC2A4\uD06C\uB9BD\uD2B8\uB85C \uD655\uC7A5\uD55C\uB2E4."]
        ),
        visualizerId: "latency",
        quiz: [
          {
            id: "ros2-q1",
            type: "choice",
            prompt: "ROS 2\uC5D0\uC11C frame \uAD00\uACC4\uB97C \uAD00\uB9AC\uD560 \uB54C \uD575\uC2EC \uB3C4\uAD6C\uB294?",
            choices: ["tf2", "printf", "HTML form", "npm"],
            answer: "tf2",
            explanation: "map, odom, base_link, sensor frame\uC744 \uC5F0\uACB0\uD558\uB294 \uB370 tf2\uAC00 \uD575\uC2EC\uC774\uB2E4."
          },
          {
            id: "ros2-q2",
            type: "trueFalse",
            prompt: "\uC2E4\uD5D8\uC740 \uD30C\uB77C\uBBF8\uD130, \uC2E4\uD328 \uB85C\uADF8, \uACB0\uACFC \uADF8\uB798\uD504\uAC00 \uB0A8\uC544\uC57C \uC7AC\uD604 \uAC00\uB2A5\uD558\uB2E4.",
            choices: ["\uCC38", "\uAC70\uC9D3"],
            answer: "\uCC38",
            explanation: "PDF\uC758 \uACF5\uD1B5 \uC6D0\uCE59\uC740 \uC7AC\uD604 \uAC00\uB2A5\uD55C \uC2E4\uD5D8\uACFC \uC790\uB3D9 \uC800\uC7A5\uB41C \uACB0\uACFC\uB2E4."
          }
        ],
        checklist: [
          "CMake\uB85C \uC678\uBD80 \uB77C\uC774\uBE0C\uB7EC\uB9AC\uB97C \uB9C1\uD06C\uD574\uBD24\uB2E4.",
          "rclcpp \uB610\uB294 rclpy publisher/subscriber skeleton\uC744 \uC791\uC131\uD588\uB2E4.",
          "launch \uD30C\uC77C\uACFC YAML \uD30C\uB77C\uBBF8\uD130\uB97C \uC5F0\uACB0\uD574\uBD24\uB2E4.",
          "CSV\uB098 rosbag2\uB85C \uC2E4\uD5D8 \uB85C\uADF8\uB97C \uB0A8\uACBC\uB2E4."
        ]
      }
    ]
  },
  {
    id: "manipulator",
    title: "2. \uB85C\uBD07\uD314 Manipulator",
    summary: "\uC88C\uD45C\uACC4, FK/IK, Jacobian, \uB3D9\uC5ED\uD559, trajectory, \uC81C\uC5B4, URDF/MoveIt/ros2_control\uAE4C\uC9C0 \uC5F0\uACB0\uD55C\uB2E4.",
    sections: [
      {
        id: "manipulator-kinematics",
        title: "\uC88C\uD45C\uACC4, FK, IK, Jacobian",
        focus: "\uAD00\uC808\uAC01\uC5D0\uC11C \uB9D0\uB2E8 pose\uB97C \uAD6C\uD558\uACE0, \uBAA9\uD45C pose\uC5D0\uC11C \uAD00\uC808\uAC01\uC744 \uCC3E\uC73C\uBA70, \uC18D\uB3C4\uC640 \uD798 \uBCC0\uD658\uAE4C\uC9C0 \uC5F0\uACB0\uD55C\uB2E4.",
        theory: [
          "\uC790\uC138\uD45C\uD604: rotation matrix, Euler angle, axis-angle, quaternion, homogeneous transform.",
          "DH\uC640 PoE\uB294 \uAC19\uC740 FK \uBB38\uC81C\uB97C \uB2E4\uB978 \uD45C\uAE30\uBC95\uC73C\uB85C \uD478\uB294 \uB300\uD45C \uBC29\uC2DD\uC774\uB2E4.",
          "FK\uB294 \uB9C1\uD06C-\uC870\uC778\uD2B8 \uCCB4\uC778\uC758 transform multiplication\uC73C\uB85C end-effector pose\uB97C \uAD6C\uD55C\uB2E4.",
          "IK\uB294 \uD574\uC11D\uC801 IK, Jacobian pseudoinverse, damped least squares, joint limit handling\uC73C\uB85C \uB098\uB25C\uB2E4.",
          "Jacobian\uC740 xdot = J(q) qdot, tau = J^T F, singularity, manipulability\uB97C \uC5F0\uACB0\uD55C\uB2E4."
        ],
        why: [
          "MoveIt, tf2, URDF\uC5D0\uC11C \uB9C9\uD788\uB294 \uB300\uBD80\uBD84\uC758 \uCD08\uBC18 \uBB38\uC81C\uB294 frame\uACFC pose \uD45C\uD604\uC758 \uD63C\uB3D9\uC5D0\uC11C \uC2DC\uC791\uD55C\uB2E4.",
          "IK\uC640 Jacobian\uC744 \uC9C1\uC811 \uAD6C\uD604\uD574\uC57C planner/controller \uACB0\uACFC\uB97C \uC2E0\uB8B0\uD558\uACE0 \uB514\uBC84\uAE45\uD560 \uC218 \uC788\uB2E4."
        ],
        cppPractice: cpp(
          "2\uB9C1\uD06C FK\uC640 Jacobian",
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
          "FK \uACB0\uACFC\uC640 numerical Jacobian\uC744 \uBE44\uAD50\uD558\uACE0 singularity \uADFC\uCC98 condition number\uB97C \uD655\uC778\uD55C\uB2E4.",
          ["\uD574\uC11D\uC801 IK\uB97C \uCD94\uAC00\uD55C\uB2E4.", "DLS IK \uBC18\uBCF5 \uB8E8\uD504\uB97C \uB9CC\uB4E0\uB2E4.", "joint limit clamp\uB97C \uCD94\uAC00\uD55C\uB2E4."]
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
          "reachable workspace\uB97C \uC0B0\uC810\uB3C4\uB85C \uD655\uC778\uD55C\uB2E4.",
          ["manipulability heatmap\uC744 \uCD94\uAC00\uD55C\uB2E4.", "target\uBCC4 IK \uC218\uB834 \uD69F\uC218\uB97C \uD45C\uC2DC\uD55C\uB2E4.", "\uCD08\uAE30\uAC12\uC744 \uBC14\uAFD4 local minimum\uC744 \uAD00\uCC30\uD55C\uB2E4."]
        ),
        visualizerId: "manipulator",
        quiz: [
          {
            id: "manipulator-q1",
            type: "choice",
            prompt: "\uAD00\uC808\uC18D\uB3C4 qdot\uACFC \uB9D0\uB2E8\uC18D\uB3C4 xdot\uC758 \uAD00\uACC4\uB97C \uB098\uD0C0\uB0B4\uB294 \uC2DD\uC740?",
            choices: ["xdot = J(q) qdot", "F = ma\uB9CC \uC0AC\uC6A9", "loss = accuracy", "map = list"],
            answer: "xdot = J(q) qdot",
            explanation: "Jacobian\uC740 \uC18D\uB3C4\uAE30\uAD6C\uD559\uC758 \uD575\uC2EC \uD589\uB82C\uC774\uB2E4."
          },
          {
            id: "manipulator-q2",
            type: "blank",
            prompt: "singularity \uADFC\uCC98\uC5D0\uC11C pseudoinverse IK\uB97C \uC548\uC815\uD654\uD558\uAE30 \uC704\uD574 \uC790\uC8FC \uC4F0\uB294 \uBC29\uBC95\uC740 damped ____ squares\uC774\uB2E4.",
            answer: "least",
            explanation: "DLS\uB294 singularity \uADFC\uCC98\uC5D0\uC11C \uD070 \uAD00\uC808\uC18D\uB3C4\uAC00 \uD280\uB294 \uBB38\uC81C\uB97C \uC904\uC778\uB2E4."
          }
        ],
        checklist: [
          "2\uB9C1\uD06C FK\uB97C \uC9C1\uC811 \uC720\uB3C4\uD558\uACE0 \uAD6C\uD604\uD588\uB2E4.",
          "2\uB9C1\uD06C \uD574\uC11D\uC801 IK\uC640 \uC218\uCE58 IK\uC758 \uCC28\uC774\uB97C \uC124\uBA85\uD560 \uC218 \uC788\uB2E4.",
          "Jacobian\uC744 \uD574\uC11D/\uC218\uCE58 \uBBF8\uBD84\uC73C\uB85C \uBE44\uAD50\uD588\uB2E4.",
          "singularity\uC640 manipulability\uB97C \uADF8\uB9BC\uC73C\uB85C \uD655\uC778\uD588\uB2E4."
        ]
      },
      {
        id: "manipulator-dynamics-control",
        title: "\uB3D9\uC5ED\uD559, trajectory, \uC81C\uC5B4, ROS 2 \uC5F0\uACB0",
        focus: "\uD1A0\uD06C\uC640 \uAC00\uC18D\uB3C4, \uC2DC\uAC04\uCD95 \uADA4\uC801, PD/\uC911\uB825\uBCF4\uC0C1, URDF/MoveIt/ros2_control\uC758 \uC5F0\uACB0\uC744 \uC775\uD78C\uB2E4.",
        theory: [
          "\uB3D9\uC5ED\uD559\uC740 M(q), C(q,qdot), g(q), friction, motor/gearbox \uC601\uD5A5\uC73C\uB85C \uAD6C\uC131\uB41C\uB2E4.",
          "trajectory generation\uC740 cubic/quintic polynomial, trapezoidal velocity, time parameterization\uC744 \uB2E4\uB8EC\uB2E4.",
          "\uC81C\uC5B4\uB294 PD/PID, gravity compensation, computed torque, impedance/admittance, task-space control\uB85C \uD655\uC7A5\uB41C\uB2E4.",
          "ROS 2 \uC5F0\uACB0\uC740 URDF/Xacro, robot_state_publisher, joint state publisher, MoveIt 2, ros2_control\uB85C \uC774\uC5B4\uC9C4\uB2E4."
        ],
        why: [
          "FK/IK\uB9CC \uB9DE\uC544\uB3C4 \uC2E4\uC81C \uB85C\uBD07\uC740 \uC81C\uC5B4\uC8FC\uAE30, \uC81C\uD55C, \uD1A0\uD06C, \uCDA9\uB3CC \uB54C\uBB38\uC5D0 \uB2E4\uB974\uAC8C \uC6C0\uC9C1\uC778\uB2E4.",
          "\uC2DC\uBBAC\uB808\uC774\uD130\uC5D0\uC11C \uBA3C\uC800 dynamics\uC640 gain sweep\uC744 \uD574\uBCF4\uBA74 \uD558\uB4DC\uC6E8\uC5B4 \uC704\uD5D8\uC744 \uC904\uC77C \uC218 \uC788\uB2E4."
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
          "position/velocity/acceleration\uC774 \uBD80\uB4DC\uB7FD\uAC8C \uC2DC\uC791\uD558\uACE0 \uB05D\uB098\uB294\uC9C0 \uAC80\uC0B0\uD55C\uB2E4.",
          ["joint limit \uAC80\uC0AC\uAE30\uB97C \uBD99\uC778\uB2E4.", "PD controller \uBAA9\uD45C \uADA4\uC801\uC73C\uB85C \uC0AC\uC6A9\uD55C\uB2E4.", "ROS 2 joint command publisher\uB85C \uAC10\uC2FC\uB2E4."]
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
          "gain \uBCC0\uD654\uC5D0 \uB530\uB978 overshoot\uC640 settling time\uC744 \uBE44\uAD50\uD55C\uB2E4.",
          ["\uC911\uB825\uD56D\uC744 \uCD94\uAC00\uD55C\uB2E4.", "cubic/quintic trajectory\uB97C \uBAA9\uD45C\uB85C \uB123\uB294\uB2E4.", "gain sweep \uACB0\uACFC\uD45C\uB97C \uB9CC\uB4E0\uB2E4."]
        ),
        visualizerId: "sweep",
        quiz: [
          {
            id: "manipulator-control-q1",
            type: "choice",
            prompt: "URDF/Xacro\uC640 \uD568\uAED8 \uB85C\uBD07\uD314 planning\uC744 \uB2E4\uB8F0 \uB54C \uB300\uD45C\uC801\uC73C\uB85C \uC4F0\uB294 ROS 2 \uB3C4\uAD6C\uB294?",
            choices: ["MoveIt 2", "pandas", "Vite", "CSS Grid"],
            answer: "MoveIt 2",
            explanation: "MoveIt 2\uB294 \uB85C\uBD07\uD314 motion planning\uACFC collision/joint limit \uCC98\uB9AC\uB97C \uB2E4\uB8EC\uB2E4."
          },
          {
            id: "manipulator-control-q2",
            type: "trueFalse",
            prompt: "trajectory\uB294 \uC704\uCE58\uB9CC \uB9DE\uC73C\uBA74 \uB418\uACE0 \uC18D\uB3C4/\uAC00\uC18D\uB3C4 \uC5F0\uC18D\uC131\uC740 \uC911\uC694\uD558\uC9C0 \uC54A\uB2E4.",
            choices: ["\uCC38", "\uAC70\uC9D3"],
            answer: "\uAC70\uC9D3",
            explanation: "\uC2E4\uC81C \uB85C\uBD07\uC5D0\uC11C\uB294 \uC18D\uB3C4/\uAC00\uC18D\uB3C4 \uC81C\uD55C\uACFC \uBD80\uB4DC\uB7EC\uC6C0\uC774 \uC548\uC815\uC131\uACFC \uC548\uC804\uC131\uC5D0 \uC9C1\uC811 \uC5F0\uACB0\uB41C\uB2E4."
          }
        ],
        checklist: [
          "cubic \uB610\uB294 quintic trajectory generator\uB97C \uB9CC\uB4E4\uC5C8\uB2E4.",
          "PD\uC640 gravity compensation\uC758 \uCC28\uC774\uB97C \uBE44\uAD50\uD588\uB2E4.",
          "URDF/Xacro, tf, joint state\uC758 \uC5ED\uD560\uC744 \uC124\uBA85\uD560 \uC218 \uC788\uB2E4.",
          "JetRover \uC2E4\uAE30\uC640 \uC2DC\uBBAC\uB808\uC774\uD130 \uC2E4\uD5D8 \uBC94\uC704\uB97C \uAD6C\uBD84\uD588\uB2E4."
        ]
      }
    ]
  },
  {
    id: "mobile",
    title: "3. \uC790\uC728\uC8FC\uD589 / \uBAA8\uBC14\uC77C \uB85C\uBD07",
    summary: "\uC704\uCE58\uCD94\uC815, \uC13C\uC11C, \uB9F5, \uC804\uC5ED/\uB85C\uCEEC planning, \uC81C\uC5B4, Nav2 \uD1B5\uD569\uC744 \uB2E8\uACC4\uBCC4\uB85C \uACF5\uBD80\uD55C\uB2E4.",
    sections: [
      {
        id: "mobile-localization",
        title: "\uC6B4\uB3D9\uD559, \uC13C\uC11C, \uC704\uCE58\uCD94\uC815",
        focus: "2D pose, odometry, encoder/IMU/LiDAR/camera, Kalman/EKF/Particle Filter\uB97C \uC5F0\uACB0\uD55C\uB2E4.",
        theory: [
          "\uC6B4\uB3D9\uD559: 2D pose (x, y, theta), differential drive, bicycle, ackermann, omni, mecanum, odometry.",
          "\uC13C\uC11C: encoder, IMU, LiDAR, camera, GPS, timestamp, synchronization, calibration.",
          "\uC704\uCE58\uCD94\uC815: Kalman Filter, EKF, Particle Filter, SLAM, robot_localization, map/odom/base_link frame.",
          "\uC13C\uC11C\uD4E8\uC804\uC740 covariance\uC640 timestamp\uB97C \uAC19\uC774 \uBD10\uC57C \uC548\uC815\uB41C\uB2E4."
        ],
        why: [
          "\uC790\uC728\uC8FC\uD589\uC758 \uCCAB \uC9C8\uBB38\uC740 \uC9C0\uAE08 \uC5B4\uB514 \uC788\uB294\uC9C0\uC774\uACE0, \uC774 \uB2F5\uC774 \uD754\uB4E4\uB9AC\uBA74 planning/control\uC774 \uBAA8\uB450 \uBD88\uC548\uC815\uD574\uC9C4\uB2E4.",
          "map, odom, base_link \uAD00\uACC4\uB97C \uC774\uD574\uD574\uC57C Nav2\uC640 slam_toolbox \uB514\uBC84\uAE45\uC774 \uAC00\uB2A5\uD558\uB2E4."
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
          "\uC88C\uC6B0 \uBC14\uD034 \uC18D\uB3C4\uC5D0\uC11C pose \uBCC0\uD654\uAC00 \uC5B4\uB5BB\uAC8C \uB098\uC624\uB294\uC9C0 \uD655\uC778\uD55C\uB2E4.",
          ["encoder tick\uC744 \uAC70\uB9AC\uB85C \uBCC0\uD658\uD55C\uB2E4.", "tf broadcaster \uD615\uD0DC\uB85C \uAC10\uC2FC\uB2E4.", "IMU yaw\uC640 wheel odom \uCC28\uC774\uB97C \uB85C\uADF8\uB85C \uB0A8\uAE34\uB2E4."]
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
          "measurement noise\uC640 process noise\uC5D0 \uB530\uB978 \uCD94\uC815\uAC12 \uBCC0\uD654\uB97C \uD655\uC778\uD55C\uB2E4.",
          ["q/r \uAC12\uC744 \uBC14\uAFD4\uBCF8\uB2E4.", "2D EKF prediction/update\uB85C \uD655\uC7A5\uD55C\uB2E4.", "particle filter animation\uC744 \uB9CC\uB4E0\uB2E4."]
        ),
        visualizerId: "mobile-odom",
        quiz: [
          {
            id: "mobile-q1",
            type: "choice",
            prompt: "ROS 2 navigation\uC5D0\uC11C \uC77C\uBC18\uC801\uC73C\uB85C base_link\uC758 \uB204\uC801 \uC704\uCE58\uCD94\uC815\uACFC \uAD00\uB828 \uAE4A\uC740 frame\uC740?",
            choices: ["odom", "npm", "viewport", "shader"],
            answer: "odom",
            explanation: "map -> odom -> base_link \uCCB4\uC778\uC740 localization\uACFC odometry\uB97C \uAD6C\uBD84\uD558\uB294 \uD575\uC2EC \uAD6C\uC870\uB2E4."
          },
          {
            id: "mobile-q2",
            type: "blank",
            prompt: "\uBE44\uC120\uD615 \uC2DC\uC2A4\uD15C\uC758 Kalman Filter \uD655\uC7A5\uC740 \uBCF4\uD1B5 ____\uB77C\uACE0 \uBD80\uB978\uB2E4.",
            answer: "EKF",
            explanation: "Extended Kalman Filter\uB294 \uBE44\uC120\uD615 \uBAA8\uB378\uC744 \uC120\uD615\uD654\uD574 \uC608\uCE21/\uC5C5\uB370\uC774\uD2B8\uB97C \uC218\uD589\uD55C\uB2E4."
          }
        ],
        checklist: [
          "differential drive \uB610\uB294 bicycle model\uC744 \uAD6C\uD604\uD588\uB2E4.",
          "odometry\uB97C \uC9C1\uC811 \uC801\uBD84\uD574 pose trajectory\uB97C \uADF8\uB838\uB2E4.",
          "1D KF\uC640 2D EKF\uC758 \uCC28\uC774\uB97C \uC124\uBA85\uD560 \uC218 \uC788\uB2E4.",
          "map/odom/base_link\uC758 \uC5ED\uD560\uC744 \uB9D0\uD560 \uC218 \uC788\uB2E4."
        ]
      },
      {
        id: "mobile-planning-control",
        title: "\uD658\uACBD\uD45C\uD604, A*, \uB85C\uCEEC \uD50C\uB798\uB108, Nav2",
        focus: "occupancy grid, costmap, global planning, local planning/control, behavior tree\uB97C \uACF5\uBD80\uD55C\uB2E4.",
        theory: [
          "\uD658\uACBD\uD45C\uD604: occupancy grid, costmap, obstacle inflation, camera projection, point cloud filtering, ICP/NDT.",
          "\uC804\uC5ED\uACC4\uD68D: Dijkstra, A*, Hybrid A*, OMPL.",
          "\uB85C\uCEEC \uD50C\uB798\uB108: local costmap, footprint, collision checking, trajectory rollout, DWB, Regulated Pure Pursuit, MPPI, TEB.",
          "\uD589\uB3D9\uACB0\uC815: behavior tree, recovery, replanning, goal preemption.",
          "ROS 2 \uD1B5\uD569: Nav2 planner/controller server, behavior tree navigator, slam_toolbox, robot_localization, rosbag2 \uB514\uBC84\uAE45."
        ],
        why: [
          "\uC804\uC5ED \uACBD\uB85C\uAC00 \uC88B\uC544\uB3C4 \uB85C\uCEEC \uC7A5\uC560\uBB3C\uACFC \uC81C\uC5B4\uAE30\uAC00 \uB9DE\uC9C0 \uC54A\uC73C\uBA74 \uC2E4\uC81C \uB85C\uBD07\uC740 \uBD80\uB4DC\uB7FD\uAC8C \uC6C0\uC9C1\uC774\uC9C0 \uC54A\uB294\uB2E4.",
          "Nav2\uB294 planner, controller, BT, costmap \uD30C\uB77C\uBBF8\uD130\uAC00 \uD568\uAED8 \uC131\uB2A5\uC744 \uB9CC\uB4E0\uB2E4."
        ],
        cppPractice: cpp(
          "A* \uB178\uB4DC \uAD6C\uC870",
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
          "grid map\uC5D0\uC11C \uD734\uB9AC\uC2A4\uD2F1\uACFC open set\uC744 \uC774\uC6A9\uD574 \uCD5C\uB2E8 \uACBD\uB85C\uB97C \uCC3E\uB294 \uAD6C\uC870\uB97C \uC7A1\uB294\uB2E4.",
          ["4\uBC29\uD5A5/8\uBC29\uD5A5 neighbor\uB97C \uAD6C\uD604\uD55C\uB2E4.", "obstacle inflation\uC744 \uCD94\uAC00\uD55C\uB2E4.", "path smoothing\uC744 \uBD99\uC778\uB2E4."]
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
          "lookahead target \uC120\uD0DD\uC774 \uCD94\uC885 \uAC70\uB3D9\uC5D0 \uC8FC\uB294 \uC601\uD5A5\uC744 \uD655\uC778\uD55C\uB2E4.",
          ["lookahead\uB97C \uBC14\uAFD4 tracking error\uB97C \uBE44\uAD50\uD55C\uB2E4.", "Stanley \uC81C\uC5B4\uC640 \uBE44\uAD50\uD55C\uB2E4.", "local trajectory candidate cost\uB97C \uC2DC\uAC01\uD654\uD55C\uB2E4."]
        ),
        visualizerId: "astar",
        quiz: [
          {
            id: "planning-q1",
            type: "choice",
            prompt: "grid \uAE30\uBC18 \uC804\uC5ED \uACBD\uB85C\uACC4\uD68D\uC5D0\uC11C \uD734\uB9AC\uC2A4\uD2F1\uC744 \uC0AC\uC6A9\uD558\uB294 \uB300\uD45C \uC54C\uACE0\uB9AC\uC998\uC740?",
            choices: ["A*", "PID", "JPEG", "OAuth"],
            answer: "A*",
            explanation: "A*\uB294 g-cost\uC640 heuristic\uC744 \uD568\uAED8 \uC0AC\uC6A9\uD574 \uBAA9\uD45C\uAE4C\uC9C0\uC758 \uACBD\uB85C\uB97C \uCC3E\uB294\uB2E4."
          },
          {
            id: "planning-q2",
            type: "trueFalse",
            prompt: "local planner\uB294 global path\uB9CC \uB530\uB77C\uAC00\uBA70 \uCDA9\uB3CC\uAC80\uC0AC\uB098 footprint\uB294 \uACE0\uB824\uD558\uC9C0 \uC54A\uB294\uB2E4.",
            choices: ["\uCC38", "\uAC70\uC9D3"],
            answer: "\uAC70\uC9D3",
            explanation: "local planner\uB294 local costmap, footprint, collision checking, trajectory rollout\uC744 \uB2E4\uB8EC\uB2E4."
          }
        ],
        checklist: [
          "occupancy grid \uB610\uB294 costmap\uC744 \uCF54\uB4DC\uB85C \uB2E4\uB918\uB2E4.",
          "A*\uB97C \uAD6C\uD604\uD558\uACE0 heuristic \uCC28\uC774\uB97C \uBE44\uAD50\uD588\uB2E4.",
          "Pure Pursuit \uB610\uB294 Stanley\uB97C \uAD6C\uD604\uD588\uB2E4.",
          "Nav2\uC758 planner server\uC640 controller server \uC5ED\uD560\uC744 \uAD6C\uBD84\uD55C\uB2E4."
        ]
      },
      {
        id: "mobile-local-control",
        title: "Pure Pursuit\uC640 \uB85C\uCEEC \uCD94\uC885",
        focus: "lookahead, lateral error, \uC18D\uB3C4 \uC81C\uD55C\uC774 \uC2E4\uC81C \uC8FC\uD589 \uC548\uC815\uC131\uC5D0 \uC8FC\uB294 \uC601\uD5A5\uC744 \uBCF8\uB2E4.",
        theory: [
          "Pure Pursuit\uB294 \uACBD\uB85C \uC704 lookahead target\uC744 \uD5A5\uD574 \uACE1\uB960 \uBA85\uB839\uC744 \uACC4\uC0B0\uD55C\uB2E4.",
          "lookahead\uAC00 \uB108\uBB34 \uC9E7\uC73C\uBA74 \uD754\uB4E4\uB9BC\uC774 \uCEE4\uC9C0\uACE0, \uB108\uBB34 \uAE38\uBA74 \uCF54\uB108 \uCD94\uC885\uC774 \uB454\uD574\uC9C8 \uC218 \uC788\uB2E4.",
          "Stanley\uB294 lateral error\uC640 heading error\uB97C \uC870\uD569\uD574 \uC870\uD5A5\uC744 \uACC4\uC0B0\uD55C\uB2E4."
        ],
        why: [
          "PDF\uB294 JetRover\uC5D0\uC11C local planner parameter tuning \uC785\uBB38\uC744 \uD655\uC778\uD558\uB77C\uACE0 \uAD8C\uD55C\uB2E4.",
          "\uC2DC\uBBAC\uB808\uC774\uD130\uC5D0\uC11C\uB294 planner/controller \uBE44\uAD50\uC640 dynamic obstacle scenario\uB97C \uBC18\uBCF5\uD558\uAE30 \uC88B\uB2E4."
        ],
        cppPractice: cpp(
          "Pure Pursuit \uACE1\uB960",
          `
#include <cmath>

double curvature(double target_x_robot, double target_y_robot) {
  double ld2 = target_x_robot * target_x_robot + target_y_robot * target_y_robot;
  if (ld2 < 1e-6) return 0.0;
  return 2.0 * target_y_robot / ld2;
}
          `,
          "\uB85C\uBD07 \uC88C\uD45C\uACC4 target point\uC5D0\uC11C \uACE1\uB960 \uBA85\uB839\uC744 \uACC4\uC0B0\uD55C\uB2E4.",
          ["lookahead distance\uB97C \uC18D\uB3C4\uC5D0 \uB530\uB77C \uBC14\uAFBC\uB2E4.", "max angular velocity \uC81C\uD55C\uC744 \uCD94\uAC00\uD55C\uB2E4.", "tracking error logger\uB97C \uBD99\uC778\uB2E4."]
        ),
        pythonPractice: py(
          "lookahead sweep",
          `
lookaheads = [0.3, 0.6, 1.0, 1.5]
errors = [0.28, 0.15, 0.18, 0.32]
for ld, err in zip(lookaheads, errors):
    print(ld, err)
          `,
          "lookahead\uBCC4 \uD3C9\uADE0 tracking error\uB97C \uBE44\uAD50\uD558\uB294 \uD45C\uB97C \uB9CC\uB4E0\uB2E4.",
          ["matplotlib \uADF8\uB798\uD504\uB85C \uBC14\uAFBC\uB2E4.", "\uC18D\uB3C4 \uC81C\uD55C \uC870\uAC74\uC744 \uCD94\uAC00\uD55C\uB2E4.", "rosbag \uB85C\uADF8\uC5D0\uC11C error\uB97C \uACC4\uC0B0\uD55C\uB2E4."]
        ),
        visualizerId: "pure-pursuit",
        quiz: [
          {
            id: "pure-q1",
            type: "choice",
            prompt: "Pure Pursuit\uC5D0\uC11C \uC8FC\uB85C \uC870\uC808\uD558\uB294 \uD575\uC2EC \uD30C\uB77C\uBBF8\uD130\uB294?",
            choices: ["lookahead distance", "image width only", "HTML title", "compiler version only"],
            answer: "lookahead distance",
            explanation: "lookahead\uB294 \uCD94\uC885 \uC548\uC815\uC131\uACFC \uCF54\uB108 \uBC18\uC751\uC5D0 \uD070 \uC601\uD5A5\uC744 \uC900\uB2E4."
          },
          {
            id: "pure-q2",
            type: "trueFalse",
            prompt: "\uB85C\uCEEC \uC81C\uC5B4 \uC2E4\uD5D8\uC740 tracking error\uC640 command latency\uB97C \uD568\uAED8 \uAE30\uB85D\uD558\uBA74 \uC88B\uB2E4.",
            choices: ["\uCC38", "\uAC70\uC9D3"],
            answer: "\uCC38",
            explanation: "\uBC18\uBCF5 \uC2E4\uD5D8\uACFC \uD3C9\uAC00\uC5D0\uC11C\uB294 \uC624\uCC28\uC640 \uC9C0\uC5F0\uC744 \uD568\uAED8 \uBCF4\uB294 \uAC83\uC774 \uC720\uC6A9\uD558\uB2E4."
          }
        ],
        checklist: [
          "lookahead \uBCC0\uD654\uAC00 \uACBD\uB85C \uCD94\uC885\uC5D0 \uBBF8\uCE58\uB294 \uC601\uD5A5\uC744 \uBD24\uB2E4.",
          "lateral error\uB97C \uACC4\uC0B0\uD588\uB2E4.",
          "\uC18D\uB3C4 \uC81C\uD55C\uACFC \uAC01\uC18D\uB3C4 \uC81C\uD55C\uC744 \uC801\uC6A9\uD588\uB2E4."
        ]
      }
    ]
  },
  {
    id: "ai",
    title: "4. AI \uAE30\uCD08\uC5ED\uB7C9",
    summary: "\uB370\uC774\uD130 \uC900\uBE44, ML/DL/Vision, ONNX \uBC30\uD3EC, ROS 2 image inference \uC5F0\uACB0\uC744 \uACF5\uBD80\uD55C\uB2E4.",
    sections: [
      {
        id: "ai-foundations",
        title: "\uB370\uC774\uD130, \uBAA8\uB378, \uD3C9\uAC00, \uBC30\uD3EC",
        focus: "Python\uC5D0\uC11C \uD559\uC2B5\uD558\uACE0 C++\uC5D0\uC11C \uCD94\uB860\uD558\uB294 \uD750\uB984\uC744 \uB85C\uBD07 \uC13C\uC11C\uC640 \uC5F0\uACB0\uD55C\uB2E4.",
        theory: [
          "ML \uAE30\uCD08: \uC120\uD615\uB300\uC218, \uBBF8\uBD84, \uD655\uB960, loss function, gradient descent, regularization, bias/variance.",
          "\uB370\uC774\uD130/\uD3C9\uAC00: dataset split, label \uD488\uC9C8, augmentation, accuracy, precision, recall, F1, confusion matrix.",
          "\uB525\uB7EC\uB2DD: MLP, CNN, sequence model, transformer, embedding \uAC10\uAC01.",
          "\uBE44\uC804/\uC13C\uC11C AI: preprocessing, classification, detection, segmentation, tracking, sensor fusion.",
          "\uBC30\uD3EC: ONNX export, ONNX Runtime, TensorRT \uAC1C\uC694, C++ inference pipeline, latency/throughput/batching."
        ],
        why: [
          "\uB85C\uBD07 AI\uB294 \uBAA8\uB378 \uC815\uD655\uB3C4\uB9CC\uD07C \uC785\uB825 \uC804\uCC98\uB9AC, latency, ROS 2 topic \uC5F0\uACB0, postprocessing\uC774 \uC911\uC694\uD558\uB2E4.",
          "\uD559\uC2B5\uACFC \uBC30\uD3EC\uC758 \uC804\uCC98\uB9AC\uAC00 \uB2E4\uB974\uBA74 \uC88B\uC740 \uBAA8\uB378\uB3C4 \uD604\uC7A5\uC5D0\uC11C \uC27D\uAC8C \uC2E4\uD328\uD55C\uB2E4."
        ],
        cppPractice: cpp(
          "OpenCV \uC804\uCC98\uB9AC skeleton",
          `
#include <opencv2/opencv.hpp>

cv::Mat preprocess(const cv::Mat& image) {
  cv::Mat resized, float_img;
  cv::resize(image, resized, cv::Size(224, 224));
  resized.convertTo(float_img, CV_32FC3, 1.0 / 255.0);
  return float_img;
}
          `,
          "\uCE74\uBA54\uB77C frame\uC744 \uBAA8\uB378 \uC785\uB825 tensor \uD615\uC2DD\uC73C\uB85C \uBC14\uAFB8\uB294 \uC804\uCC98\uB9AC \uD750\uB984\uC744 \uB9CC\uB4E0\uB2E4.",
          ["mean/std normalization\uC744 \uCD94\uAC00\uD55C\uB2E4.", "batch dimension\uC744 \uBD99\uC778\uB2E4.", "ONNX Runtime \uC785\uB825 buffer\uB85C \uC5F0\uACB0\uD55C\uB2E4."]
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
          "\uC815\uD655\uB3C4\uB9CC \uBCF4\uC9C0 \uC54A\uACE0 precision/recall/F1\uC744 \uACC4\uC0B0\uD55C\uB2E4.",
          ["class imbalance \uC608\uC81C\uB97C \uB9CC\uB4E0\uB2E4.", "PyTorch \uBAA8\uB378 \uACB0\uACFC\uB85C cm\uC744 \uACC4\uC0B0\uD55C\uB2E4.", "ONNX \uC804\uD6C4 \uACB0\uACFC \uC77C\uCE58\uC131\uC744 \uD655\uC778\uD55C\uB2E4."]
        ),
        visualizerId: "ai-metrics",
        quiz: [
          {
            id: "ai-q1",
            type: "choice",
            prompt: "\uD559\uC2B5\uD55C \uBAA8\uB378\uC744 C++ \uCD94\uB860\uC73C\uB85C \uC62E\uAE38 \uB54C \uC790\uC8FC \uC4F0\uB294 \uC911\uAC04 \uD3EC\uB9F7\uC740?",
            choices: ["ONNX", "CSV only", "Markdown", "PNG"],
            answer: "ONNX",
            explanation: "PDF\uB294 export to ONNX\uC640 ONNX Runtime\uC744 \uBC30\uD3EC \uD750\uB984\uC758 \uD575\uC2EC\uC73C\uB85C \uB454\uB2E4."
          },
          {
            id: "ai-q2",
            type: "trueFalse",
            prompt: "AI \uC2E4\uC2B5\uC5D0\uC11C dataset split\uACFC metric\uC740 \uBAA8\uB378 \uAD6C\uC870\uBCF4\uB2E4 \uD56D\uC0C1 \uB35C \uC911\uC694\uD558\uB2E4.",
            choices: ["\uCC38", "\uAC70\uC9D3"],
            answer: "\uAC70\uC9D3",
            explanation: "\uB370\uC774\uD130 \uBD84\uB9AC, \uB77C\uBCA8 \uD488\uC9C8, metric\uC740 \uBAA8\uB378\uC744 \uC2E0\uB8B0\uD560 \uC218 \uC788\uB294\uC9C0 \uD310\uB2E8\uD558\uB294 \uAE30\uBCF8\uC774\uB2E4."
          }
        ],
        checklist: [
          "dataset split\uACFC label \uD488\uC9C8\uC758 \uC911\uC694\uC131\uC744 \uC124\uBA85\uD560 \uC218 \uC788\uB2E4.",
          "PyTorch\uB85C \uC791\uC740 \uBAA8\uB378\uC744 \uD559\uC2B5\uD588\uB2E4.",
          "confusion matrix\uC640 F1\uC744 \uACC4\uC0B0\uD588\uB2E4.",
          "ONNX export\uC640 ONNX Runtime \uCD94\uB860 \uD750\uB984\uC744 \uC124\uBA85\uD560 \uC218 \uC788\uB2E4."
        ]
      }
    ]
  },
  {
    id: "prompt-context-harness",
    title: "5. \uD504\uB86C\uD504\uD2B8 / \uCEE8\uD14D\uC2A4\uD2B8 / \uD558\uB124\uC2A4",
    summary: "LLM \uC2DC\uC2A4\uD15C\uC744 \uB85C\uBD07/AI \uB3C4\uAD6C\uC640 \uC5F0\uACB0\uD560 \uB54C \uD544\uC694\uD55C prompt, retrieval, eval harness\uB97C \uC775\uD78C\uB2E4.",
    sections: [
      {
        id: "llm-engineering",
        title: "\uD504\uB86C\uD504\uD2B8, \uCEE8\uD14D\uC2A4\uD2B8, \uD3C9\uAC00 \uD558\uB124\uC2A4",
        focus: "\uCD9C\uB825 \uD615\uC2DD, \uAC80\uC0C9 \uAE30\uBC18 grounding, regression eval, trace/log\uB97C \uC124\uACC4\uD55C\uB2E4.",
        theory: [
          "\uD504\uB86C\uD504\uD2B8: \uC5ED\uD560, \uBAA9\uD45C, \uC81C\uC57D, \uCD9C\uB825\uD615\uC2DD \uBD84\uB9AC, few-shot, instruction hierarchy, failure mode \uC904\uC774\uAE30.",
          "\uCEE8\uD14D\uC2A4\uD2B8: context window \uD55C\uACC4, chunking, retrieval, summary memory, grounding.",
          "\uD558\uB124\uC2A4: eval set, regression test, tracing, latency logging, fallback, retry policy, golden output \uBE44\uAD50.",
          "Python \uC911\uC2EC \uAD6C\uD604 \uC21C\uC11C\uB294 prompt template runner, document chunker, retriever, evaluation harness, trace exporter\uB2E4."
        ],
        why: [
          "Physical AI\uB294 \uC5B8\uC5B4 \uC778\uD130\uD398\uC774\uC2A4, \uBA40\uD2F0\uBAA8\uB2EC \uCD94\uB860, \uB3C4\uAD6C \uD638\uCD9C, \uAC80\uC0C9 \uAE30\uBC18 \uC9C0\uC2DD \uC5F0\uACB0\uC774 \uC810\uC810 \uC911\uC694\uD574\uC9C0\uACE0 \uC788\uB2E4.",
          "\uD558\uB124\uC2A4\uAC00 \uC5C6\uC73C\uBA74 \uD504\uB86C\uD504\uD2B8 \uBCC0\uACBD\uC774 \uAC1C\uC120\uC778\uC9C0 \uC6B0\uC5F0\uC778\uC9C0 \uD310\uB2E8\uD558\uAE30 \uC5B4\uB835\uB2E4."
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
          "request/response wrapper\uB098 inference server \uC8FC\uBCC0\uC5D0 timing log\uB97C \uBD99\uC778\uB2E4.",
          ["JSON schema validator\uB97C \uC5F0\uACB0\uD55C\uB2E4.", "retrieved context id\uB97C \uAC19\uC774 \uAE30\uB85D\uD55C\uB2E4.", "retry \uD69F\uC218\uB97C trace\uC5D0 \uB0A8\uAE34\uB2E4."]
        ),
        pythonPractice: py(
          "\uAC04\uB2E8 retrieval",
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
          "\uCCAD\uD0B9\uACFC \uAC80\uC0C9\uC774 \uB2F5\uBCC0 \uD488\uC9C8\uC744 \uC5B4\uB5BB\uAC8C \uBC14\uAFB8\uB294\uC9C0 \uC791\uC740 \uC608\uC81C\uB85C \uD655\uC778\uD55C\uB2E4.",
          ["cosine similarity\uB85C \uBC14\uAFBC\uB2E4.", "eval set\uC744 JSONL\uB85C \uB9CC\uB4E0\uB2E4.", "pass/fail metric\uACFC latency\uB97C CSV\uB85C \uC800\uC7A5\uD55C\uB2E4."]
        ),
        quiz: [
          {
            id: "llm-q1",
            type: "choice",
            prompt: "\uD504\uB86C\uD504\uD2B8 \uBCC0\uACBD\uC774 \uC131\uB2A5\uC744 \uC545\uD654\uC2DC\uD0A4\uC9C0 \uC54A\uC558\uB294\uC9C0 \uD655\uC778\uD558\uB294 \uBC18\uBCF5 \uD3C9\uAC00 \uAD6C\uC870\uB294?",
            choices: ["evaluation harness", "URDF mesh", "costmap inflation", "quaternion"],
            answer: "evaluation harness",
            explanation: "\uD558\uB124\uC2A4\uB294 eval set\uACFC metric\uC73C\uB85C \uBCC0\uACBD \uC804\uD6C4\uB97C \uBE44\uAD50\uD55C\uB2E4."
          },
          {
            id: "llm-q2",
            type: "blank",
            prompt: "\uBB38\uC11C\uB97C \uC791\uC740 \uB2E8\uC704\uB85C \uB098\uB204\uC5B4 \uAC80\uC0C9\uC5D0 \uC4F0\uB294 \uACFC\uC815\uC744 \uBCF4\uD1B5 ____\uC774\uB77C\uACE0 \uD55C\uB2E4.",
            answer: "chunking",
            explanation: "\uCEE8\uD14D\uC2A4\uD2B8 \uC5D4\uC9C0\uB2C8\uC5B4\uB9C1\uC5D0\uC11C chunking\uC740 \uAC80\uC0C9\uACFC grounding\uC758 \uAE30\uBCF8 \uB2E8\uACC4\uB2E4."
          }
        ],
        checklist: [
          "\uD504\uB86C\uD504\uD2B8 \uD15C\uD50C\uB9BF\uC758 \uC5ED\uD560/\uBAA9\uD45C/\uCD9C\uB825\uD615\uC2DD\uC744 \uBD84\uB9AC\uD588\uB2E4.",
          "\uBB38\uC11C chunker\uC640 \uAC04\uB2E8 retriever\uB97C \uB9CC\uB4E4\uC5C8\uB2E4.",
          "eval harness\uB85C pass/fail\uACFC latency\uB97C \uAE30\uB85D\uD588\uB2E4.",
          "golden output\uACFC regression run\uC744 \uBE44\uAD50\uD588\uB2E4."
        ],
        visualizerId: "retrieval-flow"
      }
    ]
  },
  {
    id: "jetrover-sim",
    title: "6. JetRover \uC2E4\uAE30\uC640 \uC2DC\uBBAC\uB808\uC774\uD130",
    summary: "\uC2E4\uC81C \uD558\uB4DC\uC6E8\uC5B4\uC5D0\uC11C \uC775\uD790 \uAC83\uACFC \uC2DC\uBBAC\uB808\uC774\uD130/\uC6CC\uD06C\uC2A4\uD14C\uC774\uC158\uC5D0\uC11C \uBC18\uBCF5\uD560 \uAC83\uC744 \uBD84\uB9AC\uD55C\uB2E4.",
    sections: [
      {
        id: "jetrover-vs-sim",
        title: "\uC2E4\uAE30 \uBC94\uC704\uC640 \uC2EC\uD654 \uBC94\uC704 \uBD84\uB9AC",
        focus: "\uC2E4\uAE30\uC5D0\uC11C\uB294 \uC2E4\uC81C \uC13C\uC11C/\uD504\uB808\uC784/\uBA85\uB839 \uAC10\uAC01\uC744, \uC2DC\uBBAC\uB808\uC774\uD130\uC5D0\uC11C\uB294 \uBC18\uBCF5 \uC2E4\uD5D8\uACFC \uACE0\uAE09 \uBE44\uAD50\uB97C \uB9E1\uAE34\uB2E4.",
        theory: [
          "JetRover \uC2E4\uAE30: joint command, FK/IK \uAC10\uAC01, MoveIt \uC785\uBB38, camera-arm frame \uC5F0\uACB0, odometry, slam_toolbox, Nav2 basic bringup.",
          "\uC2E4\uAE30 AI: camera topic \uCC98\uB9AC, lightweight inference, ROS 2 image topic \uC5F0\uACB0, rosbag2 \uAE30\uB85D/\uC7AC\uC0DD.",
          "\uC2DC\uBBAC\uB808\uC774\uD130: dynamics parameter sweep, IK solver \uBE44\uAD50, trajectory tuning, controller gain sweep, dynamic obstacle scenario.",
          "\uC6CC\uD06C\uC2A4\uD14C\uC774\uC158: \uBAA8\uB378 \uD559\uC2B5, ONNX/TensorRT \uBCC0\uD658, latency benchmark, \uC5EC\uB7EC \uBAA8\uB378 \uBE44\uAD50."
        ],
        why: [
          "\uC2E4\uAE30\uC5D0\uC11C\uB294 \uC548\uC804\uACFC \uD558\uB4DC\uC6E8\uC5B4 \uC81C\uC57D \uB54C\uBB38\uC5D0 \uBC18\uBCF5 \uC2E4\uD328 \uC2E4\uD5D8\uC744 \uB9C8\uC74C\uAECF \uD558\uAE30 \uC5B4\uB835\uB2E4.",
          "\uC2DC\uBBAC\uB808\uC774\uD130\uB294 \uB2E4\uC591\uD55C \uC870\uAC74\uC744 \uBE60\uB974\uAC8C \uBC14\uAFD4 \uC54C\uACE0\uB9AC\uC998\uC758 \uC2E4\uD328 \uC870\uAC74\uC744 \uCC3E\uB294 \uB370 \uC801\uD569\uD558\uB2E4."
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
          "\uC2E4\uAE30 \uC8FC\uD589 \uC804\uC5D0 \uC18D\uB3C4 \uC81C\uD55C \uD544\uD130\uB97C \uD56D\uC0C1 \uD1B5\uACFC\uC2DC\uD0A4\uB294 \uC2B5\uAD00\uC744 \uB9CC\uB4E0\uB2E4.",
          ["timeout\uC774\uBA74 zero velocity\uB97C \uB0B4\uBCF4\uB0B8\uB2E4.", "LiDAR \uCD5C\uC18C\uAC70\uB9AC \uC870\uAC74\uC744 \uCD94\uAC00\uD55C\uB2E4.", "ROS 2 node\uB85C \uAC10\uC2FC\uB2E4."]
        ),
        pythonPractice: py(
          "\uC2E4\uAE30/\uC2DC\uBBAC\uB808\uC774\uD130 \uC2E4\uD5D8\uD45C",
          `
experiments = [
    ("JetRover", "odom repeat run", "pose_error"),
    ("Simulator", "controller sweep", "tracking_error"),
    ("Workstation", "onnx benchmark", "latency_ms"),
]
for env, name, metric in experiments:
    print(env, name, metric)
          `,
          "\uD658\uACBD\uBCC4 \uC2E4\uD5D8 \uBAA9\uC801\uACFC metric\uC744 \uBD84\uB9AC\uD574 \uAD00\uB9AC\uD55C\uB2E4.",
          ["CSV\uB85C \uC800\uC7A5\uD55C\uB2E4.", "battery/CPU \uC0C1\uD0DC \uCEEC\uB7FC\uC744 \uCD94\uAC00\uD55C\uB2E4.", "baseline vs \uAC1C\uC120\uC548 \uBE44\uAD50\uD45C\uB97C \uB9CC\uB4E0\uB2E4."]
        ),
        quiz: [
          {
            id: "jetrover-q1",
            type: "choice",
            prompt: "\uC2E4\uAE30\uBCF4\uB2E4 \uC2DC\uBBAC\uB808\uC774\uD130\uC5D0\uC11C \uBA3C\uC800 \uAC80\uC99D\uD558\uAE30 \uC88B\uC740 \uAC83\uC740?",
            choices: ["impedance/admittance \uAC1C\uB150 \uC2E4\uD5D8", "\uC2E4\uC81C \uBC30\uD130\uB9AC \uC804\uC555 \uCE21\uC815", "\uC2E4\uC81C \uCE74\uBA54\uB77C \uCF00\uC774\uBE14 \uC5F0\uACB0", "\uC2E4\uC81C \uBAA8\uD130 \uBC1C\uC5F4 \uD655\uC778"],
            answer: "impedance/admittance \uAC1C\uB150 \uC2E4\uD5D8",
            explanation: "\uACE0\uAE09 \uC81C\uC5B4\uC640 \uBC18\uBCF5 \uD30C\uB77C\uBBF8\uD130 \uC2E4\uD5D8\uC740 \uC2DC\uBBAC\uB808\uC774\uD130\uAC00 \uC548\uC804\uD558\uACE0 \uBE60\uB974\uB2E4."
          },
          {
            id: "jetrover-q2",
            type: "trueFalse",
            prompt: "JetRover \uC2E4\uAE30\uB294 \uC2E4\uC81C \uC13C\uC11C timestamp\uC640 frame \uCCB4\uC778\uC744 \uD655\uC778\uD558\uAE30\uC5D0 \uC801\uD569\uD558\uB2E4.",
            choices: ["\uCC38", "\uAC70\uC9D3"],
            answer: "\uCC38",
            explanation: "\uC2E4\uC81C \uC13C\uC11C\uC640 \uD504\uB808\uC784 \uC5F0\uACB0 \uAC10\uAC01\uC740 \uD558\uB4DC\uC6E8\uC5B4\uC5D0\uC11C \uD2B9\uD788 \uC911\uC694\uD558\uB2E4."
          }
        ],
        checklist: [
          "\uC2E4\uAE30\uC5D0\uC11C \uD560 \uC2E4\uD5D8\uACFC \uC2DC\uBBAC\uB808\uC774\uD130\uC5D0\uC11C \uD560 \uC2E4\uD5D8\uC744 \uBD84\uB9AC\uD588\uB2E4.",
          "\uC2E4\uAE30 \uBA85\uB839\uC5D0\uB294 timeout\uACFC limit\uB97C \uB454\uB2E4.",
          "rosbag2\uB85C \uC2E4\uAE30 \uB370\uC774\uD130\uB97C \uAE30\uB85D\uD574 \uD6C4\uCC98\uB9AC\uD55C\uB2E4."
        ]
      }
    ]
  },
  {
    id: "stack",
    title: "7. \uCD94\uCC9C \uD559\uC2B5 \uC2A4\uD0DD",
    summary: "\uB85C\uBD07\uD314, \uC790\uC728\uC8FC\uD589, AI, LLM \uD558\uB124\uC2A4\uC5D0 \uB9DE\uB294 \uC774\uB860/\uB77C\uC774\uBE0C\uB7EC\uB9AC/\uC2DC\uC2A4\uD15C \uC2A4\uD0DD\uC744 \uC815\uB9AC\uD55C\uB2E4.",
    sections: [
      {
        id: "recommended-stack",
        title: "\uBD84\uC57C\uBCC4 \uC2A4\uD0DD",
        focus: "\uC5B4\uB5A4 \uCC45\uACFC \uB77C\uC774\uBE0C\uB7EC\uB9AC\uB97C \uC5B4\uB5A4 \uC21C\uC11C\uB85C \uC5F0\uACB0\uD560\uC9C0 \uC815\uD55C\uB2E4.",
        theory: [
          "\uB85C\uBD07\uD314: Modern Robotics, Siciliano/Spong, Eigen, KDL, Pinocchio/RBDL, NumPy, SymPy, matplotlib, URDF/Xacro, MoveIt 2, ros2_control.",
          "\uC790\uC728\uC8FC\uD589: Probabilistic Robotics, Planning Algorithms, Eigen, OpenCV, PCL, MRPT, Nav2, slam_toolbox, robot_localization, tf2.",
          "AI: PyTorch, OpenCV, NumPy, pandas, matplotlib, ONNX Runtime, TensorRT \uC120\uD0DD, ROS 2 image transport, logging, bag replay.",
          "\uD504\uB86C\uD504\uD2B8/\uCEE8\uD14D\uC2A4\uD2B8/\uD558\uB124\uC2A4: Jupyter, pandas, yaml, json, evaluation scripts, CSV/JSONL/Markdown \uAE30\uB85D."
        ],
        why: [
          "\uC2A4\uD0DD\uC744 \uBD84\uB9AC\uD558\uBA74 \uC774\uB860 \uACF5\uBD80, \uC54C\uACE0\uB9AC\uC998 \uAD6C\uD604, ROS 2 \uD1B5\uD569, \uD3C9\uAC00 \uC790\uB3D9\uD654\uC758 \uC5ED\uD560\uC774 \uBA85\uD655\uD574\uC9C4\uB2E4.",
          "\uACF5\uC2DD \uBB38\uC11C\uC640 \uAC80\uC99D\uB41C \uB77C\uC774\uBE0C\uB7EC\uB9AC\uB97C \uAC19\uC774 \uBCF4\uBA74 \uAD6C\uD604\uACFC \uC2E4\uC804 \uC5F0\uACB0 \uC0AC\uC774\uC758 \uAC04\uADF9\uC744 \uC904\uC77C \uC218 \uC788\uB2E4."
        ],
        cppPractice: cpp(
          "\uB77C\uC774\uBE0C\uB7EC\uB9AC \uC120\uD0DD \uAE30\uB85D",
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
          "\uB0B4\uAC00 \uC4F0\uB294 \uB77C\uC774\uBE0C\uB7EC\uB9AC\uC640 \uBAA9\uC801\uC744 \uBA85\uC2DC\uC801\uC73C\uB85C \uC815\uB9AC\uD55C\uB2E4.",
          ["CMake \uB9C1\uD06C \uC608\uC81C\uB97C \uCD94\uAC00\uD55C\uB2E4.", "\uBC84\uC804 \uCEEC\uB7FC\uC744 \uB454\uB2E4.", "\uB300\uCCB4 \uB77C\uC774\uBE0C\uB7EC\uB9AC\uB97C \uBE44\uAD50\uD55C\uB2E4."]
        ),
        pythonPractice: py(
          "\uC2A4\uD0DD \uCCB4\uD06C\uB9AC\uC2A4\uD2B8",
          `
stack = {
    "robot_arm": ["Eigen", "MoveIt2", "ros2_control"],
    "mobile": ["Nav2", "slam_toolbox", "robot_localization"],
    "ai": ["PyTorch", "ONNX Runtime", "OpenCV"],
}
for domain, tools in stack.items():
    print(domain, "->", ", ".join(tools))
          `,
          "\uB3C4\uBA54\uC778\uBCC4 \uD544\uC218 \uB3C4\uAD6C\uB97C \uBE60\uB974\uAC8C \uD655\uC778\uD55C\uB2E4.",
          ["\uC124\uCE58 \uC5EC\uBD80\uB97C \uAC80\uC0AC\uD55C\uB2E4.", "\uD559\uC2B5 \uC6B0\uC120\uC21C\uC704\uB97C \uBD99\uC778\uB2E4.", "\uB9C1\uD06C \uBAA8\uC74C\uC744 Markdown\uC73C\uB85C \uC0DD\uC131\uD55C\uB2E4."]
        ),
        quiz: [
          {
            id: "stack-q1",
            type: "choice",
            prompt: "\uB85C\uBD07\uD314 \uB3D9\uC5ED\uD559 \uB77C\uC774\uBE0C\uB7EC\uB9AC\uB85C PDF\uC5D0\uC11C \uC5B8\uAE09\uB41C \uAC83\uC740?",
            choices: ["Pinocchio/RBDL", "Express", "SQLite", "Redux"],
            answer: "Pinocchio/RBDL",
            explanation: "Pinocchio\uC640 RBDL\uC740 rigid body dynamics \uAD00\uB828 \uB77C\uC774\uBE0C\uB7EC\uB9AC\uB2E4."
          },
          {
            id: "stack-q2",
            type: "choice",
            prompt: "\uC790\uC728\uC8FC\uD589 ROS 2 \uD1B5\uD569\uC5D0\uC11C \uB300\uD45C\uC801\uC73C\uB85C \uBCF4\uB294 \uC2A4\uD0DD\uC740?",
            choices: ["Nav2, slam_toolbox, robot_localization", "Tailwind, NextAuth, Prisma", "Unity, Blender, Figma", "SMTP, POP3, IMAP"],
            answer: "Nav2, slam_toolbox, robot_localization",
            explanation: "PDF\uC758 \uC790\uC728\uC8FC\uD589 \uC2A4\uD0DD\uC740 Nav2, SLAM, localization \uC911\uC2EC\uC774\uB2E4."
          }
        ],
        checklist: [
          "\uBD84\uC57C\uBCC4 \uC774\uB860 \uC790\uB8CC\uC640 \uAD6C\uD604 \uB77C\uC774\uBE0C\uB7EC\uB9AC\uB97C \uC5F0\uACB0\uD588\uB2E4.",
          "\uB0B4 \uD658\uACBD\uC5D0\uC11C \uC124\uCE58/\uBE4C\uB4DC \uAC00\uB2A5\uD55C \uC6B0\uC120\uC21C\uC704\uB97C \uC815\uD588\uB2E4.",
          "\uC2A4\uD0DD\uBCC4 \uACF5\uC2DD \uBB38\uC11C\uB97C \uC990\uACA8\uCC3E\uAE30\uD588\uB2E4."
        ]
      }
    ]
  },
  {
    id: "routine",
    title: "8. \uC8FC\uAC04 \uD559\uC2B5 \uB8E8\uD2F4",
    summary: "\uC8FC 5\uC77C, \uD558\uB8E8 2\uC2DC\uAC04 \uAE30\uC900\uC73C\uB85C \uC774\uB860, \uC190\uC720\uB3C4, \uAD6C\uD604, \uC2DC\uAC01\uD654, \uB85C\uADF8 \uC815\uB9AC\uB97C \uBC18\uBCF5\uD55C\uB2E4.",
    sections: [
      {
        id: "weekly-routine",
        title: "\uACF5\uBD80 \uB8E8\uD504",
        focus: "Python \uAC80\uC0B0 -> C++ \uAD6C\uD604 -> ROS 2 \uC5F0\uACB0 -> \uB85C\uADF8 \uAE30\uB85D\uC758 \uBC18\uBCF5 \uB8E8\uD504\uB97C \uC0DD\uD65C\uD654\uD55C\uB2E4.",
        theory: [
          "\uC6D4: \uC774\uB860 \uC77D\uAE30\uC640 \uD575\uC2EC \uC218\uC2DD 3\uAC1C \uC815\uB9AC.",
          "\uD654: \uC190\uC720\uB3C4\uC640 \uB178\uD2B8 \uC815\uB9AC.",
          "\uC218: C++ \uAD6C\uD604.",
          "\uBAA9: Python \uC2DC\uBBAC\uB808\uC774\uC158/\uC2DC\uAC01\uD654.",
          "\uAE08: ROS 2 \uC5F0\uACB0 \uB610\uB294 \uC2E4\uD5D8 \uB85C\uADF8 \uC815\uB9AC.",
          "\uD558\uB8E8 2\uC2DC\uAC04\uC740 \uC774\uB860 40\uBD84, \uC218\uC2DD/\uAC1C\uB150 \uB178\uD2B8 20\uBD84, \uAD6C\uD604 50\uBD84, \uACB0\uACFC \uC815\uB9AC 10\uBD84\uC73C\uB85C \uBC30\uBD84\uD55C\uB2E4."
        ],
        why: [
          "\uB9E4\uC77C \uC0C8 \uAC1C\uB150\uB9CC \uC77D\uC73C\uBA74 \uAD6C\uD604 \uAC10\uAC01\uC774 \uC57D\uD574\uC9C0\uACE0, \uAD6C\uD604\uB9CC \uD558\uBA74 \uC218\uC2DD\uACFC \uC2E4\uD328 \uD574\uC11D\uC774 \uC57D\uD574\uC9C4\uB2E4.",
          "\uC9E7\uC544\uB3C4 \uB9E4\uC8FC \uB85C\uADF8\uB97C \uB0A8\uAE30\uBA74 \uC131\uC7A5\uACFC \uBE48\uD2C8\uC774 \uBCF4\uC778\uB2E4."
        ],
        cppPractice: cpp(
          "\uD559\uC2B5 \uB85C\uADF8 \uB808\uCF54\uB4DC",
          `
#include <string>

struct StudyLog {
  std::string date;
  std::string topic;
  std::string result;
  int minutes;
};
          `,
          "\uD559\uC2B5\uC744 \uCF54\uB4DC\uCC98\uB7FC \uAE30\uB85D \uAC00\uB2A5\uD55C \uB370\uC774\uD130\uB85C \uB2E4\uB8EC\uB2E4.",
          ["CSV writer\uB97C \uBD99\uC778\uB2E4.", "topic\uBCC4 \uB204\uC801 \uC2DC\uAC04\uC744 \uACC4\uC0B0\uD55C\uB2E4.", "\uC2E4\uD328 \uC6D0\uC778 \uD544\uB4DC\uB97C \uCD94\uAC00\uD55C\uB2E4."]
        ),
        pythonPractice: py(
          "\uC8FC\uAC04 \uC2DC\uAC04 \uC9D1\uACC4",
          `
logs = [
    ("Mon", "theory", 40),
    ("Wed", "cpp", 50),
    ("Thu", "python", 50),
]
total = sum(item[2] for item in logs)
print("weekly minutes:", total)
          `,
          "\uB8E8\uD2F4\uC774 \uC2E4\uC81C\uB85C \uC9C0\uCF1C\uC84C\uB294\uC9C0 \uC218\uCE58\uB85C \uBCF8\uB2E4.",
          ["pandas groupby\uB85C \uBC14\uAFBC\uB2E4.", "\uBD80\uC871\uD55C \uCD95\uC744 \uC790\uB3D9 \uD45C\uC2DC\uD55C\uB2E4.", "Markdown \uD68C\uACE0\uB97C \uC0DD\uC131\uD55C\uB2E4."]
        ),
        quiz: [
          {
            id: "routine-q1",
            type: "choice",
            prompt: "PDF\uAC00 \uAD8C\uC7A5\uD558\uB294 \uAC00\uC7A5 \uC88B\uC740 \uAD6C\uD604 \uC21C\uC11C\uB294?",
            choices: ["Python \uAC80\uC0B0 -> C++ \uAD6C\uD604 -> ROS 2 \uC5F0\uACB0 -> \uB85C\uADF8", "ROS 2\uBD80\uD130 \uBB34\uC791\uC815 \uC2E4\uD589", "\uBB38\uC11C \uC5C6\uC774 \uD29C\uB2DD", "\uACB0\uACFC\uB9CC \uC800\uC7A5\uD558\uACE0 \uD30C\uB77C\uBBF8\uD130 \uC0DD\uB7B5"],
            answer: "Python \uAC80\uC0B0 -> C++ \uAD6C\uD604 -> ROS 2 \uC5F0\uACB0 -> \uB85C\uADF8",
            explanation: "\uBE60\uB978 \uAC80\uC0B0, \uC7AC\uC0AC\uC6A9 \uAD6C\uD604, \uC2DC\uC2A4\uD15C \uC5F0\uACB0, \uC7AC\uD604\uC131 \uAE30\uB85D\uC758 \uC21C\uC11C\uAC00 \uAD8C\uC7A5\uB41C\uB2E4."
          },
          {
            id: "routine-q2",
            type: "trueFalse",
            prompt: "\uC2E4\uD5D8 \uACB0\uACFC \uC815\uB9AC\uB294 \uAD6C\uD604\uBCF4\uB2E4 \uD56D\uC0C1 \uB098\uC911\uC5D0 \uBAB0\uC544\uC11C \uD574\uB3C4 \uCDA9\uBD84\uD558\uB2E4.",
            choices: ["\uCC38", "\uAC70\uC9D3"],
            answer: "\uAC70\uC9D3",
            explanation: "\uACB0\uACFC\uC640 \uD30C\uB77C\uBBF8\uD130\uB97C \uACE7\uBC14\uB85C \uB0A8\uAE30\uB294 \uC2B5\uAD00\uC774 \uC7AC\uD604\uC131\uC744 \uB9CC\uB4E0\uB2E4."
          }
        ],
        checklist: [
          "\uC774\uBC88 \uC8FC \uC774\uB860/\uC218\uC2DD/\uAD6C\uD604/\uC2DC\uAC01\uD654/\uB85C\uADF8 \uC2DC\uAC04\uC744 \uAE30\uB85D\uD588\uB2E4.",
          "Python \uAC80\uC0B0 \uD6C4 C++\uB85C \uC62E\uAE34 \uC608\uC81C\uAC00 \uC788\uB2E4.",
          "\uC2E4\uD328 \uB85C\uADF8\uB97C \uCD5C\uC18C \uD558\uB098 \uB0A8\uACBC\uB2E4."
        ]
      }
    ]
  },
  {
    id: "minimum-checklist",
    title: "9. \uCD5C\uC18C \uCCB4\uD06C\uB9AC\uC2A4\uD2B8",
    summary: "\uB85C\uBD07\uD314, \uC790\uC728\uC8FC\uD589, AI, \uD504\uB86C\uD504\uD2B8/\uCEE8\uD14D\uC2A4\uD2B8/\uD558\uB124\uC2A4\uC758 \uCD5C\uC18C \uB2EC\uC131 \uAE30\uC900\uC744 \uC810\uAC80\uD55C\uB2E4.",
    sections: [
      {
        id: "minimum-done",
        title: "\uCD5C\uC18C \uC644\uB8CC \uAE30\uC900",
        focus: "\uC785\uBB38-\uC911\uAE09 \uCD08\uC785\uC73C\uB85C \uB118\uC5B4\uAC00\uAE30 \uC704\uD55C \uC190\uAD6C\uD604 \uAE30\uC900\uC744 \uD655\uC778\uD55C\uB2E4.",
        theory: [
          "\uB85C\uBD07\uD314: 2\uB9C1\uD06C FK/IK, Jacobian, quaternion/Euler/rotation matrix, singularity/manipulability, trajectory, PD/\uC911\uB825\uBCF4\uC0C1, URDF/tf.",
          "\uC790\uC728\uC8FC\uD589: differential drive/bicycle model, odometry, 1D KF/2D EKF, occupancy grid/costmap, A*, Pure Pursuit/Stanley, Nav2/slam_toolbox/robot_localization.",
          "AI: dataset split, metric, PyTorch small model, confusion matrix, ONNX export, ONNX Runtime, ROS 2 image inference.",
          "LLM \uD558\uB124\uC2A4: prompt template, chunking/retrieval, eval harness, trace/log/result CSV."
        ],
        why: [
          "\uCCB4\uD06C\uB9AC\uC2A4\uD2B8\uB294 \uACF5\uBD80\uB7C9\uC744 \uACFC\uC2DC\uD558\uAE30 \uC704\uD55C \uAC83\uC774 \uC544\uB2C8\uB77C \uBE48 \uCD95\uC744 \uCC3E\uAE30 \uC704\uD55C \uC7A5\uCE58\uB2E4.",
          "\uC9C1\uC811 \uAD6C\uD604\uD574\uBCF8 \uD56D\uBAA9\uACFC \uC124\uBA85\uB9CC \uAC00\uB2A5\uD55C \uD56D\uBAA9\uC744 \uAD6C\uBD84\uD574\uC57C \uB2E4\uC74C \uD559\uC2B5\uC774 \uC815\uD655\uD574\uC9C4\uB2E4."
        ],
        cppPractice: cpp(
          "\uCCB4\uD06C\uB9AC\uC2A4\uD2B8 item",
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
          "\uB3C4\uBA54\uC778\uBCC4 \uC644\uB8CC \uC0C1\uD0DC\uB97C \uBA85\uD655\uD558\uAC8C \uAD00\uB9AC\uD55C\uB2E4.",
          ["JSON \uC800\uC7A5\uC73C\uB85C \uBC14\uAFBC\uB2E4.", "\uC644\uB8CC\uC728\uC744 \uACC4\uC0B0\uD55C\uB2E4.", "\uB0AE\uC740 \uB3C4\uBA54\uC778\uBD80\uD130 \uCD94\uCC9C\uD558\uB294 \uD568\uC218\uB97C \uB9CC\uB4E0\uB2E4."]
        ),
        pythonPractice: py(
          "\uC644\uB8CC\uC728 \uACC4\uC0B0",
          `
items = {"arm": [1, 1, 0], "mobile": [1, 0, 0], "ai": [1, 1, 1]}
for domain, done in items.items():
    print(domain, sum(done) / len(done))
          `,
          "\uB3C4\uBA54\uC778\uBCC4 \uBE48\uD2C8\uC744 \uBE60\uB974\uAC8C \uACC4\uC0B0\uD55C\uB2E4.",
          ["\uB9C9\uB300\uADF8\uB798\uD504\uB85C \uD45C\uC2DC\uD55C\uB2E4.", "\uC774\uBC88 \uC8FC \uC6B0\uC120\uC21C\uC704\uB97C \uC790\uB3D9 \uCD94\uCC9C\uD55C\uB2E4.", "Markdown \uCCB4\uD06C\uB9AC\uC2A4\uD2B8\uB97C \uC0DD\uC131\uD55C\uB2E4."]
        ),
        quiz: [
          {
            id: "check-q1",
            type: "choice",
            prompt: "\uB85C\uBD07\uD314 \uCD5C\uC18C \uCCB4\uD06C\uB9AC\uC2A4\uD2B8\uC5D0 \uD3EC\uD568\uB418\uB294 \uD56D\uBAA9\uC740?",
            choices: ["2\uB9C1\uD06C FK/IK\uC640 Jacobian", "\uC774\uBA54\uC77C \uC790\uB3D9\uBD84\uB958", "CSS \uC560\uB2C8\uBA54\uC774\uC158", "\uB370\uC774\uD130\uBCA0\uC774\uC2A4 \uC0E4\uB529"],
            answer: "2\uB9C1\uD06C FK/IK\uC640 Jacobian",
            explanation: "PDF\uB294 \uB85C\uBD07\uD314 \uCD5C\uC18C \uAE30\uC900\uC73C\uB85C FK/IK/Jacobian\uC744 \uC9C1\uC811 \uAD6C\uD604\uD558\uB294 \uAC83\uC744 \uB454\uB2E4."
          },
          {
            id: "check-q2",
            type: "trueFalse",
            prompt: "AI \uCD5C\uC18C \uAE30\uC900\uC5D0\uB294 ONNX export\uC640 Runtime \uCD94\uB860 \uACBD\uD5D8\uC774 \uD3EC\uD568\uB41C\uB2E4.",
            choices: ["\uCC38", "\uAC70\uC9D3"],
            answer: "\uCC38",
            explanation: "\uD559\uC2B5\uBFD0 \uC544\uB2C8\uB77C \uBC30\uD3EC/\uCD94\uB860 \uD750\uB984\uC744 \uC774\uD574\uD558\uB294 \uAC83\uC774 \uBAA9\uD45C\uB2E4."
          }
        ],
        checklist: [
          "\uB85C\uBD07\uD314 \uCD5C\uC18C \uD56D\uBAA9\uC744 3\uAC1C \uC774\uC0C1 \uC9C1\uC811 \uAD6C\uD604\uD588\uB2E4.",
          "\uC790\uC728\uC8FC\uD589 \uCD5C\uC18C \uD56D\uBAA9\uC744 3\uAC1C \uC774\uC0C1 \uC9C1\uC811 \uAD6C\uD604\uD588\uB2E4.",
          "AI \uBC30\uD3EC \uD750\uB984\uC744 \uD55C \uBC88 \uC774\uC0C1 \uB05D\uAE4C\uC9C0 \uD655\uC778\uD588\uB2E4.",
          "\uD558\uB124\uC2A4\uAC00 \uACB0\uACFC CSV/JSONL\uC744 \uB0A8\uAE34\uB2E4."
        ]
      }
    ]
  },
  {
    id: "advanced-foundations",
    title: "10. \uC2E4\uBB34\uD615 Physical AI \uCD94\uAC00 \uAE30\uCD08\uCD95",
    summary: "\uC2E4\uC2DC\uAC04\uC131, \uC548\uC804\uC131, \uACE0\uAE09 \uC81C\uC5B4, \uC13C\uC11C\uC735\uD569, \uBC18\uBCF5 \uC2E4\uD5D8/\uD3C9\uAC00\uB97C \uAE30\uCD08\uC5ED\uB7C9\uC758 \uD655\uC7A5 \uCD95\uC73C\uB85C \uD3EC\uD568\uD55C\uB2E4.",
    sections: [
      {
        id: "realtime",
        title: "\uC2E4\uC2DC\uAC04\uC131 / \uC9C0\uC5F0 / \uC81C\uC5B4\uC8FC\uAE30",
        focus: "control frequency, latency, jitter, executor, QoS, timestamp\uB97C \uCE21\uC815\uD55C\uB2E4.",
        theory: [
          "\uAC19\uC740 \uC81C\uC5B4\uC2DD\uB3C4 10 Hz, 50 Hz, 100 Hz, 1 kHz\uC5D0\uC11C \uAC70\uB3D9\uC774 \uB2EC\uB77C\uC9C4\uB2E4.",
          "latency, jitter, deadline miss, blocking/non-blocking callback, executor, callback group, QoS\uAC00 \uC911\uC694\uD558\uB2E4.",
          "sensor timestamp\uC640 processing timestamp\uB97C \uAD6C\uBD84\uD574\uC57C \uC9C0\uC5F0\uC744 \uC81C\uB300\uB85C \uD574\uC11D\uD55C\uB2E4.",
          "control loop \uC548\uC758 \uB3D9\uC801 \uBA54\uBAA8\uB9AC \uD560\uB2F9\uC740 \uC2E4\uC2DC\uAC04\uC131\uC5D0 \uC601\uD5A5\uC744 \uC904 \uC218 \uC788\uB2E4."
        ],
        why: [
          "\uC8FC\uAE30 \uD754\uB4E4\uB9BC\uC774 \uCEE4\uC9C0\uBA74 \uC81C\uC5B4 \uC548\uC815\uC131\uACFC \uC13C\uC11C\uD4E8\uC804 \uD488\uC9C8\uC774 \uB5A8\uC5B4\uC9C4\uB2E4.",
          "rosbag2, RViz, Gazebo, perception \uB178\uB4DC\uAC00 \uB3D9\uC2DC\uC5D0 \uB3CC \uB54C \uC2E4\uC81C \uC8FC\uAE30\uAC00 \uBC00\uB9B4 \uC218 \uC788\uB2E4."
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
          "loop period \uD3C9\uADE0/\uCD5C\uB300/\uCD5C\uC18C/\uD45C\uC900\uD3B8\uCC28\uB97C \uACC4\uC0B0\uD55C\uB2E4.",
          ["rclcpp::Rate loop\uC5D0 \uBD99\uC778\uB2E4.", "publisher/subscriber \uC9C0\uC5F0 \uCE21\uC815\uC73C\uB85C \uD655\uC7A5\uD55C\uB2E4.", "SingleThreadedExecutor\uC640 MultiThreadedExecutor\uB97C \uBE44\uAD50\uD55C\uB2E4."]
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
          "deadline \uAE30\uC900\uC120\uC744 \uB450\uACE0 \uC9C0\uC5F0 \uBD84\uD3EC\uB97C \uD655\uC778\uD55C\uB2E4.",
          ["timer drift\uB97C \uAE30\uB85D\uD55C\uB2E4.", "sensor timestamp \uCC28\uC774\uB97C \uACC4\uC0B0\uD55C\uB2E4.", "CSV \uB85C\uADF8\uB97C \uC77D\uC5B4 percentile\uC744 \uAD6C\uD55C\uB2E4."]
        ),
        visualizerId: "latency",
        quiz: [
          {
            id: "realtime-q1",
            type: "choice",
            prompt: "\uC81C\uC5B4\uC8FC\uAE30 \uD754\uB4E4\uB9BC\uC744 \uB73B\uD558\uB294 \uC6A9\uC5B4\uB294?",
            choices: ["jitter", "embedding", "inflation", "segmentation"],
            answer: "jitter",
            explanation: "jitter\uB294 \uBC18\uBCF5 \uB8E8\uD504 \uC8FC\uAE30\uAC00 \uC77C\uC815\uD558\uC9C0 \uC54A\uC740 \uC815\uB3C4\uB97C \uB73B\uD55C\uB2E4."
          },
          {
            id: "realtime-q2",
            type: "trueFalse",
            prompt: "sensor timestamp\uC640 processing timestamp\uB294 \uD56D\uC0C1 \uAC19\uC740 \uC758\uBBF8\uB2E4.",
            choices: ["\uCC38", "\uAC70\uC9D3"],
            answer: "\uAC70\uC9D3",
            explanation: "\uC13C\uC11C\uAC00 \uCE21\uC815\uD55C \uC2DC\uAC01\uACFC \uB178\uB4DC\uAC00 \uCC98\uB9AC\uD55C \uC2DC\uAC01\uC740 \uB2E4\uB97C \uC218 \uC788\uB2E4."
          }
        ],
        checklist: [
          "10/50/100 Hz loop\uC758 \uC2E4\uC81C \uC8FC\uAE30\uB97C \uCE21\uC815\uD588\uB2E4.",
          "latency histogram\uC744 \uB9CC\uB4E4\uC5C8\uB2E4.",
          "executor\uC640 callback group \uCC28\uC774\uB97C \uC124\uBA85\uD560 \uC218 \uC788\uB2E4."
        ]
      },
      {
        id: "safety-control-fusion-eval",
        title: "\uC548\uC804\uC131, \uACE0\uAE09 \uC81C\uC5B4, \uC13C\uC11C\uC735\uD569, \uD3C9\uAC00",
        focus: "Physical AI\uC758 \uC2E4\uBB34 \uAE30\uCD08\uC778 \uBCF4\uD638 \uB85C\uC9C1, LQR/MPC \uAC10\uAC01, \uC2DC\uAC04\uB3D9\uAE30\uD654, \uBC18\uBCF5 \uC2E4\uD5D8\uC744 \uBB36\uC5B4\uC11C \uBCF8\uB2E4.",
        theory: [
          "\uC548\uC804\uC131: fail-safe, E-stop, watchdog timer, soft/hard limit, collision checking, geofence, recovery, FMEA, safety monitor node.",
          "\uACE0\uAE09 \uC81C\uC5B4: state-space, controllability/observability, LQR, MPC, constraint, cost function, feedforward + feedback.",
          "\uC13C\uC11C\uC735\uD569: time sync, approximate/exact sync, covariance tuning, EKF/UKF, factor graph, extrinsic/intrinsic calibration, IMU bias.",
          "\uD3C9\uAC00/\uD1B5\uD569: metric, benchmark, reproducibility, ablation, parameter sweep, regression test, rosbag/dataset \uAD00\uB9AC, failure taxonomy."
        ],
        why: [
          "Physical AI\uB294 \uBB3C\uB9AC \uC138\uACC4\uC640 \uC5F0\uACB0\uB418\uBBC0\uB85C \uC798\uBABB\uB41C \uD310\uB2E8\uC774 \uC2E4\uC81C \uCDA9\uB3CC, \uB099\uD558, \uBAA8\uD130 \uACFC\uBD80\uD558\uB85C \uC774\uC5B4\uC9C8 \uC218 \uC788\uB2E4.",
          "\uD55C \uBC88 \uC131\uACF5\uD55C \uB370\uBAA8\uBCF4\uB2E4 \uBC18\uBCF5 \uC870\uAC74\uC5D0\uC11C \uC2E4\uD328\uB97C \uBD84\uB958\uD558\uACE0 \uC218\uCE58\uB85C \uBE44\uAD50\uD558\uB294 \uB2A5\uB825\uC774 \uB354 \uC624\uB798 \uAC04\uB2E4."
        ],
        cppPractice: cpp(
          "watchdog \uC0C1\uD0DC\uBA38\uC2E0",
          `
enum class SafetyState { Normal, Warning, Stop, Recovery };

SafetyState update(bool heartbeat_ok, bool obstacle_close) {
  if (!heartbeat_ok || obstacle_close) return SafetyState::Stop;
  return SafetyState::Normal;
}
          `,
          "\uC13C\uC11C heartbeat\uC640 \uC7A5\uC560\uBB3C \uC870\uAC74\uC73C\uB85C \uC548\uC804 \uC0C1\uD0DC\uB97C \uC804\uD658\uD55C\uB2E4.",
          ["STOP\uC5D0\uC11C zero velocity\uB97C publish\uD55C\uB2E4.", "RECOVERY \uC870\uAC74\uC744 \uCD94\uAC00\uD55C\uB2E4.", "fault event\uB97C CSV\uB85C \uAE30\uB85D\uD55C\uB2E4."]
        ),
        pythonPractice: py(
          "parameter sweep \uACB0\uACFC\uD45C",
          `
import pandas as pd

df = pd.DataFrame({
    "lookahead": [0.4, 0.8, 1.2],
    "tracking_error": [0.31, 0.18, 0.24],
    "latency_ms": [18, 20, 21],
})
print(df.sort_values("tracking_error"))
          `,
          "\uC5EC\uB7EC \uD30C\uB77C\uBBF8\uD130 \uC138\uD2B8\uB97C metric\uC73C\uB85C \uBE44\uAD50\uD55C\uB2E4.",
          ["\uC2E4\uD328 \uCF00\uC774\uC2A4 taxonomy\uB97C \uCD94\uAC00\uD55C\uB2E4.", "baseline \uB300\uBE44 \uAC1C\uC120\uC728\uC744 \uACC4\uC0B0\uD55C\uB2E4.", "Markdown \uB9AC\uD3EC\uD2B8\uB97C \uC790\uB3D9 \uC0DD\uC131\uD55C\uB2E4."]
        ),
        visualizerId: "sweep",
        quiz: [
          {
            id: "safety-q1",
            type: "choice",
            prompt: "\uBA85\uB839\uC774 \uC77C\uC815 \uC2DC\uAC04 \uB4E4\uC5B4\uC624\uC9C0 \uC54A\uC73C\uBA74 zero velocity\uB97C \uBCF4\uB0B4\uB294 \uBCF4\uD638 \uC7A5\uCE58\uB294?",
            choices: ["watchdog timer", "confusion matrix", "quintic spline", "chunker"],
            answer: "watchdog timer",
            explanation: "watchdog\uC740 timeout\uC774\uB098 heartbeat \uC2E4\uD328 \uC2DC \uC548\uC804 \uC0C1\uD0DC\uB85C \uC804\uD658\uD558\uB294 \uAE30\uBCF8 \uBCF4\uD638 \uB85C\uC9C1\uC774\uB2E4."
          },
          {
            id: "safety-q2",
            type: "choice",
            prompt: "\uC5EC\uB7EC \uD30C\uB77C\uBBF8\uD130 \uC870\uD569\uC744 \uBC18\uBCF5 \uC2E4\uD589\uD574 metric\uC744 \uBE44\uAD50\uD558\uB294 \uBC29\uBC95\uC740?",
            choices: ["parameter sweep", "Euler angle", "URDF material", "label smoothing only"],
            answer: "parameter sweep",
            explanation: "\uBC18\uBCF5 \uC2E4\uD5D8/\uD3C9\uAC00 \uCD95\uC5D0\uC11C parameter sweep\uC740 \uC131\uB2A5 \uBE44\uAD50\uC758 \uAE30\uBCF8 \uB3C4\uAD6C\uB2E4."
          }
        ],
        checklist: [
          "cmd_vel limit filter\uC640 watchdog\uC744 \uC124\uACC4\uD588\uB2E4.",
          "LQR/MPC\uAC00 \uC5B4\uB5A4 \uBB38\uC81C\uB97C \uD480\uAE30 \uC704\uD55C \uC81C\uC5B4\uC778\uC9C0 \uC124\uBA85\uD560 \uC218 \uC788\uB2E4.",
          "sensor timestamp \uCC28\uC774\uB97C \uBD84\uC11D\uD588\uB2E4.",
          "parameter sweep \uACB0\uACFC\uB97C \uD45C\uC640 \uADF8\uB798\uD504\uB85C \uB0A8\uACBC\uB2E4."
        ]
      }
    ]
  },
  {
    id: "judgement",
    title: "11. Physical AI \uAE30\uCD08\uC5ED\uB7C9 \uD310\uC815",
    summary: "\uC785\uBB38-\uC911\uAE09 \uCD08\uC785\uC758 \uD575\uC2EC \uAE30\uCD08\uCCB4\uB825\uC5D0 \uB3C4\uB2EC\uD588\uB294\uC9C0 \uC2A4\uC2A4\uB85C \uD310\uC815\uD55C\uB2E4.",
    sections: [
      {
        id: "judgement-criteria",
        title: "10\uCD95 \uD310\uC815 \uAE30\uC900",
        focus: "\uAE30\uCD08\uB97C \uB2E4 \uAC16\uCDC4\uB2E4\uACE0 \uB9D0\uD558\uAE30\uBCF4\uB2E4, \uC785\uBB38-\uC911\uAE09 \uCD08\uC785\uC758 \uD575\uC2EC \uAE30\uCD08\uCCB4\uB825\uC744 \uAC16\uCDC4\uB294\uC9C0 \uD310\uB2E8\uD55C\uB2E4.",
        theory: [
          "10\uCD95: \uC218\uD559/\uD45C\uD604, \uB85C\uBD07\uD314 \uC6B4\uB3D9\uD559/\uB3D9\uC5ED\uD559, \uBAA8\uBC14\uC77C \uB85C\uBD07 \uC6B4\uB3D9\uD559/\uC790\uC728\uC8FC\uD589, \uC13C\uC11C/\uC778\uC2DD, \uACC4\uD68D/\uC81C\uC5B4, AI \uCD94\uB860/\uBC30\uD3EC, ROS 2 \uC2DC\uC2A4\uD15C\uD654, \uC2E4\uC2DC\uAC04\uC131/\uC548\uC804\uC131, \uACE0\uAE09 \uC81C\uC5B4/\uC13C\uC11C\uC735\uD569 \uAE30\uCD08, \uBC18\uBCF5 \uC2E4\uD5D8/\uD3C9\uAC00/\uD1B5\uD569 \uACBD\uD5D8.",
          "4\uAC1C \uD310\uC815 \uC9C8\uBB38: \uB85C\uBD07\uD314 \uC218\uC2DD\uACFC \uAD6C\uD604, \uBAA8\uBC14\uC77C localization/planning/control, AI \uD559\uC2B5/\uCD94\uB860/\uBC30\uD3EC, ROS 2\uC640 logging/evaluation \uC2DC\uC2A4\uD15C \uC5F0\uACB0.",
          "4\uAC1C \uC911 3\uAC1C \uC774\uC0C1 \uAC00\uB2A5\uD558\uBA74 Physical AI \uAE30\uCD08\uC5ED\uB7C9\uC774 \uAF64 \uAC16\uCDB0\uC9C4 \uC0C1\uD0DC\uB85C \uBCF8\uB2E4."
        ],
        why: [
          "\uC774 \uB2E8\uACC4 \uC774\uD6C4 \uC131\uC7A5\uC740 \uD2B9\uC815 \uB3C4\uBA54\uC778 \uD558\uB098\uB97C \uACE8\uB77C \uAE4A\uAC8C \uD30C\uB294 \uBC29\uC2DD\uC774 \uC88B\uB2E4.",
          "\uB113\uC740 \uAE30\uCD08\uC640 \uAE4A\uC740 \uC804\uBB38\uC131\uC740 \uB2E4\uB978 \uC804\uB7B5\uC774 \uD544\uC694\uD558\uB2E4."
        ],
        cppPractice: cpp(
          "\uD310\uC815 \uC2A4\uCF54\uC5B4",
          `
int count_ready(bool arm, bool mobile, bool ai, bool ros_eval) {
  return static_cast<int>(arm) + static_cast<int>(mobile)
       + static_cast<int>(ai) + static_cast<int>(ros_eval);
}
          `,
          "4\uAC1C \uD310\uC815 \uC9C8\uBB38 \uC911 \uBA87 \uAC1C\uB97C \uB9CC\uC871\uD558\uB294\uC9C0 \uACC4\uC0B0\uD55C\uB2E4.",
          ["\uB3C4\uBA54\uC778\uBCC4 \uC99D\uAC70 \uB9C1\uD06C\uB97C \uCD94\uAC00\uD55C\uB2E4.", "\uCD5C\uC18C \uC810\uC218 \uAE30\uC900\uC744 \uBC14\uAFD4\uBCF8\uB2E4.", "\uD559\uC2B5 \uC0AC\uC774\uD2B8 progress\uC640 \uC5F0\uACB0\uD55C\uB2E4."]
        ),
        pythonPractice: py(
          "10\uCD95 \uB808\uC774\uB354 \uC900\uBE44 \uB370\uC774\uD130",
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
          "\uB0AE\uC740 \uCD95\uC744 \uB2E4\uC74C \uD559\uC2B5 \uBAA9\uD45C\uB85C \uACE0\uB978\uB2E4.",
          ["radar chart\uB85C \uADF8\uB9B0\uB2E4.", "\uC6D4\uAC04 \uBAA9\uD45C\uB97C \uC790\uB3D9 \uC0DD\uC131\uD55C\uB2E4.", "\uC99D\uAC70 \uB85C\uADF8\uB97C \uB9C1\uD06C\uD55C\uB2E4."]
        ),
        quiz: [
          {
            id: "judge-q1",
            type: "choice",
            prompt: "PDF\uC758 \uCD5C\uC885 \uD45C\uD604\uC5D0 \uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uAC83\uC740?",
            choices: ["\uC785\uBB38-\uC911\uAE09 \uCD08\uC785\uC758 \uD575\uC2EC \uAE30\uCD08\uCCB4\uB825", "\uBAA8\uB4E0 \uACE0\uAE09 \uC5F0\uAD6C \uC5ED\uB7C9 \uC644\uB8CC", "\uC6F9 \uAC1C\uBC1C\uC790 \uC804\uD658 \uC644\uB8CC", "\uC218\uD559 \uACF5\uBD80 \uBD88\uD544\uC694"],
            answer: "\uC785\uBB38-\uC911\uAE09 \uCD08\uC785\uC758 \uD575\uC2EC \uAE30\uCD08\uCCB4\uB825",
            explanation: "\uBB38\uC11C\uB294 '\uB2E4 \uAC16\uCDC4\uB2E4'\uBCF4\uB2E4 \uC785\uBB38-\uC911\uAE09 \uCD08\uC785\uC758 \uAE30\uCD08\uCCB4\uB825\uC774\uB77C\uB294 \uD45C\uD604\uC774 \uC815\uD655\uD558\uB2E4\uACE0 \uBCF8\uB2E4."
          },
          {
            id: "judge-q2",
            type: "trueFalse",
            prompt: "\uC774\uD6C4 \uC131\uC7A5\uC740 \uD2B9\uC815 \uBD84\uC57C \uD558\uB098\uB97C \uACE8\uB77C \uAE4A\uAC8C \uD30C\uB294 \uBC29\uC2DD\uC774 \uC88B\uB2E4.",
            choices: ["\uCC38", "\uAC70\uC9D3"],
            answer: "\uCC38",
            explanation: "\uB113\uC740 \uAE30\uCD08 \uC774\uD6C4\uC5D0\uB294 \uB3C4\uBA54\uC778 \uC2EC\uD654\uAC00 \uD544\uC694\uD558\uB2E4."
          }
        ],
        checklist: [
          "10\uCD95 \uC911 \uB0B4\uAC00 \uB0AE\uC740 \uCD95 2\uAC1C\uB97C \uACE8\uB790\uB2E4.",
          "4\uAC1C \uD310\uC815 \uC9C8\uBB38 \uC911 3\uAC1C \uC774\uC0C1\uC5D0 \uAD6C\uD604 \uC99D\uAC70\uAC00 \uC788\uB2E4.",
          "\uB2E4\uC74C \uC2EC\uD654 \uB3C4\uBA54\uC778\uC744 \uD558\uB098 \uC815\uD588\uB2E4."
        ]
      }
    ]
  },
  {
    id: "links",
    title: "12. \uACF5\uC2DD \uB9C1\uD06C \uBAA8\uC74C",
    summary: "\uACF5\uC2DD \uBB38\uC11C\uC640 \uB300\uD45C \uC790\uB8CC\uB97C \uD559\uC2B5 \uC2A4\uD0DD\uBCC4\uB85C \uBAA8\uC544 \uB454\uB2E4.",
    sections: [
      {
        id: "official-links",
        title: "\uC790\uB8CC \uC5F0\uACB0",
        focus: "\uACF5\uC2DD \uBB38\uC11C\uC640 \uAD50\uC7AC\uB97C implementation checklist\uC640 \uC5F0\uACB0\uD55C\uB2E4.",
        theory: [
          "\uB85C\uBD07\uD314: Modern Robotics, KDL, Pinocchio, RBDL, MoveIt 2, ros2_control.",
          "\uC790\uC728\uC8FC\uD589: Probabilistic Robotics, Planning Algorithms, Nav2, slam_toolbox, robot_localization, OpenCV, PCL, MRPT, OMPL.",
          "AI: PyTorch docs, OpenCV docs, ONNX Runtime docs, TensorRT docs.",
          "\uD504\uB86C\uD504\uD2B8/\uCEE8\uD14D\uC2A4\uD2B8/\uD558\uB124\uC2A4: OpenAI prompt/evals docs, Anthropic prompting/context docs."
        ],
        why: [
          "\uACF5\uC2DD \uBB38\uC11C\uC640 \uAD6C\uD604 \uACFC\uC81C\uB97C \uAC19\uC774 \uBCF4\uBA74 \uAC80\uC0C9 \uC2DC\uAC04\uC774 \uC904\uACE0 \uD559\uC2B5 \uACBD\uB85C\uAC00 \uD754\uB4E4\uB9AC\uC9C0 \uC54A\uB294\uB2E4.",
          "\uB77C\uC774\uBE0C\uB7EC\uB9AC \uBC84\uC804\uC740 \uBC14\uB014 \uC218 \uC788\uC73C\uBBC0\uB85C \uC2E4\uC81C \uC124\uCE58 \uC804 \uACF5\uC2DD \uBB38\uC11C\uB97C \uD655\uC778\uD558\uB294 \uC2B5\uAD00\uC774 \uD544\uC694\uD558\uB2E4."
        ],
        cppPractice: cpp(
          "\uBB38\uC11C \uB9C1\uD06C metadata",
          `
struct DocLink {
  const char* name;
  const char* domain;
  const char* purpose;
};
          `,
          "\uD559\uC2B5 \uC790\uB8CC\uB97C \uB3C4\uBA54\uC778\uACFC \uBAA9\uC801\uBCC4\uB85C \uBD84\uB958\uD55C\uB2E4.",
          ["URL \uD544\uB4DC\uB97C \uCD94\uAC00\uD55C\uB2E4.", "\uB9C8\uC9C0\uB9C9 \uD655\uC778 \uB0A0\uC9DC\uB97C \uB123\uB294\uB2E4.", "Markdown \uB9C1\uD06C \uBAA9\uB85D\uC744 \uC0DD\uC131\uD55C\uB2E4."]
        ),
        pythonPractice: py(
          "Markdown \uB9C1\uD06C \uC0DD\uC131",
          `
links = [("MoveIt 2", "manipulator"), ("Nav2", "mobile"), ("PyTorch", "ai")]
for name, domain in links:
    print(f"- [{domain}] {name}")
          `,
          "\uC790\uB8CC \uBAA9\uB85D\uC744 \uB178\uD2B8\uC5D0 \uBD99\uC77C \uC218 \uC788\uB294 \uD615\uD0DC\uB85C \uB9CC\uB4E0\uB2E4.",
          ["\uC2E4\uC81C URL \uCEEC\uB7FC\uC744 \uCD94\uAC00\uD55C\uB2E4.", "\uBD84\uC57C\uBCC4\uB85C \uC815\uB82C\uD55C\uB2E4.", "\uD559\uC2B5 \uC644\uB8CC \uCCB4\uD06C\uBC15\uC2A4\uB97C \uBD99\uC778\uB2E4."]
        ),
        quiz: [
          {
            id: "links-q1",
            type: "choice",
            prompt: "Nav2\uC640 \uAC00\uC7A5 \uAD00\uB828 \uAE4A\uC740 \uBD84\uC57C\uB294?",
            choices: ["\uC790\uC728\uC8FC\uD589/\uBAA8\uBC14\uC77C \uB85C\uBD07", "\uB85C\uBD07\uD314 \uB3D9\uC5ED\uD559\uB9CC", "\uD504\uB860\uD2B8\uC5D4\uB4DC \uC2A4\uD0C0\uC77C\uB9C1", "\uC774\uBA54\uC77C \uC1A1\uC2E0"],
            answer: "\uC790\uC728\uC8FC\uD589/\uBAA8\uBC14\uC77C \uB85C\uBD07",
            explanation: "Nav2\uB294 ROS 2 navigation stack\uC774\uB2E4."
          },
          {
            id: "links-q2",
            type: "trueFalse",
            prompt: "\uACF5\uC2DD \uBB38\uC11C\uB294 \uBC84\uC804\uC774 \uBC14\uB014 \uC218 \uC788\uC73C\uBBC0\uB85C \uC2E4\uC2B5 \uC804 \uD655\uC778\uD558\uB294 \uAC83\uC774 \uC88B\uB2E4.",
            choices: ["\uCC38", "\uAC70\uC9D3"],
            answer: "\uCC38",
            explanation: "ROS 2, MoveIt, Nav2, ONNX Runtime \uB4F1\uC740 \uBC84\uC804\uBCC4 \uC0AC\uC6A9\uBC95\uC774 \uB2EC\uB77C\uC9C8 \uC218 \uC788\uB2E4."
          }
        ],
        checklist: [
          "\uBD84\uC57C\uBCC4 \uACF5\uC2DD \uBB38\uC11C\uB97C \uBD81\uB9C8\uD06C\uD588\uB2E4.",
          "\uD604\uC7AC \uC124\uCE58 \uBC84\uC804\uACFC \uBB38\uC11C \uBC84\uC804\uC744 \uB9DE\uCDC4\uB2E4.",
          "\uC2E4\uC2B5 \uCF54\uB4DC \uC606\uC5D0 \uCC38\uACE0 \uBB38\uC11C\uB97C \uC5F0\uACB0\uD588\uB2E4."
        ],
        resources: [
          {
            title: "Modern Robotics",
            url: "https://hades.mech.northwestern.edu/index.php/Modern_Robotics",
            domain: "\uB85C\uBD07\uD314 / \uC774\uB860",
            note: "Northwestern\uC758 Modern Robotics \uC628\uB77C\uC778 \uC790\uB8CC\uC640 \uCC45 \uC815\uBCF4."
          },
          {
            title: "MoveIt 2 Documentation: Humble",
            url: "https://moveit.picknik.ai/humble/",
            domain: "\uB85C\uBD07\uD314 / ROS 2",
            note: "ROS 2 Humble\uC6A9 MoveIt 2 \uD29C\uD1A0\uB9AC\uC5BC, how-to, concept \uBB38\uC11C."
          },
          {
            title: "ros2_control: Humble",
            url: "https://control.ros.org/humble/doc/ros2_control/doc/index.html",
            domain: "\uC81C\uC5B4 / ROS 2",
            note: "controller manager, hardware interface, joint limiting \uBB38\uC11C."
          },
          {
            title: "ROS 2 Humble Documentation",
            url: "https://docs.ros.org/en/humble/",
            domain: "ROS 2 \uACF5\uD1B5",
            note: "workspace, package, topic, service, action, launch \uD559\uC2B5 \uCD9C\uBC1C\uC810."
          },
          {
            title: "Nav2 Documentation",
            url: "https://docs.nav2.org/",
            domain: "\uC790\uC728\uC8FC\uD589",
            note: "planner, controller, behavior tree, costmap \uC911\uC2EC navigation stack."
          },
          {
            title: "slam_toolbox: Humble",
            url: "https://docs.ros.org/en/ros2_packages/humble/api/slam_toolbox/",
            domain: "SLAM",
            note: "2D SLAM, mapping/localization, pose-graph \uAD00\uB828 ROS \uBB38\uC11C."
          },
          {
            title: "robot_localization ROS Index",
            url: "https://index.ros.org/r/robot_localization/",
            domain: "\uC13C\uC11C\uC735\uD569",
            note: "EKF/UKF \uAE30\uBC18 nonlinear state estimation \uD328\uD0A4\uC9C0 \uC815\uBCF4."
          },
          {
            title: "PyTorch Documentation",
            url: "https://docs.pytorch.org/docs/stable/index.html",
            domain: "AI \uD559\uC2B5",
            note: "tensor, autograd, neural network, export \uD559\uC2B5\uC6A9 \uACF5\uC2DD \uBB38\uC11C."
          },
          {
            title: "OpenCV Documentation",
            url: "https://docs.opencv.org/4.x/",
            domain: "Vision",
            note: "image preprocessing, calibration, classical vision \uC54C\uACE0\uB9AC\uC998 \uBB38\uC11C."
          },
          {
            title: "ONNX Runtime Documentation",
            url: "https://onnxruntime.ai/docs/",
            domain: "AI \uBC30\uD3EC",
            note: "ONNX \uBAA8\uB378 \uB85C\uB529, \uCD94\uB860, \uC131\uB2A5 \uD29C\uB2DD\uACFC C++/Python API \uBB38\uC11C."
          },
          {
            title: "NVIDIA TensorRT Documentation",
            url: "https://docs.nvidia.com/tensorrt/",
            domain: "AI \uCD5C\uC801\uD654",
            note: "NVIDIA GPU \uAE30\uBC18 \uACE0\uC131\uB2A5 inference \uCD5C\uC801\uD654 \uBB38\uC11C."
          },
          {
            title: "OpenAI Evals API Reference",
            url: "https://platform.openai.com/docs/api-reference/evals",
            domain: "\uD558\uB124\uC2A4",
            note: "LLM evaluation set\uACFC run\uC744 \uAD00\uB9AC\uD558\uB294 API \uCC38\uACE0 \uBB38\uC11C."
          }
        ]
      }
    ]
  },
  {
    id: "final-guide",
    title: "13. \uB9C8\uC9C0\uB9C9 \uD55C \uC904 \uAC00\uC774\uB4DC",
    summary: "Python \uAC80\uC0B0, C++ \uAD6C\uD604, ROS 2 \uC5F0\uACB0, JetRover \uC2E4\uAE30, \uC2DC\uBBAC\uB808\uC774\uD130 \uBC18\uBCF5, \uB85C\uADF8 \uAE30\uB85D\uC744 \uAFB8\uC900\uD788 \uBC18\uBCF5\uD55C\uB2E4.",
    sections: [
      {
        id: "final-loop",
        title: "\uBC18\uBCF5 \uB8E8\uD504",
        focus: "\uD559\uC2B5 \uC0AC\uC774\uD2B8\uC758 \uBAA8\uB4E0 \uAE30\uB2A5\uC744 \uD558\uB098\uC758 \uBC18\uBCF5 \uB8E8\uD504\uB85C \uC0AC\uC6A9\uD55C\uB2E4.",
        theory: [
          "Python\uC73C\uB85C \uBE60\uB974\uAC8C \uAC80\uC0B0\uD55C\uB2E4.",
          "C++\uB85C \uC815\uD655\uD558\uACE0 \uC7AC\uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uBAA8\uB4C8\uC744 \uAD6C\uD604\uD55C\uB2E4.",
          "ROS 2 \uB178\uB4DC\uB85C \uC5F0\uACB0\uD55C\uB2E4.",
          "JetRover \uC2E4\uAE30\uC5D0\uC11C \uC2E4\uC81C \uAC10\uAC01\uC744 \uC775\uD78C\uB2E4.",
          "\uC2DC\uBBAC\uB808\uC774\uD130\uC5D0\uC11C \uBC18\uBCF5 \uC2E4\uD5D8\uACFC \uACE0\uAE09 \uAE30\uB2A5\uC744 \uBE44\uAD50\uD55C\uB2E4.",
          "\uBAA8\uB4E0 \uACB0\uACFC\uB97C \uB85C\uADF8\uC640 \uB178\uD2B8\uB85C \uB0A8\uAE34\uB2E4."
        ],
        why: [
          "\uC774 \uD750\uB984\uC744 \uAFB8\uC900\uD788 \uBC18\uBCF5\uD558\uBA74 Physical AI \uAE30\uCD08\uCCB4\uB825\uC774 \uCDA9\uBD84\uD788 \uC313\uC778\uB2E4.",
          "\uC774\uB860, \uCF54\uB4DC, \uC2DC\uAC01\uD654, \uD3C9\uAC00\uAC00 \uAC19\uC740 \uB8E8\uD504\uC5D0 \uB4E4\uC5B4\uC640\uC57C \uBC30\uC6B4 \uAC83\uC774 \uC2E4\uC81C \uBB38\uC81C \uD574\uACB0\uB85C \uC774\uC5B4\uC9C4\uB2E4."
        ],
        cppPractice: cpp(
          "\uD559\uC2B5 \uB8E8\uD504 runner",
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
          "\uD559\uC2B5 \uD750\uB984\uC744 \uBA85\uC2DC\uC801\uC778 \uBC18\uBCF5 \uB2E8\uACC4\uB85C \uC0DD\uAC01\uD55C\uB2E4.",
          ["\uAC01 \uB2E8\uACC4\uBCC4 \uC0B0\uCD9C\uBB3C\uC744 \uC815\uC758\uD55C\uB2E4.", "\uC2E4\uD328 \uC2DC \uC774\uC804 \uB2E8\uACC4\uB85C \uB3CC\uC544\uAC00\uB294 \uADDC\uCE59\uC744 \uCD94\uAC00\uD55C\uB2E4.", "progress UI\uC640 \uC5F0\uACB0\uD55C\uB2E4."]
        ),
        pythonPractice: py(
          "\uC624\uB298\uC758 \uB2E4\uC74C \uD589\uB3D9",
          `
loop = ["Python \uAC80\uC0B0", "C++ \uAD6C\uD604", "ROS 2 \uC5F0\uACB0", "JetRover \uD655\uC778", "\uC2DC\uBBAC\uB808\uC774\uD130 \uBC18\uBCF5", "\uB85C\uADF8 \uC815\uB9AC"]
done = {"Python \uAC80\uC0B0", "C++ \uAD6C\uD604"}
todo = [step for step in loop if step not in done]
print(todo[0])
          `,
          "\uC624\uB298 \uC5B4\uB514\uC11C \uB2E4\uC2DC \uC2DC\uC791\uD574\uC57C \uD558\uB294\uC9C0 \uBC14\uB85C \uCC3E\uB294\uB2E4.",
          ["\uC644\uB8CC \uC0C1\uD0DC\uB97C localStorage export JSON\uC73C\uB85C \uC800\uC7A5\uD55C\uB2E4.", "\uC8FC\uAC04 \uB8E8\uD2F4\uACFC \uC5F0\uACB0\uD55C\uB2E4.", "\uD68C\uACE0 \uBB38\uC7A5\uC744 \uC790\uB3D9 \uC0DD\uC131\uD55C\uB2E4."]
        ),
        quiz: [
          {
            id: "final-q1",
            type: "choice",
            prompt: "PDF \uB9C8\uC9C0\uB9C9 \uAC00\uC774\uB4DC\uC758 \uD575\uC2EC \uD750\uB984\uC5D0 \uD3EC\uD568\uB418\uC9C0 \uC54A\uB294 \uAC83\uC740?",
            choices: ["\uBAA8\uB4E0 \uACB0\uACFC\uB97C \uB85C\uADF8\uC640 \uB178\uD2B8\uB85C \uB0A8\uAE30\uAE30", "Python\uC73C\uB85C \uBE60\uB974\uAC8C \uAC80\uC0B0", "C++\uB85C \uC7AC\uC0AC\uC6A9 \uBAA8\uB4C8 \uAD6C\uD604", "\uC2E4\uD5D8 \uD30C\uB77C\uBBF8\uD130\uB97C \uAE30\uC5B5\uC5D0\uB9CC \uC758\uC874"],
            answer: "\uC2E4\uD5D8 \uD30C\uB77C\uBBF8\uD130\uB97C \uAE30\uC5B5\uC5D0\uB9CC \uC758\uC874",
            explanation: "\uC2E4\uD5D8\uC740 \uC7AC\uD604 \uAC00\uB2A5\uD574\uC57C \uD558\uBBC0\uB85C \uD30C\uB77C\uBBF8\uD130\uC640 \uB85C\uADF8\uB97C \uAE30\uB85D\uD574\uC57C \uD55C\uB2E4."
          },
          {
            id: "final-q2",
            type: "trueFalse",
            prompt: "\uC2DC\uAC01\uD654\uB294 \uC218\uC2DD\uACFC \uCF54\uB4DC\uAC00 \uC2E4\uC81C\uB85C \uC5B4\uB5BB\uAC8C \uC6C0\uC9C1\uC774\uB294\uC9C0 \uD655\uC778\uD558\uB294 \uB370 \uB3C4\uC6C0\uC774 \uB41C\uB2E4.",
            choices: ["\uCC38", "\uAC70\uC9D3"],
            answer: "\uCC38",
            explanation: "\uBE0C\uB77C\uC6B0\uC800 \uC2DC\uAC01\uD654\uB294 \uAD50\uC721\uC6A9 \uB2E8\uC21C \uBAA8\uB378\uC774\uC9C0\uB9CC \uD575\uC2EC \uB3D9\uC791 \uD655\uC778\uC5D0 \uC720\uC6A9\uD558\uB2E4."
          }
        ],
        checklist: [
          "\uC624\uB298 \uD559\uC2B5\uD55C \uB0B4\uC6A9\uC744 \uC774\uB860, \uCF54\uB4DC, \uC2DC\uAC01\uD654, \uB85C\uADF8 \uC911 \uCD5C\uC18C 2\uAC00\uC9C0 \uD615\uD0DC\uB85C \uB0A8\uACBC\uB2E4.",
          "\uB2E4\uC74C \uBC18\uBCF5 \uB2E8\uACC4\uAC00 \uBB34\uC5C7\uC778\uC9C0 \uC815\uD588\uB2E4.",
          "\uC644\uB8CC\uD55C \uC139\uC158\uC744 \uC0AC\uC774\uD2B8\uC5D0\uC11C \uCCB4\uD06C\uD588\uB2E4."
        ]
      }
    ]
  }
];
const curriculum = rawCurriculum.map((module2) => ({
  ...module2,
  sections: module2.sections.map(upgradeSection).flatMap(expandSections)
}));
