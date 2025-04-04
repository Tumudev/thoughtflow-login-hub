
import AuthLayout from "@/components/AuthLayout";
import SignupForm from "@/components/SignupForm";

const Signup = () => {
  return (
    <AuthLayout
      title="Create an account"
      subtitle="Sign up to get started with ThoughtFlow"
    >
      <SignupForm />
    </AuthLayout>
  );
};

export default Signup;
