'use client';


import React, { useState } from 'react';
import { Input } from '@/components/lib/ui/input';
import { Button } from '@/components/lib/ui/button';
import { Label } from '@radix-ui/react-label';
import { authService } from '@/services/auth';
import { MailCheckIcon } from 'lucide-react';

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
			<div className="min-h-screen flex items-center justify-center">
				<form
					onSubmit={handleSubmit}
					className="w-full max-w-lg rounded-[2.5rem] shadow-2xl bg-white/90 border-4 border-pink-200/60 px-10 py-12 flex flex-col gap-7 animate-fade-in"
				>
					<div className="flex flex-col items-center gap-2 mb-2">
						<span className="w-16 h-16 rounded-full bg-pink-200 flex items-center justify-center mb-2 shadow-inner animate-bounce">
							<MailCheckIcon className="w-8 h-8 text-pink-500" />
						</span>
						<h2 className="text-3xl font-extrabold text-pink-500 tracking-tight drop-shadow-pink">Resend Verification Email</h2>
						<p className="text-pink-600 text-lg text-center font-medium">Enter your email and we'll resend the verification link instantly.</p>
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
							className="bg-pink-50 border border-pink-200 focus:border-pink-400 focus:ring-pink-200 text-pink-700"
						/>
					</div>
					{error && <div className="text-red-500 text-sm text-center">{error}</div>}
					{success && <div className="text-green-600 text-sm text-center">{success}</div>}
					<Button
						type="submit"
						className="w-full bg-gradient-to-r from-pink-400 via-pink-300 to-pink-400 hover:from-pink-500 hover:to-pink-400 text-white py-3 rounded-2xl font-bold hover:scale-105 transition-transform duration-200 shadow-lg flex items-center justify-center gap-2"
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
