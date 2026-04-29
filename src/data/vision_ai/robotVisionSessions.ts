import type { Session } from "../../types";
import { makeAdvancedSession } from "../core/advancedSessionFactory";
import { ensureCodeLabShape, makeCoreQuizzes, makeEquation, makeVisualization, makeWrongTags, session, step } from "../core/v2SessionHelpers";

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

const yoloSsdDetectionLab = ensureCodeLabShape({
  id: "lab_yolo_ssd_head_decode",
  title: "YOLO/SSD Detection Head Decode",
  language: "python",
  theoryConnection: "bbox=(cell+sigmoid(tx))*stride, confidence=sigmoid(obj)*softmax(class)",
  starterCode: `import math

def sigmoid(x):
    # TODO: sigmoid를 구현하라.
    raise NotImplementedError

def softmax(logits):
    # TODO: 안정적인 softmax를 구현하라.
    raise NotImplementedError

def decode_yolo_cell(raw, anchor, cell, grid_size, image_size):
    # raw = [tx, ty, tw, th, obj_logit, class0_logit, class1_logit, ...]
    # TODO: center/width/height/confidence/class_id를 계산하라.
    raise NotImplementedError

if __name__ == "__main__":
    det = decode_yolo_cell([0, 0, 0, 0, 2.0, 0.2, 1.4], (64, 40), (3, 2), 8, 256)
    print(det["class_id"], round(det["confidence"], 3), [round(v, 1) for v in det["box"]])`,
  solutionCode: `import math

def sigmoid(x):
    return 1.0 / (1.0 + math.exp(-x))

def softmax(logits):
    m = max(logits)
    exps = [math.exp(v - m) for v in logits]
    s = sum(exps)
    return [v / s for v in exps]

def decode_yolo_cell(raw, anchor, cell, grid_size, image_size):
    tx, ty, tw, th, obj_logit, *class_logits = raw
    stride = image_size / grid_size
    cx = (cell[0] + sigmoid(tx)) * stride
    cy = (cell[1] + sigmoid(ty)) * stride
    w = anchor[0] * math.exp(tw)
    h = anchor[1] * math.exp(th)
    class_probs = softmax(class_logits)
    class_id = max(range(len(class_probs)), key=lambda i: class_probs[i])
    confidence = sigmoid(obj_logit) * class_probs[class_id]
    box = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2]
    return {"box": box, "confidence": confidence, "class_id": class_id, "center": (cx, cy)}

if __name__ == "__main__":
    det = decode_yolo_cell([0, 0, 0, 0, 2.0, 0.2, 1.4], (64, 40), (3, 2), 8, 256)
    print(det["class_id"], round(det["confidence"], 3), [round(v, 1) for v in det["box"]])`,
  testCode: `from yolo_ssd_head_decode import sigmoid, softmax, decode_yolo_cell

def test_sigmoid_center_offset():
    assert abs(sigmoid(0) - 0.5) < 1e-9

def test_softmax_sum():
    probs = softmax([0.2, 1.4])
    assert abs(sum(probs) - 1.0) < 1e-9
    assert probs[1] > probs[0]

def test_decode_yolo_cell():
    det = decode_yolo_cell([0, 0, 0, 0, 2.0, 0.2, 1.4], (64, 40), (3, 2), 8, 256)
    assert det["class_id"] == 1
    assert det["confidence"] > 0.65
    assert [round(v, 1) for v in det["box"]] == [80.0, 60.0, 144.0, 100.0]`,
  expectedOutput: "1 0.677 [80.0, 60.0, 144.0, 100.0]",
  runCommand: "python yolo_ssd_head_decode.py && pytest test_yolo_ssd_head_decode.py",
  commonBugs: [
    "cell offset에 sigmoid를 적용하지 않아 box center가 grid 밖으로 튐",
    "anchor width/height를 image pixel 단위와 feature stride 단위로 혼동함",
    "objectness와 class probability를 곱하지 않고 confidence를 과대평가함",
  ],
  extensionTask: "anchor 크기를 바꾸며 작은 물체 recall과 false positive가 어떻게 바뀌는지 기록하라.",
});

const visualTrackingLab = ensureCodeLabShape({
  id: "lab_visual_tracking_iou_assignment",
  title: "IoU-based Visual Tracking Assignment",
  language: "python",
  theoryConnection: "track_id continuity = argmax IoU(prev_box, detection_box) above gate",
  starterCode: `def iou(a, b):
    # box format: [x1, y1, x2, y2]
    # TODO: IoU를 계산하라.
    raise NotImplementedError

def assign_tracks(tracks, detections, iou_threshold=0.3):
    # tracks: [{"id": 7, "box": [...]}, ...]
    # detections: [[x1,y1,x2,y2], ...]
    # TODO: IoU가 가장 큰 detection에 track id를 이어 붙여라.
    raise NotImplementedError

if __name__ == "__main__":
    tracks = [{"id": 7, "box": [10, 10, 40, 40]}]
    detections = [[12, 11, 42, 41], [100, 100, 130, 130]]
    print(assign_tracks(tracks, detections))`,
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

def assign_tracks(tracks, detections, iou_threshold=0.3):
    assigned_detection_ids = set()
    matches = []
    lost = []
    next_id = max([track["id"] for track in tracks], default=0) + 1

    for track in tracks:
        best_index = None
        best_iou = 0.0
        for index, det in enumerate(detections):
            if index in assigned_detection_ids:
                continue
            score = iou(track["box"], det)
            if score > best_iou:
                best_iou = score
                best_index = index
        if best_index is not None and best_iou >= iou_threshold:
            assigned_detection_ids.add(best_index)
            matches.append({"id": track["id"], "box": detections[best_index], "iou": best_iou})
        else:
            lost.append(track["id"])

    for index, det in enumerate(detections):
        if index not in assigned_detection_ids:
            matches.append({"id": next_id, "box": det, "iou": 0.0})
            next_id += 1
    return {"tracks": matches, "lost": lost}

if __name__ == "__main__":
    tracks = [{"id": 7, "box": [10, 10, 40, 40]}]
    detections = [[12, 11, 42, 41], [100, 100, 130, 130]]
    print(assign_tracks(tracks, detections))`,
  testCode: `from visual_tracking_iou_assignment import iou, assign_tracks

def test_iou_continuity():
    assert iou([10,10,40,40], [12,11,42,41]) > 0.75

def test_track_id_continues_and_new_track_created():
    result = assign_tracks(
        [{"id": 7, "box": [10, 10, 40, 40]}],
        [[12, 11, 42, 41], [100, 100, 130, 130]],
        0.3,
    )
    ids = [track["id"] for track in result["tracks"]]
    assert ids == [7, 8]
    assert result["lost"] == []

def test_lost_track():
    result = assign_tracks([{"id": 3, "box": [0,0,10,10]}], [[50,50,60,60]], 0.3)
    assert result["lost"] == [3]`,
  expectedOutput: "{'tracks': [{'id': 7",
  runCommand: "python visual_tracking_iou_assignment.py && pytest test_visual_tracking_iou_assignment.py",
  commonBugs: [
    "프레임마다 detection index를 새 ID로 써서 같은 물체의 ID가 계속 바뀜",
    "IoU gate 없이 가장 가까운 box를 매칭해 occlusion 이후 잘못된 ID swap이 남",
    "lost track과 new track을 분리하지 않아 로봇 action deduplication이 깨짐",
  ],
  extensionTask: "constant-velocity predict box를 추가하고 detection이 한 프레임 누락될 때 ID가 유지되는지 확인하라.",
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
    nextSessions: ["object_detection_yolo_ssd_pipeline", "visual_tracking_iou_kalman", "segmentation", "pose_estimation"],
  }),
  makeAdvancedSession({
    id: "object_detection_yolo_ssd_pipeline",
    part: "Part 5. 인식 AI와 로봇 비전",
    title: "YOLO/SSD Object Detection 구조와 학습 파이프라인",
    level: "intermediate",
    difficulty: "medium",
    estimatedMinutes: 85,
    prerequisites: ["browser_onnx_tiny_cnn_feature_demo", "object_detection_iou_nms", "dataset_label_split_confusion_matrix_practice"],
    objectives: [
      "backbone feature map이 detection head의 grid/anchor 예측으로 이어지는 구조를 설명한다.",
      "YOLO의 cell offset decode와 SSD anchor matching 차이를 계산한다.",
      "label 품질, class imbalance, augmentation, NMS threshold가 detection 성능에 미치는 영향을 연결한다.",
      "학습 artifact를 ONNX/C++/ROS 2 inference node로 넘길 때 필요한 tensor 계약을 정리한다.",
    ],
    definition:
      "YOLO/SSD detection pipeline은 CNN backbone feature map 위에서 box offset, objectness, class logits를 예측하고, anchor/grid decode와 NMS를 거쳐 로봇이 사용할 객체 후보를 만든다.",
    whyItMatters:
      "IoU/NMS만 알면 후처리는 이해하지만 모델이 box를 어떻게 만들었는지 놓치기 쉽다. 로봇 시스템에서는 작은 물체 recall, label imbalance, latency가 action 성공률과 직결된다.",
    intuition:
      "이미지를 작은 격자로 나누고 각 격자 담당자가 자기 주변의 anchor box를 얼마나 움직이면 물체와 맞는지 제안하는 방식이다.",
    equations: [
      { label: "YOLO center decode", expression: "c_x=(g_x+\\sigma(t_x))s,\\quad c_y=(g_y+\\sigma(t_y))s", terms: [["g_x,g_y", "grid cell index"], ["s", "stride"], ["t_x,t_y", "head raw offset"]], explanation: "cell 내부 offset을 sigmoid로 제한해 image 좌표 center를 만든다." },
      { label: "Anchor scale", expression: "w=a_w e^{t_w},\\quad h=a_h e^{t_h}", terms: [["a_w,a_h", "anchor 크기"], ["t_w,t_h", "scale logit"]], explanation: "anchor box를 지수 scale로 늘리거나 줄인다." },
      { label: "Detection confidence", expression: "conf=\\sigma(o)\\max_k softmax(l)_k", terms: [["o", "objectness logit"], ["l_k", "class logit"]], explanation: "객체 존재 확률과 class 확률을 함께 본다." },
    ],
    derivation: [
      ["backbone", "CNN feature map이 edge/part 정보를 stride별 grid로 압축한다.", "F in R^{H/S x W/S x C}"],
      ["head", "각 grid/anchor마다 box offset, objectness, class logits를 예측한다.", "A*(4+1+K)"],
      ["decode", "raw logits를 image 좌표 box와 confidence로 변환한다.", "bbox=[x1,y1,x2,y2]"],
      ["postprocess", "confidence threshold와 NMS를 거쳐 로봇 action 후보를 하나로 정리한다.", "IoU<t"],
    ],
    handCalculation: {
      problem: "grid=(3,2), stride=32, tx=ty=0이면 center 좌표는?",
      given: { grid: "(3,2)", stride: 32, tx: 0, ty: 0 },
      steps: ["sigmoid(0)=0.5", "cx=(3+0.5)*32=112", "cy=(2+0.5)*32=80"],
      answer: "center=(112,80) pixel이다.",
    },
    robotApplication:
      "컨베이어 pick robot이나 모바일 장애물 회피에서 detection head decode, label imbalance, NMS threshold가 최종 grasp/cmd_vel trigger의 안정성을 좌우한다.",
    lab: yoloSsdDetectionLab,
    visualization: {
      id: "vis_yolo_ssd_detection_pipeline",
      title: "YOLO/SSD Head Decode and NMS Pipeline",
      equation: "bbox=decode(grid,anchor,head), conf=obj*class",
      parameters: [
        { name: "grid_size", symbol: "G", min: 4, max: 16, default: 8, description: "detection head grid 크기" },
        { name: "confidence_threshold", symbol: "tau", min: 0.1, max: 0.95, default: 0.5, description: "로봇 action 후보로 넘길 최소 confidence" },
        { name: "nms_threshold", symbol: "t", min: 0.1, max: 0.9, default: 0.5, description: "중복 box suppression IoU threshold" },
      ],
      normalCase: "backbone feature가 충분하고 label/class balance가 맞아 decode box와 NMS 결과가 안정적이다.",
      failureCase: "anchor/grid/label imbalance가 어긋나 작은 물체를 놓치거나 duplicate action 후보가 남는다.",
    },
    quiz: {
      id: "yolo_ssd_detection",
      conceptQuestion: "YOLO/SSD detection head는 CNN feature map 위에서 무엇을 예측하는가?",
      conceptAnswer: "각 grid/anchor에 대해 box offset, objectness, class logits를 예측한다.",
      calculationQuestion: "grid x=3, stride=32, tx=0이면 cx는?",
      calculationAnswer: "cx=(3+0.5)*32=112 pixel이다.",
      codeQuestion: "YOLO confidence를 objectness와 class 확률로 계산하는 식은?",
      codeAnswer: "confidence = sigmoid(obj_logit) * max(softmax(class_logits))",
      debugQuestion: "box center가 cell 밖으로 크게 튀면 어떤 decode 버그를 의심하는가?",
      debugAnswer: "tx, ty에 sigmoid를 적용하지 않았거나 stride/image 좌표계를 혼동했을 가능성이 크다.",
      visualQuestion: "NMS threshold가 너무 높으면 시각화에서 어떤 현상이 남는가?",
      visualAnswer: "같은 물체에 대한 duplicate box가 남아 로봇이 같은 대상에 두 번 action을 낼 수 있다.",
      robotQuestion: "작은 장애물을 자주 놓치면 detection pipeline에서 무엇을 점검하는가?",
      robotAnswer: "입력 해상도, feature stride, anchor 크기, class imbalance, augmentation, confidence threshold를 함께 점검한다.",
      designQuestion: "YOLO/SSD 학습부터 ROS 2 배포까지 release checklist는?",
      designAnswer: "dataset split/label 품질, train/val metric, NMS threshold, ONNX input/output 계약, C++ latency, ROS 2 timestamp/confidence gate를 포함한다.",
    },
    wrongTagLabel: "YOLO/SSD detection head decode와 학습 파이프라인 오류",
    nextSessions: ["visual_tracking_iou_kalman", "ros2_image_inference_latency_node"],
  }),
  makeAdvancedSession({
    id: "visual_tracking_iou_kalman",
    part: "Part 5. 인식 AI와 로봇 비전",
    title: "Visual Tracking: Detection ID 유지와 IoU/Kalman 매칭",
    level: "intermediate",
    difficulty: "medium",
    estimatedMinutes: 80,
    prerequisites: ["object_detection_yolo_ssd_pipeline", "object_detection_iou_nms"],
    objectives: [
      "detection 결과를 프레임 사이에서 track ID로 이어 붙이는 이유를 설명한다.",
      "IoU gate 기반 assignment로 ID continuity, lost track, new track을 구분한다.",
      "occlusion과 missed detection에서 constant-velocity/Kalman predict가 필요한 지점을 이해한다.",
      "로봇 action deduplication과 tracking ID 안정성의 연결을 설명한다.",
    ],
    definition:
      "Visual tracking은 매 프레임 새로 나온 detection box를 이전 track과 연결해 같은 물체에 같은 ID를 유지하는 후처리 단계다. IoU 매칭은 단순하고, Kalman predict는 누락/가림 상황을 버티게 해준다.",
    whyItMatters:
      "로봇은 한 프레임의 detection만 보고 행동하지 않는다. track ID가 흔들리면 같은 물체를 두 번 집거나, 장애물을 잃어버리거나, cmd_vel이 불안정하게 바뀐다.",
    intuition:
      "프레임마다 새 이름표를 붙이는 대신, 이전 위치와 가장 많이 겹치는 box에 같은 이름표를 계속 붙여 주는 과정이다.",
    equations: [
      { label: "IoU assignment", expression: "j^*=\\arg\\max_j IoU(B_i^{track},B_j^{det})", terms: [["B_i^{track}", "이전 track box"], ["B_j^{det}", "현재 detection box"]], explanation: "가장 많이 겹치는 detection을 같은 track으로 본다." },
      { label: "Gate", expression: "match\\;if\\;IoU(B_i,B_j)>\\tau", terms: [["tau", "매칭 임계값"]], explanation: "겹침이 너무 작으면 ID swap을 막기 위해 새 track/lost로 처리한다." },
      { label: "Constant velocity", expression: "\\hat{x}_{t}=x_{t-1}+v_{t-1}\\Delta t", terms: [["x", "box center"], ["v", "추정 속도"]], explanation: "detection이 잠깐 없을 때 예측 위치로 track을 유지한다." },
    ],
    derivation: [
      ["detect", "현재 프레임에서 후보 box와 confidence를 얻는다.", "D_t"],
      ["predict", "이전 track을 다음 프레임 위치로 예측한다.", "x_hat=x+vdt"],
      ["associate", "IoU/cost matrix로 detection과 track을 매칭한다.", "argmax IoU"],
      ["manage", "매칭되면 ID 유지, 안 되면 lost/new track으로 관리한다.", "max_lost"],
    ],
    handCalculation: {
      problem: "이전 box와 현재 detection의 IoU가 0.78이고 gate가 0.3이면 같은 track인가?",
      given: { iou: 0.78, gate: 0.3 },
      steps: ["0.78 > 0.3", "gate를 통과한다.", "이전 track ID를 유지한다."],
      answer: "같은 track으로 매칭하고 ID를 유지한다.",
    },
    robotApplication:
      "pick robot은 같은 track ID에 대해 grasp 명령을 한 번만 보내고, mobile robot은 장애물 track이 lost 되기 전까지 감속 상태를 유지한다.",
    lab: visualTrackingLab,
    visualization: {
      id: "vis_visual_tracking_iou_kalman",
      title: "Visual Tracking ID Continuity and Lost/New Track Gate",
      equation: "track_id = argmax IoU(prev_box, det_box)",
      parameters: [
        { name: "iou_gate", symbol: "tau", min: 0.1, max: 0.9, default: 0.3, description: "track-detection 매칭 IoU threshold" },
        { name: "max_lost_frames", symbol: "L", min: 0, max: 10, default: 3, description: "detection 누락을 허용할 frame 수" },
        { name: "frame_skip", symbol: "dt", min: 1, max: 5, default: 1, description: "예측 단계 time gap" },
      ],
      normalCase: "box가 충분히 겹치면 같은 ID가 유지되어 로봇 action deduplication이 안정적이다.",
      failureCase: "IoU gate가 없거나 너무 낮으면 occlusion 이후 ID swap이 생겨 같은 물체를 두 번 처리한다.",
    },
    quiz: {
      id: "visual_tracking_iou_kalman",
      conceptQuestion: "Visual tracking이 object detection 뒤에 필요한 이유는?",
      conceptAnswer: "프레임마다 나온 box를 같은 물체 ID로 이어 action 중복과 ID swap을 줄이기 위해서다.",
      calculationQuestion: "IoU 0.25, gate 0.3이면 match인가?",
      calculationAnswer: "0.25 < 0.3이므로 match하지 않고 lost/new 후보로 처리한다.",
      codeQuestion: "IoU 매칭에서 같은 track으로 유지할 detection을 고르는 핵심 연산은?",
      codeAnswer: "best_index = argmax IoU(track_box, detection_box)",
      debugQuestion: "프레임마다 ID가 바뀐다면 무엇을 확인하는가?",
      debugAnswer: "이전 track 저장, IoU gate, assignment 중복 방지, lost/new track 관리 로직을 확인한다.",
      visualQuestion: "iou_gate를 너무 높이면 시각화에서 어떤 문제가 보이는가?",
      visualAnswer: "작은 움직임이나 부분 가림에도 기존 ID가 lost 되고 새 ID가 생긴다.",
      robotQuestion: "tracking ID가 흔들리면 pick robot에서 어떤 실패가 생기는가?",
      robotAnswer: "같은 물체를 중복 grasp하거나 이미 처리한 물체에 다시 action을 보내는 실패가 생긴다.",
      designQuestion: "실제 visual tracker release gate에는 어떤 로그를 남기는가?",
      designAnswer: "track_id, detection confidence, IoU score, lost frame count, action deduplication 상태, timestamp latency를 남긴다.",
    },
    wrongTagLabel: "Visual tracking ID continuity와 IoU/Kalman gate 오류",
    nextSessions: ["camera_to_cmd_vel_inference_pipeline", "ros2_image_inference_latency_node"],
  }),
];
