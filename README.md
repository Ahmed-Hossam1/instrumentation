# Instrumentation App

This is a **Next.js** project bootstrapped with `create-next-app`. 


The **Instrumentation App** is designed to serve as a dashboard or tracking application capable of data visualization and monitoring. By leveraging modern frontend tools and a Supabase backend, it provides a stable environment for building rich, interactive analytics, charting data (via Chart.js), and managing unified state and authentication securely. 

## 🚀 Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the project running. You can start editing the page by modifying `src/app/page.tsx` (or `app/page.tsx`). The page auto-updates as you edit the file.

## 📦 Tech Stack & Packages Used

Below is a detailed list of the packages used in this app, including what they are and what they actually do:

### Core Framework
- [**Next.js**](https://nextjs.org/) 
  - **What it is:** A React framework that gives you building blocks to create web applications.
  - **What it does:** Provides the core routing, Server-Side Rendering (SSR), and API routes for the application.
- [**React**](https://react.dev/) / [**React DOM**](https://react.dev/reference/react-dom) 
  - **What it is:** A JavaScript library for building user interfaces based on components.
  - **What it does:** Powers the foundational views, components, and hooks across the frontend.

### UI & Styling
- [**Chakra UI**](https://chakra-ui.com/) (`@chakra-ui/react`) 
  - **What it is:** A simple, modular, and accessible component library.
  - **What it does:** Provides pre-built, highly customizable styling tools and components (buttons, modals, inputs, containers) to rapidly build the UI structure without writing raw CSS for everything.
- [**Emotion**](https://emotion.sh/) (`@emotion/react`, `@emotion/styled`)
  - **What it is:** A library designed for writing CSS styles with JavaScript.
  - **What it does:** Acts as the CSS-in-JS engine required by Chakra UI under the hood to compile and apply component styles at runtime.
- [**Framer Motion**](https://www.framer.com/motion/) 
  - **What it is:** A production-ready motion library for React.
  - **What it does:** Powers the animations, page transitions, and smooth UI interactions across the app.
- [**React Icons**](https://react-icons.github.io/react-icons/) 
  - **What it is:** A customizable SVG icon library.
  - **What it does:** Provides access to thousands of popular icons (like Material, FontAwesome, etc.) that can be rendered seamlessly as React components.

### Data Visualization
- [**Chart.js**](https://www.chartjs.org/) 
  - **What it is:** A flexible JavaScript charting library.
  - **What it does:** Handles the core logic and math for rendering different canvas-based charts (bar charts, line graphs, pie charts, etc.).
- [**React Chartjs 2**](https://react-chartjs-2.js.org/) 
  - **What it is:** React wrappers for Chart.js.
  - **What it does:** Allows the seamless integration of Chart.js directly into React components, making data-binding between charts and React states very easy.

### Backend, Auth & Database
- [**Supabase JS Client**](https://supabase.com/docs/reference/javascript/introduction) (`@supabase/supabase-js`) 
  - **What it is:** An isomorphic Javascript client to interact with the Supabase backend.
  - **What it does:** Handles database queries (PostgreSQL), realtime subscriptions, and client-side authentication mechanisms.
- [**Supabase SSR**](https://supabase.com/docs/guides/auth/server-side/nextjs) (`@supabase/ssr`) 
  - **What it is:** Server-Side Rendering support packages for Supabase.
  - **What it does:** Securely manages user sessions and cookies in Next.js Server Components and Server Actions.

### Utilities
- [**React Hot Toast**](https://react-hot-toast.com/) 
  - **What it is:** A lightweight library for toast notifications.
  - **What it does:** Enables developers to quickly pop up simple, animated success/error alert messages to users interacting with the app.
- [**UUID**](https://github.com/uuidjs/uuid) 
  - **What it is:** A tiny library to generate RFC4122 UUIDs.
  - **What it does:** Responsible for generating perfectly unique random IDs for mock data, unique React keys, or database identifiers.

## ⚙️ Learn More

To learn more about Next.js, take a look at the following resources:
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## 🌍 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js. Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
