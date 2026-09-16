import type { SvgIconDefinition, SvgIconNode } from './svg-data';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/**
 * Атрибуты корневого элемента `svg`, переопределяющие атрибуты из описания иконки.
 * `className` преобразуется в нативный атрибут `class`; `null` и `undefined` удаляют атрибут.
 */
export type SvgIconAttributes = Record<string, string | number | boolean | null | undefined>;

const resolveAttributeName = (name: string) => (name === 'className' ? 'class' : name);

const applyAttributes = (element: Element, attributes: SvgIconAttributes) => {
  Object.entries(attributes).forEach(([originalName, value]) => {
    const name = resolveAttributeName(originalName);

    if (value === null || value === undefined) {
      element.removeAttribute(name);
    } else {
      element.setAttribute(name, String(value));
    }
  });
};

const createNode = (documentRef: Document, node: SvgIconNode): SVGElement => {
  const element = documentRef.createElementNS(SVG_NAMESPACE, node.tag);
  applyAttributes(element, node.attributes);
  node.children?.forEach((child) => element.append(createNode(documentRef, child)));
  return element;
};

/**
 * Заполняет существующий элемент `svg` данными иконки.
 *
 * Функция заменяет все дочерние узлы элемента, применяет атрибуты иконки и затем пользовательские атрибуты.
 * Подходит для разметки, в которой корневой `svg` уже создан шаблонизатором, а также для смены иконки без замены
 * самого DOM-элемента. Атрибуты существующего элемента, которых нет в описании и переданных `attributes`, сохраняются.
 *
 * @param element Существующий нативный элемент `svg`, который нужно заполнить.
 * @param icon Независимое от фреймворка описание иконки из `@admiral-ds/admiral3-icons/data` или `flags-data`.
 * @param attributes Атрибуты корневого `svg`, переопределяющие значения из описания иконки.
 * @returns Тот же экземпляр `element`, переданный первым аргументом.
 *
 * @example
 * ```ts
 * const svg = document.querySelector<SVGSVGElement>('#status-icon');
 * if (svg) renderSvgIcon(svg, ServiceCheckOutlineData, { width: 24, height: 24 });
 * ```
 */
export const renderSvgIcon = (
  element: SVGSVGElement,
  icon: SvgIconDefinition,
  attributes: SvgIconAttributes = {},
): SVGSVGElement => {
  applyAttributes(element, { ...icon.attributes, ...attributes });
  element.replaceChildren(...icon.children.map((node) => createNode(element.ownerDocument, node)));
  return element;
};

/**
 * Создаёт новый нативный `SVGSVGElement` и заполняет его данными иконки.
 *
 * Это основной вариант для императивного создания иконки: вызывающий код получает новый DOM-элемент и сам выбирает,
 * куда его добавить. Внутри функция использует {@link renderSvgIcon}, поэтому правила применения атрибутов совпадают.
 *
 * @param icon Независимое от фреймворка описание иконки из `@admiral-ds/admiral3-icons/data` или `flags-data`.
 * @param attributes Атрибуты создаваемого `svg`, переопределяющие значения из описания иконки.
 * @param documentRef Документ, в котором создаётся элемент. По умолчанию используется глобальный `document`.
 * @returns Новый, ещё не добавленный в DOM элемент `SVGSVGElement`.
 *
 * @example
 * ```ts
 * const icon = createSvgIconElement(ServiceCheckOutlineData, { width: 24, height: 24 });
 * document.body.append(icon);
 * ```
 */
export const createSvgIconElement = (
  icon: SvgIconDefinition,
  attributes: SvgIconAttributes = {},
  documentRef: Document = document,
): SVGSVGElement => {
  const element = documentRef.createElementNS(SVG_NAMESPACE, 'svg');
  return renderSvgIcon(element, icon, attributes);
};

const escapeAttribute = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const renderNodeToString = (node: SvgIconNode): string => {
  const attributes = Object.entries(node.attributes)
    .map(([name, value]) => ` ${name}="${escapeAttribute(value)}"`)
    .join('');
  const children = node.children?.map(renderNodeToString).join('') ?? '';
  return children ? `<${node.tag}${attributes}>${children}</${node.tag}>` : `<${node.tag}${attributes}/>`;
};

/**
 * Преобразует описание иконки в SVG-строку без обращения к DOM.
 *
 * Значения атрибутов экранируются перед добавлением в разметку. Функция предназначена для SSR, генераторов статических
 * страниц и серверных шаблонизаторов. Для работы с DOM предпочтительнее {@link createSvgIconElement} или
 * {@link renderSvgIcon}.
 *
 * @param icon Независимое от фреймворка описание иконки из `@admiral-ds/admiral3-icons/data` или `flags-data`.
 * @param attributes Атрибуты корневого `svg`, переопределяющие значения из описания иконки.
 * @returns Полная SVG-разметка, включая корневой элемент `svg`.
 *
 * @example
 * ```ts
 * const markup = renderSvgIconToString(ServiceCheckOutlineData, { width: 24, height: 24 });
 * ```
 */
export const renderSvgIconToString = (icon: SvgIconDefinition, attributes: SvgIconAttributes = {}): string => {
  const mergedAttributes = { ...icon.attributes, ...attributes };
  const svgAttributes = Object.entries(mergedAttributes)
    .filter((entry): entry is [string, string | number | boolean] => entry[1] !== null && entry[1] !== undefined)
    .map(([name, value]) => ` ${resolveAttributeName(name)}="${escapeAttribute(String(value))}"`)
    .join('');
  return `<svg${svgAttributes}>${icon.children.map(renderNodeToString).join('')}</svg>`;
};

export type { SvgIconDefinition, SvgIconNode } from './svg-data';
