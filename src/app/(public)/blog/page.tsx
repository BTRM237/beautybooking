import BlogIndex, { type BlogPostView } from "@/components/public/BlogIndex";
import CompactPageHeader from "@/components/public/CompactPageHeader";
import { getPublishedBlogPosts } from "@/lib/public-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog makeup cô dâu, dự tiệc và chăm sóc da | Luna",
  description:
    "Chia sẻ kiến thức, kinh nghiệm và mẹo makeup cô dâu, dự tiệc, kỷ yếu, chăm sóc da từ Luna Makeup Studio.",
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  const viewPosts: BlogPostView[] = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category,
    thumbnail: post.thumbnail,
    publishedAt: post.publishedAt?.toISOString() || null,
  }));

  return (
    <>
      <CompactPageHeader
        eyebrow="Blog"
        title="Cẩm nang làm đẹp"
        description="Gợi ý chọn tone makeup, chuẩn bị da, đặt lịch tại nhà và những lưu ý giúp bạn lên ảnh đẹp hơn trong ngày cưới, tiệc, kỷ yếu hoặc sự kiện."
        actions={[{ label: "Đặt lịch", href: "/dat-lich", primary: true }]}
      />

      <section className="bg-[#070509] py-8 md:py-10">
        <div className="container-custom">
          <BlogIndex posts={viewPosts} />
        </div>
      </section>
    </>
  );
}
