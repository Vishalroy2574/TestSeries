## Test Series Hub

Full-stack web application built with Node.js, Express, and EJS templating, featuring JWT-based session authentication and role-based access control for managing and taking test series.

### Features

- **User Authentication**: Session-based authentication with JWT tokens (httpOnly cookies)
- **Student Portal**: Browse courses, view PDF test series, take tests, and view results
- **Admin Panel**: Create, update, and delete tests with PDF uploads
- **Test Taking**: Interactive test interface with timer and automatic submission
- **Results Tracking**: View detailed test results with answer review

### Tech Stack

- **Frontend**: EJS templating, Vanilla CSS, Client-side JavaScript
- **Backend**: Node.js + Express
- **Database**: MongoDB (Atlas)
- **Authentication**: JWT-based session authentication
- **File Storage**: Cloudinary (for PDFs)

### Prerequisites

- Node.js (LTS recommended)
- MongoDB Atlas URI
- Cloudinary Account (for PDF uploads)

### Setup

1. Clone or download this project.

2. Navigate to the `server` directory and create a `.env` file:

```env
# MongoDB
MONGO_URI=your_mongodb_atlas_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Session Secret
SESSION_SECRET=your_session_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=5000
NODE_ENV=development
```

### Installation

From the project root:

```bash
npm install
```

This will install dependencies in the `server` directory.

### Run in Development

```bash
npm run dev
```

The application will start on `http://localhost:5000`

### Production

```bash
npm start
```

### Default Admin Account

On first run, a default admin account is created:
- **Email**: admin@test.com
- **Password**: admin123

**Note**: Change this password immediately after first login in production!

### Project Structure

```
test-series-hub/
├── server/
│   ├── config/          # Database and Cloudinary config
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication and error handling
│   ├── models/          # MongoDB models
│   ├── routes/          # API and view routes
│   ├── views/           # EJS templates
│   │   ├── layouts/     # Layout templates
│   │   ├── partials/    # Reusable components
│   │   └── pages/       # Page templates
│   ├── public/          # Static assets (CSS, JS)
│   │   ├── css/         # Stylesheets
│   │   └── js/          # Client-side JavaScript
│   ├── utils/           # Helper utilities
│   └── server.js        # Entry point
└── package.json         # Root package file
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

#### Tests (Protected)
- `GET /api/tests` - Get all tests
- `GET /api/tests/:id` - Get test by ID
- `POST /api/tests` - Create test (Admin only)
- `PUT /api/tests/:id` - Update test (Admin only)
- `DELETE /api/tests/:id` - Delete test (Admin only)

#### Results (Protected)
- `GET /api/results` - Get user results
- `POST /api/results` - Submit test result

#### Uploads (Protected, Admin only)
- `POST /api/uploads/pdf` - Upload PDF to Cloudinary

### Pages

- `/login` - Login page
- `/register` - Registration page
- `/` - Dashboard (Protected)
- `/category/:category` - Category tests (Protected)
- `/tests/:id` - Test details (Protected)
- `/tests/:id/take` - Take test (Protected)
- `/results` - View results (Protected)
- `/admin` - Admin panel (Protected, Admin only)
- `/logout` - Logout

### License

MIT
