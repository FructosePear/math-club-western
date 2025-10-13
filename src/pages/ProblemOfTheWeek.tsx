import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import { useEffect, useMemo, useState } from "react";
import { fetchPuzzles, withBase, apiUrl, Puzzle } from "@/lib/utils";
import { useParams, Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { potwService } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import Leaderboard from '@/components/Leaderboard';

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
	const [puzzles, setPuzzles] = useState<Puzzle[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeSection, setActiveSection] = useState("homebase");

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				setPuzzles(await fetchPuzzles());
			} catch (e: unknown) {
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
							<h1 className="text-3xl font-bold text-gray-900">{puzzle.title}</h1>
							<p className="mt-1 text-sm text-gray-500">
								Problem of the Week • {new Date(puzzle.date).toLocaleDateString()}
								{puzzle.difficulty ? ` • ${getStars(puzzle.difficulty)}` : ""}
							</p>

							<div className="mt-4 flex gap-3">
								<Link
									to="/problem-of-the-week/archive"
									className="inline-flex items-center rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
								>
									See Archives
								</Link>

								{puzzle?.id !== potwID && (
									<Link
										to="/problem-of-the-week"
										className="inline-flex items-center rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
									>
										Current POTW
									</Link>
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

						<SubmissionForm puzzleId={puzzle.id} puzzleName={puzzle.title} />
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

function SubmissionForm({ puzzleId, puzzleName }: { puzzleId: string; puzzleName: string }) {
	const { currentUser } = useAuth();
	const [answer, setAnswer] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
	>("idle");
	const [error, setError] = useState<string | null>(null);

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

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (submitted || !currentUser) return;

		if (!answer.trim()) {
			setError("Please provide your answer!");
			return;
		}

		try {
			setStatus("submitting");
			setError(null);

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

	return (
		<div className="rounded-xl border p-4">
			<h2 className="mb-3 text-lg font-semibold">Submit your answer</h2>

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
			) : (
				<div>
					<div className="mb-4 p-3 bg-blue-50 rounded-lg">
						<p className="text-sm text-blue-800">
							<strong>Logged in as:</strong> {currentUser.displayName || currentUser.email}
						</p>
					</div>
					
					<form onSubmit={onSubmit} className="space-y-3">
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
