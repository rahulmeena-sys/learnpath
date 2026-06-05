import { db } from "./index.js";
import { contentTable, lessonsTable, achievementsTable } from "./schema/index.js";
import type { LessonSection, LessonQuiz, LessonSummaryCard } from "./schema/lessons.js";

const content = [
  {
    type: "book",
    title: "Atomic Habits",
    author: "James Clear",
    coverColor: "#7c3aed",
    accentColor: "#06b6d4",
    description: "Transform your life by making tiny changes that compound over time. James Clear reveals the science behind habit formation and gives you a proven framework for building systems that create extraordinary results.",
    totalLessons: 5,
    estimatedMinutes: 25,
    goals: ["productivity", "mindset", "health"],
    difficulty: "beginner",
    xpReward: 150,
    keyInsights: [
      "1% improvements compound into remarkable results over time",
      "Build habits by focusing on identity, not outcomes",
      "Environment design is more powerful than motivation",
      "Every action is a vote for the person you want to become",
      "Make good habits obvious, attractive, easy, and satisfying",
    ],
    hasRoadmap: true,
  },
  {
    type: "book",
    title: "Deep Work",
    author: "Cal Newport",
    coverColor: "#0f172a",
    accentColor: "#6366f1",
    description: "The ability to focus without distraction on cognitively demanding tasks is becoming increasingly rare — and increasingly valuable. Cal Newport reveals how mastery of deep work is the key to success in the knowledge economy.",
    totalLessons: 5,
    estimatedMinutes: 25,
    goals: ["focus", "productivity", "creativity"],
    difficulty: "intermediate",
    xpReward: 150,
    keyInsights: [
      "Deep work produces more value than shallow work in far less time",
      "Schedule every minute of your day to protect focus time",
      "Embrace boredom — resist the urge to switch at the first hint of boredom",
      "Quit social media unless it substantially benefits your professional life",
      "The 4DX framework: lead measures, compelling scoreboard, cadence of accountability",
    ],
    hasRoadmap: true,
  },
  {
    type: "book",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    coverColor: "#064e3b",
    accentColor: "#34d399",
    description: "Timeless lessons on wealth, greed, and happiness. Morgan Housel reveals that financial success is less about intelligence and more about how you behave with money.",
    totalLessons: 5,
    estimatedMinutes: 25,
    goals: ["finance", "mindset"],
    difficulty: "beginner",
    xpReward: 130,
    keyInsights: [
      "Getting money and keeping money are two different skills",
      "Tails drive everything — a few decisions drive most of your outcomes",
      "Reasonable beats rational when it comes to financial decisions",
      "Wealth is what you don't spend — it is hidden value",
      "Save without a specific goal — savings is a hedge against life's surprises",
    ],
    hasRoadmap: true,
  },
  {
    type: "philosophy",
    title: "Meditations",
    author: "Marcus Aurelius",
    coverColor: "#78350f",
    accentColor: "#f59e0b",
    description: "The private journals of Roman Emperor Marcus Aurelius remain the ultimate guide to Stoic philosophy. Written as personal reminders, these reflections on duty, virtue, and the transience of life have guided leaders for centuries.",
    totalLessons: 5,
    estimatedMinutes: 20,
    goals: ["mindset", "leadership", "focus"],
    difficulty: "intermediate",
    xpReward: 120,
    keyInsights: [
      "You have power over your mind, not outside events — realize this and you will find strength",
      "The impediment to action advances action — what stands in the way becomes the way",
      "Waste no more time arguing about what a good person should be — be one",
      "Loss is nothing but change, and change is nature's delight",
      "Think of yourself as the author of your life, not the audience",
    ],
    hasRoadmap: false,
  },
  {
    type: "framework",
    title: "The 5 AM Club",
    author: "Robin Sharma",
    coverColor: "#1e1b4b",
    accentColor: "#818cf8",
    description: "Own your morning, elevate your life. Robin Sharma's 20/20/20 formula for the first hour of your day — 20 minutes exercise, 20 minutes reflection, 20 minutes learning — has transformed the routines of world-class performers.",
    totalLessons: 4,
    estimatedMinutes: 20,
    goals: ["productivity", "health", "mindset"],
    difficulty: "beginner",
    xpReward: 110,
    keyInsights: [
      "The 20/20/20 formula: move, reflect, grow every morning",
      "Win the morning, win the day — your first hour sets the tone for everything",
      "Tight environments breed high performance — design your space intentionally",
      "Addiction to distraction is the death of creative production",
    ],
    hasRoadmap: true,
  },
  {
    type: "book",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    coverColor: "#1c1917",
    accentColor: "#a8a29e",
    description: "Nobel laureate Daniel Kahneman reveals the two systems that drive the way we think — System 1 (fast, intuitive) and System 2 (slow, deliberate) — and how they shape our judgments, decisions, and lives.",
    totalLessons: 5,
    estimatedMinutes: 30,
    goals: ["mindset", "confidence", "leadership"],
    difficulty: "advanced",
    xpReward: 180,
    keyInsights: [
      "System 1 is fast, emotional, and automatic — System 2 is slow and deliberate",
      "Cognitive biases are predictable errors — knowing them lets you override them",
      "Loss aversion: losses loom twice as large as equivalent gains in our minds",
      "The planning fallacy — we systematically underestimate time and overestimate capability",
      "WYSIATI: What You See Is All There Is — our minds construct stories from limited data",
    ],
    hasRoadmap: false,
  },
  {
    type: "podcast",
    title: "How to Build Confidence",
    author: "Tim Ferriss",
    coverColor: "#0c0a09",
    accentColor: "#ef4444",
    description: "A masterclass distilled from hundreds of conversations with world-class performers on building genuine, unshakeable confidence — not the fake kind, but the earned kind that comes from confronting fear head-on.",
    totalLessons: 3,
    estimatedMinutes: 15,
    goals: ["confidence", "mindset", "leadership"],
    difficulty: "beginner",
    xpReward: 90,
    keyInsights: [
      "Confidence is a skill — it can be trained systematically like a muscle",
      "Fear-setting is more useful than goal-setting for overcoming anxiety",
      "The worst case is almost never as bad as you imagine it to be",
    ],
    hasRoadmap: false,
  },
  {
    type: "framework",
    title: "The PARA Method",
    author: "Tiago Forte",
    coverColor: "#172554",
    accentColor: "#3b82f6",
    description: "A universal system for organizing your digital life — Projects, Areas, Resources, Archives. PARA gives you a single structure that works across every application and captures the complete landscape of your life.",
    totalLessons: 4,
    estimatedMinutes: 20,
    goals: ["productivity", "creativity", "focus"],
    difficulty: "beginner",
    xpReward: 100,
    keyInsights: [
      "Organize by actionability, not by topic — information should be organized by how you use it",
      "Projects have deadlines, Areas are ongoing responsibilities you maintain",
      "Your system should reduce decision fatigue, not create more of it",
      "Move information toward action — capture, process, organize, review, engage",
    ],
    hasRoadmap: false,
  },
];

function makeLessons(contentId: number, insights: string[], bookTitle: string) {
  const lessons: Array<{
    contentId: number;
    order: number;
    title: string;
    type: string;
    durationMinutes: number;
    xpReward: number;
    sections: LessonSection[];
    quiz: LessonQuiz | null;
    summaryCard: LessonSummaryCard | null;
  }> = [];

  const get = (i: number) => insights[i] ?? insights[0] ?? "Small consistent actions compound into remarkable results.";

  lessons.push({
    contentId,
    order: 1,
    title: "The Core Idea",
    type: "concept",
    durationMinutes: 5,
    xpReward: 20,
    sections: [
      { id: 1, type: "text", title: "Why This Matters", content: `This insight from "${bookTitle}" has changed how thousands of high performers think and operate. Before we dive in, consider: what would be different in your life if you truly internalized this?` },
      { id: 2, type: "insight", title: "The Central Insight", content: get(0), highlight: "This is the foundational idea everything else builds on." },
      { id: 3, type: "text", title: "The Deeper Why", content: "Most people understand this intellectually but fail to act on it. The gap between knowing and doing is where real transformation happens. This lesson bridges that gap." },
    ],
    quiz: {
      id: contentId * 100 + 1,
      question: `What is the central premise behind "${bookTitle}"?`,
      options: [
        "It requires massive willpower and discipline",
        get(0).slice(0, 70),
        "Success requires natural talent above all else",
        "Change happens overnight with the right mindset",
      ],
      correctIndex: 1,
      explanation: "The central insight is about the mechanism — not relying on willpower or motivation alone.",
      xpReward: 10,
    },
    summaryCard: {
      title: "Core Idea",
      keyTakeaways: [get(0), "The gap between knowing and doing is where real transformation happens", "Systems produce exactly the results they are designed to produce"],
      coreInsight: get(0),
    },
  });

  lessons.push({
    contentId,
    order: 2,
    title: "The Framework",
    type: "framework",
    durationMinutes: 5,
    xpReward: 25,
    sections: [
      { id: 1, type: "text", title: "Turning Theory Into System", content: "Now that you understand the core idea, it is time to build the framework. A framework without action is just theory. A framework with consistent action becomes your operating system." },
      { id: 2, type: "insight", title: "Key Principle", content: get(1), highlight: "This is what separates consistent performers from occasional achievers." },
      { id: 3, type: "challenge", title: "The Real Test", content: "Think about the last time this principle applied to your life. What happened when you followed it? What happened when you didn't? Be specific." },
      { id: 4, type: "quote", content: get(2), title: null, highlight: null },
    ],
    quiz: {
      id: contentId * 100 + 2,
      question: "What does a well-designed framework primarily do?",
      options: [
        "Replace the need to think entirely",
        "Create automatic pathways toward your goals with minimal friction",
        "Guarantee results without any effort",
        "Eliminate all possibility of failure",
      ],
      correctIndex: 1,
      explanation: "Frameworks create automatic paths — they reduce friction and make the right behavior the default, not the exception.",
      xpReward: 10,
    },
    summaryCard: {
      title: "The Framework",
      keyTakeaways: [get(1), get(2), "Structure reduces the need for willpower — design beats intention"],
      coreInsight: get(1),
    },
  });

  lessons.push({
    contentId,
    order: 3,
    title: "Real-World Application",
    type: "story",
    durationMinutes: 5,
    xpReward: 25,
    sections: [
      { id: 1, type: "text", title: "From Insight to Action", content: "Theory only becomes powerful when it meets reality. In this lesson, we explore how to make these ideas work in your actual life — not an idealized version of it, but the messy, constraint-filled version you actually live in." },
      { id: 2, type: "insight", title: "The Implementation Gap", content: get(3), highlight: null },
      { id: 3, type: "reflection", title: "Self-Assessment", content: "On a scale of 1–10: how well are you currently applying this principle? What one specific situation in your life would benefit most from a change?", highlight: null },
      { id: 4, type: "challenge", title: "Your First Step", content: "Identify ONE specific, actionable change you can make today — not tomorrow. A real first step takes less than 5 minutes and requires zero perfect conditions.", highlight: null },
    ] as LessonSection[],
    quiz: {
      id: contentId * 100 + 3,
      question: "What is the most common reason people fail to apply good ideas consistently?",
      options: [
        "They don't understand the ideas deeply enough",
        "The ideas don't actually work in real life",
        "They fail to create conditions where the right behavior becomes easy",
        "They need more time studying before starting",
      ],
      correctIndex: 2,
      explanation: "Implementation failure is almost always an environment and system design problem — not a motivation or knowledge problem.",
      xpReward: 10,
    },
    summaryCard: {
      title: "Real Application",
      keyTakeaways: [get(3), "Start with one specific, actionable change today", "Environment design consistently beats raw willpower"],
      coreInsight: "The gap between knowing and doing closes only when you change your environment, not just your motivation.",
    },
  });

  if (insights.length >= 5) {
    lessons.push({
      contentId,
      order: 4,
      title: "Advanced Mastery",
      type: "concept",
      durationMinutes: 5,
      xpReward: 30,
      sections: [
        { id: 1, type: "text", title: "The Counterintuitive Layer", content: "Once you have mastered the basics, the next level of insight reveals counterintuitive truths that most people never reach. This is where real differentiation happens." },
        { id: 2, type: "insight", title: "The Counterintuitive Truth", content: get(4), highlight: null },
        { id: 3, type: "visual", title: "The Flywheel Model", content: "Mastery operates like a flywheel. The first few rotations require enormous effort. But with each revolution, momentum builds — until eventually the system runs itself with minimal input.", highlight: "Small consistent inputs generate large compounding outputs once momentum is established." },
      ],
      quiz: {
        id: contentId * 100 + 4,
        question: "What characterizes true mastery of a concept or skill?",
        options: [
          "You never struggle with it anymore",
          "You can recite all the theory perfectly",
          "The right behavior becomes automatic and effortless",
          "You can teach it to others flawlessly",
        ],
        correctIndex: 2,
        explanation: "Mastery means the behavior becomes automatic — the system decides for you, not willpower in the moment.",
        xpReward: 10,
      },
      summaryCard: {
        title: "Advanced Mastery",
        keyTakeaways: [get(4), "Mastery is when the right choice becomes effortless and automatic", "The flywheel effect: consistent inputs build unstoppable momentum"],
        coreInsight: get(4),
      },
    });
  }

  lessons.push({
    contentId,
    order: insights.length >= 5 ? 5 : 4,
    title: "Implementation Blueprint",
    type: "challenge",
    durationMinutes: 5,
    xpReward: 35,
    sections: [
      { id: 1, type: "text", title: "Your Personal Plan", content: `You have absorbed the key ideas from "${bookTitle}". Now it is time to build your implementation blueprint — the specific plan that turns insight into lasting change in your actual life.` },
      { id: 2, type: "challenge", title: "The 3-Day Challenge", content: "For the next 3 days, pick one principle from this material and apply it deliberately. Write down what you noticed each evening. That is it. No more, no less. Just 3 days.", highlight: null },
      { id: 3, type: "reflection", title: "Final Reflection", content: "What is the single most important thing you are taking from this material? Write it in one sentence. This sentence is your anchor — return to it when you lose direction or momentum.", highlight: null },
      { id: 4, type: "insight", title: "The Commitment", content: "Every expert was once a beginner who decided to take the first step. Your first step starts right now, not when conditions are perfect.", highlight: "The best time to start was yesterday. The second best time is now." },
    ] as LessonSection[],
    quiz: {
      id: contentId * 100 + 5,
      question: "What is the most effective way to begin implementing what you have learned?",
      options: [
        "Study more until you feel fully ready and confident",
        "Create a comprehensive 90-day plan before starting any action",
        "Pick one principle and apply it deliberately for 3 days",
        "Wait for the perfect moment and ideal circumstances",
      ],
      correctIndex: 2,
      explanation: "The 3-day challenge works because it is small enough to actually do, long enough to feel real change, and specific enough to measure progress.",
      xpReward: 15,
    },
    summaryCard: {
      title: "Implementation Blueprint",
      keyTakeaways: [
        "Start with the 3-day challenge: one principle, applied deliberately",
        "Write your anchor insight in one sentence and return to it often",
        "Progress over perfection — imperfect action beats perfect inaction every time",
      ],
      coreInsight: "The gap between knowing and doing closes the moment you take your first deliberate step.",
    },
  });

  return lessons;
}

async function seed() {
  console.log("Seeding content...");

  for (const c of content) {
    const [inserted] = await db.insert(contentTable).values(c).returning();
    console.log(`  Content: ${inserted.title} (id=${inserted.id})`);

    const lessons = makeLessons(inserted.id, c.keyInsights, c.title);
    for (const lesson of lessons) {
      const [l] = await db.insert(lessonsTable).values(lesson).returning();
      console.log(`    Lesson ${l.order}: ${l.title}`);
    }
  }

  console.log("Seeding achievements...");
  const achievementsData = [
    { title: "First Steps", description: "Complete your first lesson", icon: "S", xpReward: 25 },
    { title: "On a Roll", description: "Complete 3 lessons in a row", icon: "F", xpReward: 50 },
    { title: "Week Warrior", description: "Maintain a 7-day streak", icon: "W", xpReward: 75 },
    { title: "Deep Diver", description: "Complete a full content session", icon: "D", xpReward: 100 },
    { title: "Habit Builder", description: "Complete 7 roadmap tasks", icon: "H", xpReward: 75 },
    { title: "Card Collector", description: "Save 5 summary cards", icon: "C", xpReward: 50 },
    { title: "Century Club", description: "Earn 100 XP in a single day", icon: "X", xpReward: 100 },
    { title: "Philosophy Major", description: "Complete a philosophy or framework", icon: "P", xpReward: 60 },
    { title: "Road Warrior", description: "Complete a 30-day roadmap", icon: "R", xpReward: 150 },
  ];

  for (const a of achievementsData) {
    const [ins] = await db.insert(achievementsTable).values(a).returning();
    console.log(`  Achievement: ${ins.title}`);
  }

  console.log("Done.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => { console.error(err); process.exit(1); });
