// node make_aghast.js <usfm_dir> [ <docSetId> [ <bookCode> ] ]

const fse = require('fs-extra');
const path = require('path');

const {Proskomma} = require('proskomma');
const aghastModel = require('./index');
const {ScriptureParaModelQuery} = require('proskomma-render');

const doRender = async (pk, config) => {
    const thenFunction = result => {
        console.log(`Query processed in  ${(Date.now() - ts) / 1000} sec`);
        ts = Date.now();
        const model = aghastModel(result, config);
        model.render({
            actions: {},
            docSet: docSet || "xxx_yyy",
            document: docIds[bookCode || "MRK"]}
        );
        console.log(`DocSet rendered in  ${(Date.now() - ts) / 1000} sec`);
        console.log(model.logString());
        console.log(JSON.stringify(config.aghast, null, 2));
    }
    await ScriptureParaModelQuery(pk)
        .then(thenFunction)
};

const fqSourceDir = path.resolve(__dirname, process.argv[2]);
const docSet = process.argv[3];
const bookCode = process.argv[4];

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
