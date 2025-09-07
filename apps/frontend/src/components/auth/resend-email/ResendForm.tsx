'use client';


import React, { useState } from 'react';
import { Input } from '@/components/lib/ui/input';
import { Button } from '@/components/lib/ui/button';
import { Label } from '@radix-ui/react-label';
import { authService } from '@/services/auth';

const ResendForm: React.FC = () => {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');
		try {
			const res = await authService.sendEmailVerification({ email });
			if (res.success) {
				setSuccess('Verification email sent!');
			} else {
				setError(res.message || 'Failed to send verification email');
			}
		} catch (err: any) {
			setError(err.message || 'Failed to send verification email');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center from-pink-100 via-pink-200 to-pink-300">
			<form
				onSubmit={handleSubmit}
				className="w-full max-w-md rounded-3xl shadow-xl bg-white/80 backdrop-blur-md px-8 py-10 flex flex-col gap-6 border border-pink-200"
			>
				<div className="flex flex-col items-center mb-2">
					<div className="w-16 h-16 rounded-full bg-pink-200 flex items-center justify-center mb-2 shadow-inner">
						<svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#f472b6" /></svg>
					</div>
					<h2 className="text-2xl font-bold text-pink-600 mb-1">Resend Verification Email</h2>
					<p className="text-pink-400 text-sm text-center">Enter your email and we'll resend the verification link instantly.</p>
				</div>
				<div>
					<Label htmlFor="email" className="block mb-1 font-medium text-pink-500">Email address*</Label>
					<Input
						id="email"
						type="email"
						name="email"
						value={email}
						onChange={e => setEmail(e.target.value)}
						required
						placeholder="example@gmail.com" 
						className="bg-white/60 border border-pink-200 focus:border-pink-400 focus:ring-pink-200 text-pink-700"
					/>
				</div>
						{error && <div className="text-red-500 text-sm text-center">{error}</div>}
						{success && <div className="text-green-600 text-sm text-center">{success}</div>}
						<Button
							type="submit"
							className="w-full bg-pink-400 text-white py-2 rounded-xl font-semibold hover:bg-pink-500 transition shadow-pink-200 shadow flex items-center justify-center gap-2"
							disabled={loading}
						>
							<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
							{loading ? 'Resending...' : 'Resend Email'}
						</Button>
				<div className="flex justify-center mt-2">
					<span className="text-xs text-pink-400">Already have an account?</span>
					<a href="/auth/login" className="ml-1 text-xs text-pink-500 font-semibold hover:underline">Sign In</a>
				</div>
			</form>
		</div>
	);
};

export default ResendForm;
