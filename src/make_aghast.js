const fse = require('fs-extra');
const path = require('path');

const {Proskomma} = require('proskomma');
const aghastModel = require('./index');
const {ScriptureParaModelQuery} = require('proskomma-render');

const defaultBook = "MRK";

const doRender = async (pk, config) => {
    const thenFunction = result => {
        ts = Date.now();
        const document = result.docSets
            .filter(ds => !docSet || ds.id === docSet)[0]
            .documents
                .filter(d => d.headers.filter(h => h.key === 'bookCode')[0].value === ((bookCode && bookCode) || defaultBook))[0];
        const sequenceId = document.sequences.filter(s => s.type === (sequenceType || 'main'))[0].id;
        config.sequenceId = sequenceId;
        const model = aghastModel(result, config);
        model.render({
            actions: {},
            docSet: docSet || "xxx_yyy",
            document: docIds[bookCode || defaultBook]}
        );
        console.log(`DocSet rendered in  ${(Date.now() - ts) / 1000} sec`);
        console.log(model.logString());
        console.log(JSON.stringify(config.aghast, null, 2));
    }
    await ScriptureParaModelQuery(pk)
        .then(thenFunction)
};

if (process.argv.length < 3 || process.argv.length > 6) {
    console.log("USAGE: node make_aghast.js <usfm_path> [ <sequenceType> [ <docSetId> [ <bookCode> ] ] ]");
    process.exit(1);
}
const fqSourceDir = path.resolve(__dirname, process.argv[2]);
const sequenceType = process.argv[3];
const docSet = process.argv[4];
const bookCode = process.argv[5];

let ts = Date.now();
let nBooks = 0;

let docIds = {};
const pk = new Proskomma();
for (const filePath of fse.readdirSync(fqSourceDir)) {
        console.log(`   ${filePath}`);
        nBooks++;
        const content = fse.readFileSync(path.join(fqSourceDir, filePath));
        const contentType = filePath.split('.').pop();
        const doc = pk.importDocument(
            {lang: "xxx", abbr: "yyy"},
            contentType,
            content,
            {}
        );
        docIds[doc.headers.bookCode] = doc.id;
 }
console.log(`${nBooks} book(s) loaded in ${(Date.now() - ts) / 1000} sec`);
ts = Date.now();

const config = {};

doRender(pk, config).then((res) => {
    // console.log(JSON.stringify(config, null, 2));
});
