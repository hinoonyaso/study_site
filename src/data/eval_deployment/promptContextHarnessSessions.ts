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

export const promptContextHarnessFeatureAudit = [
  {
    feature: "프롬프트 템플릿",
    evidenceSessionIds: ["prompt_template_role_goal_constraint_schema"],
    evidenceLabIds: ["lab_prompt_template_role_goal_constraint_schema"],
    evaluates: ["template completeness", "required field validation"],
    logs: ["prompt_version", "template_hash"],
  },
  {
    feature: "역할/목표/제약/출력형식",
    evidenceSessionIds: ["prompt_template_role_goal_constraint_schema"],
    evidenceLabIds: ["lab_prompt_template_role_goal_constraint_schema"],
    evaluates: ["role/goal/constraint/output_schema coverage"],
    logs: ["missing_sections", "schema_name"],
  },
  {
    feature: "few-shot",
    evidenceSessionIds: ["few_shot_hallucination_guardrails"],
    evidenceLabIds: ["lab_few_shot_hallucination_guardrails"],
    evaluates: ["example relevance", "negative example rejection"],
    logs: ["few_shot_count", "selected_example_ids"],
  },
  {
    feature: "JSON/YAML 출력 강제",
    evidenceSessionIds: ["prompt_template_role_goal_constraint_schema"],
    evidenceLabIds: ["lab_prompt_template_role_goal_constraint_schema"],
    evaluates: ["parse_ok", "schema_ok"],
    logs: ["parser_error", "output_format"],
  },
  {
    feature: "hallucination 줄이기",
    evidenceSessionIds: ["few_shot_hallucination_guardrails", "retrieval_grounding_citation_checks"],
    evidenceLabIds: ["lab_few_shot_hallucination_guardrails", "lab_retrieval_grounding_citation_checks"],
    evaluates: ["no_evidence_fallback", "unsupported_claim_count"],
    logs: ["grounding_status", "fallback_reason"],
  },
  {
    feature: "context window / chunking",
    evidenceSessionIds: ["context_window_chunking_budgeting"],
    evidenceLabIds: ["lab_context_window_chunking_budgeting"],
    evaluates: ["budget_ok", "dropped_chunk_count"],
    logs: ["context_tokens", "chunk_ids"],
  },
  {
    feature: "retrieval / grounding",
    evidenceSessionIds: ["retrieval_grounding_citation_checks"],
    evidenceLabIds: ["lab_retrieval_grounding_citation_checks"],
    evaluates: ["top_k_hit", "citation_coverage"],
    logs: ["retrieved_chunk_ids", "grounded_claims"],
  },
  {
    feature: "evaluation harness",
    evidenceSessionIds: ["evaluation_harness_golden_regression"],
    evidenceLabIds: ["lab_evaluation_harness_golden_regression"],
    evaluates: ["pass_rate", "failure_taxonomy"],
    logs: ["eval_run_id", "case_results"],
  },
  {
    feature: "golden output 비교",
    evidenceSessionIds: ["evaluation_harness_golden_regression"],
    evidenceLabIds: ["lab_evaluation_harness_golden_regression"],
    evaluates: ["golden_match", "rubric_ok"],
    logs: ["golden_id", "diff_summary"],
  },
  {
    feature: "latency logging / tracing",
    evidenceSessionIds: ["latency_tracing_failure_taxonomy"],
    evidenceLabIds: ["lab_latency_tracing_failure_taxonomy"],
    evaluates: ["deadline_ok", "bottleneck_stage"],
    logs: ["trace_id", "retrieval_ms", "model_ms", "parse_ms", "total_ms"],
  },
] as const;

const promptTemplateSession = makeAdvancedSession({
  id: "prompt_template_role_goal_constraint_schema",
  part: "Part 10. 프롬프트/컨텍스트/하네스 엔지니어링",
  title: "프롬프트 템플릿: 역할·목표·제약·JSON/YAML 출력 계약",
  level: "beginner",
  difficulty: "medium",
  estimatedMinutes: 75,
  prerequisites: ["robot_foundation_model_deployment"],
  objectives: [
    "role, goal, constraints, output_format을 분리한 prompt template을 작성한다.",
    "JSON/YAML 출력 계약을 코드로 검증한다.",
    "prompt_version, template_hash, schema_ok를 로그로 남긴다.",
  ],
  definition:
    "프롬프트 템플릿은 모델에게 줄 지시를 role, goal, constraints, context, output_format으로 분리해 재사용 가능하고 평가 가능한 입력 계약으로 만든 것이다.",
  whyItMatters:
    "로봇/AI agent에서 프롬프트가 자유문장으로 흩어지면 출력이 매번 달라지고 평가가 어렵다. 템플릿과 출력 schema가 있어야 하네스가 parse, 채점, 회귀 비교를 할 수 있다.",
  intuition:
    "프롬프트는 부탁이 아니라 API 계약이다. 역할은 실행 주체, 목표는 해야 할 일, 제약은 하지 말아야 할 일, 출력형식은 다음 프로그램이 읽을 포맷이다.",
  equations: [
    {
      label: "Prompt contract",
      expression: "P=R+G+C+O",
      terms: [["R", "role"], ["G", "goal"], ["C", "constraints"], ["O", "output format/schema"]],
      explanation: "프롬프트를 평가 가능한 네 블록으로 나눈다.",
    },
    {
      label: "Schema pass",
      expression: "schema\\_ok=keys(y)\\supseteq keys(S)\\land type(y_i)=type(S_i)",
      terms: [["y", "model output"], ["S", "required schema"]],
      explanation: "필수 키와 타입이 맞아야 downstream parser가 안전하게 처리한다.",
    },
    {
      label: "Template hash",
      expression: "h=hash(P_{template})",
      terms: [["h", "prompt version 추적 hash"]],
      explanation: "프롬프트 변경을 eval 결과와 연결하기 위한 로그 키다.",
    },
  ],
  derivation: [
    ["role", "모델이 맡을 전문 역할과 한계를 한 문단으로 고정한다.", "R"],
    ["goal", "이번 호출에서 달성해야 하는 관측 가능한 결과를 쓴다.", "G"],
    ["constraints", "금지 행동, 안전 조건, 근거 요구를 분리한다.", "C"],
    ["output", "JSON/YAML key와 type을 고정하고 parser로 검증한다.", "O"],
  ],
  handCalculation: {
    problem: "필수 블록 4개 중 role, goal, output만 있으면 template completeness는?",
    given: { present: 3, required: 4 },
    steps: ["completeness=3/4", "constraints가 빠져 unsafe action 금지가 누락됨"],
    answer: "0.75이며 release gate에서는 실패로 둔다.",
  },
  robotApplication:
    "VLA가 ROS 2 action goal을 만들 때 target, action, confidence, safety_note 같은 필드를 JSON으로 강제해야 planner나 safety gate가 읽을 수 있다.",
  lab: {
    id: "lab_prompt_template_role_goal_constraint_schema",
    title: "Prompt Template and JSON/YAML Schema Validator",
    language: "python",
    theoryConnection: "P=role+goal+constraints+output_format, schema_ok validates JSON/YAML contract",
    starterCode: `import hashlib
import json

REQUIRED_BLOCKS = ["role", "goal", "constraints", "output_format"]

def render_prompt(template):
    # TODO: REQUIRED_BLOCKS가 모두 있는지 검사하고 prompt 문자열을 만들어라.
    raise NotImplementedError

def schema_ok(output):
    # TODO: action, target, confidence, safety_note JSON 계약을 검사하라.
    raise NotImplementedError

def prompt_log(template, output):
    # TODO: prompt_version/template_hash/schema_ok 로그 dict를 반환하라.
    raise NotImplementedError

if __name__ == "__main__":
    template = {
        "version": "prompt-v1",
        "role": "robot planning assistant",
        "goal": "choose a safe pick action",
        "constraints": ["use only visible objects", "stop if confidence is low"],
        "output_format": "JSON action,target,confidence,safety_note",
    }
    output = {"action": "pick", "target": "red_cube", "confidence": 0.82, "safety_note": "clear"}
    print(render_prompt(template).split("\\n")[0])
    print(prompt_log(template, output)["schema_ok"])`,
    solutionCode: `import hashlib
import json

REQUIRED_BLOCKS = ["role", "goal", "constraints", "output_format"]

def render_prompt(template):
    missing = [key for key in REQUIRED_BLOCKS if key not in template or not template[key]]
    if missing:
        raise ValueError(f"missing prompt blocks: {missing}")
    constraints = "\\n".join(f"- {item}" for item in template["constraints"])
    return (
        f"ROLE: {template['role']}\\n"
        f"GOAL: {template['goal']}\\n"
        f"CONSTRAINTS:\\n{constraints}\\n"
        f"OUTPUT_FORMAT: {template['output_format']}"
    )

def schema_ok(output):
    return (
        isinstance(output, dict)
        and output.get("action") in {"pick", "place", "stop"}
        and isinstance(output.get("target"), str)
        and isinstance(output.get("confidence"), (int, float))
        and 0.0 <= output["confidence"] <= 1.0
        and isinstance(output.get("safety_note"), str)
    )

def prompt_log(template, output):
    prompt = render_prompt(template)
    return {
        "prompt_version": template.get("version", "unknown"),
        "template_hash": hashlib.sha256(prompt.encode("utf-8")).hexdigest()[:12],
        "output_format": "json",
        "schema_ok": schema_ok(output),
    }

if __name__ == "__main__":
    template = {
        "version": "prompt-v1",
        "role": "robot planning assistant",
        "goal": "choose a safe pick action",
        "constraints": ["use only visible objects", "stop if confidence is low"],
        "output_format": "JSON action,target,confidence,safety_note",
    }
    output = {"action": "pick", "target": "red_cube", "confidence": 0.82, "safety_note": "clear"}
    print(render_prompt(template).split("\\n")[0])
    print(prompt_log(template, output)["schema_ok"])`,
    testCode: `from prompt_template_role_goal_constraint_schema import render_prompt, schema_ok, prompt_log

def test_missing_block_rejected():
    try:
        render_prompt({"role": "r", "goal": "g", "output_format": "json"})
        assert False
    except ValueError as exc:
        assert "constraints" in str(exc)

def test_schema_ok_requires_safety_note():
    assert schema_ok({"action": "stop", "target": "none", "confidence": 1.0, "safety_note": "low confidence"})
    assert not schema_ok({"action": "throw", "target": "cube", "confidence": 0.9, "safety_note": "bad"})

def test_prompt_log_has_version_hash_schema():
    template = {"version": "v1", "role": "r", "goal": "g", "constraints": ["c"], "output_format": "json"}
    log = prompt_log(template, {"action": "stop", "target": "none", "confidence": 0.9, "safety_note": "safe"})
    assert log["prompt_version"] == "v1" and len(log["template_hash"]) == 12 and log["schema_ok"]`,
    expectedOutput: "ROLE: robot planning assistant\nTrue",
    runCommand: "python prompt_template_role_goal_constraint_schema.py && pytest test_prompt_template_role_goal_constraint_schema.py",
    commonBugs: [
      "프롬프트에 출력 예시만 쓰고 parser/schema validation을 하지 않음",
      "role과 goal을 섞어 재사용 시 목적이 바뀌는 것을 놓침",
      "prompt version과 template hash를 로그에 남기지 않아 회귀 원인을 추적하지 못함",
    ],
    extensionTask: "같은 계약을 YAML 출력 문자열로도 만들고 json/yaml parser 결과를 같은 schema_ok로 검증하라.",
  },
  visualization: {
    id: "vis_prompt_template_contract_blocks",
    title: "Prompt Template Contract Blocks",
    equation: "P=R+G+C+O",
    parameters: [
      param("block_count", "n_b", 1, 4, 4, "role/goal/constraints/output_format 중 포함된 블록 수"),
      param("schema_fields", "n_s", 1, 8, 4, "검증하는 출력 schema 필드 수"),
      param("prompt_versions", "v", 1, 20, 3, "관리하는 prompt version 수"),
    ],
    normalCase: "모든 블록과 schema field가 있고 prompt_version/template_hash가 로그로 남는다.",
    failureCase: "출력형식이나 제약 블록이 빠지면 parser 실패 또는 unsafe action이 downstream으로 흘러간다.",
  },
  quiz: {
    id: "prompt_template_contract",
    conceptQuestion: "프롬프트 템플릿에서 role, goal, constraints, output_format을 분리하는 이유는?",
    conceptAnswer: "각 블록의 책임을 분명히 해 재사용, schema validation, 회귀 평가, 실패 원인 추적이 가능하게 하기 위해서다.",
    calculationQuestion: "필수 블록 4개 중 3개만 있으면 completeness는?",
    calculationAnswer: "3/4=0.75다. 안전 제약이 빠졌다면 release gate에서는 실패다.",
    codeQuestion: "Python dict가 필수 key를 모두 포함하는지 확인하는 표현은?",
    codeAnswer: "required.issubset(output)",
    debugQuestion: "JSON parse는 되는데 downstream action node가 실패하면 무엇을 확인하는가?",
    debugAnswer: "필드 이름, 타입, action enum, confidence 범위, prompt version과 schema version 일치를 확인한다.",
    visualQuestion: "block_count가 4보다 작으면 어떤 위험이 커지는가?",
    visualAnswer: "역할, 목표, 제약, 출력형식 중 하나가 빠져 model output이 평가 불가능하거나 unsafe해진다.",
    robotQuestion: "로봇 action JSON에 safety_note를 넣는 이유는?",
    robotAnswer: "낮은 confidence, 근거 부족, collision 가능성 같은 safety gate 판단 근거를 downstream에 넘기기 위해서다.",
    designQuestion: "프롬프트 템플릿 release checklist는?",
    designAnswer: "role/goal/constraints/output_format, schema parser, prompt_version, template_hash, golden eval baseline, rollback prompt를 포함한다.",
  },
  wrongTagLabel: "프롬프트 템플릿/schema 계약 누락",
  nextSessions: ["few_shot_hallucination_guardrails", "context_window_chunking_budgeting"],
});

const fewShotSession = makeAdvancedSession({
  id: "few_shot_hallucination_guardrails",
  part: "Part 10. 프롬프트/컨텍스트/하네스 엔지니어링",
  title: "Few-shot과 Hallucination Guardrail: 근거 없으면 멈추기",
  level: "intermediate",
  difficulty: "medium",
  estimatedMinutes: 80,
  prerequisites: ["prompt_template_role_goal_constraint_schema"],
  objectives: [
    "positive/negative few-shot 예시를 prompt에 넣는 기준을 설명한다.",
    "근거 없는 주장과 금지 action을 no-evidence fallback으로 막는다.",
    "selected_example_ids와 fallback_reason을 trace에 기록한다.",
  ],
  definition:
    "Few-shot prompting은 원하는 입력/출력 패턴을 몇 개의 예시로 보여주는 방법이고, hallucination guardrail은 근거가 없거나 금지된 출력일 때 답을 만들지 않는 정책이다.",
  whyItMatters:
    "로봇 agent는 그럴듯한 거짓말보다 보수적인 stop이 낫다. few-shot은 형식을 안정화하고 negative example은 unsafe action을 줄인다.",
  intuition:
    "예시는 모델에게 훈련용 문제집을 한 장 보여주는 것이다. 하지만 문제집에 없는 물체를 봤다고 우기면 안 되므로 no-evidence 규칙이 필요하다.",
  equations: [
    {
      label: "Example coverage",
      expression: "coverage=|E_{matched}|/|E_{needed}|",
      terms: [["E_matched", "현재 task와 맞는 예시"], ["E_needed", "필요 예시 유형"]],
      explanation: "관련 있는 예시가 많을수록 형식 안정성이 좋아진다.",
    },
    {
      label: "Unsupported claim gate",
      expression: "unsupported\\_claims>0\\Rightarrow fallback",
      terms: [["unsupported_claims", "근거 없는 주장 수"]],
      explanation: "근거 없는 object/action은 실행하지 않는다.",
    },
    {
      label: "Negative shot rule",
      expression: "x\\in unsafe\\_pattern\\Rightarrow y=stop",
      terms: [["unsafe_pattern", "금지 상황 예시"]],
      explanation: "실패 예시를 보여줘 unsafe action을 stop으로 매핑한다.",
    },
  ],
  derivation: [
    ["positive shots", "정상 입력과 원하는 JSON 출력을 1~3개 넣는다.", "E+"],
    ["negative shots", "근거 없는 object, 낮은 confidence, 충돌 위험 예시를 stop으로 둔다.", "E-"],
    ["guard", "출력 target이 evidence 안에 없으면 fallback한다.", "target in evidence"],
    ["trace", "선택된 예시와 fallback 이유를 로그로 저장한다.", "selected_example_ids"],
  ],
  handCalculation: {
    problem: "필요 예시 유형 4개 중 positive 2개, negative 1개가 있으면 coverage는?",
    given: { matched: 3, needed: 4 },
    steps: ["coverage=3/4", "missing type은 별도 eval case로 실패 가능성을 확인"],
    answer: "coverage=0.75다.",
  },
  robotApplication:
    "pick/place agent가 보이지 않는 blue cube를 집으라고 하면 few-shot negative example과 guardrail이 stop/no_evidence를 출력해야 한다.",
  lab: {
    id: "lab_few_shot_hallucination_guardrails",
    title: "Few-shot Selector and No-evidence Fallback",
    language: "python",
    theoryConnection: "unsupported_claims>0 => fallback, trace selected_example_ids",
    starterCode: `EXAMPLES = [
    {"id": "pos_pick_visible", "tags": {"pick", "visible"}, "output": {"action": "pick"}},
    {"id": "neg_missing_object", "tags": {"pick", "missing"}, "output": {"action": "stop"}},
    {"id": "neg_low_confidence", "tags": {"low_confidence"}, "output": {"action": "stop"}},
]

def select_examples(task_tags, k=2):
    # TODO: tag overlap이 큰 example id k개를 반환하라.
    raise NotImplementedError

def guard_output(output, evidence_targets):
    # TODO: target이 evidence에 없으면 stop/no_evidence로 바꾸어라.
    raise NotImplementedError

if __name__ == "__main__":
    print(select_examples({"pick", "missing"}, 2))
    print(guard_output({"action": "pick", "target": "blue_cube"}, {"red_cube"}))`,
    solutionCode: `EXAMPLES = [
    {"id": "pos_pick_visible", "tags": {"pick", "visible"}, "output": {"action": "pick"}},
    {"id": "neg_missing_object", "tags": {"pick", "missing"}, "output": {"action": "stop"}},
    {"id": "neg_low_confidence", "tags": {"low_confidence"}, "output": {"action": "stop"}},
]

def select_examples(task_tags, k=2):
    ranked = sorted(
        EXAMPLES,
        key=lambda item: (-len(item["tags"] & set(task_tags)), item["id"]),
    )
    return [item["id"] for item in ranked[:k]]

def guard_output(output, evidence_targets):
    if output.get("action") != "stop" and output.get("target") not in evidence_targets:
        return {"action": "stop", "target": "none", "confidence": 0.0, "fallback_reason": "no_evidence"}
    return {**output, "fallback_reason": "none"}

if __name__ == "__main__":
    print(select_examples({"pick", "missing"}, 2))
    print(guard_output({"action": "pick", "target": "blue_cube"}, {"red_cube"}))`,
    testCode: `from few_shot_hallucination_guardrails import select_examples, guard_output

def test_select_negative_example_for_missing_object():
    ids = select_examples({"pick", "missing"}, 2)
    assert "neg_missing_object" in ids

def test_guard_blocks_target_without_evidence():
    out = guard_output({"action": "pick", "target": "blue_cube"}, {"red_cube"})
    assert out["action"] == "stop" and out["fallback_reason"] == "no_evidence"

def test_guard_allows_grounded_target():
    out = guard_output({"action": "pick", "target": "red_cube"}, {"red_cube"})
    assert out["action"] == "pick" and out["fallback_reason"] == "none"`,
    expectedOutput: "['neg_missing_object', 'pos_pick_visible']\n{'action': 'stop', 'target': 'none', 'confidence': 0.0, 'fallback_reason': 'no_evidence'}",
    runCommand: "python few_shot_hallucination_guardrails.py && pytest test_few_shot_hallucination_guardrails.py",
    commonBugs: [
      "positive example만 넣고 실패/금지 예시를 넣지 않음",
      "target이 retrieved evidence에 없어도 모델 출력만 믿음",
      "selected example id를 trace에 남기지 않아 프롬프트 회귀 원인을 못 찾음",
    ],
    extensionTask: "few-shot 후보 20개에서 task tag와 embedding score를 함께 써서 top-k를 고르고 pass rate 변화를 기록하라.",
  },
  visualization: {
    id: "vis_few_shot_hallucination_guardrail",
    title: "Few-shot Coverage and Hallucination Guardrail",
    equation: "unsupported_claims>0 => fallback",
    parameters: [
      param("few_shot_count", "k", 0, 8, 3, "prompt에 넣는 few-shot example 수"),
      param("negative_example_ratio", "r_-", 0, 1, 0.35, "unsafe/negative example 비율"),
      param("evidence_threshold", "\\tau_e", 0, 1, 0.75, "target evidence 인정 threshold"),
    ],
    normalCase: "positive/negative example이 균형 있고 evidence 없는 target은 stop으로 바뀐다.",
    failureCase: "예시가 과하거나 negative shot이 없어 hallucinated action이 schema를 통과한다.",
  },
  quiz: {
    id: "few_shot_guardrail",
    conceptQuestion: "few-shot에 negative example을 넣는 이유는?",
    conceptAnswer: "모델이 실패/금지 상황에서 무리하게 답을 만들지 않고 stop/no-evidence로 가는 패턴을 배우게 하기 위해서다.",
    calculationQuestion: "필요 예시 5개 중 4개 유형을 덮으면 coverage는?",
    calculationAnswer: "4/5=0.8이다.",
    codeQuestion: "target이 evidence_targets에 없을 때 확인할 Python 조건은?",
    codeAnswer: "output.get(\"target\") not in evidence_targets",
    debugQuestion: "모델이 없는 물체를 집으라고 하면 무엇을 확인하는가?",
    debugAnswer: "retrieved evidence, negative few-shot, guard_output, fallback_reason 로그를 확인한다.",
    visualQuestion: "negative_example_ratio가 0이면 어떤 위험이 커지는가?",
    visualAnswer: "실패 상황의 stop 패턴이 약해져 hallucinated action이 늘 수 있다.",
    robotQuestion: "근거 없는 target action을 로봇에 보내면 어떤 문제가 생기는가?",
    robotAnswer: "빈 공간이나 잘못된 물체를 향해 움직여 충돌, grasp 실패, 작업 중단으로 이어진다.",
    designQuestion: "few-shot 운영 로그에 넣을 항목은?",
    designAnswer: "prompt_version, selected_example_ids, positive/negative ratio, evidence target set, fallback_reason, eval case id를 넣는다.",
  },
  wrongTagLabel: "few-shot/hallucination guardrail 누락",
  nextSessions: ["context_window_chunking_budgeting"],
});

const chunkingSession = makeAdvancedSession({
  id: "context_window_chunking_budgeting",
  part: "Part 10. 프롬프트/컨텍스트/하네스 엔지니어링",
  title: "Context Window와 Chunking: 토큰 예산 안에 근거 넣기",
  level: "intermediate",
  difficulty: "medium",
  estimatedMinutes: 80,
  prerequisites: ["prompt_template_role_goal_constraint_schema"],
  objectives: [
    "system/history/retrieval/output token budget을 분리한다.",
    "chunk size와 overlap이 retrieval 품질과 latency에 주는 trade-off를 계산한다.",
    "context_tokens, chunk_ids, dropped_chunk_count를 로그로 남긴다.",
  ],
  definition:
    "Context engineering은 제한된 context window 안에 system prompt, user query, history, retrieved chunks, output budget을 배치하는 설계다. Chunking은 긴 문서를 검색 가능한 작은 단위로 자르는 과정이다.",
  whyItMatters:
    "근거 문서를 무작정 많이 넣으면 중요한 지시가 밀리거나 latency가 늘어난다. 너무 작게 자르면 의미가 끊기고 retrieval grounding이 약해진다.",
  intuition:
    "context window는 작업대 크기다. 부품을 너무 크게 올리면 필요한 도구가 밀리고, 너무 잘게 자르면 어느 부품인지 모른다.",
  equations: [
    {
      label: "Context budget",
      expression: "N_{ctx}=N_s+N_h+N_r+N_o",
      terms: [["N_s", "system tokens"], ["N_h", "history tokens"], ["N_r", "retrieved tokens"], ["N_o", "output budget"]],
      explanation: "전체 token budget을 네 영역으로 나눈다.",
    },
    {
      label: "Max chunks",
      expression: "k_{max}=\\lfloor (N_{ctx}-N_s-N_h-N_o)/N_c \\rfloor",
      terms: [["N_c", "chunk token size"]],
      explanation: "retrieval budget 안에 들어가는 최대 chunk 수다.",
    },
    {
      label: "Chunk overlap",
      expression: "stride=N_c-N_{overlap}",
      terms: [["stride", "다음 chunk 시작 간격"]],
      explanation: "overlap이 커지면 문맥 보존은 좋아지지만 chunk 수와 latency가 늘어난다.",
    },
  ],
  derivation: [
    ["reserve", "system/history/output budget을 먼저 예약한다.", "N_s+N_h+N_o"],
    ["chunk", "문서를 chunk_size와 overlap으로 나눈다.", "stride=N_c-N_overlap"],
    ["fit", "retrieval budget에 맞게 top-k를 제한한다.", "k<=k_max"],
    ["log", "사용 chunk와 탈락 chunk를 trace에 남긴다.", "chunk_ids"],
  ],
  handCalculation: {
    problem: "context 8000, system 1000, history 1000, output 1000, chunk 500이면 k_max는?",
    given: { ctx: 8000, system: 1000, history: 1000, output: 1000, chunk: 500 },
    steps: ["retrieval budget=8000-1000-1000-1000=5000", "k_max=floor(5000/500)=10"],
    answer: "최대 10 chunks다.",
  },
  robotApplication:
    "ROS 2 launch, robot safety policy, task instruction 문서를 검색해 agent context에 넣을 때 budget을 넘기면 중요한 safety constraint가 빠질 수 있다.",
  lab: {
    id: "lab_context_window_chunking_budgeting",
    title: "Context Window Budget and Chunk Planner",
    language: "python",
    theoryConnection: "k_max=floor((Nctx-Ns-Nh-No)/chunk_tokens)",
    starterCode: `def chunk_text(words, chunk_size, overlap):
    # TODO: words list를 overlap 있는 chunk list로 나누어라.
    raise NotImplementedError

def context_plan(ctx_tokens, system_tokens, history_tokens, output_tokens, chunk_tokens, requested_top_k):
    # TODO: max top-k, selected count, dropped count를 계산하라.
    raise NotImplementedError

if __name__ == "__main__":
    words = "a b c d e f g h i j".split()
    print(chunk_text(words, 4, 1))
    print(context_plan(8000, 1000, 1000, 1000, 500, 12))`,
    solutionCode: `def chunk_text(words, chunk_size, overlap):
    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")
    chunks = []
    step = chunk_size - overlap
    for start in range(0, len(words), step):
        chunk = words[start:start + chunk_size]
        if chunk:
            chunks.append(chunk)
        if start + chunk_size >= len(words):
            break
    return chunks

def context_plan(ctx_tokens, system_tokens, history_tokens, output_tokens, chunk_tokens, requested_top_k):
    retrieval_budget = ctx_tokens - system_tokens - history_tokens - output_tokens
    max_k = max(0, retrieval_budget // chunk_tokens)
    selected = min(requested_top_k, max_k)
    return {
        "retrieval_budget": retrieval_budget,
        "max_top_k": max_k,
        "selected_top_k": selected,
        "dropped_chunk_count": max(0, requested_top_k - selected),
        "budget_ok": selected == requested_top_k,
    }

if __name__ == "__main__":
    words = "a b c d e f g h i j".split()
    print(chunk_text(words, 4, 1))
    print(context_plan(8000, 1000, 1000, 1000, 500, 12))`,
    testCode: `from context_window_chunking_budgeting import chunk_text, context_plan

def test_chunk_overlap():
    assert chunk_text("a b c d e f".split(), 3, 1) == [["a", "b", "c"], ["c", "d", "e"], ["e", "f"]]

def test_context_plan_drops_over_budget():
    plan = context_plan(8000, 1000, 1000, 1000, 500, 12)
    assert plan["max_top_k"] == 10 and plan["selected_top_k"] == 10 and plan["dropped_chunk_count"] == 2

def test_context_plan_ok_when_within_budget():
    assert context_plan(4000, 500, 500, 500, 500, 4)["budget_ok"]`,
    expectedOutput: "[['a', 'b', 'c', 'd'], ['d', 'e', 'f', 'g'], ['g', 'h', 'i', 'j']]\n{'retrieval_budget': 5000, 'max_top_k': 10, 'selected_top_k': 10, 'dropped_chunk_count': 2, 'budget_ok': False}",
    runCommand: "python context_window_chunking_budgeting.py && pytest test_context_window_chunking_budgeting.py",
    commonBugs: [
      "output token budget을 예약하지 않아 답변이 잘림",
      "overlap을 chunk_size 이상으로 둬 무한 루프가 생김",
      "top-k를 budget보다 크게 잡고 system safety instruction이 밀리는 것을 놓침",
    ],
    extensionTask: "chunk_size/overlap/top_k sweep으로 recall proxy와 latency proxy를 표로 만들라.",
  },
  visualization: {
    id: "vis_context_window_chunk_budget",
    title: "Context Window Chunk Budget",
    equation: "kmax=floor((Nctx-Ns-Nh-No)/Nc)",
    parameters: [
      param("context_window", "N_{ctx}", 2000, 32000, 8000, "전체 context window tokens"),
      param("chunk_size", "N_c", 100, 2000, 500, "chunk token size"),
      param("retrieval_top_k", "k", 1, 20, 8, "요청 retrieval top-k"),
    ],
    normalCase: "system/history/output 예산을 보존하고 selected chunks가 retrieval budget 안에 들어간다.",
    failureCase: "top-k 또는 chunk size가 커서 safety instruction이나 output budget이 밀린다.",
  },
  quiz: {
    id: "context_chunking_budget",
    conceptQuestion: "context window budget을 system/history/retrieval/output으로 나누는 이유는?",
    conceptAnswer: "검색 문서를 많이 넣어도 시스템 지시와 출력 예산이 밀리지 않게 하기 위해서다.",
    calculationQuestion: "retrieval budget 3000 tokens, chunk 400 tokens이면 최대 chunk 수는?",
    calculationAnswer: "floor(3000/400)=7개다.",
    codeQuestion: "chunk overlap이 chunk_size보다 크거나 같으면 왜 막아야 하는가?",
    codeAnswer: "stride가 0 이하가 되어 chunking이 진행되지 않거나 무한 루프가 생기기 때문이다.",
    debugQuestion: "답변이 중간에 잘리면 무엇을 확인하는가?",
    debugAnswer: "output_tokens 예약량, retrieved top-k, chunk size, history 압축 여부를 확인한다.",
    visualQuestion: "chunk_size를 키우면 어떤 trade-off가 생기는가?",
    visualAnswer: "문맥은 풍부해지지만 들어갈 chunk 수가 줄고 latency와 token cost가 늘어난다.",
    robotQuestion: "safety policy chunk가 budget에서 탈락하면 어떤 위험이 생기는가?",
    robotAnswer: "agent가 금지 action이나 collision 조건을 모른 채 계획을 생성할 수 있다.",
    designQuestion: "context assembly 로그에 들어갈 항목은?",
    designAnswer: "context_tokens, system/history/retrieval/output token 수, selected chunk ids, dropped chunk count, compression 여부를 넣는다.",
  },
  wrongTagLabel: "context window/chunking budget 오류",
  nextSessions: ["retrieval_grounding_citation_checks"],
});

const retrievalSession = makeAdvancedSession({
  id: "retrieval_grounding_citation_checks",
  part: "Part 10. 프롬프트/컨텍스트/하네스 엔지니어링",
  title: "Retrieval과 Grounding: 근거 Chunk ID로 답변 검증하기",
  level: "intermediate",
  difficulty: "medium",
  estimatedMinutes: 85,
  prerequisites: ["context_window_chunking_budgeting"],
  objectives: [
    "간단한 retrieval score로 top-k chunk를 고른다.",
    "답변의 claim이 retrieved evidence에 포함되는지 검사한다.",
    "retrieved_chunk_ids, grounded_claims, unsupported_claim_count를 trace에 기록한다.",
  ],
  definition:
    "Retrieval grounding은 외부 문서에서 관련 chunk를 검색하고, 모델 답변이 그 chunk의 근거로 설명 가능한지 검사하는 절차다.",
  whyItMatters:
    "프롬프트만으로는 모델이 없는 정보를 만들 수 있다. grounding check가 있어야 문서 기반 로봇 명령, 파라미터 추천, 안전 판단을 검증할 수 있다.",
  intuition:
    "답변마다 영수증이 붙어야 한다. 영수증 없는 물건은 장바구니에서 빼는 것처럼, 근거 없는 claim은 fallback한다.",
  equations: [
    {
      label: "Retrieval score",
      expression: "score(q,c)=|tokens(q)\\cap tokens(c)|",
      terms: [["q", "query"], ["c", "chunk"]],
      explanation: "간단한 token overlap으로 retrieval 흐름을 검산한다.",
    },
    {
      label: "Citation coverage",
      expression: "coverage=claims_{grounded}/claims_{total}",
      terms: [["claims_grounded", "근거가 있는 주장 수"]],
      explanation: "답변 주장 중 몇 개가 retrieved evidence로 뒷받침되는지 본다.",
    },
    {
      label: "Grounding gate",
      expression: "coverage<\\tau_g\\Rightarrow fallback",
      terms: [["tau_g", "grounding threshold"]],
      explanation: "근거 부족 답변은 release gate에서 실패한다.",
    },
  ],
  derivation: [
    ["index", "chunk id와 text를 보존한다.", "chunk_id"],
    ["retrieve", "query와 chunk token overlap 또는 embedding score로 top-k를 고른다.", "topk(score)"],
    ["ground", "답변 claim의 핵심 token이 retrieved text 안에 있는지 검사한다.", "claim subset evidence"],
    ["trace", "retrieved ids와 unsupported claim을 저장한다.", "trace"],
  ],
  handCalculation: {
    problem: "claim 5개 중 4개가 retrieved evidence로 뒷받침되면 coverage는?",
    given: { grounded: 4, total: 5 },
    steps: ["coverage=4/5", "threshold 0.9이면 실패"],
    answer: "0.8이다.",
  },
  robotApplication:
    "ROS 2 QoS, joint limit, safety policy 같은 운영 지식을 agent가 답할 때 retrieved chunk id와 citation coverage를 기록해야 근거 없는 명령을 막을 수 있다.",
  lab: {
    id: "lab_retrieval_grounding_citation_checks",
    title: "Retrieval Top-k and Grounding Checker",
    language: "python",
    theoryConnection: "coverage=grounded_claims/total_claims, fallback if coverage<threshold",
    starterCode: `DOCS = [
    {"id": "safety_stop", "text": "If confidence is low, action must be stop."},
    {"id": "visible_pick", "text": "Only visible objects may be picked."},
    {"id": "latency_gate", "text": "Do not publish stale actions after deadline."},
]

def retrieve(query, k=2):
    # TODO: token overlap score로 top-k doc id를 반환하라.
    raise NotImplementedError

def grounding_report(claims, retrieved_ids):
    # TODO: 각 claim이 retrieved text에 포함되는지 보고서를 만들어라.
    raise NotImplementedError

if __name__ == "__main__":
    ids = retrieve("low confidence stop action", 2)
    print(ids)
    print(grounding_report(["confidence low stop", "blue cube exists"], ids))`,
    solutionCode: `DOCS = [
    {"id": "safety_stop", "text": "If confidence is low, action must be stop."},
    {"id": "visible_pick", "text": "Only visible objects may be picked."},
    {"id": "latency_gate", "text": "Do not publish stale actions after deadline."},
]

def tokens(text):
    return {part.strip(".,:;!?").lower() for part in text.split()}

def retrieve(query, k=2):
    q = tokens(query)
    ranked = sorted(DOCS, key=lambda doc: (-len(q & tokens(doc["text"])), doc["id"]))
    return [doc["id"] for doc in ranked[:k]]

def grounding_report(claims, retrieved_ids):
    evidence = " ".join(doc["text"].lower() for doc in DOCS if doc["id"] in retrieved_ids)
    rows = []
    for claim in claims:
        claim_tokens = tokens(claim)
        grounded = len(claim_tokens & tokens(evidence)) >= max(1, len(claim_tokens) // 2)
        rows.append({"claim": claim, "grounded": grounded})
    grounded_count = sum(1 for row in rows if row["grounded"])
    return {
        "retrieved_chunk_ids": retrieved_ids,
        "grounded_claims": grounded_count,
        "unsupported_claim_count": len(claims) - grounded_count,
        "citation_coverage": grounded_count / max(1, len(claims)),
    }

if __name__ == "__main__":
    ids = retrieve("low confidence stop action", 2)
    print(ids)
    print(grounding_report(["confidence low stop", "blue cube exists"], ids))`,
    testCode: `from retrieval_grounding_citation_checks import retrieve, grounding_report

def test_retrieve_safety_stop_first():
    assert retrieve("low confidence stop action", 1) == ["safety_stop"]

def test_grounding_report_counts_unsupported_claim():
    report = grounding_report(["confidence low stop", "blue cube exists"], ["safety_stop"])
    assert report["grounded_claims"] == 1
    assert report["unsupported_claim_count"] == 1

def test_trace_has_retrieved_ids_and_coverage():
    report = grounding_report(["stale actions deadline"], ["latency_gate"])
    assert report["retrieved_chunk_ids"] == ["latency_gate"] and report["citation_coverage"] == 1.0`,
    expectedOutput: "['safety_stop', 'visible_pick']\n{'retrieved_chunk_ids': ['safety_stop', 'visible_pick'], 'grounded_claims': 1, 'unsupported_claim_count': 1, 'citation_coverage': 0.5}",
    runCommand: "python retrieval_grounding_citation_checks.py && pytest test_retrieval_grounding_citation_checks.py",
    commonBugs: [
      "retrieved text는 넣지만 답변 claim과 연결 검사를 하지 않음",
      "chunk id를 로그에 남기지 않아 어떤 근거로 답했는지 모름",
      "top-k를 늘려 hallucination이 줄었다고 착각하고 citation coverage를 보지 않음",
    ],
    extensionTask: "embedding score mock과 token overlap score를 비교하고 citation_coverage와 latency_ms를 함께 기록하라.",
  },
  visualization: {
    id: "vis_retrieval_grounding_citation_coverage",
    title: "Retrieval Grounding Citation Coverage",
    equation: "coverage=grounded_claims/claims_total",
    parameters: [
      param("retrieval_top_k", "k", 1, 10, 3, "검색 chunk 수"),
      param("grounding_threshold", "\\tau_g", 0, 1, 0.8, "근거 인정 coverage threshold"),
      param("unsupported_claims", "n_u", 0, 10, 1, "근거 없는 claim 수"),
    ],
    normalCase: "retrieved chunk id가 trace에 남고 citation coverage가 threshold 이상이다.",
    failureCase: "근거 없는 claim이 남아 있는데 schema만 통과해 hallucinated answer가 실행된다.",
  },
  quiz: {
    id: "retrieval_grounding",
    conceptQuestion: "retrieval과 grounding은 어떻게 다른가?",
    conceptAnswer: "retrieval은 관련 chunk를 찾는 단계이고 grounding은 답변 claim이 그 chunk로 뒷받침되는지 검증하는 단계다.",
    calculationQuestion: "claim 8개 중 6개가 grounded이면 citation coverage는?",
    calculationAnswer: "6/8=0.75다.",
    codeQuestion: "trace에 retrieved chunk id를 저장하는 key 이름 예시는?",
    codeAnswer: "retrieved_chunk_ids",
    debugQuestion: "검색 결과는 맞아 보이는데 답변이 엉뚱하면 무엇을 확인하는가?",
    debugAnswer: "claim 단위 grounding, chunk id, top-k 순서, context assembly에서 chunk가 빠졌는지 확인한다.",
    visualQuestion: "unsupported_claims가 늘면 release gate는 어떻게 되어야 하는가?",
    visualAnswer: "coverage가 낮아져 fallback 또는 fail로 처리해야 한다.",
    robotQuestion: "근거 없는 safety parameter 추천을 실행하면 왜 위험한가?",
    robotAnswer: "로봇 제한 조건과 다른 값을 적용해 충돌, timeout, controller 불안정으로 이어질 수 있다.",
    designQuestion: "grounding eval case에는 무엇이 들어가야 하는가?",
    designAnswer: "query, expected chunk ids, allowed claims, forbidden hallucination claims, citation coverage threshold가 들어간다.",
  },
  wrongTagLabel: "retrieval/grounding 검증 누락",
  nextSessions: ["evaluation_harness_golden_regression"],
});

const evalHarnessSession = makeAdvancedSession({
  id: "evaluation_harness_golden_regression",
  part: "Part 10. 프롬프트/컨텍스트/하네스 엔지니어링",
  title: "Evaluation Harness와 Golden Output 회귀 비교",
  level: "intermediate",
  difficulty: "hard",
  estimatedMinutes: 90,
  prerequisites: ["retrieval_grounding_citation_checks"],
  objectives: [
    "eval case, model output, golden output, rubric을 분리한다.",
    "완전일치 대신 필수 필드와 rubric 조건으로 pass/fail을 계산한다.",
    "pass_rate, golden_id, diff_summary, failure_taxonomy를 로그로 남긴다.",
  ],
  definition:
    "Evaluation harness는 prompt/model/context 변경을 같은 eval set으로 반복 실행하고 golden output 또는 rubric과 비교해 품질 회귀를 수치화하는 자동 평가 장치다.",
  whyItMatters:
    "프롬프트를 바꾼 뒤 좋아졌다는 느낌은 위험하다. golden output 비교와 failure taxonomy가 있어야 어떤 변경이 hallucination, schema fail, latency fail을 만들었는지 알 수 있다.",
  intuition:
    "하네스는 시험지와 채점표다. 모델이 바뀌어도 같은 시험지를 풀려야 성적이 올랐는지 떨어졌는지 알 수 있다.",
  equations: [
    {
      label: "Pass rate",
      expression: "p_{pass}=\\frac{1}{M}\\sum_i pass_i",
      terms: [["M", "eval case 수"], ["pass_i", "case 통과 여부"]],
      explanation: "전체 eval set 통과율이다.",
    },
    {
      label: "Regression delta",
      expression: "\\Delta p=p_{new}-p_{baseline}",
      terms: [["p_new", "새 prompt 통과율"], ["p_baseline", "기준 prompt 통과율"]],
      explanation: "프롬프트 변경이 개선인지 회귀인지 판단한다.",
    },
    {
      label: "Golden comparison",
      expression: "pass_i=schema_i\\land rubric_i\\land golden_i",
      terms: [["schema", "출력 계약"], ["rubric", "채점 조건"], ["golden", "기준 답변 조건"]],
      explanation: "완전일치 하나보다 여러 조건을 분해해 본다.",
    },
  ],
  derivation: [
    ["case", "input, expected/golden, rubric, tags를 JSONL case로 만든다.", "case_i"],
    ["run", "각 case를 같은 prompt/model 설정으로 실행한다.", "y_i"],
    ["grade", "schema, golden, rubric, safety 조건을 각각 채점한다.", "pass_i"],
    ["compare", "baseline과 새 run의 pass_rate와 failure taxonomy를 비교한다.", "delta p"],
  ],
  handCalculation: {
    problem: "baseline 0.86, new 0.92이면 delta p는?",
    given: { baseline: 0.86, new: 0.92 },
    steps: ["delta=0.92-0.86", "delta=0.06"],
    answer: "+0.06, 즉 6%p 개선이다.",
  },
  robotApplication:
    "VLA action generator, ROS 2 command assistant, safety checklist agent를 업데이트할 때 golden eval을 통과하지 못하면 실제 로봇 실행으로 넘어가지 않는다.",
  lab: {
    id: "lab_evaluation_harness_golden_regression",
    title: "Golden Output Eval Harness",
    language: "python",
    theoryConnection: "pass_rate=mean(schema_ok and golden_match and rubric_ok)",
    starterCode: `CASES = [
    {"id": "c1", "golden": {"action": "stop", "target": "none"}, "rubric": {"min_confidence": 0.8}},
    {"id": "c2", "golden": {"action": "pick", "target": "red_cube"}, "rubric": {"min_confidence": 0.7}},
]

def grade_case(case, output):
    # TODO: golden action/target과 confidence rubric을 검사하라.
    raise NotImplementedError

def run_eval(cases, outputs):
    # TODO: pass_rate와 diff_summary를 반환하라.
    raise NotImplementedError

if __name__ == "__main__":
    outputs = [{"action": "stop", "target": "none", "confidence": 0.9}, {"action": "pick", "target": "blue_cube", "confidence": 0.9}]
    print(run_eval(CASES, outputs))`,
    solutionCode: `CASES = [
    {"id": "c1", "golden": {"action": "stop", "target": "none"}, "rubric": {"min_confidence": 0.8}},
    {"id": "c2", "golden": {"action": "pick", "target": "red_cube"}, "rubric": {"min_confidence": 0.7}},
]

def grade_case(case, output):
    golden = case["golden"]
    schema_ok = all(key in output for key in ["action", "target", "confidence"])
    golden_match = output.get("action") == golden["action"] and output.get("target") == golden["target"]
    rubric_ok = output.get("confidence", -1) >= case["rubric"]["min_confidence"]
    return {
        "case_id": case["id"],
        "golden_id": case["id"],
        "schema_ok": schema_ok,
        "golden_match": golden_match,
        "rubric_ok": rubric_ok,
        "pass": schema_ok and golden_match and rubric_ok,
        "diff_summary": "ok" if golden_match else f"expected {golden}, got {output}",
    }

def run_eval(cases, outputs):
    rows = [grade_case(case, output) for case, output in zip(cases, outputs)]
    passed = sum(1 for row in rows if row["pass"])
    return {
        "eval_run_id": "local-smoke",
        "pass_rate": passed / max(1, len(rows)),
        "case_results": rows,
        "failure_taxonomy": [row["diff_summary"] for row in rows if not row["pass"]],
    }

if __name__ == "__main__":
    outputs = [{"action": "stop", "target": "none", "confidence": 0.9}, {"action": "pick", "target": "blue_cube", "confidence": 0.9}]
    print(run_eval(CASES, outputs))`,
    testCode: `from evaluation_harness_golden_regression import CASES, grade_case, run_eval

def test_grade_case_requires_golden_match():
    row = grade_case(CASES[1], {"action": "pick", "target": "blue_cube", "confidence": 0.9})
    assert not row["pass"] and not row["golden_match"]

def test_run_eval_pass_rate():
    outputs = [{"action": "stop", "target": "none", "confidence": 0.9}, {"action": "pick", "target": "red_cube", "confidence": 0.9}]
    assert run_eval(CASES, outputs)["pass_rate"] == 1.0

def test_failure_taxonomy_has_diff():
    outputs = [{"action": "stop", "target": "none", "confidence": 0.9}, {"action": "pick", "target": "blue_cube", "confidence": 0.9}]
    assert run_eval(CASES, outputs)["failure_taxonomy"]`,
    expectedOutput: "{'eval_run_id': 'local-smoke', 'pass_rate': 0.5",
    runCommand: "python evaluation_harness_golden_regression.py && pytest test_evaluation_harness_golden_regression.py",
    commonBugs: [
      "데모 한두 개만 보고 prompt 변경을 승인함",
      "golden output을 완전 문자열 일치로만 비교해 의미상 정상 출력을 실패 처리함",
      "failure taxonomy 없이 pass rate만 기록해 원인을 분해하지 못함",
    ],
    extensionTask: "baseline_run.jsonl과 candidate_run.jsonl을 비교해 delta pass_rate, 새 failure type, 개선 case를 리포트하라.",
  },
  visualization: {
    id: "vis_eval_harness_golden_regression",
    title: "Eval Harness Golden Regression",
    equation: "delta_p=p_new-p_baseline",
    parameters: [
      param("eval_case_count", "M", 5, 200, 40, "eval case 수"),
      param("baseline_pass_rate", "p_b", 0, 1, 0.86, "기준 prompt pass rate"),
      param("candidate_pass_rate", "p_n", 0, 1, 0.92, "후보 prompt pass rate"),
    ],
    normalCase: "candidate pass rate가 baseline 이상이고 safety/golden failure가 증가하지 않는다.",
    failureCase: "전체 pass rate는 올랐지만 unsafe/golden mismatch case가 새로 생긴다.",
  },
  quiz: {
    id: "eval_harness_golden",
    conceptQuestion: "evaluation harness가 프롬프트 엔지니어링에서 필요한 이유는?",
    conceptAnswer: "프롬프트/model/context 변경을 같은 eval set으로 비교해 품질 회귀와 실패 유형을 수치로 판단하기 위해서다.",
    calculationQuestion: "40개 eval 중 34개 통과면 pass rate는?",
    calculationAnswer: "34/40=0.85다.",
    codeQuestion: "baseline과 candidate pass rate 차이를 구하는 식은?",
    codeAnswer: "delta_p = p_new - p_baseline",
    debugQuestion: "pass rate가 올랐는데 로봇 unsafe case가 늘면 어떻게 판단하는가?",
    debugAnswer: "unsafe case는 별도 zero-tolerance gate로 두고 전체 pass rate와 분리해 release를 막는다.",
    visualQuestion: "candidate_pass_rate가 baseline보다 낮으면 무엇을 해야 하는가?",
    visualAnswer: "prompt/model 변경을 reject하거나 failure taxonomy를 보고 원인을 수정한 뒤 재평가한다.",
    robotQuestion: "로봇 action agent golden eval에 꼭 넣을 case는?",
    robotAnswer: "정상 pick/place, low confidence stop, no evidence fallback, forbidden action, stale context, collision risk case를 넣는다.",
    designQuestion: "eval harness 로그 schema는?",
    designAnswer: "eval_run_id, prompt_version, model_version, case_id, golden_id, schema_ok, rubric_ok, pass, latency_ms, diff_summary를 포함한다.",
  },
  wrongTagLabel: "eval harness/golden regression 누락",
  nextSessions: ["latency_tracing_failure_taxonomy"],
});

const tracingSession = makeAdvancedSession({
  id: "latency_tracing_failure_taxonomy",
  part: "Part 10. 프롬프트/컨텍스트/하네스 엔지니어링",
  title: "Latency Logging과 Agent Trace: 실패 원인 분해하기",
  level: "intermediate",
  difficulty: "hard",
  estimatedMinutes: 85,
  prerequisites: ["evaluation_harness_golden_regression"],
  objectives: [
    "retrieval/model/parse/eval latency를 stage별로 기록한다.",
    "schema_fail, grounding_fail, tool_fail, latency_fail 같은 failure taxonomy를 만든다.",
    "trace_id 기반 JSONL 로그 row를 설계한다.",
  ],
  definition:
    "Agent tracing은 한 번의 LLM 호출이 prompt assembly, retrieval, model call, parsing, tool call, evaluation을 거치는 동안 입력, 출력, latency, 실패 유형을 구조화해 남기는 것이다.",
  whyItMatters:
    "하네스가 실패했을 때 느린 검색 때문인지, 모델 hallucination인지, parser 오류인지 모르면 개선할 수 없다. trace는 프롬프트 엔지니어링의 디버거다.",
  intuition:
    "로봇 로그에서 timestamp를 보듯 agent도 각 stage의 시간을 찍어야 한다. 전체가 늦을 때 어느 구간이 막혔는지 봐야 고칠 수 있다.",
  equations: [
    {
      label: "Total latency",
      expression: "T_{total}=T_{retrieval}+T_{model}+T_{parse}+T_{eval}",
      terms: [["T_retrieval", "검색 시간"], ["T_model", "모델 호출 시간"], ["T_parse", "parser 시간"], ["T_eval", "grader 시간"]],
      explanation: "전체 지연을 stage별로 분해한다.",
    },
    {
      label: "Deadline gate",
      expression: "deadline\\_ok=T_{total}<T_{max}",
      terms: [["T_max", "허용 deadline"]],
      explanation: "deadline을 넘으면 robot action agent는 stale로 처리한다.",
    },
    {
      label: "Bottleneck",
      expression: "b=argmax_i T_i",
      terms: [["b", "가장 느린 stage"]],
      explanation: "개선할 stage를 고르는 기준이다.",
    },
  ],
  derivation: [
    ["trace id", "각 request에 고유 trace_id를 부여한다.", "trace_id"],
    ["stage times", "retrieval/model/parse/eval 시간을 따로 기록한다.", "T_i"],
    ["taxonomy", "실패를 schema, grounding, tool, latency, safety로 분류한다.", "failure_type"],
    ["jsonl", "한 request를 한 줄 JSONL로 저장해 regression 비교에 사용한다.", "jsonl"],
  ],
  handCalculation: {
    problem: "retrieval 40ms, model 620ms, parse 15ms, eval 25ms이면 total과 bottleneck은?",
    given: { retrieval: 40, model: 620, parse: 15, eval: 25 },
    steps: ["total=40+620+15+25=700ms", "가장 큰 값은 model 620ms"],
    answer: "total=700ms, bottleneck=model이다.",
  },
  robotApplication:
    "LLM이 ROS 2 recovery action을 추천하는 시스템에서는 latency가 deadline을 넘으면 stale advice로 처리하고, 실패 trace를 남겨 human review로 보낸다.",
  lab: {
    id: "lab_latency_tracing_failure_taxonomy",
    title: "Agent Trace JSONL and Latency Taxonomy",
    language: "python",
    theoryConnection: "Ttotal=Tretrieval+Tmodel+Tparse+Teval, classify failure taxonomy",
    starterCode: `import json

def total_latency_ms(trace):
    # TODO: retrieval_ms, model_ms, parse_ms, eval_ms 합을 구하라.
    raise NotImplementedError

def classify_failure(trace, deadline_ms):
    # TODO: schema/grounding/tool/latency/safety 실패를 분류하라.
    raise NotImplementedError

def jsonl_row(trace, deadline_ms):
    # TODO: trace_id, total_ms, bottleneck_stage, failure_type 포함 JSON 문자열을 반환하라.
    raise NotImplementedError

if __name__ == "__main__":
    trace = {"trace_id": "t1", "retrieval_ms": 40, "model_ms": 620, "parse_ms": 15, "eval_ms": 25, "schema_ok": True, "grounding_ok": True, "tool_ok": True, "safety_ok": True}
    print(jsonl_row(trace, 800))`,
    solutionCode: `import json

STAGES = ["retrieval_ms", "model_ms", "parse_ms", "eval_ms"]

def total_latency_ms(trace):
    return sum(float(trace.get(stage, 0.0)) for stage in STAGES)

def classify_failure(trace, deadline_ms):
    if not trace.get("schema_ok", False):
        return "schema_fail"
    if not trace.get("grounding_ok", False):
        return "grounding_fail"
    if not trace.get("tool_ok", True):
        return "tool_fail"
    if not trace.get("safety_ok", True):
        return "safety_fail"
    if total_latency_ms(trace) > deadline_ms:
        return "latency_fail"
    return "pass"

def jsonl_row(trace, deadline_ms):
    bottleneck = max(STAGES, key=lambda stage: trace.get(stage, 0.0)).replace("_ms", "")
    row = {
        "trace_id": trace["trace_id"],
        "total_ms": total_latency_ms(trace),
        "bottleneck_stage": bottleneck,
        "failure_type": classify_failure(trace, deadline_ms),
        "retrieval_ms": trace.get("retrieval_ms", 0),
        "model_ms": trace.get("model_ms", 0),
        "parse_ms": trace.get("parse_ms", 0),
        "eval_ms": trace.get("eval_ms", 0),
    }
    return json.dumps(row, sort_keys=True)

if __name__ == "__main__":
    trace = {"trace_id": "t1", "retrieval_ms": 40, "model_ms": 620, "parse_ms": 15, "eval_ms": 25, "schema_ok": True, "grounding_ok": True, "tool_ok": True, "safety_ok": True}
    print(jsonl_row(trace, 800))`,
    testCode: `import json
from latency_tracing_failure_taxonomy import total_latency_ms, classify_failure, jsonl_row

def test_total_latency():
    assert total_latency_ms({"retrieval_ms": 10, "model_ms": 20, "parse_ms": 3, "eval_ms": 7}) == 40

def test_failure_priority_schema_before_latency():
    trace = {"trace_id": "t", "retrieval_ms": 1000, "schema_ok": False, "grounding_ok": True}
    assert classify_failure(trace, 10) == "schema_fail"

def test_jsonl_has_bottleneck_and_total():
    row = json.loads(jsonl_row({"trace_id": "t", "retrieval_ms": 10, "model_ms": 50, "parse_ms": 1, "eval_ms": 2, "schema_ok": True, "grounding_ok": True}, 100))
    assert row["bottleneck_stage"] == "model" and row["total_ms"] == 63 and row["failure_type"] == "pass"`,
    expectedOutput: "{\"bottleneck_stage\": \"model\", \"eval_ms\": 25",
    runCommand: "python latency_tracing_failure_taxonomy.py && pytest test_latency_tracing_failure_taxonomy.py",
    commonBugs: [
      "total latency만 저장하고 stage별 시간을 남기지 않음",
      "latency fail이 schema/grounding fail을 덮어 원인 분류가 흐려짐",
      "trace_id가 없어 eval case와 로그 row를 연결하지 못함",
    ],
    extensionTask: "100개 trace JSONL을 읽어 failure_type별 count, p50/p95 total_ms, bottleneck_stage histogram을 출력하라.",
  },
  visualization: {
    id: "vis_latency_tracing_failure_taxonomy",
    title: "Agent Latency Trace and Failure Taxonomy",
    equation: "Ttotal=Tretrieval+Tmodel+Tparse+Teval",
    parameters: [
      param("retrieval_ms", "T_r", 0, 500, 60, "retrieval latency"),
      param("model_ms", "T_m", 0, 3000, 700, "model call latency"),
      param("deadline_ms", "T_d", 100, 3000, 1200, "agent response deadline"),
    ],
    normalCase: "stage별 latency가 deadline 안이고 failure_type이 pass로 기록된다.",
    failureCase: "총합만 기록하면 model/retrieval/parser 중 어느 stage가 병목인지 알 수 없다.",
  },
  quiz: {
    id: "latency_trace_taxonomy",
    conceptQuestion: "agent trace에 stage별 latency를 넣어야 하는 이유는?",
    conceptAnswer: "전체 지연이 커졌을 때 retrieval, model, parser, evaluator 중 어느 stage가 병목인지 구분하기 위해서다.",
    calculationQuestion: "retrieval 30ms, model 900ms, parse 20ms, eval 50ms이면 total은?",
    calculationAnswer: "30+900+20+50=1000ms다.",
    codeQuestion: "JSONL 로그 row를 만들 때 Python에서 쓰는 함수는?",
    codeAnswer: "json.dumps(row)",
    debugQuestion: "schema fail과 latency fail이 동시에 있으면 어떤 식으로 분류 우선순위를 둬야 하는가?",
    debugAnswer: "먼저 schema/grounding/tool/safety 같은 품질 실패를 분류하고, 품질이 통과한 경우 latency fail을 본다.",
    visualQuestion: "model_ms가 deadline 대부분을 차지하면 어떤 개선을 고려하는가?",
    visualAnswer: "더 작은 모델, 캐싱, prompt/context 축소, streaming, timeout/fallback 정책을 검토한다.",
    robotQuestion: "LLM action advice가 deadline을 넘으면 로봇은 어떻게 처리해야 하는가?",
    robotAnswer: "stale advice로 보고 실행하지 않으며 fallback controller나 human review로 보낸다.",
    designQuestion: "trace JSONL 필수 컬럼은?",
    designAnswer: "trace_id, case_id, prompt_version, retrieved_chunk_ids, schema_ok, grounding_ok, latency stage, total_ms, failure_type, output_hash를 포함한다.",
  },
  wrongTagLabel: "latency logging/agent trace 누락",
  nextSessions: ["prompt_context_eval_harness_engineering"],
});

export const promptContextHarnessSessions: Session[] = [
  promptTemplateSession,
  fewShotSession,
  chunkingSession,
  retrievalSession,
  evalHarnessSession,
  tracingSession,
];
