// lib/content/blogPosts.ts
export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  published: string;
  readTime: string;
  tags: string[];
  hero?: string; // optional short label on top
  body: string;  // simple markdown-ish text
};

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-ship-from-uae-to-kenya",
    title: "How to ship from UAE to Kenya with CrossBorderCart",
    description:
      "Step-by-step guide from sign-up to delivery for Kenyan shoppers using CrossBorderCart.",
    published: "Dec 2025",
    readTime: "7 min read",
    tags: ["Kenya", "Guide", "Shipping"],
    hero: "Step-by-step guide",
    body: `
### 1. Create your free account  
Sign up and get your personal UAE warehouse address and suite number.

### 2. Shop from any UAE or global store  
Use your CrossBorderCart address at checkout. Make sure your **suite ID** is included so we can link packages to your account.

### 3. We receive and check your packages  
Our warehouse team scans, photographs and measures each parcel. You can see photos and details in your dashboard.

### 4. Choose how you want to ship  
You can consolidate multiple packages or ship them separately. The system shows live prices for each carrier and service.

### 5. Customs & duties in Kenya  
For most shipments, Kenyan customs may charge taxes or duties. We help prepare the paperwork, but final charges are decided by customs.

> Tip: keep original invoices and avoid declaring a value that is too low – this can delay your shipment.

### 6. Track your shipment  
Use your dashboard or the public tracking link to see every update until delivery to your address in Kenya.
    `,
  },
  {
    slug: "save-money-with-consolidation",
    title: "How consolidation helps you save money on shipping",
    description:
      "When you should consolidate multiple packages into one shipment, and when it's better to ship separately.",
    published: "Dec 2025",
    readTime: "5 min read",
    tags: ["Tips", "Pricing"],
    hero: "Smarter shipping costs",
    body: `
### What is consolidation?  
Consolidation means we **combine two or more packages** into one bigger shipment before sending it to you.

### When consolidation makes sense  

- You ordered from several stores around the same time.  
- Total weight stays under your preferred carrier's cheap bracket.  
- You want **one customs clearance** instead of many small ones.

### When to avoid consolidation  

- One item is very urgent and others are not.  
- Items are fragile and may be safer in separate boxes.  
- Different receivers or different countries.

### How to consolidate with CrossBorderCart  

1. Wait until all packages arrive in your dashboard.  
2. Select the packages you want to group.  
3. Click **"Consolidate & ship"** (coming in future version).  
4. Pay for the shipment and track it like usual.
    `,
  },
  {
    slug: "common-address-mistakes",
    title: "Common address mistakes that delay deliveries",
    description:
      "Avoid these simple but costly address mistakes when you ship from Dubai to Africa and beyond.",
    published: "Nov 2025",
    readTime: "6 min read",
    tags: ["Tips", "Support"],
    hero: "Avoid delays",
    body: `
### 1. Missing suite ID  
Your **suite ID** is how we know the package belongs to you. Always include it after the street or warehouse name.

### 2. Wrong phone number  
Couriers often call before delivery. Double-check your **country code** and phone number.

### 3. Using a nickname instead of legal name  
For customs clearance, use the **same name** that appears on your ID or passport.

### 4. Confusing city and region  
Write your **city** and **region/state** separately. Example:  
> City: Nairobi  
> Region: Nairobi County  

### 5. Tiny or low-quality shipping labels  
If the seller hand-writes a label, ask them to write clearly. Scanners struggle with low contrast or very small barcodes.
    `,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
