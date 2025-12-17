// components/marketing/Testimonials.tsx
import React from "react";

const testimonials = [
  {
    name: "Linet M.",
    location: "Nairobi, Kenya",
    text: "My orders from three different stores arrived together and I saved on shipping. Tracking was very clear.",
    rating: 5,
  },
  {
    name: "Samuel K.",
    location: "Lusaka, Zambia",
    text: "Support helped me fix my address and avoid a return. Delivery was faster than I expected.",
    rating: 5,
  },
  {
    name: "Rahwa T.",
    location: "Dubai → Addis Ababa",
    text: "I buy for my family back home every month. CrossBorderCart makes the whole process simple.",
    rating: 4,
  },
];

export default function Testimonials() {
  return (
    <section className="py-5 bg-light">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 fw-bold mb-0">What our customers say</h2>
          <span className="small text-muted">Rated 4.8/5 from early users</span>
        </div>

        <div className="row g-3">
          {testimonials.map((t) => (
            <div key={t.name} className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="mb-2">
                    {"★".repeat(t.rating)}
                    {"☆".repeat(5 - t.rating)}
                  </div>
                  <p className="small text-muted mb-3">“{t.text}”</p>
                  <p className="small fw-semibold mb-0">{t.name}</p>
                  <p className="small text-muted mb-0">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
