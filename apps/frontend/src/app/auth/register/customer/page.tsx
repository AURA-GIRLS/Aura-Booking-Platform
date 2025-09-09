import RegisterForm from "@/components/auth/register/RegisterForm";

export default function RegisterPage() {
  return (
     <RegisterForm/>
  );
}


declare global {
                interface Window {
                    google: any;
                }
            }