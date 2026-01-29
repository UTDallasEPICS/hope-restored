# Hope-Restored (Community Information & Inventory Tracking)

## Project Overview

Community Information:
Hope Restored Missions is a nonprofit organization dedicated to serving the homeless and impoverished in Collin County and North Texas. It provides essential support to vulnerable individuals by helping them secure housing, access medical and mental healthcare, develop job skills, and achieve long-term stability. The organization is staffed by volunteers who need a database to consolidate all available community resources for easy reference. The Community Resource Viewer will enable volunteers and those in need to find and locate appropriate community resources quickly. The admin application will allow volunteers and members of the organization to add, edit, archive, and delete community resources in the database.
Currently, the resources are provided as a mix of unstructured data from various PDF files, images, and Excel worksheets. A centralized database is needed to consolidate these disparate resources. The database will be accessed via a WordPress front-end, allowing volunteers to search and query the information. Additionally, a separate web application will be developed to enable the organization to perform CRUD operations on the database. Thus, both a WordPress component and a full-stack web application are required for this project.


Inventory Tracking:
Hope Restored Missions receives donations from local businesses, churches, and individuals. Currently, they are tracking their inventory manually, but it is not as efficient as an online tracking system. In addition to making operations more difficult, this is an issue for soliciting donations and grants (as it is difficult to show how effective they are when they cannot report the exact number of hygiene and food kits given out per year or quarter, for example). We are tasked to work with Hope Restored to develop an inventory tracking software system that suits their needs and workflow and allows them to keep track of the inflow/outflow of items in house. The previous team working on this project started to develop an inventory system which we are working on improving.


## Functional Requirements

Reports Page
-	Will display the total number of items entering and leaving the warehouse daily, weekly, or monthly
-	There is a “view reports” option - a choice between a daily, weekly, and a monthly report
-  The daily report gives the report for a selected date
-  The weekly report gives the report for a selected week
-  The monthly report gives the report for a selected month
-  There will be a table on the reports page. The table is 8x4 - the different categories will be the rows. The category, total number in stock, quantity added today, and quantity removed today will be the columns.
-  A button called “Amend Data” which, when pressed, will pull a calendar that allows the user to select a date and then prompts the user to pick a category, enter the quantity to add or remove, and whether they want to add or remove
	-  After the user confirms, the table or previous reports will update for the respective date.

Inventory Page
-  Displays all items in stock and the ability to add items.
-  Eight categories available to enter or remove: shirts, pants, jackets, underwear, shoes, snack packs, hygiene packs, and blankets
-  Table to display all items in stock: category and quantity as columns
-  Once the user selects a category, they will be prompted to enter the quantity they want to add, and once they enter a quantity, there will be a confirmation message 
-  After the user confirms, the table will update the category with the new quantity.

 Checkout Page
-  Allows for the removal of items from the inventory.
-  The user will select the category and enter the quantity of the selected category, and will proceed to click the “Check Out” button, which will remove the items from the inventory and be recorded to the daily report for the current date.
	- Will have a pop-up confirmation window before finalizing the checkout to help minimize accidental human errors.



### Community Resources

- A community resource shall have name and description
- A community resource shall have external contacts such as emails, links, phone numbers, and 
  location
- A community resource shall have tags to be search and filter
- A community resource shall have eligibility requirements
- A community resource shall have demographic constraint
- A community resource shall have cost information

### Application

- The application shall have two views, denoted public view and private/admin view
- The private view shall only be accessible to staff or admins at Hope Restored Missions
- The public view shall be accessible to anyone
- The authentication system shall be integrated with Google
- The authentication system shall be integrated with the internal database


### Public View

- The public view shall follow the color scheme of the Hope Restored Mission website
- The public view shall contain a map of resources
- The client shall be able to search resources
- The client shall be able to filter resources
- The client shall be able to request an update to a resource
- The client shall be able to select multiple resources to add to a cart
- The client shall be able to view all resources in a cart in one place
- The client shall be able to view all resources in a map
- The client shall be able to select a current location
- The client shall be able to view all resources around the current location
- The public view shall conform to accessibility standards
- The public view shall be dynamic (work for mobile and desktop)

### Private View

- The private view shall follow the color scheme of the Hope Restored Mission website
- The private view shall be a standalone website

#### Resources:
- The admin/staff shall be able to search resources
- The admin shall be able to filter resources
- The admin shall be able to see requests for resources
- The admin shall be able to update any information on a resource
- The admin shall be able to delete, edit, and unarchive archived resources
- The admin/staff shall be able to archive a resource
- The admin shall be able to add a resource
- The admin shall be able to add a new category
#### Inventory Tracking:
- The admin/staff shall be able to add new items to the inventory
- The admin/staff shall be able to specify the category, size, style, gender, quantity, and location of each newly inserted item in the inventory
- The admin/staff shall be able to view the inventory in a table format with columns for category, size, style, gender, quantity, and location
- The admin/staff shall be able to add to the quantity of an already existing inventory item
- The admin/staff shall be able to remove the quantity of an already existing inventory item
- The admin/staff shall be able to remove an item from the inventory by removing the existing quantity of the item
	

## Third-Party Services

### Auth0

Auth0 provides authentication and authorization services for the application. It allows users to log in using their Google account or a custom username and password. Auth0 also provides user management and security features. This service is used in private view. Each user will have dedicated permissions based on the roles given to them by the admin. Roles modify what a user can do/see (similar to Discord’s role system; EX, can they see Inventory tracking? Can they view archived resources? etc.)

### Map API 

Leaflet provides interactive map functionality for the website. It is an open-source JavaScript library that allows developers to display customizable maps, add location markers, and overlay data directly on the map. This is useful for features like displaying physical resource locations, tracking site assets, or helping users visualize spatial data. Leaflet is lightweight, mobile-friendly, and highly customizable—ideal for embedding dynamic, responsive maps into the site. It enhances the user experience by adding visual and spatial context to key information.

## Tech Stack

Community Information:
- Public Front-End: Vue, Typescript, Vite, Tailwind CSS, Heroicons
- Admin Front-End: Nuxt.js, Tailwind CSS, Heroicons
- Admin Back-End: Nuxt.js, Prisma
- Database: SQLite
- Recommended Tools to use: Postman or any other API testing platform

Inventory Tracking:
- Front-End: Nuxt.js, Typescript, CSS (should convert to Tailwind)
- Back-End: Nuxt.js, Prisma
- Database: SQLite
- Recommended Tools to use: Postman or any other API testing platform


## Deployment notes

*UTD EPICS DEPARTMENT IS CURRRENTLY HANDLING BETA APPLICATION DEPLOYMENT - FALL 2025*









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

1. Run the setup script

   ```bash
   # Make sure you are in the root directory when you call this
   npm run setup
   ```

2. Replace placeholder values in the ``.env`` files
- API keys and any other secrets or environment variables (Currently, the project does not have any secrets)


## Project operation

1. Run the following command (in the root directory) to start the development server and admin application

   ```bash
   # Serve with hot reload at localhost:3000 for the private application (Inventory Tracking)
   npm run admin
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

