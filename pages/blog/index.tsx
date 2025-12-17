// pages/blog/index.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";
import { blogPosts } from "@/lib/content/blogPosts";
import MarketingLayout from "@/components/marketing/MarketingLayout";

export default function BlogIndexPage() {
  return (
    <MarketingLayout>
      <Head>
        <title>Blog | CrossBorderCart</title>
      </Head>

      <section className="py-5 bg-light">
        <div className="container">
          <div className="mb-4">
            <h1 className="h2 fw-bold mb-2">CrossBorderCart Blog</h1>
            <p className="text-muted mb-0">
              Guides, tips and stories to help you shop globally and ship safely to your home country.
            </p>
          </div>

          <div className="row g-4">
            {blogPosts.map((post) => (
              <div className="col-md-4" key={post.slug}>
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body d-flex flex-column">
                    <p className="small text-muted mb-1">
                      {post.published} · {post.readTime}
                    </p>
                    <h2 className="h5 fw-semibold mb-2">{post.title}</h2>
                    <p className="small text-muted flex-grow-1 mb-3">
                      {post.description}
                    </p>
                    <div className="mb-3">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="badge bg-light text-secondary me-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="btn btn-primary btn-sm mt-auto"
                    >
                      Read article
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
