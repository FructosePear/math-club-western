import { useAuth } from '@/contexts/AuthContext';

const Footer = () => {
	const { currentUser } = useAuth();
	return (
		<footer className="bg-white">
			<div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
				<div className="lg:flex lg:items-start lg:gap-8">
  
					{!currentUser && (
						<div className="mt-8 grid grid-cols-2 gap-8 lg:mt-0 lg:grid-cols-5 lg:gap-y-16">
						<div className="col-span-2">
							<div>
								<h2 className="text-2xl font-bold text-gray-900">Want to sign up for our events?</h2>
  
								<p className="mt-4 text-gray-500">
									Join our mailing list, where you can receive periodic updates, news, and opportunities to be
									ever more involved with math!
								</p>
							</div>
						</div>
  
						<div className="col-span-2 lg:col-span-3 lg:flex lg:items-end">
							<form className="w-full">
								<label htmlFor="UserEmail" className="sr-only"> Email </label>
  
								<div className="focus-within:ring-3 border border-gray-100 p-2 sm:flex sm:items-center sm:gap-4">
									<input
										type="email"
										id="UserEmail"
										placeholder="ilovemath@example.com"
										className="w-full rounded-md border-none px-3 py-2 text-sm outline-none focus:ring-0"
									/>
  
									<button
										className="mt-1 w-full bg-teal-500 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-none hover:bg-teal-600 sm:mt-0 sm:w-auto sm:shrink-0"
									>
										Sign Up
									</button>
								</div>
							</form>
						</div>
  
						{/* Full-width container for the link groups */}
						<div className="col-span-2 lg:col-span-5">
							<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
								{/* Services */}
								<div>
									<p className="font-medium text-gray-900">Services</p>
									<ul className="mt-6 space-y-4 text-sm">
										<li>
											<a href="#" className="block w-full text-gray-700 transition hover:opacity-75">
												Placeholder
											</a>
										</li>
									</ul>
								</div>

								{/* About Us */}
								<div>
									<p className="font-medium text-gray-900">About Us</p>
									<ul className="mt-6 space-y-4 text-sm">
										<li>
											<a href="/about" className="block w-full text-gray-700 transition hover:opacity-75">
												Our Team
											</a>
										</li>
									</ul>
								</div>

								{/* Helpful Links */}
								<div>
									<p className="font-medium text-gray-900">Helpful Links</p>
									<ul className="mt-6 space-y-4 text-sm">
										<li>
											<a href="/contact" className="block w-full text-gray-700 transition hover:opacity-75">
												Contact
											</a>
										</li>
										<li>
											<a href="#" className="block w-full text-gray-700 transition hover:opacity-75">
												FAQs
											</a>
										</li>
									</ul>
								</div>
							</div>
						</div>
  
						<ul className="col-span-2 flex justify-start gap-6 lg:col-span-5 lg:justify-end">
							{/* Youtube */}
							<li>
								<a
									href="#"
									rel="noreferrer"
									target="_blank"
									className="text-gray-700 transition hover:opacity-75"
								>
									<span className="sr-only">Youtube</span>
  
									<svg
										className="block h-6 w-6"
										fill="currentColor"
										viewBox="0 0 32 32"
										xmlns="http://www.w3.org/2000/svg"
										aria-hidden="true"
									>
										<path d="M29.41,9.26a3.5,3.5,0,0,0-2.47-2.47C24.76,6.2,16,6.2,16,6.2s-8.76,0-10.94.59A3.5,3.5,0,0,0,2.59,9.26,36.13,36.13,0,0,0,2,16a36.13,36.13,0,0,0,.59,6.74,3.5,3.5,0,0,0,2.47,2.47C7.24,25.8,16,25.8,16,25.8s8.76,0,10.94-.59a3.5,3.5,0,0,0,2.47-2.47A36.13,36.13,0,0,0,30,16,36.13,36.13,0,0,0,29.41,9.26ZM13.2,20.2V11.8L20.47,16Z" />
									</svg>
								</a>
							</li>
  
							{/* Instagram */}
							<li>
								<a
									href="https://www.instagram.com/students_unified_math/"
									rel="noreferrer"
									target="_blank"
									className="text-gray-700 transition hover:opacity-75"
								>
									<span className="sr-only">Instagram</span>
  
									<svg className="size-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
										<path
											fillRule="evenodd"
											d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
											clipRule="evenodd"
										/>
									</svg>
								</a>
							</li>

							{/* Discord */}
							<li>
								<a
									href="https://discord.gg/HCg9pX2ZJx"
									rel="noreferrer"
									target="_blank"
									className="text-gray-700 transition hover:opacity-75"
								>
									<span className="sr-only">Instagram</span>
  
									<svg className="block h-6 w-6" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
										<path
											d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"
										/>
									</svg>
								</a>
							</li>
						</ul>
					</div>)}
				</div>
  
				<div className="mt-8 border-t border-gray-100 pt-8">
					<div className="sm:flex sm:justify-between">
						<p className="text-xs text-gray-500">&copy; 2025. Students United by Mathematics. All rights reserved.</p>
  
						<ul className="mt-8 flex flex-wrap justify-start gap-4 text-xs sm:mt-0 lg:justify-end">
							<li>
								<a href="#" className="text-gray-500 transition hover:opacity-75"> Terms &amp; Conditions </a>
							</li>
  
							<li>
								<a href="#" className="text-gray-500 transition hover:opacity-75"> Privacy Policy </a>
							</li>
  
							<li>
								<a href="#" className="text-gray-500 transition hover:opacity-75"> Cookies </a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</footer>
	);
};
  
export default Footer;