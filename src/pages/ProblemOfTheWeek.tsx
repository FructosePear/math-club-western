import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import { useEffect, useMemo, useState } from "react";
import { withBase } from "@/lib/utils";
import { useParams, Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { potwService, puzzleService, Puzzle as FirestorePuzzle } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import Leaderboard from '@/components/Leaderboard';
import CountdownTimer from '@/components/CountdownTimer';
import { ChevronDown, ChevronUp } from "lucide-react";

const SUBMIT_KEY = (id: string) => `potw:submitted:${id}`;

function getErrorMessage(e: unknown): string {
	if (e instanceof Error) return e.message;
	if (typeof e === "string") return e;
	try {
		return JSON.stringify(e);
	} catch {
		return "Unknown error";
	}
}

function getStars(n: number): string {
	let string = "";
	for (let i = 0; i < n; i++) {
		string += "★";
	}
	for (let i = 0; i < 5 - n; i++) {
		string += "☆";
	}
	return string;
}

export default function ProblemOfTheWeek() {
	const { id } = useParams<{ id?: string }>();
	const { currentUser } = useAuth();
	const [puzzles, setPuzzles] = useState<FirestorePuzzle[] | null>(null);
	const [allPuzzles, setAllPuzzles] = useState<FirestorePuzzle[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeSection, setActiveSection] = useState("homebase");
	const [expandedPuzzleId, setExpandedPuzzleId] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				// Get active puzzle
				const activePuzzle = await puzzleService.getCurrentActivePuzzle();
				
				// Get all puzzles for archive
				const all = await puzzleService.getPuzzles();
				setAllPuzzles(all);

				if (activePuzzle) {
					setPuzzles([activePuzzle]);
				} else {
					setPuzzles([]);
				}
			} catch (e: unknown) {
				console.error('Error loading puzzles:', e);
				setError(getErrorMessage(e));
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const potwID = puzzles?.[0]?.id;

	const puzzle = useMemo(() => {
		if (!puzzles) return null;
		if (id) return puzzles.find((p) => p.id === id) ?? null;
		return puzzles[0] ?? null;
	}, [puzzles, id]);

	const renderContent = () => {
		if (loading) return <div className="p-6">Loading…</div>;
		if (error) return <div className="p-6 text-red-600">{error}</div>;
		if (!puzzle) return <div className="p-6">No puzzle yet. Check back soon!</div>;

		switch (activeSection) {
			case "homebase":
				return (
					<div className="space-y-6">
						<header className="mb-6">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<h1 className="text-3xl font-bold text-gray-900">{puzzle.title}</h1>
									<p className="mt-1 text-sm text-gray-500">
										Problem of the Week • {puzzle.createdAt ? new Date(puzzle.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
										{puzzle.difficulty ? ` • ${getStars(puzzle.difficulty)}` : ""}
									</p>
								</div>
								
								{/* Countdown Timer */}
								{puzzle.expiresAt && (
									<div className="ml-4">
										<CountdownTimer 
											expiresAt={new Date(puzzle.expiresAt.seconds * 1000)}
											onExpired={() => {
												// Optionally refresh the page or show expired message
												console.log('Puzzle has expired!');
											}}
										/>
									</div>
								)}
							</div>
						</header>

						{puzzle.image && (
							<img
								src={withBase(puzzle.image!)}
								alt={puzzle.title}
								className="mb-6 w-full rounded-lg border object-contain"
							/>
						)}

						<p className="mb-8 whitespace-pre-wrap text-gray-800">
							{puzzle.prompt}
						</p>

						<SubmissionForm puzzleId={puzzle.id} puzzleName={puzzle.title} puzzle={puzzle} />
					</div>
				);

			case "leaderboard":
				return (
					<div className="space-y-6">
						<header className="mb-6">
							<h1 className="text-3xl font-bold text-gray-900">
								Live Leaderboard
							</h1>
							<p className="mt-1 text-sm text-gray-500">
								Real-time submissions for "{puzzle.title}"
							</p>
						</header>

						<Leaderboard puzzleId={puzzle.id} />
					</div>
				);

			case "information":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>About Problem of the Week</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4 text-gray-700">
								<p>
									The Problem of the Week (POTW) is a weekly mathematical challenge designed to test your problem-solving skills and mathematical reasoning. Each week, we present a new puzzle that ranges in difficulty from beginner to advanced levels.
								</p>
								<p>
									By participating consistently, you can earn coins and build your streak. These achievements not only showcase your dedication but can also be redeemed for exciting prizes and recognition within our community.
								</p>
								<p>
									Whether you're a seasoned mathematician or just starting your journey, POTW offers a fun and engaging way to sharpen your skills, think creatively, and connect with fellow problem solvers. Submit your solutions, track your progress, and climb the leaderboard!
								</p>
								<p className="font-semibold">
									Challenge yourself weekly and watch your mathematical prowess grow!
								</p>
							</CardContent>
						</Card>
					</div>
				);
			
			case "archive":
				return (
					<div className="space-y-4">
						<header className="mb-6">
							<h1 className="text-3xl font-bold text-gray-900">POTW Archive</h1>
							<p className="mt-1 text-sm text-gray-500">
								Browse all past Problem of the Week challenges
							</p>
						</header>

						{allPuzzles.filter(p => p.status === 'archived').length === 0 ? (
							<div className="text-center py-8 text-gray-500">
								No archived puzzles found yet.
							</div>
						) : (
							<div className="space-y-2">
								{allPuzzles.filter(p => p.status === 'archived').map((p) => (
									<Card key={p.id} className="overflow-hidden">
										<button
											onClick={() => setExpandedPuzzleId(expandedPuzzleId === p.id ? null : p.id)}
											className="w-full text-left"
										>
											<CardHeader className="pb-3">
												<div className="flex items-center justify-between">
													<div className="flex-1">
														<div className="flex items-center gap-3">
															<CardTitle className="text-lg">{p.title}</CardTitle>
														</div>
														<div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
															<span>
																{p.createdAt ? new Date(p.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
															</span>
															<span>
																{getStars(p.difficulty)}
															</span>
														</div>
													</div>
													{expandedPuzzleId === p.id ? (
														<ChevronUp className="h-5 w-5 text-gray-500" />
													) : (
														<ChevronDown className="h-5 w-5 text-gray-500" />
													)}
												</div>
											</CardHeader>
										</button>
										
										{expandedPuzzleId === p.id && (
											<CardContent className="pt-0 border-t">
												<div className="space-y-4 mt-4">
													{p.image && (
														<img
															src={p.image.startsWith('http') ? p.image : withBase(p.image)}
															alt={p.title}
															className="w-full rounded-lg border object-contain max-h-96"
														/>
													)}
													<div>
														<h4 className="font-semibold text-gray-900 mb-2">Problem Statement:</h4>
														<p className="whitespace-pre-wrap text-gray-700">{p.prompt}</p>
													</div>
													{p.solution && (
														<div>
															<h4 className="font-semibold text-gray-900 mb-2">Solution:</h4>
															<p className="whitespace-pre-wrap text-gray-700">{p.solution}</p>
														</div>
													)}
													{p.correctAnswer && (
														<div>
															<h4 className="font-semibold text-gray-900 mb-2">Correct Answer:</h4>
															<p className="text-gray-700">{p.correctAnswer}</p>
														</div>
													)}
												</div>
											</CardContent>
										)}
									</Card>
								))}
							</div>
						)}
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
			<Header />
			<PageHeader
				title="Problem Of The Week"
				subtitle="Challenge the current problem, and receive recognition! Take part in these problems consistently to redeem prizes."
				backgroundImage="https://img.lovepik.com/bg/20240224/3D-Rendered-Technological-Dark-Toned-Tech-Waves-with-Polygons-and_3695383_wh1200.jpg"
			/>

			<div className="py-8">
				<div className="container mx-auto px-4">
					<div className="flex flex-col gap-8 lg:flex-row">
						{/* Sidebar */}
						<div className="lg:w-1/4">
							<div className="sticky top-8 rounded-lg bg-white p-6 shadow-md">
								<h3 className="mb-4 text-lg font-semibold text-gray-800">
									POTW Sections
								</h3>
								<div className="space-y-2">
									<Button
										variant={activeSection === "homebase" ? "default" : "ghost"}
										className="w-full justify-start"
										onClick={() => setActiveSection("homebase")}
									>
										POTW Homebase
									</Button>
									<Button
										variant={activeSection === "leaderboard" ? "default" : "ghost"}
										className="w-full justify-start"
										onClick={() => setActiveSection("leaderboard")}
									>
										Leaderboard
									</Button>
									<Button
										variant={activeSection === "information" ? "default" : "ghost"}
										className="w-full justify-start"
										onClick={() => setActiveSection("information")}
									>
										Information
									</Button>
									<Button
										variant={activeSection === "archive" ? "default" : "ghost"}
										className="w-full justify-start"
										onClick={() => setActiveSection("archive")}
									>
										POTW Archive
									</Button>
								</div>
							</div>
						</div>

						{/* Main Content */}
						<div className="lg:w-3/4">
							<div className="rounded-lg bg-white p-8 shadow-md">
								{renderContent()}
							</div>
						</div>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}

function SubmissionForm({ puzzleId, puzzleName, puzzle }: { puzzleId: string; puzzleName: string; puzzle: FirestorePuzzle }) {
	const { currentUser } = useAuth();
	const [answer, setAnswer] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
	>("idle");
	const [error, setError] = useState<string | null>(null);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);

	useEffect(() => {
		// Check if user already submitted this puzzle
		const checkSubmission = async () => {
			if (currentUser) {
				try {
					const existingSubmission = await potwService.getUserSubmission(puzzleId, currentUser.uid);
					setSubmitted(!!existingSubmission);
				} catch (error) {
					console.error('Error checking submission:', error);
				}
			}
		};
		checkSubmission();
	}, [puzzleId, currentUser]);

	const handleSubmitClick = (e: React.FormEvent) => {
		e.preventDefault();
		if (submitted || !currentUser) return;

		// Check if puzzle has expired
		if (puzzle.expiresAt && new Date() > new Date(puzzle.expiresAt.seconds * 1000)) {
			setError("This puzzle has expired! Submissions are no longer accepted.");
			return;
		}

		if (!answer.trim()) {
			setError("Please provide your answer!");
			return;
		}

		// Show confirmation dialog
		setShowConfirmDialog(true);
	};

	const confirmSubmit = async () => {
		if (!currentUser) return;

		try {
			setStatus("submitting");
			setError(null);
			setShowConfirmDialog(false);

			await submit({ 
				puzzleId, 
				puzzleName,
				name: currentUser.displayName || "Anonymous", 
				email: currentUser.email || "", 
				answer 
			}, currentUser.uid);

			setSubmitted(true);
			setStatus("success");
		} catch (e: unknown) {
			setStatus("error");
			setError(getErrorMessage(e));
		}
	};

	const cancelSubmit = () => {
		setShowConfirmDialog(false);
	};

	return (
		<div className="rounded-xl border p-4">

			{!currentUser ? (
				<div className="text-center py-8">
					<p className="text-gray-600 mb-4">Please log in to submit your answer.</p>
					<Link 
						to="/login" 
						className="inline-flex items-center rounded-md bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-700"
					>
						Login to Submit
					</Link>
				</div>
			) : submitted ? (
				<div className="text-center py-4">
					<p className="text-green-600 font-medium">
						✅ You have already submitted your answer for this puzzle!
					</p>
					<p className="text-sm text-gray-600 mt-2">
						Thank you for participating in the Problem of the Week!
					</p>
				</div>
			) : puzzle.expiresAt && new Date() > new Date(puzzle.expiresAt.seconds * 1000) ? (
				<div className="text-center py-4">
					<p className="text-red-600 font-medium">
						⏰ This puzzle has expired!
					</p>
					<p className="text-sm text-gray-600 mt-2">
						Submissions are no longer accepted for this puzzle.
					</p>
				</div>
			) : (
				<div>
					<form onSubmit={handleSubmitClick} className="space-y-3">
						<textarea
							placeholder="Your solution / reasoning"
							value={answer}
							onChange={(e) => setAnswer(e.target.value)}
							className="min-h-32 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400"
							required
						/>

						<div className="flex items-center gap-3">
							<button
								type="submit"
								disabled={status === "submitting"}
								className="rounded-md bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
							>
								{status === "submitting" ? "Submitting…" : "Submit Answer"}
							</button>
							{error && <span className="text-sm text-red-600">{error}</span>}
							{status === "success" && (
								<span className="text-sm text-green-600">✅ Submitted successfully!</span>
							)}
						</div>
					</form>
				</div>
			)}
			<p className="mt-2 text-xs text-gray-500">
				IMPORTANT: You can only submit an answer once!
			</p>

			{/* Submit Confirmation Dialog */}
			<AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm Submission</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to submit your answer for this puzzle?
							<br /><br />
							<strong>Important:</strong> You can only submit once per puzzle. Make sure your answer is complete and correct before proceeding.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={cancelSubmit}>Cancel</AlertDialogCancel>
						<AlertDialogAction 
							onClick={confirmSubmit}
							className="bg-teal-600 hover:bg-teal-700"
						>
							Submit Answer
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

async function submit(payload: {
	puzzleId: string;
	puzzleName: string;
	name: string;
	email: string;
	answer: string;
}, userId: string): Promise<{ ok: boolean; duplicate?: boolean }> {
	try {
		// Check if user already submitted
		const existingSubmission = await potwService.getUserSubmission(payload.puzzleId, userId);
		if (existingSubmission) {
			return { ok: true, duplicate: true };
		}

		// Submit to Firestore
		await potwService.submitAnswer({
			puzzleId: payload.puzzleId,
			puzzleName: payload.puzzleName,
			userId: userId,
			userName: payload.name,
			userEmail: payload.email,
			answer: payload.answer,
		});

		return { ok: true };
	} catch (error) {
		console.error('Submission error:', error);
		throw new Error('Submission failed');
	}
}
