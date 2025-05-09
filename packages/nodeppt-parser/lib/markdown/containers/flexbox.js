module.exports = (name, clss) => {
    if (!clss) {
        // The default is name
        clss = name;
    }
    return {
        validate(params) {
            return params.trim().match(new RegExp('^' + name + '\\s*(.*)$'));
        },
        handler(state, opts, start, end) {
            function getOpenToken(level) {
                const token = new state.Token('container_' + name + '_item_open', 'li', 1);
                token.block = true;
                token.level = 1 + level;
                return token;
            }
            function getCloseToken(level) {
                const token = new state.Token('container_' + name + '_item_close', 'li', -1);
                token.block = true;
                token.level = 1 + level;
                return token;
            }
            // tokens
            const tokens = state.tokens;
            let open = false;
            let done = 0;
            // console.log(5555,opts, tokens)
            for (let i = start; i < tokens.length; i++) {
                const token = tokens[i];
                if (token.type === 'container_' + name + '_open') {
                    // Insert after open
                    tokens.splice(i + 1, 0, getOpenToken(token.level));
                    i++;
                    // console.log(666666);
                    open = true;
                    continue;
                } else if (token.type === 'container_' + name + '_close') {
                    // Insert before close
                    tokens.splice(i, 0, getCloseToken(token.level));
                    i++;
                    open = false;
                    continue;
                } else if (open && 'hr' === token.type && done === 0) {
                    // The first layer of Hr needs to be replaced
                    // console.log(77777);
                    tokens.splice(i, 1, getCloseToken(token.level - 1), getOpenToken(token.level - 1));
                    i++;
                } else if (open) {
                    if (token.type === 'paragraph_close' || token.type === 'paragraph_open') {
                        tokens.splice(i, 1);
                        i--;
                        continue;
                    }
                    // One layer deeper, because there is an extra layer of div outside
                    token.level = token.level + 1;
                    // Ensure that HR is the layer closest to the container
                    if (/_open$/.test(token.type)) {
                        done++;
                    } else if (/_close$/.test(token.type)) {
                        done--;
                    }
                }
            }
            // console.log(tokens);
            return state;
        },
        render(tokens, idx) {
            const token = tokens[idx];

            if (token.nesting === 1) {
                const cmIndex = token.attrIndex('css-module');
                let clsIndex = token.attrIndex('class');
                let attrs = token.attrs || [];

                if (clsIndex >= 0) {
                    attrs[clsIndex][1] +=
                        cmIndex >= 0 ? ` flexblock ${clss} ${attrs[cmIndex][1]}` : ` flexblock ${clss}`;
                } else {
                    attrs.push([
                        'class',
                        cmIndex >= 0 ? `flexblock ${clss} ${attrs[cmIndex][1]}` : `flexblock ${clss}`
                    ]);
                }

                attrs = attrs.map(([key, value]) => {
                    return `${key}="${value}"`;
                });
                // opening tag
                return `<ul ${attrs.join(' ')}>\n`;
            } else {
                // closing tag
                return '</ul>\n';
            }
        }
    };
};