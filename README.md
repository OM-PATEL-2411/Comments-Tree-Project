# Nested Comments Tree Project

A full-stack web application built with Next.js 15, MongoDB, Mongoose, and TanStack Query that supports infinite nested comment threads, user authentication, liking, editing, soft deleting, search, cursor pagination, and optimistic UI updates.

---

## Project Overview

This project was built to solve the problem of handling complex nested discussions efficiently on the web. In modern social platforms like Reddit or Twitter, comments often have deep replies, and rendering them quickly without crashing the page or making hundreds of database requests can be tricky.

I built this project using Next.js 15 App Router and MongoDB to create a fast and responsive commenting system. Users can create accounts, log in securely using JWT tokens stored in HttpOnly cookies, create root comments, reply to existing comments to any depth, like or unlike comments, edit their own posts within a 5-minute window, and soft-delete comments. The UI also updates instantly using TanStack Query's optimistic updates and loads comments smoothly with cursor-based pagination.

---

## Features

- **User Registration & Login**: Secure account creation and authentication.
- **JWT Cookie Security**: Authentication tokens are stored securely in HttpOnly cookies to protect against XSS attacks.
- **Nested Comment Threads**: Unlimited depth recursive comment replies.
- **Automatic Author Assignment**: Author information is taken directly from the verified JWT token on the backend.
- **Like / Unlike System**: Toggle likes on any comment with instant feedback and duplicate prevention.
- **Comment Editing**: Authors can edit their comment text within 5 minutes of posting.
- **Soft Delete**: Deleting a comment marks `isDeleted = true` in MongoDB and removes it cleanly from the UI without losing the document.
- **Real-Time Search**: Search through comments by author name or message with 500ms debouncing.
- **Cursor-Based Pagination**: Paginated loading of root comments using cursors (`createdAt`) instead of slow offset-based page numbers.
- **Server-Side Rate Limiting**: Enforces a 3-second delay between successful comment creations per user to prevent spamming.
- **Optimistic UI Updates**: Instant UI updates when posting comments and replies, with automatic rollback and toast notifications on failure.
- **Expand / Collapse Threads**: Hide or show child reply branches with state that stays intact across page refetches.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **State & Data Fetching**: TanStack Query (v5)

### Backend
- **Framework**: Next.js 15 Serverless API Routes
- **Database ORM**: Mongoose (v9)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`

### Database
- **Database Engine**: MongoDB Atlas

---

## Folder Structure

```text
second-assesment/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.js
│   │   │   │   ├── logout/route.js
│   │   │   │   └── register/route.js
│   │   │   └── comments/
│   │   │       ├── route.js
│   │   │       └── [id]/
│   │   │           ├── route.js
│   │   │           └── like/route.js
│   │   ├── authenticate/
│   │   │   └── page.jsx
│   │   ├── comments/
│   │   │   └── page.jsx
│   │   ├── layout.jsx
│   │   └── page.jsx
│   ├── components/
│   │   ├── CommentCard.jsx
│   │   ├── CommentForm.jsx
│   │   ├── CommentThread.jsx
│   │   ├── CommentSkeleton.jsx
│   │   ├── EmptyState.jsx
│   │   ├── ErrorState.jsx
│   │   └── ToastContainer.jsx
│   ├── hooks/
│   │   └── useDebounce.js
│   ├── lib/
│   │   ├── apiClient.js
│   │   ├── apiHandler.js
│   │   ├── auth.js
│   │   ├── authApi.js
│   │   ├── commentActions.js
│   │   ├── createComment.js
│   │   ├── fetchComments.js
│   │   ├── jwt.js
│   │   ├── likeComment.js
│   │   ├── mongodb.js
│   │   ├── rateLimiter.js
│   │   └── ResponseHelper.js
│   ├── models/
│   │   ├── Comment.js
│   │   └── User.js
│   ├── middleware.js
│   └── proxy.js
├── .env.local
├── package.json
└── README.md
```

---

## Installation & Setup

Follow these steps to run the application locally on your computer.

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- A working MongoDB Atlas connection string or local MongoDB instance

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/OM-PATEL-2411/Comments-Tree-Project.git
   cd Comments-Tree-Project
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a file named `.env.local` in the root folder of the project and add your secrets (see the section below).

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Open your browser and navigate to `http://localhost:3000`.

---

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```ini
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Secret key used to sign and verify JWT tokens
JWT_SECRET=your_jwt_secret_key_here
```

- `MONGODB_URI`: The connection URI for your MongoDB cluster.
- `JWT_SECRET`: A long, random string used by `jsonwebtoken` to sign authentication cookies securely.

---

## API Endpoints

Here is a list of all API routes implemented in the project:

| Method | Route | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user with username, email, and password | No |
| `POST` | `/api/auth/login` | Authenticate user and issue an HttpOnly JWT cookie | No |
| `POST` | `/api/auth/logout` | Clear the HttpOnly JWT cookie | Yes |
| `GET` | `/api/comments` | Fetch comments with cursor pagination and search filter | Yes |
| `POST` | `/api/comments` | Create a new root comment or reply (rate limited to 1 request / 3 sec) | Yes |
| `PATCH` | `/api/comments/:id` | Edit comment message (author only, within 5 minutes) | Yes |
| `DELETE` | `/api/comments/:id` | Soft delete a comment (`isDeleted: true`) (author only) | Yes |
| `POST` | `/api/comments/:id/like` | Toggle like/unlike status for a comment | Yes |

---

## Database Design

The database contains two main MongoDB collections managed through Mongoose models.

### 1. User Collection (`src/models/User.js`)
- Stores user credentials: `username` (unique), `email` (unique, lowercase), and `password` (hashed using `bcryptjs`).
- Pre-save hooks automatically hash passwords before writing to the database.

### 2. Comment Collection (`src/models/Comment.js`)
- **`author`**: Embedded object containing `{ id: ObjectId, username: String }`. Storing both the ID and username avoids doing expensive database population queries every time comments are rendered.
- **`message`**: The comment body string.
- **`parentId`**: Points to the `_id` of the parent comment. If `parentId` is `null`, it is a top-level root comment. If it has a value, it is a reply. This structure allows infinite nesting levels without complex subdocuments.
- **`likes` & `likedBy`**: `likes` counts the total likes, while `likedBy` is an array of User `ObjectId`s. Keeping `likedBy` ensures each user can only like a comment once.
- **`isDeleted`**: A boolean flag set to `true` when a user deletes their comment. Instead of permanently wiping the database record, soft deletion preserves the database record while the frontend filters it out from being shown.
- **`editedAt`**: Timestamp recording when the comment was last edited.

---

## Authentication Flow

Authentication is handled securely using JWT tokens stored inside HttpOnly cookies:

```text
User Submits Credentials (Login / Register)
                 │
                 ▼
Server Verifies Password & Generates JWT Token
                 │
                 ▼
Token Sent Back in HttpOnly, SameSite Cookie
                 │
                 ▼
Middleware (`proxy.js`) Verifies Cookie on Route Navigation
 (Unauthenticated -> Redirected to /authenticate)
 (Authenticated -> Redirected to /comments)
                 │
                 ▼
Backend API Routes Verify JWT Cookie via `authenticate(request)`
```

1. The user logs in or registers at `/authenticate`.
2. The server generates a JWT payload containing the user's ID, username, and email.
3. The token is set in an `HttpOnly` cookie named `token`. This means JavaScript cannot read the token in the browser, protecting it from XSS scripts.
4. When navigating around the app, `middleware.js` checks for the valid token cookie and redirects unauthenticated users away from `/comments`.
5. When making API requests (e.g. creating a comment or liking), the browser automatically attaches the cookie, and `authenticate(request)` checks the token on the server.

---

## Cursor Pagination

Instead of traditional offset pagination (`skip(20)`), which gets slower as the database grows, this project uses **cursor-based pagination**.

### How It Works
- The `GET /api/comments` endpoint receives `?cursor=<timestamp>&limit=20`.
- The server queries root comments (`parentId: null`) created after the cursor date: `createdAt: { $gt: cursorDate }`.
- The API fetches `limit + 1` comments to determine if there is a next page (`hasMore`).
- It returns the comments along with `nextCursor` (the timestamp of the last comment in the list).
- On the frontend, TanStack Query's `useInfiniteQuery` receives the cursor and appends new pages when the user clicks **Load More Comments**.

This keeps database queries fast regardless of how many thousands of comments exist.

---

## Optimistic UI

To make the app feel fast, new comments and replies use **Optimistic UI updates**:

1. When a user submits a comment, a temporary comment object with a client ID like `temp-17234567890` is generated.
2. TanStack Query immediately updates its local cache and renders the comment in the UI before the API request completes.
3. When the server responds with HTTP 201, the temporary comment is swapped for the real comment saved in MongoDB.
4. If the server request fails (for example, if rate limited), the temporary comment is rolled back from the cache, and a red Toast notification appears explaining what went wrong.

---

## Challenges Faced

During development, several interesting engineering challenges came up:

1. **Building the Recursive Tree**: Converting flat arrays returned by MongoDB into a deeply nested tree structure while keeping track of children at every depth level required careful recursion.
2. **State Preservation during Expansion**: Ensuring that expanded and collapsed thread states did not reset whenever a user liked a comment or loaded more pages. This was solved by centralizing collapsed IDs in a `Set`.
3. **Optimistic Updates in Nested Trees**: Updating a nested reply optimistically in TanStack Query required writing recursive helper functions to traverse pages and insert temporary items into the correct child array.
4. **5-Minute Edit Window**: Checking `Date.now() - createdAt` both on the frontend UI to hide the edit button and on the backend route handler to return a 403 status if someone bypassed the UI.
5. **HttpOnly Cookie Handling in Middleware**: Ensuring Next.js proxy middleware properly read `request.cookies.get("token")` and handled server-side redirects cleanly without getting stuck in infinite loops.

---

## AI Usage

I used AI assistance (Google DeepMind's Antigravity AI assistant) while working on this project. Here is how it was used:

- **Concept Clarification**: Understanding how to properly format TanStack Query's `useInfiniteQuery` for cursor pagination.
- **Boilerplate Generation**: Generating initial UI component templates and Tailwind utility classes.
- **Debugging & Error Tracing**: Identifying edge cases with Mongoose ObjectId comparisons and Next.js middleware execution order.
- **Manual Review**: Every line of code generated or suggested was reviewed, tested, and modified to ensure it met the exact constraints of the assessment.

---

## Future Improvements

If I have more time to work on this project in the future, I would like to add:

- **Real-Time WebSockets**: Use WebSockets or Server-Sent Events (SSE) so users see new comments posted by others instantly without refreshing.
- **User Avatars & Profiles**: Allow users to upload custom avatar images and view profile pages with their comment history.
- **Comment Formatting**: Support basic Markdown (bold, italics, code blocks) in comment messages.
- **Unit & E2E Testing**: Add Jest tests for backend API routes and Playwright tests for user authentication flows.

---

## Author

**Om Patel**  
GitHub: [@OM-PATEL-2411](https://github.com/OM-PATEL-2411)  
Project Repository: [Comments-Tree-Project](https://github.com/OM-PATEL-2411/Comments-Tree-Project)
