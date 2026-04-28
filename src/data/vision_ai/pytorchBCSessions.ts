// ============================================================
// pytorchBCSessions.ts
// PyTorch MLP Behavior Cloning — Part 7. Physical AI
// ============================================================
import type { Session } from "../../types";
import {
  ensureCodeLabShape,
  makeCoreQuizzes,
  makeEquation,
  makeVisualization,
  makeWrongTags,
  session,
  step,
} from "../core/v2SessionHelpers";

// ──────────────────────────────────────────────
// [코드랩] PyTorch 2-layer MLP Policy 학습
// ──────────────────────────────────────────────
const pytorchMLPLab = ensureCodeLabShape({
  id: "lab_pytorch_bc_mlp",
  title: "PyTorch MLP Behavior Cloning",
  language: "python",
  theoryConnection: "L = mean||pi_theta(o) - a||^2,  backward → optimizer.step()",
  starterCode: `import torch
import torch.nn as nn
import numpy as np
import matplotlib.pyplot as plt

# ──── 모델 정의 ────
class MLPPolicy(nn.Module):
    def __init__(self, obs_dim, act_dim, hidden=64):
        super().__init__()
        # TODO: self.net = nn.Sequential(
        #     nn.Linear(obs_dim, hidden), nn.ReLU(),
        #     nn.Linear(hidden, hidden),  nn.ReLU(),
        #     nn.Linear(hidden, act_dim),
        # )
        raise NotImplementedError

    def forward(self, x):
        # TODO: return self.net(x)
        raise NotImplementedError

# ──── 데이터 생성 (expert policy: a = sin(o) + noise) ────
def make_demo_dataset(n=1000):
    obs = np.linspace(-np.pi, np.pi, n).reshape(-1, 1).astype(np.float32)
    act = (np.sin(obs) + 0.05 * np.random.randn(n, 1)).astype(np.float32)
    return obs, act

# ──── 학습 루프 ────
def train_policy(policy, obs, act, epochs=200, lr=1e-3, batch_size=64):
    # TODO: optimizer = torch.optim.Adam(policy.parameters(), lr=lr)
    # TODO: loss_fn   = nn.MSELoss()
    # TODO: history   = []
    # TODO: for epoch in range(epochs):
    #     idx  = np.random.choice(len(obs), batch_size, replace=False)
    #     o_b  = torch.tensor(obs[idx])
    #     a_b  = torch.tensor(act[idx])
    #     pred = policy(o_b)
    #     loss = loss_fn(pred, a_b)
    #     optimizer.zero_grad()   # ← 반드시 backward() 전에 호출
    #     loss.backward()
    #     optimizer.step()
    #     history.append(loss.item())
    # TODO: return history
    raise NotImplementedError

if __name__ == "__main__":
    np.random.seed(42)
    torch.manual_seed(42)
    obs, act = make_demo_dataset(1000)
    policy = MLPPolicy(obs_dim=1, act_dim=1)
    losses = train_policy(policy, obs, act, epochs=300)
    test_o = torch.tensor([[0.0]])
    pred = policy(test_o).item()
    print(f"o=0.0 예측 action: {pred:.4f}  (정답 sin(0)=0.0)")`,
  solutionCode: `import torch
import torch.nn as nn
import numpy as np
import matplotlib.pyplot as plt

class MLPPolicy(nn.Module):
    def __init__(self, obs_dim, act_dim, hidden=64):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(obs_dim, hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden),
            nn.ReLU(),
            nn.Linear(hidden, act_dim),
        )

    def forward(self, x):
        return self.net(x)

def make_demo_dataset(n=1000):
    obs = np.linspace(-np.pi, np.pi, n).reshape(-1, 1).astype(np.float32)
    act = (np.sin(obs) + 0.05 * np.random.randn(n, 1)).astype(np.float32)
    return obs, act

def train_policy(policy, obs, act, epochs=200, lr=1e-3, batch_size=64):
    optimizer = torch.optim.Adam(policy.parameters(), lr=lr)
    loss_fn   = nn.MSELoss()
    history   = []
    for epoch in range(epochs):
        idx  = np.random.choice(len(obs), batch_size, replace=False)
        o_b  = torch.tensor(obs[idx])
        a_b  = torch.tensor(act[idx])
        pred = policy(o_b)
        loss = loss_fn(pred, a_b)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        history.append(loss.item())
    return history

if __name__ == "__main__":
    np.random.seed(42)
    torch.manual_seed(42)
    obs, act = make_demo_dataset(1000)
    policy = MLPPolicy(obs_dim=1, act_dim=1)
    losses = train_policy(policy, obs, act, epochs=300)
    test_o = torch.tensor([[0.0]])
    pred = policy(test_o).item()
    print(f"o=0.0 예측 action: {pred:.4f}  (정답 sin(0)=0.0)")

    plt.figure(figsize=(10, 4))
    plt.subplot(1, 2, 1)
    plt.plot(losses)
    plt.xlabel("Epoch"); plt.ylabel("MSE Loss")
    plt.title("BC 학습 Loss 곡선"); plt.grid(True)

    plt.subplot(1, 2, 2)
    test_range = np.linspace(-np.pi, np.pi, 200).reshape(-1, 1).astype(np.float32)
    with torch.no_grad():
        preds = policy(torch.tensor(test_range)).numpy()
    plt.plot(test_range, np.sin(test_range), "b-",  label="Expert (sin)")
    plt.plot(test_range, preds,               "r--", label="Learned Policy")
    plt.legend(); plt.grid(True); plt.title("Policy 학습 결과")
    plt.tight_layout()
    plt.savefig("pytorch_bc_mlp.png")
    plt.close()
    print("pytorch_bc_mlp.png 저장 완료")`,
  testCode: `import torch
import numpy as np
from pytorch_bc_mlp import MLPPolicy, make_demo_dataset, train_policy

def test_mlp_output_shape():
    policy = MLPPolicy(obs_dim=2, act_dim=3)
    x = torch.randn(8, 2)
    out = policy(x)
    assert out.shape == (8, 3), f"Expected (8,3) but got {out.shape}"

def test_loss_decreases():
    np.random.seed(0); torch.manual_seed(0)
    obs, act = make_demo_dataset(200)
    policy = MLPPolicy(obs_dim=1, act_dim=1)
    losses = train_policy(policy, obs, act, epochs=100, batch_size=32)
    assert losses[-1] < losses[0], "Loss should decrease after training"

def test_prediction_near_sine():
    np.random.seed(42); torch.manual_seed(42)
    obs, act = make_demo_dataset(1000)
    policy = MLPPolicy(obs_dim=1, act_dim=1)
    train_policy(policy, obs, act, epochs=500)
    test_o = torch.tensor([[0.0], [float(np.pi / 2)]])
    with torch.no_grad():
        preds = policy(test_o).numpy()
    assert abs(preds[0, 0] - 0.0) < 0.1, "sin(0)≈0 이어야 한다"
    assert abs(preds[1, 0] - 1.0) < 0.1, "sin(pi/2)≈1 이어야 한다"`,
  expectedOutput: "o=0.0 예측 action: 0.0021  (정답 sin(0)=0.0)",
  runCommand: "pip install torch --quiet && python pytorch_bc_mlp.py && pytest test_pytorch_bc_mlp.py",
  commonBugs: [
    "optimizer.zero_grad()를 loss.backward() 뒤에 호출해서 기울기가 누적됨",
    "torch.tensor()에 float64 numpy를 넣어 dtype mismatch 오류 발생",
    "nn.Linear 인수를 (out_dim, in_dim) 순서로 잘못 씀",
    "forward에서 self.net 대신 net(x)로 써서 AttributeError 발생",
  ],
  extensionTask:
    "obs_dim=4 (관절 위치 2개 + 끝단 위치 2개), act_dim=2인 MLP를 만들고 2-link FK 시뮬레이션 데이터로 BC를 학습해 IK policy를 만들어라.",
});

// ──────────────────────────────────────────────
// [세션 정의]
// ──────────────────────────────────────────────
export const pytorchBCSessions: Session[] = [
  session({
    id: "pytorch_bc_mlp",
    part: "Part 7. Physical AI / Embodied AI",
    title: "PyTorch MLP Behavior Cloning",
    level: "intermediate",
    difficulty: "medium",
    estimatedMinutes: 90,
    prerequisites: ["behavior_cloning_physical_ai", "calculus_gradient_descent"],
    learningObjectives: [
      "nn.Module로 2층 MLP policy를 정의한다.",
      "Adam optimizer와 MSELoss로 미니배치 학습 루프를 구현한다.",
      "zero_grad → backward → step 순서의 이유를 설명한다.",
      "loss 곡선과 policy 예측 결과를 matplotlib으로 시각화한다.",
      "다음 세션에서 ONNX export와 C++/ROS 2 배포로 넘길 policy 입출력 shape를 기록한다.",
    ],
    theory: {
      definition:
        "MLP (Multi-Layer Perceptron) Behavior Cloning은 expert demonstration의 observation-action pair를 지도학습 데이터로 사용해 2개 이상의 Linear-ReLU 층으로 구성된 policy를 학습하는 방법이다.",
      whyItMatters:
        "선형 모델은 sin, cos 같은 비선형 expert policy를 흉내낼 수 없다. 실제 로봇팔 pick-place, 자율주행 steering 같은 복잡한 policy는 MLP 이상의 비선형 함수 근사가 필요하다.",
      intuition:
        "선형 BC는 '직선 하나로 곡선을 흉내내는 것'이다. MLP는 여러 층의 직선과 구부림(ReLU)을 겹쳐 복잡한 곡선도 이어 그릴 수 있다.",
      equations: [
        makeEquation(
          "MLP BC loss (MSE)",
          "\\mathcal{L}(\\theta) = \\frac{1}{|B|}\\sum_{i \\in B}\\|\\pi_\\theta(o_i) - a_i\\|^2",
          [
            ["B", "미니배치 인덱스"],
            ["π_θ", "MLP policy, θ는 가중치"],
            ["a_i", "expert action"],
          ],
          "MSE loss를 미니배치 평균으로 계산하고 역전파한다.",
        ),
        makeEquation(
          "Adam 파라미터 업데이트",
          "\\theta \\leftarrow \\theta - \\alpha \\cdot \\hat{m}_t / (\\sqrt{\\hat{v}_t} + \\epsilon)",
          [
            ["α", "학습률 (lr)"],
            ["m̂, v̂", "1차/2차 모멘텀 바이어스 보정값"],
          ],
          "단순 SGD보다 학습률이 자동 조정되어 빠르게 수렴한다.",
        ),
        makeEquation(
          "ReLU 활성화",
          "\\text{ReLU}(x) = \\max(0, x)",
          [["x", "선형 변환 출력"]],
          "음수를 0으로 잘라 비선형성을 부여한다.",
        ),
      ],
      derivation: [
        step("모델 정의", "nn.Sequential에 Linear→ReLU→Linear→ReLU→Linear를 쌓는다."),
        step(
          "손실 계산",
          "policy 예측 action과 expert action의 MSE를 loss_fn(pred, a_b)으로 구한다.",
        ),
        step(
          "zero_grad",
          "이전 배치 기울기가 누적되지 않도록 optimizer.zero_grad()를 먼저 호출한다.",
        ),
        step("backward", "loss.backward()로 모든 파라미터에 대한 기울기를 자동 계산한다."),
        step(
          "step",
          "optimizer.step()으로 기울기 방향으로 파라미터를 Adam 규칙에 따라 업데이트한다.",
        ),
        step(
          "수렴 확인",
          "loss 곡선이 평평해지면 학습 완료. 과적합은 validation loss가 올라가는 시점에서 판단한다.",
        ),
      ],
      handCalculation: {
        problem: "Linear(1→2)에서 W=[[2],[3]], b=[0,0], 입력 x=1이면 출력은?",
        given: { W: "[[2],[3]]", b: "[0,0]", x: 1 },
        steps: ["y = W^T @ [x] + b = [2*1, 3*1] + [0,0]", "y = [2, 3]"],
        answer: "[2, 3]",
      },
      robotApplication:
        "LeRobot, diffusion policy, ACT 같은 실제 로봇 BC 프레임워크는 모두 PyTorch nn.Module 기반 policy를 사용한다. 이 구조를 이해하면 오픈소스 Physical AI 코드를 읽고 관절 수나 observation 형태를 바꿀 수 있다.",
    },
    codeLabs: [pytorchMLPLab],
    visualizations: [
      makeVisualization(
        "vis_pytorch_bc_loss",
        "BC MLP Loss Curve & Policy 비교",
        "pytorch_bc_mlp",
        "L = mean||pi(o)-a||^2",
        pytorchMLPLab.id,
        [
          {
            name: "hidden_size",
            symbol: "H",
            min: 8,
            max: 256,
            default: 64,
            description: "은닉층 크기 (클수록 표현력 증가)",
          },
          {
            name: "lr",
            symbol: "\\alpha",
            min: 0.0001,
            max: 0.01,
            default: 0.001,
            description: "학습률 (너무 크면 발산)",
          },
          {
            name: "epochs",
            symbol: "E",
            min: 50,
            max: 1000,
            default: 300,
            description: "학습 반복 횟수",
          },
        ],
        "hidden=64, lr=0.001, epochs=300에서 expert sin 곡선을 거의 완벽하게 학습한다.",
        "lr=0.01처럼 너무 크면 loss가 진동하며 수렴하지 않는다.",
      ),
    ],
    quizzes: makeCoreQuizzes({
      id: "pytorch_bc_mlp",
      conceptTag: "pytorch_bc_mlp",
      reviewSession: "PyTorch MLP BC",
      conceptQuestion: "optimizer.zero_grad()를 매 배치마다 호출해야 하는 이유는?",
      conceptAnswer:
        "PyTorch는 기울기를 기본적으로 누적하므로, 이전 배치 기울기가 현재 업데이트에 영향을 주지 않도록 초기화가 필요하다.",
      calculationQuestion: "MSE loss = mean([0.1^2, 0.3^2, 0.2^2])은?",
      calculationAnswer: "(0.01 + 0.09 + 0.04) / 3 = 0.14 / 3 ≈ 0.0467이다.",
      codeQuestion: "PyTorch에서 gradient를 역전파하는 코드 한 줄은?",
      codeAnswer: "loss.backward()",
      debugQuestion:
        "loss가 에포크마다 오르락내리락하며 전체적으로 줄지 않는다면 무엇을 의심하는가?",
      debugAnswer:
        "학습률(lr)이 너무 크거나, zero_grad() 호출 위치가 잘못됐거나, 데이터 셔플이 안 된 것을 의심한다.",
      visualQuestion: "hidden_size를 8로 줄이면 loss 곡선이 어떻게 변하는가?",
      visualAnswer:
        "표현력이 줄어 expert의 비선형 곡선을 충분히 따라가지 못해 최종 loss가 더 높게 수렴한다.",
      robotQuestion:
        "LeRobot 코드에서 obs_dim, act_dim을 자신의 로봇에 맞게 바꾸려면 어느 부분을 수정하는가?",
      robotAnswer:
        "MLPPolicy(obs_dim=..., act_dim=...) 초기화 인수와 make_demo_dataset의 observation/action 구조를 맞추면 된다.",
      designQuestion:
        "PyTorch MLP BC policy를 실제 로봇에 배포하기 전에 해야 할 검증 3가지는?",
      designAnswer:
        "holdout test set action error 측정, 시뮬레이터 closed-loop rollout 확인, 느린 속도에서 실제 로봇 shadowing 실행이다.",
    }),
    wrongAnswerTags: makeWrongTags("pytorch_bc_mlp", "PyTorch MLP 학습 오류", [
      "behavior_cloning_physical_ai",
      "calculus_gradient_descent",
    ]),
    nextSessions: ["pytorch_bc_onnx_export_contract", "dagger", "reinforcement_learning_basics", "sim2real_domain_randomization"],
  }),
];
