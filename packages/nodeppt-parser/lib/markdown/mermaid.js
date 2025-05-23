module.exports = md => {
    const temp = md.renderer.rules.fence.bind(md.renderer.rules);
    md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx];
        const code = token.content;
        if (token.info === 'mermaid') {
            token.attrJoin('class', 'lang-mermaid no-style');
            let attrs = token.attrs || [];
            attrs = attrs
                .map(([key, value]) => {
                    return `${key}="${value}"`;
                })
                .join(' ');
            // Add support for mermaidjs, so you can draw flowcharts~
            return `
<div class="embed">
    <pre ${attrs}>${code}</pre>
</div>
`;
        }
        return temp(tokens, idx, options, env, slf);
    };
};