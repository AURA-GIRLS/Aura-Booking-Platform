"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from '@/services/auth';
import { MailCheck, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useTranslate } from '@/i18n/hooks/useTranslate';

const VerifyEmail: React.FC = () => {
	const { t, locale } = useTranslate('auth');
	const searchParams = useSearchParams();
	const router = useRouter();
	const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>("idle");
	const [message, setMessage] = useState("");
	const [countdown, setCountdown] = useState(5);

	useEffect(() => {
		const token = searchParams.get("token");
		if (!token) {
			setStatus("error");
			setMessage(t('verifyEmail.invalidToken'));
			return;
		}
		setStatus("loading");
		authService.verifyEmail({ token })
			.then(res => {
				if (res.success) {
					setStatus("success");
					setMessage(t('verifyEmail.verificationSuccess'));
				} else {
					setStatus("error");
					setMessage(res.message || t('verifyEmail.verificationFailed'));
				}
			})
			.catch(err => {
				setStatus("error");
				setMessage(err.message || t('verifyEmail.verificationFailed'));
			});
	}, [searchParams, t]);

	useEffect(() => {
		if (status === 'success' && countdown > 0) {
			const timer = setTimeout(() => {
				setCountdown(countdown - 1);
			}, 1000);
			return () => clearTimeout(timer);
		} else if (status === 'success' && countdown === 0) {
			router.push('/auth/login');
		}
	}, [status, countdown, router]);

	const getStatusIcon = () => {
		switch (status) {
			case 'loading':
				return <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />;
			case 'success':
				return <CheckCircle className="w-8 h-8 text-green-500" />;
			case 'error':
				return <XCircle className="w-8 h-8 text-red-500" />;
			default:
				return <MailCheck className="w-8 h-8 text-gray-500" />;
		}
	};

	const getStatusColor = () => {
		switch (status) {
			case 'loading':
				return 'from-blue-500 to-blue-600';
			case 'success':
				return 'from-green-500 to-green-600';
			case 'error':
				return 'from-red-500 to-red-600';
			default:
				return 'from-rose-500 to-pink-600';
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-transparent relative overflow-hidden">

			<div className="relative w-full max-w-md bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="relative inline-block mb-6">
						<div className={`w-16 h-16 bg-gradient-to-r ${getStatusColor()} rounded-full flex items-center justify-center mx-auto shadow-lg`}>
							<div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
								{getStatusIcon()}
							</div>
						</div>
						{status === 'loading' && (
							<div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
						)}
					</div>
					<h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
						{t('verifyEmail.title')}
					</h1>
				</div>

				{/* Status Message */}
				<div className="text-center">
					{status === 'loading' && (
						<div className="space-y-4">
							<div className="flex items-center justify-center gap-2">
								<Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
								<p className="text-gray-700 font-medium">{t('verifyEmail.verifying')}</p>
							</div>
							<p className="text-gray-600 text-sm">{t('verifyEmail.pleaseWait')}</p>
						</div>
					)}

					{status === 'success' && (
						<div className="space-y-4">
							<div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl">
								<p className="font-medium">✅ {message}</p>
							</div>
							<div className="text-center">
								<p className="text-gray-600 text-sm">
									{t('verifyEmail.redirectingIn')}{' '}
									<span className="font-bold text-green-600 text-lg">{countdown}</span>{' '}
									{t('verifyEmail.seconds')}
								</p>
								<div className="w-full bg-gray-200 rounded-full h-2 mt-3">
									<div 
										className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000"
										style={{ width: `${((5 - countdown) / 5) * 100}%` }}
									></div>
								</div>
							</div>
						</div>
					)}

					{status === 'error' && (
						<div className="space-y-4">
							<div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl">
								<p className="font-medium">❌ {message}</p>
							</div>
							<div className="space-y-2">
								<a 
									href="/auth/resend-verification" 
									className="inline-block bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
								>
									{t('verifyEmail.resendVerification')}
								</a>
								<p className="text-sm text-gray-600">
									or{' '}
									<a href="/auth/login" className="text-rose-600 hover:text-rose-700 font-medium hover:underline">
										{t('verifyEmail.goToLogin')}
									</a>
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default VerifyEmail;
