const util = require('util')
const path = require('path')
const { readdir, readFile, existsSync } = require('fs')
const { Firestore } = require('@google-cloud/firestore');
const ASSETS_DIR = '../assets'
const PROJECTS_DIR = '../projects'

const firestore = new Firestore({ projectId: 'umee-wallet' });

async function extractAssets(TARGET_DIR) {
  const dirExists = await util.promisify(existsSync)(TARGET_DIR)
  if(!dirExists){
    return
  }
  const files = await util.promisify(readdir)(TARGET_DIR);
  if (files.length < 1) {
    console.log(`Did not find any files in ${TARGET_DIR} - exiting.`)
    return
  } else {
    const filesContent = await Promise.all(files.map((file) => {
      return util.promisify(readFile)(path.join(TARGET_DIR, file, 'index.json'), 'utf8');
    }));

    const fileMap = filesContent.map(fileValue => {
      return JSON.parse(fileValue)
    })

    return fileMap
  }

}
async function storeAssets(assets) {
  try {
    firestore.runTransaction(async t => {
      const snapshot = await firestore.collection('assets').get()
      const updateSymbolList = assets.map(asset => asset.symbol)

      const docData = snapshot.docs.map(doc => doc.data());

      const deleteAssetList = docData.reduce((acc, doc) => {
        if (!updateSymbolList.includes(doc.symbol)) {
          acc.push(doc.symbol)
        }
        return acc
      }, [])

      await Promise.all(deleteAssetList.map(delAssetSymbol => {
        firestore.collection('assets')
          .doc(delAssetSymbol)
          .delete()
      }))

      await Promise.all(assets.map(async asset => {
        const key = asset.symbol;
        firestore.collection('assets')
          .doc(key)
          .set(asset)
      }))

      return t
    })

  } catch (e) {
    console.log(`Transaction failure`, e)
  }

}
async function storeProjects(projects) {
  try {
    firestore.runTransaction(async t => {
      const snapshot = await firestore.collection('projects').get()
      const updateSymbolList = projects.map(project => project.name)

      const docData = snapshot.docs.map(doc => doc.data());

      const deleteAssetList = docData.reduce((acc, doc) => {
        if (!updateSymbolList.includes(doc.name)) {
          acc.push(doc.name)
        }
        return acc
      }, [])

      await Promise.all(deleteAssetList.map(delAssetSymbol => {
        firestore.collection('projects')
          .doc(delAssetSymbol)
          .delete()
      }))

      await Promise.all(assets.map(async asset => {
        const key = asset.name;
        firestore.collection('projects')
          .doc(key)
          .set(asset)
      }))

      return t
    })

  } catch (e) {
    console.log(`Transaction failure`, e)
  }
}

extractAssets(ASSETS_DIR).then(assets => storeAssets(assets));
extractAssets(PROJECTS_DIR).then(projects => storeProjects(projects));