import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { AdSlot } from "./AdSlot";
import { RelatedTools } from "./RelatedTools";
import { KeywordTags } from "./KeywordTags";
import { RelatedPosts } from "./RelatedPosts";
import { ToolHeader } from "./ToolHeader";
import { HowToUse } from "./HowToUse";
import { SocialShare } from "./SocialShare";
import { BuyMeCoffee } from "./BuyMeCoffee";
import { getRelatedPostsForTool } from "@/lib/blog-data";
import type { Tool } from "@/lib/tools-config";

interface ToolLayoutProps {
  tool: Tool;
  relatedTools?: Tool[];
  howToSteps?: string[];
  children: React.ReactNode;
}

export function ToolLayout({ tool, relatedTools = [], howToSteps, children }: ToolLayoutProps) {
  const relatedPosts = getRelatedPostsForTool(tool.url);

  const shareTitle = `${tool.name} — Free Online Tool | tinkrkit.dev`;
  const shareUrl = `https://tinkrkit.dev${tool.url}`;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <ToolHeader
          title={tool.name}
          description={tool.description}
          category={tool.category}
        />

        <div className="flex gap-8">
          {/* Tool content + below sections */}
          <div className="min-w-0 flex-1">
            {children}

            {/* Social share — after output */}
            <SocialShare variant="tool" title={shareTitle} url={shareUrl} />

            {/* Buy Me a Coffee — below share buttons */}
            <BuyMeCoffee variant="inline" />

            {/* How to use section */}
            <HowToUse tool={tool} steps={howToSteps} />

            {/* 1. Keyword tags */}
            <KeywordTags keywords={tool.keywords} />

            {/* 2. Related Tools — 4 cards */}
            <RelatedTools tools={relatedTools} />

            {/* 3. Related Posts */}
            <RelatedPosts posts={relatedPosts} />

            {/* AdSense slot — below output, mobile only */}
            <div className="mt-6 xl:hidden">
              <AdSlot variant="below-output" />
            </div>
          </div>

          {/* AdSense slot — sidebar, desktop only */}
          <aside className="hidden shrink-0 xl:block">
            <AdSlot variant="sidebar" className="sticky top-24" />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
