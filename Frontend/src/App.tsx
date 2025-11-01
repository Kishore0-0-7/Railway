import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BookingList from "./pages/WorkerList";
import BookingDetailsCompleted from "./pages/BookingDetailsCompleted";
import SubmitBooking from "./pages/SubmitBooking";
import BookingDetailsActive from "./pages/BookingDetailsActive";
import AddLogin from "./pages/AddLogin";
import ManageLogin from "./pages/ManageLogin";
import Report from "./pages/Report";
import NotFound from "./pages/NotFound";
import WorkerList from "./pages/WorkerList";
import WorkerDetails from "./pages/WorkerDetails";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/" element={<Login />} />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />

          {/* Protected Routes with Footer */}
          <Route element={<MainLayout />}>
            <Route
              path="/dashboard"
              element={<ProtectedRoute element={<Dashboard />} />}
            />
            <Route
              path="/workerlist"
              element={<ProtectedRoute element={<WorkerList />} />}
            />
            <Route
              path="/booking-details-active/:id"
              element={<ProtectedRoute element={<BookingDetailsActive />} />}
            />
            <Route
              path="/booking-details-completed/:id"
              element={<ProtectedRoute element={<BookingDetailsCompleted />} />}
            />
            <Route
              path="/worker-details/:id"
              element={<ProtectedRoute element={<WorkerDetails />} />}
            />
            <Route
              path="/submit-booking/:id"
              element={<ProtectedRoute element={<SubmitBooking />} />}
            />
            <Route
              path="/add-login"
              element={<ProtectedRoute element={<AddLogin />} />}
            />
            <Route
              path="/manage-login"
              element={<ProtectedRoute element={<ManageLogin />} />}
            />
            <Route
              path="/report"
              element={<ProtectedRoute element={<Report />} />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
