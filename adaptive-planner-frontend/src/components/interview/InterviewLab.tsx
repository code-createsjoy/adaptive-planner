import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Mic,
  MicOff,
  Pause,
  Play,
  Radio,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Video,
  VideoOff,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

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
    title: "Bán đôi giày cũ này",
    prompt: "Đây là một đôi giày đã qua sử dụng. Bạn hãy tìm cách bán nó cho một khách hàng tiềm năng.",
    helper:
      "Phần 1: Nêu quy trình tiếp cận. Phần 2: Xác định khách hàng mục tiêu và thuyết phục họ mua hàng.",
    competency: "Giao tiếp & Thuyết phục",
  },
  {
    id: "project",
    number: 2,
    title: "Dự án bạn tự hào nhất",
    prompt: "Chia sẻ về một dự án kỹ thuật hoặc sản phẩm bạn đã từng thực hiện và thấy tự hào nhất.",
    helper: "Nêu rõ bài toán, vai trò của bạn và kết quả/tác động thực tế sau khi triển khai.",
    competency: "Tinh thần trách nhiệm & Tác động",
  },
  {
    id: "tradeoff",
    number: 3,
    title: "Quyết định đánh đổi khó khăn",
    prompt: "Mô tả một lần bạn phải lựa chọn giữa tốc độ ra mắt sản phẩm và chất lượng kỹ thuật.",
    helper: "Bạn đã cân nhắc tiêu chí nào để ra quyết định và bài học rút ra là gì?",
    competency: "Tư duy phán đoán",
  },
  {
    id: "feedback",
    number: 4,
    title: "Tiếp nhận phản hồi",
    prompt: "Kể về một lời góp ý thẳng thắn đã thay đổi tích cực cách bạn làm việc.",
    helper: "Tập trung vào những gì bạn đã lắng nghe, thay đổi và kết quả đạt được.",
    competency: "Tư duy phát triển",
  },
  {
    id: "first-month",
    number: 5,
    title: "Kế hoạch 30 ngày đầu tiên",
    prompt: "Nếu gia nhập đội ngũ, bạn dự định tìm hiểu và đạt được những cột mốc nào trong 30 ngày đầu?",
    helper: "Cụ thể hóa về con người, công nghệ, ưu tiên công việc và kết quả ban đầu.",
    competency: "Hợp tác & Hòa nhập",
  },
  {
    id: "priorities",
    number: 6,
    title: "Ưu tiên công việc gấp",
    prompt: "Khi có hai nhiệm vụ quan trọng cùng xuất hiện bất ngờ, bạn sắp xếp thứ tự xử lý thế nào?",
    helper: "Mô tả các câu hỏi bạn tự đặt ra trước khi cam kết kế hoạch hành động.",
    competency: "Giải quyết vấn đề",
  },
  {
    id: "questions",
    number: 7,
    title: "Câu hỏi dành cho công ty",
    prompt: "Bạn có câu hỏi hoặc điều gì muốn tìm hiểu thêm về văn hóa, lộ trình hoặc đội ngũ của chúng tôi?",
    helper: "Hãy thoải mái chia sẻ những điều giúp bạn đưa ra quyết định phù hợp nhất.",
    competency: "Sự chủ động & Tò mò",
  },
];

const demoCandidates: DemoCandidate[] = [
  {
    id: "maya",
    name: "Maya Nguyen",
    role: "Senior Backend Engineer",
    initials: "MN",
    submitted: "Hôm nay, 10:32",
    duration: "12:48",
    progress: 100,
    status: "Sẵn sàng đánh giá",
  },
  {
    id: "alex",
    name: "Alex Tran",
    role: "Senior Backend Engineer",
    initials: "AT",
    submitted: "Hôm qua, 16:08",
    duration: "13:21",
    progress: 100,
    status: "Sẵn sàng đánh giá",
  },
  {
    id: "jordan",
    name: "Jordan Lee",
    role: "Senior Backend Engineer",
    initials: "JL",
    submitted: "Hôm qua, 11:42",
    duration: "08:06",
    progress: 75,
    status: "6/7 câu trả lời",
  },
];

const scoreLabels = ["Cần cải thiện", "Đang phát triển", "Đạt yêu cầu", "Tốt", "Xuất sắc"];

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const rest = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${rest}`;
}

export function InterviewLab({ onExit: _onExit }: { onExit?: () => void }) {
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
    "Cấu trúc trả lời mạch lạc, tư duy ownership tốt. Cần hỏi thêm về cách đo lường hiệu quả thực tế.",
  );
  const [savedEvaluation, setSavedEvaluation] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Mode Segmented Bar */}
      <div className="glass-panel flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center sm:justify-between border border-border bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5 px-2">
          <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Không gian phỏng vấn chuẩn hóa</p>
            <p className="text-[11px] text-muted-foreground">Vị trí: Backend Engineer · 7 câu hỏi tiêu chuẩn</p>
          </div>
        </div>

        <div className="flex items-center rounded-xl border border-border bg-background/80 p-1">
          <button
            type="button"
            onClick={() => setMode("interviewee")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              mode === "interviewee"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserRound className="size-3.5" /> Ứng viên
          </button>
          <button
            type="button"
            onClick={() => setMode("interviewer")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              mode === "interviewer"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Award className="size-3.5" /> Người đánh giá
          </button>
        </div>
      </div>

      {mode === "interviewee" ? (
        <IntervieweeFlow
          recordings={recordings}
          setRecordings={setRecordings}
          questionIndex={questionIndex}
          setQuestionIndex={setQuestionIndex}
        />
      ) : (
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
      )}
    </div>
  );
}

function IntervieweeFlow({
  recordings,
  setRecordings,
  questionIndex,
  setQuestionIndex,
}: {
  recordings: Record<string, Recording>;
  setRecordings: React.Dispatch<React.SetStateAction<Record<string, Recording>>>;
  questionIndex: number;
  setQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // Apply initial camera and mic toggle state to the tracks
      stream.getVideoTracks().forEach((t) => {
        t.enabled = cameraOn;
      });
      stream.getAudioTracks().forEach((t) => {
        t.enabled = micOn;
      });
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

  const handleToggleCamera = () => {
    setCameraOn((prev) => {
      const next = !prev;
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = next;
        });
      }
      return next;
    });
  };

  const handleToggleMic = () => {
    setMicOn((prev) => {
      const next = !prev;
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = next;
        });
      }
      return next;
    });
  };

  const recording = recordings[question.id];
  const allDone = questions.every((item) => recordings[item.id]);

  if (!setupComplete) {
    return (
      <IntervieweeSetup
        onComplete={(initialCam, initialMic) => {
          setCameraOn(initialCam);
          setMicOn(initialMic);
          setSetupComplete(true);
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Questions Sidebar */}
        <aside className="glass-panel flex flex-col rounded-3xl p-4 border border-border bg-card/60 backdrop-blur-md">
          <div className="border-b border-border/80 px-3 pb-3 pt-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Câu hỏi phỏng vấn
            </p>
            <p className="mt-1 text-xs font-semibold text-foreground">
              {Object.keys(recordings).length} / {questions.length} đã hoàn thành
            </p>
          </div>

          <div className="mt-3 space-y-1.5 overflow-x-auto lg:overflow-visible">
            {questions.map((item, index) => {
              const isDone = Boolean(recordings[item.id]);
              const isCurrent = index === questionIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => !isRecording && setQuestionIndex(index)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-all ${
                    isCurrent
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                  }`}
                >
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                      isDone
                        ? isCurrent
                          ? "bg-primary-foreground text-primary"
                          : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : isCurrent
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? <Check className="size-3.5" /> : item.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-xs font-semibold ${isCurrent ? "text-primary-foreground" : "text-foreground"}`}>
                      {item.title}
                    </p>
                    <p className={`truncate text-[10px] ${isCurrent ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                      {item.competency}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Question Details and Video Practice */}
        <div className="space-y-5">
          <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-border bg-card/60 backdrop-blur-md space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  Câu hỏi {question.number} / {questions.length}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {question.competency}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-28 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-xs font-medium text-muted-foreground">
                  {Math.round(((questionIndex + 1) / questions.length) * 100)}%
                </span>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {question.title}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-foreground/90 sm:text-lg">
                {question.prompt}
              </p>
              <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-primary">💡 Gợi ý trả lời: </span>
                {question.helper}
              </div>
            </div>

            {/* Recorder & Video Area */}
            <div className="rounded-2xl border border-border bg-background/50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">Thu âm / Video câu trả lời của bạn</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {cameraOn ? <Video className="size-3.5 text-emerald-500" /> : <VideoOff className="size-3.5 text-red-500" />}
                    {cameraOn ? "Cam bật" : "Cam tắt"}
                  </span>
                  <span className="flex items-center gap-1">
                    {micOn ? <Mic className="size-3.5 text-emerald-500" /> : <MicOff className="size-3.5 text-red-500" />}
                    {micOn ? "Mic bật" : "Mic tắt"}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                  onToggleCamera={handleToggleCamera}
                  onToggleMic={handleToggleMic}
                  onStart={startRecording}
                  onStop={finishRecording}
                  recordingUrl={recording?.url}
                />

                <div className="flex flex-1 flex-col justify-center space-y-3 sm:pl-4">
                  <div className="rounded-xl border border-border bg-card/60 p-4 space-y-2">
                    <p className="text-xs font-semibold text-foreground">Điều khiển thiết bị linh hoạt</p>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      Bạn có thể bấm nút biểu tượng <span className="font-semibold text-primary">Camera</span> hoặc <span className="font-semibold text-primary">Micro</span> bên dưới để bật/tắt thiết bị theo ý muốn trong suốt quá trình phỏng vấn.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      disabled={questionIndex === 0 || isRecording}
                      onClick={() => setQuestionIndex((index) => index - 1)}
                    >
                      <ChevronLeft className="size-4" /> Câu trước
                    </Button>
                    <Button
                      className="rounded-xl"
                      disabled={!recording || isRecording || questionIndex === questions.length - 1}
                      onClick={() => setQuestionIndex((index) => index + 1)}
                    >
                      Câu tiếp theo <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {allDone && (
            <div className="glass-panel flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-200">
              <div className="flex items-center gap-2.5">
                <Check className="size-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold">Tất cả câu trả lời đã được ghi lại thành công!</span>
              </div>
              <Button
                size="sm"
                className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => window.alert("Bản thử nghiệm: Toàn bộ câu trả lời đã sẵn sàng gửi hội đồng đánh giá.")}
              >
                Nộp bài phỏng vấn
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IntervieweeSetup({ onComplete }: { onComplete: (cameraOn: boolean, micOn: boolean) => void }) {
  const previewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [checkState, setCheckState] = useState<"idle" | "checking" | "ready" | "demo">("idle");
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [message, setMessage] = useState("");

  const stopPreview = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (previewRef.current) previewRef.current.srcObject = null;
  };

  const checkDevices = async (desiredCam = cameraEnabled, desiredMic = micEnabled) => {
    setCheckState("checking");
    setMessage("");
    stopPreview();

    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Thiết bị không khả dụng");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getVideoTracks().forEach((t) => {
        t.enabled = desiredCam;
      });
      stream.getAudioTracks().forEach((t) => {
        t.enabled = desiredMic;
      });
      streamRef.current = stream;
      setCameraReady(stream.getVideoTracks().length > 0);
      setMicReady(stream.getAudioTracks().length > 0);
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        await previewRef.current.play().catch(() => undefined);
      }
      setCheckState("ready");
    } catch {
      setCameraReady(false);
      setMicReady(false);
      setCheckState("demo");
      setMessage("Không tìm thấy camera/mic hoặc chưa cấp quyền. Hệ thống sẽ tự động chuyển sang chế độ giả lập demo để bạn trải nghiệm.");
    }
  };

  // Automatically check devices on initial load
  useEffect(() => {
    checkDevices(true, true);
    return stopPreview;
  }, []);

  const handleToggleCam = (checked: boolean) => {
    setCameraEnabled(checked);
    if (streamRef.current && streamRef.current.getVideoTracks().length > 0) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = checked;
      });
    } else if (checked) {
      checkDevices(true, micEnabled);
    }
  };

  const handleToggleMic = (checked: boolean) => {
    setMicEnabled(checked);
    if (streamRef.current && streamRef.current.getAudioTracks().length > 0) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = checked;
      });
    } else if (checked) {
      checkDevices(cameraEnabled, true);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-border bg-card/60 backdrop-blur-md">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            Chuẩn bị phỏng vấn
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl text-foreground">
            Kiểm tra & Tùy chỉnh Camera & Micro
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Bạn có thể bật hoặc tắt camera và micro bất cứ lúc nào tùy theo nhu cầu phỏng vấn.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-slate-950/80 shadow-lg">
            <video
              ref={previewRef}
              muted
              playsInline
              className={`size-full object-cover ${cameraEnabled && cameraReady ? "" : "hidden"}`}
            />
            {(!cameraReady || !cameraEnabled) && (
              <div className="absolute inset-0 grid place-items-center p-4 text-center text-muted-foreground">
                <div>
                  {!cameraEnabled ? (
                    <>
                      <VideoOff className="mx-auto size-8 text-amber-500/80" />
                      <p className="mt-2 text-xs font-semibold text-foreground/80">Camera đang tắt</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">Chế độ chỉ sử dụng Microphone</p>
                    </>
                  ) : (
                    <>
                      <Video className="mx-auto size-8 opacity-40" />
                      <p className="mt-2 text-xs">Bấm "Kiểm tra thiết bị" để xem trước</p>
                    </>
                  )}
                </div>
              </div>
            )}
            {cameraReady && (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
                <span className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold backdrop-blur-md ${
                  cameraEnabled ? "bg-emerald-500/80 text-white" : "bg-red-500/80 text-white"
                }`}>
                  {cameraEnabled ? "Cam: Bật" : "Cam: Tắt"}
                </span>
                <span className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold backdrop-blur-md ${
                  micEnabled ? "bg-emerald-500/80 text-white" : "bg-red-500/80 text-white"
                }`}>
                  {micEnabled ? "Mic: Bật" : "Mic: Tắt"}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-border bg-background/50 px-4 py-3">
                <span className="flex items-center gap-3 text-sm font-semibold text-foreground">
                  <span className={`grid size-8 place-items-center rounded-xl ${cameraEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {cameraEnabled ? <Video className="size-4" /> : <VideoOff className="size-4" />}
                  </span>
                  Camera
                </span>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold ${
                      checkState === "checking"
                        ? "text-muted-foreground"
                        : cameraReady
                        ? cameraEnabled
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                        : "text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {checkState === "checking"
                      ? "Đang kết nối…"
                      : cameraReady
                      ? cameraEnabled
                        ? "Đang bật"
                        : "Đã tắt"
                      : "Chế độ Demo"}
                  </span>
                  <Switch checked={cameraEnabled} onCheckedChange={handleToggleCam} aria-label="Bật/tắt camera" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-border bg-background/50 px-4 py-3">
                <span className="flex items-center gap-3 text-sm font-semibold text-foreground">
                  <span className={`grid size-8 place-items-center rounded-xl ${micEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {micEnabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
                  </span>
                  Microphone
                </span>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold ${
                      checkState === "checking"
                        ? "text-muted-foreground"
                        : micReady
                        ? micEnabled
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                        : "text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {checkState === "checking"
                      ? "Đang kết nối…"
                      : micReady
                      ? micEnabled
                        ? "Đang bật"
                        : "Đã tắt"
                      : "Chế độ Demo"}
                  </span>
                  <Switch checked={micEnabled} onCheckedChange={handleToggleMic} aria-label="Bật/tắt mic" />
                </div>
              </div>
            </div>

            {message && (
              <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                {message}
              </p>
            )}

            <div className="space-y-2 pt-2">
              <Button
                onClick={() => checkDevices(cameraEnabled, micEnabled)}
                disabled={checkState === "checking"}
                className="w-full rounded-xl"
              >
                <Radio className="size-4" />{" "}
                {checkState === "checking" ? "Đang kiểm tra thiết bị…" : "Kiểm tra lại thiết bị"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  stopPreview();
                  onComplete(cameraEnabled, micEnabled);
                }}
                disabled={checkState === "checking"}
                className="w-full rounded-xl"
              >
                Bắt đầu phỏng vấn <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
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
    <div className="w-full sm:w-[250px] shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
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
              <div className="absolute inset-0 grid place-items-center bg-slate-900">
                <div className="text-center text-white/70">
                  <VideoOff className="mx-auto size-7 text-red-400" />
                  <p className="mt-2 font-semibold text-xs text-white">Camera đang tắt</p>
                  <p className="mt-0.5 text-[10px] text-white/50">Chỉ ghi nhận âm thanh</p>
                </div>
              </div>
            )}
            {cameraOn && !isRecording && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-lg">
                    AP
                  </div>
                  <p className="mt-2 text-[11px] font-semibold text-white/80">Khung xem trước</p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
          <span className={`size-1.5 rounded-full ${isRecording ? "animate-pulse bg-red-400" : "bg-emerald-400"}`} />
          {isRecording ? "Đang ghi..." : hasRecording ? "Đã lưu" : "Sẵn sàng"}
        </div>

        {!micOn && (
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-lg bg-red-500/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            <MicOff className="size-3" /> Mic tắt
          </div>
        )}

        <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/60 px-2 py-1 font-mono text-[10px] text-white backdrop-blur-sm">
          {formatDuration(elapsed)}
        </div>
      </div>

      {permissionMessage && (
        <p className="border-b border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[10px] text-amber-800 dark:text-amber-200">
          {permissionMessage}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 p-2.5">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onToggleCamera}
            title={cameraOn ? "Tắt Camera" : "Bật Camera"}
            className={`grid size-8 place-items-center rounded-xl border transition-all ${
              cameraOn
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20"
            }`}
            aria-label={cameraOn ? "Tắt camera" : "Bật camera"}
          >
            {cameraOn ? <Video className="size-3.5" /> : <VideoOff className="size-3.5" />}
          </button>
          
          <button
            type="button"
            onClick={onToggleMic}
            title={micOn ? "Tắt Micro" : "Bật Micro"}
            className={`grid size-8 place-items-center rounded-xl border transition-all ${
              micOn
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20"
            }`}
            aria-label={micOn ? "Tắt micro" : "Bật micro"}
          >
            {micOn ? <Mic className="size-3.5" /> : <MicOff className="size-3.5" />}
          </button>
        </div>

        {isRecording ? (
          <Button
            size="sm"
            onClick={onStop}
            className="rounded-xl bg-red-500 text-xs text-white hover:bg-red-600"
          >
            <Pause className="size-3.5" /> Dừng
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onStart}
            className="rounded-xl text-xs"
          >
            <Radio className="size-3.5" /> {hasRecording ? "Thu lại" : "Bắt đầu"}
          </Button>
        )}
      </div>

      {hasRecording && (
        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
          <span>{realRecording ? (cameraOn ? "Video sẵn sàng." : "Audio sẵn sàng.") : "Bản thu demo đã lưu."}</span>
          <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <Save className="size-3" /> {saveState === "saving" ? "Đang lưu…" : "Đã lưu"}
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
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Hồ sơ phỏng vấn" value="3 ứng viên" icon={UserRound} />
        <MetricCard label="Đang đánh giá" value={candidate.name} icon={Video} />
        <MetricCard label="Điểm trung bình" value={`${average.toFixed(1)} / 5`} icon={Star} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Candidates Queue */}
        <aside className="glass-panel flex flex-col rounded-3xl p-4 border border-border bg-card/60 backdrop-blur-md">
          <div className="flex items-center justify-between px-3 pb-3 pt-1 border-b border-border/80">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Hàng chờ duyệt
              </p>
              <p className="mt-0.5 text-xs font-semibold text-foreground">Danh sách ứng viên</p>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              3
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {demoCandidates.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setCandidate(item)}
                className={`w-full rounded-2xl p-3.5 text-left transition-all ${
                  candidate.id === item.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border/60 bg-background/40 hover:bg-background/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-xl text-xs font-bold ${
                      candidate.id === item.id ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {item.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold">{item.name}</span>
                    <span className={`block truncate text-[11px] ${candidate.id === item.id ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                      {item.role}
                    </span>
                  </div>
                </div>
                <div className={`mt-2.5 flex items-center justify-between text-[10px] ${candidate.id === item.id ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                  <span>{item.submitted}</span>
                  <span className="font-medium">{item.progress === 100 ? "Hoàn thành" : item.status}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold text-primary">
              <ShieldCheck className="size-4" /> Đánh giá chuẩn hóa
            </div>
            <p className="mt-1 text-[11px] leading-relaxed">
              Áp dụng chung bộ tiêu chí rubrics cho mọi ứng viên để đảm bảo tính khách quan.
            </p>
          </div>
        </aside>

        {/* Candidate Active Evaluation */}
        <div className="space-y-5">
          <section className="glass-panel rounded-3xl p-6 border border-border bg-card/60 backdrop-blur-md space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary font-display text-base font-bold text-primary-foreground shadow-sm">
                  {candidate.initials}
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">{candidate.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {candidate.role} · nộp bài lúc {candidate.submitted}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <Check className="size-3.5" /> {candidate.status}
              </div>
            </div>

            {/* Questions Tabs */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {questions.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setQuestionIndex(index)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                    questionIndex === index
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : "border-border bg-background/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Câu {item.number}</span>
                  <span className="ml-1.5 hidden sm:inline opacity-80">· {item.competency}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            {/* Playback card */}
            <section className="glass-panel overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur-md shadow-md">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Video câu trả lời
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-foreground">{question.title}</p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {candidate.duration}
                </span>
              </div>
              <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950">
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-xl">
                      {candidate.initials}
                    </div>
                    <p className="mt-2.5 text-xs font-semibold text-white/90">
                      Câu trả lời của {candidate.name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/50">Trình phát phỏng vấn</p>
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setPlaying((value) => !value)}
                    className="grid size-7 place-items-center rounded-lg bg-white text-slate-950"
                  >
                    {playing ? <Pause className="size-3" /> : <Play className="size-3 fill-current" />}
                  </button>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                    <div className={`h-full rounded-full bg-primary ${playing ? "w-2/5" : "w-1/5"}`} />
                  </div>
                  <span className="font-mono text-[10px] text-white/60">02:18 / 03:00</span>
                  <Volume2 className="size-3.5 text-white/60" />
                </div>
              </div>
              <div className="flex items-center justify-between px-5 py-3 text-xs text-muted-foreground border-t border-border">
                <span className="flex items-center gap-1.5">
                  <FileText className="size-3.5" /> Bản ghi phụ đề tự động (AI Transcript)
                </span>
              </div>
            </section>

            {/* Rubrics & Score Card */}
            <section className="glass-panel rounded-3xl p-5 border border-border bg-card/60 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Tiêu chí chấm điểm
                  </p>
                  <h4 className="mt-0.5 font-display text-base font-bold text-foreground">
                    {question.competency}
                  </h4>
                </div>
                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                  {score ? `${score}/5` : "Chưa chấm"}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => {
                      setScores((current) => ({ ...current, [question.id]: value }));
                      queueAutosave();
                    }}
                    className={`grid aspect-square place-items-center rounded-xl border text-sm font-bold transition-all ${
                      score === value
                        ? "border-amber-500 bg-amber-400 text-amber-950 shadow-xs"
                        : "border-border bg-background/60 text-muted-foreground hover:border-amber-400/50 hover:text-foreground"
                    }`}
                    aria-label={`Điểm ${value}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{scoreLabels[0]}</span>
                <span>{scoreLabels[4]}</span>
              </div>

              <Textarea
                value={notes}
                onChange={(event) => {
                  setNotes(event.target.value);
                  queueAutosave();
                }}
                className="min-h-24 resize-none rounded-xl bg-background/60 text-xs"
                placeholder="Ghi chú đánh giá dành cho hội đồng..."
              />

              <div className="flex items-center justify-between gap-3 pt-1">
                <Button
                  size="sm"
                  className="rounded-xl"
                  onClick={() => {
                    setSaved(true);
                    setAutoSaveState("saved");
                  }}
                  disabled={!score}
                >
                  <Save className="size-3.5" /> Lưu đánh giá
                </Button>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3" />{" "}
                  {autoSaveState === "saving" ? "Đang lưu…" : saved ? "Đã lưu tự động" : "Sẵn sàng lưu"}
                </span>
              </div>
            </section>
          </div>

          <section className="glass-panel flex flex-col gap-4 rounded-3xl border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">Hoàn tất đánh giá ứng viên</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Đồng bộ kết quả chấm điểm vào không gian tuyển dụng Adaptive.
              </p>
            </div>
            <Button
              variant="outline"
              className="shrink-0 rounded-xl"
              onClick={() => setSentToAdaptive(true)}
            >
              {sentToAdaptive ? (
                <>
                  <Check className="size-4 text-emerald-600" /> Đã gửi đánh giá
                </>
              ) : (
                <>
                  Xác nhận & Chuyển giao <ChevronRight className="size-4" />
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
    <div className="glass-panel flex items-center gap-3.5 rounded-2xl border border-border bg-card/60 p-4">
      <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
