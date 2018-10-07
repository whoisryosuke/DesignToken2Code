const sketch = require('sketch/dom')
const { UI } = require('sketch')
const { prefix, artboardName } = require('./config')
const { escapeRegExp } = require('./utils')
const DesignTokens = require('./core/design-tokens')
const {
  createDialog,
  pasteBoardWrite,
  getTokenLayersByPattern,
  convertLayersToTokenData,
  writeToFile,
  openPanel,
} = require('./sketch-ui/index')

const CONFIG = {
  outputFormat: 'scss',
}

export default function(context) {
  const document = sketch.fromNative(context.document)
  const tokensArtboard = document.getLayersNamed(artboardName)[0]
  const tokenNamePattern = new RegExp(`${escapeRegExp(prefix)}`)

  if (!tokensArtboard.layers.length) {
    UI.message('Not found')
    return
  }

  const tokenLayers = getTokenLayersByPattern(
    tokensArtboard.layers,
    tokenNamePattern
  )

  log(`${sketch.Types.Shape}`)

  const tokenData = new DesignTokens(convertLayersToTokenData(tokenLayers))
  // TODO: UI上でformatを変更できるようにする
  tokenData.setOutputFormat = CONFIG.outputFormat

  const outputData = tokenData.output()
  // const outputFilePath = `/Users/yoshiro/Desktop/color.${CONFIG.outputFormat}`

  // Dialog
  const dialogButtons = [
    {
      text: 'Copy',
      action: () => {
        pasteBoardWrite(
          {
            data: outputData,
            message: 'Copied',
          },
          context
        )
      },
    },
    {
      text: 'Save',
      action: () => {
        // TODO: 保存先を選択できるようにする
        openPanel(filePath => {
          writeToFile(
            `${filePath}/color.${CONFIG.outputFormat}`,
            `${outputData}`
          )
        })
      },
    },
    {
      text: 'Close',
    },
  ]

  createDialog({
    title: 'DesignTokens2Code',
    message: outputData,
    buttons: dialogButtons,
  })
}
