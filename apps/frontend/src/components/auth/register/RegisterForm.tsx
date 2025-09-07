'use client';
import { Button } from '@/components/lib/ui/button';
import { Input } from '@/components/lib/ui/input';
import { Label } from '@radix-ui/react-label';
import React, { useState } from 'react';
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

	const handleGoogleLogin = () => {
		// TODO: Xử lý đăng nhập với Google
		alert('Login with Google');
	};

			return (
				<div className="min-h-screen flex items-center justify-center  from-pink-100 via-pink-200 to-pink-300">
					 <form
					 onSubmit={handleSubmit}
					 className="w-full max-w-md rounded-3xl shadow-xl bg-white/80 backdrop-blur-md px-8 py-10 flex flex-col gap-6 border border-pink-200"
					 >
						 {error && <div className="text-red-500 text-sm text-center">{error}</div>}
						 {success && <div className="text-green-600 text-sm text-center">{success}</div>}
						<div className="flex flex-col items-center mb-2">
							<div className="w-16 h-16 rounded-full bg-pink-200 flex items-center justify-center mb-2 shadow-inner">
								<svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#f472b6" /></svg>
							</div>
							<h2 className="text-2xl font-bold text-pink-600 mb-1">Create Your Account?</h2>
										<p className="text-pink-400 text-sm text-center">Book makeup online with top artists. Fast. Easy. Beautiful.</p>
						</div>
						<div>
							<Label htmlFor="fullName" className="block mb-1 font-medium text-pink-500">Full Name*</Label>
							<Input
								id="fullName"
								type="text"
								name="fullName"
								value={form.fullName}
								onChange={handleChange}
								required
								placeholder="Alex Smith"
								className="bg-white/60 border border-pink-200 focus:border-pink-400 focus:ring-pink-200 text-pink-700"
							/>
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
								className="bg-white/60 border border-pink-200 focus:border-pink-400 focus:ring-pink-200 text-pink-700"
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
								className="bg-white/60 border border-pink-200 focus:border-pink-400 focus:ring-pink-200 text-pink-700"
							/>
						</div>
						<div>
							<Label htmlFor="phoneNumber" className="block mb-1 font-medium text-pink-500">Phone Number</Label>
							<Input
								id="phoneNumber"
								type="tel"
								name="phoneNumber"
								value={form.phoneNumber}
								onChange={handleChange}
								placeholder="Optional"
								className="bg-white/60 border border-pink-200 focus:border-pink-400 focus:ring-pink-200 text-pink-700"
							/>
						</div>
						 <Button
							 type="submit"
							 className="w-full bg-pink-400 text-white py-2 rounded-xl font-semibold hover:bg-pink-500 transition mb-2 shadow-pink-200 shadow"
							 disabled={loading}
						 >
							 {loading ? 'Registering...' : 'Register'}
						 </Button>
						<div className="flex items-center gap-2 my-2">
							<div className="flex-1 h-px bg-pink-200" />
							<span className="text-xs text-pink-400">Or continue with</span>
							<div className="flex-1 h-px bg-pink-200" />
						</div>
						<div className="flex gap-3">
							<Button
								type="button"
								onClick={handleGoogleLogin}
								variant="outline"
								className="flex-1 flex items-center justify-center gap-2 border border-pink-200 py-2 rounded-xl bg-white/70 hover:bg-pink-50 text-pink-500 shadow"
							>
                                <i className="fa-brands fa-google"></i>
								Google
							</Button>
							<Button
								type="button"
								variant="outline"
								className="flex-1 flex items-center justify-center gap-2 border border-pink-200 py-2 rounded-xl bg-white/70 hover:bg-pink-50 text-pink-500 shadow"
								disabled
							>
								<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#f9a8d4" /></svg>
								Apple
							</Button>
						</div>
						<div>
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
				</div>
			);
};

export default RegisterForm;
