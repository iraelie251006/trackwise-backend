# 📊 TrackWise – Smart Expense Tracker

**TrackWise** is a full-stack expense tracking application designed to help users manage their finances with clarity, control, and smart insights. Built with a scalable architecture using **Express.js**, **Next.js**, **PostgreSQL**, and **TypeScript**, it combines modern UI, real-time analytics, and user-friendly features.

---

## 🚀 Features

- 🔐 **Authentication**
  - JWT-based login/register
  - OAuth (Google) login
  - Secure password hashing and reset

- 💸 **Expense Management**
  - Create, update, delete, and filter expenses
  - Track recurring and one-time expenses
  - Categorize expenses by tags or type

- 📈 **Smart Analytics**
  - Monthly spending summaries
  - Pie and bar charts by category
  - Spending trends over time

- 🔔 **Recurring Alerts**
  - Get notified of upcoming or repeated expenses
  - (Optional) Email notifications or UI prompts

- ⚙️ **Admin & System**
  - Role-based access (optional)
  - Rate limiting, validation, and secure API design
  - Scalable PostgreSQL data model (via Prisma ORM)

---

## 🛠️ Tech Stack

| Layer        | Stack                         |
|--------------|-------------------------------|
| Frontend     | Next.js 15, React.js, Tailwind CSS, TypeScript |
| Backend      | Express.js, TypeScript        |
| Database     | PostgreSQL (Prisma ORM)       |
| Auth         | JWT, Google OAuth             |
| Deployment   | Docker, Railway/Vercel        |
| Analytics    | Chart.js or Recharts          |

---

## 📂 Project Structure

```bash
trackwise-backend/
├──
│  ├── src/
│  │   ├── config/
│  │   ├── controllers/
│  │   ├── middlewares/
│  │   ├── routes/
│  │   ├── services/
│  │   ├── types/
│  │   └── utils/
│  │   └── server.ts
│  └── prisma/schema.prisma
└── README.md
```
---

## Installation

**1. Clone the repository**

```bash
git clone https://github.com/yourusername/trackwise.git
cd trackwise
```

**2. Set up backend**

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

## 🧠 System Design Highlights

- Scalable multi-user architecture

- Prisma schema optimized for relational expense data

- Optional Redis for caching analytics

- Pagination + filtering for performance

- Secure REST API with rate limiting

## 👨‍💻 Author

**Niyubwayo Irakoze Elie**

- Full-Stack Developer | TypeScript Enthusiast

[LinkedIn](https://www.linkedin.com/in/niyubwayo-irakoze-elie-14b003284/)
[GitHub](https://github.com/iraelie251006)


## ⭐️ Show Your Support

If you find this project helpful, please consider:

- Giving it a ⭐️ on GitHub

- Sharing feedback or opening an issue

- Forking to build your own version!
