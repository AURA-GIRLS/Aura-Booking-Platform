'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/lib/ui/button';
import { UserIcon, BrushIcon, Sparkles } from 'lucide-react';
import { useTranslate } from '@/i18n/hooks/useTranslate';

export default function RegisterOptions() {
	const router = useRouter();
	const { t } = useTranslate('auth');
	
	return (
		<div className="relative w-full max-w-md bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="relative inline-block">
						<div className="w-16 h-16 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
							<div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
								<Sparkles className="w-6 h-6 text-white" />
							</div>
						</div>
						<div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-400 rounded-full animate-ping"></div>
					</div>
					<h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
						{t('registerOptions.title')}
					</h1>
					<p className="text-gray-600 text-sm">
						{t('registerOptions.subtitle')}
					</p>
				</div>

				{/* Options */}
				<div className="space-y-4">
					<Button
						onClick={() => router.push('/auth/register/customer' as any)}
						className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg group"
						variant="default"
					>
						<div className="flex items-center justify-center gap-3">
							<div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
								<UserIcon className="w-5 h-5 text-white" />
							</div>
							<span className="text-lg">{t('registerOptions.joinAsCustomer')}</span>
						</div>
					</Button>

					<Button
						onClick={() => router.push('/auth/register/mua' as any)}
						className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg group"
						variant="default"
					>
						<div className="flex items-center justify-center gap-3">
							<div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
								<BrushIcon className="w-5 h-5 text-white" />
							</div>
							<span className="text-lg">{t('registerOptions.joinAsArtist')}</span>
						</div>
					</Button>
				</div>

				{/* Footer */}
				<div className="text-center mt-6">
					<p className="text-sm text-gray-600">
						{t('registerOptions.alreadyHaveAccount')}{' '}
						<a 
							href="/auth/login" 
							className="text-rose-600 hover:text-rose-700 font-medium hover:underline transition-colors"
						>
							{t('registerOptions.signIn')}
						</a>
					</p>
				</div>
			</div>
	);
}
