export function compile(input) {
  return input.split("```").map((block, index) => {
    //必ず奇数indexがcode blockになる
    let type = "markdown-block";
    if (index % 2 === 1) {
      if (block.indexOf("kanban") === 0) {
        type = "code-block-kanban";
      }
      if (block.indexOf("gantt") === 0) {
        type = "code-block-gantt";
      }
      if (block.indexOf("csv") === 0) {
        type = "code-block-csv";
      }
      if (block.indexOf("block") === 0) {
        type = "code-block-block";
      }
      if (block.indexOf("\n") === 0) {
        type = "code-block-pre";
      }
    }
    return {
      text: block,
      type: type,
      id: index
    };
  })
}


