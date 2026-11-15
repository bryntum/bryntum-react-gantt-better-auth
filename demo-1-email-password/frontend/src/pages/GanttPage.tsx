import { useEffect, useRef, useState } from 'react';
import { BryntumButton } from '@bryntum/core-react-enterprise';
import { BryntumGantt, type BryntumGanttProps } from '@bryntum/gantt-react-enterprise';
import type { TaskModelConfig, DependencyModelConfig } from '@bryntum/gantt-enterprise';
import { authClient } from '../auth-client';
import './GanttPage.css';

interface Session {
  user: { name: string; email: string };
}

interface GanttData {
  tasks: TaskModelConfig[];
  dependencies: DependencyModelConfig[];
}

const ganttConfig: BryntumGanttProps = {
    startDate : '2026-11-02',
    endDate   : '2026-12-04',
    taskStore : { transformFlatData : true },
    columns   : [
        { type : 'name', text : 'Task', width : 280 },
        { type : 'duration', text : 'Duration', width : 110 }
    ]
};

export default function GanttPage({ session }: { session: Session }) {
    const ganttRef = useRef<BryntumGantt>(null);
    const [ganttData, setGanttData] = useState<GanttData | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/tasks')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load tasks');
                return res.json();
            })
            .then(setGanttData)
            .catch((err) => setError(err.message));
    }, []);

    async function handleLogout() {
        await authClient.signOut();
    }

    if (error) {
        return (
            <div className="gantt-page">
                <p style={{ color : '#dc2626' }}>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="gantt-page">
            <header className="gantt-header">
                <span className="gantt-header-title">Project Gantt</span>
                <div className="gantt-header-right">
                    <span className="gantt-user-info">{session.user.name} ({session.user.email})</span>
                    <BryntumButton rendition="filled" text="Sign Out" onClick={handleLogout} />
                </div>
            </header>

            <div className="gantt-container">
                {ganttData ? (
                    <BryntumGantt
                        ref={ganttRef}
                        {...ganttConfig}
                        tasks={ganttData.tasks}
                        dependencies={ganttData.dependencies}
                    />
                ) : (
                    <div className="gantt-loading">Loading project data…</div>
                )}
            </div>
        </div>
    );
}
