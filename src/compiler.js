window.compile = function(code) {
    var parsed = parse(code);

    function format_array_to_math(a) {
        var char_1;
        var char_2;
        var match_array = {
            '+': "add",
            '*': "multiply",
            '-': "subtract",
            '/': "divide",
            '%': "mod",
            '&&': "and",
            '||': "or",
            '|': "map",
            '..': "range",
            '=': "equal",
            ':': "set"
        };

        function convert_to_symbol() {
            var symbol = null;
            for (var key in match_array) {
                if (match_array[key] == a[0]) {
                    symbol = key;
                }
            }
            return symbol;
        }

        var instruction = convert_to_symbol()


        if (a[1][0] == "int") {
            char_1 = a[1][1]
            char_2 = a[2][1]
        } else {
            char_1 = "\"" + a[1][1] + "\"";
            char_2 = "\"" + a[2][1] + "\"";
        }
        return char_1 + " " + instruction + " " + char_2 + ";";
    }

    var finished_array = [];
    parsed.forEach(function(array) {
        if (array[0] == "set") {
            finished_array.push("var");
            finished_array.push(array[1][1]);
            finished_array.push("=");
            if (array[2][0] == "add" || array[2][0] == "multiply" || array[2][0] == "subtract" || array[2][0] == "divide" || array[2][0] == "mod" || array[2][0] == "and" || array[2][0] == "or" || array[2][0] == "map" || array[2][0] == "range" || array[2][0] == "equal") {
                finished_array.push(format_array_to_math(array[2]))
            } else {
                finished_array.push(array[2][1] + ";")
            }
        } else if (array[0] == "log") {
            finished_array.push("console.log(" + array[1][1] + ");");
        } else if (array[0] == "add" || array[0] == "multiply" || array[0] == "subtract" || array[0] == "divide" || array[0] == "mod" || array[0] == "and" || array[0] == "or" || array[0] == "map" || array[0] == "range" || array[0] == "equal") {
            finished_array.push(format_array_to_math(array));
        }
    })
return finished_array.join(" ");
}
