const footerLinks = [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Monthly draws', href: '#draws' },
    { label: 'Charity impact', href: '#charity' },
    { label: 'Contact us', href: 'mailto:hello@golfclub.com' },
]

const Footer = () => {
    return (
        <footer className="border-t border-emerald-900/10 bg-[#102f2b] text-emerald-50">
            <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-16">
                <div>
                    <a className="text-xl font-semibold tracking-tight" href="#top">
                        Fairway Circle<span className="text-lime-300">.</span>
                    </a>
                    <p className="mt-4 max-w-sm text-sm leading-6 text-emerald-100/70">
                        A better way to enjoy golf, win together, and make every round count for good.
                    </p>
                </div>

                <div>
                    <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">Explore</h2>
                    <nav aria-label="Footer navigation" className="mt-4 flex flex-col items-start gap-3 text-sm text-emerald-100/75">
                        {footerLinks.map((link) => (
                            <a className="transition-colors hover:text-white" href={link.href} key={link.label}>
                                {link.label}
                            </a>
                        ))}
                    </nav>
                </div>

                <div>
                    <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">Stay in the loop</h2>
                    <p className="mt-4 text-sm leading-6 text-emerald-100/70">
                        Get draw updates, new causes, and stories from the community.
                    </p>
                    <a
                        className="mt-5 inline-flex rounded-full bg-lime-300 px-5 py-2.5 text-sm font-semibold text-[#102f2b] transition-colors hover:bg-lime-200"
                        href="mailto:hello@golfclub.com?subject=Join%20Fairway%20Circle"
                    >
                        Join the circle
                    </a>
                </div>
            </div>

            <div className="border-t border-emerald-50/10">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-xs text-emerald-100/50 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
                    <p>© {new Date().getFullYear()} Fairway Circle. Play well. Give well.</p>
                    <div className="flex gap-5">
                        <a className="hover:text-emerald-50" href="#privacy">Privacy</a>
                        <a className="hover:text-emerald-50" href="#terms">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
