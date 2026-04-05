# Zorvyn Backend API Endpoints

This document serves as your permanent cheat sheet for all the REST API endpoints available in your Node.js/Express backend. 

**Base URL:** `http://localhost:5000/api`

---

## 🔐 1. Authentication Routes (`/api/auth`)
*These routes are public and heavily rate-limited.*

| Method | Endpoint | Description | Requires Auth | Data Requirements |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Create a new user account | No | `body: { name, email, password }` |
| `POST` | `/auth/login` | Authenticate and retrieve JWT | No | `body: { email, password }` |

---

## 👤 2. User Management Routes (`/api/users`)
*All routes here require a valid Bearer Token.*

| Method | Endpoint | Description | Required Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/me` | Get the profile of the currently logged-in user | ANY (`VIEWER+`) |
| `GET` | `/users/` | Get a paginated list of all users | `ANALYST` or `ADMIN` |
| `GET` | `/users/:id` | Get a specific user by ID | `ADMIN` |
| `POST` | `/users/` | Manually create a user directly | `ADMIN` |
| `PATCH` | `/users/:id/role` | Upgrade/Downgrade a user's role | `ADMIN` |
| `PATCH` | `/users/:id` | Update user details (name, email) | `ADMIN` |

---

## 📊 3. Dashboard Routes (`/api/dashboard`)
*These endpoints aggregate and calculate math on the backend for your frontend charts.*

| Method | Endpoint | Description | Required Role | Query Params |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/summary` | Fetch total Income, Expense, and Balance (Global aggregated) | ANY (`VIEWER+`) | |
| `GET` | `/dashboard/trends` | Fetch month-by-month financial aggregations (Global aggregated) | ANY (`VIEWER+`) | `?months=12` |

---

## 📝 4. Financial Records Routes (`/api/records`)
*The bread and butter CRUD operations for financial tracking.*

| Method | Endpoint | Description | Required Role | Query Params |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/records/` | Get paginated/filtered list of all records | `ANALYST` or `ADMIN` | `?page=1&limit=10&targetUserId=<id \| all>` |
| `GET` | `/records/:id` | Fetch a single specific record by ID | `ANALYST` or `ADMIN` | |
| `POST` | `/records/` | Create a new income/expense transaction | `ADMIN` only | |
| `PUT` | `/records/:id` | Completely overwrite a record | `ADMIN` only | |
| `PATCH` | `/records/:id` | Partially update a record | `ADMIN` only | |
| `DELETE` | `/records/:id` | Remove a record permanently | `ADMIN` only | |

---

### Important Notes:
1. **Global Dashboard**: The dashboards no longer isolate per user or respect the `targetUserId` param. Dashboards are strictly entirely global, aggregating data across all users in the system for all roles.
2. **Dynamic Target User (`targetUserId`):** If an `ANALYST` or `ADMIN` appends `?targetUserId=2` to a **Records** query (e.g., `/api/records`), they will pull data scoped exclusively to User 2. Passing `?targetUserId=all` queries the entire global company DB.
3. **Strict Viewer Isolation:** Viewers have ZERO access to the `/records` routes at all. They can only observe the high-level dashboard.
4. **General Query Filters:** The `/records` route supports powerful filtering: `?type=INCOME&category=Salary&dateFrom=2023-01-01&dateTo=2023-12-31`.
