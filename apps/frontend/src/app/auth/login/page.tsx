import LoginForm from "@/components/auth/login/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-10">
     <LoginForm/>
     </main>
  );
}
declare global {
				interface Window {
					google: any;
				}
			}


