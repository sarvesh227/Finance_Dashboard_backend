# Zorvyn Roles & Access Control Policy

This document outlines the strict Role-Based Access Control (RBAC) hierarchy enforced across the entire Zorvyn architecture (both Database/Backend and React Frontend).

---

## The Default State
**By default, every new user who signs up via the registration page is hard-coded into the database as a `VIEWER`.** 
There is no UI or API endpoint for a user to register as an Analyst or Admin natively. Elevated privileges must be manually bestowed by an existing system Administrator.

---

## 🟢 1. VIEWER (Read-Only)
The Viewer role is strictly isolated and strictly read-only. 

### Permissions:
- **Dashboards:** Can view the Dashboard Overview (Income, Expense, Net Balance) and Trends. This data is fully global, compiling records across the entire system.
- **Account:** Can view their own profile `/api/users/me`.

### Restrictions:
- **Zero Records Access:** They have no permission to view the individual `/records` endpoint nor the Records page.
- **Zero Writing:** Cannot create or mutate any records.
- **Frontend Lockdown:** The Records tab, Add Record button, and the `/:id/edit` routing pages physically do not mount into the Virtual DOM for viewers.

---

## 🔵 2. ANALYST (Finance Manager)
The Analyst role represents trusted employees or managers who need full access to company finances and individual ledgers, but not the authority to delete users.

### Permissions:
- **All Viewer Rights:** Inherits everything from Viewers.
- **Global View Dashboard:** Similar to Viewers, their dashboard will aggregate ALL records from every single user in the system to calculate the absolute "Company Net Balance".
- **Records Viewing:** Can view the complete tabular list of ALL financial records globally.
- **Dynamic Targeting:** Given a `UserSelector` dropdown to fetch records for *any* specific user dynamically on the records page.
- **User Reading:** They have read-access to the `/api/users` endpoint to pull the employee database to populate their dynamic selectors.

### Restrictions:
- **No Record Mutation (Read-Only):** They cannot Create, Update or Delete records. 
- **No User Management:** They cannot view the dedicated "Admin Users Page". They cannot promote Viewers to Analysts, and they cannot delete user accounts.

---

## 🔴 3. ADMIN (System Owner)
The absolute highest tier of power. Admins manage the physical environment and the people within it.

### Permissions:
- **All Analyst Rights:** Inherits everything from Analysts.
- **Record Mutation (CRUD):** Full authority to Create, Update, override, or Delete *any* financial record in the system.
- **User Role Management:** Access to the exclusive Admin Dashboard (`/admin/users`) where they can view the comprehensive user lists.
- **Promotions:** Absolute authority to use `PATCH /api/users/:id/role` to promote Viewers into Analysts or other Admins, or demote them.
- **Account Deletion:** Can delete specific users and wipe their account out.

---

### How to bootstrap the first Admin?
Since no user can register as an Admin over the internet, the backend securely controls who is the master admin. 
Use the provided `update-roles.js` script to securely assign `sarveshgoel43@gmail.com` (or another designated email) as the ONLY `ADMIN`, and downgrade all others securely to `VIEWER`.

```bash
node update-roles.js
```
