import type { Session, VisualizationSpec } from "../../types";
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

export const aiDeploymentPipelineSessions: Session[] = [
  makeAdvancedSession({
    id: "pytorch_bc_onnx_export_contract",
    part: "Part 11. AI 배포 파이프라인",
    title: "PyTorch BC Policy를 ONNX로 Export하고 Parity 검증하기",
    level: "intermediate",
    difficulty: "medium",
    estimatedMinutes: 85,
    prerequisites: ["pytorch_bc_mlp", "dataset_label_split_confusion_matrix_practice"],
    objectives: [
      "학습한 PyTorch MLP policy를 torch.onnx.export로 ONNX 파일로 변환한다.",
      "input/output name, dynamic batch axis, dtype, normalization 계약을 명시한다.",
      "PyTorch 출력과 ONNX Runtime 출력의 max absolute error를 비교한다.",
    ],
    definition:
      "ONNX export contract는 학습 프레임워크의 nn.Module을 배포 런타임이 읽을 수 있는 graph로 고정하면서 입력 이름, shape, dtype, normalization, output 이름을 문서화하는 단계다.",
    whyItMatters:
      "행동 복제 policy를 학습만 하고 끝내면 실제 로봇 노드에 올릴 수 없다. export contract가 없으면 C++ inference에서 batch dimension, channel/order, dtype, action scale이 어긋나도 원인을 찾기 어렵다.",
    intuition:
      "학습된 PyTorch 모델은 연구 노트에 가깝고, ONNX는 공장 출하 도면에 가깝다. 도면에는 입구와 출구의 이름, 치수, 단위가 분명해야 한다.",
    equations: [
      {
        label: "ONNX parity error",
        expression: "e_{max}=\\max |\\pi_{torch}(o)-\\pi_{onnx}(o)|",
        terms: [["e_max", "PyTorch와 ONNX 출력 최대 차이"], ["o", "검증 observation batch"]],
        explanation: "같은 입력에서 export 전후 출력이 허용 오차 안에 있어야 한다.",
      },
      {
        label: "Shape contract",
        expression: "obs\\in\\mathbb{R}^{B\\times D_o},\\quad action\\in\\mathbb{R}^{B\\times D_a}",
        terms: [["B", "batch size"], ["D_o", "observation dimension"], ["D_a", "action dimension"]],
        explanation: "C++ buffer는 이 shape 계약을 그대로 사용한다.",
      },
      {
        label: "Action scale",
        expression: "a_{robot}=a_{net}\\sigma_a+\\mu_a",
        terms: [["a_net", "network output"], ["mu_a, sigma_a", "학습 데이터 action mean/std"]],
        explanation: "정규화된 action을 실제 로봇 명령 단위로 되돌리는 계약이다.",
      },
    ],
    derivation: [
      ["freeze", "policy.eval()과 torch.no_grad()로 inference graph를 고정한다.", "model.eval()"],
      ["dummy input", "C++에서 넣을 observation shape와 같은 dummy tensor를 만든다.", "dummy.shape=(1,D_o)"],
      ["export", "input_names, output_names, dynamic_axes, opset_version을 명시해 ONNX를 저장한다.", "torch.onnx.export(...)"],
      ["parity", "같은 obs batch를 PyTorch와 ONNX Runtime에 넣고 max error를 기록한다.", "e_max<epsilon"],
    ],
    handCalculation: {
      problem: "PyTorch action=[0.20, -0.10], ONNX action=[0.201, -0.099]이면 max absolute error는?",
      given: { torch: "[0.20,-0.10]", onnx: "[0.201,-0.099]" },
      steps: ["차이는 [0.001, 0.001]", "max absolute error = 0.001", "허용 오차 1e-3이면 경계값이다."],
      answer: "e_max=0.001이다.",
    },
    robotApplication:
      "BC policy를 ROS 2 controller/action node에 넣기 전 export parity를 통과시켜야 C++ 추론 결과가 학습 때 검증한 policy와 같은 의미를 가진다.",
    lab: {
      id: "lab_pytorch_bc_onnx_export_contract",
      title: "BC Policy ONNX Export and Parity Check",
      language: "python",
      theoryConnection: "e_max=max|torch(obs)-onnx(obs)|, obs=[B,D_o], action=[B,D_a]",
      starterCode: `import numpy as np
import torch
import torch.nn as nn

class MLPPolicy(nn.Module):
    def __init__(self, obs_dim=1, act_dim=1, hidden=16):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(obs_dim, hidden),
            nn.ReLU(),
            nn.Linear(hidden, act_dim),
        )

    def forward(self, obs):
        return self.net(obs)

def export_policy(policy, path="bc_policy.onnx"):
    # TODO: policy.eval(), dummy input, torch.onnx.export 계약을 작성하라.
    raise NotImplementedError

def parity_error(torch_out, onnx_out):
    # TODO: max absolute error를 반환하라.
    raise NotImplementedError

if __name__ == "__main__":
    policy = MLPPolicy()
    path = export_policy(policy)
    print("exported:", path, "input:", "obs", "output:", "action")`,
      solutionCode: `import numpy as np
import torch
import torch.nn as nn

class MLPPolicy(nn.Module):
    def __init__(self, obs_dim=1, act_dim=1, hidden=16):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(obs_dim, hidden),
            nn.ReLU(),
            nn.Linear(hidden, act_dim),
        )

    def forward(self, obs):
        return self.net(obs)

def export_policy(policy, path="bc_policy.onnx"):
    policy.eval()
    dummy_obs = torch.zeros(1, 1, dtype=torch.float32)
    torch.onnx.export(
        policy,
        dummy_obs,
        path,
        input_names=["obs"],
        output_names=["action"],
        dynamic_axes={"obs": {0: "batch"}, "action": {0: "batch"}},
        opset_version=17,
        do_constant_folding=True,
    )
    return path

def parity_error(torch_out, onnx_out):
    return float(np.max(np.abs(np.asarray(torch_out) - np.asarray(onnx_out))))

if __name__ == "__main__":
    policy = MLPPolicy()
    path = export_policy(policy)
    print("exported:", path, "input:", "obs", "output:", "action")`,
      testCode: `from pytorch_bc_onnx_export_contract import MLPPolicy, export_policy, parity_error
import numpy as np

def test_parity_error():
    assert parity_error([0.2, -0.1], [0.201, -0.099]) <= 0.0010000001

def test_policy_shape():
    policy = MLPPolicy(obs_dim=3, act_dim=2)
    assert policy.net[-1].out_features == 2

def test_export_returns_path(tmp_path):
    path = tmp_path / "policy.onnx"
    assert str(export_policy(MLPPolicy(), str(path))).endswith("policy.onnx")`,
      expectedOutput: "exported: bc_policy.onnx input: obs output: action",
      runCommand: "pip install torch onnx onnxruntime --quiet && python pytorch_bc_onnx_export_contract.py && pytest test_pytorch_bc_onnx_export_contract.py",
      commonBugs: [
        "dummy input shape를 학습 observation shape와 다르게 둠",
        "input/output name을 생략해 C++에서 이름 조회가 깨짐",
        "normalization/action scale 계약을 export 문서에 남기지 않음",
      ],
      extensionTask: "onnxruntime.InferenceSession으로 같은 obs 32개를 추론하고 PyTorch 출력과 e_max<1e-4인지 CSV로 기록하라.",
      colabLink: "https://colab.research.google.com/",
    },
    visualization: {
      id: "vis_pytorch_bc_onnx_export_parity",
      title: "PyTorch to ONNX Export Parity Gate",
      equation: "e_max=max|pi_torch(o)-pi_onnx(o)|",
      parameters: [
        param("parity_tolerance", "epsilon", 0.00001, 0.01, 0.001, "허용 export parity error"),
        param("batch_size", "B", 1, 128, 16, "검증 batch 크기"),
        param("opset_version", "opset", 11, 20, 17, "ONNX opset version"),
      ],
      normalCase: "exported ONNX graph의 input/output 계약이 고정되고 parity error가 tolerance 안에 있다.",
      failureCase: "shape/name/dtype 계약이 어긋나 C++ Runtime에서 입력 tensor 생성 또는 output 해석이 실패한다.",
    },
    quiz: {
      id: "bc_onnx_export",
      conceptQuestion: "PyTorch policy를 로봇에 올리기 전 ONNX export contract를 남겨야 하는 이유는?",
      conceptAnswer: "C++/ROS 2 추론에서 input/output name, shape, dtype, normalization, action scale을 동일하게 재현하기 위해서다.",
      calculationQuestion: "PyTorch와 ONNX 출력 차이가 [0.002, 0.0005, 0.001]이면 e_max는?",
      calculationAnswer: "max absolute error는 0.002다.",
      codeQuestion: "torch.onnx.export에서 입력 이름을 지정하는 인수는?",
      codeAnswer: "input_names=[\"obs\"]",
      debugQuestion: "ONNX Runtime에서 input name not found가 뜨면 무엇을 확인하는가?",
      debugAnswer: "export 시 input_names와 C++ session.GetInputNameAllocated로 읽은 실제 이름이 일치하는지 확인한다.",
      visualQuestion: "parity_tolerance를 너무 느슨하게 잡으면 어떤 위험이 있는가?",
      visualAnswer: "export 후 numerical drift나 전처리 오류가 있어도 통과해 실제 policy action이 학습 때와 달라질 수 있다.",
      robotQuestion: "action normalization 계약을 빠뜨리면 실제 로봇에서 어떤 증상이 생기는가?",
      robotAnswer: "정규화된 작은 값이나 과도한 스케일 값이 그대로 actuator command로 나가 움직임이 거의 없거나 과격해질 수 있다.",
      designQuestion: "ONNX export release gate에 넣을 항목 5가지는?",
      designAnswer: "input/output name, shape, dtype, normalization/action scale, parity error, opset/runtime version, artifact hash를 기록한다.",
    },
    wrongTagLabel: "PyTorch to ONNX export 계약 누락",
    nextSessions: ["onnxruntime_cpp_policy_inference"],
  }),
  makeAdvancedSession({
    id: "onnxruntime_cpp_policy_inference",
    part: "Part 11. AI 배포 파이프라인",
    title: "ONNX Runtime C++ Policy 추론과 Buffer 계약",
    level: "intermediate",
    difficulty: "hard",
    estimatedMinutes: 95,
    prerequisites: ["pytorch_bc_onnx_export_contract", "cpp_eigen_fk"],
    objectives: [
      "ONNX Runtime C++ Session을 만들고 input/output 이름을 조회한다.",
      "std::vector<float> buffer를 Ort::Value tensor로 감싸는 방법을 구현한다.",
      "전처리, inference, 후처리 latency를 분리해 측정한다.",
    ],
    definition:
      "ONNX Runtime C++ inference pipeline은 model artifact를 로드하고, CPU/GPU execution provider, input tensor memory, output buffer, latency trace를 명시적으로 관리하는 배포 코드다.",
    whyItMatters:
      "Python에서는 tensor shape 오류가 빨리 보이지만 C++에서는 잘못된 buffer stride나 dtype이 조용히 잘못된 action으로 이어질 수 있다. 따라서 buffer 계약과 latency 측정을 코드 수준에서 고정해야 한다.",
    intuition:
      "ONNX Runtime C++은 모델을 호출하는 엔진룸이다. 연료관에 해당하는 float buffer의 길이와 이름이 맞아야 엔진이 정상적으로 힘을 낸다.",
    equations: [
      {
        label: "Flat buffer length",
        expression: "N=B\\cdot D_o",
        terms: [["N", "input float 개수"], ["B", "batch"], ["D_o", "observation dimension"]],
        explanation: "C++ vector 길이는 tensor shape 원소의 곱과 같아야 한다.",
      },
      {
        label: "Latency budget",
        expression: "T_{total}=T_{pre}+T_{ort}+T_{post}",
        terms: [["T_pre", "전처리 시간"], ["T_ort", "Runtime inference"], ["T_post", "후처리 시간"]],
        explanation: "제어/인식 deadline은 전체 pipeline latency로 판단한다.",
      },
      {
        label: "Deadline gate",
        expression: "T_{total}<T_{deadline}",
        terms: [["T_deadline", "ROS 2 node가 허용하는 최대 처리 시간"]],
        explanation: "deadline 초과 시 stale output을 publish하지 않아야 한다.",
      },
    ],
    derivation: [
      ["session", "Ort::Env, Ort::SessionOptions, Ort::Session을 생성한다.", "Ort::Session session(env,path,opts)"],
      ["names", "GetInputNameAllocated/GetOutputNameAllocated로 실제 graph 이름을 읽는다.", "name=session.GetInputNameAllocated(...)"],
      ["tensor", "std::vector<float>와 shape array로 Ort::Value tensor를 만든다.", "CreateTensor<float>(...)"],
      ["timing", "steady_clock으로 pre/runtime/post latency를 분리 기록한다.", "T_total=T_pre+T_ort+T_post"],
    ],
    handCalculation: {
      problem: "batch=4, obs_dim=6이면 float input buffer 길이는?",
      given: { batch: 4, obs_dim: 6 },
      steps: ["N=B*D_o", "N=4*6=24", "float32이면 24*4=96 bytes"],
      answer: "24 floats, 96 bytes다.",
    },
    robotApplication:
      "로봇팔 policy, 모바일 로봇 steering policy, 비전 classifier 모두 ROS 2 node 안에서는 이 C++ Runtime buffer 계약과 latency gate를 거쳐 publish된다.",
    lab: {
      id: "lab_onnxruntime_cpp_policy_inference",
      title: "ONNX Runtime C++ Policy Inference Skeleton",
      language: "cpp",
      theoryConnection: "Ort tensor buffer length = product(shape), Ttotal=Tpre+Tort+Tpost",
      starterCode: `#include <array>
#include <iostream>
#include <numeric>
#include <string>
#include <vector>

struct PolicyIOContract {
  std::string input_name;
  std::string output_name;
  std::array<int64_t, 2> input_shape;
};

int64_t numel(const std::array<int64_t, 2>& shape) {
  // TODO: shape 원소 곱을 반환하라.
  return 0;
}

PolicyIOContract make_contract() {
  // TODO: ONNX export와 같은 obs/action 계약을 반환하라.
  return {};
}

int main() {
  const auto contract = make_contract();
  std::cout << contract.input_name << " -> " << contract.output_name
            << " numel=" << numel(contract.input_shape) << "\\n";
}`,
      solutionCode: `#include <array>
#include <chrono>
#include <iostream>
#include <numeric>
#include <string>
#include <vector>

struct PolicyIOContract {
  std::string input_name;
  std::string output_name;
  std::array<int64_t, 2> input_shape;
};

int64_t numel(const std::array<int64_t, 2>& shape) {
  return std::accumulate(shape.begin(), shape.end(), int64_t{1}, std::multiplies<int64_t>());
}

PolicyIOContract make_contract() {
  return {"obs", "action", {1, 1}};
}

// Real deployment step:
// Ort::Env env(ORT_LOGGING_LEVEL_WARNING, "bc_policy");
// Ort::SessionOptions opts;
// Ort::Session session(env, "bc_policy.onnx", opts);
// Ort::MemoryInfo mem = Ort::MemoryInfo::CreateCpu(OrtArenaAllocator, OrtMemTypeDefault);
// std::vector<float> obs(numel(contract.input_shape), 0.0f);
// auto tensor = Ort::Value::CreateTensor<float>(mem, obs.data(), obs.size(), contract.input_shape.data(), contract.input_shape.size());
// auto outputs = session.Run(Ort::RunOptions{nullptr}, input_names, &tensor, 1, output_names, 1);

int main() {
  const auto contract = make_contract();
  const auto t0 = std::chrono::steady_clock::now();
  const auto n = numel(contract.input_shape);
  const auto t1 = std::chrono::steady_clock::now();
  const double latency_ms = std::chrono::duration<double, std::milli>(t1 - t0).count();
  std::cout << contract.input_name << " -> " << contract.output_name
            << " numel=" << n << " latency_ms=" << latency_ms << "\\n";
}`,
      testCode: `# build smoke test
g++ -std=c++17 onnxruntime_cpp_policy_inference.cpp -O2 -o onnx_contract
./onnx_contract | grep "obs -> action numel=1"`,
      expectedOutput: "obs -> action numel=1",
      runCommand: "g++ -std=c++17 onnxruntime_cpp_policy_inference.cpp -O2 -o onnx_contract && ./onnx_contract",
      commonBugs: [
        "shape product보다 작은 std::vector를 tensor로 감싸 memory overrun을 만듦",
        "input/output name을 하드코딩하고 실제 ONNX graph 이름 변경을 놓침",
        "preprocess와 postprocess 시간을 빼고 Runtime latency만 보고 deadline을 통과시킴",
      ],
      extensionTask: "실제 Ort::Session.Run을 연결하고 1000회 warmup/benchmark에서 p50/p95/p99 latency를 CSV로 기록하라.",
    },
    visualization: {
      id: "vis_onnxruntime_cpp_policy_latency_contract",
      title: "ONNX Runtime C++ Buffer and Latency Contract",
      equation: "Ttotal=Tpre+Tort+Tpost",
      parameters: [
        param("obs_dim", "D_o", 1, 128, 12, "observation dimension"),
        param("batch_size", "B", 1, 64, 1, "inference batch size"),
        param("deadline_ms", "T_d", 1, 100, 20, "publish deadline budget"),
      ],
      normalCase: "buffer length가 shape 계약과 일치하고 p99 total latency가 deadline 안에 있다.",
      failureCase: "Runtime만 빠르고 preprocess/postprocess가 느려 ROS 2 publish 시점에는 stale action이 된다.",
    },
    quiz: {
      id: "ort_cpp_policy",
      conceptQuestion: "ONNX Runtime C++에서 input tensor를 만들기 전 반드시 확인할 계약은?",
      conceptAnswer: "input name, shape, dtype, buffer length, normalization 순서가 export contract와 같은지 확인해야 한다.",
      calculationQuestion: "obs_dim=12, batch=8이면 float buffer 길이와 byte 수는?",
      calculationAnswer: "길이는 96 floats이고 float32 기준 384 bytes다.",
      codeQuestion: "C++에서 shape 원소 곱을 구할 때 쓸 수 있는 표준 함수는?",
      codeAnswer: "std::accumulate(shape.begin(), shape.end(), int64_t{1}, std::multiplies<int64_t>())",
      debugQuestion: "C++ 추론은 성공하지만 action이 이상하면 무엇을 먼저 비교하는가?",
      debugAnswer: "동일 obs의 PyTorch/ONNX/C++ output parity와 normalization/action scale 적용 여부를 비교한다.",
      visualQuestion: "deadline_ms를 20ms로 줄였을 때 Tpre+Tort+Tpost가 24ms라면 어떻게 처리하는가?",
      visualAnswer: "deadline 초과이므로 publish를 막고 stale output/fallback 경로로 보내야 한다.",
      robotQuestion: "로봇 제어 루프에서 p99 latency를 보는 이유는?",
      robotAnswer: "평균이 좋아도 꼬리 지연이 주기적으로 deadline miss를 만들어 불안정한 명령을 낼 수 있기 때문이다.",
      designQuestion: "C++ inference node의 benchmark 리포트에 들어갈 항목은?",
      designAnswer: "model hash, provider, input shape, p50/p95/p99 latency, preprocess/postprocess 시간, parity error, fallback 조건을 포함한다.",
    },
    wrongTagLabel: "ONNX Runtime C++ buffer/latency 계약 오류",
    nextSessions: ["ros2_image_inference_latency_node"],
  }),
  makeAdvancedSession({
    id: "ros2_image_inference_latency_node",
    part: "Part 11. AI 배포 파이프라인",
    title: "ROS 2 image_subscriber에 C++ 추론과 Latency Gate 연결하기",
    level: "advanced",
    difficulty: "hard",
    estimatedMinutes: 105,
    prerequisites: ["onnxruntime_cpp_policy_inference", "ros2_pub_sub", "ros2_qos"],
    objectives: [
      "sensor_msgs/Image subscriber callback에서 header timestamp와 processing timestamp를 분리한다.",
      "cv_bridge 전처리, ONNX Runtime 추론, postprocess, publish 단계를 한 node로 연결한다.",
      "deadline 초과나 낮은 confidence에서는 stale result를 publish하지 않고 fallback을 선택한다.",
    ],
    definition:
      "ROS 2 image inference node는 camera topic을 받아 전처리, C++ inference, 후처리, result publish, latency logging, fallback gate를 한 callback 또는 pipeline으로 묶은 배포 노드다.",
    whyItMatters:
      "모델을 export하고 C++에서 추론해도 ROS 2 topic 시간, QoS, frame_id, callback latency가 맞지 않으면 로봇은 오래된 이미지에 대한 명령을 실행한다.",
    intuition:
      "카메라 이미지는 신선도가 있는 센서 데이터다. 좋은 추론도 늦게 도착하면 상한 음식처럼 버려야 한다.",
    equations: [
      {
        label: "Sensor age",
        expression: "T_{age}=t_{now}-t_{header}",
        terms: [["t_now", "callback 처리 시각"], ["t_header", "image header timestamp"]],
        explanation: "이미지가 이미 오래되었으면 추론 결과도 stale하다.",
      },
      {
        label: "Pipeline latency",
        expression: "T_{pipe}=T_{decode}+T_{pre}+T_{ort}+T_{post}+T_{pub}",
        terms: [["T_decode", "cv_bridge/encoding 처리"], ["T_pub", "result publish 시간"]],
        explanation: "ROS 2 node에서는 모델 추론 외의 시간이 deadline을 지배할 수 있다.",
      },
      {
        label: "Publish gate",
        expression: "publish = (T_{age}<T_{max})\\land(conf>\\tau)",
        terms: [["T_max", "허용 sensor age"], ["tau", "confidence threshold"]],
        explanation: "오래되었거나 불확실한 결과는 publish하지 않는다.",
      },
    ],
    derivation: [
      ["subscribe", "rclcpp::SensorDataQoS로 image topic을 구독하고 header timestamp를 읽는다.", "create_subscription<Image>(...)"],
      ["preprocess", "cv_bridge로 encoding을 맞추고 ONNX input layout으로 변환한다.", "HWC->CHW"],
      ["infer", "C++ ONNX Runtime wrapper를 호출하고 action/class/confidence를 얻는다.", "session.Run(...)"],
      ["gate", "sensor age, total latency, confidence를 검사한 뒤 publish 또는 fallback을 선택한다.", "publish if gate"],
    ],
    handCalculation: {
      problem: "sensor age 18ms, preprocess 4ms, runtime 9ms, postprocess 3ms이면 total freshness는?",
      given: { age_ms: 18, pre_ms: 4, runtime_ms: 9, post_ms: 3 },
      steps: ["callback 이후 pipeline latency=4+9+3=16ms", "이미지 기준 총 지연=18+16=34ms", "deadline 33ms이면 1ms 초과"],
      answer: "총 34ms로 33ms deadline을 넘는다.",
    },
    robotApplication:
      "카메라 기반 장애물 인식, lane steering, pick target detector는 모두 ROS 2 image topic의 timestamp와 추론 latency gate를 통과해야 actuator command로 연결할 수 있다.",
    lab: {
      id: "lab_ros2_image_inference_latency_node",
      title: "ROS 2 Image Subscriber Inference Node Skeleton",
      language: "cpp",
      theoryConnection: "publish=(sensor_age<Tmax) && (confidence>tau), Tpipe=Tdecode+Tpre+Tort+Tpost+Tpub",
      starterCode: `#include <chrono>
#include <iostream>

struct InferenceGate {
  double max_age_ms;
  double min_confidence;
};

bool should_publish(double sensor_age_ms, double confidence, const InferenceGate& gate) {
  // TODO: stale image와 낮은 confidence를 막아라.
  return true;
}

int main() {
  InferenceGate gate{33.0, 0.7};
  std::cout << "publish=" << should_publish(24.0, 0.82, gate) << "\\n";
}`,
      solutionCode: `#include <chrono>
#include <iostream>

struct InferenceGate {
  double max_age_ms;
  double min_confidence;
};

bool should_publish(double sensor_age_ms, double confidence, const InferenceGate& gate) {
  return sensor_age_ms < gate.max_age_ms && confidence >= gate.min_confidence;
}

// Real ROS 2 node sketch:
// class ImageInferenceNode : public rclcpp::Node {
//  public:
//   ImageInferenceNode() : Node("image_inference_node") {
//     sub_ = create_subscription<sensor_msgs::msg::Image>(
//       "/camera/image_raw", rclcpp::SensorDataQoS(),
//       std::bind(&ImageInferenceNode::on_image, this, std::placeholders::_1));
//   }
//  private:
//   void on_image(sensor_msgs::msg::Image::ConstSharedPtr msg) {
//     const auto start = steady_clock_.now();
//     const double sensor_age_ms = (now() - msg->header.stamp).seconds() * 1000.0;
//     // cv_bridge decode -> preprocess -> Ort::Session.Run -> postprocess
//     // if (should_publish(sensor_age_ms + pipeline_ms, confidence, gate_)) publisher_->publish(result);
//     // else publish fallback/diagnostic only.
//   }
// };

int main() {
  InferenceGate gate{33.0, 0.7};
  std::cout << "publish=" << should_publish(24.0, 0.82, gate) << "\\n";
}`,
      testCode: `# build smoke test
g++ -std=c++17 ros2_image_inference_latency_node.cpp -O2 -o ros2_gate
./ros2_gate | grep "publish=1"`,
      expectedOutput: "publish=1",
      runCommand: "g++ -std=c++17 ros2_image_inference_latency_node.cpp -O2 -o ros2_gate && ./ros2_gate",
      commonBugs: [
        "msg->header.stamp 대신 callback 시작 시간만 보고 sensor age를 과소평가함",
        "best_effort camera publisher에 reliable subscriber를 붙여 message가 안 들어오는 QoS mismatch를 만듦",
        "confidence가 낮거나 deadline을 넘은 output도 그대로 actuator topic에 publish함",
      ],
      extensionTask: "rosbag2 replay에서 /camera/image_raw 입력을 받아 p50/p95/p99 sensor_age_ms와 pipeline_ms를 CSV로 저장하라.",
    },
    visualization: {
      id: "vis_ros2_image_inference_latency_gate",
      title: "ROS 2 Image Inference Latency and Publish Gate",
      equation: "publish=(Tage<Tmax) and (conf>tau)",
      parameters: [
        param("sensor_age_ms", "T_age", 0, 120, 18, "image header 기준 sensor age"),
        param("pipeline_latency_ms", "T_pipe", 0, 80, 16, "decode/pre/infer/post/publish latency"),
        param("confidence_threshold", "tau", 0, 1, 0.7, "result publish confidence threshold"),
      ],
      normalCase: "sensor age와 pipeline latency 합이 deadline 안이고 confidence가 threshold 이상일 때만 publish한다.",
      failureCase: "stale image 또는 low confidence 결과가 actuator command로 넘어가 안전 gate가 뚫린다.",
    },
    quiz: {
      id: "ros2_image_infer",
      conceptQuestion: "ROS 2 image inference node에서 header timestamp와 processing timestamp를 구분해야 하는 이유는?",
      conceptAnswer: "이미지가 촬영된 시각과 처리된 시각이 달라 sensor age를 계산해야 stale result publish를 막을 수 있기 때문이다.",
      calculationQuestion: "sensor age 20ms, pipeline 17ms이면 이미지 기준 총 지연은?",
      calculationAnswer: "20+17=37ms다.",
      codeQuestion: "ROS 2 C++에서 sensor data에 흔히 쓰는 QoS helper는?",
      codeAnswer: "rclcpp::SensorDataQoS()",
      debugQuestion: "image callback이 호출되지 않을 때 먼저 확인할 것은?",
      debugAnswer: "topic name/type, publisher 존재 여부, QoS reliability/durability compatibility, namespace를 확인한다.",
      visualQuestion: "sensor_age_ms와 pipeline_latency_ms 합이 deadline을 넘으면 publish gate는 어떻게 되어야 하는가?",
      visualAnswer: "stale result로 간주해 publish하지 않고 fallback/diagnostic만 내야 한다.",
      robotQuestion: "confidence 낮은 detection을 로봇 action으로 바로 연결하면 위험한 이유는?",
      robotAnswer: "잘못된 object나 빈 공간을 목표로 잡아 충돌, grasp 실패, 불필요한 정지로 이어질 수 있기 때문이다.",
      designQuestion: "ROS 2 AI 배포 노드의 launch/config에 넣을 파라미터는?",
      designAnswer: "model_path, input_topic, output_topic, confidence_threshold, max_age_ms, provider, queue depth, fallback mode, latency log path를 포함한다.",
    },
    wrongTagLabel: "ROS 2 image inference timestamp/latency gate 누락",
    nextSessions: ["camera_to_cmd_vel_inference_pipeline", "system_parameter_selection_report", "final-loop--python-cpp-ros-loop"],
  }),
  makeAdvancedSession({
    id: "camera_to_cmd_vel_inference_pipeline",
    part: "Part 11. AI 배포 파이프라인",
    title: "Camera Topic → Inference → cmd_vel End-to-End 연결",
    level: "advanced",
    difficulty: "hard",
    estimatedMinutes: 95,
    prerequisites: ["ros2_image_inference_latency_node", "object_detection_yolo_ssd_pipeline", "ros2_subscriber_pub_loop"],
    objectives: [
      "camera image topic을 받아 전처리, C++ inference, postprocess, safety gate, cmd_vel publish 순서로 연결한다.",
      "detection confidence, sensor age, steering offset을 이용해 Twist 명령을 계산한다.",
      "낮은 confidence, 오래된 frame, action limit 초과 시 cmd_vel을 stop/fallback으로 막는다.",
      "Part 5 비전 모델과 Part 11 ROS 2 배포가 실제 로봇 명령으로 이어지는 계약을 정리한다.",
    ],
    definition:
      "camera-to-cmd_vel pipeline은 ROS 2 camera topic에서 들어온 이미지 추론 결과를 geometry_msgs/Twist 명령으로 바꾸기 전, timestamp와 confidence, command limit을 검사하는 end-to-end 배포 흐름이다.",
    whyItMatters:
      "카메라 추론 노드가 결과를 publish하는 것만으로는 로봇이 움직이지 않는다. 초보자는 image → inference → decision → cmd_vel 사이의 gate와 fallback을 한 화면에서 확인해야 실제 시스템 연결을 이해할 수 있다.",
    intuition:
      "카메라가 본 lane/object의 중심이 화면 중앙에서 얼마나 벗어났는지 보고 조향하되, 결과가 낡았거나 자신 없으면 움직이지 않는 안전한 배관이다.",
    equations: [
      {
        label: "Normalized image offset",
        expression: "e_x=\\frac{c_x-W/2}{W/2}",
        terms: [["c_x", "detection 중심 x pixel"], ["W", "image width"]],
        explanation: "화면 중심 대비 좌우 오차를 -1에서 1 근처 값으로 정규화한다.",
      },
      {
        label: "Steering command",
        expression: "\\omega_z=-k_e e_x",
        terms: [["k_e", "조향 gain"], ["omega_z", "cmd_vel angular.z"]],
        explanation: "object/lane 중심이 오른쪽이면 왼쪽으로 돌도록 부호를 둔다.",
      },
      {
        label: "Publish gate",
        expression: "publish=(T_{age}<T_{max})\\land(conf>\\tau)\\land(|\\omega_z|<\\omega_{max})",
        terms: [["T_age", "image 기준 지연"], ["tau", "confidence threshold"], ["omega_max", "각속도 limit"]],
        explanation: "stale/low-confidence/limit 초과 명령은 publish하지 않는다.",
      },
    ],
    derivation: [
      ["subscribe", "camera topic과 inference result를 같은 timestamp 기준으로 묶는다.", "/camera/image_raw"],
      ["infer", "ONNX Runtime C++ 결과에서 class, confidence, bbox center를 읽는다.", "Detection{cx,conf}"],
      ["decide", "bbox center offset으로 angular.z를 계산하고 linear.x를 confidence gate로 켠다.", "Twist"],
      ["publish", "age/confidence/limit을 통과할 때만 /cmd_vel에 publish하고 실패 시 zero Twist를 낸다.", "safe stop"],
    ],
    handCalculation: {
      problem: "image width 640, detection center x=400이면 normalized offset과 angular.z는? k=1.2",
      given: { width: 640, center_x: 400, gain: 1.2 },
      steps: ["e_x=(400-320)/320=0.25", "omega_z=-1.2*0.25=-0.3", "confidence와 age gate를 통과하면 publish한다."],
      answer: "e_x=0.25, angular.z=-0.3 rad/s이다.",
    },
    robotApplication:
      "lane follower, 사람 추종, 장애물 회피 데모에서 detector/tracker의 중심 위치와 confidence를 안전 gate에 통과시킨 뒤 cmd_vel을 발행한다.",
    lab: {
      id: "lab_camera_to_cmd_vel_gate",
      title: "Camera Detection to cmd_vel Gate",
      language: "cpp",
      theoryConnection: "ex=(cx-W/2)/(W/2), angular_z=-k*ex, publish if age/conf/limit gate pass",
      starterCode: `#include <cmath>
#include <iostream>

struct Detection {
  bool valid;
  double confidence;
  double center_x;
  double image_width;
  double age_ms;
};

struct Twist {
  double linear_x;
  double angular_z;
};

Twist command_from_detection(const Detection& det, double min_confidence, double max_age_ms, double gain, double max_angular) {
  // TODO: stale/low confidence/invalid detection이면 zero Twist를 반환하라.
  // TODO: image center offset에서 angular_z를 계산하고 max_angular로 clamp하라.
  return {0.0, 0.0};
}

int main() {
  Detection det{true, 0.86, 400.0, 640.0, 24.0};
  const auto cmd = command_from_detection(det, 0.7, 33.0, 1.2, 0.8);
  std::cout << "cmd_vel linear_x=" << cmd.linear_x << " angular_z=" << cmd.angular_z << "\\n";
}`,
      solutionCode: `#include <algorithm>
#include <cmath>
#include <iostream>

struct Detection {
  bool valid;
  double confidence;
  double center_x;
  double image_width;
  double age_ms;
};

struct Twist {
  double linear_x;
  double angular_z;
};

Twist command_from_detection(const Detection& det, double min_confidence, double max_age_ms, double gain, double max_angular) {
  if (!det.valid || det.confidence < min_confidence || det.age_ms > max_age_ms || det.image_width <= 0.0) {
    return {0.0, 0.0};
  }
  const double half_width = det.image_width * 0.5;
  const double normalized_offset = (det.center_x - half_width) / half_width;
  const double raw_angular = -gain * normalized_offset;
  const double angular = std::clamp(raw_angular, -max_angular, max_angular);
  return {0.2, angular};
}

// Real ROS 2 node sketch:
// /camera/image_raw -> cv_bridge preprocess -> ONNX Runtime inference
// -> detection center/confidence -> command_from_detection
// -> publisher<geometry_msgs::msg::Twist>("/cmd_vel")

int main() {
  Detection det{true, 0.86, 400.0, 640.0, 24.0};
  const auto cmd = command_from_detection(det, 0.7, 33.0, 1.2, 0.8);
  std::cout << "cmd_vel linear_x=" << cmd.linear_x << " angular_z=" << cmd.angular_z << "\\n";
}`,
      testCode: `# build smoke test
g++ -std=c++17 camera_to_cmd_vel_gate.cpp -O2 -o camera_cmd_vel
./camera_cmd_vel | grep "cmd_vel linear_x=0.2 angular_z=-0.3"`,
      expectedOutput: "cmd_vel linear_x=0.2 angular_z=-0.3",
      runCommand: "g++ -std=c++17 camera_to_cmd_vel_gate.cpp -O2 -o camera_cmd_vel && ./camera_cmd_vel",
      commonBugs: [
        "detection confidence가 낮아도 cmd_vel을 그대로 publish함",
        "image width 기준 정규화를 빼먹어 angular.z가 pixel 단위로 폭발함",
        "camera timestamp age를 보지 않아 오래된 detection으로 로봇을 움직임",
      ],
      extensionTask: "tracking ID별로 last_cmd timestamp를 기록해 같은 object에 대한 중복 action을 막아라.",
    },
    visualization: {
      id: "vis_camera_to_cmd_vel_pipeline",
      title: "Camera Inference to cmd_vel Safety Gate",
      equation: "cmd_vel = gate(age, conf, limit) * policy(cx)",
      parameters: [
        { name: "center_offset", symbol: "e_x", min: -1, max: 1, default: 0.25, description: "화면 중심 대비 detection center offset" },
        { name: "confidence_threshold", symbol: "tau", min: 0.1, max: 0.95, default: 0.7, description: "cmd_vel publish 최소 confidence" },
        { name: "max_age_ms", symbol: "Tmax", min: 10, max: 120, default: 33, description: "허용 camera frame age" },
      ],
      normalCase: "신선한 frame과 높은 confidence에서만 제한된 cmd_vel이 publish된다.",
      failureCase: "stale frame, 낮은 confidence, angular limit 초과 명령은 zero Twist/fallback으로 막는다.",
    },
    quiz: {
      id: "camera_to_cmd_vel",
      conceptQuestion: "camera inference 결과를 cmd_vel로 바로 바꾸기 전 gate가 필요한 이유는?",
      conceptAnswer: "stale frame, 낮은 confidence, command limit 초과가 실제 로봇 움직임으로 이어지는 것을 막기 위해서다.",
      calculationQuestion: "W=640, cx=400이면 normalized offset은?",
      calculationAnswer: "(400-320)/320=0.25이다.",
      codeQuestion: "중앙 offset에서 angular.z를 계산하는 식은?",
      codeAnswer: "angular_z = -gain * normalized_offset",
      debugQuestion: "angular.z가 너무 커지면 어떤 버그를 의심하는가?",
      debugAnswer: "pixel offset을 image half width로 정규화하지 않았거나 clamp를 빠뜨린 버그를 확인한다.",
      visualQuestion: "confidence_threshold를 높이면 publish gate는 어떻게 변하는가?",
      visualAnswer: "낮은 confidence detection이 더 많이 차단되어 zero Twist/fallback 상태가 늘어난다.",
      robotQuestion: "오래된 camera frame으로 cmd_vel을 내면 어떤 위험이 있는가?",
      robotAnswer: "이미 지나간 장애물/차선을 기준으로 움직여 충돌이나 불필요한 조향이 생길 수 있다.",
      designQuestion: "camera-to-cmd_vel launch/config에 넣을 파라미터는?",
      designAnswer: "input_topic, model_path, confidence_threshold, max_age_ms, steering_gain, max_angular, linear_speed, fallback_mode, diagnostics_topic을 포함한다.",
    },
    wrongTagLabel: "camera inference to cmd_vel gate 누락",
    nextSessions: ["system_parameter_selection_report", "final-loop--python-cpp-ros-loop"],
  }),
];
