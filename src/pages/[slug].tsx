import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";
import { generateSShelper } from "~/server/helpers/ssHelper";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0)
    return <div>User has no posts ¯\_(ツ)_/¯</div>;

  return (
    <div>
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center text-2xl">
        Something went wrong ¯\_(ツ)_/¯
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="bg-gradient-to-b from-slate-400 to-black  p-8">
          <Image
            className="rounded-full"
            src={data.profileImageUrl}
            alt={`Profile picture for user ${data.username ?? ""}.`}
            width={128}
            height={128}
          />
          <div className="mt-6 text-3xl font-bold">{`@${
            data.username ?? ""
          }`}</div>
        </div>
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = generateSShelper();

  const slug = context.params?.slug as string;

  // TODO handle error better. return to different page?
  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
