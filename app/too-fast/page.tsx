import React from "react";

const tooFastPage = () => {
  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">SLow down Barry</h1>
      <p className="text-light-400 mt-3 max-w-xl text-center">
        Looks like you&apos;ve been a little too eager. We&apos;ve put a
        temporary pause on your excitement. 🚦 Chill for a bit, and try again
        shortly
      </p>
    </main>
  );
};

export default tooFastPage;
