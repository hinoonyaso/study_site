import type { Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

const signalLab = {
  id: "lab_lpf_fft_sensor",
  title: "Low-pass Filter and FFT Sensor Analysis",
  language: "python" as const,
  theoryConnection: "Nyquist: fs > 2 fmax, LPF smooths high frequency sensor noise",
  starterCode: `import numpy as np

def low_pass(x, alpha):
    # TODO: y[k]=alpha*x[k]+(1-alpha)*y[k-1]
    raise NotImplementedError

def dominant_frequency(x, fs):
    # TODO: use np.fft.rfft and return dominant nonzero frequency
    raise NotImplementedError

if __name__ == "__main__":
    fs = 100.0
    t = np.arange(0, 2, 1/fs)
    x = np.sin(2*np.pi*5*t) + 0.3*np.sin(2*np.pi*30*t)
    print(round(dominant_frequency(x, fs), 1))
    print(round(low_pass(x, 0.1)[-1], 3))`,
  solutionCode: `import numpy as np

def low_pass(x, alpha):
    y = np.zeros_like(x, dtype=float)
    y[0] = x[0]
    for k in range(1, len(x)):
        y[k] = alpha * x[k] + (1 - alpha) * y[k-1]
    return y

def dominant_frequency(x, fs):
    spectrum = np.abs(np.fft.rfft(x))
    freqs = np.fft.rfftfreq(len(x), d=1/fs)
    spectrum[0] = 0.0
    return float(freqs[np.argmax(spectrum)])

if __name__ == "__main__":
    fs = 100.0
    t = np.arange(0, 2, 1/fs)
    x = np.sin(2*np.pi*5*t) + 0.3*np.sin(2*np.pi*30*t)
    print(round(dominant_frequency(x, fs), 1))
    print(round(low_pass(x, 0.1)[-1], 3))`,
  testCode: `import numpy as np
from lpf_fft_sensor import low_pass, dominant_frequency

def test_lpf_reduces_variance():
    x = np.array([0, 1, 0, 1, 0, 1], dtype=float)
    y = low_pass(x, 0.2)
    assert np.var(y) < np.var(x)

def test_dominant_frequency():
    fs = 100
    t = np.arange(0, 2, 1/fs)
    x = np.sin(2*np.pi*7*t)
    assert abs(dominant_frequency(x, fs) - 7) < 0.1`,
  expectedOutput: "5.0\n-0.327",
  runCommand: "python lpf_fft_sensor.py && pytest test_lpf_fft_sensor.py",
  commonBugs: ["sampling rate fs와 dt를 반대로 넣음", "FFT DC component를 제거하지 않아 0Hz를 dominant로 고름", "alpha를 cutoff frequency와 같은 단위로 착각함"],
  extensionTask: "cutoff frequency를 RC filter alpha로 변환하고 IMU vibration frequency를 제거하라.",
};

export const signalProcessingSessions: Session[] = [
  makeAdvancedSession({
    id: "signal_processing_fft_lpf",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "신호처리 기초: Sampling, LPF, FFT",
    prerequisites: ["low_pass_filter_imu", "kalman_filter_1d"],
    objectives: ["Nyquist sampling 기준을 설명한다.", "저역통과필터로 센서 노이즈를 줄인다.", "FFT로 dominant vibration frequency를 찾는다.", "제어 bandwidth와 sensor filtering trade-off를 이해한다."],
    definition: "신호처리는 시간에 따라 변하는 센서 값을 주파수와 필터 관점에서 분석하는 도구다. LPF는 고주파 노이즈를 줄이고 FFT는 신호에 포함된 주파수 성분을 보여준다.",
    whyItMatters: "IMU 진동, joint velocity noise, control loop jitter는 모두 주파수 문제다. bandwidth를 모르면 필터가 너무 느리거나 노이즈를 그대로 통과시킨다.",
    intuition: "센서 그래프를 시간축으로만 보면 흔들림처럼 보이지만, FFT를 보면 몇 Hz 진동이 문제인지 바로 보인다.",
    equations: [
      { label: "Nyquist", expression: "f_s > 2 f_{max}", terms: [["f_s", "sampling frequency"], ["f_max", "최대 신호 주파수"]], explanation: "너무 느리게 샘플링하면 aliasing이 생긴다." },
      { label: "LPF", expression: "y_k=\\alpha x_k+(1-\\alpha)y_{k-1}", terms: [["α", "smoothing factor"]], explanation: "작은 alpha는 더 부드럽지만 delay가 커진다." },
      { label: "FFT", expression: "X_f=\\sum_n x_n e^{-j2\\pi fn/N}", terms: [["X_f", "frequency bin amplitude"]], explanation: "시간 신호를 주파수 성분으로 분해한다." },
    ],
    derivation: [["샘플링", "fs가 신호보다 충분히 높아야 원 신호를 구분한다."], ["필터링", "현재 측정과 이전 출력의 weighted average를 만든다."], ["FFT", "각 주파수 basis와 얼마나 닮았는지 내적한다."], ["제어 연결", "filter delay가 제어 안정성에 미치는 영향을 확인한다."]],
    handCalculation: { problem: "최대 30Hz 진동을 보려면 최소 sampling rate는?", given: { fmax: "30Hz" }, steps: ["Nyquist: fs > 2*fmax", "fs > 60Hz"], answer: "60Hz보다 커야 하며 실무에서는 100Hz 이상을 쓴다." },
    robotApplication: "100Hz IMU에서 40Hz motor vibration이 보이면 LPF cutoff를 10~20Hz 근처로 잡되, yaw control delay가 커지지 않는지 확인해야 한다.",
    lab: signalLab,
    visualization: { id: "vis_signal_fft_lpf", title: "LPF와 FFT 센서 주파수 분석", equation: "y=alpha*x+(1-alpha)y_prev, fs>2fmax", parameters: [{ name: "alpha", symbol: "\\alpha", min: 0.01, max: 1, default: 0.1, description: "LPF smoothing factor" }, { name: "noise_freq", symbol: "f_n", min: 5, max: 45, default: 30, description: "노이즈 주파수" }], normalCase: "LPF 후 고주파 진동 amplitude가 줄어든다.", failureCase: "sampling rate가 낮으면 aliasing으로 잘못된 낮은 주파수처럼 보인다." },
    quiz: {
      id: "signal_lpf_fft",
      conceptQuestion: "Nyquist 기준은 왜 필요한가?",
      conceptAnswer: "최대 주파수의 2배보다 느리게 샘플링하면 aliasing으로 원 신호를 구분할 수 없기 때문이다.",
      calculationQuestion: "100Hz sampling에서 Nyquist frequency는?",
      calculationAnswer: "50Hz이다.",
      codeQuestion: "LPF 업데이트 한 줄은?",
      codeAnswer: "y[k] = alpha*x[k] + (1-alpha)*y[k-1]",
      debugQuestion: "FFT 결과 dominant가 항상 0Hz이면 무엇을 확인하는가?",
      debugAnswer: "DC component를 제거했는지, 평균값을 빼고 FFT했는지 확인한다.",
      visualQuestion: "alpha를 낮추면 LPF 출력은 어떻게 변하는가?",
      visualAnswer: "더 부드러워지지만 step response delay가 커진다.",
      robotQuestion: "joint velocity LPF가 너무 강하면 제어에 어떤 문제가 생기는가?",
      robotAnswer: "센서 delay가 커져 feedback이 늦고 overshoot나 불안정이 생길 수 있다.",
      designQuestion: "필터 cutoff를 정할 때 보는 두 가지는?",
      designAnswer: "노이즈 주파수와 제어 bandwidth/latency budget을 함께 본다.",
    },
    wrongTagLabel: "Sampling/FFT/LPF 오류",
    nextSessions: ["imu_preintegration_basic", "pid_control_v2"],
  }),
];
