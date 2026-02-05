'use client';

import React, { useState } from 'react';
import styles from './filterModal.module.css';
import { X, CheckCircle2, Clock, Archive, List } from 'lucide-react';

interface CourseFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (status: string, label: string) => void;
    currentFilter: string;
}

const filterOptions = [
    { value: 'all', label: 'Semua Status', icon: List },
    { value: 'active', label: 'Aktif', icon: CheckCircle2 },
    { value: 'draft', label: 'Draft', icon: Clock },
    { value: 'archived', label: 'Diarsipkan', icon: Archive },
];

export default function CourseFilterModal({ isOpen, onClose, onApply, currentFilter }: CourseFilterModalProps) {
    const [selectedFilter, setSelectedFilter] = useState(currentFilter);

    if (!isOpen) return null;

    const handleApply = () => {
        const selected = filterOptions.find(opt => opt.value === selectedFilter);
        onApply(selectedFilter, selected?.label || 'Semua Status');
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Filter Kursus</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.section}>
                    <p className={styles.sectionTitle}>Status Kursus</p>
                    <div className={styles.options}>
                        {filterOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                                <button
                                    key={option.value}
                                    className={`${styles.optionBtn} ${selectedFilter === option.value ? styles.active : ''}`}
                                    onClick={() => setSelectedFilter(option.value)}
                                >
                                    <div className={styles.optionIcon}>
                                        <Icon size={16} />
                                    </div>
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose}>Batal</button>
                    <button className={styles.applyBtn} onClick={handleApply}>Terapkan</button>
                </div>
            </div>
        </div>
    );
}
