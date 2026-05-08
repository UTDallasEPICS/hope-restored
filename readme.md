## Hope-Restored (Community Information & Inventory Tracking)

## Conceptual Overview:
The Hope Restored Missions Inventory Tracking System is designed to provide the organization with a centralized digital platform for managing inventory operations and client services. The system streamlines the process of adding, updating, and removing inventory items while maintaining accurate records across multiple categories, genders, and sizes.
In addition to inventory management, the platform tracks client history to help Hope Restored Missions better understand and meet the needs of the individuals they serve. This data also supports outreach and reporting efforts when requesting donations or partnerships from larger organizations.
The system further simplifies report generation by providing daily, weekly, and monthly inventory analytics. These reports allow the organization to monitor operational progress, inventory trends, and community impact more efficiently.
The primary users of the platform are the staff members and volunteers at Hope Restored Missions who manage day-to-day inventory and client operations.


## Functional Requirements
# Authentication System
The authentication system includes:
- login.vue
- Users.vue
- Home.vue
These pages allow users to:
- Sign in securely
- Create accounts through an administrator-managed system
- Access protected application functionality through role-based authentication

# Inventory Management
The inventory management page (inventory.vue) allows administrators to:
- View current inventory levels
- Add new inventory items
- Manage inventory by:
	- Category
	- Gender
	- Size

# Checkout System
The checkout page (checkout.vue) supports:
- Removing inventory items from stock
- Validating available inventory quantities
- Updating inventory records automatically after checkout

# Reporting System
The reports page (reports.vue) allows users to:
- Generate daily, weekly, and monthly reports
- View summary and detailed inventory analytics
- Track inventory activity over time

# Activity Logging
The activity page (activity.vue) provides:
- System activity logs
- Search functionality
- Filtering options for recorded system actions

# Public Web Components
Public-facing components provide:
- A resource browsing interface (HomeView.vue)
- Search and filtering functionality for browsing available resources

## Third-Party Integrations
Better Auth: Handles user login and authentication
Nodemailer (SMTP / Gmail): Sends emails as verification
ParadeDB / PostgreSQL (Docker service): Supports database search and analytics services through docker
Chart.js: Displays graphs and analytics charts in the dashboard

## Tech Stack
Frontend: Vue 3 + Nuxt 4 (Builds UI and admin dashboard)
Backend: Nuxt Server API Routes (Handles server side logic and API requests)
Database: SQLite with Prisma ORM (Stores application data)
Meta Framework: Nuxt 4 (Combines frontend and backend into a full-stack application)

## Other Tools
Docker Compose: Runs project services in containers
Prisma Migrations: Manages database schema updates
Seed Scripts: Populates the database with starter or test data

## Deployment Notes
Deployment is currently being handled by the UTD EPICS department, and the organization is going to host the website on their own infrastructure.


## Migration Scripts
There is no formal automated migration pipeline, data import functionality depends on Prisma seed scripts and manual or script-assisted processing.
Relevant Files:
`admin/prisma/migrations/`
`admin/prisma/seed.ts`
`admin/utils/client_files/`
`admin/static/client_files/`

## Folder Structures

```

root/
│   --- PRIVATE VIEW ----
├── admin/
│   ├── components/            # Vue.js components
│   ├── lib/
│   ├── pages/		# pages for navigation
│   ├── prisma/		
│   ├── server/
│   │   ├── api/              	# Server-side API handling
│   │   ├── db/                	# Database models or utilities
│   │   ├── middleware/   # API middleware
│   │   ├── usage/            # Prisma functions		
│   ├── static/		# holds all community info module csv files
│   ├── utils/		# General utility functions
│   --- PUBLIC VIEW ----
├── webcomponent/
│   ├── src/
│   │   ├── assets/        # Uncompiled assets like Sass, images, fonts
│   │   │   ├── main.css 	# holds all styling and Tailwind themes for public view
│   │   ├── components/            # Vue.js components
│   │   ├── router/
|   |   |__ scripts        #Handles automatic inventory snapshots and necessary actions for each day
|   |   |
│   │   ├── server/
│   │   │   ├── api/              	# Server-side API handling
│   │   │   ├── db/                	# Database models or utilities
│   │   │   ├── middleware/   # API middleware
│   │   │   ├── usage/            # Prisma functions		
│   │   ├── stores/		# all vue stores for the project
│   │   ├── utils/		# General utility functions
│   │   ├── views/		# pages for the router to access
│   │   ├── app.vue		# The application
│   │   ├── main.ts		# Typescript for the application
│   ├── package.json           # NPM dependencies and scripts
│   ├── .env           		# where all environment variables for the public view are stored
│   ├── various configs
│   --- GENERAL ----
├── .env.example     # example .env file
├── .gitignore     	# tells git which file types and directories not to commit
├── package.json           # NPM dependencies and scripts
└── README.md              # Project documentation
```

## Project setup

Here is how to setup the project

1. At the root of the project run
   node ./scripts/cpenv.js  (Creates the imp env files)

2. npm install && cd webcomponent/ (Install root dependencies and enter the webcomponent dir)

3. npm install (Install webcomponent dependencies)

4. cd ../admin/ && npm install (Change into the admin dir and install dependencies)

5. npx prisma migrate dev (Build Prisma database)


## Project operation

1. Run the following command (in the admin directory) to start the development server and admin application

   ```bash
   # Serve with hot reload at localhost:3000 for the private application (Inventory Tracking)
   npm run dev
   ```

2. Run the following command (in the root directory) to start the web-component (public-facing application for community information)

   ```bash
   # Serve with hot reload at localhost:4000 for the public application (Community Information)
   # Note: The admin application needs to finish running first before the
   # public frontend since the data is being fetched from the private backend
   # Just refresh the public frontend page if you see a connection error
   npm run public
   ```

## Other Dev Scripts
#### Note: To use these, you must be in the root directory
(See the ``scripts`` section of ``package.json`` in the root directory for a more comprehensive list)

- To view Prisma Studio, you can use the following command:
   ```bash
  # Tip: You can use Prisma Studio to view and edit data in the database
  npm run prismaStudio
  ```

- To reset your Prisma migrations, you can use the following command:
  ```bash
  npm run prismaResetMigrations
  ```

- To run the admin **and** public apps with less typing, you can use the following command:
  ```bash
  npm run prismaResetMigrations
  ```

