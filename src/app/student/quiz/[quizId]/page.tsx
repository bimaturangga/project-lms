'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar, TopHeader } from '@/components/layout';
import styles from '../quiz.module.css';
import {
    Clock,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    XCircle,
    RotateCcw,
    ArrowRight,
} from 'lucide-react';

// Mock data
const quizData = {
    id: 'q1',
    title: 'Quiz: HTML Fundamentals',
    courseTitle: 'Web Development Bootcamp',
    totalQuestions: 5,
    timeLimit: 10, // minutes
    passingScore: 70,
    questions: [
        {
            id: 1,
            question: 'Apa kepanjangan dari HTML?',
            options: [
                { id: 'a', text: 'Hyper Text Markup Language' },
                { id: 'b', text: 'High Tech Modern Language' },
                { id: 'c', text: 'Hyperlink and Text Markup Language' },
                { id: 'd', text: 'Home Tool Markup Language' },
            ],
            correctAnswer: 'a',
        },
        {
            id: 2,
            question: 'Tag mana yang digunakan untuk membuat heading terbesar?',
            options: [
                { id: 'a', text: '<heading>' },
                { id: 'b', text: '<h6>' },
                { id: 'c', text: '<h1>' },
                { id: 'd', text: '<head>' },
            ],
            correctAnswer: 'c',
        },
        {
            id: 3,
            question: 'Apa fungsi dari tag <p> dalam HTML?',
            options: [
                { id: 'a', text: 'Membuat link' },
                { id: 'b', text: 'Membuat paragraf' },
                { id: 'c', text: 'Membuat gambar' },
                { id: 'd', text: 'Membuat tabel' },
            ],
            correctAnswer: 'b',
        },
        {
            id: 4,
            question: 'Tag mana yang digunakan untuk membuat hyperlink?',
            options: [
                { id: 'a', text: '<link>' },
                { id: 'b', text: '<href>' },
                { id: 'c', text: '<a>' },
                { id: 'd', text: '<url>' },
            ],
            correctAnswer: 'c',
        },
        {
            id: 5,
            question: 'Atribut apa yang digunakan untuk menentukan URL tujuan dalam tag anchor?',
            options: [
                { id: 'a', text: 'src' },
                { id: 'b', text: 'href' },
                { id: 'c', text: 'link' },
                { id: 'd', text: 'url' },
            ],
            correctAnswer: 'b',
        },
    ],
};

export default function QuizPage() {
    const params = useParams();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(quizData.timeLimit * 60);

    const handleSelectOption = (optionId: string) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [currentQuestion]: optionId,
        }));
    };

    const handleNext = () => {
        if (currentQuestion < quizData.questions.length - 1) {
            setCurrentQuestion((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion((prev) => prev - 1);
        }
    };

    const handleSubmit = () => {
        setShowResults(true);
    };

    const calculateScore = () => {
        let correct = 0;
        quizData.questions.forEach((q, index) => {
            if (selectedAnswers[index] === q.correctAnswer) {
                correct++;
            }
        });
        return Math.round((correct / quizData.questions.length) * 100);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const question = quizData.questions[currentQuestion];
    const score = calculateScore();
    const passed = score >= quizData.passingScore;

    if (showResults) {
        return (
            <div className={styles.layout}>
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                <main className={styles.main}>
                    <TopHeader
                        title={quizData.title}
                        onMenuClick={() => setIsSidebarOpen(true)}
                    />

                    <div className={styles.content}>
                        <div className={styles.resultsCard}>
                            <div className={`${styles.resultsIcon} ${passed ? styles.pass : styles.fail}`}>
                                {passed ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
                            </div>
                            <h1 className={styles.resultsTitle}>
                                {passed ? 'Selamat! Anda Lulus!' : 'Coba Lagi!'}
                            </h1>
                            <div className={styles.resultsScore}>{score}%</div>
                            <p className={styles.resultsText}>
                                Anda menjawab {Object.keys(selectedAnswers).filter(
                                    (key) => selectedAnswers[parseInt(key)] === quizData.questions[parseInt(key)].correctAnswer
                                ).length} dari {quizData.questions.length} pertanyaan dengan benar.
                                {!passed && ` Nilai minimum untuk lulus adalah ${quizData.passingScore}%.`}
                            </p>
                            <div className={styles.resultsActions}>
                                {!passed && (
                                    <button
                                        className={`${styles.resultBtn} ${styles.secondary}`}
                                        onClick={() => {
                                            setShowResults(false);
                                            setCurrentQuestion(0);
                                            setSelectedAnswers({});
                                        }}
                                    >
                                        <RotateCcw size={20} />
                                        Ulangi Quiz
                                    </button>
                                )}
                                <Link
                                    href="/student/my-courses"
                                    className={`${styles.resultBtn} ${styles.primary}`}
                                >
                                    Lanjutkan Belajar
                                    <ArrowRight size={20} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.layout}>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className={styles.main}>
                <TopHeader
                    title={quizData.title}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <div className={styles.content}>
                    {/* Quiz Header */}
                    <div className={styles.quizHeader}>
                        <h1 className={styles.quizTitle}>{quizData.title}</h1>
                        <div className={styles.quizMeta}>
                            <span className={styles.metaItem}>
                                <HelpCircle size={16} />
                                {quizData.totalQuestions} Pertanyaan
                            </span>
                            <div className={`${styles.timer} ${timeRemaining < 60 ? styles.danger : timeRemaining < 180 ? styles.warning : ''}`}>
                                <Clock size={16} />
                                {formatTime(timeRemaining)}
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className={styles.progressSection}>
                        <div className={styles.progressHeader}>
                            <span className={styles.progressLabel}>
                                Pertanyaan {currentQuestion + 1} dari {quizData.questions.length}
                            </span>
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className={styles.questionCard}>
                        <div className={styles.questionNumber}>
                            Pertanyaan {currentQuestion + 1}
                        </div>
                        <div className={styles.questionText}>{question.question}</div>

                        <div className={styles.optionsList}>
                            {question.options.map((option) => (
                                <div
                                    key={option.id}
                                    className={`${styles.optionItem} ${selectedAnswers[currentQuestion] === option.id ? styles.selected : ''}`}
                                    onClick={() => handleSelectOption(option.id)}
                                >
                                    <div className={styles.optionLabel}>
                                        {option.id.toUpperCase()}
                                    </div>
                                    <div className={styles.optionText}>{option.text}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className={styles.quizNav}>
                        <button
                            className={`${styles.navBtn} ${styles.prev}`}
                            onClick={handlePrev}
                            disabled={currentQuestion === 0}
                        >
                            <ChevronLeft size={20} />
                            Sebelumnya
                        </button>

                        {currentQuestion === quizData.questions.length - 1 ? (
                            <button
                                className={`${styles.navBtn} ${styles.submitBtn}`}
                                onClick={handleSubmit}
                            >
                                <CheckCircle2 size={20} />
                                Selesai
                            </button>
                        ) : (
                            <button
                                className={`${styles.navBtn} ${styles.next}`}
                                onClick={handleNext}
                            >
                                Selanjutnya
                                <ChevronRight size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
