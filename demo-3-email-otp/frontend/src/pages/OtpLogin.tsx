import { useRef, useState, type CSSProperties, type RefObject, type SubmitEvent } from 'react';
import { BryntumButton, BryntumTextField } from '@bryntum/gantt-react';
import { authClient } from '../auth-client';

type Step = 'email' | 'otp';

export default function OtpLogin() {
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const formRef  = useRef<HTMLFormElement>(null);
    const emailRef = useRef<BryntumTextField>(null);
    const otpRef   = useRef<BryntumTextField>(null);

    function fieldInstance(ref: RefObject<BryntumTextField | null>) {
        return ref.current?.instance;
    }

    async function handleEmailSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        fieldInstance(emailRef)?.clearError();

        if (!email) {
            fieldInstance(emailRef)?.setError('Email is required');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            fieldInstance(emailRef)?.setError('Invalid email address');
            return;
        }

        setError('');
        setLoading(true);

        // Check if this email is on the invite list before sending OTP
        const res = await fetch(`/api/check-approved?email=${encodeURIComponent(email)}`);
        const data = await res.json() as { approved: boolean; message?: string };

        if (!data.approved) {
            setError(data.message ?? 'This email is not on the invite list.');
            setLoading(false);
            return;
        }

        const { error } = await authClient.emailOtp.sendVerificationOtp({
            email,
            type : 'sign-in'
        });

        if (error) {
            setError(error.message ?? 'Failed to send code. Please try again.');
            setLoading(false);
            return;
        }

        setStep('otp');
        setLoading(false);
    }

    async function handleOtpSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        fieldInstance(otpRef)?.clearError();

        if (otp.length !== 6) {
            fieldInstance(otpRef)?.setError('Enter the 6-digit code');
            return;
        }

        setError('');
        setLoading(true);

        const { error } = await authClient.signIn.emailOtp({ email, otp });

        if (error) {
            setError(error.message ?? 'Invalid code. Please try again.');
        }

        setLoading(false);
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h1 style={styles.title}>Project Gantt</h1>
                <p style={styles.subtitle}>
                    {step === 'email'
                        ? 'Enter your email to receive an access code'
                        : `Enter the 6-digit code sent to ${email}`}
                </p>

                {step === 'email' ? (
                    <form ref={formRef} onSubmit={handleEmailSubmit} style={styles.form}>
                        <BryntumTextField
                            ref={emailRef}
                            label="Email address"
                            labelPosition="above"
                            value={email}
                            placeholder="you@example.com"
                            width="100%"
                            onChange={({ value } : { value : string }) => setEmail(value)}
                        />

                        {error && <p style={styles.error}>{error}</p>}

                        <BryntumButton
                            behaviorType="submit"
                            rendition="filled"
                            text={loading ? 'Checking…' : 'Send Access Code'}
                            disabled={loading}
                            width="100%"
                            onClick={() => formRef.current?.requestSubmit()}
                        />
                    </form>
                ) : (
                    <form ref={formRef} onSubmit={handleOtpSubmit} style={styles.form}>
                        <BryntumTextField
                            ref={otpRef}
                            label="Access code"
                            labelPosition="above"
                            value={otp}
                            placeholder="123456"
                            width="100%"
                            onChange={({ value } : { value : string }) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
                        />

                        {error && <p style={styles.error}>{error}</p>}

                        <BryntumButton
                            behaviorType="submit"
                            rendition="filled"
                            text={loading ? 'Verifying…' : 'Sign In'}
                            disabled={loading}
                            width="100%"
                            onClick={() => formRef.current?.requestSubmit()}
                        />

                        <BryntumButton
                            rendition="outlined"
                            text="Use a different email"
                            width="100%"
                            onClick={() => {
                                setStep('email'); setOtp(''); setError('');
                            }}
                        />
                    </form>
                )}
            </div>
        </div>
    );
}

const styles: Record<string, CSSProperties> = {
    page : {
        minHeight      : '100%',
        display        : 'flex',
        alignItems     : 'center',
        justifyContent : 'center',
        padding        : '2rem'
    },
    card : {
        background   : '#fff',
        borderRadius : '12px',
        boxShadow    : '0 4px 24px rgba(0,0,0,0.08)',
        padding      : '2.5rem',
        width        : '100%',
        maxWidth     : '420px'
    },
    title : {
        fontSize     : '1.75rem',
        fontWeight   : 600,
        marginBottom : '0.25rem',
        color        : '#1a1a2e'
    },
    subtitle : {
        fontSize     : '0.875rem',
        color        : '#6b7280',
        marginBottom : '1.75rem',
        lineHeight   : 1.5
    },
    form : {
        display       : 'flex',
        flexDirection : 'column',
        gap           : '1rem'
    },
    error : {
        fontSize     : '0.85rem',
        color        : '#dc2626',
        background   : '#fef2f2',
        border       : '1px solid #fecaca',
        borderRadius : '6px',
        padding      : '0.5rem 0.75rem'
    }
};
