import { authClient } from './auth-client';
import OtpLogin from './pages/OtpLogin';
import GanttPage from './pages/GanttPage';
import AdminPage from './pages/AdminPage';

export default function App() {
    const { data: session, isPending } = authClient.useSession();

    if (window.location.pathname === '/admin') {
        return <AdminPage />;
    }

    if (isPending) {
        return (
            <div style={{ display : 'flex', alignItems : 'center', justifyContent : 'center', height : '100%' }}>
                <p>Loading…</p>
            </div>
        );
    }

    if (!session) return <OtpLogin />;

    return <GanttPage session={session} />;
}
