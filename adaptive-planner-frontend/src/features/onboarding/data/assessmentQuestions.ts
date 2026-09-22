export interface AssessmentOption {
  label: string;
  sublabel?: string;
  scoreValue: number; // 1 to 4
}

export interface AssessmentQuestion {
  id: string;
  dimension: 'ATTENTION' | 'TASK_INITIATION' | 'TIME_AWARENESS' | 'CONTEXT_SWITCHING' | 'SENSORY_SENSITIVITY' | 'STRUCTURE_NEED';
  dimensionLabel: string;
  title: string;
  subtitle: string;
  options: AssessmentOption[];
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'att_distraction',
    dimension: 'ATTENTION',
    dimensionLabel: 'Attention & Focus',
    title: 'How easily do notifications, background sounds, or passing thoughts pull you away from your work?',
    subtitle: 'This helps us tune visual noise filtering and focus mode intensity.',
    options: [
      { label: 'Rarely', sublabel: 'I can easily filter out distractions', scoreValue: 1 },
      { label: 'Occasionally', sublabel: 'Only when tired or stressed', scoreValue: 2 },
      { label: 'Often', sublabel: 'Distractions regularly break my flow', scoreValue: 3 },
      { label: 'Very easily', sublabel: 'Tiny interruptions require lots of effort to recover from', scoreValue: 4 },
    ],
  },
  {
    id: 'att_hyperfocus',
    dimension: 'ATTENTION',
    dimensionLabel: 'Attention & Focus',
    title: 'How often do you experience deep hyperfocus where you lose track of time, hunger, or surroundings?',
    subtitle: 'This helps us recommend gentle hydration and transition prompts.',
    options: [
      { label: 'Rarely or never', scoreValue: 1 },
      { label: 'Sometimes', sublabel: 'A few times a month on interesting tasks', scoreValue: 2 },
      { label: 'Frequently', sublabel: 'Weekly when engaged in projects', scoreValue: 3 },
      { label: 'Almost daily', sublabel: 'It is my primary mode of deep work', scoreValue: 4 },
    ],
  },
  {
    id: 'init_paralysis',
    dimension: 'TASK_INITIATION',
    dimensionLabel: 'Task Initiation',
    title: 'When staring at a complex or unstructured task, how often do you feel "task paralysis"?',
    subtitle: 'Knowing where to start can be the hardest part of the day.',
    options: [
      { label: 'Rarely', sublabel: 'I usually just dive straight in', scoreValue: 1 },
      { label: 'Occasionally', sublabel: 'When the scope is vague', scoreValue: 2 },
      { label: 'Often', sublabel: 'I get stuck wondering which step comes first', scoreValue: 3 },
      { label: 'Frequently', sublabel: 'Starting takes massive emotional activation energy', scoreValue: 4 },
    ],
  },
  {
    id: 'init_microsteps',
    dimension: 'TASK_INITIATION',
    dimensionLabel: 'Task Initiation',
    title: 'How helpful is having an AI break down daunting tasks into 2–5 minute bite-sized micro-steps?',
    subtitle: 'Micro-step decomposition lowers the activation threshold.',
    options: [
      { label: 'Not needed', sublabel: 'I prefer seeing the whole big picture', scoreValue: 1 },
      { label: 'Nice to have', sublabel: 'Helpful for very large projects', scoreValue: 2 },
      { label: 'Very helpful', sublabel: 'Makes tasks feel achievable immediately', scoreValue: 3 },
      { label: 'Essential', sublabel: 'The single most effective way I get started', scoreValue: 4 },
    ],
  },
  {
    id: 'time_blindness',
    dimension: 'TIME_AWARENESS',
    dimensionLabel: 'Time Awareness',
    title: 'How often do you experience "time blindness" (e.g., misjudging how fast 30 minutes passes)?',
    subtitle: 'We use this to calculate protective buffer blocks automatically.',
    options: [
      { label: 'Rarely', sublabel: 'I have a strong internal clock', scoreValue: 1 },
      { label: 'Occasionally', sublabel: 'Mainly when having lots of fun or rushing', scoreValue: 2 },
      { label: 'Often', sublabel: 'Tasks often take 2-3x longer than expected', scoreValue: 3 },
      { label: 'Constantly', sublabel: 'Time feels like an abstract, unpredictable concept', scoreValue: 4 },
    ],
  },
  {
    id: 'time_visual_cues',
    dimension: 'TIME_AWARENESS',
    dimensionLabel: 'Time Awareness',
    title: 'How do visual timers, countdown progress bars, or buffer blocks feel to you?',
    subtitle: 'We want timers to feel supportive, never inducing panic.',
    options: [
      { label: 'Stressful', sublabel: 'They create urgency anxiety', scoreValue: 1 },
      { label: 'Neutral', sublabel: 'I do not pay much attention to them', scoreValue: 2 },
      { label: 'Helpful', sublabel: 'They anchor my sense of remaining time', scoreValue: 3 },
      { label: 'Essential grounding', sublabel: 'They make the passage of time visible and safe', scoreValue: 4 },
    ],
  },
  {
    id: 'context_interruption',
    dimension: 'CONTEXT_SWITCHING',
    dimensionLabel: 'Context Switching',
    title: 'How draining or disorienting is it when your schedule is interrupted or changes unexpectedly?',
    subtitle: 'This helps us automate schedule rebalancing with minimal friction.',
    options: [
      { label: 'Easy to adapt', sublabel: 'I pivot effortlessly with no frustration', scoreValue: 1 },
      { label: 'Mild friction', sublabel: 'A brief pause is enough to adapt', scoreValue: 2 },
      { label: 'Quite exhausting', sublabel: 'It derails my momentum for hours', scoreValue: 3 },
      { label: 'Extremely dysregulating', sublabel: 'Sudden changes cause acute cognitive overload', scoreValue: 4 },
    ],
  },
  {
    id: 'context_recovery',
    dimension: 'CONTEXT_SWITCHING',
    dimensionLabel: 'Context Switching',
    title: 'Between consecutive meetings or tasks, how much buffer/decompression time do you need?',
    subtitle: 'Modo will automatically insert breathing spaces between blocks.',
    options: [
      { label: 'None (0–2 mins)', sublabel: 'Back-to-back works fine', scoreValue: 1 },
      { label: 'Short (5 mins)', sublabel: 'Just a quick drink of water', scoreValue: 2 },
      { label: 'Moderate (10–15 mins)', sublabel: 'A real pause to reset my headspace', scoreValue: 3 },
      { label: 'Long (20+ mins)', sublabel: 'Adequate decompression is necessary to function', scoreValue: 4 },
    ],
  },
  {
    id: 'sensory_visual_noise',
    dimension: 'SENSORY_SENSITIVITY',
    dimensionLabel: 'Sensory Sensitivity',
    title: 'How sensitive are you to visual noise, dense dashboards, bright badges, or busy layouts?',
    subtitle: 'We calibrate color saturation, animation speed, and layout density.',
    options: [
      { label: 'Low sensitivity', sublabel: 'Dense data and complex layouts are fine', scoreValue: 1 },
      { label: 'Moderate', sublabel: 'I like clean looks but tolerate complexity', scoreValue: 2 },
      { label: 'High', sublabel: 'Crowded screens make me feel overwhelmed quickly', scoreValue: 3 },
      { label: 'Very high', sublabel: 'I need calm, minimalist, low-stimulation visuals', scoreValue: 4 },
    ],
  },
  {
    id: 'sensory_calm_mode',
    dimension: 'SENSORY_SENSITIVITY',
    dimensionLabel: 'Sensory Sensitivity',
    title: 'When working under stress, which interface atmosphere helps you feel most grounded?',
    subtitle: 'You can toggle between sensory modes anytime in the top bar.',
    options: [
      { label: 'Energetic & vibrant', sublabel: 'Rich colors and lively visual cues', scoreValue: 1 },
      { label: 'Balanced & modern', sublabel: 'Clean structure with standard accents', scoreValue: 2 },
      { label: 'Calm & soothing', sublabel: 'Muted tones, soft edges, reduced animations', scoreValue: 3 },
      { label: 'Ultra-minimal monochrome', sublabel: 'Zero distractions, maximum whitespace', scoreValue: 4 },
    ],
  },
  {
    id: 'struct_routine',
    dimension: 'STRUCTURE_NEED',
    dimensionLabel: 'Need for Structure',
    title: 'Having a consistent, predictable routine or daily template gives you:',
    subtitle: 'This helps us decide how proactively to structure your days.',
    options: [
      { label: 'Feeling trapped', sublabel: 'I thrive on spontaneous flexibility', scoreValue: 1 },
      { label: 'Slight benefit', sublabel: 'Helpful for basic chores only', scoreValue: 2 },
      { label: 'Great relief', sublabel: 'Saves decision energy and anxiety', scoreValue: 3 },
      { label: 'Essential safety anchor', sublabel: 'Without routine, days fall apart', scoreValue: 4 },
    ],
  },
  {
    id: 'struct_unstructured_day',
    dimension: 'STRUCTURE_NEED',
    dimensionLabel: 'Need for Structure',
    title: 'When your day has no predetermined agenda or schedule, you usually feel:',
    subtitle: 'Modo can suggest gentle scaffolding or leave open exploratory space.',
    options: [
      { label: 'Free and energized', scoreValue: 1 },
      { label: 'Relaxed with occasional drifting', scoreValue: 2 },
      { label: 'Uncertain and slow to take action', scoreValue: 3 },
      { label: 'Paralyzed by too many open possibilities', scoreValue: 4 },
    ],
  },
];
