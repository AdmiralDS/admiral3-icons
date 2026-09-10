/** Описание одного вложенного SVG-узла и его дочерних элементов. */
export interface SvgIconNode {
  readonly tag: string;
  readonly attributes: Readonly<Record<string, string>>;
  readonly children?: readonly SvgIconNode[];
}

/** Независимое от UI-фреймворка описание полноценной SVG-иконки. */
export interface SvgIconDefinition {
  readonly name: string;
  readonly category: string;
  readonly attributes: Readonly<Record<string, string>>;
  readonly children: readonly SvgIconNode[];
}
