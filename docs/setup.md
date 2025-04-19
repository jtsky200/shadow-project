##Initialize Next.js in current directory:
```bash
mkdir temp; cd temp; npx create-next-app@latest . -y --typescript --tailwind --eslint --app --use-npm --src-dir --import-alias "@/*" -no --turbo
```

Now let's move back to the parent directory and move all files.

For Windows (PowerShell):
```powershell
cd ..; Move-Item -Path "temp*" -Destination . -Force; Remove-Item -Path "temp" -Recurse -Force
```

For Mac/Linux (bash):
```bash
cd .. && mv temp/* temp/.* . 2>/dev/null || true && rm -rf temp
```

##Shadcn setup

Step 1: Run the following commands:
```bash
npx shadcn@latest init
```

Step 2: Run the following command to install all shadcn components:
```bash
npx shadcn@latest add --all
```

##Recharts setup

Run the following command:
```bash
npm install recharts --force
```

##Lucide icon library setup

Run the following command:
```bash
npm install lucide-react --force 
```

##Web app setup
Create a beautiful web application based on the below markdown files. When building each page, make sure that you use the relevant shadcn components. Ensure all page components are created in their correct directory structure by implementing the full directory path when creating new pages (e.g., '/dashboard/feature-name/page.tsx' instead of just 'feature-name/page.tsx'). MUST IMPLEMENT ALL:

1-layout.md
2-chat.md
3-library.md
4-settings.md
5-tools.md


Each markdown file contains specific instructions for its respective section. Follow the instructions in each file to create a cohesive and modern web application. 

Important considerations:
- Use 'use client' directive for client-side components
- Avoid curly quotes in code. Use escaped apostrophes (\') in single-quoted strings or switch to double quotes
- Make sure each component file ends with a proper export default statement

## Properly Implementing Unsplash Images in Next.js

When using Unsplash images with Next.js Image component, follow these guidelines:

1. **Configuration**: Update next.config.ts with the following:
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
```2. **Image URLs**: Use direct Unsplash image URLs with query parameters:
```javascript
// Format: https://images.unsplash.com/photo-{ID}?q=80&w={WIDTH}&auto=format&fit=crop
src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=1920&auto=format&fit=crop"
```

3. **Always include sizes prop** with the Image component when using fill mode:
```jsx
<Image 
  src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=1920&auto=format&fit=crop"
  alt="Description"
  fill
  className="object-cover"
  sizes="100vw" // Adjust based on your layout needs
/>
```

4. **Avoid** using source.unsplash.com URLs directly as they may not work reliably with Next.js Image optimization.

5. **Quality and dimensions**: Control image quality with the 'q=' parameter (0-100) and dimensions with 'w=' and 'h=' parameters.