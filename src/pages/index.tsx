import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { api } from "~/utils/api";
import { LoadingPage } from "~/components/loading";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState<string>("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      // ignore awaiting promise using void
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;

      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post. Try again later ¯\\_(ツ)_/¯");
      }
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <Image
        src={user.profileImageUrl}
        alt="Profile image"
        className="h-16 w-16 rounded-full"
        width={64}
        height={64}
      />
      {/* a11y? */}
      <label htmlFor="emojeet-input" className="sr-only">
        Compose your emojeet!
      </label>
      <input
        placeholder="Compose your emojeet!"
        id="emojeet-input"
        type="text"
        className="grow bg-transparent"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
      />
      <div>
        <button
          className="rounded-md border-2 border-solid border-slate-400 px-5 py-1"
          onClick={() => mutate({ content: input })}
          disabled={isPosting}
        >
          Post
        </button>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center text-2xl">
        Something went wrong ¯\_(ツ)_/¯
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Start fetching ASAP
  api.posts.getAll.useQuery();

  // return empty div if neither are loaded, bc user tends to load faster
  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      <div className="border-b border-t border-slate-400 p-4">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}
        {isSignedIn && <CreatePostWizard />}
      </div>
      <Feed />
    </PageLayout>
  );
};

export default Home;
