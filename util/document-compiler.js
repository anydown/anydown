export function compile(input) {
  return input.split("```").map((block, index) => {
    //必ず奇数indexがcode blockになる
    let type = "markdown";
    if (index % 2 === 1) {
      if (block.indexOf("kanban") === 0) {
        type = "kanban";
      }
      if (block.indexOf("gantt") === 0) {
        type = "gantt";
      }
      if (block.indexOf("csv") === 0) {
        type = "csv";
      }
      if (block.indexOf("block") === 0) {
        type = "block";
      }
      if (block.indexOf("\n") === 0) {
        type = "plain";
      }
    }
    return {
      text: block,
      type: type,
      id: index
    };
  })
}


