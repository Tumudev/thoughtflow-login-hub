
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <Link to="/">
            <Logo className="mb-4" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-2">{subtitle}</p>
        </div>
        <div className="bg-card rounded-lg border shadow-sm p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
