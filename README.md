# Collabhub Backend

## Getting Started

### 1. Install dependencies
```sh
npm install
```

### 2. Set up environment variables
Create a `.env` file in the backend directory:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/collab_db?schema=public"
JWT_SECRET="supersecret" # or your own secret
```

### 3. Run database migrations
```sh
npm run prisma:migrate
```

### 4. Start the development server
```sh
npm run dev
```

- tRPC API: `http://localhost:4000/trpc`
- Socket.io: `http://localhost:4001`

---

## API Reference (tRPC)

### Auth
- `POST /trpc/auth.register` `{ email, password, name? }`
- `POST /trpc/auth.login` `{ email, password }`

### Tasks
- `GET /trpc/task.getAll`
- `POST /trpc/task.create` `{ title, description?, dueDate?, userId }`
- `POST /trpc/task.update` `{ id, ...fields }`
- `POST /trpc/task.delete` `{ id }`

### Collaboration
- `GET /trpc/collab.getAll`
- `POST /trpc/collab.create` `{ name, code?, userIds }`
- `POST /trpc/collab.updateCode` `{ id, code }`

### Deployment Logs
- `GET /trpc/deployment.getAll`
- `POST /trpc/deployment.create` `{ status, message?, userId? }`

---

## Real-time Collaboration (Socket.io)
- Connect to `ws://localhost:4001`
- Events:
  - `join-session` (sessionId)
  - `code-update` ({ sessionId, code })

---

## Development Scripts
- `npm run dev` — Start in dev mode
- `npm run build` — Build TypeScript
- `npm start` — Start built server
- `npm run prisma:generate` — Regenerate Prisma client
- `npm run prisma:migrate` — Run DB migrations

---

## Testing
You can use Postman, Insomnia, or curl to test the endpoints. Example requests are provided above.

---

## Frontend Integration
- Point your frontend API calls to `http://localhost:4000/trpc`
- Use Socket.io client to connect to `http://localhost:4001`

---

## Deployment
- For production, build with `npm run build` and start with `npm start`.
- Consider Dockerizing for easy deployment. 