import RegisterAsMuaForm from "@/components/auth/register/RegisterAsMuaForm";

export default function RegisterPage() {
  return (
     <RegisterAsMuaForm/>
  );
}


declare global {
                interface Window {
                    google: any;
                }
            }