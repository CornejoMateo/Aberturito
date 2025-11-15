# Aberturito

A modern web application built with Next.js, featuring a responsive UI and robust backend integration.

## 🚀 Features

- **Modern UI**: Built with Radix UI primitives for accessible, customizable components
- **Full-Stack**: Utilizes Next.js for server-side rendering and API routes
- **Authentication**: Secure user authentication with Supabase
- **Media Management**: Cloudinary integration for efficient image handling
- **Type Safety**: Written in TypeScript for better developer experience
- **Responsive Design**: Works seamlessly across all device sizes

## 🛠️ Tech Stack

- **Frontend**: Next.js 13+ (App Router)
- **Styling**: Tailwind CSS with CSS Modules
- **UI Components**: Radix UI Primitives
- **Backend**: Supabase (Auth, Database, Storage) Firebase (Auth, Database, Storage)
- **Media**: Cloudinary
- **Form Handling**: React Hook Form with Zod validation
- **Testing**: Jest and React Testing Library
- **Linting & Formatting**: ESLint, Prettier

## 📦 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Firebase account and project
- Cloudinary account (for media handling)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ar-aberturas.git
   cd ar-aberturas/ar-aberturas
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🧪 Testing

Run the test suite with:
```bash
npm test
# or
yarn test

# For test coverage
npm run test:coverage
```

## 🏗️ Building for Production

```bash
npm run build
# or
yarn build

# Start production server
npm start
# or
yarn start
```

## 📂 Project Structure

```
ar-aberturas/
├── app/                # App router pages and layouts
├── components/         # Reusable UI components
├── constants/          # Application constants
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── public/             # Static assets
├── scripts/            # Build and utility scripts
├── styles/             # Global styles and CSS modules
└── utils/              # Utility functions and helpers
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by DLAY
