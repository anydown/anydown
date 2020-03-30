function isStartWith(line, chara) {
  return line.trim().indexOf(chara) === 0;
}
function isHeading(line) {
  return isStartWith(line, "#");
}
function isList(line) {
  return isStartWith(line, "-") ||  isStartWith(line, "*");
}
function removeMarkup(line, chara) {
  return line
    .trim()
    .replace(chara, "")
    .trim();
}

export function compileKanban(input) {
  const lines = input.split(/[\r|\n|\r\n]/);
  const output = [];
  let cards = [];
  lines.forEach(function(line) {
    if (isHeading(line)) {
      cards = [];

      output.push({
        name: removeMarkup(line, "#"),
        cards: cards
      });
    } else if (isList(line)) {
      cards.push(removeMarkup(removeMarkup(line, "-"), "*"));
    }
  });
  return output;
}

function cardsToString(cards) {
  return cards.map(toList).join("\n");
}

function toList(card) {
  return "- " + card;
}

export function serializeKanban(data) {
  return (
    data
      .map(item => {
        return `# ${item.name}\n${cardsToString(item.cards)}`;
      })
      .join("\n\n") +
    "\n"
  );
}
