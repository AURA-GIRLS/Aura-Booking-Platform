'use client';
import { useState } from 'react';
import { authService } from '@/services/auth';
import { Input } from '@/components/lib/ui/input';
import { Label } from '@/components/lib/ui/label';
import { Button } from '@/components/lib/ui/button';
import { Alert, AlertDescription } from '@/components/lib/ui/alert';
import { BrushIcon, Sparkles } from 'lucide-react';

export default function RegisterAsMuaForm() {
	const [form, setForm] = useState({
		fullName: '',
		email: '',
		password: '',
		phoneNumber: '',
		experienceYears: '',
		bio: '',
		location: ''
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);
		try {
			await authService.registerAsMua({
				fullName: form.fullName,
				email: form.email,
				password: form.password,
				phoneNumber: form.phoneNumber,
				experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
				bio: form.bio,
				location: form.location
			});
			setSuccess(true);
		} catch (err: any) {
			setError(err?.message || 'Registration failed');
		} finally {
			setLoading(false);
		}
	};

			return (
				<form onSubmit={handleSubmit} className="bg-white/90 rounded-[2.5rem] shadow-2xl border-4 border-pink-200/60 p-10 flex flex-col gap-6 max-w-lg w-full mx-auto mt-12 animate-fade-in">
					<div className="flex flex-col items-center gap-2 mb-2">
						<a href="/" title='home'className="w-16 h-16 rounded-full bg-pink-200 flex items-center justify-center mb-2 shadow-inner animate-bounce">
							<BrushIcon className="w-8 h-8 text-pink-500" />
						</a>
						<h2 className="text-3xl font-extrabold text-pink-500 tracking-tight drop-shadow-pink">Sign up as Makeup Artist</h2>
						<p className="text-pink-600 text-lg text-center font-medium">Grow your brand. Get more bookings. Join Aura's artist network!</p>
					</div>
					<div className="flex flex-col gap-2">
						<Label htmlFor="fullName" className="text-pink-600">Full Name</Label>
						<Input
							id="fullName"
							name="fullName"
							type="text"
							placeholder="Your full name"
							className="bg-pink-50 focus:ring-pink-300"
							value={form.fullName}
							onChange={handleChange}
							required
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label htmlFor="email" className="text-pink-600">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="you@email.com"
							className="bg-pink-50 focus:ring-pink-300"
							value={form.email}
							onChange={handleChange}
							required
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label htmlFor="password" className="text-pink-600">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder="Password"
							className="bg-pink-50 focus:ring-pink-300"
							value={form.password}
							onChange={handleChange}
							required
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label htmlFor="phoneNumber" className="text-pink-600">Phone Number</Label>
						<Input
							id="phoneNumber"
							name="phoneNumber"
							type="text"
							placeholder="Phone number"
							className="bg-pink-50 focus:ring-pink-300"
							value={form.phoneNumber}
							onChange={handleChange}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label htmlFor="experienceYears" className="text-pink-600">Years of Experience</Label>
						<Input
							id="experienceYears"
							name="experienceYears"
							type="number"
							placeholder="e.g. 3"
							className="bg-pink-50 focus:ring-pink-300"
							value={form.experienceYears}
							onChange={handleChange}
							min={0}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label htmlFor="location" className="text-pink-600">Location</Label>
						<Input
							id="location"
							name="location"
							type="text"
							placeholder="City/Province"
							className="bg-pink-50 focus:ring-pink-300"
							value={form.location}
							onChange={handleChange}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label htmlFor="bio" className="text-pink-600">Short Bio</Label>
						<textarea
							id="bio"
							name="bio"
							placeholder="Tell us about yourself (optional)"
							className="bg-pink-50 focus:ring-pink-300 rounded-lg p-2 min-h-[80px] border border-pink-200"
							value={form.bio}
							onChange={handleChange}
						/>
					</div>
					{error && (
						<Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					{success && (
						<Alert className="bg-green-50 border-green-200 text-green-700">
							<AlertDescription>Registration successful! Please check your email to verify your account.</AlertDescription>
						</Alert>
					)}
					<Button
						type="submit"
						className="mt-2 py-4 rounded-2xl bg-gradient-to-r from-pink-400 via-pink-300 to-pink-400 hover:from-pink-500 hover:to-pink-400 text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform duration-200"
						disabled={loading}
					>
						{loading ? 'Registering...' : 'Sign Up'}
					</Button>

					<div className="flex flex-col gap-1 mt-2">
						<a href="/auth/register/customer" className="text-xs text-pink-500 font-semibold hover:underline text-center">Sign up as customer</a>
						<div className="flex justify-center mt-2">
							<span className="text-xs text-pink-400">Already have an account?</span>
							<a href="/auth/login" className="ml-1 text-xs text-pink-500 font-semibold hover:underline">Sign In</a>
						</div>
						<div className="flex justify-center mt-1">
							<span className="text-xs text-pink-400">Haven't seen verification email?</span>
							<a href="/auth/resend-verification" className="ml-1 text-xs text-pink-500 font-semibold hover:underline">Resend Email</a>
						</div>
					</div>
				</form>
			);
}
