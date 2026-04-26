import type { Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

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
    nextSessions: ["semantic_segmentation_basics", "pinhole_camera_projection"],
  }),
];

