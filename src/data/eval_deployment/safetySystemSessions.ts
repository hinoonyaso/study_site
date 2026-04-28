import type { QuizQuestionV2, Session, VisualizationSpec } from "../../types";
import { ensureCodeLabShape, makeCoreQuizzes, makeEquation, makeVisualization, makeWrongTags, session, step } from "../core/v2SessionHelpers";

const part = "Part 8. 실시간성, 안전성, 시스템 통합";

const watchdogLab = ensureCodeLabShape({
  id: "lab_safety_watchdog_timer",
  title: "Python Watchdog Timer",
  language: "python",
  theoryConnection: "if current_time - last_heartbeat_time > timeout: stop_robot()",
  starterCode: `class Watchdog:
    def __init__(self, timeout):
        self.timeout = timeout
        self.last_heartbeat_time = None

    def update_heartbeat(self, current_time):
        # TODO: 마지막 heartbeat 시간을 current_time으로 저장한다.
        pass

    def is_timeout(self, current_time):
        # TODO: current_time - last_heartbeat_time이 timeout보다 큰지 판단한다.
        # 힌트: heartbeat를 한 번도 받지 못했다면 안전하게 timeout으로 본다.
        pass

    def should_stop(self, current_time):
        # TODO: timeout이면 True, 아니면 False를 반환한다.
        pass

if __name__ == "__main__":
    watchdog = Watchdog(timeout=0.5)
    watchdog.update_heartbeat(10.0)
    print(watchdog.should_stop(10.8))`,
  solutionCode: `class Watchdog:
    def __init__(self, timeout):
        self.timeout = timeout
        self.last_heartbeat_time = None

    def update_heartbeat(self, current_time):
        self.last_heartbeat_time = current_time

    def is_timeout(self, current_time):
        if self.last_heartbeat_time is None:
            return True
        elapsed = current_time - self.last_heartbeat_time
        return elapsed > self.timeout

    def should_stop(self, current_time):
        return self.is_timeout(current_time)

if __name__ == "__main__":
    watchdog = Watchdog(timeout=0.5)
    watchdog.update_heartbeat(10.0)
    print(watchdog.should_stop(10.8))`,
  testCode: `from watchdog_timer import Watchdog

def test_not_timeout_right_after_heartbeat():
    watchdog = Watchdog(timeout=0.5)
    watchdog.update_heartbeat(10.0)
    assert watchdog.is_timeout(10.1) is False
    assert watchdog.should_stop(10.1) is False

def test_timeout_after_limit_passes():
    watchdog = Watchdog(timeout=0.5)
    watchdog.update_heartbeat(10.0)
    assert watchdog.is_timeout(10.8) is True
    assert watchdog.should_stop(10.8) is True

def test_too_short_timeout_can_stop_too_often():
    # 설명: timeout이 너무 짧으면 정상 heartbeat 간격에서도 로봇이 자주 멈출 수 있다.
    watchdog = Watchdog(timeout=0.01)
    watchdog.update_heartbeat(10.0)
    assert watchdog.should_stop(10.02) is True`,
  expectedOutput: "True",
  runCommand: "python watchdog_timer.py && pytest test_watchdog_timer.py",
  commonBugs: [
    "current_time과 last_heartbeat_time을 반대로 빼서 음수 시간이 됨",
    ">=와 > 기준을 문서와 다르게 써 boundary 동작이 바뀜",
    "heartbeat가 한 번도 없을 때 RUNNING으로 두어 모터가 계속 움직임",
  ],
  extensionTask: "timeout 직전에는 RUNNING, timeout 이후에는 STOPPED가 되도록 상태 문자열을 반환하는 status 함수를 추가하라.",
});

const watchdogVisualization: VisualizationSpec = {
  id: "vis_watchdog_timer",
  title: "Watchdog Timer",
  conceptTag: "safety_watchdog_timer",
  parameters: [
    { name: "timeout", symbol: "T_timeout", min: 0.1, max: 2.0, default: 0.5, description: "heartbeat가 끊겨도 기다리는 최대 시간" },
    { name: "heartbeat_interval", symbol: "T_hb", min: 0.05, max: 2.0, default: 0.2, description: "heartbeat가 들어오는 간격" },
    { name: "current_time", symbol: "t_now", min: 0, max: 20, default: 10.8, description: "현재 시간" },
  ],
  connectedEquation: "current_time - last_heartbeat_time > timeout",
  connectedCodeLab: watchdogLab.id,
  normalCase: "heartbeat가 timeout보다 자주 들어와서 로봇이 RUNNING 상태를 유지한다.",
  failureCase: "heartbeat가 끊겨 timeout을 넘으면 STOPPED 상태로 바뀌고 stop_robot()을 호출한다.",
  interpretationQuestions: [
    "last_heartbeat_time=10.0, current_time=10.8, timeout=0.5이면 상태가 RUNNING인지 STOPPED인지 말하라.",
    "heartbeat_interval이 timeout보다 커지면 왜 정상 로봇도 자주 멈출 수 있는지 설명하라.",
    "timeout을 너무 크게 잡으면 프로그램이 멈춘 뒤에도 로봇이 오래 움직이는 이유를 말하라.",
  ],
};

const watchdogQuizzes: QuizQuestionV2[] = [
  {
    id: "safety_watchdog_timer_q01_concept",
    type: "concept",
    difficulty: "easy",
    conceptTag: "safety_watchdog_timer",
    question: "Watchdog Timer는 로봇에서 무엇을 감시하는 장치인가?",
    expectedAnswer: "제어 프로그램이 계속 heartbeat를 보내며 살아있는지 감시하고, 일정 시간 신호가 없으면 로봇을 멈추는 장치다.",
    explanation: "로봇은 움직이는 것보다 안전하게 멈추는 것이 더 중요하다. heartbeat가 끊기면 제어기가 죽었을 수 있으므로 정지해야 한다.",
    wrongAnswerAnalysis: {
      commonWrongAnswer: "로봇을 더 빠르게 움직이게 하는 타이머라고 답함",
      whyWrong: "Watchdog의 목적은 성능 향상이 아니라 신호 끊김을 찾아 안전 정지로 보내는 것이다.",
      errorType: "concept_confusion",
      reviewSession: "safety_watchdog_timer",
      retryQuestionType: "calculation",
    },
  },
  {
    id: "safety_watchdog_timer_q02_calculation",
    type: "calculation",
    difficulty: "medium",
    conceptTag: "safety_watchdog_timer",
    question: "last_heartbeat_time=10.0초, current_time=10.8초, timeout=0.5초일 때 로봇을 멈춰야 하는가?",
    expectedAnswer: "10.8-10.0=0.8초이고 0.8>0.5이므로 로봇을 멈춰야 한다.",
    explanation: "조건식은 current_time - last_heartbeat_time > timeout이다. 0.8초는 허용 시간 0.5초보다 크다.",
    wrongAnswerAnalysis: {
      commonWrongAnswer: "0.8초가 아직 1초보다 작으니 멈추지 않는다고 답함",
      whyWrong: "기준은 1초가 아니라 설정된 timeout=0.5초다.",
      errorType: "calculation_error",
      reviewSession: "safety_watchdog_timer",
      retryQuestionType: "calculation",
    },
  },
  {
    id: "safety_watchdog_timer_q03_code_completion",
    type: "code_completion",
    difficulty: "medium",
    conceptTag: "safety_watchdog_timer",
    question: "is_timeout 함수에서 elapsed를 계산한 뒤 timeout 여부를 반환하는 한 줄을 작성하라.",
    expectedAnswer: "return elapsed > self.timeout",
    explanation: "요구 조건식이 `current_time - last_heartbeat_time > timeout`이므로 차이가 timeout보다 클 때만 True다.",
    wrongAnswerAnalysis: {
      commonWrongAnswer: "return elapsed < self.timeout",
      whyWrong: "이렇게 쓰면 heartbeat가 방금 들어온 정상 상황을 timeout으로 잘못 판단한다.",
      errorType: "code_logic_error",
      reviewSession: "safety_watchdog_timer",
      retryQuestionType: "code_debug",
    },
  },
  {
    id: "safety_watchdog_timer_q04_code_debug",
    type: "code_debug",
    difficulty: "medium",
    conceptTag: "safety_watchdog_timer",
    question: "코드가 `elapsed = last_heartbeat_time - current_time`으로 되어 있어 timeout이 절대 발생하지 않는다. 어떻게 고치는가?",
    expectedAnswer: "`elapsed = current_time - self.last_heartbeat_time`으로 고친다.",
    explanation: "현재 시간이 마지막 heartbeat보다 나중이므로 현재 시간에서 마지막 시간을 빼야 양수 경과 시간이 나온다.",
    wrongAnswerAnalysis: {
      commonWrongAnswer: "timeout 값을 더 크게 만든다",
      whyWrong: "문제의 원인은 파라미터가 아니라 시간 차이를 반대로 계산한 코드 버그다.",
      errorType: "code_logic_error",
      reviewSession: "safety_watchdog_timer",
      retryQuestionType: "code_completion",
    },
  },
  {
    id: "safety_watchdog_timer_q05_visualization",
    type: "visualization_interpretation",
    difficulty: "medium",
    conceptTag: "safety_watchdog_timer",
    question: "시각화에서 heartbeat_interval=0.2초, timeout=0.5초이면 상태는 어떻게 보여야 하는가?",
    expectedAnswer: "heartbeat가 timeout보다 자주 들어오므로 RUNNING 상태가 유지되어야 한다.",
    explanation: "0.2초마다 heartbeat가 들어오면 마지막 신호와 현재 시간의 차이가 0.5초를 넘기 전에 계속 갱신된다.",
    wrongAnswerAnalysis: {
      commonWrongAnswer: "heartbeat가 있든 없든 current_time이 커지면 무조건 STOPPED가 된다고 답함",
      whyWrong: "current_time만 보는 것이 아니라 마지막 heartbeat가 계속 갱신되는지를 봐야 한다.",
      errorType: "visualization_misread",
      reviewSession: "safety_watchdog_timer",
      retryQuestionType: "calculation",
    },
  },
  {
    id: "safety_watchdog_timer_q06_robot_scenario",
    type: "robot_scenario",
    difficulty: "hard",
    conceptTag: "safety_watchdog_timer",
    question: "모바일 로봇의 cmd_vel publisher가 멈췄는데 마지막 속도 명령이 남아 있다. Watchdog은 무엇을 해야 하는가?",
    expectedAnswer: "timeout을 감지하고 zero velocity command를 보내거나 motor enable을 내려 로봇을 정지시켜야 한다.",
    explanation: "마지막 명령을 계속 유지하면 제어 프로그램이 죽은 뒤에도 로봇이 움직일 수 있어 위험하다.",
    wrongAnswerAnalysis: {
      commonWrongAnswer: "마지막 cmd_vel을 계속 유지한다",
      whyWrong: "신호가 끊긴 상태에서 마지막 명령을 유지하는 것은 fail-safe가 아니라 fail-dangerous 동작이다.",
      errorType: "robot_application_error",
      reviewSession: "safety_watchdog_timer",
      retryQuestionType: "visualization_interpretation",
    },
  },
  {
    id: "safety_watchdog_timer_q07_system_design",
    type: "system_design",
    difficulty: "hard",
    conceptTag: "safety_watchdog_timer",
    question: "실제 로봇 시스템에서 Watchdog을 설계할 때 정해야 할 값과 동작 3가지를 쓰라.",
    expectedAnswer: "timeout 값, heartbeat 주기, timeout 발생 시 zero command와 actuator disable 중 어떤 정지 동작을 할지 정해야 한다.",
    explanation: "Watchdog은 조건식 하나가 아니라 heartbeat 생성자, 감시자, 정지 동작, 복구 조건까지 하나의 안전 경로로 설계해야 한다.",
    wrongAnswerAnalysis: {
      commonWrongAnswer: "timeout 숫자만 정하면 끝이라고 답함",
      whyWrong: "정지 명령을 어디로 보낼지와 복구를 어떻게 허용할지도 정해야 실제 로봇 안전 시스템이 된다.",
      errorType: "system_design_error",
      reviewSession: "safety_watchdog_timer",
      retryQuestionType: "robot_scenario",
    },
  },
];

const failSafeLab = ensureCodeLabShape({
  id: "lab_safety_fail_safe_state_machine",
  title: "Fail-safe State Machine",
  language: "python",
  theoryConnection: "if estop_pressed or fault_active or not heartbeat_ok: state='STOPPED'",
  starterCode: `class FailSafeStateMachine:
    def __init__(self):
        self.state = "STOPPED"

    def transition(self, enable, heartbeat_ok, sensors_ok, estop_pressed, fault_active):
        # TODO: estop이나 fault가 있으면 STOPPED
        # TODO: enable, heartbeat_ok, sensors_ok가 모두 True이면 RUNNING
        # TODO: 그 외에는 STOPPED
        pass

if __name__ == "__main__":
    sm = FailSafeStateMachine()
    print(sm.transition(True, True, True, False, False))`,
  solutionCode: `class FailSafeStateMachine:
    def __init__(self):
        self.state = "STOPPED"

    def transition(self, enable, heartbeat_ok, sensors_ok, estop_pressed, fault_active):
        if estop_pressed or fault_active:
            self.state = "STOPPED"
        elif enable and heartbeat_ok and sensors_ok:
            self.state = "RUNNING"
        else:
            self.state = "STOPPED"
        return self.state

if __name__ == "__main__":
    sm = FailSafeStateMachine()
    print(sm.transition(True, True, True, False, False))`,
  testCode: `from fail_safe_state_machine import FailSafeStateMachine

def test_running_only_when_all_safe_inputs_are_ok():
    sm = FailSafeStateMachine()
    assert sm.transition(True, True, True, False, False) == "RUNNING"

def test_estop_has_priority():
    sm = FailSafeStateMachine()
    assert sm.transition(True, True, True, True, False) == "STOPPED"

def test_sensor_failure_stops_robot():
    sm = FailSafeStateMachine()
    assert sm.transition(True, True, False, False, False) == "STOPPED"`,
  expectedOutput: "RUNNING",
  runCommand: "python fail_safe_state_machine.py && pytest test_fail_safe_state_machine.py",
  commonBugs: ["RUNNING 조건을 OR로 묶어 일부 안전 조건이 실패해도 움직임", "E-stop보다 enable을 먼저 처리함", "fault가 사라지면 reset 없이 바로 재시작함"],
  extensionTask: "STOPPED에서 RUNNING으로 돌아갈 때 operator_reset=True가 필요하도록 상태를 확장하라.",
});

const estopLab = ensureCodeLabShape({
  id: "lab_safety_emergency_stop_pipeline",
  title: "Emergency Stop Pipeline",
  language: "python",
  theoryConnection: "if hardware_estop or software_estop or remote_estop: zero_command and disable_actuator",
  starterCode: `def emergency_stop_pipeline(hardware_estop, software_estop, remote_estop):
    # TODO: 세 입력 중 하나라도 True이면 stop=True로 만든다.
    # TODO: stop이면 velocity_command=0.0, actuator_enabled=False를 반환한다.
    pass

if __name__ == "__main__":
    print(emergency_stop_pipeline(True, False, False))`,
  solutionCode: `def emergency_stop_pipeline(hardware_estop, software_estop, remote_estop):
    stop = hardware_estop or software_estop or remote_estop
    if stop:
        return {"stop": True, "velocity_command": 0.0, "actuator_enabled": False}
    return {"stop": False, "velocity_command": None, "actuator_enabled": True}

if __name__ == "__main__":
    print(emergency_stop_pipeline(True, False, False))`,
  testCode: `from emergency_stop_pipeline import emergency_stop_pipeline

def test_hardware_estop_stops_everything():
    result = emergency_stop_pipeline(True, False, False)
    assert result["stop"] is True
    assert result["velocity_command"] == 0.0
    assert result["actuator_enabled"] is False

def test_any_estop_source_stops():
    assert emergency_stop_pipeline(False, True, False)["stop"] is True
    assert emergency_stop_pipeline(False, False, True)["stop"] is True

def test_no_estop_keeps_actuator_enabled():
    result = emergency_stop_pipeline(False, False, False)
    assert result["stop"] is False
    assert result["actuator_enabled"] is True`,
  expectedOutput: "{'stop': True, 'velocity_command': 0.0, 'actuator_enabled': False}",
  runCommand: "python emergency_stop_pipeline.py && pytest test_emergency_stop_pipeline.py",
  commonBugs: ["E-stop 입력을 AND로 묶어 세 버튼이 모두 눌려야 멈춤", "zero command만 보내고 actuator enable을 끄지 않음", "remote E-stop을 낮은 우선순위로 처리함"],
  extensionTask: "E-stop 발생 시간을 event log에 남기는 append_event 함수를 추가하라.",
});

const sensorTimeoutLab = ensureCodeLabShape({
  id: "lab_safety_sensor_timeout_handling",
  title: "Sensor Timeout Handling",
  language: "python",
  theoryConnection: "sensor_age=current_time-last_sensor_time; stop if sensor_age>max_age",
  starterCode: `class SensorTimeoutMonitor:
    def __init__(self, max_age):
        self.max_age = max_age
        self.last_sensor_time = {}

    def update_sensor(self, sensor_name, stamp):
        # TODO: sensor_name의 마지막 stamp를 저장한다.
        pass

    def is_stale(self, sensor_name, current_time):
        # TODO: 센서가 없거나 age가 max_age보다 크면 True
        pass

    def should_stop(self, required_sensors, current_time):
        # TODO: 필수 센서 중 하나라도 stale이면 True
        pass`,
  solutionCode: `class SensorTimeoutMonitor:
    def __init__(self, max_age):
        self.max_age = max_age
        self.last_sensor_time = {}

    def update_sensor(self, sensor_name, stamp):
        self.last_sensor_time[sensor_name] = stamp

    def is_stale(self, sensor_name, current_time):
        if sensor_name not in self.last_sensor_time:
            return True
        age = current_time - self.last_sensor_time[sensor_name]
        return age > self.max_age

    def should_stop(self, required_sensors, current_time):
        return any(self.is_stale(name, current_time) for name in required_sensors)`,
  testCode: `from sensor_timeout_handling import SensorTimeoutMonitor

def test_fresh_sensor_is_not_stale():
    monitor = SensorTimeoutMonitor(max_age=0.3)
    monitor.update_sensor("lidar", 10.0)
    assert monitor.is_stale("lidar", 10.1) is False

def test_stale_sensor_stops_robot():
    monitor = SensorTimeoutMonitor(max_age=0.3)
    monitor.update_sensor("lidar", 10.0)
    assert monitor.should_stop(["lidar"], 10.5) is True

def test_missing_required_sensor_stops_robot():
    monitor = SensorTimeoutMonitor(max_age=0.3)
    assert monitor.should_stop(["camera"], 10.0) is True`,
  expectedOutput: "pytest passes: stale or missing required sensors request STOPPED",
  runCommand: "pytest test_sensor_timeout_handling.py",
  commonBugs: ["sensor timestamp가 없을 때 fresh로 처리함", "wall time과 message stamp를 섞음", "필수 센서 중 하나만 stale이어도 멈춰야 하는데 모두 stale일 때만 멈춤"],
  extensionTask: "센서별 max_age를 다르게 설정하도록 config dict를 지원하라.",
});

const actuatorLimitLab = ensureCodeLabShape({
  id: "lab_safety_actuator_limit_saturation",
  title: "Actuator Limit and Saturation",
  language: "python",
  theoryConnection: "safe_cmd=clip(raw_cmd,min_limit,max_limit); stop if abs(raw_cmd)>hard_limit",
  starterCode: `def limit_command(raw_cmd, soft_limit, hard_limit):
    # TODO: abs(raw_cmd)가 hard_limit보다 크면 stop=True를 반환한다.
    # TODO: 아니면 raw_cmd를 [-soft_limit, soft_limit] 범위로 자른다.
    pass

if __name__ == "__main__":
    print(limit_command(3.0, soft_limit=1.0, hard_limit=2.0))`,
  solutionCode: `def limit_command(raw_cmd, soft_limit, hard_limit):
    if abs(raw_cmd) > hard_limit:
        return {"command": 0.0, "stop": True, "saturated": True}
    clipped = max(-soft_limit, min(soft_limit, raw_cmd))
    return {"command": clipped, "stop": False, "saturated": clipped != raw_cmd}

if __name__ == "__main__":
    print(limit_command(3.0, soft_limit=1.0, hard_limit=2.0))`,
  testCode: `from actuator_limit_saturation import limit_command

def test_normal_command_passes():
    result = limit_command(0.5, soft_limit=1.0, hard_limit=2.0)
    assert result == {"command": 0.5, "stop": False, "saturated": False}

def test_soft_limit_clips_but_does_not_stop():
    result = limit_command(1.5, soft_limit=1.0, hard_limit=2.0)
    assert result["command"] == 1.0
    assert result["stop"] is False
    assert result["saturated"] is True

def test_hard_limit_stops_robot():
    result = limit_command(3.0, soft_limit=1.0, hard_limit=2.0)
    assert result["command"] == 0.0
    assert result["stop"] is True`,
  expectedOutput: "{'command': 0.0, 'stop': True, 'saturated': True}",
  runCommand: "python actuator_limit_saturation.py && pytest test_actuator_limit_saturation.py",
  commonBugs: ["hard limit 초과를 soft clipping만 하고 계속 움직임", "음수 command의 절댓값 검사를 빼먹음", "saturation 발생 여부를 로그로 남기지 않음"],
  extensionTask: "saturation이 5회 연속 발생하면 stop=True가 되도록 counter를 추가하라.",
});

const latencyJitterLab = ensureCodeLabShape({
  id: "lab_safety_latency_jitter_profiling",
  title: "Latency and Jitter Profiling",
  language: "python",
  theoryConnection: "latency=end-start; jitter=abs(period-target_period); stop if deadline_miss_count>=max_misses",
  starterCode: `def profile_loop(timestamps, target_period, deadline, max_misses):
    # TODO: 연속 timestamp로 period list를 만든다.
    # TODO: jitter와 deadline miss 개수를 계산한다.
    # TODO: miss가 max_misses 이상이면 stop=True를 반환한다.
    pass

if __name__ == "__main__":
    print(profile_loop([0.00, 0.02, 0.04, 0.10], 0.02, 0.03, 1))`,
  solutionCode: `def profile_loop(timestamps, target_period, deadline, max_misses):
    periods = [timestamps[i] - timestamps[i - 1] for i in range(1, len(timestamps))]
    jitters = [abs(period - target_period) for period in periods]
    deadline_misses = sum(1 for period in periods if period > deadline)
    return {
        "periods": periods,
        "jitters": jitters,
        "deadline_misses": deadline_misses,
        "stop": deadline_misses >= max_misses,
    }

if __name__ == "__main__":
    print(profile_loop([0.00, 0.02, 0.04, 0.10], 0.02, 0.03, 1))`,
  testCode: `from latency_jitter_profiling import profile_loop

def test_no_deadline_miss_keeps_running():
    result = profile_loop([0.00, 0.02, 0.04, 0.06], 0.02, 0.03, 1)
    assert result["deadline_misses"] == 0
    assert result["stop"] is False

def test_deadline_miss_stops_when_limit_reached():
    result = profile_loop([0.00, 0.02, 0.04, 0.10], 0.02, 0.03, 1)
    assert result["deadline_misses"] == 1
    assert result["stop"] is True

def test_jitter_values_are_absolute_period_errors():
    result = profile_loop([0.00, 0.02, 0.05], 0.02, 0.10, 3)
    assert result["jitters"] == [0.0, 0.01]`,
  expectedOutput: "{'periods': [0.02, 0.02, 0.060000000000000005], 'jitters': [0.0, 0.0, 0.04000000000000001], 'deadline_misses': 1, 'stop': True}",
  runCommand: "python latency_jitter_profiling.py && pytest test_latency_jitter_profiling.py",
  commonBugs: ["평균 latency만 보고 tail deadline miss를 놓침", "jitter를 period-target으로 두어 음수 jitter를 만듦", "miss_count가 쌓여도 안전 상태로 전환하지 않음"],
  extensionTask: "p95 latency와 max jitter를 계산해 CSV 한 줄로 출력하라.",
});

export const safetySystemSessions: Session[] = [
  session({
    id: "safety_watchdog_timer",
    part,
    title: "Watchdog Timer",
    level: "beginner",
    prerequisites: ["loop-latency", "ros2_node"],
    learningObjectives: [
      "Watchdog이 로봇이 계속 살아있는지 보는 감시자라는 것을 설명한다.",
      "heartbeat가 timeout보다 늦으면 로봇을 멈추는 조건식을 계산한다.",
      "Python Watchdog 클래스로 timeout 정지 판단을 구현한다.",
      "timeout을 너무 짧게 또는 길게 잡을 때 생기는 위험을 구분한다.",
    ],
    theory: {
      definition: "Watchdog Timer는 제어 프로그램이 정해진 시간 안에 heartbeat를 보내는지 감시하고, 신호가 끊기면 로봇을 정지시키는 안전 장치다.",
      whyItMatters: "로봇 제어 프로그램이 멈췄는데 모터가 마지막 명령으로 계속 움직이면 사람과 장비가 위험해진다.",
      intuition: "Watchdog은 로봇 옆에서 계속 '살아 있어?'라고 확인하는 감시자다. 대답이 너무 늦으면 바로 정지 버튼을 누른다.",
      equations: [
        makeEquation("Watchdog stop condition", "current_time - last_heartbeat_time > timeout", [["current_time", "현재 시간"], ["last_heartbeat_time", "마지막 heartbeat 시간"], ["timeout", "기다릴 수 있는 최대 시간"]], "경과 시간이 timeout보다 크면 stop_robot()을 호출한다."),
        makeEquation("Robot state", "state = STOPPED if timeout else RUNNING", [["state", "로봇 안전 상태"], ["timeout", "신호 끊김 판단 결과"]], "timeout 결과가 상태 전이를 결정한다."),
      ],
      derivation: [
        step("마지막 신호 시간 저장", "heartbeat가 들어올 때마다 last_heartbeat_time을 현재 시간으로 갱신한다."),
        step("현재까지 지난 시간 계산", "current_time에서 last_heartbeat_time을 뺀다.", "elapsed=current_time-last_heartbeat_time"),
        step("허용 시간과 비교", "elapsed가 timeout보다 크면 제어기가 죽었다고 판단한다.", "elapsed>timeout"),
        step("안전 정지 실행", "timeout이면 zero command 또는 actuator disable을 실행한다.", "stop_robot()"),
      ],
      handCalculation: {
        problem: "last_heartbeat_time=10.0초, current_time=10.8초, timeout=0.5초일 때 정지해야 하는가?",
        given: { last_heartbeat_time: 10.0, current_time: 10.8, timeout: 0.5 },
        steps: ["10.8 - 10.0 = 0.8초", "0.8초 > 0.5초", "조건식이 True이므로 stop_robot()을 호출한다."],
        answer: "로봇을 정지해야 한다.",
      },
      robotApplication: "ROS2 모바일 로봇에서는 cmd_vel heartbeat나 controller heartbeat가 끊기면 base controller가 zero velocity로 바꾸고 motor enable을 내려야 한다.",
    },
    codeLabs: [watchdogLab],
    visualizations: [watchdogVisualization],
    quizzes: watchdogQuizzes,
    wrongAnswerTags: makeWrongTags("safety_watchdog_timer", "Watchdog timeout 판단 오류", ["loop-latency", "ros2_node"]),
    nextSessions: ["safety_fail_safe_state_machine", "safety_sensor_timeout_handling"],
  }),
  session({
    id: "safety_fail_safe_state_machine",
    part,
    title: "Fail-safe State Machine",
    level: "beginner",
    prerequisites: ["safety_watchdog_timer"],
    learningObjectives: ["RUNNING과 STOPPED 상태 전이를 설계한다.", "E-stop과 fault가 가장 높은 우선순위임을 설명한다.", "안전 입력이 하나라도 실패하면 정지하는 코드를 작성한다."],
    theory: {
      definition: "Fail-safe State Machine은 로봇 상태를 RUNNING, STOPPED 같은 안전 상태로 나누고 위험 입력이 들어오면 안전한 상태로 전환하는 규칙이다.",
      whyItMatters: "복잡한 로봇은 센서, 제어기, 통신, 액추에이터 중 하나만 실패해도 전체가 안전하게 멈춰야 한다.",
      intuition: "놀이기구 문이 하나라도 열려 있으면 출발하지 않는 규칙과 같다.",
      equations: [
        makeEquation("Stop priority", "if estop_pressed or fault_active or not heartbeat_ok: state=STOPPED", [["estop_pressed", "비상정지 입력"], ["fault_active", "장애 상태"], ["heartbeat_ok", "heartbeat 정상 여부"]], "위험 조건은 enable보다 먼저 처리한다."),
        makeEquation("Run condition", "RUNNING = enable and heartbeat_ok and sensors_ok and not estop_pressed", [["enable", "운전 허가"], ["sensors_ok", "필수 센서 정상"]], "모든 안전 조건이 True일 때만 움직인다."),
      ],
      derivation: [
        step("상태 정의", "STOPPED와 RUNNING을 먼저 정한다."),
        step("정지 조건 우선", "E-stop, fault, heartbeat 실패를 가장 먼저 검사한다."),
        step("운전 조건 검사", "enable, heartbeat_ok, sensors_ok가 모두 True인지 확인한다."),
        step("나머지는 정지", "애매한 상태는 모두 STOPPED로 보낸다."),
      ],
      handCalculation: {
        problem: "enable=True, heartbeat_ok=True, sensors_ok=False, estop_pressed=False이면 상태는?",
        given: { enable: "true", heartbeat_ok: "true", sensors_ok: "false", estop_pressed: "false" },
        steps: ["E-stop은 없다.", "하지만 sensors_ok가 False다.", "RUNNING 조건이 모두 True가 아니므로 STOPPED다."],
        answer: "STOPPED",
      },
      robotApplication: "ROS2 safety monitor node가 여러 topic의 정상 여부를 모아 base controller enable을 RUNNING 또는 STOPPED로 전환한다.",
    },
    codeLabs: [failSafeLab],
    visualizations: [
      makeVisualization("vis_fail_safe_state_machine", "Fail-safe State Machine", "safety_fail_safe_state_machine", "RUNNING=enable and heartbeat_ok and sensors_ok and not estop_pressed", failSafeLab.id, [
        { name: "enable", symbol: "enable", min: 0, max: 1, default: 1, description: "운전 허가 입력" },
        { name: "sensors_ok", symbol: "sensors_ok", min: 0, max: 1, default: 1, description: "필수 센서 정상 여부" },
        { name: "estop_pressed", symbol: "E", min: 0, max: 1, default: 0, description: "비상정지 입력" },
      ], "모든 안전 입력이 정상일 때만 RUNNING으로 보인다.", "E-stop 또는 sensor failure가 있으면 STOPPED로 전환된다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "safety_fail_safe_state_machine",
      conceptTag: "safety_fail_safe_state_machine",
      reviewSession: "Fail-safe State Machine",
      conceptQuestion: "Fail-safe 상태머신의 기본 원칙은?",
      conceptAnswer: "애매하거나 위험한 입력은 RUNNING이 아니라 STOPPED로 보낸다.",
      calculationQuestion: "enable=True, sensors_ok=False이면 상태는?",
      calculationAnswer: "STOPPED이다.",
      codeQuestion: "RUNNING 조건에 들어가야 하는 안전 입력은?",
      codeAnswer: "enable, heartbeat_ok, sensors_ok가 True이고 estop_pressed가 False여야 한다.",
      debugQuestion: "E-stop을 눌렀는데 RUNNING이면 어떤 우선순위 오류인가?",
      debugAnswer: "E-stop보다 enable 조건을 먼저 처리한 오류다.",
      visualQuestion: "estop_pressed가 1이 되면 시각화 상태는?",
      visualAnswer: "즉시 STOPPED로 바뀌어야 한다.",
      robotQuestion: "센서 하나가 실패했는데 계속 주행하면 왜 위험한가?",
      robotAnswer: "현재 환경을 믿을 수 없으므로 장애물이나 위치를 잘못 판단할 수 있다.",
      designQuestion: "STOPPED에서 RUNNING 복귀에 필요한 설계 조건은?",
      designAnswer: "위험 원인 해소와 operator reset을 요구해야 한다.",
    }),
    wrongAnswerTags: makeWrongTags("safety_fail_safe_state_machine", "Fail-safe 상태 전이 오류", ["safety_watchdog_timer"]),
    nextSessions: ["safety_emergency_stop_pipeline", "safety_actuator_limit_saturation"],
  }),
  session({
    id: "safety_emergency_stop_pipeline",
    part,
    title: "Emergency Stop Pipeline",
    level: "intermediate",
    prerequisites: ["safety_fail_safe_state_machine"],
    learningObjectives: ["하드웨어/소프트웨어/원격 E-stop을 OR 조건으로 묶는다.", "E-stop 발생 시 zero command와 actuator disable을 실행한다.", "E-stop 우선순위를 일반 명령보다 높게 설계한다."],
    theory: {
      definition: "Emergency Stop Pipeline은 여러 비상정지 입력을 모아 로봇을 즉시 정지시키는 안전 경로다.",
      whyItMatters: "사람이 위험을 보면 어떤 경로의 E-stop을 눌러도 로봇은 같은 정지 동작을 해야 한다.",
      intuition: "교실의 모든 비상벨이 같은 방송실로 연결되어 하나만 눌려도 전체 알람이 울리는 구조다.",
      equations: [
        makeEquation("E-stop OR condition", "stop = hardware_estop or software_estop or remote_estop", [["hardware_estop", "물리 버튼"], ["software_estop", "소프트웨어 정지"], ["remote_estop", "원격 정지"]], "하나라도 True이면 정지한다."),
        makeEquation("Stop action", "if stop: cmd=0 and actuator_enabled=False", [["cmd", "속도/토크 명령"], ["actuator_enabled", "구동기 활성 상태"]], "명령을 0으로 만들고 구동을 끈다."),
      ],
      derivation: [
        step("E-stop source 수집", "하드웨어, 소프트웨어, 원격 입력을 읽는다."),
        step("OR 조건 계산", "하나라도 True이면 stop=True다."),
        step("명령 차단", "일반 command를 버리고 zero command를 만든다."),
        step("구동기 비활성화", "actuator enable을 False로 내려 물리 출력도 막는다."),
      ],
      handCalculation: {
        problem: "hardware_estop=False, software_estop=True, remote_estop=False이면 stop은?",
        given: { hardware_estop: "false", software_estop: "true", remote_estop: "false" },
        steps: ["False or True or False = True", "stop=True", "cmd=0, actuator_enabled=False"],
        answer: "정지한다.",
      },
      robotApplication: "협동로봇이나 모바일 베이스는 물리 E-stop 버튼, UI 정지 버튼, 원격 안전 monitor가 모두 같은 정지 경로로 들어가야 한다.",
    },
    codeLabs: [estopLab],
    visualizations: [
      makeVisualization("vis_emergency_stop_pipeline", "Emergency Stop Pipeline", "safety_emergency_stop_pipeline", "stop=hardware_estop or software_estop or remote_estop", estopLab.id, [
        { name: "hardware_estop", symbol: "E_hw", min: 0, max: 1, default: 0, description: "물리 E-stop" },
        { name: "software_estop", symbol: "E_sw", min: 0, max: 1, default: 0, description: "소프트웨어 E-stop" },
        { name: "remote_estop", symbol: "E_remote", min: 0, max: 1, default: 0, description: "원격 E-stop" },
      ], "모든 E-stop 입력이 0이면 actuator가 enabled 상태를 유지한다.", "입력 하나라도 1이면 zero command와 actuator disable이 실행된다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "safety_emergency_stop_pipeline",
      conceptTag: "safety_emergency_stop_pipeline",
      reviewSession: "Emergency Stop Pipeline",
      conceptQuestion: "E-stop 입력 여러 개는 어떤 논리로 묶어야 하는가?",
      conceptAnswer: "하나라도 눌리면 멈추도록 OR 조건으로 묶는다.",
      calculationQuestion: "False or True or False의 stop 값은?",
      calculationAnswer: "True이다.",
      codeQuestion: "stop=True일 때 반환해야 하는 command와 actuator 상태는?",
      codeAnswer: "velocity_command=0.0, actuator_enabled=False이다.",
      debugQuestion: "세 E-stop이 모두 눌려야 멈춘다면 어떤 코드 오류인가?",
      debugAnswer: "OR가 아니라 AND를 사용한 오류다.",
      visualQuestion: "remote_estop만 1이면 pipeline 출력은?",
      visualAnswer: "STOPPED, zero command, actuator disabled가 되어야 한다.",
      robotQuestion: "E-stop에서 zero command만 보내고 actuator enable을 유지하면 위험한 이유는?",
      robotAnswer: "하위 제어기 오류나 잔류 명령으로 물리 출력이 계속될 수 있다.",
      designQuestion: "E-stop event log에 남길 정보는?",
      designAnswer: "발생 시간, 입력 source, 이전 상태, 실행한 정지 action을 남긴다.",
    }),
    wrongAnswerTags: makeWrongTags("safety_emergency_stop_pipeline", "E-stop pipeline 우선순위 오류", ["safety_fail_safe_state_machine"]),
    nextSessions: ["safety_sensor_timeout_handling", "safety_actuator_limit_saturation"],
  }),
  session({
    id: "safety_sensor_timeout_handling",
    part,
    title: "Sensor Timeout Handling",
    level: "intermediate",
    prerequisites: ["safety_watchdog_timer", "ros2_tf2_transform"],
    learningObjectives: ["센서 데이터 age를 계산한다.", "필수 센서가 stale이면 정지한다.", "message stamp와 wall time 혼동을 피한다."],
    theory: {
      definition: "Sensor Timeout Handling은 LiDAR, camera, odometry 같은 필수 센서 데이터가 너무 오래되었는지 검사하고 stale이면 로봇을 멈추는 로직이다.",
      whyItMatters: "오래된 센서 데이터로 움직이면 로봇은 이미 지나간 장애물 위치나 틀린 자기 위치를 믿고 행동한다.",
      intuition: "길 안내 지도가 10분 전 화면에서 멈췄다면 지금 길을 믿고 뛰면 안 되는 것과 같다.",
      equations: [
        makeEquation("Sensor age", "sensor_age=current_time-last_sensor_time", [["sensor_age", "센서 데이터 나이"], ["last_sensor_time", "마지막 센서 stamp"]], "현재 시간과 마지막 센서 시간을 비교한다."),
        makeEquation("Stale stop", "if sensor_age > max_age: stop_robot()", [["max_age", "허용 가능한 최대 센서 나이"]], "필수 센서가 stale이면 정지한다."),
      ],
      derivation: [
        step("센서 stamp 저장", "메시지가 들어올 때 sensor_name별 stamp를 저장한다."),
        step("age 계산", "현재 시간에서 마지막 stamp를 뺀다."),
        step("max_age 비교", "age가 max_age보다 크면 stale이다."),
        step("필수 센서 통합", "required_sensors 중 하나라도 stale이면 should_stop=True다."),
      ],
      handCalculation: {
        problem: "LiDAR stamp=20.0초, current_time=20.5초, max_age=0.3초이면?",
        given: { last_sensor_time: 20.0, current_time: 20.5, max_age: 0.3 },
        steps: ["sensor_age=20.5-20.0=0.5초", "0.5>0.3", "LiDAR stale"],
        answer: "정지한다.",
      },
      robotApplication: "자율주행 로봇은 LiDAR나 odometry가 끊기면 obstacle avoidance와 localization을 믿을 수 없으므로 속도를 0으로 만들어야 한다.",
    },
    codeLabs: [sensorTimeoutLab],
    visualizations: [
      makeVisualization("vis_sensor_timeout_handling", "Sensor Timeout Handling", "safety_sensor_timeout_handling", "sensor_age=current_time-last_sensor_time", sensorTimeoutLab.id, [
        { name: "max_age", symbol: "T_max", min: 0.05, max: 2, default: 0.3, description: "허용 센서 나이" },
        { name: "sensor_age", symbol: "T_age", min: 0, max: 3, default: 0.5, description: "현재 센서 데이터 나이" },
        { name: "required_sensor_count", symbol: "N_req", min: 1, max: 5, default: 2, description: "필수 센서 개수" },
      ], "모든 필수 센서 age가 max_age 이하이면 RUNNING이다.", "필수 센서 하나라도 max_age를 넘거나 없으면 STOPPED다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "safety_sensor_timeout_handling",
      conceptTag: "safety_sensor_timeout_handling",
      reviewSession: "Sensor Timeout Handling",
      conceptQuestion: "stale sensor란 무엇인가?",
      conceptAnswer: "마지막 데이터 시간이 너무 오래되어 현재 상태를 믿을 수 없는 센서다.",
      calculationQuestion: "current=20.5, stamp=20.0, max_age=0.3이면 stale인가?",
      calculationAnswer: "age=0.5이고 0.5>0.3이므로 stale이다.",
      codeQuestion: "필수 센서 중 하나라도 stale이면 should_stop은 무엇을 반환해야 하는가?",
      codeAnswer: "True를 반환해야 한다.",
      debugQuestion: "센서가 한 번도 안 왔는데 RUNNING이면 어떤 오류인가?",
      debugAnswer: "missing sensor를 stale로 처리하지 않은 오류다.",
      visualQuestion: "sensor_age가 max_age 선을 넘으면 상태는?",
      visualAnswer: "STOPPED로 바뀌어야 한다.",
      robotQuestion: "LiDAR가 stale인데 계속 주행하면 위험한 이유는?",
      robotAnswer: "장애물 위치를 현재로 믿을 수 없어 충돌 위험이 생긴다.",
      designQuestion: "센서별 timeout을 다르게 두는 이유는?",
      designAnswer: "카메라, LiDAR, odometry의 정상 주기와 안전 중요도가 다르기 때문이다.",
    }),
    wrongAnswerTags: makeWrongTags("safety_sensor_timeout_handling", "센서 stale 판단 오류", ["safety_watchdog_timer", "ros2_tf2_transform"]),
    nextSessions: ["safety_actuator_limit_saturation", "safety_latency_jitter_profiling"],
  }),
  session({
    id: "safety_actuator_limit_saturation",
    part,
    title: "Actuator Limit and Saturation",
    level: "intermediate",
    prerequisites: ["safety_fail_safe_state_machine", "robot_math_jacobian_velocity_kinematics"],
    learningObjectives: ["soft limit과 hard limit을 구분한다.", "명령을 안전 범위로 clipping한다.", "hard limit 초과 시 정지 조건을 구현한다."],
    theory: {
      definition: "Actuator Limit and Saturation은 속도, 토크, 전류 명령이 구동기 허용 범위를 넘지 않도록 제한하고 위험하면 정지시키는 안전 로직이다.",
      whyItMatters: "명령이 너무 크면 모터, 감속기, 사람, 로봇 구조물 모두 위험해진다.",
      intuition: "자전거 브레이크를 잡을 때 손잡이를 끝까지 당길 수 있는 범위가 있고, 그 이상 힘을 주면 장치가 망가지는 것과 같다.",
      equations: [
        makeEquation("Soft saturation", "safe_cmd=clip(raw_cmd,-soft_limit,soft_limit)", [["raw_cmd", "원래 명령"], ["soft_limit", "운전 중 허용 한계"], ["safe_cmd", "제한된 명령"]], "정상 범위 밖 명령을 안전 범위로 자른다."),
        makeEquation("Hard stop", "if abs(raw_cmd)>hard_limit: stop_robot()", [["hard_limit", "즉시 정지 한계"]], "hard limit 초과는 clipping이 아니라 정지 조건이다."),
      ],
      derivation: [
        step("raw command 입력", "제어기가 만든 원래 속도/토크 명령을 받는다."),
        step("hard limit 검사", "절댓값이 hard_limit보다 크면 stop=True다."),
        step("soft limit 적용", "hard limit 이내이면 clip으로 안전 범위에 넣는다."),
        step("saturation 기록", "명령이 잘렸는지 로그로 남긴다."),
      ],
      handCalculation: {
        problem: "raw_cmd=3.0, soft_limit=1.0, hard_limit=2.0이면?",
        given: { raw_cmd: 3.0, soft_limit: 1.0, hard_limit: 2.0 },
        steps: ["abs(3.0)=3.0", "3.0>2.0", "hard limit 초과"],
        answer: "command=0.0, stop=True",
      },
      robotApplication: "로봇팔 torque controller나 모바일 base velocity controller 앞단에 limit filter를 두어 위험 명령을 차단한다.",
    },
    codeLabs: [actuatorLimitLab],
    visualizations: [
      makeVisualization("vis_actuator_limit_saturation", "Actuator Limit and Saturation", "safety_actuator_limit_saturation", "safe_cmd=clip(raw_cmd,-soft_limit,soft_limit)", actuatorLimitLab.id, [
        { name: "raw_cmd", symbol: "u_raw", min: -4, max: 4, default: 3, description: "원래 actuator command" },
        { name: "soft_limit", symbol: "u_soft", min: 0.1, max: 3, default: 1, description: "soft saturation limit" },
        { name: "hard_limit", symbol: "u_hard", min: 0.5, max: 5, default: 2, description: "hard stop limit" },
      ], "raw_cmd가 soft_limit 안에 있으면 그대로 통과한다.", "raw_cmd가 hard_limit을 넘으면 command=0과 STOPPED로 바뀐다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "safety_actuator_limit_saturation",
      conceptTag: "safety_actuator_limit_saturation",
      reviewSession: "Actuator Limit and Saturation",
      conceptQuestion: "soft limit과 hard limit의 차이는?",
      conceptAnswer: "soft limit은 명령을 자르는 범위이고 hard limit은 즉시 정지 조건이다.",
      calculationQuestion: "raw=3, soft=1, hard=2이면 결과는?",
      calculationAnswer: "hard limit 초과라 command=0, stop=True이다.",
      codeQuestion: "Python에서 [-soft, soft]로 자르는 식은?",
      codeAnswer: "max(-soft_limit, min(soft_limit, raw_cmd))이다.",
      debugQuestion: "raw=-3인데 hard limit 검사를 통과하면 무엇이 빠졌는가?",
      debugAnswer: "abs(raw_cmd) 절댓값 검사가 빠졌다.",
      visualQuestion: "raw_cmd가 soft_limit만 넘고 hard_limit 이내이면?",
      visualAnswer: "명령은 clipping되지만 STOPPED는 아니다.",
      robotQuestion: "토크 명령 hard limit 초과를 clipping만 하면 위험한 이유는?",
      robotAnswer: "제어기나 모델이 심각하게 틀어진 신호일 수 있어 안전 정지가 필요하다.",
      designQuestion: "limit filter가 로그에 남겨야 할 값은?",
      designAnswer: "raw command, clipped command, saturation 여부, stop 여부를 남긴다.",
    }),
    wrongAnswerTags: makeWrongTags("safety_actuator_limit_saturation", "Actuator limit/saturation 판단 오류", ["safety_fail_safe_state_machine"]),
    nextSessions: ["safety_latency_jitter_profiling", "robot_dynamics_2link_lagrange"],
  }),
  session({
    id: "safety_latency_jitter_profiling",
    part,
    title: "Latency and Jitter Profiling",
    level: "intermediate",
    prerequisites: ["safety_watchdog_timer", "low_pass_filter_sensor_noise"],
    learningObjectives: ["제어 loop period와 jitter를 계산한다.", "deadline miss 횟수로 정지 조건을 만든다.", "평균보다 tail latency가 안전에 중요함을 설명한다."],
    theory: {
      definition: "Latency and Jitter Profiling은 제어 루프가 정해진 시간 안에 반복되는지 측정하고 deadline miss가 쌓이면 안전 상태로 보내는 방법이다.",
      whyItMatters: "제어 명령이 늦게 도착하면 로봇은 이미 지나간 상태를 기준으로 움직여 진동, 충돌, 불안정이 생긴다.",
      intuition: "박자에 맞춰 줄넘기를 해야 하는데 박자가 자꾸 늦어지면 넘어지는 것과 같다.",
      equations: [
        makeEquation("Loop period", "period_i=t_i-t_{i-1}", [["t_i", "현재 loop timestamp"], ["period_i", "이번 loop 주기"]], "연속 timestamp 차이로 주기를 구한다."),
        makeEquation("Jitter and stop", "jitter_i=abs(period_i-target_period), stop = deadline_misses >= max_misses", [["target_period", "목표 제어 주기"], ["deadline_misses", "deadline 초과 횟수"], ["max_misses", "허용 miss 수"]], "jitter와 deadline miss가 안전 판단으로 연결된다."),
      ],
      derivation: [
        step("timestamp 수집", "loop마다 현재 시간을 기록한다."),
        step("period 계산", "연속 timestamp 차이를 구한다."),
        step("jitter 계산", "period와 target_period 차이의 절댓값을 구한다."),
        step("deadline miss 누적", "period가 deadline보다 큰 횟수를 세고 한계를 넘으면 stop=True다."),
      ],
      handCalculation: {
        problem: "timestamps=[0.00,0.02,0.04,0.10], target=0.02, deadline=0.03, max_misses=1이면?",
        given: { timestamps: "[0.00,0.02,0.04,0.10]", target_period: 0.02, deadline: 0.03, max_misses: 1 },
        steps: ["periods=[0.02,0.02,0.06]", "0.06>0.03이므로 miss 1회", "miss 1회 >= max_misses 1회"],
        answer: "stop=True",
      },
      robotApplication: "실시간 제어 루프, perception pipeline, ROS2 executor callback에서 p95/p99 latency와 deadline miss를 기록해 안전 watchdog과 연결한다.",
    },
    codeLabs: [latencyJitterLab],
    visualizations: [
      makeVisualization("vis_latency_jitter_profiling", "Latency and Jitter Profiling", "safety_latency_jitter_profiling", "jitter=abs(period-target_period)", latencyJitterLab.id, [
        { name: "target_period", symbol: "T_target", min: 0.005, max: 0.1, default: 0.02, description: "목표 loop period" },
        { name: "deadline", symbol: "T_deadline", min: 0.01, max: 0.2, default: 0.03, description: "허용 deadline" },
        { name: "deadline_misses", symbol: "N_miss", min: 0, max: 10, default: 1, description: "deadline 초과 횟수" },
      ], "period가 deadline 아래에 머물면 RUNNING이다.", "deadline miss가 max_misses 이상 쌓이면 STOPPED로 바뀐다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "safety_latency_jitter_profiling",
      conceptTag: "safety_latency_jitter_profiling",
      reviewSession: "Latency and Jitter Profiling",
      conceptQuestion: "jitter는 무엇을 뜻하는가?",
      conceptAnswer: "실제 loop period가 목표 period에서 얼마나 흔들리는지 나타내는 값이다.",
      calculationQuestion: "period=0.06, target=0.02이면 jitter는?",
      calculationAnswer: "abs(0.06-0.02)=0.04초이다.",
      codeQuestion: "deadline miss를 세는 조건은?",
      codeAnswer: "period > deadline인 period 개수를 센다.",
      debugQuestion: "평균 period만 정상인데 가끔 큰 spike로 충돌한다면 무엇을 놓쳤는가?",
      debugAnswer: "tail latency와 deadline miss를 놓쳤다.",
      visualQuestion: "deadline_misses가 max_misses에 도달하면 상태는?",
      visualAnswer: "STOPPED로 바뀌어야 한다.",
      robotQuestion: "제어 루프가 늦으면 로봇이 흔들리는 이유는?",
      robotAnswer: "이미 지난 상태를 기준으로 늦은 명령을 보내기 때문이다.",
      designQuestion: "profiling dashboard에 표시할 안전 지표는?",
      designAnswer: "mean, p95, p99 latency, max jitter, deadline miss count, stop event를 표시한다.",
    }),
    wrongAnswerTags: makeWrongTags("safety_latency_jitter_profiling", "Latency/jitter deadline 판단 오류", ["safety_watchdog_timer"]),
    nextSessions: ["integration_mobile_robot_safety_project", "robot_system_debugging"],
  }),
];
