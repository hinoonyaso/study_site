import type { Session } from "../../types";
import { makeAdvancedSession } from "../core/advancedSessionFactory";

const segLab = {
  id: "lab_segmentation_iou",
  title: "Segmentation Mask IoU",
  language: "python" as const,
  theoryConnection: "mask IoU = intersection pixels / union pixels",
  starterCode: `import numpy as np

def mask_iou(pred, target, cls=1):
    # TODO: IoU for one class
    raise NotImplementedError

if __name__ == "__main__":
    pred = np.array([[0,1,1],[0,1,0]])
    target = np.array([[0,1,0],[0,1,1]])
    print(round(mask_iou(pred, target), 3))`,
  solutionCode: `import numpy as np

def mask_iou(pred, target, cls=1):
    p = pred == cls
    t = target == cls
    inter = np.logical_and(p, t).sum()
    union = np.logical_or(p, t).sum()
    return 1.0 if union == 0 else float(inter / union)

if __name__ == "__main__":
    pred = np.array([[0,1,1],[0,1,0]])
    target = np.array([[0,1,0],[0,1,1]])
    print(round(mask_iou(pred, target), 3))`,
  testCode: `import numpy as np
from segmentation_iou import mask_iou

def test_mask_iou():
    assert abs(mask_iou(np.array([[1,1]]), np.array([[1,0]])) - 0.5) < 1e-9

def test_empty_union():
    assert mask_iou(np.zeros((2,2)), np.zeros((2,2))) == 1.0`,
  expectedOutput: "0.5",
  runCommand: "python segmentation_iou.py && pytest test_segmentation_iou.py",
  commonBugs: ["class별 mask가 아니라 raw label 값을 바로 더함", "union=0인 empty class를 처리하지 않음", "semantic과 instance segmentation metric을 혼동함"],
  extensionTask: "multi-class mean IoU를 구현하고 class imbalance가 metric에 미치는 영향을 분석하라.",
};

const diceLossLab = {
  id: "lab_segmentation_dice_loss",
  title: "Dice Loss and Pixel Cross-Entropy",
  language: "python" as const,
  theoryConnection: "Dice = 2|P∩G|/(|P|+|G|), loss=1-Dice; CE=-sum y log p",
  starterCode: `import numpy as np

def dice_loss(prob, target, eps=1e-6):
    # TODO: binary Dice loss for probability mask and target mask
    raise NotImplementedError

def pixel_cross_entropy(prob, target, eps=1e-6):
    # TODO: binary pixel CE
    raise NotImplementedError

if __name__ == "__main__":
    prob = np.array([[0.9, 0.8], [0.2, 0.1]])
    target = np.array([[1, 1], [0, 0]])
    print(round(dice_loss(prob, target), 3))
    print(round(pixel_cross_entropy(prob, target), 3))`,
  solutionCode: `import numpy as np

def dice_loss(prob, target, eps=1e-6):
    prob = np.asarray(prob, dtype=float)
    target = np.asarray(target, dtype=float)
    inter = np.sum(prob * target)
    denom = np.sum(prob) + np.sum(target)
    dice = (2.0 * inter + eps) / (denom + eps)
    return float(1.0 - dice)

def pixel_cross_entropy(prob, target, eps=1e-6):
    prob = np.clip(np.asarray(prob, dtype=float), eps, 1.0 - eps)
    target = np.asarray(target, dtype=float)
    ce = -(target * np.log(prob) + (1.0 - target) * np.log(1.0 - prob))
    return float(np.mean(ce))

if __name__ == "__main__":
    prob = np.array([[0.9, 0.8], [0.2, 0.1]])
    target = np.array([[1, 1], [0, 0]])
    print(round(dice_loss(prob, target), 3))
    print(round(pixel_cross_entropy(prob, target), 3))`,
  testCode: `import numpy as np
from segmentation_dice_loss import dice_loss, pixel_cross_entropy

def test_perfect_prediction():
    target = np.array([[1,0],[0,1]])
    assert dice_loss(target, target) < 1e-6
    assert pixel_cross_entropy(target, target) < 1e-5

def test_bad_prediction_worse():
    target = np.array([[1,1],[0,0]])
    good = np.array([[0.9,0.8],[0.2,0.1]])
    bad = 1.0 - good
    assert dice_loss(good, target) < dice_loss(bad, target)`,
  expectedOutput: "0.15\n0.164",
  runCommand: "python segmentation_dice_loss.py && pytest test_segmentation_dice_loss.py",
  commonBugs: [
    "Dice denominator에서 pred와 target 합 대신 union을 써 IoU와 섞음",
    "cross entropy에서 log(0)을 막는 eps/clip을 빼먹음",
    "class imbalance가 큰 데이터에서 CE만 보고 작은 물체 mask 품질을 과대평가함",
  ],
  extensionTask: "foreground 비율을 1%, 10%, 50%로 바꾸며 CE와 Dice loss 민감도를 비교하라.",
};

const semanticSegmentationSession = makeAdvancedSession({
    id: "semantic_segmentation_basics",
    part: "Part 5. 인식 AI와 로봇 비전",
    title: "Semantic Segmentation 기초와 Mask IoU",
    prerequisites: ["cnn_conv2d_feature_map", "object_detection_iou_nms"],
    objectives: ["pixel별 class prediction을 설명한다.", "mask IoU와 mean IoU를 계산한다.", "segmentation과 detection의 차이를 로봇 action 관점에서 비교한다.", "depth와 mask를 결합해 grasp region을 만든다."],
    definition: "Semantic segmentation은 이미지의 모든 pixel에 class label을 부여하는 인식 문제다. Detection이 box를 예측한다면 segmentation은 물체의 실제 영역 mask를 예측한다.",
    whyItMatters: "로봇 grasp, navigation traversability, 사람-로봇 안전 영역은 box보다 pixel mask가 더 정확하다.",
    intuition: "사진 위에 색칠 공부처럼 각 pixel을 바닥, 사람, 물체 같은 class 색으로 칠하는 작업이다.",
    equations: [
      { label: "Mask IoU", expression: "IoU=\\frac{|M_p\\cap M_g|}{|M_p\\cup M_g|}", terms: [["M_p", "predicted mask"], ["M_g", "ground truth mask"]], explanation: "segmentation 품질의 대표 metric이다." },
      { label: "Pixel softmax", expression: "p_{i,j,c}=\\frac{e^{z_{i,j,c}}}{\\sum_k e^{z_{i,j,k}}}", terms: [["c", "class index"]], explanation: "각 pixel별 class 확률을 만든다." },
      { label: "Mean IoU", expression: "mIoU=\\frac{1}{C}\\sum_c IoU_c", terms: [["C", "class count"]], explanation: "class별 IoU를 평균한다." },
    ],
    derivation: [["logit map", "CNN decoder가 HxWxC score map을 만든다."], ["softmax", "pixel마다 class 확률로 변환한다."], ["argmax", "가장 높은 class를 mask label로 선택한다."], ["IoU", "pred/gt mask의 교집합과 합집합 pixel을 센다."]],
    handCalculation: { problem: "intersection=20, union=50인 mask IoU는?", given: { intersection: 20, union: 50 }, steps: ["IoU=20/50"], answer: "0.4" },
    robotApplication: "바닥 segmentation mask는 mobile robot costmap의 traversable area로 쓰이고, object mask와 depth는 grasp point 후보 영역을 만든다.",
    lab: segLab,
    visualization: { id: "vis_semantic_segmentation_mask", title: "Segmentation Mask Overlay와 IoU", equation: "IoU=intersection/union", parameters: [{ name: "threshold", symbol: "\\tau", min: 0.1, max: 0.9, default: 0.5, description: "mask probability threshold" }, { name: "noise", symbol: "\\eta", min: 0, max: 0.5, default: 0.1, description: "mask noise" }], normalCase: "mask가 물체 경계를 따라가며 IoU가 높다.", failureCase: "threshold가 높으면 얇은 구조가 사라지고 IoU가 낮아진다." },
    quiz: {
      id: "seg_basic",
      conceptQuestion: "Detection과 segmentation의 차이는?",
      conceptAnswer: "Detection은 box와 class를 예측하고 segmentation은 pixel별 class mask를 예측한다.",
      calculationQuestion: "intersection=12, union=16이면 IoU는?",
      calculationAnswer: "12/16=0.75이다.",
      codeQuestion: "mask 교집합 pixel 수를 세는 코드 한 줄은?",
      codeAnswer: "inter = np.logical_and(pred == cls, target == cls).sum()",
      debugQuestion: "mIoU가 NaN이면 무엇을 확인하는가?",
      debugAnswer: "특정 class union이 0인 경우를 처리했는지 확인한다.",
      visualQuestion: "threshold를 너무 높이면 mask는 어떻게 변하는가?",
      visualAnswer: "확신 높은 pixel만 남아 mask가 작아지고 object 일부가 사라질 수 있다.",
      robotQuestion: "grasp에서 box보다 mask가 유리한 이유는?",
      robotAnswer: "실제 물체 영역과 배경을 더 정확히 분리해 grasp 후보를 안전하게 고를 수 있기 때문이다.",
      designQuestion: "segmentation 결과를 costmap에 넣을 때 필요한 safety check는?",
      designAnswer: "temporal consistency, class confidence, unknown area inflation, stale timestamp를 검사한다.",
    },
    wrongTagLabel: "Segmentation mask/IoU 오류",
    nextSessions: ["pinhole_camera_projection", "vla_architecture_concepts"],
  });

export const semanticSegmentationSessions: Session[] = [
  {
    ...semanticSegmentationSession,
    codeLabs: [diceLossLab, ...semanticSegmentationSession.codeLabs],
    theory: {
      ...semanticSegmentationSession.theory,
      equations: [
        ...semanticSegmentationSession.theory.equations,
        {
          label: "Dice loss",
          expression: "\\mathcal{L}_{Dice}=1-\\frac{2\\sum p_i y_i + \\epsilon}{\\sum p_i + \\sum y_i + \\epsilon}",
          terms: [
            { symbol: "p_i", meaning: "pixel foreground probability" },
            { symbol: "y_i", meaning: "ground truth mask" },
          ],
          explanation: "작은 물체처럼 class imbalance가 큰 segmentation에서 CE와 함께 자주 쓰인다.",
        },
        {
          label: "Pixel cross entropy",
          expression: "\\mathcal{L}_{CE}=-\\frac{1}{N}\\sum_i y_i\\log p_i+(1-y_i)\\log(1-p_i)",
          terms: [
            { symbol: "N", meaning: "pixel count" },
            { symbol: "p_i", meaning: "foreground probability" },
          ],
          explanation: "각 pixel을 독립적인 binary classification으로 본 loss다.",
        },
      ],
    },
  },
];
