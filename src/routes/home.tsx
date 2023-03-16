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
    <main className="flex-1 max-w-7xl mx-auto flex flex-col lg:flex-row justify-center items-center gap-16 p-4">
      <div className="flex flex-col gap-8 justify-center">
        <h1 className="text-6xl text-primary font-bold">
          High quality video calls for ✨
          <span className="text-yellow-400">free</span>✨
        </h1>
        <p className="text-xl text-base-content">
          Got tired of subscriptions? Call anyone without thinking about montly
          plans. Session is free of charge.
        </p>
        <div className="flex items-center gap-4 w-fit">
          <button onClick={handleCreate} className="btn btn-primary gap-2">
            <BsCameraVideo />
            New Session
          </button>
          <form className="form-control" onSubmit={handleJoin}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter session code"
                className="input input-bordered"
                onChange={(e) => setSessionCode(e.target.value)}
              />
              <input type="submit" value="Join" className="btn btn-primary" />
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
