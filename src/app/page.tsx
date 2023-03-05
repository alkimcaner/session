export default function Home() {
  return (
    <main className="flex-1 max-w-7xl mx-auto flex flex-col lg:flex-row justify-center items-center gap-16 p-4">
      <div className="flex flex-col gap-8 justify-center">
        <h1 className="text-6xl text-primary font-bold">
          High quality video calls for ✨
          <span className="text-yellow-400">free</span>✨
        </h1>
        <p className="text-xl text-base-content">
          Got tired of subscriptions? Call your friends without thinking about
          montly plans. Session is free of charge.
        </p>
        <div className="flex items-center gap-2 w-fit">
          <button className="btn btn-secondary">Get Started</button>
          <span className="text-base-content text-xs">For free!</span>
        </div>
      </div>
    </main>
  );
}
