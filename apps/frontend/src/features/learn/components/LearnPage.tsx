import { useState } from 'react';
import { useAuth } from '@/features/auth/components/useAuth';

/**
 * LearnNav - Navigation tabs for the Learn section
 * Updated to support 5 tabs and sticky positioning
 */
const LearnNav = ({ 
  activeTab, 
  setActiveTab 
}: { 
  activeTab: string; 
  setActiveTab: (tab: 'test' | 'questions' | 'videos' | 'courses' | 'resources') => void;
}) => {
  const tabs = ['Test', 'Questions', 'Videos', 'Courses', 'Resources'] as const;

  return (
    <nav className="sticky top-0 z-20 bg-(--bg-primary)/95 backdrop-blur-sm border-b border-(--border-subtle) mb-4 -mx-4 px-4">
      <div className="flex overflow-x-auto no-scrollbar py-3 gap-2 md:justify-center">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase() as any)}
            className={`shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-colors border whitespace-nowrap ${
              activeTab === tab.toLowerCase()
                ? 'bg-(--brand-yellow) text-(--bg-primary) border-(--brand-yellow)'
                : 'bg-(--bg-surface-2) text-(--text-secondary) border-transparent hover:bg-(--bg-hover)'
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

/**
 * AverageTimeCard - Displays average time per answer
 * "more small than the first one, on the left side"
 */
const AverageTimeCard = () => {
  return (
    <div className="bg-(--bg-surface) rounded-2xl p-4 shadow-sm border border-(--border-subtle) w-full max-w-[180px] mb-6">
      <h3 className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-wider mb-1">
        Avg Time / Answer
      </h3>
      <div className="flex items-baseline text-(--text-primary)">
        <span className="text-2xl font-extrabold">45</span>
        <span className="text-sm font-medium text-(--text-muted) ml-1">sec</span>
      </div>
    </div>
  );
};

/**
 * CourseNode - Individual course/level node in the path
 */
const CourseNode = ({ 
  id, 
  title, 
  status, 
  onClick 
}: { 
  id: number; 
  title: string; 
  status: 'locked' | 'active' | 'completed'; 
  onClick: () => void;
}) => {
  const getStyles = () => {
    switch (status) {
      case 'completed':
        return 'bg-(--brand-yellow) text-(--bg-primary) border-(--brand-yellow)';
      case 'active':
        return 'bg-(--bg-surface) text-(--text-primary) border-(--brand-yellow) ring-4 ring-(--brand-yellow)/20';
      case 'locked':
      default:
        return 'bg-(--bg-surface-2) text-(--text-muted) border-transparent grayscale opacity-70';
    }
  };

  return (
    <div className="flex flex-col items-center relative z-10">
      <button
        onClick={onClick}
        disabled={status === 'locked'}
        className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-xl shadow-md border-2 transition-all transform active:scale-95 ${getStyles()}`}
        aria-label={`Start course: ${title}`}
      >
        {status === 'completed' ? '✓' : id}
      </button>
      <span className="mt-2 text-xs font-medium text-(--text-secondary) bg-(--bg-surface) px-2 py-1 rounded-md shadow-sm border border-(--border-subtle)">
        {title}
      </span>
    </div>
  );
};

/**
 * Question Data Generator
 */
type Question = {
  id: number;
  question: string;
  image?: string;
  options: string[];
  correctAnswer: number;
};

const getQuestionsForLevel = (levelId: number): Question[] => {
  const baseImage = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png";
  
  const questionsByLevel: Record<number, Omit<Question, 'id'>[]> = {
    1: [ // Basics
      { question: "What is React?", image: baseImage, options: ["A Database", "A Library for UIs", "A Framework", "A Server"], correctAnswer: 1 },
      { question: "What is a Component?", image: baseImage, options: ["A function/class that returns UI", "A database table", "A server route", "A variable"], correctAnswer: 0 },
      { question: "What is the Virtual DOM?", image: baseImage, options: ["A browser extension", "A lightweight copy of DOM", "A heavy database", "A CSS library"], correctAnswer: 1 },
      { question: "How do you create a React app?", image: baseImage, options: ["npm start", "npx create-react-app", "node run", "git init"], correctAnswer: 1 },
      { question: "What is the entry file usually?", image: baseImage, options: ["index.js", "app.js", "server.js", "main.css"], correctAnswer: 0 },
    ],
    2: [ // Hooks
      { question: "Which hook manages state?", image: baseImage, options: ["useEffect", "useState", "useContext", "useReducer"], correctAnswer: 1 },
      { question: "Which hook handles side effects?", image: baseImage, options: ["useState", "useEffect", "useMemo", "useRef"], correctAnswer: 1 },
      { question: "Can you use hooks in classes?", image: baseImage, options: ["Yes", "No", "Sometimes", "Only useEffect"], correctAnswer: 1 },
      { question: "What does useRef return?", image: baseImage, options: ["A mutable object", "A state value", "A function", "A boolean"], correctAnswer: 0 },
      { question: "Rules of Hooks: Call them at...", image: baseImage, options: ["Top level", "Inside loops", "Inside conditions", "Anywhere"], correctAnswer: 0 },
    ],
    3: [ // JSX
      { question: "What does JSX stand for?", image: baseImage, options: ["Java Syntax X", "JavaScript XML", "JSON Xylophone", "JS Extension"], correctAnswer: 1 },
      { question: "How do you write comments in JSX?", image: baseImage, options: ["<!-- -->", "{/* */}", "//", "/* */"], correctAnswer: 1 },
      { question: "Can browsers read JSX directly?", image: baseImage, options: ["Yes", "No", "Only Chrome", "Only Firefox"], correctAnswer: 1 },
      { question: "What attribute is used for classes?", image: baseImage, options: ["class", "className", "style", "id"], correctAnswer: 1 },
      { question: "JSX tags must be...", image: baseImage, options: ["Open", "Closed", "Self-closing or closed", "None"], correctAnswer: 2 },
    ],
    4: [ // Props
      { question: "What are Props?", image: baseImage, options: ["Internal state", "Arguments passed to components", "Global variables", "CSS styles"], correctAnswer: 1 },
      { question: "Are Props mutable?", image: baseImage, options: ["Yes", "No (Read-only)", "Sometimes", "Only in classes"], correctAnswer: 1 },
      { question: "How to access children?", image: baseImage, options: ["props.child", "props.children", "props.content", "props.inner"], correctAnswer: 1 },
      { question: "Can you pass functions as props?", image: baseImage, options: ["Yes", "No", "Only strings", "Only numbers"], correctAnswer: 0 },
      { question: "Default props are for...", image: baseImage, options: ["Errors", "Fallback values", "Styling", "Routing"], correctAnswer: 1 },
    ],
    5: [ // State
      { question: "What is State?", image: baseImage, options: ["External data", "Internal managed data", "Global data", "Static data"], correctAnswer: 1 },
      { question: "Is setState asynchronous?", image: baseImage, options: ["Yes", "No", "Maybe", "Never"], correctAnswer: 0 },
      { question: "How to update state based on previous?", image: baseImage, options: ["Direct assignment", "Callback function", "Await", "Promise"], correctAnswer: 1 },
      { question: "State updates cause...", image: baseImage, options: ["Page reload", "Re-render", "Server crash", "Nothing"], correctAnswer: 1 },
      { question: "Where should state live?", image: baseImage, options: ["Lowest common ancestor", "Global only", "In HTML", "In CSS"], correctAnswer: 0 },
    ],
    6: [ // Effects
      { question: "When does useEffect run by default?", image: baseImage, options: ["Before render", "After every render", "Once", "Never"], correctAnswer: 1 },
      { question: "How to run useEffect only once?", image: baseImage, options: ["No array", "Empty array []", "Array with variables", "Return false"], correctAnswer: 1 },
      { question: "What is the cleanup function for?", image: baseImage, options: ["Deleting files", "Unsubscribing/Cleaning up", "Rendering", "Styling"], correctAnswer: 1 },
      { question: "Can useEffect be async?", image: baseImage, options: ["Yes, directly", "No, use inner async function", "Only in classes", "Never"], correctAnswer: 1 },
      { question: "Dependency array controls...", image: baseImage, options: ["Rendering", "When effect re-runs", "Component mounting", "State"], correctAnswer: 1 },
    ],
    7: [ // Events
      { question: "How are events named in React?", image: baseImage, options: ["lowercase", "camelCase", "UPPERCASE", "kebab-case"], correctAnswer: 1 },
      { question: "What do you pass to event handlers?", image: baseImage, options: ["String", "Function", "Boolean", "Object"], correctAnswer: 1 },
      { question: "How to prevent default behavior?", image: baseImage, options: ["return false", "e.preventDefault()", "e.stop()", "e.cancel()"], correctAnswer: 1 },
      { question: "What is the event object?", image: baseImage, options: ["Native DOM event", "SyntheticEvent", "Custom JSON", "String"], correctAnswer: 1 },
      { question: "Can you pass arguments to handlers?", image: baseImage, options: ["No", "Yes, via arrow function/bind", "Only strings", "Only numbers"], correctAnswer: 1 },
    ],
    8: [ // Forms
      { question: "What is a Controlled Component?", image: baseImage, options: ["Form data handled by DOM", "Form data handled by React State", "A validated form", "A fast form"], correctAnswer: 1 },
      { question: "What attribute binds input to state?", image: baseImage, options: ["data", "bind", "value", "model"], correctAnswer: 2 },
      { question: "What handler updates state?", image: baseImage, options: ["onInput", "onChange", "onUpdate", "onType"], correctAnswer: 1 },
      { question: "What is an Uncontrolled Component?", image: baseImage, options: ["Uses Refs", "Uses State", "Uses Redux", "Uses Context"], correctAnswer: 0 },
      { question: "Which library helps with forms?", image: baseImage, options: ["React Router", "Formik / React Hook Form", "Redux", "Axios"], correctAnswer: 1 },
    ],
    9: [ // Context
      { question: "What is Context used for?", image: baseImage, options: ["Local state", "Prop drilling avoidance", "Database connection", "Routing"], correctAnswer: 1 },
      { question: "How do you provide data?", image: baseImage, options: ["<Provider value={...}>", "<Context data={...}>", "<Give value={...}>", "<Pass props={...}>"], correctAnswer: 0 },
      { question: "How do you consume data?", image: baseImage, options: ["useContext", "useState", "useProps", "useData"], correctAnswer: 0 },
      { question: "Can Context replace Redux?", image: baseImage, options: ["No", "Yes, for simple state", "Always", "Never"], correctAnswer: 1 },
      { question: "Default value is used when...", image: baseImage, options: ["Provider is missing", "Value is null", "Value is undefined", "Always"], correctAnswer: 0 },
    ],
    10: [ // Router
      { question: "What wraps the app for routing?", image: baseImage, options: ["<Route>", "<Router> / <BrowserRouter>", "<Switch>", "<Link>"], correctAnswer: 1 },
      { question: "How to define a route?", image: baseImage, options: ["<Path>", "<Route path='...' />", "<Url>", "<Go>"], correctAnswer: 1 },
      { question: "Component for navigation?", image: baseImage, options: ["<a>", "<Link>", "<Go>", "<Nav>"], correctAnswer: 1 },
      { question: "Hook for URL parameters?", image: baseImage, options: ["useParams", "useRoute", "useUrl", "usePath"], correctAnswer: 0 },
      { question: "Hook for navigation?", image: baseImage, options: ["useGo", "useNavigate", "useMove", "usePush"], correctAnswer: 1 },
    ]
  };

  const questions = questionsByLevel[levelId] || questionsByLevel[1];
  
  // Map to include IDs
  return questions.map((q, idx) => ({
    ...q,
    id: idx + 1
  }));
};

const PracticeTestRunner = ({ 
  onExit, 
  title, 
  onComplete, 
  questions 
}: { 
  onExit: () => void; 
  title?: string; 
  onComplete?: (passed: boolean) => void;
  questions: Question[];
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);

  const question = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
    setAnswers(prev => ({ ...prev, [question.id]: index }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      const nextQId = questions[currentQuestionIndex + 1].id;
      setSelectedOption(answers[nextQId] ?? null);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      const prevQId = questions[currentQuestionIndex - 1].id;
      setSelectedOption(answers[prevQId] ?? null);
    }
  };

  if (isFinished) {
    const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0), 0);
    const passed = (score / totalQuestions) >= 0.9;

    return (
      <div className="bg-(--bg-surface) p-4 rounded-2xl border border-(--border-subtle) animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-6 border-b border-(--border-subtle) pb-6">
          <h2 className="text-2xl font-bold text-(--text-primary) mb-2">{title ? `${title} Complete!` : 'Practice Complete!'}</h2>
          <div className={`text-5xl font-extrabold mb-1 ${passed ? 'text-(--success)' : 'text-(--brand-yellow)'}`}>{score}/{totalQuestions}</div>
          <p className="text-(--text-secondary) text-sm">Correct Answers</p>
          {!passed && <p className="text-(--error) text-xs font-bold mt-2">You need 90% to unlock the next level.</p>}
        </div>
        
        <div className="space-y-4 mb-6">
          <h3 className="font-bold text-(--text-primary) px-1">Review</h3>
          {questions.map((q, index) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            
            return (
              <div key={q.id} className={`p-4 rounded-xl border ${isCorrect ? 'border-(--border-subtle) bg-(--bg-surface-2)/30' : 'border-(--error)/30 bg-(--error)/5'}`}>
                <div className="flex gap-3 mb-3">
                  <span className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${isCorrect ? 'bg-(--success) text-white' : 'bg-(--error) text-white'}`}>
                    {index + 1}
                  </span>
                  <p className="font-medium text-(--text-primary) text-sm">{q.question}</p>
                </div>

                <div className="space-y-2 pl-9">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = optIdx === userAnswer;
                    const isTheCorrectAnswer = optIdx === q.correctAnswer;
                    
                    let styles = "p-3 rounded-lg text-xs border ";
                    if (isTheCorrectAnswer) {
                      styles += "bg-(--success)/10 border-(--success) text-(--text-primary) font-medium";
                    } else if (isSelected && !isCorrect) {
                      styles += "bg-(--error)/10 border-(--error) text-(--text-primary) font-medium";
                    } else {
                      styles += "border-transparent bg-(--bg-surface-2) text-(--text-secondary) opacity-60";
                    }

                    return (
                      <div key={optIdx} className={styles}>
                        <div className="flex justify-between items-center">
                          <span>{opt}</span>
                          {isTheCorrectAnswer && <span className="text-(--success) font-bold">✓</span>}
                          {isSelected && !isCorrect && <span className="text-(--error) font-bold">✗</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={() => {
            if (onComplete) onComplete(passed);
            onExit();
          }} 
          className="w-full py-3 bg-(--brand-yellow) text-(--bg-primary) font-bold rounded-xl hover:bg-(--brand-yellow-soft) transition-colors"
        >
          {passed ? 'Continue' : 'Try Again'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-(--bg-surface) p-4 rounded-2xl border border-(--border-subtle) flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-bold text-(--text-muted) uppercase tracking-wider">
          {title ? `${title} • ` : ''}Question {currentQuestionIndex + 1} / {totalQuestions}
        </span>
        <button onClick={onExit} className="text-(--text-muted) hover:text-(--text-primary)">✕</button>
      </div>
      <div className="w-full bg-(--bg-surface-2) h-1.5 rounded-full mb-6">
        <div className="bg-(--brand-yellow) h-full rounded-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }} />
      </div>
      <h3 className="text-lg font-bold text-(--text-primary) mb-4">{question.question}</h3>
      {question.image && (
        <div className="mb-6 rounded-xl overflow-hidden border border-(--border-subtle) aspect-video bg-(--bg-surface-2) flex items-center justify-center">
          <img src={question.image} alt="Question context" className="w-full h-full object-contain" />
        </div>
      )}
      <div className="space-y-3 mb-6 flex-1">
        {question.options.map((option, idx) => (
          <button key={idx} onClick={() => handleOptionSelect(idx)} className={`w-full p-4 rounded-xl text-left font-medium border-2 transition-all ${selectedOption === idx ? 'border-(--brand-yellow) bg-(--brand-yellow)/10 text-(--text-primary)' : 'border-(--border-subtle) hover:border-(--border-strong) text-(--text-secondary)'}`}>{option}</button>
        ))}
      </div>
      <div className="flex gap-3 mt-auto pt-4 border-t border-(--border-subtle)">
        <button onClick={handlePrev} disabled={currentQuestionIndex === 0} className="px-6 py-3 rounded-xl font-bold text-(--text-secondary) bg-(--bg-surface-2) disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
        <button onClick={handleNext} disabled={selectedOption === null} className="flex-1 px-6 py-3 rounded-xl font-bold text-(--bg-primary) bg-(--brand-yellow) hover:bg-(--brand-yellow-soft) disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{currentQuestionIndex === totalQuestions - 1 ? 'Finish' : 'Next'}</button>
      </div>
    </div>
  );
};

/**
 * TestView - Main learning path view
 * Includes course path and practice test functionality
 */
const TestView = () => {
  const { user, updateUserMetadata } = useAuth();
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [currentCourseTitle, setCurrentCourseTitle] = useState<string>('');
  const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);
  
  // Get completed level from user metadata, default to 0
  const completedLevels = (user?.user_metadata?.completed_level as number) || 0;

  const courseTitles = ['Basics', 'Hooks', 'JSX', 'Props', 'State', 'Effects', 'Events', 'Forms', 'Context', 'Router'];

  const courses = courseTitles.map((title, index) => {
    const id = index + 1;
    let status: 'locked' | 'active' | 'completed' = 'locked';
    if (id <= completedLevels) status = 'completed';
    else if (id === completedLevels + 1) status = 'active';
    
    return { id, title, status };
  });

  const handleCourseClick = (id: number, title: string) => {
    setCurrentCourseId(id);
    setCurrentCourseTitle(title);
    setIsPracticeMode(true);
  };

  const startPracticeTest = () => {
    setCurrentCourseTitle('Quick Practice');
    setCurrentCourseId(null);
    setIsPracticeMode(true);
    // Logic to start practice test would go here
  };

  const handleTestComplete = async (passed: boolean) => {
    if (passed && currentCourseId !== null && currentCourseId === completedLevels + 1) {
      // Update user metadata in Supabase
      try {
        await updateUserMetadata({ completed_level: completedLevels + 1 });
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    }
  };

  if (isPracticeMode) {
    const questions = currentCourseId ? getQuestionsForLevel(currentCourseId) : getQuestionsForLevel(1);
    return (
      <PracticeTestRunner 
        onExit={() => setIsPracticeMode(false)} 
        title={currentCourseTitle} 
        onComplete={handleTestComplete}
        questions={questions}
      />
    );
  }

  return (
    <div className="flex flex-col items-start">
      {/* Stats Section */}
      <AverageTimeCard />

      {/* Practice Test CTA */}
      <div className="w-full mb-8 flex justify-center">
        <button
          onClick={startPracticeTest}
          className="w-full max-w-sm bg-(--bg-surface) hover:bg-(--bg-surface-2) border-2 border-(--brand-yellow) border-dashed p-4 rounded-2xl flex items-center justify-center gap-3 transition-colors group"
        >
          <span className="text-2xl">⚡️</span>
          <div className="text-left">
            <p className="font-bold text-(--text-primary)">Quick Practice</p>
            <p className="text-xs text-(--text-muted)">Review your weak spots</p>
          </div>
        </button>
      </div>

      {/* Learning Path (Duolingo Style) */}
      <div className="w-full relative flex flex-col items-center gap-8 pb-12">
        {/* Connecting Line */}
        <div className="absolute top-10 bottom-10 w-2 bg-(--bg-surface-2) rounded-full z-0" />
        
        {courses.map((course, index) => (
          <div 
            key={course.id} 
            className={`transform ${index % 2 === 0 ? '-translate-x-8' : 'translate-x-8'}`}
          >
            <CourseNode 
              {...course} 
              onClick={() => handleCourseClick(course.id, course.title)} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * QuestionsView - 30 Example Questions
 */
const QuestionsView = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Generate 30 stub questions
  const questions = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    text: i === 0 
      ? "O guarda-redes da equipa visitada está a controlar a bola com os pés, no interior da sua área de penálti, com o jogo a decorrer. Fora do terreno de jogo encontra-se um colega seu a ser assistido. O guarda-redes espera mais de 12 segundos para se desfazer da bola. O que decidir?"
      : `Question ${i + 1}: What is the correct decision in this scenario? (Stub)`,
    options: [
      "Pontapé livre indireto",
      "Pontapé livre direto",
      "Lançamento lateral",
      "Nada a assinalar"
    ],
    correctAnswer: 0,
    explanation: "O guarda-redes não pode reter a bola por mais de 6 segundos com as mãos, mas com os pés não há limite técnico explícito, contudo pode ser considerado perda de tempo se excessivo."
  }));

  const currentQuestion = questions[currentIndex];

  const handleConfirm = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setIsConfirmed(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsConfirmed(false);
      setFeedback(null);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-(--text-primary)">Practice Questions</h2>
        <span className="text-xs font-bold bg-(--bg-surface-2) px-3 py-1 rounded-full text-(--text-secondary)">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="bg-(--bg-surface) p-6 rounded-2xl border border-(--border-subtle) shadow-sm">
        <p className="text-lg font-medium text-(--text-primary) mb-6 leading-relaxed">
          {currentQuestion.text}
        </p>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let borderClass = 'border-(--border-subtle)';
            let bgClass = 'bg-transparent';
            
            if (isConfirmed) {
              if (idx === currentQuestion.correctAnswer) {
                borderClass = 'border-(--success)';
                bgClass = 'bg-(--success)/10';
              } else if (idx === selectedOption && feedback === 'wrong') {
                borderClass = 'border-(--error)';
                bgClass = 'bg-(--error)/10';
              }
            } else if (selectedOption === idx) {
              borderClass = 'border-(--brand-yellow)';
              bgClass = 'bg-(--brand-yellow)/10';
            }

            return (
              <button
                key={idx}
                onClick={() => !isConfirmed && setSelectedOption(idx)}
                disabled={isConfirmed}
                className={`w-full p-4 rounded-xl text-left font-medium border-2 transition-all ${borderClass} ${bgClass} hover:bg-(--bg-surface-2)`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {isConfirmed && (
          <div className={`mt-6 p-4 rounded-xl ${feedback === 'correct' ? 'bg-(--success)/10 text-(--success)' : 'bg-(--error)/10 text-(--error)'}`}>
            <p className="font-bold mb-1">{feedback === 'correct' ? 'Correct!' : 'Incorrect'}</p>
            <p className="text-sm text-(--text-primary)">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {!isConfirmed ? (
            <>
              <button 
                onClick={handleSkip}
                className="px-6 py-3 rounded-xl font-bold text-(--text-secondary) bg-(--bg-surface-2) hover:bg-(--bg-hover)"
              >
                Skip
              </button>
              <button 
                onClick={handleConfirm}
                disabled={selectedOption === null}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-(--bg-primary) bg-(--brand-yellow) hover:bg-(--brand-yellow-soft) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Confirm
              </button>
            </>
          ) : (
            <button 
              onClick={handleNext}
              className="w-full px-6 py-3 rounded-xl font-bold text-(--bg-primary) bg-(--brand-yellow) hover:bg-(--brand-yellow-soft) transition-colors"
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * VideosView - Video scenarios
 */
const VideosView = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const videos = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: `Scenario ${i + 1}`,
    question: "What is the correct restart for this play?",
    options: ["Goal Kick", "Corner Kick", "Penalty Kick", "Dropped Ball"],
    correctAnswer: 1,
    explanation: "The ball crossed the goal line last touched by a defender."
  }));

  const currentVideo = videos[currentIndex];

  const handleConfirm = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === currentVideo.correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setIsConfirmed(true);
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsConfirmed(false);
      setFeedback(null);
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-(--text-primary)">Video Analysis</h2>
        <span className="text-xs font-bold bg-(--bg-surface-2) px-3 py-1 rounded-full text-(--text-secondary)">
          {currentIndex + 1} / {videos.length}
        </span>
      </div>

      {/* Video Player Stub */}
      <div className="bg-black rounded-2xl aspect-video relative overflow-hidden group">
        <div className="absolute inset-0 flex items-center justify-center">
          {!isPlaying && (
            <button 
              onClick={() => setIsPlaying(true)}
              className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <span className="text-4xl ml-1">▶</span>
            </button>
          )}
          {isPlaying && <span className="text-white/50 text-sm">Video Playing (Stub)</span>}
        </div>
        
        {/* Controls Stub */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-(--brand-yellow)">
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div className="flex gap-4">
            <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-(--brand-yellow)">
              {isMuted ? '🔇' : '🔊'}
            </button>
            <button className="text-white hover:text-(--brand-yellow)">⛶</button>
          </div>
        </div>
      </div>

      <div className="bg-(--bg-surface) p-6 rounded-2xl border border-(--border-subtle)">
        <h3 className="font-bold text-lg mb-4 text-(--text-primary)">{currentVideo.question}</h3>
        
        <div className="grid grid-cols-1 gap-3 mb-6">
          {currentVideo.options.map((option, idx) => {
             let borderClass = 'border-(--border-subtle)';
             if (isConfirmed) {
               if (idx === currentVideo.correctAnswer) borderClass = 'border-(--success) bg-(--success)/10';
               else if (idx === selectedOption && feedback === 'wrong') borderClass = 'border-(--error) bg-(--error)/10';
             } else if (selectedOption === idx) {
               borderClass = 'border-(--brand-yellow) bg-(--brand-yellow)/10';
             }

             return (
               <button
                 key={idx}
                 onClick={() => !isConfirmed && setSelectedOption(idx)}
                 disabled={isConfirmed}
                 className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${borderClass}`}
               >
                 {option}
               </button>
             );
          })}
        </div>

        {isConfirmed && (
          <div className={`mb-6 p-4 rounded-xl ${feedback === 'correct' ? 'bg-(--success)/10 text-(--success)' : 'bg-(--error)/10 text-(--error)'}`}>
            <p className="font-bold">{feedback === 'correct' ? 'Correct Decision' : 'Incorrect Decision'}</p>
            <p className="text-sm mt-1 text-(--text-primary)">{currentVideo.explanation}</p>
          </div>
        )}

        <button
          onClick={isConfirmed ? handleNext : handleConfirm}
          disabled={!isConfirmed && selectedOption === null}
          className="w-full py-3 bg-(--brand-yellow) text-(--bg-primary) font-bold rounded-xl hover:bg-(--brand-yellow-soft) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isConfirmed ? 'Next Video' : 'Confirm Decision'}
        </button>
      </div>
    </div>
  );
};

/**
 * CoursesView - Structured learning paths
 */
const CoursesView = () => {
  const [view, setView] = useState<'list' | 'map' | 'level'>('list');
  const [showExitWarning, setShowExitWarning] = useState(false);

  const handleStartCourse = () => setView('map');
  const handleStartLevel = () => setView('level');
  
  const handleExitLevel = () => setShowExitWarning(true);
  const confirmExit = () => {
    setShowExitWarning(false);
    setView('map');
  };

  if (view === 'list') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <h2 className="text-xl font-bold text-(--text-primary)">Available Courses</h2>
        <div className="bg-(--bg-surface) rounded-2xl border border-(--border-subtle) overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={handleStartCourse}>
          <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
            <span className="text-4xl">🎓</span>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-bold text-(--text-primary) mb-2">Laws of the Game: 0 to Expert</h3>
            <p className="text-sm text-(--text-secondary) mb-4">Master the 17 laws of football in one month. Includes certification.</p>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold bg-(--brand-yellow)/20 text-(--brand-yellow-dark) px-2 py-1 rounded-md">Beginner Friendly</span>
              <span className="text-xs text-(--text-muted)">12 Modules</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'map') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button onClick={() => setView('list')} className="text-sm text-(--text-secondary) hover:text-(--text-primary)">← Back to Courses</button>
        <h2 className="text-xl font-bold text-(--text-primary) text-center">Course Map</h2>
        <div className="flex flex-col items-center gap-8 py-8 relative">
          <div className="absolute top-10 bottom-10 w-1 bg-(--border-subtle) z-0" />
          {[1, 2, 3, 4].map((level) => (
            <div key={level} className="relative z-10 bg-(--bg-surface) p-2 rounded-full border-4 border-(--bg-primary)">
              <button 
                onClick={handleStartLevel}
                className="w-16 h-16 rounded-full bg-(--brand-yellow) text-(--bg-primary) font-bold text-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
              >
                {level}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Level View (Stub)
  return (
    <div className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-(--text-primary)">Level 1: The Field of Play</h2>
        <button onClick={handleExitLevel} className="text-sm text-(--error) font-medium">Exit Level</button>
      </div>

      <div className="bg-(--bg-surface) p-6 rounded-2xl border border-(--border-subtle) flex-1">
        <p className="text-lg font-medium mb-6">What is the standard distance between the penalty spot and the goal line?</p>
        <div className="space-y-3">
          {["10 yards", "11 meters", "12 yards (11m)", "9.15 meters"].map((opt, i) => (
            <button key={i} className="w-full p-4 rounded-xl border border-(--border-subtle) text-left hover:bg-(--bg-surface-2)">{opt}</button>
          ))}
        </div>
      </div>

      {showExitWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-(--bg-surface) p-6 rounded-2xl max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold mb-2">Leave Level?</h3>
            <p className="text-sm text-(--text-secondary) mb-6">Are you sure you want to go out of the level without saving your progress?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowExitWarning(false)} className="flex-1 py-2 rounded-lg bg-(--bg-surface-2) font-medium">Cancel</button>
              <button onClick={confirmExit} className="flex-1 py-2 rounded-lg bg-(--error) text-white font-medium">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ResourcesView - Documents and downloads
 */
const ResourcesView = () => {
  const resources = [
    { id: 1, title: "Laws of the Game 2024/25", type: "PDF", size: "2.4 MB" },
    { id: 2, title: "Referee Positioning Guide", type: "PDF", size: "1.1 MB" },
    { id: 3, title: "Match Report Template", type: "DOCX", size: "0.5 MB" },
    { id: 4, title: "Fitness Test Standards", type: "PDF", size: "0.8 MB" },
    { id: 5, title: "VAR Protocol Handbook", type: "PDF", size: "3.2 MB" },
  ];

  const handlePreview = (title: string) => {
    // Stub for preview
    window.open('#', '_blank'); 
    console.log(`Previewing ${title}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-xl font-bold text-(--text-primary)">Study Resources</h2>
      <div className="grid gap-4">
        {resources.map((res) => (
          <div key={res.id} className="bg-(--bg-surface) p-4 rounded-xl border border-(--border-subtle) flex items-center justify-between group hover:border-(--brand-yellow) transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-(--bg-surface-2) rounded-lg flex items-center justify-center text-xl">
                {res.type === 'PDF' ? '📄' : '📝'}
              </div>
              <div>
                <h3 className="font-bold text-(--text-primary) text-sm">{res.title}</h3>
                <p className="text-xs text-(--text-muted)">{res.type} • {res.size}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handlePreview(res.title)}
                className="p-2 text-(--text-secondary) hover:text-(--brand-yellow) hover:bg-(--brand-yellow)/10 rounded-lg transition-colors"
                title="Preview"
              >
                👁️
              </button>
              <button 
                className="p-2 text-(--text-secondary) hover:text-(--success) hover:bg-(--success)/10 rounded-lg transition-colors"
                title="Download"
              >
                ⬇️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * LearnPage - Main container for the learning experience
 */
export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<'test' | 'questions' | 'videos' | 'courses' | 'resources'>('test');

  return (
    <div className="min-h-screen bg-(--bg-primary) pb-24">
      {/* 1. Divider Line (Visual separation from header) */}
      <div className="w-full h-px bg-(--border-subtle) mb-2" role="presentation" />

      <div className="px-4 max-w-3xl mx-auto">
        {/* 2. Navigation Buttons */}
        <LearnNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* 3. Content Sections */}
        <main className="mt-4">
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
