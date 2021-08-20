const {ScriptureParaDocument} = require('proskomma-render');

class CanonicalDocument extends ScriptureParaDocument {

    constructor(result, context, config) {
        super(result, context, config);
        addActions(this);
    }

}

const addActions = (dInstance) => {

    const selectedSequence = (renderer, context) =>
        (!renderer.config.sequenceId && context.sequenceStack[0].type === 'main') ||
        context.sequenceStack[0].id === renderer.config.sequenceId;

    dInstance.addAction(
        'startDocument',
        context => true,
        (renderer, context) => {
            renderer.config.aghast = {type: 'sequence', children: []};
            renderer.config.openSpans = new Set([]);
        }
    );
    dInstance.addAction(
        'endDocument',
        context => true,
        (renderer, context) => {
            renderer.config.aghast.children = renderer.config.aghast.children.filter(n => n.type !== 'tokens' || n.children.length > 0);
        }
    );
    dInstance.addAction(
        'blockGraft',
        context => true,
        (renderer, context, data) => {
            if (selectedSequence(renderer, context)) {
                renderer.config.aghast.children.push({
                    type: 'blockGraft',
                    subType: data.subType,
                    seqId: data.payload,
                    children: [{text: `>> ${data.subType[0].toUpperCase()}${data.subType.substring(1)}`}]
                });
            }
            renderer.renderSequenceId(data.payload);
        }
    );
    dInstance.addAction(
        'startItems',
        context => true,
        (renderer, context) => {
            if (selectedSequence(renderer, context)) {
                renderer.config.aghast.children.push({
                    type: 'block',
                    scope: context.sequenceStack[0].block.blockScope,
                    children: [],
                });
            }
        }
    );
    dInstance.addAction(
        'scope',
        (context, data) => data.subType === 'start' && ['chapter', 'verses'].includes(data.payload.split('/')[0]),
        (renderer, context, data) => {
            if (selectedSequence(renderer, context)) {
                const lastBlock = renderer.config.aghast.children[renderer.config.aghast.children.length - 1];
                const markElement = {
                    type: 'mark',
                    scope: data.payload,
                    children: [{text: `${data.payload.split('/')[0][0]} ${data.payload.split('/')[1]}`}]
                };
                lastBlock.children.push(markElement);
            }
        }
    );
    dInstance.addAction(
        'scope',
        (context, data) => data.payload.startsWith('span/') && ['nd', 'add'].includes(data.payload.split('/')[1]),
        (renderer, context, data) => {
            if (selectedSequence(renderer, context)) {
                if (data.subType === 'start') {
                    renderer.config.openSpans.add(data.payload.split('/')[1]);
                } else {
                    renderer.config.openSpans.delete(data.payload.split('/')[1]);
                }
            }
        }
    );
    dInstance.addAction(
        'inlineGraft',
        context => true,
        (renderer, context, data) => {
            if (selectedSequence(renderer, context)) {
                const lastBlock = renderer.config.aghast.children[renderer.config.aghast.children.length - 1];
                const inlineElement = {
                    type: 'inlineGraft',
                    subType: data.subType,
                    seqId: data.payload,
                    children: [{text: `>> ${data.subType[0].toUpperCase()}${data.subType.substring(1)}`}]
                };
                lastBlock.children.push(inlineElement);
            }
            renderer.renderSequenceId(data.payload);
        }
    );
    dInstance.addAction(
        'token',
        context => true,
        (renderer, context, data) => {
            if (selectedSequence(renderer, context)) {
                const eqSet = (as, bs) => {
                    if (as.size !== bs.size) {
                        return false;
                    }
                    for (const a of as) {
                        if (!bs.has(a)) {
                            return false;
                        }
                    }
                    return true;
                }
                const payload = ['lineSpace', 'eol'].includes(data.subType) ? ' ' : data.payload;
                const lastBlock = renderer.config.aghast.children[renderer.config.aghast.children.length - 1];
                const lastBlockNode = lastBlock.children[lastBlock.children.length - 1];
                const lastSpans = new Set(
                    Object.keys(lastBlockNode || [])
                    .filter(k => !['text', 'children', 'type', 'scope'].includes(k))
                );
                if (
                    lastBlockNode &&
                    'text' in lastBlockNode &&
                    !('type' in lastBlockNode)
                    && eqSet(renderer.config.openSpans, lastSpans)
                ) {
                    lastBlockNode.text += payload;
                } else {
                    const newTextNode = {text: payload};
                    for (const span of Array.from(renderer.config.openSpans)) {
                        newTextNode[span] = true;
                    }
                    lastBlock.children.push(newTextNode);
                }
            }
        }
    );
};

module.exports = CanonicalDocument;
