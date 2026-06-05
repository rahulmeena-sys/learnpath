import {
  Bell,
  Home,
  Library,
  Map,
  User,
  BookOpen,
  ChevronRight,
} from "lucide-react";

export const meta = {
  title: "Home — warm/cream theme",
  note: "ChatGPT variant (light, serif, sage green accent)",
};

const continueReading = {
  title: "Atomic Habits",
  author: "James Clear",
  progress: 75,
};

const recommended = [
  { title: "Deep Work", author: "Cal Newport", color: "bg-[#D9C29C]" },
  { title: "Meditations", author: "Marcus Aurelius", color: "bg-[#6E806A]" },
  { title: "Psychology of Money", author: "Morgan Housel", color: "bg-[#EFE7D8]" },
];

const books = [
  { title: "Atomic Habits", author: "James Clear" },
  { title: "Deep Work", author: "Cal Newport" },
  { title: "Meditations", author: "Marcus Aurelius" },
];

export default function HomeScreen() {
  return (
    <div className="min-h-screen bg-[#F8F6F2] flex justify-center">
      <div className="w-full max-w-[390px] min-h-screen pb-24">

        {/* HEADER */}
        <div className="px-5 pt-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#7C7C7C]">Good Morning</p>
            <h1 className="text-3xl font-serif text-[#1F1F1F]">Arjun ☀️</h1>
            <p className="text-sm text-[#8B8B8B] mt-1">
              Feed your mind. Shape your life.
            </p>
          </div>

          <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
            <Bell size={18} />
          </button>
        </div>

        {/* TABS */}
        <div className="px-5 mt-6 flex gap-2 overflow-x-auto scrollbar-none">
          <button className="px-4 py-2 rounded-full bg-[#566B55] text-white text-sm">
            For You
          </button>
          <button className="px-4 py-2 rounded-full bg-white text-sm">Books</button>
          <button className="px-4 py-2 rounded-full bg-white text-sm">Podcasts</button>
          <button className="px-4 py-2 rounded-full bg-white text-sm">Principles</button>
        </div>

        {/* QUOTE CARD */}
        <div className="px-5 mt-5">
          <div className="bg-[#64775F] rounded-[28px] p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-32 opacity-25">
              <div className="h-full flex items-center justify-center text-[120px]">
                🌿
              </div>
            </div>

            <p className="text-[#D8B36A] text-4xl">“</p>

            <h2 className="text-white text-3xl leading-tight font-serif max-w-[220px]">
              Discipline is the bridge between goals and accomplishment.
            </h2>

            <p className="text-[#E9E9E9] mt-5">— Jim Rohn</p>

            <button className="absolute bottom-5 right-5 text-white">♡</button>
          </div>
        </div>

        {/* CONTINUE READING */}
        <div className="px-5 mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-[#2B2B2B]">Continue Reading</h3>
            <button className="text-sm text-[#7B7B7B]">See All</button>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-sm">
            <div className="flex gap-4">
              <div className="w-16 h-20 rounded-xl bg-[#EFE7D8] flex items-center justify-center text-xs text-center">
                Atomic
                <br />
                Habits
              </div>

              <div className="flex-1">
                <h4 className="font-medium">{continueReading.title}</h4>
                <p className="text-sm text-gray-500">{continueReading.author}</p>

                <div className="mt-4">
                  <div className="h-2 bg-[#ECECEC] rounded-full">
                    <div
                      className="h-2 rounded-full bg-[#566B55]"
                      style={{ width: `${continueReading.progress}%` }}
                    />
                  </div>

                  <p className="text-xs mt-2 text-right text-gray-500">
                    {continueReading.progress}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RECOMMENDED */}
        <div className="mt-8">
          <div className="px-5 flex items-center justify-between">
            <h3 className="font-medium">Because you read Deep Work</h3>
            <ChevronRight size={16} />
          </div>

          <div className="mt-4 flex gap-4 overflow-x-auto px-5 pb-2">
            {recommended.map((book) => (
              <div key={book.title} className="min-w-[120px]">
                <div
                  className={`rounded-2xl p-4 text-white ${book.color}`}
                  style={{ height: "170px" }}
                >
                  <div className="h-full flex flex-col justify-between">
                    <div>
                      <p className="text-lg font-serif">{book.title}</p>
                    </div>
                  </div>
                </div>

                <p className="mt-2 text-sm font-medium">{book.title}</p>
                <p className="text-xs text-gray-500">{book.author}</p>
              </div>
            ))}
          </div>
        </div>

        {/* LIBRARY PREVIEW */}
        <div className="px-5 mt-8">
          <div className="bg-white rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Your Library</h3>
                <p className="text-sm text-gray-500 mt-1">
                  12 principles saved from books & podcasts
                </p>
              </div>

              <button className="w-10 h-10 rounded-full bg-[#566B55] text-white flex items-center justify-center">
                →
              </button>
            </div>
          </div>
        </div>

        {/* QUICK BOOK GRID */}
        <div className="px-5 mt-8">
          <h3 className="font-medium mb-4">Popular This Week</h3>

          <div className="grid grid-cols-3 gap-3">
            {books.map((book) => (
              <div key={book.title}>
                <div className="aspect-[0.7] rounded-2xl bg-[#EFE7D8]" />
                <p className="mt-2 text-sm font-medium">{book.title}</p>
                <p className="text-xs text-gray-500">{book.author}</p>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM NAV */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center">
          <div className="w-full max-w-[390px] bg-[#FCFAF7]/90 backdrop-blur-xl border-t border-[#EAE5DC] h-20 flex items-center justify-around">
            <NavItem icon={<Home size={20} />} label="Home" active />
            <NavItem icon={<Library size={20} />} label="Library" />
            <NavItem icon={<BookOpen size={20} />} label="Path" />
            <NavItem icon={<Map size={20} />} label="Roadmap" />
            <NavItem icon={<User size={20} />} label="Profile" />
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button className="flex flex-col items-center gap-1">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          active ? "bg-[#566B55] text-white" : "text-[#808080]"
        }`}
      >
        {icon}
      </div>
      <span className="text-xs text-[#666]">{label}</span>
    </button>
  );
}
