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
} = require('./sketch-ui/index')

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
  const outputData = tokenData.output()

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
        writeToFile('/Users/yoshiro/Desktop/color.css', `${outputData}`)
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
