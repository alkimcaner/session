import { useAppSelector } from "../typedReduxHooks";

export default function Profile() {
  const userState = useAppSelector((state) => state.user);

  return (
    <div className="w-full h-screen flex flex-col gap-4 justify-center items-center">
      <div className="avatar online">
        <div className="w-32">
          <img
            src="/cat.jpg"
            alt=""
            className="object-cover rounded-full overflow-hidden w-32 h-32"
          />
        </div>
      </div>
      <span className="text-xl">{userState.userSession?.user.email}</span>
      <span>
        Joined on{" "}
        {new Date(userState.userSession?.user.created_at!).toDateString()}
      </span>
    </div>
  );
}
