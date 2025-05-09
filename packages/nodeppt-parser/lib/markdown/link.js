module.exports = md => {
    const defLinkOpen =
        md.renderer.rules.link_open ||
        function(tokens, idx, options, env, self) {
            return self.renderToken(tokens, idx, options);
        };

    md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
        // Add target
        const aIndex = tokens[idx].attrIndex('target');
        const hrefIndex = tokens[idx].attrIndex('href');
        if (hrefIndex >= 0) {
            // From the hrefIndex
            const href = tokens[idx].attrs[hrefIndex][1];
            if (href && href !== '#') {
                if (aIndex < 0) {
                    if (/^http[s]?:\/\//.test(href)) {
                        // Just add external links
                        tokens[idx].attrPush(['target', '_blank']); // add new attribute
                    }
                } else {
                    tokens[idx].attrs[aIndex][1] = '_blank'; // replace value of existing attr
                }
            } else {
                // Empty links do not add _blank and are replaced with JavaScript: void
                tokens[idx].attrs[hrefIndex][1] = 'javascript:void(0)';
            }
        }

        // pass token to default renderer.
        return defLinkOpen(tokens, idx, options, env, self);
    };
};

// module.exports = md => {
//   md.use(
//     mditr(
//       /\[\!(\.\w+\s+)?(.+?)]\((.*?)\)/,
//       (match, utils) => {
//         let cls = match[1] ? match[1].slice(1).trim() : ''
//         if (cls) {
//           cls = cls.split('.').join(' ')
//         }
//         let content = match[2]
//         content = md.render(content)

//         return `<a class="button ${cls}" href="${
//           match[3] && match[3] !== '' ? match[3] : 'javascript:void(0)'
//         }">${content}</a>`
//       },
//       'button_inline'
//     )
//   )
// }