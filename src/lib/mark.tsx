import { Fragment, type ReactNode } from "react";

/**
 * Render a string that may contain <mark>...</mark> tags as safe React nodes.
 * All other HTML is escaped. Only <mark> is treated as markup.
 */
export function renderMarked(input: string | null | undefined): ReactNode {
  if (!input) return null;

  const parts: ReactNode[] = [];
  const regex = /<mark>(.*?)<\/mark>/gs;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(input)) !== null) {
    const [full, inner] = match;
    if (match.index > lastIndex) {
      parts.push(
        <Fragment key={key++}>{input.slice(lastIndex, match.index)}</Fragment>,
      );
    }
    parts.push(
      <mark
        key={key++}
        className="rounded-sm bg-gold-500/25 px-0.5 text-gold-500"
      >
        {inner}
      </mark>,
    );
    lastIndex = match.index + full.length;
  }

  if (lastIndex < input.length) {
    parts.push(<Fragment key={key++}>{input.slice(lastIndex)}</Fragment>);
  }

  return parts.length ? parts : input;
}
