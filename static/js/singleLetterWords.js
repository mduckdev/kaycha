// form array of all text nodes in parentNode
function allTextNodes(parentNode) {
    let arr = [];
    if (!parentNode) {
        return arr;
    }

    let nodes = parentNode.childNodes;
    nodes.forEach(node => {
        if (node.nodeName === 'SCRIPT') {
            return;
        }
        if (node.nodeType === Node.TEXT_NODE) {
            arr.push(node);
        } else {
            arr = arr.concat(allTextNodes(node));
        }
    });
    return arr;
}

// convert [space][letter][space] to [space][letter][non-breaking space];
const modifySingleCharWords = str => str.replace(/ ([a-zA-Z]) /g,
    ' $1' + '\u00A0');

function fixAllSingleCharWordsInBody() {
    let tNodes = allTextNodes(document.body);
    tNodes.forEach(tNode => {
        tNode.nodeValue = modifySingleCharWords(tNode.nodeValue);
    });
}
fixAllSingleCharWordsInBody();