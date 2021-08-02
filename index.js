const {ScriptureParaModel, ScriptureDocSet} = require("proskomma-render");
const CanonicalDocument = require("./CanonicalDocument");

const aghastModel = (result, config) => {
    const model = new ScriptureParaModel(result, config);
    const docSetHandler = new ScriptureDocSet(result, model.context, config);
    docSetHandler.addDocumentModel('default', new CanonicalDocument(result, model.context, config));
    model.addDocSetModel('default', docSetHandler);
    return model;
}

module.exports = aghastModel;
