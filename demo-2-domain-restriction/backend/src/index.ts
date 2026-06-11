import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node';
import { auth } from './auth.js';

const app = express();
const PORT = 3001;

app.use(
    cors({
        origin      : 'http://localhost:5173',
        credentials : true
    })
);

// Better Auth handler — must be mounted before express.json()
app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

const tasks = [
    // Parent tasks
    { id : 1,  name : 'Planning',     expanded : true },
    { id : 5,  name : 'Development',  expanded : true },
    { id : 9,  name : 'Delivery',     expanded : true },
    // Planning children
    { id : 2,  parentId : 1, name : 'Project Kickoff',     startDate : '2026-11-02', duration : 1, percentDone : 100, assignedTo : 'alice@gmail.com' },
    { id : 3,  parentId : 1, name : 'Database Schema',     startDate : '2026-11-03', duration : 3, percentDone : 100, assignedTo : 'bob@gmail.com'   },
    { id : 4,  parentId : 1, name : 'Auth Module',         startDate : '2026-11-03', duration : 5, percentDone : 80,  assignedTo : 'alice@gmail.com' },
    // Development children
    { id : 6,  parentId : 5, name : 'API Development',     startDate : '2026-11-10', duration : 5, percentDone : 60,  assignedTo : 'bob@gmail.com'   },
    { id : 7,  parentId : 5, name : 'Frontend Components', startDate : '2026-11-10', duration : 5, percentDone : 40,  assignedTo : 'carol@gmail.com' },
    { id : 8,  parentId : 5, name : 'Unit Tests',          startDate : '2026-11-17', duration : 3, percentDone : 20,  assignedTo : 'bob@gmail.com'   },
    // Delivery children
    { id : 10, parentId : 9, name : 'Integration Testing', startDate : '2026-11-20', duration : 3, percentDone : 0,   assignedTo : 'carol@gmail.com' },
    { id : 11, parentId : 9, name : 'Deployment',          startDate : '2026-11-24', duration : 2, percentDone : 0,   assignedTo : 'alice@gmail.com' }
];

const dependencies = [
    { id : 1, fromTask : 2,  toTask : 3  },
    { id : 2, fromTask : 2,  toTask : 4  },
    { id : 3, fromTask : 3,  toTask : 6  },
    { id : 4, fromTask : 4,  toTask : 6  },
    { id : 5, fromTask : 6,  toTask : 7  },
    { id : 6, fromTask : 7,  toTask : 8  },
    { id : 7, fromTask : 8,  toTask : 10 },
    { id : 8, fromTask : 10, toTask : 11 }
];

app.get('/api/tasks', async(req, res) => {
    const session = await auth.api.getSession({
        headers : fromNodeHeaders(req.headers)
    });

    if (!session) {
        return res.status(401).json({ error : 'Unauthorized' });
    }

    return res.json({ tasks, dependencies });
});

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
    console.log(`Auth endpoints at http://localhost:${PORT}/api/auth`);
});
