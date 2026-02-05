// Payment types
export interface Payment {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    courseId: string;
    courseName: string;
    amount: number;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    paymentProof?: string;
    transactionId?: string;
    notes?: string;
    createdAt: string;
    verifiedAt?: string;
    verifiedBy?: string;
}

export type PaymentStatus = 'pending' | 'verified' | 'rejected' | 'expired';
export type PaymentMethod = 'bank_transfer' | 'e_wallet' | 'credit_card';

export interface PaymentSubmission {
    courseId: string;
    paymentMethod: PaymentMethod;
    paymentProof: File;
    notes?: string;
}
