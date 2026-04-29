import type { Session } from "../../types";
import { makeAdvancedSession } from "../core/advancedSessionFactory";

const convLab = {
  id: "lab_conv2d_from_scratch",
  title: "Conv2D from Scratch",
  language: "python" as const,
  theoryConnection: "feature[y,x] = sum image[y+i,x+j] * kernel[i,j]",
  starterCode: `import numpy as np

def conv2d_valid(image, kernel):
    # TODO: valid convolution/correlation without padding
    raise NotImplementedError

def output_size(n, k, padding=0, stride=1):
    # TODO: floor((n + 2p - k)/s) + 1
    raise NotImplementedError

if __name__ == "__main__":
    image = np.array([[0,0,0],[0,1,1],[0,1,1]], dtype=float)
    kernel = np.array([[1,0],[0,-1]], dtype=float)
    print(conv2d_valid(image, kernel))`,
  solutionCode: `import numpy as np

def conv2d_valid(image, kernel):
    h, w = image.shape
    kh, kw = kernel.shape
    out = np.zeros((h - kh + 1, w - kw + 1), dtype=float)
    for y in range(out.shape[0]):
        for x in range(out.shape[1]):
            patch = image[y:y+kh, x:x+kw]
            out[y, x] = np.sum(patch * kernel)
    return out

def output_size(n, k, padding=0, stride=1):
    return (n + 2 * padding - k) // stride + 1

if __name__ == "__main__":
    image = np.array([[0,0,0],[0,1,1],[0,1,1]], dtype=float)
    kernel = np.array([[1,0],[0,-1]], dtype=float)
    print(conv2d_valid(image, kernel))`,
  testCode: `import numpy as np
from conv2d_from_scratch import conv2d_valid, output_size

def test_output_size():
    assert output_size(32, 3, padding=1, stride=1) == 32
    assert output_size(32, 3, padding=0, stride=2) == 15

def test_conv_shape():
    out = conv2d_valid(np.zeros((5,5)), np.ones((3,3)))
    assert out.shape == (3,3)

def test_conv_value():
    image = np.arange(9).reshape(3,3)
    kernel = np.ones((2,2))
    assert conv2d_valid(image, kernel)[0,0] == 8`,
  expectedOutput: "[[-1. -1.]\n [-1.  0.]]",
  runCommand: "python conv2d_from_scratch.py && pytest test_conv2d_from_scratch.py",
  commonBugs: [
    "padding/stride output size 공식에서 +1을 빼먹음",
    "kernel을 뒤집는 convolution과 CNN에서 쓰는 correlation을 혼동함",
    "feature map channel 차원을 무시해 RGB 입력에서 shape 오류가 남",
  ],
  extensionTask: "Sobel edge kernel을 적용해 수평/수직 edge feature map을 시각화하라.",
};

const browserOnnxTinyCnnLab = {
  id: "lab_browser_onnx_tiny_cnn",
  title: "Browser Tiny CNN ONNX-style Inference",
  language: "javascript" as const,
  theoryConnection: "input[NCHW] -> Conv/ReLU -> GAP -> Dense logits -> softmax",
  starterCode: `const weights = {
  classes: ["empty", "lane", "box"],
  dense: [
    [-1.1, -0.8, -0.55],
    [1.25, 0.1, -0.25],
    [0.35, 0.65, 1.1],
  ],
  bias: [0.85, -0.18, -0.32],
};

function softmax(logits) {
  // TODO: numerically stable softmax를 구현하라.
  throw new Error("TODO");
}

function inferFromPooled(pooled) {
  // TODO: pooled feature 3개를 dense layer에 넣고 top class를 반환하라.
  throw new Error("TODO");
}

if (require.main === module) {
  const result = inferFromPooled([0.28, 0.36, 0.72]);
  console.log("class:", result.label);
}

module.exports = { softmax, inferFromPooled };`,
  solutionCode: `const weights = {
  classes: ["empty", "lane", "box"],
  dense: [
    [-1.1, -0.8, -0.55],
    [1.25, 0.1, -0.25],
    [0.35, 0.65, 1.1],
  ],
  bias: [0.85, -0.18, -0.32],
};

function softmax(logits) {
  const maxLogit = Math.max(...logits);
  const exp = logits.map((value) => Math.exp(value - maxLogit));
  const sum = exp.reduce((acc, value) => acc + value, 0);
  return exp.map((value) => value / sum);
}

function inferFromPooled(pooled) {
  const logits = weights.dense.map((row, classIndex) =>
    row.reduce((sum, weight, channelIndex) => sum + weight * pooled[channelIndex], weights.bias[classIndex]),
  );
  const probabilities = softmax(logits);
  const topIndex = probabilities.reduce((best, value, index) => (value > probabilities[best] ? index : best), 0);
  return {
    label: weights.classes[topIndex],
    confidence: probabilities[topIndex],
    logits,
  };
}

if (require.main === module) {
  const result = inferFromPooled([0.28, 0.36, 0.72]);
  console.log("class:", result.label);
}

module.exports = { softmax, inferFromPooled };`,
  testCode: `const assert = require("assert");
const { softmax, inferFromPooled } = require("./browser_tiny_onnx_cnn");

const probs = softmax([1, 2, 3]);
assert(Math.abs(probs.reduce((a, b) => a + b, 0) - 1) < 1e-9);

const box = inferFromPooled([0.28, 0.36, 0.72]);
assert.strictEqual(box.label, "box");
assert(box.confidence > 0.38);

const empty = inferFromPooled([0.02, 0.01, 0.03]);
assert.strictEqual(empty.label, "empty");`,
  expectedOutput: "class: box",
  runCommand: "node browser_tiny_onnx_cnn.js && node test_browser_tiny_onnx_cnn.js",
  commonBugs: [
    "softmax에서 maxLogit을 빼지 않아 큰 logit에서 overflow가 남",
    "NCHW/HWC layout 계약을 문서화하지 않아 브라우저 추론 입력 순서가 어긋남",
    "feature map을 해석하지 않고 final class confidence만 확인함",
  ],
  extensionTask: "8x8 입력 grid를 직접 바꿔 lane/box/empty confidence가 어떻게 변하는지 기록하라.",
};

export const cnnBasicSessions: Session[] = [
  makeAdvancedSession({
    id: "cnn_conv2d_feature_map",
    part: "Part 5. 인식 AI와 로봇 비전",
    title: "CNN 기초: Conv Layer와 Feature Map",
    prerequisites: ["object_detection_iou_nms", "pytorch_bc_mlp"],
    objectives: [
      "Conv2D 연산과 feature map 크기 공식을 계산한다.",
      "kernel이 edge/texture를 탐지하는 방식을 코드로 확인한다.",
      "receptive field와 stride/padding의 의미를 설명한다.",
      "YOLO/segmentation backbone이 feature map을 만드는 흐름을 이해한다.",
    ],
    definition: "CNN은 작은 kernel을 이미지 위로 이동시키며 지역 패턴을 feature map으로 바꾸는 신경망이다. 초기 layer는 edge와 texture, 깊은 layer는 object part를 표현한다.",
    whyItMatters: "로봇 비전에서 detection threshold만 조정하면 근본 원인을 찾기 어렵다. backbone feature가 어떤 패턴을 보는지 알아야 lighting, blur, occlusion 실패를 디버깅할 수 있다.",
    intuition: "돋보기 모양 필터를 이미지 위에 밀며 특정 모양이 있는 위치를 점수 지도로 표시하는 과정이다.",
    equations: [
      { label: "Conv2D", expression: "Y_{i,j}=\\sum_{u,v} X_{i+u,j+v}K_{u,v}", terms: [["X", "입력 이미지"], ["K", "kernel"], ["Y", "feature map"]], explanation: "kernel과 local patch의 내적이다." },
      { label: "Output size", expression: "O=\\left\\lfloor\\frac{N+2P-K}{S}\\right\\rfloor+1", terms: [["P", "padding"], ["S", "stride"], ["K", "kernel size"]], explanation: "feature map 공간 크기를 결정한다." },
      { label: "ReLU", expression: "f(x)=\\max(0,x)", terms: [["x", "activation"]], explanation: "음수 응답을 잘라 sparse feature를 만든다." },
    ],
    derivation: [
      ["patch 추출", "kernel 크기와 같은 local image patch를 잡는다."],
      ["내적 계산", "patch와 kernel 원소별 곱을 더한다."],
      ["sliding", "stride만큼 이동하며 모든 위치에서 반복한다."],
      ["feature 해석", "큰 값은 kernel이 찾는 패턴이 그 위치에 있다는 뜻이다."],
    ],
    handCalculation: {
      problem: "N=32, K=3, P=1, S=1이면 output size는?",
      given: { N: 32, K: 3, P: 1, S: 1 },
      steps: ["O=floor((32+2*1-3)/1)+1", "O=31+1=32"],
      answer: "32x32 feature map",
    },
    robotApplication: "컨베이어 로봇에서 blur 때문에 feature map edge 응답이 약해지면 detection confidence가 낮아지고 grasp trigger가 지연된다.",
    lab: convLab,
    visualization: {
      id: "vis_cnn_feature_map",
      title: "Conv Filter Sliding과 Feature Map",
      equation: "Y_ij=sum X_patch*K",
      parameters: [
        { name: "kernel_size", symbol: "K", min: 1, max: 7, default: 3, description: "convolution kernel 크기" },
        { name: "stride", symbol: "S", min: 1, max: 4, default: 1, description: "sliding stride" },
      ],
      normalCase: "edge filter가 물체 경계에서 높은 feature value를 만든다.",
      failureCase: "stride가 너무 크면 작은 물체 feature를 건너뛴다.",
    },
    quiz: {
      id: "cnn_conv",
      conceptQuestion: "feature map이란 무엇인가?",
      conceptAnswer: "kernel이 이미지 각 위치에서 특정 패턴을 얼마나 강하게 감지했는지 나타내는 공간 지도다.",
      calculationQuestion: "N=28,K=5,P=0,S=1이면 output size는?",
      calculationAnswer: "floor((28-5)/1)+1=24이다.",
      codeQuestion: "patch와 kernel의 conv score 계산 한 줄은?",
      codeAnswer: "out[y, x] = np.sum(patch * kernel)",
      debugQuestion: "feature map 크기가 예상보다 1 작으면 무엇을 확인하는가?",
      debugAnswer: "output size 공식의 +1과 range upper bound를 확인한다.",
      visualQuestion: "stride를 키우면 feature map은 어떻게 변하는가?",
      visualAnswer: "공간 크기가 작아지고 작은 패턴을 놓칠 가능성이 커진다.",
      robotQuestion: "카메라 blur가 심할 때 CNN detection confidence가 낮아지는 이유는?",
      robotAnswer: "edge/texture feature 응답이 약해져 backbone feature map이 물체 구분 정보를 덜 갖기 때문이다.",
      designQuestion: "실시간 로봇 비전에서 backbone을 고르는 기준은?",
      designAnswer: "latency budget, 입력 해상도, 작은 물체 recall, 하드웨어 가속 지원을 함께 본다.",
    },
    wrongTagLabel: "CNN feature map 크기·kernel 해석 오류",
    nextSessions: ["browser_onnx_tiny_cnn_feature_demo", "semantic_segmentation_basics", "pinhole_camera_projection"],
  }),
  makeAdvancedSession({
    id: "browser_onnx_tiny_cnn_feature_demo",
    part: "Part 5. 인식 AI와 로봇 비전",
    title: "Browser ONNX-style Tiny CNN Feature Demo",
    level: "intermediate",
    difficulty: "medium",
    estimatedMinutes: 70,
    prerequisites: ["cnn_conv2d_feature_map", "dataset_label_split_confusion_matrix_practice"],
    objectives: [
      "torch/cv2 없이 브라우저에서 정적 weight 기반 CNN 추론 흐름을 실행한다.",
      "input layout, Conv feature map, GAP, Dense logits, softmax 계약을 단계별로 확인한다.",
      "학습 단계는 Colab/PyTorch에 두고 브라우저에서는 배포 artifact 검증을 담당하도록 역할을 나눈다.",
      "로봇 비전에서 낮은 confidence가 feature map 약화인지 후처리 threshold 문제인지 구분한다.",
    ],
    definition:
      "브라우저 ONNX-style 데모는 MobileNet 같은 실제 edge CNN의 배포 계약을 작은 정적 weight 모델로 축소해 보여주는 실습이다. 무거운 학습 프레임워크 없이도 tensor shape, feature map, output parity를 확인한다.",
    whyItMatters:
      "PyTorch 학습 코드는 브라우저에서 실행하기 어렵다. 대신 학습된 artifact가 어떤 입력 계약과 feature map 해석을 갖는지 브라우저에서 확인하면 초보자가 학습과 배포 사이의 끊김을 덜 느낀다.",
    intuition:
      "Colab에서 큰 모델을 훈련하고, 브라우저에서는 그 모델의 작은 전시용 복제품으로 입력과 출력의 배관을 투명하게 보는 방식이다.",
    equations: [
      { label: "Conv feature", expression: "F_c(i,j)=\\max(0,\\sum X_{patch}K_c)", terms: [["F_c", "channel c feature map"], ["K_c", "정적 kernel"]], explanation: "각 channel kernel이 이미지 패턴을 점수 지도로 바꾼다." },
      { label: "GAP", expression: "z_c=\\frac{1}{HW}\\sum_{i,j}F_c(i,j)", terms: [["z_c", "channel c pooled feature"], ["H,W", "feature map 크기"]], explanation: "공간 feature map을 class head 입력 벡터로 압축한다." },
      { label: "Softmax", expression: "p_k=\\frac{e^{l_k}}{\\sum_j e^{l_j}}", terms: [["l_k", "class k logit"], ["p_k", "class probability"]], explanation: "Dense logits를 confidence로 해석한다." },
    ],
    derivation: [
      ["tensor contract", "입력 이름, NCHW shape, dtype을 고정한다.", "image: float32[1,1,8,8]"],
      ["feature extraction", "정적 3x3 kernel 3개로 edge/blob feature map을 만든다.", "Conv/ReLU"],
      ["head inference", "GAP 결과를 dense head에 넣어 class logits를 계산한다.", "l=Wz+b"],
      ["deployment gate", "confidence와 sensor noise가 허용 범위일 때만 다음 ROS 2 단계로 넘긴다.", "conf>tau"],
    ],
    handCalculation: {
      problem: "pooled feature z=[0.28,0.36,0.72]일 때 box logit 계산 흐름을 설명하라.",
      given: { z: "[0.28,0.36,0.72]", W_box: "[0.35,0.65,1.10]", b_box: -0.32 },
      steps: ["l_box=0.35*0.28+0.65*0.36+1.10*0.72-0.32", "l_box=0.804", "softmax에서 가장 크면 box class가 된다."],
      answer: "box logit은 약 0.804이며 softmax confidence 비교로 top class를 정한다.",
    },
    robotApplication:
      "카메라 기반 pick/lane detector에서 브라우저 데모는 입력 밝기·노이즈가 feature map과 confidence를 어떻게 흔드는지 보여주고, 실제 모델은 ONNX Runtime/ROS 2 배포 세션으로 이어진다.",
    lab: browserOnnxTinyCnnLab,
    visualization: {
      id: "vis_browser_onnx_tiny_cnn",
      title: "Static ONNX-style Tiny CNN Inference",
      equation: "image -> Conv/ReLU -> GAP -> Dense -> softmax",
      parameters: [
        { name: "input_pattern", symbol: "x", min: 0, max: 2, default: 0, description: "lane, box, empty 입력 패턴" },
        { name: "feature_channel", symbol: "c", min: 0, max: 2, default: 0, description: "vertical edge, horizontal edge, blob channel" },
        { name: "sensor_noise", symbol: "sigma", min: 0, max: 0.5, default: 0.08, description: "브라우저 추론 입력에 섞이는 센서 노이즈" },
      ],
      normalCase: "정적 weight와 입력 layout 계약이 맞아 feature map이 class confidence와 일관되게 연결된다.",
      failureCase: "layout, normalization, noise gate가 어긋나면 class confidence가 흔들려 ROS 2 publish 단계에서 막아야 한다.",
    },
    quiz: {
      id: "browser_onnx_tiny_cnn",
      conceptQuestion: "브라우저에서 PyTorch 학습 대신 ONNX-style 정적 weight 데모를 두는 이유는?",
      conceptAnswer: "무거운 torch/cv2 없이도 입력 shape, feature map, output confidence, 배포 gate를 즉시 확인하기 위해서다.",
      calculationQuestion: "feature map 평균이 [0.1,0.2,0.3]이면 dense head 입력 차원은?",
      calculationAnswer: "channel 3개의 GAP 결과이므로 입력 차원은 3이다.",
      codeQuestion: "softmax 안정화를 위해 logits에서 먼저 빼는 값은?",
      codeAnswer: "maxLogit을 빼고 exp를 계산한다.",
      debugQuestion: "브라우저 추론 confidence가 Colab 결과와 다르면 먼저 무엇을 확인하는가?",
      debugAnswer: "input name, NCHW/HWC layout, dtype, normalization, class order, weight artifact version을 확인한다.",
      visualQuestion: "sensor noise를 키웠을 때 feature map과 confidence는 어떻게 변해야 하는가?",
      visualAnswer: "feature map 활성 위치가 흐려지고 top class confidence가 낮아지거나 gate가 막힐 수 있다.",
      robotQuestion: "confidence가 낮은 camera inference를 바로 cmd_vel로 연결하면 왜 위험한가?",
      robotAnswer: "잘못된 lane/object를 근거로 actuator 명령이 나가므로 confidence와 stale timestamp gate가 필요하다.",
      designQuestion: "브라우저 데모와 실제 ROS 2 배포 사이에 공유해야 할 계약은?",
      designAnswer: "model artifact hash, input/output name, tensor layout, normalization, class order, confidence threshold, latency budget을 공유한다.",
    },
    wrongTagLabel: "브라우저 ONNX-style CNN 배포 계약 오류",
    nextSessions: ["object_detection_yolo_ssd_pipeline", "pytorch_bc_onnx_export_contract"],
  }),
];
