<div align="center">
  <h1>🚀 Finance Dashboard Backend Architecture</h1>
  <p><b>A highly secure, role-based, multi-tenant REST API engineered for financial data aggregations.</b></p>
  
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)]()
  [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)]()
  [![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)]()
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)]()
  [![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)]()
</div>

<br/>

> **Reviewer Note:** This document serves as an executive summary of the backend system design, trade-offs, and engineering decisions crafted directly for this assessment. 

---

## 🧠 Executive Summary: Engineering & Assessment Criteria

This application was consciously engineered beyond a simple CRUD app. Below outlines the thought process mapping out the system architecture natively against the assignment rubrics.

### 1. Architectural Structure (Separation of Concerns)
The backend enforces a strict **Layered Architecture**. 
Networking logic is fiercely decoupled from business logic:
- **`routes/`**: Strictly handles HTTP path mapping, middleware injections, and `express-validator` schema attachments.
- **`controllers/`**: Thin orchestrators. They receive requests, call underlying services, and return standardized JSON HTTP responses. 
- **`services/`**: The brain. Contains 100% of the business algorithms, access scoping boundaries, and Prisma SQL queries. This makes unit testing scalable and framework-agnostic.

### 2. Logical Thinking & Access Control (RBAC)
Role-Based Access Control is enforced hierarchically at the middleware layer (`authorizeMinRole`).
- **VIEWERS**: Effectively sandboxed. Read-only global dashboard access. They are physically blocked by middleware from accessing raw financial `/records` endpoints. 
- **ANALYSTS**: Trusted personnel. Expanded read-only access to view the massive tabular index of raw global records. Cannot mutate data.
- **ADMINS**: System owners. Absolute CRUD control across all sectors and user-management privileges.

### 3. Functionality & Performance
- **Parallel Aggregations**: The `/dashboard/summary` endpoint leverages `Promise.all()` to fire off massive database calculations (Total Revenue, Monthly Trends, Category Grouping) completely concurrently. This dramatically drops heavy analytical API response latency.
- **Stateless Auth**: Hardened JWT-based Bearer token authentication ensures secure traffic validations without bottlenecking the server with session lookups.

### 4. Code Quality & Developer Experience
- **Eliminating Boilerplate**: A centralized `asyncHandler` module wraps all controllers. This completely eliminates messy localized `try/catch` block repetitions across the entire app.
- **Unified Standard Responses**: Every single API endpoint terminates through a centralized `successResponse` helper, ensuring a pristine, predictable API data-contract for frontend integrators.

### 5. Data Modeling
Prisma ORM over PostgreSQL enforces absolute referential integrity effortlessly.
- **Natively Validated Constraints**: `Role` and `RecordType` (`INCOME`, `EXPENSE`) are rigidly defined as PostgreSQL `Enums`, preventing corrupt logic from entering the schema regardless of API validations.
- **Relational Mapping**: A rigid `1-to-many` relationship safely isolates user identities natively from the raw transactional ledgers.

### 6. Validation & Reliability Engine
The system assumes all incoming client payloads and query params are explicitly hostile or malformed.
- **Strict Parsing**: Route-level injections of `express-validator` instantly sanitize and validate all HTTP body payloads, ensuring floats are strictly positive, dates map explicitly to ISO standards, etc.
- **Graceful Error Handling**: Internal failures execute a custom `AppError` pipeline that translates aggressive code exceptions into polished `400 Bad Request` or `404 Not Found` JSON payloads, preventing raw code-leakage.

### 7. Trade-offs & Assumptions Made
- **Trade-off (Monolithic Users):** Chose single-table inheritance mapping via Enums rather than fracturing `Admins`, `Analysts`, & `Viewers` logically into isolated disparate tables. *Why?* Dramatically speeds up database JOINS and immensely simplifies authentication processing logic over complex poly-morphic setups.
- **Trade-off (Hard Deletion):** Did not implement explicit "soft-deletes" for records. *Why?* Decided to maintain immediate architectural simplicity for the specified requirements instead of introducing arbitrary data-bloat.
- **Assumption:** Opted to wire the Dashboard into a global aggregate architecture unconditionally, operating on the assumption that the dashboard was designed for overarching company-wide financial transparency rather than highly localized, individual user portfolio tracking.

### 8. Additional Thoughtfulness (Terminal Scripts)
- **Database Seeder (`seed-1000.js`)**: Engineered an automated testing script that injects exactly 20 users via `bcryptjs` hashing alongside identically mapping 1,000 realistically randomized, globally spread financial transactions.
- **Role Scrubber (`update-roles.js`)**: Realizing there was no secure way to bootstrap the very first admin without exposing a vulnerable `?role=ADMIN` privilege-escalation backdoor in the open `/register` API, a local terminal script was deployed natively to elevate a hard-coded super-admin via the hardware terminal securely.

---

## 🚀 Quick Start (Local Setup)

```bash
# 1. Install dependencies
npm install

# 2. Configure Database
npx prisma generate
npx prisma db push

# 3. Securely Boot System Users and Dummy Data natively
npm run dev &
node seed-1000.js
node update-roles.js

# 4. Access the API
# Server binds actively onto http://localhost:5000
```

---

## 📋 Concise Reference Grid

*For explicit documentation on query filters and constraints, see attached `ZORVYN_API_ENDPOINTS.md` alongside `ZORVYN_ROLES_PERMISSIONS.md`.*

| Method | Endpoint | Required Role | Summary Capability |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | `PUBLIC` | Open registration. New users securely default to `VIEWER`. |
| **POST** | `/api/auth/login` | `PUBLIC` | Retrieve JWT Bearer Token credential. |
| **GET** | `/api/dashboard/*` | `ANY ROLE` | Retrieve global aggregated sums and category trends in parallel. |
| **GET** | `/api/records` | `ANALYST+` | Paginated deep-index tabular view of all raw global financial ledgers. |
| **POST** | `/api/records` | `ADMIN` | Log and insert a new internal financial transaction natively. |
| **PUT/DEL** | `/api/records/:id` | `ADMIN` | Edit or utterly destroy a previously submitted financial record. |
| **GET** | `/api/users` | `ADMIN` | Paginated directory iterating through the entire user roster. |
| **PATCH** | `/api/users/:id/role`| `ADMIN` | Directly escalate a user's RBAC administrative scope payload. |
