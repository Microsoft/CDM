import * as cdm from "./cdm-types"
import { readFileSync, writeFileSync, readFile, mkdirSync, existsSync, readdirSync, statSync } from "fs";


export function consoleStatusReport(level: cdm.cdmStatusLevel, msg : string, path : string) {
    if (level == cdm.cdmStatusLevel.error)
        console.error(`Err: ${msg} @ ${path}`) ;
    else if (level == cdm.cdmStatusLevel.warning)
        console.warn(`Wrn: ${msg} @ ${path}`);
    else if (level == cdm.cdmStatusLevel.progress)
        console.log(msg);
}

export function resolveLocalCorpus(cdmCorpus : cdm.Corpus, finishStep : cdm.cdmValidationStep) : Promise<boolean> {
    return new Promise<boolean>((localCorpusResolve, localCorpusReject) => {
        console.log('resolving imports');
        // first resolve all of the imports to pull other docs into the namespace
        cdmCorpus.resolveImports((uri : string) : Promise<[string, string]> =>{
            return new Promise<[string, string]>((resolve, reject) => {
                // resolve imports take a callback that askes for promise to do URI resolution.
                // so here we are, working on that promise
                readFile(cdmCorpus.rootPath + uri, "utf8", (err : NodeJS.ErrnoException, data:string)=>{
                    if(err)
                        reject([uri, err]);
                    else
                        resolve([uri, data]);
                })
            });
        }).then((r:boolean) => {
            // success resolving all imports
            console.log(r);
            let startTime = Date.now();
            console.log('validate schema:');
            if (r) {
                let validateStep = (currentStep:cdm.cdmValidationStep)=> {
                    return cdmCorpus.resolveReferencesAndValidate(currentStep, finishStep, undefined).then((nextStep:cdm.cdmValidationStep) => {
                        if (nextStep == cdm.cdmValidationStep.error) {
                            console.log('validation step failed');
                        }
                        else if (nextStep == cdm.cdmValidationStep.finished) {
                            console.log('validation finished');
                            console.log(Date.now() - startTime);
                            localCorpusResolve(true);
                        }
                        else {
                            // success resolving all imports
                            return validateStep(nextStep);
                        }
                    }).catch((reason)=> {
                        console.log('exception during validation');
                        console.log(reason);
                        localCorpusReject(reason);
                    });
                }
                return validateStep(cdm.cdmValidationStep.start);
            }
        });
    });
}

// "analyticalCommon"
// "applicationCommon"

export function loadCorpusFolder(corpus : cdm.Corpus, folder : cdm.ICdmFolderDef, ignoreFolders : string[], version : string) {
    let path = corpus.rootPath + folder.getRelativePath();
    if (ignoreFolders && ignoreFolders.find(ig => ig == folder.getName()))
        return;
    let endMatch = (version ? "." + version : "" )+ ".cdm.json";
    // for every document or directory
    readdirSync(path).forEach(dirEntry => {
        let entryName = path + dirEntry;
        let stats = statSync(entryName);
        if (stats.isDirectory()) {
            this.loadCorpusFolder(corpus, folder.addFolder(dirEntry), ignoreFolders, version);
        }
        else {
            let postfix = dirEntry.slice(dirEntry.indexOf("."));
            if (postfix == endMatch) {
                let sourceBuff = readFileSync(entryName);
                if (sourceBuff.length > 3) {
                    let bom1 = sourceBuff.readInt8(0);
                    let bom2 = sourceBuff.readInt8(1);
                    let bom3 = sourceBuff.readInt8(2);
                    if (bom1 == -17 && bom2 == -69 && bom3 == -65) {
                        // this is ff fe encode in utf8 and is the bom that json parser hates.
                        sourceBuff.writeInt8(32, 0);
                        sourceBuff.writeInt8(32, 1);
                        sourceBuff.writeInt8(32, 2);
                    }
                }
                let sourceDoc = sourceBuff.toString();
                corpus.addDocumentFromContent(folder.getRelativePath() +  dirEntry, sourceDoc);
            }
        }
    });
}


export function persistCorpus(cdmCorpus : cdm.Corpus, directives: cdm.TraitDirectiveSet, options?: cdm.copyOptions) {
    if (cdmCorpus && cdmCorpus.getSubFolders() && cdmCorpus.getSubFolders().length == 1) 
        persistCorpusFolder(cdmCorpus.rootPath, cdmCorpus.getSubFolders()[0], directives, options);
}

export function persistCorpusFolder(rootPath : string, cdmFolder : cdm.ICdmFolderDef, directives: cdm.TraitDirectiveSet, options?: cdm.copyOptions): void {
    if (cdmFolder) {
        let folderPath = rootPath + cdmFolder.getRelativePath();
        if (!existsSync(folderPath))
            mkdirSync(folderPath);
        if (cdmFolder.getDocuments())
            cdmFolder.getDocuments().forEach(doc => {
                let resOpt: cdm.resolveOptions = {wrtDoc: doc, directives: directives};
                persistDocument(rootPath, resOpt, options);
            });
        if (cdmFolder.getSubFolders()) {
            cdmFolder.getSubFolders().forEach(f => {
                persistCorpusFolder(rootPath, f, directives, options);
            });
        }
    }
}

export function persistDocument(rootPath : string, resOpt : cdm.resolveOptions, options?: cdm.copyOptions) {
    let docPath = rootPath + resOpt.wrtDoc.getFolder().getRelativePath() + resOpt.wrtDoc.getName();
    let data = resOpt.wrtDoc.copyData(resOpt, options);
    let content = JSON.stringify(data, null, 4);
    writeFileSync(docPath, content);
}


