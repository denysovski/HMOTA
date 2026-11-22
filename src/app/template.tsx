/**
 * Wraps every page. Arriving on a page (top of the page, fade-in) is handled in SmoothScroll on
 * every pathname change: a template only remounts when the first URL segment changes, so moving
 * from /projekty to /projekty/<slug> or between two projects would otherwise keep the old scroll.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page">{children}</div>;
}
