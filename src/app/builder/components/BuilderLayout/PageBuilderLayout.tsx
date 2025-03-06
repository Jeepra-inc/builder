import {
  ResizablePanelGroup,
  ResizableHandle,
  ResizablePanel,
} from "@/components/ui/resizable";
import { PageBuilderLayoutProps } from "../../types";

export function PageBuilderLayout({
  leftSidebar,
  content,
  isLeftSidebarOpen,
}: PageBuilderLayoutProps) {
  return (
    <ResizablePanelGroup direction="horizontal" className="flex-grow">
      <ResizablePanel
        defaultSize={20}
        minSize={10}
        maxSize={30}
        className={`bg-white shadow-md ${!isLeftSidebarOpen ? "hidden" : ""}`}
      >
        {leftSidebar}
      </ResizablePanel>
      {isLeftSidebarOpen && <ResizableHandle withHandle />}
      <ResizablePanel
        minSize={50}
        className="flex justify-center items-center bg-zinc-100 relative"
      >
        {content}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
