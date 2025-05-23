const {mergeAttrs} = require('../utils');

module.exports = tree => {
    tree.walk(node => {
        if (
            node &&
            node.tag &&
            node.content &&
            node.content.find &&
            node.content.find(child => {
                if (child && child.tag && child.attrs && child.attrs['css-module']) {
                    return true;
                }
                return false;
            })
        ) {
            // Indicates that it is a parent node with child nodes
            // Find three layers of data for processing
            const parentNode = node;

            node.content.forEach(node => {
                if (node.tag && node.attrs && node.attrs['css-module']) {
                    let ca = node.attrs['css-module'].split(/\s+/);
                    let rs = {};
                    let ex = /^([\w\-]+)=('|"){1}(.+)\2/;
                    parentNode.attrs = parentNode.attrs || {};
                    ca = ca.filter(attr => {
                        let m = ex.exec(attr);
                        if (m && m[1]) {
                            parentNode.attrs[m[1]] = m[3];
                            return false;
                        }
                        return true;
                    });
                    parentNode.attrs = mergeAttrs({class: ca.join(' ')}, parentNode.attrs);
                    delete node.attrs['css-module'];
                }
            });
        }

        return node;
    });
};