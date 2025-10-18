import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import recentEventsData from "@/data/recentEvents.json";
import "../RecentEvents.css";
import { calculateDaysUntil, formatDaysUntil } from "@/utils/dateUtils";

const RecentEvents = () => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), 300);
		return () => clearTimeout(timer);
	}, []);

	const looped = [...recentEventsData, ...recentEventsData];

	return (
		<section className="relative bg-white py-16">
			<div
				className={`container relative mx-auto px-4 transition-all duration-1000 ${
					isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
				}`}
			>
				<div className="mb-12 text-center">
					<h2 className="mb-4 text-4xl font-bold text-gray-800">Recent Events</h2>
					<p className="mx-auto max-w-2xl text-lg text-gray-600">
						Stay updated with our latest activities and upcoming events
					</p>
				</div>

				<div className="group relative rounded-xl bg-white shadow">

					<div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
					<div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />

					<div className="overflow-hidden">
						<div className="scroller-track flex gap-6 px-4 py-5 will-change-transform">
							{looped.map((event, index) => {
								const daysUntil = calculateDaysUntil(event.date);
								return (
									<Card key={`${event.title}-${index}`} className="min-w-[380px] max-w-[380px] shrink-0 transition-shadow duration-300 hover:shadow-lg">
										<CardHeader>
											<div className="mb-2 flex items-center justify-between">
												<span
													className={`rounded px-2 py-1 text-sm ${
														event.status === "Upcoming"
															? "bg-green-100 text-green-600"
															: "bg-blue-100 text-blue-600"
													}`}
												>
													{event.status}
												</span>
												<span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
													{formatDaysUntil(daysUntil)}
												</span>
											</div>
											<CardTitle className="text-xl">{event.title}</CardTitle>
											<div className="flex items-center space-x-4 text-sm text-gray-600">
												<div className="flex items-center space-x-1">
													<Calendar className="h-4 w-4" />
													<span>{event.date}</span>
												</div>
												<div className="flex items-center space-x-1">
													<MapPin className="h-4 w-4" />
													<span>{event.location}</span>
												</div>
											</div>
										</CardHeader>
										<CardContent>
											<CardDescription className="mb-4 text-gray-600">
												{event.description}
											</CardDescription>
											<Button variant="outline" size="sm">
												Learn More
											</Button>
										</CardContent>
									</Card>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default RecentEvents;