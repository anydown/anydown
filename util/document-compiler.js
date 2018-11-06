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
    }
    return {
      text: block,
      type: type,
      id: index
    };
  })
}


