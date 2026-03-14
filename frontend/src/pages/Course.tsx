import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { lessons } from "../data/lessons";

const moduleColors: Record<number, string> = {
  1: "border-blue-500/30 bg-blue-500/10",
  2: "border-purple-500/30 bg-purple-500/10",
  3: "border-green-500/30 bg-green-500/10",
  4: "border-yellow-500/30 bg-yellow-500/10",
  5: "border-red-500/30 bg-red-500/10",
  6: "border-omn-accent/30 bg-omn-accent/10",
};

const moduleIcons: Record<number, string> = {
  1: "Chain",
  2: "Wallet",
  3: "Code",
  4: "Coins",
  5: "Shield",
  6: "Star",
};

export default function Course() {
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("omnid-completed-lessons");
    if (saved) setCompleted(JSON.parse(saved));
  }, []);

  const totalLessons = lessons.length;
  const completedCount = completed.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const modules = Array.from(new Set(lessons.map((l) => l.moduleNumber))).sort();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-omn-heading mb-2">
          OmnID Academy
        </h1>
        <p className="text-omn-text mb-4">
          30 lessons to master Web3, blockchain, and digital identity
        </p>
        <div className="bg-omn-surface border border-omn-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-omn-text">
              {completedCount} / {totalLessons} lessons completed
            </span>
            <span className="text-sm font-medium text-omn-primary-light">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-omn-border rounded-full h-3">
            <div
              className="bg-gradient-to-r from-omn-primary to-omn-accent rounded-full h-3 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {modules.map((modNum) => {
        const modLessons = lessons.filter((l) => l.moduleNumber === modNum);
        const modName = modLessons[0]?.module || `Module ${modNum}`;
        return (
          <div key={modNum} className="mb-8">
            <h2 className="text-lg font-semibold text-omn-heading mb-3 flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-omn-surface border border-omn-border rounded-full text-omn-text">
                {moduleIcons[modNum]}
              </span>
              Module {modNum}: {modName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {modLessons.map((lesson) => {
                const isComplete = completed.includes(lesson.id);
                return (
                  <Link
                    key={lesson.id}
                    to={`/course/${lesson.id}`}
                    className={`block border rounded-xl p-4 transition-all hover:scale-[1.02] ${
                      moduleColors[modNum] || "border-omn-border bg-omn-surface"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-mono text-omn-text">
                        Lesson {lesson.id}
                      </span>
                      {isComplete && (
                        <span className="text-omn-success text-sm">Done</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-omn-heading mb-1">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-omn-text">{lesson.subtitle}</p>
                    <div className="mt-2 text-xs text-omn-text">
                      ~{lesson.estimatedMinutes} min
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
