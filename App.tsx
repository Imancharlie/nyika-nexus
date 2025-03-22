import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a placeholder for screens until we implement them
const PlaceholderScreen = ({ name }: { name: string }) => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="text-center">
      <h1 className="text-2xl font-semibold">
        {name} Screen (To be implemented)
      </h1>
    </div>
  </div>
);

// We'll populate these with actual screens later
const Dashboard = () => <PlaceholderScreen name="Dashboard" />;
const Auth = () => <PlaceholderScreen name="Auth" />;
const Community = () => <PlaceholderScreen name="Community" />;
const Services = () => <PlaceholderScreen name="Services" />;
const Profile = () => <PlaceholderScreen name="Profile" />;
const NotFound = () => <PlaceholderScreen name="NotFound" />;

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/community" element={<Community />} />
          <Route path="/services" element={<Services />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
