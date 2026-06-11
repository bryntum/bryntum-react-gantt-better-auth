import { authClient } from './auth-client';
import Login from './pages/Login';
import GanttPage from './pages/GanttPage';

export default function App() {
    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
        return (
            <div style={{ display : 'flex', alignItems : 'center', justifyContent : 'center', height : '100%' }}>
                <p>Loading…</p>
            </div>
        );
    }

    if (!session) return <Login />;

    return <GanttPage session={session} />;
}
