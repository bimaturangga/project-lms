// Quiz types
export interface Quiz {
    id: string;
    lessonId: string;
    title: string;
    description?: string;
    passingScore: number; // percentage
    timeLimit?: number; // in minutes
    questions: Question[];
    createdAt: string;
    updatedAt: string;
}

export interface Question {
    id: string;
    type: QuestionType;
    text: string;
    points: number;
    options?: QuestionOption[];
    correctAnswer?: string | string[];
    explanation?: string;
}

export type QuestionType = 'multiple_choice' | 'multiple_select' | 'true_false' | 'essay';

export interface QuestionOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

// Quiz attempt
export interface QuizAttempt {
    id: string;
    quizId: string;
    userId: string;
    answers: QuizAnswer[];
    score: number;
    passed: boolean;
    startedAt: string;
    completedAt?: string;
}

export interface QuizAnswer {
    questionId: string;
    answer: string | string[];
    isCorrect: boolean;
    points: number;
}
