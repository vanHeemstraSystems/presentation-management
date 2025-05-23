const utils = require('../attrs/utils');
const attrOptions = utils.getOptions();
module.exports = {
    validate(params) {
        return params.trim().match(/^flexblock\s*(.*)$/);
    },
    handler(state, opts, start, len) {
        function getOpenToken(tag, level, block = true, attrs = []) {
            const token = new state.Token('container_flexblock_item_' + tag + '_open', tag, 1);
            token.block = block;
            token.attrs = attrs;
            token.level = 1 + level;
            return token;
        }
        function getCloseToken(tag, level, block = true) {
            const token = new state.Token('container_flexblock_item_' + tag + '_close', tag, -1);
            token.block = block;
            token.level = 1 + level;
            return token;
        }
        // tokens
        const tokens = state.tokens;

        opts = opts.split(/flexblock\s+/).splice(1)[0];
        let attrs = [];
        let flexblockClass = '';
        if (utils.hasDelimiters('only', attrOptions)(opts, attrOptions)) {
            attrs = utils.getAttrs(opts, 0, attrOptions);
            flexblockClass = utils.findAttrs(attrs, 'class');
        }

        let open = false;
        // Support multiple, [[start,level, [item_tokens],end],[],[]...]
        const items = [];
        let itemsIdx = 0;

        for (let i = start; i < tokens.length; i++) {
            const token = tokens[i];
            // Grouping
            if (token.type === 'container_flexblock_open') {
                open = true;
                items[itemsIdx] = [i, token.level];
            } else if (token.type === 'container_flexblock_close') {
                open = false;
                // end
                items[itemsIdx][3] = i - 1;
            } else if (open && 'hr' === token.type) {
                items[itemsIdx++][3] = i;
                items[itemsIdx] = [i, token.level];
            } else if (open) {
                items[itemsIdx][2] = items[itemsIdx][2] || [];
                // Deepen all the layers first
                token.level += 1;
                items[itemsIdx][2].push(token);
            }
        }
        // console.log(tokens[start], tokens[tokens.length - 1]);
        for (let i = items.length - 1; i >= 0; i--) {
            // Processing from back to front can avoid i changes
            const [start, level, itemArray, end] = items[i];
            // console.log(items[i])
            let openTag = getOpenToken('li', level);
            let closeTag = getCloseToken('li', level);
            let addCount = 2; // Add a few extra tags
            // Remove the outer p element that is only wrapped by p
            if (itemArray[0].type === 'paragraph_open' && itemArray[itemArray.length - 1].type === 'paragraph_close') {
                let find = false;
                for (let i = 1; i < itemArray.length - 1; i++) {
                    const token = itemArray[i];
                    if (token.type === 'paragraph_open') {
                        find = true;
                        break;
                    }
                }
                if (!find) {
                    // The explanation is the only one~, so I have to peel it
                    addCount -= 2;
                    itemArray.shift();
                    itemArray.pop();
                }
            }
            if (flexblockClass.indexOf('blink') >= 0 && flexblockClass.indexOf('features') === -1) {
                // Add a tag
                let linkTag = getOpenToken('a', level);
                itemArray.unshift(linkTag);
                itemArray.unshift(openTag);

                let linkCloseTag = getCloseToken('a', level);
                itemArray.push(linkCloseTag);
                itemArray.push(closeTag);
                addCount += 2;
            } else if (flexblockClass.indexOf('specs') >= 0) {
                // Add div tag
                let linkTag = getOpenToken('div', level);
                itemArray.unshift(linkTag);
                itemArray.unshift(openTag);

                let linkCloseTag = getCloseToken('div', level);
                itemArray.push(linkCloseTag);
                itemArray.push(closeTag);
                addCount += 2;
            } else if (flexblockClass.indexOf('clients') >= 0) {
                // The lazy way is to just take the first three
                itemArray.splice(0, 1, getOpenToken('figure', level));
                itemArray[2].type = 'text';
                itemArray[2].content = '';
                itemArray.splice(2, 0, getOpenToken('figcaption', level));
                // Add a tag
                let linkTag = getOpenToken('a', level);
                itemArray.unshift(linkTag);
                itemArray.unshift(openTag);

                itemArray.push(getCloseToken('figcaption', level));

                itemArray.push(getCloseToken('figure', level));
                let linkCloseTag = getCloseToken('a', level);
                itemArray.push(linkCloseTag);
                itemArray.push(closeTag);
                addCount += 5;
            } else if (flexblockClass.indexOf('features') >= 0) {
                // Add div tag
                let linkTag = getOpenToken('div', level);
                itemArray.unshift(linkTag);

                if (flexblockClass.indexOf('blink') >= 0) {
                    itemArray.unshift(getOpenToken('a', level));
                    addCount++;
                }
                itemArray.unshift(openTag);

                let linkCloseTag = getCloseToken('div', level);
                itemArray.push(linkCloseTag);
                itemArray.push(closeTag);
                if (flexblockClass.indexOf('blink') >= 0) {
                    itemArray.push(getCloseToken('a', level));
                    addCount++;
                }
                addCount += 2;
            } else {
                // Default
                itemArray.unshift(openTag);
                itemArray.push(closeTag);
            }
            tokens.splice(start + 1, end - start, ...itemArray);
        }
        // console.log(tokens[start], tokens[tokens.length - 1]);
        // console.log(tokens.slice(start));
    },
    render(tokens, idx) {
        const token = tokens[idx];

        if (token.nesting === 1) {
            const cmIndex = token.attrIndex('css-module');
            let clsIndex = token.attrIndex('class');
            let attrs = token.attrs || [];
            if (clsIndex >= 0) {
                attrs[clsIndex][1] += cmIndex >= 0 ? ` flexblock ${attrs[cmIndex][1]}` : ` flexblock`;
            } else {
                attrs.push(['class', cmIndex >= 0 ? `flexblock ${attrs[cmIndex][1]}` : `flexblock`]);
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