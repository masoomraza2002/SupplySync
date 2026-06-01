# SupplySync Enterprise

SupplySync Enterprise is a robust, multi-tenant Supply Chain Management (SCM) and Enterprise Resource Planning (ERP) web application. Built using a decoupling architecture featuring a high-performance **.NET 8 Web API** backend and a reactive **React.js + Tailwind CSS** single-page application (SPA) frontend, SupplySync standardizes workflows across administrative branches, external vendors, and internal operational facilities.

---

## 🏗️ Architecture & Core System Features

### 1. Unified Authentication & RBAC Core
The ecosystem relies on an **ASP.NET Core Identity** store bound to **JWT (JSON Web Tokens)** validation frameworks. Granular, role-based screen routing dynamically maps access across 6 explicit platform domains:
* **Admin:** Complete platform maintenance, cryptographic security audits, user state management.
* **Vendor:** Self-onboarding portal, real-time purchase order retrieval, active billing adjustments, compliance reporting.
* **Procurement Officer:** Dynamic procurement bidding channels, structural vendor evaluation tables, contract creations.
* **Warehouse Manager:** Receiving docs matching, real-time inventory adjustments, equipment internal distribution tracking.
* **Finance Officer:** Accounts payable evaluation workflows, systematic ledger adjustments, automated balance validation routines.
* **Compliance Officer:** Corporate legal evaluations, real-time compliance validation checking, tracking physical warehouse audit reports.
 

## 💻 Tech Stack & Dependencies

### Backend Ecosystem
* **Framework:** .NET 8.0 Core (Web API)
* **Database ORM:** Entity Framework Core (EF Core) 8.0
* **Identity Provision:** ASP.NET Core Identity
* **Security:** JWT Authentication Core (`Microsoft.AspNetCore.Authentication.JwtBearer`)
* **Object Mapping:** AutoMapper Enterprise Extensions

### Frontend Ecosystem
* **Build Utility / Tooling:** Vite Core
* **Base Framework:** React 18.x
* **Styling Engine:** Tailwind CSS v3
* **Network Request Pipeline:** Axios Interceptor Instance Engine
* **Global Routing Control:** React Router DOM v6
* **Reactive Feedback Componentry:** React Hot Toast Notifications

---
