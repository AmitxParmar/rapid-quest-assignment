# WhatsApp Clone - Complete Documentation

A full-stack WhatsApp clone built with Next.js, TypeScript, Express.js, and MongoDB.

## 📁 Project Structure

### Frontend (Client)

```
client/
├── app/
│   ├── (conversation)/
│   │   ├── conversation/
│   │   │   └── [...conversationId]/
│   │   │       ├── error.tsx
│   │   │       └── page.tsx
│   │   ├── error.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── chat/
│   │   ├── chat-container.tsx
│   │   ├── chat-header.tsx
│   │   ├── index.tsx
│   │   ├── message-bar.tsx
│   │   └── message-bubble.tsx
│   ├── common/
│   │   ├── account-switcher.tsx
│   │   ├── chat-layout.tsx
│   │   ├── empty-chat.tsx
│   │   ├── message-loader.tsx
│   │   ├── message-status.tsx
│   │   └── theme-switcher.tsx
│   ├── conversations/
│   │   ├── chat-list/
│   │   │   ├── chat-list-item.tsx
│   │   │   └── index.tsx
│   │   ├── chat-list-header.tsx
│   │   ├── index.tsx
│   │   └── search-bar.tsx
│   └── ui/
│       ├── avatar.tsx
│       ├── button.tsx
│       ├── dropdown-menu.tsx
│       └── input.tsx
├── hooks/
│   ├── use-mobile.tsx
│   ├── useConversations.tsx
│   └── useMessages.tsx
├── lib/
│   ├── api.ts
│   └── utils.ts
├── provider/
│   ├── query-provider.tsx
│   └── theme-provider.tsx
├── services/
│   ├── conversations.service.ts
│   └── message.service.ts
├── store/
│   └── useUserStore.ts
├── types/
│   └── index.ts
├── utils/
│   ├── calculateTime.ts
│   └── index.ts
├── components.json
├── next.config.ts
├── package.json
└── tailwind.config.js
```

### Backend (Server)

```
server/
├── config/
│   ├── db.ts
│   └── env.ts
├── controllers/
│   ├── conversation.controller.ts
│   └── message.controller.ts
├── models/
│   ├── Contact.ts
│   ├── Conversation.ts
│   └── Message.ts
├── routes/
│   ├── conversation.route.ts
│   └── message.route.ts
├── app.ts
├── server.ts
├── socket.ts (placeholder)
├── nodemon.json
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB
- npm or yarn

### Installation

#### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the server directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/whatsapp-clone
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

Start the server:

```bash
npm run dev
```

#### Frontend Setup

```bash
cd client
npm install
```

Create a `.env.local` file in the client directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

Start the client:

```bash
npm run dev
```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

Currently, the API does not implement authentication. Users are identified by their WhatsApp ID (`waId`).

### Endpoints

#### Conversations

##### Get All Conversations

```http
GET /api/conversations/:userId
```

**Parameters:**

- `userId` (string): WhatsApp ID of the user

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "conversation_id",
      "conversationId": "unique_conversation_id",
      "participants": [
        {
          "waId": "911234567890",
          "name": "John Doe",
          "profilePicture": "url_to_picture"
        }
      ],
      "lastMessage": {
        "text": "Hello there!",
        "timestamp": 1640995200000,
        "from": "911234567890",
        "status": "sent"
      },
      "unreadCount": 2,
      "isArchived": false,
      "createdAt": "2023-12-31T00:00:00.000Z",
      "updatedAt": "2023-12-31T00:00:00.000Z"
    }
  ]
}
```

##### Mark Messages as Read

```http
PUT /api/conversations/:conversationId/read
```

**Parameters:**

- `conversationId` (string): MongoDB ObjectId of the conversation

**Request Body:**

```json
{
  "waId": "911234567890"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

#### Messages

##### Get Messages for Conversation

```http
GET /api/messages/:conversationId
```

**Parameters:**

- `conversationId` (string): MongoDB ObjectId of the conversation

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Messages per page (default: 50)

**Response:**

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "conversationId": "conversation_id",
        "from": "911234567890",
        "to": "919937320320",
        "text": "Hello there!",
        "timestamp": 1640995200000,
        "status": "sent",
        "type": "text",
        "waId": "911234567890",
        "direction": "outgoing",
        "contact": {
          "name": "John Doe",
          "waId": "911234567890"
        },
        "createdAt": "2023-12-31T00:00:00.000Z",
        "updatedAt": "2023-12-31T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalMessages": 5,
      "hasMore": false
    }
  }
}
```

##### Send Message

```http
POST /api/messages
```

**Request Body:**

```json
{
  "from": "911234567890",
  "to": "919937320320",
  "text": "Hello there!",
  "type": "text"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": {
      "_id": "message_id",
      "conversationId": "conversation_id",
      "from": "911234567890",
      "to": "919937320320",
      "text": "Hello there!",
      "timestamp": 1640995200000,
      "status": "sent",
      "type": "text",
      "waId": "911234567890",
      "direction": "outgoing",
      "contact": {
        "name": "John Doe",
        "waId": "911234567890"
      }
    },
    "conversationId": "conversation_id"
  }
}
```

##### Get Contacts

```http
GET /api/contacts
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "contact_id",
      "waId": "911234567890",
      "name": "John Doe",
      "profilePicture": "url_to_picture",
      "isOnline": true,
      "lastSeen": "2023-12-31T00:00:00.000Z"
    }
  ]
}
```

### Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

Common HTTP status codes:

- `400` - Bad Request (missing required fields, invalid data)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## 💻 Frontend Documentation

### Tech Stack

- **Framework:** Next.js 15.4.6 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **HTTP Client:** Axios
- **UI Components:** Radix UI primitives
- **Icons:** Lucide React
- **Theme:** next-themes

### Key Features

#### 1. Multi-Account Support

Users can switch between different WhatsApp accounts using the account switcher in the sidebar.

#### 2. Real-time Chat Interface

- Message bubbles with sender/receiver styling
- Message status indicators (sent, delivered, read)
- Timestamp formatting
- Emoji picker support

#### 3. Responsive Design

- Mobile-first approach
- Adaptive layout for desktop and mobile
- Custom scrollbars and touch-friendly interactions

#### 4. State Management

##### User Store (Zustand)

```typescript
type UserStore = {
  activeUser: User;
  setActiveUser: (user: User) => void;
  users: User[];
  activeChatUser: User | null;
  setActiveChatUser: (user: User) => void;
  setActiveChatUserById: (waId: string) => void;
};
```

#### 5. Custom Hooks

##### useMessages

```typescript
// Fetch messages for a conversation
const { data, isLoading } = useMessages(conversationId);

// Send a message
const { mutate: sendMessage } = useSendMessage();
```

##### useConversations

```typescript
// Fetch all conversations for active user
const { data: conversations, isLoading, error } = useConversations();
```

#### 6. Routing Structure

The app uses Next.js App Router with dynamic routes:

- `/` - Empty chat state (desktop only)
- `/conversation/[conversationId]/[activeChatUserId]` - Chat interface

### Components Architecture

#### Core Components

##### ChatLayout

Main layout component that handles responsive design:

- Desktop: Side-by-side layout with conversations and chat
- Mobile: Stacked layout

##### Chat Components

- **ChatContainer**: Displays message bubbles with virtualization
- **ChatHeader**: Shows active chat user info and actions
- **MessageBar**: Input field with emoji picker and send functionality
- **MessageBubble**: Individual message component with status indicators

##### Conversation Components

- **ChatList**: List of all conversations
- **ChatListItem**: Individual conversation item with unread count
- **SearchBar**: Search functionality for conversations

### Data Flow

1. **User Selection**: User switches account via AccountSwitcher
2. **Conversations Loading**: useConversations fetches conversations for active user
3. **Chat Selection**: User clicks on conversation, sets activeChatUser
4. **Messages Loading**: useMessages fetches messages for selected conversation
5. **Message Sending**: useSendMessage optimistically updates cache

### Styling System

#### Tailwind Configuration

Custom CSS variables for WhatsApp-like theming:

```css
:root {
  --color-incoming: #242626;
  --color-outgoing: #144d37;
  --color-wa-info: #ffffff99;
  --color-label: rgba(37, 211, 102);
  --color-searchbar: rgba(255, 255, 255, 0.1);
}
```

#### Theme Support

- Light and dark theme support via next-themes
- Custom color tokens for WhatsApp-like appearance
- Responsive breakpoints and mobile-first design

## 🗃️ Database Schema

### Collections

#### Conversations

```javascript
{
  _id: ObjectId,
  conversationId: String, // Unique identifier
  participants: [{
    waId: String,
    name: String,
    profilePicture: String (optional)
  }],
  lastMessage: {
    text: String,
    timestamp: Number,
    from: String,
    status: String
  },
  unreadCount: Number,
  isArchived: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- `conversationId: 1`
- `lastMessage.timestamp: -1`

#### Messages

```javascript
{
  _id: ObjectId,
  conversationId: ObjectId, // Reference to Conversations
  from: String,
  to: String,
  text: String,
  timestamp: Number,
  status: "sent" | "delivered" | "read" | "failed",
  type: "text" | "image" | "document" | "audio" | "video",
  waId: String,
  direction: "incoming" | "outgoing",
  contact: {
    name: String,
    waId: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- `conversationId: 1, timestamp: 1`

#### Contacts

```javascript
{
  _id: ObjectId,
  waId: String, // Unique WhatsApp ID
  name: String,
  profilePicture: String (optional),
  lastSeen: Date (optional),
  isOnline: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- `waId: 1` (unique)

## 🎯 Key Features Implementation

### Message Status System

1. **Sent**: Message created and stored in database
2. **Delivered**: Message received by recipient's device (not implemented)
3. **Read**: Recipient opened the conversation
4. **Failed**: Message delivery failed (not implemented)

### Conversation Management

- Automatic conversation creation when users first message each other
- Participant-based conversation lookup
- Last message tracking for conversation previews
- Unread count management

### Real-time Updates (Planned)

The `socket.ts` file is included for future WebSocket implementation to enable:

- Real-time message delivery
- Online/offline status
- Typing indicators
- Message status updates

## 🔧 Development Guidelines

### Code Organization

#### Frontend

- **Components**: Reusable UI components in `/components`
- **Hooks**: Custom React hooks for data fetching and state management
- **Services**: API communication layer
- **Types**: TypeScript type definitions
- **Utils**: Helper functions and utilities

#### Backend

- **Controllers**: Request handling and business logic
- **Models**: MongoDB schema definitions
- **Routes**: API endpoint definitions
- **Config**: Environment and database configuration

### Best Practices

#### Frontend

- Use TypeScript for type safety
- Implement error boundaries for error handling
- Optimize with React.memo for performance
- Use TanStack Query for caching and synchronization
- Follow responsive design principles

#### Backend

- Validate request data
- Use proper HTTP status codes
- Implement error handling middleware
- Add database indexes for performance
- Use environment variables for configuration

## 🚀 Deployment

### Environment Variables

#### Server

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/whatsapp-clone
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
```

#### Client

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

### Build Commands

#### Server

```bash
npm run build
npm start
```

#### Client

```bash
npm run build
npm start
```

## 📱 Mobile Considerations

- Touch-friendly interface design
- Responsive breakpoints at 768px
- Mobile-first CSS approach
- Custom scrollbar styling for better UX
- Optimized layout switching between mobile and desktop
- Back navigation support on mobile devices

## 🧪 Testing

### API Testing

You can test the API endpoints using tools like Postman or curl:

```bash
# Get conversations for a user
curl -X GET http://localhost:5000/api/conversations/911234567890

# Send a message
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "from": "911234567890",
    "to": "919937320320",
    "text": "Hello, how are you?"
  }'

# Get messages for a conversation
curl -X GET http://localhost:5000/api/messages/CONVERSATION_ID
```

### Sample Data

To test the application, you'll need to seed your database with sample contacts and conversations. Here's an example:

```javascript
// Sample contacts
[
  { waId: "911234567890", name: "Business Account (me)", isOnline: true },
  { waId: "919937320320", name: "Ravi Kumar", isOnline: false },
  { waId: "929967673820", name: "Neha Joshi", isOnline: true },
];
```

## 🔮 Future Enhancements

### Planned Features

1. **Real-time Communication**

   - WebSocket integration using Socket.io
   - Live message delivery
   - Typing indicators
   - Online/offline status

2. **Media Support**

   - Image sharing
   - File attachments
   - Audio messages
   - Video messages

3. **Advanced Features**

   - Message search functionality
   - Message reactions
   - Reply to messages
   - Message forwarding
   - Group chats

4. **Authentication & Security**

   - User authentication system
   - JWT token-based security
   - Rate limiting
   - Message encryption

5. **Performance Optimizations**

   - Message virtualization for large conversations
   - Image lazy loading
   - Conversation caching
   - Database query optimizations

6. **User Experience**
   - Push notifications
   - Dark/light theme toggle
   - Custom emoji support
   - Voice notes
   - Status/Story feature

## 🐛 Common Issues & Solutions

### Frontend Issues

#### 1. Hydration Errors

**Problem**: Next.js hydration mismatch
**Solution**: Use `suppressHydrationWarning` for theme-dependent components

#### 2. Mobile Layout Issues

**Problem**: Layout breaks on mobile devices
**Solution**: Use the `useIsMobile` hook and conditional rendering

#### 3. State Synchronization

**Problem**: Messages not updating in real-time
**Solution**: Check TanStack Query cache invalidation

### Backend Issues

#### 1. MongoDB Connection

**Problem**: Database connection fails
**Solution**: Verify MongoDB URI and network connectivity

#### 2. CORS Errors

**Problem**: Frontend cannot communicate with backend
**Solution**: Check CORS configuration in `app.ts`

#### 3. Invalid ObjectId

**Problem**: MongoDB ObjectId validation fails
**Solution**: Use `mongoose.Types.ObjectId.isValid()` before queries

## 📖 Code Examples

### Sending a Message (Frontend)

```typescript
const { mutate: sendMessage } = useSendMessage();

const handleSubmit = () => {
  const data = {
    from: activeUser.waId,
    to: activeChatUser.waId,
    text: message,
  };

  sendMessage(data, {
    onSuccess: () => console.log("Message sent!"),
    onError: (error) => console.error("Failed to send:", error),
  });
};
```

### Creating a New Conversation (Backend)

```typescript
// In message.controller.ts - sendMessage function
let conversation = await Conversation.findOne({
  $or: [
    {
      "participants.waId": { $all: [from, to] },
      participants: { $size: 2 },
    },
  ],
});

if (!conversation) {
  conversation = new Conversation({
    conversationId: `${from}_${to}_${Date.now()}`,
    participants: [
      { waId: from, name: senderContact.name },
      { waId: to, name: receiverContact.name },
    ],
    lastMessage: { text, timestamp: Date.now(), from, status: "sent" },
    unreadCount: 1,
  });
  await conversation.save();
}
```

### Custom Hook Usage

```typescript
// useConversations.tsx
export function useConversations() {
  const { activeUser } = useUserStore((state) => state);

  return useQuery({
    queryKey: ["conversations", activeUser.waId],
    queryFn: () => fetchAllConversations(activeUser.waId),
    enabled: !!activeUser,
    staleTime: 60 * 1000, // 1 minute cache
  });
}
```

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Commit with descriptive messages
5. Push to your fork and create a pull request

### Code Standards

- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Ensure responsive design works on all devices

### Pull Request Guidelines

- Describe the changes made
- Include screenshots for UI changes
- Test on both mobile and desktop
- Update documentation if needed

## 📄 License

This project is created for educational purposes. Please ensure you have the right to use any assets or designs that resemble existing applications.

## 📞 Support

For questions or issues:

1. Check this documentation first
2. Look through existing GitHub issues
3. Create a new issue with detailed information
4. Include error messages and steps to reproduce

---

**Built with ❤️ using Next.js, Express.js, and MongoDB**
