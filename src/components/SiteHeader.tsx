import logo from "@/assets/tiny-wisdom-logo.png";
import { ArrowUpRight, ChevronDown, Wrench } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Tool = {
  name: string;
  url: string;
};

const tools: Tool[] = [
  { name: "Blog to Carousel", url: "https://slides.thetinywisdom.com" },
  { name: "Blog to Quotes", url: "https://tweet.thetinywisdom.com" },
  { name: "Blog Thumbnail Editor", url: "https://thumbnail.thetinywisdom.com" },
  { name: "Comic Strip Editor", url: "https://editor.thetinywisdom.com" },
];

interface SiteHeaderProps {
  children?: React.ReactNode;
}

export const SiteHeader = ({ children }: SiteHeaderProps) => {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <a
          href="https://thetinywisdom.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 hover:opacity-90 transition"
        >
          <img src={logo} alt="The Tiny Wisdom" className="h-7 w-auto" />
        </a>

        <div className="flex items-center gap-4">
          {children}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-accent transition outline-none">
              <Wrench className="h-4 w-4" />
              Tools
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {tools.map((tool) => (
                <DropdownMenuItem key={tool.url} asChild>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span>{tool.name}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};