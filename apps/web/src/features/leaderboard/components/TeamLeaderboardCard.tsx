import { useCallback, useEffect, useState } from "react";
import { Trophy, Loader2 } from "lucide-react";
import { leaderboardService, type LeaderboardUser } from "../services/leaderboard.service";
import { useAuthStore } from "@/store/authStore";

const COLORS = ["bg-blue-500","bg-purple-500","bg-green-500","bg-orange-500","bg-pink-500","bg-teal-500"];

function avatarColor(id: string) {
  const s = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return COLORS[s % COLORS.length];
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function TeamLeaderboardCard() {
  const currentUser           = useAuthStore((s) => s.user);
  const [users, setUsers]     = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLeaderboard = useCallback(() => {
    setLoading(true);
    setError('');
    leaderboardService.getLeaderboard()
      .then((r) => setUsers(r.data.leaderboard))
      .catch(() => setError('Could not load team rankings.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { void loadLeaderboard(); }, [loadLeaderboard]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-1">
        <Trophy size={16} className="text-yellow-500" />
        <h2 className="font-bold text-gray-900">Team Leaderboard</h2>
      </div>
      <p className="mt-0.5 text-xs text-gray-500 mb-4">Ranked by points earned</p>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 size={20} className="animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div role="alert" className="py-4 text-center text-sm text-red-600">
          <p>{error}</p>
          <button type="button" onClick={loadLeaderboard} className="mt-1 font-semibold underline">Retry</button>
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
      ) : (
        <div className="space-y-3">
          {users.slice(0, 10).map((u, i) => {
            const rank  = i + 1;
            const isYou = u.id === currentUser?.id;
            return (
              <div key={u.id} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-5 text-center text-sm">{MEDAL[rank] ?? rank}</span>
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(u.id)}`}>
                    {getInitials(u.name)}
                  </div>
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-semibold ${isYou ? "text-blue-500" : "text-gray-900"}`}>
                      {u.name}{isYou && <span className="ml-1 font-normal text-blue-400">(You)</span>}
                    </p>
                    <p className="text-xs text-gray-400">{u.position ?? "Team Member"}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold text-purple-600">{u.points.toLocaleString()} pts</p>
                  <p className="text-[10px] text-gray-400">{u.tasksCompleted} tasks</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
