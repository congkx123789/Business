"use client";

import { useState } from "react";
import {
  useActivityFeed,
  useCreateReadingChallenge,
  useFriendChallengeProgress,
  useJoinReadingChallenge,
  useReadingChallenge,
  useReadingStatistics,
  useSetReadingGoal,
  useUpdateChallengeProgress,
} from "@/lib/api/useReadingChallenges";

export function ReadingChallengesDashboard() {
  const [progressChallengeId, setProgressChallengeId] = useState("");
  const [friendChallengeId, setFriendChallengeId] = useState("");
  const [goalState, setGoalState] = useState({
    goalType: "chapters",
    target: "10",
    timeRange: "weekly",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  });

  const createChallenge = useCreateReadingChallenge();
  const joinChallenge = useJoinReadingChallenge();
  const updateProgress = useUpdateChallengeProgress();
  const setReadingGoalMutation = useSetReadingGoal();

  const progressData = useReadingChallenge(
    progressChallengeId ? Number(progressChallengeId) : undefined,
  );
  const friendProgress = useFriendChallengeProgress(
    friendChallengeId ? Number(friendChallengeId) : undefined,
  );
  const stats = useReadingStatistics();
  const activityFeed = useActivityFeed();

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <ChallengeCreator onSubmit={createChallenge} isLoading={createChallenge.isPending} />
        <JoinChallengeForm onSubmit={joinChallenge} isLoading={joinChallenge.isPending} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProgressViewer
          title="Challenge Progress"
          placeholder="Enter challenge ID"
          value={progressChallengeId}
          onChange={setProgressChallengeId}
          data={progressData.data}
          isLoading={progressData.isLoading}
        />
        <FriendProgressViewer
          value={friendChallengeId}
          onChange={setFriendChallengeId}
          data={friendProgress.data}
          isLoading={friendProgress.isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UpdateProgressCard onUpdate={updateProgress} isLoading={updateProgress.isPending} />
        <SetGoalCard
          value={goalState}
          onChange={setGoalState}
          onSubmit={setReadingGoalMutation}
          isLoading={setReadingGoalMutation.isPending}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityFeedCard
          items={activityFeed.data?.items ?? []}
          isLoading={activityFeed.isLoading}
        />
        <StatisticsCard stats={stats.data} isLoading={stats.isLoading} />
      </div>
    </div>
  );
}

function ChallengeCreator({
  onSubmit,
  isLoading,
}: {
  onSubmit: ReturnType<typeof useCreateReadingChallenge>;
  isLoading: boolean;
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    challengeType: "personal",
    goal: "10",
    goalType: "chapters",
    timeRange: "weekly",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit.mutate(form as any);
  };

  return (
    <section className="rounded-lg border p-4 space-y-4">
      <header>
        <h2 className="text-lg font-semibold">Create Challenge</h2>
        <p className="text-sm text-muted-foreground">
          Launch a personal or community challenge with goals and a time range.
        </p>
      </header>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Challenge name"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="space-y-1">
            <span>Goal</span>
            <input
              type="number"
              min={1}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
            />
          </label>
          <label className="space-y-1">
            <span>Goal Type</span>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={form.goalType}
              onChange={(e) => setForm({ ...form, goalType: e.target.value })}
            >
              <option value="chapters">Chapters</option>
              <option value="books">Books</option>
              <option value="pages">Pages</option>
              <option value="reading-time">Reading Time</option>
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="space-y-1">
            <span>Time Range</span>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={form.timeRange}
              onChange={(e) => setForm({ ...form, timeRange: e.target.value })}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <label className="space-y-1">
            <span>Challenge Type</span>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={form.challengeType}
              onChange={(e) =>
                setForm({ ...form, challengeType: e.target.value })
              }
            >
              <option value="personal">Personal</option>
              <option value="community">Community</option>
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="space-y-1">
            <span>Start</span>
            <input
              type="date"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </label>
          <label className="space-y-1">
            <span>End</span>
            <input
              type="date"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </label>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
          disabled={isLoading}
        >
          {isLoading ? "Creating…" : "Create Challenge"}
        </button>
      </form>
    </section>
  );
}

function JoinChallengeForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: ReturnType<typeof useJoinReadingChallenge>;
  isLoading: boolean;
}) {
  const [challengeId, setChallengeId] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!challengeId) return;
    onSubmit.mutate(Number(challengeId));
  };

  return (
    <section className="rounded-lg border p-4 space-y-4">
      <header>
        <h2 className="text-lg font-semibold">Join a Challenge</h2>
        <p className="text-sm text-muted-foreground">
          Enter a challenge ID shared by your friends or community managers.
        </p>
      </header>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          type="number"
          min={1}
          placeholder="Challenge ID"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={challengeId}
          onChange={(e) => setChallengeId(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground"
          disabled={isLoading}
        >
          {isLoading ? "Joining…" : "Join Challenge"}
        </button>
      </form>
    </section>
  );
}

function ProgressViewer({
  title,
  placeholder,
  value,
  onChange,
  data,
  isLoading,
}: {
  title: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  data: any;
  isLoading: boolean;
}) {
  return (
    <section className="rounded-lg border p-4 space-y-4">
      <header>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">
          Track the overall progress and leaderboard for a challenge.
        </p>
      </header>
      <input
        type="number"
        min={1}
        placeholder={placeholder}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && data && (
        <div className="space-y-3">
          <div className="rounded-md bg-muted/30 p-3 text-sm">
            <p className="font-medium">{data.challenge?.name ?? "Challenge"}</p>
            <p className="text-muted-foreground">
              Progress: {data.challenge?.progress ?? 0}/{data.challenge?.goal ?? 0}
            </p>
          </div>
          <ul className="space-y-2 text-sm">
            {(data.participants ?? []).map((participant: any) => (
              <li
                key={`${participant.userId}-${participant.joinedAt}`}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <span>User #{participant.userId}</span>
                <span className="font-medium">{participant.progress}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function FriendProgressViewer({
  value,
  onChange,
  data,
  isLoading,
}: {
  value: string;
  onChange: (value: string) => void;
  data: any;
  isLoading: boolean;
}) {
  return (
    <section className="rounded-lg border p-4 space-y-4">
      <header>
        <h2 className="text-lg font-semibold">Friends’ Progress</h2>
        <p className="text-sm text-muted-foreground">
          Compare your challenge progress with the readers you follow.
        </p>
      </header>
      <input
        type="number"
        min={1}
        placeholder="Challenge ID"
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && (
        <ul className="space-y-2 text-sm">
          {(data?.items ?? []).map((item: any) => (
            <li
              key={`${item.userId}-${item.updatedAt}`}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <span>User #{item.userId}</span>
              <span className="font-medium">{item.progress}</span>
            </li>
          ))}
          {(data?.items ?? []).length === 0 && (
            <li className="text-muted-foreground">No friend data available.</li>
          )}
        </ul>
      )}
    </section>
  );
}

function UpdateProgressCard({
  onUpdate,
  isLoading,
}: {
  onUpdate: ReturnType<typeof useUpdateChallengeProgress>;
  isLoading: boolean;
}) {
  const [challengeId, setChallengeId] = useState("");
  const [progress, setProgress] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!challengeId || !progress) return;
    onUpdate.mutate({
      challengeId: Number(challengeId),
      progress: Number(progress),
    });
  };

  return (
    <section className="rounded-lg border p-4 space-y-4">
      <header>
        <h2 className="text-lg font-semibold">Update My Progress</h2>
        <p className="text-sm text-muted-foreground">
          Keep the leaderboard accurate by logging your latest milestone.
        </p>
      </header>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          type="number"
          min={1}
          placeholder="Challenge ID"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={challengeId}
          onChange={(e) => setChallengeId(e.target.value)}
          required
        />
        <input
          type="number"
          min={0}
          placeholder="Progress (e.g. chapters read)"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
          disabled={isLoading}
        >
          {isLoading ? "Updating…" : "Update Progress"}
        </button>
      </form>
    </section>
  );
}

function SetGoalCard({
  value,
  onChange,
  onSubmit,
  isLoading,
}: {
  value: {
    goalType: string;
    target: string;
    timeRange: string;
    startDate: string;
    endDate: string;
  };
  onChange: (value: typeof value) => void;
  onSubmit: ReturnType<typeof useSetReadingGoal>;
  isLoading: boolean;
}) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit.mutate({
      ...value,
      target: Number(value.target),
    });
  };

  return (
    <section className="rounded-lg border p-4 space-y-4">
      <header>
        <h2 className="text-lg font-semibold">Set Personal Reading Goal</h2>
        <p className="text-sm text-muted-foreground">
          Goals sync across devices and tie into gamification rewards.
        </p>
      </header>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="space-y-1">
            <span>Goal Type</span>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={value.goalType}
              onChange={(e) => onChange({ ...value, goalType: e.target.value })}
            >
              <option value="chapters">Chapters</option>
              <option value="books">Books</option>
              <option value="pages">Pages</option>
              <option value="reading-time">Reading Time</option>
            </select>
          </label>
          <label className="space-y-1">
            <span>Target</span>
            <input
              type="number"
              value={value.target}
              min={1}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              onChange={(e) => onChange({ ...value, target: e.target.value })}
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="space-y-1">
            <span>Start Date</span>
            <input
              type="date"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={value.startDate}
              onChange={(e) => onChange({ ...value, startDate: e.target.value })}
            />
          </label>
          <label className="space-y-1">
            <span>End Date</span>
            <input
              type="date"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={value.endDate}
              onChange={(e) => onChange({ ...value, endDate: e.target.value })}
            />
          </label>
        </div>
        <label className="space-y-1 text-sm">
          <span>Time Range</span>
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={value.timeRange}
            onChange={(e) => onChange({ ...value, timeRange: e.target.value })}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        <button
          type="submit"
          className="w-full rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground"
          disabled={isLoading}
        >
          {isLoading ? "Saving…" : "Save Goal"}
        </button>
      </form>
    </section>
  );
}

function ActivityFeedCard({
  items,
  isLoading,
}: {
  items: any[];
  isLoading: boolean;
}) {
  return (
    <section className="rounded-lg border p-4 space-y-3">
      <header>
        <h2 className="text-lg font-semibold">Activity Feed</h2>
        <p className="text-sm text-muted-foreground">
          Live trail of reading sessions, goals, and challenge milestones.
        </p>
      </header>
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && (
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li
              key={item.id ?? item.timestamp}
              className="rounded-md border px-3 py-2"
            >
              <p className="font-medium capitalize">{item.activityType ?? "activity"}</p>
              <p className="text-muted-foreground">
                {new Date(item.timestamp ?? Date.now()).toLocaleString()}
              </p>
            </li>
          ))}
          {items.length === 0 && (
            <li className="text-muted-foreground">
              No recent activity recorded.
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

function StatisticsCard({
  stats,
  isLoading,
}: {
  stats: any;
  isLoading: boolean;
}) {
  return (
    <section className="rounded-lg border p-4 space-y-3">
      <header>
        <h2 className="text-lg font-semibold">Reading Statistics</h2>
        <p className="text-sm text-muted-foreground">
          Aggregated metrics from activity tracking and goals.
        </p>
      </header>
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && stats && (
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium mb-2">Activity Counts</h3>
            <ul className="space-y-1">
              {(stats.activityCounts ?? []).map((item: any) => (
                <li key={item.activityType} className="flex justify-between">
                  <span className="capitalize">{item.activityType}</span>
                  <span className="font-medium">{item.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Active Goals</h3>
            <ul className="space-y-1">
              {(stats.activeGoals ?? []).map((goal: any) => (
                <li key={goal.id} className="flex justify-between">
                  <span>
                    {goal.goalType}: {goal.current}/{goal.target}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(goal.endDate).toLocaleDateString()}
                  </span>
                </li>
              ))}
              {(stats.activeGoals ?? []).length === 0 && (
                <li className="text-muted-foreground">
                  No active goals right now.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

