
'use client';

import { Button } from '@/components/lib/ui/button';
import { Input } from '@/components/lib/ui/input';
import { Label } from '@radix-ui/react-label';
import { UserIcon } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { authService } from '@/services/auth';
import { config } from '@/config/index';

const LoginForm: React.FC = () => {
	const [form, setForm] = useState({
		email: '',
		password: ''
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
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
			const res = await authService.login(form);
			if (res.success && res.data?.token) {
				localStorage.setItem('token', res.data.token);
				setSuccess('Login successful!');
				if(res.data.user.role === 'ARTIST') {
					//need change redirect to artist dashboard
					window.location.href = '/mua/dashboard';
				}
				window.location.href = '/';
			} else {
				setError(res.message || 'Login failed');
			}
		} catch (err: any) {
			setError(err.message || 'Login failed');
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
					<div className="min-h-screen flex items-center justify-center">
						<form
							onSubmit={handleSubmit}
							className="w-full max-w-lg rounded-[2.5rem] shadow-2xl bg-white/90 border-4 border-pink-200/60 px-10 py-12 flex flex-col gap-7 animate-fade-in"
						>
							{error && <div className="text-red-500 text-sm text-center">{error}</div>}
							{success && <div className="text-green-600 text-sm text-center">{success}</div>}
							<div className="flex flex-col items-center gap-2 mb-2">
								<a href="/" title='home' className="w-16 h-16 rounded-full bg-pink-200 flex items-center justify-center mb-2 shadow-inner animate-bounce">
									<UserIcon className="w-8 h-8 text-pink-500" />
								</a>
								<h2 className="text-3xl font-extrabold text-pink-500 tracking-tight drop-shadow-pink">Welcome Back!</h2>
								<p className="text-pink-600 text-lg text-center font-medium">Sign in to book makeup and manage your beauty schedule.</p>
							</div>
							<div>
								<Label htmlFor="email" className="block mb-1 font-medium text-pink-500">Email address*</Label>
								<Input
									id="email"
									type="email"
									name="email"
									value={form.email}
									onChange={handleChange}
									required
									placeholder="example@gmail.com"
									className="bg-pink-50 border border-pink-200 focus:border-pink-400 focus:ring-pink-200 text-pink-700"
								/>
							</div>
							<div>
								<Label htmlFor="password" className="block mb-1 font-medium text-pink-500">Password*</Label>
								<Input
									id="password"
									type="password"
									name="password"
									value={form.password}
									onChange={handleChange}
									required
									placeholder="@Sn123hsn#"
									className="bg-pink-50 border border-pink-200 focus:border-pink-400 focus:ring-pink-200 text-pink-700"
								/>
							</div>
							<div className="flex items-center justify-between text-xs text-pink-400 mb-2">
								<label className="flex items-center gap-2">
									<input type="checkbox" className="accent-pink-400" />
									Remember me
								</label>
								<a href="/auth/forgot-password" className="text-pink-500 font-semibold hover:underline">Forgot Password?</a>
							</div>
							<Button
								type="submit"
								className="w-full bg-gradient-to-r from-pink-400 via-pink-300 to-pink-400 hover:from-pink-500 hover:to-pink-400 text-white py-3 rounded-2xl font-bold hover:scale-105 transition-transform duration-200 mb-2 shadow-lg flex items-center justify-center gap-2"
								disabled={loading}
							>
								<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
								{loading ? 'Signing in...' : 'Sign in'}
							</Button>
							<div className="flex items-center gap-2 my-2">
								<div className="flex-1 h-px bg-pink-200" />
								<span className="text-xs text-pink-400">Or continue with</span>
								<div className="flex-1 h-px bg-pink-200" />
							</div>
							<div className="flex flex-col gap-3">
								<div ref={googleBtnRef} className="flex justify-center"></div>
							</div>
							<div className="flex flex-col gap-1 ">
								<div className="flex justify-center mt-2">
									<span className="text-xs text-pink-400">Don't have an account?</span>
									<a href="/auth/register" className="ml-1 text-xs text-pink-500 font-semibold hover:underline">Sign up</a>
								</div>
								<div className="flex justify-center mt-1">
									<span className="text-xs text-pink-400">Haven't seen verification email?</span>
									<a href="/auth/resend-verification" className="ml-1 text-xs text-pink-500 font-semibold hover:underline">Resend Email</a>
								</div>
							</div>
						</form>
					</div>
				);
	
};

export default LoginForm;
