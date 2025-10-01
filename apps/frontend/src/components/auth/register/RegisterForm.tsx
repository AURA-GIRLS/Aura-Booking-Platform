'use client';
import { Button } from '@/components/lib/ui/button';
import { Input } from '@/components/lib/ui/input';
import { Label } from '@radix-ui/react-label';
import { UserIcon, Sparkles } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { authService } from '@/services/auth';
import { useRouter } from 'next/navigation';

const RegisterForm: React.FC = () => {
	const [form, setForm] = useState({
		fullName: '',
		email: '',
		password: '',
		phoneNumber: ''
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const router = useRouter();
	const googleBtnRef = useRef<HTMLDivElement>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');
		try {
			const res = await authService.register(form);
			if (res.success) {
				setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác thực.');
				router.push('/auth/login');
			} else {
				setError(res.message || 'Đăng ký thất bại');
			}
		} catch (err: any) {
			setError(err.message || 'Đăng ký thất bại');
		} finally {
			setLoading(false);
		}
	};

	// Google Identity Services
	useEffect(() => {
		if (window.google && googleBtnRef.current) {
			window.google.accounts.id.initialize({
				client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
				callback: async (response: any) => {
					setLoading(true);
					setError('');
					try {
						const res = await authService.loginWithGoogle({ credential: response.credential });
						if (res.success && res.data?.token) {
							localStorage.setItem('token', res.data.token);
							setSuccess('Login successful!');
							window.location.href = '/';
						} else {
							setError(res.message || 'Google login failed');
						}
					} catch (err: any) {
						setError(err.message || 'Google login failed');
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
	}, []);

					return (
						<div className="min-h-screen bg-transparent flex items-center justify-center p-4">

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
											Create Your Account
										</h2>
										<p className="text-gray-600 text-sm mt-2">
											Book makeup online with top artists. Fast. Easy. Beautiful.
										</p>
									</div>
								</div>
								{/* Form Fields */}
								<div className="space-y-4">
									<div>
										<Label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
											Full Name
										</Label>
										<Input
											id="fullName"
											type="text"
											name="fullName"
											value={form.fullName}
											onChange={handleChange}
											required
											placeholder="Alex Smith"
											className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
										/>
									</div>
									<div>
										<Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
											Email address
										</Label>
										<Input
											id="email"
											type="email"
											name="email"
											value={form.email}
											onChange={handleChange}
											required
											placeholder="example@gmail.com"
											className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
										/>
									</div>
									<div>
										<Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
											Password
										</Label>
										<Input
											id="password"
											type="password"
											name="password"
											value={form.password}
											onChange={handleChange}
											required
											placeholder="Enter your password"
											className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
										/>
									</div>
									<div>
										<Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
											Phone Number (Optional)
										</Label>
										<Input
											id="phoneNumber"
											type="tel"
											name="phoneNumber"
											value={form.phoneNumber}
											onChange={handleChange}
											placeholder="Phone number"
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
											Registering...
										</div>
									) : (
										'Create Account'
									)}
								</Button>

								{/* Divider */}
								<div className="relative">
									<div className="absolute inset-0 flex items-center">
										<div className="w-full border-t border-gray-200"></div>
									</div>
									<div className="relative flex justify-center text-sm">
										<span className="px-2 bg-white text-gray-500">Or continue with</span>
									</div>
								</div>

								{/* Google Sign Up */}
								<div className="flex justify-center">
									<div ref={googleBtnRef} className="w-full flex justify-center"></div>
								</div>

								{/* Footer Links */}
								<div className="text-center space-y-2">
									<div className="text-sm text-gray-600">
										Want to join as an artist?{' '}
										<a href="/auth/register/mua" className="text-rose-600 hover:text-rose-700 font-medium hover:underline transition-colors">
											Sign up as MUA
										</a>
									</div>
									<div className="text-sm text-gray-600">
										Already have an account?{' '}
										<a href="/auth/login" className="text-rose-600 hover:text-rose-700 font-medium hover:underline transition-colors">
											Sign In
										</a>
									</div>
									<div className="text-sm text-gray-600">
										Haven't received verification email?{' '}
										<a href="/auth/resend-verification" className="text-rose-600 hover:text-rose-700 font-medium hover:underline transition-colors">
											Resend
										</a>
									</div>
								</div>
							</form>
						</div>
					);
			};

export default RegisterForm;
