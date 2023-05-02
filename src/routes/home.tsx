import { FormEvent, useState } from "react";
import { BsCameraVideo } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import {
  adjectives,
  animals,
  colors,
  Config,
  uniqueNamesGenerator,
} from "unique-names-generator";

const nameGenConfig: Config = {
  dictionaries: [adjectives, colors, animals, colors],
  separator: "-",
  length: 4,
};

export default function Home() {
  const [sessionCode, setSessionCode] = useState("");
  const navigate = useNavigate();

  const handleCreate = async () => {
    const id = uniqueNamesGenerator(nameGenConfig);
    navigate(`/session/${id}`);
  };

  const handleJoin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (sessionCode.length > 0) {
      navigate(`/session/${sessionCode}`);
    }
  };

  return (
    <main className="mx-auto flex max-w-7xl flex-1 flex-col items-center justify-center gap-16 p-4 lg:flex-row">
      <div className="flex flex-col justify-center gap-8">
        <h1 className="text-5xl font-bold text-primary">
          High quality video calls for ✨
          <span className="text-yellow-400">free</span>✨
        </h1>
        <p className="text-xl text-base-content">
          Got tired of subscriptions? Call anyone without thinking about montly
          plans. Session is free of charge.
        </p>
        <div className="flex w-fit flex-wrap items-center gap-4">
          <button onClick={handleCreate} className="btn-primary btn gap-2">
            <BsCameraVideo />
            New Session
          </button>
          <form className="form-control" onSubmit={handleJoin}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter session code"
                className="input-bordered input"
                onChange={(e) => setSessionCode(e.target.value)}
              />
              <input type="submit" value="Join" className="btn-primary btn" />
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
