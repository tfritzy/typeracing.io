import { ChatBubble, OpenBook } from "iconoir-react";

export function Footer() {
  return (
    <div className="fixed bottom-0 left-0 w-full flex flex-row space-x-8 justify-center p-2 text-text-secondary">
      <a href="/roadmap" className="flex flex-row space-x-2">
        <OpenBook width={16} />
        <span>Roadmap</span>
      </a>
      <a
        href="https://www.reddit.com/r/typeracing_io/"
        className="flex flex-row space-x-2"
      >
        <ChatBubble width={16} />
        <span>Suggestions</span>
      </a>
    </div>
  );
}
