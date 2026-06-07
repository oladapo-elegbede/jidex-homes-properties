<div align="center">

# 🏠 Jidex Homes & Properties

### Premium Property Marketplace Platform

A full-stack property marketplace built with FastAPI and React, featuring JWT authentication, role-based access control, complete admin moderation workflows, and image management.

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [Author](#-author)

---

## 🎯 Overview

**Jidex Homes & Properties** is a production-quality property marketplace platform that connects buyers, renters, and real estate agents across Nigeria. Built from the ground up with modern technologies, the platform demonstrates real-world full-stack engineering practices including layered architecture, JWT authentication, role-based authorization, file uploads, and admin moderation workflows.

The application supports three distinct user roles, each with tailored experiences:

- **Property Seekers** — browse, search, and view detailed property listings
- **Real Estate Agents** — create, edit, and manage property listings with image uploads
- **Platform Administrators** — moderate listings, manage users, and view platform statistics

---

## ✨ Features

### 🌐 Public Marketplace
- ✅ Browse property listings with real images
- ✅ Advanced filtering (city, price range, type, bedrooms, bathrooms)
- ✅ Detailed property pages with image galleries
- ✅ Agent contact information on each listing
- ✅ Responsive design with mobile hamburger menu

### 🔐 Authentication & Authorization
- ✅ User registration with role selection (User / Agent)
- ✅ Secure JWT-based authentication
- ✅ Bcrypt password hashing
- ✅ Protected routes with role-based access control
- ✅ Automatic token verification on app startup
- ✅ Auto-logout on token expiry

### 👤 Agent Dashboard
- ✅ Create, edit, and delete property listings
- ✅ Upload multiple images per property (drag-and-drop UI)
- ✅ Set primary/cover image with one click
- ✅ View listing status (Pending / Approved / Rejected)
- ✅ Track view counts on properties
- ✅ Manage all owned listings in one place

### 🛡️ Admin Dashboard
- ✅ Live platform statistics (users, agents, properties by status)
- ✅ Property approval/rejection workflow with rejection reasons
- ✅ User management (activate/deactivate accounts)
- ✅ Role-based filtering and visibility
- ✅ Soft-delete pattern (no data loss)

### 🎨 Professional UX
- ✅ Custom design system (navy + gold luxury theme)
- ✅ Responsive layouts (mobile, tablet, desktop)
- ✅ Beautiful 404 page
- ✅ Toast notifications for all actions
- ✅ Loading states with skeleton UI
- ✅ Empty states with helpful CTAs
- ✅ Smooth animations and transitions

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | Modern async Python web framework |
| **SQLAlchemy 2.0** | ORM with type-safe queries |
| **Alembic** | Database migration management |
| **PostgreSQL 16** | Production-grade relational database |
| **Pydantic** | Request/response validation |
| **JWT (python-jose)** | Stateless authentication tokens |
| **Bcrypt (passlib)** | Industry-standard password hashing |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | Component-based UI library |
| **Vite** | Lightning-fast build tool |
| **React Router v6** | Client-side routing with nested layouts |
| **React Query (TanStack)** | Server state management with caching |
| **React Hook Form** | Performant form management |
| **Yup** | Schema-based validation |
| **Axios** | HTTP client with interceptors |
| **React Hot Toast** | Beautiful toast notifications |
| **Lucide React** | Premium icon library |
| **Bootstrap 5** | Utility CSS framework |

---

## 🏗 Architecture

The backend follows a **layered architecture** pattern that ensures clean separation of concerns and testability:

┌─────────────────────────────────────────┐
│ API Layer (Routes) │ ← Handles HTTP, validation
├─────────────────────────────────────────┤
│ Service Layer │ ← Business logic, rules
├─────────────────────────────────────────┤
│ Repository Layer │ ← Database queries
├─────────────────────────────────────────┤
│ Model Layer (SQLAlchemy) │ ← Data models
└─────────────────────────────────────────┘
↓
PostgreSQL


### Key Architectural Decisions

- **UUID Primary Keys** — Prevents enumeration attacks (better than auto-increment integers)
- **NUMERIC for Money** — Avoids floating-point precision errors in financial data
- **Separate Status Fields** — `listing_status` (admin moderation) vs `availability_status` (market state)
- **Eager Loading** — Prevents N+1 query problems with `joinedload()`
- **JWT in HTTP Header** — Stateless, scalable authentication
- **Defense in Depth** — Validation at API, service, and database layers
- **Soft Delete Pattern** — Deactivation preserves data integrity

---

## 📸 Screenshots

> Add screenshots here after deployment! Examples:
> - Homepage with property cards
> - Property detail page with gallery
> - Agent dashboard
> - Admin moderation interface
> - Mobile menu

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.12+**
- **Node.js 18+** and npm
- **PostgreSQL 16+**
- **Git**

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/oladapo-elegbede/jidex-homes-properties.git
cd jidex-homes-properties/backend

# Create and activate virtual environment
python -m venv venv
source venv/Scripts/activate    # On Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env
# Edit .env with your DATABASE_URL and SECRET_KEY

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload

Backend will be available at: http://localhost:8000
API Documentation: http://localhost:8000/api/docs


# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env
# Edit .env with VITE_API_BASE_URL=http://localhost:8000/api/v1

# Start the frontend dev server
npm run dev

Frontend will be available at: http://localhost:5173

📚 API Documentation
FastAPI auto-generates interactive API documentation:

Swagger UI: http://localhost:8000/api/docs — Interactive, try-it-out
ReDoc: http://localhost:8000/api/redoc — Beautiful reference docs
Key Endpoints
Authentication
POST /api/v1/auth/register — Create new account
POST /api/v1/auth/login — Get JWT token
GET /api/v1/auth/me — Get current user
Public Properties
GET /api/v1/properties — Browse listings with filters
GET /api/v1/properties/{id} — Get property details
Agent Operations (Authenticated)
GET /api/v1/agent/properties — List my properties
POST /api/v1/agent/properties — Create listing
PUT /api/v1/agent/properties/{id} — Update listing
DELETE /api/v1/agent/properties/{id} — Delete listing
POST /api/v1/agent/properties/{id}/images — Upload image
Admin Operations (Admin Only)
GET /api/v1/admin/dashboard — Platform statistics
GET /api/v1/admin/properties — All properties (any status)
PUT /api/v1/admin/properties/{id}/approval — Approve/reject
GET /api/v1/admin/users — All users
PUT /api/v1/admin/users/{id} — Activate/deactivate user
📁 Project Structure
text

jidex-homes-properties/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/    # API route handlers
│   │   ├── core/                # Config, security, constants
│   │   ├── db/                  # Database setup
│   │   ├── dependencies/        # FastAPI dependencies (auth)
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── repositories/        # Database query layer
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # Business logic layer
│   │   └── main.py              # FastAPI app entry point
│   ├── alembic/                 # Database migrations
│   ├── uploads/                 # Uploaded property images
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── jidex-logo.png       # Brand logo
│   ├── src/
│   │   ├── api/                 # API client + endpoints
│   │   ├── components/          # Reusable React components
│   │   ├── context/             # AuthContext provider
│   │   ├── hooks/               # Custom React hooks
│   │   ├── layouts/             # Page layout wrappers
│   │   ├── pages/               # Route page components
│   │   ├── routes/              # Route guards
│   │   ├── styles/              # Design system CSS
│   │   ├── utils/               # Formatters & helpers
│   │   ├── App.jsx              # Root component with routes
│   │   └── main.jsx             # React entry point
│   ├── package.json
│   └── .env.example
│
└── README.md
🗺 Roadmap
✅ Completed (MVP)
 User authentication with JWT
 Role-based authorization (user/agent/admin)
 Property CRUD operations
 Property browsing with filters
 Admin moderation workflow
 User management
 Image uploads with primary management
 Responsive mobile UI with hamburger menu
 Beautiful 404 page
 SEO optimization
🚧 In Progress
 Production deployment (Railway + Vercel)
 Cloudinary integration for image storage
 Email notifications
🔮 Future Enhancements
 User favorites
 Property inquiry messages
 Google Maps integration
 Property comparison
 Saved searches with alerts
 Mortgage calculator
 Dark mode
 Multi-language support
👨‍💻 Author
Oladapo Olajide Elegbede

GitHub: @oladapo-elegbede
📄 License
This project is built as a portfolio piece. All rights reserved.

<div align="center">
Built with ❤️ as a demonstration of full-stack engineering capabilities
⭐ If you find this project interesting, please consider giving it a star!

</div> ```

