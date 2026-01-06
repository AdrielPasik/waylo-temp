# Waylo - Backend + Frontend Setup

## Backend Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation
```bash
cd backend
npm install
```

### Configuration
1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` with your values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/waylo
JWT_SECRET=your-strong-secret-key-here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Run Development Server
```bash
npm run dev
```

Server will start on `http://localhost:5000`

Test healthcheck: `http://localhost:5000/health`

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user (requires auth)

#### Trips
- `GET /api/trips` - List all trips for user
- `GET /api/trips/:tripId` - Get trip by ID
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:tripId` - Update trip
- `PATCH /api/trips/:tripId` - Partial update
- `DELETE /api/trips/:tripId` - Delete trip

#### Subdocuments (Destinations, Expenses, Transportation, Accommodation)
- `POST /api/trips/:tripId/destinations` - Add destination
- `PUT /api/trips/:tripId/destinations/:destinationId` - Update destination
- `DELETE /api/trips/:tripId/destinations/:destinationId` - Delete destination
- Similar endpoints for `/expenses`, `/transportation`, `/accommodation`

## Frontend Setup

### Prerequisites
- Node.js 18+
- Backend server running

### Installation
```bash
cd frontend
npm install
```

### Configuration
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Run Development Server
```bash
npm run dev
```

Frontend will start on `http://localhost:3000`

## Testing the Application

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Flow

1. **Register**: Go to `http://localhost:3000` → redirects to `/login` → click "Sign up"
2. **Create account**: Fill email, password (min 8 chars), optional name
3. **Login**: After registration, you're logged in automatically
4. **Create trips**: Use the UI to create trips, add destinations, expenses, etc.
5. **Verify in MongoDB**:
   ```bash
   mongosh "mongodb://localhost:27017/waylo"
   db.users.find().pretty()
   db.trips.find().pretty()
   db.refreshtokens.find().pretty()
   ```

### Testing with curl

**Register**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

**Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Create Trip** (use token from login):
```bash
curl -X POST http://localhost:5000/api/trips \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Europa 2025","budget":5000,"currency":"USD"}'
```

## Architecture

### Backend
- **Framework**: Express.js + TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT (access token) + Refresh tokens (httpOnly cookies)
- **Security**: Helmet, CORS, rate limiting, bcrypt password hashing
- **Validation**: express-validator

### Frontend
- **Framework**: Next.js 14 (App Router)
- **State Management**: React Context API + custom hooks
- **API Client**: Axios with interceptors
- **Auth Flow**: JWT stored in localStorage, auto-refresh on 401
- **UI**: Tailwind CSS + custom components

### Data Model
- **Embedded documents**: Trips contain destinations, expenses, transportation, and accommodation as subdocuments
- **User isolation**: Each trip is linked to a user via `userId`
- **Linked expenses**: Transportation and accommodation costs auto-create linked expenses

## Troubleshooting

### Backend won't start
- Check MongoDB is running: `mongosh` or check Atlas connection
- Verify `.env` file exists and has valid values
- Check port 5000 is not in use

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Check browser console for CORS errors
- Verify backend CORS_ORIGIN matches frontend URL

### 401 Unauthorized errors
- Token may be expired - logout and login again
- Check localStorage has `accessToken`
- Verify JWT_SECRET matches between sessions

### Database errors
- Check MongoDB connection string in backend `.env`
- Verify MongoDB is running and accessible
- Check database name is correct (default: `waylo`)
