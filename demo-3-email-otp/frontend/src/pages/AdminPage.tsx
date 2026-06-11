import { useEffect, useRef, useState, type CSSProperties, type SubmitEvent } from 'react';
import { BryntumButton, BryntumTextField } from '@bryntum/gantt-react';

interface ApprovedEmail {
  email: string;
  added_at: string;
}

export default function AdminPage() {
    const [emails, setEmails] = useState<ApprovedEmail[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const formRef = useRef<HTMLFormElement>(null);

    function loadEmails() {
        return fetch('/api/approved-emails')
            .then((res) => res.json() as Promise<ApprovedEmail[]>)
            .then(setEmails);
    }

    useEffect(() => {
        loadEmails();
    }, []);

    async function handleAdd(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await fetch('/api/approved-emails', {
            method  : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            body    : JSON.stringify({ email : newEmail })
        });

        if (!res.ok) {
            const data = await res.json() as { error: string };
            setError(data.error ?? 'Failed to add email.');
        }
        else {
            setNewEmail('');
            await loadEmails();
        }

        setLoading(false);
    }

    async function handleDelete(email: string) {
        await fetch(`/api/approved-emails/${encodeURIComponent(email)}`, {
            method : 'DELETE'
        });
        await loadEmails();
    }

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Invite Management</h1>
                    <p style={styles.subtitle}>
            Only email addresses on this list can access the Gantt.
                    </p>
                </div>

                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>Add email</h2>
                    <form ref={formRef} onSubmit={handleAdd} style={styles.addForm}>
                        <div style={{ flex : 1 }}>
                            <BryntumTextField
                                value={newEmail}
                                placeholder="colleague@example.com"
                                width="100%"
                                onChange={({ value } : { value : string }) => setNewEmail(value)}
                            />
                        </div>
                        <BryntumButton
                            behaviorType="submit"
                            rendition="filled"
                            text={loading ? 'Adding…' : 'Add'}
                            disabled={loading}
                            onClick={() => formRef.current?.requestSubmit()}
                        />
                    </form>
                    {error && <p style={styles.error}>{error}</p>}
                </div>

                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>Approved emails ({emails.length})</h2>
                    {emails.length === 0 ? (
                        <p style={styles.empty}>No emails approved yet. Add one above.</p>
                    ) : (
                        <ul style={styles.list}>
                            {emails.map((row) => (
                                <li key={row.email} style={styles.listItem}>
                                    <span style={styles.emailText}>{row.email}</span>
                                    <BryntumButton
                                        rendition="outlined"
                                        text="Remove"
                                        onClick={() => handleDelete(row.email)}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <p style={styles.hint}>
          Users sign in at <a href="/" style={styles.link}>the main page</a>.
                </p>
            </div>
        </div>
    );
}

const styles: Record<string, CSSProperties> = {
    page : {
        minHeight : '100%',
        padding   : '2rem'
    },
    container : {
        maxWidth      : '600px',
        margin        : '0 auto',
        display       : 'flex',
        flexDirection : 'column',
        gap           : '1.5rem'
    },
    header : {},
    title  : {
        fontSize     : '1.75rem',
        fontWeight   : 600,
        color        : '#1a1a2e',
        marginBottom : '0.25rem'
    },
    subtitle : {
        fontSize : '0.875rem',
        color    : '#6b7280'
    },
    card : {
        background   : '#fff',
        borderRadius : '12px',
        boxShadow    : '0 2px 12px rgba(0,0,0,0.06)',
        padding      : '1.5rem'
    },
    sectionTitle : {
        fontSize     : '1rem',
        fontWeight   : 600,
        color        : '#1a1a2e',
        marginBottom : '1rem'
    },
    addForm : {
        display    : 'flex',
        gap        : '0.75rem',
        alignItems : 'flex-end'
    },
    error : {
        marginTop    : '0.75rem',
        fontSize     : '0.85rem',
        color        : '#dc2626',
        background   : '#fef2f2',
        border       : '1px solid #fecaca',
        borderRadius : '6px',
        padding      : '0.5rem 0.75rem'
    },
    empty : {
        fontSize : '0.875rem',
        color    : '#9ca3af'
    },
    list : {
        listStyle     : 'none',
        display       : 'flex',
        flexDirection : 'column',
        gap           : '0.5rem'
    },
    listItem : {
        display        : 'flex',
        alignItems     : 'center',
        justifyContent : 'space-between',
        padding        : '0.625rem 0.75rem',
        background     : '#f9fafb',
        borderRadius   : '8px',
        border         : '1px solid #e5e7eb'
    },
    emailText : {
        fontSize : '0.9rem',
        color    : '#1a1a2e'
    },
    hint : {
        fontSize  : '0.8rem',
        color     : '#9ca3af',
        textAlign : 'center'
    },
    link : {
        color : '#4f46e5'
    }
};
