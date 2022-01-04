const {ScriptureParaDocument} = require('proskomma-render');

class CVCanonicalDocument extends ScriptureParaDocument {

    constructor(result, context, config) {
        super(result, context, config);
        addActions(this);
    }

}

const addActions = (dInstance) => {

    dInstance.addAction(
        'startDocument',
        context => true,
        (renderer, context) => {
            renderer.config.aghast = [
                {
                    type: "headers",
                    children:
                        Object.entries(context.document.headers)
                            .map(
                                kv => ({
                                    type: kv[0],
                                    children: [
                                        {text: ""},
                                        {text: kv[1]}
                                    ]
                                })
                            )
                },
                {
                    type: "chapter",
                    children: [
                        {
                            type: "c",
                            children: [
                                {text: "front"}
                            ]
                        },
                        {
                            type: "verse",
                            children: [
                        {
                            type: "para",
                            style: "p",
                            children: [
                                {text: ""}
                            ]
                        },
                                {
                                    type: "v",
                                    children: [
                                        {text: "front"}
                                    ]
                                },
                                {
                                    type: "inlineContainer",
                                    children: [
                                        {text: ""}
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ];
        }
    );

    dInstance.addAction(
        'scope',
        (context, data) => data.subType === 'start' && data.payload.split('/')[0] === 'chapter',
        (renderer, context, data) => {
            renderer.config.aghast.push(
                {
                    type: "chapter",
                    children: [
                        {
                            type: "c",
                            children: [
                                {text: data.payload.split('/')[1]}
                            ]
                        },
                        {
                            type: "verse",
                            children: [
                                {
                                    type: "v",
                                    children: [
                                        {text: "front"}
                                    ]
                                },
                                {
                                    "type": "inlineContainer",
                                    "children": [
                                        {
                                            "text": ""
                                        }
                                    ]
                                },
                            ]
                        }
                    ]
                }
            );
        }
    );

    dInstance.addAction(
        'scope',
        (context, data) => data.subType === 'start' && data.payload.split('/')[0] === 'verse',
        (renderer, context, data) => {
            renderer.config.aghast[renderer.config.aghast.length - 1].children.push(
                {
                    type: "verse",
                    children: [
                        {
                            type: "v",
                            children: [
                                {text: data.payload.split('/')[1]}
                            ]
                        },
                        {
                            "type": "inlineContainer",
                            "children": [
                                {
                                    "text": ""
                                }
                            ]
                        },
                    ]
                }
            );
        }
    );

    dInstance.addAction(
        'token',
        (context, data) => true,
        (renderer, context, data) => {
            const lastChapter = renderer.config.aghast[renderer.config.aghast.length - 1];
            const lastVerse = lastChapter.children[lastChapter.children.length -1];
            lastVerse.children[lastVerse.children.length - 1].children[0].text += data.payload.replace(/\s/g, " ");
        }
    );

    dInstance.addAction(
        'startItems',
        context => true,
        (renderer, context) => {
            const lastChapter = renderer.config.aghast[renderer.config.aghast.length - 1];
            const lastVerse = lastChapter.children[lastChapter.children.length -1];
            lastVerse.children = [
                {
                    type: "para",
                    style: context.sequenceStack[0].block.blockScope.split('/')[1],
                    children: [
                        {text: ""}
                    ]
                },
            ]
                .concat(lastVerse.children);
        }
    );

};

module.exports = CVCanonicalDocument;
