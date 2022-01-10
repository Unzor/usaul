var { parse } = (function() {
  "use strict";

  function parser$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function parser$SyntaxError(message, expected, found, location) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.location = location;
    this.name     = "SyntaxError";

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, parser$SyntaxError);
    }
  }

  parser$subclass(parser$SyntaxError, Error);

  parser$SyntaxError.buildMessage = function(expected, found) {
    var DESCRIBE_EXPECTATION_FNS = {
          literal: function(expectation) {
            return "\"" + literalEscape(expectation.text) + "\"";
          },

          "class": function(expectation) {
            var escapedParts = "",
                i;

            for (i = 0; i < expectation.parts.length; i++) {
              escapedParts += expectation.parts[i] instanceof Array
                ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])
                : classEscape(expectation.parts[i]);
            }

            return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
          },

          any: function(expectation) {
            return "any character";
          },

          end: function(expectation) {
            return "end of input";
          },

          other: function(expectation) {
            return expectation.description;
          }
        };

    function hex(ch) {
      return ch.charCodeAt(0).toString(16).toUpperCase();
    }

    function literalEscape(s) {
      return s
        .replace(/\\/g, '\\\\')
        .replace(/"/g,  '\\"')
        .replace(/\0/g, '\\0')
        .replace(/\t/g, '\\t')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
        .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
    }

    function classEscape(s) {
      return s
        .replace(/\\/g, '\\\\')
        .replace(/\]/g, '\\]')
        .replace(/\^/g, '\\^')
        .replace(/-/g,  '\\-')
        .replace(/\0/g, '\\0')
        .replace(/\t/g, '\\t')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
        .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
    }

    function describeExpectation(expectation) {
      return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
    }

    function describeExpected(expected) {
      var descriptions = new Array(expected.length),
          i, j;

      for (i = 0; i < expected.length; i++) {
        descriptions[i] = describeExpectation(expected[i]);
      }

      descriptions.sort();

      if (descriptions.length > 0) {
        for (i = 1, j = 1; i < descriptions.length; i++) {
          if (descriptions[i - 1] !== descriptions[i]) {
            descriptions[j] = descriptions[i];
            j++;
          }
        }
        descriptions.length = j;
      }

      switch (descriptions.length) {
        case 1:
          return descriptions[0];

        case 2:
          return descriptions[0] + " or " + descriptions[1];

        default:
          return descriptions.slice(0, -1).join(", ")
            + ", or "
            + descriptions[descriptions.length - 1];
      }
    }

    function describeFound(found) {
      return found ? "\"" + literalEscape(found) + "\"" : "end of input";
    }

    return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
  };

  function parser$parse(input, options) {
    options = options !== void 0 ? options : {};

    var parser$FAILED = {},

        parser$startRuleFunctions = { Program: parser$parseProgram },
        parser$startRuleFunction  = parser$parseProgram,

        parser$c0 = function(a, b) { return [a].concat(b).filter(x=>x!=null) },
        parser$c1 = function(a) { return [a].filter(x=>x!=null) },
        parser$c2 = "log(",
        parser$c3 = parser$literalExpectation("log(", false),
        parser$c4 = ")",
        parser$c5 = parser$literalExpectation(")", false),
        parser$c6 = function(a) { return [ 'log', a ]},
        parser$c7 = function(a, b, c) { return [b, a, c] },
        parser$c8 = function(a) { return a },
        parser$c9 = parser$otherExpectation("Parenthetical"),
        parser$c10 = "(",
        parser$c11 = parser$literalExpectation("(", false),
        parser$c12 = function(e) { return e },
        parser$c13 = "+",
        parser$c14 = parser$literalExpectation("+", false),
        parser$c15 = function() { return "add" },
        parser$c16 = "*",
        parser$c17 = parser$literalExpectation("*", false),
        parser$c18 = function() { return "multiply" },
        parser$c19 = "-",
        parser$c20 = parser$literalExpectation("-", false),
        parser$c21 = function() { return "subtract" },
        parser$c22 = "/",
        parser$c23 = parser$literalExpectation("/", false),
        parser$c24 = function() { return "divide" },
        parser$c25 = "%",
        parser$c26 = parser$literalExpectation("%", false),
        parser$c27 = function() { return "mod" },
        parser$c28 = "&&",
        parser$c29 = parser$literalExpectation("&&", false),
        parser$c30 = function() { return "and"},
        parser$c31 = "||",
        parser$c32 = parser$literalExpectation("||", false),
        parser$c33 = function() { return "or"},
        parser$c34 = "|",
        parser$c35 = parser$literalExpectation("|", false),
        parser$c36 = function() { return "map" },
        parser$c37 = "..",
        parser$c38 = parser$literalExpectation("..", false),
        parser$c39 = function() { return "range"},
        parser$c40 = "=",
        parser$c41 = parser$literalExpectation("=", false),
        parser$c42 = function() { return "equal"},
        parser$c43 = ":",
        parser$c44 = parser$literalExpectation(":", false),
        parser$c45 = function() { return "set"},
        parser$c46 = "/*",
        parser$c47 = parser$literalExpectation("/*", false),
        parser$c48 = "*/",
        parser$c49 = parser$literalExpectation("*/", false),
        parser$c50 = parser$anyExpectation(),
        parser$c51 = "//",
        parser$c52 = parser$literalExpectation("//", false),
        parser$c53 = parser$otherExpectation("Number"),
        parser$c54 = /^[0-9]/,
        parser$c55 = parser$classExpectation([["0", "9"]], false, false),
        parser$c56 = function(n) { return ["int", n.join('')] },
        parser$c57 = parser$otherExpectation("Identifier"),
        parser$c58 = /^[a-zA-Z?]/,
        parser$c59 = parser$classExpectation([["a", "z"], ["A", "Z"], "?"], false, false),
        parser$c60 = function(n) { return ["id", n.join('')] },
        parser$c61 = parser$otherExpectation("Terminator"),
        parser$c62 = ";",
        parser$c63 = parser$literalExpectation(";", false),
        parser$c64 = /^[\n\r\u2028\u2029]/,
        parser$c65 = parser$classExpectation(["\n", "\r", "\u2028", "\u2029"], false, false),
        parser$c66 = parser$otherExpectation("whitespace"),
        parser$c67 = " ",
        parser$c68 = parser$literalExpectation(" ", false),
        parser$c69 = function() {},
        parser$c70 = /^[ \t\n\r]/,
        parser$c71 = parser$classExpectation([" ", "\t", "\n", "\r"], false, false),

        parser$currPos          = 0,
        parser$savedPos         = 0,
        parser$posDetailsCache  = [{ line: 1, column: 1 }],
        parser$maxFailPos       = 0,
        parser$maxFailExpected  = [],
        parser$silentFails      = 0,

        parser$result;

    if ("startRule" in options) {
      if (!(options.startRule in parser$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      parser$startRuleFunction = parser$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(parser$savedPos, parser$currPos);
    }

    function location() {
      return parser$computeLocation(parser$savedPos, parser$currPos);
    }

    function expected(description, location) {
      location = location !== void 0 ? location : parser$computeLocation(parser$savedPos, parser$currPos)

      throw parser$buildStructuredError(
        [parser$otherExpectation(description)],
        input.substring(parser$savedPos, parser$currPos),
        location
      );
    }

    function error(message, location) {
      location = location !== void 0 ? location : parser$computeLocation(parser$savedPos, parser$currPos)

      throw parser$buildSimpleError(message, location);
    }

    function parser$literalExpectation(text, ignoreCase) {
      return { type: "literal", text: text, ignoreCase: ignoreCase };
    }

    function parser$classExpectation(parts, inverted, ignoreCase) {
      return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
    }

    function parser$anyExpectation() {
      return { type: "any" };
    }

    function parser$endExpectation() {
      return { type: "end" };
    }

    function parser$otherExpectation(description) {
      return { type: "other", description: description };
    }

    function parser$computePosDetails(pos) {
      var details = parser$posDetailsCache[pos], p;

      if (details) {
        return details;
      } else {
        p = pos - 1;
        while (!parser$posDetailsCache[p]) {
          p--;
        }

        details = parser$posDetailsCache[p];
        details = {
          line:   details.line,
          column: details.column
        };

        while (p < pos) {
          if (input.charCodeAt(p) === 10) {
            details.line++;
            details.column = 1;
          } else {
            details.column++;
          }

          p++;
        }

        parser$posDetailsCache[pos] = details;
        return details;
      }
    }

    function parser$computeLocation(startPos, endPos) {
      var startPosDetails = parser$computePosDetails(startPos),
          endPosDetails   = parser$computePosDetails(endPos);

      return {
        start: {
          offset: startPos,
          line:   startPosDetails.line,
          column: startPosDetails.column
        },
        end: {
          offset: endPos,
          line:   endPosDetails.line,
          column: endPosDetails.column
        }
      };
    }

    function parser$fail(expected) {
      if (parser$currPos < parser$maxFailPos) { return; }

      if (parser$currPos > parser$maxFailPos) {
        parser$maxFailPos = parser$currPos;
        parser$maxFailExpected = [];
      }

      parser$maxFailExpected.push(expected);
    }

    function parser$buildSimpleError(message, location) {
      return new parser$SyntaxError(message, null, null, location);
    }

    function parser$buildStructuredError(expected, found, location) {
      return new parser$SyntaxError(
        parser$SyntaxError.buildMessage(expected, found),
        expected,
        found,
        location
      );
    }

    function parser$parseProgram() {
      var s0, s1, s2, s3, s4, s5;

      s0 = parser$currPos;
      s1 = parser$parseExpression();
      if (s1 !== parser$FAILED) {
        s2 = parser$parse_();
        if (s2 !== parser$FAILED) {
          s3 = parser$parseTerminator();
          if (s3 !== parser$FAILED) {
            s4 = parser$parse_();
            if (s4 !== parser$FAILED) {
              s5 = parser$parseProgram();
              if (s5 !== parser$FAILED) {
                parser$savedPos = s0;
                s1 = parser$c0(s1, s5);
                s0 = s1;
              } else {
                parser$currPos = s0;
                s0 = parser$FAILED;
              }
            } else {
              parser$currPos = s0;
              s0 = parser$FAILED;
            }
          } else {
            parser$currPos = s0;
            s0 = parser$FAILED;
          }
        } else {
          parser$currPos = s0;
          s0 = parser$FAILED;
        }
      } else {
        parser$currPos = s0;
        s0 = parser$FAILED;
      }
      if (s0 === parser$FAILED) {
        s0 = parser$currPos;
        s1 = parser$parseExpression();
        if (s1 === parser$FAILED) {
          s1 = null;
        }
        if (s1 !== parser$FAILED) {
          parser$savedPos = s0;
          s1 = parser$c1(s1);
        }
        s0 = s1;
      }

      return s0;
    }

    function parser$parseExpression() {
      var s0, s1, s2, s3, s4, s5;

      s0 = parser$currPos;
      if (input.substr(parser$currPos, 4) === parser$c2) {
        s1 = parser$c2;
        parser$currPos += 4;
      } else {
        s1 = parser$FAILED;
        if (parser$silentFails === 0) { parser$fail(parser$c3); }
      }
      if (s1 !== parser$FAILED) {
        s2 = parser$parse_();
        if (s2 !== parser$FAILED) {
          s3 = parser$parseExpression();
          if (s3 !== parser$FAILED) {
            s4 = parser$parse_();
            if (s4 !== parser$FAILED) {
              if (input.charCodeAt(parser$currPos) === 41) {
                s5 = parser$c4;
                parser$currPos++;
              } else {
                s5 = parser$FAILED;
                if (parser$silentFails === 0) { parser$fail(parser$c5); }
              }
              if (s5 !== parser$FAILED) {
                parser$savedPos = s0;
                s1 = parser$c6(s3);
                s0 = s1;
              } else {
                parser$currPos = s0;
                s0 = parser$FAILED;
              }
            } else {
              parser$currPos = s0;
              s0 = parser$FAILED;
            }
          } else {
            parser$currPos = s0;
            s0 = parser$FAILED;
          }
        } else {
          parser$currPos = s0;
          s0 = parser$FAILED;
        }
      } else {
        parser$currPos = s0;
        s0 = parser$FAILED;
      }
      if (s0 === parser$FAILED) {
        s0 = parser$currPos;
        s1 = parser$parseTerm();
        if (s1 !== parser$FAILED) {
          s2 = parser$parse_();
          if (s2 !== parser$FAILED) {
            s3 = parser$parseOperator();
            if (s3 !== parser$FAILED) {
              s4 = parser$parse_();
              if (s4 !== parser$FAILED) {
                s5 = parser$parseExpression();
                if (s5 !== parser$FAILED) {
                  parser$savedPos = s0;
                  s1 = parser$c7(s1, s3, s5);
                  s0 = s1;
                } else {
                  parser$currPos = s0;
                  s0 = parser$FAILED;
                }
              } else {
                parser$currPos = s0;
                s0 = parser$FAILED;
              }
            } else {
              parser$currPos = s0;
              s0 = parser$FAILED;
            }
          } else {
            parser$currPos = s0;
            s0 = parser$FAILED;
          }
        } else {
          parser$currPos = s0;
          s0 = parser$FAILED;
        }
        if (s0 === parser$FAILED) {
          s0 = parser$currPos;
          s1 = parser$parseTerm();
          if (s1 === parser$FAILED) {
            s1 = null;
          }
          if (s1 !== parser$FAILED) {
            parser$savedPos = s0;
            s1 = parser$c8(s1);
          }
          s0 = s1;
        }
      }

      return s0;
    }

    function parser$parseTerm() {
      var s0;

      s0 = parser$parseNumber();
      if (s0 === parser$FAILED) {
        s0 = parser$parseParenthetical();
        if (s0 === parser$FAILED) {
          s0 = parser$parseIdentifier();
          if (s0 === parser$FAILED) {
            s0 = parser$parseComment();
          }
        }
      }

      return s0;
    }

    function parser$parseParenthetical() {
      var s0, s1, s2, s3;

      parser$silentFails++;
      s0 = parser$currPos;
      if (input.charCodeAt(parser$currPos) === 40) {
        s1 = parser$c10;
        parser$currPos++;
      } else {
        s1 = parser$FAILED;
        if (parser$silentFails === 0) { parser$fail(parser$c11); }
      }
      if (s1 !== parser$FAILED) {
        s2 = parser$parseExpression();
        if (s2 !== parser$FAILED) {
          if (input.charCodeAt(parser$currPos) === 41) {
            s3 = parser$c4;
            parser$currPos++;
          } else {
            s3 = parser$FAILED;
            if (parser$silentFails === 0) { parser$fail(parser$c5); }
          }
          if (s3 !== parser$FAILED) {
            parser$savedPos = s0;
            s1 = parser$c12(s2);
            s0 = s1;
          } else {
            parser$currPos = s0;
            s0 = parser$FAILED;
          }
        } else {
          parser$currPos = s0;
          s0 = parser$FAILED;
        }
      } else {
        parser$currPos = s0;
        s0 = parser$FAILED;
      }
      parser$silentFails--;
      if (s0 === parser$FAILED) {
        s1 = parser$FAILED;
        if (parser$silentFails === 0) { parser$fail(parser$c9); }
      }

      return s0;
    }

    function parser$parseOperator() {
      var s0, s1;

      s0 = parser$currPos;
      if (input.charCodeAt(parser$currPos) === 43) {
        s1 = parser$c13;
        parser$currPos++;
      } else {
        s1 = parser$FAILED;
        if (parser$silentFails === 0) { parser$fail(parser$c14); }
      }
      if (s1 !== parser$FAILED) {
        parser$savedPos = s0;
        s1 = parser$c15();
      }
      s0 = s1;
      if (s0 === parser$FAILED) {
        s0 = parser$currPos;
        if (input.charCodeAt(parser$currPos) === 42) {
          s1 = parser$c16;
          parser$currPos++;
        } else {
          s1 = parser$FAILED;
          if (parser$silentFails === 0) { parser$fail(parser$c17); }
        }
        if (s1 !== parser$FAILED) {
          parser$savedPos = s0;
          s1 = parser$c18();
        }
        s0 = s1;
        if (s0 === parser$FAILED) {
          s0 = parser$currPos;
          if (input.charCodeAt(parser$currPos) === 45) {
            s1 = parser$c19;
            parser$currPos++;
          } else {
            s1 = parser$FAILED;
            if (parser$silentFails === 0) { parser$fail(parser$c20); }
          }
          if (s1 !== parser$FAILED) {
            parser$savedPos = s0;
            s1 = parser$c21();
          }
          s0 = s1;
          if (s0 === parser$FAILED) {
            s0 = parser$currPos;
            if (input.charCodeAt(parser$currPos) === 47) {
              s1 = parser$c22;
              parser$currPos++;
            } else {
              s1 = parser$FAILED;
              if (parser$silentFails === 0) { parser$fail(parser$c23); }
            }
            if (s1 !== parser$FAILED) {
              parser$savedPos = s0;
              s1 = parser$c24();
            }
            s0 = s1;
            if (s0 === parser$FAILED) {
              s0 = parser$currPos;
              if (input.charCodeAt(parser$currPos) === 37) {
                s1 = parser$c25;
                parser$currPos++;
              } else {
                s1 = parser$FAILED;
                if (parser$silentFails === 0) { parser$fail(parser$c26); }
              }
              if (s1 !== parser$FAILED) {
                parser$savedPos = s0;
                s1 = parser$c27();
              }
              s0 = s1;
              if (s0 === parser$FAILED) {
                s0 = parser$currPos;
                if (input.substr(parser$currPos, 2) === parser$c28) {
                  s1 = parser$c28;
                  parser$currPos += 2;
                } else {
                  s1 = parser$FAILED;
                  if (parser$silentFails === 0) { parser$fail(parser$c29); }
                }
                if (s1 !== parser$FAILED) {
                  parser$savedPos = s0;
                  s1 = parser$c30();
                }
                s0 = s1;
                if (s0 === parser$FAILED) {
                  s0 = parser$currPos;
                  if (input.substr(parser$currPos, 2) === parser$c31) {
                    s1 = parser$c31;
                    parser$currPos += 2;
                  } else {
                    s1 = parser$FAILED;
                    if (parser$silentFails === 0) { parser$fail(parser$c32); }
                  }
                  if (s1 !== parser$FAILED) {
                    parser$savedPos = s0;
                    s1 = parser$c33();
                  }
                  s0 = s1;
                  if (s0 === parser$FAILED) {
                    s0 = parser$currPos;
                    if (input.charCodeAt(parser$currPos) === 124) {
                      s1 = parser$c34;
                      parser$currPos++;
                    } else {
                      s1 = parser$FAILED;
                      if (parser$silentFails === 0) { parser$fail(parser$c35); }
                    }
                    if (s1 !== parser$FAILED) {
                      parser$savedPos = s0;
                      s1 = parser$c36();
                    }
                    s0 = s1;
                    if (s0 === parser$FAILED) {
                      s0 = parser$currPos;
                      if (input.substr(parser$currPos, 2) === parser$c37) {
                        s1 = parser$c37;
                        parser$currPos += 2;
                      } else {
                        s1 = parser$FAILED;
                        if (parser$silentFails === 0) { parser$fail(parser$c38); }
                      }
                      if (s1 !== parser$FAILED) {
                        parser$savedPos = s0;
                        s1 = parser$c39();
                      }
                      s0 = s1;
                      if (s0 === parser$FAILED) {
                        s0 = parser$currPos;
                        if (input.charCodeAt(parser$currPos) === 61) {
                          s1 = parser$c40;
                          parser$currPos++;
                        } else {
                          s1 = parser$FAILED;
                          if (parser$silentFails === 0) { parser$fail(parser$c41); }
                        }
                        if (s1 !== parser$FAILED) {
                          parser$savedPos = s0;
                          s1 = parser$c42();
                        }
                        s0 = s1;
                        if (s0 === parser$FAILED) {
                          s0 = parser$currPos;
                          if (input.charCodeAt(parser$currPos) === 58) {
                            s1 = parser$c43;
                            parser$currPos++;
                          } else {
                            s1 = parser$FAILED;
                            if (parser$silentFails === 0) { parser$fail(parser$c44); }
                          }
                          if (s1 !== parser$FAILED) {
                            parser$savedPos = s0;
                            s1 = parser$c45();
                          }
                          s0 = s1;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function parser$parseComment() {
      var s0;

      s0 = parser$parseMultiLineComment();
      if (s0 === parser$FAILED) {
        s0 = parser$parseSingleLineComment();
      }

      return s0;
    }

    function parser$parseMultiLineComment() {
      var s0, s1, s2, s3, s4, s5;

      s0 = parser$currPos;
      if (input.substr(parser$currPos, 2) === parser$c46) {
        s1 = parser$c46;
        parser$currPos += 2;
      } else {
        s1 = parser$FAILED;
        if (parser$silentFails === 0) { parser$fail(parser$c47); }
      }
      if (s1 !== parser$FAILED) {
        s2 = [];
        s3 = parser$currPos;
        s4 = parser$currPos;
        parser$silentFails++;
        if (input.substr(parser$currPos, 2) === parser$c48) {
          s5 = parser$c48;
          parser$currPos += 2;
        } else {
          s5 = parser$FAILED;
          if (parser$silentFails === 0) { parser$fail(parser$c49); }
        }
        parser$silentFails--;
        if (s5 === parser$FAILED) {
          s4 = void 0;
        } else {
          parser$currPos = s4;
          s4 = parser$FAILED;
        }
        if (s4 !== parser$FAILED) {
          if (input.length > parser$currPos) {
            s5 = input.charAt(parser$currPos);
            parser$currPos++;
          } else {
            s5 = parser$FAILED;
            if (parser$silentFails === 0) { parser$fail(parser$c50); }
          }
          if (s5 !== parser$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            parser$currPos = s3;
            s3 = parser$FAILED;
          }
        } else {
          parser$currPos = s3;
          s3 = parser$FAILED;
        }
        while (s3 !== parser$FAILED) {
          s2.push(s3);
          s3 = parser$currPos;
          s4 = parser$currPos;
          parser$silentFails++;
          if (input.substr(parser$currPos, 2) === parser$c48) {
            s5 = parser$c48;
            parser$currPos += 2;
          } else {
            s5 = parser$FAILED;
            if (parser$silentFails === 0) { parser$fail(parser$c49); }
          }
          parser$silentFails--;
          if (s5 === parser$FAILED) {
            s4 = void 0;
          } else {
            parser$currPos = s4;
            s4 = parser$FAILED;
          }
          if (s4 !== parser$FAILED) {
            if (input.length > parser$currPos) {
              s5 = input.charAt(parser$currPos);
              parser$currPos++;
            } else {
              s5 = parser$FAILED;
              if (parser$silentFails === 0) { parser$fail(parser$c50); }
            }
            if (s5 !== parser$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              parser$currPos = s3;
              s3 = parser$FAILED;
            }
          } else {
            parser$currPos = s3;
            s3 = parser$FAILED;
          }
        }
        if (s2 !== parser$FAILED) {
          if (input.substr(parser$currPos, 2) === parser$c48) {
            s3 = parser$c48;
            parser$currPos += 2;
          } else {
            s3 = parser$FAILED;
            if (parser$silentFails === 0) { parser$fail(parser$c49); }
          }
          if (s3 !== parser$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            parser$currPos = s0;
            s0 = parser$FAILED;
          }
        } else {
          parser$currPos = s0;
          s0 = parser$FAILED;
        }
      } else {
        parser$currPos = s0;
        s0 = parser$FAILED;
      }

      return s0;
    }

    function parser$parseMultiLineCommentNoLineTerminator() {
      var s0, s1, s2, s3, s4, s5;

      s0 = parser$currPos;
      if (input.substr(parser$currPos, 2) === parser$c46) {
        s1 = parser$c46;
        parser$currPos += 2;
      } else {
        s1 = parser$FAILED;
        if (parser$silentFails === 0) { parser$fail(parser$c47); }
      }
      if (s1 !== parser$FAILED) {
        s2 = [];
        s3 = parser$currPos;
        s4 = parser$currPos;
        parser$silentFails++;
        if (input.substr(parser$currPos, 2) === parser$c48) {
          s5 = parser$c48;
          parser$currPos += 2;
        } else {
          s5 = parser$FAILED;
          if (parser$silentFails === 0) { parser$fail(parser$c49); }
        }
        if (s5 === parser$FAILED) {
          s5 = parser$parseLineTerminator();
        }
        parser$silentFails--;
        if (s5 === parser$FAILED) {
          s4 = void 0;
        } else {
          parser$currPos = s4;
          s4 = parser$FAILED;
        }
        if (s4 !== parser$FAILED) {
          if (input.length > parser$currPos) {
            s5 = input.charAt(parser$currPos);
            parser$currPos++;
          } else {
            s5 = parser$FAILED;
            if (parser$silentFails === 0) { parser$fail(parser$c50); }
          }
          if (s5 !== parser$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            parser$currPos = s3;
            s3 = parser$FAILED;
          }
        } else {
          parser$currPos = s3;
          s3 = parser$FAILED;
        }
        while (s3 !== parser$FAILED) {
          s2.push(s3);
          s3 = parser$currPos;
          s4 = parser$currPos;
          parser$silentFails++;
          if (input.substr(parser$currPos, 2) === parser$c48) {
            s5 = parser$c48;
            parser$currPos += 2;
          } else {
            s5 = parser$FAILED;
            if (parser$silentFails === 0) { parser$fail(parser$c49); }
          }
          if (s5 === parser$FAILED) {
            s5 = parser$parseLineTerminator();
          }
          parser$silentFails--;
          if (s5 === parser$FAILED) {
            s4 = void 0;
          } else {
            parser$currPos = s4;
            s4 = parser$FAILED;
          }
          if (s4 !== parser$FAILED) {
            if (input.length > parser$currPos) {
              s5 = input.charAt(parser$currPos);
              parser$currPos++;
            } else {
              s5 = parser$FAILED;
              if (parser$silentFails === 0) { parser$fail(parser$c50); }
            }
            if (s5 !== parser$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              parser$currPos = s3;
              s3 = parser$FAILED;
            }
          } else {
            parser$currPos = s3;
            s3 = parser$FAILED;
          }
        }
        if (s2 !== parser$FAILED) {
          if (input.substr(parser$currPos, 2) === parser$c48) {
            s3 = parser$c48;
            parser$currPos += 2;
          } else {
            s3 = parser$FAILED;
            if (parser$silentFails === 0) { parser$fail(parser$c49); }
          }
          if (s3 !== parser$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            parser$currPos = s0;
            s0 = parser$FAILED;
          }
        } else {
          parser$currPos = s0;
          s0 = parser$FAILED;
        }
      } else {
        parser$currPos = s0;
        s0 = parser$FAILED;
      }

      return s0;
    }

    function parser$parseSingleLineComment() {
      var s0, s1, s2, s3, s4, s5;

      s0 = parser$currPos;
      if (input.substr(parser$currPos, 2) === parser$c51) {
        s1 = parser$c51;
        parser$currPos += 2;
      } else {
        s1 = parser$FAILED;
        if (parser$silentFails === 0) { parser$fail(parser$c52); }
      }
      if (s1 !== parser$FAILED) {
        s2 = [];
        s3 = parser$currPos;
        s4 = parser$currPos;
        parser$silentFails++;
        s5 = parser$parseLineTerminator();
        parser$silentFails--;
        if (s5 === parser$FAILED) {
          s4 = void 0;
        } else {
          parser$currPos = s4;
          s4 = parser$FAILED;
        }
        if (s4 !== parser$FAILED) {
          if (input.length > parser$currPos) {
            s5 = input.charAt(parser$currPos);
            parser$currPos++;
          } else {
            s5 = parser$FAILED;
            if (parser$silentFails === 0) { parser$fail(parser$c50); }
          }
          if (s5 !== parser$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            parser$currPos = s3;
            s3 = parser$FAILED;
          }
        } else {
          parser$currPos = s3;
          s3 = parser$FAILED;
        }
        while (s3 !== parser$FAILED) {
          s2.push(s3);
          s3 = parser$currPos;
          s4 = parser$currPos;
          parser$silentFails++;
          s5 = parser$parseLineTerminator();
          parser$silentFails--;
          if (s5 === parser$FAILED) {
            s4 = void 0;
          } else {
            parser$currPos = s4;
            s4 = parser$FAILED;
          }
          if (s4 !== parser$FAILED) {
            if (input.length > parser$currPos) {
              s5 = input.charAt(parser$currPos);
              parser$currPos++;
            } else {
              s5 = parser$FAILED;
              if (parser$silentFails === 0) { parser$fail(parser$c50); }
            }
            if (s5 !== parser$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              parser$currPos = s3;
              s3 = parser$FAILED;
            }
          } else {
            parser$currPos = s3;
            s3 = parser$FAILED;
          }
        }
        if (s2 !== parser$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          parser$currPos = s0;
          s0 = parser$FAILED;
        }
      } else {
        parser$currPos = s0;
        s0 = parser$FAILED;
      }

      return s0;
    }

    function parser$parseNumber() {
      var s0, s1, s2;

      parser$silentFails++;
      s0 = parser$currPos;
      s1 = [];
      if (parser$c54.test(input.charAt(parser$currPos))) {
        s2 = input.charAt(parser$currPos);
        parser$currPos++;
      } else {
        s2 = parser$FAILED;
        if (parser$silentFails === 0) { parser$fail(parser$c55); }
      }
      if (s2 !== parser$FAILED) {
        while (s2 !== parser$FAILED) {
          s1.push(s2);
          if (parser$c54.test(input.charAt(parser$currPos))) {
            s2 = input.charAt(parser$currPos);
            parser$currPos++;
          } else {
            s2 = parser$FAILED;
            if (parser$silentFails === 0) { parser$fail(parser$c55); }
          }
        }
      } else {
        s1 = parser$FAILED;
      }
      if (s1 !== parser$FAILED) {
        parser$savedPos = s0;
        s1 = parser$c56(s1);
      }
      s0 = s1;
      parser$silentFails--;
      if (s0 === parser$FAILED) {
        s1 = parser$FAILED;
        if (parser$silentFails === 0) { parser$fail(parser$c53); }
      }

      return s0;
    }

    function parser$parseIdentifier() {
      var s0, s1, s2;

      parser$silentFails++;
      s0 = parser$currPos;
      s1 = [];
      if (parser$c58.test(input.charAt(parser$currPos))) {
        s2 = input.charAt(parser$currPos);
        parser$currPos++;
      } else {
        s2 = parser$FAILED;
        if (parser$silentFails === 0) { parser$fail(parser$c59); }
      }
      if (s2 !== parser$FAILED) {
        while (s2 !== parser$FAILED) {
          s1.push(s2);
          if (parser$c58.test(input.charAt(parser$currPos))) {
            s2 = input.charAt(parser$currPos);
            parser$currPos++;
          } else {
            s2 = parser$FAILED;
            if (parser$silentFails === 0) { parser$fail(parser$c59); }
          }
        }
      } else {
        s1 = parser$FAILED;
      }
      if (s1 !== parser$FAILED) {
        parser$savedPos = s0;
        s1 = parser$c60(s1);
      }
      s0 = s1;
      parser$silentFails--;
      if (s0 === parser$FAILED) {
        s1 = parser$FAILED;
        if (parser$silentFails === 0) { parser$fail(parser$c57); }
      }

      return s0;
    }

    function parser$parseTerminator() {
      var s0, s1;

      parser$silentFails++;
      s0 = parser$parseLineTerminator();
      if (s0 === parser$FAILED) {
        if (input.charCodeAt(parser$currPos) === 59) {
          s0 = parser$c62;
          parser$currPos++;
        } else {
          s0 = parser$FAILED;
          if (parser$silentFails === 0) { parser$fail(parser$c63); }
        }
      }
      parser$silentFails--;
      if (s0 === parser$FAILED) {
        s1 = parser$FAILED;
        if (parser$silentFails === 0) { parser$fail(parser$c61); }
      }

      return s0;
    }

    function parser$parseLineTerminator() {
      var s0;

      if (parser$c64.test(input.charAt(parser$currPos))) {
        s0 = input.charAt(parser$currPos);
        parser$currPos++;
      } else {
        s0 = parser$FAILED;
        if (parser$silentFails === 0) { parser$fail(parser$c65); }
      }

      return s0;
    }

    function parser$parse_() {
      var s0, s1, s2;

      parser$silentFails++;
      s0 = parser$currPos;
      s1 = [];
      if (input.charCodeAt(parser$currPos) === 32) {
        s2 = parser$c67;
        parser$currPos++;
      } else {
        s2 = parser$FAILED;
        if (parser$silentFails === 0) { parser$fail(parser$c68); }
      }
      while (s2 !== parser$FAILED) {
        s1.push(s2);
        if (input.charCodeAt(parser$currPos) === 32) {
          s2 = parser$c67;
          parser$currPos++;
        } else {
          s2 = parser$FAILED;
          if (parser$silentFails === 0) { parser$fail(parser$c68); }
        }
      }
      if (s1 !== parser$FAILED) {
        parser$savedPos = s0;
        s1 = parser$c69();
      }
      s0 = s1;
      parser$silentFails--;
      if (s0 === parser$FAILED) {
        s1 = parser$FAILED;
        if (parser$silentFails === 0) { parser$fail(parser$c66); }
      }

      return s0;
    }

    function parser$parse__() {
      var s0, s1, s2;

      parser$silentFails++;
      s0 = parser$currPos;
      s1 = [];
      if (parser$c70.test(input.charAt(parser$currPos))) {
        s2 = input.charAt(parser$currPos);
        parser$currPos++;
      } else {
        s2 = parser$FAILED;
        if (parser$silentFails === 0) { parser$fail(parser$c71); }
      }
      if (s2 !== parser$FAILED) {
        while (s2 !== parser$FAILED) {
          s1.push(s2);
          if (parser$c70.test(input.charAt(parser$currPos))) {
            s2 = input.charAt(parser$currPos);
            parser$currPos++;
          } else {
            s2 = parser$FAILED;
            if (parser$silentFails === 0) { parser$fail(parser$c71); }
          }
        }
      } else {
        s1 = parser$FAILED;
      }
      if (s1 !== parser$FAILED) {
        parser$savedPos = s0;
        s1 = parser$c69();
      }
      s0 = s1;
      parser$silentFails--;
      if (s0 === parser$FAILED) {
        s1 = parser$FAILED;
        if (parser$silentFails === 0) { parser$fail(parser$c66); }
      }

      return s0;
    }

    parser$result = parser$startRuleFunction();

    if (parser$result !== parser$FAILED && parser$currPos === input.length) {
      return parser$result;
    } else {
      if (parser$result !== parser$FAILED && parser$currPos < input.length) {
        parser$fail(parser$endExpectation());
      }

      throw parser$buildStructuredError(
        parser$maxFailExpected,
        parser$maxFailPos < input.length ? input.charAt(parser$maxFailPos) : null,
        parser$maxFailPos < input.length
          ? parser$computeLocation(parser$maxFailPos, parser$maxFailPos + 1)
          : parser$computeLocation(parser$maxFailPos, parser$maxFailPos)
      );
    }
  }

  return {
    SyntaxError: parser$SyntaxError,
    parse:       parser$parse
  };
})()

window.parse = parse;
