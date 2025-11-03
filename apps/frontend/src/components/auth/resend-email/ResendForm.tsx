'use client';

import React, { useState } from 'react';
import { Input } from '@/components/lib/ui/input';
import { Button } from '@/components/lib/ui/button';
import { Label } from '@radix-ui/react-label';
import { authService } from '@/services/auth';
import { MailCheck, Send } from 'lucide-react';
import { useTranslate } from '@/i18n/hooks/useTranslate';

const ResendForm: React.FC = () => {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const { t } = useTranslate('auth');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');
		try {
			const res = await authService.sendEmailVerification({ email });
			if (res.success) {
				setSuccess(t('resendVerification.verificationEmailSent'));
			} else {
				setError(res.message || t('resendVerification.failedToSendVerification'));
			}
		} catch (err: any) {
			setError(err.message || t('resendVerification.failedToSendVerification'));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative w-full max-w-md bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="relative inline-block">
						<div className="w-16 h-16 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
							<div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
								<MailCheck className="w-6 h-6 text-white" />
							</div>
						</div>
						<div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-400 rounded-full animate-ping"></div>
					</div>
					<h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
						{t('resendVerification.title')}
					</h1>
					<p className="text-gray-600 text-sm">
						{t('resendVerification.subtitle')}
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="email" className="text-sm font-medium text-gray-700">
							{t('resendVerification.emailLabel')}
						</Label>
						<Input
							id="email"
							type="email"
							name="email"
							value={email}
							onChange={e => setEmail(e.target.value)}
							required
							placeholder={t('resendVerification.emailPlaceholder')}
							className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200"
						/>
					</div>

					{/* Status Messages */}
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm text-center">
							{error}
						</div>
					)}
					{success && (
						<div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm text-center">
							{success}
						</div>
					)}

					{/* Submit Button */}
					<Button
						type="submit"
						className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
						disabled={loading}
					>
						{loading ? (
							<div className="flex items-center justify-center gap-2">
								<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
								{t('resendVerification.sending')}
							</div>
						) : (
							<div className="flex items-center justify-center gap-2">
								<Send className="w-5 h-5" />
								{t('resendVerification.resendEmailButton')}
							</div>
						)}
					</Button>

					{/* Footer Links */}
					<div className="text-center text-sm text-gray-600">
						{t('resendVerification.rememberPassword')}{' '}
						<a href="/auth/login" className="text-rose-600 hover:text-rose-700 font-medium hover:underline transition-colors">
							{t('resendVerification.signIn')}
						</a>
					</div>
				</form>
			</div>
		);
};


export default ResendForm;
