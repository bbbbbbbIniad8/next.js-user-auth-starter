import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export default async function MyPostsPage() {
  const session = await auth();
  const posts = await prisma.post.findMany({
    where: { authorId: Number(session?.user?.id) } // StringをNumberに戻して検索
  });

  return (
    <div>
      <h1>My Posts</h1>
      {posts.map(post => (
        <div key={post.id}><h3>{post.title}</h3><p>{post.content}</p></div>
      ))}
    </div>
  );
}