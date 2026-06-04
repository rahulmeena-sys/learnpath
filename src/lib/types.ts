export type Book = {
  id: number;
  type: string;
  title: string;
  author: string;
  cover_color: string;
  accent_color: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_minutes: number;
  xp_reward: number;
  goals: string[];
  is_premium: boolean;
  status: string;
};

export type Lesson = {
  id: number;
  book_id: number;
  title: string;
  order_index: number;
  type: string;
  estimated_minutes: number;
  xp_reward: number;
  body: {
    key_idea: string;
    sections: { type: string; content?: string; text?: string; author?: string; prompt?: string }[];
    quiz?: { question: string; options: string[]; correct: number };
    summary: string;
  };
};

export type Profile = {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  role: string | null;
  goals: string[];
  daily_minutes: number;
  onboarding_complete: boolean;
  xp: number;
  level: number;
  streak: number;
  longest_streak: number;
  last_active_date: string | null;
};

export type BookProgress = {
  id: number;
  user_id: string;
  book_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  percent: number;
  started_at: string | null;
  completed_at: string | null;
};

export type Habit = {
  id: number;
  user_id: string;
  title: string;
  emoji: string;
  target_minutes: number;
  is_active: boolean;
};
