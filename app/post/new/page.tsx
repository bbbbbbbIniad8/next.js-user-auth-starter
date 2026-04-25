import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function NewPostPage() {
  async function createPost(formData: FormData) {
    "use server";
    const session = await auth();
    await prisma.post.create({
      data: {
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        authorId: Number(session?.user?.id), // Numberにキャスト
      }
    });
    redirect("/dashboard");
  }

  return (
    <form action={createPost}>
      <input name="title" placeholder="Title" />
      <textarea name="content" placeholder="Content" />
      <button>Post</button>
    </form>
  );
}