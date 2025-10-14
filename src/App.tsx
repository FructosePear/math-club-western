import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Quiz from "./pages/Quiz";
import Contests from "./pages/Contests";
import NotFound from "./pages/NotFound";
import Events from "./pages/Events";
import Contact from "./pages/Contact";
import EventReview2025 from "./pages/events/EventReview2025";
import ProblemOfTheWeek from "./pages/ProblemOfTheWeek";
import POTWArchive from "./pages/POTWArchive";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import UserDashboard from "./pages/UserDashboard";
import AdminPuzzles from "./pages/AdminPuzzles";
import AdminUsers from "./pages/AdminUsers";
import Terms from "./pages/Terms";

const App = () => {
	const [queryClient] = useState(() => new QueryClient());

	const basename = import.meta.env.BASE_URL || "/math-club-western";

	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<AuthProvider>
					<Toaster />
					<Sonner />
					<BrowserRouter basename={basename}>
						<Routes>
							<Route path="/" element={<Index />} />
							<Route path="/about" element={<About />} />
							<Route path="/quiz" element={<Quiz />} />
							<Route path="/contests" element={<Contests />} />
							<Route path="/events" element={<Events />} />
							<Route path="/events/review-2025" element={<EventReview2025 />} />
							<Route path="/problem-of-the-week" element={<ProblemOfTheWeek />} />
							<Route path="/problem-of-the-week/:id" element={<ProblemOfTheWeek />} />
							<Route path="/problem-of-the-week/archive" element={<POTWArchive />} />
							<Route path="/contact" element={<Contact />} />
							<Route path="/login" element={<Login />} />
							<Route path="/forgot-password" element={<ForgotPassword />} />
							<Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/admin/puzzles" element={<AdminPuzzles />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
						</Routes>
					</BrowserRouter>
				</AuthProvider>
			</TooltipProvider>
		</QueryClientProvider>
	);
};

export default App;
