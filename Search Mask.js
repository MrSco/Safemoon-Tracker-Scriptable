// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: magic;
// share-sheet-inputs: plain-text;
// let input = Pasteboard// 
// let copyText= await input.pasteString()// 
// console.log(copyText)
console.log(args)
function mask(t) {
    var n, a, s, r, l, o, i;
    return n = a = function(e, t) {
        var n = s();
        return (a = function(e, t) {
            return n[e -= 298]
        }
        )(e, t)
    }
    ,
    function(e, t) {
        for (var n = a, s = e(); ; )
            try {
                if (223575 === -parseInt(n(305)) / 1 * (parseInt(n(312)) / 2) + -parseInt(n(307)) / 3 * (-parseInt(n(300)) / 4) + -parseInt(n(309)) / 5 * (-parseInt(n(299)) / 6) + -parseInt(n(304)) / 7 + -parseInt(n(302)) / 8 + parseInt(n(303)) / 9 * (-parseInt(n(310)) / 10) + parseInt(n(313)) / 11)
                    break;
                s.push(s.shift())
            } catch (r) {
                s.push(s.shift())
            }
    }(s = function() {
        var e = ["8rFhdwu", "join", "552272eXrEMe", "18ASpPXO", "2651558nPqZVd", "9378ADpTrS", "map", "508521hmwkMb", "charCodeAt", "5860CDfjHn", "1621250eFUCVl", "fromCharCode", "68JhSKaI", "8345381SePrjP", "split", "1110AREpDy"];
        return (s = function() {
            return e
        }
        )()
    }
    ),
    r = (r = btoa(t))[n(298)]("")[n(306)]((function(e) {
        return String[n(311)](e[n(308)](0) + 10)
    }
    ))[n(301)](""),
    r
}
let masked = (mask(args.plainTexts[0] || ""))
console.log(masked)
Script.setShortcutOutput(masked)
// await input.copyString(masked);
Script.complete()