import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  MessageSquareText,
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
  time: string;
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
    id: "project",
    number: 1,
    title: "A project you're proud of",
    prompt: "Tell us about a project you are proud of. What was the problem, what did you own, and what changed because of your work?",
    helper: "A clear story usually takes 2–3 minutes. Context → action → result.",
    time: "03:00",
    competency: "Ownership & impact",
  },
  {
    id: "tradeoff",
    number: 2,
    title: "Make a difficult trade-off",
    prompt: "Describe a time you had to choose between speed and quality. How did you decide, and what did you learn afterwards?",
    helper: "We are interested in your thinking, not a perfect outcome.",
    time: "03:00",
    competency: "Judgement",
  },
  {
    id: "shoes",
    number: 3,
    title: "Sell this pair of old shoes",
    prompt: "This is a pair of worn-out shoes. Tell us your process, then persuade your target customer to buy them from you.",
    helper: "Take a moment to identify the customer before you start pitching.",
    time: "04:00",
    competency: "Communication",
  },
  {
    id: "first-month",
    number: 4,
    title: "Your first 30 days",
    prompt: "If you joined the team, what would you want to understand or accomplish in your first 30 days?",
    helper: "Be concrete: people, product, priorities, and one early signal of progress.",
    time: "03:00",
    competency: "Collaboration",
  },
];

const demoCandidates: DemoCandidate[] = [
  { id: "maya", name: "Maya Nguyen", role: "Senior Backend Engineer", initials: "MN", submitted: "Today, 10:32", duration: "12:48", progress: 100, status: "Ready to review" },
  { id: "alex", name: "Alex Tran", role: "Senior Backend Engineer", initials: "AT", submitted: "Yesterday, 16:08", duration: "13:21", progress: 100, status: "Ready to review" },
  { id: "jordan", name: "Jordan Lee", role: "Senior Backend Engineer", initials: "JL", submitted: "Yesterday, 11:42", duration: "08:06", progress: 75, status: "3 of 4 answers" },
];

const scoreLabels = ["Needs work", "Developing", "Solid", "Strong", "Exceptional"];

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

export function InterviewLab() {
  const [mode, setMode] = useState<InterviewMode>("interviewee");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [recordings, setRecordings] = useState<Record<string, Recording>>({});
  const [reviewCandidate, setReviewCandidate] = useState<DemoCandidate>(demoCandidates[0]!);
  const [reviewQuestion, setReviewQuestion] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({ project: 4, tradeoff: 4, shoes: 3, "first-month": 4 });
  const [notes, setNotes] = useState("Clear structure and strong ownership. Ask one follow-up about the measurement of impact.");
  const [savedEvaluation, setSavedEvaluation] = useState(false);

  return (
    <div className="rise space-y-5 pb-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card/75 p-5 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#172554] text-white shadow-lg shadow-blue-950/15">
            <Video className="size-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Adaptive / Interview Lab</p>
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300">PROTOTYPE</span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight">Interview, with less friction.</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Let candidates answer on their own time, then give interviewers one calm place to watch, compare, and record a thoughtful evaluation.</p>
          </div>
        </div>
        <div className="flex rounded-2xl border border-border bg-background/70 p-1">
          <button type="button" onClick={() => setMode("interviewee")} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${mode === "interviewee" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <UserRound className="size-4" /> Interviewee
          </button>
          <button type="button" onClick={() => setMode("interviewer")} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${mode === "interviewer" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <Award className="size-4" /> Interviewer
          </button>
        </div>
      </div>

      {mode === "interviewee" ? (
        <IntervieweeFlow recordings={recordings} setRecordings={setRecordings} questionIndex={questionIndex} setQuestionIndex={setQuestionIndex} />
      ) : (
        <InterviewerFlow candidate={reviewCandidate} setCandidate={setReviewCandidate} questionIndex={reviewQuestion} setQuestionIndex={setReviewQuestion} scores={scores} setScores={setScores} notes={notes} setNotes={setNotes} saved={savedEvaluation} setSaved={setSavedEvaluation} />
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
  const [permissionMessage, setPermissionMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    const currentUrl = recordings[question.id]?.url;
    if (currentUrl) URL.revokeObjectURL(currentUrl);
  }, [recordings, question.id]);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const finishRecording = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordings((current) => ({ ...current, [question.id]: { url, duration, real: true } }));
        recorderRef.current = null;
        stopStream();
      };
      recorderRef.current.stop();
    } else {
      setRecordings((current) => ({ ...current, [question.id]: { duration, real: false } }));
      stopStream();
    }
    setIsRecording(false);
  };

  const startRecording = async () => {
    setPermissionMessage("");
    chunksRef.current = [];
    startedAtRef.current = Date.now();
    setElapsed(0);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000)), 250);

    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error("Recording is not available in this browser");
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
      setPermissionMessage("Camera/mic chưa được cấp quyền. Bạn vẫn có thể chạy thử luồng ghi hình demo ở chế độ mô phỏng.");
      setIsRecording(true);
    }
  };

  const recording = recordings[question.id];
  const allDone = questions.every((item) => recordings[item.id]);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <MetricCard label="Role" value="Senior Backend Engineer" icon={FileText} />
        <MetricCard label="Questions" value={`${questionIndex + 1} / ${questions.length}`} icon={MessageSquareText} />
        <MetricCard label="Estimated time" value="~ 15 minutes" icon={Clock3} />
        <MetricCard label="Privacy" value="Panel only" icon={ShieldCheck} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-border bg-card/65 p-3 shadow-sm">
          <div className="flex items-center justify-between px-3 pb-3 pt-2">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Your interview</p>
              <p className="mt-1 text-sm font-semibold">Answer at your pace</p>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-1 font-mono text-[10px] font-bold text-primary">{Object.keys(recordings).length}/{questions.length}</span>
          </div>
          <div className="space-y-1">
            {questions.map((item, index) => (
              <button key={item.id} type="button" onClick={() => !isRecording && setQuestionIndex(index)} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors ${index === questionIndex ? "bg-primary text-primary-foreground" : "hover:bg-background/80"}`}>
                <span className={`grid size-8 shrink-0 place-items-center rounded-xl text-xs font-bold ${index === questionIndex ? "bg-white/15" : recordings[item.id] ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                  {recordings[item.id] ? <Check className="size-4" /> : `0${item.number}`}
                </span>
                <span className="min-w-0"><span className="block truncate text-sm font-semibold">{item.title}</span><span className={`mt-0.5 block text-[11px] ${index === questionIndex ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{item.competency}</span></span>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-blue-500/15 bg-blue-500/5 p-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold text-foreground"><CircleHelp className="size-4 text-blue-600" /> Need a reset?</div>
            <p className="mt-1.5 leading-relaxed">You can pause between questions. There is no live interviewer in this step.</p>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-3xl border border-border bg-card/75 p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-300"><span className="grid size-7 place-items-center rounded-lg bg-blue-500/10">0{question.number}</span> {question.competency}</div>
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 font-mono text-[10px] font-bold text-muted-foreground"><Clock3 className="size-3" /> suggested {question.time}</span>
            </div>
            <h3 className="mt-7 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{question.title}</h3>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-foreground/80">{question.prompt}</p>
            <div className="mt-6 flex gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/8 p-4 text-sm text-muted-foreground"><span className="mt-0.5 text-amber-600">✦</span><p><span className="font-semibold text-foreground">A small prompt:</span> {question.helper}</p></div>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <Button variant="outline" className="rounded-xl" disabled={questionIndex === 0 || isRecording} onClick={() => setQuestionIndex((index) => index - 1)}><ChevronLeft className="size-4" /> Previous</Button>
              <Button className="rounded-xl" disabled={!recording || isRecording || questionIndex === questions.length - 1} onClick={() => setQuestionIndex((index) => index + 1)}>Next question <ChevronRight className="size-4" /></Button>
              {recording && <span className="ml-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><Check className="size-3.5" /> Answer saved · {formatDuration(recording.duration)}</span>}
            </div>
          </section>

          <RecorderCard videoRef={videoRef} isRecording={isRecording} elapsed={isRecording ? elapsed : recording?.duration ?? elapsed} cameraOn={cameraOn} micOn={micOn} permissionMessage={permissionMessage} hasRecording={Boolean(recording)} realRecording={Boolean(recording?.real)} onToggleCamera={() => setCameraOn((value) => !value)} onToggleMic={() => setMicOn((value) => !value)} onStart={startRecording} onStop={finishRecording} recordingUrl={recording?.url} />
        </div>
      </div>

      {allDone && <div className="flex flex-col gap-4 rounded-3xl border border-emerald-500/25 bg-emerald-500/8 p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2 font-display text-lg font-bold"><Check className="size-5 text-emerald-600" /> Your interview is complete</div><p className="mt-1 text-sm text-muted-foreground">Review your answers once more, then submit them to the interview panel.</p></div><Button className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => window.alert("Prototype: answers are ready to submit to the interview panel.")}><ArrowRight className="size-4" /> Submit interview</Button></div>}
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
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onStart: () => void;
  onStop: () => void;
  recordingUrl?: string | undefined;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0f172a] text-white shadow-xl shadow-slate-950/20">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div className="flex items-center gap-2 text-sm font-semibold"><span className={`size-2 rounded-full ${isRecording ? "animate-pulse bg-red-400" : "bg-emerald-400"}`} /> {isRecording ? "Recording answer" : hasRecording ? "Answer captured" : "Ready when you are"}</div><span className="font-mono text-xs text-white/55">{formatDuration(elapsed)}</span></div>
      <div className="relative aspect-[4/3] overflow-hidden bg-[#172033]">
        {recordingUrl ? <video src={recordingUrl} controls className="size-full object-cover" /> : <>
          <video ref={videoRef} muted playsInline className={`size-full object-cover ${cameraOn ? "" : "hidden"}`} />
          {!cameraOn && <div className="absolute inset-0 grid place-items-center"><div className="text-center"><VideoOff className="mx-auto size-8 text-white/35" /><p className="mt-2 text-sm text-white/55">Camera is off</p></div></div>}
          {cameraOn && !isRecording && <div className="pointer-events-none absolute inset-0 grid place-items-center"><div className="text-center"><div className="mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-2xl font-extrabold shadow-2xl shadow-blue-950/30">TN</div><p className="mt-3 text-sm font-semibold text-white/80">Camera preview</p><p className="mt-1 text-xs text-white/45">Your video will appear here</p></div></div>}
        </>}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-2.5 py-1.5 text-[11px] text-white/70 backdrop-blur-md"><ShieldCheck className="size-3.5 text-emerald-300" /> Panel-only recording</div>
      </div>
      {permissionMessage && <p className="border-b border-amber-400/15 bg-amber-400/10 px-4 py-3 text-xs leading-relaxed text-amber-100">{permissionMessage}</p>}
      <div className="flex items-center justify-between gap-2 px-4 py-4"><div className="flex gap-2"><button type="button" onClick={onToggleCamera} className={`grid size-10 place-items-center rounded-xl border border-white/10 ${cameraOn ? "bg-white/10 text-white" : "bg-red-400/15 text-red-200"}`} aria-label="Toggle camera">{cameraOn ? <Video className="size-4" /> : <VideoOff className="size-4" />}</button><button type="button" onClick={onToggleMic} className={`grid size-10 place-items-center rounded-xl border border-white/10 ${micOn ? "bg-white/10 text-white" : "bg-red-400/15 text-red-200"}`} aria-label="Toggle microphone">{micOn ? <Mic className="size-4" /> : <Volume2 className="size-4" />}</button></div>{isRecording ? <Button onClick={onStop} className="rounded-xl bg-red-500 text-white hover:bg-red-600"><Pause className="size-4" /> Stop & save</Button> : <Button onClick={onStart} className="rounded-xl bg-white text-slate-950 hover:bg-slate-100"><Radio className="size-4 text-red-500" /> {hasRecording ? "Record again" : "Start recording"}</Button>}</div>
      {hasRecording && <div className="border-t border-white/10 px-4 py-3 text-xs text-white/55">{realRecording ? "Video answer is ready for the interviewer to review." : "Demo answer saved. Connect storage later to persist the video file."}</div>}
    </section>
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
  const average = useMemo(() => Object.values(scores).reduce((total, value) => total + value, 0) / Object.values(scores).length, [scores]);
  const [playing, setPlaying] = useState(false);
  const [sentToAdaptive, setSentToAdaptive] = useState(false);

  useEffect(() => {
    setSaved(false);
    setPlaying(false);
  }, [candidate.id, questionIndex, setSaved]);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Candidates" value="3 submissions" icon={UserRound} />
        <MetricCard label="Currently reviewing" value={candidate.name} icon={Video} />
        <MetricCard label="Overall score" value={`${average.toFixed(1)} / 5`} icon={Star} />
      </div>
      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-border bg-card/65 p-3 shadow-sm">
          <div className="flex items-center justify-between px-3 pb-3 pt-2"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Submissions</p><p className="mt-1 text-sm font-semibold">Review queue</p></div><span className="rounded-full bg-amber-500/12 px-2 py-1 font-mono text-[10px] font-bold text-amber-700 dark:text-amber-300">3</span></div>
          <div className="space-y-1">{demoCandidates.map((item) => <button type="button" key={item.id} onClick={() => setCandidate(item)} className={`w-full rounded-2xl p-3 text-left transition-colors ${candidate.id === item.id ? "bg-primary text-primary-foreground" : "hover:bg-background/80"}`}><div className="flex items-center gap-3"><span className={`grid size-9 shrink-0 place-items-center rounded-xl text-xs font-bold ${candidate.id === item.id ? "bg-white/15" : "bg-blue-500/10 text-blue-700 dark:text-blue-300"}`}>{item.initials}</span><span className="min-w-0"><span className="block truncate text-sm font-semibold">{item.name}</span><span className={`block truncate text-[11px] ${candidate.id === item.id ? "text-primary-foreground/65" : "text-muted-foreground"}`}>{item.role}</span></span></div><div className={`mt-3 flex items-center justify-between text-[11px] ${candidate.id === item.id ? "text-primary-foreground/65" : "text-muted-foreground"}`}><span>{item.submitted}</span><span>{item.progress === 100 ? "Complete" : item.status}</span></div></button>)}</div>
          <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-3"><div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="size-4 text-emerald-600" /> Structured review</div><p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">Use the same rubric for every candidate before making a decision.</p></div>
        </aside>

        <div className="space-y-5">
          <section className="rounded-3xl border border-border bg-card/75 p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 font-bold text-white">{candidate.initials}</span><div><h3 className="font-display text-xl font-extrabold">{candidate.name}</h3><p className="text-sm text-muted-foreground">{candidate.role} · submitted {candidate.submitted}</p></div></div><div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><Check className="size-3.5" /> {candidate.status}</div></div><div className="mt-5 grid gap-2 sm:grid-cols-4">{questions.map((item, index) => <button type="button" key={item.id} onClick={() => setQuestionIndex(index)} className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors ${questionIndex === index ? "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300" : "border-border bg-background/45 text-muted-foreground hover:text-foreground"}`}><span className="font-mono">0{item.number}</span><span className="ml-2 hidden xl:inline">{item.competency}</span></button>)}</div></section>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
            <section className="overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0f172a] text-white shadow-xl shadow-slate-950/20"><div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">Recorded answer</p><p className="mt-1 text-sm font-semibold">{question.title}</p></div><span className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[10px] text-white/65">{candidate.duration}</span></div><div className="relative aspect-video bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950"><div className="absolute inset-0 grid place-items-center"><div className="text-center"><div className="mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-2xl font-extrabold shadow-2xl">{candidate.initials}</div><p className="mt-3 text-sm font-semibold text-white/80">{candidate.name}'s answer</p><p className="mt-1 text-xs text-white/45">Prototype playback surface</p></div></div><div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-3 py-2 backdrop-blur-md"><button type="button" onClick={() => setPlaying((value) => !value)} className="grid size-8 place-items-center rounded-lg bg-white text-slate-950">{playing ? <Pause className="size-3.5" /> : <Play className="size-3.5 fill-current" />}</button><div className="h-1 flex-1 overflow-hidden rounded-full bg-white/15"><div className={`h-full rounded-full bg-blue-400 ${playing ? "w-2/5" : "w-1/5"}`} /></div><span className="font-mono text-[10px] text-white/55">02:18 / 03:00</span><Volume2 className="size-3.5 text-white/55" /></div></div><div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-xs text-white/55"><span className="flex items-center gap-1.5"><FileText className="size-3.5" /> Transcript ready in next phase</span><button type="button" className="font-semibold text-blue-300 hover:text-white">Open full screen</button></div></section>

            <section className="rounded-3xl border border-border bg-card/75 p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Evaluation</p><h3 className="mt-1 font-display text-xl font-extrabold">{question.competency}</h3></div><span className="rounded-full bg-amber-500/12 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">{score ? `${score}/5` : "Not scored"}</span></div><p className="mt-4 text-sm leading-relaxed text-muted-foreground">How effectively did this answer demonstrate the competency?</p><div className="mt-4 grid grid-cols-5 gap-1.5">{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} onClick={() => { setScores((current) => ({ ...current, [question.id]: value })); setSaved(false); }} className={`grid aspect-square place-items-center rounded-xl border text-sm font-bold transition-colors ${score === value ? "border-amber-500 bg-amber-400 text-amber-950" : "border-border bg-background/60 text-muted-foreground hover:border-amber-400/50 hover:text-foreground"}`} aria-label={`Score ${value}`}>{value}</button>)}</div><div className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span>{scoreLabels[0]}</span><span>{scoreLabels[4]}</span></div><Textarea value={notes} onChange={(event) => { setNotes(event.target.value); setSaved(false); }} className="mt-5 min-h-28 resize-none rounded-2xl bg-background/50 text-sm" placeholder="Add a concise note for your panel..." /><div className="mt-3 flex items-center justify-between gap-3"><Button className="rounded-xl" onClick={() => setSaved(true)} disabled={!score}><Save className="size-4" /> Save evaluation</Button>{saved && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><Check className="size-3.5" /> Saved</span>}</div></section>
          </div>

          <section className="flex flex-col gap-4 rounded-3xl border border-blue-500/20 bg-blue-500/6 p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2 font-display text-lg font-bold"><ArrowRight className="size-5 text-blue-600" /> Next step: hand off to Adaptive</div><p className="mt-1 text-sm text-muted-foreground">Once the panel finishes scoring, send the structured evaluation—not raw video—to the Adaptive hiring workspace.</p></div><Button variant="outline" className="shrink-0 rounded-xl border-blue-500/30 bg-background/60" onClick={() => setSentToAdaptive(true)}>{sentToAdaptive ? <><Check className="size-4 text-emerald-600" /> Sent to Adaptive</> : <>Prepare handoff <ArrowRight className="size-4" /></>}</Button></section>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof FileText }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 p-4"><span className="grid size-9 place-items-center rounded-xl bg-primary/8 text-primary"><Icon className="size-4" /></span><div className="min-w-0"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">{label}</p><p className="mt-1 truncate text-sm font-semibold">{value}</p></div></div>;
}
