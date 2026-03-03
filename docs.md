**Docker**

```terminaloutput
docker-compose up --build
```

## Backend
Backend runs on port 3001

**Local Setup**

1. Navigate to the backend directory:

```terminaloutput
cd backend
```

2. Install dependencies:

```terminaloutput
npm install
```

3. Generate Prisma client:

```terminaloutput
npx prisma generate
```

4. Create a `.env` file and add `DATABASE_URL`. Example:

```terminaloutput
DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres"
```

5. Run migrations:

```terminaloutput
npx prisma migrate dev
```

6. Run backend:

```terminaloutput
npm run start
```

---

## Frontend

Frontend runs on port 5173

**Local Setup**

1. Navigate to the frontend directory:

```terminaloutput
cd frontend
```

2. Install dependencies:

```terminaloutput
npm install
```

3. Run frontend:

```terminaloutput
npm run dev
```