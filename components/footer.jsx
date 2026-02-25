import Link from 'next/link';

export function Footer() {
    return (
        <footer className="pt-16 pb-12 sm:pt-24 sm:pb-16">
            <p className="text-sm">
                <Link
                    href="https://github.com/orpaynter/CDN-OrPaynter-AI"
                    className="decoration-dashed text-primary underline-offset-8"
                >
                    OrPaynter, Inc. © 2026
                </Link>
                {' | '}
                <span className="text-neutral-400">Powered by Next.js & AI</span>
            </p>
        </footer>
    );
}
