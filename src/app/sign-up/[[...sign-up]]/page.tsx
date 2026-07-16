import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto w-full max-w-md",
            card: "shadow-lg rounded-2xl",
          },
        }}
        routing="hash"
        forceRedirectUrl="/protected/dashboard"
      />
    </div>
  );
}
