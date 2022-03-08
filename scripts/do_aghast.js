const path = require('path');
const fse = require('fs-extra');
const {Proskomma} = require("proskomma");
const {ScriptureParaModelQuery} = require("proskomma-render");
const aghastModel = require('../src/index');

const usage = 'node do_aghast <DocumentPath> // USFM/USX deduced from file suffix, avoid dots anywhere else in path';
if (process.argv.length !== 3) {
    console.log("ERROR: expected exactly one argument");
    console;
    log(usage);
    process.exit(1);
}
const pk = new Proskomma();
const pkDoc = pk.importDocument(
    {
        lang: "abc",
        abbr: "xyz",
    },
    process.argv[2].split('.')[1],
    fse.readFileSync(path.resolve(__dirname, process.argv[2])),
    {},
);
const result = ScriptureParaModelQuery(pk).then(
        res => {
            const config = {};
            const model = aghastModel(res, config);
            model.render();
            console.log(JSON.stringify(config.aghast.children, null, 2));
        }
    );
