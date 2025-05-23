module.exports = function ins_plugin(md) {
    // https://github.com/markdown-it/markdown-it-mark/blob/master/index.js
    function tokenize(state, silent) {
        var i,
            scanned,
            token,
            len,
            ch,
            start = state.pos,
            marker = state.src.charCodeAt(start);

        if (silent) {
            return false;
        }

        if (marker !== 0x3d /* = */) {
            return false;
        }

        scanned = state.scanDelims(state.pos, true);
        len = scanned.length;
        ch = String.fromCharCode(marker);

        if (len < 2) {
            return false;
        }

        if (len % 2) {
            token = state.push('text', '', 0);
            token.content = ch;
            len--;
        }

        for (i = 0; i < len; i += 2) {
            token = state.push('text', '', 0);
            token.content = ch + ch;

            state.delimiters.push({
                marker: marker,
                jump: i,
                token: state.tokens.length - 1,
                level: state.level,
                end: -1,
                open: scanned.can_open,
                close: scanned.can_close
            });
        }

        state.pos += scanned.length;

        return true;
    }

    // Walk through delimiter list and replace text tokens with tags
    //
    function postProcess(state) {
        var i,
            j,
            startDelim,
            endDelim,
            token,
            loneMarkers = [],
            delimiters = state.delimiters,
            max = state.delimiters.length;

        for (i = 0; i < max; i++) {
            startDelim = delimiters[i];

            if (startDelim.marker !== 0x3d /* = */) {
                continue;
            }

            if (startDelim.end === -1) {
                continue;
            }

            endDelim = delimiters[startDelim.end];

            token = state.tokens[startDelim.token];
            token.type = 'cite_open';
            token.tag = 'cite';
            token.nesting = 1;
            token.markup = '==';
            token.content = '';

            token = state.tokens[endDelim.token];
            token.type = 'cite_close';
            token.tag = 'cite';
            token.nesting = -1;
            token.markup = '==';
            token.content = '';

            if (state.tokens[endDelim.token - 1].type === 'text' && state.tokens[endDelim.token - 1].content === '=') {
                loneMarkers.push(endDelim.token - 1);
            }
        }

        // If a marker sequence has an odd number of characters, it's splitted
        // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
        // start of the sequence.
        //
        // So, we have to move all those markers after subsequent s_close tags.
        //
        while (loneMarkers.length) {
            i = loneMarkers.pop();
            j = i + 1;

            while (j < state.tokens.length && state.tokens[j].type === 'cite_close') {
                j++;
            }

            j--;

            if (i !== j) {
                token = state.tokens[j];
                state.tokens[j] = state.tokens[i];
                state.tokens[i] = token;
            }
        }
    }

    md.inline.ruler.before('emphasis', 'cite', tokenize);
    md.inline.ruler2.before('emphasis', 'cite', postProcess);
};