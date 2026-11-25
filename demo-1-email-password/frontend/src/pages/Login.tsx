import { useRef, useState, type CSSProperties, type SubmitEvent } from 'react';
import { BryntumTabPanel, type BryntumTabPanelProps } from '@bryntum/core-react-enterprise';
import type { Button, TextField } from '@bryntum/core-enterprise';
import { authClient } from '../auth-client';

function formatError(msg: string): string {
    return msg.replace(/\[body\.(\w+)\]/g, (_, f) => f.charAt(0).toUpperCase() + f.slice(1) + ':');
}

export default function Login() {
    const [error, setError] = useState('');

    const formRef     = useRef<HTMLFormElement>(null);
    const tabPanelRef = useRef<BryntumTabPanel>(null);

    // Created once so the widget keeps the same config reference across
    // StrictMode's double mount in development
    const [tabPanelConfig] = useState<BryntumTabPanelProps>(() => {
        const submit = () => formRef.current?.requestSubmit();

        return {
            animateTabChange : false,
            items            : {
                signInTab : {
                    title    : 'Sign In',
                    style    : 'padding-top: 1.5rem',
                    defaults : { labelPosition : 'above', width : '100%' },
                    items    : {
                        loginEmail : {
                            type        : 'textfield',
                            label       : 'Email',
                            placeholder : 'jane@example.com'
                        },
                        loginPassword : {
                            type        : 'textfield',
                            label       : 'Password',
                            inputType   : 'password',
                            placeholder : 'At least 8 characters'
                        },
                        loginButton : {
                            type         : 'button',
                            text         : 'Sign In',
                            rendition    : 'filled',
                            behaviorType : 'submit',
                            onClick      : submit
                        }
                    }
                },
                registerTab : {
                    title    : 'Register',
                    style    : 'padding-top: 1.5rem',
                    defaults : { labelPosition : 'above', width : '100%' },
                    items    : {
                        registerName : {
                            type        : 'textfield',
                            label       : 'Name',
                            placeholder : 'Jane Smith'
                        },
                        registerEmail : {
                            type        : 'textfield',
                            label       : 'Email',
                            placeholder : 'jane@example.com'
                        },
                        registerPassword : {
                            type        : 'textfield',
                            label       : 'Password',
                            inputType   : 'password',
                            placeholder : 'At least 8 characters'
                        },
                        registerButton : {
                            type         : 'button',
                            text         : 'Create Account',
                            rendition    : 'filled',
                            behaviorType : 'submit',
                            onClick      : submit
                        }
                    }
                }
            }
        };
    });

    function field(name: string) {
        return tabPanelRef.current?.instance.widgetMap[name] as TextField | undefined;
    }

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const tabPanel = tabPanelRef.current?.instance;
        if (!tabPanel) return;

        const mode     = tabPanel.activeIndex === 0 ? 'login' : 'register';
        const name     = ((field('registerName')?.value as string) ?? '').trim();
        const email    = field(mode === 'login' ? 'loginEmail' : 'registerEmail');
        const password = field(mode === 'login' ? 'loginPassword' : 'registerPassword');

        // Clear previous field errors
        ['registerName', 'loginEmail', 'registerEmail', 'loginPassword', 'registerPassword']
            .forEach(n => field(n)?.clearError());

        let valid = true;

        if (mode === 'register' && !name) {
            field('registerName')?.setError('Name is required');
            valid = false;
        }
        if (!email?.value) {
            email?.setError('Email is required');
            valid = false;
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value as string)) {
            email.setError('Invalid email address');
            valid = false;
        }
        if (!password?.value) {
            password?.setError('Password is required');
            valid = false;
        }
        else if ((password.value as string).length < 8) {
            password.setError('At least 8 characters required');
            valid = false;
        }
        if (!valid || !email || !password) return;

        setError('');

        const button     = tabPanel.widgetMap[mode === 'login' ? 'loginButton' : 'registerButton'] as Button;
        const buttonText = button.text;
        button.disabled  = true;
        button.text      = 'Please wait…';

        if (mode === 'register') {
            const { error } = await authClient.signUp.email({
                name,
                email    : email.value as string,
                password : password.value as string
            });
            if (error) setError(formatError(error.message ?? 'Registration failed.'));
        }
        else {
            const { error } = await authClient.signIn.email({
                email    : email.value as string,
                password : password.value as string
            });
            if (error) setError(formatError(error.message ?? 'Sign in failed.'));
        }

        button.disabled = false;
        button.text     = buttonText;
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h1 style={styles.title}>Project Gantt</h1>
                <p style={styles.subtitle}>Sign in to view your project timeline</p>

                <form ref={formRef} onSubmit={handleSubmit}>
                    <BryntumTabPanel
                        ref={tabPanelRef}
                        {...tabPanelConfig}
                        onTabChange={() => setError('')}
                    />
                    {error && <p style={styles.error}>{error}</p>}
                </form>
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
        marginBottom : '1.75rem'
    },
    error : {
        marginTop    : '1rem',
        fontSize     : '0.85rem',
        color        : '#dc2626',
        background   : '#fef2f2',
        border       : '1px solid #fecaca',
        borderRadius : '6px',
        padding      : '0.5rem 0.75rem'
    }
};
