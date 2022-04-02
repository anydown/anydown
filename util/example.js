import { ganttExample, csvExample, blockExample } from "./menu";

export const example = `# anydown

---

## What is anydown?

- Markdown Notepad
- Some components for scheduling
  - Kanban board, Gantt chart, etc.
- Just a plain text, useful for sharing
- All data is stored in local storage

---

\`\`\`kanban
# TODO
- Double-click to edit
- Drag and drop to reorder

# DONE
- Task 1
- Task 2
\`\`\`

3 columns

\`\`\`kanban
# BACKLOG
- Multiple kanbans in one page
# TODO
- Drag and drop to other kanban
# DONE
\`\`\`


# Gantt Chart

${ganttExample}

# Spread Sheet

${csvExample}

# Block Diagram

${blockExample}

`;
