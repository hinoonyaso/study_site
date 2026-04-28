import type { Session } from "../../types";
import { makeAdvancedSession } from "../core/advancedSessionFactory";

const backpropLab = {
  id: "lab_backprop_numpy_mlp",
  title: "NumPy Backprop for 2-layer MLP",
  language: "python" as const,
  theoryConnection: "chain rule: dL/dW2 = h^T dL/dy, dL/dW1 = x^T((dL/dh)*ReLU')",
  starterCode: `import numpy as np

def relu(x):
    # TODO
    raise NotImplementedError

def relu_grad(x):
    # TODO
    raise NotImplementedError

def forward(x, W1, W2):
    # TODO: z1=x@W1, h=relu(z1), y=h@W2
    raise NotImplementedError

def backward(x, target, W1, W2):
    # TODO: MSE loss gradients for one sample
    raise NotImplementedError

if __name__ == "__main__":
    x = np.array([[1.0, 2.0]])
    W1 = np.array([[0.1, -0.2], [0.3, 0.4]])
    W2 = np.array([[0.5], [-0.1]])
    loss, dW1, dW2 = backward(x, np.array([[1.0]]), W1, W2)
    print(round(loss, 4))
    print(np.round(dW2.ravel(), 4))`,
  solutionCode: `import numpy as np

def relu(x):
    return np.maximum(0.0, x)

def relu_grad(x):
    return (x > 0.0).astype(float)

def forward(x, W1, W2):
    z1 = x @ W1
    h = relu(z1)
    y = h @ W2
    return z1, h, y

def backward(x, target, W1, W2):
    z1, h, y = forward(x, W1, W2)
    diff = y - target
    loss = float(np.mean(diff ** 2))
    d_y = 2.0 * diff / diff.size
    dW2 = h.T @ d_y
    d_h = d_y @ W2.T
    d_z1 = d_h * relu_grad(z1)
    dW1 = x.T @ d_z1
    return loss, dW1, dW2

if __name__ == "__main__":
    x = np.array([[1.0, 2.0]])
    W1 = np.array([[0.1, -0.2], [0.3, 0.4]])
    W2 = np.array([[0.5], [-0.1]])
    loss, dW1, dW2 = backward(x, np.array([[1.0]]), W1, W2)
    print(round(loss, 4))
    print(np.round(dW2.ravel(), 4))`,
  testCode: `import numpy as np
from backprop_numpy_mlp import backward

def numerical_grad_w2(x, target, W1, W2, i, j, eps=1e-6):
    Wp = W2.copy(); Wm = W2.copy()
    Wp[i, j] += eps; Wm[i, j] -= eps
    lp, _, _ = backward(x, target, W1, Wp)
    lm, _, _ = backward(x, target, W1, Wm)
    return (lp - lm) / (2 * eps)

def test_dW2_matches_finite_difference():
    x = np.array([[1.0, 2.0]])
    target = np.array([[1.0]])
    W1 = np.array([[0.1, -0.2], [0.3, 0.4]])
    W2 = np.array([[0.5], [-0.1]])
    _, _, dW2 = backward(x, target, W1, W2)
    assert abs(dW2[0,0] - numerical_grad_w2(x, target, W1, W2, 0, 0)) < 1e-5`,
  expectedOutput: "0.5041\n[-0.994 -0.852]",
  runCommand: "python backprop_numpy_mlp.py && pytest test_backprop_numpy_mlp.py",
  commonBugs: [
    "MSE의 2*(y-target) 계수를 빼먹음",
    "ReLU derivative를 z1 기준이 아니라 h 기준으로 처리해 0 경계에서 헷갈림",
    "행렬 곱 방향을 뒤집어 dW shape가 W shape와 맞지 않음",
  ],
  extensionTask: "finite difference로 W1의 모든 원소 gradient를 검산하고 max error를 출력하라.",
};

export const backpropSessions: Session[] = [
  makeAdvancedSession({
    id: "backprop_chain_rule_numpy",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "Backprop 체인룰: NumPy로 2-layer MLP 역전파 구현",
    prerequisites: ["calculus_derivative_chain_rule", "calculus_gradient_descent", "pytorch_bc_mlp"],
    objectives: [
      "forward pass의 중간값 z1, h, y를 분리한다.",
      "MSE loss에서 dL/dy를 유도한다.",
      "chain rule로 dW2와 dW1을 직접 계산한다.",
      "finite difference로 autograd 없는 gradient를 검산한다.",
    ],
    definition:
      "Backpropagation은 composite function의 chain rule을 계산 그래프 뒤쪽에서 앞쪽으로 반복 적용해 모든 weight의 gradient를 효율적으로 구하는 알고리즘이다.",
    whyItMatters:
      "PyTorch의 loss.backward()는 마법이 아니라 체인룰이다. 이를 직접 구현할 수 있어야 custom loss, custom layer, gradient explosion/vanishing을 디버깅할 수 있다.",
    intuition:
      "출력에서 생긴 오차가 마지막 층, ReLU, 첫 층을 거슬러 올라가며 각 weight가 오차에 얼마나 책임이 있는지 나눠 받는 과정이다.",
    equations: [
      {
        label: "Forward graph",
        expression: "z_1=xW_1,\\; h=ReLU(z_1),\\; y=hW_2",
        terms: [["z1,h,y", "cached intermediate values"]],
        explanation: "역전파에는 forward 중간값이 필요하다.",
      },
      {
        label: "MSE gradient",
        expression: "\\frac{\\partial L}{\\partial y}=2(y-y^*)",
        terms: [["y*", "target action"]],
        explanation: "MSE loss의 시작 gradient다.",
      },
      {
        label: "Weight gradients",
        expression: "\\frac{\\partial L}{\\partial W_2}=h^T\\frac{\\partial L}{\\partial y},\\quad \\frac{\\partial L}{\\partial W_1}=x^T\\left((\\frac{\\partial L}{\\partial y}W_2^T)\\odot ReLU'(z_1)\\right)",
        terms: [["⊙", "elementwise product"]],
        explanation: "matrix shape가 gradient 유도의 가장 좋은 검산이다.",
      },
    ],
    derivation: [
      ["출력 gradient", "MSE에서 dL/dy를 먼저 계산한다."],
      ["마지막 층", "y=hW2이므로 dW2=h^T dL/dy다."],
      ["hidden gradient", "dL/dh=dL/dy W2^T로 오차를 이전 층에 전달한다."],
      ["ReLU gate", "z1<=0인 neuron은 gradient가 0으로 막힌다."],
      ["첫 층", "z1=xW1이므로 dW1=x^T dL/dz1이다."],
    ],
    handCalculation: {
      problem: "y=0.25, target=1.0, L=(y-target)^2이면 dL/dy는?",
      given: { y: 0.25, target: 1.0 },
      steps: ["dL/dy=2(y-target)", "2*(0.25-1.0)=-1.5"],
      answer: "-1.5",
    },
    robotApplication:
      "BC policy에서 action error가 커지는 관측 구간을 찾으려면 gradient가 어느 layer에서 사라지는지 확인해야 한다. 이 세션은 loss.backward()의 내부 계산을 로봇 policy 기준으로 해부한다.",
    lab: backpropLab,
    visualization: {
      id: "vis_backprop_chain_rule",
      title: "Backprop 계산 그래프와 Gradient 흐름",
      equation: "dL/dW = upstream * local gradient",
      parameters: [
        { name: "relu_gate", symbol: "g", min: 0, max: 1, default: 1, description: "ReLU active ratio" },
        { name: "error", symbol: "e", min: -2, max: 2, default: -0.75, description: "output error" },
      ],
      normalCase: "ReLU gate가 열려 있으면 gradient가 W1까지 전달된다.",
      failureCase: "dead ReLU가 많으면 W1 gradient가 0에 가까워져 학습이 멈춘다.",
    },
    quiz: {
      id: "backprop_numpy",
      conceptQuestion: "Backprop에서 forward 중간값을 cache하는 이유는?",
      conceptAnswer: "ReLU mask, hidden activation처럼 local gradient 계산에 필요한 값이 forward pass에서 나오기 때문이다.",
      calculationQuestion: "y=0.2, target=1.0이면 MSE dL/dy는?",
      calculationAnswer: "2*(0.2-1.0)=-1.6이다.",
      codeQuestion: "dW2를 계산하는 NumPy 한 줄은?",
      codeAnswer: "dW2 = h.T @ d_y",
      debugQuestion: "dW1 shape가 W1과 다르면 무엇을 확인하는가?",
      debugAnswer: "x.T @ d_z1 순서와 batch dimension 축을 확인한다.",
      visualQuestion: "relu_gate가 0에 가까우면 gradient 흐름은?",
      visualAnswer: "dead ReLU가 많아져 앞쪽 layer gradient가 거의 사라진다.",
      robotQuestion: "BC policy가 특정 관측에서 학습되지 않는다면 backprop 관점에서 무엇을 본다?",
      robotAnswer: "해당 관측의 activation, gradient norm, loss contribution, dead ReLU 여부를 확인한다.",
      designQuestion: "custom loss를 만들 때 finite difference 검산이 중요한 이유는?",
      designAnswer: "수동 gradient 부호와 scale 오류를 작은 입력에서 독립적으로 확인할 수 있기 때문이다.",
    },
    wrongTagLabel: "Backprop chain rule/gradient shape 오류",
    nextSessions: ["pytorch_bc_mlp", "vla_architecture_concepts"],
  }),
];
