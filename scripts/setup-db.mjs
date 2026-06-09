import pg from 'pg';

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// ─── SCHEMA ──────────────────────────────────────────────────────────────────

const SCHEMA = `
drop table if exists lesson_completions cascade;
drop table if exists xp_transactions cascade;
drop table if exists book_progress cascade;
drop table if exists habit_completions cascade;
drop table if exists habits cascade;
drop table if exists user_subscriptions cascade;
drop table if exists lessons cascade;
drop table if exists books cascade;
drop table if exists profiles cascade;
drop function if exists public.handle_new_user cascade;

create table books (
  id              bigserial primary key,
  type            text not null default 'book',
  title           text not null,
  author          text not null,
  cover_color     text not null default '#6366f1',
  accent_color    text not null default '#818cf8',
  description     text not null default '',
  difficulty      text not null default 'intermediate',
  estimated_minutes int not null default 20,
  xp_reward       int not null default 200,
  goals           jsonb not null default '[]',
  is_premium      boolean not null default false,
  status          text not null default 'published',
  created_at      timestamptz not null default now()
);

create table lessons (
  id                bigserial primary key,
  book_id           bigint references books on delete cascade not null,
  title             text not null,
  order_index       int not null,
  type              text not null default 'text',
  estimated_minutes int not null default 5,
  xp_reward         int not null default 30,
  body              jsonb not null default '{}',
  created_at        timestamptz not null default now()
);

create table profiles (
  id                  uuid references auth.users on delete cascade primary key,
  name                text not null default '',
  email               text,
  avatar_url          text,
  role                text,
  is_admin            boolean not null default false,
  goals               jsonb not null default '[]',
  daily_minutes       int not null default 10,
  onboarding_complete boolean not null default false,
  xp                  int not null default 0,
  level               int not null default 1,
  streak              int not null default 0,
  longest_streak      int not null default 0,
  content_completed   int not null default 0,
  lessons_completed   int not null default 0,
  last_active_date    text,
  created_at          timestamptz not null default now()
);
alter table profiles enable row level security;
create policy "own profile" on profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

alter table books enable row level security;
create policy "published books readable" on books for select
  using (
    status = 'published'
    or exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );
create policy "admins manage books" on books for all
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true))
  with check (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true));

alter table lessons enable row level security;
create policy "published lessons readable" on lessons for select
  using (
    exists (select 1 from books where books.id = lessons.book_id and books.status = 'published')
    or exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );
create policy "admins manage lessons" on lessons for all
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true))
  with check (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true));

create or replace function public.handle_new_user()
returns trigger as $$
begin insert into public.profiles (id, email) values (new.id, new.email); return new; end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table user_subscriptions (
  id                bigserial primary key,
  user_id           uuid references auth.users on delete cascade not null,
  plan              text not null default 'free',
  provider          text,
  provider_id       text,
  expires_at        timestamptz,
  created_at        timestamptz not null default now()
);
alter table user_subscriptions enable row level security;
create policy "own subscriptions" on user_subscriptions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table habits (
  id              bigserial primary key,
  user_id         uuid references auth.users on delete cascade not null,
  title           text not null,
  emoji           text not null default '✅',
  target_minutes  int not null default 10,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);
alter table habits enable row level security;
create policy "own habits" on habits for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table habit_completions (
  id           bigserial primary key,
  habit_id     bigint references habits on delete cascade not null,
  user_id      uuid references auth.users on delete cascade not null,
  date         text not null,
  completed_at timestamptz not null default now(),
  unique(habit_id, date)
);
alter table habit_completions enable row level security;
create policy "own habit completions" on habit_completions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table book_progress (
  id           bigserial primary key,
  user_id      uuid references auth.users on delete cascade not null,
  book_id      bigint references books on delete cascade not null,
  status       text not null default 'not_started',
  percent      int not null default 0,
  started_at   timestamptz,
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  unique(user_id, book_id)
);
alter table book_progress enable row level security;
create policy "own book progress" on book_progress for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table lesson_completions (
  id           bigserial primary key,
  user_id      uuid references auth.users on delete cascade not null,
  lesson_id    bigint references lessons on delete cascade not null,
  book_id      bigint references books on delete cascade not null,
  quiz_score   int,
  completed_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);
alter table lesson_completions enable row level security;
create policy "own lesson completions" on lesson_completions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table xp_transactions (
  id         bigserial primary key,
  user_id    uuid references auth.users on delete cascade not null,
  amount     int not null,
  source     text not null,
  source_id  text,
  created_at timestamptz not null default now()
);
alter table xp_transactions enable row level security;
create policy "own xp" on xp_transactions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
`;

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const BOOKS = [
  {
    type: 'book', title: 'Atomic Habits', author: 'James Clear',
    cover_color: '#6366f1', accent_color: '#818cf8',
    description: 'Tiny changes, remarkable results. A proven framework for building good habits.',
    difficulty: 'beginner', estimated_minutes: 20, xp_reward: 200,
    goals: ['productivity', 'health', 'mindset'], is_premium: false,
    lessons: [
      {
        title: 'The Surprising Power of Tiny Changes', order_index: 1, type: 'text', estimated_minutes: 5, xp_reward: 30,
        body: {
          key_idea: '1% improvements compound into remarkable results over time.',
          sections: [
            { type: 'text', content: 'Most people chase big dramatic changes. But the research shows it\'s the tiny, consistent improvements that compound into extraordinary outcomes. A 1% improvement every day leads to being 37 times better by year\'s end.' },
            { type: 'insight', content: 'Habits are the compound interest of self-improvement. The same way money multiplies through compound interest, the effects of habits multiply as you repeat them.' },
            { type: 'quote', text: 'You do not rise to the level of your goals. You fall to the level of your systems.', author: 'James Clear' },
            { type: 'challenge', content: 'Pick one habit you want to build. What is the smallest possible version you can do in under 2 minutes?' },
          ],
          quiz: { question: 'Improving by 1% every day for a year makes you how much better?', options: ['10x better', '37x better', '100x better', '365x better'], correct: 1 },
          summary: 'Small 1% gains compound dramatically — focus on systems, not goals.',
        },
      },
      {
        title: 'Identity-Based Habits', order_index: 2, type: 'text', estimated_minutes: 5, xp_reward: 30,
        body: {
          key_idea: 'The most effective way to change habits is to focus on who you want to become, not what you want to achieve.',
          sections: [
            { type: 'text', content: 'There are three layers of behavior change: outcomes (what you get), processes (what you do), and identity (what you believe). Most people focus on outcomes. The key is to start with identity.' },
            { type: 'insight', content: 'Every action you take is a vote for the type of person you want to become. Two votes for "I am a reader" is better than zero.' },
            { type: 'quote', text: 'The goal is not to read a book, the goal is to become a reader.', author: 'James Clear' },
            { type: 'challenge', content: 'Write down: "I am the type of person who ___." Fill in the identity you want to build, not the outcome you want.' },
          ],
          quiz: { question: 'Which layer of change is most powerful for lasting habits?', options: ['Outcomes', 'Processes', 'Identity', 'Motivation'], correct: 2 },
          summary: 'Focus on identity first — habits become easy when they reflect who you are.',
        },
      },
      {
        title: 'The Four Laws of Behavior Change', order_index: 3, type: 'text', estimated_minutes: 5, xp_reward: 40,
        body: {
          key_idea: 'Make it obvious, attractive, easy, and satisfying — the four laws to build any habit.',
          sections: [
            { type: 'text', content: 'Every habit follows the same loop: cue → craving → response → reward. To build a good habit: make the cue obvious, make the craving attractive, make the response easy, make the reward satisfying.' },
            { type: 'insight', content: 'To break a bad habit, invert the laws: make it invisible, unattractive, difficult, and unsatisfying.' },
            { type: 'quote', text: 'Environment is the invisible hand that shapes human behavior.', author: 'James Clear' },
            { type: 'challenge', content: 'Apply Law 1 (make it obvious): place a visual cue for your desired habit somewhere you\'ll see it every morning.' },
          ],
          quiz: { question: 'Which is NOT one of the Four Laws of Behavior Change?', options: ['Make it obvious', 'Make it motivating', 'Make it easy', 'Make it satisfying'], correct: 1 },
          summary: 'Obvious + Attractive + Easy + Satisfying = any habit you want to build.',
        },
      },
      {
        title: 'Habit Stacking and Environment Design', order_index: 4, type: 'text', estimated_minutes: 5, xp_reward: 30,
        body: {
          key_idea: 'Stack new habits onto existing ones and design your environment to make good habits the path of least resistance.',
          sections: [
            { type: 'text', content: 'Habit stacking uses the formula: "After I [CURRENT HABIT], I will [NEW HABIT]." This anchors the new behavior to something you already do automatically.' },
            { type: 'insight', content: 'Environment design is more powerful than willpower. Want to eat less junk food? Don\'t buy it. Want to read more? Put your book on your pillow.' },
            { type: 'quote', text: 'Make the right behaviors easier and the wrong behaviors harder.', author: 'James Clear' },
            { type: 'challenge', content: 'Write one habit stack: "After I [existing habit], I will [new habit for 2 minutes]."' },
          ],
          quiz: { question: 'What is habit stacking?', options: ['Doing multiple habits at once', 'Linking a new habit to an existing one', 'Building habits in a stack order', 'Tracking habits in a list'], correct: 1 },
          summary: 'Attach new habits to existing ones and redesign your environment to make success automatic.',
        },
      },
      {
        title: 'The Two-Minute Rule and Never Miss Twice', order_index: 5, type: 'text', estimated_minutes: 5, xp_reward: 30,
        body: {
          key_idea: 'Standardize before you optimize — start with just two minutes, and never miss a habit twice in a row.',
          sections: [
            { type: 'text', content: 'The two-minute rule: when starting a new habit, scale it down until it takes less than two minutes to do. The goal is to show up consistently, not to achieve perfect performance from the start.' },
            { type: 'insight', content: 'Missing once is an accident. Missing twice is the start of a new habit. The "never miss twice" rule is the most important rule for long-term consistency.' },
            { type: 'quote', text: 'The first mistake is never the one that ruins you. It is the spiral of repeated mistakes that follows.', author: 'James Clear' },
            { type: 'reflection', prompt: 'Which of your current habits keeps breaking down? How could you apply the two-minute rule to restart it?' },
          ],
          quiz: { question: 'The Two-Minute Rule says new habits should initially take:', options: ['Exactly 2 minutes', 'Less than 2 minutes', 'At least 2 minutes', '2 minutes per day'], correct: 1 },
          summary: 'Start embarrassingly small. Show up every day. Never miss twice.',
        },
      },
    ],
  },
  {
    type: 'book', title: 'Deep Work', author: 'Cal Newport',
    cover_color: '#8b5cf6', accent_color: '#a78bfa',
    description: 'Rules for focused success in a distracted world.',
    difficulty: 'intermediate', estimated_minutes: 18, xp_reward: 180,
    goals: ['productivity', 'focus'],
    lessons: [
      {
        title: 'Why Deep Work Is the New Superpower', order_index: 1, type: 'text', estimated_minutes: 5, xp_reward: 30,
        body: {
          key_idea: 'The ability to focus without distraction is rare, valuable, and becoming more scarce.',
          sections: [
            { type: 'text', content: 'Deep work is professional activity performed in a state of distraction-free concentration that pushes your cognitive capabilities to their limit. In the new economy, two abilities will determine success: mastering hard things quickly, and producing at an elite level.' },
            { type: 'insight', content: 'The paradox: knowledge work increasingly values deep work, yet most workers fill their days with shallow tasks — email, meetings, Slack. This creates a massive opportunity.' },
            { type: 'quote', text: 'Clarity about what matters provides clarity about what does not.', author: 'Cal Newport' },
            { type: 'challenge', content: 'Track your time tomorrow in 30-minute blocks. How much was genuinely deep work vs shallow busywork?' },
          ],
          quiz: { question: 'Deep Work is defined as:', options: ['Working long hours', 'Focused work without distraction that pushes cognitive limits', 'Working from a quiet place', 'Complex problem solving'], correct: 1 },
          summary: 'Deep work is rare, valuable, and the skill that defines elite performance in the knowledge economy.',
        },
      },
      {
        title: 'The Deep Work Philosophies', order_index: 2, type: 'text', estimated_minutes: 5, xp_reward: 30,
        body: {
          key_idea: 'There are four philosophies for scheduling deep work — choose what fits your life.',
          sections: [
            { type: 'text', content: 'Newport identifies four approaches: Monastic (eliminate all shallow work permanently), Bimodal (divide time into deep and shallow periods), Rhythmic (daily scheduled deep work blocks), and Journalistic (fit deep work wherever you can).' },
            { type: 'insight', content: 'Most people do best with the Rhythmic philosophy — a consistent daily deep work block, treated like a meeting you cannot miss.' },
            { type: 'quote', text: 'A commitment to deep work is not a moral stance. It is a pragmatic recognition that this is how elite-level work gets done.', author: 'Cal Newport' },
            { type: 'challenge', content: 'Decide on your philosophy. Block a recurring 90-minute deep work session on your calendar — same time every day.' },
          ],
          quiz: { question: 'Which philosophy fits most people who have regular jobs?', options: ['Monastic', 'Bimodal', 'Rhythmic', 'Journalistic'], correct: 2 },
          summary: 'Schedule deep work like a non-negotiable meeting — consistency beats intensity.',
        },
      },
      {
        title: 'Embrace Boredom and Quit Social Media', order_index: 3, type: 'text', estimated_minutes: 4, xp_reward: 30,
        body: {
          key_idea: 'Training your concentration is like training a muscle — boredom is the resistance.',
          sections: [
            { type: 'text', content: 'If every moment of potential boredom is met by a glance at a smartphone, you are training your brain to never tolerate an absence of stimulation. This makes deep work impossible.' },
            { type: 'insight', content: 'The key to developing a deep work habit is to embrace boredom. When waiting in line or sitting in traffic, resist reaching for your phone. Let your mind wander.' },
            { type: 'quote', text: 'Don\'t take breaks from distraction. Instead take breaks from focus.', author: 'Cal Newport' },
            { type: 'challenge', content: 'For the next 24 hours, leave your phone in another room during meals. Notice the discomfort — that is your concentration muscle waking up.' },
          ],
          quiz: { question: 'Why should you embrace boredom according to Newport?', options: ['It saves time', 'It trains your concentration like a muscle', 'Boredom is productive', 'It reduces stress'], correct: 1 },
          summary: 'Boredom is not the enemy — it is concentration training. Protect your attention ruthlessly.',
        },
      },
      {
        title: 'Drain the Shallows', order_index: 4, type: 'text', estimated_minutes: 4, xp_reward: 30,
        body: {
          key_idea: 'Aggressively schedule and constrain shallow work to protect time for what actually matters.',
          sections: [
            { type: 'text', content: 'Shallow work — low-value tasks like email, admin, and meetings — expands to fill the time available. The solution is to schedule every minute of your workday and treat your time budget as scarce.' },
            { type: 'insight', content: 'Newport\'s rule: limit shallow work to no more than 30-50% of your working time. Most knowledge workers invert this — 80% shallow, 20% deep.' },
            { type: 'quote', text: 'A 40-hour time-blocked work week produces the same output as a 60-hour unstructured work week.', author: 'Cal Newport' },
            { type: 'reflection', prompt: 'List your three most common shallow tasks. How could you batch or eliminate them to protect 2+ hours of deep work daily?' },
          ],
          quiz: { question: 'What does Newport recommend as the maximum percentage of your day spent on shallow work?', options: ['20-30%', '30-50%', '50-60%', '60-70%'], correct: 1 },
          summary: 'Schedule every minute. Treat time as scarce. Ruthlessly minimize shallow work.',
        },
      },
    ],
  },
  {
    type: 'book', title: 'The Psychology of Money', author: 'Morgan Housel',
    cover_color: '#10b981', accent_color: '#34d399',
    description: 'Timeless lessons on wealth, greed, and happiness.',
    difficulty: 'beginner', estimated_minutes: 22, xp_reward: 200,
    goals: ['finance', 'mindset'],
    lessons: [
      {
        title: 'No One Is Crazy', order_index: 1, type: 'text', estimated_minutes: 5, xp_reward: 30,
        body: {
          key_idea: 'People do seemingly crazy things with money because their personal history shapes their financial worldview.',
          sections: [
            { type: 'text', content: 'Someone who grew up in poverty thinks about risk differently than someone who grew up wealthy. Neither is wrong — they\'re each acting on the worldview built from their unique experience. Financial decisions that look irrational from the outside are often perfectly rational from inside.' },
            { type: 'insight', content: 'Your personal experiences with money make up maybe 0.00000001% of what has happened in the world, but they make up maybe 80% of how you think the world works.' },
            { type: 'quote', text: 'We all think we know how the world works. But we\'ve all only experienced a tiny sliver of it.', author: 'Morgan Housel' },
            { type: 'challenge', content: 'Think about one financial belief you hold strongly. Where did it come from? What experience shaped it?' },
          ],
          quiz: { question: 'Why do people make seemingly irrational financial decisions?', options: ['They are not smart enough', 'Their unique life experience shapes their worldview', 'They lack information', 'They are greedy'], correct: 1 },
          summary: 'Your money mindset was shaped by experiences unique to you — understand that before judging others.',
        },
      },
      {
        title: 'The Power of Compounding', order_index: 2, type: 'text', estimated_minutes: 5, xp_reward: 30,
        body: {
          key_idea: 'Warren Buffett\'s wealth is 97% due to compounding after age 65 — time in the market beats everything.',
          sections: [
            { type: 'text', content: 'Warren Buffett has $84.5 billion. Of that, $84.2 billion was accumulated after his 65th birthday. His skill is investing, but his secret is time. Compounding is unintuitive because it is not linear.' },
            { type: 'insight', content: 'The most powerful force in investing is not picking great stocks. It is maintaining consistent returns over a long time. Good returns sustained for a long time create extraordinary wealth.' },
            { type: 'quote', text: 'The first rule of compounding: never interrupt it unnecessarily.', author: 'Charlie Munger' },
            { type: 'challenge', content: 'Calculate what $500/month invested at 8% annual return looks like over 10, 20, and 30 years. Let the numbers surprise you.' },
          ],
          quiz: { question: 'What percentage of Warren Buffett\'s wealth was accumulated after age 65?', options: ['50%', '75%', '97%', '99%'], correct: 2 },
          summary: 'Time is the secret ingredient. Start early, stay consistent, never interrupt compounding.',
        },
      },
      {
        title: 'Getting Wealthy vs Staying Wealthy', order_index: 3, type: 'text', estimated_minutes: 4, xp_reward: 30,
        body: {
          key_idea: 'Getting money and keeping money are completely different skills — survival requires paranoia and humility.',
          sections: [
            { type: 'text', content: 'Getting money requires taking risks, optimism, and putting yourself out there. Keeping money requires the opposite — humility and fear that what you\'ve made can be taken away just as fast.' },
            { type: 'insight', content: 'The most important financial skill is not getting rich. It is staying rich long enough for compounding to work. This requires avoiding ruin at all costs.' },
            { type: 'quote', text: 'The ability to stick around for a long time, without wiping out or being forced to give up, is what makes the biggest difference.', author: 'Morgan Housel' },
            { type: 'challenge', content: 'Identify one financial risk in your life right now. What is a small action you could take this week to reduce it?' },
          ],
          quiz: { question: 'What is the most important skill for staying wealthy?', options: ['Finding great investments', 'Earning more income', 'Avoiding ruin and surviving long enough', 'Diversifying aggressively'], correct: 2 },
          summary: 'Getting rich and staying rich are different games — survival and humility matter more than brilliance.',
        },
      },
      {
        title: 'Enough — The Hardest Financial Skill', order_index: 4, type: 'text', estimated_minutes: 4, xp_reward: 30,
        body: {
          key_idea: 'The hardest financial skill is getting the goalpost to stop moving.',
          sections: [
            { type: 'text', content: 'There is no point in risking what you have and need for what you don\'t have and don\'t need. The hardest financial skill is stopping to feel the need to push for more when you already have enough.' },
            { type: 'insight', content: 'Enough is not too little. Enough is realizing that the opposite — always wanting more — will push you to the point of regret.' },
            { type: 'quote', text: 'The only way to win in a Las Vegas casino is to exit as soon as you enter. The same is true for the desire to always have more.', author: 'Morgan Housel' },
            { type: 'reflection', prompt: 'What does "enough" look like for you financially? Write down the specific number or situation that would genuinely satisfy you.' },
          ],
          quiz: { question: 'According to Housel, the hardest financial skill is:', options: ['Picking great stocks', 'Saving consistently', 'Getting the goalpost to stop moving', 'Avoiding debt'], correct: 2 },
          summary: 'Define enough. The endless pursuit of more is the most common destroyer of financial happiness.',
        },
      },
    ],
  },
  {
    type: 'philosophy', title: 'Meditations', author: 'Marcus Aurelius',
    cover_color: '#f59e0b', accent_color: '#fbbf24',
    description: 'Personal writings of a Roman Emperor — timeless Stoic wisdom.',
    difficulty: 'intermediate', estimated_minutes: 15, xp_reward: 160,
    goals: ['mindset', 'leadership'],
    lessons: [
      {
        title: 'You Have Power Over Your Mind', order_index: 1, type: 'text', estimated_minutes: 4, xp_reward: 30,
        body: {
          key_idea: 'The obstacle is not outside you — your mind\'s response to events is entirely within your control.',
          sections: [
            { type: 'text', content: 'Marcus Aurelius ruled the most powerful empire on earth, fought wars, and faced constant political betrayal — yet he wrote daily reminders to himself: you cannot control what happens, only how you respond.' },
            { type: 'insight', content: 'The Stoic insight is radical: suffering is not caused by events, but by our judgments about events. Change the judgment, and you change the experience.' },
            { type: 'quote', text: 'You have power over your mind — not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
            { type: 'challenge', content: 'The next time something frustrates you today, pause and ask: "Is this within my control?" If not, practice releasing it.' },
          ],
          quiz: { question: 'According to Stoic philosophy, what causes suffering?', options: ['External events', 'Other people', 'Our judgments about events', 'Bad luck'], correct: 2 },
          summary: 'You control your mind, not outside events. Mastering this distinction is the foundation of Stoicism.',
        },
      },
      {
        title: 'The Obstacle Is the Way', order_index: 2, type: 'text', estimated_minutes: 4, xp_reward: 30,
        body: {
          key_idea: 'Every obstacle contains within it the opportunity to practice a virtue.',
          sections: [
            { type: 'text', content: 'Marcus had a counterintuitive relationship with obstacles. He did not try to avoid them — he welcomed them as the training ground for virtue. A fire that is fed grows stronger. The same is true of the disciplined mind.' },
            { type: 'insight', content: 'The impediment to action advances action. What stands in the way becomes the way. This is one of the most powerful reframes available to the human mind.' },
            { type: 'quote', text: 'The impediment to action advances action. What stands in the way becomes the way.', author: 'Marcus Aurelius' },
            { type: 'challenge', content: 'Identify one current obstacle in your life. What virtue could practicing this obstacle develop in you? (patience, resilience, creativity?)' },
          ],
          quiz: { question: 'Marcus Aurelius\'s view of obstacles was that they:', options: ['Should be avoided', 'Contain opportunities for virtue', 'Are tests from the gods', 'Build character only sometimes'], correct: 1 },
          summary: 'The obstacle is not the enemy of your path — it IS the path. Use resistance as training.',
        },
      },
      {
        title: 'Memento Mori — Remember Death', order_index: 3, type: 'text', estimated_minutes: 3, xp_reward: 25,
        body: {
          key_idea: 'Contemplating mortality clarifies what actually matters.',
          sections: [
            { type: 'text', content: 'The Stoics practiced daily meditation on death — not as morbid fixation, but as the ultimate clarifier. When you remember you will die, petty annoyances fall away, and what truly matters comes into sharp relief.' },
            { type: 'insight', content: 'Memento Mori is not depressing — it is liberating. The person who has truly internalized their mortality is free from the anxiety of trivial concerns.' },
            { type: 'quote', text: 'Think of yourself as dead. You have lived your life. Now take what\'s left and live it properly.', author: 'Marcus Aurelius' },
            { type: 'reflection', prompt: 'If you only had one year left, what would you stop doing? What would you start? What in your life would remain exactly as it is?' },
          ],
          quiz: { question: 'Why did Stoics practice daily contemplation of death?', options: ['To become pessimistic', 'To clarify what truly matters', 'As a religious ritual', 'To overcome fear of enemies'], correct: 1 },
          summary: 'Remembering death is not morbid — it is the most powerful clarifier of what actually matters.',
        },
      },
      {
        title: 'Virtue Is the Only Good', order_index: 4, type: 'text', estimated_minutes: 4, xp_reward: 25,
        body: {
          key_idea: 'Wealth, fame, and comfort are preferred indifferents — only virtue constitutes genuine good.',
          sections: [
            { type: 'text', content: 'Stoicism makes a sharp distinction: some things are good (virtue), some are evil (vice), and most things are "preferred indifferents" — health, wealth, reputation. These are worth pursuing but not at the cost of virtue.' },
            { type: 'insight', content: 'A Stoic emperor ruling an empire remained unattached to power because he knew the empire was a preferred indifferent. His character — his virtue — was all he truly owned.' },
            { type: 'quote', text: 'Waste no more time arguing what a good man should be. Be one.', author: 'Marcus Aurelius' },
            { type: 'challenge', content: 'In one situation this week, choose the virtuous response over the convenient one. Notice how it feels.' },
          ],
          quiz: { question: 'In Stoicism, "preferred indifferents" include:', options: ['Virtue and wisdom', 'Wealth and health', 'Vice and greed', 'Philosophy and logic'], correct: 1 },
          summary: 'Character is the only thing truly yours — everything else is borrowed.',
        },
      },
    ],
  },
  {
    type: 'book', title: 'The 5 AM Club', author: 'Robin Sharma',
    cover_color: '#ef4444', accent_color: '#f87171',
    description: 'Own your morning, elevate your life.',
    difficulty: 'beginner', estimated_minutes: 25, xp_reward: 200,
    goals: ['productivity', 'health', 'mindset'],
    lessons: [
      {
        title: 'The 20/20/20 Formula', order_index: 1, type: 'text', estimated_minutes: 5, xp_reward: 40,
        body: {
          key_idea: 'The first 60 minutes of your day, split into three 20-minute pockets, determines everything that follows.',
          sections: [
            { type: 'text', content: 'The 5 AM Club\'s core practice: the first hour of the day, split into three 20-minute segments. Move (exercise), Reflect (journal/meditate), Grow (learn). Each pocket activates a different dimension of your genius.' },
            { type: 'insight', content: 'The first hour of the morning is the rudder of the day. Willpower and focus are highest at 5 AM before the world makes its demands on you.' },
            { type: 'quote', text: 'Own your morning. Elevate your life.', author: 'Robin Sharma' },
            { type: 'challenge', content: 'Try the 20/20/20 tomorrow: 20 minutes of movement, 20 minutes of journaling, 20 minutes of reading. Just once — see how you feel by noon.' },
          ],
          quiz: { question: 'In the 20/20/20 formula, what happens in the first 20 minutes?', options: ['Reflect', 'Grow', 'Move', 'Plan'], correct: 2 },
          summary: 'Win the morning, win the day. 20 minutes move, 20 reflect, 20 grow.',
        },
      },
      {
        title: 'The Four Interior Empires', order_index: 2, type: 'text', estimated_minutes: 5, xp_reward: 30,
        body: {
          key_idea: 'Mastery requires developing four interior empires: mindset, heartset, healthset, and soulset.',
          sections: [
            { type: 'text', content: 'Most development focuses only on mindset. But Sharma argues you need four: Mindset (your psychology), Heartset (your emotional life), Healthset (your physicality), and Soulset (your spiritual life). Neglect any one and the others suffer.' },
            { type: 'insight', content: 'Many high performers have excellent mindsets but terrible heartsets — they are brilliant but emotionally damaged. The complete performer masters all four.' },
            { type: 'quote', text: 'All change is hard at first, messy in the middle and gorgeous at the end.', author: 'Robin Sharma' },
            { type: 'challenge', content: 'Rate yourself 1-10 on each empire: Mindset, Heartset, Healthset, Soulset. Which one needs the most attention this month?' },
          ],
          quiz: { question: 'Which of these is NOT one of the Four Interior Empires?', options: ['Mindset', 'Heartset', 'Wealthset', 'Soulset'], correct: 2 },
          summary: 'Full mastery requires all four empires — mind, heart, health, and soul.',
        },
      },
      {
        title: 'The Twin Cycles of Elite Performance', order_index: 3, type: 'text', estimated_minutes: 5, xp_reward: 30,
        body: {
          key_idea: 'Sustained high performance requires alternating intense focus with complete recovery.',
          sections: [
            { type: 'text', content: 'Elite performers don\'t work longer — they alternate between intense periods of deep focus and full recovery. The pattern: high excellence followed by deep recovery. Violate this and performance degrades.' },
            { type: 'insight', content: 'Sleep, rest, and recovery are not signs of weakness — they are performance tools. The world\'s top athletes sleep 8-10 hours. The world\'s most creative people nap.' },
            { type: 'quote', text: 'The quality of your work is determined by the quality of your recovery.', author: 'Robin Sharma' },
            { type: 'challenge', content: 'Schedule one full recovery activity this week — a walk, a nap, a device-free evening. Treat it as non-negotiable as a business meeting.' },
          ],
          quiz: { question: 'The Twin Cycles of Elite Performance refer to:', options: ['Morning and evening routines', 'Intense focus and complete recovery', 'Physical and mental training', 'Work and sleep cycles'], correct: 1 },
          summary: 'Push hard then recover fully — elite performance is a cycle, not a sprint.',
        },
      },
    ],
  },
  {
    type: 'book', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman',
    cover_color: '#3b82f6', accent_color: '#60a5fa',
    description: 'How two systems in your brain shape every decision you make.',
    difficulty: 'advanced', estimated_minutes: 30, xp_reward: 250,
    goals: ['productivity', 'mindset', 'creativity'],
    lessons: [
      {
        title: 'System 1 and System 2', order_index: 1, type: 'text', estimated_minutes: 6, xp_reward: 40,
        body: {
          key_idea: 'Your brain has two systems: a fast, automatic System 1 and a slow, deliberate System 2.',
          sections: [
            { type: 'text', content: 'System 1 operates automatically and quickly, with little effort. System 2 allocates attention to effortful mental activities. Most of what we think of as "thinking" is System 1 — fast, unconscious, and prone to errors.' },
            { type: 'insight', content: 'System 2 is lazy. It prefers to accept System 1\'s quick answer rather than do the hard work of deliberate reasoning. This is efficient — but dangerous in high-stakes decisions.' },
            { type: 'quote', text: 'The confidence that individuals have in their beliefs depends mostly on the quality of the story they can tell about what they see, even if they see little.', author: 'Daniel Kahneman' },
            { type: 'challenge', content: 'Today, catch yourself making a snap judgment about someone or something. Ask: "Is this System 1 talking? What would System 2 say?"' },
          ],
          quiz: { question: 'Which system handles automatic, fast thinking?', options: ['System 2', 'System 1', 'Both equally', 'Neither — it\'s the prefrontal cortex'], correct: 1 },
          summary: 'System 1 is fast and automatic but error-prone. System 2 is slow and deliberate. Most decisions use System 1.',
        },
      },
      {
        title: 'Cognitive Biases and Heuristics', order_index: 2, type: 'text', estimated_minutes: 6, xp_reward: 40,
        body: {
          key_idea: 'Heuristics are mental shortcuts that usually work — but cause predictable, systematic errors.',
          sections: [
            { type: 'text', content: 'Kahneman\'s research showed that human judgment is riddled with systematic errors — not random mistakes, but predictable biases. The anchoring effect: the first number you hear influences all subsequent estimates, even if irrelevant.' },
            { type: 'insight', content: 'Knowing about biases does not protect you from them. Even Kahneman himself falls prey to the very biases he spent his life studying. Awareness helps, but it doesn\'t eliminate the effect.' },
            { type: 'quote', text: 'Our comforting conviction that the world makes sense rests on a secure foundation: our almost unlimited ability to ignore our ignorance.', author: 'Daniel Kahneman' },
            { type: 'challenge', content: 'Before your next important decision, write down three reasons the opposite choice might be correct. This is called a "premortem" and reduces overconfidence.' },
          ],
          quiz: { question: 'The anchoring effect means:', options: ['We think in linear patterns', 'The first number we hear influences subsequent estimates', 'We anchor to past experiences', 'We are attached to our first opinions'], correct: 1 },
          summary: 'We are systematically biased in predictable ways — knowing this helps, but doesn\'t immunize you.',
        },
      },
      {
        title: 'Loss Aversion and Prospect Theory', order_index: 3, type: 'text', estimated_minutes: 5, xp_reward: 35,
        body: {
          key_idea: 'Losses hurt roughly twice as much as equivalent gains feel good.',
          sections: [
            { type: 'text', content: 'Kahneman\'s prospect theory revolutionized economics: people don\'t evaluate outcomes as absolute values, but as gains or losses relative to a reference point. Losing $100 hurts about twice as much as winning $100 feels good.' },
            { type: 'insight', content: 'Loss aversion explains much of human behavior: why people don\'t sell losing stocks, why negotiations fail, why people stay in bad situations. The pain of losing is the dominant emotion.' },
            { type: 'quote', text: 'The sorrow they feel when a gamble that could have been won is lost is greater than the joy of winning the same gamble.', author: 'Daniel Kahneman' },
            { type: 'reflection', prompt: 'Think of a decision you are avoiding. Is loss aversion playing a role? What would you do if you couldn\'t lose — only gain or stay the same?' },
          ],
          quiz: { question: 'According to prospect theory, losses hurt compared to equivalent gains:', options: ['The same amount', 'Twice as much', 'Three times as much', 'Half as much'], correct: 1 },
          summary: 'Loss aversion is wired into us — knowing this helps you make better decisions under uncertainty.',
        },
      },
      {
        title: 'Thinking Slow — When It Matters', order_index: 4, type: 'text', estimated_minutes: 5, xp_reward: 35,
        body: {
          key_idea: 'The goal is not to always use System 2 — it is to know when to override System 1.',
          sections: [
            { type: 'text', content: 'System 1 is not the enemy. For routine decisions, it is faster and often accurate. The danger is relying on System 1 for high-stakes, complex decisions where the situation is novel and the stakes are high.' },
            { type: 'insight', content: 'Kahneman\'s prescription: build checklists, use algorithms for repetitive decisions, and slow down on major choices. The goal is to know when not to trust your gut.' },
            { type: 'quote', text: 'The best we can do is a compromise: learn to recognize situations in which mistakes are likely and try harder to avoid significant mistakes when the stakes are high.', author: 'Daniel Kahneman' },
            { type: 'challenge', content: 'Create a personal decision checklist for important choices: Am I anchored? Am I loss-averse here? What would a person who knows nothing about this situation think?' },
          ],
          quiz: { question: 'When should you consciously engage System 2?', options: ['All decisions', 'Routine, familiar decisions', 'High-stakes, novel, complex decisions', 'Never — trust your gut'], correct: 2 },
          summary: 'Know when to override your gut — high stakes + novel situations = slow down and think.',
        },
      },
    ],
  },
  {
    type: 'course', title: 'How to Build Confidence', author: 'Brian Tracy',
    cover_color: '#ec4899', accent_color: '#f472b6',
    description: 'Proven strategies to build unshakeable self-confidence.',
    difficulty: 'beginner', estimated_minutes: 15, xp_reward: 160,
    goals: ['confidence', 'leadership'],
    lessons: [
      {
        title: 'Confidence Is a Skill, Not a Trait', order_index: 1, type: 'text', estimated_minutes: 4, xp_reward: 30,
        body: {
          key_idea: 'Confidence is built through action and evidence, not granted by personality.',
          sections: [
            { type: 'text', content: 'Most people believe confidence is something you either have or you don\'t. The research disagrees. Confidence is built through a cycle: take action → gain evidence → update self-image → repeat. Nobody is born confident.' },
            { type: 'insight', content: 'The confidence-competence loop: action creates competence, competence creates confidence, confidence creates more action. The key is to start the loop, even at low confidence.' },
            { type: 'quote', text: 'Move fast. The key to developing confidence is to act your way into feeling, rather than feeling your way into acting.', author: 'Brian Tracy' },
            { type: 'challenge', content: 'Do one thing today that you\'ve been avoiding because of low confidence. It doesn\'t need to go perfectly — you just need the evidence that you tried.' },
          ],
          quiz: { question: 'According to Tracy, confidence is best built through:', options: ['Positive thinking', 'Natural talent', 'Action and accumulated evidence', 'Waiting for the right moment'], correct: 2 },
          summary: 'Act first, feel confident second. Confidence is earned through evidence, not granted by personality.',
        },
      },
      {
        title: 'The Self-Image and Inner Dialogue', order_index: 2, type: 'text', estimated_minutes: 4, xp_reward: 30,
        body: {
          key_idea: 'Your self-image is the operating system of your confidence — and it can be reprogrammed.',
          sections: [
            { type: 'text', content: 'You always act consistently with your self-image. If you see yourself as someone who struggles in social situations, you will struggle. The self-image is not fixed — it is updated by experiences and, crucially, by the internal dialogue you run.' },
            { type: 'insight', content: 'The average person has 60,000 thoughts per day. Research suggests 80% of these are negative for most people. Your inner critic is running a constant background program.' },
            { type: 'quote', text: 'The most important conversations you\'ll ever have are the ones you have with yourself.', author: 'Brian Tracy' },
            { type: 'challenge', content: 'For one day, catch every negative self-statement ("I can\'t...", "I\'m bad at...") and replace it with its opposite. Notice how unnatural this feels at first.' },
          ],
          quiz: { question: 'Your self-image directly determines:', options: ['Your IQ', 'How you always act', 'Your physical health', 'Your relationships only'], correct: 1 },
          summary: 'Reprogram your inner dialogue — your self-image is the operating system of all your behavior.',
        },
      },
      {
        title: 'The Law of Reversibility', order_index: 3, type: 'text', estimated_minutes: 3, xp_reward: 25,
        body: {
          key_idea: 'Act as if you already have the confidence you want — the feeling will follow the action.',
          sections: [
            { type: 'text', content: 'We normally think: feel confident → then act confident. The law of reversibility inverts this: act confident → feel confident. Your nervous system cannot tell the difference between a genuine and a performed emotion if the performance is sustained.' },
            { type: 'insight', content: 'Stand straight, speak clearly, make eye contact, slow down. These physical behaviors literally change your hormone levels — testosterone up, cortisol down — within 2 minutes, per Amy Cuddy\'s research.' },
            { type: 'quote', text: 'If you act as if you already had the qualities you desire, you will actually develop those qualities.', author: 'William James' },
            { type: 'challenge', content: 'Before your next challenging conversation, spend 2 minutes standing in a power posture (feet wide, hands on hips). Notice the physiological shift.' },
          ],
          quiz: { question: 'The Law of Reversibility states:', options: ['Confidence comes before action', 'Acting confident creates the feeling of confidence', 'Feeling always precedes behavior', 'Confidence cannot be changed'], correct: 1 },
          summary: 'Don\'t wait to feel confident — act it. The feeling follows the behavior.',
        },
      },
      {
        title: 'Courage and the Comfort Zone', order_index: 4, type: 'text', estimated_minutes: 4, xp_reward: 30,
        body: {
          key_idea: 'Courage is not the absence of fear — it is taking action in spite of fear.',
          sections: [
            { type: 'text', content: 'Every confident person feels fear. The difference is they act anyway. The comfort zone is a feeling, not a place. Every time you push through fear, the comfort zone expands. Every time you retreat, it shrinks.' },
            { type: 'insight', content: 'The fastest way to build courage is to do the thing you fear most, immediately. Hesitation feeds fear. Action kills it.' },
            { type: 'quote', text: 'You can only grow if you are willing to feel awkward and uncomfortable when you try something new.', author: 'Brian Tracy' },
            { type: 'reflection', prompt: 'What is one thing outside your comfort zone that, if you did it regularly, would most transform your confidence? What is the smallest step you could take today?' },
          ],
          quiz: { question: 'What happens to your comfort zone when you consistently push through fear?', options: ['It disappears', 'It expands', 'It shrinks', 'It stays the same'], correct: 1 },
          summary: 'Act in spite of fear. Every step outside your comfort zone expands it permanently.',
        },
      },
    ],
  },
  {
    type: 'framework', title: 'The PARA Method', author: 'Tiago Forte',
    cover_color: '#14b8a6', accent_color: '#2dd4bf',
    description: 'A universal system for organising your digital life.',
    difficulty: 'intermediate', estimated_minutes: 18, xp_reward: 170,
    goals: ['productivity', 'focus'],
    lessons: [
      {
        title: 'What Is PARA?', order_index: 1, type: 'text', estimated_minutes: 5, xp_reward: 35,
        body: {
          key_idea: 'PARA organises all information into four categories: Projects, Areas, Resources, Archives.',
          sections: [
            { type: 'text', content: 'PARA is a universal system that works across every tool and context. P = Projects (things with a deadline and goal), A = Areas (ongoing responsibilities), R = Resources (topics of interest), A = Archives (inactive items). Everything you manage fits into one of these four.' },
            { type: 'insight', content: 'Most people organise by topic (Work, Personal, Finance). PARA organises by actionability — how useful is this information right now? This makes retrieval instant and relevant.' },
            { type: 'quote', text: 'Organise for action, not for reference.', author: 'Tiago Forte' },
            { type: 'challenge', content: 'Open your notes app. Pick 10 random notes and categorise each as P, A, R, or A. Notice how quickly you can make the decision.' },
          ],
          quiz: { question: 'What does the "A" in PARA stand for?', options: ['Archives only', 'Areas and Archives', 'Actions and Archives', 'Assets and Archives'], correct: 1 },
          summary: 'Organise everything as Projects, Areas, Resources, or Archives — based on actionability, not topic.',
        },
      },
      {
        title: 'Projects vs Areas — The Critical Distinction', order_index: 2, type: 'text', estimated_minutes: 4, xp_reward: 30,
        body: {
          key_idea: 'Projects have a deadline and a finish line. Areas are ongoing responsibilities without an end.',
          sections: [
            { type: 'text', content: 'The most important distinction in PARA: Projects vs Areas. "Get fit" is an Area — it never ends. "Run a 5K by June" is a Project — it has a deadline and a clear completion. Most people live in Areas and wonder why nothing gets done.' },
            { type: 'insight', content: 'Every goal should become a project with a deadline. "Improve my writing" becomes "Finish essay draft by Friday." Without this conversion, goals remain wishes.' },
            { type: 'quote', text: 'If you have a project without a goal, it\'s actually an area. If you have a goal without a project, it\'s actually a dream.', author: 'Tiago Forte' },
            { type: 'challenge', content: 'List your current "goals." For each one, ask: does it have a clear deadline and a definition of done? If not, convert it to a Project with a specific end date.' },
          ],
          quiz: { question: '"Improve my health" is an example of:', options: ['A project', 'An area', 'A resource', 'An archive'], correct: 1 },
          summary: 'Goals without deadlines are areas, not projects. Convert every goal into a project with a finish line.',
        },
      },
      {
        title: 'The Just-In-Time Organisation', order_index: 3, type: 'text', estimated_minutes: 4, xp_reward: 30,
        body: {
          key_idea: 'Organise as you go, not in advance — capture everything, organise only when needed.',
          sections: [
            { type: 'text', content: 'Most organisation systems fail because they demand too much upfront work. PARA\'s approach: capture everything into an inbox, then organise it only when you need it for a project. Just-in-time, not just-in-case.' },
            { type: 'insight', content: 'The goal is not a perfectly organised system — it is a system that gets out of the way of your work. A note you can find in 30 seconds is perfectly organised.' },
            { type: 'quote', text: 'You only need to organise information to the extent that it helps you take action.', author: 'Tiago Forte' },
            { type: 'challenge', content: 'Set up an "Inbox" folder in your notes app. For the next week, capture everything there without organising. At week\'s end, spend 15 minutes sorting into P-A-R-A.' },
          ],
          quiz: { question: 'The PARA approach to organisation is:', options: ['Organise everything perfectly upfront', 'Just-in-time — organise only when needed', 'Daily organisation sessions', 'Weekly sorting by category'], correct: 1 },
          summary: 'Capture everything, organise just-in-time. A usable imperfect system beats a perfect unused one.',
        },
      },
      {
        title: 'Building a Second Brain', order_index: 4, type: 'text', estimated_minutes: 5, xp_reward: 35,
        body: {
          key_idea: 'Your notes system should be an extension of your mind — not a storage unit, but a thinking partner.',
          sections: [
            { type: 'text', content: 'The end goal of PARA is a "Second Brain" — an external, trusted system that holds everything you\'ve learned so your biological brain can focus on creating. When your system is trusted, you stop holding things in working memory.' },
            { type: 'insight', content: 'The return on investment of a Second Brain: every note you take is an investment that pays dividends every time you work on a project in that area. Most people spend their careers recreating work they\'ve already done.' },
            { type: 'quote', text: 'Your mind is for having ideas, not holding them.', author: 'David Allen' },
            { type: 'reflection', prompt: 'What is one project you are working on right now where you are recreating research or thinking you have already done? How would a trusted Second Brain change that?' },
          ],
          quiz: { question: 'The purpose of a Second Brain is:', options: ['To store all information ever encountered', 'To be a trusted external system that extends your thinking', 'To replace paper notes', 'To organise your calendar'], correct: 1 },
          summary: 'Build an external trusted system — so your brain can focus on creating, not storing.',
        },
      },
    ],
  },
];

// ─── SEED ─────────────────────────────────────────────────────────────────────

async function seed() {
  let bookCount = 0;
  let lessonCount = 0;

  for (const book of BOOKS) {
    const { lessons, ...bookData } = book;
    const res = await client.query(
      `insert into books (type, title, author, cover_color, accent_color, description, difficulty, estimated_minutes, xp_reward, goals, is_premium, status)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'published') returning id`,
      [bookData.type, bookData.title, bookData.author, bookData.cover_color, bookData.accent_color,
       bookData.description, bookData.difficulty, bookData.estimated_minutes, bookData.xp_reward,
       JSON.stringify(bookData.goals), bookData.is_premium ?? false]
    );
    const bookId = res.rows[0].id;
    bookCount++;

    for (const lesson of lessons) {
      await client.query(
        `insert into lessons (book_id, title, order_index, type, estimated_minutes, xp_reward, body)
         values ($1,$2,$3,$4,$5,$6,$7)`,
        [bookId, lesson.title, lesson.order_index, lesson.type,
         lesson.estimated_minutes, lesson.xp_reward, JSON.stringify(lesson.body)]
      );
      lessonCount++;
    }
  }

  return { bookCount, lessonCount };
}

// ─── RUN ──────────────────────────────────────────────────────────────────────

try {
  await client.connect();
  console.log('Connected to Supabase...');

  await client.query(SCHEMA);
  console.log('✓ Schema created (9 tables)');

  const { bookCount, lessonCount } = await seed();
  console.log(`✓ Seeded ${bookCount} books, ${lessonCount} lessons`);

  console.log('\n✅ DB setup complete.');
} catch (err) {
  console.error('Setup failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
