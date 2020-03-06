function empty() {
    return { baseline: undefined, width: 0, lines: [] };
}

function str(str, baseline = 0) {
    let lines = str.split("\n");
    let width = lines[0].length;
    for (let line of lines)
        if (line.length !== width) throw new Error("line not right size");
    return { baseline, width: lines[0].length, lines };
}

function deriv(vin, dfrom = empty(), dto = empty()) {
    let width = Math.max(vin.width, dfrom.width, dto.width);

    let ltop = " /'" + " ".repeat(width);
    let lbottom = "./ " + " ".repeat(width);

    let lfrom = dfrom.lines.map(l => "   " + l.padEnd(width, " "));
    let lto = dto.lines.map(l => "   " + l.padEnd(width, " "));
    let lcenter = vin.lines.map(l => " | " + l.padEnd(width, " "));

    return {
        baseline: lto.length + vin.baseline + 1,
        width: width + 3,
        lines: [...lto, ltop, ...lcenter, lbottom, ...lfrom]
    };
}

function box(equ) {
    let topline = ",-" + "-".repeat(equ.width) + "-.";
    let centerls = equ.lines.map((l, i) =>
        i === equ.baseline ? ": " + l + " :" : "| " + l + " |"
    );
    let bottomline = "`-" + "-".repeat(equ.width) + "-'";
    let blank = "| " + " ".repeat(equ.width) + " |";

    return {
        baseline: equ.baseline + 2,
        width: equ.width + 4,
        lines: [topline, blank, ...centerls, blank, bottomline]
    };
}

function padcenter(str, w, space) {
    let len = str.length;
    let size = (w - len) / 2;
    if (size < 0) throw new Error("too small width");
    let leftspace = Math.floor(size);
    let rightspace = Math.ceil(size);
    return " ".repeat(leftspace) + str + " ".repeat(rightspace);
}

function frac(e1, e2) {
    let width = Math.max(e1.width, e2.width);
    let divider = "-".repeat(width);

    let tophalf = e1.lines.map(l => padcenter(l, width, " "));
    let bottomhalf = e2.lines.map(l => padcenter(l, width, " "));

    return {
        baseline: tophalf.length,
        width,
        lines: [...tophalf, divider, ...bottomhalf]
    };
}

function hcombine(...items) {
    let bottomSpace =
        Math.max(0, ...items.map(it => it.lines.length - it.baseline)) - 1;
    let topSpace = Math.max(0, ...items.map(it => it.baseline));

    let fv = [
        ...new Array(topSpace).fill(""),
        "", // baseline
        ...new Array(bottomSpace).fill("")
    ];

    for (let item of items) {
        for (let i = 0; i < fv.length; i++) {
            let li = i - topSpace + item.baseline;
            if (li >= item.lines.length || li < 0) {
                fv[i] += " ".repeat(item.width);
            } else {
                fv[i] += item.lines[li];
            }
        }
    }

    return {
        baseline: topSpace,
        width: fv[0].length,
        lines: fv
    };
}

function pow(base, powof) {
    let powl = powof.lines.map(l => " ".repeat(base.width) + l);
    let basel = base.lines.map(l => l + " ".repeat(powof.width));

    return {
        baseline: base.baseline + powof.lines.length,
        width: base.width + powof.width,
        lines: [...powl, ...basel]
    };
}

function paren(equ) {
    let h = equ.lines.length;
    if (h === 1) {
        return {
            baseline: equ.baseline,
            width: equ.width + 2,
            lines: ["(" + equ.lines[0] + ")"]
        };
    }
    return {
        baseline: equ.baseline + 1,
        width: equ.width + 4,
        lines: [
            "/ " + " ".repeat(equ.width) + " \\",
            ...equ.lines.map((l, i) => "| " + l + " |"),
            "\\ " + " ".repeat(equ.width) + " /"
        ]
    };
}

function print(equ) {
    return equ.lines.join("\n");
}

const equ = frac(
    deriv(
        hcombine(
            frac(str("1"), str("2")),
            str(" "),
            str("*"),
            str(" "),
            frac(pow(str("3"), str("2")), str("4")),
            str(" * "),
            paren(
                hcombine(
                    pow(str("3"), frac(str("1"), str("2"))),
                    str(" + "),
                    paren(str("2"))
                )
            ),
            str(" dx")
        )
    ),
    paren(pow(str("2"), str("5")))
);

let added = hcombine(
    paren(equ),
    str(" = "),
    deriv(str("cont"), str("from"), str("to"))
);
console.log(print(box(added)));

/*
  /'
  | 5x dx
 ./
*/
let demo1 = deriv(str("5x dx"));
console.log(print(box(demo1)));

/*

 /'
 |                2
 |  2            3                 2   /      2 \
 | x  + 2x + 5 + -- + 6 + ( 3 * 4 )  + \ 3 + 4  /
 |               2                  
./

*/

let demo2 = deriv(
    hcombine(
        pow(str("x"), str("2")),
        str(" + "),
        str("2x"),
        str(" + "),
        str("5"),
        str(" + "),
        frac(pow(str("3"), str("2")), str("2")),
        str(" + "),
        str("6"),
        str(" + "),
        pow(paren(str(" 3 * 4 ")), str("2")),
        str(" + "),
        paren(hcombine(str("3"), str(" + "), pow(str("4"), str("2")))),
        str(" dx")
    ),
    str("-1"),
    str("1")
);
console.log(print(box(demo2)));
