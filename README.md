# Finance Dashboard API

Welcome to my Finance Dashboard project! This is a secure, role-based backend built to manage financial records and provide calculated data for a global dashboard. 


- **Backend Live Link:** [https://finance-dashboard-backend-9mb4.onrender.com/]

---

## 📌 What is in this project?
This project is built using **Node.js, Express, and Prisma (PostgreSQL)**. 
- It handles user authentication using secure JWT tokens.
- It calculates total income, expenses, and monthly trends for a global dashboard.
- It stores raw financial records safely in a PostgreSQL database.
- It has strict access control to prevent unauthorized users from editing or viewing data they aren't supposed to.

---

## 🔐 How does the Role-Based Access Control (RBAC) work?
I implemented a strict 3-tier role system to keep the application secure. When a new user registers, they are automatically assigned the safest role (Viewer).

1. **VIEWER (Read-Only):**
   - Can only view the global dashboard numbers.
   - Absolutely zero access to view or edit the raw financial records list.

2. **ANALYST (Finance Manager):**
   - Can view the global dashboard.
   - Can view the entire list of all raw financial records.
   - **Cannot** create, edit, or delete records.

3. **ADMIN (System Owner):**
   - Has full power over the system.
   - Can create, edit, and delete financial records.
   - Can view the employee list and promote Viewers to Analysts or Admins.

---

## 🚀 How to set it up locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup the Database:**
   Create a `.env` file and add your PostgreSQL database URL. Then run:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Add Dummy Data (Optional but recommended):**
   I created testing scripts to make deploying enjoyable. This will create exactly 1 Admin, downgrade everyone else, and inject 1000 realistic financial records:
   ```bash
   node seed-1000.js
   node update-roles.js
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```
   Additionaly , 
   i have also built a frontend for better Understanding of the workflow 
   check it out here : https://frontend-d-xi.vercel.app/dashboard
