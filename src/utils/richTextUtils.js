import ReactQuill from "react-quill";

const Quill = ReactQuill.Quill;
const Size = Quill.import("attributors/style/size");
const BaseImage = Quill.import("formats/image");
const BlockEmbed = Quill.import("blots/block/embed");
const icons = Quill.import("ui/icons");
const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "32px", "48px"];

Size.whitelist = FONT_SIZES;

class TitledImage extends BaseImage {
  static create(value) {
    const imageValue = typeof value === "string" ? { url: value } : value || {};
    const node = super.create(imageValue.url || "");

    if (imageValue.alt) {
      node.setAttribute("alt", imageValue.alt);
    }

    if (imageValue.title) {
      node.setAttribute("title", imageValue.title);
    }

    return node;
  }

  static value(node) {
    return {
      url: node.getAttribute("src") || "",
      alt: node.getAttribute("alt") || "",
      title: node.getAttribute("title") || "",
    };
  }
}

TitledImage.blotName = "image";
TitledImage.tagName = "IMG";

const clampNumber = (value, min, max, fallback) => {
  const numberValue = Number.parseInt(value, 10);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.min(Math.max(numberValue, min), max);
};

const buildTableHTML = (rows, columns) => {
  const tableStyle = "border-collapse:collapse;width:100%;margin:12px 0;";
  const cellStyle = "border:1px solid #d1d5db;padding:8px;min-width:80px;";
  const body = Array.from({ length: rows }, () =>
    `<tr>${Array.from({ length: columns }, () => `<td style="${cellStyle}">&nbsp;</td>`).join("")}</tr>`
  ).join("");

  return `<table style="${tableStyle}"><tbody>${body}</tbody></table>`;
};

// ponytail: static table insert for simple content; use a table-capable editor if cell editing matters.
class TableBlock extends BlockEmbed {
  static create(value = {}) {
    const node = super.create();
    const rows = clampNumber(value.rows, 1, 12, 2);
    const columns = clampNumber(value.columns, 1, 8, 2);

    node.setAttribute("data-rows", rows);
    node.setAttribute("data-columns", columns);
    node.innerHTML = value.html || buildTableHTML(rows, columns);

    return node;
  }

  static value(node) {
    return {
      rows: clampNumber(node.getAttribute("data-rows"), 1, 12, 2),
      columns: clampNumber(node.getAttribute("data-columns"), 1, 8, 2),
      html: node.innerHTML,
    };
  }
}

TableBlock.blotName = "tableBlock";
TableBlock.className = "ql-table-block";
TableBlock.tagName = "DIV";

icons.tableBlock = `
  <svg viewBox="0 0 18 18">
    <rect class="ql-stroke" height="12" width="12" x="3" y="3"></rect>
    <line class="ql-stroke" x1="3" x2="15" y1="7" y2="7"></line>
    <line class="ql-stroke" x1="3" x2="15" y1="11" y2="11"></line>
    <line class="ql-stroke" x1="7" x2="7" y1="3" y2="15"></line>
    <line class="ql-stroke" x1="11" x2="11" y1="3" y2="15"></line>
  </svg>
`;

const injectEditorPickerStyles = () => {
  if (typeof document === "undefined" || document.getElementById("rich-text-picker-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "rich-text-picker-styles";
  style.innerHTML = FONT_SIZES.map(
    (size) => `
      .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="${size}"]::before,
      .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="${size}"]::before {
        content: "${size}";
      }
    `
  ).join("");
  document.head.appendChild(style);
};

injectEditorPickerStyles();

Quill.register(Size, true);
Quill.register(TitledImage, true);
Quill.register(TableBlock, true);

const promptNumber = (message, defaultValue, maxValue) => {
  const value = window.prompt(message, String(defaultValue));

  if (value === null) {
    return null;
  }

  return clampNumber(value, 1, maxValue, defaultValue);
};

const imageHandler = function () {
  const url = window.prompt("Image URL");
  if (!url) return;

  const alt = window.prompt("Image alt text", "") || "";
  const title = window.prompt("Image title", "") || "";
  const range = this.quill.getSelection(true);

  this.quill.insertEmbed(range.index, "image", { url, alt, title }, "user");
  this.quill.setSelection(range.index + 1, 0);
};

const tableHandler = function () {
  const rows = promptNumber("Rows", 2, 12);
  if (rows === null) return;

  const columns = promptNumber("Columns", 2, 8);
  if (columns === null) return;

  const range = this.quill.getSelection(true);

  this.quill.insertEmbed(range.index, "tableBlock", { rows, columns }, "user");
  this.quill.insertText(range.index + 1, "\n", "user");
  this.quill.setSelection(range.index + 2, 0);
};

export const editorModules = {
  toolbar: {
    container: [
      [
        { header: [1, 2, 3, 4, 5, 6, false] },
        { size: [false, ...FONT_SIZES] },
      ],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }, { direction: "rtl" }],
      ["blockquote", "code-block"],
      ["link", "image", "video", "tableBlock"],
      ["clean"],
    ],
    handlers: {
      image: imageHandler,
      tableBlock: tableHandler,
    },
  },
  clipboard: {
    matchVisual: false,
  },
};

export const editorFormats = [
  "header",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "script",
  "list",
  "bullet",
  "indent",
  "align",
  "direction",
  "blockquote",
  "code-block",
  "link",
  "image",
  "video",
  "tableBlock",
];

export const hasVisibleEditorContent = (value) => {
  if (!value || typeof value !== "string") {
    return false;
  }

  const plainText = value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();

  return plainText.length > 0;
};
