// pages/blog/[slug].tsx
import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { getPostBySlug } from "@/lib/content/blogPosts";
import type { BlogPost } from "@/lib/content/blogPosts";

function renderBody(body: string) {
  // Very light markdown-ish rendering: split into paragraphs,
  // treat lines starting with "###" as sub-headings.
  const lines = body.trim().split("\n").filter(Boolean);
  return lines.map((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("###")) {
      return (
        <h3 key={index} className="h5 fw-semibold mt-4">
          {trimmed.replace(/^###\s*/, "")}
        </h3>
      );
    }
    if (trimmed.startsWith(">")) {
      return (
        <p key={index} className="border-start ps-3 text-muted fst-italic">
          {trimmed.replace(/^>\s*/, "")}
        </p>
      );
    }
    return (
      <p key={index} className="mb-2">
        {trimmed}
      </p>
    );
  });
}

export default function BlogDetailPage() {
  const router = useRouter();
  const { slug } = router.query;

  if (typeof slug !== "string") {
    return null;
  }

  const post: BlogPost | undefined = getPostBySlug(slug);

  if (!post) {
    return (
      <MarketingLayout>
        <section className="py-5">
          <div className="container text-center">
            <h1 className="h3 mb-3">Article not found</h1>
            <p className="text-muted mb-3">
              The blog post you are looking for does not exist.
            </p>
            <Link href="/blog" className="btn btn-primary">
              Back to blog
            </Link>
          </div>
        </section>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      <Head>
        <title>{post.title} | CrossBorderCart Blog</title>
      </Head>

      <section className="py-5">
        <div className="container" style={{ maxWidth: "800px" }}>
          <p className="small text-muted mb-1">
            {post.published} · {post.readTime}
          </p>
          <h1 className="h2 fw-bold mb-2">{post.title}</h1>
          {post.hero && (
            <p className="text-primary fw-semibold mb-3">{post.hero}</p>
          )}

          <p className="text-muted mb-4">{post.description}</p>

          <div className="mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="badge bg-light text-secondary me-1">
                {tag}
              </span>
            ))}
          </div>

          <article className="blog-body">{renderBody(post.body)}</article>

          <hr className="my-4" />

          <div className="d-flex justify-content-between align-items-center">
            <Link href="/blog" className="btn btn-outline-secondary btn-sm">
              ← Back to all articles
            </Link>
            <Link href="/signup" className="btn btn-primary btn-sm">
              Start shipping with CrossBorderCart
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
