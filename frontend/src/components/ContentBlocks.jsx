// Renders admin-editable free text as simple, styled HTML. Supports a tiny
// markdown-like syntax so the admin gets some structure from a plain
// <textarea> without needing a full rich text editor:
//   - blank line              -> paragraph break
//   - a line starting "## "   -> heading
//   - a line starting "- "    -> bullet list item
export default function ContentBlocks({ text }) {
  if (!text) return null;

  const blocks = [];
  let currentList = null;
  let currentPara = [];

  const flushPara = () => {
    if (currentPara.length) {
      blocks.push({ type: 'p', content: currentPara.join(' ') });
      currentPara = [];
    }
  };
  const flushList = () => {
    if (currentList) {
      blocks.push({ type: 'ul', items: currentList });
      currentList = null;
    }
  };

  text.split('\n').forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      flushPara();
      flushList();
      return;
    }
    if (line.startsWith('## ')) {
      flushPara();
      flushList();
      blocks.push({ type: 'h2', content: line.slice(3) });
      return;
    }
    if (line.startsWith('- ')) {
      flushPara();
      if (!currentList) currentList = [];
      currentList.push(line.slice(2));
      return;
    }
    flushList();
    currentPara.push(line);
  });
  flushPara();
  flushList();

  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === 'h2') return <h2 key={i}>{block.content}</h2>;
        if (block.type === 'ul') {
          return (
            <ul key={i}>
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{block.content}</p>;
      })}
    </>
  );
}
