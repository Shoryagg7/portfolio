import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Philosophy } from "@/components/sections/philosophy";
import { Skills } from "@/components/sections/skills";
import { ProjectsGrid } from "@/components/sections/projects-grid";
import { CPDashboard } from "@/components/sections/cp-dashboard";
import { BlogPreview } from "@/components/sections/blog-preview";
import { Contact } from "@/components/sections/contact";
import { getAllPosts } from "@/lib/blog";
import { getAllPlatformStats } from "@/lib/services/cp-stats";

export default async function Home() {
  const posts = getAllPosts();
  // Memoized, so the CP dashboard below reuses this rather than refetching.
  const cpStats = await getAllPlatformStats();

  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero cpStats={cpStats} />
        <About />
        <Philosophy />
        <Skills />
        <ProjectsGrid />
        <CPDashboard />
        <BlogPreview posts={posts} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
