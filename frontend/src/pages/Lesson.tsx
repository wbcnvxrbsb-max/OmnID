import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { lessons } from "../data/lessons";
import type { QuizQuestion } from "../data/lessons";

function QuizComponent({
  quiz,
  onComplete,
}: {
  quiz: QuizQuestion[];
  onComplete: () => void;
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = quiz[currentQ];

  function handleSelect(idx: number) {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === q.correctIndex) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (currentQ < quiz.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setFinished(true);
      onComplete();
    }
  }

  if (finished) {
    return (
      <div className="bg-omn-surface border border-omn-border rounded-xl p-6 text-center">
        <h3 className="text-xl font-bold text-omn-heading mb-2">
          Quiz Complete!
        </h3>
        <p className="text-omn-text mb-1">
          You got <span className="text-omn-accent font-bold">{score}</span>{" "}
          out of {quiz.length} correct
        </p>
        {score === quiz.length ? (
          <p className="text-omn-success font-medium">
            Perfect score! You really understand this material.
          </p>
        ) : (
          <p className="text-omn-text">
            Great effort! Review the lesson and try again anytime.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-omn-heading">Quiz</h3>
        <span className="text-sm text-omn-text">
          Question {currentQ + 1} / {quiz.length}
        </span>
      </div>
      <p className="text-omn-heading mb-4">{q.question}</p>
      <div className="space-y-2 mb-4">
        {q.options.map((opt, idx) => {
          let style = "border-omn-border hover:border-omn-primary";
          if (showResult && idx === q.correctIndex) {
            style = "border-green-500 bg-green-500/10";
          } else if (showResult && idx === selected && idx !== q.correctIndex) {
            style = "border-red-500 bg-red-500/10";
          } else if (selected === idx) {
            style = "border-omn-primary bg-omn-primary/10";
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors text-sm ${style}`}
            >
              <span className="text-omn-text mr-2 font-mono">
                {String.fromCharCode(65 + idx)}.
              </span>
              <span className="text-omn-heading">{opt}</span>
            </button>
          );
        })}
      </div>
      {showResult && (
        <div className="mb-4 p-3 rounded-lg bg-omn-bg border border-omn-border">
          <p className="text-sm text-omn-text">{q.explanation}</p>
        </div>
      )}
      {showResult && (
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg text-sm transition-colors"
        >
          {currentQ < quiz.length - 1 ? "Next Question" : "Finish Quiz"}
        </button>
      )}
    </div>
  );
}

export default function Lesson() {
  const { lessonId } = useParams();

  const id = Number(lessonId);
  const lesson = lessons.find((l) => l.id === id);
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("omnid-completed-lessons");
    if (saved) setCompleted(JSON.parse(saved));
  }, []);

  // Scroll to top when lesson changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  function markComplete() {
    const updated = [...new Set([...completed, id])];
    setCompleted(updated);
    localStorage.setItem("omnid-completed-lessons", JSON.stringify(updated));
  }

  if (!lesson) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-omn-heading mb-2">
          Lesson not found
        </h1>
        <Link to="/course" className="text-omn-primary hover:underline">
          Back to Course
        </Link>
      </div>
    );
  }

  const prevLesson = lessons.find((l) => l.id === id - 1);
  const nextLesson = lessons.find((l) => l.id === id + 1);
  const isComplete = completed.includes(id);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          to="/course"
          className="text-sm text-omn-text hover:text-omn-heading transition-colors"
        >
          &larr; Back to Course
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-0.5 bg-omn-surface border border-omn-border rounded-full text-omn-text">
            Module {lesson.moduleNumber}: {lesson.module}
          </span>
          <span className="text-xs text-omn-text">
            ~{lesson.estimatedMinutes} min
          </span>
          {isComplete && (
            <span className="text-xs text-omn-success">Completed</span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-omn-heading mb-1">
          Lesson {lesson.id}: {lesson.title}
        </h1>
        <p className="text-lg text-omn-text">{lesson.subtitle}</p>
      </div>

      <div className="space-y-8 mb-12">
        {lesson.sections.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-xl font-semibold text-omn-heading mb-3">
              {section.heading}
            </h2>
            <div
              className="text-omn-text leading-relaxed space-y-3 [&_strong]:text-omn-heading [&_em]:text-omn-primary-light [&_code]:bg-omn-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-omn-accent [&_code]:text-sm [&_code]:font-mono"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </div>
        ))}
      </div>

      <div className="mb-8">
        <QuizComponent key={id} quiz={lesson.quiz} onComplete={markComplete} />
      </div>

      <div className="flex items-center justify-between py-6 border-t border-omn-border">
        {prevLesson ? (
          <Link
            to={`/course/${prevLesson.id}`}
            className="text-sm text-omn-text hover:text-omn-heading transition-colors"
          >
            &larr; Lesson {prevLesson.id}: {prevLesson.title}
          </Link>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Link
            to={`/course/${nextLesson.id}`}
            className="text-sm text-omn-primary hover:text-omn-primary-light transition-colors"
          >
            Lesson {nextLesson.id}: {nextLesson.title} &rarr;
          </Link>
        ) : (
          <Link
            to="/course"
            className="text-sm text-omn-accent hover:text-omn-accent-light transition-colors"
          >
            Back to Course Home
          </Link>
        )}
      </div>
    </div>
  );
}
