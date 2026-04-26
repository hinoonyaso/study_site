import type { Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

const opencvContourLab = {
  id: "lab_opencv_threshold_contour",
  title: "OpenCV Threshold + Contour + Bounding Box",
  language: "python" as const,
  theoryConnection: "gray image -> threshold -> contours -> boundingRect",
  starterCode: `import cv2
import numpy as np

def make_or_load_image(path=None):
    # TODO: if path is given and readable, load grayscale.
    # Otherwise create a 120x160 synthetic image with one bright rectangle.
    raise NotImplementedError

def find_bounding_boxes(gray, threshold=127):
    # TODO: threshold, findContours, return [(x,y,w,h), ...]
    raise NotImplementedError

if __name__ == "__main__":
    gray = make_or_load_image()
    boxes = find_bounding_boxes(gray)
    print(boxes[0])`,
  solutionCode: `import cv2
import numpy as np

def make_or_load_image(path=None):
    if path:
        img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
        if img is not None:
            return img
    gray = np.zeros((120, 160), dtype=np.uint8)
    cv2.rectangle(gray, (40, 30), (100, 80), 255, -1)
    return gray

def find_bounding_boxes(gray, threshold=127):
    _, binary = cv2.threshold(gray, threshold, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    boxes = [cv2.boundingRect(c) for c in contours]
    return sorted(boxes, key=lambda box: box[0])

if __name__ == "__main__":
    gray = make_or_load_image()
    boxes = find_bounding_boxes(gray)
    print(boxes[0])`,
  testCode: `import numpy as np
from opencv_threshold_contour import make_or_load_image, find_bounding_boxes

def test_synthetic_box():
    gray = make_or_load_image()
    assert gray.shape == (120, 160)
    assert find_bounding_boxes(gray)[0] == (40, 30, 61, 51)

def test_threshold_blocks_dark_pixels():
    gray = np.zeros((20, 20), dtype=np.uint8)
    gray[5:10, 5:10] = 100
    assert find_bounding_boxes(gray, threshold=127) == []`,
  expectedOutput: "(40, 30, 61, 51)",
  runCommand: "python opencv_threshold_contour.py && pytest test_opencv_threshold_contour.py",
  commonBugs: [
    "BGR 이미지를 grayscale로 바꾸지 않고 threshold를 적용해 contour가 깨짐",
    "OpenCV boundingRect의 w/h가 끝 좌표가 아니라 폭/높이임을 혼동함",
    "RETR_TREE를 써서 내부 구멍 contour까지 box로 세는 실수",
  ],
  extensionTask: "cv2.morphologyEx(open/close)를 추가해 salt-and-pepper noise가 bbox에 미치는 영향을 비교하라.",
};

export const opencvBasicSessions: Session[] = [
  makeAdvancedSession({
    id: "opencv_threshold_contour_basics",
    part: "Part 5. 인식 AI와 로봇 비전",
    title: "OpenCV 기초: Threshold, Contour, Bounding Box",
    prerequisites: ["cnn_conv2d_feature_map", "object_detection_iou_nms"],
    objectives: [
      "cv2.imread와 synthetic fallback으로 실습 이미지를 준비한다.",
      "threshold가 gray image를 binary mask로 바꾸는 과정을 설명한다.",
      "contour와 boundingRect로 물체 후보 영역을 추출한다.",
      "cv_bridge 이전 단계의 카메라 전처리 흐름을 이해한다.",
    ],
    definition:
      "OpenCV 전처리는 카메라 이미지에서 밝기, 색상, 윤곽선 같은 낮은 수준의 단서를 추출해 detection/segmentation 앞단을 안정화하는 과정이다.",
    whyItMatters:
      "실제 로봇 비전은 딥러닝 모델만으로 끝나지 않는다. 조명 변화, 마스크 후처리, contour 기반 safety region 같은 고전 CV 처리가 여전히 많이 쓰인다.",
    intuition:
      "사진을 흑백으로 보고, 밝은 부분만 남긴 뒤, 남은 덩어리의 외곽선을 따라 상자를 치는 절차다.",
    equations: [
      {
        label: "Binary threshold",
        expression: "B(i,j)=255 \\; if \\; I(i,j)>\\tau, \\; else \\; 0",
        terms: [["τ", "threshold"], ["I", "grayscale intensity"]],
        explanation: "밝기 기준으로 관심 영역을 분리한다.",
      },
      {
        label: "Bounding box",
        expression: "bbox=(x_{min},y_{min},x_{max}-x_{min},y_{max}-y_{min})",
        terms: [["w,h", "OpenCV boundingRect width/height"]],
        explanation: "contour의 pixel 범위를 rectangle로 요약한다.",
      },
      {
        label: "Contour area",
        expression: "A=\\sum_{(i,j)\\in contour} 1",
        terms: [["A", "pixel area"]],
        explanation: "작은 noise contour를 제거할 때 사용한다.",
      },
    ],
    derivation: [
      ["이미지 입력", "cv2.imread(path, IMREAD_GRAYSCALE)로 gray image를 얻는다."],
      ["이진화", "threshold τ보다 밝은 pixel을 255로 만든다."],
      ["윤곽선 추출", "findContours로 연결된 foreground 경계를 찾는다."],
      ["bbox 변환", "boundingRect로 로봇 action에 쓰기 쉬운 rectangle을 만든다."],
    ],
    handCalculation: {
      problem: "rectangle 좌상단 (40,30), 우하단 (100,80)을 OpenCV rectangle로 채우면 boundingRect의 w,h는?",
      given: { x1: 40, y1: 30, x2: 100, y2: 80 },
      steps: ["OpenCV rectangle은 끝 pixel을 포함한다.", "w=100-40+1=61", "h=80-30+1=51"],
      answer: "(x,y,w,h)=(40,30,61,51)",
    },
    robotApplication:
      "ROS2에서는 cv_bridge로 sensor_msgs/Image를 cv::Mat 또는 numpy array로 바꾼 뒤 threshold/contour로 작업 영역, line following, safety mask를 빠르게 계산한다.",
    lab: opencvContourLab,
    visualization: {
      id: "vis_opencv_threshold_contour",
      title: "OpenCV Threshold와 Contour",
      equation: "I>tau -> binary -> contour -> bbox",
      parameters: [
        { name: "threshold", symbol: "\\tau", min: 0, max: 255, default: 127, description: "binary threshold" },
        { name: "noise", symbol: "\\eta", min: 0, max: 0.5, default: 0.05, description: "synthetic image noise" },
      ],
      normalCase: "threshold가 적절하면 하나의 contour와 안정적인 bbox가 나온다.",
      failureCase: "threshold가 너무 낮으면 noise까지 foreground가 되고 너무 높으면 물체가 사라진다.",
    },
    quiz: {
      id: "opencv_contour",
      conceptQuestion: "threshold 후 contour를 찾는 이유는?",
      conceptAnswer: "binary foreground 덩어리의 경계를 찾아 bbox, area, center 같은 로봇 action feature로 바꾸기 위해서다.",
      calculationQuestion: "x_min=10, x_max=14이고 끝 pixel을 포함하면 width는?",
      calculationAnswer: "14-10+1=5이다.",
      codeQuestion: "OpenCV grayscale load 한 줄은?",
      codeAnswer: "img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)",
      debugQuestion: "bbox가 작은 점들로 너무 많이 생기면 무엇을 확인하는가?",
      debugAnswer: "threshold가 낮거나 morphology/area filtering이 없어서 noise contour를 잡는지 확인한다.",
      visualQuestion: "threshold를 올리면 foreground는 어떻게 변하는가?",
      visualAnswer: "더 밝은 pixel만 남아 mask와 contour 면적이 줄어든다.",
      robotQuestion: "컨베이어 물체 bbox 중심이 흔들리면 robot pick에 어떤 문제가 생기는가?",
      robotAnswer: "grasp target이 frame마다 흔들려 planning이 불안정하므로 smoothing과 confidence gate가 필요하다.",
      designQuestion: "OpenCV 전처리 결과를 딥러닝 detection 앞에 둘 때 주의점은?",
      designAnswer: "전처리가 진짜 물체를 지워 recall을 낮추지 않도록 fallback과 raw image logging을 둔다.",
    },
    wrongTagLabel: "OpenCV threshold/contour 오류",
    nextSessions: ["pose_estimation_pnp_6d", "semantic_segmentation_basics"],
  }),
];
