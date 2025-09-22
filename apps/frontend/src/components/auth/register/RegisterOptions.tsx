'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/lib/ui/button';
import { UserIcon, BrushIcon, Sparkles } from 'lucide-react';

export default function RegisterOptions() {
	const router = useRouter();
					return (
						<div className="flex flex-col items-center justify-center gap-8 py-16 px-8 bg-white/90 rounded-[2.5rem] shadow-2xl border-4 border-pink-200/60 max-w-lg w-full animate-fade-in">
							<div className="flex items-center gap-2 mb-2">
								<Sparkles className="w-7 h-7 text-pink-400 animate-bounce" />
								<h2 className="text-3xl font-extrabold text-pink-500 tracking-tight drop-shadow-pink">Welcome to Aura!</h2>
							</div>
							<p className="text-pink-600 text-lg mb-4 text-center font-medium">Choose your role to start your beauty journey</p>
							<Button
								className="w-72 py-7 text-xl rounded-2xl shadow-lg bg-gradient-to-r from-pink-100 via-pink-200 to-pink-100 hover:from-pink-200 hover:to-pink-300 text-pink-700 font-bold mb-4 flex items-center gap-4 justify-center border-2 border-pink-300 hover:scale-105 transition-transform duration-200"
								onClick={() => router.push('/auth/register/customer' as any)}
								variant="outline"
							>
								<UserIcon className="w-7 h-7 text-pink-400 drop-shadow" />
								<span>Customer</span>
							</Button>
							<Button
								className="w-72 py-7 text-xl rounded-2xl shadow-lg bg-gradient-to-r from-pink-100 via-pink-200 to-pink-100 hover:from-pink-200 hover:to-pink-300 text-pink-700 font-bold flex items-center gap-4 justify-center border-2 border-pink-300 hover:scale-105 transition-transform duration-200"
								onClick={() => router.push('/auth/register/mua' as any)}
								variant="outline"
							>
								<BrushIcon className="w-7 h-7 text-pink-400 drop-shadow" />
								<span>Makeup Artist</span>
							</Button>
						</div>
					);
}
