const assert = require('node:assert/strict');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

class TestElement {
  constructor(namespaceURI, tagName, ownerDocument) {
    this.namespaceURI = namespaceURI;
    this.tagName = tagName;
    this.ownerDocument = ownerDocument;
    this.attributes = new Map();
    this.children = [];
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  append(...children) {
    this.children.push(...children);
  }

  replaceChildren(...children) {
    this.children = children;
  }
}

class TestDocument {
  createElementNS(namespaceURI, tagName) {
    return new TestElement(namespaceURI, tagName, this);
  }
}

const importDist = (fileName) => import(pathToFileURL(resolve(__dirname, '..', 'dist', fileName)).href);

const run = async () => {
  const { ServiceCheckOutlineData } = await importDist('data.js');
  const { createSvgIconElement, renderSvgIcon, renderSvgIconToString } = await importDist('vanilla.js');
  const documentRef = new TestDocument();

  const created = createSvgIconElement(
    ServiceCheckOutlineData,
    { width: 32, className: 'check-icon', focusable: null },
    documentRef,
  );
  assert.equal(created.tagName, 'svg');
  assert.equal(created.namespaceURI, 'http://www.w3.org/2000/svg');
  assert.equal(created.getAttribute('width'), '32');
  assert.equal(created.getAttribute('class'), 'check-icon');
  assert.equal(created.getAttribute('focusable'), null);
  assert.equal(created.children[0].tagName, 'path');

  const existing = documentRef.createElementNS('http://www.w3.org/2000/svg', 'svg');
  existing.setAttribute('data-owner', 'consumer');
  existing.append(documentRef.createElementNS('http://www.w3.org/2000/svg', 'circle'));
  const rendered = renderSvgIcon(existing, ServiceCheckOutlineData, { height: 40, className: 'updated' });
  assert.equal(rendered, existing);
  assert.equal(existing.getAttribute('data-owner'), 'consumer');
  assert.equal(existing.getAttribute('height'), '40');
  assert.equal(existing.getAttribute('class'), 'updated');
  assert.equal(existing.children.length, ServiceCheckOutlineData.children.length);
  assert.equal(existing.children[0].tagName, 'path');

  const markup = renderSvgIconToString(ServiceCheckOutlineData, {
    width: 24,
    className: 'check&icon',
    'aria-label': 'Ready <now>',
    focusable: undefined,
  });
  assert.match(markup, /^<svg/);
  assert.match(markup, /width="24"/);
  assert.match(markup, /class="check&amp;icon"/);
  assert.match(markup, /aria-label="Ready &lt;now&gt;"/);
  assert.doesNotMatch(markup, /focusable=/);
  assert.match(markup, /<path/);

  console.log('all vanilla SVG utilities work');
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
