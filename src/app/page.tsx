import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <div className="bg-background text-foreground flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold tracking-tight">
        Welcome to CodeForge
      </h1>
      <p className="text-muted-foreground max-w-md text-center">
        Your production-ready, containerized development workspace environment.
      </p>

      <Link href="/dashboard" passHref>
        <Button size="lg" className="cursor-pointer font-semibold">
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default Home;
