import type { Session } from "../types";
import { ensureCodeLabShape, makeCoreQuizzes, makeEquation, makeVisualization, makeWrongTags, session, step } from "./v2SessionHelpers";

const detectionLab = ensureCodeLabShape({
  id: "lab_iou_nms",
  title: "IoU and NMS",
  language: "python",
  theoryConnection: "IoU = area(intersection) / area(union)",
  starterCode: `def iou(a, b):
    # box format: [x1, y1, x2, y2]
    # TODO: compute intersection area
    # TODO: compute union area
    raise NotImplementedError

def nms(boxes, scores, threshold):
    # TODO: greedily keep highest score boxes and suppress high IoU boxes
    raise NotImplementedError

if __name__ == "__main__":
    print(round(iou([0,0,2,2], [1,1,3,3]), 3))`,
  solutionCode: `def iou(a, b):
    x1 = max(a[0], b[0])
    y1 = max(a[1], b[1])
    x2 = min(a[2], b[2])
    y2 = min(a[3], b[3])
    inter = max(0.0, x2 - x1) * max(0.0, y2 - y1)
    area_a = max(0.0, a[2] - a[0]) * max(0.0, a[3] - a[1])
    area_b = max(0.0, b[2] - b[0]) * max(0.0, b[3] - b[1])
    union = area_a + area_b - inter
    return 0.0 if union <= 0.0 else inter / union

def nms(boxes, scores, threshold):
    order = sorted(range(len(boxes)), key=lambda i: scores[i], reverse=True)
    keep = []
    while order:
        current = order.pop(0)
        keep.append(current)
        order = [i for i in order if iou(boxes[current], boxes[i]) <= threshold]
    return keep

if __name__ == "__main__":
    print(round(iou([0,0,2,2], [1,1,3,3]), 3))`,
  testCode: `from iou_nms import iou, nms

def test_iou_overlap():
    assert abs(iou([0,0,2,2], [1,1,3,3]) - 1/7) < 1e-9

def test_iou_no_overlap():
    assert iou([0,0,1,1], [2,2,3,3]) == 0.0

def test_nms_suppresses_duplicate():
    boxes = [[0,0,2,2], [0.1,0.1,2.1,2.1], [5,5,6,6]]
    scores = [0.9, 0.8, 0.7]
    assert nms(boxes, scores, 0.5) == [0, 2]`,
  expectedOutput: "0.143",
  runCommand: "python iou_nms.py && pytest test_iou_nms.py",
  commonBugs: ["union에서 intersection을 빼지 않음", "좌표가 닿기만 하는 box를 overlap으로 계산함", "NMS에서 score 정렬을 하지 않음"],
  extensionTask: "NMS threshold를 0.3, 0.5, 0.7로 바꾸며 duplicate detection 수를 비교하라.",
});

export const robotVisionSessions: Session[] = [
  session({
    id: "object_detection_iou_nms",
    part: "Part 5. 인식 AI와 로봇 비전",
    title: "Object Detection IoU and NMS",
    level: "intermediate",
    prerequisites: ["image_tensor_basics", "bounding_box"],
    learningObjectives: ["bounding box IoU를 계산한다.", "NMS가 duplicate detection을 제거하는 원리를 설명한다.", "로봇 action trigger에서 confidence/IoU threshold 영향을 해석한다."],
    theory: {
      definition: "Object detection은 이미지에서 객체 class와 bounding box를 함께 예측한다. IoU는 두 box 겹침 정도, NMS는 중복 box 제거 후처리다.",
      whyItMatters: "로봇이 물체를 집거나 피하려면 detection box가 중복되거나 틀렸을 때 어떤 action을 막아야 하는지 판단해야 한다.",
      intuition: "여러 사람이 같은 물체를 조금 다른 사각형으로 표시했을 때, 가장 믿을 만한 표시 하나만 남기는 과정이 NMS다.",
      equations: [
        makeEquation("IoU", "IoU(A,B)=\\frac{|A\\cap B|}{|A\\cup B|}", [["A,B", "bounding boxes"], ["A cap B", "겹친 면적"], ["A cup B", "합집합 면적"]], "0이면 안 겹치고 1이면 완전히 같다."),
        makeEquation("NMS rule", "suppress(B_j) \\text{ if } IoU(B_i,B_j)>t", [["B_i", "현재 최고 score box"], ["t", "NMS threshold"]], "높은 score box와 많이 겹치는 낮은 score box를 제거한다."),
      ],
      derivation: [
        step("intersection 좌표", "두 box의 left/top은 max, right/bottom은 min으로 구한다."),
        step("면적 clamp", "겹치지 않으면 width/height를 0으로 clamp한다."),
        step("union 계산", "areaA+areaB-intersection으로 중복 면적을 한 번만 센다."),
        step("greedy suppression", "score 내림차순으로 box를 고르고 threshold 넘는 box를 제거한다."),
      ],
      handCalculation: {
        problem: "A=[0,0,2,2], B=[1,1,3,3]의 IoU를 계산하라.",
        given: { A: "[0,0,2,2]", B: "[1,1,3,3]" },
        steps: ["intersection은 1x1=1", "각 box 면적은 4와 4", "union=4+4-1=7"],
        answer: "IoU=1/7=0.143",
      },
      robotApplication: "컨베이어 pick robot에서 NMS threshold가 너무 낮으면 실제 물체 하나가 사라지고, 너무 높으면 같은 물체를 두 번 집으려는 action이 생긴다.",
    },
    codeLabs: [detectionLab],
    visualizations: [
      makeVisualization("vis_iou_nms", "Object Detection IoU/NMS", "object_detection_iou_nms", "IoU=intersection/union", detectionLab.id, [
        { name: "iou_threshold", symbol: "t", min: 0.1, max: 0.9, default: 0.5, description: "NMS suppression threshold" },
        { name: "score_gap", symbol: "\\Delta s", min: 0, max: 1, default: 0.2, description: "중복 box score 차이" },
      ], "중복 box 하나만 남고 서로 다른 물체는 유지된다.", "threshold가 부적절하면 missed object 또는 duplicate action이 생긴다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "iou_nms",
      conceptTag: "object_detection_iou_nms",
      reviewSession: "Object Detection IoU/NMS",
      conceptQuestion: "NMS는 왜 필요한가?",
      conceptAnswer: "같은 객체에 대해 여러 bounding box가 나오는 중복 detection을 줄이기 위해 필요하다.",
      calculationQuestion: "intersection=2, union=8이면 IoU는?",
      calculationAnswer: "2/8=0.25이다.",
      codeQuestion: "IoU 계산에서 union은 어떤 식인가?",
      codeAnswer: "areaA + areaB - intersection이다.",
      debugQuestion: "NMS 결과가 낮은 score box를 먼저 남기면 어떤 버그인가?",
      debugAnswer: "score 내림차순 정렬을 하지 않은 버그다.",
      visualQuestion: "IoU threshold를 너무 낮게 두면 어떤 현상이 생기는가?",
      visualAnswer: "서로 다른 가까운 물체도 중복으로 오인되어 제거될 수 있다.",
      robotQuestion: "pick robot이 같은 물체를 두 번 집으려 한다면 detection 후처리에서 무엇을 확인하는가?",
      robotAnswer: "NMS threshold, tracking ID, action deduplication logic을 확인한다.",
      designQuestion: "detection-to-action pipeline에서 안전 gate는 어떻게 설계하는가?",
      designAnswer: "confidence, IoU/NMS, depth validity, workspace boundary, stale timestamp를 모두 통과해야 action을 보낸다.",
    }),
    wrongAnswerTags: makeWrongTags("object_detection_iou_nms", "객체탐지 IoU/NMS 후처리", ["Bounding Box", "Real-time Inference FPS"]),
    nextSessions: ["segmentation", "pose_estimation"],
  }),
];
