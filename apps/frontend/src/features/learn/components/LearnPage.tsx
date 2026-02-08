import { useState } from 'react';

/* ─── Navigation Tabs ─── */

const LearnNav = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: 'test' | 'questions' | 'videos' | 'courses' | 'resources') => void;
}) => {
  const tabs = ['Test', 'Questions', 'Videos', 'Courses', 'Resources'] as const;

  return (
    <nav className="border-b border-(--border-subtle) mb-6 -mx-4 px-4">
      <div className="flex overflow-x-auto no-scrollbar py-3 gap-4 md:justify-center">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase() as any)}
            className={`shrink-0 px-3 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.toLowerCase()
                ? 'border-(--text-primary) text-(--text-primary)'
                : 'border-transparent text-(--text-muted) hover:text-(--text-secondary)'
            }`}
            aria-current={activeTab === tab.toLowerCase() ? 'page' : undefined}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
};

/* ─── Question Data ─── */

type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
};

const getQuestionsForLevel = (levelId: number): Question[] => {
  const questionsByLevel: Record<number, Omit<Question, 'id'>[]> = {
    1: [ // Laws of the Game
      { question: "What is the minimum number of players a team must have on the field for a match to start or continue?", options: ["5 players", "7 players", "8 players", "9 players"], correctAnswer: 1 },
      { question: "What is the standard duration of each half in an official match?", options: ["30 minutes", "40 minutes", "45 minutes", "50 minutes"], correctAnswer: 2 },
      { question: "A goal kick is awarded when the ball wholly crosses the goal line (excluding the goal), having last been touched by whom?", options: ["The defending team", "The attacking team", "Either team", "The goalkeeper only"], correctAnswer: 1 },
      { question: "What is the circumference of a regulation size 5 football?", options: ["58-60 cm", "62-64 cm", "68-70 cm", "72-74 cm"], correctAnswer: 2 },
      { question: "How far must opposing players stand from the ball during a corner kick?", options: ["8.0 metres", "9.15 metres", "10.0 metres", "11.0 metres"], correctAnswer: 1 },
    ],
    2: [ // Fouls & Misconduct
      { question: "What type of free kick is awarded for a deliberate handball?", options: ["Indirect free kick", "Direct free kick", "Drop ball", "Corner kick"], correctAnswer: 1 },
      { question: "A player receives two yellow cards in the same match. What happens?", options: ["The player continues with a warning", "The player is shown a red card and sent off", "The player misses the next match only", "The player is substituted automatically"], correctAnswer: 1 },
      { question: "What is the restart after an offside offence is called?", options: ["Direct free kick", "Indirect free kick", "Drop ball", "Goal kick"], correctAnswer: 1 },
      { question: "How far must the defensive wall stand from the ball during a free kick?", options: ["8.0 metres", "9.15 metres", "10.0 metres", "11.0 metres"], correctAnswer: 1 },
      { question: "When is a penalty kick awarded?", options: ["For any foul inside the penalty area", "For a direct free kick offence by the defending team inside their own penalty area", "For any handball anywhere on the pitch", "For dangerous play only"], correctAnswer: 1 },
    ],
  };

  const questions = questionsByLevel[levelId] || questionsByLevel[1];
  return questions.map((q, idx) => ({ ...q, id: idx + 1 }));
};

/* ─── Warning Modal ─── */

const WarningModal = ({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div className="bg-(--bg-surface) p-6 rounded-lg max-w-sm w-full border border-(--border-subtle)">
      <h3 className="font-semibold text-(--text-primary) mb-2">{title}</h3>
      <p className="text-sm text-(--text-secondary) mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg bg-(--bg-surface-2) text-(--text-secondary) font-medium text-sm"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2 rounded-lg bg-(--error) text-white font-medium text-sm"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

/* ─── Types ─── */

type HistoryEntry = {
  testId: number;
  testTitle: string;
  answers: Record<number, number>;
  score: number;
  total: number;
};

/* ─── Test View (full flow) ─── */

const tests = [
  { id: 1, title: 'Laws of the Game' },
  { id: 2, title: 'Fouls & Misconduct' },
];

const TestView = () => {
  const [view, setView] = useState<'list' | 'test' | 'review' | 'history' | 'history-review'>('list');
  const [activeTestId, setActiveTestId] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [reviewEntry, setReviewEntry] = useState<HistoryEntry | null>(null);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [showRedoWarning, setShowRedoWarning] = useState(false);

  const activeTest = tests.find((t) => t.id === activeTestId);
  const questions = getQuestionsForLevel(activeTestId);
  const currentQuestion = questions[questionIndex];
  const answeredCount = Object.keys(answers).length;

  /* ── Actions ── */

  const startTest = (testId: number) => {
    setActiveTestId(testId);
    setQuestionIndex(0);
    setSelectedOption(null);
    setAnswers({});
    setView('test');
  };

  const navigateTo = (idx: number) => {
    setQuestionIndex(idx);
    setSelectedOption(answers[questions[idx]?.id] ?? null);
  };

  const finishTest = (finalAnswers: Record<number, number>) => {
    const score = questions.reduce(
      (acc, q) => acc + (finalAnswers[q.id] === q.correctAnswer ? 1 : 0),
      0,
    );
    const entry: HistoryEntry = {
      testId: activeTestId,
      testTitle: activeTest?.title || '',
      answers: finalAnswers,
      score,
      total: questions.length,
    };
    setHistory((prev) => [entry, ...prev]);
    setReviewEntry(entry);
    setView('review');
  };

  const handleNext = () => {
    const isLocked = answers[currentQuestion.id] !== undefined;
    const isLast = questionIndex >= questions.length - 1;

    if (isLocked) {
      // Already answered — just navigate or end
      if (isLast) {
        finishTest(answers);
      } else {
        navigateTo(questionIndex + 1);
      }
      return;
    }

    // Not yet answered — confirm the selection
    if (selectedOption === null) return;
    const updated = { ...answers, [currentQuestion.id]: selectedOption };
    setAnswers(updated);

    if (isLast) {
      finishTest(updated);
    } else {
      setQuestionIndex(questionIndex + 1);
      setSelectedOption(null);
    }
  };

  const goToList = () => {
    setView('list');
    setShowLeaveWarning(false);
  };

  const confirmRedo = () => {
    setShowRedoWarning(false);
    startTest(activeTestId);
  };

  const startHistoryReview = (entry: HistoryEntry) => {
    setActiveTestId(entry.testId);
    setReviewEntry(entry);
    setQuestionIndex(0);
    setView('history-review');
  };

  /* ── Tests List ── */

  if (view === 'list') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-(--text-primary)">Tests</h2>
          {history.length > 0 && (
            <button
              onClick={() => setView('history')}
              className="text-xs text-(--info) font-medium hover:underline"
            >
              Test History
            </button>
          )}
        </div>
        <div className="space-y-2">
          {tests.map((test) => (
            <button
              key={test.id}
              onClick={() => startTest(test.id)}
              className="w-full flex items-center justify-between p-4 bg-(--bg-surface) rounded-lg border border-(--border-subtle) text-left hover:bg-(--bg-surface-2) transition-colors"
            >
              <div>
                <h3 className="font-medium text-(--text-primary)">{test.title}</h3>
                <p className="text-xs text-(--text-muted) mt-0.5">5 questions</p>
              </div>
              <span className="text-(--text-muted) text-sm">&rarr;</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── Test History List ── */

  if (view === 'history') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={goToList}
            className="text-sm text-(--text-muted) hover:text-(--text-primary)"
          >
            &larr; Back
          </button>
          <h2 className="text-lg font-semibold text-(--text-primary)">Test History</h2>
        </div>
        <div className="space-y-2">
          {history.map((entry, idx) => (
            <button
              key={idx}
              onClick={() => startHistoryReview(entry)}
              className="w-full flex items-center justify-between p-4 bg-(--bg-surface) rounded-lg border border-(--border-subtle) text-left hover:bg-(--bg-surface-2) transition-colors"
            >
              <div>
                <h3 className="font-medium text-(--text-primary)">{entry.testTitle}</h3>
                <p className="text-xs text-(--text-muted) mt-0.5">
                  {entry.score}/{entry.total} correct &middot;{' '}
                  {Math.round((entry.score / entry.total) * 100)}%
                </p>
              </div>
              <span className="text-(--text-muted) text-sm">&rarr;</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── Test Runner ── */

  if (view === 'test' && currentQuestion) {
    const isLocked = answers[currentQuestion.id] !== undefined;
    const isLast = questionIndex >= questions.length - 1;
    const displayedSelection = isLocked ? answers[currentQuestion.id] : selectedOption;

    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowLeaveWarning(true)}
            className="text-sm text-(--text-muted) hover:text-(--text-primary)"
          >
            &larr; Leave
          </button>
          <span className="text-sm font-medium text-(--text-primary)">
            {activeTest?.title}
          </span>
          <span className="text-xs text-(--text-muted)">
            {questionIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Progress */}
        <div className="w-full bg-(--bg-surface-2) h-1 rounded-full mb-6">
          <div
            className="bg-(--info) h-full rounded-full transition-all"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <h3 className="text-base font-medium text-(--text-primary) mb-4">
          {currentQuestion.question}
        </h3>
        <div className="space-y-2">
          {currentQuestion.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => !isLocked && setSelectedOption(idx)}
              disabled={isLocked}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 text-sm transition-colors ${
                displayedSelection === idx
                  ? 'border-(--info) bg-(--info)/10 text-(--text-primary)'
                  : isLocked
                    ? 'border-(--border-subtle) text-(--text-muted)'
                    : 'border-(--border-subtle) text-(--text-secondary) hover:bg-(--bg-surface-2)'
              } ${isLocked ? 'cursor-default' : ''}`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-(--border-subtle)">
          <div className="flex gap-3">
            <button
              onClick={() => navigateTo(questionIndex - 1)}
              disabled={questionIndex === 0}
              className="px-4 py-2.5 rounded-lg text-sm font-medium bg-(--bg-surface-2) text-(--text-secondary) disabled:opacity-40"
            >
              &larr; Back
            </button>
            <button
              onClick={handleNext}
              disabled={!isLocked && selectedOption === null}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-40 transition-colors ${
                isLast ? 'bg-(--success)' : 'bg-(--info)'
              }`}
            >
              {isLast ? 'End Test' : 'Next \u2192'}
            </button>
          </div>
        </div>

        {showLeaveWarning && (
          <WarningModal
            title="Leave test?"
            message="Your progress will be lost. Are you sure you want to leave?"
            confirmLabel="Leave"
            onConfirm={goToList}
            onCancel={() => setShowLeaveWarning(false)}
          />
        )}
      </div>
    );
  }

  /* ── Review Page (after completing test) ── */

  if (view === 'review' && reviewEntry) {
    const reviewQuestions = getQuestionsForLevel(reviewEntry.testId);
    const pct = Math.round((reviewEntry.score / reviewEntry.total) * 100);

    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-(--text-primary) text-center">
          {reviewEntry.testTitle}
        </h2>

        {/* Score */}
        <div className="text-center py-4">
          <div className="text-4xl font-bold text-(--text-primary)">
            {reviewEntry.score}/{reviewEntry.total}
          </div>
          <p className="text-sm text-(--text-muted) mt-1">{pct}% correct</p>
        </div>

        {/* Question summary */}
        <div className="space-y-2">
          {reviewQuestions.map((q) => {
            const userAnswer = reviewEntry.answers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <div
                key={q.id}
                className={`p-3 rounded-lg border text-sm ${
                  isCorrect
                    ? 'border-(--success)/30 bg-(--success)/5'
                    : 'border-(--error)/30 bg-(--error)/5'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`shrink-0 text-xs font-bold mt-0.5 ${
                      isCorrect ? 'text-(--success)' : 'text-(--error)'
                    }`}
                  >
                    {isCorrect ? '\u2713' : '\u2717'}
                  </span>
                  <div>
                    <p className="text-(--text-primary)">{q.question}</p>
                    <p className="text-xs text-(--text-muted) mt-1">
                      Your answer: {q.options[userAnswer]}
                      {!isCorrect && ` \u00B7 Correct: ${q.options[q.correctAnswer]}`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={goToList}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-(--bg-surface-2) text-(--text-secondary) hover:bg-(--bg-hover) transition-colors"
          >
            Back to Tests
          </button>
          <button
            onClick={() => setShowRedoWarning(true)}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-(--info) text-white transition-colors"
          >
            Redo Test
          </button>
        </div>

        {showRedoWarning && (
          <WarningModal
            title="Redo test?"
            message="This will start the test from the beginning. Continue?"
            confirmLabel="Redo"
            onConfirm={confirmRedo}
            onCancel={() => setShowRedoWarning(false)}
          />
        )}
      </div>
    );
  }

  /* ── History Review (read-only, question by question) ── */

  if (view === 'history-review' && reviewEntry) {
    const reviewQuestions = getQuestionsForLevel(reviewEntry.testId);
    const q = reviewQuestions[questionIndex];
    const userAnswer = reviewEntry.answers[q?.id];
    const isLast = questionIndex >= reviewQuestions.length - 1;

    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowLeaveWarning(true)}
            className="text-sm text-(--text-muted) hover:text-(--text-primary)"
          >
            &larr; Leave
          </button>
          <span className="text-sm font-medium text-(--text-primary)">
            {reviewEntry.testTitle} (Review)
          </span>
          <span className="text-xs text-(--text-muted)">
            {questionIndex + 1} / {reviewQuestions.length}
          </span>
        </div>

        {/* Question */}
        {q && (
          <>
            <h3 className="text-base font-medium text-(--text-primary) mb-4">
              {q.question}
            </h3>
            <div className="space-y-2">
              {q.options.map((opt, idx) => {
                const isCorrectOpt = idx === q.correctAnswer;
                const isUserOpt = idx === userAnswer;
                let styles = 'w-full text-left px-4 py-3 rounded-lg border-2 text-sm ';

                if (isCorrectOpt) {
                  styles += 'border-(--success) bg-(--success)/10 text-(--text-primary)';
                } else if (isUserOpt) {
                  styles += 'border-(--error) bg-(--error)/10 text-(--text-primary)';
                } else {
                  styles += 'border-(--border-subtle) text-(--text-muted)';
                }

                return (
                  <div key={idx} className={styles}>
                    {opt}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-(--border-subtle)">
          <div className="flex gap-3">
            <button
              onClick={() => setQuestionIndex((i) => i - 1)}
              disabled={questionIndex === 0}
              className="px-4 py-2.5 rounded-lg text-sm font-medium bg-(--bg-surface-2) text-(--text-secondary) disabled:opacity-40"
            >
              &larr; Back
            </button>
            {isLast ? (
              <button
                onClick={goToList}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-(--info) text-white transition-colors"
              >
                End Review
              </button>
            ) : (
              <button
                onClick={() => setQuestionIndex((i) => i + 1)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-(--info) text-white transition-colors"
              >
                Next &rarr;
              </button>
            )}
          </div>
        </div>

        {showLeaveWarning && (
          <WarningModal
            title="Leave review?"
            message="Are you sure you want to leave the test review?"
            confirmLabel="Leave"
            onConfirm={goToList}
            onCancel={() => setShowLeaveWarning(false)}
          />
        )}
      </div>
    );
  }

  return null;
};

/* ─── Questions View (one at a time) ─── */

const practiceQuestions: Omit<Question, 'id'>[] = [
  { question: "The visiting team's goalkeeper is controlling the ball with his feet inside his own penalty area during open play. He waits more than 12 seconds before releasing the ball. What should the referee decide?", options: ["Indirect free kick", "Direct free kick", "Throw-in", "No action required"], correctAnswer: 0 },
  { question: "A ball strikes the referee and goes into the goal. What is the correct decision?", options: ["Award the goal", "Drop ball from where the ball hit the referee", "Indirect free kick to the defending team", "Retake the previous play"], correctAnswer: 1 },
  { question: "A player takes a throw-in but both feet are not on the ground at the moment of release. What should the referee award?", options: ["Retake the throw-in", "Throw-in to the opposing team", "Indirect free kick", "Direct free kick"], correctAnswer: 1 },
  { question: "A goalkeeper handles a deliberate back-pass from a teammate's foot. What is the restart?", options: ["Direct free kick", "Indirect free kick from where the goalkeeper touched the ball", "Penalty kick", "Drop ball"], correctAnswer: 1 },
  { question: "During a penalty kick, the goalkeeper moves off the goal line before the ball is kicked and the kick is saved. What should the referee do?", options: ["Award a goal kick", "Retake the penalty kick", "Award an indirect free kick to the attacking team", "Allow play to continue"], correctAnswer: 1 },
  { question: "A player scores a goal but used their arm (not the goalkeeper). The referee did not see it but the assistant referee flags. What is the correct decision?", options: ["Award the goal since the referee did not see it", "Disallow the goal and award a direct free kick to the defending team", "Disallow the goal and award a drop ball", "Caution the assistant referee for interfering"], correctAnswer: 1 },
  { question: "How long can a goalkeeper hold the ball in their hands before it must be released?", options: ["4 seconds", "6 seconds", "8 seconds", "10 seconds"], correctAnswer: 1 },
  { question: "A substitute enters the field without the referee's permission and interferes with play. What action should the referee take?", options: ["Stop play, caution the substitute, restart with an indirect free kick", "Stop play, send off the substitute, restart with a direct free kick", "Allow play to continue and deal with it at the next stoppage", "Award a penalty kick"], correctAnswer: 0 },
  { question: "A player commits a foul inside their own penalty area but the referee applies advantage as the attacking team retains possession. Moments later the advantage does not materialise. What should the referee do?", options: ["Award a corner kick", "Award the penalty kick", "Award an indirect free kick", "Drop ball"], correctAnswer: 1 },
  { question: "A player is in an offside position but does not touch the ball or interfere with an opponent. What is the correct decision?", options: ["Award an indirect free kick for offside", "Allow play to continue", "Award a drop ball", "Caution the player"], correctAnswer: 1 },
];

const QuestionsView = () => {
  const questions = practiceQuestions.map((q, idx) => ({ ...q, id: idx + 1 }));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const q = questions[currentIndex];

  const handleCheck = () => {
    if (selectedOption === null) return;
    setShowAnswer(true);
  };

  const goTo = (idx: number) => {
    setCurrentIndex(idx);
    setSelectedOption(null);
    setShowAnswer(false);
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-(--text-primary)">Practice Questions</h2>
        <span className="text-xs text-(--text-muted)">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Question */}
      <h3 className="text-base font-medium text-(--text-primary) mb-4">{q.question}</h3>
      <div className="space-y-2">
        {q.options.map((opt, idx) => {
          let styles = 'w-full text-left px-4 py-3 rounded-lg border-2 text-sm transition-colors ';
          if (showAnswer) {
            if (idx === q.correctAnswer)
              styles += 'border-(--success) bg-(--success)/10 text-(--text-primary)';
            else if (idx === selectedOption)
              styles += 'border-(--error) bg-(--error)/10 text-(--text-primary)';
            else styles += 'border-(--border-subtle) text-(--text-muted)';
          } else if (idx === selectedOption) {
            styles += 'border-(--info) bg-(--info)/10 text-(--text-primary)';
          } else {
            styles += 'border-(--border-subtle) text-(--text-secondary) hover:bg-(--bg-surface-2)';
          }

          return (
            <button
              key={idx}
              onClick={() => !showAnswer && setSelectedOption(idx)}
              disabled={showAnswer}
              className={`${styles} ${showAnswer ? 'cursor-default' : ''}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-(--border-subtle)">
        <div className="flex gap-3">
          <button
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-lg text-sm font-medium bg-(--bg-surface-2) text-(--text-secondary) disabled:opacity-40"
          >
            &larr; Back
          </button>

          {!showAnswer ? (
            <button
              onClick={handleCheck}
              disabled={selectedOption === null}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-(--info) text-white disabled:opacity-40 transition-colors"
            >
              Check
            </button>
          ) : currentIndex < questions.length - 1 ? (
            <button
              onClick={() => goTo(currentIndex + 1)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-(--info) text-white transition-colors"
            >
              Next &rarr;
            </button>
          ) : (
            <button
              onClick={() => goTo(0)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-(--success) text-white transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Placeholder Tabs ─── */

const actionOptions = ['Play On', 'Foul & Direct Free Kick', 'Foul & Indirect Free Kick', 'Apply Advantage', 'Penalty Kick'];
const sanctionOptions = ['Red Card', 'Yellow Card', 'No Sanction'];

const videos = [
  { id: 1, title: 'Scenario 1', correctAction: 1, actionExplanation: 'The challenge was careless and made contact with the opponent before the ball — direct free kick.', correctSanction: 1, sanctionExplanation: 'The foul was reckless, warranting a caution (yellow card).' },
  { id: 2, title: 'Scenario 2', correctAction: 4, actionExplanation: 'The defending player tripped the attacker inside the penalty area — penalty kick.', correctSanction: 0, sanctionExplanation: 'Denying an obvious goal-scoring opportunity with a foul warrants a red card (DOGSO, no genuine attempt to play the ball).' },
  { id: 3, title: 'Scenario 3', correctAction: 0, actionExplanation: 'The contact was minimal and the player went down easily — play on.', correctSanction: 2, sanctionExplanation: 'No foul was committed, so no sanction is needed.' },
  { id: 4, title: 'Scenario 4', correctAction: 3, actionExplanation: 'A foul was committed but the attacking team retained possession in a promising position — advantage applied.', correctSanction: 1, sanctionExplanation: 'The foul was tactical, stopping a promising attack — yellow card shown at the next stoppage.' },
  { id: 5, title: 'Scenario 5', correctAction: 2, actionExplanation: 'The goalkeeper picked up a deliberate back-pass from a teammate — indirect free kick.', correctSanction: 2, sanctionExplanation: 'Handling a back-pass is an offence but not misconduct — no card is shown.' },
];

const VideosView = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState<'action' | 'sanction' | 'review'>('action');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [actionAnswer, setActionAnswer] = useState<number | null>(null);
  const [sanctionAnswer, setSanctionAnswer] = useState<number | null>(null);

  const currentVideo = videos[currentIndex];
  const isActionStep = step === 'action';
  const isSanctionStep = step === 'sanction';
  const isReview = step === 'review';
  const options = isActionStep ? actionOptions : sanctionOptions;
  const questionText = isActionStep
    ? 'What action should the referee take?'
    : 'What sanction should be applied?';

  const handleConfirm = () => {
    if (selectedOption === null) return;
    if (isActionStep) {
      setActionAnswer(selectedOption);
      setStep('sanction');
      setSelectedOption(null);
    } else if (isSanctionStep) {
      setSanctionAnswer(selectedOption);
      setStep('review');
    }
  };

  const handleNextVideo = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setStep('action');
      setSelectedOption(null);
      setIsPlaying(false);
      setActionAnswer(null);
      setSanctionAnswer(null);
    }
  };

  const isLastVideo = currentIndex >= videos.length - 1;

  /* ── Review page ── */
  if (isReview) {
    const actionCorrect = actionAnswer === currentVideo.correctAction;
    const sanctionCorrect = sanctionAnswer === currentVideo.correctSanction;
    const score = (actionCorrect ? 1 : 0) + (sanctionCorrect ? 1 : 0);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-(--text-primary)">Video Analysis</h2>
          <span className="text-xs text-(--text-muted)">
            {currentIndex + 1} / {videos.length}
          </span>
        </div>

        <div className="bg-(--bg-surface) rounded-lg border border-(--border-subtle) p-5 space-y-5">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-(--text-primary)">{currentVideo.title} — Review</h3>
            <p className={`text-2xl font-bold mt-1 ${score === 2 ? 'text-(--success)' : score === 1 ? 'text-(--warning)' : 'text-(--error)'}`}>
              {score} / 2
            </p>
          </div>

          {/* Action result */}
          <div className={`p-4 rounded-lg border-2 ${actionCorrect ? 'border-(--success) bg-(--success)/5' : 'border-(--error) bg-(--error)/5'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-(--text-muted)">1. Action</span>
              <span className={`text-xs font-medium ${actionCorrect ? 'text-(--success)' : 'text-(--error)'}`}>
                {actionCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>
            <p className="text-sm text-(--text-primary) font-medium">
              Your answer: {actionAnswer !== null ? actionOptions[actionAnswer] : '—'}
            </p>
            {!actionCorrect && (
              <p className="text-sm text-(--success) mt-1">
                Correct answer: {actionOptions[currentVideo.correctAction]}
              </p>
            )}
            <p className="text-xs text-(--text-secondary) mt-2">{currentVideo.actionExplanation}</p>
          </div>

          {/* Sanction result */}
          <div className={`p-4 rounded-lg border-2 ${sanctionCorrect ? 'border-(--success) bg-(--success)/5' : 'border-(--error) bg-(--error)/5'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-(--text-muted)">2. Sanction</span>
              <span className={`text-xs font-medium ${sanctionCorrect ? 'text-(--success)' : 'text-(--error)'}`}>
                {sanctionCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>
            <p className="text-sm text-(--text-primary) font-medium">
              Your answer: {sanctionAnswer !== null ? sanctionOptions[sanctionAnswer] : '—'}
            </p>
            {!sanctionCorrect && (
              <p className="text-sm text-(--success) mt-1">
                Correct answer: {sanctionOptions[currentVideo.correctSanction]}
              </p>
            )}
            <p className="text-xs text-(--text-secondary) mt-2">{currentVideo.sanctionExplanation}</p>
          </div>
        </div>

        <button
          onClick={handleNextVideo}
          disabled={isLastVideo}
          className={`w-full py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
            isLastVideo
              ? 'bg-(--bg-surface-2) text-(--text-muted) cursor-default disabled:opacity-40'
              : 'bg-(--info)'
          }`}
        >
          {isLastVideo ? 'All Done' : 'Next Video'}
        </button>
      </div>
    );
  }

  /* ── Question steps (action / sanction) ── */
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-(--text-primary)">Video Analysis</h2>
        <span className="text-xs text-(--text-muted)">
          {currentIndex + 1} / {videos.length}
        </span>
      </div>

      {/* Video Player Stub */}
      <div className="bg-black rounded-lg aspect-video relative overflow-hidden group">
        <div className="absolute inset-0 flex items-center justify-center">
          {!isPlaying ? (
            <button
              onClick={() => setIsPlaying(true)}
              className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <span className="text-3xl ml-0.5 text-white">{'\u25B6'}</span>
            </button>
          ) : (
            <span className="text-white/50 text-sm">Video Playing (Stub)</span>
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setIsPlaying(!isPlaying)} className="text-white text-sm hover:text-(--info)">
            {isPlaying ? '\u23F8' : '\u25B6'}
          </button>
          <div className="flex gap-3">
            <button onClick={() => setIsMuted(!isMuted)} className="text-white text-sm hover:text-(--info)">
              {isMuted ? '\uD83D\uDD07' : '\uD83D\uDD0A'}
            </button>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${isActionStep ? 'bg-(--info)/15 text-(--info) font-medium' : 'bg-(--bg-surface-2) text-(--text-muted)'}`}>
          1. Action
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${isSanctionStep ? 'bg-(--info)/15 text-(--info) font-medium' : 'bg-(--bg-surface-2) text-(--text-muted)'}`}>
          2. Sanction
        </span>
      </div>

      {/* Question */}
      <div className="space-y-3">
        <h3 className="text-base font-medium text-(--text-primary)">{questionText}</h3>

        <div className="space-y-2">
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedOption(idx)}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 text-sm transition-colors ${
                selectedOption === idx
                  ? 'border-(--info) bg-(--info)/10 text-(--text-primary)'
                  : 'border-(--border-subtle) text-(--text-secondary) hover:bg-(--bg-surface-2)'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={selectedOption === null}
          className="w-full py-2.5 rounded-lg text-sm font-medium bg-(--info) text-white disabled:opacity-40 transition-colors"
        >
          {isActionStep ? 'Confirm & Next' : 'Confirm & View Review'}
        </button>
      </div>
    </div>
  );
};

const CoursesView = () => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-(--text-primary)">Courses</h2>
    <p className="text-sm text-(--text-muted)">Coming soon.</p>
  </div>
);

const ResourcesView = () => {
  const resources = [
    { id: 1, title: 'Laws of the Game 2024/25', type: 'PDF', size: '2.4 MB' },
    { id: 2, title: 'Referee Positioning Guide', type: 'PDF', size: '1.1 MB' },
    { id: 3, title: 'Match Report Template', type: 'DOCX', size: '0.5 MB' },
    { id: 4, title: 'Fitness Test Standards', type: 'PDF', size: '0.8 MB' },
    { id: 5, title: 'VAR Protocol Handbook', type: 'PDF', size: '3.2 MB' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-(--text-primary)">Study Resources</h2>
      <div className="space-y-2">
        {resources.map((res) => (
          <div
            key={res.id}
            className="flex items-center justify-between p-3 bg-(--bg-surface) rounded-lg border border-(--border-subtle)"
          >
            <div>
              <h3 className="text-sm font-medium text-(--text-primary)">{res.title}</h3>
              <p className="text-xs text-(--text-muted)">
                {res.type} &middot; {res.size}
              </p>
            </div>
            <button className="text-xs text-(--info) hover:underline">Download</button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Main Page ─── */

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<
    'test' | 'questions' | 'videos' | 'courses' | 'resources'
  >('test');

  return (
    <div className="min-h-screen bg-(--bg-primary) pb-24">
      <div className="px-4 max-w-3xl mx-auto">
        <LearnNav activeTab={activeTab} setActiveTab={setActiveTab} />
        <main>
          {activeTab === 'test' && <TestView />}
          {activeTab === 'questions' && <QuestionsView />}
          {activeTab === 'videos' && <VideosView />}
          {activeTab === 'courses' && <CoursesView />}
          {activeTab === 'resources' && <ResourcesView />}
        </main>
      </div>
    </div>
  );
}
