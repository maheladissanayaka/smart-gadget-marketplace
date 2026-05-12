# 📱 Smart Gadget Marketplace

A robust, multi-vendor e-commerce platform designed for gadget enthusiasts. This project demonstrates a **Polyglot Persistence** architecture, utilizing both **Oracle Database** for transactional integrity and **MongoDB** for high-velocity activity logging.

---

## 🚀 Key Features

### 👤 User Management
* **Three Access Levels:** Specialized dashboards for **Administrators**, **Sellers**, and **Customers**.
* **Security:** Password hashing using `bcryptjs`.
* **Admin Control:** Ability to Activate, Suspend, or Delete users. Suspended users are restricted from logging in.

### 🏪 Seller Empowerment
* Dedicated dashboard for sellers to manage inventory.
* Real-time stock management and product visualization.
* Secure image uploading for gadget listings.

### 📦 Advanced Order Processing
* **PL/SQL Integration:** Core business logic (Order creation & Stock deduction) is handled via Oracle Stored Procedures for maximum data integrity.
* **Transaction Management:** ACID-compliant transactions ensure that stock is only deducted if the order is successfully placed.

### 📊 Monitoring & Analytics
* **MongoDB Logging:** All system activities (logins, searches, and errors) are logged in a NoSQL environment.
* **Admin Insights:** Visualizes total revenue (from Oracle) alongside peak usage times and failed transactions (from MongoDB).

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Tailwind CSS, Lucide React
* **Backend:** Node.js, Express.js
* **Relational Database:** Oracle Database (via `oracledb` driver)
* **NoSQL Database:** MongoDB (via `mongoose`)
* **Authentication:** JSON Web Tokens (JWT) & Bcrypt

---

## 🏗️ Database Architecture

This project utilizes two databases to optimize performance and reliability:

1.  **Oracle Database (Primary):**
    * Handles **Users, Sellers, Products, Orders, and OrderItems**.
    * Uses **Stored Procedures** (`CREATE_ORDER`, `ADD_ORDER_ITEM`) for transactional logic.
    
2.  **MongoDB (Secondary):**
    * Handles **Activity Logs**.
    * Stores schema-less data for system audits and performance tracking.

---

## ⚙️ Installation & Setup

### Prerequisites
* Node.js (v18+)
* Oracle Database 19c or 21c
* MongoDB Atlas or Local Instance

### 1. Clone the repository
```bash
git clone <your-repository-link>
cd smart-gadget-marketplace


cd backend
npm install

PORT=5000
ORACLE_USER=your_username
ORACLE_PASS=your_password
ORACLE_CONN=localhost:1521/xe
MONGO_URI=your_mongodb_connection_string

npm start

cd ../frontend
npm install
npm run dev