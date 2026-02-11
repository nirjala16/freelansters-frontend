import AdminLogin from "./adminLogin"
import Freelansters from "../assets/Freelansters.svg"
export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 sm:p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <img
            src={Freelansters}
            width={240}
            height={60}
            alt="Freelansters Logo"
            className="mb-4"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Admin Login</h2>
        </div>
        <AdminLogin />
      </div>
    </main>
  )
}

