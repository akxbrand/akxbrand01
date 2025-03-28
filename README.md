# AKX Brand E-commerce Platform

A modern, full-stack e-commerce platform built with Next.js 15.1.7, featuring a robust admin dashboard, secure user authentication, and seamless payment integration with Razorpay.

## Features

### User Features
- Secure authentication with NextAuth.js and bcryptjs
- Product browsing and searching
- Shopping cart management with context API
- Multiple address management
- Order tracking and history
- Razorpay payment integration
- User profile management
- PDF invoice generation with jspdf

### Admin Features
- Secure admin dashboard with role-based access
- Product management (CRUD operations)
- Order management and tracking
- User management
- Bulk order handling
- Image management with Cloudinary

## Tech Stack

- **Frontend**: Next.js 15.1.7, React, TailwindCSS
- **UI Components**: Shadcn UI, HeadlessUI, Radix UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MongoDB
- **Authentication**: NextAuth.js with JWT strategy
- **Payment**: Razorpay
- **Cloud Storage**: Cloudinary
- **Form Handling**: React Hook Form
- **State Management**: Context API
- **Animation**: Framer Motion

## Getting Started

### Prerequisites

- Node.js (Latest LTS version)
- MongoDB database
- Cloudinary account
- Razorpay account

### Installation

1. Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd akxbrand01
npm install
```

2. Set up environment variables by copying `env.template` to `.env` and configure:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret

# MongoDB Configuration
DATABASE_URL=your_mongodb_url

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
NEXT_PUBLIC_CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Razorpay Configuration
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id

# Email Configuration
EMAIL_USER=your_email
CONTACT_EMAIL=your_contact_email
EMAIL_APP_PASSWORD=your_app_password
```

3. Run database migrations:
```bash
npx prisma generate
npx prisma db push
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── app/          # Next.js app directory and API routes
├── components/   # Reusable React components
├── context/      # React Context providers
├── hooks/        # Custom React hooks
├── lib/          # Utility functions and configurations
├── types/        # TypeScript type definitions
└── utils/        # Helper functions
```

## Key Features Implementation

### Authentication
- JWT-based authentication with NextAuth.js
- Role-based access control (Admin/User)
- Secure password handling with bcryptjs

### Product Management
- Comprehensive product CRUD operations
- Image upload and management with Cloudinary
- Product categorization and filtering

### Order Processing
- Cart management with Context API
- Secure checkout process
- Multiple shipping address management
- Order tracking and history
- PDF invoice generation

### Admin Dashboard
- Secure admin authentication
- Product inventory management
- Order processing and tracking
- User management
- Bulk order handling

## Development

- Uses Next.js 15.1.7 with App Router
- TailwindCSS for styling
- Prisma as ORM with MongoDB
- TypeScript for type safety
- Shadcn UI and HeadlessUI for components

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
