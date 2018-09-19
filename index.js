const bunyan = require('bunyan');
const fs = require('fs');
const { JSDOM } = require('jsdom');
const logger = bunyan.createLogger({ name: 'myapp' });

const targetElementId = 'make-everything-ok-button';

const getIndex = (node) => {
	let count = 1;
	for (let sibling = node.previousSibling; sibling; sibling = sibling.previousSibling) {
		if (sibling.nodeType === 1 && sibling.nodeName === node.nodeName) count += 1;
	}
	return count === 1 ? '' : `[${count}]`;
};

const getPath = (path, node) => {
	if (node && node.nodeType === 1) {
		path = getPath(` > ${node.nodeName.toLowerCase()}${getIndex(node)}${path}`, node.parentNode);
	}
	return path;
};

const getElementXPath = (node) => getPath('', node).substring(2);

try {
	const sourceFile = process.argv[2];
	const targetFile = process.argv[3];
	const dom = new JSDOM(fs.readFileSync(sourceFile));
	const sourceElement = dom.window.document.getElementById(targetElementId);
	const array = Array.prototype.slice.apply(sourceElement.attributes);
	const cssQuery = array.map(attr => `${sourceElement.nodeName.toLowerCase()}[${attr.name}="${attr.value}"]`).join(', ');
	const dom1 = new JSDOM(fs.readFileSync(targetFile));
	const elements = dom1.window.document.querySelectorAll(cssQuery);
	elements.forEach(element => {
		logger.info(getElementXPath(element));
	});
} catch (err) {
	logger.error('Error trying to find element', err);
}
