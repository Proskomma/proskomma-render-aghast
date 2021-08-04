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
        'token',
        context => true,
        (renderer, context, data) => {
            if (selectedSequence(renderer, context)) {
                const payload = ['lineSpace', 'eol'].includes(data.subType) ? ' ' : data.payload;
                const lastBlock = renderer.config.aghast.children[renderer.config.aghast.children.length - 1];
                const lastBlockNode = lastBlock.children[lastBlock.children.length - 1];
                if (lastBlockNode && 'text' in lastBlockNode) {
                    lastBlockNode.text += payload;
                } else {
                    lastBlock.children.push({text: payload});
                }
            }
        }
    );
};

module.exports = CanonicalDocument;
