'use client';
import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import ErrorMessage from '@/components/generalUI/ErrorMessage';
import { Input } from '@/components/lib/ui/input';
import { Button } from '@/components/lib/ui/button';
import { Label } from '@radix-ui/react-label';


const ResetForm: React.FC = () => {
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
			setError('Password must be at least 6 characters');
			return;
		}
		if (password !== confirm) {
			setError('Passwords do not match');
			return;
		}
		setError('');
		setLoading(true);
		const token = searchParams.get('token');
		if (!token) {
			setError('Missing or invalid token.');
			setLoading(false);
			return;
		}
		try {
			const res = await authService.resetPassword({ token, newPassword: password });
			if (res.success) {
				setSuccess(true);
				setTimeout(() => router.push('/auth/login'), 2000);
			} else {
				setError(res.message || 'Reset password failed');
			}
		} catch (err: any) {
			setError(err.message || 'Reset password failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center  ">
			<form
				onSubmit={handleSubmit}
				className="w-full max-w-md rounded-3xl shadow-xl bg-white/80 backdrop-blur-md px-8 py-10 flex flex-col gap-6 border border-pink-200"
			>
				<div className="flex flex-col items-center mb-2">
					<div className="w-16 h-16 rounded-full bg-pink-200 flex items-center justify-center mb-2 shadow-inner">
						<svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#f472b6" /></svg>
					</div>
					<h2 className="text-2xl font-bold text-pink-600 mb-1">Reset Password</h2>
					<p className="text-pink-400 text-sm text-center">Enter your new password below.</p>
				</div>
				<div>
					<Label htmlFor="password" className="block mb-1 font-medium text-pink-500">New Password*</Label>
					<Input
						id="password"
						type="password"
						name="password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						required
						placeholder="Enter new password"
						className="bg-white/60 border border-pink-200 focus:border-pink-400 focus:ring-pink-200 text-pink-700"
					/>
				</div>
				<div>
					<Label htmlFor="confirm" className="block mb-1 font-medium text-pink-500">Confirm Password*</Label>
					<Input
						id="confirm"
						type="password"
						name="confirm"
						value={confirm}
						onChange={e => setConfirm(e.target.value)}
						required
						placeholder="Confirm new password"
						className="bg-white/60 border border-pink-200 focus:border-pink-400 focus:ring-pink-200 text-pink-700"
					/>
				</div>
				 {error && <ErrorMessage message={error} />}
				 {success && <div className="text-green-600 text-sm text-center">Password reset successfully! Redirecting...</div>}
				 <Button
					 type="submit"
					 className="w-full bg-pink-400 text-white py-2 rounded-xl font-semibold hover:bg-pink-500 transition shadow-pink-200 shadow flex items-center justify-center gap-2"
					 disabled={loading}
				 >
					 <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
					 {loading ? 'Resetting...' : 'Reset Password'}
				 </Button>
				<div className="flex justify-center mt-2">
					<span className="text-xs text-pink-400">Already have an account?</span>
					<a href="/auth/login" className="ml-1 text-xs text-pink-500 font-semibold hover:underline">Sign In</a>
				</div>
			</form>
		</div>
	);
};

export default ResetForm;
