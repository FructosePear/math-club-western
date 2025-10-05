import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import { useEffect, useMemo, useState } from "react";
import { fetchPuzzles, withBase, apiUrl, Puzzle } from "@/lib/utils";
import { useParams, Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

	if (loading) return <div className="p-6">Loading…</div>;
	if (error) return <div className="p-6 text-red-600">{error}</div>;
	if (!puzzle)
		return <div className="p-6">No puzzle yet. Check back soon!</div>;

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
			<Header />
			<PageHeader
				title="Problem Of The Week"
				subtitle="Challenge the current problem, and receive recognition! Take part in these problems consistently to redeem prizes."
				backgroundImage="https://img.lovepik.com/bg/20240224/3D-Rendered-Technological-Dark-Toned-Tech-Waves-with-Polygons-and_3695383_wh1200.jpg"
			/>
			<section className="mx-auto max-w-6xl px-4 py-10">
				<Tabs defaultValue="homebase" className="w-full">
					<TabsList className="mb-6">
						<TabsTrigger value="homebase">POTW Homebase</TabsTrigger>
						<TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
						<TabsTrigger value="information">Information</TabsTrigger>
					</TabsList>

					<TabsContent value="homebase">
						<div className="mx-auto max-w-3xl">
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

							<SubmissionForm puzzleId={puzzle.id} />
						</div>
					</TabsContent>

					<TabsContent value="leaderboard">
						<div className="mx-auto max-w-4xl">
							<h2 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h2>
							
							<div className="grid gap-6 md:grid-cols-2 mb-8">
								<Card>
									<CardHeader>
										<CardTitle>POTW's Solved</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-4xl font-bold text-primary">0</p>
										<p className="text-sm text-muted-foreground mt-2">Total problems completed</p>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Coins</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-4xl font-bold text-primary">0</p>
										<p className="text-sm text-muted-foreground mt-2">Earned from completions</p>
									</CardContent>
								</Card>
							</div>

							<Card>
								<CardHeader>
									<CardTitle>More Data</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2 list-disc list-inside text-gray-700">
										<li>Current streak: [Placeholder]</li>
										<li>Longest streak: [Placeholder]</li>
										<li>Average difficulty: [Placeholder]</li>
										<li>First submission date: [Placeholder]</li>
										<li>Most recent submission: [Placeholder]</li>
										<li>Success rate: [Placeholder]</li>
									</ul>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="information">
						<div className="mx-auto max-w-3xl">
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
					</TabsContent>
				</Tabs>
			</section>
			<Footer />
		</div>
	);
}

function SubmissionForm({ puzzleId }: { puzzleId: string }) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [answer, setAnswer] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
	>("idle");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setSubmitted(localStorage.getItem(SUBMIT_KEY(puzzleId)) === "1");
	}, [puzzleId]);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (submitted) return;

		if (!name.trim() || !email.trim() || !answer.trim()) {
			setError("Please fill in your name, email, and answer!");
			return;
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			setError("Please enter a valid email address!");
			return;
		}

		try {
			setStatus("submitting");
			setError(null);

			await submit({ puzzleId, name, email, answer });

			localStorage.setItem(SUBMIT_KEY(puzzleId), "1");
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

			{submitted ? (
				<p className="text-green-600">
					You have already attempted this puzzle.
				</p>
			) : (
				<form onSubmit={onSubmit} className="space-y-3">
					<div className="grid gap-3 sm:grid-cols-2">
						<input
							type="text"
							placeholder="Your name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400"
						/>
						<input
							type="email"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400"
						/>
					</div>

					<textarea
						placeholder="Your solution / reasoning"
						value={answer}
						onChange={(e) => setAnswer(e.target.value)}
						className="min-h-32 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400"
					/>

					<div className="flex items-center gap-3">
						<button
							type="submit"
							disabled={status === "submitting"}
							className="rounded-md bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
						>
							{status === "submitting" ? "Submitting…" : "Submit"}
						</button>
						{error && <span className="text-sm text-red-600">{error}</span>}
						{status === "success" && (
							<span className="text-sm text-green-600">Submitted!</span>
						)}
					</div>
				</form>
			)}
			<p className="mt-2 text-xs text-gray-500">
				IMPORTANT: You can only submit an answer once!
			</p>
		</div>
	);
}

async function submit(payload: {
	puzzleId: string;
	name: string;
	email: string;
	answer: string;
}): Promise<{ ok: boolean; duplicate?: boolean }> {
	const res = await fetch(apiUrl("/api/potw/submit"), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	const ct = res.headers.get("content-type") || "";
	if (!ct.includes("application/json")) {
		const text = await res.text();
		throw new Error(`Unexpected response: ${res.status}. ${text.slice(0, 200)}`);
	}

	const data = await res.json();
	if (!res.ok && !data?.ok) throw new Error(data?.error || "Submission failed");
	return data;
}
