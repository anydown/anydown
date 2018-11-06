export function compileKanban(input) {
  var lines = input.split(/[\r|\n|\r\n]/);
  var output = [];
  var cards = [];
  lines.forEach(function(line) {
    if (line.trim().indexOf("#") === 0) {
      cards = [];

      output.push({
        name: line
          .trim()
          .replace("#", "")
          .trim(),
        cards: cards
      });
    } else if (line.trim().indexOf("*") === 0) {
      cards.push(
        line
          .trim()
          .replace("*", "")
          .trim()
      );
    }
  });
  return output;
}

export function serializeKanban(data) {
  return (
    "kanban\n" +
    data
      .map(item => {
        return (
          `# ${item.name}\n` +
          item.cards
            .map(card => {
              return "* " + card;
            })
            .join("\n")
        );
      })
      .join("\n") +
    "\n"
  );
}
