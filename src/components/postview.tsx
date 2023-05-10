import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

dayjs.extend(relativeTime);

export const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div className="flex gap-4 border-b border-slate-400 p-4" key={post.id}>
      <Image
        src={author.profileImageUrl}
        alt={`@${author.username}'s profile picture`}
        className="h-10 w-10 rounded-full"
        width={40}
        height={40}
      />
      <div className="flex flex-col">
        <div className="text-slate-400">
          <Link
            href={`/@${author.username}`}
            className="text-slate-100"
          >{`@${author.username}`}</Link>
          <span className="mx-1">•</span>
          <Link href={`/post/${post.id}`} className="font-thin">
            {dayjs(post.createdAt).fromNow()}
          </Link>
        </div>
        <div>{post.content}</div>
      </div>
    </div>
  );
};
