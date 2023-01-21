
interface Node {
  ID:        string;
	Name:      string;
	Value:     any;
	Parent:    string|undefined;
	Linked:    {[index: string]: string[]}; // Rel => IDs
	Attrs:     {[index: string]: string};
}

const uniqueId = () => {
  const dateString = Date.now().toString(36);
  const randomness = Math.random().toString(36).substring(2);
  return dateString + randomness;
};

export function newNode(name: string): Node {
  return {ID: uniqueId(), Name: name, Linked: {Children: []}, Attrs: {}};
}

export function generateNodes(count: number): Node[] {
  const nodes: Node[] = [];
  for (let i: number = 0; i<count; i++) {
    nodes.push(newNode(generateWords(randomNumber(2, 6))));
  }
  return nodes;
}

export function generateNodeTree(count: number): {[index: string]: Node} {
  const nodes: {[index: string]: Node} = {};
  const generated: Node[] = generateNodes(count);
  generated.forEach(n => {
    nodes[n.ID] = n;
    if (randomNumber(0,4) > 0) {
      n.Parent = generated[randomNumber(0, count-1)].ID;
    }
  })
  for (const [id, n] of Object.entries(nodes)) {
    if (n.Parent === n.ID) {
      n.Parent = undefined;
    }
    if (n.Parent) {
      nodes[n.Parent].Linked.Children.push(n.ID);
    }
  }
  return nodes;
}

const words = [
  'Got',
  'ability',
  'shop',
  'recall',
  'fruit',
  'easy',
  'dirty',
  'giant',
  'shaking',
  'ground',
  'weather',
  'lesson',
  'almost',
  'square',
  'forward',
  'bend',
  'cold',
  'broken',
  'distant',
  'adjective'
]
function getRandomWord(firstLetterToUppercase = false) {
  const word = words[randomNumber(0, words.length - 1)]
  return firstLetterToUppercase ? word.charAt(0).toUpperCase() + word.slice(1) : word
}
function generateWords(length = 10) {
  return (
      [...Array(length)]
          .map((_, i) => getRandomWord(i === 0))
          .join(' ')
          .trim()
  )
}
function randomNumber(min, max) {
  return Math.round(Math.random() * (max - min) + min)
}