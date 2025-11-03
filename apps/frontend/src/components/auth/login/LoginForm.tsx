'use client';

import { Button } from '@/components/lib/ui/button';
import { Input } from '@/components/lib/ui/input';
import { Label } from '@radix-ui/react-label';
import { UserIcon } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { authService } from '@/services/auth';
import { config } from '@/config/index';
import { useTranslate } from '@/i18n/hooks/useTranslate';

const LoginForm: React.FC = () => {
	const [form, setForm] = useState({
		email: '',
		password: ''
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const googleBtnRef = useRef<HTMLDivElement>(null);
	const { t } = useTranslate('auth');

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');
		try {
			const res = await authService.login(form);
			if (res.success && res.data?.token) {
				localStorage.setItem('token', res.data.token);
				localStorage.setItem('currentUser', JSON.stringify(res.data.user));
				localStorage.setItem('currentMUA', JSON.stringify(res.data.mua));

				// Dispatch custom event to notify components about user update
				window.dispatchEvent(new CustomEvent('userUpdated'));

				setSuccess(t('login.loginSuccessful'));
				// console.log('Logged in user:', res.data.user.role);
				if(res.data && res.data.user.role === 'ARTIST') {
					//need change redirect to artist dashboard
					window.location.href = `/manage-artist/${res.data.mua?._id}/dashboard`;
				}else if(res.data && res.data.user.role === 'USER'){
					window.location.href = '/';
				}else if(res.data && res.data.user.role === 'ADMIN'){
					window.location.href = '/admin/dashboard';
				}
			} else {
				setError(res.message || t('login.loginFailed'));
			}
		} catch (err: any) {
			setError(err.message || t('login.loginFailed'));
		} finally {
			setLoading(false);
		}
	};

	// Google Identity Services
	useEffect(() => {
		if (window.google && googleBtnRef.current) {
			window.google.accounts.id.initialize({
				client_id: config.googleClientId,
				callback: async (response: any) => {
					setLoading(true);
					setError('');
					try {
						// Gửi credential (JWT) về backend để xác thực
						const res = await authService.loginWithGoogle({ credential: response.credential });
						
						if (res.success && res.data?.token) {
							localStorage.setItem('token', res.data.token);
							localStorage.setItem('currentUser', JSON.stringify(res.data.user));
							
							// Only save MUA data if it exists
							if (res.data.mua) {
								localStorage.setItem('currentMUA', JSON.stringify(res.data.mua));
							} else {
								localStorage.removeItem('currentMUA');
							}
							
							// Dispatch custom event to notify components about user update
							window.dispatchEvent(new CustomEvent('userUpdated'));
							
							setSuccess(t('login.loginSuccessful'));
							
							// Small delay before redirect
							setTimeout(() => {
								if(res.data && res.data.user.role === 'ARTIST') {
									window.location.href = `/manage-artist/${res.data.mua?._id}/dashboard`;
								} else {
									window.location.href = '/';
								}
							}, 100);
						} else {
							setError(res.message || t('login.googleLoginFailed'));
						}
					} catch (err: any) {
						setError(err.message || t('login.googleLoginFailed'));
					} finally {
						setLoading(false);
					}
				},
			});
			window.google.accounts.id.renderButton(googleBtnRef.current, {
				theme: 'outline',
				size: 'large',
				width: 300,
				text: 'signin_with',
				shape: 'pill',
			});
		}
	}, [t]);

				return (
					<div className="min-h-screen bg-transparent flex items-center justify-center p-4">
						{/* Background decoration */}
						{/* <div className="absolute inset-0 overflow-hidden">
							<div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
							<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
							<div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
						</div> */}

						<form
							onSubmit={handleSubmit}
							className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 space-y-6"
						>
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

							{/* Header */}
							<div className="text-center space-y-4">
								<div className="relative">
									<div className="w-20 h-20 mx-auto bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
										<UserIcon className="w-10 h-10 text-white" />
									</div>
									{/* Pulse rings */}
									<div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-4 border-rose-300 animate-ping opacity-20"></div>
								</div>
								<div>
									<h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
										{t('login.title')}
									</h2>
									<p className="text-gray-600 text-sm mt-2">
										{t('login.subtitle')}
									</p>
								</div>
							</div>
							{/* Form Fields */}
							<div className="space-y-4">
								<div>
									<Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
										{t('login.emailLabel')}
									</Label>
									<Input
										id="email"
										type="email"
										name="email"
										value={form.email}
										onChange={handleChange}
										required
										placeholder={t('login.emailPlaceholder')}
										className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
									/>
								</div>
								<div>
									<Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
										{t('login.passwordLabel')}
									</Label>
									<Input
										id="password"
										type="password"
										name="password"
										value={form.password}
										onChange={handleChange}
										required
										placeholder={t('login.passwordPlaceholder')}
										className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
									/>
								</div>
								
								{/* Remember & Forgot */}
								<div className="flex items-center justify-between text-sm">
									<label className="flex items-center gap-2 text-gray-600">
										<input type="checkbox" className="w-4 h-4 text-rose-500 border-gray-300 rounded focus:ring-rose-500" />
										{t('login.rememberMe')}
									</label>
									<a href="/auth/forgot-password" className="text-rose-600 hover:text-rose-700 font-medium hover:underline transition-colors">
										{t('login.forgotPassword')}
									</a>
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
										{t('login.signingIn')}
									</div>
								) : (
									t('login.signInButton')
								)}
							</Button>

							{/* Divider */}
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-200"></div>
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-2 bg-white text-gray-500">{t('login.orContinueWith')}</span>
								</div>
							</div>

							{/* Google Sign In */}
							<div className="flex justify-center">
								<div ref={googleBtnRef} className="w-full flex justify-center"></div>
							</div>

							{/* Footer Links */}
							<div className="text-center space-y-2">
								<div className="text-sm text-gray-600">
									{t('login.noAccount')}{' '}
									<a href="/auth/register" className="text-rose-600 hover:text-rose-700 font-medium hover:underline transition-colors">
										{t('login.signUp')}
									</a>
								</div>
								<div className="text-sm text-gray-600">
									{t('login.haventReceivedEmail')}{' '}
									<a href="/auth/resend-verification" className="text-rose-600 hover:text-rose-700 font-medium hover:underline transition-colors">
										{t('login.resend')}
									</a>
								</div>
							</div>
						</form>
					</div>
				);
	
};

export default LoginForm;
