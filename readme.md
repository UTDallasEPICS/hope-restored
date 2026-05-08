## Hope-Restored (Community Information & Inventory Tracking)

## Conceptual Overview
The Hope Restored Missions Inventory Tracking System is designed to provide the organization with a centralized digital platform for managing inventory operations and client services. The system streamlines the process of adding, updating, and removing inventory items while maintaining accurate records across multiple categories, genders, and sizes.

In addition to inventory management, the platform tracks client history to help Hope Restored Missions better understand and meet the needs of the individuals they serve. This data also supports outreach and reporting efforts when requesting donations or partnerships from larger organizations.

The system further simplifies report generation by providing daily, weekly, and monthly inventory analytics. These reports allow the organization to monitor operational progress, inventory trends, and community impact more efficiently.

The primary users of the platform are the staff members and volunteers at Hope Restored Missions who manage day-to-day inventory and client operations.

---

# Functional Requirements

## Authentication System
The authentication system includes:
- `login.vue`
- `Users.vue`
- `Home.vue`

These pages allow users to:
- Sign in securely
- Create accounts through an administrator-managed system
- Access protected application functionality through role-based authentication

## Inventory Management
The inventory management page (`inventory.vue`) allows administrators to:
- View current inventory levels
- Add new inventory items
- Manage inventory by:
  - Category
  - Gender
  - Size

## Checkout System
The checkout page (`checkout.vue`) supports:
- Removing inventory items from stock
- Validating available inventory quantities
- Updating inventory records automatically after checkout

## Reporting System
The reports page (`reports.vue`) allows users to:
- Generate daily, weekly, and monthly reports
- View summary and detailed inventory analytics
- Track inventory activity over time

## Activity Logging
The activity page (`activity.vue`) provides:
- System activity logs
- Search functionality
- Filtering options for recorded system actions

---

# Third-Party Integrations

- **Better Auth**: Handles user login and authentication
- **Nodemailer (SMTP / Gmail)**: Sends emails for verification
- **ParadeDB / PostgreSQL (Docker service)**: Supports database search and analytics services through Docker
- **Chart.js**: Displays graphs and analytics charts in the dashboard

---

# Tech Stack

- **Frontend**: Vue 3 + Nuxt 4 (Builds UI and admin dashboard)
- **Backend**: Nuxt Server API Routes (Handles server-side logic and API requests)
- **Database**: SQLite with Prisma ORM (Stores application data)
- **Meta Framework**: Nuxt 4 (Combines frontend and backend into a full-stack application)

---

# Other Tools

- **Docker Compose**: Runs project services in containers
- **Prisma Migrations**: Manages database schema updates
- **Seed Scripts**: Populates the database with starter or test data

---

# Deployment Notes

Deployment is currently being handled by the UTD EPICS department, and the organization is planning to host the website on their own infrastructure.

---

# Migration Scripts

There is no formal automated migration pipeline. Data import functionality depends on Prisma seed scripts and manual or script-assisted processing.

Relevant files:
- `admin/prisma/migrations/`
- `admin/prisma/seed.ts`
- `admin/utils/client_files/`
- `admin/static/client_files/`

---

# Folder Structure

```text
root/
│
├── admin/
│   ├── components/            # Vue.js components
│   ├── lib/
│   ├── pages/                 # Pages for navigation
│   ├── prisma/
│   ├── server/
│   │   ├── api/               # Server-side API handling
│   │   ├── db/                # Database models or utilities
│   │   ├── middleware/        # API middleware
│   │   ├── usage/             # Prisma functions
│   ├── static/                # Holds all community info module CSV files
│   ├── utils/                 # General utility functions
│
├── .env.example               # Example .env file
├── .gitignore                 # Tells git which files/directories not to commit
├── package.json               # NPM dependencies and scripts
└── README.md                  # Project documentation
```

---

# Project Setup

Here is how to set up the project:

1. At the root of the project run:

```bash
node ./scripts/cpenv.js
```

Creates the important environment files.

2. Install root dependencies and enter the admin directory:

```bash
npm install && cd admin/
```

3. Install admin dependencies:

```bash
npm install
```

4. Build the Prisma database:

```bash
npx prisma migrate dev
```

---

# Project Operation

Run the following command (in the admin directory) to start the development server and admin application:

```bash
# Serve with hot reload for the admin inventory application
npm run dev
```

---

# Other Dev Scripts

### Note
To use these, you must be in the root directory.

(See the `scripts` section of `package.json` in the root directory for a more comprehensive list.)

## View Prisma Studio

```bash
# Tip: You can use Prisma Studio to view and edit data in the database
npm run prismaStudio
```

## Reset Prisma Migrations

```bash
npm run prismaResetMigrations
```
