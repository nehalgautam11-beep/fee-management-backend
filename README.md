# 🎓 Fee Management Backend

A REST API backend for **Global Innovative School (GIS)** — handles student fee management, PDF receipt generation, and WhatsApp payment reminders.

Built with **Node.js + Express + MongoDB**.

---

## ✨ Features

- 🔐 JWT-based admin authentication
- 👨‍🎓 Student management (add, edit, soft-delete, class promotion)
- 💰 Fee collection with installment tracking
- 📄 Branded PDF receipt generation (PDFKit → Cloudinary)
- 📱 WhatsApp deep-link reminders for pending fees
- 🏷️ Extra/one-off fee management
- 📊 Reports: summary, class-wise, top defaulters
- 📋 Full admin audit logging
- 🎓 Academic year reset (bulk promotion + fee rollover)

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js (CommonJS) |
| Framework | Express v5 |
| Database | MongoDB (Mongoose v9) |
| Auth | JWT + bcryptjs |
| PDF | PDFKit |
| Storage | Cloudinary |
| Security | Helmet, express-rate-limit |

---

## 🚀 Getting Started

### 1. Clone

```bash
git clone https://github.com/nehalgautam11-beep/fee-management-backend.git
cd fee-management-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Fill in your values in .env
```

### 4. Run

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

Server starts on `http://localhost:3001` by default.

---

## 🔑 Environment Variables

See [`.env.example`](.env.example) for all required variables.

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `PORT` | Server port (default: 3001) |

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register admin |
| POST | `/auth/login` | Login + get JWT |

### Students
| Method | Endpoint | Description |
|---|---|---|
| GET | `/students` | List all students |
| GET | `/students/:id` | Get student by ID |
| POST | `/students/add` | Add student |
| POST | `/students/:id/installment` | Record fee payment |
| PUT | `/students/edit/:id` | Update student |
| DELETE | `/students/:id` | Soft-delete student |
| POST | `/students/auto-promote/:id` | Promote to next class |
| GET | `/students/reminder-link/:id` | WhatsApp reminder link |
| POST | `/students/academic-year/start` | Start new academic year |
| GET | `/students/academic-year/stats` | Class-wise student counts |

### Extra Fees
| Method | Endpoint | Description |
|---|---|---|
| POST | `/extra-fees/create` | Create extra fee |
| GET | `/extra-fees` | List extra fees |
| GET | `/extra-fees/:id` | Get extra fee |
| POST | `/extra-fees/:id/pay/:studentId` | Mark student as paid |
| DELETE | `/extra-fees/:id` | Delete extra fee |
| DELETE | `/extra-fees/:feeId/student/:studentId` | Remove student from fee |
| GET | `/extra-fees/dashboard/stats` | Collected vs pending totals |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/summary` | Overall fee summary |
| GET | `/reports/class-wise` | Per-class fee breakdown |
| GET | `/reports/defaulters` | Top 5 defaulters |

> **Note:** All endpoints except `/auth/*` require `Authorization: Bearer <token>` header.

---

## 📁 Project Structure

```
├── index.js              # Express server entry point
├── seedAdmins.js         # One-time admin seeder
├── middleware/
│   └── authMiddleware.js # JWT verification
├── models/
│   ├── Admin.js
│   ├── AdminLog.js
│   ├── ExtraFee.js
│   └── Student.js
├── routes/
│   ├── authRoutes.js
│   ├── studentRoutes.js
│   ├── extraFeeRoutes.js
│   ├── reportRoutes.js
│   └── logRoutes.js
└── utils/
    ├── cloudinary.js
    ├── pdfGenerator.js
    └── whatsapp.js
```

---

## 📝 License

ISC
