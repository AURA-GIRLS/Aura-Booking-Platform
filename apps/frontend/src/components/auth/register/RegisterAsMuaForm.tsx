'use client';
import { useState } from 'react';
import { authService } from '@/services/auth';
import { Input } from '@/components/lib/ui/input';
import { Label } from '@/components/lib/ui/label';
import { Button } from '@/components/lib/ui/button';
import { BrushIcon } from 'lucide-react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/lib/ui/select';
import { PROVINCES } from '@/constants/constants';

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

	const handleLocationChange = (value: string) => {
		setForm({ ...form, location: value });
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
				<div className="min-h-screen bg-transparent flex items-center justify-center p-4">

					<form onSubmit={handleSubmit} className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 space-y-6">
						{/* Header */}
						<div className="text-center space-y-4">
							<div className="relative">
								<div className="w-20 h-20 mx-auto bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
									<BrushIcon className="w-10 h-10 text-white" />
								</div>
								{/* Pulse rings */}
								<div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-4 border-rose-300 animate-ping opacity-20"></div>
							</div>
							<div>
								<h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
									Join as Makeup Artist
								</h2>
								<p className="text-gray-600 text-sm mt-2">
									Grow your brand. Get more bookings. Join Aura's artist network!
								</p>
							</div>
						</div>
					{/* Form Fields */}
					<div className="space-y-4">
						<div>
							<Label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name</Label>
							<Input
								id="fullName"
								name="fullName"
								type="text"
								placeholder="Your full name"
								className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
								value={form.fullName}
								onChange={handleChange}
								required
							/>
						</div>
						<div>
							<Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="you@email.com"
								className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
								value={form.email}
								onChange={handleChange}
								required
							/>
						</div>
						<div>
							<Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</Label>
							<Input
								id="password"
								name="password"
								type="password"
								placeholder="Password"
								className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
								value={form.password}
								onChange={handleChange}
								required
							/>
						</div>
						<div>
							<Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</Label>
							<Input
								id="phoneNumber"
								name="phoneNumber"
								type="text"
								placeholder="Phone number"
								className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
								value={form.phoneNumber}
								onChange={handleChange}
							/>
						</div>
						<div>
							<Label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</Label>
							<Input
								id="experienceYears"
								name="experienceYears"
								type="number"
								placeholder="e.g. 3"
								className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
								value={form.experienceYears}
								onChange={handleChange}
								min={0}
							/>
						</div>
						<div>
							<Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">Location</Label>
							<Select value={form.location} onValueChange={handleLocationChange}>
								<SelectTrigger className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200">
									<SelectValue placeholder="Select your province/city" />
								</SelectTrigger>
								<SelectContent className="bg-white">
									{PROVINCES.map((province) => (
										<SelectItem key={province} value={province}>{province}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">Short Bio</Label>
							<textarea
								id="bio"
								name="bio"
								placeholder="Tell us about yourself (optional)"
								className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 min-h-[80px] resize-none"
								value={form.bio}
								onChange={handleChange}
							/>
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
							Registration successful! Please check your email to verify your account.
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
								Registering...
							</div>
						) : (
							'Join as Artist'
						)}
					</Button>

					{/* Footer Links */}
					<div className="text-center space-y-2">
						<div className="text-sm text-gray-600">
							Want to join as customer?{' '}
							<a href="/auth/register/customer" className="text-rose-600 hover:text-rose-700 font-medium hover:underline transition-colors">
								Sign up as customer
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
}
