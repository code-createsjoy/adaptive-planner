import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe2,
  Mic,
  Pause,
  Play,
  Radio,
  Save,
  ShieldCheck,
  Star,
  UserRound,
  Video,
  VideoOff,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type InterviewMode = "interviewee" | "interviewer";

type Question = {
  id: string;
  number: number;
  title: string;
  prompt: string;
  helper: string;
  competency: string;
};

type Recording = {
  url?: string;
  duration: number;
  real: boolean;
};

type DemoCandidate = {
  id: string;
  name: string;
  role: string;
  initials: string;
  submitted: string;
  duration: string;
  progress: number;
  status: string;
};

const questions: Question[] = [
  {
    id: "shoes",
    number: 1,
    title: "Sell this pair of old shoes",
    prompt: "This is a pair of worn-out shoes. You need to sell them.",
    helper:
      "Part 1: Tell me your process. Part 2: Given you have identified your target customer, persuade them to buy it from you.",
    competency: "Communication",
  },
  {
    id: "project",
    number: 2,
    title: "A project you're proud of",
    prompt: "Tell us about a project you are proud of.",
    helper: "Walk through the problem, what you owned, and what changed because of your work.",
    competency: "Ownership & impact",
  },
  {
    id: "tradeoff",
    number: 3,
    title: "Make a difficult trade-off",
    prompt: "Describe a time you had to choose between speed and quality.",
    helper: "Explain how you decided and what you learned afterwards.",
    competency: "Judgement",
  },
  {
    id: "feedback",
    number: 4,
    title: "Respond to feedback",
    prompt: "Tell us about a piece of feedback that changed how you work.",
    helper: "Focus on what you heard, what you changed, and the result.",
    competency: "Growth mindset",
  },
  {
    id: "first-month",
    number: 5,
    title: "Your first 30 days",
    prompt:
      "If you joined the team, what would you want to understand or accomplish in your first 30 days?",
    helper: "Be concrete: people, product, priorities, and one early signal of progress.",
    competency: "Collaboration",
  },
  {
    id: "priorities",
    number: 6,
    title: "Prioritize urgent work",
    prompt: "Two important tasks arrive at the same time. How do you decide what to do first?",
    helper: "Describe the questions you ask before committing to a plan.",
    competency: "Problem solving",
  },
  {
    id: "questions",
    number: 7,
    title: "Your questions for us",
    prompt: "What would you like to understand about the team, the role, or the way we work?",
    helper: "There is no minimum or maximum. Ask what would help you make a good decision too.",
    competency: "Curiosity",
  },
];

const demoCandidates: DemoCandidate[] = [
  {
    id: "maya",
    name: "Maya Nguyen",
    role: "Senior Backend Engineer",
    initials: "MN",
    submitted: "Today, 10:32",
    duration: "12:48",
    progress: 100,
    status: "Ready to review",
  },
  {
    id: "alex",
    name: "Alex Tran",
    role: "Senior Backend Engineer",
    initials: "AT",
    submitted: "Yesterday, 16:08",
    duration: "13:21",
    progress: 100,
    status: "Ready to review",
  },
  {
    id: "jordan",
    name: "Jordan Lee",
    role: "Senior Backend Engineer",
    initials: "JL",
    submitted: "Yesterday, 11:42",
    duration: "08:06",
    progress: 75,
    status: "6 of 7 answers",
  },
];

const scoreLabels = ["Needs work", "Developing", "Solid", "Strong", "Exceptional"];

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const rest = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${rest}`;
}

export function InterviewLab({ onExit }: { onExit: () => void }) {
  const [mode, setMode] = useState<InterviewMode>("interviewee");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [recordings, setRecordings] = useState<Record<string, Recording>>({});
  const [reviewCandidate, setReviewCandidate] = useState<DemoCandidate>(demoCandidates[0]!);
  const [reviewQuestion, setReviewQuestion] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    shoes: 4,
    project: 4,
    tradeoff: 4,
    feedback: 3,
    "first-month": 4,
  });
  const [notes, setNotes] = useState(
    "Clear structure and strong ownership. Ask one follow-up about the measurement of impact.",
  );
  const [savedEvaluation, setSavedEvaluation] = useState(false);

  if (mode === "interviewee") {
    return (
      <IntervieweeFlow
        recordings={recordings}
        setRecordings={setRecordings}
        questionIndex={questionIndex}
        setQuestionIndex={setQuestionIndex}
        onModeChange={setMode}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="space-y-5 px-5 py-5 sm:px-8 sm:py-7">
      <LabHeader mode={mode} onModeChange={setMode} onExit={onExit} />
      <InterviewerFlow
        candidate={reviewCandidate}
        setCandidate={setReviewCandidate}
        questionIndex={reviewQuestion}
        setQuestionIndex={setReviewQuestion}
        scores={scores}
        setScores={setScores}
        notes={notes}
        setNotes={setNotes}
        saved={savedEvaluation}
        setSaved={setSavedEvaluation}
      />
    </div>
  );
}

function LabHeader({
  mode,
  onModeChange,
  onExit,
}: {
  mode: InterviewMode;
  onModeChange: (mode: InterviewMode) => void;
  onExit: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card/75 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onExit}
        title="Back to home"
        className="flex items-center gap-3 text-left transition-opacity hover:opacity-80"
      >
        <span className="grid size-10 place-items-center rounded-xl bg-primary font-sans text-sm font-bold text-primary-foreground">
          A
        </span>
        <div>
          <p className="font-sans text-[15px] font-bold">Adaptive Interview</p>
          <p className="font-sans text-xs text-muted-foreground">
            Structured review for your hiring panel
          </p>
        </div>
      </button>
      <div className="flex rounded-xl border border-border bg-background/70 p-1">
        <button
          type="button"
          onClick={() => onModeChange("interviewee")}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 font-sans text-sm font-semibold ${mode === "interviewee" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          <UserRound className="size-4" /> Interviewee
        </button>
        <button
          type="button"
          onClick={() => onModeChange("interviewer")}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 font-sans text-sm font-semibold ${mode === "interviewer" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          <Award className="size-4" /> Interviewer
        </button>
      </div>
    </div>
  );
}

function IntervieweeFlow({
  recordings,
  setRecordings,
  questionIndex,
  setQuestionIndex,
  onModeChange,
  onExit,
}: {
  recordings: Record<string, Recording>;
  setRecordings: React.Dispatch<React.SetStateAction<Record<string, Recording>>>;
  questionIndex: number;
  setQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  onModeChange: (mode: InterviewMode) => void;
  onExit: () => void;
}) {
  const question = questions[questionIndex] ?? questions[0]!;
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving">("saved");
  const [permissionMessage, setPermissionMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const saveTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const finishRecording = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setSaveState("saving");
    const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordings((current) => ({ ...current, [question.id]: { url, duration, real: true } }));
        setSaveState("saved");
        recorderRef.current = null;
        stopStream();
      };
      recorderRef.current.stop();
    } else {
      setRecordings((current) => ({ ...current, [question.id]: { duration, real: false } }));
      setSaveState("saved");
      stopStream();
    }
    setIsRecording(false);
  };

  const startRecording = async () => {
    setPermissionMessage("");
    setSaveState("saving");
    chunksRef.current = [];
    startedAtRef.current = Date.now();
    setElapsed(0);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(
      () => setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000)),
      250,
    );
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)
        throw new Error("Recording is not available in this browser");
      const stream = await navigator.mediaDevices.getUserMedia({ video: cameraOn, audio: micOn });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setPermissionMessage("Camera/mic chưa được cấp quyền. Bạn vẫn có thể chạy thử luồng demo.");
      setIsRecording(true);
    }
  };

  const recording = recordings[question.id];
  const allDone = questions.every((item) => recordings[item.id]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="flex h-[70px] items-center bg-primary px-5 text-primary-foreground shadow-sm sm:px-7">
        <button
          type="button"
          onClick={onExit}
          title="Back to home"
          className="flex min-w-[210px] items-center gap-2.5 text-left transition-opacity hover:opacity-80"
        >
          <span className="grid size-10 place-items-center border border-primary-foreground/30 bg-primary-foreground/10 font-sans text-lg font-bold">
            A
          </span>
          <span className="font-sans text-lg font-semibold tracking-tight">Adaptive</span>
        </button>
        <div className="flex-1 text-center font-sans text-xl font-semibold tracking-tight sm:text-2xl">
          Adaptive Interview
        </div>
        <div className="flex min-w-[210px] justify-end gap-2">
          <button
            type="button"
            onClick={() => onModeChange("interviewer")}
            className="hidden items-center gap-2 rounded-md border border-primary-foreground/25 px-3 py-2 text-xs font-semibold hover:bg-primary-foreground/10 sm:flex"
          >
            <Award className="size-3.5" /> Interviewer view
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 px-2 py-2 text-sm font-medium text-primary-foreground/90"
          >
            <Globe2 className="size-4" /> English <ChevronDown className="size-3.5" />
          </button>
        </div>
      </div>
      {!setupComplete ? (
        <IntervieweeSetup onComplete={() => setSetupComplete(true)} />
      ) : (
        <div className="grid min-h-[calc(100vh-70px)] lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="border-b border-r border-border bg-card lg:border-b-0">
            <div className="border-b border-border px-6 py-5">
              <p className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Interview questions
              </p>
              <p className="mt-1.5 font-sans text-sm font-medium text-foreground/75">
                Backend Engineer · 15 min
              </p>
            </div>
            <div className="flex overflow-x-auto lg:block">
              {questions.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => !isRecording && setQuestionIndex(index)}
                  className={`group flex min-w-[150px] items-center gap-3 border-b border-border px-5 py-4 text-left transition-colors lg:w-full ${index === questionIndex ? "border-r-[3px] border-r-primary bg-background text-foreground" : "text-muted-foreground hover:bg-background hover:text-foreground"}`}
                >
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-full text-xs ${recordings[item.id] ? "bg-success text-success-foreground" : index === questionIndex ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {recordings[item.id] ? (
                      <Check className="size-3.5" />
                    ) : index < questionIndex ? (
                      <Check className="size-3.5" />
                    ) : (
                      <span
                        className={
                          index === questionIndex
                            ? "h-[2px] w-3 bg-primary"
                            : "h-[2px] w-3 bg-current"
                        }
                      />
                    )}
                  </span>
                  <span className="whitespace-nowrap font-sans text-sm font-semibold">
                    QUESTION {item.number}
                  </span>
                </button>
              ))}
            </div>
          </aside>
          <section className="relative min-h-[calc(100vh-70px)] overflow-hidden bg-background">
            <div className="px-7 pb-8 pt-9 sm:px-12 lg:px-16 lg:pt-12">
              <div className="max-w-[980px]">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-primary">
                    Question {question.number} of {questions.length}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span className="font-sans text-xs font-medium text-muted-foreground">
                    {question.competency}
                  </span>
                </div>
                <div className="mt-5 flex max-w-[820px] items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border/70">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                  <span className="shrink-0 font-mono text-[11px] font-semibold text-muted-foreground">
                    {questionIndex + 1}/{questions.length}
                  </span>
                </div>
                <h1 className="mt-4 font-sans text-3xl font-bold leading-tight tracking-[-0.025em] text-foreground sm:text-[38px]">
                  {question.title}
                </h1>
                <div className="mt-7 max-w-[930px] font-sans text-[17px] leading-8 text-muted-foreground sm:text-[18px]">
                  <p>{question.prompt}</p>
                  <p className="mt-3">{question.helper}</p>
                </div>
                <div className="mt-8 flex min-h-[310px] max-w-[820px] items-center justify-center border border-border bg-card/60 p-8 sm:min-h-[390px]">
                  <div className="text-center">
                    <div className="mx-auto flex items-end justify-center text-[86px] leading-none grayscale-[0.15] drop-shadow-sm sm:text-[110px]">
                      👟👟
                    </div>
                    <p className="mt-6 font-sans text-sm font-semibold text-foreground/70">
                      Use the visual prompt to guide your answer
                    </p>
                    <p className="mt-1 font-sans text-xs text-muted-foreground">
                      Take a breath, then start when you are ready.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 z-20 border-t border-border bg-background/95 px-6 py-3 backdrop-blur sm:px-10 lg:px-16">
              <div className="mx-auto flex max-w-[1120px] flex-wrap items-end justify-between gap-3">
                <RecorderCard
                  videoRef={videoRef}
                  isRecording={isRecording}
                  elapsed={isRecording ? elapsed : (recording?.duration ?? elapsed)}
                  cameraOn={cameraOn}
                  micOn={micOn}
                  permissionMessage={permissionMessage}
                  hasRecording={Boolean(recording)}
                  realRecording={Boolean(recording?.real)}
                  saveState={saveState}
                  onToggleCamera={() => setCameraOn((value) => !value)}
                  onToggleMic={() => setMicOn((value) => !value)}
                  onStart={startRecording}
                  onStop={finishRecording}
                  recordingUrl={recording?.url}
                />
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-lg shadow-foreground/10">
                  <Button
                    variant="outline"
                    className="rounded-lg border-input font-sans"
                    disabled={questionIndex === 0 || isRecording}
                    onClick={() => setQuestionIndex((index) => index - 1)}
                  >
                    <ChevronLeft className="size-4" /> Back
                  </Button>
                  <Button
                    className="rounded-lg bg-primary font-sans text-primary-foreground hover:bg-foreground"
                    disabled={!recording || isRecording || questionIndex === questions.length - 1}
                    onClick={() => setQuestionIndex((index) => index + 1)}
                  >
                    Next <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
      {setupComplete && allDone && (
        <div className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-4 rounded-xl border border-success/30 bg-card px-4 py-3 font-sans text-sm shadow-xl">
          <Check className="size-4 text-success" /> All answers saved{" "}
          <Button
            size="sm"
            className="rounded-lg bg-success text-success-foreground hover:bg-success/90"
            onClick={() => window.alert("Prototype: answers are ready to submit.")}
          >
            Submit interview
          </Button>
        </div>
      )}
    </div>
  );
}

function IntervieweeSetup({ onComplete }: { onComplete: () => void }) {
  const previewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [checkState, setCheckState] = useState<"idle" | "checking" | "ready" | "demo">("idle");
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [message, setMessage] = useState("");

  const stopPreview = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (previewRef.current) previewRef.current.srcObject = null;
  };

  useEffect(() => stopPreview, []);

  const checkDevices = async () => {
    setCheckState("checking");
    setMessage("");
    stopPreview();

    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Media devices unavailable");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const hasCamera = stream.getVideoTracks().length > 0;
      const hasMic = stream.getAudioTracks().length > 0;
      streamRef.current = stream;
      setCameraReady(hasCamera);
      setMicReady(hasMic);
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        await previewRef.current.play().catch(() => undefined);
      }
      setCheckState(hasCamera && hasMic ? "ready" : "demo");
      if (!hasCamera || !hasMic) {
        setMessage("One or more devices are unavailable. You can continue in demo mode.");
      }
    } catch {
      setCameraReady(false);
      setMicReady(false);
      setCheckState("demo");
      setMessage("Camera or microphone access was not available. You can continue in demo mode.");
    }
  };

  const statusLabel =
    checkState === "ready"
      ? "Ready"
      : checkState === "demo"
        ? "Demo mode"
        : checkState === "checking"
          ? "Checking…"
          : "Not checked";

  return (
    <div className="min-h-[calc(100vh-70px)] bg-background px-6 py-8 sm:px-10 sm:py-12">
      <div className="mx-auto max-w-[980px]">
        <div className="mb-8 max-w-2xl">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            Before you start
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Check your interview setup
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Make sure your camera and microphone are ready. You can test them now before answering
            the first question.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="relative aspect-video bg-foreground">
              <video ref={previewRef} muted playsInline className="size-full object-cover" />
              {checkState !== "ready" && (
                <div className="absolute inset-0 grid place-items-center px-6 text-center text-white/75">
                  <div>
                    <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                      A
                    </div>
                    <p className="mt-3 text-sm font-semibold">
                      Your camera preview will appear here
                    </p>
                    <p className="mt-1 text-xs text-white/55">
                      Your video is only used for this interview.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Device preview</p>
                <p className="mt-1 text-xs text-muted-foreground">Camera and microphone check</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <span
                  className={`size-2 rounded-full ${checkState === "ready" ? "bg-success" : "bg-border"}`}
                />
                {statusLabel}
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="space-y-3">
              <DeviceCheckRow
                icon={Video}
                label="Camera"
                ready={cameraReady}
                checked={checkState !== "idle" && checkState !== "checking"}
              />
              <DeviceCheckRow
                icon={Mic}
                label="Microphone"
                ready={micReady}
                checked={checkState !== "idle" && checkState !== "checking"}
              />
            </div>
            {message && (
              <p
                className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/8 px-3 py-2.5 text-xs leading-relaxed text-amber-800 dark:text-amber-200"
                role="status"
              >
                {message}
              </p>
            )}
            <Button
              onClick={checkDevices}
              disabled={checkState === "checking"}
              className="mt-5 w-full rounded-xl bg-primary text-primary-foreground hover:bg-foreground"
            >
              <Radio className="size-4" />{" "}
              {checkState === "checking" ? "Checking devices…" : "Check camera & microphone"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                stopPreview();
                onComplete();
              }}
              disabled={checkState === "idle" || checkState === "checking"}
              className="mt-2 w-full rounded-xl"
            >
              Continue to interview <ChevronRight className="size-4" />
            </Button>
            <div className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
              <p>
                You can continue in demo mode if your browser blocks camera or microphone access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeviceCheckRow({
  icon: Icon,
  label,
  ready,
  checked,
}: {
  icon: typeof Video;
  label: string;
  ready: boolean;
  checked: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-background/50 px-3 py-3">
      <span className="flex items-center gap-3 text-sm font-semibold">
        <span className="grid size-9 place-items-center rounded-lg bg-primary/8 text-primary">
          <Icon className="size-4" />
        </span>
        {label}
      </span>
      <span
        className={`text-xs font-semibold ${checked && ready ? "text-success" : checked ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground"}`}
      >
        {checked ? (ready ? "Ready" : "Unavailable") : "Not checked"}
      </span>
    </div>
  );
}

function RecorderCard({
  videoRef,
  isRecording,
  elapsed,
  cameraOn,
  micOn,
  permissionMessage,
  hasRecording,
  realRecording,
  saveState,
  onToggleCamera,
  onToggleMic,
  onStart,
  onStop,
  recordingUrl,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isRecording: boolean;
  elapsed: number;
  cameraOn: boolean;
  micOn: boolean;
  permissionMessage: string;
  hasRecording: boolean;
  realRecording: boolean;
  saveState: "saved" | "saving";
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onStart: () => void;
  onStop: () => void;
  recordingUrl?: string | undefined;
}) {
  return (
    <div className="w-[220px] shrink-0 overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-foreground/15">
      <div className="relative aspect-[4/3] overflow-hidden bg-foreground">
        {recordingUrl ? (
          <video src={recordingUrl} controls className="size-full object-cover" />
        ) : (
          <>
            <video
              ref={videoRef}
              muted
              playsInline
              className={`size-full object-cover ${cameraOn ? "" : "hidden"}`}
            />
            {!cameraOn && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center text-white/70">
                  <VideoOff className="mx-auto size-7" />
                  <p className="mt-2 font-sans text-xs">Camera off</p>
                </div>
              </div>
            )}
            {cameraOn && !isRecording && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary font-sans text-lg font-bold text-primary-foreground">
                    TN
                  </div>
                  <p className="mt-2 font-sans text-[11px] font-semibold text-white/80">
                    Camera preview
                  </p>
                </div>
              </div>
            )}
          </>
        )}
        <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-md bg-black/35 px-2 py-1 font-sans text-[10px] font-semibold text-white backdrop-blur-sm">
          <span
            className={`size-1.5 rounded-full ${isRecording ? "animate-pulse bg-red-400" : "bg-emerald-400"}`}
          />{" "}
          {isRecording ? "Recording" : hasRecording ? "Saved" : "Ready"}
        </div>
        <div className="absolute bottom-2 right-2 rounded-md bg-black/35 px-2 py-1 font-mono text-[10px] text-white backdrop-blur-sm">
          {formatDuration(elapsed)}
        </div>
      </div>
      {permissionMessage && (
        <p className="border-b border-amber-200 bg-amber-50 px-3 py-2 font-sans text-[10px] leading-relaxed text-amber-800">
          {permissionMessage}
        </p>
      )}
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onToggleCamera}
            className={`grid size-8 place-items-center rounded-lg border ${cameraOn ? "border-border text-muted-foreground" : "border-red-200 bg-red-50 text-red-600"}`}
            aria-label="Toggle camera"
          >
            {cameraOn ? <Video className="size-3.5" /> : <VideoOff className="size-3.5" />}
          </button>
          <button
            type="button"
            onClick={onToggleMic}
            className={`grid size-8 place-items-center rounded-lg border ${micOn ? "border-border text-muted-foreground" : "border-red-200 bg-red-50 text-red-600"}`}
            aria-label="Toggle microphone"
          >
            {micOn ? <Mic className="size-3.5" /> : <Volume2 className="size-3.5" />}
          </button>
        </div>
        {isRecording ? (
          <Button
            size="sm"
            onClick={onStop}
            className="rounded-lg bg-red-500 px-3 font-sans text-xs text-white hover:bg-red-600"
          >
            <Pause className="size-3.5" /> Stop
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onStart}
            className="rounded-lg bg-primary px-3 font-sans text-xs text-primary-foreground hover:bg-foreground"
          >
            <Radio className="size-3.5" /> {hasRecording ? "Again" : "Record"}
          </Button>
        )}
      </div>
      {hasRecording && (
        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 font-sans text-[10px] text-muted-foreground">
          <span>{realRecording ? "Video answer ready." : "Demo answer saved."}</span>
          <span className="flex shrink-0 items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300">
            <Save className="size-3" /> {saveState === "saving" ? "Saving…" : "Autosaved"}
          </span>
        </div>
      )}
    </div>
  );
}

function InterviewerFlow({
  candidate,
  setCandidate,
  questionIndex,
  setQuestionIndex,
  scores,
  setScores,
  notes,
  setNotes,
  saved,
  setSaved,
}: {
  candidate: DemoCandidate;
  setCandidate: React.Dispatch<React.SetStateAction<DemoCandidate>>;
  questionIndex: number;
  setQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  scores: Record<string, number>;
  setScores: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  saved: boolean;
  setSaved: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const question = questions[questionIndex] ?? questions[0]!;
  const score = scores[question.id] ?? 0;
  const average = useMemo(
    () =>
      Object.values(scores).reduce((total, value) => total + value, 0) /
      Object.values(scores).length,
    [scores],
  );
  const [playing, setPlaying] = useState(false);
  const [sentToAdaptive, setSentToAdaptive] = useState(false);
  const [autoSaveState, setAutoSaveState] = useState<"saved" | "saving">("saved");
  const autoSaveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setSaved(false);
    setPlaying(false);
    setAutoSaveState("saved");
  }, [candidate.id, questionIndex, setSaved]);

  useEffect(
    () => () => {
      if (autoSaveTimerRef.current) window.clearTimeout(autoSaveTimerRef.current);
    },
    [],
  );

  const queueAutosave = () => {
    setSaved(false);
    setAutoSaveState("saving");
    if (autoSaveTimerRef.current) window.clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = window.setTimeout(() => {
      setAutoSaveState("saved");
      setSaved(true);
    }, 700);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Candidates" value="3 submissions" icon={UserRound} />
        <MetricCard label="Currently reviewing" value={candidate.name} icon={Video} />
        <MetricCard label="Overall score" value={`${average.toFixed(1)} / 5`} icon={Star} />
      </div>
      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-border bg-card/65 p-3 shadow-sm">
          <div className="flex items-center justify-between px-3 pb-3 pt-2">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Submissions
              </p>
              <p className="mt-1 text-sm font-semibold">Review queue</p>
            </div>
            <span className="rounded-full bg-amber-500/12 px-2 py-1 font-mono text-[10px] font-bold text-amber-700 dark:text-amber-300">
              3
            </span>
          </div>
          <div className="space-y-1">
            {demoCandidates.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setCandidate(item)}
                className={`w-full rounded-xl p-3 text-left transition-colors ${candidate.id === item.id ? "bg-primary text-primary-foreground" : "hover:bg-background/80"}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-xl text-xs font-bold ${candidate.id === item.id ? "bg-white/15" : "bg-blue-500/10 text-blue-700 dark:text-blue-300"}`}
                  >
                    {item.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{item.name}</span>
                    <span
                      className={`block truncate text-[11px] ${candidate.id === item.id ? "text-primary-foreground/65" : "text-muted-foreground"}`}
                    >
                      {item.role}
                    </span>
                  </span>
                </div>
                <div
                  className={`mt-3 flex items-center justify-between text-[11px] ${candidate.id === item.id ? "text-primary-foreground/65" : "text-muted-foreground"}`}
                >
                  <span>{item.submitted}</span>
                  <span>{item.progress === 100 ? "Complete" : item.status}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-4 text-emerald-600" /> Structured review
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Use the same rubric for every candidate before making a decision.
            </p>
          </div>
        </aside>
        <div className="space-y-5">
          <section className="rounded-2xl border border-border bg-card/75 p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary font-bold text-primary-foreground">
                  {candidate.initials}
                </span>
                <div>
                  <h3 className="font-display text-xl font-extrabold">{candidate.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {candidate.role} · submitted {candidate.submitted}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <Check className="size-3.5" /> {candidate.status}
              </div>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-4">
              {questions.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setQuestionIndex(index)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors ${questionIndex === index ? "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300" : "border-border bg-background/45 text-muted-foreground hover:text-foreground"}`}
                >
                  <span className="font-mono">0{item.number}</span>
                  <span className="ml-2 hidden xl:inline">{item.competency}</span>
                </button>
              ))}
            </div>
          </section>
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
            <section className="overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0f172a] text-white shadow-xl shadow-slate-950/20 xl:sticky xl:top-5">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
                    Recorded answer
                  </p>
                  <p className="mt-1 text-sm font-semibold">{question.title}</p>
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[10px] text-white/65">
                  {candidate.duration}
                </span>
              </div>
              <div className="relative aspect-video bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950">
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <div className="mx-auto grid size-20 place-items-center rounded-full bg-primary text-2xl font-extrabold text-primary-foreground shadow-2xl">
                      {candidate.initials}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-white/80">
                      {candidate.name}'s answer
                    </p>
                    <p className="mt-1 text-xs text-white/45">Prototype playback surface</p>
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-3 py-2 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setPlaying((value) => !value)}
                    className="grid size-8 place-items-center rounded-lg bg-white text-slate-950"
                  >
                    {playing ? (
                      <Pause className="size-3.5" />
                    ) : (
                      <Play className="size-3.5 fill-current" />
                    )}
                  </button>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
                    <div
                      className={`h-full rounded-full bg-blue-400 ${playing ? "w-2/5" : "w-1/5"}`}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-white/55">02:18 / 03:00</span>
                  <Volume2 className="size-3.5 text-white/55" />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-xs text-white/55">
                <span className="flex items-center gap-1.5">
                  <FileText className="size-3.5" /> Transcript ready in next phase
                </span>
                <button type="button" className="font-semibold text-blue-300 hover:text-white">
                  Open full screen
                </button>
              </div>
            </section>
            <section className="rounded-2xl border border-border bg-card/75 p-5 shadow-sm xl:sticky xl:top-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Evaluation
                  </p>
                  <h3 className="mt-1 font-display text-xl font-extrabold">
                    {question.competency}
                  </h3>
                </div>
                <span className="rounded-full bg-amber-500/12 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                  {score ? `${score}/5` : "Not scored"}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                How effectively did this answer demonstrate the competency?
              </p>
              <div className="mt-4 grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => {
                      setScores((current) => ({ ...current, [question.id]: value }));
                      queueAutosave();
                    }}
                    className={`grid aspect-square place-items-center rounded-lg border text-sm font-bold transition-colors ${score === value ? "border-amber-500 bg-amber-400 text-amber-950" : "border-border bg-background/60 text-muted-foreground hover:border-amber-400/50 hover:text-foreground"}`}
                    aria-label={`Score ${value}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                <span>{scoreLabels[0]}</span>
                <span>{scoreLabels[4]}</span>
              </div>
              <Textarea
                value={notes}
                onChange={(event) => {
                  setNotes(event.target.value);
                  queueAutosave();
                }}
                className="mt-5 min-h-28 resize-none rounded-xl bg-background/50 text-sm"
                placeholder="Add a concise note for your panel..."
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <Button
                  className="rounded-lg"
                  onClick={() => {
                    setSaved(true);
                    setAutoSaveState("saved");
                  }}
                  disabled={!score}
                >
                  <Save className="size-4" /> Save evaluation
                </Button>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <Check className="size-3.5" />{" "}
                  {autoSaveState === "saving" ? "Saving…" : saved ? "Autosaved" : "Ready to save"}
                </span>
              </div>
            </section>
          </div>
          <section className="flex flex-col gap-4 rounded-2xl border border-blue-500/20 bg-blue-500/6 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg font-bold">Next step: hand off to Adaptive</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Send structured evaluation to the Adaptive hiring workspace.
              </p>
            </div>
            <Button
              variant="outline"
              className="shrink-0 rounded-lg border-blue-500/30 bg-background/60"
              onClick={() => setSentToAdaptive(true)}
            >
              {sentToAdaptive ? (
                <>
                  <Check className="size-4 text-emerald-600" /> Sent
                </>
              ) : (
                <>
                  Prepare handoff <ChevronRight className="size-4" />
                </>
              )}
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof FileText;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 p-4">
      <span className="grid size-9 place-items-center rounded-xl bg-primary/8 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
