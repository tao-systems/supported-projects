const util = require('util')
const path = require('path')
const { readdir, readFile } = require('fs')
const { Firestore } = require('@google-cloud/firestore');
const ASSETS_DIR = './assets'

const firestore = new Firestore({ projectId: 'umee-wallet' });

async function extractAssets() {
  const files = await util.promisify(readdir)(ASSETS_DIR);

  const filesContent = await Promise.all(files.map((file) => {
    return util.promisify(readFile)(path.join(ASSETS_DIR, file, 'index.json'), 'utf8');
  }));

  const fileMap = filesContent.map(fileValue => {
    return JSON.parse(fileValue)
  })

  return fileMap
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
        const assetRef = firestore.collection('assets')
          .doc(key)
          .set(asset)
      }))

      return t
    })

  } catch (e) {
    console.log(`Transaction failure`, e)
  }

}


extractAssets().then(assets => storeAssets(assets))