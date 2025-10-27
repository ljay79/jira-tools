// Node required code block
const debug = require("./debug.gs").debug;
// End of Node required code block

/** @OnlyCurrentDoc
 * ADF → Plaintext converter and Google Sheets custom functions for jira-tools.
 * Drop-in for Google Apps Script (V8).
 */

/* ============================================================================
 * Namespace bootstrap (keeps globals tidy while exposing jira-tools helpers)
 * ========================================================================== */
var JiraTools = (typeof JiraTools !== 'undefined' && JiraTools) || {};

(function (ns) {
  'use strict';

  /**
   * Lightweight, fail-safe Atlassian Document Format (ADF) → Plaintext converter.
   *
   * - Produces plain text only (with configurable line breaks).
   * - Optimized for Apps Script (V8) and batch operations.
   * - Safely ignores unsupported nodes; descends into children when possible.
   * - Suitable for Google Sheets custom functions or programmatic use.
   */
  class ADFPlaintext {
    /**
     * @param {Object=} opts Optional configuration.
     * @param {string=} opts.lineBreak Line break sequence (e.g., "\n" or "\r\n"). Default "\n".
     * @param {number=} opts.maxOut Maximum number of output characters per document. Default 50000.
     */
    constructor(opts) {
      opts = opts || {};
      /** @private @type {string} */
      this.lb = typeof opts.lineBreak === 'string' ? opts.lineBreak : '\n';
      /** @private @type {number} */
      this.maxOut = typeof opts.maxOut === 'number' ? opts.maxOut : 50000;
    }

    /**
     * Sets the default line break sequence.
     * @param {string} lineBreak Line break string (e.g., "\n" or "\r\n").
     * @return {void}
     */
    setLineBreak(lineBreak) {
      if (typeof lineBreak === 'string') this.lb = lineBreak;
    }

    /**
     * Gets the current default line break sequence.
     * @return {string}
     */
    getLineBreak() {
      return this.lb;
    }

    /**
     * Converts a single ADF document (object or JSON string) to plain text.
     * Output contains only characters and line breaks (Phase 1 requirement).
     *
     * @param {Object|string} adf ADF document or its JSON string.
     * @param {string=} overrideLineBreak Optional line break override for this call.
     * @return {string} Plain text output.
     */
    toString(adf, overrideLineBreak) {
      var INTERNAL_NL = '\n'; // internal normalization to '\n'
      var MAX_OUT = this.maxOut;

      /** @type {string[]} */
      var out = [];
      /** @type {number} */
      var outLen = 0;

      function push(s) {
        if (!s) return;
        if (outLen >= MAX_OUT) return;
        s = String(s);
        out.push(s);
        outLen += s.length;
      }

      function nl() { push(INTERNAL_NL); }

      function textOf(s) {
        // normalize NBSP to space; strip CR (we control newlines)
        return String(s).replace(/\u00A0/g, ' ').replace(/\r/g, '');
      }

      function visitArray(arr) {
        if (!arr || arr.length === 0) return;
        for (var i = 0; i < arr.length; i++) visit(arr[i]);
      }

      function visit(node) {
        if (!node || typeof node !== 'object') return;
        var t = node.type;
        var attrs = node.attrs || null;

        switch (t) {
          case 'doc':
            visitArray(node.content);
            break;

          // Block-like: end with newline
          case 'paragraph':
          case 'heading':
          case 'blockquote':
          case 'panel':
          case 'expand':
          case 'layoutSection':
          case 'layoutColumn':
            visitArray(node.content);
            nl();
            break;

          // Inline text
          case 'text':
            push(textOf(node.text || ''));
            break;

          // Explicit line breaks / rules
          case 'hardBreak':
          case 'rule':
            nl();
            break;

          // Lists and items: flatten, keep simple newline separation
          case 'bulletList':
          case 'orderedList':
          case 'listItem':
          case 'codeBlock':
            visitArray(node.content);
            nl();
            break;

          // Mentions / emoji: render readable tokens
          case 'emoji':
            if (attrs && attrs.shortName) push(textOf(attrs.shortName));
            break;

          case 'mention':
            if (attrs && attrs.text) push(textOf(attrs.text));
            else if (attrs && attrs.id != null) push('@' + attrs.id);
            break;

          // Smart cards: prefer URL as plain text
          case 'inlineCard':
          case 'blockCard':
            if (attrs && attrs.url) push(textOf(attrs.url));
            else if (attrs && attrs.data && attrs.data.url) push(textOf(attrs.data.url));
            nl();
            break;

          // Media: no textual content
          case 'mediaSingle':
          case 'mediaGroup':
          case 'media':
            break;

          // Tables: rows end with newline; cells separated by a space
          case 'table':
          case 'tableRow':
            visitArray(node.content);
            nl();
            break;

          case 'tableCell':
          case 'tableHeader': {
            var before = outLen;
            visitArray(node.content);
            // Minimal separator to avoid word squashing (Phase 1: plaintext only)
            push(' ');
            break;
          }

          // Other known nodes that should act like blocks (best-effort)
          case 'decisionList':
          case 'decisionItem':
          case 'taskList':
          case 'taskItem':
          case 'heading_1':
          case 'heading_2':
          case 'heading_3':
          case 'heading_4':
          case 'heading_5':
          case 'heading_6':
            visitArray(node.content);
            nl();
            break;

          // Fallback: descend into content if present
          default:
            if (node.content && node.content.length) visitArray(node.content);
            break;
        }
      }

      var root;
      try {
        root = (adf && typeof adf === 'object' && adf.type) ? adf : JSON.parse(adf);
      } catch (e) {
        return '';
      }

      try {
        visit(root);
        var result = out.join('');

        // Normalize trailing spaces and collapse excessive blank lines.
        result = result
          .replace(/[ \t]+\n/g, '\n') // remove trailing spaces before newline
          .replace(/\n{3,}/g, '\n\n') // at most one blank empty line
          .trim();

        var lb = (typeof overrideLineBreak === 'string') ? overrideLineBreak : this.lb;
        return (lb === INTERNAL_NL) ? result : result.split(INTERNAL_NL).join(lb);
      } catch (e2) {
        return '';
      }
    }

    /**
     * Converts multiple ADF documents to plaintext.
     * Accepts 1D or 2D arrays (e.g., Google Sheets ranges) and preserves input shape.
     *
     * @param {Array|Object|string} items Array of items, 2D range, or single item.
     * @param {string=} overrideLineBreak Optional line break override.
     * @return {Array|string} Converted plaintext(s) preserving the input shape.
     */
    toStrings(items, overrideLineBreak) {
      if (!items) return '';

      // 2D arrays (Google Sheets ranges)
      if (Array.isArray(items) && Array.isArray(items[0])) {
        var rows = items.length, cols = items[0].length;
        var res2d = new Array(rows);
        for (var r = 0; r < rows; r++) {
          var row = new Array(cols);
          for (var c = 0; c < cols; c++) {
            var v2 = items[r][c];
            row[c] = this.toString((v2 && typeof v2 === 'object') ? v2 : String(v2 || ''), overrideLineBreak);
          }
          res2d[r] = row;
        }
        return res2d;
      }

      // 1D arrays
      if (Array.isArray(items)) {
        var n = items.length;
        var res = new Array(n);
        for (var i = 0; i < n; i++) {
          var v = items[i];
          res[i] = this.toString((v && typeof v === 'object') ? v : String(v || ''), overrideLineBreak);
        }
        return res;
      }

      // Single value
      return this.toString(items, overrideLineBreak);
    }
  }

  // Expose class and helpers in namespace for programmatic use
  ns.ADFPlaintext = ADFPlaintext;

  /** @type {ADFPlaintext|undefined} */
  var _ADF_PARSER_NS; // module-local singleton

  /**
   * Returns a memoized ADFPlaintext instance for reuse across warm runs.
   * Adjust defaults here to fit jira-tools configuration.
   * @return {ADFPlaintext}
   */
  function getAdfPlaintext() {
    return _ADF_PARSER_NS || (_ADF_PARSER_NS = new ADFPlaintext({
      lineBreak: '\n',
      maxOut: 50000
    }));
  }

  /**
   * Convenience wrapper for programmatic use:
   * @param {Object|string} input ADF object or JSON string.
   * @param {string=} lineBreak Optional override line break.
   * @return {string}
   */
  ns.adfToText = function (input, lineBreak) {
    return getAdfPlaintext().toString(input, lineBreak);
  };

  /**
   * Convenience wrapper for batch/range inputs:
   * @param {Array|Object|string} rangeOrJsons 1D/2D array or single value.
   * @param {string=} lineBreak Optional override line break.
   * @return {Array|string}
   */
  ns.adfBatchToText = function (rangeOrJsons, lineBreak) {
    return getAdfPlaintext().toStrings(rangeOrJsons, lineBreak);
  };

})(JiraTools);

/* ============================================================================
 * Top-level Custom Functions (MUST be top-level so Sheets can detect them)
 * ========================================================================== */

/** @type {JiraTools.ADFPlaintext|undefined} */
var _ADF_PARSER; // lazy singleton for custom functions

/**
 * Returns a memoized parser instance for custom functions.
 * @return {JiraTools.ADFPlaintext}
 */
function getAdfParser_() {
  // Construct via namespace class; fast and reused on warm starts
  return _ADF_PARSER || (_ADF_PARSER = new JiraTools.ADFPlaintext({
    lineBreak: '\n',
    maxOut: 50000
  }));
}

/**
 * Convert one ADF document to plain text.
 *
 * Examples (DE locale uses semicolons):
 *   =JST_ADF_TO_TEXT(A1)
 *   =JST_ADF_TO_TEXT(A1; CHAR(10))             // "\n"
 *   =JST_ADF_TO_TEXT(A1; CHAR(13)&CHAR(10))    // "\r\n"
 *
 * @param {string|Object} input ADF JSON or object
 * @param {string=} lineBreak Optional line break override (e.g., "\r\n")
 * @return {string} Plain text
 * @customfunction
 */
function JST_ADF_TO_TEXT(input, lineBreak) {
  try {
    return getAdfParser_().toString(input, lineBreak);
  } catch (e) {
    return '';
  }
}

/**
 * Convert a range/list of ADFs to plain text.
 * Preserves the input range shape (2D arrays in, 2D arrays out).
 *
 * Examples:
 *   =JST_ADF_BATCH_TO_TEXT(A1:B10)
 *   =JST_ADF_BATCH_TO_TEXT(A1:B10; CHAR(10))
 *
 * @param {Array|Object|string} rangeOrJsons 2D/1D array or single value
 * @param {string=} lineBreak Optional line break override
 * @return {Array|string} Plain text(s), preserving shape
 * @customfunction
 */
function JST_ADF_BATCH_TO_TEXT(rangeOrJsons, lineBreak) {
  try {
    return getAdfParser_().toStrings(rangeOrJsons, lineBreak);
  } catch (e) {
    return [['']];
  }
}
