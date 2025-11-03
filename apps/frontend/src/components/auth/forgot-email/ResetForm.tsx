'use client';
import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import ErrorMessage from '@/components/generalUI/ErrorMessage';
import { Input } from '@/components/lib/ui/input';
import { Button } from '@/components/lib/ui/button';
import { Label } from '@radix-ui/react-label';
import { LockIcon } from 'lucide-react';
import { useTranslate } from '@/i18n/hooks/useTranslate';

const ResetForm: React.FC = () => {
	const { t, locale } = useTranslate('auth');
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const searchParams = useSearchParams();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (password.length < 6) {
			setError(t('resetPassword.passwordMinLength'));
			return;
		}
		if (password !== confirm) {
			setError(t('resetPassword.passwordsNotMatch'));
			return;
		}
		setError('');
		setLoading(true);
		const token = searchParams.get('token');
		if (!token) {
			setError(t('resetPassword.missingToken'));
			setLoading(false);
			return;
		}
		try {
			const res = await authService.resetPassword({ token, newPassword: password });
			if (res.success) {
				setSuccess(true);
				setTimeout(() => router.push('/auth/login'), 2000);
			} else {
				setError(res.message || t('resetPassword.resetFailed'));
			}
		} catch (err: any) {
			setError(err.message || t('resetPassword.resetFailed'));
		} finally {
			setLoading(false);
		}
	};

		return (
			<div className="min-h-screen bg-transparent flex items-center justify-center p-4">

				<form
					onSubmit={handleSubmit}
					className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 space-y-6"
				>
					{/* Header */}
					<div className="text-center space-y-4">
						<div className="relative">
							<div className="w-20 h-20 mx-auto bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
								<LockIcon className="w-10 h-10 text-white" />
							</div>
							{/* Pulse rings */}
							<div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-4 border-rose-300 animate-ping opacity-20"></div>
						</div>
						<div>
							<h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
								{t('resetPassword.title')}
							</h2>
							<p className="text-gray-600 text-sm mt-2">
								{t('resetPassword.subtitle')}
							</p>
						</div>
					</div>
					{/* Status Messages */}
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm text-center">
							{error}
						</div>
					)}
					{success && (
						<div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm text-center">
							{t('resetPassword.resetSuccess')}
						</div>
					)}

					{/* Form Fields */}
					<div className="space-y-4">
						<div>
							<Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
								{t('resetPassword.newPasswordLabel')}
							</Label>
							<Input
								id="password"
								type="password"
								name="password"
								value={password}
								onChange={e => setPassword(e.target.value)}
								required
								placeholder={t('resetPassword.newPasswordPlaceholder')}
								className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
							/>
						</div>
						<div>
							<Label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-2">
								{t('resetPassword.confirmPasswordLabel')}
							</Label>
							<Input
								id="confirm"
								type="password"
								name="confirm"
								value={confirm}
								onChange={e => setConfirm(e.target.value)}
								required
								placeholder={t('resetPassword.confirmPasswordPlaceholder')}
								className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
							/>
						</div>
					</div>

					{/* Submit Button */}
					<Button
						type="submit"
						className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
						disabled={loading}
					>
						{loading ? (
							<div className="flex items-center justify-center gap-2">
								<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
								{t('resetPassword.resetting')}
							</div>
						) : (
							t('resetPassword.resetPasswordButton')
						)}
					</Button>

					{/* Footer Link */}
					<div className="text-center">
						<div className="text-sm text-gray-600">
							{t('resetPassword.rememberPassword')}{' '}
							<a href="/auth/login" className="text-rose-600 hover:text-rose-700 font-medium hover:underline transition-colors">
								{t('resetPassword.signIn')}
							</a>
						</div>
					</div>
				</form>
			</div>
		);
};

export default ResetForm;
