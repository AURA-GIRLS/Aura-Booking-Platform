"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from '@/services/auth';

import SuccessMessage from '@/components/generalUI/SuccessMessage';
import ErrorMessage from '@/components/generalUI/ErrorMessage';
import LoadingMessage from '@/components/generalUI/LoadingMessage';

const VerifyEmail: React.FC = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>("idle");
	const [message, setMessage] = useState("");
	const [showAlert, setShowAlert] = useState(true);

	useEffect(() => {
		const token = searchParams.get("token");
		if (!token) {
			setStatus("error");
			setMessage("Invalid or missing verification token.");
			setShowAlert(true);
			return;
		}
		setStatus("loading");
		setShowAlert(true);
		authService.verifyEmail({ token })
			.then(res => {
				if (res.success) {
					setStatus("success");
					setMessage("Email verified successfully! Redirecting to login...");
				} else {
					setStatus("error");
					setMessage(res.message || "Verification failed.");
				}
				setShowAlert(true);
			})
			.catch(err => {
				setStatus("error");
				setMessage(err.message || "Verification failed.");
				setShowAlert(true);
			});
	}, [router, searchParams]);

	const handleTimeout = () => {
		setShowAlert(false);
		if (status === 'success') {
			router.push('/auth/login');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center from-pink-100 via-pink-200 to-pink-300">
			<div className="w-full max-w-md rounded-3xl shadow-xl bg-white/80 backdrop-blur-md px-8 py-10 flex flex-col gap-6 border border-pink-200">
				{showAlert && status === 'loading' && (
					<LoadingMessage message="Verifying email..." timeout={5000} onTimeout={() => setShowAlert(false)} />
				)}
				{showAlert && status === 'success' && (
					<SuccessMessage message={message} timeout={5000} onTimeout={handleTimeout} />
				)}
				{showAlert && status === 'error' && (
					<ErrorMessage message={message} timeout={5000} onTimeout={() => setShowAlert(false)} />
				)}
			</div>
		</div>
	);
};

export default VerifyEmail;
