import { LoginForm } from "../components/loginForm";
import Freelansters from "../assets/Freelansters.svg";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-24 items-center justify-center rounded-full text-primary-foreground">
            <img
              src={Freelansters || "/placeholder.svg"}
              alt="Freelansters logo"
              width={80}
              height={80}
            />
          </div>
          Freelansters
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
