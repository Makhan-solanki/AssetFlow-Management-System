# AssetFlow: Enterprise-Grade Asset & Resource Management ERP

AssetFlow is a production-ready, high-fidelity Enterprise Resource Planning (ERP) platform built for secure custody allocations, timeline scheduling, and maintenance workflows. It implements advanced double-allocation conflict prevention, timeslot scheduling validations, and a distributed caching architecture.

---

## Key Pillars

1. **Conflict-Free Allocations**: Real-time custody tracking checks asset statuses natively on mutation requests.
2. **Timeslot Booking Scheduler**: Micro-timeline scheduling validates reservations mathematically, preventing double-bookings.
3. **Upstash Redis Caching Layer**: Leverages Upstash HTTP REST commands to cache heavy dashboard metrics with automatic invalidation.
4. **Zod Validation Middleware**: Direct input filter guards that compile and type-check payloads before processing.
5. **Secure JWT & Suffix Control**: Fully contained authorization checks that restrict registry and logging access to `@gmail.com` and `@assetflow.com` accounts.
6. **Local Database Autonomy**: Switched to a self-contained local SQLite provider (`dev.db`), removing dependencies on external servers.
7. **Production Security Protections**: Configured `helmet` headers, rate-limiting (`express-rate-limit`), input XSS sanitization, and SQL Injection safeguards.

---

## Production Build & Execution

### Backend
1. **Navigate to the Backend Directory:**
   ```bash
   cd backend
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Run Database Migrations & Seed:**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
4. **Build the Backend:**
   ```bash
   npm run build
   ```
5. **Start Production Server:**
   ```bash
   npm start
   ```

### Frontend
1. **Navigate to the Frontend Directory:**
   ```bash
   cd ../frontend
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Build the Frontend:**
   ```bash
   npm run build
   ```
4. **Preview/Start Production Build:**
   ```bash
   npm run preview
   ```

---

## Local Development Execution
- **Backend:** Run `npm run dev` in the `backend` folder (starts Nodemon server on `http://localhost:5000`).
- **Frontend:** Run `npm run dev` in the `frontend` folder (starts Vite dev server on `http://localhost:5173`).

---

## Documentation Details
- **Prisma Schema:** Configured in `backend/prisma/schema.prisma` using string-backed SQLite migrations.
- **Email OTP Simulation:** During signup, the server automatically generates a 6-digit verification code, prints it to the console log, and displays it directly in the frontend registration success banner. Use this code to verify your account and log in.
- **XSS & SQL Injection:** Implemented custom recursive sanitizers inside `backend/src/index.ts` to strip HTML injection attempts from payloads. All database calls utilize Prisma's parameterized queries to reject SQL injections.
